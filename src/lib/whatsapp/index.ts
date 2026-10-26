import "server-only";
import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { repo } from "../data";
import { logError } from "../errors";
import { BIRTHDAY_KEEP_MONTHS, birthdayTerms, dueOccurrence, inviteDates } from "../birthday";
import { newShortCode } from "../short-code";
import { phoneKey } from "../customers";
import { birthdayOffer, birthdayPhone, birthdayTooLong, birthdayValues, templateValues, WA_KIND_LABEL, type DeclineMessage } from "../messages";
import { ADMIN_PATH } from "../pwa";
import { pushToDevices } from "../push";
import { dateParts, romeNow } from "../time";
import type { Booking, Settings, WhatsappKind, WhatsappMessage, WhatsappStatus } from "../types";
import { BIRTHDAY_TEMPLATE, sendComponents, TEMPLATES, WA_LANGUAGE } from "./templates";
import { toE164, ycloud, type YcloudMessage } from "./ycloud";

/*
 * Automatic WhatsApp messages to guests through YCloud (WhatsApp Business App
 * coexistence: the restaurant's own number, also open in the WhatsApp Business app).
 *
 * Turned on by the env vars below plus the switch in Gestione → Locale e orari.
 * Nothing here ever throws: a message that can't be sent is recorded as "failed"
 * and the staff can still send it by hand from the app.
 */

const API_KEY = process.env.YCLOUD_API_KEY ?? "";
const FROM = process.env.YCLOUD_WHATSAPP_FROM ?? "";
const WEBHOOK_SECRET = process.env.YCLOUD_WEBHOOK_SECRET ?? "";

/** The restaurant's number messages are sent from, for display (+39…). */
export const whatsappFrom = () => toE164(FROM);

/** YCloud is connected (API key and the restaurant's number). */
export const isWhatsappConfigured = () => Boolean(API_KEY && toE164(FROM));

/** Messages go out on their own: YCloud connected and the switch on. */
export const isWhatsappAuto = (s: Settings) => isWhatsappConfigured() && s.booking.whatsappAuto;


export type WhatsappOutcome = { sent: true; status: WhatsappStatus } | { sent: false; skipped?: boolean; error: string };

/** Italian explanation of YCloud / Meta errors the staff may see. */
function explain(code: string, message: string): string {
  const m = `${code} ${message}`.toLowerCase();
  if (code === "TIMEOUT" || code === "NETWORK") return "YCloud non raggiungibile in questo momento";
  if (m.includes("approved") || m.includes("template")) return "Il modello del messaggio non è (ancora) approvato da Meta";
  if (m.includes("not a valid whatsapp") || m.includes("131026") || m.includes("recipient")) return "Il numero non risulta su WhatsApp";
  if (m.includes("balance") || m.includes("payment") || m.includes("131042")) return "Problema di pagamento sull'account WhatsApp";
  if (m.includes("api key") || m.includes("unauthorized") || code === "401") return "Chiave YCloud non valida";
  return message || "Invio non riuscito";
}

/**
 * Sends one of the four messages for a booking and records it.
 * Returns quickly (YCloud's synchronous endpoint, 10 s timeout).
 */
export async function sendBookingWhatsapp(kind: WhatsappKind, b: Booking, s: Settings, opts: { decline?: DeclineMessage } = {}): Promise<WhatsappOutcome> {
  if (!isWhatsappAuto(s)) return { sent: false, skipped: true, error: "Messaggi automatici non attivi" };
  if (kind === "declined" && opts.decline === "custom") return { sent: false, skipped: true, error: "Messaggio scritto a mano" };

  const r = repo();
  const now = new Date().toISOString();
  const record: WhatsappMessage = { id: randomUUID(), booking_id: b.id, kind, provider_id: null, status: "accepted", error: null, created_at: now, updated_at: now };
  const save = async (patch: Partial<WhatsappMessage>) => {
    try {
      await r.saveWhatsappMessage({ ...record, ...patch, updated_at: new Date().toISOString() });
    } catch (e) {
      // the table may be missing until the migration runs: sending matters more than the log
      await logError("Messaggio WhatsApp non registrato", e);
    }
  };

  const to = toE164(b.phone);
  if (!to) {
    await save({ status: "failed", error: "Numero di telefono non valido" });
    return { sent: false, error: "Numero di telefono non valido" };
  }

  const def = TEMPLATES[kind];
  const res = await ycloud<YcloudMessage>(API_KEY, "/whatsapp/messages/sendDirectly", {
    body: {
      from: toE164(FROM),
      to,
      type: "template",
      externalId: record.id,
      template: { name: def.name, language: { code: WA_LANGUAGE, policy: "deterministic" }, components: sendComponents(def, templateValues(kind, b, s), b.short_code) },
    },
  });

  if (!res.ok) {
    const error = explain(res.code, res.message);
    await logError(`WhatsApp "${kind}" non inviato: ${error}`, undefined, { code: res.code, message: res.message, booking: b.id });
    await save({ status: "failed", error });
    return { sent: false, error };
  }

  const status = normalize(res.data.status);
  const error = status === "failed" ? explain(res.data.errorCode ?? "", res.data.errorMessage ?? "") : null;
  await save({ provider_id: res.data.id, status, error });
  return status === "failed" ? { sent: false, error: error! } : { sent: true, status };
}

/**
 * Daily job (cron): birthday wishes to the guests who agreed, `daysBefore` days ahead,
 * once per birthday, with the guest's own booking link (/auguri/<code>, created here: nothing
 * shows in Gestione until the guest books with it). Off unless switched on with an offer and a
 * phone written; without YCloud the link is still created and the staff sends the wishes by hand
 * from Clienti → Compleanni in arrivo. Skipped when no day around the birthday can be booked
 * any more. Also deletes consents older than 24 months. Returns how many were sent.
 */
export async function sendDueBirthdays(now = romeNow()): Promise<{ sent: number; failed: number }> {
  const r = repo();
  const out = { sent: 0, failed: 0 };
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - BIRTHDAY_KEEP_MONTHS);
  await r.deleteBirthdaysBefore(cutoff.toISOString());

  const s = await r.getSettings();
  // the message tells guests to call: no phone in Locale e orari, no wishes
  if (!s.birthday.enabled || !birthdayOffer(s.birthday) || !birthdayPhone(s)) return out;

  for (const c of await r.listBirthdays()) {
    const due = dueOccurrence(c.birthday, now.date, s.birthday.daysBefore, s.birthday.windowDays);
    if (!due || c.last_sent_for === due) continue;

    // this year's link: a new code for a new birthday, the same one if already created.
    // Its promise (days, offer) is fixed now: later changes in Gestione apply to the next wishes only.
    const same = c.invite_for === due;
    let code = same ? c.invite_code : null;
    let terms = same ? c.invite_terms : null;
    if (!code || !terms) {
      terms = birthdayTerms(s, due, now);
      if (!terms.dates.length) continue; // no day around the birthday can be booked any more
      const fresh = !code;
      code ??= newShortCode();
      try {
        await r.updateBirthday(c.phone_key, { invite_code: code, invite_for: due, invite_terms: terms, ...(fresh ? { invite_booking_id: null } : {}) });
      } catch (e) {
        // e.g. the 2026-10-26 migration hasn't run: no link, so no wishes (the others still go)
        out.failed++;
        await logError("Link di compleanno non creato", e, { guest: c.phone_key });
        continue;
      }
    }
    if (!inviteDates(s, { invite_for: due, invite_terms: terms }, now).length) continue;
    if (!isWhatsappConfigured()) continue;

    // a very long name: the first name only, so the message fits Meta's limit
    let values = birthdayValues(c.name, due, terms, s);
    if (birthdayTooLong(values)) values = birthdayValues(c.name.trim().split(/\s+/)[0], due, terms, s);
    const to = toE164(c.phone);
    const res = birthdayTooLong(values)
      ? ({ ok: false, code: "LENGTH", message: "Messaggio troppo lungo per WhatsApp: accorcia l'offerta in Gestione → Promozioni" } as const)
      : to
        ? await ycloud<YcloudMessage>(API_KEY, "/whatsapp/messages/sendDirectly", {
            body: {
              from: toE164(FROM),
              to,
              type: "template",
              externalId: `birthday-${c.phone_key}-${due}`,
              template: { name: BIRTHDAY_TEMPLATE.name, language: { code: WA_LANGUAGE, policy: "deterministic" }, components: sendComponents(BIRTHDAY_TEMPLATE, values, code) },
            },
          })
        : ({ ok: false, code: "PHONE", message: "Numero di telefono non valido" } as const);
    const error = !res.ok ? explain(res.code, res.message) : res.data.status === "failed" ? explain(res.data.errorCode ?? "", res.data.errorMessage ?? "") : null;
    if (error) {
      out.failed++;
      await logError(`Auguri di compleanno non inviati: ${error}`, undefined, { guest: c.phone_key });
    } else out.sent++;
    // sent or not, never retried the same year: the staff sees the error in Clienti
    await r.updateBirthday(c.phone_key, { last_sent_for: due, last_error: error });
  }
  return out;
}

/** For messages nobody is waiting on (e.g. "request received"): if it fails, tell the staff. */
export async function sendWhatsappOrAlert(kind: WhatsappKind, b: Booking, s: Settings) {
  const out = await sendBookingWhatsapp(kind, b, s);
  if (!out.sent && !out.skipped) await alertStaff(kind, b, out.error);
  return out;
}

async function alertStaff(kind: WhatsappKind, b: Booking, error: string) {
  const p = dateParts(b.date);
  await pushToDevices(
    {
      title: `WhatsApp non inviato · ${b.name}`,
      body: `${WA_KIND_LABEL[kind]} per ${p.wd} ${p.day} ${p.month}, ore ${b.time}: invialo a mano dall'app.\n${error}`,
      url: `${ADMIN_PATH}?date=${b.date}#row-${b.id}`,
      tag: `wa-${b.id}-${kind}`,
    },
    { group: "requests" },
  );
}

const STATUSES: WhatsappStatus[] = ["accepted", "sent", "delivered", "read", "failed"];
const normalize = (s: string): WhatsappStatus => (STATUSES.includes(s as WhatsappStatus) ? (s as WhatsappStatus) : "accepted");
const RANK: Record<WhatsappStatus, number> = { accepted: 0, sent: 1, delivered: 2, read: 3, failed: 1.5 };

/** Statuses only move forward (webhooks can arrive out of order); a failure after delivery is ignored. */
export const advances = (from: WhatsappStatus, to: WhatsappStatus) => (to === "failed" ? from === "accepted" || from === "sent" : RANK[to] > RANK[from]);

/** All recorded messages of some bookings, by booking id. Never throws. */
export async function whatsappByBooking(bookingIds: string[]): Promise<Record<string, WhatsappMessage[]>> {
  const out: Record<string, WhatsappMessage[]> = {};
  // without YCloud there is nothing to show (and the table may not exist yet)
  if (!bookingIds.length || !isWhatsappConfigured()) return out;
  try {
    for (const m of await repo().listWhatsappMessages(bookingIds)) (out[m.booking_id] ??= []).push(m);
  } catch (e) {
    await logError("Stato dei messaggi WhatsApp non letto", e);
  }
  return out;
}

// ---------- webhook (POST /api/whatsapp/webhook) ------------------------

/** YCloud-Signature: "t=<unix seconds>,s=<hex HMAC-SHA256 of `${t}.${rawBody}`>" */
export function verifySignature(header: string | null, rawBody: string, now = Date.now()) {
  if (!WEBHOOK_SECRET || !header) return false;
  const parts = Object.fromEntries(header.split(",").map((p) => p.trim().split("=", 2) as [string, string]));
  const t = parts.t;
  const sig = parts.s;
  if (!t || !sig || !/^[0-9a-f]{64}$/i.test(sig)) return false;
  if (Math.abs(Math.floor(now / 1000) - Number(t)) > 300) return false;
  const expected = createHmac("sha256", WEBHOOK_SECRET).update(`${t}.`).update(rawBody).digest();
  return timingSafeEqual(expected, Buffer.from(sig, "hex"));
}

export const isWebhookConfigured = () => Boolean(WEBHOOK_SECRET);

type YcloudInbound = { from?: string; type?: string; text?: { body?: string }; button?: { text?: string; payload?: string } };
type YcloudEvent = { id?: string; type?: string; whatsappMessage?: YcloudMessage; whatsappInboundMessage?: YcloudInbound };

/** A guest's reply that means "no more birthday wishes". */
const isStop = (text: string) => /^\s*(stop|basta|cancellami|unsubscribe)\b/i.test(text);

/**
 * Applies a status update from YCloud and tells the staff when a message could not
 * be delivered. A guest answering STOP is removed from the birthday wishes.
 */
export async function handleWebhookEvent(event: YcloudEvent) {
  if (event.type === "whatsapp.inbound_message.received" && event.whatsappInboundMessage) {
    const m = event.whatsappInboundMessage;
    const text = m.text?.body ?? m.button?.text ?? m.button?.payload ?? "";
    if (m.from && isStop(text)) await repo().deleteBirthday(phoneKey(m.from));
    return;
  }
  if (event.type !== "whatsapp.message.updated" || !event.whatsappMessage) return;
  const m = event.whatsappMessage;
  const status = normalize(m.status);
  const r = repo();

  // birthday wishes are not booking messages: only a late failure is worth keeping (shown in Clienti)
  const wish = m.externalId?.match(/^birthday-(\d+)-(\d{4}-\d{2}-\d{2})$/);
  if (wish) {
    if (status === "failed") await r.updateBirthday(wish[1], { last_sent_for: wish[2], last_error: explain(m.errorCode ?? "", m.errorMessage ?? "") });
    return;
  }

  const match = m.externalId ? { id: m.externalId } : m.id ? { providerId: m.id } : null;
  if (!match) return;
  const current = await r.getWhatsappMessage(match);
  if (!current || !advances(current.status, status)) return;

  const error = status === "failed" ? explain(m.errorCode ?? "", m.errorMessage ?? "") : null;
  const updated = await r.updateWhatsappMessage({ id: current.id }, { status, error, provider_id: current.provider_id ?? m.id ?? null });

  if (updated && status === "failed") {
    const b = await r.getBooking(updated.booking_id);
    if (b) await alertStaff(updated.kind, b, error ?? "Messaggio non consegnato");
  }
}
