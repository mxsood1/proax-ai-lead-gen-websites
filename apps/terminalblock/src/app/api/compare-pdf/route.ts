import { after, type NextRequest } from "next/server";
import { pairSlug, parsePair } from "@/data/brands";
import { comparisonId, downloadToken } from "@/server/downloads";
import { renderComparisonEmail, sendBuyerEmail } from "@/server/email/buyer";
import { sendLeadAlert } from "@/server/email/alert";
import { buildCaptureLead, comparisonSchema, isBot } from "@/server/leads/capture";
import { clientIp, json, sameOrigin } from "@/server/http";
import { hashIp, rateLimited } from "@/server/rfq/spam";
import { leadStore } from "@/server/storage";

const DAY = 24 * 60 * 60 * 1000;

/**
 * "Email me this comparison (PDF)". Saves the lead, returns a short-lived
 * download link and emails a 7-day link. The PDF itself is built from a
 * fixed template (no AI).
 */
export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return json({ ok: false, errors: ["Invalid request origin."] }, 403);
  if (rateLimited(`compare-pdf:${hashIp(clientIp(req))}`, 8)) return json({ ok: false, errors: ["Too many requests. Please try again in a few minutes."] }, 429);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json({ ok: false, errors: ["The request couldn't be read."] }, 400);
  }
  const parsed = comparisonSchema.safeParse(body);
  if (!parsed.success) return json({ ok: false, errors: [...new Set(parsed.error.issues.map((i) => i.message))] }, 400);
  const c = parsed.data;
  const brands = parsePair(c.pair);
  if (!brands) return json({ ok: false, errors: ["Unknown comparison."] }, 400);
  const [a, b] = brands;
  const pair = pairSlug(a.slug, b.slug);
  const title = `${a.name} vs ${b.name} terminal blocks`;

  const url = `/api/compare-pdf/file?t=${encodeURIComponent(downloadToken(comparisonId(pair), 60 * 60 * 1000))}`;
  if (isBot(c)) return json({ ok: true, url: `/compare/${pair}` }); // looks like success, stores nothing

  const lead = buildCaptureLead(req, "comparison", c, [], `${a.name} vs ${b.name}`);
  const store = leadStore();
  await store.create(lead);

  after(async () => {
    const base = (process.env.SITE_URL ?? new URL(req.url).origin).replace(/\/$/, "");
    const emailLink = `${base}/api/compare-pdf/file?t=${encodeURIComponent(downloadToken(comparisonId(pair), 7 * DAY))}`;
    const events: { at: string; type: string; note: string }[] = [];
    try {
      const sent = await sendBuyerEmail(lead, renderComparisonEmail(lead, title, emailLink, `${base}/compare/${pair}`));
      events.push({ at: new Date().toISOString(), type: "buyer-email", note: sent.delivered ? "comparison PDF link emailed" : `saved to ${sent.where}` });
      const alert = await sendLeadAlert(lead);
      events.push({ at: new Date().toISOString(), type: "alert", note: alert.delivered ? "emailed" : `saved to ${alert.where}` });
    } catch (error) {
      console.error(`Comparison follow-up failed for ${lead.ref}:`, error instanceof Error ? error.message : error);
    }
    if (events.length) await store.update(lead.id, (l) => ({ ...l, events: [...l.events, ...events] }));
  });

  return json({ ok: true, url });
}
