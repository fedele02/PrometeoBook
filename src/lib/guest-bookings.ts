/**
 * The guest's own bookings, remembered on their phone (localStorage) so that
 * /prenota can bring them back to their private page. Purely a convenience:
 * the private link in the WhatsApp confirmation works anywhere.
 */

export type RememberedBooking = { token: string; date: string; time: string; people: number };

const KEY = "prometeo:bookings";

/** Raw stored value: a stable string React can compare between renders. */
export function storedBookings(): string {
  try {
    return localStorage.getItem(KEY) ?? "[]";
  } catch {
    return "[]";
  }
}

function read(raw = storedBookings()): RememberedBooking[] {
  try {
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list.filter((b) => b && typeof b.token === "string") : [];
  } catch {
    return [];
  }
}

function write(list: RememberedBooking[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list.slice(-10)));
  } catch {}
}

export function rememberBooking(b: RememberedBooking) {
  write([...read().filter((x) => x.token !== b.token), b]);
}

/** Upcoming bookings only, soonest first. */
export function rememberedBookings(today: string, raw?: string) {
  return read(raw)
    .filter((b) => b.date >= today)
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
}

export function forgetBooking(token: string) {
  write(read().filter((b) => b.token !== token));
}
