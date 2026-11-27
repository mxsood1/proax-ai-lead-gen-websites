import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { LogOut } from "lucide-react";
import { LogoMark } from "@/components/brand/Logo";
import { integrationStatus } from "@/server/config";
import { logoutAction } from "../actions";

export const metadata: Metadata = { title: "Desk", robots: { index: false, follow: false } };

export default function DeskLayout({ children }: { children: ReactNode }) {
  const status = integrationStatus();
  return (
    <div className="flex min-h-full flex-1 flex-col bg-paper">
      <header className="bg-ink text-[#efe9de]">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6">
            <Link href="/desk" className="flex items-center gap-2.5">
              <LogoMark className="h-6" />
              <span className="font-medium">Desk</span>
            </Link>
            <nav className="flex gap-1 text-sm">
              <Link href="/desk" className="rounded-lg px-3 py-1.5 text-[#aaa398] transition-colors hover:bg-ink-3 hover:text-[#efe9de]">
                Leads
              </Link>
              <Link href="/desk/content" className="rounded-lg px-3 py-1.5 text-[#aaa398] transition-colors hover:bg-ink-3 hover:text-[#efe9de]">
                Content
              </Link>
            </nav>
          </div>
          <form action={logoutAction}>
            <button className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-[#aaa398] transition-colors hover:bg-ink-3 hover:text-[#efe9de]">
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </form>
        </div>
      </header>
      <div className="border-b border-line bg-paper-2/60">
        <div className="mx-auto flex max-w-7xl flex-wrap gap-x-6 gap-y-1 px-4 py-2 font-mono text-xs text-ink-4 sm:px-6 lg:px-8">
          <span>Storage: {status.storage}</span>
          <span>Lead alerts: {status.email}</span>
          <span>AI: {status.ai}</span>
          <span>Content publishing: {status.publishing}</span>
        </div>
      </div>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
