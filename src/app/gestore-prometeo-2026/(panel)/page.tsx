import { agoLabel, dayServices, dayStatusLine, defaultService } from "@/lib/board";
import { guestHistory, isActive, pastVisits } from "@/lib/customers";
import { repo } from "@/lib/data";
import { addDays, isValidDate, romeNow } from "@/lib/time";
import { BookingsBoard, type DayChip, type Row } from "@/components/admin/BookingsBoard";

export const metadata = { title: "Prenotazioni" };

export default async function BookingsPage({ searchParams }: PageProps<"/gestore-prometeo-2026">) {
  const sp = await searchParams;
  const now = romeNow();
  const today = now.date;
  const date = typeof sp.date === "string" && isValidDate(sp.date) ? sp.date : today;

  // two years back (returning guests) and the whole bookable future (day strip)
  const from = addDays(today, -730);
  const to = addDays(today, 400);
  const r = repo();
  const [settings, all] = await Promise.all([r.getSettings(), r.listBookings(date < from ? date : from, date > to ? date : to)]);

  // days with at least one booking, plus today and the selected day
  const byDay = new Map<string, DayChip>();
  const chip = (d: string) => byDay.get(d) ?? byDay.set(d, { date: d, covers: 0, pending: 0 }).get(d)!;
  chip(today);
  chip(date);
  for (const b of all) {
    if (b.date < today || !isActive(b)) continue;
    const c = chip(b.date);
    c.covers += b.people;
    if (b.status === "pending") c.pending++;
  }
  const days = [...byDay.values()].sort((a, b) => a.date.localeCompare(b.date));

  const ofDay = all.filter((b) => b.date === date);
  const rows: Row[] = ofDay.map((b) => ({
    ...b,
    history: guestHistory(all, b, today),
    visits: pastVisits(all, b, today).length,
    ago: agoLabel(b.created_at),
  }));
  const services = dayServices(settings, date, ofDay);

  return (
    <BookingsBoard
      key={date}
      settings={settings}
      today={today}
      date={date}
      days={days}
      rows={rows}
      services={services}
      initialService={defaultService(services, ofDay, date, now)}
      statusLine={dayStatusLine(settings, date, now)}
    />
  );
}
