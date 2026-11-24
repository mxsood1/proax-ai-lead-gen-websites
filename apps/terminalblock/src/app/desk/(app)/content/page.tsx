import Link from "next/link";
import { Suspense } from "react";
import { DraftForm } from "@/components/desk/DraftForm";
import { NextArticleButton } from "@/components/desk/ContentForms";
import { fmtDate, Panel } from "@/components/desk/ui";
import { requireDesk } from "@/server/auth/session";
import { config } from "@/server/config";
import { contentQueueState } from "@/server/content/schedule";

export default function ContentPage() {
  return (
    <>
      <h1 className="text-[32px] font-medium leading-tight">Content</h1>
      <p className="mt-1 max-w-2xl text-ink-4">
        Draft short guides for the search queries buyers use. Every draft needs a person to review and approve it.{" "}
        {config.content.publishing
          ? "Publishing is on: approved articles appear on the site and in the sitemap straight away."
          : "Publishing is off, so nothing here appears on the site, even when approved."}
      </p>
      <Suspense fallback={<div className="mt-8 h-96 animate-pulse rounded-2xl bg-paper-2" />}>
        <ContentBody />
      </Suspense>
    </>
  );
}

async function ContentBody() {
  await requireDesk();
  const { drafts, keywords, waiting, maxWaiting, next } = await contentQueueState();
  const drafted = new Set(drafts.filter((d) => d.status !== "rejected").map((d) => d.keyword));
  const scheduled = config.ai.enabled && Boolean(config.content.cronSecret);
  const lastScheduled = drafts.filter((d) => d.createdBy === "schedule").sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
  const full = waiting >= maxWaiting;

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
      <div className="space-y-6">
        <Panel title="Automatic drafting">
          <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[10rem_1fr]">
            <dt className="text-steel">Schedule</dt>
            <dd>
              {scheduled ? (
                <span className="text-ok">On</span>
              ) : (
                <span className="text-ink-4">Off</span>
              )}
              {" · "}one article every Monday around 9 am (Toronto), on the hosted site
              {!scheduled && (
                <span className="block text-xs text-steel">
                  Needs {[!config.ai.enabled && "ANTHROPIC_API_KEY", !config.content.cronSecret && "CRON_SECRET"].filter(Boolean).join(" and ")} set on the host.
                </span>
              )}
            </dd>
            <dt className="text-steel">Waiting for review</dt>
            <dd className={full ? "text-bad" : undefined}>
              {waiting} of {maxWaiting}
              {full ? " · paused until some are reviewed" : ""}
            </dd>
            <dt className="text-steel">Next topic</dt>
            <dd>{next ? `${next.keyword} (priority ${next.priority})` : "None left. Add target searches to content/keywords.json."}</dd>
            {lastScheduled && (
              <>
                <dt className="text-steel">Last scheduled</dt>
                <dd>
                  <Link href={`/desk/content/${lastScheduled.id}`} className="hover:underline">
                    {lastScheduled.guide.title}
                  </Link>{" "}
                  <span className="text-steel">· {fmtDate(lastScheduled.createdAt)}</span>
                </dd>
              </>
            )}
          </dl>
          <div className="mt-5 border-t border-line pt-4">
            <NextArticleButton disabled={full || !next} label={config.ai.enabled ? "Write the next article now" : "Create the next outline now"} />
            <p className="mt-2 text-xs text-steel">
              Same job as the weekly schedule. It writes a draft and sends a review notice ({config.email.deliver ? "by email" : "saved to the local outbox, nobody is emailed"}). Nothing is published until a person approves it.
            </p>
          </div>
        </Panel>

        <Panel title="New draft">
          <DraftForm />
          <p className="mt-3 text-xs text-steel">
            {config.ai.enabled
              ? "AI writes a first draft and lists every technical claim to check."
              : "AI is off, so this creates an outline for a person to write."}{" "}
            Topics too similar to existing guides or drafts are refused.
          </p>
        </Panel>

        <Panel title={`Drafts (${drafts.length})`}>
          {drafts.length === 0 ? (
            <p className="text-sm text-ink-4">No drafts yet.</p>
          ) : (
            <ul className="divide-y divide-line">
              {drafts.map((d) => (
                <li key={d.id} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <Link href={`/desk/content/${d.id}`} className="font-medium hover:underline">
                      {d.guide.title}
                    </Link>
                    <div className="text-xs text-steel">
                      {d.source === "ai" ? "AI draft" : d.source === "manual" ? "Written by hand" : "Outline"}
                      {d.createdBy === "schedule" ? " · weekly schedule" : ""} · updated {fmtDate(d.updatedAt)}
                    </div>
                  </div>
                  <span className={d.status === "approved" ? "text-sm text-ok" : d.status === "rejected" ? "text-sm text-bad" : "text-sm text-ink-4"}>
                    {d.status === "draft" ? "Needs review" : d.status === "approved" ? "Approved" : "Rejected"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <Panel title={`Target searches (${keywords.length})`}>
        <ul className="divide-y divide-line text-sm">
          {keywords
            .sort((a, b) => a.priority - b.priority)
            .map((k) => (
              <li key={k.keyword} className="flex items-center justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <div>{k.keyword}</div>
                  <div className="text-xs text-steel">
                    Priority {k.priority} · {k.intent}
                  </div>
                </div>
                {k.coveredBy ? (
                  <span className="shrink-0 text-xs text-ok">Published</span>
                ) : drafted.has(k.keyword) ? (
                  <span className="shrink-0 text-xs text-ink-4">Drafted</span>
                ) : (
                  <DraftForm keyword={k.keyword} compact />
                )}
              </li>
            ))}
        </ul>
      </Panel>
    </div>
  );
}
