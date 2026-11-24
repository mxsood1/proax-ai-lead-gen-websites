import "server-only";
import { NextResponse, type NextRequest } from "next/server";
import { config } from "@/server/config";

/** Reject cross-site form posts (browsers always send Origin on POST). */
export function sameOrigin(req: NextRequest) {
  const origin = req.headers.get("origin");
  if (!origin) return true; // non-browser clients; rate limiting still applies
  try {
    return new URL(origin).host === req.headers.get("host");
  } catch {
    return false;
  }
}

export function clientIp(req: NextRequest) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "local";
}

export const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

export type UploadCheck = { ok: true; files: File[] } | { ok: false; error: string };

export function checkUploads(entries: FormDataEntryValue[], allowed: readonly string[] = config.uploads.extensions): UploadCheck {
  const files = entries.filter((e): e is File => typeof e === "object" && "arrayBuffer" in e && e.size > 0);
  if (files.length > config.uploads.maxFiles) return { ok: false, error: `Attach up to ${config.uploads.maxFiles} files.` };
  let total = 0;
  for (const f of files) {
    const ext = f.name.toLowerCase().match(/\.[a-z0-9]+$/)?.[0] ?? "";
    if (!allowed.includes(ext)) return { ok: false, error: `${f.name}: this file type isn't accepted.` };
    if (f.size > config.uploads.maxFileBytes) return { ok: false, error: `${f.name} is larger than 10 MB.` };
    total += f.size;
  }
  if (total > config.uploads.maxTotalBytes) return { ok: false, error: "Attachments are larger than 25 MB in total." };
  return { ok: true, files };
}
