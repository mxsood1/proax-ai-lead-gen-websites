# Proax sourcing network: strategy

Nine independent, single-category sourcing sites that turn organic search into qualified RFQs for Proax Technologies. This document covers how they win traffic, how they convert it, how leads are handled, and how to roll the network out. It reflects what is built in `apps/terminalblock` and the registry in `config/network.json`.

## 1. Goal and how we measure it

The goal is **qualified industrial leads, not traffic**. Track, per site and per month:

| Metric | Source | Why it matters |
| --- | --- | --- |
| Organic clicks and impressions by query | Google Search Console | Are we visible for the searches buyers actually make |
| Tool usage (finder searches, identify runs, BOM uploads) | Privacy-friendly analytics | Engagement before the RFQ |
| RFQ submissions and conversion rate | Sourcing desk | The core output |
| Lead tier mix (hot / warm / cold / spam) | Desk lead score | Lead quality, not just volume |
| Quoted, won, lost, revenue | Desk status + Proax ERP | The business result |

A site is working when hot and warm leads grow month over month and some of them close.

## 2. How buyers search, and where we can win

Industrial buyers search in four patterns. Each site is built to answer all four.

1. **Exact part numbers** (`3044102`, `UT 4`, `1492-J4`). Highest intent; the buyer already knows what they need. Won by catalog-backed Finder results and, later, individual part pages.
2. **Replacement and obsolescence** (`UT 4 equivalent`, `discontinued terminal block replacement`). Urgent, often line-down. Won by the cross-reference / identify tools.
3. **Selection questions** (`push-in vs screw terminal blocks`, `how to size a terminal block`). Earlier in the process. Won by short, accurate guides that link into the tools and RFQ.
4. **Local supply** (`terminal block supplier Canada`). Won by clear Canadian positioning and a named featured supplier (Proax).

Large distributors rank for broad category terms. Our advantage is depth on one category, fast answers for part-number and replacement queries, and a one-form RFQ that covers every brand.

## 3. Site architecture (same on every domain)

- **Home**: the one-RFQ promise, the category's tool, product types, guides, FAQ.
- **Tool** (the lead magnet): finder plus identify / cross-reference, each ending in a pre-filled RFQ.
- **RFQ**: three steps, BOM upload (Excel/CSV read into lines automatically), photo and datasheet attachments.
- **Product type pages**: what each type is for, typical specs, parts from the catalog.
- **Guides**: short technical answers to real buyer questions.
- **About / privacy / terms**: Proax shown as the featured supplier that prepares and fulfils quotes; the privacy policy names Proax as responsible for submitted personal information (required under PIPEDA).

Shared engine, separate brands: each site reuses the code and changes its config, catalog search terms, content and tool. See `config/network.json`.

### Part pages (next big opportunity)

The catalog snapshot gives about 1,200 real terminal block parts. Individual part pages (`/parts/3044102`) can rank for exact part-number searches. To avoid thin, near-duplicate pages:

- Only publish a part page when it has real substance: full specs, matching accessories (end plates, jumpers), equivalents, and an RFQ button.
- Start with the parts Proax sells most, not the whole catalog.
- Never show internal notes, prices or stock unless Proax decides to.

## 4. Content system

Built into the sourcing desk (`/desk/content`):

1. **Keyword queue** (`content/keywords.json`): target searches with intent and priority, marked when covered.
2. **Draft**: AI writes a first draft (or an outline when AI is off). Topics too similar to existing guides are refused automatically.
3. **Fact-check list**: every draft lists the specific technical claims a person must verify against datasheets or standards.
4. **Human approval**: nothing is approved automatically. Outlines can't be approved until written.
5. **Publish switch**: approved drafts only appear on the site when `CONTENT_PUBLISHING=on`.

Suggested cadence once live: two to four reviewed guides per site per month. Quality and accuracy beat volume, and mass-produced pages risk Google's scaled-content spam policy.

## 5. Visibility in AI search (ChatGPT, Perplexity, Google AI answers)

- Clear, direct answers near the top of each guide, plus FAQs. These are the passages AI answers tend to quote.
- Structured data on every page (Organization, Article, FAQPage, BreadcrumbList). Already in place.
- Fast, server-rendered HTML that crawlers can read without running scripts. Already in place.
- Decide deliberately whether to allow AI crawlers in `robots.txt` at launch. Allowing them increases the chance of being cited.
- Consistent naming of the operator (Proax) so the network is trusted, not mistaken for a thin affiliate site.

## 6. Lead capture by site

| Site | Tool |
| --- | --- |
| terminalblock.ca | Terminal block finder, photo / part-number identifier (built) |
| contactors.ca | Contactor cross-reference finder |
| safetyrelays.ca | Safety relay comparison tool |
| safetyswitches.ca | Safety switch finder |
| safetylightcurtains.ca | Light curtain selection assistant (including safety distance) |
| solidstaterelays.ca | Relay replacement finder |
| upspowersupply.ca | UPS sizing calculator |
| actuators.ca | Actuator selection tool |
| pneumaticvalves.ca | Pneumatic valve identification tool |

Every tool ends in the same RFQ form, pre-filled with what the buyer found.

## 7. Lead handling

- **Intake**: validated form, spam protection (hidden field, timing check, rate limits), file checks.
- **Analysis**: each line is matched to the catalog with equivalents marked for verification. The lead gets a transparent rule-based score; with AI on, it also gets a summary, buyer type, flags, questions and a supplier inquiry draft. **The buyer's name, email and phone are never sent to the AI.**
- **Alert**: the sourcing desk is notified (email once switched on; local outbox until then).
- **Desk**: one dashboard for all nine sites (each lead is tagged with its site), with status from new to won/lost, notes and file downloads.
- **Privacy**: consent captured on the form; marketing opt-in is separate and unticked (CASL); part details, not contact details, are shared with suppliers (PIPEDA, and stated on the form).

## 8. Rollout

1. **terminalblock.ca**: approve design → connect Supabase and email → add the Claude API key → legal review → Hakan and Masood connect the domain → launch with robots open.
2. **Next sites** in the order of `config/network.json`. Contactors and the safety categories come next because buyers search them by part number and replacement need, like terminal blocks.
3. For each site: copy the app, change the config, export its catalog slice, build its tool, write 3–5 launch guides, review, launch.

## 9. Risks and guardrails

| Risk | Guardrail |
| --- | --- |
| Inaccurate technical content | Fact-check list per draft, human approval, no auto-publishing |
| Thin or duplicate AI pages | Duplicate-topic check, quality bar for part pages, modest cadence |
| Internal ERP data leaking | Read-only export of four fields only, internal notes filtered, no prices/stock, item IDs hashed |
| Customer data misuse | Consent on form, no PII to AI, private file storage, authenticated desk |
| Looking like a fake independent site, or upsetting Proax's manufacturer relationships | Proax named as featured supplier in the footer, about page and privacy policy; neutral wording about every brand; logos only after Proax marketing approves |
| Trademark issues | Brand names used only to identify products, with a footer notice |

## 10. Decisions needed from Proax

- Lead alert recipients and the email service.
- Supabase project for production lead storage.
- Anthropic API key and a monthly AI budget.
- Confirmation of the "brands we source" list and any service promises (for example reply times).
- Privacy contact and legal review of privacy and terms.
