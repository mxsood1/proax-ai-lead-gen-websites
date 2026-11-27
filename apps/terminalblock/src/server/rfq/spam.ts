import { createHash } from "node:crypto";

/** One-way, salted hash so raw IP addresses are never stored. */
export function hashIp(ip: string, salt = process.env.DESK_SECRET ?? "local") {
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 16);
}

const FREE_MAIL = /@(gmail|yahoo|hotmail|outlook|live|icloud|aol|proton(mail)?|gmx|mail|yandex)\./i;
export const isFreeEmail = (email: string) => FREE_MAIL.test(email);

/**
 * Spam signals in free text (a question, notes). Signals don't reject the
 * message; they mark it so the desk can ignore it.
 */
export function spamSignals(text: string) {
  const signals: string[] = [];
  const urls = text.match(/https?:\/\/|www\./gi)?.length ?? 0;
  if (urls >= 2) signals.push(`${urls} links in the message`);
  if (/\b(viagra|casino|crypto|bitcoin|seo services|backlinks|guest post|loan offer|forex|escort)\b/i.test(text)) signals.push("spam keywords");
  if (/(.)\1{9,}/.test(text)) signals.push("repeated characters");
  const letters = text.replace(/[^A-Za-z]/g, "");
  if (letters.length > 40 && /[A-Z]/.test(letters) && letters === letters.toUpperCase()) signals.push("all capitals");
  return signals;
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
