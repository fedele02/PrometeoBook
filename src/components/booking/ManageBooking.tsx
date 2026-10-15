"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { cancelMyBooking, changeMyBooking, getAvailability, type Availability } from "@/app/(site)/prenota/actions";
import { forgetBooking, rememberBooking } from "@/lib/guest-bookings";
import { telHref } from "@/lib/site";
import { capitalize, formatDateLong, romeNow } from "@/lib/time";
import type { BookingStatus, Settings } from "@/lib/types";
import { IconCalendar, IconClock, IconPhone, IconUser, IconUsers, IconWhatsapp } from "../Icons";
import { Calendar } from "./Calendar";
import { Choice, ErrorBox, MorePeople, NotesConsent, Slots, Title } from "./parts";

type GuestBooking = { date: string; time: string; people: number; name: string; phone: string; notes: string; status: BookingStatus };

const STATUS: Record<BookingStatus, { label: string; dot: string }> = {
  pending: { label: "In attesa di conferma", dot: "bg-ember" },
  confirmed: { label: "Confermata", dot: "bg-ok" },
  declined: { label: "Non accettata", dot: "bg-ink/40" },
  cancelled: { label: "Annullata", dot: "bg-ink/40" },
};

const guests = (n: number) => `${n} ${n === 1 ? "persona" : "persone"}`;

export function ManageBooking({
  token,
  settings,
  booking,
  canManage,
}: {
  token: string;
  settings: Settings;
  booking: GuestBooking;
  canManage: boolean;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<"view" | "edit" | "cancel">("view");
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const active = booking.status === "pending" || booking.status === "confirmed";

  // keep the phone's list of bookings in sync with what the restaurant has
  useEffect(() => {
    if (active) rememberBooking({ token, date: booking.date, time: booking.time, people: booking.people });
    else forgetBooking(token);
  }, [active, token, booking.date, booking.time, booking.people]);

  const st = STATUS[booking.status];
  const rows = [
    { icon: IconCalendar, label: "Giorno", value: capitalize(formatDateLong(booking.date)) },
    { icon: IconClock, label: "Ora", value: booking.time },
    { icon: IconUsers, label: "Persone", value: guests(booking.people) },
    { icon: IconUser, label: "A nome di", value: booking.name },
    { icon: IconWhatsapp, label: "WhatsApp", value: booking.phone },
  ];

  const cancel = () =>
    start(async () => {
      const res = await cancelMyBooking(token);
      if (res.ok) {
        setMode("view");
        setNotice("Prenotazione annullata. Grazie per avercelo fatto sapere.");
        router.refresh();
      } else setNotice(res.error);
    });

  if (mode === "edit")
    return (
      <EditBooking
        token={token}
        settings={settings}
        booking={booking}
        onClose={(msg) => {
          setMode("view");
          if (msg) {
            setNotice(msg);
            router.refresh();
          }
        }}
      />
    );

  return (
    <div className="border border-ink/15 bg-white p-6 sm:p-8">
      <p className="inline-flex items-center gap-2 rounded-full bg-ink/[0.06] px-3 py-1 text-sm font-semibold">
        <span className={`h-2 w-2 rounded-full ${st.dot}`} aria-hidden />
        {st.label}
      </p>

      <dl className="mt-6 divide-y divide-ink/10 border-y border-ink/15">
        {rows.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-4 py-3">
            <Icon className="h-5 w-5 shrink-0 text-ink/50" />
            <dt className="w-24 shrink-0 text-ink/60">{label}</dt>
            <dd className="min-w-0 flex-1 break-words text-right font-semibold">{value}</dd>
          </div>
        ))}
        {booking.notes && (
          <div className="py-3">
            <dt className="text-ink/60">Richieste particolari</dt>
            <dd className="mt-1 break-words">{booking.notes}</dd>
          </div>
        )}
      </dl>

      {notice && (
        <p role="status" className="mt-6 border-l-2 border-ok bg-ok/10 px-4 py-3 font-semibold">
          {notice}
        </p>
      )}

      <div className="mt-6 border-l-2 border-ink bg-paper px-4 py-4">
        {booking.status === "pending" && (
          <>
            <p className="font-semibold">Questa è una richiesta, non ancora confermata.</p>
            <p className="mt-1 text-ink/75">
              Il ristorante ti invierà la conferma con un messaggio WhatsApp al numero{" "}
              <span className="whitespace-nowrap font-semibold text-ink">{booking.phone}</span>.
            </p>
          </>
        )}
        {booking.status === "confirmed" && (
          <>
            <p className="font-semibold">Ti aspettiamo!</p>
            <p className="mt-1 text-ink/75">Se cambia qualcosa puoi modificare o annullare la prenotazione da qui.</p>
          </>
        )}
        {booking.status === "declined" && (
          <>
            <p className="font-semibold">Il ristorante non ha potuto accettare questa richiesta.</p>
            <p className="mt-1 text-ink/75">Prova con un altro giorno o un altro orario: saremo felici di accoglierti.</p>
          </>
        )}
        {booking.status === "cancelled" && <p className="font-semibold">Questa prenotazione è stata annullata.</p>}
      </div>

      {active && canManage && mode === "view" && (
        <div className="mt-6 flex flex-col gap-3">
          <button type="button" onClick={() => setMode("edit")} className="btn btn-dark w-full">
            Modifica la prenotazione
          </button>
          <button type="button" onClick={() => setMode("cancel")} className="btn btn-line w-full">
            Annulla la prenotazione
          </button>
        </div>
      )}

      {active && canManage && mode === "cancel" && (
        <div className="mt-6 border border-ember/50 p-5" role="alertdialog" aria-labelledby="cancel-title">
          <p id="cancel-title" className="text-lg font-semibold">
            Vuoi davvero annullare?
          </p>
          <p className="mt-1 text-ink/70">I posti torneranno liberi per altri ospiti.</p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <button type="button" onClick={() => setMode("view")} className="btn btn-line">
              No, torna indietro
            </button>
            <button type="button" onClick={cancel} disabled={pending} className="btn btn-dark disabled:opacity-60">
              {pending ? "Un momento…" : "Sì, annulla"}
            </button>
          </div>
        </div>
      )}

      {active && !canManage && (
        <div className="mt-6">
          <p className="text-ink/70">Mancano poche ore: per modifiche o per annullare chiamaci.</p>
          {settings.phone && (
            <a href={telHref(settings.phone)} className="btn btn-dark mt-3 w-full">
              <IconPhone className="h-5 w-5" /> Chiama {settings.phone}
            </a>
          )}
        </div>
      )}

      {!active && (
        <Link href="/prenota" className="btn btn-dark mt-6 w-full">
          Prenota di nuovo
        </Link>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function EditBooking({
  token,
  settings,
  booking,
  onClose,
}: {
  token: string;
  settings: Settings;
  booking: GuestBooking;
  onClose: (message?: string) => void;
}) {
  const [today] = useState(() => romeNow().date);
  const [people, setPeople] = useState(booking.people);
  const [date, setDate] = useState(booking.date);
  const [time, setTime] = useState<string | null>(booking.time);
  const [notes, setNotes] = useState(booking.notes);
  const [notesConsent, setNotesConsent] = useState(false);
  // consent is asked again only for new or changed special requests
  const needsConsent = notes.trim() !== "" && notes.trim() !== booking.notes;
  const [avail, setAvail] = useState<Availability | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, startLoading] = useTransition();
  const [saving, startSaving] = useTransition();
  const max = settings.booking.maxPartySize;

  // free times for the chosen day and party size (the booking's own seats count as free)
  useEffect(() => {
    startLoading(async () => setAvail(await getAvailability(date, people, token)));
  }, [date, people, token]);

  const pickPeople = (n: number) => {
    setPeople(n);
    setTime(null);
  };
  const pickDate = (d: string) => {
    setDate(d);
    setTime(null);
  };

  const save = () => {
    if (!time) return setError("Scegli un orario.");
    if (needsConsent && !notesConsent) return setError("Per inviare le richieste particolari spunta il consenso, oppure lascia il campo vuoto.");
    setError(null);
    startSaving(async () => {
      const res = await changeMyBooking(token, { date, time, people, notes, notesConsent });
      if (res.ok) onClose("Modifica inviata: il ristorante la riconfermerà con un messaggio WhatsApp.");
      else {
        setError(res.error);
        if (res.slotFull) {
          setTime(null);
          setAvail(await getAvailability(date, people, token));
        }
      }
    });
  };

  return (
    <div className="border border-ink/15 bg-white p-5 sm:p-7">
      <Title>Modifica la prenotazione</Title>
      <p className="mt-1 text-ink/60">Dopo la modifica il ristorante dovrà riconfermarla.</p>

      <h3 className="mt-7 text-sm font-semibold uppercase tracking-[0.16em] text-ink/55">Persone</h3>
      <div className="mt-2.5 grid grid-cols-4 gap-2.5">
        {Array.from({ length: Math.min(8, max) }, (_, i) => i + 1).map((n) => (
          <Choice key={n} selected={people === n} onClick={() => pickPeople(n)} className="h-14 text-xl">
            {n}
          </Choice>
        ))}
      </div>
      {max > 8 && <MorePeople max={max} value={people} onPick={pickPeople} />}

      <h3 className="mt-7 text-sm font-semibold uppercase tracking-[0.16em] text-ink/55">Giorno</h3>
      <div className="mt-2.5">
        <Calendar settings={settings} today={today} value={date} onPick={pickDate} />
      </div>

      <h3 className="mt-7 text-sm font-semibold uppercase tracking-[0.16em] text-ink/55">Orario · {capitalize(formatDateLong(date))}</h3>
      <Slots avail={avail} loading={loading} time={time} onPick={setTime} onChangeDay={() => window.scrollTo({ top: 0, behavior: "smooth" })} phone={settings.phone} />

      <label className="mt-7 block">
        <span className="text-sm font-semibold uppercase tracking-[0.16em] text-ink/55">Richieste particolari</span>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={500} rows={2} className="input input-paper mt-2.5 min-h-24 py-3" />
      </label>
      {needsConsent && <NotesConsent checked={notesConsent} onChange={setNotesConsent} />}

      {error && <ErrorBox>{error}</ErrorBox>}

      <div className="mt-7 grid grid-cols-2 gap-3">
        <button type="button" onClick={() => onClose()} className="btn btn-line">
          Lascia com&apos;era
        </button>
        <button type="button" onClick={save} disabled={saving || !time} className="btn btn-dark disabled:opacity-60">
          {saving ? "Invio…" : "Invia modifica"}
        </button>
      </div>
    </div>
  );
}
