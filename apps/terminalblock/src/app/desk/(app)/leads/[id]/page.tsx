import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft, Download, RefreshCw } from "lucide-react";
import { CopyButton } from "@/components/desk/CopyButton";
import { fmtDate, Panel, TierBadge } from "@/components/desk/ui";
import { requireDesk } from "@/server/auth/session";
import { LEAD_KIND_LABEL, LEAD_STATUSES } from "@/server/leads/types";
import { leadStore } from "@/server/storage";
import { addLeadNote, reanalyzeLead, setLeadStatus } from "../../../actions";

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

  return (
    <div className="space-y-6">
      <Link href="/desk" className="inline-flex items-center gap-1.5 text-sm text-ink-4 hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> All leads
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <span className="marker">{lead.ref}</span>
          <h1 className="mt-3 text-[32px] font-medium leading-tight">{lead.contact.company}</h1>
          <p className="mt-1 text-ink-4">
            {LEAD_KIND_LABEL[lead.kind ?? "rfq"]} · received {fmtDate(lead.createdAt)} from {lead.site}
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
          <Panel title={`Requested parts (${lead.lines.length})`}>
            {lead.lines.length === 0 ? (
              <p className="text-sm text-ink-4">
                {lead.kind === "guide" ? "No parts yet: this person downloaded the guide. A good moment to follow up." : "No lines typed. Check the attached files."}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead className="text-xs text-steel">
                    <tr>
                      <th className="pb-2 font-normal">Requested</th>
                      <th className="pb-2 text-right font-normal">Qty</th>
                      <th className="pb-2 pl-6 font-normal">Catalog match</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {lead.lines.map((l, i) => {
                      const m = a?.matches[i];
                      return (
                        <tr key={i} className="align-top">
                          <td className="py-3 pr-4">
                            <div className="font-mono">{l.part}</div>
                            {l.manufacturer && <div className="text-xs text-steel">{l.manufacturer}</div>}
                            {l.notes && <div className="mt-1 text-xs text-ink-4">{l.notes}</div>}
                          </td>
                          <td className="py-3 text-right font-mono tabular-nums">{l.qty ?? "—"}</td>
                          <td className="py-3 pl-6">
                            {!m ? (
                              <span className="text-xs text-steel">Pending analysis</span>
                            ) : m.status === "none" ? (
                              <span className="text-xs text-steel">Not in catalog</span>
                            ) : (
                              <>
                                <div>
                                  <span className={m.status === "exact" ? "text-ok" : "text-ink-4"}>{m.status === "exact" ? "Exact" : "Likely"}</span>{" "}
                                  <span className="font-mono">{m.manufacturer} {m.partNumber}</span>
                                </div>
                                <div className="text-xs text-steel">{m.description}</div>
                                {m.equivalents.length > 0 && (
                                  <div className="mt-1 text-xs text-ink-4">
                                    Equivalents to verify: {m.equivalents.map((e) => `${e.manufacturer} ${e.partNumber}`).join(", ")}
                                  </div>
                                )}
                              </>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>

          <Panel
            title="Analysis"
            action={
              <form action={reanalyzeLead}>
                <input type="hidden" name="id" value={lead.id} />
                <button className="inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-sm shadow-[inset_0_0_0_1px_var(--color-line)] hover:bg-paper-2">
                  <RefreshCw className="h-3.5 w-3.5" /> Re-run
                </button>
              </form>
            }
          >
            {!a ? (
              <p className="text-sm text-ink-4">Analysis is running. Refresh in a moment.</p>
            ) : (
              <div className="space-y-5 text-sm">
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                  <TierBadge tier={a.score.tier} score={a.score.score} />
                  <span className="text-ink-4">Buyer: {a.buyerType}</span>
                  <span className="text-ink-4">Intent: {a.intent}</span>
                  <span className="text-xs text-steel">{a.by === "ai" ? "AI analysis" : "Rule-based (AI off)"} · {fmtDate(a.analyzedAt)}</span>
                </div>
                <p className="leading-relaxed">{a.summary}</p>
                {a.flags.length > 0 && (
                  <div>
                    <h3 className="text-xs text-steel">Flags</h3>
                    <ul className="mt-1 list-disc space-y-1 pl-5">{a.flags.map((f) => <li key={f}>{f}</li>)}</ul>
                  </div>
                )}
                {a.questions.length > 0 && (
                  <div>
                    <h3 className="text-xs text-steel">Questions for the buyer</h3>
                    <ul className="mt-1 list-disc space-y-1 pl-5">{a.questions.map((q) => <li key={q}>{q}</li>)}</ul>
                  </div>
                )}
                <details>
                  <summary className="cursor-pointer text-xs text-steel">Why this score</summary>
                  <ul className="mt-2 space-y-0.5 font-mono text-xs text-ink-4">{a.score.reasons.map((r) => <li key={r}>{r}</li>)}</ul>
                </details>
              </div>
            )}
          </Panel>

          {a && (
            <Panel title="Supplier inquiry draft" action={<CopyButton text={a.supplierInquiry} />}>
              <pre className="whitespace-pre-wrap font-mono text-[13px] leading-relaxed text-ink-4">{a.supplierInquiry}</pre>
              <p className="mt-3 text-xs text-steel">Contains part details only, never the buyer&apos;s identity. Nothing is sent automatically.</p>
            </Panel>
          )}
        </div>

        <div className="space-y-6">
          <Panel title="Contact">
            <dl className="space-y-2 text-sm">
              <div><dt className="text-xs text-steel">Name</dt><dd>{lead.contact.name}</dd></div>
              <div><dt className="text-xs text-steel">Email</dt><dd className="break-all">{lead.contact.email}</dd></div>
              {lead.contact.phone && <div><dt className="text-xs text-steel">Phone</dt><dd>{lead.contact.phone}</dd></div>}
              <div><dt className="text-xs text-steel">Product updates</dt><dd>{lead.contact.marketingOptIn ? "Opted in" : "Not opted in"}</dd></div>
            </dl>
          </Panel>

          <Panel title="Request details">
            <dl className="space-y-2 text-sm">
              <div><dt className="text-xs text-steel">Timing</dt><dd>{lead.details.urgency || "Not set"}</dd></div>
              <div><dt className="text-xs text-steel">Equivalents</dt><dd>{lead.details.equivalents || "Not set"}</dd></div>
              <div><dt className="text-xs text-steel">Ship to</dt><dd>{lead.details.province || "Not set"}</dd></div>
              {lead.details.notes && <div><dt className="text-xs text-steel">Notes</dt><dd className="whitespace-pre-wrap">{lead.details.notes}</dd></div>}
              {lead.meta.spamSignals.length > 0 && <div><dt className="text-xs text-steel">Spam signals</dt><dd className="text-bad">{lead.meta.spamSignals.join(", ")}</dd></div>}
            </dl>
          </Panel>

          {lead.files.length > 0 && (
            <Panel title={`Files (${lead.files.length})`}>
              <ul className="space-y-2 text-sm">
                {lead.files.map((f) => (
                  <li key={f.id}>
                    <a href={`/api/desk/files/${lead.id}/${f.id}`} className="inline-flex items-center gap-2 hover:underline">
                      <Download className="h-4 w-4 text-steel" /> {f.name}
                      <span className="font-mono text-xs text-steel">{Math.max(1, Math.round(f.size / 1024))} KB</span>
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
                  <span className="text-xs text-steel">{fmtDate(e.at)}</span>{" "}
                  <span className="capitalize">{e.type}</span>
                  {e.note && <span className="text-ink-4">: {e.note}</span>}
                </li>
              ))}
            </ol>
            <form action={addLeadNote} className="mt-4 space-y-2">
              <input type="hidden" name="id" value={lead.id} />
              <textarea name="note" rows={2} maxLength={2000} placeholder="Add a note" className="w-full rounded-lg bg-paper p-2 text-sm shadow-[inset_0_0_0_1px_var(--color-line)] focus:outline-none" />
              <button className="h-8 rounded-lg px-3 text-sm font-medium shadow-[inset_0_0_0_1px_var(--color-line)] hover:bg-paper-2">Add note</button>
            </form>
          </Panel>
        </div>
      </div>
    </div>
  );
}
