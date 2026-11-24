"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Check, Plus, RotateCcw, Search, SearchX, SlidersHorizontal, X } from "lucide-react";
import { AWG_TO_MM2, normalizePn, rfqHref, type BlockFunction, type Catalog, type Connection, type Product } from "@/data/products";
import { TerminalModule } from "@/components/brand/TerminalModule";
import { EmailListDialog } from "@/components/leads/EmailListDialog";
import { Badge } from "@/components/ui/Section";
import { cn } from "@/lib/cn";

const connections: { id: Connection; label: string }[] = [
  { id: "push-in", label: "Push-in" },
  { id: "spring", label: "Spring" },
  { id: "screw", label: "Screw" },
];

const functions: { id: BlockFunction; label: string }[] = [
  { id: "feed-through", label: "Feed-through" },
  { id: "ground", label: "Ground (PE)" },
  { id: "fuse", label: "Fuse" },
  { id: "disconnect", label: "Disconnect" },
  { id: "multi-level", label: "Multi-level" },
  { id: "pcb", label: "PCB" },
  { id: "accessory", label: "Accessories" },
];

const PAGE = 24;

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "h-8 rounded-lg px-3 text-sm transition-colors",
        active ? "bg-ink text-[#efe9de]" : "bg-paper text-ink-4 shadow-[inset_0_0_0_1px_var(--color-line)] hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}

function FilterGroup({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-line py-5 first:pt-0 last:border-0">
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="text-sm font-medium text-ink">{label}</h3>
        {hint && <span className="font-mono text-xs tabular-nums text-steel">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function toggle<T>(list: T[], v: T) {
  return list.includes(v) ? list.filter((x) => x !== v) : [...list, v];
}

export function Finder({ catalog }: { catalog: Catalog }) {
  const products = catalog.items;
  const [query, setQuery] = useState("");
  const [wire, setWire] = useState<number | null>(null);
  const [minCurrent, setMinCurrent] = useState(0);
  const [conn, setConn] = useState<Connection[]>([]);
  const [fns, setFns] = useState<BlockFunction[]>([]);
  const [mfrs, setMfrs] = useState<string[]>([]);
  const [stockOnly, setStockOnly] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [limit, setLimit] = useState(PAGE);

  const manufacturers = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of products) counts.set(p.manufacturer, (counts.get(p.manufacturer) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([m]) => m);
  }, [products]);

  const results = useMemo(() => {
    // Word-based search: every typed word must start a word in the item, in any order.
    // "UT 4-PE" → [ut, 4, pe] matches "UT 4-TWIN-PE"; "3044102" matches the part number.
    const tokens = query.toLowerCase().split(/[^a-z0-9äöüé]+/).filter(Boolean);
    const qn = normalizePn(query);
    const filtered = products.filter((p) => {
      if (tokens.length) {
        const words = `${p.partNumber} ${p.manufacturer} ${p.series ?? ""} ${p.description}`.toLowerCase().split(/[^a-z0-9äöüé]+/);
        const wordMatch = tokens.every((t) => words.some((w) => w.startsWith(t)));
        if (!wordMatch && !(qn.length >= 3 && normalizePn(p.partNumber).includes(qn))) return false;
      }
      // Blocks with only a nominal size accept roughly one size class below it up to the nominal size.
      if (wire !== null && (p.wireMax === null || wire > p.wireMax || wire < (p.wireMin ?? p.wireMax / 4))) return false;
      if (minCurrent > 0 && (p.current === null || p.current < minCurrent)) return false;
      if (conn.length && (!p.connection || !conn.includes(p.connection))) return false;
      if (fns.length && !fns.includes(p.fn)) return false;
      if (mfrs.length && !mfrs.includes(p.manufacturer)) return false;
      if (stockOnly && !p.inStock) return false;
      return true;
    });
    // In-stock parts first, then parts with a real image; exact part-number / series hits lead when searching.
    const avail = (p: Product) => (p.inStock ? 0 : 2) + (p.image ? 0 : 1);
    const rank = (p: Product) => (!qn ? 0 : normalizePn(p.partNumber) === qn ? 0 : p.series && normalizePn(p.series) === qn ? 1 : 2);
    return [...filtered].sort((a, b) => rank(a) - rank(b) || avail(a) - avail(b));
  }, [products, query, wire, minCurrent, conn, fns, mfrs, stockOnly]);

  const inStockCount = useMemo(() => products.filter((p) => p.inStock).length, [products]);

  const activeCount = (wire !== null ? 1 : 0) + (minCurrent > 0 ? 1 : 0) + conn.length + fns.length + mfrs.length + (query ? 1 : 0) + (stockOnly ? 1 : 0);
  const selectedItems = selected.map((id) => products.find((p) => p.id === id)).filter(Boolean) as Product[];

  function reset() {
    setQuery("");
    setWire(null);
    setMinCurrent(0);
    setConn([]);
    setFns([]);
    setMfrs([]);
    setStockOnly(false);
    setLimit(PAGE);
  }

  const filters = (
    <div>
      {inStockCount > 0 && (
        <FilterGroup label="Availability">
          <Chip active={stockOnly} onClick={() => setStockOnly((v) => !v)}>
            In stock only <span className="ml-1 font-mono text-[11px] tabular-nums opacity-60">{inStockCount}</span>
          </Chip>
        </FilterGroup>
      )}
      <FilterGroup label="Wire size" hint={wire !== null ? `${wire} mm²` : "any"}>
        <div className="grid grid-cols-3 gap-1.5">
          {AWG_TO_MM2.map((w) => (
            <button
              key={w.awg}
              type="button"
              onClick={() => setWire(wire === w.mm2 ? null : w.mm2)}
              aria-pressed={wire === w.mm2}
              className={cn(
                "rounded-lg px-1 py-2 text-center transition-colors",
                wire === w.mm2 ? "bg-ink text-[#efe9de]" : "bg-paper shadow-[inset_0_0_0_1px_var(--color-line)] hover:bg-paper-2",
              )}
            >
              <div className="text-sm font-medium tabular-nums leading-none">{w.mm2}</div>
              <div className={cn("mt-1 font-mono text-[11px] tabular-nums", wire === w.mm2 ? "text-[#8a847a]" : "text-steel")}>{w.awg}</div>
            </button>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup label="Min. current" hint={minCurrent ? `≥ ${minCurrent} A` : "any"}>
        <input
          type="range"
          min={0}
          max={40}
          step={2}
          value={minCurrent}
          onChange={(e) => setMinCurrent(Number(e.target.value))}
          className="w-full accent-[var(--color-signal)]"
          aria-label="Minimum current in amps"
        />
        <div className="mt-1 flex justify-between font-mono text-[11px] tabular-nums text-steel">
          <span>0 A</span>
          <span>20 A</span>
          <span>40 A</span>
        </div>
      </FilterGroup>

      <FilterGroup label="Connection">
        <div className="flex flex-wrap gap-1.5">
          {connections.map((c) => (
            <Chip key={c.id} active={conn.includes(c.id)} onClick={() => setConn(toggle(conn, c.id))}>
              {c.label}
            </Chip>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup label="Function">
        <div className="flex flex-wrap gap-1.5">
          {functions.map((f) => (
            <Chip key={f.id} active={fns.includes(f.id)} onClick={() => setFns(toggle(fns, f.id))}>
              {f.label}
            </Chip>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup label="Manufacturer">
        <div className="flex flex-wrap gap-1.5">
          {manufacturers.map((m) => (
            <Chip key={m} active={mfrs.includes(m)} onClick={() => setMfrs(toggle(mfrs, m))}>
              {m}
            </Chip>
          ))}
        </div>
      </FilterGroup>
    </div>
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
      {/* filters */}
      <aside className="lg:sticky lg:top-32 lg:self-start">
        <div className="flex items-center justify-between lg:hidden">
          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-paper px-4 font-medium shadow-[inset_0_0_0_1px_var(--color-line)]"
          >
            <SlidersHorizontal className="h-4 w-4" /> Filters {activeCount > 0 && <span className="font-mono text-xs tabular-nums text-steel">{activeCount}</span>}
          </button>
          {activeCount > 0 && (
            <button type="button" onClick={reset} className="text-sm font-semibold text-ink-4 underline">
              Reset
            </button>
          )}
        </div>
        <div className={cn("mt-4 max-h-[calc(100vh-9rem)] overflow-y-auto rounded-2xl border border-line bg-paper p-5 lg:mt-0 lg:block", showFilters ? "block" : "hidden")}>
          <div className="mb-5 hidden items-center justify-between lg:flex">
            <span className="font-medium">Filters</span>
            <button
              type="button"
              onClick={reset}
              disabled={activeCount === 0}
              className="inline-flex items-center gap-1 text-sm text-ink-4 transition-colors hover:text-ink disabled:opacity-40"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reset
            </button>
          </div>
          {filters}
        </div>
      </aside>

      {/* results */}
      <div>
        <label className="relative mb-5 block">
          <span className="sr-only">Search by part number, brand or description</span>
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-4" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setLimit(PAGE);
            }}
            placeholder="Part number, brand or description"
            className="h-12 w-full rounded-xl bg-paper pl-12 pr-12 font-mono text-[15px] shadow-[inset_0_0_0_1px_var(--color-line)] transition-shadow placeholder:text-steel focus:shadow-[inset_0_0_0_1px_var(--color-ink)] focus:outline-none"
          />
          {query && (
            <button type="button" onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-ink-4 hover:bg-paper-2" aria-label="Clear search">
              <X className="h-4 w-4" />
            </button>
          )}
        </label>

        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-ink-4">
            <span className="text-2xl font-medium text-ink">{results.length.toLocaleString()}</span> matching parts
          </p>
          {catalog.source === "supplier" ? (
            <Badge tone="signal">Featured supplier catalog{catalog.exportedAt ? ` · updated ${catalog.exportedAt.slice(0, 10)}` : ""}</Badge>
          ) : (
            <Badge tone="demo">Sample data · catalog feed coming</Badge>
          )}
        </div>

        {results.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl bg-paper px-6 py-16 text-center shadow-[inset_0_0_0_1px_var(--color-line)]">
            <SearchX className="h-[18px] w-[18px] text-steel" />
            <h3 className="mt-4 text-xl font-medium">No exact match, and that’s what we’re for</h3>
            <p className="mt-2 max-w-md text-ink-4">Send us your requirements and our sourcing desk will find the right block, including special and hard-to-find parts.</p>
            <div className="mt-6 flex gap-3">
              <Link href={rfqHref([], query || undefined)} className="inline-flex h-11 items-center rounded-lg bg-signal px-5 font-medium text-white transition-colors hover:bg-signal-dark">
                Describe what you need
              </Link>
              <button type="button" onClick={reset} className="inline-flex h-11 items-center rounded-lg px-5 font-medium shadow-[inset_0_0_0_1px_var(--color-line)] transition-colors hover:bg-paper-2">
                Reset filters
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {results.slice(0, limit).map((p) => (
                <ProductCard key={p.id} p={p} selected={selected.includes(p.id)} onToggle={() => setSelected((s) => toggle(s, p.id))} />
              ))}
              {results.length <= limit && (
                <Link
                  href={rfqHref([], query || undefined)}
                  className="group flex flex-col justify-between rounded-2xl border border-dashed border-steel-light p-5 transition-colors hover:border-steel hover:bg-paper-2/60"
                >
                  <div>
                    <div className="text-sm text-steel">Not listed?</div>
                    <h3 className="mt-2 text-lg font-medium leading-snug">We source far more than what’s shown here</h3>
                    <p className="mt-2 text-sm text-ink-4">Any brand, special variants, obsolete parts.</p>
                  </div>
                  <span className="mt-6 inline-flex items-center gap-1 font-medium">
                    Ask the sourcing desk <ArrowRight className="h-4 w-4 transition-transform" />
                  </span>
                </Link>
              )}
            </div>
            {results.length > limit && (
              <div className="mt-8 flex justify-center">
                <button type="button" onClick={() => setLimit((l) => l + PAGE)} className="inline-flex h-11 items-center rounded-lg bg-paper px-5 font-medium tabular-nums shadow-[inset_0_0_0_1px_var(--color-line)] transition-colors hover:bg-paper-2">
                  Show more ({(results.length - limit).toLocaleString()} left)
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* selection tray */}
      {selectedItems.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 p-3 sm:p-5">
          <div className="mx-auto flex max-w-3xl animate-fade-up items-center gap-4 rounded-2xl bg-ink p-3 pl-5 text-[#efe9de] shadow-[0_8px_24px_rgba(0,0,0,0.18)]">
            <div className="hidden gap-[2px] sm:flex">
              {selectedItems.slice(0, 5).map((p) =>
                p.image ? (
                  <div key={p.id} className="flex h-10 w-10 items-center justify-center rounded-md bg-paper p-1">
                    <Image src={p.image.src} alt="" width={p.image.width} height={p.image.height} sizes="40px" className="h-full w-full object-contain" />
                  </div>
                ) : (
                  <TerminalModule key={p.id} variant={p.variant} connection={p.connection ?? "push-in"} scale={5.5} />
                ),
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-medium">
                {selectedItems.length} item{selectedItems.length > 1 ? "s" : ""} in your RFQ
              </div>
              <div className="truncate font-mono text-xs text-white/55">{selectedItems.map((p) => p.partNumber).join(" · ")}</div>
            </div>
            <button type="button" onClick={() => setSelected([])} className="hidden rounded-lg p-2 text-white/60 hover:bg-white/10 hover:text-white sm:block" aria-label="Clear selection">
              <X className="h-5 w-5" />
            </button>
            <EmailListDialog items={selectedItems.map((p) => p.id)} count={selectedItems.length} />
            <Link href={rfqHref(selectedItems)} className="inline-flex h-11 shrink-0 items-center gap-2 rounded-lg bg-signal px-4 font-medium text-white transition-colors hover:bg-signal-dark">
              Get quote <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function Spec({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="text-xs text-steel">{label}</dt>
      <dd className={cn("mt-0.5 text-sm font-medium", !value && "font-normal text-ink-4")}>{value ?? "—"}</dd>
    </div>
  );
}

const fnLabel: Record<BlockFunction, string> = {
  "feed-through": "Feed-through",
  ground: "Ground",
  fuse: "Fuse",
  disconnect: "Disconnect",
  "multi-level": "Multi-level",
  pcb: "PCB",
  accessory: "Accessory",
};

function ProductCard({ p, selected, onToggle }: { p: Product; selected: boolean; onToggle: () => void }) {
  const wire = p.wireMin !== null && p.wireMax !== null ? (p.wireMin === p.wireMax ? `${p.wireMax} mm²` : `${p.wireMin}–${p.wireMax} mm²`) : p.wireMax !== null ? `${p.wireMax} mm²` : null;
  return (
    <article
      className={cn(
        "flex flex-col overflow-hidden rounded-2xl bg-paper transition-shadow duration-150",
        selected ? "shadow-[inset_0_0_0_1.5px_var(--color-ink)]" : "shadow-[inset_0_0_0_1px_var(--color-line)] hover:shadow-[inset_0_0_0_1px_var(--color-steel-light)]",
      )}
    >
      <div className="relative flex h-36 items-center justify-center border-b border-line bg-paper-2/40">
        {p.image ? (
          <Image
            src={p.image.src}
            alt={`${p.manufacturer} ${p.partNumber}`}
            width={p.image.width}
            height={p.image.height}
            sizes="200px"
            className="h-full w-full object-contain px-10 pb-3 pt-8"
          />
        ) : (
          <>
            <div className="din-rail absolute inset-x-0 top-1/2 h-5 -translate-y-1/2 opacity-70" />
            <div className="relative flex gap-[2px]">
              {Array.from({ length: p.levels === 1 ? 3 : 2 }).map((_, i) => (
                <TerminalModule key={i} variant={p.variant} connection={p.connection ?? "push-in"} scale={8.5} label={p.fn === "ground" ? undefined : p.levels > 1 ? `L${p.levels}` : undefined} />
              ))}
            </div>
          </>
        )}
        <span className="absolute left-3 top-3 text-xs text-steel">{fnLabel[p.fn]}</span>
        {p.connection && <span className="absolute right-3 top-3 text-xs capitalize text-steel">{p.connection}</span>}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between gap-2 text-xs text-steel">
          <span>{p.manufacturer}</span>
          {p.inStock && <Badge tone="signal">In stock</Badge>}
        </div>
        <h3 className="mt-1.5">
          {p.page ? (
            <Link href={p.page} className="marker !h-6 !text-[15px] break-all transition-shadow hover:shadow-[inset_0_0_0_1px_var(--color-ink)]">
              {p.partNumber}
            </Link>
          ) : (
            <span className="marker !h-6 !text-[15px] break-all">{p.partNumber}</span>
          )}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-ink-4">{p.description}</p>
        {p.page && (
          <Link href={p.page} className="mt-1.5 inline-flex items-center gap-1 text-sm font-medium text-ink underline decoration-line underline-offset-4 hover:decoration-ink">
            Specs &amp; accessories <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
        <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-3 rounded-lg bg-paper-2/70 p-3">
          <Spec label="Wire" value={wire} />
          <Spec label="AWG" value={p.awg} />
          <Spec label="Current" value={p.current !== null ? `${p.current} A` : null} />
          <Spec label="Voltage" value={p.voltage !== null ? `${p.voltage} V` : null} />
        </dl>
        <div className="flex-1" />
        <button
          type="button"
          onClick={onToggle}
          className={cn(
            "mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors",
            selected ? "bg-ink text-[#efe9de]" : "bg-paper text-ink shadow-[inset_0_0_0_1px_var(--color-line)] hover:bg-paper-2",
          )}
        >
          {selected ? (
            <>
              <Check className="h-4 w-4" /> Added to RFQ
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" /> Add to RFQ
            </>
          )}
        </button>
      </div>
    </article>
  );
}
