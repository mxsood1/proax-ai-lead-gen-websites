import { after, type NextRequest } from "next/server";
import { sendLeadAlert } from "@/server/email/alert";
import { buildQuestionLead, questionSchema } from "@/server/leads/capture";
import { clientIp, json, sameOrigin } from "@/server/http";
import { hashIp, rateLimited, spamSignals } from "@/server/rfq/spam";
import { leadStore } from "@/server/storage";

/**
 * "Ask us your question". Saves the question for a person to answer. No AI is
 * used, so a busy day or a spam wave costs nothing.
 */
export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return json({ ok: false, errors: ["Invalid request origin."] }, 403);
  if (rateLimited(`question:${hashIp(clientIp(req))}`, 5)) return json({ ok: false, errors: ["Too many questions in a short time. Please try again in a few minutes."] }, 429);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json({ ok: false, errors: ["The request couldn't be read."] }, 400);
  }
  const parsed = questionSchema.safeParse(body);
  if (!parsed.success) return json({ ok: false, errors: [...new Set(parsed.error.issues.map((i) => i.message))] }, 400);
  const q = parsed.data;

  // Bots: honeypot filled, or sent within 3 seconds of opening. Looks like success, stores nothing.
  if (q.website || (q.startedAt > 0 && Date.now() - q.startedAt < 3000)) return json({ ok: true });

  const signals = spamSignals(`${q.question} ${q.name} ${q.company}`);
  const lead = buildQuestionLead(req, q, signals);
  const store = leadStore();
  await store.create(lead);

  // Alert the team about real questions only (outbox file until email is switched on)
  if (!signals.length) {
    after(async () => {
      try {
        const alert = await sendLeadAlert(lead);
        await store.update(lead.id, (l) => ({ ...l, events: [...l.events, { at: new Date().toISOString(), type: "alert", note: alert.delivered ? "emailed" : `saved to ${alert.where}` }] }));
      } catch (error) {
        console.error(`Question alert failed for ${lead.ref}:`, error instanceof Error ? error.message : error);
      }
    });
  }

  return json({ ok: true });
}
