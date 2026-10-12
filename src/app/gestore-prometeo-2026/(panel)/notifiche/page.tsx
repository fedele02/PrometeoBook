import { cookies } from "next/headers";
import { requireAdmin } from "@/lib/auth";
import { repo } from "@/lib/data";
import { DEFAULT_PREFS, DEVICE_COOKIE, isPushEnabled, VAPID_PUBLIC_KEY } from "@/lib/push";
import { NotificationsPanel } from "@/components/admin/NotificationsPanel";

export const metadata = { title: "Notifiche e app" };

export default async function NotificationsPage() {
  const [admin, devices, jar] = await Promise.all([requireAdmin(), repo().listDevices(), cookies()]);

  return (
    <NotificationsPanel
      email={admin.email}
      pushReady={isPushEnabled()}
      publicKey={VAPID_PUBLIC_KEY}
      currentId={jar.get(DEVICE_COOKIE)?.value ?? null}
      // keys never leave the server
      devices={devices.map((d) => ({ id: d.id, label: d.label, created_at: d.created_at, prefs: { ...DEFAULT_PREFS, ...d.prefs } }))}
    />
  );
}
