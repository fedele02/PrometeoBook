import type { Metadata, Viewport } from "next";
import { PwaClient } from "@/components/admin/pwa";
import { APP_ASSETS, APP_NAME, APP_SHORT_NAME, APP_THEME, IOS_SPLASH, splashFile } from "@/lib/pwa";

/*
 * Everything that makes the staff area an installable app lives here, so the
 * public site never gets a manifest, a service worker or an "install" prompt.
 */
export const metadata: Metadata = {
  title: { default: APP_NAME, template: "%s · Gestione Prometeo" },
  robots: { index: false, follow: false },
  manifest: APP_ASSETS.manifest,
  applicationName: APP_NAME,
  icons: { apple: APP_ASSETS.appleTouch },
  appleWebApp: {
    capable: true,
    title: APP_SHORT_NAME,
    statusBarStyle: "black-translucent",
    startupImage: IOS_SPLASH.map((s) => ({
      url: splashFile(s),
      media: `(device-width: ${s.w}px) and (device-height: ${s.h}px) and (-webkit-device-pixel-ratio: ${s.r}) and (orientation: portrait)`,
    })),
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: APP_THEME,
  viewportFit: "cover",
};

export default function AdminRootLayout({ children }: LayoutProps<"/gestore-prometeo-2026">) {
  return (
    <div className="min-h-dvh bg-ink text-cream">
      <PwaClient />
      {children}
    </div>
  );
}
