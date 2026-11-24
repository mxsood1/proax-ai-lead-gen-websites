import type { NextRequest } from "next/server";
import { config } from "@/server/config";
import { verifySession, DESK_COOKIE } from "@/server/auth/token";
import { leadStore } from "@/server/storage";

/** Authenticated download of an RFQ attachment. Always served as a download, never rendered inline. */
export async function GET(req: NextRequest, ctx: RouteContext<"/api/desk/files/[leadId]/[fileId]">) {
  if (!config.desk.enabled || !verifySession(req.cookies.get(DESK_COOKIE)?.value, config.desk.secret)) {
    return new Response("Not signed in", { status: 401 });
  }
  const { leadId, fileId } = await ctx.params;
  const store = leadStore();
  const lead = await store.get(leadId);
  const file = lead?.files.find((f) => f.id === fileId);
  if (!file) return new Response("Not found", { status: 404 });
  const bytes = await store.readFile(file);
  if (!bytes) return new Response("Not found", { status: 404 });

  const ascii = file.name.replace(/[^\x20-\x7e]/g, "_").replace(/"/g, "");
  return new Response(new Blob([bytes as BlobPart]), {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(file.name)}`,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "no-store",
    },
  });
}
