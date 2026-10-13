"use server";

import { after } from "next/server";
import { z } from "zod";
import { coversByService, guestCanManage, onlineStatus, sameServiceBooking } from "@/lib/customers";
import { repo } from "@/lib/data";
import { SlotFullError } from "@/lib/data/repo";
import { announce } from "@/lib/events";
import { sendWhatsappOrAlert } from "@/lib/whatsapp";
import { dayState, formatDateLong, isBookableDate, isValidDate, serviceLabel, slotsForDate } from "@/lib/time";
import type { OnlineStatus, Settings } from "@/lib/types";
import { logError } from "@/lib/errors";

export type Slot = { time: string; free: boolean };
export type Availability =
  | { closed: true; reason: string }
  /** `full`: the service (lunch or dinner) has no room left for this many guests */
  | { closed: false; services: { label: string; full: boolean; slots: Slot[] }[] };

/**
 * Free times for a date. When a guest is changing their booking, pass its token:
 * the seats it already holds count as free for them.
 */
export async function getAvailability(date: string, people: number, token?: string): Promise<Availability> {
  if (!isValidDate(date)) return { closed: true, reason: "Data non valida" };
  const r = repo();
  const s = await r.getSettings();
  if (!s.booking.enabled) return { closed: true, reason: "Le prenotazioni online sono sospese" };
  const state = dayState(s, date);
  if (state.closed) return { closed: true, reason: state.reason };
  if (!isBookableDate(s, date)) return { closed: true, reason: "Data non prenotabile" };

  const services = slotsForDate(s, date);
  if (!services.length) return { closed: true, reason: "Per oggi non ci sono più orari disponibili" };

  const own = token ? await r.getBookingByToken(token) : null;
  // seats are counted per service: lunch and dinner of the day, whatever the time
  const taken = coversByService(await r.coversByTime(date, own?.id));
  const max = s.booking.maxCoversPerService;
  return {
    closed: false,
    services: services.map((svc) => {
      const full = (taken[svc.label] ?? 0) + people > max;
      return { label: svc.label, full, slots: svc.times.map((time) => ({ time, free: !full })) };
    }),
  };
}

const phone = z
  .string()
  .transform((v) => v.replace(/[\s().-]/g, ""))
  .refine((v) => /^\+?\d{6,15}$/.test(v), "Controlla il numero di telefono");

const bookingSchema = z.object({
  date: z.string().refine(isValidDate),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  people: z.number().int().min(1).max(60),
  name: z.string().trim().min(2, "Scrivi il tuo nome").max(80),
  phone,
  notes: z.string().trim().max(500).default(""),
  privacy: z.literal(true, { error: "Serve il consenso per gestire la prenotazione" }),
  // honeypot: real people never see nor fill this field
  website: z.string().max(0).optional(),
});

export type BookingInput = z.input<typeof bookingSchema>;
export type BookingResult =
  /** status: confirmed at once (small party) or a request for the staff */
  | { ok: true; token: string; status: OnlineStatus }
  | { ok: false; error: string; field?: string; slotFull?: boolean };

/** Rules shared by a new booking and a guest's change. Returns an error or null. */
async function checkSlot(
  s: Settings,
  b: { date: string; time: string; people: number; phone: string },
  ignoreId?: string,
): Promise<{ error: string; field?: string; slotFull?: boolean } | null> {
  if (!s.booking.enabled) return { error: "Le prenotazioni online sono momentaneamente sospese." };
  if (b.people > s.booking.maxPartySize)
    return { error: `Per gruppi oltre ${s.booking.maxPartySize} persone chiamaci: troveremo la soluzione migliore.`, field: "people" };
  if (!isBookableDate(s, b.date)) return { error: "Questa data non è prenotabile.", field: "date" };
  if (!slotsForDate(s, b.date).some((svc) => svc.times.includes(b.time)))
    return { error: "Questo orario non è più disponibile.", field: "time", slotFull: true };

  // one active booking per phone number for each service (lunch / dinner) of a day
  const existing = sameServiceBooking(await repo().listBookings(b.date, b.date), b.phone, b.date, b.time, ignoreId);
  if (existing)
    return {
      error: `Hai già una prenotazione per ${serviceLabel(b.time) === "Pranzo" ? "il pranzo" : "la cena"} di ${formatDateLong(b.date)} alle ${existing.time}. Puoi modificarla dal link “Modifica o annulla” oppure chiamarci.`,
    };
  return null;
}

const fullMessage = (time: string) =>
  `Siamo spiacenti, siamo al completo per ${serviceLabel(time) === "Pranzo" ? "il pranzo" : "la cena"} di quel giorno. Prova un altro giorno o chiamaci.`;

export async function submitBooking(input: BookingInput): Promise<BookingResult> {
  const parsed = bookingSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const field = String(issue.path[0] ?? "");
    if (field === "website") return { ok: true, token: "", status: "pending" }; // silently drop bots
    return { ok: false, error: issue.message, field };
  }
  const b = parsed.data;
  const r = repo();
  const s = await r.getSettings();

  const invalid = await checkSlot(s, b);
  if (invalid) return { ok: false, ...invalid };

  // simple abuse guard: max 4 online bookings per phone number per day
  const since = new Date(Date.now() - 864e5).toISOString();
  if ((await r.countBookingsByPhone(b.phone, since)) >= 4)
    return { ok: false, error: "Hai già effettuato diverse prenotazioni oggi. Per modifiche chiamaci." };

  // small parties are confirmed at once, larger ones wait for the staff;
  // a service with no room left refuses the booking ("siamo al completo")
  const status = onlineStatus(s, b.people);
  try {
    const booking = await r.createBooking(
      { date: b.date, time: b.time, people: b.people, name: b.name, phone: b.phone, email: "", notes: b.notes, status, source: "web" },
      s.booking.maxCoversPerService,
    );
    after(() =>
      Promise.all([
        announce({ type: status === "confirmed" ? "autoConfirmed" : "requested", booking }),
        sendWhatsappOrAlert(status === "confirmed" ? "confirmed" : "requested", booking, s),
      ]),
    );
    return { ok: true, token: booking.manage_token, status };
  } catch (e) {
    if (e instanceof SlotFullError) return { ok: false, error: fullMessage(b.time), field: "time", slotFull: true };
    await logError("Prenotazione dal sito non salvata", e, { date: b.date, time: b.time, people: b.people });
    return { ok: false, error: "Si è verificato un problema. Riprova o chiamaci." };
  }
}

// ---------- the guest's private page (/prenotazione/<token>) ----------

const changeSchema = z.object({
  date: z.string().refine(isValidDate),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  people: z.number().int().min(1).max(60),
  notes: z.string().trim().max(500).default(""),
});

export type GuestResult = { ok: true; status?: OnlineStatus } | { ok: false; error: string; field?: string; slotFull?: boolean };

const TOO_LATE = "Mancano poche ore: per modifiche o per annullare chiamaci.";

export async function changeMyBooking(token: string, input: z.input<typeof changeSchema>): Promise<GuestResult> {
  const parsed = changeSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const change = parsed.data;
  const r = repo();
  const [s, b] = await Promise.all([r.getSettings(), r.getBookingByToken(token)]);
  if (!b) return { ok: false, error: "Prenotazione non trovata." };
  if (!guestCanManage(b, s)) return { ok: false, error: TOO_LATE };

  const before = { date: b.date, time: b.time, people: b.people, notes: b.notes };
  if (before.date === change.date && before.time === change.time && before.people === change.people && before.notes === change.notes)
    return { ok: true };

  const invalid = await checkSlot(s, { ...change, phone: b.phone }, b.id);
  if (invalid) return { ok: false, ...invalid };

  // same rule as a new booking: a small party stays confirmed, otherwise the staff confirms again
  const status = onlineStatus(s, change.people);
  try {
    const booking = await r.changeBooking(b.id, change, status, s.booking.maxCoversPerService);
    after(() =>
      Promise.all([
        announce({ type: "changed", booking, before }),
        // the guest gets the confirmation with the new details
        status === "confirmed" ? sendWhatsappOrAlert("confirmed", booking, s) : null,
      ]),
    );
    return { ok: true, status };
  } catch (e) {
    if (e instanceof SlotFullError) return { ok: false, error: fullMessage(change.time), field: "time", slotFull: true };
    await logError("Modifica del cliente non salvata", e, { booking: b.id });
    return { ok: false, error: "Si è verificato un problema. Riprova o chiamaci." };
  }
}

export async function cancelMyBooking(token: string): Promise<GuestResult> {
  const r = repo();
  const [s, b] = await Promise.all([r.getSettings(), r.getBookingByToken(token)]);
  if (!b) return { ok: false, error: "Prenotazione non trovata." };
  if (b.status === "cancelled") return { ok: true };
  if (!guestCanManage(b, s)) return { ok: false, error: TOO_LATE };
  await r.setBookingStatus(b.id, "cancelled");
  after(() => announce({ type: "cancelledByGuest", booking: { ...b, status: "cancelled" } }));
  return { ok: true };
}
