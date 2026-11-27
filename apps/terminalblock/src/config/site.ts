/**
 * Site configuration — the only file that should change (along with /data)
 * when this foundation is reused for the next domain (contactors.ca, etc.).
 *
 * The site is a stand-alone comparison and buying-guide site: it covers every
 * major brand and isn't presented as part of any distributor.
 */
export const site = {
  name: "TerminalBlock.ca",
  wordmark: { main: "TerminalBlock", tld: ".ca" },
  domain: "terminalblock.ca",
  url: "https://terminalblock.ca",
  category: "terminal blocks",
  categorySingular: "terminal block",
  tagline: "Compare terminal blocks across every major brand.",
  description:
    "Side-by-side comparisons of Phoenix Contact, Weidmüller, WAGO, Schneider Electric, ABB and other terminal block brands, with plain guides to help you choose.",
  /**
   * Legal name and contact for the privacy policy. Must be filled in before
   * launch (Canadian privacy law requires naming who handles personal info).
   */
  legal: { entity: "", contactEmail: "" },
  /**
   * Manufacturer logos in the homepage strip. Logos are trademarks: set to
   * false to show plain brand names instead.
   */
  showBrandLogos: true,
  /** Prefix for lead references (questions and guide downloads) */
  rfqPrefix: "TB",
  year: 2026,
  nav: [
    { href: "/compare", label: "Compare brands" },
    { href: "/types", label: "Types" },
    { href: "/guides", label: "Guides" },
    { href: "/about", label: "How we compare" },
  ],
} as const;

export type Site = typeof site;
