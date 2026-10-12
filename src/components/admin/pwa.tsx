"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { removeDeviceAction, registerDeviceAction } from "@/app/gestore-prometeo-2026/actions";
import { ADMIN_PATH, APP_ASSETS } from "@/lib/pwa";

/*
 * Browser side of the staff app: service worker, install prompt, push
 * subscription and the number on the app icon.
 */

type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };

// ---------- install prompt store (the event fires once, early) ----------

let deferred: InstallEvent | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export type Platform = "ios" | "android" | "desktop";

function detectPlatform(): Platform {
  const ua = navigator.userAgent;
  // iPadOS reports itself as a Mac with touch
  if (/iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return "ios";
  if (/Android/.test(ua)) return "android";
  return "desktop";
}

const isStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;

/** "iPhone", "Android · Chrome", "Windows · Edge"… shown in the list of devices. */
export function deviceLabel() {
  const ua = navigator.userAgent;
  const os = /iPhone/.test(ua) ? "iPhone" : /iPad/.test(ua) ? "iPad" : /Android/.test(ua) ? "Android" : /Windows/.test(ua) ? "Windows" : /Mac/.test(ua) ? "Mac" : "Computer";
  if (os === "iPhone" || os === "iPad") return isStandalone() ? `${os} · app` : os;
  const browser = /Edg\//.test(ua) ? "Edge" : /Firefox\//.test(ua) ? "Firefox" : /SamsungBrowser/.test(ua) ? "Samsung Internet" : /Chrome\//.test(ua) ? "Chrome" : /Safari\//.test(ua) ? "Safari" : "Browser";
  return `${os} · ${browser}${isStandalone() ? " · app" : ""}`;
}

/** Install state: Android/desktop Chrome can prompt, iPhone needs the share sheet. */
const noop = () => () => {};
const envSnapshot = () => `${detectPlatform()}|${isStandalone() ? 1 : 0}`;

export function useInstall() {
  const canPrompt = useSyncExternalStore(subscribe, () => deferred !== null, () => false);
  // "" while rendering on the server: platform and display mode exist only in the browser
  const key = useSyncExternalStore(noop, envSnapshot, () => "");
  const env = key ? { platform: key.split("|")[0] as Platform, standalone: key.endsWith("|1") } : null;

  const prompt = useCallback(async () => {
    if (!deferred) return false;
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    deferred = null;
    emit();
    return outcome === "accepted";
  }, []);

  return { ready: env !== null, platform: env?.platform ?? "desktop", standalone: env?.standalone ?? false, canPrompt, prompt };
}

// ---------- root client: service worker + live refresh -------------------

export function PwaClient() {
  const router = useRouter();

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault(); // we show our own "Installa" button
      deferred = e as InstallEvent;
      emit();
    };
    const onInstalled = () => {
      deferred = null;
      emit();
    };
    addEventListener("beforeinstallprompt", onPrompt);
    addEventListener("appinstalled", onInstalled);

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register(APP_ASSETS.serviceWorker, { scope: ADMIN_PATH, updateViaCache: "none" }).catch((e) => console.error("sw", e));
    }
    // a push arrived while the app is open: show the new data at once
    const onMessage = (e: MessageEvent) => e.data?.type === "bookings-changed" && router.refresh();
    navigator.serviceWorker?.addEventListener("message", onMessage);

    return () => {
      removeEventListener("beforeinstallprompt", onPrompt);
      removeEventListener("appinstalled", onInstalled);
      navigator.serviceWorker?.removeEventListener("message", onMessage);
    };
  }, [router]);

  return null;
}

/** Number on the app icon = requests still to decide (where the system supports it). */
export function AppBadge({ count }: { count: number }) {
  useEffect(() => {
    const nav = navigator as Navigator & { setAppBadge?: (n: number) => Promise<void>; clearAppBadge?: () => Promise<void> };
    if (!nav.setAppBadge) return;
    (count > 0 ? nav.setAppBadge(count) : nav.clearAppBadge?.())?.catch(() => {});
  }, [count]);
  return null;
}

// ---------- push subscription of this device -----------------------------

export type PushState = "loading" | "unsupported" | "needs-install" | "denied" | "off" | "on";

function keyToBytes(base64: string) {
  const pad = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + pad).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

async function registration() {
  return (await navigator.serviceWorker.getRegistration(ADMIN_PATH)) ?? navigator.serviceWorker.register(APP_ASSETS.serviceWorker, { scope: ADMIN_PATH });
}

/** What the browser allows, before looking at the subscription. */
function support(): "ok" | "unsupported" | "needs-install" | "denied" {
  if (!("serviceWorker" in navigator && "PushManager" in window && "Notification" in window))
    // iPhone: push exists only inside the app added to the home screen
    return detectPlatform() === "ios" && !isStandalone() ? "needs-install" : "unsupported";
  return Notification.permission === "denied" ? "denied" : "ok";
}

export function usePush(publicKey: string) {
  const allowed = useSyncExternalStore(noop, support, () => "loading" as const);
  const [subscribed, setSubscribed] = useState<boolean | null>(null);

  const refresh = useCallback(async () => {
    if (support() !== "ok") return setSubscribed(null);
    const sub = await (await registration()).pushManager.getSubscription();
    setSubscribed(Boolean(sub));
  }, []);

  useEffect(() => {
    if (allowed !== "ok") return;
    let live = true;
    registration()
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => live && setSubscribed(Boolean(sub)));
    return () => {
      live = false;
    };
  }, [allowed]);

  const state: PushState = allowed !== "ok" ? allowed : subscribed === null ? "loading" : subscribed ? "on" : "off";

  /** Must run from a tap (iOS asks for permission only on a user gesture). */
  const enable = useCallback(async () => {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      await refresh();
      return { ok: false as const, error: permission === "denied" ? "Notifiche bloccate nelle impostazioni del telefono" : "Permesso non concesso" };
    }
    const reg = await registration();
    const sub = (await reg.pushManager.getSubscription()) ?? (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyToBytes(publicKey) }));
    const json = sub.toJSON();
    const res = await registerDeviceAction({ endpoint: sub.endpoint, keys: json.keys, label: deviceLabel() });
    await refresh();
    return res.ok ? { ok: true as const } : { ok: false as const, error: res.error };
  }, [publicKey, refresh]);

  const disable = useCallback(
    async (deviceId?: string) => {
      const sub = await (await registration()).pushManager.getSubscription();
      await sub?.unsubscribe();
      if (deviceId) await removeDeviceAction(deviceId);
      await refresh();
    },
    [refresh],
  );

  return { state, enable, disable };
}
