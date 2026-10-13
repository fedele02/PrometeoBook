-- =====================================================================
-- Seats per service instead of per time: lunch (before 17:00) and dinner
-- (from 17:00) of a day each have one limit, whatever the time of the booking.
-- A guest's change keeps the status the server decides (confirmed at once for
-- small parties, otherwise back to "pending").
--
-- Run ONCE on the existing database: Supabase → SQL Editor → paste → Run.
-- Safe to run again. (A new database only needs supabase/schema.sql.)
-- =====================================================================

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

  insert into public.bookings (date, time, people, name, phone, email, notes, status, source)
  values (v_date, v_time, v_people, p->>'name', p->>'phone', coalesce(p->>'email',''),
          coalesce(p->>'notes',''), coalesce(p->>'status','pending'), coalesce(p->>'source','web'))
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
begin
  perform pg_advisory_xact_lock(hashtext(v_date::text || case when v_lunch then ' lunch' else ' dinner' end));

  select coalesce(sum(people), 0) into v_taken
    from public.bookings
   where date = v_date and (time < '17:00') = v_lunch and status in ('pending','confirmed') and id <> p_id;
  if v_taken + v_people > max_covers then
    raise exception 'SLOT_FULL';
  end if;

  update public.bookings
     set date = v_date, time = v_time, people = v_people,
         notes = coalesce(p->>'notes', ''),
         status = case when p->>'status' in ('pending','confirmed') then p->>'status' else 'pending' end
   where id = p_id
  returning * into v_row;

  if v_row.id is null then
    raise exception 'NOT_FOUND';
  end if;
  return v_row;
end $$;

revoke all on function public.change_booking(uuid, jsonb, int) from public, anon, authenticated;
grant execute on function public.change_booking(uuid, jsonb, int) to service_role;
