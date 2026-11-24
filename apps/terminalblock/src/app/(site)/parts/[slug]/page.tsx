import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowRight, ChevronRight, ExternalLink, FileSpreadsheet } from "lucide-react";
import { PageSkeleton } from "@/components/layout/PageSkeleton";
import { PartQuote } from "@/components/parts/PartQuote";
import { GuideCard } from "@/components/guides/GuideCard";
import { JsonLd } from "@/components/seo/JsonLd";
import { Badge, Container } from "@/components/ui/Section";
import { TerminalModule } from "@/components/brand/TerminalModule";
import { site } from "@/config/site";
import { getType } from "@/data/types";
import { rfqHref, type BlockFunction, type Product } from "@/data/products";
import { datasheetUrl, equivalents, getPartBySlug, guidesFor, oftenWith, partsWithPages, typeSlugFor } from "@/server/catalog/parts";

const FN_LABEL: Record<BlockFunction, string> = {
  "feed-through": "feed-through terminal block",
  ground: "ground (PE) terminal block",
  fuse: "fuse terminal block",
  disconnect: "disconnect terminal block",
  "multi-level": "multi-level terminal block",
  pcb: "PCB terminal block",
  accessory: "terminal block accessory",
};
const COLOUR: Partial<Record<Product["variant"], string>> = { grey: "Grey", blue: "Blue", ground: "Green-yellow", orange: "Orange", dark: "Black" };

/** "M4/6 GREEN TERMINAL BLOCK" -> "M4/6 green terminal block" (keeps codes like M4/6, AWG, PE readable) */
function tidy(desc: string) {
  const letters = desc.replace(/[^a-z]/gi, "");
  if (!letters || letters !== letters.toUpperCase()) return desc;
  return desc
    .toLowerCase()
    .replace(/\b(awg|pe|led|ul|csa|iec|din|pcb|ac|dc|n|bu|gn|ye|bk|rd|gy)\b/g, (m) => m.toUpperCase())
    .replace(/\b([a-z]{1,4}\d[\w/.,-]*)/g, (m) => m.toUpperCase())
    .replace(/^./, (c) => c.toUpperCase());
}

const name = (p: Product) => `${p.manufacturer} ${p.partNumber}`;
const kind = (p: Product) => (p.series ? `${p.series} ${FN_LABEL[p.fn]}` : FN_LABEL[p.fn]);

function specs(p: Product): [string, string][] {
  const wire = p.wireMax !== null ? (p.wireMin !== null && p.wireMin !== p.wireMax ? `${p.wireMin}–${p.wireMax} mm²` : `${p.wireMax} mm²`) : null;
  const rows: [string, string | null][] = [
    ["Manufacturer", p.manufacturer],
    ["Part number", p.partNumber],
    ["Series", p.series],
    ["Type", FN_LABEL[p.fn].replace(/^./, (c) => c.toUpperCase())],
    ["Connection", p.connection ? p.connection.replace(/^./, (c) => c.toUpperCase()) : null],
    ["Wire range (mm²)", wire],
    ["Wire range (AWG)", p.awg ? `${p.awg} AWG` : null],
    ["Rated current", p.current !== null ? `${p.current} A` : null],
    ["Rated voltage", p.voltage !== null ? `${p.voltage} V` : null],
    ["Width", p.width !== null ? `${p.width} mm` : null],
    ["Levels", p.levels > 1 ? String(p.levels) : null],
    ["Colour", COLOUR[p.variant] ?? null],
    ["Mounting", p.mounting === "din" ? "DIN rail" : p.mounting === "pcb" ? "PCB" : p.mounting === "panel" ? "Panel" : null],
  ];
  return rows.filter((r): r is [string, string] => r[1] !== null && r[1] !== "");
}

export function generateStaticParams() {
  return partsWithPages().map((p) => ({ slug: p.page!.replace("/parts/", "") }));
}

export async function generateMetadata({ params }: PageProps<"/parts/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = getPartBySlug(slug);
  if (!p) return {};
  const title = `${name(p)}${p.series ? ` ${p.series}` : ""} ${FN_LABEL[p.fn]}`.slice(0, 68);
  const key = specs(p)
    .filter(([k]) => ["Wire range (mm²)", "Wire range (AWG)", "Rated current"].includes(k))
    .map(([, v]) => v)
    .join(", ");
  const description = `${name(p)}${key ? ` (${key})` : ""}. ${p.inStock ? "In stock in Canada. " : ""}Specs, matching accessories and a free quote within Canada.`.slice(0, 158);
  return { title, description, alternates: { canonical: `${site.url}${p.page}` }, openGraph: { title, description, images: p.image ? [p.image.src] : undefined } };
}

export default function PartPage({ params }: PageProps<"/parts/[slug]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <PartContent params={params} />
    </Suspense>
  );
}

async function PartContent({ params }: { params: PageProps<"/parts/[slug]">["params"] }) {
  const { slug } = await params;
  const p = getPartBySlug(slug);
  if (!p) notFound();

  const typeSlug = typeSlugFor(p);
  const type = typeSlug ? getType(typeSlug) : undefined;
  const together = oftenWith(p, 4);
  // Equivalents only make sense for blocks; accessories are series-specific
  const equiv = p.fn === "accessory" ? [] : equivalents(p, 3);
  const guides = await guidesFor(typeSlug, 2);
  const rows = specs(p);
  const strip = rows.filter(([k]) => ["Wire range (mm²)", "Wire range (AWG)", "Rated current", "Rated voltage", "Connection", "Width"].includes(k)).slice(0, 4);
  const sheet = datasheetUrl(p);
  const description = tidy(p.description);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: `${name(p)} ${kind(p)}`,
          mpn: p.partNumber,
          brand: { "@type": "Brand", name: p.manufacturer },
          description,
          category: type?.name ?? "Terminal blocks",
          ...(p.image ? { image: `${site.url}${p.image.src}` } : {}),
          url: `${site.url}${p.page}`,
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: site.url },
            { "@type": "ListItem", position: 2, name: "Finder", item: `${site.url}/finder` },
            ...(type ? [{ "@type": "ListItem", position: 3, name: type.name, item: `${site.url}/types/${type.slug}` }] : []),
            { "@type": "ListItem", position: type ? 4 : 3, name: name(p), item: `${site.url}${p.page}` },
          ],
        }}
      />

      <section className="border-b border-line">
        <Container className="py-8 sm:py-12">
          <nav className="flex flex-wrap items-center gap-1.5 text-sm text-steel" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-ink">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/finder" className="hover:text-ink">Finder</Link>
            {type && (
              <>
                <ChevronRight className="h-3 w-3" />
                <Link href={`/types/${type.slug}`} className="hover:text-ink">{type.name}</Link>
              </>
            )}
            <ChevronRight className="h-3 w-3" />
            <span className="text-ink-4">{p.partNumber}</span>
          </nav>

          <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-start">
            <figure>
              <div className="flex aspect-[4/3] items-center justify-center rounded-2xl bg-paper-2/60 p-10">
                {p.image ? (
                  <Image src={p.image.src} alt={`${name(p)} ${kind(p)}`} width={p.image.width} height={p.image.height} sizes="(min-width: 1024px) 520px, 100vw" preload className="h-full w-full object-contain" />
                ) : (
                  <div className="flex gap-[2px]">
                    {[0, 1, 2].map((i) => (
                      <TerminalModule key={i} variant={p.variant} connection={p.connection ?? "push-in"} scale={14} />
                    ))}
                  </div>
                )}
              </div>
              <figcaption className="mt-2 text-xs text-steel">{p.image ? "Image is representative. Colour and details can vary by variant." : "Illustration only."}</figcaption>
            </figure>

            <div>
              <div className="flex flex-wrap items-center gap-3 text-sm text-ink-4">
                <span>{p.manufacturer}</span>
                {p.inStock ? <Badge tone="signal">In stock in Canada</Badge> : <Badge>Available to order</Badge>}
              </div>
              <h1 className="mt-3 text-balance text-[32px] font-medium leading-[1.1] sm:text-[40px] sm:tracking-[-0.02em]">
                {name(p)}{" "}
                <span className="mt-1 block text-[20px] font-normal leading-snug text-ink-4 sm:text-[22px]">{kind(p).replace(/^./, (c) => c.toUpperCase())}</span>
              </h1>
              <p className="mt-4 text-ink-3">{description}</p>

              {strip.length > 0 && (
                <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-line sm:grid-cols-4">
                  {strip.map(([k, v]) => (
                    <div key={k} className="bg-paper p-3">
                      <dt className="text-xs text-steel">{k.replace("Wire range ", "Wire ").replace("Rated ", "")}</dt>
                      <dd className="mt-0.5 font-medium">{v}</dd>
                    </div>
                  ))}
                </dl>
              )}

              <div className="mt-7">
                <PartQuote partNumber={p.partNumber} manufacturer={p.manufacturer} />
                <p className="mt-3 text-sm text-steel">Free, no obligation. Quotes come from our featured supplier, {site.featuredSupplier.name}, with price and lead time.</p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-12 sm:py-16">
        <Container className="grid gap-12 lg:grid-cols-[1.4fr_1fr]">
          <div className="min-w-0 space-y-12">
            <div>
              <h2 className="text-2xl font-medium">Specifications</h2>
              <dl className="mt-5 divide-y divide-line overflow-hidden rounded-2xl border border-line">
                {rows.map(([k, v]) => (
                  <div key={k} className="grid grid-cols-[1fr_1.2fr] gap-4 px-4 py-3 text-sm">
                    <dt className="text-ink-4">{k}</dt>
                    <dd className="font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-3 text-xs leading-relaxed text-steel">
                From the featured supplier&apos;s catalog. Always confirm ratings, conductor ranges and approvals against the manufacturer&apos;s datasheet before ordering.
                {sheet && (
                  <>
                    {" "}
                    <a href={sheet} target="_blank" rel="noopener nofollow" className="inline-flex items-center gap-1 underline hover:text-ink">
                      Manufacturer product page <ExternalLink className="h-3 w-3" />
                    </a>
                  </>
                )}
              </p>
            </div>

            {together.length > 0 && (
              <div>
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-medium">Often ordered with</h2>
                    <p className="mt-1 text-sm text-ink-4">Parts that buyers regularly order together with the {p.partNumber}.</p>
                  </div>
                  <Link href={rfqHref([p, ...together])} className="inline-flex items-center gap-1.5 text-sm font-medium hover:text-signal">
                    Quote all {together.length + 1} together <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
                <PartGrid parts={together} />
              </div>
            )}

            {equiv.length > 0 && (
              <div>
                <h2 className="text-2xl font-medium">Possible equivalents</h2>
                <p className="mt-1 text-sm text-ink-4">Similar parts from other manufacturers. Check dimensions, ratings and accessories before substituting.</p>
                <PartGrid parts={equiv} />
              </div>
            )}
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl bg-ink p-6 text-[#efe9de]">
              <div className="flex items-center gap-2 text-sm text-[#8a847a]">
                <FileSpreadsheet className="h-4 w-4" /> Ordering a full strip?
              </div>
              <h3 className="mt-2 text-lg font-medium leading-snug">Send the whole BOM in one request</h3>
              <p className="mt-2 text-sm text-[#aaa398]">Blocks, end plates, jumpers, markers and rail, quoted together.</p>
              <Link href="/rfq#bom" className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-signal font-medium text-white hover:bg-signal-dark">
                Upload a BOM <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            {type && (
              <Link href={`/types/${type.slug}`} className="block rounded-2xl p-5 shadow-[inset_0_0_0_1px_var(--color-line)] transition-shadow hover:shadow-[inset_0_0_0_1px_var(--color-steel-light)]">
                <div className="text-sm text-steel">About this type</div>
                <div className="mt-1 font-medium">{type.name}</div>
                <p className="mt-1 text-sm text-ink-4">{type.short}</p>
              </Link>
            )}
          </aside>
        </Container>
      </section>

      {guides.length > 0 && (
        <section className="border-t border-line bg-paper-2/50 py-12 sm:py-16">
          <Container>
            <h2 className="text-2xl font-medium">Related guides</h2>
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              {guides.map((g, i) => (
                <GuideCard key={g.slug} g={g} index={i} />
              ))}
            </div>
          </Container>
        </section>
      )}
    </>
  );
}

function PartGrid({ parts }: { parts: Product[] }) {
  return (
    <ul className="mt-5 grid gap-3 sm:grid-cols-2">
      {parts.map((x) => {
        const body = (
          <>
            <div className="flex h-16 w-20 shrink-0 items-center justify-center rounded-lg bg-paper-2/60 p-1.5">
              {x.image ? (
                <Image src={x.image.src} alt="" width={x.image.width} height={x.image.height} sizes="80px" className="h-full w-full object-contain" />
              ) : (
                <TerminalModule variant={x.variant} connection={x.connection ?? "push-in"} scale={5} />
              )}
            </div>
            <div className="min-w-0">
              <div className="text-xs text-steel">{x.manufacturer}</div>
              <div className="font-mono text-sm font-medium">{x.partNumber}</div>
              <div className="line-clamp-1 text-xs text-ink-4">{tidy(x.description)}</div>
            </div>
          </>
        );
        return (
          <li key={x.id}>
            {x.page ? (
              <Link href={x.page} className="flex items-center gap-3 rounded-xl p-3 shadow-[inset_0_0_0_1px_var(--color-line)] transition-shadow hover:shadow-[inset_0_0_0_1px_var(--color-steel-light)]">
                {body}
              </Link>
            ) : (
              <div className="flex items-center gap-3 rounded-xl p-3 shadow-[inset_0_0_0_1px_var(--color-line)]">{body}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
