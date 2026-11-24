import { createHash, createHmac, timingSafeEqual } from "node:crypto";

/**
 * Minimal signed session token for the internal sourcing desk:
 *   "<expiresAtMs>.<base64url HMAC-SHA256(secret, 'desk:<expiresAtMs>')>"
 * Pure functions (no Next.js imports) so the proxy and server code share them.
 */
export const DESK_COOKIE = "tb_desk";
export const SESSION_MS = 12 * 60 * 60 * 1000;

const mac = (secret: string, exp: number) => createHmac("sha256", secret).update(`desk:${exp}`).digest("base64url");

export function signSession(secret: string, now = Date.now()) {
  const exp = now + SESSION_MS;
  return `${exp}.${mac(secret, exp)}`;
}

export function verifySession(token: string | undefined, secret: string, now = Date.now()) {
  if (!token || !secret) return false;
  const [expStr, sig] = token.split(".");
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp < now || !sig) return false;
  const expected = Buffer.from(mac(secret, exp));
  const given = Buffer.from(sig);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

/** Constant-time password comparison (hash first so lengths always match). */
export function passwordMatches(input: string, password: string) {
  if (!password) return false;
  const a = createHash("sha256").update(input).digest();
  const b = createHash("sha256").update(password).digest();
  return timingSafeEqual(a, b);
}
