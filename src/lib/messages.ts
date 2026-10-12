/**
 * WhatsApp messages the staff sends to guests. Written by us: TO BE APPROVED by the restaurant
 * (see README, "Da completare con il cliente"). The staff can still edit them before sending.
 */
import { SITE_URL } from "./site";
import { formatDateLong } from "./time";
import type { Booking, Settings } from "./types";

const firstName = (name: string) => name.trim().split(/\s+/)[0];
const guests = (n: number) => `${n} ${n === 1 ? "persona" : "persone"}`;
export const manageUrl = (b: Pick<Booking, "manage_token">) => `${SITE_URL}/prenotazione/${b.manage_token}`;

export function acceptMessage(b: Booking, s: Settings) {
  return (
    `Buongiorno ${firstName(b.name)}, confermiamo la sua prenotazione al ${s.name} ${s.subtitle} ` +
    `per ${formatDateLong(b.date)} alle ${b.time}, ${guests(b.people)}.\n` +
    `Per modificarla o annullarla: ${manageUrl(b)}\nA presto!`
  );
}

export type DeclineReason = "full" | "closed" | "group" | "custom";

export const DECLINE_REASONS: { id: DeclineReason; label: string }[] = [
  { id: "full", label: "Siamo al completo a quell'ora" },
  { id: "closed", label: "Il locale è chiuso quel giorno" },
  { id: "group", label: "Il gruppo è troppo numeroso" },
  { id: "custom", label: "Scrivo io il messaggio" },
];

export function declineMessage(b: Booking, s: Settings, reason: DeclineReason) {
  const when = `${formatDateLong(b.date)} alle ${b.time}`;
  const hello = `Buongiorno ${firstName(b.name)}, ci dispiace:`;
  const sign = `\n${s.name} ${s.subtitle}`.trimEnd();
  switch (reason) {
    case "full":
      return `${hello} ${when} siamo al completo e non possiamo accettare la prenotazione per ${guests(b.people)}. Se le va, ci risponda qui e le proponiamo un altro orario.${sign}`;
    case "closed":
      return `${hello} ${formatDateLong(b.date)} il locale è chiuso e non possiamo accettare la prenotazione. Se le va, ci risponda qui e troviamo insieme un'altra data.${sign}`;
    case "group":
      return `${hello} per ${guests(b.people)} ${when} non riusciamo a garantire il servizio che meritate. Ci risponda qui o ci chiami: cerchiamo insieme la soluzione migliore.${sign}`;
    case "custom":
      return `Buongiorno ${firstName(b.name)}, `;
  }
}
