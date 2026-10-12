/**
 * WhatsApp messages to guests: the values that fill the approved templates
 * (src/lib/whatsapp/templates.ts) and the very same text when the staff sends it by hand.
 * Texts TO BE APPROVED by the restaurant (see README, "Da completare con il cliente").
 */
import { SITE_URL } from "./site";
import { formatDateLong } from "./time";
import type { Booking, Settings, WhatsappKind, WhatsappStatus } from "./types";
import { DECLINE_REASON_TEXT, renderMessage, TEMPLATES } from "./whatsapp/templates";

export type DeclineReason = keyof typeof DECLINE_REASON_TEXT | "custom";

export const DECLINE_REASONS: { id: DeclineReason; label: string }[] = [
  { id: "full", label: "Siamo al completo a quell'ora" },
  { id: "closed", label: "Il locale è chiuso quel giorno" },
  { id: "group", label: "Il gruppo è troppo numeroso" },
  { id: "custom", label: "Scrivo io il messaggio" },
];

export const manageUrl = (b: Pick<Booking, "manage_token">) => `${SITE_URL}/prenotazione/${b.manage_token}`;

const firstName = (name: string) => name.trim().split(/\s+/)[0] || name.trim();
const guests = (n: number) => `${n} ${n === 1 ? "persona" : "persone"}`;
const address = (s: Settings) => [s.address, s.city].filter(Boolean).join(", ");

type MessageBooking = Pick<Booking, "name" | "people" | "date" | "time" | "manage_token">;

/** Values for the template variables {{1}}, {{2}}… in order. */
export function templateValues(kind: WhatsappKind, b: MessageBooking, s: Settings, reason?: DeclineReason): string[] {
  const common = [firstName(b.name), guests(b.people), formatDateLong(b.date), b.time];
  if (kind === "confirmed") return [...common, address(s)];
  if (kind === "declined") return [...common, DECLINE_REASON_TEXT[reason && reason !== "custom" ? reason : "full"]];
  return common;
}

/** The message exactly as the guest receives it: used for the preview and for sending it by hand. */
export function whatsappText(kind: WhatsappKind, b: MessageBooking, s: Settings, reason?: DeclineReason) {
  return renderMessage(TEMPLATES[kind], templateValues(kind, b, s, reason), SITE_URL, b.manage_token);
}

/** Start of a free-text message ("Scrivo io il messaggio"): only sent by hand. */
export const customStart = (b: Pick<Booking, "name">) => `Buongiorno ${firstName(b.name)}, `;

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
