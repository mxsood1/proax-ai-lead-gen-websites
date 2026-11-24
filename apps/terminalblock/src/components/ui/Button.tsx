import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "signal" | "ink" | "outline" | "ghost-light" | "outline-light";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  signal: "bg-signal text-white hover:bg-signal-dark",
  ink: "bg-ink text-[#efe9de] hover:bg-ink-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]",
  outline: "bg-paper text-ink shadow-[inset_0_0_0_1px_var(--color-line)] hover:bg-paper-2",
  "outline-light": "bg-ink-3 text-[#efe9de] shadow-[inset_0_0_0_1px_rgba(239,233,222,0.12)] hover:bg-[#38342e]",
  "ghost-light": "text-[#aaa398] hover:text-[#efe9de] hover:bg-ink-3",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-[15px]",
  lg: "h-12 px-5 text-[15px]",
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-[background-color,color,transform] duration-150 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal";

export function buttonClass(variant: Variant = "signal", size: Size = "md", className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

export function ButtonLink({
  href,
  variant,
  size,
  className,
  children,
}: {
  href: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={buttonClass(variant, size, className)}>
      {children}
    </Link>
  );
}

export function Button({
  variant,
  size,
  className,
  ...props
}: ComponentProps<"button"> & { variant?: Variant; size?: Size }) {
  return <button className={buttonClass(variant, size, className)} {...props} />;
}
