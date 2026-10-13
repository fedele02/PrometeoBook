import { guestCanManage } from "@/lib/customers";
import type { Booking, Settings } from "@/lib/types";
import { ManageBooking } from "./ManageBooking";

/** The guest's private page, at /p/<short code> (the link in the messages) and /prenotazione/<token>. */
export function GuestBookingSection({ booking, settings }: { booking: Booking; settings: Settings }) {
  return (
    <section className="min-h-dvh bg-paper px-4 pb-20 pt-[calc(var(--header-h,4rem)+2rem)] text-ink md:pt-[calc(var(--header-h,5rem)+3.5rem)]">
      <div className="mx-auto max-w-xl">
        <h1 className="caps text-center text-[2.1rem] md:text-[2.8rem]">La tua prenotazione</h1>
        <p className="mt-2 text-center text-ink/60">
          {settings.name} {settings.subtitle} · {settings.address}, {settings.city}
        </p>
        <div className="mt-8">
          <ManageBooking
            token={booking.manage_token}
            settings={settings}
            booking={{ date: booking.date, time: booking.time, people: booking.people, name: booking.name, phone: booking.phone, notes: booking.notes, status: booking.status }}
            canManage={guestCanManage(booking, settings)}
          />
        </div>
      </div>
    </section>
  );
}
