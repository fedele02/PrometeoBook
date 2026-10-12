import { isActive } from "./customers";
import { dayState, fromMin, serviceLabel, slotsForDate, toMin, weekdayOf } from "./time";
import type { Booking, Settings } from "./types";

export type ServiceName = "Pranzo" | "Cena";

export type DayService = {
  label: ServiceName;
  open: string;
  close: string;
  /** bookable times, plus any other time someone booked at (e.g. by phone) */
  times: string[];
  /** not in the opening hours: rebuilt from the bookings */
  synthetic?: boolean;
};

/** Lunch and dinner of a day as the staff sees them, independent of the current time. */
export function dayServices(s: Settings, date: string, bookings: Booking[]): DayService[] {
  // a "now" far in the past keeps every time of the day, even the ones already gone
  const opened = slotsForDate(s, date, { date: "0000-01-01", minutes: 0 });
  const out = new Map<ServiceName, DayService>();
  for (const svc of opened) out.set(svc.label as ServiceName, { label: svc.label as ServiceName, open: svc.open, close: svc.close, times: [...svc.times] });

  for (const b of bookings) {
    if (!isActive(b)) continue;
    const label = serviceLabel(b.time) as ServiceName;
    let svc = out.get(label);
    if (!svc) {
      // service not in the opening hours (e.g. a phone booking on a closed day):
      // it runs from the first booking to two hours after the last one
      svc = { label, open: b.time, close: fromMin(toMin(b.time) + 120), times: [], synthetic: true };
      out.set(label, svc);
    }
    if (!svc.times.includes(b.time)) svc.times.push(b.time);
    if (svc.synthetic) {
      if (toMin(b.time) < toMin(svc.open)) svc.open = b.time;
      if (toMin(b.time) + 120 > toMin(svc.close)) svc.close = fromMin(Math.min(toMin(b.time) + 120, 23 * 60 + 59));
    }
  }
  for (const svc of out.values()) svc.times.sort((a, b) => toMin(a) - toMin(b));
  return [...out.values()].sort((a, b) => (a.label === "Pranzo" ? -1 : b.label === "Pranzo" ? 1 : 0));
}

/** Which service to show first: the one running or coming next today, otherwise the busiest. */
export function defaultService(services: DayService[], bookings: Booking[], date: string, now: { date: string; minutes: number }): ServiceName {
  if (!services.length) return "Cena";
  if (date === now.date) {
    const upcoming = services.find((svc) => {
      let close = toMin(svc.close);
      if (close <= toMin(svc.open)) close += 24 * 60;
      return now.minutes < close;
    });
    return (upcoming ?? services[services.length - 1]).label;
  }
  const count = (l: ServiceName) => bookings.filter((b) => isActive(b) && serviceLabel(b.time) === l).length;
  return [...services].sort((a, b) => count(b.label) - count(a.label))[0].label;
}

/** "adesso", "5 min fa", "2 ore fa", "ieri", "3 giorni fa". */
export function agoLabel(iso: string, nowMs = Date.now()) {
  const min = Math.max(0, Math.round((nowMs - Date.parse(iso)) / 6e4));
  if (min < 1) return "adesso";
  if (min < 60) return `${min} min fa`;
  const h = Math.round(min / 60);
  if (h < 24) return h === 1 ? "1 ora fa" : `${h} ore fa`;
  const d = Math.round(h / 24);
  return d === 1 ? "ieri" : `${d} giorni fa`;
}

/** Day header line: "Oggi · cena in corso", "Chiuso · Giorno di chiusura"… */
export function dayStatusLine(s: Settings, date: string, now: { date: string; minutes: number }) {
  const state = dayState(s, date);
  if (state.closed) return `Chiuso · ${state.reason}`;
  if (date !== now.date) return null;
  for (const svc of s.hours[weekdayOf(date)].services) {
    const open = toMin(svc.open);
    let close = toMin(svc.close);
    if (close <= open) close += 24 * 60;
    const label = serviceLabel(svc.open).toLowerCase();
    if (now.minutes >= open && now.minutes < close) return `Oggi · ${label} in corso`;
    if (now.minutes < open) return `Oggi · ${label} alle ${svc.open}`;
  }
  return "Oggi · servizio concluso";
}
