import { repo } from "@/lib/data";
import { isSupabaseEnabled } from "@/lib/supabase/env";
import { logError } from "@/lib/errors";

const LOG_DAYS = 30;

/**
 * Vercel Cron (vercel.json), once a day: one small read on the database so a
 * free Supabase project never counts as inactive and gets paused. It also
 * trims the error log (Gestione → Log errori) to the last 30 days.
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
    const r = repo();
    await r.getSettings();
    // the error log keeps the last 30 days
    await r.clearErrorLogs(new Date(Date.now() - LOG_DAYS * 864e5).toISOString()).catch((e) => logError("Pulizia del log errori non riuscita", e));
    return Response.json({ ok: true, at: new Date().toISOString() });
  } catch (e) {
    await logError("Cron keepalive: Supabase non risponde", e);
    return Response.json({ ok: false, error: e instanceof Error ? e.message : "error" }, { status: 500 });
  }
}
