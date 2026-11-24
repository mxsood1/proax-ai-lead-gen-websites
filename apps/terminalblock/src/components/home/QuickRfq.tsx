"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Paperclip } from "lucide-react";
import Link from "next/link";

export function QuickRfq() {
  const router = useRouter();
  const [q, setQ] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    router.push(q.trim() ? `/rfq?q=${encodeURIComponent(q.trim())}` : "/rfq");
  }

  return (
    <div className="w-full max-w-xl">
      <form
        onSubmit={submit}
        className="flex items-stretch gap-1 rounded-xl bg-ink-3 p-1 shadow-[inset_0_0_0_1px_rgba(239,233,222,0.1)] transition-shadow focus-within:shadow-[inset_0_0_0_1px_rgba(239,233,222,0.35)]"
      >
        <label htmlFor="quick-rfq" className="sr-only">
          Part number or description
        </label>
        <input
          id="quick-rfq"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Part number or description"
          className="h-12 min-w-0 flex-1 bg-transparent px-4 font-mono text-[15px] text-[#efe9de] placeholder:text-[#8a847a] focus:outline-none"
          autoComplete="off"
        />
        <button
          type="submit"
          className="inline-flex h-12 shrink-0 items-center gap-2 rounded-lg bg-signal px-5 font-medium text-white transition-[background-color,transform] duration-150 hover:bg-signal-dark active:scale-[0.98]"
        >
          <span className="hidden sm:inline">Start RFQ</span>
          <ArrowRight className="h-[18px] w-[18px]" />
        </button>
      </form>
      <Link href="/rfq#bom" className="mt-4 inline-flex items-center gap-2 text-sm text-[#aaa398] transition-colors hover:text-[#efe9de]">
        <Paperclip className="h-4 w-4" /> Or upload a BOM
      </Link>
    </div>
  );
}
