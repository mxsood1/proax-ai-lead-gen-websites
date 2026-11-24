import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { productTypes } from "@/data/types";
import { GuideBlocks } from "@/components/guides/GuideBlocks";
import { ReviseForm } from "@/components/desk/ContentForms";
import { fmtDate, Panel } from "@/components/desk/ui";
import { requireDesk } from "@/server/auth/session";
import { config } from "@/server/config";
import { getDraft, hasPlaceholders } from "@/server/content/store";
import { qualityIssues, wordCount } from "@/server/content/topics";
import { setDraftStatus } from "../../../actions";

export default function DraftPage({ params }: PageProps<"/desk/content/[id]">) {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-paper-2" />}>
      <DraftDetail params={params} />
    </Suspense>
  );
}

const statusLabel = { draft: "Needs review", approved: "Approved", rejected: "Rejected" } as const;
const sourceLabel = { ai: "AI draft", manual: "Written by hand", outline: "Outline" } as const;

async function DraftDetail({ params }: { params: PageProps<"/desk/content/[id]">["params"] }) {
  await requireDesk();
  const { id } = await params;
  const d = await getDraft(id);
  if (!d) notFound();
  const unfinished = hasPlaceholders(d.guide);
  const issues = unfinished ? [] : qualityIssues(d.guide);
  const live = d.status === "approved" && config.content.publishing && !unfinished;
  const related = productTypes.filter((t) => d.guide.related?.includes(t.slug));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/desk/content" className="inline-flex items-center gap-1.5 text-sm text-ink-4 hover:text-ink">
          <ArrowLeft className="h-4 w-4" /> All content
        </Link>
        <div className="flex items-center gap-4 text-sm">
          {live && (
            <a href={`/guides/${d.guide.slug}`} target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 text-ok hover:underline">
              Live at /guides/{d.guide.slug} <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
          <Link href={`/desk/content/${d.id}/edit`} className="h-9 rounded-lg px-4 font-medium leading-9 shadow-[inset_0_0_0_1px_var(--color-line)] hover:bg-paper-2">
            Edit
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <article className="rounded-2xl bg-paper p-6 shadow-[inset_0_0_0_1px_var(--color-line)] sm:p-10">
          <div className="text-sm text-steel">
            {d.guide.category} · {d.guide.readMinutes} min read · {wordCount(d.guide)} words · /guides/{d.guide.slug}
          </div>
          <h1 className="mt-3 text-[32px] font-medium leading-tight">{d.guide.title}</h1>
          <p className="mt-3 text-lg text-ink-4">{d.guide.description}</p>
          <ul className="mt-6 space-y-1 rounded-xl bg-paper-2 p-5 text-sm">
            {d.guide.keyTakeaways.map((k) => (
              <li key={k}>{k}</li>
            ))}
          </ul>
          <div className="mt-8">
            <GuideBlocks blocks={d.guide.body} />
          </div>
          <h2 className="mt-10 text-xl font-medium">FAQ</h2>
          <dl className="mt-4 space-y-4">
            {d.guide.faqs.map((f) => (
              <div key={f.q}>
                <dt className="font-medium">{f.q}</dt>
                <dd className="mt-1 text-ink-4">{f.a}</dd>
              </div>
            ))}
          </dl>
          {related.length > 0 && <p className="mt-8 text-sm text-steel">Links to: {related.map((t) => t.name).join(", ")}</p>}
        </article>

        <div className="space-y-6">
          <Panel title="Review">
            <p className="text-sm text-ink-4">
              Status: <span className="font-medium text-ink">{statusLabel[d.status]}</span>
              <br />
              Target search: {d.keyword}
              <br />
              Source: {sourceLabel[d.source]}
              {d.createdBy === "schedule" ? " (weekly schedule)" : ""} · updated {fmtDate(d.updatedAt)}
              {d.publishedAt && (
                <>
                  <br />
                  First approved {fmtDate(d.publishedAt)}
                </>
              )}
            </p>
            {d.reviewNote && <p className="mt-3 rounded-lg bg-paper-2 p-3 text-sm">Note: {d.reviewNote}</p>}
            <form action={setDraftStatus} className="mt-4 space-y-3">
              <input type="hidden" name="id" value={d.id} />
              <textarea
                name="note"
                rows={2}
                maxLength={1000}
                placeholder="Review note (optional)"
                className="w-full rounded-lg bg-paper p-2 text-sm shadow-[inset_0_0_0_1px_var(--color-line)] focus:outline-none"
              />
              <div className="flex flex-wrap gap-2">
                {d.status !== "approved" && (
                  <button name="status" value="approved" disabled={unfinished} className="h-9 rounded-lg bg-ink px-4 text-sm font-medium text-[#efe9de] hover:bg-ink-3 disabled:opacity-40">
                    {config.content.publishing ? "Approve and publish" : "Approve"}
                  </button>
                )}
                {d.status !== "rejected" && (
                  <button name="status" value="rejected" className="h-9 rounded-lg px-4 text-sm font-medium shadow-[inset_0_0_0_1px_var(--color-line)] hover:bg-paper-2">
                    {d.status === "approved" ? "Unpublish and reject" : "Reject"}
                  </button>
                )}
                {d.status !== "draft" && (
                  <button name="status" value="draft" className="h-9 rounded-lg px-4 text-sm text-ink-4 hover:text-ink">
                    {d.status === "approved" ? "Unpublish, back to review" : "Back to review"}
                  </button>
                )}
              </div>
              {unfinished && <p className="text-xs text-steel">This is an outline. Use Edit to write the sections marked [Write…] before it can be approved.</p>}
              <p className="text-xs text-steel">
                {config.content.publishing
                  ? "Approving puts the article on the public site straight away and adds it to the sitemap."
                  : "Publishing is off (CONTENT_PUBLISHING), so approving does not put anything on the site."}
              </p>
            </form>
          </Panel>

          <Panel title={issues.length ? `Quality checks (${issues.length})` : "Quality checks"}>
            {unfinished ? (
              <p className="text-sm text-ink-4">Runs once the outline is written.</p>
            ) : issues.length === 0 ? (
              <p className="text-sm text-ok">No problems found. Still read it in full and check the claims below.</p>
            ) : (
              <ul className="list-disc space-y-1.5 pl-5 text-sm text-ink-4">
                {issues.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title={`Claims to verify (${d.factCheck.length})`}>
            <ul className="list-disc space-y-1.5 pl-5 text-sm text-ink-4">
              {d.factCheck.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-steel">Check each one against manufacturer datasheets or the standard before approving.</p>
          </Panel>

          <Panel title="Fix something">
            {config.ai.enabled ? (
              <ReviseForm id={d.id} />
            ) : (
              <p className="text-sm text-ink-4">
                AI is off, so make changes with{" "}
                <Link href={`/desk/content/${d.id}/edit`} className="underline">
                  Edit
                </Link>
                . With an API key, you can describe a change here and AI rewrites the article for you.
              </p>
            )}
          </Panel>

          {d.history && d.history.length > 0 && (
            <Panel title="History">
              <ul className="space-y-2 text-sm">
                {[...d.history].reverse().map((h, i) => (
                  <li key={i}>
                    <span className="text-steel">{fmtDate(h.at)}</span> · {h.note}
                  </li>
                ))}
              </ul>
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}
