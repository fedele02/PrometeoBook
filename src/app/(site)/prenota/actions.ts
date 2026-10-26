"use server";

import { after } from "next/server";
import { z } from "zod";
import { BIRTHDAY_CONSENT, isBirthdayKey } from "@/lib/birthday";
import { birthdayDatesFor, findInvite } from "@/lib/birthday-booking";
import { blocked, clientIp, miss } from "@/lib/guess-guard";
import { birthdayStatus, coversByService, guestCanManage, onlineStatus, phoneKey, sameServiceBooking } from "@/lib/customers";
import { repo } from "@/lib/data";
import { SlotFullError } from "@/lib/data/repo";
import { announce } from "@/lib/events";
import { sendWhatsappOrAlert } from "@/lib/whatsapp";
import { promotionFor } from "@/lib/promotions";
import { dayState, formatDateLong, isBookableDate, isValidDate, serviceLabel, slotsForDate } from "@/lib/time";
import type { AppliedPromotion, OnlineStatus, Settings } from "@/lib/types";
import { logError } from "@/lib/errors";

/** `promo`: discount of that time in percent (0 = none) */
export type Slot = { time: string; free: boolean; promo: number };
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
      return { label: svc.label, full, slots: svc.times.map((time) => ({ time, free: !full, promo: promotionFor(s, date, time)?.percent ?? 0 })) };
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
  // up to a whole service: the service limit is checked when saving
  people: z.number().int().min(1).max(1000),
  name: z.string().trim().min(2, "Scrivi il tuo nome").max(80),
  phone,
  notes: z.string().trim().max(500).default(""),
  privacy: z.literal(true, { error: "Serve il consenso per gestire la prenotazione" }),
  // optional, only with its own consent: "MM-DD" (day and month, never the year)
  birthday: z.string().default(""),
  birthdayConsent: z.boolean().default(false),
  // honeypot: real people never see nor fill this field
  website: z.string().max(0).optional(),
});

export type BookingInput = z.input<typeof bookingSchema>;
export type BookingResult =
  /** status: confirmed at once (small party) or a request for the staff; promotion: the discount saved on it */
  | { ok: true; token: string; status: OnlineStatus; promotion: AppliedPromotion | null }
  | { ok: false; error: string; field?: string; slotFull?: boolean };

/** Rules shared by a new booking and a guest's change. Returns an error or null. */
async function checkSlot(
  s: Settings,
  b: { date: string; time: string; people: number; phone: string },
  ignoreId?: string,
): Promise<{ error: string; field?: string; slotFull?: boolean } | null> {
  if (!s.booking.enabled) return { error: "Le prenotazioni online sono momentaneamente sospese." };
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
    if (field === "website") return { ok: true, token: "", status: "pending", promotion: null }; // silently drop bots
    return { ok: false, error: issue.message, field };
  }
  const b = parsed.data;
  if (b.birthdayConsent && !isBirthdayKey(b.birthday)) return { ok: false, error: "Scegli giorno e mese del tuo compleanno.", field: "birthday" };
  if (b.birthday && !b.birthdayConsent)
    return { ok: false, error: "Per ricevere l'offerta di compleanno spunta la casella, oppure lascia vuota la data.", field: "birthdayConsent" };
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
  // the discount of that date and time, saved on the booking as it is now
  const promotion = promotionFor(s, b.date, b.time);
  try {
    const booking = await r.createBooking(
      { date: b.date, time: b.time, people: b.people, name: b.name, phone: b.phone, email: "", notes: b.notes, status, source: "web", promotion },
      s.booking.maxCoversPerService,
    );
    after(() =>
      Promise.all([
        announce({ type: status === "confirmed" ? "autoConfirmed" : "requested", booking }),
        sendWhatsappOrAlert(status === "confirmed" ? "confirmed" : "requested", booking, s),
        s.birthday.enabled && b.birthdayConsent ? saveBirthdayConsent(b) : null,
      ]),
    );
    return { ok: true, token: booking.manage_token, status, promotion: booking.promotion ?? promotion };
  } catch (e) {
    if (e instanceof SlotFullError) return { ok: false, error: fullMessage(b.time), field: "time", slotFull: true };
    await logError("Prenotazione dal sito non salvata", e, { date: b.date, time: b.time, people: b.people });
    return { ok: false, error: "Si è verificato un problema. Riprova o chiamaci." };
  }
}

// ---------- the birthday link (/auguri/<code>) ----------

const birthdayBookingSchema = z.object({
  date: z.string().refine(isValidDate),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  people: z.number().int().min(1).max(1000),
  name: z.string().trim().min(2, "Scrivi il tuo nome").max(80),
  notes: z.string().trim().max(500).default(""),
  privacy: z.literal(true, { error: "Serve il consenso per gestire la prenotazione" }),
  website: z.string().max(0).optional(),
});

/**
 * Booking with the guest's birthday link: only the link's days, the phone number the
 * wishes went to, the birthday offer saved on the booking and no other promotion.
 * Otherwise the same rules as the site (service limits, auto-confirm, messages).
 */
export async function submitBirthdayBooking(code: string, input: z.input<typeof birthdayBookingSchema>): Promise<BookingResult> {
  const ip = await clientIp();
  if (blocked(ip)) return { ok: false, error: "Link non valido." };
  const parsed = birthdayBookingSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const field = String(issue.path[0] ?? "");
    if (field === "website") return { ok: true, token: "", status: "pending", promotion: null };
    return { ok: false, error: issue.message, field };
  }
  const b = parsed.data;
  const r = repo();
  const s = await r.getSettings();

  const invite = await findInvite(code, s);
  if (!invite) {
    miss(ip);
    return { ok: false, error: "Link non valido." };
  }
  if (invite.state === "booked") return { ok: false, error: "Con questo link hai già prenotato: trovi la prenotazione nel riepilogo." };
  if (invite.state === "expired") return { ok: false, error: "Questo link è scaduto. Per festeggiare con noi chiamaci." };
  if (!invite.dates.includes(b.date)) return { ok: false, error: "Con questo link puoi prenotare solo nei giorni indicati.", field: "date" };

  const phone = invite.contact.phone;
  const invalid = await checkSlot(s, { ...b, phone });
  if (invalid) return { ok: false, ...invalid };

  // the staff always confirms a birthday booking (and checks the offer), whatever the party size
  const status = birthdayStatus();
  try {
    const booking = await r.createBooking(
      // the offer of the wishes replaces any promotion of that day
      { date: b.date, time: b.time, people: b.people, name: b.name, phone, email: "", notes: b.notes, status, source: "web", promotion: null, birthday_offer: invite.terms.offerIt || invite.terms.offerEn || "Offerta di compleanno" },
      s.booking.maxCoversPerService,
    );
    await r.updateBirthday(invite.contact.phone_key, { invite_booking_id: booking.id });
    after(() =>
      Promise.all([
        announce({ type: status === "confirmed" ? "autoConfirmed" : "requested", booking }),
        sendWhatsappOrAlert(status === "confirmed" ? "confirmed" : "requested", booking, s),
      ]),
    );
    return { ok: true, token: booking.manage_token, status, promotion: null };
  } catch (e) {
    if (e instanceof SlotFullError) return { ok: false, error: fullMessage(b.time), field: "time", slotFull: true };
    await logError("Prenotazione di compleanno non salvata", e, { date: b.date, time: b.time, people: b.people });
    return { ok: false, error: "Si è verificato un problema. Riprova o chiamaci." };
  }
}

/** The guest ticked the birthday box: one consent per phone number, renewed at every booking. Never fails the booking. */
async function saveBirthdayConsent(b: { name: string; phone: string; birthday: string }) {
  try {
    const r = repo();
    const key = phoneKey(b.phone);
    const old = (await r.listBirthdays()).find((c) => c.phone_key === key);
    await r.saveBirthday({
      phone_key: key,
      phone: b.phone,
      name: b.name,
      birthday: b.birthday,
      consent_text: BIRTHDAY_CONSENT,
      consent_at: new Date().toISOString(),
      // a new date means new wishes; the same one keeps "already sent this year" and this year's link
      last_sent_for: old?.birthday === b.birthday ? old.last_sent_for : null,
      last_error: null,
      ...(old?.birthday === b.birthday && old.invite_code
        ? { invite_code: old.invite_code, invite_for: old.invite_for, invite_booking_id: old.invite_booking_id }
        : {}),
    });
  } catch (e) {
    // e.g. the 2026-10-25 migration hasn't run yet
    await logError("Consenso compleanno non salvato", e);
  }
}

// ---------- the guest's private page (/prenotazione/<token>) ----------

const changeSchema = z.object({
  date: z.string().refine(isValidDate),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  // up to a whole service: the service limit is checked when saving
  people: z.number().int().min(1).max(1000),
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
  const sameSlot = before.date === change.date && before.time === change.time;
  if (sameSlot && before.people === change.people && before.notes === change.notes) return { ok: true };

  // a birthday booking moves only between the days of its link
  const birthdayDays = await birthdayDatesFor(b, s);
  if (birthdayDays && !birthdayDays.includes(change.date))
    return { ok: false, error: "La prenotazione del compleanno si può spostare solo nei giorni del tuo link.", field: "date" };

  const invalid = await checkSlot(s, { ...change, phone: b.phone }, b.id);
  if (invalid) return { ok: false, ...invalid };

  // same rule as a new booking: a small party stays confirmed, otherwise the staff confirms again;
  // a birthday booking always goes back to the staff
  const status = birthdayDays ? birthdayStatus() : onlineStatus(s, change.people);
  try {
    // same date and time: the discount promised stays; otherwise the one of the new date and time (or none);
    // a birthday booking keeps its own offer and never takes a promotion
    const promotion = birthdayDays ? null : sameSlot ? (b.promotion ?? null) : promotionFor(s, change.date, change.time);
    const booking = await r.changeBooking(b.id, { ...change, promotion }, status, s.booking.maxCoversPerService);
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
