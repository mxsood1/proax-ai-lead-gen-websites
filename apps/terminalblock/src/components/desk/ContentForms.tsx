"use client";

import Link from "next/link";
import { useActionState } from "react";
import { reviseDraftAction, runNextArticle, saveDraftEdits } from "@/app/desk/actions";

const field = "w-full rounded-lg bg-paper px-3 py-2 shadow-[inset_0_0_0_1px_var(--color-line)] focus:shadow-[inset_0_0_0_1px_var(--color-ink)] focus:outline-none";

/** Runs the same job as the weekly schedule, on demand. */
export function NextArticleButton({ disabled, label }: { disabled?: boolean; label: string }) {
  const [state, action, pending] = useActionState(runNextArticle, null);
  return (
    <form action={action}>
      <button
        disabled={disabled || pending}
        className="h-10 rounded-lg bg-ink px-4 text-sm font-medium text-[#efe9de] transition-colors hover:bg-ink-3 disabled:opacity-50"
      >
        {pending ? "Writing… (can take a minute or two)" : label}
      </button>
      {state?.status === "created" && (
        <p className="mt-3 text-sm text-ok">
          Created{" "}
          <Link href={`/desk/content/${state.draft.id}`} className="underline">
            {state.draft.title}
          </Link>
          . Review notice: {state.notice}.
        </p>
      )}
      {state && state.status !== "created" && <p className="mt-3 text-sm text-ink-4">{state.reason}</p>}
    </form>
  );
}

export function ReviseForm({ id }: { id: string }) {
  const [state, action, pending] = useActionState(reviseDraftAction, null);
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="id" value={id} />
      <textarea
        name="instruction"
        rows={3}
        required
        minLength={5}
        maxLength={2000}
        placeholder="What should change? e.g. The 5 × 20 mm fuse section should say to check the holder's maximum rating; shorten the intro"
        className={`${field} text-sm`}
      />
      <button disabled={pending} className="h-9 rounded-lg px-4 text-sm font-medium shadow-[inset_0_0_0_1px_var(--color-line)] hover:bg-paper-2 disabled:opacity-60">
        {pending ? "Revising… (can take a minute)" : "Revise with AI"}
      </button>
      {state?.error && <p className="text-sm text-bad">{state.error}</p>}
      {state?.ok && <p className="text-sm text-ok">Revised. Read it again before approving.</p>}
    </form>
  );
}

type EditValues = {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  category: string;
  readMinutes: number;
  takeaways: string;
  body: string;
  faqs: string;
  related: string[];
};

export function EditForm({ v, types }: { v: EditValues; types: { slug: string; name: string }[] }) {
  const [state, action, pending] = useActionState(saveDraftEdits, null);
  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="id" value={v.id} />
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm sm:col-span-2">
          <span className="font-medium">Title</span> <span className="text-steel">(shown in search results; keep under 70 characters)</span>
          <input name="title" defaultValue={v.title} required maxLength={120} className={`${field} mt-1.5`} />
        </label>
        <label className="block text-sm">
          <span className="font-medium">Short title</span> <span className="text-steel">(menus and cards)</span>
          <input name="shortTitle" defaultValue={v.shortTitle} required maxLength={60} className={`${field} mt-1.5`} />
        </label>
        <div className="grid grid-cols-2 gap-4">
          <label className="block text-sm">
            <span className="font-medium">Category</span>
            <select name="category" defaultValue={v.category} className={`${field} mt-1.5`}>
              <option>Selection</option>
              <option>Sizing</option>
              <option>Checklist</option>
            </select>
          </label>
          <label className="block text-sm">
            <span className="font-medium">Minutes to read</span>
            <input name="readMinutes" type="number" min={1} max={20} defaultValue={v.readMinutes} className={`${field} mt-1.5`} />
          </label>
        </div>
        <label className="block text-sm sm:col-span-2">
          <span className="font-medium">Description</span> <span className="text-steel">(one sentence under 160 characters)</span>
          <textarea name="description" defaultValue={v.description} required maxLength={300} rows={2} className={`${field} mt-1.5`} />
        </label>
      </div>

      <label className="block text-sm">
        <span className="font-medium">Key takeaways</span> <span className="text-steel">(one per line)</span>
        <textarea name="takeaways" defaultValue={v.takeaways} rows={4} className={`${field} mt-1.5`} />
      </label>

      <label className="block text-sm">
        <span className="font-medium">Article</span>
        <span className="mt-1 block text-xs text-steel">
          <code>## Heading</code>, <code>### Subheading</code>, <code>- list item</code>, <code>&gt; **Tip title** tip text</code>, tables as{" "}
          <code>| a | b |</code> rows. Leave a blank line between paragraphs.
        </span>
        <textarea name="body" defaultValue={v.body} required rows={24} className={`${field} mt-1.5 font-mono text-[13px] leading-relaxed`} />
      </label>

      <label className="block text-sm">
        <span className="font-medium">FAQs</span> <span className="text-steel">(a line starting Q: then a line starting A:)</span>
        <textarea name="faqs" defaultValue={v.faqs} rows={8} className={`${field} mt-1.5 text-[13px]`} />
      </label>

      <fieldset className="text-sm">
        <legend className="font-medium">
          Related product types <span className="font-normal text-steel">(up to 3, linked from the article)</span>
        </legend>
        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2">
          {types.map((t) => (
            <label key={t.slug} className="inline-flex items-center gap-2">
              <input type="checkbox" name="related" value={t.slug} defaultChecked={v.related.includes(t.slug)} className="h-4 w-4 accent-[var(--color-ink)]" />
              {t.name}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex items-center gap-3 border-t border-line pt-5">
        <button disabled={pending} className="h-10 rounded-lg bg-ink px-5 text-sm font-medium text-[#efe9de] hover:bg-ink-3 disabled:opacity-60">
          {pending ? "Saving…" : "Save changes"}
        </button>
        <Link href={`/desk/content/${v.id}`} className="text-sm text-ink-4 hover:text-ink">
          Cancel
        </Link>
        {state?.error && <p className="text-sm text-bad">{state.error}</p>}
      </div>
    </form>
  );
}
