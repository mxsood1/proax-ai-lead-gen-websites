import type { NextRequest } from "next/server";
import { pairSlug, parsePair } from "@/data/brands";
import { comparisonId, verifyDownloadToken } from "@/server/downloads";
import { comparisonFileName, renderComparisonPdf } from "@/server/compare-pdf";

const expired = () =>
  new Response("This download link has expired. Request the comparison again on its page.", {
    status: 403,
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store", "X-Robots-Tag": "noindex" },
  });

/** Builds and serves the comparison PDF, only with a valid, unexpired signed link from the email form. */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("t") ?? "";
  const id = token.split(".")[0] ?? "";
  const pair = id.startsWith("cmp-") ? id.slice(4) : "";
  const brands = parsePair(pair);
  if (!brands || id !== comparisonId(pair) || !verifyDownloadToken(token, id)) return expired();
  const [a, b] = brands;
  if (pair !== pairSlug(a.slug, b.slug)) return expired();

  const pdf = await renderComparisonPdf(a, b);
  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${comparisonFileName(a, b)}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      "X-Robots-Tag": "noindex",
    },
  });
}
