import { logError } from "@/lib/errors";
import { sendDueBirthdays } from "@/lib/whatsapp";

/**
 * Vercel Cron (vercel.json), once a day at 09:00 UTC (10:00/11:00 in Rome):
 * WhatsApp birthday wishes to the guests who agreed (Gestione → Promozioni),
 * and deletion of the consents older than 24 months.
 * With CRON_SECRET set on Vercel, Vercel sends it as a Bearer token and any other
 * caller is refused.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    return Response.json({ ok: true, ...(await sendDueBirthdays()) });
  } catch (e) {
    await logError("Cron compleanni non riuscito", e);
    return Response.json({ ok: false, error: e instanceof Error ? e.message : "error" }, { status: 500 });
  }
}
