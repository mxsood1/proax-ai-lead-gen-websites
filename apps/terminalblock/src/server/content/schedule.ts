import "server-only";
import { guides } from "@/data/guides";
import { config } from "@/server/config";
import { sendDraftNotice } from "@/server/email/alert";
import { createDraft, DuplicateTopicError } from "./generate";
import { listDrafts, listKeywords, type Draft, type Keyword } from "./store";
import { pickNextTopic } from "./topics";

/**
 * The weekly article job. Writes ONE new draft for the next target search and
 * tells the review team. It never publishes: a person still checks the facts
 * and approves every article.
 *
 * Runs from the scheduled cron route (hosted site) or the desk button.
 */
export type ContentJobResult =
  | { status: "created"; draft: Pick<Draft, "id" | "keyword" | "source"> & { title: string }; notice: string }
  | { status: "skipped"; reason: string };

export async function contentQueueState() {
  const [drafts, keywords] = await Promise.all([listDrafts(), listKeywords()]);
  const waiting = drafts.filter((d) => d.status === "draft").length;
  const next = pickNextTopic<Keyword>(keywords, drafts, guides.map((g) => g.title));
  return { drafts, keywords, waiting, maxWaiting: config.content.maxWaiting, next };
}

export async function runContentJob({ trigger }: { trigger: "schedule" | "desk" }): Promise<ContentJobResult> {
  // Unattended runs only write real drafts; empty outlines would just pile up.
  if (trigger === "schedule" && !config.ai.enabled) return { status: "skipped", reason: "AI is off (no ANTHROPIC_API_KEY), so nothing was written." };

  const { waiting, maxWaiting, next } = await contentQueueState();
  if (waiting >= maxWaiting)
    return { status: "skipped", reason: `${waiting} articles are already waiting for review (limit ${maxWaiting}). Review those first.` };
  if (!next) return { status: "skipped", reason: "No topics left. Add target searches to content/keywords.json." };

  let draft: Draft;
  try {
    draft = await createDraft(next.keyword, trigger);
  } catch (error) {
    if (error instanceof DuplicateTopicError) return { status: "skipped", reason: `"${next.keyword}": ${error.message}` };
    throw error;
  }

  let notice = "not sent";
  try {
    notice = (await sendDraftNotice(draft)).where;
  } catch {
    notice = "failed to send";
  }
  return { status: "created", draft: { id: draft.id, keyword: draft.keyword, source: draft.source, title: draft.guide.title }, notice };
}
