"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight } from "lucide-react";

type Group = { label: string; options: { slug: string; name: string }[] };

const selectCls =
  "h-12 w-full rounded-lg bg-paper px-3 text-[15px] text-ink shadow-[inset_0_0_0_1px_var(--color-line)] focus:shadow-[inset_0_0_0_1px_var(--color-ink)] focus:outline-none";

function Options({ groups }: { groups: Group[] }) {
  return (
    <>
      {groups.map((g) => (
        <optgroup key={g.label} label={g.label}>
          {g.options.map((o) => (
            <option key={o.slug} value={o.slug}>
              {o.name}
            </option>
          ))}
        </optgroup>
      ))}
    </>
  );
}

/** Pick two brands and open their side-by-side page. Every pair is pre-built, so this costs nothing to run. */
export function BrandPicker({ groups, a, b, tone = "dark" }: { groups: Group[]; a?: string; b?: string; tone?: "dark" | "light" }) {
  const router = useRouter();
  const all = groups.flatMap((g) => g.options);
  const [first, setFirst] = useState(a ?? all[0]?.slug ?? "");
  const [second, setSecond] = useState(b ?? all[1]?.slug ?? "");
  const same = first === second;

  function go(e: React.FormEvent) {
    e.preventDefault();
    if (same) return;
    router.push(`/compare/${[first, second].sort().join("-vs-")}`);
  }

  return (
    <form onSubmit={go} className="grid gap-3 sm:grid-cols-[1fr_auto_1fr_auto] sm:items-center">
      <label className="sr-only" htmlFor="brand-a">
        First brand
      </label>
      <select id="brand-a" className={selectCls} value={first} onChange={(e) => setFirst(e.target.value)}>
        <Options groups={groups} />
      </select>
      <span className={`text-center text-sm ${tone === "light" ? "text-[#aaa398]" : "text-steel"}`}>vs</span>
      <label className="sr-only" htmlFor="brand-b">
        Second brand
      </label>
      <select id="brand-b" className={selectCls} value={second} onChange={(e) => setSecond(e.target.value)}>
        <Options groups={groups} />
      </select>
      <button
        type="submit"
        disabled={same}
        className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-signal px-5 font-medium text-white transition-[background-color,transform] hover:bg-signal-dark active:scale-[0.98] disabled:opacity-50"
      >
        Compare <ArrowRight className="h-4 w-4" />
      </button>
      {same && <p className={`text-sm sm:col-span-4 ${tone === "light" ? "text-[#c9c2b6]" : "text-ink-4"}`}>Pick two different brands.</p>}
    </form>
  );
}
