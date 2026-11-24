import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { config } from "@/server/config";
import { summarize, type Lead, type LeadFile } from "@/server/leads/types";
import { newId, safeFileName } from "@/server/rfq/ref";
import type { IncomingFile, LeadStore } from "./types";

/**
 * Production store. Requires the migration in supabase/migrations and the
 * service-role key (server-side only — never exposed to the browser).
 * Only active when SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.
 */
let client: SupabaseClient | null = null;
function db() {
  client ??= createClient(config.storage.supabaseUrl, config.storage.supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}

type Row = { id: string; ref: string; site: string; status: string; created_at: string; data: Lead };

export const supabaseStore: LeadStore = {
  kind: "supabase",

  async create(lead) {
    const { error } = await db()
      .from("leads")
      .insert({ id: lead.id, ref: lead.ref, site: lead.site, status: lead.status, created_at: lead.createdAt, data: lead });
    if (error) throw new Error(`Saving lead failed (${error.code ?? "unknown"})`);
  },

  async get(id) {
    const { data, error } = await db().from("leads").select("data").eq("id", id).maybeSingle<Pick<Row, "data">>();
    if (error) throw new Error(`Reading lead failed (${error.code ?? "unknown"})`);
    return data?.data ?? null;
  },

  async list() {
    const { data, error } = await db()
      .from("leads")
      .select("data")
      .order("created_at", { ascending: false })
      .limit(500)
      .returns<Pick<Row, "data">[]>();
    if (error) throw new Error(`Listing leads failed (${error.code ?? "unknown"})`);
    return (data ?? []).map((r) => summarize(r.data));
  },

  async update(id, change) {
    const current = await this.get(id);
    if (!current) return null;
    const next = change(current);
    const { error } = await db().from("leads").update({ status: next.status, data: next }).eq("id", id);
    if (error) throw new Error(`Updating lead failed (${error.code ?? "unknown"})`);
    return next;
  },

  async saveFile(leadId, file: IncomingFile): Promise<LeadFile> {
    const id = newId();
    const key = `${leadId}/${id}-${safeFileName(file.name)}`;
    const { error } = await db()
      .storage.from(config.storage.bucket)
      .upload(key, file.bytes, { contentType: file.type || "application/octet-stream", upsert: false });
    if (error) throw new Error("Uploading file failed");
    return { id, name: file.name.slice(0, 200), size: file.bytes.byteLength, type: file.type || "application/octet-stream", key };
  },

  async readFile(file) {
    const { data, error } = await db().storage.from(config.storage.bucket).download(file.key);
    if (error || !data) return null;
    return new Uint8Array(await data.arrayBuffer());
  },
};
