import { agoLabel } from "@/lib/board";
import { guestHistory, isActive } from "@/lib/customers";
import { repo } from "@/lib/data";
import { addDays, romeNow } from "@/lib/time";
import { isWhatsappAuto } from "@/lib/whatsapp";
import { RequestsList, type RequestDay } from "@/components/admin/RequestsList";

export const metadata = { title: "Richieste" };

/** Every request waiting for an answer, from today on, grouped by day. */
export default async function RequestsPage() {
  const today = romeNow().date;
  const r = repo();
  const [settings, all] = await Promise.all([r.getSettings(), r.listBookings(addDays(today, -730), addDays(today, 400))]);

  const days = new Map<string, RequestDay>();
  for (const b of all) {
    if (b.date < today || b.status !== "pending") continue;
    const day = days.get(b.date) ?? days.set(b.date, { date: b.date, covers: 0, requests: [] }).get(b.date)!;
    day.requests.push({ ...b, history: guestHistory(all, b, today), ago: agoLabel(b.created_at) });
  }
  for (const day of days.values()) {
    day.covers = all.filter((b) => b.date === day.date && isActive(b)).reduce((n, b) => n + b.people, 0);
    day.requests.sort((a, b) => a.time.localeCompare(b.time) || a.created_at.localeCompare(b.created_at));
  }
  const list = [...days.values()].sort((a, b) => a.date.localeCompare(b.date));
  const oldest = list.flatMap((d) => d.requests).sort((a, b) => a.created_at.localeCompare(b.created_at))[0];

  return <RequestsList days={list} today={today} settings={settings} waAuto={isWhatsappAuto(settings)} oldest={oldest ? agoLabel(oldest.created_at) : null} />;
}
