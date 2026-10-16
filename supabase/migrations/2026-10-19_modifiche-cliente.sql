-- =====================================================================
-- Changes made by the guest, shown in plain words in the staff app:
-- "Orario: 20:30 → 21:00". The booking keeps the values from before the
-- first change (until the staff accepts, refuses or cancels it).
--
-- Run ONCE on the existing database: Supabase → SQL Editor → paste → Run.
-- Safe to run again. (A new database only needs supabase/schema.sql.)
-- =====================================================================

alter table public.bookings add column if not exists guest_change jsonb;

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
