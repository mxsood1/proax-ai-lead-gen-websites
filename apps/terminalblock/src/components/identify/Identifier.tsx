"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AlertTriangle, ArrowRight, Camera, Hash, ImageUp, Loader2, RotateCcw, ScanLine } from "lucide-react";
import { rfqHref as buildRfqHref, type Catalog, type Product } from "@/data/products";
import { equivalentsFor, findMatch } from "@/lib/catalog-match";
import { TerminalModule } from "@/components/brand/TerminalModule";
import { Badge } from "@/components/ui/Section";
import { cn } from "@/lib/cn";

type Mode = "photo" | "part";
type Result = {
  title: string;
  summary: string;
  confidence: number;
  match?: Product;
  equivalents: Product[];
  attributes: { label: string; value: string }[];
  query: string;
};

function identifyPart(products: Product[], q: string): Result {
  const found = findMatch(products, q);
  if (found) {
    const { match, exact } = found;
    const wire = match.wireMax !== null ? (match.wireMin !== null && match.wireMin !== match.wireMax ? `${match.wireMin}–${match.wireMax} mm²` : `${match.wireMax} mm²`) : "—";
    return {
      title: `${match.manufacturer} ${match.partNumber}`,
      summary: match.description,
      confidence: exact ? 96 : 78,
      match,
      equivalents: equivalentsFor(products, match),
      attributes: [
        { label: "Connection", value: match.connection ?? "—" },
        { label: "Wire", value: wire },
        { label: "Current", value: match.current !== null ? `${match.current} A` : "—" },
        { label: "Type", value: match.fn.replace("-", " ") },
      ],
      query: q,
    };
  }
  return {
    title: "Not in our quick index",
    summary: "This one needs a human. Send it to the sourcing desk — we'll identify it and look for replacements, including obsolete parts.",
    confidence: 0,
    equivalents: [],
    attributes: [],
    query: q,
  };
}

type PhotoApiResponse = {
  ok: boolean;
  error?: string;
  identification?: {
    isTerminalBlock: boolean;
    manufacturer: string | null;
    series: string | null;
    partNumber: string | null;
    connection: string;
    function: string;
    colour: string;
    sizeEstimate: string | null;
    confidence: number;
    observations: string[];
  };
  match?: Product | null;
  equivalents?: Product[];
};

function photoResult(data: PhotoApiResponse): Result {
  const id = data.identification!;
  if (!id.isTerminalBlock) {
    return {
      title: "That doesn't look like a terminal block",
      summary: "Try a closer photo of the block or its side label, or send it to the sourcing desk and a person will take a look.",
      confidence: 0,
      equivalents: [],
      attributes: [],
      query: "Photo upload, not recognised",
    };
  }
  const name = [id.manufacturer, id.series ?? id.partNumber].filter(Boolean).join(" ");
  const describe = `${id.connection !== "unknown" ? id.connection : ""} ${id.function !== "unknown" ? id.function : "terminal"} block, ${id.colour}`.trim();
  return {
    title: data.match ? `${data.match.manufacturer} ${data.match.partNumber}` : name || describe.charAt(0).toUpperCase() + describe.slice(1),
    summary: id.observations.slice(0, 3).join(". "),
    confidence: id.confidence,
    match: data.match ?? undefined,
    equivalents: data.equivalents ?? [],
    attributes: [
      { label: "Connection", value: id.connection },
      { label: "Type", value: id.function.replace("-", " ") },
      { label: "Colour", value: id.colour },
      { label: "Est. size", value: id.sizeEstimate ?? "—" },
    ],
    query: `Photo upload: ${name || describe}${id.sizeEstimate ? `, ~${id.sizeEstimate}` : ""}`,
  };
}

/** Labelled preview used when AI isn't switched on. */
function previewPhoto(products: Product[]): Result {
  const proto = { id: "", fn: "feed-through", connection: "push-in", wireMax: 4, manufacturer: "" } as const;
  return {
    title: "Push-in feed-through block, grey",
    summary: "Single-level, DIN-rail mounted, ~5.2 mm wide, orange release buttons visible. Likely a 2.5 mm² class block.",
    confidence: 82,
    equivalents: equivalentsFor(products, proto),
    attributes: [
      { label: "Connection", value: "push-in" },
      { label: "Est. size", value: "2.5 mm²" },
      { label: "Colour", value: "Grey" },
      { label: "Mounting", value: "DIN 35 mm" },
    ],
    query: "Photo upload — push-in feed-through, grey, ~2.5 mm²",
  };
}

export function Identifier({ catalog, examples, aiEnabled }: { catalog: Catalog; examples: string[]; aiEnabled: boolean }) {
  const products = catalog.items;
  const params = useSearchParams();
  const [mode, setMode] = useState<Mode>(() => (params.get("mode") === "part" ? "part" : "photo"));
  const [part, setPart] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => () => {
    if (image) URL.revokeObjectURL(image);
  }, [image]);

  function onFile(f?: File | null) {
    if (!f || !f.type.startsWith("image/")) return;
    setImage(URL.createObjectURL(f));
    setPhoto(f);
    setFileName(f.name);
    setResult(null);
    setError("");
  }

  async function run() {
    setBusy(true);
    setResult(null);
    setError("");
    if (mode === "part") {
      window.setTimeout(() => {
        setResult(identifyPart(products, part));
        setBusy(false);
      }, 500);
      return;
    }
    if (!aiEnabled || !photo) {
      window.setTimeout(() => {
        setResult(previewPhoto(products));
        setBusy(false);
      }, 1500);
      return;
    }
    try {
      const body = new FormData();
      body.append("photo", photo);
      const res = await fetch("/api/identify", { method: "POST", body });
      const data = (await res.json()) as PhotoApiResponse;
      if (data.ok && data.identification) setResult(photoResult(data));
      else setError(data.error ?? "Identification failed. Try another photo.");
    } catch {
      setError("We couldn't reach the server. Try again.");
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setResult(null);
    setImage(null);
    setPhoto(null);
    setFileName("");
    setPart("");
    setError("");
  }

  const canRun = mode === "photo" ? !!image : part.trim().length > 1;
  const rfqHref = result ? (result.match ? buildRfqHref([result.match]) : buildRfqHref([], result.query)) : "/rfq";

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
      {/* input panel */}
      <div className="rounded-3xl border border-line bg-paper p-5 sm:p-7">
        <div className="grid grid-cols-2 gap-1 rounded-xl bg-paper-2 p-1" role="tablist">
          {[
            { id: "photo" as const, label: "From a photo", icon: Camera },
            { id: "part" as const, label: "From a part number", icon: Hash },
          ].map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={mode === t.id}
              onClick={() => {
                setMode(t.id);
                setResult(null);
              }}
              className={cn(
                "inline-flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-colors",
                mode === t.id ? "bg-ink text-white shadow" : "text-ink-4 hover:text-ink",
              )}
            >
              <t.icon className="h-4 w-4" /> {t.label}
            </button>
          ))}
        </div>

        {mode === "photo" ? (
          <div className="mt-5">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                onFile(e.dataTransfer.files?.[0]);
              }}
              onClick={() => inputRef.current?.click()}
              className={cn(
                "relative flex aspect-[4/3] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed transition-colors",
                dragging ? "border-ink bg-paper-2" : "border-line bg-paper-2/50 hover:border-steel",
              )}
            >
              {image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={image} alt="Uploaded part" className="absolute inset-0 h-full w-full object-contain p-3" />
              ) : (
                <div className="flex flex-col items-center px-6 text-center">
                  <div className="flex gap-[2px] opacity-80">
                    <TerminalModule variant="grey" scale={9} label="?" />
                    <TerminalModule variant="grey" scale={9} />
                  </div>
                  <ImageUp className="mt-5 h-[18px] w-[18px] text-steel" />
                  <p className="mt-2 font-medium">Drop a photo, or click to upload</p>
                  <p className="mt-1 text-sm text-ink-4">The block itself, its side label, or the packaging. JPG, PNG or HEIC.</p>
                </div>
              )}
              {busy && (
                <div className="absolute inset-0 bg-ink/40">
                  <span className="absolute inset-x-0 h-[3px] animate-scan bg-signal" />
                </div>
              )}
              {image &&
                ["left-3 top-3 border-l-[3px] border-t-[3px]", "right-3 top-3 border-r-[3px] border-t-[3px]", "bottom-3 left-3 border-b-[3px] border-l-[3px]", "bottom-3 right-3 border-b-[3px] border-r-[3px]"].map((c) => (
                  <span key={c} className={`absolute h-6 w-6 border-ink ${c}`} />
                ))}
              <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
            </div>
            {fileName && <p className="mt-2 truncate font-mono text-xs text-ink-4">{fileName}</p>}
          </div>
        ) : (
          <div className="mt-5">
            <label htmlFor="part" className="text-sm font-medium text-ink">
              Part number or series
            </label>
            <input
              id="part"
              value={part}
              onChange={(e) => {
                setPart(e.target.value);
                setResult(null);
              }}
              onKeyDown={(e) => e.key === "Enter" && canRun && run()}
              placeholder={`e.g. ${examples.slice(0, 3).join(", ")}`}
              className="mt-2 h-14 w-full rounded-xl bg-paper px-4 font-mono text-lg shadow-[inset_0_0_0_1px_var(--color-line)] transition-shadow focus:shadow-[inset_0_0_0_1px_var(--color-ink)] focus:outline-none"
            />
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-xs text-steel">Try</span>
              {examples.map((ex) => (
                <button key={ex} type="button" onClick={() => setPart(ex)} className="marker transition-shadow hover:shadow-[inset_0_0_0_1px_var(--color-ink)]">
                  {ex}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={run}
            disabled={!canRun || busy}
            className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-signal font-medium text-white transition-colors hover:bg-signal-dark disabled:opacity-40"
          >
            {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <ScanLine className="h-5 w-5" />}
            {busy ? "Identifying…" : mode === "photo" ? "Identify this part" : "Cross-reference"}
          </button>
          {(result || image || part) && (
            <button type="button" onClick={reset} aria-label="Start over" className="inline-flex h-12 items-center gap-2 rounded-xl px-4 font-medium text-ink-4 shadow-[inset_0_0_0_1px_var(--color-line)] transition-colors hover:bg-paper-2 hover:text-ink">
              <RotateCcw className="h-4 w-4" />
            </button>
          )}
        </div>
        <p className="mt-4 text-xs leading-relaxed text-ink-4">
          Photos are analysed to identify your part and are not stored. AI results are a starting point, and a person verifies every match before you’re quoted.
        </p>
        {error && (
          <p className="mt-3 rounded-lg bg-bad/5 p-3 text-sm text-bad shadow-[inset_0_0_0_1px_rgb(220_38_38/0.25)]" role="alert">
            {error}
          </p>
        )}
      </div>

      {/* result panel */}
      <div className="rounded-3xl bg-ink p-5 text-white sm:p-7">
        <div className="flex items-center justify-between">
          <span className="text-sm text-[#8a847a]">Result</span>
          {mode === "photo" && !aiEnabled && <Badge tone="demo-dark">Photo preview, AI not switched on</Badge>}
        </div>

        {!result && !busy && (
          <div className="flex h-[85%] min-h-72 flex-col items-center justify-center text-center">
            <ScanLine className="h-[18px] w-[18px] text-[#8a847a]" />
            <p className="mt-4 max-w-xs text-white/60">Upload a photo or enter a part number. We’ll tell you what it is, and what can replace it.</p>
          </div>
        )}

        {busy && (
          <div className="mt-6 space-y-3">
            {["Reading label & geometry", "Matching against catalog", "Finding equivalents"].map((s, i) => (
              <div key={s} className="flex animate-fade-up items-center gap-3 rounded-xl bg-white/5 px-4 py-3" style={{ animationDelay: `${i * 450}ms` }}>
                <Loader2 className="h-4 w-4 animate-spin text-[#8a847a]" />
                <span className="font-mono text-sm text-white/75">{s}…</span>
              </div>
            ))}
          </div>
        )}

        {result && (
          <div className="mt-6 animate-fade-up">
            <div className="flex items-start gap-4">
              <div className="flex shrink-0 gap-[2px]">
                <TerminalModule variant={result.match?.variant ?? (result.confidence ? "grey" : "dark")} connection={result.match?.connection ?? "push-in"} scale={9} label={result.confidence ? undefined : "?"} />
              </div>
              <div className="min-w-0">
                <h3 className="text-2xl font-medium leading-tight">{result.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-white/65">{result.summary}</p>
              </div>
            </div>

            {result.confidence > 0 && (
              <div className="mt-6">
                <div className="flex justify-between font-mono text-xs text-white/60">
                  <span>Confidence</span>
                  <span className="text-white">{result.confidence}%</span>
                </div>
                <div className="mt-1.5 h-1 rounded-full bg-ink-3">
                  <div className="h-full rounded-full bg-[#efe9de]" style={{ width: `${result.confidence}%` }} />
                </div>
              </div>
            )}

            {result.attributes.length > 0 && (
              <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {result.attributes.map((a) => (
                  <div key={a.label} className="rounded-xl bg-white/5 p-3">
                    <dt className="text-xs text-[#8a847a]">{a.label}</dt>
                    <dd className="mt-1 text-sm font-medium first-letter:uppercase">{a.value}</dd>
                  </div>
                ))}
              </dl>
            )}

            {result.equivalents.length > 0 && (
              <div className="mt-7">
                <div className="flex items-center gap-2 font-mono text-xs font-medium text-white/50">
                  Possible equivalents
                </div>
                <ul className="mt-3 space-y-2">
                  {result.equivalents.map((e) => (
                    <li key={e.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 px-4 py-3">
                      <div>
                        <div className="font-medium">
                          {e.manufacturer} <span className="font-mono">{e.partNumber}</span>
                        </div>
                        <div className="line-clamp-1 text-xs text-white/50">
                          {[e.connection, e.wireMax !== null ? `${e.wireMax} mm²` : null, e.current !== null ? `${e.current} A` : null].filter(Boolean).join(" · ") || e.description}
                        </div>
                      </div>
                      <span className="shrink-0 text-xs text-[#8a847a]">To verify</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 flex items-start gap-2 text-xs text-white/50">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  Equivalents can differ in width, accessories and approvals. Our team confirms fit before quoting.
                </p>
              </div>
            )}

            <Link
              href={rfqHref}
              className="mt-7 flex items-center justify-center gap-2 rounded-xl bg-signal py-3.5 font-medium transition-colors hover:bg-signal-dark"
            >
              {result.confidence ? "Get a quote for this part" : "Send it to the sourcing desk"} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
