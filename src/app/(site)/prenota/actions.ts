"use server";

import { z } from "zod";
import { repo } from "@/lib/data";
import { SlotFullError } from "@/lib/data/repo";
import { notifyNewBooking } from "@/lib/notify";
import { dayState, isBookableDate, isValidDate, slotsForDate } from "@/lib/time";

export type Slot = { time: string; free: boolean };
export type Availability =
  | { closed: true; reason: string }
  | { closed: false; services: { label: string; slots: Slot[] }[] };

export async function getAvailability(date: string, people: number): Promise<Availability> {
  if (!isValidDate(date)) return { closed: true, reason: "Data non valida" };
  const r = repo();
  const s = await r.getSettings();
  if (!s.booking.enabled) return { closed: true, reason: "Le prenotazioni online sono sospese" };
  const state = dayState(s, date);
  if (state.closed) return { closed: true, reason: state.reason };
  if (!isBookableDate(s, date)) return { closed: true, reason: "Data non prenotabile" };

  const services = slotsForDate(s, date);
  if (!services.length) return { closed: true, reason: "Per oggi non ci sono più orari disponibili" };

  const taken = await r.coversByTime(date);
  const max = s.booking.maxCoversPerSlot;
  return {
    closed: false,
    services: services.map((svc) => ({
      label: svc.label,
      slots: svc.times.map((time) => ({ time, free: (taken[time] ?? 0) + people <= max })),
    })),
  };
}

const bookingSchema = z.object({
  date: z.string().refine(isValidDate),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  people: z.number().int().min(1).max(60),
  name: z.string().trim().min(2, "Scrivi il tuo nome").max(80),
  phone: z
    .string()
    .transform((v) => v.replace(/[\s().-]/g, ""))
    .refine((v) => /^\+?\d{6,15}$/.test(v), "Controlla il numero di telefono"),
  notes: z.string().trim().max(500).default(""),
  privacy: z.literal(true, { error: "Serve il consenso per gestire la prenotazione" }),
  // honeypot: real people never see nor fill this field
  website: z.string().max(0).optional(),
});

export type BookingInput = z.input<typeof bookingSchema>;
export type BookingResult =
  | { ok: true; id: string; status: "pending" | "confirmed" }
  | { ok: false; error: string; field?: string; slotFull?: boolean };

export async function submitBooking(input: BookingInput): Promise<BookingResult> {
  const parsed = bookingSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const field = String(issue.path[0] ?? "");
    if (field === "website") return { ok: true, id: "-", status: "pending" }; // silently drop bots
    return { ok: false, error: issue.message, field };
  }
  const b = parsed.data;
  const r = repo();
  const s = await r.getSettings();

  if (!s.booking.enabled) return { ok: false, error: "Le prenotazioni online sono momentaneamente sospese." };
  if (b.people > s.booking.maxPartySize)
    return { ok: false, error: `Per gruppi oltre ${s.booking.maxPartySize} persone chiamaci: troveremo la soluzione migliore.` };
  if (!isBookableDate(s, b.date)) return { ok: false, error: "Questa data non è prenotabile.", field: "date" };
  const valid = slotsForDate(s, b.date).some((svc) => svc.times.includes(b.time));
  if (!valid) return { ok: false, error: "Questo orario non è più disponibile.", field: "time", slotFull: true };

  // simple abuse guard: max 4 online bookings per phone number per day
  const since = new Date(Date.now() - 864e5).toISOString();
  if ((await r.countBookingsByPhone(b.phone, since)) >= 4)
    return { ok: false, error: "Hai già effettuato diverse prenotazioni oggi. Per modifiche chiamaci." };

  try {
    const status = s.booking.autoConfirm ? "confirmed" : "pending";
    const booking = await r.createBooking(
      { date: b.date, time: b.time, people: b.people, name: b.name, phone: b.phone, email: "", notes: b.notes, status, source: "web" },
      s.booking.maxCoversPerSlot,
    );
    await notifyNewBooking(booking);
    return { ok: true, id: booking.id, status };
  } catch (e) {
    if (e instanceof SlotFullError)
      return { ok: false, error: "Ci dispiace, questo orario è appena stato riempito. Scegline un altro.", field: "time", slotFull: true };
    console.error(e);
    return { ok: false, error: "Si è verificato un problema. Riprova o chiamaci." };
  }
}
