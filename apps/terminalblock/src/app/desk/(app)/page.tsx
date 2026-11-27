import Link from "next/link";
import { Suspense } from "react";
import { fmtDate, StatusText, TierBadge } from "@/components/desk/ui";
import { requireDesk } from "@/server/auth/session";
import { LEAD_KIND_LABEL, LEAD_STATUSES } from "@/server/leads/types";
import { leadStore } from "@/server/storage";

export default function DeskHome({ searchParams }: PageProps<"/desk">) {
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[32px] font-medium leading-tight">Questions and leads</h1>
          <p className="mt-1 text-ink-4">Questions from the &quot;Ask us&quot; form and guide downloads, newest first. Reply to each question by email, then update its status.</p>
        </div>
      </div>
      <Suspense fallback={<div className="mt-8 h-64 animate-pulse rounded-2xl bg-paper-2" />}>
        <LeadTable searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function LeadTable({ searchParams }: { searchParams: PageProps<"/desk">["searchParams"] }) {
  await requireDesk();
  const sp = await searchParams;
  const filter = typeof sp.status === "string" && (LEAD_STATUSES as readonly string[]).includes(sp.status) ? sp.status : "open";
  const all = await leadStore().list();
  const leads = filter === "open" ? all.filter((l) => !["answered", "won", "lost", "spam"].includes(l.status)) : all.filter((l) => l.status === filter);
  const count = (s: string) => (s === "open" ? all.filter((l) => !["answered", "won", "lost", "spam"].includes(l.status)).length : all.filter((l) => l.status === s).length);

  return (
    <>
      <nav className="mt-6 flex flex-wrap gap-1" aria-label="Filter by status">
        {["open", ...LEAD_STATUSES].map((s) => (
          <Link
            key={s}
            href={s === "open" ? "/desk" : `/desk?status=${s}`}
            className={
              filter === s
                ? "h-8 rounded-lg bg-ink px-3 text-sm leading-8 text-[#efe9de]"
                : "h-8 rounded-lg px-3 text-sm leading-8 text-ink-4 shadow-[inset_0_0_0_1px_var(--color-line)] hover:text-ink"
            }
          >
            <span className="capitalize">{s}</span> <span className="font-mono text-xs tabular-nums opacity-70">{count(s)}</span>
          </Link>
        ))}
      </nav>

      <div className="mt-4 overflow-x-auto rounded-2xl bg-paper shadow-[inset_0_0_0_1px_var(--color-line)]">
        {leads.length === 0 ? (
          <p className="p-8 text-center text-ink-4">Nothing here yet.</p>
        ) : (
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-line text-xs text-steel">
              <tr>
                <th className="px-4 py-3 font-normal">Reference</th>
                <th className="px-4 py-3 font-normal">Received</th>
                <th className="px-4 py-3 font-normal">From</th>
                <th className="px-4 py-3 font-normal">Question or request</th>
                <th className="px-4 py-3 font-normal">Score</th>
                <th className="px-4 py-3 font-normal">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {leads.map((l) => (
                <tr key={l.id} className="transition-colors hover:bg-paper-2/60">
                  <td className="px-4 py-3">
                    <Link href={`/desk/leads/${l.id}`} className="marker hover:shadow-[inset_0_0_0_1px_var(--color-ink)]">
                      {l.ref}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-ink-4">{fmtDate(l.createdAt)}</td>
                  <td className="px-4 py-3">
                    {l.company || l.email}
                    {l.company && <div className="text-xs text-steel">{l.email}</div>}
                  </td>
                  <td className="max-w-md px-4 py-3">
                    <div className="text-xs text-steel">{LEAD_KIND_LABEL[l.kind]}</div>
                    {l.excerpt ? <div className="line-clamp-2 text-ink-3">{l.excerpt}</div> : l.lineCount > 0 ? <div className="text-ink-4">{l.lineCount} parts</div> : null}
                  </td>
                  <td className="px-4 py-3">
                    <TierBadge tier={l.tier} score={l.score} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusText status={l.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
