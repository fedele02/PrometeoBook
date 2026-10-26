-- =====================================================================
-- Promotions and birthday wishes.
--  - bookings.promotion: the discount valid when the guest booked
--    ({"id","name","percent","conditions"}), kept even if the promotion changes.
--  - birthdays: guests who agreed to the WhatsApp birthday wishes, one per phone
--    number, only day and month ("MM-DD"), with the consent text and date.
--
-- Run ONCE on the existing database: Supabase → SQL Editor → paste → Run.
-- Safe to run again. (A new database only needs supabase/schema.sql.)
-- =====================================================================

alter table public.bookings add column if not exists promotion jsonb;

create table if not exists public.birthdays (
  phone_key     text primary key,
  phone         text not null check (char_length(phone) between 6 and 25),
  name          text not null check (char_length(name) between 2 and 80),
  birthday      text not null check (birthday ~ '^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$'),
  consent_text  text not null,
  consent_at    timestamptz not null default now(),
  last_sent_for date,
  last_error    text
);
create index if not exists birthdays_birthday_idx on public.birthdays (birthday);

-- no policies: nobody but the server (secret key) can read or change it
alter table public.birthdays enable row level security;

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

  insert into public.bookings (date, time, people, name, phone, email, notes, status, source, promotion)
  values (v_date, v_time, v_people, p->>'name', p->>'phone', coalesce(p->>'email',''),
          coalesce(p->>'notes',''), coalesce(p->>'status','pending'), coalesce(p->>'source','web'),
          case when jsonb_typeof(p->'promotion') = 'object' then p->'promotion' end)
  returning * into v_row;

  return v_row;
end $$;

revoke all on function public.create_booking(jsonb, int) from public, anon, authenticated;
grant execute on function public.create_booking(jsonb, int) to service_role;

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
