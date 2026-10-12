-- =====================================================================
--  Prometeo Fine Dining — database schema
--  Run once in Supabase → SQL Editor (safe to re-run).
-- =====================================================================

-- ---------- tables ----------------------------------------------------

create table if not exists public.settings (
  id          smallint primary key default 1 check (id = 1),
  data        jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);

create table if not exists public.categories (
  id          text primary key default gen_random_uuid()::text,
  name        text not null,
  description text not null default '',
  position    int  not null default 0,
  visible     boolean not null default true
);

create table if not exists public.dishes (
  id          text primary key default gen_random_uuid()::text,
  category_id text not null references public.categories(id) on delete cascade,
  name        text not null,
  description text not null default '',
  price       numeric(8,2),
  price_note  text not null default '',
  image_url   text not null default '',
  tags        text[] not null default '{}',
  allergens   int[]  not null default '{}',
  visible     boolean not null default true,
  available   boolean not null default true,
  position    int  not null default 0
);
create index if not exists dishes_category_idx on public.dishes (category_id, position);

create table if not exists public.bookings (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  date        date not null,
  time        text not null check (time ~ '^[0-2][0-9]:[0-5][0-9]$'),
  people      int  not null check (people between 1 and 60),
  name        text not null check (char_length(name) between 2 and 80),
  phone       text not null check (char_length(phone) between 6 and 25),
  email       text not null default '',
  notes       text not null default '' check (char_length(notes) <= 500),
  status      text not null default 'pending' check (status in ('pending','confirmed','declined','cancelled')),
  source      text not null default 'web' check (source in ('web','admin')),
  -- secret of the guest's private page /prenotazione/<token>
  manage_token uuid not null default gen_random_uuid() unique
);
create index if not exists bookings_date_idx on public.bookings (date, time);
create index if not exists bookings_phone_idx on public.bookings (phone, created_at);

-- Phones and computers subscribed to the staff app's push notifications.
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

-- Users allowed into the staff area (add rows after creating the user in Auth).
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- ---------- row level security ---------------------------------------
-- The website reads/writes through server code using the secret key.
-- Public (anon) access is limited to what the website shows anyway.

alter table public.settings   enable row level security;
alter table public.categories enable row level security;
alter table public.dishes     enable row level security;
alter table public.bookings   enable row level security;
alter table public.admins     enable row level security;
alter table public.push_devices enable row level security;

drop policy if exists "public read settings" on public.settings;
create policy "public read settings" on public.settings for select using (true);

drop policy if exists "public read categories" on public.categories;
create policy "public read categories" on public.categories for select using (visible);

drop policy if exists "public read dishes" on public.dishes;
create policy "public read dishes" on public.dishes for select using (visible);

drop policy if exists "admin reads own row" on public.admins;
create policy "admin reads own row" on public.admins for select to authenticated using (user_id = auth.uid());

-- bookings, push_devices: no policies → nobody but the server (secret key) can touch them.

-- ---------- atomic booking -------------------------------------------

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
  -- serialize bookings for the same slot
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

-- A guest changes date, time, guests or notes: same slot lock, the booking's own
-- seats don't count, and it goes back to "pending" for the staff to confirm again.
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

-- ---------- storage for dish photos ----------------------------------

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;
