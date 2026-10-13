-- =====================================================================
-- Short link for the guest's page: /p/K7M2QX9T instead of
-- /prenotazione/<uuid>. 8 characters from 32 easy-to-read ones (no 0/O, 1/I):
-- about 1.1 million million combinations. Old links keep working.
--
-- Run ONCE on the existing database: Supabase → SQL Editor → paste → Run.
-- Safe to run again. (A new database only needs supabase/schema.sql.)
-- =====================================================================

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

alter table public.bookings add column if not exists short_code text;
update public.bookings set short_code = public.gen_short_code() where short_code is null;
alter table public.bookings alter column short_code set default public.gen_short_code();
alter table public.bookings alter column short_code set not null;
create unique index if not exists bookings_short_code_key on public.bookings (short_code);
