import type { ReactNode } from "react";
import Image from "next/image";
import { Container, Eyebrow } from "@/components/ui/Section";
import type { ModuleVariant } from "@/components/brand/TerminalModule";
import { getPhoto } from "@/data/photos";

/**
 * Page header on warm ink. With `image`, a real photo sits behind it under a colour tint:
 * a warm accent wash plus a dark layer that is strongest behind the text, so it stays readable.
 */
export function PageHeader({
  code,
  eyebrow,
  title,
  lede,
  children,
  image,
  imagePosition = "center",
}: {
  code?: string;
  eyebrow: string;
  title: ReactNode;
  lede?: ReactNode;
  children?: ReactNode;
  /** id of a background photo in src/data/photos.json (e.g. "header-finder") */
  image?: string;
  /** CSS object-position for the photo, to keep the interesting part in view */
  imagePosition?: string;
  /** @deprecated decoration removed in the unslop pass; kept so callers compile */
  rail?: ModuleVariant[];
}) {
  const photo = image ? getPhoto(image) : null;
  return (
    <section className="blueprint relative isolate overflow-hidden text-[#efe9de]">
      {photo && (
        <div className="absolute inset-0 -z-10" aria-hidden="true">
          <Image src={photo.src} alt="" fill sizes="100vw" preload className="object-cover grayscale-[40%]" style={{ objectPosition: imagePosition }} />
          {/* colour tint: warm accent wash, then the site's ink */}
          <div className="absolute inset-0 bg-signal mix-blend-color opacity-40" />
          <div className="absolute inset-0 bg-ink/70" />
          {/* extra depth behind the text on the left */}
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgb(27_25_21/0.85)_0%,rgb(27_25_21/0.55)_45%,rgb(27_25_21/0)_100%)]" />
        </div>
      )}
      <Container className="relative py-16 sm:py-20">
        <Eyebrow code={code} tone="light">
          {eyebrow}
        </Eyebrow>
        <h1 className="mt-5 max-w-3xl text-balance text-[36px] font-medium leading-[1.08] sm:text-[48px] sm:tracking-[-0.02em]">{title}</h1>
        {lede && <p className="mt-5 max-w-[36rem] text-pretty text-lg leading-relaxed text-[#c9c2b6]">{lede}</p>}
        {children && <div className="mt-8">{children}</div>}
      </Container>
    </section>
  );
}
