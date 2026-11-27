# TerminalBlock.ca: remaining work

What's left from the meeting transcript, after the redesign into a brand-comparison site. Everything is built and checked on localhost first; nothing is published until it's approved.

Status: `[x]` done · `[~]` in progress · `[ ]` to do

---

## 1. Links from guides to proax.ca  `[x]`

**Goal:** about 60–70% of guides send readers to the matching proax.ca category, to pass on ranking and give buyers somewhere to go.

**Links:**
- Terminal blocks (default for every guide): https://proax.ca/en/category/3850/terminal-blocks
- Push-in terminal blocks (guides about push-in): https://proax.ca/en/category/3855/push-in-connection-terminal-blocks

**How it works:** `src/data/buy-links.ts` maps a guide's topic to a link. A guide about push-in blocks gets the push-in category; every other guide gets the general terminal blocks category. The link appears as a "Browse terminal blocks" box beside the article.

**Added (2026-11-27):**
- Category links for screw, spring-cage, PCB, test/disconnect and accessories (from proax.ca's terminal block subcategories), used by guides and the type pages.
- Brand links for the four brands proax.ca lists under terminal blocks: Phoenix Contact, ABB (ENTRELEC, also used for TE Connectivity), Omron and Sprecher+Schuh (added as a compared brand). They show as "Buy online" in each comparison table and on the brand cards, labelled "at proax.ca".
- Brands Proax doesn't list show "Ask us about [brand]" instead, so the question can be answered with a stocked equivalent.

**How Proax benefits:** clicks through to proax.ca from guides, type pages and comparisons; questions about brands Proax doesn't carry become chances to offer an equivalent it stocks; comparison PDF downloads are leads; and a neutral site that ranks passes traffic and trust to proax.ca.

---

## 2. Check and correct the comparison facts  `[x]`

**Goal:** every brand fact on the site is verified, because the site's credibility depends on it.

**Steps:**
1. Research each brand's terminal block ranges from manufacturer catalogues, datasheets and large distributors: product family names per category, head office, one comparable part with its ratings.
2. Correct `src/data/brands.ts`. Anything that can't be confirmed is shown as "—" (not listed), never guessed.
3. Keep a source link for each comparable part.
4. Before launch: a person who knows the products reads the final data once.

**Done (2026-11-27):** all 21 brands researched and corrected, each with a comparable part and its datasheet link. Notable corrections: ABB sold its ENTRELEC terminal block range to TE Connectivity in 2018; TE is now incorporated in Ireland; Wieland is replacing fasis and selos WT with selos WTPN and WTN (old series final order 1 May 2026); Allen-Bradley has push-in (1492-P); Eaton's XB range has no push-in; Degson makes DIN-rail blocks too.

**Still worth a second look:** Molex's DIN-rail series names, Metz Connect's approvals, and the Siemens 8WH6000-0AF00 current rating (sources disagree). These are flagged on the brand data.

---

## 3. One big comparison table per brand pair  `[x]`

**Goal:** like the transcript says, each comparison page is one big table comparing the two companies, not a separate part-vs-part feature.

**The table rows:**
- **Company:** head office, what the range is known for
- **Range by type:** system name, push-in, spring, screw, ground, fuse, disconnect, multi-level, PCB, barrier strips, marking
- **A similar part, side by side:** each brand's closest equivalent (for example a 2.5 mm² push-in feed-through block), with part number, width, conductor range, IEC and UL ratings and approvals
- **Strengths** and **things to check** for each brand

Rows where neither brand has anything listed are hidden.

---

## 4. More images in the guides  `[x]`

**Goal:** every guide has real product images, not only text.

**Steps:**
1. An image block for articles (picture plus caption), usable in the plain-text editor (`![Caption](push-in, ground)`, one to three images per line) and by the AI writer, which can only choose from the site's own images.
2. A product image in each guide's header, matching its topic.
3. Images placed through the existing guides where they help: connection types, ground and fuse blocks, accessories, PCB blocks.

**Later:** images of more brands' parts, so a neutral site doesn't show mostly one brand (today's product images are Phoenix Contact parts).

---

## 5. Lead capture: comparison PDF and questions on guides  `[x]`

**Comparison pages:** "Email me this comparison (PDF)". The visitor leaves an email, the download starts and a 7-day link is emailed. The PDF is built from a fixed template (`src/server/compare-pdf.ts`) using the same brand data as the page, with no AI: the full table, the similar parts side by side, how-to-choose tips and the datasheet sources. Each download is saved as a "Comparison PDF" lead in the desk.

**Guides:** as agreed on the call, the "Ask us your question" form sits at the top of the guides page and of every guide, and the old "email me the checklist PDF" offer is gone. (The checklist PDF file is still in `content/downloads/` if it's wanted again.)

---

## 6. Publish for review  `[ ]`

**Goal:** a link the team can look at.

**Note:** pushing to GitHub `main` publishes automatically through Vercel, so nothing is pushed until you say so. Until then, review on localhost.

---

## Decisions still needed

- **Privacy policy:** the law requires naming who handles visitors' details. It's a placeholder (`site.legal` in `src/config/site.ts`).
- **Product images:** source part images from more brands, so the site doesn't favour one brand visually.
