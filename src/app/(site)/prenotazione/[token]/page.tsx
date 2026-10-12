import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { guestCanManage } from "@/lib/customers";
import { getPublicContent, repo } from "@/lib/data";
import { ManageBooking } from "@/components/booking/ManageBooking";

export const metadata: Metadata = {
  title: "La tua prenotazione",
  robots: { index: false, follow: false },
};

/** The guest's private page: reached from the WhatsApp confirmation or the booking summary. */
export default async function GuestBookingPage({ params }: PageProps<"/prenotazione/[token]">) {
  const { token } = await params;
  const [{ settings }, booking] = await Promise.all([getPublicContent(), repo().getBookingByToken(token)]);
  if (!booking) notFound();

  return (
    <section className="min-h-dvh bg-paper px-4 pb-20 pt-[calc(var(--header-h,4rem)+2rem)] text-ink md:pt-[calc(var(--header-h,5rem)+3.5rem)]">
      <div className="mx-auto max-w-xl">
        <h1 className="caps text-center text-[2.1rem] md:text-[2.8rem]">La tua prenotazione</h1>
        <p className="mt-2 text-center text-ink/60">
          {settings.name} {settings.subtitle} · {settings.address}, {settings.city}
        </p>
        <div className="mt-8">
          <ManageBooking
            token={token}
            settings={settings}
            booking={{ date: booking.date, time: booking.time, people: booking.people, name: booking.name, phone: booking.phone, notes: booking.notes, status: booking.status }}
            canManage={guestCanManage(booking, settings)}
          />
        </div>
      </div>
    </section>
  );
}
