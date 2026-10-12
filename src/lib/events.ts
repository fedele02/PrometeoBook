import "server-only";
import { cookies } from "next/headers";
import { repo } from "./data";
import { notifyNewBooking } from "./notify";
import { ADMIN_PATH } from "./pwa";
import { DEVICE_COOKIE, pushToDevices, type PushPayload } from "./push";
import { addDays, dateParts, romeNow, serviceLabel } from "./time";
import type { Booking, BookingChange, NotifyPrefs } from "./types";

/**
 * Everything that happens to a booking and is worth telling the staff.
 * Texts follow the approved notification mockups (Penpot, "Notifiche"):
 * a title with who, a body with guests/day/time, no buttons: a tap opens the app.
 */
export type BookingEvent =
  | { type: "requested"; booking: Booking }
  | { type: "changed"; booking: Booking; before: BookingChange }
  | { type: "cancelledByGuest"; booking: Booking }
  | { type: "accepted" | "declined" | "cancelledByStaff" | "phoneBooking"; booking: Booking };

const shortDate = (d: string) => {
  const p = dateParts(d);
  return `${p.wd} ${p.day} ${p.month}`;
};
const guests = (n: number) => `${n} ${n === 1 ? "persona" : "persone"}`;
const clip = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

function describe(e: BookingEvent): { group: keyof NotifyPrefs; title: string; body: string } {
  const b = e.booking;
  const when = `${shortDate(b.date)}, ore ${b.time}`;
  switch (e.type) {
    case "requested":
      return {
        group: "requests",
        title: `Nuova richiesta · ${b.name}`,
        body: `${guests(b.people)} · ${when} (${serviceLabel(b.time).toLowerCase()})${b.notes ? `\n«${clip(b.notes, 70)}»` : ""}`,
      };
    case "changed": {
      const was = e.before;
      const diff = [
        was.date !== b.date && `${shortDate(was.date)} → ${shortDate(b.date)}`,
        was.time !== b.time && `ore ${was.time} → ${b.time}`,
        was.people !== b.people && `${was.people} → ${guests(b.people)}`,
        was.notes !== b.notes && "note aggiornate",
      ].filter(Boolean);
      return { group: "changes", title: `Modificata · ${b.name}`, body: `${diff.join(" · ") || when}\nDa riconfermare` };
    }
    case "cancelledByGuest":
      return {
        group: "cancellations",
        title: `Annullata · ${b.name}`,
        body: `Il cliente ha annullato: ${b.people} ${b.people === 1 ? "posto liberato" : "posti liberati"}\n${when}`,
      };
    case "accepted":
      return { group: "staff", title: `Accettata · ${b.name}`, body: `Confermata da un collega · ${guests(b.people)}, ${when}` };
    case "declined":
      return { group: "staff", title: `Rifiutata · ${b.name}`, body: `Rifiutata da un collega · ${guests(b.people)}, ${when}` };
    case "cancelledByStaff":
      return { group: "staff", title: `Annullata · ${b.name}`, body: `Annullata da un collega · ${guests(b.people)}, ${when}` };
    case "phoneBooking":
      return { group: "staff", title: `Telefonica · ${b.name}`, body: `Aggiunta da un collega · ${guests(b.people)}, ${when}` };
  }
}

/** Requests still waiting for an answer, from today on: the number on the app icon. */
export async function pendingCount() {
  const today = romeNow().date;
  return (await repo().listBookings(today, addDays(today, 400))).filter((b) => b.status === "pending").length;
}

/** The device the current staff member is using, so they don't get their own actions back. */
async function currentDevice() {
  try {
    return (await cookies()).get(DEVICE_COOKIE)?.value;
  } catch {
    return undefined; // not in a request (never the case today)
  }
}

/** Tell the staff. Never throws. */
export async function announce(e: BookingEvent) {
  try {
    const d = describe(e);
    const payload: PushPayload = {
      title: d.title,
      body: d.body,
      url: `${ADMIN_PATH}?date=${e.booking.date}#b-${e.booking.id}`,
      tag: `b-${e.booking.id}`,
      badge: await pendingCount(),
    };
    const staffAction = d.group === "staff";
    await Promise.all([
      pushToDevices(payload, { group: d.group, exceptDevice: staffAction ? await currentDevice() : undefined }),
      e.type === "requested" ? notifyNewBooking(e.booking) : null,
    ]);
  } catch (err) {
    console.error("announce failed", err);
  }
}
