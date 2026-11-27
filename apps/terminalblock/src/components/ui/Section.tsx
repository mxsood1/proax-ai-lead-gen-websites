import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Container({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className)}>{children}</div>;
}

/** Signature: a printed terminal marker tag (white, hairline, mono) next to a quiet label. */
export function Marker({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn("marker", className)}>{children}</span>;
}

/** Small label above a heading. `code` is ignored: code badges like "TB-01" were removed as decoration. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- code kept so existing callers compile
export function Eyebrow({ code, children, tone = "dark" }: { code?: string; children: ReactNode; tone?: "dark" | "light" }) {
  return <div className={cn("inline-flex items-center gap-2 text-sm", tone === "dark" ? "text-ink-4" : "text-white/60")}>{children}</div>;
}

export function SectionHeading({
  code,
  eyebrow,
  title,
  lede,
  tone = "dark",
  align = "left",
  className,
}: {
  code?: string;
  eyebrow?: string;
  title: ReactNode;
  lede?: ReactNode;
  tone?: "dark" | "light";
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && <Eyebrow code={code} tone={tone}>{eyebrow}</Eyebrow>}
      <h2
        className={cn(
          "mt-4 text-balance text-[32px] font-medium leading-[1.1] sm:text-[40px] sm:tracking-[-0.02em]",
          tone === "dark" ? "text-ink" : "text-white",
        )}
      >
        {title}
      </h2>
      {lede && <p className={cn("mt-4 max-w-xl text-pretty text-lg leading-relaxed", tone === "dark" ? "text-ink-4" : "text-white/65")}>{lede}</p>}
    </div>
  );
}

/** Quiet status text with a small dot — not a pill. */
export function Badge({ children, tone = "neutral", className }: { children: ReactNode; tone?: "neutral" | "signal" | "demo" | "demo-dark"; className?: string }) {
  const dot = {
    neutral: "bg-steel",
    signal: "bg-ok",
    demo: "bg-tb-yellow",
    "demo-dark": "bg-tb-yellow",
  }[tone];
  const text = tone === "demo-dark" ? "text-white/60" : "text-ink-4";
  return (
    <span className={cn("inline-flex items-center gap-2 font-mono text-xs", text, className)}>
      <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", dot)} />
      {children}
    </span>
  );
}
