export type GuideBlock =
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "callout"; title: string; text: string }
  | { type: "table"; head: string[]; rows: string[][] };

export type Guide = {
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  category: "Selection" | "Sizing" | "Checklist";
  readMinutes: number;
  updated: string;
  keyTakeaways: string[];
  body: GuideBlock[];
  faqs: { q: string; a: string }[];
  /** First publication date (YYYY-MM-DD), for articles published from the content queue */
  published?: string;
  /** Product type slugs this guide links to (internal links help readers and search engines) */
  related?: string[];
};

/** Draft guides for the design phase. Nothing is published. */
export const guides: Guide[] = [
  {
    slug: "push-in-vs-spring-vs-screw-terminal-blocks",
    title: "Push-in vs spring vs screw terminal blocks: which should you specify?",
    shortTitle: "Push-in vs spring vs screw",
    description: "A short, practical comparison of the three main terminal block connection technologies — and when each one makes sense",
    category: "Selection",
    readMinutes: 4,
    updated: "2026-11-10",
    related: ["push-in", "spring-clamp", "screw-clamp"],
    keyTakeaways: [
      "Push-in is fastest for solid or ferruled wire.",
      "Spring clamp handles fine-stranded wire and vibration without re-torquing.",
      "Screw clamp covers the widest conductor range and the largest sizes.",
    ],
    body: [
      { type: "p", text: "Almost every DIN-rail terminal block uses one of three connection technologies. They all do the same job — clamp a conductor securely — but they differ in wiring speed, conductor compatibility and maintenance." },
      { type: "h2", text: "Screw clamp" },
      { type: "p", text: "A screw drives a clamping yoke down onto the conductor. Screw terminals accept the widest range of conductor types and sizes, from small control wire to very large power conductors, and every electrician knows how to use them." },
      { type: "ul", items: ["Widest conductor range, including large cross-sections", "Must be tightened to the manufacturer's rated torque", "Slowest to wire in high volume"] },
      { type: "h2", text: "Spring clamp (cage clamp)" },
      { type: "p", text: "A spring presses the conductor against the current bar. You open the spring with a screwdriver, insert the wire and release. Because the spring maintains constant force, the connection doesn't depend on installation torque." },
      { type: "ul", items: ["Constant contact force, good under vibration", "Works with fine-stranded wire without ferrules", "Needs an operating tool to open"] },
      { type: "h2", text: "Push-in" },
      { type: "p", text: "Push-in is a spring connection designed so that solid or ferruled conductors can be pushed straight in without opening the clamp. A release button opens the spring to remove wires or insert fine-stranded wire without a ferrule." },
      { type: "ul", items: ["Fastest wiring for solid and ferruled conductors", "Tool-free insertion", "Fine-stranded wire without ferrules needs the release pressed"] },
      { type: "h2", text: "Side-by-side" },
      {
        type: "table",
        head: ["", "Screw", "Spring", "Push-in"],
        rows: [
          ["Wiring speed", "Slow", "Medium", "Fast"],
          ["Tool to insert", "Yes", "Yes", "No*"],
          ["Vibration", "Torque-dependent", "Very good", "Very good"],
          ["Largest sizes", "Best", "Good", "Good"],
        ],
      },
      { type: "p", text: "* Solid or ferruled conductors. Fine-stranded wire without a ferrule needs the release opened." },
      { type: "callout", title: "Sourcing tip", text: "Standardize on one series per panel where you can. Accessories — end plates, jumpers and markers — are usually series-specific, and mixing series is the most common cause of incomplete BOMs." },
    ],
    faqs: [
      { q: "Which terminal block type is most reliable?", a: "All three are reliable when the right product is selected and installed correctly. Spring and push-in designs remove torque as a variable; screw terminals are reliable when tightened to the rated torque." },
      { q: "Can I mix connection types on one rail?", a: "Yes, physically. But accessories and jumpers are usually series-specific, so mixing makes ordering and maintenance harder." },
    ],
  },
  {
    slug: "how-to-size-a-terminal-block",
    title: "How to size a terminal block: wire, current and voltage",
    shortTitle: "How to size a terminal block",
    description: "Pick the right terminal block size in four steps — conductor, current, voltage and approvals",
    category: "Sizing",
    readMinutes: 3,
    updated: "2026-11-10",
    related: ["screw-clamp", "push-in", "ground"],
    keyTakeaways: [
      "Start from the conductor size and type, including ferrules.",
      "IEC and UL ratings for the same part can differ — use the one your market requires.",
      "Allow for temperature derating in hot enclosures.",
    ],
    body: [
      { type: "p", text: "Terminal blocks are usually named after their nominal cross-section — a \"2.5\" block is built around 2.5 mm² wire. But the nominal size is only the start. Here is a quick way to size one properly." },
      { type: "h2", text: "1. Conductor size and type" },
      { type: "p", text: "Check the block's rated conductor range for your exact conductor: solid, stranded, fine-stranded, and with or without a ferrule. The range often differs between these, and ferrules with plastic collars may reduce the maximum size." },
      { type: "h2", text: "2. Current" },
      { type: "p", text: "Make sure the block's rated current exceeds your circuit's continuous current. Note that the block's rating assumes a conductor of the matching size — the wire is often the limiting factor." },
      { type: "h2", text: "3. Voltage" },
      { type: "p", text: "Check the rated voltage, and remember that accessories such as plug-in jumpers can reduce the rated voltage of an assembly. The datasheet will show the reduced value." },
      { type: "h2", text: "4. Approvals" },
      { type: "p", text: "Ratings are published per standard. For the same part, the IEC rating and the UL/CSA rating can be different, because the test methods differ. For Canadian and US panels, check the CSA or UL values." },
      { type: "callout", title: "Don't forget temperature", text: "Enclosures get hot. Ratings are given at a reference temperature, and current capacity drops as ambient temperature rises. If your panel runs warm, size up or check the derating curve." },
    ],
    faqs: [
      { q: "What does a 2.5 terminal block mean?", a: "It is the nominal conductor cross-section in mm². A 2.5 block is designed around 2.5 mm² wire (roughly 14 AWG) but usually accepts a range around that size." },
      { q: "Why is the UL rating lower than the IEC rating?", a: "UL and IEC use different test methods and conditions, so published values for the same product often differ. Use the rating required in your market." },
    ],
  },
  {
    slug: "terminal-block-accessories-checklist",
    title: "Terminal block accessories checklist: the parts that get forgotten",
    shortTitle: "Accessories checklist",
    description: "End plates, end stops, jumpers and markers — a quick checklist so your terminal strip BOM is complete the first time",
    category: "Checklist",
    readMinutes: 3,
    updated: "2026-11-10",
    related: ["accessories", "ground", "multi-level"],
    keyTakeaways: [
      "Most feed-through blocks need an end plate on the open side.",
      "End stops hold the strip in place on the rail.",
      "Jumpers, markers and covers are series-specific.",
    ],
    body: [
      { type: "p", text: "A terminal strip is more than the blocks. The accessories are small and cheap, but forgetting one can hold up a panel build. Run through this list before you submit your BOM." },
      { type: "h2", text: "The checklist" },
      { type: "ul", items: [
        "End plates (end covers) — close the open side of the last block in a group.",
        "End stops (end brackets) — clamp to the rail at each end of the strip so blocks can't slide.",
        "Plug-in jumpers (bridges) — connect adjacent blocks to the same potential. Pick the right pole count.",
        "Markers — printed or blank strips to identify each terminal.",
        "Partition plates — separate groups at different voltages or add insulation distance.",
        "DIN rail — 35 × 7.5 mm, 35 × 15 mm or 15 mm, cut to length.",
        "Test plugs or test adapters — if your maintenance team tests in place.",
      ] },
      { type: "callout", title: "Why this matters", text: "Accessories are rarely interchangeable between series or manufacturers. If you're replacing a block series, include the accessories in your RFQ so we can quote a complete, compatible set." },
    ],
    faqs: [
      { q: "Are jumpers interchangeable between brands?", a: "Generally no. Jumpers are designed for a specific series' pitch and jumper channel. Always order jumpers from the same series as the blocks." },
    ],
  },
];

export function getGuide(slug: string) {
  return guides.find((g) => g.slug === slug);
}
