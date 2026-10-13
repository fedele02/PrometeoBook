import { repo } from "@/lib/data";
import { isSupabaseEnabled } from "@/lib/supabase/env";

/**
 * Vercel Cron (vercel.json), once a day: one small read on the database so a
 * free Supabase project never counts as inactive and gets paused.
 * With CRON_SECRET set on Vercel, Vercel sends it as a Bearer token and any other
 * caller is refused.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!isSupabaseEnabled()) return Response.json({ ok: false, error: "Supabase not configured" }, { status: 503 });

  try {
    await repo().getSettings();
    return Response.json({ ok: true, at: new Date().toISOString() });
  } catch (e) {
    console.error("keepalive failed", e);
    return Response.json({ ok: false, error: e instanceof Error ? e.message : "error" }, { status: 500 });
  }
}
