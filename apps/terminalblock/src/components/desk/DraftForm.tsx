"use client";

import { useActionState } from "react";
import { createContentDraft } from "@/app/desk/actions";

export function DraftForm({ keyword, compact }: { keyword?: string; compact?: boolean }) {
  const [state, action, pending] = useActionState(createContentDraft, null);
  if (compact && keyword) {
    return (
      <form action={action} className="inline-flex flex-col items-end">
        <input type="hidden" name="keyword" value={keyword} />
        <button disabled={pending} className="h-8 rounded-lg px-3 text-sm font-medium shadow-[inset_0_0_0_1px_var(--color-line)] transition-colors hover:bg-paper-2 disabled:opacity-60">
          {pending ? "Drafting…" : "Draft"}
        </button>
        {state?.error && <span className="mt-1 max-w-56 text-right text-xs text-bad">{state.error}</span>}
      </form>
    );
  }
  return (
    <form action={action} className="flex flex-col gap-2 sm:flex-row">
      <input
        name="keyword"
        required
        minLength={4}
        maxLength={120}
        placeholder="Topic or search query, e.g. terminal block wire size chart"
        className="h-11 flex-1 rounded-lg bg-paper px-3 shadow-[inset_0_0_0_1px_var(--color-line)] focus:shadow-[inset_0_0_0_1px_var(--color-ink)] focus:outline-none"
      />
      <button disabled={pending} className="h-11 rounded-lg bg-ink px-5 font-medium text-[#efe9de] transition-colors hover:bg-ink-3 disabled:opacity-60">
        {pending ? "Drafting…" : "Create draft"}
      </button>
      {state?.error && <p className="text-sm text-bad sm:basis-full">{state.error}</p>}
    </form>
  );
}
