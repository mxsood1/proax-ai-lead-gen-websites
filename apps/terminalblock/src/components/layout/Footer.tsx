import Link from "next/link";
import { site } from "@/config/site";
import { productTypes } from "@/data/types";
import { guides } from "@/data/guides";
import { getBrand, pairSlug, popularPairs } from "@/data/brands";
import { Logo } from "@/components/brand/Logo";
import { Container } from "@/components/ui/Section";

export function Footer() {
  const cols = [
    {
      title: "Compare",
      links: [
        { href: "/compare", label: "All brands side by side" },
        ...popularPairs.slice(0, 3).map(([a, b]) => ({ href: `/compare/${pairSlug(a, b)}`, label: `${getBrand(a)!.name} vs ${getBrand(b)!.name}` })),
      ],
    },
    {
      title: "Product types",
      links: productTypes.slice(0, 6).map((t) => ({ href: `/types/${t.slug}`, label: t.name })),
    },
    {
      title: "Guides",
      links: guides.map((g) => ({ href: `/guides/${g.slug}`, label: g.shortTitle })),
    },
    {
      title: "About",
      links: [
        { href: "/about", label: "How we compare" },
        { href: "#ask", label: "Ask a question" },
        { href: "/privacy", label: "Privacy" },
        { href: "/terms", label: "Terms" },
      ],
    },
  ];

  return (
    <footer className="blueprint mt-auto text-[#efe9de]">
      <Container className="py-16">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_2fr]">
          <div>
            <Logo tone="light" />
            <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-[#aaa398]">
              Terminal block brands compared side by side, with plain guides to help you choose the right block.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {cols.map((col) => (
              <div key={col.title}>
                <h3 className="text-sm text-[#8a847a]">{col.title}</h3>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="text-sm text-[#aaa398] transition-colors hover:text-[#efe9de]">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-8 text-xs leading-relaxed text-white/45 md:flex-row md:items-start md:justify-between">
          <p className="max-w-3xl">
            © {site.year} {site.name}. Comparisons are based on published manufacturer information; always confirm specifications on the datasheet.
            Questions you send are handled under our{" "}
            <Link href="/privacy" className="underline hover:text-white">
              privacy policy
            </Link>
            . Manufacturer names and logos are trademarks of their respective owners and are used for identification only; showing a brand
            does not mean it endorses or is affiliated with this site.
          </p>
          <p className="shrink-0">Made in Canada</p>
        </div>
      </Container>
    </footer>
  );
}
