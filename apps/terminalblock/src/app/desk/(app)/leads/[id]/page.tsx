import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft, Download, Mail } from "lucide-react";
import { fmtDate, Panel, TierBadge } from "@/components/desk/ui";
import { requireDesk } from "@/server/auth/session";
import { LEAD_KIND_LABEL, LEAD_STATUSES } from "@/server/leads/types";
import { leadStore } from "@/server/storage";
import { site } from "@/config/site";
import { addLeadNote, setLeadStatus } from "../../../actions";

export default function LeadPage({ params }: PageProps<"/desk/leads/[id]">) {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-paper-2" />}>
      <LeadDetail params={params} />
    </Suspense>
  );
}

async function LeadDetail({ params }: { params: PageProps<"/desk/leads/[id]">["params"] }) {
  await requireDesk();
  const { id } = await params;
  const lead = await leadStore().get(id);
  if (!lead) notFound();
  const a = lead.analysis;
  const kind = lead.kind ?? "rfq";
  const replyHref = `mailto:${encodeURIComponent(lead.contact.email)}?subject=${encodeURIComponent(`Re: your question on ${site.name} (${lead.ref})`)}`;

  return (
    <div className="space-y-6">
      <Link href="/desk" className="inline-flex items-center gap-1.5 text-sm text-ink-4 hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> All questions and leads
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <span className="marker">{lead.ref}</span>
          <h1 className="mt-3 text-[32px] font-medium leading-tight">{lead.contact.company || lead.contact.name || lead.contact.email}</h1>
          <p className="mt-1 text-ink-4">
            {LEAD_KIND_LABEL[kind]} · received {fmtDate(lead.createdAt)} from {lead.site}
            {lead.contact.role ? ` · ${lead.contact.role}` : ""}
          </p>
        </div>
        <form action={setLeadStatus} className="flex items-center gap-2">
          <input type="hidden" name="id" value={lead.id} />
          <label className="text-sm text-ink-4" htmlFor="status">
            Status
          </label>
          <select id="status" name="status" defaultValue={lead.status} className="h-9 rounded-lg bg-paper px-2 text-sm capitalize shadow-[inset_0_0_0_1px_var(--color-line)]">
            {LEAD_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <button className="h-9 rounded-lg bg-ink px-4 text-sm font-medium text-[#efe9de] hover:bg-ink-3">Save</button>
        </form>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          {kind === "question" ? (
            <Panel
              title="Question"
              action={
                <a href={replyHref} className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-ink px-3 text-sm font-medium text-[#efe9de] hover:bg-ink-3">
                  <Mail className="h-3.5 w-3.5" /> Reply by email
                </a>
              }
            >
              <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{lead.details.notes}</p>
              {lead.meta.referer && <p className="mt-4 text-xs text-steel">Asked on: {lead.meta.referer}</p>}
            </Panel>
          ) : (
            <Panel title={lead.lines.length ? `Parts (${lead.lines.length})` : LEAD_KIND_LABEL[kind]}>
              {lead.lines.length === 0 ? (
                <p className="text-sm text-ink-4">{kind === "guide" ? "Downloaded the guide. A good moment to follow up." : "No parts listed."}</p>
              ) : (
                <ul className="divide-y divide-line text-sm">
                  {lead.lines.map((l, i) => (
                    <li key={i} className="py-2.5">
                      <span className="font-mono">{l.part}</span>
                      {l.manufacturer && <span className="text-steel"> · {l.manufacturer}</span>}
                      {l.qty !== null && <span className="text-steel"> · ×{l.qty}</span>}
                      {l.notes && <div className="text-xs text-ink-4">{l.notes}</div>}
                    </li>
                  ))}
                </ul>
              )}
              {kind !== "guide" && lead.details.notes && <p className="mt-4 whitespace-pre-wrap text-sm text-ink-4">{lead.details.notes}</p>}
            </Panel>
          )}

          {a && (
            <Panel title="Score">
              <div className="space-y-3 text-sm">
                <TierBadge tier={a.score.tier} score={a.score.score} />
                <ul className="space-y-0.5 font-mono text-xs text-ink-4">
                  {a.score.reasons.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
                <p className="text-xs text-steel">Rule-based, so it&apos;s explainable and costs nothing to run.</p>
              </div>
            </Panel>
          )}
        </div>

        <div className="space-y-6">
          <Panel title="Contact">
            <dl className="space-y-2 text-sm">
              {lead.contact.name && (
                <div>
                  <dt className="text-xs text-steel">Name</dt>
                  <dd>{lead.contact.name}</dd>
                </div>
              )}
              <div>
                <dt className="text-xs text-steel">Email</dt>
                <dd className="break-all">{lead.contact.email}</dd>
              </div>
              {lead.contact.company && (
                <div>
                  <dt className="text-xs text-steel">Company</dt>
                  <dd>{lead.contact.company}</dd>
                </div>
              )}
              <div>
                <dt className="text-xs text-steel">Updates</dt>
                <dd>{lead.contact.marketingOptIn ? "Opted in" : "Not opted in"}</dd>
              </div>
              {lead.meta.spamSignals.length > 0 && (
                <div>
                  <dt className="text-xs text-steel">Spam signals</dt>
                  <dd className="text-bad">{lead.meta.spamSignals.join(", ")}</dd>
                </div>
              )}
            </dl>
          </Panel>

          {lead.files.length > 0 && (
            <Panel title={`Files (${lead.files.length})`}>
              <ul className="space-y-2 text-sm">
                {lead.files.map((f) => (
                  <li key={f.id}>
                    <a href={`/api/desk/files/${lead.id}/${f.id}`} className="inline-flex items-center gap-2 hover:underline">
                      <Download className="h-4 w-4 text-steel" /> {f.name}
                    </a>
                  </li>
                ))}
              </ul>
            </Panel>
          )}

          <Panel title="Activity">
            <ol className="space-y-2 text-sm">
              {[...lead.events].reverse().map((e, i) => (
                <li key={i}>
                  <span className="text-xs text-steel">{fmtDate(e.at)}</span> <span className="capitalize">{e.type}</span>
                  {e.note && <span className="text-ink-4">: {e.note}</span>}
                </li>
              ))}
            </ol>
            <form action={addLeadNote} className="mt-4 space-y-2">
              <input type="hidden" name="id" value={lead.id} />
              <textarea name="note" rows={2} maxLength={2000} placeholder="Add a note, e.g. replied, suggested an equivalent" className="w-full rounded-lg bg-paper p-2 text-sm shadow-[inset_0_0_0_1px_var(--color-line)] focus:outline-none" />
              <button className="h-8 rounded-lg px-3 text-sm font-medium shadow-[inset_0_0_0_1px_var(--color-line)] hover:bg-paper-2">Add note</button>
            </form>
          </Panel>
        </div>
      </div>
    </div>
  );
}
