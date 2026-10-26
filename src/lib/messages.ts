/**
 * WhatsApp messages to guests: the values that fill the approved templates
 * (src/lib/whatsapp/templates.ts) and the very same text when the staff sends it by hand.
 * Texts TO BE APPROVED by the restaurant (see README, "Da completare con il cliente").
 */
import { offerValidity } from "./birthday";
import { SITE_URL } from "./site";
import { capitalize, formatDateLong, formatDateLongEn } from "./time";
import type { BirthdayTerms, Booking, Settings, WhatsappKind, WhatsappStatus } from "./types";
import { BIRTHDAY_TEMPLATE, BODY_MAX, filledBody, renderMessage, TEMPLATES } from "./whatsapp/templates";

/** How a request is declined: the approved message (no reason given to the guest) or a text written by the staff, sent by hand. */
export type DeclineMessage = "standard" | "custom";

export const DECLINE_MESSAGES: { id: DeclineMessage; label: string }[] = [
  { id: "standard", label: "Messaggio standard" },
  { id: "custom", label: "Scrivo io il messaggio" },
];

/** The guest's page as sent in the messages: the short link /p/K7M2QX9T (the long one only before the 2026-10-18 migration). */
export const manageUrl = (b: Pick<Booking, "manage_token" | "short_code">) =>
  b.short_code ? `${SITE_URL}/p/${b.short_code}` : `${SITE_URL}/prenotazione/${b.manage_token}`;

/** "Sabato 18 ottobre / Saturday 18 October": every message is in Italian and English */
const bothDates = (d: string) => `${capitalize(formatDateLong(d))} / ${formatDateLongEn(d)}`;
const address = (s: Settings) => [s.address, s.city].filter(Boolean).join(", ");

type MessageBooking = Pick<Booking, "name" | "people" | "date" | "time" | "manage_token" | "short_code">;

/** Values for the template variables {{1}}, {{2}}… in order. */
export function templateValues(kind: WhatsappKind, b: MessageBooking, s: Settings): string[] {
  const name = b.name.trim();
  if (kind === "declined") return [name];
  const common = [name, bothDates(b.date), b.time, String(b.people)];
  if (kind === "confirmed") return [...common, address(s)];
  return common;
}

/** The message exactly as the guest receives it: used for the preview and for sending it by hand. */
export function whatsappText(kind: WhatsappKind, b: MessageBooking, s: Settings) {
  return renderMessage(TEMPLATES[kind], templateValues(kind, b, s), SITE_URL, manageUrl(b));
}

/** {{2}} of the birthday template: the offer in both languages (only one if the other is empty). */
export const birthdayOffer = (t: Pick<BirthdayTerms, "offerIt" | "offerEn">) => [t.offerIt.trim(), t.offerEn.trim()].filter(Boolean).join(" / ");

/** {{4}} of the birthday template: the number guests call to book (Locale e orari). */
export const birthdayPhone = (s: Pick<Settings, "phone" | "phone2">) => (s.phone || s.phone2).trim();

/**
 * Values of the birthday template: name, offer, days it is valid for (Italian), restaurant's
 * phone, days (English). `birthday`: the date the link is for; `terms`: what it promises.
 */
export const birthdayValues = (name: string, birthday: string, terms: BirthdayTerms, s: Settings) => [
  name.trim(),
  birthdayOffer(terms),
  offerValidity(terms.dates, birthday, "lei"),
  birthdayPhone(s),
  offerValidity(terms.dates, birthday, "en"),
];

/** The guest's own birthday link, the button of the wishes: /auguri/K7M2QX9T */
export const birthdayLink = (code: string) => `${SITE_URL}/auguri/${code}`;

/** The birthday wishes as the guest reads them, for the preview and for sending them by hand. */
export const birthdayText = (name: string, birthday: string, terms: BirthdayTerms, s: Settings, code: string) =>
  renderMessage(BIRTHDAY_TEMPLATE, birthdayValues(name, birthday, terms, s), SITE_URL, birthdayLink(code));

/** Meta refuses the wishes if the filled message is too long (a long offer or name): checked before sending and in the preview. */
export const birthdayTooLong = (values: string[]) => filledBody(BIRTHDAY_TEMPLATE, values).length > BODY_MAX;

/** Start of a free-text message ("Scrivo io il messaggio"): only sent by hand. */
export const customStart = (b: Pick<Booking, "name">) => `Gentile / Dear ${b.name.trim()},\n\n`;

export const WA_KIND_LABEL: Record<WhatsappKind, string> = {
  requested: "Richiesta ricevuta",
  confirmed: "Conferma",
  declined: "Rifiuto",
  cancelled: "Annullamento",
};

export const WA_STATUS_LABEL: Record<WhatsappStatus, string> = {
  accepted: "in invio",
  sent: "inviato",
  delivered: "consegnato",
  read: "letto",
  failed: "non inviato",
};
