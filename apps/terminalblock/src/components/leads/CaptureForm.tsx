"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { site } from "@/config/site";
import { cn } from "@/lib/cn";
import { ROLES as ROLE_OPTIONS } from "@/lib/lead-roles";


const inputCls =
  "h-10 w-full rounded-lg bg-paper px-3 text-[15px] shadow-[inset_0_0_0_1px_var(--color-line)] transition-shadow placeholder:text-steel focus:shadow-[inset_0_0_0_1px_var(--color-ink)] focus:outline-none";

type Props = {
  endpoint: string;
  /** Extra fields sent with the form (for example the selected parts) */
  extra?: Record<string, unknown>;
  submitLabel: string;
  /** What the visitor agrees to receive, e.g. "the guide" or "this list" */
  what: string;
  onSuccess: (data: Record<string, unknown>) => void;
  compact?: boolean;
  /** Company is required by default; optional for the comparison PDF */
  requireCompany?: boolean;
};

/** Email capture used by the guide download and "Email me this list". Consent is explicit; updates opt-in is separate and unticked (CASL). */
export function CaptureForm({ endpoint, extra, submitLabel, what, onSuccess, compact, requireCompany = true }: Props) {
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [consent, setConsent] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [website, setWebsite] = useState("");
  const [sending, setSending] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const startedAt = useRef(0);
  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const local: string[] = [];
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) local.push("Enter a valid email address.");
    if (requireCompany && company.trim().length < 2) local.push("Company is required.");
    if (!consent) local.push(`Please agree so we can send you ${what}.`);
    setErrors(local);
    if (local.length) return;
    setSending(true);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, company, name, role, consent, marketingOptIn: marketing, website, startedAt: startedAt.current, ...extra }),
      });
      const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
      if (!res.ok || !data.ok) {
        setErrors((data.errors as string[]) ?? ["Something went wrong. Please try again."]);
        return;
      }
      onSuccess(data);
    } catch {
      setErrors(["Couldn't reach the server. Check your connection and try again."]);
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-3">
      <div className={cn("grid gap-3", !compact && "sm:grid-cols-2")}>
        <input className={inputCls} type="email" autoComplete="email" placeholder="Work email *" value={email} onChange={(e) => setEmail(e.target.value)} aria-label="Work email" />
        <input className={inputCls} autoComplete="organization" placeholder={requireCompany ? "Company *" : "Company"} value={company} onChange={(e) => setCompany(e.target.value)} aria-label="Company" />
        {!compact && <input className={inputCls} autoComplete="name" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} aria-label="Name" />}
        <select className={cn(inputCls, !role && "text-steel")} value={role} onChange={(e) => setRole(e.target.value)} aria-label="Your role">
          <option value="">Your role (optional)</option>
          {ROLE_OPTIONS.map((r) => (
            <option key={r} value={r} className="text-ink">
              {r}
            </option>
          ))}
        </select>
      </div>
      {/* honeypot: hidden from people, bots fill it in */}
      <label className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
        Website
        <input type="text" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
      </label>
      <label className="flex cursor-pointer items-start gap-2.5 text-[13px] leading-snug text-ink-3">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-signal)]" />
        <span>
          Email me {what}. {site.name} may follow up about it. <span className="text-steel">*</span>
        </span>
      </label>
      <label className="flex cursor-pointer items-start gap-2.5 text-[13px] leading-snug text-ink-4">
        <input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-signal)]" />
        <span>Also send me occasional product updates. Unsubscribe anytime.</span>
      </label>
      {errors.length > 0 && (
        <div className="rounded-lg bg-bad/5 p-3 text-sm text-bad shadow-[inset_0_0_0_1px_rgb(220_38_38/0.25)]" role="alert">
          {errors.map((e) => (
            <div key={e}>{e}</div>
          ))}
        </div>
      )}
      <button
        type="submit"
        disabled={sending}
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-signal px-5 font-medium text-white transition-[background-color,transform] hover:bg-signal-dark active:scale-[0.98] disabled:opacity-60 sm:w-auto"
      >
        {sending ? "Sending…" : submitLabel} <ArrowRight className="h-4 w-4" />
      </button>
      <p className="text-xs text-steel">We use your details only for this request. See our privacy policy.</p>
    </form>
  );
}
