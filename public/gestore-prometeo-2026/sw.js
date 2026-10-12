/*
 * Service worker of the staff app "Prometeo Gestione".
 * Scope: /gestore-prometeo-2026 only (the public site never runs through it).
 * It does one job: show booking notifications and open the right screen on tap.
 * No offline cache on purpose: bookings must always be live data.
 */

const BADGE = "/gestore-prometeo-2026/icons/badge-96.png";
const ICON = "/gestore-prometeo-2026/icons/icon-192.png";
const HOME = "/gestore-prometeo-2026";

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: "Prometeo Gestione", body: event.data ? event.data.text() : "" };
  }

  event.waitUntil(
    (async () => {
      // number on the app icon = requests still to decide
      if (typeof data.badge === "number" && "setAppBadge" in self.navigator) {
        try {
          if (data.badge > 0) await self.navigator.setAppBadge(data.badge);
          else await self.navigator.clearAppBadge();
        } catch {}
      }

      await self.registration.showNotification(data.title || "Prometeo Gestione", {
        body: data.body || "",
        icon: ICON,
        badge: BADGE,
        tag: data.tag,
        renotify: Boolean(data.tag),
        timestamp: data.timestamp || Date.now(),
        data: { url: data.url || HOME },
      });

      // open screens refresh themselves right away
      const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const w of windows) w.postMessage({ type: "bookings-changed" });
    })(),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = new URL((event.notification.data && event.notification.data.url) || HOME, self.location.origin).href;

  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const w of windows) {
        if (new URL(w.url).pathname.startsWith(HOME)) {
          await w.focus();
          if ("navigate" in w) return w.navigate(target);
          return;
        }
      }
      return self.clients.openWindow(target);
    })(),
  );
});
