-- =====================================================================
-- Any party can book online, up to the seats of a whole service (Gestione →
-- Locale e orari → Coperti massimi per servizio): the old cap of 60 guests per
-- booking goes up to 1000, the same bound as the settings.
--
-- Run ONCE on the existing database: Supabase → SQL Editor → paste → Run.
-- Safe to run again. (A new database only needs supabase/schema.sql.)
-- =====================================================================

-- drop the old check on people, whatever its name
do $$
declare c record;
begin
  for c in
    select conname from pg_constraint
     where conrelid = 'public.bookings'::regclass and contype = 'c'
       and pg_get_constraintdef(oid) ilike '%people%'
  loop
    execute format('alter table public.bookings drop constraint %I', c.conname);
  end loop;
end $$;

alter table public.bookings
  add constraint bookings_people_check check (people between 1 and 1000);
