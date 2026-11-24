import type { NextRequest } from "next/server";
import { BomError, parseBom } from "@/server/bom/parse";
import { checkUploads, clientIp, json, sameOrigin } from "@/server/http";
import { hashIp, rateLimited } from "@/server/rfq/spam";

/** Reads an uploaded Excel/CSV bill of materials and returns RFQ lines. Nothing is stored. */
export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return json({ ok: false, error: "Invalid request origin." }, 403);
  if (rateLimited(`bom:${hashIp(clientIp(req))}`, 30)) return json({ ok: false, error: "Too many files. Try again shortly." }, 429);

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return json({ ok: false, error: "The upload couldn't be read." }, 400);
  }
  const check = checkUploads(form.getAll("file").slice(0, 1), [".xlsx", ".xls", ".csv", ".tsv", ".txt"]);
  if (!check.ok) return json({ ok: false, error: check.error }, 400);
  const file = check.files[0];
  if (!file) return json({ ok: false, error: "No file received." }, 400);

  try {
    const result = await parseBom(file.name, new Uint8Array(await file.arrayBuffer()));
    return json({ ok: true, ...result });
  } catch (error) {
    if (error instanceof BomError) return json({ ok: false, error: error.message }, 422);
    return json({ ok: false, error: "The file couldn't be read." }, 422);
  }
}
