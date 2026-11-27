import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getPhoto, type Photo } from "@/data/photos";
import { getBrand, pairSlug, popularPairs } from "@/data/brands";
import { ProductPhoto } from "@/components/ui/ProductPhoto";
import { ButtonLink } from "@/components/ui/Button";
import { Container, Eyebrow } from "@/components/ui/Section";

// Back to front: green-yellow PE, blue N, grey feed-through, staggered like blocks fanned out on a bench
const LAYOUT = [
  { id: "hero-pe", className: "right-0 top-0 w-[56%]" },
  { id: "hero-blue", className: "left-[22%] top-[15%] w-[56%]" },
  { id: "hero-grey", className: "left-0 top-[31%] w-[58%]" },
];

export function Hero() {
  const blocks = LAYOUT.flatMap(({ id, className }) => {
    const photo = getPhoto(id);
    return photo ? [{ photo, className } as { photo: Photo; className: string }] : [];
  });
  return (
    <section className="blueprint relative overflow-hidden text-white">
      <Container className="relative grid min-h-[calc(100svh-64px)] items-center gap-12 py-16 sm:py-20 lg:grid-cols-[1fr_1fr] lg:gap-8 lg:py-24">
        <div className="animate-fade-up">
          <Eyebrow tone="light">Terminal block comparisons and buying guides</Eyebrow>
          <h1 className="mt-6 max-w-[15ch] text-balance text-[40px] font-medium leading-[1.04] text-[#efe9de] sm:text-[56px] sm:tracking-[-0.02em] lg:text-[64px] lg:tracking-[-0.03em]">
            Compare terminal blocks across every major brand
          </h1>
          <p className="mt-6 max-w-[36rem] text-pretty text-lg leading-[1.6] text-[#aaa398]">
            Phoenix Contact, Weidmüller, WAGO, Schneider Electric, ABB and more, side by side for push-in, spring, screw and special-function blocks.
            Strengths and things to check for every brand, based on what the manufacturers publish.
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <ButtonLink href="/compare" size="lg">
              Compare brands <ArrowRight className="h-5 w-5" />
            </ButtonLink>
            <ButtonLink href="/guides" variant="outline-light" size="lg">
              Read the guides
            </ButtonLink>
          </div>

          <div className="mt-10 text-sm text-[#8a847a]">Popular comparisons</div>
          <ul className="mt-3 flex flex-col gap-2 text-[15px]">
            {popularPairs.slice(0, 3).map(([x, y]) => (
              <li key={pairSlug(x, y)}>
                <Link href={`/compare/${pairSlug(x, y)}`} className="text-[#efe9de] underline decoration-[#efe9de]/25 underline-offset-4 transition-colors hover:decoration-[#efe9de]">
                  {getBrand(x)!.name} vs {getBrand(y)!.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* The one bright element: real terminal blocks, fanned out */}
        <div className="relative lg:pl-8">
          {blocks.length === 3 ? (
            <figure className="relative">
              <div className="relative aspect-[5/4]">
                {blocks.map(({ photo, className }, i) => (
                  <div key={photo.src + i} className={`absolute animate-fade-up ${className}`} style={{ animationDelay: `${120 + i * 90}ms` }}>
                    <ProductPhoto
                      photo={photo}
                      sizes="(min-width: 1024px) 340px, 60vw"
                      preload={i === 2}
                      className="drop-shadow-[0_18px_28px_rgba(0,0,0,0.45)]"
                    />
                  </div>
                ))}
              </div>
              <figcaption className="mt-4 text-xs text-[#8a847a]">Push-in terminal blocks in grey, blue (N) and green-yellow (PE)</figcaption>
            </figure>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
