/**
 * The staff app ("Prometeo Gestione"): an installable web app that lives only
 * under the private admin path. The public site is never installable.
 *
 * No imports here: scripts/make-app-assets.ts reads this file directly with Node.
 */

export const ADMIN_PATH = "/gestore-prometeo-2026";
export const APP_NAME = "Prometeo Gestione";
/** label under the icon on the home screen */
export const APP_SHORT_NAME = "Prometeo";
export const APP_THEME = "#0b0b0b";

/** Static files of the app, served from public/gestore-prometeo-2026/. */
export const APP_ASSETS = {
  manifest: `${ADMIN_PATH}/manifest.webmanifest`,
  serviceWorker: `${ADMIN_PATH}/sw.js`,
  icon192: `${ADMIN_PATH}/icons/icon-192.png`,
  icon512: `${ADMIN_PATH}/icons/icon-512.png`,
  maskable192: `${ADMIN_PATH}/icons/maskable-192.png`,
  maskable512: `${ADMIN_PATH}/icons/maskable-512.png`,
  appleTouch: `${ADMIN_PATH}/icons/apple-touch-icon.png`,
  /** monochrome silhouette Android shows in the status bar */
  badge: `${ADMIN_PATH}/icons/badge-96.png`,
};

/**
 * iPhone launch screens (iOS ignores the manifest for these).
 * Sizes in CSS points + pixel ratio, portrait only.
 */
export const IOS_SPLASH: { w: number; h: number; r: number }[] = [
  { w: 440, h: 956, r: 3 }, // 16 Pro Max
  { w: 402, h: 874, r: 3 }, // 16 Pro
  { w: 430, h: 932, r: 3 }, // 14 Pro Max, 15 Plus/Pro Max, 16 Plus
  { w: 393, h: 852, r: 3 }, // 14 Pro, 15, 15 Pro, 16
  { w: 428, h: 926, r: 3 }, // 12/13 Pro Max, 14 Plus
  { w: 390, h: 844, r: 3 }, // 12, 13, 14
  { w: 375, h: 812, r: 3 }, // X, XS, 11 Pro
  { w: 360, h: 780, r: 3 }, // 12/13 mini
  { w: 414, h: 896, r: 3 }, // XS Max, 11 Pro Max
  { w: 414, h: 896, r: 2 }, // XR, 11
  { w: 375, h: 667, r: 2 }, // SE, 8
];

export const splashFile = (s: { w: number; h: number; r: number }) => `${ADMIN_PATH}/splash/${s.w * s.r}x${s.h * s.r}.png`;
