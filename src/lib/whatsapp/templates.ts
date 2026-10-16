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
  /** URL button: `path` is appended to the site URL; with `withCode` the short code of the guest's link follows it (/p/K7M2QX9T) */
  button: { text: string; path: string; withCode: boolean };
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
    button: { text: "Gestisci prenotazione", path: "/p/", withCode: true },
  },
  confirmed: {
    kind: "confirmed",
    name: "prenotazione_confermata_v1",
    body:
      "Ciao {{1}}, la tua prenotazione è confermata: {{2}}, {{3}} alle ore {{4}}.\n\n" +
      "Ti aspettiamo in {{5}}. Se devi modificarla o annullarla, usa il pulsante qui sotto.",
    example: [...SAMPLE, "Via Michele Torraca 10, Matera"],
    button: { text: "Gestisci prenotazione", path: "/p/", withCode: true },
  },
  declined: {
    kind: "declined",
    name: "prenotazione_non_accettata_v1",
    body:
      "Ciao {{1}}, ci dispiace: non possiamo accettare la tua richiesta per {{2}}, {{3}} alle ore {{4}}, perché {{5}}.\n\n" +
      "Puoi scegliere un altro giorno o un altro orario dal nostro sito.",
    example: [...SAMPLE, "siamo al completo a quell'ora"],
    button: { text: "Prenota un'altra data", path: "/prenota", withCode: false },
  },
  cancelled: {
    kind: "cancelled",
    name: "prenotazione_annullata_v2",
    body:
      "Gentile {{1}}, ti confermiamo che la tua prenotazione per {{2}}, {{3}} alle ore {{4}} è stata annullata.\n\n" +
      "Se hai bisogno di aiuto o vuoi spostarla a un'altra data, rispondi a questo messaggio o chiamaci. Saremo felici di accoglierti presto.",
    example: SAMPLE,
    button: { text: "Prenota di nuovo", path: "/prenota", withCode: false },
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

/** Where the button leads. `link`: the guest's own page, used by the buttons `withCode`. */
export const buttonUrl = (def: TemplateDef, siteUrl: string, link?: string) =>
  def.button.withCode && link ? link : `${trimSlash(siteUrl)}${def.button.path}`;

/**
 * The message as the guest reads it when the staff sends it by hand: a typed
 * message has no button, so the link is written out and called a link.
 */
export function renderMessage(def: TemplateDef, values: string[], siteUrl: string, link?: string) {
  const body = fill(def.body, values.map(cleanParam)).replace("il pulsante qui sotto", "il link qui sotto");
  return `${body}\n\n${def.button.text}: ${buttonUrl(def, siteUrl, link)}`;
}

/** `components` for YCloud's send API; `code`: the short code of the guest's link. */
export function sendComponents(def: TemplateDef, values: string[], code?: string) {
  const components: Record<string, unknown>[] = [{ type: "body", parameters: values.map((v) => ({ type: "text", text: cleanParam(v) })) }];
  if (def.button.withCode) components.push({ type: "button", sub_type: "url", index: 0, parameters: [{ type: "text", text: code ?? "" }] });
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
          def.button.withCode
            ? { type: "URL", text: def.button.text, url: `${base}${def.button.path}{{1}}`, example: [`${base}${def.button.path}K7M2QX9T`] }
            : { type: "URL", text: def.button.text, url: `${base}${def.button.path}` },
        ],
      },
    ],
  };
}
