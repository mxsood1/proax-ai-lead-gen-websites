import type { ModuleConnection, ModuleVariant } from "@/components/brand/TerminalModule";

export type ProductType = {
  slug: string;
  name: string;
  short: string;
  code: string;
  visual: { variant: ModuleVariant; connection: ModuleConnection; label?: string };
  intro: string;
  bestFor: string[];
  watchFor: string[];
  specs: { label: string; value: string }[];
  faqs: { q: string; a: string }[];
};

export const productTypes: ProductType[] = [
  {
    slug: "push-in",
    name: "Push-in terminal blocks",
    short: "Tool-free wiring — push solid or ferruled conductors straight in",
    code: "PI",
    visual: { variant: "grey", connection: "push-in", label: "PI" },
    intro:
      "Push-in terminal blocks let you insert solid or ferruled stranded conductors directly into the clamp with no tool. A release button (usually orange) opens the spring for removal or for fine-stranded wire without a ferrule. They are the fastest connection style for panel builders running high wire counts.",
    bestFor: ["High-volume panel building", "Ferruled or solid conductors", "Compact control cabinets"],
    watchFor: ["Fine-stranded wire without ferrules needs the release opened", "Confirm approved conductor range with and without ferrules"],
    specs: [
      { label: "Typical sizes", value: "0.14 – 16 mm² (26 – 6 AWG)" },
      { label: "Common widths", value: "3.5 – 12 mm" },
      { label: "Mounting", value: "DIN rail 35 mm" },
      { label: "Typical standards", value: "IEC 60947-7-1, UL 1059" },
    ],
    faqs: [
      { q: "Do push-in terminal blocks need ferrules?", a: "Solid conductors and ferruled stranded wire can be pushed in directly. Fine-stranded wire without a ferrule normally requires pressing the release first. Always check the manufacturer's approved conductor list." },
      { q: "Are push-in blocks vibration resistant?", a: "Yes — like spring-clamp blocks, push-in designs use a spring that maintains contact force, which is why they are popular in machinery and rail applications. Check the specific product's test approvals." },
    ],
  },
  {
    slug: "spring-clamp",
    name: "Spring-clamp terminal blocks",
    short: "Constant spring pressure — maintenance-free and vibration resistant",
    code: "SC",
    visual: { variant: "grey", connection: "spring", label: "SC" },
    intro:
      "Spring-clamp (cage clamp) terminal blocks hold the conductor with a spring that is opened using a screwdriver or lever. The spring provides constant contact force, so connections do not need re-torquing and hold up well under vibration.",
    bestFor: ["Machinery with vibration", "Fine-stranded conductors", "Maintenance-free installations"],
    watchFor: ["Requires a screwdriver or operating tool to open", "Wiring is slightly slower than push-in"],
    specs: [
      { label: "Typical sizes", value: "0.08 – 35 mm² (28 – 2 AWG)" },
      { label: "Common widths", value: "3.5 – 16 mm" },
      { label: "Mounting", value: "DIN rail 35 mm / 15 mm" },
      { label: "Typical standards", value: "IEC 60947-7-1, UL 1059" },
    ],
    faqs: [
      { q: "What's the difference between spring clamp and push-in?", a: "Both use a spring. Spring-clamp blocks must be opened with a tool before inserting the wire; push-in blocks accept solid or ferruled wire without opening." },
    ],
  },
  {
    slug: "screw-clamp",
    name: "Screw-clamp terminal blocks",
    short: "The classic — wide conductor range, familiar to every electrician",
    code: "SW",
    visual: { variant: "grey", connection: "screw", label: "SW" },
    intro:
      "Screw-clamp terminal blocks use a screw-driven clamping yoke to hold the conductor. They accept a very wide range of conductor types and sizes and remain the most common style in retrofits and heavy-current applications. Tighten to the manufacturer's rated torque.",
    bestFor: ["Large conductors and high current", "Retrofits matching existing panels", "Mixed conductor types"],
    watchFor: ["Must be tightened to the specified torque", "Slower to wire in high volume"],
    specs: [
      { label: "Typical sizes", value: "0.2 – 240 mm² (24 AWG – 500 kcmil)" },
      { label: "Common widths", value: "5 – 36 mm" },
      { label: "Mounting", value: "DIN rail 35 mm / G-rail" },
      { label: "Typical standards", value: "IEC 60947-7-1, UL 1059" },
    ],
    faqs: [
      { q: "Do screw terminals need re-tightening?", a: "When tightened to the rated torque, quality screw-clamp terminals hold reliably. Many maintenance programs still include periodic torque checks in high-vibration or thermal-cycling environments." },
    ],
  },
  {
    slug: "ground",
    name: "Ground (PE) terminal blocks",
    short: "Green-yellow protective earth blocks that bond to the DIN rail",
    code: "PE",
    visual: { variant: "ground", connection: "push-in" },
    intro:
      "Ground or protective earth (PE) terminal blocks are coloured green-yellow and make an electrical connection to the DIN rail through their mounting foot, bonding the conductor to the grounded rail. They are usually matched in size and connection style to the feed-through blocks beside them.",
    bestFor: ["Protective earth connections", "Shield grounding", "Matching a feed-through series"],
    watchFor: ["The DIN rail itself must be properly grounded", "Check rail compatibility (steel vs copper rail)"],
    specs: [
      { label: "Colour", value: "Green-yellow" },
      { label: "Rail contact", value: "Through mounting foot" },
      { label: "Mounting", value: "DIN rail 35 mm" },
      { label: "Typical standards", value: "IEC 60947-7-2" },
    ],
    faqs: [
      { q: "Can I use a ground block on any DIN rail?", a: "Ground blocks are rated for specific rail types and materials. Check the approved rails in the datasheet, and make sure the rail is bonded to earth." },
    ],
  },
  {
    slug: "fuse",
    name: "Fuse terminal blocks",
    short: "Integrated fuse holders — often with a blown-fuse indicator",
    code: "FU",
    visual: { variant: "fuse", connection: "screw" },
    intro:
      "Fuse terminal blocks combine a terminal with a fuse holder, typically for 5 × 20 mm or 1/4 × 1-1/4 in cartridge fuses. Many include an LED blown-fuse indicator. They are common for protecting individual sensor, actuator or control circuits.",
    bestFor: ["Protecting individual control circuits", "Field device power distribution", "Quick fault finding with indicators"],
    watchFor: ["Match fuse size and rating to the holder", "Check maximum power dissipation when blocks are side by side"],
    specs: [
      { label: "Fuse formats", value: "5 × 20 mm, 1/4 × 1-1/4 in, 10 × 38 mm" },
      { label: "Indicator", value: "Optional LED (AC/DC variants)" },
      { label: "Mounting", value: "DIN rail 35 mm" },
      { label: "Typical standards", value: "IEC 60947-7-3, UL 1059" },
    ],
    faqs: [
      { q: "Why does the indicator voltage matter?", a: "Blown-fuse LEDs are built for a voltage range. Pick the variant that matches your circuit voltage so the indicator works without exceeding its rating." },
    ],
  },
  {
    slug: "disconnect",
    name: "Disconnect & knife terminal blocks",
    short: "Isolate a circuit for testing without removing wires",
    code: "DK",
    visual: { variant: "orange", connection: "spring", label: "DK" },
    intro:
      "Disconnect terminal blocks include a knife, lever or plug-in element that opens the circuit, letting technicians isolate and test a circuit without lifting conductors. They are widely used for measurement circuits, current transformers and commissioning.",
    bestFor: ["Testing and commissioning", "CT / measurement circuits", "Isolating field devices"],
    watchFor: ["Current transformer circuits need suitable shorting blocks", "Check the disconnect's switching rating"],
    specs: [
      { label: "Disconnect type", value: "Knife, lever or plug" },
      { label: "Typical sizes", value: "0.2 – 6 mm²" },
      { label: "Mounting", value: "DIN rail 35 mm" },
      { label: "Typical standards", value: "IEC 60947-7-1" },
    ],
    faqs: [
      { q: "Can I open a disconnect block under load?", a: "Most disconnect terminal blocks are designed for isolation, not for switching load current. Check the datasheet for any switching capacity before operating under load." },
    ],
  },
  {
    slug: "multi-level",
    name: "Multi-level terminal blocks",
    short: "Double and triple-deck blocks that save rail space",
    code: "ML",
    visual: { variant: "blue", connection: "push-in", label: "ML" },
    intro:
      "Multi-level terminal blocks stack two or three connection levels in one housing, multiplying connection density on the same rail length. Variants include sensor/actuator blocks with integrated PE and LED indication.",
    bestFor: ["Space-constrained enclosures", "Sensor and actuator wiring", "PLC I/O marshalling"],
    watchFor: ["Upper levels can be harder to access", "Check which levels are internally bridged"],
    specs: [
      { label: "Levels", value: "2 or 3" },
      { label: "Typical sizes", value: "0.14 – 4 mm²" },
      { label: "Mounting", value: "DIN rail 35 mm" },
      { label: "Variants", value: "Feed-through, PE, sensor, diode, LED" },
    ],
    faqs: [
      { q: "Are the levels connected internally?", a: "It depends on the part. Some multi-level blocks have isolated levels; others bridge levels internally. The datasheet's wiring diagram shows exactly which." },
    ],
  },
  {
    slug: "pcb",
    name: "PCB terminal blocks",
    short: "Board-mount and pluggable connectors for electronics",
    code: "PCB",
    visual: { variant: "dark", connection: "screw", label: "PCB" },
    intro:
      "PCB terminal blocks are soldered to a printed circuit board to bring field wiring onto electronics. They come as fixed blocks or as pluggable header-and-plug pairs that make device replacement fast. Pitch (the distance between poles) is the key selection parameter.",
    bestFor: ["Device and OEM electronics", "Pluggable field connections", "Compact power supplies and controllers"],
    watchFor: ["Pitch must match the PCB footprint exactly", "Check plug and header are from the same family"],
    specs: [
      { label: "Common pitches", value: "2.5, 3.5, 3.81, 5.0, 5.08, 7.5 mm" },
      { label: "Connection", value: "Screw, spring, push-in" },
      { label: "Mounting", value: "THT / SMD" },
      { label: "Poles", value: "2 – 24+" },
    ],
    faqs: [
      { q: "Is 5.0 mm the same as 5.08 mm pitch?", a: "No. 5.08 mm (0.2 in) and 5.0 mm are different pitches; on longer pole counts the difference accumulates and parts will not fit. Always match the exact pitch." },
    ],
  },
  {
    slug: "barrier",
    name: "Barrier strips",
    short: "Panel-mount screw terminals separated by insulating barriers",
    code: "BS",
    visual: { variant: "dark", connection: "screw", label: "BS" },
    intro:
      "Barrier terminal strips mount directly to a panel and use raised insulating barriers between screw terminals. They are common in HVAC, power distribution and older equipment, and often accept ring or spade lugs.",
    bestFor: ["Ring and spade lug connections", "Panel mounting without DIN rail", "Legacy equipment replacement"],
    watchFor: ["Confirm screw size for your lugs", "Check pole count and centre spacing"],
    specs: [
      { label: "Mounting", value: "Panel / chassis" },
      { label: "Termination", value: "Screw with ring/spade lugs" },
      { label: "Poles", value: "1 – 24" },
      { label: "Typical standards", value: "UL 1059" },
    ],
    faqs: [
      { q: "Can barrier strips go on a DIN rail?", a: "Standard barrier strips are panel-mount, but DIN-rail adapters and DIN-mount barrier styles exist. Tell us your setup and we'll find a match." },
    ],
  },
  {
    slug: "accessories",
    name: "Accessories",
    short: "End plates, end stops, jumpers, markers and DIN rail",
    code: "AC",
    visual: { variant: "grey", connection: "push-in", label: "AC" },
    intro:
      "Terminal block accessories complete an assembly: end plates cover the open side of the last block, end stops keep blocks from sliding, plug-in jumpers bridge potentials, and markers identify every terminal. They are series-specific — the most common cause of a missed line on a BOM.",
    bestFor: ["Completing a terminal strip", "Potential distribution with jumpers", "Clear terminal identification"],
    watchFor: ["Accessories are rarely cross-compatible between series", "Jumpers come in specific pole counts"],
    specs: [
      { label: "Includes", value: "End plates, end stops, jumpers, markers" },
      { label: "DIN rail", value: "35 × 7.5 mm, 35 × 15 mm, 15 mm" },
      { label: "Markers", value: "Printed, blank, plotter / printer" },
      { label: "Compatibility", value: "Series-specific" },
    ],
    faqs: [
      { q: "Do I need an end plate?", a: "Many feed-through terminal blocks are open on one side and need an end plate after the last block. Check the series datasheet — it's one of the most commonly forgotten items." },
    ],
  },
];

export function getType(slug: string) {
  return productTypes.find((t) => t.slug === slug);
}
