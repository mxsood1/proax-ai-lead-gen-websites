import { after, type NextRequest } from "next/server";
import { GUIDE, downloadToken } from "@/server/downloads";
import { renderGuideEmail, sendBuyerEmail } from "@/server/email/buyer";
import { sendLeadAlert } from "@/server/email/alert";
import { buildCaptureLead, captureSchema, isBot } from "@/server/leads/capture";
import { clientIp, json, sameOrigin } from "@/server/http";
import { hashIp, rateLimited } from "@/server/rfq/spam";
import { leadStore } from "@/server/storage";

const DAY = 24 * 60 * 60 * 1000;

/** Guide download in exchange for an email. Returns a short-lived download link; emails a 7-day link too. */
export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return json({ ok: false, errors: ["Invalid request origin."] }, 403);
  if (rateLimited(`guide:${hashIp(clientIp(req))}`, 5)) return json({ ok: false, errors: ["Too many requests. Please try again in a few minutes."] }, 429);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json({ ok: false, errors: ["The request couldn't be read."] }, 400);
  }
  const parsed = captureSchema.safeParse(body);
  if (!parsed.success) return json({ ok: false, errors: [...new Set(parsed.error.issues.map((i) => i.message))] }, 400);
  const c = parsed.data;

  const url = `/api/guide/file?t=${encodeURIComponent(downloadToken(GUIDE.id, 60 * 60 * 1000))}`;
  if (isBot(c)) return json({ ok: true, url: "/guides" }); // looks like success, stores nothing

  const lead = buildCaptureLead(req, "guide", c, [], `Downloaded the ${GUIDE.title}`);
  const store = leadStore();
  await store.create(lead);

  after(async () => {
    const base = (process.env.SITE_URL ?? new URL(req.url).origin).replace(/\/$/, "");
    const emailLink = `${base}/api/guide/file?t=${encodeURIComponent(downloadToken(GUIDE.id, 7 * DAY))}`;
    const events: { at: string; type: string; note: string }[] = [];
    try {
      const sent = await sendBuyerEmail(lead, renderGuideEmail(lead, GUIDE.title, emailLink));
      events.push({ at: new Date().toISOString(), type: "buyer-email", note: sent.delivered ? "guide link emailed" : `saved to ${sent.where}` });
      const alert = await sendLeadAlert(lead);
      events.push({ at: new Date().toISOString(), type: "alert", note: alert.delivered ? "emailed" : `saved to ${alert.where}` });
    } catch (error) {
      console.error(`Guide follow-up failed for ${lead.ref}:`, error instanceof Error ? error.message : error);
    }
    if (events.length) await store.update(lead.id, (l) => ({ ...l, events: [...l.events, ...events] }));
  });

  return json({ ok: true, url });
}
