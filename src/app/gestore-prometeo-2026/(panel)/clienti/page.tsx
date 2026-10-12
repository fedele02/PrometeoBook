import Link from "next/link";
import { repo } from "@/lib/data";
import { groupCustomers, isActive, type Customer } from "@/lib/customers";
import { telHref, whatsappHref } from "@/lib/site";
import { addDays, capitalize, formatDateLong, romeNow, serviceLabel, TZ } from "@/lib/time";
import { Card, PageTitle } from "@/components/admin/ui";
import { STATUS } from "@/components/admin/status";
import { IconChevron, IconPhone, IconUsers, IconWhatsapp } from "@/components/Icons";

export const metadata = { title: "Clienti" };

const created = new Intl.DateTimeFormat("it-IT", { timeZone: TZ, day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

export default async function CustomersPage({ searchParams }: PageProps<"/gestore-prometeo-2026/clienti">) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const tel = typeof sp.tel === "string" ? sp.tel.replace(/\D/g, "") : "";
  const today = romeNow().date;

  const all = await repo().listBookings("2000-01-01", addDays(today, 400));
  const customers = groupCustomers(all, today);

  if (tel) {
    const c = customers.find((x) => x.key === tel);
    return c ? <Detail c={c} today={today} /> : <NotFound />;
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

function Detail({ c, today }: { c: Customer; today: string }) {
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
