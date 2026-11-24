import { after, type NextRequest } from "next/server";
import { z } from "zod";
import { getCatalog } from "@/data/catalog";
import { rfqHref } from "@/data/products";
import { renderListEmail, sendBuyerEmail } from "@/server/email/buyer";
import { sendLeadAlert } from "@/server/email/alert";
import { buildCaptureLead, captureSchema, isBot } from "@/server/leads/capture";
import { clientIp, json, sameOrigin } from "@/server/http";
import { hashIp, rateLimited } from "@/server/rfq/spam";
import { leadStore } from "@/server/storage";

const listSchema = captureSchema.extend({ items: z.array(z.string().regex(/^[a-z0-9-]{3,64}$/)).min(1, "Add at least one part to your list.").max(100) });

/** "Email me this list": saves the Finder selection as a lead and emails the list to the visitor. */
export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return json({ ok: false, errors: ["Invalid request origin."] }, 403);
  if (rateLimited(`list:${hashIp(clientIp(req))}`, 5)) return json({ ok: false, errors: ["Too many requests. Please try again in a few minutes."] }, 429);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json({ ok: false, errors: ["The request couldn't be read."] }, 400);
  }
  const parsed = listSchema.safeParse(body);
  if (!parsed.success) return json({ ok: false, errors: [...new Set(parsed.error.issues.map((i) => i.message))] }, 400);
  const { items, ...c } = parsed.data;
  if (isBot(c)) return json({ ok: true });

  const byId = new Map(getCatalog().items.map((p) => [p.id, p]));
  const products = [...new Set(items)].map((id) => byId.get(id)).filter((p) => p !== undefined);
  if (!products.length) return json({ ok: false, errors: ["Those parts couldn't be found. Refresh the page and try again."] }, 400);

  const lines = products.map((p) => ({ part: p.partNumber, manufacturer: p.manufacturer, qty: null, notes: p.description.slice(0, 200) }));
  const lead = buildCaptureLead(req, "list", c, lines, `Emailed a list of ${lines.length} part${lines.length === 1 ? "" : "s"} from the Finder`);
  const store = leadStore();
  await store.create(lead);

  after(async () => {
    const base = (process.env.SITE_URL ?? new URL(req.url).origin).replace(/\/$/, "");
    const events: { at: string; type: string; note: string }[] = [];
    try {
      const sent = await sendBuyerEmail(lead, renderListEmail(lead, `${base}${rfqHref(products.slice(0, 30))}`));
      events.push({ at: new Date().toISOString(), type: "buyer-email", note: sent.delivered ? "list emailed" : `saved to ${sent.where}` });
      const alert = await sendLeadAlert(lead);
      events.push({ at: new Date().toISOString(), type: "alert", note: alert.delivered ? "emailed" : `saved to ${alert.where}` });
    } catch (error) {
      console.error(`List follow-up failed for ${lead.ref}:`, error instanceof Error ? error.message : error);
    }
    if (events.length) await store.update(lead.id, (l) => ({ ...l, events: [...l.events, ...events] }));
  });

  return json({ ok: true, ref: lead.ref });
}
