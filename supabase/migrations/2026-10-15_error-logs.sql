-- =====================================================================
-- Error log shown in Gestione → Log errori (only to the developer's account).
--
-- Run ONCE on the existing database: Supabase → SQL Editor → paste → Run.
-- Safe to run again. (A new database only needs supabase/schema.sql.)
-- =====================================================================

create table if not exists public.error_logs (
  id         uuid primary key,
  created_at timestamptz not null default now(),
  source     text not null check (source in ('render','route','action','proxy','browser','handled')),
  message    text not null default '',
  stack      text not null default '',
  path       text not null default '',
  context    jsonb not null default '{}'::jsonb
);
create index if not exists error_logs_created_idx on public.error_logs (created_at desc);

-- server access only (secret key), like bookings
alter table public.error_logs enable row level security;
