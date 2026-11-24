import { revalidateTag } from "next/cache";
import { config } from "@/server/config";
import { cronAuthorized } from "@/server/auth/cron";
import { runContentJob } from "@/server/content/schedule";
import { GUIDES_TAG } from "@/server/content/published";

/**
 * Weekly article job, called by the host's scheduler (vercel.json "crons").
 * Writes one draft for review; never publishes. Needs CRON_SECRET, which the
 * scheduler sends as `Authorization: Bearer <secret>`.
 */
export const maxDuration = 300;

export async function GET(request: Request) {
  if (!config.content.cronSecret) return Response.json({ error: "Scheduled drafting is not configured (CRON_SECRET is not set)." }, { status: 503 });
  if (!cronAuthorized(request.headers.get("authorization"), config.content.cronSecret)) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const result = await runContentJob({ trigger: "schedule" });
    if (result.status === "created") revalidateTag(GUIDES_TAG, "max");
    return Response.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ status: "failed", reason: "The article job failed. Check the server logs." }, { status: 500 });
  }
}
