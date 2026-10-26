/**
 * The WhatsApp messages sent to guests, as Meta templates ("utility", the birthday wishes "marketing").
 *
 * One source for everything: the script that submits them to Meta
 * (scripts/whatsapp.ts), the automatic sending through YCloud and the
 * hand-sent fallback text all read these definitions, so they can never differ.
 *
 * Texts written by us: TO BE APPROVED by the restaurant (README, "Da completare").
 * Changing a text after Meta approved it means a new template name (bump the _bi_v1 suffix).
 *
 * No runtime imports: Node runs this file directly from the scripts.
 */
import type { WhatsappKind } from "../types";

export const WA_LANGUAGE = "it";
export const WA_FOOTER = "Prometeo Fine Dining · Matera";

export type TemplateDef = {
  kind: WhatsappKind | "birthday";
  /** Meta category: "utility" for the booking messages, "marketing" for the birthday offer (default utility) */
  category?: "UTILITY" | "MARKETING";
  /** Meta template name: lowercase letters, digits, underscores */
  name: string;
  /** body with positional variables {{1}}, {{2}}… (never at the start or end) */
  body: string;
  /** one sample value per variable, required by Meta's review */
  example: string[];
  /** URL button: `path` is appended to the site URL; with `withCode` the short code of the guest's link follows it (/p/K7M2QX9T) */
  button: { text: string; path: string; withCode: boolean };
};

// Every message is in Italian and English, formal ("Lei"). Each variable appears once,
// so the guest's name opens both languages and the details are shared.
const SAMPLE = ["Mario Rossi", "Sabato 18 ottobre / Saturday 18 October", "21:00", "4"];
const DETAILS = "Data / Date: {{2}}\nOra / Time: {{3}}\nPersone / Guests: {{4}}";
const paragraphs = (...p: string[]) => p.join("\n\n");

export const TEMPLATES: Record<WhatsappKind, TemplateDef> = {
  requested: {
    kind: "requested",
    name: "prenotazione_ricevuta_bi_v1",
    body: paragraphs(
      "Gentile / Dear {{1}},",
      "abbiamo ricevuto la Sua richiesta di prenotazione.\nWe have received your booking request.",
      DETAILS,
      "La prenotazione non è ancora confermata: stiamo verificando la disponibilità e Le risponderemo al più presto qui su WhatsApp.",
      "Your booking is not confirmed yet: we are checking availability and will reply to you here on WhatsApp shortly.",
    ),
    example: SAMPLE,
    button: { text: "Gestisci / Manage", path: "/p/", withCode: true },
  },
  confirmed: {
    kind: "confirmed",
    name: "prenotazione_confermata_bi_v1",
    body: paragraphs(
      "Gentile / Dear {{1}},",
      "la Sua prenotazione è confermata.\nYour booking is confirmed.",
      `${DETAILS}\nIndirizzo / Address: {{5}}`,
      "La aspettiamo. Se desidera modificare o annullare la prenotazione, utilizzi il pulsante qui sotto.",
      "We look forward to welcoming you. If you wish to change or cancel your booking, please use the button below.",
    ),
    example: [...SAMPLE, "Via Michele Torraca 10, Matera"],
    button: { text: "Gestisci / Manage", path: "/p/", withCode: true },
  },
  declined: {
    kind: "declined",
    name: "prenotazione_non_accettata_bi_v1",
    body: paragraphs(
      "Gentile / Dear {{1}},",
      "purtroppo non possiamo accettare la Sua richiesta di prenotazione.\nUnfortunately we are unable to accept your booking request.",
      "Ci scusiamo per l'inconveniente. Se lo desidera, può scegliere un altro giorno o un altro orario dal nostro sito.",
      "We apologise for the inconvenience. If you wish, you can choose another day or time on our website.",
    ),
    // no details and no reason: only the guest's name
    example: SAMPLE.slice(0, 1),
    button: { text: "Prenota / Book", path: "/prenota", withCode: false },
  },
  cancelled: {
    kind: "cancelled",
    name: "prenotazione_annullata_bi_v1",
    body: paragraphs(
      "Gentile / Dear {{1}},",
      "Le confermiamo che la Sua prenotazione è stata annullata.\nWe confirm that your booking has been cancelled.",
      DETAILS,
      "Se ha bisogno di aiuto o desidera spostarla a un'altra data, risponda a questo messaggio o ci chiami. Sarà un piacere accoglierLa presto.",
      "If you need help or would like to move it to another date, simply reply to this message or give us a call. We hope to welcome you soon.",
    ),
    example: SAMPLE,
    button: { text: "Prenota / Book", path: "/prenota", withCode: false },
  },
};

/**
 * Birthday wishes with an offer: a "marketing" template, sent only to guests who
 * ticked the birthday box. The terms are all written in the message, so the guest knows
 * them before booking (Codice del Consumo): {{2}} the offer written in Gestione →
 * Promozioni (IT / EN); {{3}} / {{5}} the days it is valid for, in Italian and English
 * (birthday.ts offerValidity), fixed when the link is created; {{4}} the restaurant's
 * phone (Locale e orari). One booking only, subject to availability and the staff's
 * confirmation, an ID with the date of birth, not combinable, no cash.
 * The button is the guest's own birthday link, /auguri/<code>.
 * The STOP line is required by Meta for marketing and handled by the webhook.
 * v1 and v2 were withdrawn while Meta was reviewing them: their names can't be used again.
 */
export const BIRTHDAY_TEMPLATE: TemplateDef = {
  kind: "birthday",
  category: "MARKETING",
  name: "auguri_compleanno_bi_v3",
  body: paragraphs(
    "Gentile / Dear {{1}},",
    "tanti auguri di buon compleanno da tutti noi di Prometeo!\nHappy birthday from all of us at Prometeo!",
    "Per festeggiare Le riserviamo / Our gift for you: {{2}}",
    "Offerta personale, valida per una sola prenotazione {{3}}, con il pulsante qui sotto o al numero {{4}}, salvo disponibilità e nostra conferma. Il festeggiato mostra al ristorante un documento d'identità con la data di nascita. Non cumulabile con altre promozioni né convertibile in denaro.",
    "Personal offer, valid for one booking {{5}}, via the button below or by phone, subject to availability and our confirmation. ID with date of birth required. Not combinable with other offers or exchangeable for cash.",
    "Per non ricevere più questi messaggi risponda STOP.\nReply STOP to unsubscribe.",
  ),
  example: ["Mario Rossi", "un calice di benvenuto / a welcome glass of wine", "dal 31 ottobre al 4 novembre", "+39 391 352 9286", "from 31 October to 4 November"],
  button: { text: "Prenota / Book", path: "/auguri/", withCode: true },
};

/** Every template to submit to Meta (scripts/whatsapp.ts). */
export const ALL_TEMPLATES: TemplateDef[] = [...Object.values(TEMPLATES), BIRTHDAY_TEMPLATE];

/** Meta rejects parameters with new lines, tabs or more than 4 spaces in a row. */
export const cleanParam = (s: string) => s.replace(/[\r\n\t]+/g, " ").replace(/ {2,}/g, " ").trim().slice(0, 300);

const fill = (text: string, values: string[]) => text.replace(/\{\{(\d+)\}\}/g, (_, n) => values[Number(n) - 1] ?? "");

/** Meta refuses a message whose body, once filled, is longer than this. */
export const BODY_MAX = 1024;
/** The body as Meta receives it, to check it against BODY_MAX before sending. */
export const filledBody = (def: TemplateDef, values: string[]) => fill(def.body, values.map(cleanParam));
const trimSlash = (url: string) => url.replace(/\/+$/, "");

/** Where the button leads. `link`: the guest's own page, used by the buttons `withCode`. */
export const buttonUrl = (def: TemplateDef, siteUrl: string, link?: string) =>
  def.button.withCode && link ? link : `${trimSlash(siteUrl)}${def.button.path}`;

/**
 * The message as the guest reads it when the staff sends it by hand: a typed
 * message has no button, so the link is written out and called a link.
 */
export function renderMessage(def: TemplateDef, values: string[], siteUrl: string, link?: string) {
  const body = fill(def.body, values.map(cleanParam)).replace("il pulsante qui sotto", "il link qui sotto").replace("the button below", "the link below");
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
    category: def.category ?? "UTILITY",
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
