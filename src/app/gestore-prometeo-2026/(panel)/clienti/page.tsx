import Link from "next/link";
import { birthdayLabel, inviteDates, nextOccurrence, offerValidity, promiseOf } from "@/lib/birthday";
import { repo } from "@/lib/data";
import { logError } from "@/lib/errors";
import { birthdayText } from "@/lib/messages";
import { groupCustomers, isActive, type Customer } from "@/lib/customers";
import { telHref, whatsappHref } from "@/lib/site";
import { addDays, capitalize, formatDateLong, romeNow, serviceLabel, TZ } from "@/lib/time";
import { Card, PageTitle } from "@/components/admin/ui";
import { STATUS } from "@/components/admin/status";
import { IconChevron, IconGift, IconPhone, IconUsers, IconWhatsapp } from "@/components/Icons";
import { RemoveBirthday } from "@/components/admin/RemoveBirthday";
import type { BirthdayContact, Booking, Settings } from "@/lib/types";

export const metadata = { title: "Clienti" };

const created = new Intl.DateTimeFormat("it-IT", { timeZone: TZ, day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

export default async function CustomersPage({ searchParams }: PageProps<"/gestore-prometeo-2026/clienti">) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const tel = typeof sp.tel === "string" ? sp.tel.replace(/\D/g, "") : "";
  const today = romeNow().date;

  const r = repo();
  const [all, settings, birthdays] = await Promise.all([
    r.listBookings("2000-01-01", addDays(today, 400)),
    r.getSettings(),
    // the table exists only after the 2026-10-25 migration
    r.listBirthdays().catch(async (e) => {
      await logError("Compleanni non letti", e);
      return [] as BirthdayContact[];
    }),
  ]);
  const customers = groupCustomers(all, today);

  if (tel) {
    const c = customers.find((x) => x.key === tel);
    return c ? <Detail c={c} today={today} birthday={birthdays.find((x) => x.phone_key === c.key) ?? null} /> : <NotFound />;
  }

  const digits = q.replace(/\D/g, "");
  const needle = q.toLowerCase();
  const list = q
    ? customers.filter((c) => (digits.length >= 3 && c.key.includes(digits)) || c.bookings.some((b) => b.name.toLowerCase().includes(needle)))
    : customers;

  return (
    <>
      <PageTitle title="Clienti" subtitle="Lo storico delle prenotazioni, raggruppato per numero di telefono" />

      <form role="search" className="flex gap-2">
        <label htmlFor="q" className="sr-only">
          Cerca per nome o telefono
        </label>
        <input id="q" name="q" type="search" defaultValue={q} placeholder="Nome o telefono" className="input !min-h-12 !text-base flex-1" />
        <button className="btn btn-gold min-h-12 px-5 text-sm">Cerca</button>
      </form>

      {!q && <UpcomingBirthdays list={birthdays} settings={settings} today={today} known={new Set(customers.map((c) => c.key))} bookings={all} />}

      <p className="mt-4 text-sm text-cream/60">
        {q ? `${plural(list.length, "risultato", "risultati")} per “${q}”` : `${plural(customers.length, "cliente", "clienti")} in totale`}
        {q && (
          <>
            {" · "}
            <Link href="/gestore-prometeo-2026/clienti" className="font-semibold text-cream underline underline-offset-4">
              mostra tutti
            </Link>
          </>
        )}
      </p>

      {list.length === 0 ? (
        <Card className="mt-4">
          <p className="text-cream/60">{q ? "Nessun cliente trovato." : "Ancora nessuna prenotazione."}</p>
        </Card>
      ) : (
        <ul className="mt-4 space-y-3">
          {list.map((c) => (
            <li key={c.key}>
              <Link
                href={`/gestore-prometeo-2026/clienti?tel=${c.key}`}
                className="flex items-center gap-4 rounded-lg border border-white/[0.07] bg-ink-2 p-4 transition hover:border-gold/40 md:p-5"
              >
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gold/15 text-lg font-bold text-gold-light">{c.total}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-lg font-semibold">{c.name}</span>
                  <span className="block text-cream/70">{c.phone}</span>
                  <span className="mt-1 block text-sm text-cream/60">
                    Ultima: {formatDateLong(c.last)}
                    {c.next && c.next !== c.last && ` · prossima: ${formatDateLong(c.next)}`}
                    {c.lost > 0 && ` · ${plural(c.lost, "annullata o rifiutata", "annullate o rifiutate")}`}
                  </span>
                </span>
                <IconChevron className="h-5 w-5 shrink-0 text-cream/40" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

const daysBetween = (a: string, b: string) => Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 864e5);
const when = (n: number) => (n === 0 ? "oggi" : n === 1 ? "domani" : n > 1 ? `tra ${n} giorni` : n === -1 ? "ieri" : `${-n} giorni fa`);

/**
 * Next 30 days (and birthdays whose link still works): who has a birthday, whether the
 * guest booked with the link, whether the wishes went out, and a way to send them by hand.
 */
function UpcomingBirthdays({
  list,
  settings,
  today,
  known,
  bookings,
}: {
  list: BirthdayContact[];
  settings: Settings;
  today: string;
  known: Set<string>;
  bookings: Booking[];
}) {
  const soon = list
    .map((c) => {
      // the link's birthday while its days are not over, otherwise the next one
      const linkOpen = inviteDates(settings, c).length > 0;
      return { c, next: linkOpen ? c.invite_for! : nextOccurrence(c.birthday, today) };
    })
    .filter((x) => daysBetween(today, x.next) <= 30)
    .sort((a, b) => a.next.localeCompare(b.next));
  if (!soon.length) return null;
  return (
    <Card className="mt-5">
      <h2 id="compleanni" className="flex scroll-mt-24 items-center gap-2 text-[0.7rem] font-bold uppercase tracking-[0.22em] text-gold">
        <IconGift className="h-4 w-4" /> Compleanni in arrivo · {soon.length}
      </h2>
      <ul className="mt-3 divide-y divide-white/[0.06]">
        {soon.map(({ c, next }) => {
          const sent = c.last_sent_for === next;
          const code = c.invite_for === next ? c.invite_code : null;
          const booked = code && c.invite_booking_id ? bookings.find((b) => b.id === c.invite_booking_id && isActive(b)) : undefined;
          const sendFrom = addDays(next, -settings.birthday.daysBefore);
          // what the wishes promised: the staff answers the guests who call with these
          const terms = code ? promiseOf(settings, c) : null;
          return (
            <li key={c.phone_key} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3">
              <span className="min-w-0 flex-1">
                {known.has(c.phone_key) ? (
                  <Link href={`/gestore-prometeo-2026/clienti?tel=${c.phone_key}`} className="font-semibold underline-offset-4 hover:underline">
                    {c.name}
                  </Link>
                ) : (
                  <span className="font-semibold">{c.name}</span>
                )}
                <span className="block text-sm text-cream/60">
                  {birthdayLabel(c.birthday)} · {when(daysBetween(today, next))}
                  {sent && !c.last_error && " · auguri inviati"}
                  {!code && ` · link e auguri dal ${formatDateLong(sendFrom).replace(/^\S+ /, "")}`}
                </span>
                {booked && (
                  <span className="block text-sm font-semibold text-gold-light">
                    Ha prenotato col link: {formatDateLong(booked.date)}, ore {booked.time}
                  </span>
                )}
                {terms && !booked && (
                  <span className="block text-sm text-cream/60">
                    Offerta{terms.offerIt && ` (${terms.offerIt})`} valida per una prenotazione {offerValidity(terms.dates, next, "it")}
                  </span>
                )}
                {sent && c.last_error && <span className="block text-sm text-ember">Auguri non inviati: {c.last_error}</span>}
              </span>
              {code && terms && !booked && (!sent || c.last_error) && (
                <a href={whatsappHref(c.phone, birthdayText(c.name, next, terms, settings, code))} target="_blank" rel="noopener" className="btn btn-line min-h-11 px-4 text-xs">
                  <IconWhatsapp className="h-4 w-4" /> Invia a mano
                </a>
              )}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

function Detail({ c, today, birthday }: { c: Customer; today: string; birthday: BirthdayContact | null }) {
  const names = [...new Set(c.bookings.map((b) => b.name.trim()))];
  const stats = [
    { label: "Prenotazioni", value: c.total },
    { label: "Coperti", value: c.covers },
    { label: "Dal sito", value: c.fromWeb },
    { label: "Annullate o rifiutate", value: c.lost },
  ];

  return (
    <>
      <Link href="/gestore-prometeo-2026/clienti" className="mb-4 inline-flex min-h-10 items-center gap-1 text-sm font-semibold text-cream/70 hover:text-cream">
        <IconChevron dir="left" className="h-4 w-4" /> Tutti i clienti
      </Link>
      <PageTitle title={c.name} subtitle={c.phone}>
        <a href={telHref(c.phone)} className="btn btn-line min-h-10 px-4 text-sm">
          <IconPhone className="h-4 w-4" /> Chiama
        </a>
        <a href={whatsappHref(c.phone)} target="_blank" rel="noopener" className="btn btn-line min-h-10 px-4 text-sm">
          <IconWhatsapp className="h-4 w-4" /> WhatsApp
        </a>
      </PageTitle>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="!p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">{s.label}</p>
            <p className="mt-1 text-2xl font-bold">{s.value}</p>
          </Card>
        ))}
      </div>

      <p className="mt-4 text-sm text-cream/60">
        Cliente dal {formatDateLong(c.first)} {c.first.slice(0, 4)}
        {names.length > 1 && ` · nomi usati: ${names.join(", ")}`}
      </p>

      {birthday && (
        <Card className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center">
          <span className="flex min-w-0 flex-1 items-start gap-4">
            <IconGift className="h-6 w-6 shrink-0 text-gold" />
            <span className="min-w-0 flex-1">
              <span className="block font-semibold">Compleanno: {birthdayLabel(birthday.birthday)}</span>
              <span className="block text-sm text-cream/60">
                Consenso agli auguri su WhatsApp dato il {created.format(new Date(birthday.consent_at))}
                {birthday.last_sent_for && ` · ultimi auguri: ${formatDateLong(birthday.last_sent_for)} ${birthday.last_sent_for.slice(0, 4)}`}
              </span>
            </span>
          </span>
          <RemoveBirthday phoneKey={birthday.phone_key} />
        </Card>
      )}

      <h2 className="mb-3 mt-8 font-display text-sm tracking-[0.2em] text-cream/60">STORICO</h2>
      <ul className="space-y-3">
        {c.bookings.map((b) => {
          const st = STATUS[b.status];
          return (
            <li key={b.id}>
              <Link
                href={b.date === today ? "/gestore-prometeo-2026" : `/gestore-prometeo-2026?date=${b.date}`}
                className={`block rounded-lg border border-white/[0.07] bg-ink-2 p-4 transition hover:border-gold/40 md:p-5 ${isActive(b) ? "" : "opacity-60"}`}
              >
                <span className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">
                    {capitalize(formatDateLong(b.date))} {b.date.slice(0, 4)}
                  </span>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${st.cls}`}>{st.label}</span>
                  {b.date >= today && isActive(b) && (
                    <span className="rounded-full bg-gold/15 px-2.5 py-0.5 text-xs font-semibold text-gold-light">in arrivo</span>
                  )}
                </span>
                <span className="mt-1 flex flex-wrap items-center gap-x-3 text-cream/70">
                  <span>
                    {serviceLabel(b.time)} · ore {b.time}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <IconUsers className="h-4 w-4" /> {b.people}
                  </span>
                  <span>{b.source === "web" ? "dal sito" : "telefonica"}</span>
                </span>
                {b.name.trim() !== c.name.trim() && <span className="mt-1 block text-sm text-cream/60">a nome di {b.name}</span>}
                {b.notes && <span className="mt-2 block rounded-xl bg-white/[0.04] px-3 py-2 text-sm text-cream/80">“{b.notes}”</span>}
                <span className="mt-2 block text-xs text-cream/50">Ricevuta il {created.format(new Date(b.created_at))}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}

function NotFound() {
  return (
    <>
      <PageTitle title="Cliente non trovato" />
      <Card>
        <p className="text-cream/60">Nessuna prenotazione con questo numero.</p>
        <Link href="/gestore-prometeo-2026/clienti" className="mt-3 inline-block font-semibold text-gold-light underline underline-offset-4">
          Torna ai clienti
        </Link>
      </Card>
    </>
  );
}
