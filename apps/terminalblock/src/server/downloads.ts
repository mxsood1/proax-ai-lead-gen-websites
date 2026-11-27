import "server-only";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { config } from "@/server/config";

/**
 * Gated downloads. The guide lives outside /public, so the only way to get it is a short-lived signed
 * link handed out after the email form. Links expire; nothing about the person is in the link.
 */
export const GUIDE = {
  id: "bom-checklist",
  title: "Terminal block selection & BOM checklist",
  file: path.join(/* turbopackIgnore: true */ process.cwd(), "content", "downloads", "terminal-block-bom-checklist.pdf"),
  downloadName: "terminal-block-selection-bom-checklist.pdf",
  pages: 2,
} as const;

// Fallback secret only lasts for this server process (links then stop working after a restart).
const processSecret = randomBytes(32).toString("hex");
const secret = () => process.env.DOWNLOAD_SECRET || config.desk.secret || processSecret;

const sign = (payload: string) => createHmac("sha256", secret()).update(payload).digest("base64url");

export function downloadToken(guideId: string, ttlMs: number) {
  const payload = `${guideId}.${Date.now() + ttlMs}`;
  return `${payload}.${sign(payload)}`;
}

export function verifyDownloadToken(token: string, guideId: string, now = Date.now()) {
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [id, exp, sig] = parts;
  if (id !== guideId || !/^\d+$/.test(exp) || Number(exp) < now) return false;
  const expected = Buffer.from(sign(`${id}.${exp}`));
  const given = Buffer.from(sig);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

export const readGuide = () => readFile(GUIDE.file);

/** Download id for a brand comparison: the PDF is built from the brand data when the link is opened */
export const comparisonId = (pair: string) => `cmp-${pair}`;
