import { getPhoto, type Photo } from "@/data/photos";
import { ProductPhoto } from "@/components/ui/ProductPhoto";
import { Container, Eyebrow, Marker } from "@/components/ui/Section";
import { QuickRfq } from "./QuickRfq";

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
          <Eyebrow code="RFQ" tone="light">
            Terminal block sourcing for Canadian industry
          </Eyebrow>
          <h1 className="mt-6 max-w-[14ch] text-balance text-[40px] font-medium leading-[1.04] text-[#efe9de] sm:text-[56px] sm:tracking-[-0.02em] lg:text-[64px] lg:tracking-[-0.03em]">
            Stop emailing five suppliers. Send one RFQ
          </h1>
          <p className="mt-6 max-w-[36rem] text-pretty text-lg leading-[1.6] text-[#aaa398]">
            Paste part numbers, drop a BOM or upload a photo. Our sourcing desk identifies each part, checks equivalents and replies with
            options from one place.
          </p>

          <div className="mt-10">
            <QuickRfq />
          </div>
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

          {/* RFQ in progress — what the product actually returns */}
          <div className="absolute -bottom-8 right-0 hidden w-64 text-[13px] lg:block">
            <div className="rounded-[0.8em] bg-paper p-[1em] text-ink shadow-[0_8px_24px_rgba(0,0,0,0.25)]">
              <div className="flex items-center justify-between text-[0.8em] text-ink-4">
                <Marker className="!h-[1.7em] !text-[1em]">RFQ-TB-2481</Marker>
                <span className="flex items-center gap-[0.4em]">
                  <span className="h-[0.5em] w-[0.5em] rounded-full bg-ok" /> Sourcing
                </span>
              </div>
              <div className="mt-[0.7em] space-y-[0.35em] text-[0.85em]">
                {[
                  ["PT 2,5 grey", "200", true],
                  ["PT 2,5-PE", "40", true],
                  ["UK 5-HESI fuse", "24", false],
                ].map(([name, qty, done]) => (
                  <div key={name as string} className="flex items-center justify-between gap-2 rounded-[0.35em] bg-paper-2 px-[0.6em] py-[0.4em]">
                    <span>{name}</span>
                    <span className="flex items-center gap-[0.6em] font-mono tabular-nums text-ink-4">
                      ×{qty}
                      <span className={done ? "text-ok" : "text-steel"}>{done ? "Matched" : "Checking"}</span>
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-[0.7em] text-[0.8em] text-ink-4">4 sources found, 1 equivalent to review</div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
