import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Guide } from "@/data/guides";
import { getPhoto } from "@/data/photos";
import { TerminalModule, type ModuleVariant } from "@/components/brand/TerminalModule";
import { Marker } from "@/components/ui/Section";

const visual: Record<Guide["category"], { variant: ModuleVariant; connection: "push-in" | "screw" | "spring" }[]> = {
  Selection: [
    { variant: "grey", connection: "screw" },
    { variant: "grey", connection: "spring" },
    { variant: "grey", connection: "push-in" },
  ],
  Sizing: [
    { variant: "grey", connection: "push-in" },
    { variant: "grey", connection: "push-in" },
    { variant: "blue", connection: "push-in" },
  ],
  Checklist: [
    { variant: "grey", connection: "push-in" },
    { variant: "ground", connection: "push-in" },
    { variant: "dark", connection: "push-in" },
  ],
};

/** Article card. Shows a real product image of the article's main topic when one exists. */
export function GuideCard({ g, index = 0 }: { g: Guide; index?: number }) {
  const photo = g.related?.map((slug) => getPhoto(slug)).find((p) => p?.cutout) ?? null;
  return (
    <Link
      href={`/guides/${g.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl bg-paper shadow-[inset_0_0_0_1px_var(--color-line)] transition-shadow duration-150 hover:shadow-[inset_0_0_0_1px_var(--color-steel-light)]"
    >
      <div className="relative flex h-40 items-center justify-center border-b border-line bg-paper-2/40">
        {photo ? (
          <Image
            src={photo.src}
            alt=""
            width={photo.width}
            height={photo.height}
            sizes="220px"
            className="h-full w-full object-contain px-12 pb-4 pt-9 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
          />
        ) : (
          <>
            <div className="din-rail absolute inset-x-0 top-1/2 h-5 -translate-y-1/2 opacity-70" />
            <div className="relative flex gap-[2px]">
              {visual[g.category].map((m, i) => (
                <TerminalModule key={i} variant={m.variant} connection={m.connection} scale={9.5} />
              ))}
            </div>
          </>
        )}
        <Marker className="absolute left-3 top-3">{`G-${String(index + 1).padStart(2, "0")}`}</Marker>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <div className="text-xs text-steel">
          {g.category} · {g.readMinutes} min read{g.published ? ` · ${fmtDay(g.published)}` : ""}
        </div>
        <h3 className="mt-2 text-lg font-medium leading-snug">{g.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-4">{g.description}</p>
        <div className="mt-auto flex justify-end pt-5">
          <ArrowRight className="h-[18px] w-[18px] text-steel transition-colors group-hover:text-ink" />
        </div>
      </div>
    </Link>
  );
}

/** "2026-11-24" -> "Nov 24, 2026" (fixed locale and time zone, so server and browser agree) */
function fmtDay(day: string) {
  return new Date(`${day}T12:00:00Z`).toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}
