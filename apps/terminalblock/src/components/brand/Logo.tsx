import Link from "next/link";
import { site } from "@/config/site";
import { cn } from "@/lib/cn";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 34 30" className={cn("h-7 w-auto", className)} aria-hidden="true">
      <rect x="0" y="12" width="34" height="6" rx="1" fill="#9aa1aa" />
      <rect x="2" y="2" width="9" height="26" rx="2" fill="#b8bdc4" />
      <rect x="12.5" y="2" width="9" height="26" rx="2" fill="#2f6fd6" />
      <rect x="23" y="2" width="9" height="26" rx="2" fill="#2c9a47" />
      <rect x="23" y="11" width="9" height="8" fill="#f2c418" />
      <rect x="4.5" y="5" width="4" height="3" rx="0.6" fill="#111317" />
      <rect x="15" y="5" width="4" height="3" rx="0.6" fill="#111317" />
      <rect x="25.5" y="5" width="4" height="3" rx="0.6" fill="#111317" />
      <rect x="4.5" y="9" width="4" height="2" rx="0.5" fill="#ff5a1f" />
      <rect x="15" y="9" width="4" height="2" rx="0.5" fill="#ff5a1f" />
      <rect x="25.5" y="9" width="4" height="2" rx="0.5" fill="#ff5a1f" />
    </svg>
  );
}

export function Logo({ tone = "dark", className }: { tone?: "dark" | "light"; className?: string }) {
  return (
    <Link href="/" className={cn("group inline-flex items-center gap-2.5", className)} aria-label={`${site.name} home`}>
      <LogoMark />
      <span className={cn("text-[17px] font-medium", tone === "dark" ? "text-ink" : "text-[#efe9de]")}>
        {site.wordmark.main}
        <span className={tone === "dark" ? "text-steel" : "text-[#8a847a]"}>{site.wordmark.tld}</span>
      </span>
    </Link>
  );
}
