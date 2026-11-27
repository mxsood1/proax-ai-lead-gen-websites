import { existsSync, openSync, readSync, closeSync } from "node:fs";
import path from "node:path";
import type { CSSProperties } from "react";
import { site } from "@/config/site";
import { stripBrands } from "@/data/brands";
import { cn } from "@/lib/cn";

/**
 * Slowly scrolling strip of the brands we source.
 *
 * Logos: drop an official file into public/brands/ named after the brand,
 * e.g. public/brands/phoenix-contact.svg (svg, png or webp). Brands without a
 * file show their name as a clean wordmark, so the strip always looks complete.
 */
export const brandSlug = (name: string) =>
  name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const LOGO_DIR = path.join(/* turbopackIgnore: true */ process.cwd(), "public", "brands");

type Logo = { src: string; width: number; height: number };

/** Read a PNG's pixel size from its header (no image library needed). */
function pngSize(file: string): [number, number] | null {
  const fd = openSync(file, "r");
  try {
    const head = Buffer.alloc(24);
    readSync(fd, head, 0, 24, 0);
    if (head.readUInt32BE(0) !== 0x89504e47) return null;
    return [head.readUInt32BE(16), head.readUInt32BE(20)];
  } finally {
    closeSync(fd);
  }
}

/**
 * Optical sizing: give every logo roughly the same visual area, so wide
 * wordmarks don't overpower compact marks. Capped to fit the strip.
 */
const AREA = 2800;
function sized(src: string, w: number, h: number): Logo {
  const ratio = w / h;
  let height = Math.sqrt(AREA / ratio);
  let width = height * ratio;
  if (height > 36) [height, width] = [36, 36 * ratio];
  if (width > 150) [height, width] = [150 / ratio, 150];
  return { src, width: Math.round(width), height: Math.round(height) };
}

function findLogo(name: string): Logo | null {
  for (const ext of ["png", "webp", "svg"]) {
    const file = `${brandSlug(name)}.${ext}`;
    const full = path.join(LOGO_DIR, file);
    if (!existsSync(full)) continue;
    const size = ext === "png" ? pngSize(full) : null;
    return size ? sized(`/brands/${file}`, size[0], size[1]) : { src: `/brands/${file}`, width: 110, height: 32 };
  }
  return null;
}

function BrandItem({ name, logo }: { name: string; logo: Logo | null }) {
  return (
    <li className="flex h-14 shrink-0 items-center justify-center px-8 sm:px-11">
      {logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logo.src}
          alt={name}
          width={logo.width}
          height={logo.height}
          loading="lazy"
          style={{ width: logo.width, height: logo.height }}
          className="object-contain opacity-55 grayscale transition-[filter,opacity] duration-200 hover:opacity-100 hover:grayscale-0"
        />
      ) : (
        <span className="whitespace-nowrap text-lg font-semibold tracking-[-0.01em] text-ink/40 transition-colors duration-200 hover:text-ink/80">
          {name}
        </span>
      )}
    </li>
  );
}

/** Cached so the file lookups run once at build time, not while the page is rendered. */
async function loadBrands(names: readonly string[], showLogos: boolean) {
  "use cache";
  return names.map((name) => ({ name, logo: showLogos ? findLogo(name) : null }));
}

export async function BrandsMarquee() {
  const brands = await loadBrands(stripBrands, site.showBrandLogos);
  // ~5 seconds per brand keeps the pace slow and steady whatever the list length
  const style = { "--marquee-duration": `${Math.max(30, brands.length * 5)}s` } as CSSProperties;

  return (
    <section className="border-b border-line bg-paper py-10" aria-labelledby="brands-heading">
      <p id="brands-heading" className="text-center text-sm text-steel">
        Brands we compare
      </p>
      <div className="group relative mt-6 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]">
        <div
          style={style}
          className="flex w-max animate-marquee group-hover:[animation-play-state:paused] motion-reduce:w-full motion-reduce:animate-none motion-reduce:justify-center"
        >
          <ul className="flex shrink-0 items-center motion-reduce:flex-wrap motion-reduce:justify-center">
            {brands.map((b) => (
              <BrandItem key={b.name} {...b} />
            ))}
          </ul>
          {/* Second copy makes the loop seamless; hidden from screen readers and when motion is reduced */}
          <ul className={cn("flex shrink-0 items-center motion-reduce:hidden")} aria-hidden="true">
            {brands.map((b) => (
              <BrandItem key={b.name} {...b} />
            ))}
          </ul>
        </div>
      </div>
      <p className="mx-auto mt-6 max-w-2xl px-4 text-center text-xs text-steel">
        Trademarks belong to their owners and are shown to identify products only. No endorsement or affiliation is implied.
      </p>
    </section>
  );
}
