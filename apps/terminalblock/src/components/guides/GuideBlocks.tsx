import { Lightbulb } from "lucide-react";
import type { GuideBlock } from "@/data/guides";

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
