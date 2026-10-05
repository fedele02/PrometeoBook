import type { Metadata } from "next";
import { getPublicContent } from "@/lib/data";
import { MenuView } from "@/components/menu/MenuView";
import { MotionProvider } from "@/components/motion/Reveal";
import { Emblem, Ornament, Wordmark } from "@/components/Logo";

/**
 * The menu opened from the QR code on the tables: guests are already
 * seated, so there is no booking button, navigation or call bar.
 */
export const metadata: Metadata = {
  title: "Menu",
  robots: { index: false, follow: false },
};

export default async function TableMenuPage() {
  const { settings, menu } = await getPublicContent();

  return (
    <MotionProvider>
      <header className="bg-ink px-6 pb-8 pt-[calc(env(safe-area-inset-top)+2.5rem)] text-center">
        <div className="flex flex-col items-center text-gold">
          <Emblem className="h-12 w-auto" />
          <Wordmark className="mt-4 h-5 w-auto" />
          <span className="font-display mt-2 text-[0.6rem] tracking-[0.55em]">FINE DINING</span>
        </div>
        <h1 className="caps mt-10 text-[2.6rem] text-cream">Menu</h1>
        <Ornament align="center" className="mt-4" />
        <p className="mt-4 font-serif text-xl italic text-cream/75">Buon appetito</p>
      </header>

      <main>
        {menu.categories.length ? (
          <MenuView categories={menu.categories} dishes={menu.dishes} stickyTop="top-0" />
        ) : (
          <p className="px-6 py-24 text-center text-cream/60">Il menu è in aggiornamento.</p>
        )}
      </main>

      <footer className="px-6 pb-[calc(env(safe-area-inset-bottom)+3rem)] pt-16 text-center">
        <p className="mx-auto max-w-sm text-sm leading-relaxed text-cream/60">
          Allergie o intolleranze? Chiedi al personale di sala: ti indicheremo gli allergeni di ogni piatto.
        </p>
        <p className="caps mx-auto mt-10 max-w-xs text-[0.95rem] leading-snug tracking-[0.08em] text-gold">{settings.tagline}</p>
        <p className="mt-8 text-xs text-muted">
          {settings.name} {settings.subtitle} · {settings.address}, {settings.city}
        </p>
      </footer>
    </MotionProvider>
  );
}
