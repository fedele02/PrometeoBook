/**
 * Loads the initial menu and settings into Supabase.
 *   npm run seed:supabase            → only if the database is empty
 *   npm run seed:supabase -- --force → overwrite settings, upsert menu
 * Reads the keys from .env.local.
 */
import { createClient } from "@supabase/supabase-js";
import { seedCategories, seedDishes, seedSettings } from "../src/lib/seed.ts";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Mancano NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SECRET_KEY in .env.local");
  process.exit(1);
}
const db = createClient(url, key, { auth: { persistSession: false } });
const force = process.argv.includes("--force");

const { count, error } = await db.from("categories").select("id", { count: "exact", head: true });
if (error) {
  console.error("Errore:", error.message, "\nHai eseguito supabase/schema.sql nel SQL Editor?");
  process.exit(1);
}
if (count && !force) {
  console.log(`Il database contiene già ${count} categorie: niente da fare (usa --force per sovrascrivere).`);
  process.exit(0);
}

const steps = [
  ["impostazioni", db.from("settings").upsert({ id: 1, data: seedSettings })],
  ["categorie", db.from("categories").upsert(seedCategories)],
] as const;
for (const [label, q] of steps) {
  const r = await q;
  if (r.error) throw new Error(`${label}: ${r.error.message}`);
  console.log(`✓ ${label}`);
}
const r = await db.from("dishes").upsert(seedDishes);
if (r.error) throw new Error(`piatti: ${r.error.message}`);
console.log(`✓ ${seedDishes.length} piatti`);
console.log("Fatto. Ora crea l'utente admin (vedi README).");
