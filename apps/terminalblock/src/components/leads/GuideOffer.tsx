"use client";

import { useState } from "react";
import { Check, Download, FileText } from "lucide-react";
import { CaptureForm } from "./CaptureForm";
import { cn } from "@/lib/cn";

const INSIDE = ["AWG to mm² chart with typical block sizes", "Push-in vs spring vs screw at a glance", "Tick-box BOM checklist: blocks, accessories, rail, ferrules"];

/**
 * The downloadable guide (lead magnet). `variant="banner"` for the guides page and homepage,
 * `variant="aside"` for the sidebar of an article.
 */
export function GuideOffer({ variant = "banner" }: { variant?: "banner" | "aside" }) {
  const [done, setDone] = useState(false);

  function onSuccess(data: Record<string, unknown>) {
    setDone(true);
    if (typeof data.url === "string" && data.url.startsWith("/api/guide/file")) window.location.href = data.url;
  }

  const success = (
    <div className="rounded-xl bg-paper-2/70 p-4 text-sm" role="status">
      <div className="flex items-center gap-2 font-medium">
        <Check className="h-4 w-4 text-ok" /> Your download has started
      </div>
      <p className="mt-1 text-ink-4">We&apos;ve also emailed you a link that works for 7 days.</p>
    </div>
  );

  if (variant === "aside") {
    return (
      <div className="rounded-2xl bg-paper p-6 shadow-[inset_0_0_0_1px_var(--color-line)]">
        <div className="flex items-center gap-2 text-sm text-steel">
          <FileText className="h-4 w-4" /> Free PDF · 2 pages
        </div>
        <h3 className="mt-2 text-lg font-medium leading-snug">Terminal block selection &amp; BOM checklist</h3>
        <p className="mt-1.5 text-sm text-ink-4">Wire size chart, connection styles and a tick-box list so nothing is missing from your order.</p>
        <div className="mt-4">{done ? success : <CaptureForm endpoint="/api/guide" submitLabel="Email me the PDF" what="the guide" onSuccess={onSuccess} compact />}</div>
      </div>
    );
  }

  return (
    <section className={cn("rounded-3xl bg-paper p-6 shadow-[inset_0_0_0_1px_var(--color-line)] sm:p-10")} aria-labelledby="guide-offer">
      <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <div className="flex items-center gap-2 text-sm text-steel">
            <Download className="h-4 w-4" /> Free PDF · 2 pages
          </div>
          <h2 id="guide-offer" className="mt-2 text-balance text-[26px] font-medium leading-tight sm:text-[30px]">
            The terminal block selection &amp; BOM checklist
          </h2>
          <ul className="mt-4 space-y-2 text-ink-3">
            {INSIDE.map((t) => (
              <li key={t} className="flex gap-2.5 text-[15px]">
                <Check className="mt-1 h-4 w-4 shrink-0 text-steel" />
                {t}
              </li>
            ))}
          </ul>
        </div>
        <div>{done ? success : <CaptureForm endpoint="/api/guide" submitLabel="Email me the PDF" what="the guide" onSuccess={onSuccess} />}</div>
      </div>
    </section>
  );
}
