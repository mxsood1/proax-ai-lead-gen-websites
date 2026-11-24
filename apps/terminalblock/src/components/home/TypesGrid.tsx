import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { productTypes } from "@/data/types";
import { TerminalModule } from "@/components/brand/TerminalModule";
import { ProductPhoto } from "@/components/ui/ProductPhoto";
import { getPhoto } from "@/data/photos";
import { cn } from "@/lib/cn";
import { Container, Marker, SectionHeading } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";

export function TypeCard({ t }: { t: (typeof productTypes)[number] }) {
  const photo = getPhoto(t.slug);
  return (
    <Link
      href={`/types/${t.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl bg-paper shadow-[inset_0_0_0_1px_var(--color-line)] transition-shadow duration-150 hover:shadow-[inset_0_0_0_1px_var(--color-steel-light)]"
    >
      <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden border-b border-line bg-paper-2/40">
        {photo ? (
          <ProductPhoto
            photo={photo}
            sizes="(min-width: 1024px) 240px, (min-width: 768px) 33vw, 50vw"
            className={cn("transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]", photo.cutout && "p-6 pt-9")}
          />
        ) : (
          <>
            <div className="din-rail absolute inset-x-0 top-1/2 h-5 -translate-y-1/2 opacity-70" />
            <div className="relative flex gap-[2px]">
              <TerminalModule {...t.visual} scale={9.5} />
              <TerminalModule {...t.visual} scale={9.5} />
              <TerminalModule {...t.visual} scale={9.5} />
            </div>
          </>
        )}
        <Marker className="absolute left-3 top-3">{t.code}</Marker>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-medium leading-snug">{t.name}</h3>
        <p className="mt-1.5 text-sm leading-snug text-ink-4">{t.short}</p>
      </div>
    </Link>
  );
}

export function TypesGrid() {
  return (
    <section className="border-t border-line py-24 sm:py-32">
      <Container>
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading
            eyebrow="Browse by type"
            title="Every block on the rail"
            lede="From feed-through to fuse, PCB to barrier strip, plus the accessories that complete the assembly."
          />
          <ButtonLink href="/types" variant="outline" className="shrink-0">
            All types <ArrowRight className="h-4 w-4" />
          </ButtonLink>
        </div>
        <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {productTypes.map((t) => (
            <TypeCard key={t.slug} t={t} />
          ))}
        </div>
      </Container>
    </section>
  );
}
