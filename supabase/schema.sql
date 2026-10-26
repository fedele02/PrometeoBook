-- =====================================================================
--  Prometeo Fine Dining — database schema
--  Run once in Supabase → SQL Editor (safe to re-run).
-- =====================================================================

-- ---------- short code of the guest's link (/p/K7M2QX9T) ----------

-- random bytes from gen_random_uuid() (always available, no extension needed);
-- bytes 6 and 8 hold the uuid version/variant and are skipped
create or replace function public.gen_short_code()
returns text
language plpgsql
volatile
as $$
declare
  alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  bytes bytea := decode(replace(gen_random_uuid()::text, '-', ''), 'hex');
  picks constant int[] := array[0, 1, 2, 3, 4, 5, 10, 11];
  code text := '';
  i int;
begin
  foreach i in array picks loop
    code := code || substr(alphabet, (get_byte(bytes, i) % 32) + 1, 1);
  end loop;
  return code;
end $$;

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
  people      int  not null check (people between 1 and 1000),
  name        text not null check (char_length(name) between 2 and 80),
  phone       text not null check (char_length(phone) between 6 and 25),
  email       text not null default '',
  notes       text not null default '' check (char_length(notes) <= 500),
  status      text not null default 'pending' check (status in ('pending','confirmed','declined','cancelled')),
  source      text not null default 'web' check (source in ('web','admin')),
  -- secret of the guest's private page /prenotazione/<token>
  manage_token uuid not null default gen_random_uuid() unique,
  -- short link of the same page, sent in the messages: /p/<short_code>
  short_code  text not null default public.gen_short_code() unique,
  -- what the guest changed on their own, until the staff answers:
  -- {"at": <timestamp of the last change>, "before": {date, time, people, notes}}
  guest_change jsonb,
  -- discount of the promotion valid when booked: {"id","name","percent","conditions"}
  promotion   jsonb,
  -- booked with the birthday link: the offer promised in the wishes (promotions don't apply)
  birthday_offer text check (char_length(birthday_offer) <= 300)
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

-- Automatic WhatsApp messages to guests (YCloud): one row per message, status kept
-- up to date by the webhook (/api/whatsapp/webhook).
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

-- Users allowed into the staff area (add rows after creating the user in Auth).
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

-- Guests who agreed to the WhatsApp birthday wishes: one per phone number,
-- only day and month, with the consent text and date (deleted after 24 months).
create table if not exists public.birthdays (
  phone_key     text primary key,
  phone         text not null check (char_length(phone) between 6 and 25),
  name          text not null check (char_length(name) between 2 and 80),
  birthday      text not null check (birthday ~ '^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$'),
  consent_text  text not null,
  consent_at    timestamptz not null default now(),
  last_sent_for date,
  last_error    text,
  -- this year's booking link /auguri/<invite_code>, the birthday it is for, the booking made with it
  invite_code   text unique,
  invite_for    date,
  invite_booking_id uuid references public.bookings(id) on delete set null,
  -- what the wishes promised (days of the link, offer IT/EN), fixed when they are sent
  invite_terms  jsonb
);
create index if not exists birthdays_birthday_idx on public.birthdays (birthday);

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
alter table public.whatsapp_messages enable row level security;
alter table public.error_logs enable row level security;
alter table public.birthdays  enable row level security;

drop policy if exists "public read settings" on public.settings;
create policy "public read settings" on public.settings for select using (true);

drop policy if exists "public read categories" on public.categories;
create policy "public read categories" on public.categories for select using (visible);

drop policy if exists "public read dishes" on public.dishes;
create policy "public read dishes" on public.dishes for select using (visible);

drop policy if exists "admin reads own row" on public.admins;
create policy "admin reads own row" on public.admins for select to authenticated using (user_id = auth.uid());

-- bookings, push_devices, whatsapp_messages, error_logs, birthdays: no policies → nobody but the server (secret key) can touch them.

-- ---------- atomic booking (seats per service: lunch before 17:00, dinner from 17:00) ----

create or replace function public.create_booking(p jsonb, max_covers int)
returns public.bookings
language plpgsql
as $$
declare
  v_date   date := (p->>'date')::date;
  v_time   text := p->>'time';
  v_people int  := (p->>'people')::int;
  v_lunch  boolean := (p->>'time') < '17:00';
  v_taken  int;
  v_row    public.bookings;
begin
  -- serialize bookings for the same service of the same day
  perform pg_advisory_xact_lock(hashtext(v_date::text || case when v_lunch then ' lunch' else ' dinner' end));

  if max_covers is not null then
    select coalesce(sum(people), 0) into v_taken
      from public.bookings
     where date = v_date and (time < '17:00') = v_lunch and status in ('pending','confirmed');
    if v_taken + v_people > max_covers then
      raise exception 'SLOT_FULL';
    end if;
  end if;

  insert into public.bookings (date, time, people, name, phone, email, notes, status, source, promotion, birthday_offer)
  values (v_date, v_time, v_people, p->>'name', p->>'phone', coalesce(p->>'email',''),
          coalesce(p->>'notes',''), coalesce(p->>'status','pending'), coalesce(p->>'source','web'),
          case when jsonb_typeof(p->'promotion') = 'object' then p->'promotion' end,
          nullif(p->>'birthday_offer', ''))
  returning * into v_row;

  return v_row;
end $$;

revoke all on function public.create_booking(jsonb, int) from public, anon, authenticated;
grant execute on function public.create_booking(jsonb, int) to service_role;

-- A guest changes date, time, guests or notes: same service lock, the booking's own
-- seats don't count; the server decides the new status (confirmed or pending).
create or replace function public.change_booking(p_id uuid, p jsonb, max_covers int)
returns public.bookings
language plpgsql
as $$
declare
  v_date   date := (p->>'date')::date;
  v_time   text := p->>'time';
  v_people int  := (p->>'people')::int;
  v_lunch  boolean := (p->>'time') < '17:00';
  v_taken  int;
  v_row    public.bookings;
  v_old    public.bookings;
begin
  perform pg_advisory_xact_lock(hashtext(v_date::text || case when v_lunch then ' lunch' else ' dinner' end));

  select * into v_old from public.bookings where id = p_id;
  select coalesce(sum(people), 0) into v_taken
    from public.bookings
   where date = v_date and (time < '17:00') = v_lunch and status in ('pending','confirmed') and id <> p_id;
  if v_taken + v_people > max_covers then
    raise exception 'SLOT_FULL';
  end if;

  update public.bookings
     set date = v_date, time = v_time, people = v_people,
         notes = coalesce(p->>'notes', ''),
         status = case when p->>'status' in ('pending','confirmed') then p->>'status' else 'pending' end,
         -- the discount follows the new date and time (decided by the server)
         promotion = case when jsonb_typeof(p->'promotion') = 'object' then p->'promotion' end,
         -- keep the values from before the first change until the staff answers
         guest_change = jsonb_build_object(
           'at', now(),
           'before', coalesce(v_old.guest_change->'before', jsonb_build_object(
             'date', v_old.date, 'time', v_old.time, 'people', v_old.people, 'notes', v_old.notes))
         )
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
