import type { Metadata } from "next";
import Link from "next/link";
import { getPublicContent } from "@/lib/data";
import { MenuView } from "@/components/menu/MenuView";
import { Ornament } from "@/components/Logo";

export const metadata: Metadata = {
  title: "Menu",
  description: "Il menu del Prometeo Fine Dining di Matera: antipasti, primi, secondi e dolci. Cucina tradizionale lucana rivisitata.",
};

export default async function MenuPage() {
  const { settings, menu } = await getPublicContent();

  return (
    <>
      <section className="bg-ink px-6 pb-10 pt-32 text-center md:pb-14 md:pt-44">
        <p className="label text-[0.7rem] text-muted">Prometeo Fine Dining</p>
        <h1 className="caps mt-4 text-[3.2rem] text-gold md:text-[5rem]">Menu</h1>
        <Ornament align="center" className="mt-5" />
        <p className="mt-5 font-serif text-xl italic text-cream/80">Cucina tradizionale rivisitata</p>
      </section>

      {menu.categories.length ? (
        <MenuView categories={menu.categories} dishes={menu.dishes} />
      ) : (
        <p className="px-6 py-24 text-center text-cream/60">Il menu è in aggiornamento.</p>
      )}

      <section className="px-6 pb-32 pt-16 text-center md:pb-24">
        <p className="mx-auto max-w-md text-sm text-muted">
          Allergie o intolleranze? Comunicacele al momento della prenotazione o chiedi al personale di sala.
        </p>
        {settings.booking.enabled && (
          <Link href="/prenota" className="btn btn-gold mt-8">
            Prenota un tavolo
          </Link>
        )}
      </section>
    </>
  );
}
