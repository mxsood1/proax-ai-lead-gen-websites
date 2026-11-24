"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Minus, Plus } from "lucide-react";

/** Quantity + "Get a quote" for one part. Pre-fills the RFQ form with the part, manufacturer and quantity. */
export function PartQuote({ partNumber, manufacturer }: { partNumber: string; manufacturer: string }) {
  const [qty, setQty] = useState(1);
  const clamp = (n: number) => Math.max(1, Math.min(9_999_999, Math.round(n) || 1));
  const set = (n: number) => setQty(clamp(n));
  const step = (d: number) => setQty((q) => clamp(q + d)); // functional update so quick taps all count
  const href = `/rfq?line=${encodeURIComponent(`${partNumber}|${manufacturer}|${qty}`)}`;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex h-12 items-center rounded-lg bg-paper shadow-[inset_0_0_0_1px_var(--color-line)]">
        <button type="button" onClick={() => step(-1)} className="flex h-12 w-10 items-center justify-center text-ink-4 hover:text-ink" aria-label="Fewer">
          <Minus className="h-4 w-4" />
        </button>
        <input
          inputMode="numeric"
          value={qty}
          onChange={(e) => set(Number(e.target.value.replace(/\D/g, "")))}
          className="h-12 w-16 bg-transparent text-center font-mono tabular-nums focus:outline-none"
          aria-label="Quantity"
        />
        <button type="button" onClick={() => step(1)} className="flex h-12 w-10 items-center justify-center text-ink-4 hover:text-ink" aria-label="More">
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <Link
        href={href}
        className="inline-flex h-12 items-center gap-2 rounded-lg bg-signal px-6 font-medium text-white transition-[background-color,transform] hover:bg-signal-dark active:scale-[0.98]"
      >
        Get a quote <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
