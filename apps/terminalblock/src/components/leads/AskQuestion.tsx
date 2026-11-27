"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { site } from "@/config/site";
import { cn } from "@/lib/cn";
import { ROLES } from "@/lib/lead-roles";

const inputCls =
  "w-full rounded-lg bg-paper px-3 text-[15px] text-ink shadow-[inset_0_0_0_1px_var(--color-line)] transition-shadow placeholder:text-steel focus:shadow-[inset_0_0_0_1px_var(--color-ink)] focus:outline-none";

/**
 * "Ask us your question": the site's lead form. A person reads and answers each one.
 * `variant="band"` closes every page; on the guides section the form sits at the top instead
 * (`variant="panel"`), as agreed on the call, so the band hides itself there. `compact` fits a sidebar.
 */
export function AskQuestion({ variant = "band", topic }: { variant?: "band" | "compact" | "panel"; topic?: string }) {
  const pathname = usePathname();
  const [question, setQuestion] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [consent, setConsent] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [website, setWebsite] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const startedAt = useRef(0);
  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const local: string[] = [];
    if (question.trim().length < 15) local.push("Please add a little more detail to your question.");
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) local.push("Enter a valid email address.");
    if (!consent) local.push("Please agree so we can reply to you.");
    setErrors(local);
    if (local.length) return;
    setSending(true);
    try {
      const res = await fetch("/api/question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, email, name, company, role, page: pathname, consent, marketingOptIn: marketing, website, startedAt: startedAt.current }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; errors?: string[] };
      if (!res.ok || !data.ok) {
        setErrors(data.errors ?? ["Something went wrong. Please try again."]);
        return;
      }
      setSent(true);
    } catch {
      setErrors(["Couldn't reach the server. Check your connection and try again."]);
    } finally {
      setSending(false);
    }
  }

  const compact = variant === "compact";
  const done = (
    <div className="rounded-xl bg-paper-2/70 p-5" role="status">
      <div className="flex items-center gap-2 font-medium text-ink">
        <Check className="h-4 w-4 text-ok" /> Thanks, your question is in
      </div>
      <p className="mt-1 text-sm text-ink-4">A person will read it and reply by email.</p>
    </div>
  );

  const form = (
    <form onSubmit={submit} noValidate className="space-y-3">
      <label className="block">
        <span className="sr-only">Your question</span>
        <textarea
          className={cn(inputCls, "min-h-28 py-2.5 leading-relaxed")}
          rows={compact ? 4 : 5}
          maxLength={3000}
          placeholder={topic ? `Your question about ${topic.toLowerCase()}` : "Your question, e.g. which push-in block replaces a discontinued screw block?"}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
      </label>
      <div className={cn("grid gap-3", !compact && "sm:grid-cols-2")}>
        <input className={cn(inputCls, "h-10")} type="email" autoComplete="email" placeholder="Email *" value={email} onChange={(e) => setEmail(e.target.value)} aria-label="Email" />
        <input className={cn(inputCls, "h-10")} autoComplete="name" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} aria-label="Name" />
        {!compact && (
          <>
            <input className={cn(inputCls, "h-10")} autoComplete="organization" placeholder="Company" value={company} onChange={(e) => setCompany(e.target.value)} aria-label="Company" />
            <select className={cn(inputCls, "h-10", !role && "text-steel")} value={role} onChange={(e) => setRole(e.target.value)} aria-label="Your role">
              <option value="">Your role (optional)</option>
              {ROLES.map((r) => (
                <option key={r} value={r} className="text-ink">
                  {r}
                </option>
              ))}
            </select>
          </>
        )}
      </div>
      {/* honeypot: hidden from people, bots fill it in */}
      <label className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
        Website
        <input type="text" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
      </label>
      <label className="flex cursor-pointer items-start gap-2.5 text-[13px] leading-snug text-ink-3">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-signal)]" />
        <span>
          {site.name} may email me a reply to this question. <span className="text-steel">*</span>
        </span>
      </label>
      <label className="flex cursor-pointer items-start gap-2.5 text-[13px] leading-snug text-ink-4">
        <input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-signal)]" />
        <span>Also send me new comparisons and guides. Unsubscribe anytime.</span>
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
        className={cn(
          "inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-signal px-5 font-medium text-white transition-[background-color,transform] hover:bg-signal-dark active:scale-[0.98] disabled:opacity-60",
          compact ? "w-full" : "w-full sm:w-auto",
        )}
      >
        {sending ? "Sending…" : "Ask your question"} <ArrowRight className="h-4 w-4" />
      </button>
      <p className="text-xs text-steel">We only use your details to answer you. See our privacy policy.</p>
    </form>
  );

  if (compact) {
    return (
      <div className="rounded-2xl bg-paper p-6 shadow-[inset_0_0_0_1px_var(--color-line)]">
        <h2 className="text-lg font-medium leading-snug">Question about this?</h2>
        <p className="mt-1.5 text-sm text-ink-4">Ask us. A person who knows terminal blocks will reply.</p>
        <div className="mt-4">{sent ? done : form}</div>
      </div>
    );
  }

  if (variant === "panel") {
    return (
      <section id="ask" className="scroll-mt-24 rounded-2xl bg-paper-2/60 p-6 shadow-[inset_0_0_0_1px_var(--color-line)] sm:p-8" aria-labelledby="ask-heading">
        <div className="grid gap-6 md:grid-cols-[0.8fr_1.2fr] md:gap-8">
          <div>
            <h2 id="ask-heading" className="text-xl font-medium leading-snug">
              {topic ? `Question about ${topic.toLowerCase()}?` : "Ask us your question"}
            </h2>
            <p className="mt-2 text-[15px] leading-relaxed text-ink-4">
              Not sure which brand or block fits, or looking for an equivalent? A person who works with terminal blocks will reply by email.
            </p>
          </div>
          <div>{sent ? done : form}</div>
        </div>
      </section>
    );
  }

  // The guides section has the form at the top, so it isn't repeated at the bottom there
  if (pathname?.startsWith("/guides")) return null;

  return (
    <section id="ask" className="scroll-mt-20 border-t border-line bg-paper-2/60 py-16 sm:py-20" aria-labelledby="ask-heading">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div>
          <h2 id="ask-heading" className="text-balance text-[28px] font-medium leading-tight sm:text-[34px]">
            Ask us your question
          </h2>
          <p className="mt-4 max-w-md text-lg leading-relaxed text-ink-4">
            Not sure which brand or block fits? Looking for an equivalent? Send your question and a person who works with terminal blocks will reply by
            email.
          </p>
          <ul className="mt-6 space-y-2 text-[15px] text-ink-3">
            <li>Brand and part comparisons</li>
            <li>Replacements for discontinued blocks</li>
            <li>Sizing, approvals and accessories</li>
          </ul>
        </div>
        <div className="rounded-2xl bg-paper p-6 shadow-[inset_0_0_0_1px_var(--color-line)] sm:p-8">{sent ? done : form}</div>
      </div>
    </section>
  );
}
