"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState, useTransition } from "react";
import { getAvailability, submitBirthdayBooking, submitBooking, type Availability } from "@/app/(site)/prenota/actions";
import { telHref } from "@/lib/site";
import { addDays, capitalize, dateParts, dayState, formatDateLong, romeNow } from "@/lib/time";
import type { AppliedPromotion, OnlineStatus, Settings } from "@/lib/types";
import { onlineStatus } from "@/lib/customers";
import { BIRTHDAY_CONSENT, birthdayKey, daysInMonth, MONTHS } from "@/lib/birthday";
import { hoursLabel, percentLabel, promotionFor, promotionsOn } from "@/lib/promotions";
import { IconCalendar, IconCheck, IconClock, IconGift, IconTag, IconUser, IconUsers, IconWhatsapp } from "../Icons";
import { Calendar } from "./Calendar";
import { Choice, ErrorBox, Field, MorePeople, PromoNote, Slots, Title } from "./parts";
import { downloadIcs } from "./ics";
import { rememberBooking } from "@/lib/guest-bookings";
import { nationalDigits } from "@/lib/phone";
import { PhoneInput } from "../PhoneInput";

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

/**
 * The guest's birthday link (/auguri/<code>): only the link's days, the number the wishes
 * went to, the birthday offer instead of any promotion.
 */
/** `validity`: the days the offer was promised for, written out ("dal 31 ottobre al 4 novembre") */
export type BirthdayLinkProps = { code: string; birthday: string; dates: string[]; name: string; phone: string; offer: string; validity: string };

/** `whatsappAuto`: the guest gets an automatic "request received" message on WhatsApp. `birthday`: booking with the birthday link. */
export function BookingWizard({ settings, whatsappAuto = false, birthday }: { settings: Settings; whatsappAuto?: boolean; birthday?: BirthdayLinkProps }) {
  // any party can book online, up to a whole service; above the auto-confirm size it's a request
  const max = settings.booking.maxCoversPerService;
  const [step, setStep] = useState<Step>(0);
  const [dir, setDir] = useState(1);
  // Rome date from the browser clock (the page itself is cached).
  // Not rendered on the first step, so server and client markup match.
  const [today] = useState(() => romeNow().date);

  const [people, setPeople] = useState<number | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [name, setName] = useState(() => birthday?.name ?? savedGuest().name);
  const [phone, setPhone] = useState(() => birthday?.phone ?? savedGuest().phone);
  const [notes, setNotes] = useState("");
  const [privacy, setPrivacy] = useState(false);
  // birthday wishes: optional, day and month only, with their own consent
  const [bdDay, setBdDay] = useState(0);
  const [bdMonth, setBdMonth] = useState(0);
  const [bdConsent, setBdConsent] = useState(false);
  const [hp, setHp] = useState("");
  // small parties are confirmed at once (never with the birthday link): the button and its note say so
  const instant = !birthday && people !== null && onlineStatus(settings, people) === "confirmed";
  // birthday link: a birthday still ahead on a closing day stays in the grid, disabled, with a line saying why
  const birthdayClosed = !!birthday && birthday.birthday >= today && dayState(settings, birthday.birthday).closed;

  const [avail, setAvail] = useState<Availability | null>(null);
  const [error, setError] = useState<{ msg: string; field?: string } | null>(null);
  // private link token of the request just sent ("" when dropped as spam)
  const [done, setDone] = useState<string | null>(null);
  // confirmed at once (small party) or a request for the staff, and the discount saved on it
  const [doneStatus, setDoneStatus] = useState<OnlineStatus>("pending");
  const [donePromo, setDonePromo] = useState<AppliedPromotion | null>(null);
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
    if (nationalDigits(phone) < 6) return setError({ msg: "Scrivi un numero di telefono valido.", field: "phone" });
    const bdKey = !birthday && settings.birthday.enabled && bdDay && bdMonth ? (birthdayKey(bdDay, bdMonth) ?? "") : "";
    if (!birthday && settings.birthday.enabled) {
      if (bdConsent && !bdKey) return setError({ msg: "Scegli giorno e mese del tuo compleanno.", field: "birthday" });
      if (bdKey && !bdConsent)
        return setError({ msg: "Per ricevere l'offerta di compleanno spunta la casella, oppure lascia vuota la data.", field: "birthdayConsent" });
    }
    if (!privacy) return setError({ msg: "Spunta la casella del consenso per continuare.", field: "privacy" });
    setError(null);
    startTransition(async () => {
      const res = birthday
        ? await submitBirthdayBooking(birthday.code, { date: date!, time: time!, people: people!, name, notes, privacy: true, website: hp })
        : await submitBooking({ date: date!, time: time!, people: people!, name, phone, notes, privacy: true, birthday: bdKey, birthdayConsent: !!bdKey && bdConsent, website: hp });
      if (res.ok) {
        try {
          localStorage.setItem(SAVED, JSON.stringify({ name, phone }));
        } catch {}
        if (res.token) rememberBooking({ token: res.token, date: date!, time: time!, people: people! });
        setDoneStatus(res.status);
        setDonePromo(res.promotion);
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
        promotion={donePromo}
        birthdayOffer={birthday?.offer ?? null}
        settings={settings}
        whatsappAuto={whatsappAuto}
        summary={{ date: date!, time: time!, people: people!, name: name.trim(), phone: phone.trim(), notes: notes.trim() }}
        onAgain={
          birthday
            ? null
            : () => {
                setDone(null);
                setTime(null);
                setDate(null);
                setPeople(null);
                setStep(0);
              }
        }
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
              </>
            )}

            {step === 1 && birthday && (
              <>
                <Title>Quale giorno?</Title>
                {birthdayClosed ? (
                  <p className="mt-1 text-ink/60">
                    {capitalize(formatDateLong(birthday.birthday))}, il giorno del tuo compleanno, il ristorante è chiuso: puoi festeggiare con noi
                    in uno di questi giorni.
                  </p>
                ) : (
                  <p className="mt-1 text-ink/60">Con il tuo link di compleanno puoi prenotare in questi giorni.</p>
                )}
                <div className="mt-5 grid grid-cols-2 gap-2.5">
                  {[...new Set([...birthday.dates, ...(birthdayClosed ? [birthday.birthday] : [])])].sort().map((d) => {
                    const open = birthday.dates.includes(d);
                    return (
                      <Choice key={d} disabled={!open} selected={date === d} onClick={() => pickDate(d)} className="flex-col py-4">
                        <span className="text-lg">{capitalize(shortDate(d))}</span>
                        <span className="text-sm font-medium opacity-70">
                          {d === birthday.birthday ? (open ? "il tuo compleanno" : "chiuso") : "\u00a0"}
                        </span>
                      </Choice>
                    );
                  })}
                </div>
              </>
            )}

            {step === 1 && !birthday && (
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
                {/* conditions visible before choosing: the restaurant's own words */}
                {!birthday && dayPromotions(settings, date, avail).map((p) => (
                  <PromoNote key={p.id} title={`${percentLabel(p.percent)} · ${p.name}`} lines={[capitalize(hoursLabel(p)), p.conditions]} />
                ))}
                {error && <ErrorBox>{error.msg}</ErrorBox>}
                <Slots avail={avail} loading={pending} time={time} onPick={pickTime} onChangeDay={() => go(1)} phone={settings.phone} hidePromo={!!birthday} />
              </>
            )}

            {step === 3 && date && time && people && (
              <form onSubmit={submit} noValidate>
                <Title>I tuoi dati</Title>
                <p className="mt-1 text-ink/60">
                  {capitalize(formatDateLong(date))}, ore {time}, {people} {people === 1 ? "persona" : "persone"}
                </p>
                {birthday ? <BirthdayOffer offer={birthday.offer} validity={birthday.validity} /> : <AppliedPromo promotion={promotionFor(settings, date, time)} />}

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
                <Field
                  label="Telefono (WhatsApp)"
                  hint={birthday ? "Il numero a cui ti abbiamo scritto: qui arriva la conferma." : "Ti invieremo qui la conferma su WhatsApp. Numero straniero? Tocca la bandiera."}
                  error={error?.field === "phone"}
                >
                  <PhoneInput value={phone} onChange={setPhone} readOnly={!!birthday} enterKeyHint="done" />
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

                {settings.birthday.enabled && !birthday && (
                  <fieldset className={`mt-6 border p-4 ${error?.field === "birthday" || error?.field === "birthdayConsent" ? "border-ember" : "border-ink/15"}`}>
                    <legend className="flex items-center gap-2 px-1 font-semibold">
                      <IconGift className="h-5 w-5 text-ink/60" /> Il tuo compleanno
                    </legend>
                    <p className="text-sm text-ink/60">Facoltativo: solo giorno e mese, per farti gli auguri con un&apos;offerta riservata.</p>
                    <div className="mt-3 grid gap-2.5 min-[360px]:grid-cols-[6.5rem_1fr]">
                      <select
                        value={bdDay}
                        onChange={(e) => setBdDay(Number(e.target.value))}
                        aria-label="Giorno del compleanno"
                        className="input input-paper !px-3"
                      >
                        <option value={0}>Giorno</option>
                        {Array.from({ length: bdMonth ? daysInMonth(bdMonth) : 31 }, (_, i) => i + 1).map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                      <select
                        value={bdMonth}
                        onChange={(e) => {
                          const m = Number(e.target.value);
                          setBdMonth(m);
                          if (m && bdDay > daysInMonth(m)) setBdDay(0);
                        }}
                        aria-label="Mese del compleanno"
                        className="input input-paper !px-3"
                      >
                        <option value={0}>Mese</option>
                        {MONTHS.map((m, i) => (
                          <option key={m} value={i + 1}>
                            {capitalize(m)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <Consent checked={bdConsent} onChange={setBdConsent} error={error?.field === "birthdayConsent"} className="mt-4">
                      {BIRTHDAY_CONSENT}
                    </Consent>
                  </fieldset>
                )}

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

                <Consent checked={privacy} onChange={setPrivacy} error={error?.field === "privacy"} className="mt-6 border p-4">
                  Acconsento all&apos;uso dei miei dati solo per gestire questa prenotazione e a ricevere su WhatsApp i messaggi che la riguardano (
                  <Link href="/privacy" target="_blank" className="underline underline-offset-2">
                    informativa
                  </Link>
                  ).
                </Consent>

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

/** A consent box: never ticked in advance. */
function Consent({
  checked,
  onChange,
  error,
  className = "",
  children,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  error?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`flex cursor-pointer items-start gap-4 ${error ? "border-ember" : "border-ink/15"} ${className}`}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
      <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center border-2 border-ink/40 text-cream transition peer-checked:border-ink peer-checked:bg-ink peer-focus-visible:ring-2 peer-focus-visible:ring-gold">
        {checked && <IconCheck className="h-5 w-5" strokeWidth={3} />}
      </span>
      <span className="leading-snug text-ink/80">{children}</span>
    </label>
  );
}

/** Promotions of the day that are the best one for at least one bookable time (a bigger all-day one hides the others). */
function dayPromotions(settings: Settings, date: string, avail: Availability | null) {
  if (!avail || avail.closed) return [];
  const times = avail.services.flatMap((svc) => (svc.full ? [] : svc.slots.map((sl) => sl.time)));
  const used = new Set(times.map((t) => promotionFor(settings, date, t)?.id));
  return promotionsOn(settings, date).filter((p) => used.has(p.id));
}

/** Booking with the birthday link: the offer and all its terms, read before sending (the same as in the wishes). */
function BirthdayOffer({ offer, validity }: { offer: string; validity: string }) {
  return (
    <div className="mt-5 flex gap-3 border-l-2 border-gold-deep bg-paper px-4 py-3.5">
      <IconGift className="mt-0.5 h-5 w-5 shrink-0 text-gold-deep" />
      <div className="min-w-0">
        <p className="font-semibold">La tua offerta di compleanno</p>
        {offer && <p className="mt-0.5 font-medium">{capitalize(offer)}</p>}
        <p className="mt-1.5 text-ink/75">
          Offerta personale, valida per una sola prenotazione {validity}, salvo disponibilità e nostra conferma. Al ristorante mostra un
          documento d&apos;identità con la data di nascita. Non cumulabile con altre promozioni né convertibile in denaro.
        </p>
      </div>
    </div>
  );
}

/** The discount of the chosen date and time, before confirming. */
function AppliedPromo({ promotion }: { promotion: AppliedPromotion | null }) {
  if (!promotion) return null;
  return <PromoNote title={`Sconto ${percentLabel(promotion.percent)} su questa prenotazione`} lines={[promotion.name, promotion.conditions]} />;
}

/* ------------------------------------------------------------------ */

function Done({
  token,
  status,
  promotion,
  birthdayOffer,
  settings,
  whatsappAuto,
  summary,
  onAgain,
}: {
  token: string;
  status: OnlineStatus;
  promotion: AppliedPromotion | null;
  /** booked with the birthday link: the offer */
  birthdayOffer: string | null;
  settings: Settings;
  whatsappAuto: boolean;
  summary: { date: string; time: string; people: number; name: string; phone: string; notes: string };
  /** null for the birthday link: one booking per link */
  onAgain: (() => void) | null;
}) {
  const firstName = summary.name.split(" ")[0];
  const confirmed = status === "confirmed";
  const rows = [
    { icon: IconCalendar, label: "Giorno", value: capitalize(formatDateLong(summary.date)) },
    { icon: IconClock, label: "Ora", value: summary.time },
    { icon: IconUsers, label: "Persone", value: `${summary.people} ${summary.people === 1 ? "persona" : "persone"}` },
    { icon: IconUser, label: "A nome di", value: summary.name },
    { icon: IconWhatsapp, label: "WhatsApp", value: summary.phone },
    ...(promotion ? [{ icon: IconTag, label: "Sconto", value: `${percentLabel(promotion.percent)} · ${promotion.name}` }] : []),
    ...(birthdayOffer !== null ? [{ icon: IconGift, label: "Compleanno", value: birthdayOffer ? capitalize(birthdayOffer) : "offerta riservata" }] : []),
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
        {birthdayOffer !== null && (
          <div className="py-3">
            <dt className="text-ink/60">Per l&apos;offerta di compleanno</dt>
            <dd className="mt-1">Mostra al personale un documento d&apos;identità con la data di nascita.</dd>
          </div>
        )}
        {promotion?.conditions && (
          <div className="py-3">
            <dt className="text-ink/60">Condizioni dello sconto</dt>
            <dd className="mt-1 break-words">{promotion.conditions}</dd>
          </div>
        )}
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
          {onAgain && (
            <button type="button" onClick={onAgain} className="underline underline-offset-4">
              Nuova prenotazione
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
