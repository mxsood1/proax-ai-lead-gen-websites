import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, readdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Guide } from "@/data/guides";
import { config } from "@/server/config";

/**
 * The article queue. Nothing here publishes anything by itself: an article is
 * only shown on the site once a person approves it AND CONTENT_PUBLISHING=on.
 *
 * Where articles are kept:
 *  - local (default): JSON files in content/drafts, handy for development and
 *    reviewable in git.
 *  - Supabase (when SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY are set): the
 *    content_drafts table. Needed once the site is hosted, because a hosted
 *    server can't keep files it writes.
 */
export type DraftStatus = "draft" | "approved" | "rejected";
export type Draft = {
  id: string;
  keyword: string;
  status: DraftStatus;
  source: "ai" | "manual" | "outline";
  /** Who started it: the weekly schedule, or a person in the desk */
  createdBy?: "schedule" | "desk";
  createdAt: string;
  updatedAt: string;
  /** When it was first approved for publishing */
  publishedAt?: string;
  guide: Guide;
  /** Technical claims a reviewer must check against manufacturer datasheets */
  factCheck: string[];
  reviewNote?: string;
  /** Short log of what happened to this article (edits, AI revisions, status changes) */
  history?: { at: string; note: string }[];
};

export type Keyword = {
  keyword: string;
  intent: "informational" | "comparison" | "transactional" | "navigational";
  priority: 1 | 2 | 3;
  coveredBy?: string;
};

const ID = /^[a-z0-9-]{8,80}$/;

type ContentStore = {
  list(): Promise<Draft[]>;
  get(id: string): Promise<Draft | null>;
  save(d: Draft): Promise<void>;
};

/* --------------------------------- local -------------------------------- */

const root = () => path.join(/* turbopackIgnore: true */ process.cwd(), "content");
const draftsDir = () => path.join(root(), "drafts");

const localStore: ContentStore = {
  async list() {
    let names: string[] = [];
    try {
      names = (await readdir(draftsDir())).filter((n) => n.endsWith(".json"));
    } catch {
      return [];
    }
    const drafts = await Promise.all(names.map((n) => this.get(n.replace(/\.json$/, ""))));
    return drafts.filter((d): d is Draft => d !== null);
  },
  async get(id) {
    try {
      return JSON.parse(await readFile(path.join(draftsDir(), `${id}.json`), "utf8")) as Draft;
    } catch {
      return null;
    }
  },
  async save(d) {
    await mkdir(draftsDir(), { recursive: true });
    const file = path.join(draftsDir(), `${d.id}.json`);
    const tmp = `${file}.${Date.now()}.tmp`;
    await writeFile(tmp, JSON.stringify(d, null, 2) + "\n", "utf8");
    await rename(tmp, file);
  },
};

/* -------------------------------- Supabase ------------------------------- */

let client: SupabaseClient | null = null;
const db = () =>
  (client ??= createClient(config.storage.supabaseUrl, config.storage.supabaseKey, { auth: { persistSession: false, autoRefreshToken: false } }));

const supabaseStore: ContentStore = {
  async list() {
    const { data, error } = await db()
      .from("content_drafts")
      .select("data")
      .eq("site", config.siteId)
      .order("updated_at", { ascending: false })
      .limit(500)
      .returns<{ data: Draft }[]>();
    if (error) throw new Error(`Listing articles failed (${error.code ?? "unknown"})`);
    return (data ?? []).map((r) => r.data);
  },
  async get(id) {
    const { data, error } = await db().from("content_drafts").select("data").eq("id", id).eq("site", config.siteId).maybeSingle<{ data: Draft }>();
    if (error) throw new Error(`Reading article failed (${error.code ?? "unknown"})`);
    return data?.data ?? null;
  },
  async save(d) {
    const { error } = await db()
      .from("content_drafts")
      .upsert({ id: d.id, site: config.siteId, status: d.status, keyword: d.keyword, slug: d.guide.slug, updated_at: d.updatedAt, data: d });
    if (error) throw new Error(`Saving article failed (${error.code ?? "unknown"})`);
  },
};

const store = () => (config.storage.mode === "supabase" ? supabaseStore : localStore);

/* ---------------------------------- API ---------------------------------- */

export async function listDrafts(): Promise<Draft[]> {
  return (await store().list()).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getDraft(id: string): Promise<Draft | null> {
  if (!ID.test(id)) return null;
  return store().get(id);
}

export async function saveDraft(d: Draft) {
  if (!ID.test(d.id)) throw new Error("Invalid article id");
  await store().save(d);
}

export function newDraftId(slug: string) {
  return `${slug.slice(0, 60)}-${randomUUID().slice(0, 6)}`.replace(/[^a-z0-9-]/g, "");
}

export async function listKeywords(): Promise<Keyword[]> {
  try {
    return JSON.parse(await readFile(path.join(root(), "keywords.json"), "utf8")) as Keyword[];
  } catch {
    return [];
  }
}

/** Outline placeholders left by the no-AI fallback; an article with these can't be approved. */
export const hasPlaceholders = (g: Guide) => JSON.stringify(g).includes("[Write");

/** Approved articles that are safe to show: no unfinished outline placeholders. */
export function isPublishable(d: Draft) {
  return d.status === "approved" && !hasPlaceholders(d.guide);
}

export function withHistory(d: Draft, note: string): Draft {
  const at = new Date().toISOString();
  return { ...d, updatedAt: at, history: [...(d.history ?? []), { at, note }].slice(-50) };
}
