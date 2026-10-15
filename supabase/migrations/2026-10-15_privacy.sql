-- =====================================================================
-- Privacy: automatic deletion of old data + anti-spam limit per connection.
--
-- Run ONCE on the existing database: Supabase → SQL Editor → paste → Run.
-- Safe to run again. (A new database only needs supabase/schema.sql.)
--
-- The periods below are the ones promised in the privacy notice:
-- keep them equal to RETENTION in src/lib/legal.ts.
-- =====================================================================

-- Booking requests per connection (anti-spam). Only a keyed hash of the IP
-- address is stored, never the address itself, and only for one day.
create table if not exists public.booking_attempts (
  id         bigint generated always as identity primary key,
  ip_hash    text not null,
  created_at timestamptz not null default now()
);
create index if not exists booking_attempts_ip_idx on public.booking_attempts (ip_hash, created_at);

-- server access only (secret key)
alter table public.booking_attempts enable row level security;

-- Deletes what the privacy notice says we no longer keep.
create or replace function public.purge_old_data()
returns void
language sql
security definer
set search_path = public
as $$
  -- special requests (may hold allergies): 30 days after the visit
  update public.bookings set notes = '' where notes <> '' and date < current_date - 30;
  -- bookings and guest history: 24 months (their WhatsApp messages go with them, on delete cascade)
  delete from public.bookings where date < current_date - interval '24 months';
  -- status of the automatic WhatsApp messages: 6 months
  delete from public.whatsapp_messages where created_at < now() - interval '6 months';
  -- anti-spam log: 1 day
  delete from public.booking_attempts where created_at < now() - interval '1 day';
$$;
revoke all on function public.purge_old_data() from public, anon, authenticated;

-- Every night at 03:30 UTC (Supabase → Integrations → Cron shows the job and its runs).
-- pg_cron must be enabled: Integrations → Cron → Enable (or Database → Extensions → pg_cron).
-- If it already is, the next line does nothing.
create extension if not exists pg_cron;
select cron.schedule('purge-old-data', '30 3 * * *', 'select public.purge_old_data()');

-- First cleanup right away
select public.purge_old_data();
