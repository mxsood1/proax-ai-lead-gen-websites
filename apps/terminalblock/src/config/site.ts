/**
 * Site configuration — the only file that should change (along with /data)
 * when this foundation is reused for the next domain (contactors.ca, etc.).
 */
export const site = {
  name: "TerminalBlock.ca",
  wordmark: { main: "TerminalBlock", tld: ".ca" },
  domain: "terminalblock.ca",
  url: "https://terminalblock.ca",
  category: "terminal blocks",
  categorySingular: "terminal block",
  tagline: "One RFQ. Every terminal block supplier.",
  description:
    "Stop emailing multiple suppliers. Submit your terminal block requirements once — part numbers, BOMs or a photo — and get sourcing options from one desk.",
  /**
   * Legal entity responsible for the site and the personal information sent
   * through it. Used only where the law needs it (privacy policy, terms).
   */
  operator: "Proax Technologies Ltd.",
  /**
   * How Proax appears in public copy: as the featured supplier that prepares
   * and fulfils quotes, not as the site's brand.
   */
  featuredSupplier: {
    name: "Proax Technologies",
    legalName: "Proax Technologies Ltd.",
    url: "https://www.proax.ca",
    blurb: "Canadian industrial automation distributor",
    /** Official logo from proax.ca (dark colours: show it on a light tile). Swap for a larger PNG/SVG from marketing for sharper display. */
    logo: { src: "/brands/proax-featured-supplier.png", width: 200, height: 54 },
    /** One-colour black version of the same logo, for light backgrounds */
    logoDark: { src: "/brands/proax-featured-supplier-black.png", width: 200, height: 54 },
  },
  /**
   * Manufacturer logos in the homepage strip. Logos are trademarks and some
   * vendor agreements limit where they may appear: set to false to show plain
   * brand names until Proax marketing confirms the logos are OK to use.
   */
  showBrandLogos: true,
  rfqPrefix: "TB",
  year: 2026,
  nav: [
    { href: "/finder", label: "Finder" },
    { href: "/identify", label: "Identify a part" },
    { href: "/types", label: "Types" },
    { href: "/guides", label: "Guides" },
    { href: "/about", label: "How it works" },
  ],
  brandsWeSource: [
    "Phoenix Contact",
    "WAGO",
    "Weidmüller",
    "ABB Entrelec",
    "Allen-Bradley",
    "Eaton",
    "Siemens",
    "Schneider Electric",
    "Altech",
    "Dinkle",
    "IDEC",
    "Wieland",
  ],
} as const;

export type Site = typeof site;
