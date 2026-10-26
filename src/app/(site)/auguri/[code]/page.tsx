import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { birthdayLabel, offerValidity } from "@/lib/birthday";
import { findInvite } from "@/lib/birthday-booking";
import { getPublicContent } from "@/lib/data";
import { blocked, clientIp, miss } from "@/lib/guess-guard";
import { birthdayPhone } from "@/lib/messages";
import { telHref } from "@/lib/site";
import { capitalize, formatDateLong } from "@/lib/time";
import { isWhatsappAuto } from "@/lib/whatsapp";
import { BookingWizard } from "@/components/booking/BookingWizard";
import { IconGift, IconPhone } from "@/components/Icons";

export const metadata: Metadata = {
  title: "Prenota il tuo compleanno",
  robots: { index: false, follow: false },
};

/**
 * The guest's birthday link, sent with the wishes: /auguri/K7M2QX9T. Books only around
 * the birthday with the birthday offer (no other promotion). Nothing shows in Gestione
 * until the guest confirms here. Reading the request headers keeps it dynamic: the link's
 * days depend on today.
 */
export default async function BirthdayLinkPage({ params }: PageProps<"/auguri/[code]">) {
  const ip = await clientIp();
  if (blocked(ip)) notFound();
  const { settings } = await getPublicContent();
  const invite = await findInvite((await params).code, settings);
  if (!invite) {
    miss(ip);
    notFound();
  }

  const firstName = invite.contact.name.trim().split(/\s+/)[0];
  // what the wishes promised, not today's settings
  const offer = invite.state === "open" ? invite.terms.offerIt || invite.terms.offerEn : "";
  const validity = invite.state === "open" ? offerValidity(invite.terms.dates, invite.birthday, "tu") : "";
  const phone = birthdayPhone(settings);

  return (
    <section className="min-h-dvh bg-paper px-4 pb-20 pt-[calc(var(--header-h,4rem)+2rem)] text-ink md:pt-[calc(var(--header-h,5rem)+3.5rem)]">
      <div className="mx-auto max-w-xl">
        <p className="flex justify-center text-gold-deep">
          <IconGift className="h-8 w-8" />
        </p>
        <h1 className="caps mt-3 text-center text-[2.1rem] md:text-[2.8rem]">Buon compleanno, {firstName}</h1>
        <p className="mt-2 text-center text-ink/60">
          Il tuo compleanno è il {birthdayLabel(invite.contact.birthday)}: festeggialo da {settings.name}.
        </p>
        {invite.state === "open" && (
          <p className="mt-1 text-center text-ink/60">
            La tua offerta{offer && ` (${offer})`} è valida per una prenotazione {validity}.
          </p>
        )}

        <div className="mt-8">
          {invite.state === "open" && (
            <BookingWizard
              settings={settings}
              whatsappAuto={isWhatsappAuto(settings)}
              birthday={{
                code: invite.contact.invite_code!,
                birthday: invite.birthday,
                dates: invite.dates,
                name: invite.contact.name,
                phone: invite.contact.phone,
                offer,
                validity,
              }}
            />
          )}

          {invite.state === "booked" && (
            <div className="border border-ink/15 bg-white p-6 sm:p-8">
              <p className="text-xl font-semibold">Hai già prenotato con questo link</p>
              <p className="mt-2 text-ink/70">
                {capitalize(formatDateLong(invite.booking.date))}, ore {invite.booking.time}, {invite.booking.people}{" "}
                {invite.booking.people === 1 ? "persona" : "persone"}.
              </p>
              <p className="mt-2 text-ink/70">
                {invite.booking.status === "confirmed"
                  ? "La prenotazione è confermata: ti aspettiamo."
                  : "È una richiesta: il tavolo è tuo dopo la nostra conferma su WhatsApp."}
              </p>
              <Link
                href={invite.booking.short_code ? `/p/${invite.booking.short_code}` : `/prenotazione/${invite.booking.manage_token}`}
                className="btn btn-dark mt-6 w-full"
              >
                Vedi o modifica la prenotazione
              </Link>
            </div>
          )}

          {invite.state === "expired" && (
            <div className="border border-ink/15 bg-white p-6 sm:p-8">
              <p className="text-xl font-semibold">Questo link non è più valido</p>
              <p className="mt-2 text-ink/70">I giorni per prenotare con l&apos;offerta di compleanno sono passati. Se vuoi festeggiare con noi, chiamaci.</p>
              {phone && (
                <a href={telHref(phone)} className="btn btn-dark mt-6 w-full">
                  <IconPhone className="h-5 w-5" /> Chiama {phone}
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
