"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState, useTransition } from "react";
import { getAvailability, submitBooking, type Availability } from "@/app/(site)/prenota/actions";
import { telHref } from "@/lib/site";
import { addDays, capitalize, dateParts, dayState, formatDateLong, romeNow } from "@/lib/time";
import type { OnlineStatus, Settings } from "@/lib/types";
import { onlineStatus } from "@/lib/customers";
import { IconCalendar, IconCheck, IconClock, IconUser, IconUsers, IconWhatsapp } from "../Icons";
import { Calendar } from "./Calendar";
import { Choice, ErrorBox, Field, MorePeople, Slots, Title } from "./parts";
import { downloadIcs } from "./ics";
import { rememberBooking } from "@/lib/guest-bookings";

type Step = 0 | 1 | 2 | 3;
const SAVED = "prometeo:guest";

/** Returning guests find name and phone already filled in. */
function savedGuest(): { name: string; phone: string } {
  try {
    if (typeof window !== "undefined") {
      const g = JSON.parse(localStorage.getItem(SAVED) ?? "null");
      if (g) return { name: String(g.name ?? ""), phone: String(g.phone ?? "") };
    }
  } catch {}
  return { name: "", phone: "" };
}

const shortDate = (d: string) => {
  const p = dateParts(d);
  return `${p.wd} ${p.day} ${p.month}`;
};

/** `whatsappAuto`: the guest gets an automatic "request received" message on WhatsApp. */
export function BookingWizard({ settings, whatsappAuto = false }: { settings: Settings; whatsappAuto?: boolean }) {
  const max = settings.booking.maxPartySize;
  const [step, setStep] = useState<Step>(0);
  const [dir, setDir] = useState(1);
  // Rome date from the browser clock (the page itself is cached).
  // Not rendered on the first step, so server and client markup match.
  const [today] = useState(() => romeNow().date);

  const [people, setPeople] = useState<number | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [name, setName] = useState(() => savedGuest().name);
  const [phone, setPhone] = useState(() => savedGuest().phone);
  const [notes, setNotes] = useState("");
  const [privacy, setPrivacy] = useState(false);
  const [hp, setHp] = useState("");
  // small parties are confirmed at once: the button and its note say so
  const instant = people !== null && onlineStatus(settings, people) === "confirmed";

  const [avail, setAvail] = useState<Availability | null>(null);
  const [error, setError] = useState<{ msg: string; field?: string } | null>(null);
  // private link token of the request just sent ("" when dropped as spam)
  const [done, setDone] = useState<string | null>(null);
  // confirmed at once (small party) or a request for the staff
  const [doneStatus, setDoneStatus] = useState<OnlineStatus>("pending");
  const [pending, startTransition] = useTransition();
  const top = useRef<HTMLDivElement>(null);

  const go = (s: Step) => {
    setDir(s > step ? 1 : -1);
    setError(null);
    setStep(s);
    top.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const loadSlots = (d: string, p: number) => {
    setAvail(null);
    startTransition(async () => setAvail(await getAvailability(d, p)));
  };

  const pickPeople = (n: number) => {
    setPeople(n);
    setTime(null);
    if (date) loadSlots(date, n);
    setTimeout(() => go(date ? 2 : 1), 150);
  };
  const pickDate = (d: string) => {
    setDate(d);
    setTime(null);
    loadSlots(d, people!);
    setTimeout(() => go(2), 150);
  };
  const pickTime = (t: string) => {
    setTime(t);
    setTimeout(() => go(3), 150);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) return setError({ msg: "Scrivi il tuo nome, per favore.", field: "name" });
    if (phone.replace(/\D/g, "").length < 6) return setError({ msg: "Scrivi un numero di telefono valido.", field: "phone" });
    if (!privacy) return setError({ msg: "Spunta la casella del consenso per continuare.", field: "privacy" });
    setError(null);
    startTransition(async () => {
      const res = await submitBooking({ date: date!, time: time!, people: people!, name, phone, notes, privacy: true, website: hp });
      if (res.ok) {
        try {
          localStorage.setItem(SAVED, JSON.stringify({ name, phone }));
        } catch {}
        if (res.token) rememberBooking({ token: res.token, date: date!, time: time!, people: people! });
        setDoneStatus(res.status);
        setDone(res.token);
        top.current?.scrollIntoView({ behavior: "smooth" });
      } else if (res.slotFull) {
        setTime(null);
        loadSlots(date!, people!);
        go(2);
        setError({ msg: res.error });
      } else setError({ msg: res.error, field: res.field });
    });
  };

  if (done !== null)
    return (
      <Done
        token={done}
        status={doneStatus}
        settings={settings}
        whatsappAuto={whatsappAuto}
        summary={{ date: date!, time: time!, people: people!, name: name.trim(), phone: phone.trim(), notes: notes.trim() }}
        onAgain={() => {
          setDone(null);
          setTime(null);
          setDate(null);
          setPeople(null);
          setStep(0);
        }}
      />
    );

  // TheFork-style summary tabs: what you chose, tap to change it
  const tabs = [
    { icon: IconUsers, label: "Persone", value: people ? `${people} ${people === 1 ? "persona" : "persone"}` : null, step: 0 as Step },
    { icon: IconCalendar, label: "Data", value: date ? shortDate(date) : null, step: 1 as Step },
    { icon: IconClock, label: "Ora", value: time, step: 2 as Step },
  ];

  return (
    <div ref={top} className="scroll-mt-[calc(var(--header-h,4rem)+1rem)] border border-ink/15 bg-white">
      <div className="grid grid-cols-3 border-b border-ink/15" role="tablist" aria-label="La tua prenotazione">
        {tabs.map((t, i) => {
          const current = step === t.step;
          const reachable = t.step === 0 || (t.step === 1 && !!people) || (t.step === 2 && !!people && !!date);
          return (
            <button
              key={t.label}
              role="tab"
              aria-selected={current}
              disabled={!reachable}
              onClick={() => go(t.step)}
              className={`relative flex flex-col items-center gap-1 px-1 py-4 ${i > 0 ? "border-l border-ink/10" : ""} ${
                current ? "text-ink" : t.value ? "text-ink/80" : "text-ink/35"
              }`}
            >
              <t.icon className="h-5 w-5" />
              <span className="text-[0.7rem] font-semibold uppercase tracking-[0.14em]">{t.label}</span>
              <span className="min-h-6 text-[0.95rem] font-semibold">{t.value ?? "—"}</span>
              <span className={`absolute inset-x-0 bottom-0 h-[3px] ${current ? "bg-gold-deep" : "bg-transparent"}`} />
            </button>
          );
        })}
      </div>

      <div className="relative overflow-hidden p-5 sm:p-7">
        <AnimatePresence mode="wait" custom={dir} initial={false}>
          <motion.div
            key={step}
            initial={{ opacity: 0, x: dir * 28 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir * -28 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            {step === 0 && (
              <>
                <Title>Quante persone?</Title>
                <div className="mt-5 grid grid-cols-4 gap-2.5">
                  {Array.from({ length: Math.min(8, max) }, (_, i) => i + 1).map((n) => (
                    <Choice key={n} selected={people === n} onClick={() => pickPeople(n)} className="aspect-square text-[1.6rem] sm:aspect-auto sm:h-20">
                      {n}
                    </Choice>
                  ))}
                </div>
                {max > 8 && <MorePeople max={max} value={people} onPick={pickPeople} />}
                <p className="mt-5 text-ink/60">
                  Siete più di {max}?{" "}
                  {settings.phone ? (
                    <a href={telHref(settings.phone)} className="font-semibold text-ink underline underline-offset-4">
                      Chiamaci
                    </a>
                  ) : (
                    "Contattaci"
                  )}{" "}
                  e organizziamo insieme.
                </p>
              </>
            )}

            {step === 1 && (
              <>
                <Title>Quale giorno?</Title>
                <div className="mt-5 grid grid-cols-2 gap-2.5">
                  {[today, addDays(today, 1)].map((d, i) => {
                    const closed = dayState(settings, d).closed;
                    return (
                      <Choice key={d} disabled={closed} selected={date === d} onClick={() => pickDate(d)} className="flex-col py-4">
                        <span className="text-xl">{i === 0 ? "Oggi" : "Domani"}</span>
                        <span className="text-sm font-medium opacity-70">{closed ? "chiuso" : shortDate(d)}</span>
                      </Choice>
                    );
                  })}
                </div>
                <div className="my-6 flex items-center gap-3 text-sm text-ink/50">
                  <span className="h-px flex-1 bg-ink/15" /> oppure scegli dal calendario <span className="h-px flex-1 bg-ink/15" />
                </div>
                <Calendar settings={settings} today={today} value={date} onPick={pickDate} />
              </>
            )}

            {step === 2 && date && (
              <>
                <Title>A che ora?</Title>
                <p className="mt-1 text-ink/60">{capitalize(formatDateLong(date))}</p>
                {error && <ErrorBox>{error.msg}</ErrorBox>}
                <Slots avail={avail} loading={pending} time={time} onPick={pickTime} onChangeDay={() => go(1)} phone={settings.phone} />
              </>
            )}

            {step === 3 && date && time && people && (
              <form onSubmit={submit} noValidate>
                <Title>I tuoi dati</Title>
                <p className="mt-1 text-ink/60">
                  {capitalize(formatDateLong(date))}, ore {time}, {people} {people === 1 ? "persona" : "persone"}
                </p>

                <Field label="Nome e cognome" error={error?.field === "name"}>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                    autoCapitalize="words"
                    enterKeyHint="next"
                    className="input input-paper"
                  />
                </Field>
                <Field label="Telefono (WhatsApp)" hint="Ti invieremo qui la conferma su WhatsApp." error={error?.field === "phone"}>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    enterKeyHint="done"
                    placeholder="es. 333 123 4567"
                    className="input input-paper"
                  />
                </Field>
                <Field label="Richieste particolari" hint="Facoltativo: allergie, seggiolone, un compleanno…">
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    maxLength={500}
                    rows={2}
                    className="input input-paper min-h-24 py-3"
                  />
                </Field>

                {/* honeypot */}
                <input
                  tabIndex={-1}
                  autoComplete="off"
                  value={hp}
                  onChange={(e) => setHp(e.target.value)}
                  name="website"
                  className="absolute -left-[9999px] h-0 w-0 opacity-0"
                  aria-hidden
                />

                <label className={`mt-6 flex cursor-pointer items-start gap-4 border p-4 ${error?.field === "privacy" ? "border-ember" : "border-ink/15"}`}>
                  <input type="checkbox" checked={privacy} onChange={(e) => setPrivacy(e.target.checked)} className="peer sr-only" />
                  <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center border-2 border-ink/40 text-cream transition peer-checked:border-ink peer-checked:bg-ink peer-focus-visible:ring-2 peer-focus-visible:ring-gold">
                    {privacy && <IconCheck className="h-5 w-5" strokeWidth={3} />}
                  </span>
                  <span className="leading-snug text-ink/80">
                    Acconsento all&apos;uso dei miei dati solo per gestire questa prenotazione e a ricevere su WhatsApp i messaggi che la riguardano (
                    <Link href="/privacy" target="_blank" className="underline underline-offset-2">
                      informativa
                    </Link>
                    ).
                  </span>
                </label>

                {error && <ErrorBox>{error.msg}</ErrorBox>}

                <button type="submit" disabled={pending} className="btn btn-dark mt-6 min-h-16 w-full text-[0.95rem] tracking-[0.1em] disabled:opacity-60">
                  {pending ? "Invio in corso…" : instant ? "Conferma prenotazione" : "Invia richiesta"}
                </button>
                <p className="mt-3 text-center text-[0.95rem] text-ink/60">
                  {instant ? "La prenotazione è confermata subito." : "Il tavolo è tuo dopo la nostra conferma su WhatsApp."}
                </p>
              </form>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Done({
  token,
  status,
  settings,
  whatsappAuto,
  summary,
  onAgain,
}: {
  token: string;
  status: OnlineStatus;
  settings: Settings;
  whatsappAuto: boolean;
  summary: { date: string; time: string; people: number; name: string; phone: string; notes: string };
  onAgain: () => void;
}) {
  const firstName = summary.name.split(" ")[0];
  const confirmed = status === "confirmed";
  const rows = [
    { icon: IconCalendar, label: "Giorno", value: capitalize(formatDateLong(summary.date)) },
    { icon: IconClock, label: "Ora", value: summary.time },
    { icon: IconUsers, label: "Persone", value: `${summary.people} ${summary.people === 1 ? "persona" : "persone"}` },
    { icon: IconUser, label: "A nome di", value: summary.name },
    { icon: IconWhatsapp, label: "WhatsApp", value: summary.phone },
  ];
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="border border-ink/15 bg-white p-6 sm:p-8"
      role="status"
    >
      {confirmed ? (
        <>
          <p className="inline-flex items-center gap-2 rounded-full bg-ok/15 px-3 py-1 text-sm font-semibold text-ink">
            <span className="h-2 w-2 rounded-full bg-ok" aria-hidden />
            Confermata
          </p>
          <h2 className="mt-4 text-[1.7rem] font-semibold leading-tight">Prenotazione confermata</h2>
          <p className="mt-2 text-lg text-ink/70">Grazie {firstName}, ti aspettiamo al ristorante.</p>
        </>
      ) : (
        <>
          <p className="inline-flex items-center gap-2 rounded-full bg-ember/15 px-3 py-1 text-sm font-semibold text-ink">
            <span className="h-2 w-2 rounded-full bg-ember" aria-hidden />
            In attesa di conferma
          </p>
          <h2 className="mt-4 text-[1.7rem] font-semibold leading-tight">Richiesta inviata</h2>
          <p className="mt-2 text-lg text-ink/70">Grazie {firstName}, ecco il riepilogo della tua richiesta.</p>
        </>
      )}

      <dl className="mt-6 divide-y divide-ink/10 border-y border-ink/15">
        {rows.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-4 py-3">
            <Icon className="h-5 w-5 shrink-0 text-ink/50" />
            <dt className="w-24 shrink-0 text-ink/60">{label}</dt>
            <dd className="min-w-0 flex-1 break-words text-right font-semibold">{value}</dd>
          </div>
        ))}
        {summary.notes && (
          <div className="py-3">
            <dt className="text-ink/60">Richieste particolari</dt>
            <dd className="mt-1 break-words">{summary.notes}</dd>
          </div>
        )}
      </dl>

      {confirmed ? (
        <div className="mt-6 border-l-2 border-ok bg-paper px-4 py-4">
          <p className="font-semibold">La tua prenotazione è confermata: il tavolo è riservato.</p>
          <p className="mt-1 text-ink/75">Ti aspettiamo da Prometeo. Se cambia qualcosa puoi modificarla o annullarla dal link qui sotto.</p>
          {whatsappAuto && (
            <p className="mt-2 text-ink/75">
              Ti abbiamo appena inviato la conferma su WhatsApp al numero <span className="whitespace-nowrap font-semibold text-ink">{summary.phone}</span>.
            </p>
          )}
        </div>
      ) : (
        <div className="mt-6 border-l-2 border-ink bg-paper px-4 py-4">
          <p className="font-semibold">Questa è una richiesta di prenotazione, non ancora confermata.</p>
          <p className="mt-1 text-ink/75">
            Il ristorante la verificherà e ti invierà la conferma con un messaggio WhatsApp al numero{" "}
            <span className="whitespace-nowrap font-semibold text-ink">{summary.phone}</span>. Il tavolo è riservato solo dopo la conferma.
          </p>
          {whatsappAuto && <p className="mt-2 text-ink/75">Ti abbiamo appena scritto su WhatsApp per confermarti che la richiesta è arrivata.</p>}
        </div>
      )}

      <div className="mt-6 flex flex-col gap-3">
        <button
          type="button"
          onClick={() =>
            downloadIcs({
              date: summary.date,
              time: summary.time,
              people: summary.people,
              title: "Prometeo Fine Dining",
              location: `${settings.address}, ${settings.city}`,
            })
          }
          className="btn btn-dark w-full"
        >
          <IconCalendar className="h-5 w-5" /> Salva nel calendario
        </button>
        <a href={settings.mapsUrl} target="_blank" rel="noopener" className="btn btn-line w-full">
          Come arrivare
        </a>
        {token && (
          <Link href={`/prenotazione/${token}`} className="btn btn-line w-full">
            Modifica o annulla
          </Link>
        )}
        {settings.phone && (
          <p className="mt-2 text-ink/60">
            Oppure chiamaci:{" "}
            <a href={telHref(settings.phone)} className="font-semibold text-ink underline underline-offset-4">
              {settings.phone}
            </a>
          </p>
        )}
        <div className="mt-2 flex justify-center gap-6 text-ink/60">
          <Link href="/" className="underline underline-offset-4">
            Torna alla home
          </Link>
          <button type="button" onClick={onAgain} className="underline underline-offset-4">
            Nuova prenotazione
          </button>
        </div>
      </div>
    </motion.div>
  );
}
