"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ClipboardPaste,
  FileSpreadsheet,
  FileText,
  Image as ImageIcon,
  Lock,
  Paperclip,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { site } from "@/config/site";
import { TerminalModule } from "@/components/brand/TerminalModule";
import { cn } from "@/lib/cn";

type Line = { id: number; part: string; mfr: string; qty: string; notes: string };
type Step = 0 | 1 | 2;

const steps = [
  { code: "01", label: "Parts" },
  { code: "02", label: "Details" },
  { code: "03", label: "Contact" },
];

const urgencyOptions = ["Line down / ASAP", "Within 1 week", "2–4 weeks", "Budgetary quote"];
const equivOptions = ["Equivalents welcome", "Exact part only"];
const provinces = ["Ontario", "Quebec", "British Columbia", "Alberta", "Manitoba", "Saskatchewan", "Nova Scotia", "New Brunswick", "Newfoundland and Labrador", "Prince Edward Island", "Territories", "Outside Canada"];

let nextId = 1;
const blankLine = (part = "", mfr = "", qty = ""): Line => ({ id: nextId++, part, mfr, qty, notes: "" });

function parsePasted(text: string): Line[] {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const cells = l.split(/\t|;/).map((c) => c.trim());
      if (cells.length >= 2) {
        const qtyIdx = cells.findIndex((c) => /^\d+$/.test(c));
        const qty = qtyIdx >= 0 ? cells[qtyIdx] : "";
        const rest = cells.filter((_, i) => i !== qtyIdx);
        return blankLine(rest[0] ?? "", rest[1] ?? "", qty);
      }
      const m = l.match(/^(.*?)[\s,]+[x×]?\s*(\d+)\s*(pcs|pc|ea)?$/i);
      return m ? blankLine(m[1].trim(), "", m[2]) : blankLine(l);
    });
}

const isSpreadsheet = (name: string) => /\.(xlsx|csv|tsv)$/i.test(name);

/** Prefill from ?line=PN|MFR|QTY (finder, identifier, part pages; quantity optional) and ?q= (hero quick RFQ) */
function linesFromParams(params: URLSearchParams): Line[] {
  const q = params.get("q");
  const prefilled: Line[] = params
    .getAll("line")
    .slice(0, 50)
    .map((l) => {
      const [pn, mfr, qty] = l.split("|");
      return blankLine((pn ?? "").slice(0, 80), (mfr ?? "").slice(0, 60), /^\d{1,7}$/.test(qty ?? "") ? qty : "");
    })
    .filter((l) => l.part);
  if (q) prefilled.push(...parsePasted(q));
  return prefilled.length ? prefilled : [blankLine()];
}

function fileIcon(name: string) {
  if (/\.(xlsx?|csv)$/i.test(name)) return FileSpreadsheet;
  if (/\.(png|jpe?g|heic|webp)$/i.test(name)) return ImageIcon;
  return FileText;
}

const inputCls =
  "h-10 w-full rounded-lg bg-paper px-3 text-[15px] shadow-[inset_0_0_0_1px_var(--color-line)] transition-shadow placeholder:text-steel focus:shadow-[inset_0_0_0_1px_var(--color-ink)] focus:outline-none";

function Field({ label, required, children, hint }: { label: string; required?: boolean; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline justify-between">
        <span className="text-sm font-medium">
          {label} {required && <span className="text-steel">*</span>}
        </span>
        {hint && <span className="text-xs text-ink-4">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

function ChoiceChips({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(value === o ? "" : o)}
          aria-pressed={value === o}
          className={cn(
            "h-9 rounded-lg px-4 text-sm font-medium transition-colors",
            value === o ? "bg-ink text-[#efe9de]" : "bg-paper text-ink-4 shadow-[inset_0_0_0_1px_var(--color-line)] hover:text-ink",
          )}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

export function RfqForm() {
  const params = useSearchParams();
  const [step, setStep] = useState<Step>(0);
  const [lines, setLines] = useState<Line[]>(() => linesFromParams(new URLSearchParams(params.toString())));
  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [urgency, setUrgency] = useState("");
  const [equiv, setEquiv] = useState("Equivalents welcome");
  const [province, setProvince] = useState("");
  const [notes, setNotes] = useState("");
  const [contact, setContact] = useState({ name: "", company: "", email: "", phone: "" });
  const [consent, setConsent] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [bomNotes, setBomNotes] = useState<string[]>([]);
  const [website, setWebsite] = useState(""); // honeypot, hidden from people
  const startedAt = useRef(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  const filledLines = useMemo(() => lines.filter((l) => l.part.trim()), [lines]);

  function update(id: number, patch: Partial<Line>) {
    setLines((ls) => ls.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  }

  /** Spreadsheets are read on the server and their rows added as lines. */
  async function readBom(file: File) {
    const body = new FormData();
    body.append("file", file);
    try {
      const res = await fetch("/api/bom", { method: "POST", body });
      const data = (await res.json()) as {
        ok: boolean;
        error?: string;
        lines?: { part: string; manufacturer: string; qty: number | null; notes: string }[];
        warnings?: string[];
      };
      if (!data.ok || !data.lines) {
        setBomNotes((n) => [...n, `${file.name}: ${data.error ?? "couldn't be read"}. It's still attached for our team.`]);
        return;
      }
      const read = data.lines.map((l) => ({ ...blankLine(l.part, l.manufacturer, l.qty ? String(l.qty) : ""), notes: l.notes }));
      if (read.length) setLines((ls) => [...ls.filter((l) => l.part.trim()), ...read]);
      setBomNotes((n) => [
        ...n,
        `${file.name}: added ${read.length} line${read.length === 1 ? "" : "s"}${data.warnings?.length ? `. ${data.warnings.join(" ")}` : ""}`,
      ]);
    } catch {
      setBomNotes((n) => [...n, `${file.name}: couldn't be read automatically. It's still attached for our team.`]);
    }
  }

  function addFiles(list: FileList | null) {
    if (!list) return;
    const incoming = Array.from(list);
    setFiles((f) => [...f, ...incoming].slice(0, 10));
    incoming.filter((f) => isSpreadsheet(f.name)).forEach((f) => void readBom(f));
  }

  function validate(s: Step) {
    const e: string[] = [];
    if (s === 0 && filledLines.length === 0 && files.length === 0) e.push("Add at least one part number or upload a file.");
    if (s === 2) {
      if (!contact.name.trim()) e.push("Your name is required.");
      if (!contact.company.trim()) e.push("Company is required.");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) e.push("A valid email is required.");
      if (!consent) e.push("Please confirm we can contact you about this request.");
    }
    setErrors(e);
    return e.length === 0;
  }

  function go(to: Step) {
    if (to > step && !validate(step)) return;
    setErrors([]);
    setStep(to);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (sending || !validate(2)) return;
    setSending(true);
    setErrors([]);
    const payload = {
      lines: filledLines.map((l) => ({ part: l.part, manufacturer: l.mfr, qty: l.qty, notes: l.notes })),
      details: { urgency, equivalents: equiv, province, notes },
      contact: { ...contact, marketingOptIn: marketing, consent },
      website,
      startedAt: startedAt.current,
    };
    const body = new FormData();
    body.append("payload", JSON.stringify(payload));
    files.forEach((f) => body.append("files", f));
    try {
      const res = await fetch("/api/rfq", { method: "POST", body });
      const data = (await res.json()) as { ok: boolean; ref?: string; errors?: string[] };
      if (data.ok && data.ref) {
        setSubmitted(data.ref);
        topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        setErrors(data.errors?.length ? data.errors : ["Something went wrong. Please try again."]);
      }
    } catch {
      setErrors(["We couldn't reach the server. Check your connection and try again."]);
    } finally {
      setSending(false);
    }
  }

  if (submitted) {
    return (
      <div ref={topRef} className="mx-auto max-w-2xl scroll-mt-32">
        <div className="overflow-hidden rounded-2xl bg-paper shadow-[inset_0_0_0_1px_var(--color-line)]">
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <span className="marker">{submitted}</span>
              <span className="flex items-center gap-2 text-sm text-ok">
                <Check className="h-4 w-4" /> Received
              </span>
            </div>
            <h2 className="mt-6 text-[32px] font-medium leading-[1.1]">Your request is with the sourcing desk</h2>
            <p className="mt-3 max-w-md leading-relaxed text-ink-4">
              Thanks{contact.name ? `, ${contact.name.split(" ")[0]}` : ""}. We’ll reply to <span className="text-ink">{contact.email}</span> with the options we find.
            </p>
          </div>
          <div className="grid border-y border-line sm:grid-cols-3">
            {[
              { k: "Lines", v: String(filledLines.length) },
              { k: "Files", v: String(files.length) },
              { k: "Timing", v: urgency || "Not set" },
            ].map((s, i) => (
              <div key={s.k} className={i > 0 ? "border-line p-5 sm:border-l" : "p-5"}>
                <div className="text-xs text-steel">{s.k}</div>
                <div className="mt-1 font-medium tabular-nums">{s.v}</div>
              </div>
            ))}
          </div>
          <div className="p-6 sm:p-8">
            <h3 className="font-medium">What happens next</h3>
            <ol className="mt-4 space-y-3">
              {["We identify every line and check stock across suppliers", "Anything unclear or substituted is flagged for your approval", "You get one organized quote with price and lead time"].map((t, i) => (
                <li key={t} className="flex items-baseline gap-3">
                  <span className="font-mono text-xs tabular-nums text-steel">{`0${i + 1}`}</span>
                  <span className="text-ink-4">{t}</span>
                </li>
              ))}
            </ol>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/finder" className="inline-flex h-11 items-center rounded-lg bg-ink px-5 font-medium text-[#efe9de] transition-colors hover:bg-ink-3">
                Back to the finder
              </Link>
              <Link href="/guides" className="inline-flex h-11 items-center rounded-lg px-5 font-medium text-ink-4 transition-colors hover:text-ink">
                Read the guides
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={topRef} className="grid scroll-mt-32 gap-8 lg:grid-cols-[1fr_340px]">
      <form onSubmit={submit} className="rounded-2xl bg-paper shadow-[inset_0_0_0_1px_var(--color-line)]" noValidate>
        {/* stepper */}
        <div className="border-b border-line p-5 sm:px-8">
          <ol className="flex items-center gap-2">
            {steps.map((s, i) => {
              const done = i < step;
              const active = i === step;
              return (
                <li key={s.code} className="flex flex-1 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => (i < step ? go(i as Step) : undefined)}
                    className={cn("flex items-center gap-2.5", i < step ? "cursor-pointer" : "cursor-default")}
                  >
                    <span
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-lg font-mono text-xs tabular-nums transition-colors",
                        active ? "bg-ink text-[#efe9de]" : done ? "bg-paper-2 text-ink" : "text-steel shadow-[inset_0_0_0_1px_var(--color-line)]",
                      )}
                    >
                      {done ? <Check className="h-4 w-4" /> : s.code}
                    </span>
                    <span className={cn("hidden text-sm font-medium sm:inline", active ? "text-ink" : "text-ink-4")}>{s.label}</span>
                  </button>
                  {i < steps.length - 1 && (
                    <span className={cn("h-px flex-1", done ? "bg-ink" : "bg-line")} />
                  )}
                </li>
              );
            })}
          </ol>
        </div>

        <div className="p-5 sm:p-8">
          {step === 0 && (
            <div className="animate-fade-up">
              <h2 className="text-2xl font-medium">What do you need?</h2>
              <p className="mt-1 text-ink-4">Add part numbers line by line, paste a list from Excel, or upload your BOM.</p>

              <div className="mt-6 hidden grid-cols-[1.4fr_1fr_90px_36px] gap-2 px-1 text-xs text-steel sm:grid">
                <span>Part number / description</span>
                <span>Manufacturer</span>
                <span>Qty</span>
                <span />
              </div>
              <ul className="mt-2 space-y-2">
                {lines.map((l, i) => (
                  <li key={l.id} className="grid grid-cols-[1fr_90px_36px] gap-2 rounded-xl bg-paper-2/60 p-2 sm:grid-cols-[1.4fr_1fr_90px_36px] sm:bg-transparent sm:p-0">
                    <input
                      className={cn(inputCls, "col-span-3 font-mono sm:col-span-1")}
                      placeholder={i === 0 ? "e.g. PT 2,5 or grey push-in 2.5 mm²" : "Part number"}
                      value={l.part}
                      onChange={(e) => update(l.id, { part: e.target.value })}
                      aria-label={`Line ${i + 1} part number`}
                    />
                    <input className={inputCls} placeholder="Any" value={l.mfr} onChange={(e) => update(l.id, { mfr: e.target.value })} aria-label={`Line ${i + 1} manufacturer`} />
                    <input
                      className={cn(inputCls, "font-mono")}
                      placeholder="Qty"
                      inputMode="numeric"
                      value={l.qty}
                      onChange={(e) => update(l.id, { qty: e.target.value.replace(/[^\d]/g, "") })}
                      aria-label={`Line ${i + 1} quantity`}
                    />
                    <button
                      type="button"
                      onClick={() => setLines((ls) => (ls.length > 1 ? ls.filter((x) => x.id !== l.id) : [blankLine()]))}
                      className="flex items-center justify-center rounded-lg text-steel transition-colors hover:bg-paper-2 hover:text-bad"
                      aria-label={`Remove line ${i + 1}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" onClick={() => setLines((ls) => [...ls, blankLine()])} className="inline-flex h-9 items-center gap-2 rounded-lg bg-paper px-4 text-sm font-medium shadow-[inset_0_0_0_1px_var(--color-line)] transition-colors hover:bg-paper-2">
                  <Plus className="h-4 w-4" /> Add line
                </button>
                <button type="button" onClick={() => setPasteOpen((v) => !v)} className="inline-flex h-9 items-center gap-2 rounded-lg px-4 text-sm font-medium text-ink-4 transition-colors hover:bg-paper-2 hover:text-ink">
                  <ClipboardPaste className="h-4 w-4" /> Paste a list
                </button>
              </div>

              {pasteOpen && (
                <div className="mt-4 animate-fade-up rounded-xl bg-paper-2/60 p-4 shadow-[inset_0_0_0_1px_var(--color-line)]">
                  <p className="text-sm text-ink-4">Paste from Excel or type one part per line, like <span className="font-mono text-ink">PT 2,5 x 200</span></p>
                  <textarea value={pasteText} onChange={(e) => setPasteText(e.target.value)} rows={4} className={cn(inputCls, "mt-2 h-auto py-2 font-mono text-sm")} placeholder={"PT 2,5\t200\nPT 2,5-PE\t40\nD-PT 2,5\t10"} />
                  <button
                    type="button"
                    onClick={() => {
                      const parsed = parsePasted(pasteText);
                      if (parsed.length) {
                        setLines((ls) => [...ls.filter((l) => l.part.trim()), ...parsed]);
                        setPasteText("");
                        setPasteOpen(false);
                      }
                    }}
                    className="mt-2 h-9 rounded-lg bg-ink px-4 text-sm font-medium text-[#efe9de] transition-colors hover:bg-ink-3"
                  >
                    Add {parsePasted(pasteText).length || ""} lines
                  </button>
                </div>
              )}

              {/* dropzone */}
              <div id="bom" className="mt-8 scroll-mt-40">
                <div className="mb-2 text-sm font-medium">Attach files <span className="font-normal text-steel">BOM, datasheet or photo, optional</span></div>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragging(false);
                    addFiles(e.dataTransfer.files);
                  }}
                  onClick={() => fileRef.current?.click()}
                  className={cn(
                    "flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-6 py-8 text-center transition-colors",
                    dragging ? "border-ink bg-paper-2" : "border-steel-light bg-paper-2/40 hover:border-steel",
                  )}
                >
                  <Upload className="h-[18px] w-[18px] text-steel" />
                  <p className="mt-2 font-medium">Drop files here or click to browse</p>
                  <p className="mt-1 text-sm text-steel">Excel and CSV lists are read into lines automatically. PDF, JPG and PNG are attached for our team.</p>
                  <input
                    ref={fileRef}
                    type="file"
                    multiple
                    accept=".xlsx,.xls,.csv,.tsv,.pdf,.jpg,.jpeg,.png,.webp,.heic"
                    className="hidden"
                    onChange={(e) => {
                      addFiles(e.target.files);
                      e.target.value = "";
                    }}
                  />
                </div>
                {bomNotes.length > 0 && (
                  <ul className="mt-3 space-y-1" aria-live="polite">
                    {bomNotes.map((n, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-ink-4">
                        <FileSpreadsheet className="mt-0.5 h-4 w-4 shrink-0 text-steel" /> {n}
                      </li>
                    ))}
                  </ul>
                )}
                {files.length > 0 && (
                  <ul className="mt-3 space-y-2">
                    {files.map((f, i) => {
                      const Icon = fileIcon(f.name);
                      return (
                        <li key={`${f.name}-${i}`} className="flex h-11 items-center gap-3 rounded-lg px-3 shadow-[inset_0_0_0_1px_var(--color-line)]">
                          <Icon className="h-4 w-4 shrink-0 text-steel" />
                          <span className="min-w-0 flex-1 truncate text-sm">{f.name}</span>
                          <span className="font-mono text-xs tabular-nums text-steel">{(f.size / 1024).toFixed(0)} KB</span>
                          <button type="button" onClick={() => setFiles((fs) => fs.filter((_, j) => j !== i))} className="rounded p-1 text-steel transition-colors hover:text-bad" aria-label={`Remove ${f.name}`}>
                            <X className="h-4 w-4" />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="animate-fade-up space-y-7">
              <div>
                <h2 className="text-2xl font-medium">A few details</h2>
                <p className="mt-1 text-ink-4">All optional, but they help us quote the right thing faster.</p>
              </div>
              <div>
                <div className="mb-2 text-sm font-medium">When do you need it?</div>
                <ChoiceChips options={urgencyOptions} value={urgency} onChange={setUrgency} />
              </div>
              <div>
                <div className="mb-2 text-sm font-medium">Equivalent parts</div>
                <ChoiceChips options={equivOptions} value={equiv} onChange={setEquiv} />
              </div>
              <Field label="Ship to">
                <select value={province} onChange={(e) => setProvince(e.target.value)} className={inputCls}>
                  <option value="">Select province…</option>
                  {provinces.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </Field>
              <Field label="Anything else?" hint="Application, approvals, packaging…">
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} className={cn(inputCls, "h-auto py-2")} placeholder="e.g. Need cULus approved. Replacing blocks on a 2008 Allen-Bradley panel." />
              </Field>
            </div>
          )}

          {step === 2 && (
            <div className="animate-fade-up space-y-5">
              <div>
                <h2 className="text-2xl font-medium">Where should we send the quote?</h2>
                <p className="mt-1 text-ink-4">We use this only to respond to your request.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full name" required>
                  <input className={inputCls} autoComplete="name" value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} />
                </Field>
                <Field label="Company" required>
                  <input className={inputCls} autoComplete="organization" value={contact.company} onChange={(e) => setContact({ ...contact, company: e.target.value })} />
                </Field>
                <Field label="Work email" required>
                  <input type="email" className={inputCls} autoComplete="email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} />
                </Field>
                <Field label="Phone" hint="Optional">
                  <input type="tel" className={inputCls} autoComplete="tel" value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} />
                </Field>
              </div>
              {/* Honeypot: invisible to people, bots tend to fill it in */}
              <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
                <label>
                  Website
                  <input type="text" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
                </label>
              </div>
              <div className="space-y-3 rounded-xl bg-paper-2/60 p-4">
                <label className="flex cursor-pointer items-start gap-3 text-sm">
                  <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[var(--color-signal)]" />
                  <span>
                    I agree that {site.name} and its featured supplier, {site.featuredSupplier.legalName}, may contact me about this request and share the part details (not my contact details) with manufacturers and distributors to obtain pricing <span className="text-steel">*</span>
                  </span>
                </label>
                <label className="flex cursor-pointer items-start gap-3 text-sm text-ink-4">
                  <input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[var(--color-signal)]" />
                  <span>Send me occasional product updates. Unsubscribe anytime.</span>
                </label>
              </div>
            </div>
          )}

          {errors.length > 0 && (
            <div className="mt-6 rounded-lg bg-bad/5 p-4 text-sm text-bad shadow-[inset_0_0_0_1px_rgb(220_38_38/0.25)]" role="alert">
              {errors.map((e) => (
                <div key={e}>• {e}</div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-line p-5 sm:px-8">
          {step > 0 ? (
            <button type="button" onClick={() => go((step - 1) as Step)} className="inline-flex items-center gap-2 rounded-lg px-3 py-2.5 font-medium text-ink-4 hover:text-ink">
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
          ) : (
            <span className="flex items-center gap-2 text-xs text-steel">
              <Lock className="h-3.5 w-3.5" /> Free, no obligation
            </span>
          )}
          {step < 2 ? (
            <button key="next" type="button" onClick={() => go((step + 1) as Step)} className="inline-flex h-11 items-center gap-2 rounded-lg bg-ink px-5 font-medium text-[#efe9de] transition-[background-color,transform] hover:bg-ink-3 active:scale-[0.98]">
              Continue <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              key="submit"
              type="submit"
              disabled={sending}
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-signal px-5 font-medium text-white transition-[background-color,transform] hover:bg-signal-dark active:scale-[0.98] disabled:opacity-60"
            >
              {sending ? "Sending…" : "Send my RFQ"} <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </form>

      {/* summary sidebar */}
      <aside className="space-y-4 lg:sticky lg:top-32 lg:self-start">
        <div className="overflow-hidden rounded-2xl bg-ink text-[#efe9de]">
          <div className="flex items-center justify-between border-b border-[#efe9de]/10 px-5 py-4">
            <span className="text-sm">Your RFQ</span>
            <span className="text-xs text-[#8a847a]">Draft</span>
          </div>
          <div className="relative flex h-28 items-center justify-center overflow-hidden">
            <div className="din-rail absolute inset-x-0 top-1/2 h-5 -translate-y-1/2 opacity-60" />
            <div className="relative flex gap-[2px]">
              {Array.from({ length: Math.max(1, Math.min(filledLines.length, 8)) }).map((_, i) => (
                <div key={`${i}-${filledLines.length}`} className="animate-snap-in" style={{ animationDelay: `${i * 60}ms` }}>
                  <TerminalModule variant={filledLines.length === 0 ? "dark" : i % 5 === 4 ? "ground" : i % 4 === 3 ? "blue" : "grey"} scale={8} />
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-2 px-5 pb-5">
            {filledLines.length === 0 && files.length === 0 ? (
              <p className="text-sm text-[#8a847a]">Your lines will appear here</p>
            ) : (
              <>
                {filledLines.slice(0, 6).map((l) => (
                  <div key={l.id} className="flex h-9 items-center justify-between gap-3 rounded-lg bg-ink-3 px-3 text-sm">
                    <span className="truncate font-mono">{l.part}</span>
                    <span className="shrink-0 font-mono tabular-nums text-[#8a847a]">{l.qty ? `×${l.qty}` : "Qty not set"}</span>
                  </div>
                ))}
                {filledLines.length > 6 && <p className="text-xs text-[#8a847a]">{filledLines.length - 6} more lines</p>}
                {files.length > 0 && (
                  <p className="flex items-center gap-2 pt-1 text-xs text-[#aaa398]">
                    <Paperclip className="h-3.5 w-3.5" /> {files.length} file{files.length > 1 ? "s" : ""} attached
                  </p>
                )}
              </>
            )}
          </div>
        </div>
        <div className="rounded-2xl p-5 shadow-[inset_0_0_0_1px_var(--color-line)]">
          <h3 className="font-medium">Why buyers use us</h3>
          <ul className="mt-3 space-y-2.5 text-sm text-ink-4">
            {["One request, one organized quote", "Equivalents flagged, never swapped silently", "A person reviews every RFQ"].map((t) => (
              <li key={t} className="flex gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-steel" />
                {t}
              </li>
            ))}
          </ul>
        </div>
        <p className="px-2 text-xs leading-relaxed text-ink-4">
          Quotes are prepared by our featured supplier, {site.featuredSupplier.name}. See our{" "}
          <Link href="/privacy" className="underline">
            privacy policy
          </Link>
          .
        </p>
      </aside>
    </div>
  );
}
