-- =====================================================================
-- Automatic WhatsApp messages to guests (YCloud).
--
-- Run ONCE on the existing database: Supabase → SQL Editor → paste → Run.
-- Safe to run again. (A new database only needs supabase/schema.sql.)
-- =====================================================================

create table if not exists public.whatsapp_messages (
  id          uuid primary key,
  booking_id  uuid not null references public.bookings(id) on delete cascade,
  kind        text not null check (kind in ('requested','confirmed','declined','cancelled')),
  provider_id text,
  status      text not null default 'accepted' check (status in ('accepted','sent','delivered','read','failed')),
  error       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists whatsapp_messages_booking_idx on public.whatsapp_messages (booking_id);
create index if not exists whatsapp_messages_provider_idx on public.whatsapp_messages (provider_id);

-- server access only (secret key), like bookings
alter table public.whatsapp_messages enable row level security;
