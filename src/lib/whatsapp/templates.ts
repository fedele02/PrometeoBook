/**
 * The WhatsApp messages sent to guests, as Meta "utility" templates.
 *
 * One source for everything: the script that submits them to Meta
 * (scripts/whatsapp.ts), the automatic sending through YCloud and the
 * hand-sent fallback text all read these definitions, so they can never differ.
 *
 * Texts written by us: TO BE APPROVED by the restaurant (README, "Da completare").
 * Changing a text after Meta approved it means a new template name (bump the _v1 suffix).
 *
 * No runtime imports: Node runs this file directly from the scripts.
 */
import type { WhatsappKind } from "../types";

export const WA_LANGUAGE = "it";
export const WA_FOOTER = "Prometeo Fine Dining · Matera";

export type TemplateDef = {
  kind: WhatsappKind;
  /** Meta template name: lowercase letters, digits, underscores */
  name: string;
  /** body with positional variables {{1}}, {{2}}… (never at the start or end) */
  body: string;
  /** one sample value per variable, required by Meta's review */
  example: string[];
  /** URL button: `path` is appended to the site URL; with `withToken` the booking's private code follows it */
  button: { text: string; path: string; withToken: boolean };
};

const SAMPLE = ["Mario", "4 persone", "sabato 18 ottobre", "21:00"];

export const TEMPLATES: Record<WhatsappKind, TemplateDef> = {
  requested: {
    kind: "requested",
    name: "prenotazione_ricevuta_v1",
    body:
      "Ciao {{1}}, abbiamo ricevuto la tua richiesta di prenotazione per {{2}}, {{3}} alle ore {{4}}.\n\n" +
      "Non è ancora una conferma: ti scriveremo qui appena il ristorante l'avrà verificata.",
    example: SAMPLE,
    button: { text: "Gestisci prenotazione", path: "/prenotazione/", withToken: true },
  },
  confirmed: {
    kind: "confirmed",
    name: "prenotazione_confermata_v1",
    body:
      "Ciao {{1}}, la tua prenotazione è confermata: {{2}}, {{3}} alle ore {{4}}.\n\n" +
      "Ti aspettiamo in {{5}}. Se devi modificarla o annullarla, usa il pulsante qui sotto.",
    example: [...SAMPLE, "Via Michele Torraca 10, Matera"],
    button: { text: "Gestisci prenotazione", path: "/prenotazione/", withToken: true },
  },
  declined: {
    kind: "declined",
    name: "prenotazione_non_accettata_v1",
    body:
      "Ciao {{1}}, ci dispiace: non possiamo accettare la tua richiesta per {{2}}, {{3}} alle ore {{4}}, perché {{5}}.\n\n" +
      "Puoi scegliere un altro giorno o un altro orario dal nostro sito.",
    example: [...SAMPLE, "siamo al completo a quell'ora"],
    button: { text: "Prenota un'altra data", path: "/prenota", withToken: false },
  },
  cancelled: {
    kind: "cancelled",
    name: "prenotazione_annullata_v1",
    body:
      "Ciao {{1}}, ti informiamo che la tua prenotazione per {{2}}, {{3}} alle ore {{4}} è stata annullata dal ristorante.\n\n" +
      "Per qualsiasi chiarimento rispondi a questo messaggio o chiamaci.",
    example: SAMPLE,
    button: { text: "Prenota di nuovo", path: "/prenota", withToken: false },
  },
};

/** The fifth variable of the "declined" template, completing "…, perché {{5}}." */
export const DECLINE_REASON_TEXT = {
  full: "siamo al completo a quell'ora",
  closed: "il locale è chiuso quel giorno",
  group: "per un gruppo così numeroso non riusciamo a garantire il servizio",
} as const;

/** Meta rejects parameters with new lines, tabs or more than 4 spaces in a row. */
export const cleanParam = (s: string) => s.replace(/[\r\n\t]+/g, " ").replace(/ {2,}/g, " ").trim().slice(0, 300);

const fill = (text: string, values: string[]) => text.replace(/\{\{(\d+)\}\}/g, (_, n) => values[Number(n) - 1] ?? "");
const trimSlash = (url: string) => url.replace(/\/+$/, "");

export const buttonUrl = (def: TemplateDef, siteUrl: string, token?: string) =>
  `${trimSlash(siteUrl)}${def.button.path}${def.button.withToken ? token ?? "" : ""}`;

/** The message as the guest reads it (also the text for sending it by hand). */
export function renderMessage(def: TemplateDef, values: string[], siteUrl: string, token?: string) {
  return `${fill(def.body, values.map(cleanParam))}\n\n${def.button.text}: ${buttonUrl(def, siteUrl, token)}`;
}

/** `components` for YCloud's send API. */
export function sendComponents(def: TemplateDef, values: string[], token?: string) {
  const components: Record<string, unknown>[] = [{ type: "body", parameters: values.map((v) => ({ type: "text", text: cleanParam(v) })) }];
  if (def.button.withToken) components.push({ type: "button", sub_type: "url", index: 0, parameters: [{ type: "text", text: token ?? "" }] });
  return components;
}

/** Body of YCloud's "create template" API (POST /v2/whatsapp/templates). */
export function createRequest(def: TemplateDef, siteUrl: string, wabaId: string) {
  const base = trimSlash(siteUrl);
  return {
    wabaId,
    name: def.name,
    language: WA_LANGUAGE,
    category: "UTILITY",
    components: [
      { type: "BODY", text: def.body, example: { body_text: [def.example] } },
      { type: "FOOTER", text: WA_FOOTER },
      {
        type: "BUTTONS",
        buttons: [
          def.button.withToken
            ? { type: "URL", text: def.button.text, url: `${base}${def.button.path}{{1}}`, example: [`${base}${def.button.path}2f6d0c1e-4b7a-4c3e-9a51-7d2b8e6f1a90`] }
            : { type: "URL", text: def.button.text, url: `${base}${def.button.path}` },
        ],
      },
    ],
  };
}
