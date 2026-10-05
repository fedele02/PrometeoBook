import { repo } from "@/lib/data";
import { addDays, isValidDate, romeNow } from "@/lib/time";
import { BookingsBoard, type DaySummary } from "@/components/admin/BookingsBoard";

export const metadata = { title: "Prenotazioni" };

export default async function BookingsPage({ searchParams }: PageProps<"/admin">) {
  const sp = await searchParams;
  const today = romeNow().date;
  const date = typeof sp.date === "string" && isValidDate(sp.date) ? sp.date : today;

  const r = repo();
  const stripEnd = addDays(today, 13);
  const [settings, all] = await Promise.all([
    r.getSettings(),
    r.listBookings(date < today ? date : today, date > stripEnd ? date : stripEnd),
  ]);

  const strip: DaySummary[] = Array.from({ length: 14 }, (_, i) => {
    const d = addDays(today, i);
    const list = all.filter((b) => b.date === d && b.status !== "cancelled");
    return { date: d, covers: list.reduce((n, b) => n + b.people, 0), pending: list.filter((b) => b.status === "pending").length };
  });

  return (
    <BookingsBoard
      key={date}
      settings={settings}
      today={today}
      date={date}
      bookings={all.filter((b) => b.date === date)}
      strip={strip}
    />
  );
}
