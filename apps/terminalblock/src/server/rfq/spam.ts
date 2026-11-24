import { createHash } from "node:crypto";
import type { Submission } from "./schema";

/** One-way, salted hash so raw IP addresses are never stored. */
export function hashIp(ip: string, salt = process.env.DESK_SECRET ?? "local") {
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 16);
}

const FREE_MAIL = /@(gmail|yahoo|hotmail|outlook|live|icloud|aol|proton(mail)?|gmx|mail|yandex)\./i;
export const isFreeEmail = (email: string) => FREE_MAIL.test(email);

/**
 * Returns hard-block reasons (request rejected) and soft signals (lead kept,
 * marked for review). Timing is measured from when the form was opened.
 */
export function checkSpam(s: Submission, now = Date.now()) {
  const block: string[] = [];
  const signals: string[] = [];

  if (s.website) block.push("honeypot");
  if (s.startedAt > 0 && now - s.startedAt < 3000) block.push("submitted too fast");

  const allText = [s.details.notes, ...s.lines.map((l) => `${l.part} ${l.notes}`)].join(" ");
  const urls = allText.match(/https?:\/\//gi)?.length ?? 0;
  if (urls >= 3) signals.push(`${urls} links in the message`);
  if (/\b(viagra|casino|crypto|seo services|backlinks|loan offer)\b/i.test(allText)) signals.push("spam keywords");
  if (s.lines.length === 0 && s.details.notes.length < 10) signals.push("no parts and almost no notes");

  return { block, signals };
}

/** Small in-memory rate limiter (per server instance). */
const hits = new Map<string, number[]>();
export function rateLimited(key: string, limit = 5, windowMs = 10 * 60 * 1000, now = Date.now()) {
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > limit;
}
