/**
 * "Where to buy" links shown at the end of guides, by product type.
 *
 * The plan from the meeting: most guides link to the matching category page
 * on the distributor's website (for example its terminal block or push-in
 * terminal block category). Paste the exact category URLs here; a guide only
 * shows the link when its topic has one. Empty = nothing is shown.
 */
export type BuyLink = { label: string; href: string };

export const buyLinks: Record<string, BuyLink | null> = {
  /** Fallback for guides without a more specific match, e.g. the terminal blocks category */
  default: { label: "Browse terminal blocks", href: "https://proax.ca/en/category/3850/terminal-blocks" },
  "push-in": { label: "Browse push-in terminal blocks", href: "https://proax.ca/en/category/3855/push-in-connection-terminal-blocks" },
  "spring-clamp": { label: "Browse spring-cage terminal blocks", href: "https://proax.ca/en/category/3858/spring-cage-connection-terminal-blocks" },
  "screw-clamp": { label: "Browse screw terminal blocks", href: "https://proax.ca/en/category/3856/screw-connection-terminal-blocks" },
  ground: null,
  fuse: null,
  disconnect: { label: "Browse test and disconnect terminal blocks", href: "https://proax.ca/en/category/3859/test-terminal-strip" },
  "multi-level": null,
  pcb: { label: "Browse PCB terminal blocks", href: "https://proax.ca/en/category/4489/pcb-terminal-blocks-and-connectors" },
  barrier: null,
  accessories: { label: "Browse terminal block accessories", href: "https://proax.ca/en/category/3851/terminal-block-accessories" },
};

export function buyLinkFor(related: string[] | undefined): BuyLink | null {
  for (const slug of related ?? []) {
    const link = buyLinks[slug];
    if (link) return link;
  }
  return buyLinks.default ?? null;
}
