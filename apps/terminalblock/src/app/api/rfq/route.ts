import { after, type NextRequest } from "next/server";
import { site } from "@/config/site";
import { config } from "@/server/config";
import { sendLeadAlert } from "@/server/email/alert";
import type { Lead } from "@/server/leads/types";
import { checkUploads, clientIp, json, sameOrigin } from "@/server/http";
import { makeRef, newId } from "@/server/rfq/ref";
import { submissionSchema } from "@/server/rfq/schema";
import { checkSpam, hashIp, rateLimited } from "@/server/rfq/spam";
import { analyzeLead } from "@/server/sourcing/pipeline";
import { leadStore } from "@/server/storage";

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return json({ ok: false, errors: ["Invalid request origin."] }, 403);

  const ipHash = hashIp(clientIp(req));
  if (rateLimited(`rfq:${ipHash}`)) return json({ ok: false, errors: ["Too many requests. Please try again in a few minutes."] }, 429);

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return json({ ok: false, errors: ["The request couldn't be read."] }, 400);
  }

  let raw: unknown;
  try {
    raw = JSON.parse(String(form.get("payload") ?? ""));
  } catch {
    return json({ ok: false, errors: ["The request couldn't be read."] }, 400);
  }
  const parsed = submissionSchema.safeParse(raw);
  if (!parsed.success) {
    const errors = [...new Set(parsed.error.issues.map((i) => (i.message.startsWith("Invalid") ? `Check ${i.path.join(".")}` : i.message)))];
    return json({ ok: false, errors }, 400);
  }
  const s = parsed.data;

  const uploads = checkUploads(form.getAll("files"));
  if (!uploads.ok) return json({ ok: false, errors: [uploads.error] }, 400);
  if (s.lines.length === 0 && uploads.files.length === 0) return json({ ok: false, errors: ["Add at least one part number or upload a file."] }, 400);

  const spam = checkSpam(s);
  const ref = makeRef(site.rfqPrefix);
  // Bots get a normal-looking success and nothing is stored.
  if (spam.block.length) return json({ ok: true, ref });

  const store = leadStore();
  const id = newId();
  const now = new Date().toISOString();
  const files = [];
  for (const f of uploads.files) {
    files.push(await store.saveFile(id, { name: f.name, type: f.type, bytes: new Uint8Array(await f.arrayBuffer()) }));
  }

  const lead: Lead = {
    id,
    ref,
    site: config.siteId,
    createdAt: now,
    status: "new",
    lines: s.lines.map((l) => ({ part: l.part, manufacturer: l.manufacturer, qty: l.qty, notes: l.notes })),
    files,
    details: s.details,
    contact: {
      name: s.contact.name,
      company: s.contact.company,
      email: s.contact.email,
      phone: s.contact.phone,
      marketingOptIn: s.contact.marketingOptIn,
      consentAt: now,
    },
    meta: {
      ipHash,
      userAgent: (req.headers.get("user-agent") ?? "").slice(0, 200),
      referer: (req.headers.get("referer") ?? "").slice(0, 300),
      spamSignals: spam.signals,
    },
    analysis: null,
    events: [{ at: now, type: "received", note: `${s.lines.length} lines, ${files.length} files` }],
  };
  await store.create(lead);

  // Analysis and the internal alert run after the buyer gets their confirmation.
  after(async () => {
    try {
      const analysis = await analyzeLead(lead);
      const updated = await store.update(lead.id, (l) => ({
        ...l,
        analysis,
        status: analysis.score.tier === "spam" ? "spam" : l.status,
        events: [...l.events, { at: new Date().toISOString(), type: "analyzed", note: `${analysis.by} · score ${analysis.score.score}` }],
      }));
      if (updated && updated.status !== "spam") {
        const sent = await sendLeadAlert(updated);
        await store.update(lead.id, (l) => ({
          ...l,
          events: [...l.events, { at: new Date().toISOString(), type: "alert", note: sent.delivered ? "emailed" : `saved to ${sent.where}` }],
        }));
      }
    } catch (error) {
      console.error(`Post-processing failed for ${lead.ref}:`, error instanceof Error ? error.message : error);
    }
  });

  return json({ ok: true, ref });
}
