-- Menu translations (Gestione → Menu → Traduzioni): { "en": { name, description, price_note, src } }
-- per category and dish. Safe to run more than once.
alter table public.categories add column if not exists tr jsonb not null default '{}'::jsonb;
alter table public.dishes     add column if not exists tr jsonb not null default '{}'::jsonb;
