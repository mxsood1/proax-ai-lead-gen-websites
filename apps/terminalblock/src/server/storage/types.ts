import type { Lead, LeadFile, LeadSummary } from "@/server/leads/types";

export type IncomingFile = { name: string; type: string; bytes: Uint8Array };

export interface LeadStore {
  readonly kind: "local" | "supabase";
  create(lead: Lead): Promise<void>;
  get(id: string): Promise<Lead | null>;
  list(): Promise<LeadSummary[]>;
  /** Read-modify-write. Returns the updated lead, or null if it doesn't exist. */
  update(id: string, change: (lead: Lead) => Lead): Promise<Lead | null>;
  saveFile(leadId: string, file: IncomingFile): Promise<LeadFile>;
  readFile(file: LeadFile): Promise<Uint8Array | null>;
}
