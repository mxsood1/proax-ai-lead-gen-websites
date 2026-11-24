import { createHash, timingSafeEqual } from "node:crypto";

/**
 * Checks the scheduler's `Authorization: Bearer <CRON_SECRET>` header.
 * Hashing both sides first gives equal-length buffers, so the comparison is
 * constant-time whatever the input length. No secret configured → never valid.
 */
export function cronAuthorized(header: string | null, secret: string) {
  if (!secret || secret.length < 16 || !header?.startsWith("Bearer ")) return false;
  const a = createHash("sha256").update(header.slice(7)).digest();
  const b = createHash("sha256").update(secret).digest();
  return timingSafeEqual(a, b);
}
