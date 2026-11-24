-- TerminalBlock.ca / Proax lead network — article (SEO content) queue.
-- NOT APPLIED. Run only after the Supabase project is chosen and approved.
--
-- Design notes
-- - One row per article. The full article document lives in `data` (jsonb);
--   the columns the desk sorts and filters on are copied out alongside it.
-- - `site` keeps the nine sites apart if they share one Supabase project.
-- - Row Level Security is ON with NO policies: the public (anon) key can't read
--   or write anything. Only the server, using the service-role key, can.
-- - Publishing still needs a person to approve the article AND
--   CONTENT_PUBLISHING=on for that site.

create table if not exists public.content_drafts (
  id          text primary key,
  site        text not null,
  status      text not null default 'draft'
              check (status in ('draft','approved','rejected')),
  keyword     text not null,
  slug        text not null,
  updated_at  timestamptz not null default now(),
  data        jsonb not null
);

create index if not exists content_drafts_site_status_idx on public.content_drafts (site, status);
create index if not exists content_drafts_site_updated_idx on public.content_drafts (site, updated_at desc);

alter table public.content_drafts enable row level security;
-- (intentionally no policies)
