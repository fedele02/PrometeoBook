import type { Booking, BookingStatus, Settings } from "./types";
import { formatDateLong, romeNow, serviceLabel, toMin } from "./time";

/** Bookings that hold seats: waiting for an answer or confirmed. */
export const isActive = (b: { status: BookingStatus }) => b.status === "pending" || b.status === "confirmed";

/** Guests can change or cancel until the same notice the site asks for new bookings. */
export function guestCanManage(b: Booking, s: Settings, now = romeNow()) {
  if (!isActive(b)) return false;
  const days = (Date.parse(`${b.date}T00:00:00Z`) - Date.parse(`${now.date}T00:00:00Z`)) / 864e5;
  const minutesLeft = days * 1440 + toMin(b.time) - now.minutes;
  return minutesLeft >= Math.max(s.booking.minNoticeMinutes, 0);
}

/**
 * One key per phone number however it was typed:
 * "+39 333 123 4567", "0039333…" and "333-1234567" are the same guest.
 */
export function phoneKey(phone: string) {
  let d = phone.replace(/\D/g, "");
  if (d.startsWith("00")) d = d.slice(2);
  if (d.startsWith("39") && d.length >= 11) d = d.slice(2);
  return d;
}

/** Active booking of this guest for the same service (Pranzo / Cena) of a day, if any. */
export function sameServiceBooking(bookings: Booking[], phone: string, date: string, time: string, ignoreId?: string) {
  const key = phoneKey(phone);
  const service = serviceLabel(time);
  return bookings.find(
    (b) => b.id !== ignoreId && b.date === date && isActive(b) && phoneKey(b.phone) === key && serviceLabel(b.time) === service,
  );
}

/**
 * Past visits of the same phone number: confirmed bookings on days before today.
 */
export function pastVisits(all: Booking[], b: Booking, today: string) {
  const key = phoneKey(b.phone);
  return all
    .filter((x) => x.id !== b.id && x.status === "confirmed" && x.date < today && phoneKey(x.phone) === key)
    .sort((x, y) => y.date.localeCompare(x.date));
}

/** What the staff sees next to a request: "3 visite precedenti · ultima il 12 settembre". */
export function guestHistory(all: Booking[], b: Booking, today: string): string {
  const key = phoneKey(b.phone);
  const others = all.filter((x) => x.id !== b.id && phoneKey(x.phone) === key);
  const visits = pastVisits(all, b, today);
  if (visits.length)
    return `${visits.length} ${visits.length === 1 ? "visita precedente" : "visite precedenti"} · ultima il ${formatDateLong(visits[0].date).replace(/^\S+ /, "")}`;
  const upcoming = others.filter((x) => isActive(x) && x.date >= today).length;
  if (upcoming) return `Prima visita · ha altre ${upcoming} ${upcoming === 1 ? "prenotazione" : "prenotazioni"}`;
  return "Prima prenotazione";
}

export type Customer = {
  key: string;
  /** name and phone as written in the most recent booking */
  name: string;
  phone: string;
  bookings: Booking[];
  total: number;
  /** cancelled or refused */
  lost: number;
  fromWeb: number;
  /** guests across active bookings */
  covers: number;
  first: string;
  last: string;
  /** next upcoming active booking date */
  next: string | null;
};

/** Groups bookings by phone number, most recent activity first. */
export function groupCustomers(bookings: Booking[], today: string): Customer[] {
  const map = new Map<string, Booking[]>();
  for (const b of bookings) {
    const k = phoneKey(b.phone);
    if (!k) continue;
    const list = map.get(k);
    if (list) list.push(b);
    else map.set(k, [b]);
  }
  return [...map.entries()]
    .map(([key, list]) => {
      // newest first
      list.sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
      const active = list.filter(isActive);
      const upcoming = active.filter((b) => b.date >= today);
      return {
        key,
        name: list[0].name,
        phone: list[0].phone,
        bookings: list,
        total: list.length,
        lost: list.length - active.length,
        fromWeb: list.filter((b) => b.source === "web").length,
        covers: active.reduce((n, b) => n + b.people, 0),
        first: list[list.length - 1].date,
        last: list[0].date,
        next: upcoming.length ? upcoming[upcoming.length - 1].date : null,
      };
    })
    .sort((a, b) => b.last.localeCompare(a.last) || b.total - a.total);
}
