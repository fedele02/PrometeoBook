import "server-only";
import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { repo } from "../data";
import { templateValues, WA_KIND_LABEL, type DeclineReason } from "../messages";
import { ADMIN_PATH } from "../pwa";
import { pushToDevices } from "../push";
import { dateParts } from "../time";
import type { Booking, Settings, WhatsappKind, WhatsappMessage, WhatsappStatus } from "../types";
import { sendComponents, TEMPLATES, WA_LANGUAGE } from "./templates";
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
export async function sendBookingWhatsapp(kind: WhatsappKind, b: Booking, s: Settings, opts: { reason?: DeclineReason } = {}): Promise<WhatsappOutcome> {
  if (!isWhatsappAuto(s)) return { sent: false, skipped: true, error: "Messaggi automatici non attivi" };
  if (kind === "declined" && opts.reason === "custom") return { sent: false, skipped: true, error: "Messaggio scritto a mano" };

  const r = repo();
  const now = new Date().toISOString();
  const record: WhatsappMessage = { id: randomUUID(), booking_id: b.id, kind, provider_id: null, status: "accepted", error: null, created_at: now, updated_at: now };
  const save = async (patch: Partial<WhatsappMessage>) => {
    try {
      await r.saveWhatsappMessage({ ...record, ...patch, updated_at: new Date().toISOString() });
    } catch (e) {
      // the table may be missing until the migration runs: sending matters more than the log
      console.error("whatsapp: could not record message", e);
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
      template: { name: def.name, language: { code: WA_LANGUAGE, policy: "deterministic" }, components: sendComponents(def, templateValues(kind, b, s, opts.reason), b.manage_token) },
    },
  });

  if (!res.ok) {
    const error = explain(res.code, res.message);
    console.error("whatsapp: send failed", kind, res.code, res.message);
    await save({ status: "failed", error });
    return { sent: false, error };
  }

  const status = normalize(res.data.status);
  const error = status === "failed" ? explain(res.data.errorCode ?? "", res.data.errorMessage ?? "") : null;
  await save({ provider_id: res.data.id, status, error });
  return status === "failed" ? { sent: false, error: error! } : { sent: true, status };
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
    console.error("whatsapp: could not read messages", e);
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

type YcloudEvent = { id?: string; type?: string; whatsappMessage?: YcloudMessage };

/** Applies a status update from YCloud; tells the staff when a message could not be delivered. */
export async function handleWebhookEvent(event: YcloudEvent) {
  if (event.type !== "whatsapp.message.updated" || !event.whatsappMessage) return;
  const m = event.whatsappMessage;
  const status = normalize(m.status);
  const r = repo();

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
