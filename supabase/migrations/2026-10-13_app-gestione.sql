-- =====================================================================
-- App "Prometeo Gestione": refused requests, guest's private link,
-- push notifications, guest changes.
--
-- Run ONCE on a database created with an older schema.sql:
-- Supabase → SQL Editor → paste everything → Run.
-- Safe to run again: every step checks what already exists.
-- (A new database only needs supabase/schema.sql, which already includes this.)
-- =====================================================================

-- 1. new status "declined" (refused by the staff)
alter table public.bookings drop constraint if exists bookings_status_check;
alter table public.bookings
  add constraint bookings_status_check check (status in ('pending','confirmed','declined','cancelled'));

-- 2. secret of the guest's private page; existing bookings get one automatically
alter table public.bookings
  add column if not exists manage_token uuid not null default gen_random_uuid();
create unique index if not exists bookings_manage_token_key on public.bookings (manage_token);

-- 3. devices subscribed to the staff app's notifications (server access only)
create table if not exists public.push_devices (
  id           uuid primary key,
  endpoint     text not null unique,
  p256dh       text not null,
  auth         text not null,
  label        text not null default '',
  prefs        jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now(),
  last_used_at timestamptz not null default now()
);
alter table public.push_devices enable row level security;

-- 4. refused and cancelled bookings never hold seats
create or replace function public.create_booking(p jsonb, max_covers int)
returns public.bookings
language plpgsql
as $$
declare
  v_date  date := (p->>'date')::date;
  v_time  text := p->>'time';
  v_people int := (p->>'people')::int;
  v_taken int;
  v_row   public.bookings;
begin
  perform pg_advisory_xact_lock(hashtext(v_date::text || ' ' || v_time));

  if max_covers is not null then
    select coalesce(sum(people), 0) into v_taken
      from public.bookings
     where date = v_date and time = v_time and status in ('pending','confirmed');
    if v_taken + v_people > max_covers then
      raise exception 'SLOT_FULL';
    end if;
  end if;

  insert into public.bookings (date, time, people, name, phone, email, notes, status, source)
  values (v_date, v_time, v_people, p->>'name', p->>'phone', coalesce(p->>'email',''),
          coalesce(p->>'notes',''), coalesce(p->>'status','pending'), coalesce(p->>'source','web'))
  returning * into v_row;

  return v_row;
end $$;

revoke all on function public.create_booking(jsonb, int) from public, anon, authenticated;
grant execute on function public.create_booking(jsonb, int) to service_role;

-- 5. a guest changes their booking (back to "pending")
create or replace function public.change_booking(p_id uuid, p jsonb, max_covers int)
returns public.bookings
language plpgsql
as $$
declare
  v_date   date := (p->>'date')::date;
  v_time   text := p->>'time';
  v_people int  := (p->>'people')::int;
  v_taken  int;
  v_row    public.bookings;
begin
  perform pg_advisory_xact_lock(hashtext(v_date::text || ' ' || v_time));

  select coalesce(sum(people), 0) into v_taken
    from public.bookings
   where date = v_date and time = v_time and status in ('pending','confirmed') and id <> p_id;
  if v_taken + v_people > max_covers then
    raise exception 'SLOT_FULL';
  end if;

  update public.bookings
     set date = v_date, time = v_time, people = v_people,
         notes = coalesce(p->>'notes', ''), status = 'pending'
   where id = p_id
  returning * into v_row;

  if v_row.id is null then
    raise exception 'NOT_FOUND';
  end if;
  return v_row;
end $$;

revoke all on function public.change_booking(uuid, jsonb, int) from public, anon, authenticated;
grant execute on function public.change_booking(uuid, jsonb, int) to service_role;
