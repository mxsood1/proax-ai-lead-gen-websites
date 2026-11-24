import { NextResponse, type NextRequest } from "next/server";
import { DESK_COOKIE, verifySession } from "@/server/auth/token";

/**
 * Guards the internal sourcing desk. Everything under /desk and /api/desk
 * requires a valid signed session cookie, except the login page itself.
 * Pages and actions re-check the session too.
 */
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const res = NextResponse.next();
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  res.headers.set("Cache-Control", "no-store");
  if (pathname === "/desk/login") return res;

  const ok = verifySession(req.cookies.get(DESK_COOKIE)?.value, (process.env.DESK_SECRET ?? "").trim());
  if (ok) return res;

  if (pathname.startsWith("/api/")) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const login = new URL("/desk/login", req.url);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/desk/:path*", "/api/desk/:path*"],
};
