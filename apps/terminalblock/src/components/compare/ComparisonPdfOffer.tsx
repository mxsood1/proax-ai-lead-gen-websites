"use client";

import { useState } from "react";
import { Check, FileText } from "lucide-react";
import { CaptureForm } from "@/components/leads/CaptureForm";

/** "Email me this comparison (PDF)": the lead form on each brand-vs-brand page. */
export function ComparisonPdfOffer({ pair, title }: { pair: string; title: string }) {
  const [done, setDone] = useState(false);

  function onSuccess(data: Record<string, unknown>) {
    setDone(true);
    if (typeof data.url === "string" && data.url.startsWith("/api/compare-pdf/file")) window.location.href = data.url;
  }

  return (
    <section className="rounded-3xl bg-paper p-6 shadow-[inset_0_0_0_1px_var(--color-line)] sm:p-10" aria-labelledby="comparison-pdf">
      <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <div className="flex items-center gap-2 text-sm text-steel">
            <FileText className="h-4 w-4" /> Free PDF
          </div>
          <h2 id="comparison-pdf" className="mt-2 text-balance text-[26px] font-medium leading-tight sm:text-[30px]">
            Take this comparison with you
          </h2>
          <p className="mt-3 text-ink-4">
            Get {title} as a PDF: the full table, the similar parts side by side and the datasheet sources. Handy for a design review or to share with
            your team.
          </p>
        </div>
        <div>
          {done ? (
            <div className="rounded-xl bg-paper-2/70 p-4 text-sm" role="status">
              <div className="flex items-center gap-2 font-medium">
                <Check className="h-4 w-4 text-ok" /> Your download has started
              </div>
              <p className="mt-1 text-ink-4">We&apos;ve also emailed you a link that works for 7 days.</p>
            </div>
          ) : (
            <CaptureForm endpoint="/api/compare-pdf" extra={{ pair }} submitLabel="Email me the PDF" what="this comparison" onSuccess={onSuccess} requireCompany={false} />
          )}
        </div>
      </div>
    </section>
  );
}
