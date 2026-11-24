# TerminalBlock.ca

The first site in the Proax industrial sourcing network. **Runs on localhost. Nothing is published, nobody is emailed, and no external service is contacted until you switch it on.**

## Run it

```bash
npm run dev        # site at http://localhost:3000, sourcing desk at /desk
npm test           # automated tests
```

Settings live in `.env.local` (see `.env.example` for every option). The desk password was generated into `.env.local` as `DESK_PASSWORD`.

## What's on/off by default

| Piece | Default | Switch on with |
| --- | --- | --- |
| Lead storage | Local files in `.data/` (git-ignored) | `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`, after running `supabase/migrations/` |
| Lead alerts | Written to `.data/outbox/`, nobody emailed | `EMAIL_DELIVERY=on` + `RESEND_API_KEY`, `LEAD_ALERT_TO`, `LEAD_ALERT_FROM` |
| AI (lead analysis, photo ID, article drafts) | Off; rule-based analysis and outlines instead | `ANTHROPIC_API_KEY` |
| Publishing approved drafts | Off | `CONTENT_PUBLISHING=on` |
| Weekly AI article job | Off | `CRON_SECRET` + `ANTHROPIC_API_KEY` on the host (schedule in `vercel.json`) |
| Search indexing | Blocked (`robots.ts`, `noindex`) | Set `launched = true` in `src/app/robots.ts` and remove `robots` in `layout.tsx` |

## Pages

| Page | What it does |
| --- | --- |
| `/` | Homepage: quick RFQ box, tools, product types, guides, FAQ |
| `/finder` | Terminal block finder over the Proax catalog; adds parts to an RFQ |
| `/identify` | Cross-reference a part number; identify a block from a photo (AI) |
| `/rfq` | 3-step RFQ. Excel/CSV BOMs are read into lines automatically |
| `/types`, `/guides`, `/about`, `/privacy`, `/terms` | Content and legal pages |
| `/desk` | **Internal sourcing desk** (password): leads, scores, supplier inquiry drafts, files, notes, status |
| `/desk/content` | Article queue: weekly AI drafts, editor, AI revisions, quality checks, approve and publish |

## How an RFQ flows

1. Browser form → `POST /api/rfq` (validation, spam checks, file checks, rate limits).
2. Lead saved with a reference like `RFQ-TB-261113-7KQ4`. The buyer sees their confirmation right away.
3. In the background: each line is matched to the catalog, the lead is scored (explainable, rule-based), and with AI on it also gets a summary, buyer type, flags, questions and a supplier inquiry draft. **Buyer name, email and phone are never sent to the AI.**
4. An alert goes to the sourcing desk (outbox file until email is switched on).

## How the weekly articles work (SEO content)

1. **Topics**: `content/keywords.json` lists the searches to target, with a priority (1 = first). Add new ones as buyers' questions come in.
2. **Drafting**: every Monday around 9 am Toronto, the host calls `/api/cron/content` (protected by `CRON_SECRET`). It picks the highest-priority topic that isn't covered yet and has Claude write one article, plus a list of every technical claim to check. A "new article to review" notice goes to the review team. The **Write the next article now** button in the desk runs the same job.
3. **Brakes**: the job pauses while `CONTENT_MAX_WAITING` (default 4) articles are waiting for review, and refuses topics too close to existing ones. Without an API key, the scheduled job does nothing and the desk button makes an outline for a person to write.
4. **Review** (in `/desk/content`): read the article, check the claims against datasheets, and look at the quality checks (length, title length, hype words, supplier or distributor names). Fix things with **Edit** (plain-text editor) or **Revise with AI** (describe the change).
5. **Publish**: with `CONTENT_PUBLISHING=on`, **Approve and publish** puts the article on `/guides/<slug>` and in the sitemap straight away, with no rebuild. **Unpublish** takes it down again. Nothing is ever published without a person approving it.

Articles are kept in `content/drafts/` locally, or in the Supabase `content_drafts` table once Supabase is connected (`supabase/migrations/20261124000000_content.sql`, not applied yet). The hosted site needs Supabase, because a hosted server can't keep files it writes.

## How the code is organized

```
src/
  config/site.ts          brand, domain, nav (change per site)
  data/                   product types, guides, FAQ, catalog loader
  app/(site)/             public pages
  app/desk/               internal sourcing desk (login, leads, content)
  app/api/                rfq, bom, identify, desk file downloads
  proxy.ts                protects /desk and /api/desk
  server/                 server-only code, never sent to browsers
    rfq/ bom/ sourcing/   validation, spam, BOM reading, matching, scoring, analysis
    storage/ email/ ai/   local or Supabase storage, alerts, Claude
    content/ auth/        drafts and publishing, desk sessions
content/                  keyword targets and draft guides (reviewed in git)
supabase/migrations/      lead table, file bucket and article table (not applied)
scripts/                  builds the downloadable guide PDF (npm run guide:pdf)
tests/                    automated tests (npm test)
```

The network registry for all nine sites is in `../../config/network.json`, and the strategy is in `../../docs/strategy.md`.

## Product data

The catalog is a fixed snapshot in `src/data/catalog/`:

- `parts.json`: part number, manufacturer, description and parsed specs (no prices, costs or customer data).
- `stock.json`: yes/no in-stock flags, never quantities.
- `ranking.json`: part ids in best-seller order and "often ordered with" lists (ids only, no sales figures). It decides which parts get their own page.

The site has no live connection to the featured supplier's systems. To refresh the catalog, replace these three files with a new snapshot in the same format.

## Still to do before launch

- Choose the Supabase project and email service, and add the Claude API key
- Set `CRON_SECRET` on the host and decide who reviews the weekly articles
- Legal review of privacy and terms; confirm the brands list
- Domain connection (Hakan and Masood) and opening robots.txt
