import { randomBytes, randomUUID } from "node:crypto";

const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"; // no 0/O/1/I confusion

/** Human-friendly reference like RFQ-TB-261113-7KQ4 */
export function makeRef(prefix: string, date = new Date()) {
  const ymd = date.toISOString().slice(2, 10).replace(/-/g, "");
  const bytes = randomBytes(4);
  const tail = Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
  return `RFQ-${prefix}-${ymd}-${tail}`;
}

export const newId = () => randomUUID();

/** Safe file names for storage: keep the extension, drop anything odd. */
export function safeFileName(name: string) {
  const base = name.normalize("NFKD").replace(/[^\w.\- ]+/g, "").replace(/\s+/g, "_").slice(-80);
  return base.replace(/^\.+/, "") || "file";
}
