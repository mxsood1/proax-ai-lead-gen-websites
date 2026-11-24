"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import { productTypes } from "@/data/types";
import { config } from "@/server/config";
import { requireDesk } from "@/server/auth/session";
import { DESK_COOKIE, SESSION_MS, passwordMatches, signSession } from "@/server/auth/token";
import { LEAD_STATUSES, type LeadStatus } from "@/server/leads/types";
import { hashIp, rateLimited } from "@/server/rfq/spam";
import { analyzeLead } from "@/server/sourcing/pipeline";
import { leadStore } from "@/server/storage";
import { createDraft, DuplicateTopicError, reviseDraft } from "@/server/content/generate";
import { getDraft, hasPlaceholders, saveDraft, withHistory, type DraftStatus } from "@/server/content/store";
import { GUIDES_TAG } from "@/server/content/published";
import { runContentJob, type ContentJobResult } from "@/server/content/schedule";
import { linesToList, textToBlocks, textToFaqs } from "@/server/content/markdown";

/* -------------------------------- auth -------------------------------- */

export async function loginAction(_prev: { error: string } | null, form: FormData) {
  if (!config.desk.enabled) return { error: "The sourcing desk isn't configured on this server." };
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (rateLimited(`login:${hashIp(ip)}`, 8, 15 * 60 * 1000)) return { error: "Too many attempts. Wait 15 minutes and try again." };

  if (!passwordMatches(String(form.get("password") ?? ""), config.desk.password)) return { error: "That password isn't right." };

  (await cookies()).set(DESK_COOKIE, signSession(config.desk.secret), {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MS / 1000,
  });
  redirect("/desk");
}

export async function logoutAction() {
  (await cookies()).delete(DESK_COOKIE);
  redirect("/desk/login");
}

/* -------------------------------- leads -------------------------------- */

const now = () => new Date().toISOString();
const str = (form: FormData, k: string, max = 2000) => String(form.get(k) ?? "").trim().slice(0, max);

export async function setLeadStatus(form: FormData) {
  await requireDesk();
  const id = str(form, "id", 64);
  const status = str(form, "status", 20) as LeadStatus;
  if (!LEAD_STATUSES.includes(status)) return;
  await leadStore().update(id, (l) => ({ ...l, status, events: [...l.events, { at: now(), type: "status", note: `${l.status} → ${status}` }] }));
  revalidatePath(`/desk/leads/${id}`);
}

export async function addLeadNote(form: FormData) {
  await requireDesk();
  const id = str(form, "id", 64);
  const note = str(form, "note", 2000);
  if (!note) return;
  await leadStore().update(id, (l) => ({ ...l, events: [...l.events, { at: now(), type: "note", note }] }));
  revalidatePath(`/desk/leads/${id}`);
}

export async function reanalyzeLead(form: FormData) {
  await requireDesk();
  const id = str(form, "id", 64);
  const store = leadStore();
  const lead = await store.get(id);
  if (!lead) return;
  const analysis = await analyzeLead(lead);
  await store.update(id, (l) => ({ ...l, analysis, events: [...l.events, { at: now(), type: "analyzed", note: `${analysis.by} · score ${analysis.score.score}` }] }));
  revalidatePath(`/desk/leads/${id}`);
}

/* ------------------------------- content ------------------------------- */

export async function createContentDraft(_prev: { error: string } | null, form: FormData) {
  await requireDesk();
  const keyword = str(form, "keyword", 120);
  if (keyword.length < 4) return { error: "Enter a longer topic or search query." };
  let id: string;
  try {
    id = (await createDraft(keyword)).id;
  } catch (error) {
    if (error instanceof DuplicateTopicError) return { error: error.message };
    return { error: "The draft couldn't be created." };
  }
  redirect(`/desk/content/${id}`);
}

const STATUS_LABEL: Record<DraftStatus, string> = { draft: "Back to review", approved: "Approved", rejected: "Rejected" };

export async function setDraftStatus(form: FormData) {
  await requireDesk();
  const id = str(form, "id", 80);
  const status = str(form, "status", 20) as DraftStatus;
  if (!["draft", "approved", "rejected"].includes(status)) return;
  const draft = await getDraft(id);
  if (!draft) return;
  if (status === "approved" && hasPlaceholders(draft.guide)) return; // outlines must be written first

  const today = now().slice(0, 10);
  const firstApproval = status === "approved" && !draft.publishedAt;
  const note = str(form, "note", 1000);
  const next = withHistory(
    {
      ...draft,
      status,
      reviewNote: note || draft.reviewNote,
      publishedAt: firstApproval ? now() : draft.publishedAt,
      guide: status === "approved" ? { ...draft.guide, updated: today, published: draft.guide.published ?? today } : draft.guide,
    },
    `${STATUS_LABEL[status]}${note ? `: ${note.slice(0, 200)}` : ""}`,
  );
  await saveDraft(next);
  // Approving or unpublishing changes the public guide list, sitemap and pages
  updateTag(GUIDES_TAG);
  revalidatePath(`/desk/content/${id}`);
  revalidatePath("/desk/content");
}

/** "Write the next article now": the same job the weekly schedule runs. */
// useActionState passes the previous result first; this action doesn't need it
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function runNextArticle(_prev: ContentJobResult | { status: "failed"; reason: string } | null) {
  await requireDesk();
  try {
    const result = await runContentJob({ trigger: "desk" });
    revalidatePath("/desk/content");
    return result;
  } catch {
    return { status: "failed" as const, reason: "The article couldn't be written. Check the server logs." };
  }
}

export async function reviseDraftAction(_prev: { error?: string; ok?: boolean } | null, form: FormData) {
  await requireDesk();
  if (!config.ai.enabled) return { error: "AI is off, so revisions have to be made with Edit." };
  const id = str(form, "id", 80);
  const instruction = str(form, "instruction", 2000);
  if (instruction.length < 5) return { error: "Say what should change." };
  const draft = await getDraft(id);
  if (!draft) return { error: "Article not found." };
  try {
    await reviseDraft(draft, instruction);
  } catch {
    return { error: "The AI revision didn't work. Try again, or use Edit." };
  }
  if (draft.status === "approved") updateTag(GUIDES_TAG);
  revalidatePath(`/desk/content/${id}`);
  return { ok: true };
}

const EditSchema = z.object({
  title: z.string().trim().min(5).max(120),
  shortTitle: z.string().trim().min(2).max(60),
  description: z.string().trim().min(10).max(300),
  category: z.enum(["Selection", "Sizing", "Checklist"]),
  readMinutes: z.coerce.number().int().min(1).max(20),
  takeaways: z.string().max(2000),
  body: z.string().min(20).max(40000),
  faqs: z.string().max(10000),
  related: z.array(z.enum(productTypes.map((t) => t.slug) as [string, ...string[]])).max(3),
});

export async function saveDraftEdits(_prev: { error?: string } | null, form: FormData) {
  await requireDesk();
  const id = str(form, "id", 80);
  const draft = await getDraft(id);
  if (!draft) return { error: "Article not found." };

  const parsed = EditSchema.safeParse({
    title: form.get("title"),
    shortTitle: form.get("shortTitle"),
    description: form.get("description"),
    category: form.get("category"),
    readMinutes: form.get("readMinutes"),
    takeaways: form.get("takeaways") ?? "",
    body: form.get("body") ?? "",
    faqs: form.get("faqs") ?? "",
    related: form.getAll("related").map(String),
  });
  if (!parsed.success) return { error: `Check the ${String(parsed.error.issues[0]?.path[0] ?? "form")} field: ${parsed.error.issues[0]?.message}` };

  const v = parsed.data;
  const body = textToBlocks(v.body).slice(0, 200);
  if (body.length === 0) return { error: "The article body is empty." };
  const faqs = textToFaqs(v.faqs).slice(0, 12);

  const next = withHistory(
    {
      ...draft,
      source: draft.source === "outline" && !hasPlaceholders({ ...draft.guide, body, faqs }) ? "manual" : draft.source,
      guide: {
        ...draft.guide,
        title: v.title,
        shortTitle: v.shortTitle,
        description: v.description,
        category: v.category,
        readMinutes: v.readMinutes,
        keyTakeaways: linesToList(v.takeaways).slice(0, 8),
        body,
        faqs,
        related: v.related,
        updated: now().slice(0, 10),
      },
    },
    "Edited by hand",
  );
  await saveDraft(next);
  if (draft.status === "approved") updateTag(GUIDES_TAG);
  revalidatePath(`/desk/content/${id}`);
  redirect(`/desk/content/${id}`);
}
