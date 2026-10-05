"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { createBookingAction, deleteBookingAction, setBookingStatusAction } from "@/app/admin/actions";
import { telHref, whatsappHref } from "@/lib/site";
import { capitalize, dateParts, dayState, formatDateLong, relativeDay, serviceLabel } from "@/lib/time";
import type { Booking, BookingStatus, Settings } from "@/lib/types";
import { IconCheck, IconClose, IconPhone, IconPlus, IconRefresh, IconTrash, IconUsers, IconWhatsapp } from "../Icons";
import { Card, FieldLabel, Modal, PageTitle, iconBtn, smallInput, useToast } from "./ui";

export type DaySummary = { date: string; covers: number; pending: number };

const STATUS: Record<BookingStatus, { label: string; cls: string }> = {
  pending: { label: "Da confermare", cls: "bg-ember/20 text-ember" },
  confirmed: { label: "Confermata", cls: "bg-emerald-400/15 text-emerald-300" },
  cancelled: { label: "Annullata", cls: "bg-white/10 text-cream/50" },
};

export function BookingsBoard({
  settings,
  today,
  date,
  bookings,
  strip,
}: {
  settings: Settings;
  today: string;
  date: string;
  bookings: Booking[];
  strip: DaySummary[];
}) {
  const router = useRouter();
  const toast = useToast();
  const [pending, start] = useTransition();
  const [creating, setCreating] = useState(false);
  const [showCancelled, setShowCancelled] = useState(false);

  // new online bookings show up on their own
  useEffect(() => {
    const refresh = () => document.visibilityState === "visible" && router.refresh();
    const t = setInterval(refresh, 45_000);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      clearInterval(t);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [router]);

  const goDate = (d: string) => router.push(d === today ? "/admin" : `/admin?date=${d}`, { scroll: false });

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>, msg: string) =>
    start(async () => {
      const res = await fn();
      if (res.ok) {
        toast(msg);
        router.refresh();
      } else toast(res.error ?? "Errore", "error");
    });

  const active = bookings.filter((b) => b.status !== "cancelled");
  const cancelled = bookings.filter((b) => b.status === "cancelled");
  const services = ["Pranzo", "Cena"].map((label) => {
    const list = active.filter((b) => serviceLabel(b.time) === label);
    return { label, list, covers: list.reduce((n, b) => n + b.people, 0) };
  });
  const toConfirm = active.filter((b) => b.status === "pending").length;
  const closed = dayState(settings, date);

  return (
    <>
      <PageTitle
        title="Prenotazioni"
        subtitle={date === today ? `Oggi, ${formatDateLong(date)}` : capitalize(relativeDay(date, today))}
      >
        <button onClick={() => start(() => router.refresh())} className={iconBtn} aria-label="Aggiorna">
          <IconRefresh className={`h-5 w-5 ${pending ? "animate-spin" : ""}`} />
        </button>
        <button onClick={() => setCreating(true)} className="btn btn-gold min-h-10 px-4 text-sm">
          <IconPlus className="h-4 w-4" /> Nuova
        </button>
      </PageTitle>

      {/* day strip */}
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-2 md:mx-0 md:px-0">
        {strip.map((d) => {
          const p = dateParts(d.date);
          const sel = d.date === date;
          const off = dayState(settings, d.date).closed;
          return (
            <button
              key={d.date}
              onClick={() => goDate(d.date)}
              className={`relative flex w-16 shrink-0 flex-col items-center rounded-md border py-2.5 transition ${
                sel ? "border-gold bg-gold text-ink" : "border-white/[0.07] bg-ink-2 text-cream hover:border-gold/40"
              } ${off && !sel ? "opacity-45" : ""}`}
            >
              <span className="text-[0.7rem] font-semibold uppercase">{d.date === today ? "oggi" : p.wd}</span>
              <span className="text-xl font-bold leading-tight">{p.day}</span>
              <span className={`text-[0.7rem] ${sel ? "text-ink/70" : "text-cream/50"}`}>{d.covers ? `${d.covers} cop.` : off ? "chiuso" : "—"}</span>
              {d.pending > 0 && (
                <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-ember px-1 text-[0.65rem] font-bold text-ink">
                  {d.pending}
                </span>
              )}
            </button>
          );
        })}
        <label className="flex w-28 shrink-0 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-white/15 text-center text-xs text-cream/60">
          Altra data
          <input type="date" value={date} onChange={(e) => e.target.value && goDate(e.target.value)} className="mt-1 w-24 bg-transparent text-[0.7rem] text-cream [color-scheme:dark]" />
        </label>
      </div>

      {/* summary */}
      <div className="mt-5 grid grid-cols-3 gap-3">
        {services.map((s) => (
          <Card key={s.label} className="!p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">{s.label}</p>
            <p className="mt-1 text-2xl font-bold">
              {s.covers} <span className="text-sm font-medium text-cream/50">coperti</span>
            </p>
            <p className="text-sm text-cream/50">{s.list.length} tavoli</p>
          </Card>
        ))}
        <Card className={`!p-4 ${toConfirm ? "border-ember/40" : ""}`}>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ember">In attesa</p>
          <p className="mt-1 text-2xl font-bold">{toConfirm}</p>
          <p className="text-sm text-cream/50">richieste</p>
        </Card>
      </div>

      {closed.closed && (
        <p className="mt-4 rounded-md bg-white/5 px-4 py-3 text-sm text-cream/70">Giorno di chiusura: {closed.reason}.</p>
      )}

      {/* list */}
      <div className="mt-6 space-y-8">
        {services
          .filter((s) => s.list.length)
          .map((s) => (
            <div key={s.label}>
              <h2 className="mb-3 font-display text-sm tracking-[0.2em] text-cream/60">{s.label.toUpperCase()}</h2>
              <ul className="space-y-3">
                {s.list.map((b) => (
                  <BookingCard key={b.id} b={b} settings={settings} busy={pending} run={run} />
                ))}
              </ul>
            </div>
          ))}
        {active.length === 0 && (
          <Card className="text-center">
            <p className="text-cream/60">Nessuna prenotazione per {formatDateLong(date)}.</p>
          </Card>
        )}
        {cancelled.length > 0 && (
          <div>
            <button onClick={() => setShowCancelled(!showCancelled)} className="text-sm font-semibold text-cream/50 underline underline-offset-4">
              {showCancelled ? "Nascondi" : "Mostra"} annullate ({cancelled.length})
            </button>
            {showCancelled && (
              <ul className="mt-3 space-y-3">
                {cancelled.map((b) => (
                  <BookingCard key={b.id} b={b} settings={settings} busy={pending} run={run} />
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <NewBookingModal
        open={creating}
        date={date}
        onClose={() => setCreating(false)}
        onDone={() => {
          setCreating(false);
          toast("Prenotazione aggiunta");
          router.refresh();
        }}
      />
    </>
  );
}

function BookingCard({
  b,
  settings,
  busy,
  run,
}: {
  b: Booking;
  settings: Settings;
  busy: boolean;
  run: (fn: () => Promise<{ ok: boolean; error?: string }>, msg: string) => void;
}) {
  const st = STATUS[b.status];
  const msg = `Buongiorno ${b.name.split(" ")[0]}, le confermiamo la prenotazione al ${settings.name} ${settings.subtitle} per ${formatDateLong(b.date)} alle ${b.time}, ${b.people} ${b.people === 1 ? "persona" : "persone"}. A presto!`;

  return (
    <li className={`rounded-lg border bg-ink-2 p-4 md:p-5 ${b.status === "pending" ? "border-ember/40" : "border-white/[0.07]"} ${b.status === "cancelled" ? "opacity-60" : ""}`}>
      <div className="flex items-start gap-4">
        <div className="w-16 shrink-0 text-center">
          <p className="text-2xl font-bold leading-none">{b.time}</p>
          <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-gold/15 px-2.5 py-1 text-sm font-bold text-gold-light">
            <IconUsers className="h-4 w-4" />
            {b.people}
          </p>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-lg font-semibold">{b.name}</p>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${st.cls}`}>{st.label}</span>
            {b.source === "admin" && <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-xs text-cream/50">telefonica</span>}
          </div>
          <a href={telHref(b.phone)} className="mt-0.5 block text-cream/70 underline-offset-4 hover:underline">
            {b.phone}
          </a>
          {b.notes && <p className="mt-2 rounded-xl bg-white/[0.04] px-3 py-2 text-sm text-cream/80">“{b.notes}”</p>}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {b.status === "pending" && (
          <button disabled={busy} onClick={() => run(() => setBookingStatusAction(b.id, "confirmed"), "Confermata")} className="btn btn-gold min-h-10 px-4 text-sm">
            <IconCheck className="h-4 w-4" /> Conferma
          </button>
        )}
        <a href={telHref(b.phone)} className="btn btn-line min-h-10 px-4 text-sm">
          <IconPhone className="h-4 w-4" /> Chiama
        </a>
        <a href={whatsappHref(b.phone, msg)} target="_blank" rel="noopener" className="btn btn-line min-h-10 px-4 text-sm">
          <IconWhatsapp className="h-4 w-4" /> WhatsApp
        </a>
        <span className="flex-1" />
        {b.status !== "cancelled" ? (
          <button
            disabled={busy}
            onClick={() => confirm(`Annullare la prenotazione di ${b.name}?`) && run(() => setBookingStatusAction(b.id, "cancelled"), "Annullata")}
            className="btn min-h-10 px-3 text-sm text-cream/60 hover:text-ember"
          >
            <IconClose className="h-4 w-4" /> Annulla
          </button>
        ) : (
          <>
            <button disabled={busy} onClick={() => run(() => setBookingStatusAction(b.id, "confirmed"), "Ripristinata")} className="btn btn-line min-h-10 px-4 text-sm">
              Ripristina
            </button>
            <button
              disabled={busy}
              onClick={() => confirm("Eliminare definitivamente?") && run(() => deleteBookingAction(b.id), "Eliminata")}
              className={iconBtn}
              aria-label="Elimina"
            >
              <IconTrash className="h-4 w-4" />
            </button>
          </>
        )}
      </div>
    </li>
  );
}

function NewBookingModal({ open, date, onClose, onDone }: { open: boolean; date: string; onClose: () => void; onDone: () => void }) {
  const [f, setF] = useState({ date, time: "20:00", people: 2, name: "", phone: "", notes: "" });
  const [error, setError] = useState("");
  const [busy, start] = useTransition();
  const set = (k: keyof typeof f, v: string | number) => setF((x) => ({ ...x, [k]: v }));

  const save = () =>
    start(async () => {
      const res = await createBookingAction(f);
      if (res.ok) {
        setF((x) => ({ ...x, name: "", phone: "", notes: "" }));
        setError("");
        onDone();
      } else setError(res.error);
    });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nuova prenotazione"
      footer={
        <button onClick={save} disabled={busy} className="btn btn-gold w-full">
          {busy ? "Salvataggio…" : "Salva prenotazione"}
        </button>
      }
    >
      <div className="grid gap-4">
        <div className="grid grid-cols-3 gap-3">
          <FieldLabel label="Giorno">
            <input type="date" value={f.date} onChange={(e) => set("date", e.target.value)} className={`${smallInput} [color-scheme:dark]`} />
          </FieldLabel>
          <FieldLabel label="Ora">
            <input type="time" step={900} value={f.time} onChange={(e) => set("time", e.target.value)} className={`${smallInput} [color-scheme:dark]`} />
          </FieldLabel>
          <FieldLabel label="Persone">
            <input type="number" min={1} max={60} value={f.people} onChange={(e) => set("people", Number(e.target.value))} className={smallInput} />
          </FieldLabel>
        </div>
        <FieldLabel label="Nome">
          <input value={f.name} onChange={(e) => set("name", e.target.value)} className={smallInput} />
        </FieldLabel>
        <FieldLabel label="Telefono">
          <input type="tel" value={f.phone} onChange={(e) => set("phone", e.target.value)} className={smallInput} />
        </FieldLabel>
        <FieldLabel label="Note">
          <textarea value={f.notes} onChange={(e) => set("notes", e.target.value)} rows={2} className={`${smallInput} py-3`} />
        </FieldLabel>
        <p className="text-sm text-cream/50">Le prenotazioni inserite qui sono già confermate e non contano il limite di coperti.</p>
        {error && <p className="rounded-xl bg-ember/15 px-4 py-3 text-sm">{error}</p>}
      </div>
    </Modal>
  );
}
