import "server-only";
import webpush from "web-push";
import type { NotifyPrefs, PushDevice } from "./types";
import { repo } from "./data";
import { logError } from "./errors";

/** Push needs the VAPID keys (see .env.example); without them it simply stays off. */
export const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";
export const isPushEnabled = () => Boolean(VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);

export const DEFAULT_PREFS: NotifyPrefs = { requests: true, changes: true, cancellations: true, staff: true };

/** Cookie with the id of the device the staff member is using (to skip their own actions). */
export const DEVICE_COOKIE = "pm_device";

let configured = false;
function configure() {
  if (configured) return;
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || "mailto:prenotazioni@example.com",
    VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY!,
  );
  configured = true;
}

export type PushPayload = {
  title: string;
  body: string;
  /** screen to open on tap */
  url: string;
  /** same tag = the new notification replaces the old one */
  tag?: string;
  /** number on the app icon */
  badge?: number;
  timestamp?: number;
};

/**
 * Sends one notification to every device that wants this group.
 * Never throws: a failed notification must not break the booking flow.
 * Devices the browser has unsubscribed (404/410) are removed.
 */
export async function pushToDevices(
  payload: PushPayload,
  opts: { group: keyof NotifyPrefs; exceptDevice?: string; onlyDevice?: string },
) {
  if (!isPushEnabled()) return { sent: 0 };
  try {
    configure();
    const r = repo();
    const devices = (await r.listDevices()).filter((d) =>
      opts.onlyDevice ? d.id === opts.onlyDevice : d.id !== opts.exceptDevice && { ...DEFAULT_PREFS, ...d.prefs }[opts.group],
    );
    const body = JSON.stringify({ timestamp: Date.now(), ...payload });
    let sent = 0;
    await Promise.all(
      devices.map(async (d: PushDevice) => {
        try {
          await webpush.sendNotification({ endpoint: d.endpoint, keys: { p256dh: d.p256dh, auth: d.auth } }, body, {
            TTL: 12 * 3600,
            // every message is operational for the staff: deliver at once, even to sleeping phones
            urgency: "high",
            topic: payload.tag?.slice(0, 32),
          });
          sent++;
        } catch (e) {
          const status = (e as { statusCode?: number }).statusCode;
          if (status === 404 || status === 410) await r.deleteDevice(d.id).catch(() => {});
          else await logError(`Notifica push non consegnata a ${d.label || "un dispositivo"}`, e, { status });
        }
      }),
    );
    return { sent };
  } catch (e) {
    await logError("Notifiche push non inviate", e);
    return { sent: 0 };
  }
}
