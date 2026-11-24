import type { NextRequest } from "next/server";
import { getCatalog } from "@/data/catalog";
import { equivalentsFor, findMatch } from "@/lib/catalog-match";
import { AiUnavailableError } from "@/server/ai/claude";
import { identifyPhoto, type ImageType } from "@/server/ai/identify";
import { config } from "@/server/config";
import { clientIp, json, sameOrigin } from "@/server/http";
import { hashIp, rateLimited } from "@/server/rfq/spam";

const TYPES: Record<string, ImageType> = { "image/jpeg": "image/jpeg", "image/png": "image/png", "image/webp": "image/webp", "image/gif": "image/gif" };

/** Photo identification. Photos are analysed in memory and never stored. */
export async function POST(req: NextRequest) {
  if (!config.ai.enabled) return json({ ok: false, aiEnabled: false, error: "Photo identification isn't switched on yet." }, 503);
  if (!sameOrigin(req)) return json({ ok: false, error: "Invalid request origin." }, 403);
  if (rateLimited(`identify:${hashIp(clientIp(req))}`, 10)) return json({ ok: false, error: "Too many photos. Try again in a few minutes." }, 429);

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return json({ ok: false, error: "The upload couldn't be read." }, 400);
  }
  const file = form.get("photo");
  if (!(file instanceof File) || file.size === 0) return json({ ok: false, error: "No photo received." }, 400);
  const type = TYPES[file.type];
  if (!type) return json({ ok: false, error: "Use a JPG, PNG or WebP photo. HEIC photos need converting first." }, 400);
  if (file.size > 5 * 1024 * 1024) return json({ ok: false, error: "Photos must be under 5 MB." }, 400);

  try {
    const id = await identifyPhoto(new Uint8Array(await file.arrayBuffer()), type);
    const products = getCatalog().items;
    const query = id.partNumber ?? id.series ?? "";
    const found = query ? findMatch(products, query) : null;
    const proto = found?.match ?? {
      id: "",
      manufacturer: id.manufacturer ?? "",
      fn: id.function === "unknown" ? "feed-through" : id.function,
      connection: id.connection === "unknown" ? null : id.connection,
      wireMax: id.sizeEstimate ? Number.parseFloat(id.sizeEstimate.replace(",", ".")) || null : null,
    };
    return json({ ok: true, identification: id, match: found?.match ?? null, exact: found?.exact ?? false, equivalents: id.isTerminalBlock ? equivalentsFor(products, proto) : [] });
  } catch (error) {
    if (error instanceof AiUnavailableError) return json({ ok: false, error: error.message }, 503);
    return json({ ok: false, error: "Identification failed. Try another photo." }, 500);
  }
}
