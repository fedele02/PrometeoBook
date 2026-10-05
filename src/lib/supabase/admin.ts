import "server-only";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_SECRET, SUPABASE_URL } from "./env";

export const createAdminClient = () =>
  createClient(SUPABASE_URL, SUPABASE_SECRET, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
