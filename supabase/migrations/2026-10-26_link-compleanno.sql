-- =====================================================================
-- The guest's birthday link, /auguri/<code>: the wishes carry a personal
-- link to book around the birthday with the birthday offer.
--  - birthdays.invite_code / invite_for / invite_booking_id: this year's link,
--    the birthday it is for, and the booking made with it (nothing appears in
--    Gestione until the guest books).
--  - birthdays.invite_terms: what the wishes promised (days of the link, offer
--    IT/EN), fixed when they are sent: changing the settings later applies only
--    to the next wishes.
--  - bookings.birthday_offer: the offer promised, shown to the staff.
--
-- Run ONCE on the existing database, after 2026-10-25_promozioni-compleanni.sql:
-- Supabase → SQL Editor → paste → Run. Safe to run again.
-- (A new database only needs supabase/schema.sql.)
-- =====================================================================

alter table public.birthdays add column if not exists invite_code text unique;
alter table public.birthdays add column if not exists invite_for date;
alter table public.birthdays add column if not exists invite_booking_id uuid references public.bookings(id) on delete set null;
alter table public.birthdays add column if not exists invite_terms jsonb;

alter table public.bookings add column if not exists birthday_offer text check (char_length(birthday_offer) <= 300);

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
