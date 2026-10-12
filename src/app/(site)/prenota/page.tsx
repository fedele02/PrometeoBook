import type { Metadata } from "next";
import Link from "next/link";
import { getPublicContent } from "@/lib/data";
import { telHref } from "@/lib/site";
import { BookingWizard } from "@/components/booking/BookingWizard";
import { MyBookings } from "@/components/booking/MyBookings";

export const metadata: Metadata = {
  title: "Prenota un tavolo",
  description: "Prenota il tuo tavolo al Prometeo Fine Dining di Matera: scegli persone, giorno e orario.",
};

export default async function BookingPage() {
  const { settings } = await getPublicContent();

  return (
    <section className="min-h-dvh bg-paper px-4 pb-20 pt-[calc(var(--header-h,4rem)+2rem)] text-ink md:pt-[calc(var(--header-h,5rem)+3.5rem)]">
      <div className="mx-auto max-w-xl">
        <h1 className="caps text-center text-[2.1rem] md:text-[2.8rem]">Prenota un tavolo</h1>
        <p className="mt-2 text-center text-ink/60">
          {settings.address}, {settings.city}
        </p>

        <div className="mt-8">
          <MyBookings />
          {settings.booking.enabled ? (
            <BookingWizard settings={settings} />
          ) : (
            <div className="border border-ink/15 bg-white p-8 text-center">
              <p className="text-xl">Le prenotazioni online sono momentaneamente sospese.</p>
              <p className="mt-2 text-ink/60">Contattaci direttamente: saremo felici di accoglierti.</p>
              {settings.phone && (
                <a href={telHref(settings.phone)} className="btn btn-dark mt-6 w-full">
                  Chiama {settings.phone}
                </a>
              )}
              <Link href="/" className="mt-4 inline-block text-ink/60 underline underline-offset-4">
                Torna alla home
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
