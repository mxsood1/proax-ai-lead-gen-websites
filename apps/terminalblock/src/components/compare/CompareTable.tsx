import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { compareCategories, SHOP_DOMAIN, type Brand, type ComparablePart } from "@/data/brands";
import { cn } from "@/lib/cn";

type Row = { id: string; label: string; hint?: string; href?: string; cell: (b: Brand) => ReactNode | null };
type Section = { title: string; note?: string; rows: Row[] };

const list = (items: string[], dot: string) =>
  items.length ? (
    <ul className="space-y-2">
      {items.map((s) => (
        <li key={s} className="flex gap-3">
          <span className={cn("mt-[11px] h-px w-2 shrink-0", dot)} />
          {s}
        </li>
      ))}
    </ul>
  ) : null;

const partRow = (id: string, label: string, pick: (p: ComparablePart) => string, mono = false): Row => ({
  id: `part-${id}`,
  label,
  cell: (b) => {
    const v = b.part ? pick(b.part) : "";
    return v ? <span className={mono ? "font-mono text-[14px]" : undefined}>{v}</span> : null;
  },
});

/**
 * One big table comparing the companies, like a phone spec comparison:
 * the company, its range for every kind of terminal block, a similar part
 * side by side, and strengths and things to check. Rows with nothing listed
 * for any brand are left out.
 */
export function CompareTable({ brands }: { brands: Brand[] }) {
  const all: Section[] = [
    {
      title: "The company",
      rows: [
        { id: "hq", label: "Head office", cell: (b) => b.hq },
        { id: "summary", label: "Terminal block range", cell: (b) => b.summary },
      ],
    },
    {
      title: "Range by type",
      note: "The product family to look for in each catalogue.",
      rows: compareCategories.map((c) => ({
        id: c.id,
        label: c.label,
        hint: c.hint,
        href: c.typeSlug ? `/types/${c.typeSlug}` : undefined,
        cell: (b) => b.ranges[c.id] ?? null,
      })),
    },
    {
      title: "A similar part, side by side",
      note: brands.every((b) => b.part) && new Set(brands.map((b) => b.part!.kind)).size === 1 ? `${brands[0].part!.kind}.` : "Each brand's closest comparable part.",
      rows: [
        partRow("name", "Part", (p) => p.name),
        partRow("number", "Order number", (p) => p.number, true),
        partRow("connection", "Connection", (p) => p.connection),
        partRow("width", "Width or pitch", (p) => p.width),
        partRow("conductor", "Conductor range", (p) => p.conductor),
        partRow("iec", "Rating (IEC)", (p) => p.iec),
        partRow("ul", "Rating (UL / CSA)", (p) => p.ul),
        partRow("approvals", "Approvals", (p) => p.approvals),
      ],
    },
    {
      title: "Strengths and things to check",
      rows: [
        { id: "strengths", label: "Strengths", cell: (b) => list(b.strengths, "bg-ok") },
        { id: "check", label: "Things to check", cell: (b) => list(b.check, "bg-steel") },
      ],
    },
    {
      title: "Where to buy",
      rows: [
        {
          id: "buy",
          label: "Buy online",
          cell: (b) =>
            b.buy ? (
              <a href={b.buy.href} target="_blank" rel="noopener" className="group inline-flex flex-col">
                <span className="inline-flex items-center gap-1.5 font-medium text-ink underline decoration-line underline-offset-4 group-hover:decoration-ink">
                  {b.buy.label} <ArrowUpRight className="h-4 w-4 shrink-0" />
                </span>
                <span className="mt-0.5 text-xs text-steel">at {SHOP_DOMAIN}</span>
              </a>
            ) : (
              <a href="#ask" className="inline-flex flex-col">
                <span className="font-medium text-ink underline decoration-line underline-offset-4 hover:decoration-ink">Ask us about {b.name}</span>
                <span className="mt-0.5 text-xs text-steel">We&apos;ll help you find it or a stocked equivalent</span>
              </a>
            ),
        },
      ],
    },
  ];
  const sections = all.map((s) => ({ ...s, rows: s.rows.filter((r) => brands.some((b) => r.cell(b))) })).filter((s) => s.rows.length > 0);

  const sources = brands.filter((b) => b.part?.source);

  return (
    <div>
      <div className="overflow-x-auto rounded-2xl bg-paper shadow-[inset_0_0_0_1px_var(--color-line)]">
        <table className="w-full min-w-[620px] table-fixed text-left text-[15px]">
          <colgroup>
            <col className="w-[26%]" />
            {brands.map((b) => (
              <col key={b.slug} />
            ))}
          </colgroup>
          <thead>
            <tr className="border-b border-line">
              <th className="px-6 py-5" />
              {brands.map((b) => (
                <th key={b.slug} scope="col" className="px-6 py-5 align-bottom text-xl font-medium leading-tight">
                  {b.name}
                </th>
              ))}
            </tr>
          </thead>
          {sections.map((s) => (
            <tbody key={s.title} className="divide-y divide-line border-b border-line last:border-b-0">
              <tr className="bg-paper-2/70">
                <th colSpan={brands.length + 1} scope="colgroup" className="px-6 py-3 text-left">
                  <span className="text-sm font-medium">{s.title}</span>
                  {s.note && <span className="ml-2 text-xs font-normal text-steel">{s.note}</span>}
                </th>
              </tr>
              {s.rows.map((r) => (
                <tr key={r.id} className="align-top">
                  <th scope="row" className="px-6 py-4 font-normal">
                    {r.href ? (
                      <Link href={r.href} className="font-medium text-ink underline decoration-line underline-offset-4 hover:decoration-ink">
                        {r.label}
                      </Link>
                    ) : (
                      <span className="font-medium">{r.label}</span>
                    )}
                    {r.hint && <div className="mt-0.5 text-xs text-steel">{r.hint}</div>}
                  </th>
                  {brands.map((b) => {
                    const v = r.cell(b);
                    return (
                      <td key={b.slug} className="px-6 py-4 text-ink-3">
                        {v ?? (
                          <span className="text-steel" title="Not listed here yet: check the manufacturer's catalogue">
                            —
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          ))}
        </table>
      </div>
      {sources.length > 0 && (
        <p className="mt-3 text-xs text-steel">
          Part specs from:{" "}
          {sources.map((b, i) => (
            <span key={b.slug}>
              {i > 0 && " · "}
              <a href={b.part!.source} target="_blank" rel="noopener nofollow" className="underline hover:text-ink">
                {b.name} {b.part!.name}
              </a>
            </span>
          ))}
        </p>
      )}
    </div>
  );
}

export function DraftDataNote({ tone = "dark" }: { tone?: "dark" | "light" }) {
  return (
    <p className={cn("text-xs", tone === "light" ? "text-[#aaa398]" : "text-steel")}>
      &ldquo;—&rdquo; means not listed here yet, not that the brand doesn&apos;t make it. Ranges and ratings change: always confirm on the
      manufacturer&apos;s current datasheet before ordering.
    </p>
  );
}
