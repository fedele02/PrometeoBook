import type { Metadata, Viewport } from "next";
import { Cinzel, Cormorant_Garamond, Hanken_Grotesk } from "next/font/google";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const cinzel = Cinzel({ variable: "--font-cinzel", subsets: ["latin"], weight: ["400"] });
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  // the hero tagline is the largest text on phones: never wait for this font to paint it
  display: "optional",
});
const hanken = Hanken_Grotesk({ variable: "--font-hanken", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Prometeo Fine Dining · Ristorante a Matera",
    template: "%s · Prometeo Fine Dining Matera",
  },
  description:
    "Prometeo Fine Dining, Via Michele Torraca 10 a Matera. Cucina tradizionale lucana rivisitata, percorsi di sapori e prenotazione online del tavolo.",
  keywords: ["ristorante Matera", "fine dining Matera", "cucina lucana", "Prometeo Matera", "dove mangiare a Matera"],
  openGraph: {
    type: "website",
    locale: "it_IT",
    siteName: "Prometeo Fine Dining",
    images: [{ url: "/img/og-image.jpg", width: 1200, height: 630 }],
  },
  appleWebApp: { title: "Prometeo", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  themeColor: "#0b0b0b",
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="it" className={`${cinzel.variable} ${cormorant.variable} ${hanken.variable}`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
