"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Mail, X } from "lucide-react";
import { CaptureForm } from "./CaptureForm";

/** "Email me this list" for the Finder selection: saves the list as a lead and emails it to the visitor. */
export function EmailListDialog({ items, count }: { items: string[]; count: number }) {
  const [open, setOpen] = useState(false);
  const [ref, setRef] = useState<string | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setRef(null);
          setOpen(true);
        }}
        className="inline-flex h-11 shrink-0 items-center gap-2 rounded-lg px-3 font-medium text-[#efe9de] shadow-[inset_0_0_0_1px_rgba(239,233,222,0.25)] transition-colors hover:bg-white/10"
      >
        <Mail className="h-4 w-4" /> <span className="hidden sm:inline">Email me this list</span>
      </button>
      <dialog
        ref={dialog}
        onClose={() => setOpen(false)}
        className="m-auto w-[min(32rem,calc(100vw-2rem))] rounded-2xl bg-paper p-0 text-ink shadow-[0_20px_50px_rgba(27,25,21,0.25)] backdrop:bg-ink/40"
        aria-labelledby="email-list-title"
      >
        <div className="p-6 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id="email-list-title" className="text-xl font-medium">
                Email me this list
              </h2>
              <p className="mt-1 text-sm text-ink-4">
                {count} part{count === 1 ? "" : "s"} with descriptions, plus a link to get them quoted when you&apos;re ready.
              </p>
            </div>
            <button type="button" onClick={() => setOpen(false)} className="rounded-lg p-1.5 text-ink-4 hover:bg-paper-2 hover:text-ink" aria-label="Close">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-5">
            {ref ? (
              <div className="rounded-xl bg-paper-2/70 p-4 text-sm" role="status">
                <div className="flex items-center gap-2 font-medium">
                  <Check className="h-4 w-4 text-ok" /> Sent. Check your inbox
                </div>
                <p className="mt-1 text-ink-4">Your list is saved as {ref}. Reply to that email or use its link when you want a quote.</p>
              </div>
            ) : (
              <CaptureForm
                endpoint="/api/list"
                extra={{ items }}
                submitLabel="Email me the list"
                what="this list"
                onSuccess={(d) => setRef(typeof d.ref === "string" ? d.ref : "your list")}
                compact
              />
            )}
          </div>
        </div>
      </dialog>
    </>
  );
}
