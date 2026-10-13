import type { Settings } from "./types";

/** Everything is computed in the restaurant's timezone, never the visitor's. */
export const TZ = "Europe/Rome";

export const WEEKDAYS = ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"];
/** Monday-first order, as Italians read a week. */
export const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];

export const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};
export const fromMin = (min: number) =>
  `${String(Math.floor(min / 60) % 24).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;

/** Current date ("YYYY-MM-DD") and minutes since midnight in Rome. */
export function romeNow(at: Date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(at);
  const get = (t: string) => parts.find((p) => p.type === t)!.value;
  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    minutes: Number(get("hour")) * 60 + Number(get("minute")),
  };
}

// Date-only strings are handled as UTC noon so no timezone can shift the day.
const asDate = (d: string) => new Date(`${d}T12:00:00Z`);
export const weekdayOf = (d: string) => asDate(d).getUTCDay();
export function addDays(d: string, n: number) {
  const x = asDate(d);
  x.setUTCDate(x.getUTCDate() + n);
  return x.toISOString().slice(0, 10);
}
export const isValidDate = (d: string) => /^\d{4}-\d{2}-\d{2}$/.test(d) && !Number.isNaN(asDate(d).getTime());

const fmt = (opts: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("it-IT", { timeZone: "UTC", ...opts });
const fLong = fmt({ weekday: "long", day: "numeric", month: "long" });
const fShortWd = fmt({ weekday: "short" });
const fMonth = fmt({ month: "short" });
const fMonthYear = fmt({ month: "long", year: "numeric" });

/** "sabato 11 ottobre" */
export const formatDateLong = (d: string) => fLong.format(asDate(d));
/** { wd: "sab", day: 11, month: "ott" } */
export const dateParts = (d: string) => ({
  wd: fShortWd.format(asDate(d)).replace(".", ""),
  day: asDate(d).getUTCDate(),
  month: fMonth.format(asDate(d)).replace(".", ""),
});
export const formatMonthYear = (d: string) => fMonthYear.format(asDate(d));

export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Human label relative to today: "Oggi", "Domani" or "sabato 11 ottobre". */
export function relativeDay(d: string, today = romeNow().date) {
  if (d === today) return "Oggi";
  if (d === addDays(today, 1)) return "Domani";
  return formatDateLong(d);
}

/** Lunch before 17:00, dinner from 17:00. The same split is in the SQL functions (supabase/schema.sql). */
export const serviceLabel = (open: string) => (toMin(open) < 17 * 60 ? "Pranzo" : "Cena");

export type DayState = { closed: true; reason: string } | { closed: false };

export function dayState(s: Settings, date: string): DayState {
  const closure = s.closures.find((c) => c.date === date);
  if (closure) return { closed: true, reason: closure.note || "Chiusura straordinaria" };
  const day = s.hours[weekdayOf(date)];
  if (!day || day.closed || day.services.length === 0) return { closed: true, reason: "Giorno di chiusura" };
  return { closed: false };
}

export type ServiceSlots = { label: string; open: string; close: string; times: string[] };

/** All bookable times for a date (ignores capacity). */
export function slotsForDate(s: Settings, date: string, now = romeNow()): ServiceSlots[] {
  if (dayState(s, date).closed) return [];
  const { slotMinutes, lastBookingBeforeClose, minNoticeMinutes } = s.booking;
  const step = Math.max(5, slotMinutes);
  const earliest = date === now.date ? now.minutes + minNoticeMinutes : -1;
  if (date < now.date) return [];

  return s.hours[weekdayOf(date)].services
    .map((svc) => {
      const open = toMin(svc.open);
      let close = toMin(svc.close);
      if (close <= open) close += 24 * 60; // closes after midnight
      const last = Math.min(close - lastBookingBeforeClose, 23 * 60 + 59);
      const times: string[] = [];
      for (let t = open; t <= last; t += step) if (t >= earliest) times.push(fromMin(t));
      return { label: serviceLabel(svc.open), open: svc.open, close: svc.close, times };
    })
    .filter((x) => x.times.length > 0);
}

export function isBookableDate(s: Settings, date: string, now = romeNow()) {
  return date >= now.date && date <= addDays(now.date, s.booking.daysAhead) && !dayState(s, date).closed;
}

/** "Aperto ora · fino alle 15:00" / "Chiuso · riapre oggi alle 19:30" */
export function openStatus(s: Settings, now = romeNow()): { open: boolean; label: string } {
  const today = dayState(s, now.date);
  if (!today.closed) {
    for (const svc of s.hours[weekdayOf(now.date)].services) {
      const o = toMin(svc.open);
      let c = toMin(svc.close);
      if (c <= o) c += 24 * 60;
      if (now.minutes >= o && now.minutes < c) return { open: true, label: `Aperto ora · fino alle ${svc.close}` };
      if (now.minutes < o) return { open: false, label: `Apre oggi alle ${svc.open}` };
    }
  }
  for (let i = 1; i <= 14; i++) {
    const d = addDays(now.date, i);
    if (dayState(s, d).closed) continue;
    const first = s.hours[weekdayOf(d)].services[0];
    const when = i === 1 ? "domani" : WEEKDAYS[weekdayOf(d)].toLowerCase();
    return { open: false, label: `Chiuso · riapre ${when} alle ${first.open}` };
  }
  return { open: false, label: "Chiuso" };
}

/** Group consecutive weekdays with identical hours: "Mar – Dom". */
export function hoursSummary(s: Settings) {
  const key = (i: number) => {
    const d = s.hours[i];
    return d.closed || !d.services.length ? "closed" : d.services.map((x) => `${x.open}-${x.close}`).join("|");
  };
  const groups: { days: number[]; key: string }[] = [];
  for (const i of WEEK_ORDER) {
    const last = groups[groups.length - 1];
    if (last && last.key === key(i)) last.days.push(i);
    else groups.push({ days: [i], key: key(i) });
  }
  const short = (i: number) => WEEKDAYS[i].slice(0, 3);
  return groups.map((g) => ({
    label: g.days.length > 1 ? `${short(g.days[0])} – ${short(g.days[g.days.length - 1])}` : WEEKDAYS[g.days[0]],
    closed: g.key === "closed",
    services: s.hours[g.days[0]].services,
  }));
}
