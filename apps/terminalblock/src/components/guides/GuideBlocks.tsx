import Image from "next/image";
import { Lightbulb } from "lucide-react";
import type { GuideBlock } from "@/data/guides";
import { getPhoto, type Photo } from "@/data/photos";
import { cn } from "@/lib/cn";

/** Renders guide content blocks. Used by the public guide pages and the desk preview. */
export function GuideBlocks({ blocks }: { blocks: GuideBlock[] }) {
  return (
    <div className="prose-tb text-[17px]">
      {blocks.map((b, i) => (
        <Block key={i} b={b} />
      ))}
    </div>
  );
}

function Block({ b }: { b: GuideBlock }) {
  switch (b.type) {
    case "h2":
      return <h2>{b.text}</h2>;
    case "h3":
      return <h3>{b.text}</h3>;
    case "p":
      return <p>{b.text}</p>;
    case "ul":
      return (
        <ul>
          {b.items.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ul>
      );
    case "callout":
      return (
        <div className="my-8 rounded-2xl bg-paper-2 p-5 shadow-[inset_0_0_0_1px_var(--color-line)]">
          <div className="flex items-center gap-2 font-medium">
            <Lightbulb className="h-[18px] w-[18px] text-steel" /> {b.title}
          </div>
          <p className="!mb-0 mt-2">{b.text}</p>
        </div>
      );
    case "image": {
      const photos = b.photos.map((id) => getPhoto(id)).filter((p): p is Photo => Boolean(p));
      if (!photos.length) return null;
      return (
        <figure className="not-prose my-8">
          <div className={cn("grid gap-3", photos.length === 2 && "grid-cols-2", photos.length >= 3 && "grid-cols-3")}>
            {photos.map((p) => (
              <div key={p.src} className="rounded-2xl bg-paper-2/70 shadow-[inset_0_0_0_1px_var(--color-line)]">
                <div className={cn("relative", photos.length === 1 ? "aspect-[16/9]" : "aspect-square")}>
                  <Image
                    src={p.src}
                    alt={p.alt}
                    fill
                    sizes={photos.length === 1 ? "(min-width: 1024px) 720px, 100vw" : "(min-width: 1024px) 240px, 33vw"}
                    className={p.cutout ? "object-contain p-[12%]" : "rounded-2xl object-cover"}
                  />
                </div>
                {photos.length > 1 && p.part && <div className="border-t border-line px-3 py-2 text-center text-xs text-ink-4">{p.part}</div>}
              </div>
            ))}
          </div>
          {(b.caption || (photos.length === 1 && photos[0].part)) && (
            <figcaption className="mt-3 text-sm text-steel">
              {b.caption}
              {photos.length === 1 && photos[0].part ? `${b.caption ? " " : ""}Shown: ${photos[0].part}.` : ""}
            </figcaption>
          )}
        </figure>
      );
    }
    case "table":
      return (
        <div className="my-6 overflow-x-auto rounded-xl shadow-[inset_0_0_0_1px_var(--color-line)]">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line bg-paper-2 text-xs text-ink-4">
              <tr>
                {b.head.map((h, i) => (
                  <th key={i} className="px-4 py-3 font-normal">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {b.rows.map((r, i) => (
                <tr key={i}>
                  {r.map((c, j) => (
                    <td key={j} className={j === 0 ? "px-4 py-3 font-medium" : "px-4 py-3 text-ink-4"}>
                      {c}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
  }
}
