import type { NextRequest } from "next/server";
import { GUIDE, readGuide, verifyDownloadToken } from "@/server/downloads";

/** Serves the guide PDF only with a valid, unexpired signed link from the email form. */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("t") ?? "";
  if (!verifyDownloadToken(token, GUIDE.id)) {
    return new Response("This download link has expired. Request the guide again on the guides page.", {
      status: 403,
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store", "X-Robots-Tag": "noindex" },
    });
  }
  const pdf = await readGuide();
  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${GUIDE.downloadName}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      "X-Robots-Tag": "noindex",
    },
  });
}
