import "server-only";
import os from "node:os";
import path from "node:path";

/**
 * Runtime switches. Every external integration is OFF unless explicitly
 * configured, so a local run never contacts anyone:
 *  - Storage:  local files in .data/ unless SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY are set.
 *  - Email:    written to .data/outbox/ unless EMAIL_DELIVERY=on AND Resend settings are set.
 *  - AI:       disabled unless ANTHROPIC_API_KEY is set (or AI_ENABLED=on with another credential).
 *  - Content:  approved drafts are only shown on the site when CONTENT_PUBLISHING=on.
 */
const env = (k: string) => (process.env[k] ?? "").trim();

export const config = {
  siteId: env("SITE_ID") || "terminalblock",
  // On Vercel the app folder is read-only: without Supabase, local storage falls back to the temporary
  // folder so forms still work on a preview. Those records are NOT kept long-term (connect Supabase for that).
  dataDir: process.env.VERCEL ? path.join(os.tmpdir(), "terminalblock-data") : path.join(/* turbopackIgnore: true */ process.cwd(), ".data"),

  storage: {
    mode: env("SUPABASE_URL") && env("SUPABASE_SERVICE_ROLE_KEY") ? ("supabase" as const) : ("local" as const),
    supabaseUrl: env("SUPABASE_URL"),
    supabaseKey: env("SUPABASE_SERVICE_ROLE_KEY"),
    bucket: env("SUPABASE_BUCKET") || "rfq-files",
  },

  email: {
    deliver:
      env("EMAIL_DELIVERY") === "on" && Boolean(env("RESEND_API_KEY") && env("LEAD_ALERT_TO") && env("LEAD_ALERT_FROM")),
    resendKey: env("RESEND_API_KEY"),
    to: env("LEAD_ALERT_TO")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    from: env("LEAD_ALERT_FROM"),
  },

  ai: {
    enabled: Boolean(env("ANTHROPIC_API_KEY")) || env("AI_ENABLED") === "on",
    model: "claude-opus-5-5",
  },

  desk: {
    password: env("DESK_PASSWORD"),
    secret: env("DESK_SECRET"),
    get enabled() {
      return this.password.length >= 12 && this.secret.length >= 32;
    },
  },

  content: {
    publishing: env("CONTENT_PUBLISHING") === "on",
    /** Shared secret the scheduler sends; the cron route is disabled without it */
    cronSecret: env("CRON_SECRET"),
    /** The weekly job pauses while this many articles are waiting for review */
    maxWaiting: Math.max(1, Math.min(20, Number(env("CONTENT_MAX_WAITING")) || 4)),
  },

  uploads: {
    maxFiles: 10,
    maxFileBytes: 10 * 1024 * 1024,
    maxTotalBytes: 25 * 1024 * 1024,
    extensions: [".xlsx", ".xls", ".csv", ".tsv", ".pdf", ".jpg", ".jpeg", ".png", ".webp", ".heic"],
  },
} as const;

export function integrationStatus() {
  return {
    storage: config.storage.mode,
    email: config.email.deliver ? "delivering" : "outbox (local files)",
    ai: config.ai.enabled ? "on" : "off",
    publishing: config.content.publishing ? "on" : "off",
  };
}
