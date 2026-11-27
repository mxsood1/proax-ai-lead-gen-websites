/**
 * Brand comparison data: which product families each manufacturer offers for
 * each kind of terminal block, one comparable part with its ratings, plus fair
 * strengths and things to check.
 *
 * Researched (November 2026) from manufacturer catalogues and datasheets, and
 * large distributors' product pages where a manufacturer site blocked access.
 * Each comparable part links to the datasheet its specs came from. Ranges
 * change: re-check before relying on a single value.
 *
 * Conventions:
 *  - Missing / null = not listed here yet (shown as "—"), never "doesn't exist".
 *  - A value starting with "None" = the brand doesn't offer it (confirmed).
 *  - Facts only. No "best brand" claims; strengths and things to check for every brand.
 *  - Name product families so engineers can look them up; no prices, no stock.
 */

export type CompareCategory = {
  id: string;
  label: string;
  /** Product type page this row links to */
  typeSlug?: string;
  /** What this row tells the reader, shown under the label */
  hint: string;
};

export const compareCategories: CompareCategory[] = [
  { id: "system", label: "Range / system name", hint: "The family name to search for in the catalogue" },
  { id: "push-in", label: "Push-in", typeSlug: "push-in", hint: "Tool-free for solid and ferruled wire" },
  { id: "spring-clamp", label: "Spring clamp", typeSlug: "spring-clamp", hint: "Spring opened with a tool or lever" },
  { id: "screw-clamp", label: "Screw clamp", typeSlug: "screw-clamp", hint: "Widest conductor range, needs torque" },
  { id: "ground", label: "Ground (PE)", typeSlug: "ground", hint: "Green-yellow, bonds to the rail" },
  { id: "fuse", label: "Fuse", typeSlug: "fuse", hint: "Fuse holder in the block" },
  { id: "disconnect", label: "Disconnect / test", typeSlug: "disconnect", hint: "Open the circuit without lifting wires" },
  { id: "multi-level", label: "Multi-level", typeSlug: "multi-level", hint: "Two or three levels per block" },
  { id: "pcb", label: "PCB terminal blocks", typeSlug: "pcb", hint: "Board-mount and pluggable" },
  { id: "barrier", label: "Barrier strips", typeSlug: "barrier", hint: "Panel-mount screw terminals" },
  { id: "marking", label: "Marking system", typeSlug: "accessories", hint: "Markers and labelling tools" },
];

export type ComparablePart = {
  /** What kind of part this is, e.g. "2.5 mm² push-in feed-through block" */
  kind: string;
  name: string;
  number: string;
  connection: string;
  /** Width on the rail (or pitch for PCB blocks), e.g. "5.2 mm" */
  width: string;
  conductor: string;
  iec: string;
  ul: string;
  approvals: string;
  /** Where the specs came from (manufacturer or distributor datasheet) */
  source: string;
};

export type Brand = {
  slug: string;
  name: string;
  /** Head office country */
  hq: string;
  /** One neutral sentence about the brand's terminal block range */
  summary: string;
  /** Category id → product family / note. Missing or null = not covered here yet. */
  ranges: Partial<Record<string, string | null>>;
  strengths: string[];
  check: string[];
  /** One typical part, so a comparison can put similar parts side by side */
  part?: ComparablePart;
  /**
   * Where to buy this brand's terminal blocks online, for brands carried by
   * the distributor the site links to (proax.ca). Brands without a link
   * offer "Ask us about this brand" instead.
   */
  buy?: { label: string; href: string };
};

/** Where shop links go, shown beside them so readers know where they're headed */
export const SHOP_DOMAIN = "proax.ca";

/** Does the brand offer this category? (listed, and not marked "None") */
export const offers = (b: Brand, id: string) => Boolean(b.ranges[id]) && !/^none\b/i.test(b.ranges[id] ?? "");

const PUSH_IN_25 = "2.5 mm² push-in feed-through block";

export const brands: Brand[] = [
  /* ------------------------------ terminal block specialists ------------------------------ */
  {
    slug: "phoenix-contact",
    buy: { label: "Browse Phoenix Contact terminal blocks", href: "https://proax.ca/en/category/3850/terminal-blocks/phoenix-contact" },
    name: "Phoenix Contact",
    hq: "Germany",
    summary: "Terminal block specialist whose push-in, spring and screw ranges share one accessory system, CLIPLINE complete.",
    ranges: {
      system: "CLIPLINE complete",
      "push-in": "PT series (also PTV and PTTB)",
      "spring-clamp": "ST series",
      "screw-clamp": "UT series (UK series on many older panels)",
      ground: "PE versions in each series, e.g. PT 2,5-PE, UT 4-PE",
      fuse: "HESI fuse blocks for 5 × 20 mm fuses, e.g. PT 4-HESI, UT 4-HESI",
      disconnect: "Disconnect versions, e.g. PT 2,5-TG, plus knife-disconnect blocks",
      "multi-level": "Double-level PTTB and PTTBS (push-in), UTTB (screw)",
      pcb: "COMBICON (fixed and pluggable)",
      marking: "ZB and UC-TM marker strips",
    },
    strengths: [
      "Push-in, spring and screw in one system, so much of the accessory range is shared",
      "Large range of special-function blocks: fuse, disconnect, multi-level and component blocks",
    ],
    check: [
      "Series names changed over the years (UK to UT): match the exact series when extending an existing panel",
      "UL and CSA ratings differ between variants: check the approval table for the exact part",
    ],
    part: {
      kind: PUSH_IN_25,
      name: "PT 2,5, grey",
      number: "3209510",
      connection: "Push-in",
      width: "5.2 mm",
      conductor: "0.14–4 mm² (26–12 AWG)",
      iec: "24 A / 800 V",
      ul: "UL and CSA: 20 A / 600 V",
      approvals: "UL, cUL, CSA, VDE, ATEX, IECEx",
      source: "https://www.farnell.com/datasheets/2198120.pdf",
    },
  },
  {
    slug: "weidmuller",
    name: "Weidmüller",
    hq: "Germany",
    summary: "Terminal block specialist whose Klippon Connect range covers push-in, tension-clamp and screw series.",
    ranges: {
      system: "Klippon Connect",
      "push-in": "A-Series (PUSH IN), e.g. A2C 2.5",
      "spring-clamp": "Z-Series (tension clamp)",
      "screw-clamp": "W-Series, e.g. WDU",
      ground: "PE versions in each series, e.g. A2C 2.5 PE, WPE, ZPE",
      fuse: "WSI (W-Series), ZSI (Z-Series), A2T 4 FS (A-Series)",
      disconnect: "A-Series disconnect blocks, e.g. A2T 4 DT",
      "multi-level": "A2T multi-level (A-Series); double-level versions in W and Z",
      pcb: "OMNIMATE",
      marking: "MultiCard markers",
    },
    strengths: ["Push-in, tension-clamp and screw all offered within Klippon Connect", "A-Series includes test, fuse and disconnect versions of the push-in blocks"],
    check: [
      "The standard colour is dark beige, not grey: grey is a separate item number",
      "Each series has its own accessories: confirm jumper and end plate part numbers per series",
    ],
    part: {
      kind: PUSH_IN_25,
      name: "A2C 2.5 (dark beige; light grey is A2C 2.5 LTGY, 2003110000)",
      number: "1521850000",
      connection: "Push-in",
      width: "5.1 mm",
      conductor: "0.14–2.5 mm² (28–12 AWG)",
      iec: "24 A / 800 V",
      ul: "cURus and CSA: 20 A / 600 V",
      approvals: "cURus, CSA, ATEX, IECEx, DNV, BV",
      source: "https://asset.conrad.com/media10/add/160267/c1/-/hu/001513847DS01/tehnicni-podatki-1513847-a2c-25-1521850000-siva-weidmueller-100-kos.pdf",
    },
  },
  {
    slug: "wago",
    name: "WAGO",
    hq: "Germany",
    summary: "Spring-pressure connection specialist; its rail-mount range is built on TOPJOB S push-in and CAGE CLAMP technology.",
    ranges: {
      system: "TOPJOB S",
      "push-in": "TOPJOB S (Push-in CAGE CLAMP), e.g. 2002-1201",
      "spring-clamp": "CAGE CLAMP rail-mount blocks",
      "screw-clamp": "None: WAGO's rail-mount range is spring-pressure based",
      ground: "TOPJOB S ground conductor blocks",
      fuse: "TOPJOB S fuse blocks with pivoting holder, e.g. 2002-1611 (5 × 20 mm)",
      disconnect: "TOPJOB S knife-disconnect blocks",
      "multi-level": "TOPJOB S double-deck blocks",
      pcb: "PCB terminal blocks and picoMAX pluggable connectors",
      marking: "WMB markers",
      barrier: "None",
    },
    strengths: ["Spring-pressure clamping across the whole range: no re-torquing, good under vibration", "Ex e (ATEX and IECEx) versions of standard blocks"],
    check: ["No screw-clamp rail-mount blocks, if a panel standard calls for screw clamps", "Fine-stranded wire without a ferrule needs the operating slot opened"],
    part: {
      kind: PUSH_IN_25,
      name: "TOPJOB S 2-conductor through block, grey",
      number: "2002-1201",
      connection: "Push-in CAGE CLAMP",
      width: "5.2 mm",
      conductor: "0.25–4 mm² solid (22–12 AWG)",
      iec: "24 A / 800 V",
      ul: "UL and CSA: 20 A / 600 V",
      approvals: "UL, CSA, ATEX, IECEx",
      source: "https://www.farnell.com/datasheets/3215803.pdf",
    },
  },
  {
    slug: "wieland-electric",
    name: "Wieland Electric",
    hq: "Germany",
    summary: "German connection technology maker moving its rail-mount range to selos NEW GENERATION: WTPN push-in and WTN screw.",
    ranges: {
      system: "selos NEW GENERATION (replacing fasis and selos WT)",
      "push-in": "selos WTPN (replaces fasis WTP)",
      "spring-clamp": "fasis WKFN tension clamp (being phased out)",
      "screw-clamp": "selos WTN (replaces selos WT)",
      ground: "PE blocks in the WTPN and WTN ranges",
      fuse: "Fuse blocks with pluggable fuse inserts",
      disconnect: "Knife-edge disconnect blocks",
      "multi-level": "Two- and three-tier blocks",
      pcb: "wiecon PCB terminals",
      marking: "selos PRINT, Wieplot and Wieprint",
    },
    strengths: ["Push-in and screw in one new-generation system with shared function blocks", "Wide cross-section span: WTN screw blocks from 1.5 to 240 mm²"],
    check: [
      "Older series (fasis WKFN, fasis WTP, selos WT): final order date 1 May 2026, final delivery 31 December 2026; use Wieland's cross-reference list",
      "No tension-spring series in the new generation: spring-clamp panels move to push-in",
    ],
    part: {
      kind: PUSH_IN_25,
      name: "WTPN 2.5 feed-through, grey",
      number: "5D.203.0055.0",
      connection: "Push-in",
      width: "5.1 mm",
      conductor: "0.14–4 mm² solid (26–12 AWG)",
      iec: "24 A / 800 V",
      ul: "UL and CSA: 20 A / 600 V",
      approvals: "cURus, Lloyd's Register, CE, UKCA",
      source: "https://www.wieland-electric.com/en/feed-through-terminal-wtpn-2.5/5d.203.0055.0/",
    },
  },
  {
    slug: "conta-clip",
    name: "Conta-Clip",
    hq: "Germany",
    summary: "German maker of the CONTA-CONNECT rail-mount range in push-in, tension-clamp and screw, with its own marking system.",
    ranges: {
      system: "CONTA-CONNECT",
      "push-in": "PRK and FRK series",
      "spring-clamp": "ZRK series (tension clamp)",
      "screw-clamp": "SRK and RK series",
      ground: "PE versions, e.g. PSLM (PRK), FSL (FRK), ZSL (ZRK)",
      fuse: "FSIK fuse-disconnect blocks; fuse versions in PRK and ZRK",
      disconnect: "FTRK (FRK); disconnect versions in PRK and ZRK",
      "multi-level": "PRKD, FRKD and ZRKD double-level; ZIKD three-level",
      pcb: "CONTA-CON PCB terminals and connectors",
      marking: "CONTA-LABEL",
    },
    strengths: ["Terminal blocks, marking and cable entry from one maker", "Screw range up to 240 mm² (RK series)"],
    check: ["Two push-in families (PRK and FRK) with different accessories: confirm the article number", "PRK 2,5 starts at 0.5 mm², a narrower range than some alternatives"],
    part: {
      kind: PUSH_IN_25,
      name: "PRK 2,5/2A GR feed-through, grey",
      number: "27006.6",
      connection: "Push-in",
      width: "5.1 mm",
      conductor: "0.5–4 mm² solid (26–12 AWG)",
      iec: "24 A / 800 V",
      ul: "UL and cUL: 20 A / 600 V",
      approvals: "UL, cUL, EAC",
      source: "https://switchesplus.com.au/file/24478/3428",
    },
  },
  {
    slug: "dinkle",
    name: "Dinkle",
    hq: "Taiwan",
    summary: "Taiwanese maker of DIN-rail (push-in, spring and screw), PCB, barrier and NEMA terminal blocks.",
    ranges: {
      "push-in": "DP series, e.g. DP2.5N",
      "spring-clamp": "AK series",
      "screw-clamp": "DK…N series, e.g. DK2.5N, DK4N",
      ground: "PE versions, e.g. DP2.5N-PE, DK6N-PE",
      fuse: "DK4N-TF fuse disconnect (5 × 20 mm)",
      disconnect: "DPT disconnect and test blocks",
      "multi-level": "DKK4N double-level",
      pcb: "PCB terminal blocks and plug-in connectors",
      barrier: "Barrier terminal blocks: single-row, bi-level and pluggable",
    },
    strengths: ["Covers DIN-rail, PCB, barrier and NEMA terminal blocks", "Datasheets publish UL and cUL ratings by use group"],
    check: ["The default colour is beige: confirm the grey order code", "Check approvals per part (UL, cUL and VDE are listed; CSA isn't shown for DP2.5N)"],
    part: {
      kind: PUSH_IN_25,
      name: "DP2.5N feed-through (beige as standard)",
      number: "DP2.5N",
      connection: "Push-in",
      width: "5.1 mm",
      conductor: "0.14–4 mm² solid (26–12 AWG)",
      iec: "24 A / 800 V",
      ul: "UL and cUL: 20 A / 600 V",
      approvals: "UL, cUL, VDE",
      source: "https://www.dinkle.com/en/terminal/outpagepdf.php?dpid=1969",
    },
  },
  {
    slug: "altech",
    name: "Altech",
    hq: "United States",
    summary: "US supplier of a universal DIN-rail terminal block system in screw (CY), spring (CX) and push-in (CP) series, plus PCB blocks.",
    ranges: {
      system: "Universal DIN-rail system (CY, CX and CP series)",
      "push-in": "CP series",
      "spring-clamp": "CX and CSC series",
      "screw-clamp": "CY and CT series",
      ground: "CPG (push-in), CSCG (spring) and CY ground blocks",
      fuse: "ASF4 (spring) and CYDL with 5 × 20 mm fuse",
      "multi-level": "CYDL three-level; CPDL2.5 and CXDL2.5 double-level",
      pcb: "AK series, e.g. AK500",
    },
    strengths: ["Screw, spring and push-in series in one universal system", "US-based supply and support"],
    check: ["Confirm the current status of CP2.5 (one distributor lists it as discontinued)", "Check which rating applies: IEC 1000 V vs UL 600 V; CSA isn't shown"],
    part: {
      kind: PUSH_IN_25,
      name: "CP2.5 feed-through, grey",
      number: "CP2.5",
      connection: "Push-in",
      width: "5.0 mm",
      conductor: "24–12 AWG",
      iec: "24 A / 1000 V",
      ul: "UL: 20 A / 600 V",
      approvals: "UL, IEC 60947-7-1",
      source: "https://www.onlinecomponents.com/en/altech/cp25-52592100.html",
    },
  },

  /* ------------------------------ automation and power makers ------------------------------ */
  {
    slug: "schneider-electric",
    name: "Schneider Electric",
    hq: "France",
    summary: "Linergy TR rail-mount range in screw, spring and push-in versions, with Square D Linergy NEMA blocks for North America.",
    ranges: {
      system: "Linergy TR (NSYTRV screw, NSYTRR spring, NSYTRP push-in)",
      "push-in": "Linergy TR NSYTRP, e.g. NSYTRP22",
      "spring-clamp": "Linergy TR NSYTRR",
      "screw-clamp": "Linergy TR NSYTRV, e.g. NSYTRV22; Square D Linergy NEMA 9080G",
      ground: "PE versions, e.g. NSYTRV22PE, NSYTRP22PE",
      fuse: "Fuse blocks, e.g. NSYTRV42SF5 (screw)",
      disconnect: "Knife-disconnect blocks, e.g. NSYTRP22SC, NSYTRV22SC",
      "multi-level": "Double-level, e.g. NSYTRP24D",
      marking: "Linergy TR markers",
    },
    strengths: ["Same Linergy TR reference scheme across screw, spring and push-in", "Datasheets list IEC, UL and CSA ratings separately"],
    check: [
      "Ratings differ between variants: the NSYTRP22SC knife disconnect is rated 300 V UL/CSA, the NSYTRP22 feed-through 600 V",
      "The push-in datasheet gives mm² only: confirm the AWG range",
    ],
    part: {
      kind: PUSH_IN_25,
      name: "Linergy TR push-in feed-through, 2 points, grey",
      number: "NSYTRP22",
      connection: "Push-in",
      width: "5.2 mm",
      conductor: "0.14–4 mm² solid",
      iec: "24 A / 800 V",
      ul: "UL and CSA: 20 A / 600 V",
      approvals: "UL, CSA, VDE, GL, LR",
      source: "https://docs.rs-online.com/9429/A700000013036476.pdf",
    },
  },
  {
    slug: "abb",
    buy: { label: "Browse ABB (ENTRELEC) terminal blocks", href: "https://proax.ca/en/category/3850/terminal-blocks/abb" },
    name: "ABB (ENTRELEC)",
    hq: "Switzerland",
    summary: "ABB sold its ENTRELEC terminal block business to TE Connectivity in 2018; the SNK range is now made and sold by TE under the ENTRELEC brand.",
    ranges: {
      system: "ENTRELEC SNK series, now TE Connectivity (part numbers 1SNK and 1SNA unchanged)",
      "push-in": "ZK PI-Spring (push-in that also opens with a screwdriver)",
      "spring-clamp": "None separate: ZK PI-Spring covers spring connections",
      "screw-clamp": "ZS series (SNK); older SNA series, e.g. M4/6, M6/8",
      ground: "PE versions, e.g. ZK2.5-PE, ZS4-PE, M4/6.P",
      fuse: "Fuse blocks, e.g. ZK2.5-SF, ZS4-SF, M4/8.SF (5 × 20 mm)",
      disconnect: "Disconnect blocks, e.g. ZK2.5-S, ZS4-S",
      "multi-level": "Double-deck, e.g. ZK2.5-D2, ZS4-D2; triple-deck D4/6.T3",
      marking: "MC512 markers",
    },
    strengths: ["Existing ABB 1SNK and 1SNA part numbers still apply under TE", "Range certified to IEC 60947-7, UL 1059 and CSA C22.2 No. 158"],
    check: [
      "The line now belongs to TE Connectivity: get current datasheets and orders through TE (ENTRELEC brand)",
      "No current ABB-branded rail-mount terminal block range was found",
    ],
    part: {
      kind: PUSH_IN_25,
      name: "ENTRELEC ZK2.5 PI-Spring feed-through, grey",
      number: "1SNK705010R0000",
      connection: "Push-in + spring (PI-Spring)",
      width: "5.2 mm",
      conductor: "0.2–4 mm² (26–12 AWG)",
      iec: "24 A / 1000 V",
      ul: "UL: 20 A / 600 V; CSA: 600 V",
      approvals: "UL, CSA, CB",
      source: "https://www.digikey.ie/en/products/detail/te-connectivity-entrelec/1SNK705010R0000/10061447",
    },
  },
  {
    slug: "siemens",
    name: "Siemens",
    hq: "Germany",
    summary: "8WH terminal system with screw, spring, push-in (iPo) and hybrid blocks, plus installation terminals for distribution boards.",
    ranges: {
      system: "8WH terminals (SENTRON)",
      "push-in": "8WH6 iPo push-in, e.g. 8WH6000-0AF00",
      "spring-clamp": "8WH2 spring-loaded",
      "screw-clamp": "8WH1 screw, e.g. 8WH1000-0AF00",
      ground: "PE versions, e.g. 8WH6000-0CF07",
      fuse: "Fuse blocks, e.g. 8WH1000-1GG08 (screw), 8WH6000-1KG38 (push-in)",
      disconnect: "Isolating blocks, e.g. 8WH6000-6CF00",
      "multi-level": "Two- and three-tier, e.g. 8WH1020-0AF00",
      marking: "8WH8120 marker strips",
    },
    strengths: ["One 8WH system across screw, spring, push-in and hybrid connections", "Installation terminals for distribution boards in the same family"],
    check: [
      "The datasheets checked show no UL or CSA ratings: confirm North American approvals per order number",
      "Published ratings for 8WH6000-0AF00 differ between sources (30 A on Siemens' 2018 sheet, 24 A at a distributor)",
    ],
    part: {
      kind: PUSH_IN_25,
      name: "iPo push-in through terminal, grey",
      number: "8WH6000-0AF00",
      connection: "Push-in (iPo)",
      width: "5.2 mm",
      conductor: "0.34–4 mm² solid; 0.14–2.5 mm² stranded",
      iec: "30 A / 800 V (Siemens sheet, 2018)",
      ul: "",
      approvals: "CE declaration of conformity",
      source: "https://my.goagilix.com/assets/ea/99/ea998514-1a73-4556-a49b-f899293a88f9/IDW_DOCUMENT_df8b7c8a16598dd469f8a2a97b68cada7ed4870a433fdbd281341cc3efb00691.pdf",
    },
  },
  {
    slug: "allen-bradley",
    name: "Allen-Bradley",
    hq: "United States",
    summary: "Rockwell Automation's Bulletin 1492 covers rail-mount push-in, spring and screw blocks plus NEMA panel-mount blocks.",
    ranges: {
      system: "Bulletin 1492",
      "push-in": "1492-P, e.g. 1492-P3",
      "spring-clamp": "1492-L, e.g. 1492-L3",
      "screw-clamp": "1492-J, e.g. 1492-J3; mini 1492-W",
      ground: "1492-PG3, 1492-JG, 1492-LG",
      fuse: "1492-PFB4 (push-in) and screw-type fuse blocks",
      disconnect: "1492-PKD3 (push-in), 1492-JKD (screw)",
      "multi-level": "1492-PD3 double and 1492-PT3 three-level (push-in); 1492-JD and 1492-LD",
      marking: "ClearPlot 1492-MR and ClearMultiprint 1492-MT markers",
      barrier: "1492 NEMA panel-mount blocks, e.g. 1492-HJ86",
    },
    strengths: ["All three connection types plus NEMA panel-mount blocks under one bulletin", "Datasheets list UL/CSA, IEC and ATEX ratings separately"],
    check: [
      "Match the exact 1492 sub-series (P, L, J or W): jumpers and markers are sub-series-specific",
      "Variants differ: 1492-P3P plug-in style is rated 300 V vs 600 V for 1492-P3",
    ],
    part: {
      kind: PUSH_IN_25,
      name: "1492-P push-in feed-through, grey",
      number: "1492-P3",
      connection: "Push-in",
      width: "5.1 mm",
      conductor: "28–12 AWG",
      iec: "24 A / 800 V",
      ul: "UL and CSA: 20 A / 600 V",
      approvals: "UL, CSA, IEC, ATEX",
      source: "https://configurator.rockwellautomation.com/api/Doc/1492-td017c-en-p.pdf",
    },
  },
  {
    slug: "eaton",
    name: "Eaton",
    hq: "Ireland",
    summary: "IEC XB series in screw, spring-cage and IDC versions that share bridges, markers and test plugs.",
    ranges: {
      system: "XB series (IEC-XB)",
      "push-in": "None found in the XB catalogue",
      "spring-clamp": "XBPT spring cage, e.g. XBPT25",
      "screw-clamp": "XBUT, e.g. XBUT25",
      ground: "PE versions, e.g. XBUT25PE",
      fuse: "Fuse blocks, e.g. XBUK10FBC (5 × 20 mm)",
      disconnect: "Disconnect and test blocks, e.g. XBUT4MT, XBUT4TG",
      "multi-level": "XBUTT4 double-level; triple-level sensor blocks",
      marking: "XBMZB marker strips",
    },
    strengths: ["Bridges, markers and test plugs shared across screw, spring-cage and IDC blocks", "UL/cUL recognized and ATEX approved"],
    check: ["No push-in version found, if a spec calls for push-in", "The catalogue checked is from 2011: confirm current catalogue numbers and ratings"],
    part: {
      kind: "2.5 mm² screw feed-through block (no push-in in the range)",
      name: "XB screw through-feed, grey",
      number: "XBUT25",
      connection: "Screw",
      width: "5.2 mm",
      conductor: "26–12 AWG",
      iec: "32 A / 800 V",
      ul: "UL and cUL: 20 A / 600 V",
      approvals: "UL, cUL, CE, ATEX",
      source: "https://www.farnell.com/datasheets/1480994.pdf",
    },
  },
  {
    slug: "omron",
    buy: { label: "Browse Omron terminal blocks", href: "https://proax.ca/en/category/3850/terminal-blocks/omron" },
    name: "Omron",
    hq: "Japan",
    summary: "XW5T DIN-rail terminal blocks in Push-In Plus and screw versions; fuse and disconnect blocks are in the screw range.",
    ranges: {
      system: "XW5T (Push-In Plus and screw)",
      "push-in": "XW5T-P Push-In Plus, e.g. XW5T-P2.5-1.1-1",
      "spring-clamp": "None",
      "screw-clamp": "XW5T-S, e.g. XW5T-S2.5-1.1-1",
      ground: "XW5G-P (push-in), XW5G-S (screw)",
      fuse: "XW5T-S4.0-FU5 / FU6 (screw)",
      disconnect: "XW5T-S4.0-KD (screw)",
      "multi-level": "Two-tier push-in, e.g. XW5T-P1.5-2.2-1",
      pcb: "XW4 series",
      marking: "XW5Z labels",
    },
    strengths: ["Same Push-In Plus connection as Omron relay sockets and other devices", "Slim push-in models from 3.5 mm wide"],
    check: ["Fuse and disconnect blocks are only in the screw range", "The standard colour is dark grey; fewer special-function blocks than the specialists"],
    part: {
      kind: PUSH_IN_25,
      name: "XW5T Push-In Plus feed-through, dark grey",
      number: "XW5T-P2.5-1.1-1",
      connection: "Push-in (Push-In Plus)",
      width: "5.2 mm",
      conductor: "0.14–4 mm² solid (26–12 AWG)",
      iec: "24 A / 800 V",
      ul: "UL: 20 A / 600 V",
      approvals: "cULus (UL 1059), IEC 60947-7-1",
      source: "https://www.farnell.com/datasheets/2061853.pdf",
    },
  },
  {
    slug: "idec",
    name: "IDEC",
    hq: "Japan",
    summary: "Screw-type rail-mount blocks (BN-W, BNH-W touch-down, BA, BFH) plus BTB surface-mount blocks; no push-in or spring range found.",
    ranges: {
      system: "BN / BNH, BA and BFH (rail); BTB / BTBH (surface mount)",
      "push-in": "None found",
      "spring-clamp": "None found",
      "screw-clamp": "BN-W self-lifting, BNH-W touch-down, BA quick-mount, BFH finger-safe",
      fuse: "BNF10S, BAF111SU",
      disconnect: "BNT20, BAT20 disconnecting blocks",
      "multi-level": "BND / BNDH double-deck",
      marking: "BNM7 / BNM9 marking strips",
      barrier: "BTB / BTBH surface-mount blocks",
    },
    strengths: ["Touch-down screw terminals hold the wire before tightening", "Wide current range on DIN rail, from about 10 A to 150 A"],
    check: ["No push-in or spring blocks found", "Housings are black or light grey; ratings are published per UL/CSA, EN and JIS, so check the column you need"],
    part: {
      kind: "nearest equivalent: M3.5 screw block (no 2.5 mm² push-in in the range)",
      name: "BNH-W touch-down block, 1-pole",
      number: "BNH15LW",
      connection: "Screw (touch-down)",
      width: "10.5 mm",
      conductor: "22–14 AWG (2 mm²)",
      iec: "EN: 22 A / 660 V",
      ul: "UL and CSA: 15 A / 600 V",
      approvals: "UL, CSA, EN (TÜV)",
      source: "https://www.wolfautomation.com/content/idec-terminalblocks-catalog.pdf",
    },
  },

  {
    slug: "sprecher-schuh",
    name: "Sprecher+Schuh",
    buy: { label: "Browse Sprecher+Schuh terminal blocks", href: "https://proax.ca/en/category/3850/terminal-blocks/sprecher-schuh" },
    hq: "Switzerland",
    summary: "Swiss control-products maker (founded in Aarau in 1903) whose terminal blocks are the V7-W screw-connection series with the V7 marking system.",
    ranges: {
      system: "Series V7-W (DIN rail, screw connection)",
      "push-in": "None found (V7-W is a screw series)",
      "spring-clamp": "None found (V7-W is a screw series)",
      "screw-clamp": "V7-W, e.g. V7-W4",
      ground: "V7-W ground terminals",
      fuse: "V7 fuse terminals, e.g. V7-H5 (6.3 × 32 mm, with LED)",
      disconnect: "V7-W isolating terminals",
      "multi-level": "Two- and three-level terminals, e.g. V7-WD4",
      marking: "Series V7 Marking System",
    },
    strengths: [
      "One screw series from 30 AWG to 500 MCM (0.5 to 240 mm²), rated 600 V AC (UL) and 800 V (IEC)",
      "Many special-function blocks: fuse, isolating, diode, sensor and thermocouple terminals",
    ],
    check: ["Screw connection only: no push-in or spring series found", "Fuse blocks take 6.3 × 32 mm fuses: check the fuse format you need"],
  },

  /* --------------------------- PCB, connector and barrier strip makers --------------------------- */
  {
    slug: "te-connectivity",
    buy: { label: "Browse ENTRELEC DIN-rail terminal blocks", href: "https://proax.ca/en/manufacturers/abb/te-connectivity-din-terminal-blocks-new/2770" },
    name: "TE Connectivity",
    hq: "Ireland",
    summary: "Connector maker with two terminal block brands: ENTRELEC for DIN rail (bought from ABB in 2018) and BUCHANAN for PCB and barrier blocks.",
    ranges: {
      system: "ENTRELEC SNK (DIN rail); BUCHANAN (PCB and barrier)",
      "push-in": "ENTRELEC SNK PI-Spring, e.g. ZK2.5",
      "spring-clamp": "None separate: PI-Spring is push-in and spring in one clamp",
      "screw-clamp": "ENTRELEC SNK screw, e.g. ZS4; SNA Compact",
      ground: "Green-yellow versions, e.g. ZK2.5 G/Y",
      fuse: "SNK fuse blocks, e.g. ZS4-SF",
      disconnect: "SNK knife-disconnect, e.g. ZS4-S; ESSAILEC test blocks",
      "multi-level": "SNK double-deck, e.g. ZK2.5-D2",
      pcb: "BUCHANAN, including TERMI-BLOK (fixed and pluggable)",
      barrier: "BUCHANAN barrier blocks",
      marking: "ENTRELEC MC512 / MC612 marker cards",
    },
    strengths: ["Full DIN-rail (ENTRELEC) and PCB and barrier (BUCHANAN) ranges from one maker", "SNK range lists UL, CSA, ATEX and IECEx approvals"],
    check: ["Older ENTRELEC parts carry ABB branding but keep the same 1SNK order codes", "Some BUCHANAN parts are listed as not currently available: check status before specifying"],
    part: {
      kind: PUSH_IN_25,
      name: "ENTRELEC ZK2.5 PI-Spring feed-through, grey",
      number: "1SNK705010R0000",
      connection: "Push-in + spring (PI-Spring)",
      width: "5.2 mm",
      conductor: "0.2–4 mm² (26–12 AWG)",
      iec: "24 A / 1000 V",
      ul: "UL: 20 A / 600 V; CSA: 600 V",
      approvals: "UL, CSA, CB",
      source: "https://www.digikey.ie/en/products/detail/te-connectivity-entrelec/1SNK705010R0000/10061447",
    },
  },
  {
    slug: "molex",
    name: "Molex",
    hq: "United States",
    summary: "Connector maker whose terminal blocks are mainly Beau barrier strips and Beau Eurostyle PCB blocks, plus a smaller DIN-rail range.",
    ranges: {
      system: "Beau (barrier strips and Eurostyle PCB blocks)",
      "screw-clamp": "DIN-rail screw feed-through blocks (small range)",
      pcb: "Beau Eurostyle, fixed (e.g. 39880) and pluggable (e.g. 39530)",
      barrier: "Beau barrier strips, single and dual row, 6.35–17.46 mm pitch",
    },
    strengths: ["Long-standing Beau barrier strip and Eurostyle PCB lines", "Barrier strips for panel, DIN-rail and PCB mounting"],
    check: ["The DIN-rail range is small and its series names are hard to find: confirm the part before specifying", "Distributor listings disagree on wire range for some Eurostyle parts: check the Molex drawing"],
    part: {
      kind: "2-pole PCB screw terminal block, 5.0–5.08 mm pitch",
      name: "Beau Eurostyle low-profile fixed PCB block, 2 circuits",
      number: "39880-0302",
      connection: "Screw, rising clamp",
      width: "5.08 mm pitch",
      conductor: "30–16 AWG",
      iec: "",
      ul: "300 V / 13.5 A per contact",
      approvals: "UL",
      source: "https://www.molex.com/en-us/products/part-detail/398800302",
    },
  },
  {
    slug: "wurth-elektronik",
    name: "Würth Elektronik",
    hq: "Germany",
    summary: "Electronic component maker whose WR-TBL range covers PCB terminal blocks in screw, push-in and spring, fixed and pluggable, from 2.50 to 10.16 mm pitch.",
    ranges: {
      system: "WR-TBL (PCB mount)",
      "push-in": "WR-TBL screwless push-in PCB blocks (no rail-mount)",
      "spring-clamp": "WR-TBL screwless spring PCB blocks (no rail-mount)",
      "screw-clamp": "WR-TBL rising cage clamp PCB blocks, e.g. Series 2135",
      "multi-level": "Double-level PCB blocks, e.g. Series 2335",
      pcb: "WR-TBL fixed and pluggable",
      ground: "None found",
      fuse: "None found",
      barrier: "None found",
    },
    strengths: ["Wide pitch range (2.50–10.16 mm) and many pluggable header styles", "Datasheets list both cULus and VDE ratings"],
    check: ["PCB only: no DIN-rail blocks found", "UL and VDE voltages differ (e.g. 300 V UL vs 250 V VDE): use the one your approval needs"],
    part: {
      kind: "2-pole PCB screw terminal block, 5.0–5.08 mm pitch",
      name: "WR-TBL Series 2135, horizontal entry, 2 pins",
      number: "691213510002",
      connection: "Screw, rising cage clamp",
      width: "5.08 mm pitch",
      conductor: "30–14 AWG",
      iec: "VDE: 14 A / 250 V",
      ul: "cULus: 14 A / 300 V",
      approvals: "cULus, VDE",
      source: "https://www.we-online.com/catalog/en/TBL_5_08_2135_HORIZONTAL_ENTRY_MODULAR_69121351000x",
    },
  },
  {
    slug: "metz-connect",
    name: "Metz Connect",
    hq: "Germany",
    summary: "Family-owned German connection technology maker with fixed and pluggable PCB terminal blocks, plus DIN-rail housings and I/O modules.",
    ranges: {
      "spring-clamp": "Spring-clamp PCB blocks",
      "screw-clamp": "Screw PCB blocks, e.g. 311011 series",
      pcb: "Fixed and pluggable PCB blocks and headers",
    },
    strengths: ["PCB terminal blocks are a core product line", "Also makes DIN-rail housings and I/O modules for building and industrial automation"],
    check: ["No rail-mount feed-through range confirmed: compare with a rail-mount brand", "Confirm UL and VDE values for the exact order number"],
    part: {
      kind: "2-pole PCB screw terminal block, 5.0–5.08 mm pitch",
      name: "2-position horizontal PCB block",
      number: "31101102",
      connection: "Screw (M3)",
      width: "5.08 mm pitch",
      conductor: "28–14 AWG",
      iec: "",
      ul: "15 A / 300 V",
      approvals: "",
      source: "https://www.digikey.com/en/products/detail/metz-connect-usa-inc/31101102/7794830",
    },
  },
  {
    slug: "camdenboss",
    name: "Camdenboss",
    hq: "United Kingdom",
    summary: "UK maker of enclosures and electromechanical parts whose terminal blocks are mainly PCB types (CTB, CamBlock Plus), plus DIN-rail-mount pluggable blocks.",
    ranges: {
      system: "CTB and CamBlock Plus (CTBP)",
      "screw-clamp": "Rising clamp and wire protector PCB blocks (CTB, CTBP)",
      pcb: "CTB / CTBP fixed and pluggable, including DIN-rail-mount pluggable blocks",
      ground: "None found",
      disconnect: "None found",
      marking: "None found",
    },
    strengths: ["Common PCB pitches with both UL and VDE ratings published", "DIN-rail-mount pluggable blocks let a circuit be unplugged without lifting wires"],
    check: ["No conventional DIN-rail feed-through range found: compare with a rail-mount brand", "Distributor listings disagree on wire range: check the Camdenboss datasheet"],
    part: {
      kind: "2-pole PCB screw terminal block, 5.0–5.08 mm pitch",
      name: "CamBlock Plus rising clamp, 2-way",
      number: "CTBP0100/2",
      connection: "Screw, rising clamp",
      width: "5.0 mm pitch",
      conductor: "up to 2.5 mm²",
      iec: "VDE: 20 A",
      ul: "UL: 16 A / 300 V",
      approvals: "UL, VDE",
      source: "https://www.rapidonline.com/camblock-plus-5mm-standard-profile-rising-clamps-566171",
    },
  },
  {
    slug: "degson",
    name: "Degson",
    hq: "China",
    summary: "Chinese maker of PCB terminal blocks (fixed and pluggable) and a full DIN-rail range in push-in, spring-cage, screw and bolt connection.",
    ranges: {
      system: "DIN rail: DS, WS, STB, PC and DC series; PCB: DG fixed, EDG pluggable",
      "push-in": "DS series, e.g. DS2.5",
      "spring-clamp": "WS and STB spring-cage series",
      "screw-clamp": "PC (brass cage) and DC (steel) series",
      ground: "PE versions, e.g. DS2.5-PE",
      "multi-level": "Double-level KK types, e.g. PCKK2.5",
      pcb: "DG fixed (e.g. DG126) and EDG pluggable",
    },
    strengths: ["Makes both DIN-rail (push-in, spring, screw, bolt) and PCB blocks", "Product pages list separate IEC and UL ratings"],
    check: ["UL ratings can be much lower than IEC (DG126: 18 A IEC vs 10 A UL): use the one your approval needs", "Confirm the approvals (UL, VDE) for each order code"],
    part: {
      kind: "2-pole PCB screw terminal block, 5.0–5.08 mm pitch",
      name: "DG126-5.0 PCB screw block, 2-pole",
      number: "DG126-5.0-02P-14-00A(H)",
      connection: "Screw",
      width: "5.0 mm pitch",
      conductor: "0.5–2.5 mm² (26–14 AWG)",
      iec: "18 A / 250 V",
      ul: "UL: 10 A / 300 V",
      approvals: "UL, VDE",
      source: "https://www.degson.com/content/details_552_880860.html",
    },
  },
  {
    slug: "marathon",
    name: "Marathon Special Products",
    hq: "United States",
    summary: "US maker of heavy-duty barrier terminal blocks, power distribution blocks and fuse holders.",
    ranges: {
      system: "Barrier terminal blocks: 1500, 1600 and 1700 series",
      "push-in": "None",
      "spring-clamp": "None",
      "screw-clamp": "Screw and stud barrier blocks (no DIN-rail feed-through)",
      fuse: "Panel-mount fuse holders",
      barrier: "1500 series (with cover, shorting-bar and stud variants), 1600 and 1700",
    },
    strengths: ["600 V UL/CSA heavy-duty barrier blocks rated up to 75 A with ring or fork terminals", "Variants with hinged covers, shorting bars and stud connectors"],
    check: ["Rated 30 A with bare wire but 75 A only with crimped ring, spade or fork terminals", "Panel-mount: DIN-rail use needs Marathon's separate rail adapter"],
    part: {
      kind: "2-pole heavy-duty barrier block",
      name: "1500 Series barrier block, 2 poles",
      number: "1502STD",
      connection: "Screw (10-32), barrier",
      width: "15.88 mm (0.625 in) centres",
      conductor: "22–10 AWG copper",
      iec: "",
      ul: "UL and CSA: 600 V; 30 A bare wire, 75 A with ring or fork terminals",
      approvals: "UL Recognized (UL 1059), CSA",
      source: "https://www.onlinecomponents.com/upload/parts/datasheets/mf-ku/marathon-1500-heavy-duty-terminals.pdf",
    },
  },
];

/** How the brands are grouped in the picker and on /compare */
export const brandGroups: { label: string; hint: string; slugs: string[] }[] = [
  {
    label: "Terminal block specialists",
    hint: "Rail-mount terminal blocks are the core of the business",
    slugs: ["phoenix-contact", "weidmuller", "wago", "wieland-electric", "conta-clip", "dinkle", "altech"],
  },
  {
    label: "Automation and power manufacturers",
    hint: "Terminal blocks alongside breakers, relays and controls",
    slugs: ["schneider-electric", "abb", "siemens", "allen-bradley", "eaton", "omron", "idec", "sprecher-schuh"],
  },
  {
    label: "Connector, PCB and barrier strip makers",
    hint: "PCB and barrier blocks, some with rail-mount ranges too",
    slugs: ["te-connectivity", "molex", "wurth-elektronik", "metz-connect", "camdenboss", "degson", "marathon"],
  },
];

export const getBrand = (slug: string) => brands.find((b) => b.slug === slug);

/** Canonical URL slug for a pair, alphabetical so each pair has exactly one page. */
export function pairSlug(a: string, b: string) {
  return [a, b].sort().join("-vs-");
}

export function parsePair(slug: string): [Brand, Brand] | null {
  const parts = slug.split("-vs-");
  if (parts.length !== 2) return null;
  const [a, b] = parts.map(getBrand);
  if (!a || !b || a.slug === b.slug) return null;
  return [a, b];
}

export function allPairs() {
  const out: [Brand, Brand][] = [];
  for (let i = 0; i < brands.length; i++) for (let j = i + 1; j < brands.length; j++) out.push([brands[i], brands[j]].sort((x, y) => x.slug.localeCompare(y.slug)) as [Brand, Brand]);
  return out;
}

/** The comparisons people search for most often, shown on the homepage and /compare */
export const popularPairs: [string, string][] = [
  ["phoenix-contact", "weidmuller"],
  ["phoenix-contact", "wago"],
  ["wago", "weidmuller"],
  ["phoenix-contact", "schneider-electric"],
  ["allen-bradley", "phoenix-contact"],
  ["siemens", "weidmuller"],
  ["eaton", "phoenix-contact"],
  ["abb", "phoenix-contact"],
  ["dinkle", "phoenix-contact"],
];

/** Brand options for the picker, grouped (plain data, safe to pass to the browser) */
export function pickerGroups() {
  return brandGroups.map((g) => ({
    label: g.label,
    options: g.slugs.flatMap((s) => {
      const b = getBrand(s);
      return b ? [{ slug: b.slug, name: b.name }] : [];
    }),
  }));
}

/** Brands in the homepage strip (logos where we have them, names otherwise) */
export const stripBrands = [
  "Phoenix Contact",
  "Weidmüller",
  "WAGO",
  "Schneider Electric",
  "Siemens",
  "Allen-Bradley",
  "Eaton",
  "Wieland",
  "TE Connectivity",
  "Omron",
  "IDEC",
  "Sprecher+Schuh",
  "Conta-Clip",
  "Dinkle",
  "Molex",
  "Würth Elektronik",
];
