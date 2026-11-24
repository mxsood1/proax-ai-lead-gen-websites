import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { LeadScore, LeadStatus } from "@/server/leads/types";

export const fmtDate = (iso: string) =>
  new Intl.DateTimeFormat("en-CA", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Toronto" }).format(new Date(iso));

export function TierBadge({ tier, score }: { tier: LeadScore["tier"] | null; score: number | null }) {
  if (!tier) return <span className="text-xs text-steel">Pending</span>;
  const dot = { hot: "bg-signal", warm: "bg-tb-yellow", cold: "bg-steel", spam: "bg-bad" }[tier];
  return (
    <span className="inline-flex items-center gap-2 text-sm">
      <span className={cn("h-2 w-2 rounded-full", dot)} />
      <span className="capitalize">{tier}</span>
      {score !== null && <span className="font-mono text-xs tabular-nums text-steel">{score}</span>}
    </span>
  );
}

export function StatusText({ status }: { status: LeadStatus }) {
  return <span className={cn("text-sm capitalize", status === "new" ? "font-medium text-ink" : "text-ink-4")}>{status}</span>;
}

export function Panel({ title, children, action, className }: { title: string; children: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-2xl bg-paper shadow-[inset_0_0_0_1px_var(--color-line)]", className)}>
      <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-3">
        <h2 className="text-sm font-medium">{title}</h2>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}
