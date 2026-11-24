import "server-only";
import { config } from "@/server/config";
import { localStore } from "./local";
import { supabaseStore } from "./supabase";
import type { LeadStore } from "./types";

export function leadStore(): LeadStore {
  return config.storage.mode === "supabase" ? supabaseStore : localStore;
}
