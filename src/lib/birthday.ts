import { addDays, dayState, formatDateLong, formatDateLongEn, isBookableDate, romeNow } from "./time";
import type { BirthdayContact, BirthdayTerms, Settings } from "./types";

/*
 * Birthday wishes (marketing, GDPR art. 6.1.a): only with the guest's own consent,
 * a separate box on the booking form, never ticked in advance and never needed to book.
 * Only day and month are asked: the year (and so the age) is never collected.
 * Texts TO BE APPROVED by the restaurant (README, "Da completare").
 */

/** The consent box, saved word for word with the date it was ticked. Change it → old consents keep their own text. */
export const BIRTHDAY_CONSENT =
  "Sì, desidero ricevere su WhatsApp un'offerta riservata per il mio compleanno. Posso annullare l'iscrizione in qualsiasi momento rispondendo STOP.";

/** A consent lasts 24 months from the last booking with the box ticked, then the date is deleted. */
export const BIRTHDAY_KEEP_MONTHS = 24;

export const MONTHS = ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"];
const DAYS_IN = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

/** Days of a month (1–12), counting 29 February. */
export const daysInMonth = (month: number) => DAYS_IN[month - 1] ?? 31;

/** "MM-DD" from day and month, or null when the date can't exist. */
export function birthdayKey(day: number, month: number): string | null {
  if (!Number.isInteger(day) || !Number.isInteger(month) || month < 1 || month > 12 || day < 1 || day > daysInMonth(month)) return null;
  return `${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export const isBirthdayKey = (s: string) => /^\d{2}-\d{2}$/.test(s) && birthdayKey(Number(s.slice(3)), Number(s.slice(0, 2))) !== null;

/** "12 marzo" */
export const birthdayLabel = (key: string) => `${Number(key.slice(3))} ${MONTHS[Number(key.slice(0, 2)) - 1] ?? ""}`;

const isLeap = (y: number) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;

/** The birthday as a date in a year ("YYYY-MM-DD"); 29 February becomes the 28th in common years. */
export function occurrence(key: string, year: number) {
  const md = key === "02-29" && !isLeap(year) ? "02-28" : key;
  return `${year}-${md}`;
}

/** Next birthday from a date (today included). */
export function nextOccurrence(key: string, from: string) {
  const y = Number(from.slice(0, 4));
  const d = occurrence(key, y);
  return d >= from ? d : occurrence(key, y + 1);
}

/**
 * Days the guest's birthday link can book: from the birthday − `windowDays` to + `windowDays`,
 * open and bookable days only (from today, within the booking horizon). When the birthday itself
 * is a closing day, the nearest open day before and the nearest after are added too.
 */
export function allowedDates(s: Settings, birthday: string, now = romeNow()): string[] {
  const w = Math.max(0, s.birthday.windowDays);
  const out = new Set<string>();
  for (let i = -w; i <= w; i++) {
    const d = addDays(birthday, i);
    if (isBookableDate(s, d, now)) out.add(d);
  }
  if (dayState(s, birthday).closed) {
    for (const step of [-1, 1]) {
      for (let i = 1; i <= 14; i++) {
        const d = addDays(birthday, step * i);
        if (dayState(s, d).closed) continue;
        if (isBookableDate(s, d, now)) out.add(d);
        break;
      }
    }
  }
  return [...out].sort();
}

/**
 * The birthday whose wishes are due today, or null: from `daysBefore` days ahead until the link
 * can still be used (a guest who agrees late still gets them; whether a day is left to book
 * is checked by the caller with allowedDates). The caller skips birthdays already sent.
 */
export function dueOccurrence(key: string, today: string, daysBefore: number, windowDays: number): string | null {
  const y = Number(today.slice(0, 4));
  for (const year of [y - 1, y, y + 1]) {
    const occ = occurrence(key, year);
    // + 14: room for the nearest open day after a closed birthday
    if (addDays(occ, -daysBefore) <= today && today <= addDays(occ, windowDays + 14)) return occ;
  }
  return null;
}

/** What the wishes promise for a birthday, from today's settings: fixed on the guest's link when it is created. */
export const birthdayTerms = (s: Settings, birthday: string, now = romeNow()): BirthdayTerms => ({
  dates: allowedDates(s, birthday, now),
  offerIt: s.birthday.offerIt.trim(),
  offerEn: s.birthday.offerEn.trim(),
});

/** The promise of a guest's link: the one fixed when it was created (links made before that: today's settings). */
export const promiseOf = (s: Settings, c: Pick<BirthdayContact, "invite_for" | "invite_terms">, now = romeNow()): BirthdayTerms =>
  c.invite_terms ?? birthdayTerms(s, c.invite_for ?? "", now);

/** The promised days the link can still book (past days and days closed in the meantime drop out). */
export const inviteDates = (s: Settings, c: Pick<BirthdayContact, "invite_for" | "invite_terms">, now = romeNow()) =>
  c.invite_for ? promiseOf(s, c, now).dates.filter((d) => isBookableDate(s, d, now)) : [];

// "domenica 1° novembre", as written in Italian
const itLong = (d: string) => formatDateLong(d).replace(/ 1 /, " 1° ");
// "dal 31 ottobre", "dall'8 novembre", "al 1° novembre"
const itArt = (prep: "dal" | "al", d: string, withMonth: boolean) => {
  const n = Number(d.slice(8));
  const day = `${n === 1 ? "1°" : n}${withMonth ? ` ${formatDateLong(d).split(" ").slice(2).join(" ")}` : ""}`;
  return n === 8 || n === 11 ? `${prep === "dal" ? "dall'" : "all'"}${day}` : `${prep} ${day}`;
};
const enDay = (d: string, withMonth: boolean) => (withMonth ? formatDateLongEn(d).split(" ").slice(1).join(" ") : String(Number(d.slice(8))));

/**
 * When the birthday offer can be used, written out for the guest from the promised days:
 * "per il giorno del Suo compleanno, mercoledì 28 ottobre", "per sabato 31 ottobre",
 * "per domenica 1 novembre o martedì 3 novembre", "dal 31 ottobre al 4 novembre
 * (nei giorni di apertura)". `lei`: the WhatsApp message; `tu`: the site; `it`: the staff; `en`: English.
 */
export function offerValidity(dates: string[], birthday: string, lang: "lei" | "tu" | "it" | "en"): string {
  if (!dates.length) return "";
  const en = lang === "en";
  const long = en ? formatDateLongEn : itLong;
  if (dates.length === 1) {
    const d = dates[0];
    if (d === birthday) return en ? `on your birthday, ${long(d)}` : `per il giorno del ${{ lei: "Suo ", tu: "tuo ", it: "" }[lang]}compleanno, ${long(d)}`;
    return en ? `on ${long(d)}` : `per ${long(d)}`;
  }
  const consecutive = dates.every((d, i) => i === 0 || addDays(dates[i - 1], 1) === d);
  // a few days apart (the birthday is a closing day): each one by name
  if (!consecutive && dates.length <= 3) {
    const list = dates.map(long);
    const last = list.pop();
    return en ? `on ${list.join(", ")} or ${last}` : `per ${list.join(", ")} o ${last}`;
  }
  const first = dates[0];
  const last = dates[dates.length - 1];
  // "dal 27 al 30 ottobre", "dal 31 ottobre al 4 novembre"
  const sameMonth = first.slice(0, 7) === last.slice(0, 7);
  const range = en
    ? `from ${enDay(first, !sameMonth)} to ${enDay(last, true)}`
    : `${itArt("dal", first, !sameMonth)} ${itArt("al", last, true)}`;
  return consecutive ? range : `${range} ${en ? "(on our opening days)" : "(nei giorni di apertura)"}`;
}
