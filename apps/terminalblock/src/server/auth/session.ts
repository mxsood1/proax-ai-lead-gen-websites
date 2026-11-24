import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { config } from "@/server/config";
import { DESK_COOKIE, verifySession } from "./token";

/** Every desk page, action and download calls this (defence in depth behind the proxy). */
export async function requireDesk() {
  await connection(); // session checks are always request-time, never prerendered
  if (!config.desk.enabled) redirect("/desk/login");
  const token = (await cookies()).get(DESK_COOKIE)?.value;
  if (!verifySession(token, config.desk.secret)) redirect("/desk/login");
}

export async function isDeskSession() {
  await connection();
  if (!config.desk.enabled) return false;
  return verifySession((await cookies()).get(DESK_COOKIE)?.value, config.desk.secret);
}
