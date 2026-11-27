-- TerminalBlock.ca / Proax lead network — lead storage.
-- NOT APPLIED. Run only after the Supabase project is chosen and approved.
--
-- Design notes
-- - One row per RFQ; the full lead document lives in `data` (jsonb), with the
--   columns the dashboard sorts/filters on copied out alongside it.
-- - Row Level Security is ON with NO policies: the public (anon) key can't read
--   or write anything. Only the server, using the service-role key, can.
-- - Uploaded files go to a PRIVATE bucket; they're only downloadable through
--   the authenticated sourcing-desk route.

create table if not exists public.leads (
  id          uuid primary key,
  ref         text not null unique,
  site        text not null,
  status      text not null default 'new'
              check (status in ('new','reviewing','answered','sourcing','quoted','won','lost','spam')),
  created_at  timestamptz not null default now(),
  data        jsonb not null
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_status_idx on public.leads (status);
create index if not exists leads_site_idx on public.leads (site);

alter table public.leads enable row level security;
-- (intentionally no policies)

insert into storage.buckets (id, name, public)
values ('rfq-files', 'rfq-files', false)
on conflict (id) do nothing;
