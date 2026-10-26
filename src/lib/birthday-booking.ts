import "server-only";
import { inviteDates, promiseOf } from "./birthday";
import { isActive } from "./customers";
import { repo } from "./data";
import { logError } from "./errors";
import { isShortCode, normalizeShortCode } from "./short-code";
import type { BirthdayContact, BirthdayTerms, Booking, Settings } from "./types";

/*
 * The guest's birthday link, /auguri/<code>: created by the daily job with the wishes,
 * it books only around the birthday, with the birthday offer and no other promotion.
 * One booking per link: if the guest cancels it, the link works again until its last day.
 * Its days and offer are the ones the wishes promised (fixed when the link was created).
 */

export type BirthdayInvite =
  | { state: "open"; contact: BirthdayContact; birthday: string; dates: string[]; terms: BirthdayTerms }
  | { state: "booked"; contact: BirthdayContact; booking: Booking }
  | { state: "expired"; contact: BirthdayContact };

/** The invite behind a code, or null when the code doesn't exist. */
export async function findInvite(rawCode: string, s: Settings): Promise<BirthdayInvite | null> {
  const code = normalizeShortCode(rawCode);
  if (!isShortCode(code)) return null;
  const r = repo();
  let contact: BirthdayContact | null = null;
  try {
    contact = await r.getBirthdayByInvite(code);
  } catch (e) {
    // e.g. the 2026-10-26 migration hasn't run yet
    await logError("Link di compleanno non letto", e);
  }
  if (!contact?.invite_for) return null;
  if (contact.invite_booking_id) {
    const booking = await r.getBooking(contact.invite_booking_id);
    if (booking && isActive(booking)) return { state: "booked", contact, booking };
  }
  const dates = inviteDates(s, contact);
  return dates.length
    ? { state: "open", contact, birthday: contact.invite_for, dates, terms: promiseOf(s, contact) }
    : { state: "expired", contact };
}

/**
 * Days a birthday booking can be moved to by the guest: the link's days (its own date
 * always included). Null for any other booking.
 */
export async function birthdayDatesFor(b: Booking, s: Settings): Promise<string[] | null> {
  if (!b.birthday_offer) return null;
  try {
    const contact = (await repo().listBirthdays()).find((c) => c.invite_booking_id === b.id);
    const days = contact ? inviteDates(s, contact) : [];
    return [...new Set([...days, b.date])].sort();
  } catch (e) {
    await logError("Giorni del compleanno non letti", e, { booking: b.id });
    return [b.date];
  }
}
