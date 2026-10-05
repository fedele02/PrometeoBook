export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
/** New "publishable" key (sb_publishable_…) or the legacy anon key. */
export const SUPABASE_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
/** New "secret" key (sb_secret_…) or the legacy service_role key. Server only. */
export const SUPABASE_SECRET = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export const isSupabaseEnabled = () => Boolean(SUPABASE_URL && SUPABASE_PUBLIC_KEY && SUPABASE_SECRET);
