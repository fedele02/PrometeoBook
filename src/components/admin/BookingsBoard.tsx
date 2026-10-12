"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { cancelBookingAction, deleteBookingAction } from "@/app/gestore-prometeo-2026/actions";
import type { DayService, ServiceName } from "@/lib/board";
import { isActive, phoneKey } from "@/lib/customers";
import { ADMIN_PATH } from "@/lib/pwa";
import { telHref, whatsappHref } from "@/lib/site";
import { capitalize, dateParts, formatDateLong, relativeDay, serviceLabel } from "@/lib/time";
import type { Booking, Settings } from "@/lib/types";
import { IconCalendar, IconChevron, IconNote, IconPhone, IconPlus, IconUsers, IconWhatsapp } from "../Icons";
import { PhoneBookingModal } from "./PhoneBookingModal";
import { RequestCard } from "./RequestCard";
import { STATUS } from "./status";
import { useToast } from "./ui";

export type DayChip = { date: string; covers: number; pending: number };
export type Row = Booking & { history: string; visits: number; ago: string };

const sectionLabel = "text-[0.7rem] font-bold uppercase tracking-[0.22em]";
const dayHref = (d: string, today: string) => (d === today ? ADMIN_PATH : `${ADMIN_PATH}?date=${d}`);

export function BookingsBoard({
  settings,
  today,
  date,
  days,
  rows,
  services,
  initialService,
  statusLine,
}: {
  settings: Settings;
  today: string;
  date: string;
  days: DayChip[];
  rows: Row[];
  services: DayService[];
  initialService: ServiceName;
  statusLine: string | null;
}) {
  const router = useRouter();
  const toast = useToast();
  const [service, setService] = useState<ServiceName>(initialService);
  const [phoneOpen, setPhoneOpen] = useState(false);

  // live data: a push refreshes at once (see pwa.tsx); this is the fallback
  useEffect(() => {
    const refresh = () => document.visibilityState === "visible" && router.refresh();
    const t = setInterval(refresh, 60_000);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      clearInterval(t);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [router]);

  // opened from a notification: bring that booking into view
  useEffect(() => {
    const id = location.hash.slice(1);
    const el = id ? document.getElementById(id) : null;
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.classList.add("ring-2", "ring-gold");
    const t = setTimeout(() => el.classList.remove("ring-2", "ring-gold"), 2400);
    return () => clearTimeout(t);
  }, []);

  const requests = rows.filter((b) => b.status === "pending").sort((a, b) => b.created_at.localeCompare(a.created_at));
  const current = services.find((s) => s.label === service) ?? services[0];

  return (
    <div className="mx-auto max-w-2xl">
      {/* day title */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-display text-[1.65rem] leading-tight tracking-[0.03em] sm:text-[2rem]">{capitalize(formatDateLong(date))}</h1>
          <p className="mt-1 text-cream/60">{statusLine ?? capitalize(relativeDay(date, today))}</p>
        </div>
        <button
          type="button"
          onClick={() => setPhoneOpen(true)}
          aria-label="Prenotazione telefonica"
          title="Prenotazione telefonica"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gold/15 text-gold-light transition-colors hover:bg-gold/25"
        >
          <IconPlus className="h-6 w-6" />
        </button>
      </div>

      <DayStrip days={days} today={today} date={date} />

      <Capacity rows={rows} service={current} settings={settings} />

      {requests.length > 0 && (
        <section className="mt-6 space-y-3" aria-label="Richieste da confermare">
          {requests.length > 1 && <h2 className={`${sectionLabel} text-ember`}>Da confermare · {requests.length}</h2>}
          {requests.map((b, i) => (
            <RequestCard key={b.id} b={b} settings={settings} fresh={i === 0} />
          ))}
        </section>
      )}

      {services.length > 1 && (
        <div role="tablist" aria-label="Servizio" className="mt-6 grid grid-cols-2 gap-1 rounded-full bg-white/[0.05] p-1">
          {services.map((s) => {
            const on = s.label === current?.label;
            const covers = rows.filter((b) => isActive(b) && serviceLabel(b.time) === s.label).reduce((n, b) => n + b.people, 0);
            return (
              <button
                key={s.label}
                role="tab"
                aria-selected={on}
                onClick={() => setService(s.label)}
                className={`min-h-11 rounded-full text-[0.95rem] font-semibold transition-colors ${on ? "bg-gold/[0.18] text-gold-light" : "text-cream/60 hover:text-cream"}`}
              >
                {s.label} · {covers}
              </button>
            );
          })}
        </div>
      )}

      <Timeline rows={rows} service={current?.label ?? service} isToday={date === today} />

      <PhoneBookingModal
        key={date}
        open={phoneOpen}
        date={date}
        onClose={() => setPhoneOpen(false)}
        onDone={() => {
          setPhoneOpen(false);
          toast("Prenotazione aggiunta");
          router.refresh();
        }}
      />
    </div>
  );
}

/* ---------- days with bookings ---------------------------------------- */

function DayStrip({ days, today, date }: { days: DayChip[]; today: string; date: string }) {
  const router = useRouter();
  const selected = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    // recent browsers return a Promise from scrollIntoView: never hand it back to React
    selected.current?.scrollIntoView({ inline: "center", block: "nearest" });
  }, []);

  return (
    <section className="mt-5" aria-label="Giorni con prenotazioni">
      <h2 className={`${sectionLabel} text-gold`}>Giorni con prenotazioni</h2>
      <div className="no-scrollbar -mx-4 mt-2.5 flex gap-2 overflow-x-auto px-4 pb-1 pt-2 md:mx-0 md:px-0">
        {days.map((d) => {
          const p = dateParts(d.date);
          const on = d.date === date;
          return (
            <Link
              key={d.date}
              ref={on ? selected : undefined}
              href={dayHref(d.date, today)}
              scroll={false}
              aria-current={on ? "date" : undefined}
              className={`relative flex h-[4.75rem] w-14 shrink-0 flex-col items-center justify-center rounded-xl border transition-colors ${
                on ? "border-gold bg-gold text-ink" : "border-white/[0.08] bg-ink-2 text-cream hover:border-gold/40"
              }`}
            >
              <span className={`text-[0.65rem] font-bold uppercase tracking-[0.08em] ${on ? "text-ink/70" : "text-cream/60"}`}>{d.date === today ? "oggi" : p.wd}</span>
              <span className="text-[1.35rem] font-extrabold leading-tight">{p.day}</span>
              <span className={`text-[0.65rem] font-semibold ${on ? "text-ink/70" : "text-cream/55"}`}>{d.covers ? `${d.covers} cop.` : "—"}</span>
              {d.pending > 0 && (
                <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-ember px-1 text-[0.7rem] font-bold text-ink">
                  {d.pending}
                </span>
              )}
            </Link>
          );
        })}
        <label className="relative flex h-[4.75rem] w-14 shrink-0 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border border-white/20 text-cream/75 transition-colors hover:border-gold/40">
          <IconCalendar className="h-6 w-6" />
          <span className="text-[0.65rem] font-semibold">Altri</span>
          <input
            type="date"
            aria-label="Scegli un altro giorno"
            value={date}
            onChange={(e) => e.target.value && router.push(dayHref(e.target.value, today), { scroll: false })}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0 [color-scheme:dark]"
          />
        </label>
      </div>
    </section>
  );
}

/* ---------- covers + chart by time ------------------------------------ */

function Capacity({ rows, service, settings }: { rows: Row[]; service: DayService | undefined; settings: Settings }) {
  const max = settings.booking.maxCoversPerSlot;
  const label = service?.label ?? "Servizio";
  const list = rows.filter((b) => isActive(b) && serviceLabel(b.time) === label);
  const covers = list.reduce((n, b) => n + b.people, 0);
  const waiting = rows.filter((b) => b.status === "pending").length;
  const byTime = (t: string) => list.filter((b) => b.time === t).reduce((n, b) => n + b.people, 0);
  const times = service?.times ?? [];
  const dense = times.length > 8;

  return (
    <section className="mt-5 rounded-2xl border border-white/[0.07] bg-ink-2 p-5" aria-label={`Coperti ${label}`}>
      <div className="flex items-stretch">
        <div className="min-w-0 flex-1">
          <h2 className={`${sectionLabel} text-gold`}>Coperti · {label}</h2>
          <p className="mt-1.5 flex items-baseline gap-2">
            <span className="text-[2.5rem] font-bold leading-none">{covers}</span>
            <span className="text-cream/55">
              {list.length} {list.length === 1 ? "tavolo" : "tavoli"}
            </span>
          </p>
        </div>
        <div className="border-l border-white/[0.08] pl-5">
          <p className={`text-[2rem] font-bold leading-none ${waiting ? "text-ember" : "text-cream/40"}`}>{waiting}</p>
          <p className="mt-1.5 text-sm text-cream/70">in attesa</p>
        </div>
      </div>

      {times.length > 0 && (
        <div className="mt-5 border-t border-white/[0.06] pt-4">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-cream/50">Per fascia oraria · max {max}</p>
          <ol className="mt-3 flex items-end justify-between gap-1.5" aria-label="Coperti per orario">
            {times.map((t, i) => {
              const n = byTime(t);
              const ratio = Math.min(n / max, 1);
              const full = n / max >= 0.8;
              return (
                <li key={t} className="flex min-w-0 max-w-12 flex-1 flex-col items-center" aria-label={`${t}: ${n} coperti`}>
                  <span className={`mb-1 h-4 text-xs font-bold ${n ? "" : "invisible"}`}>{n}</span>
                  <span className="relative block h-20 w-full overflow-hidden rounded-md bg-white/[0.04]">
                    <span
                      className={`absolute inset-x-0 bottom-0 rounded-md transition-[height] duration-500 ${full ? "bg-ember" : "bg-gold"}`}
                      style={{ height: n ? `${Math.max(ratio * 100, 4)}%` : "3px", opacity: n ? 1 : 0.3 }}
                    />
                  </span>
                  <span className={`mt-2 text-[0.7rem] font-semibold tabular-nums text-cream/60 ${dense && i % 2 ? "invisible" : ""}`}>{t}</span>
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </section>
  );
}

/* ---------- who is coming: timeline ------------------------------------ */

function Timeline({ rows, service, isToday }: { rows: Row[]; service: ServiceName; isToday: boolean }) {
  const [showLost, setShowLost] = useState(false);
  const inService = rows.filter((b) => serviceLabel(b.time) === service).sort((a, b) => a.time.localeCompare(b.time) || a.created_at.localeCompare(b.created_at));
  const active = inService.filter(isActive);
  const lost = inService.filter((b) => !isActive(b));
  const covers = active.reduce((n, b) => n + b.people, 0);
  const title = isToday ? (service === "Cena" ? "In sala stasera" : "In sala oggi a pranzo") : `In sala · ${service.toLowerCase()}`;

  return (
    <section className="mt-7" aria-label={title}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h2 className={`${sectionLabel} text-gold`}>{title}</h2>
        <p className="whitespace-nowrap text-sm text-cream/55">
          {active.length} {active.length === 1 ? "tavolo" : "tavoli"} · {covers} coperti
        </p>
      </div>

      {active.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-white/[0.07] bg-ink-2 px-5 py-6 text-center text-cream/60">Nessuna prenotazione per questo servizio.</p>
      ) : (
        <ol className="relative mt-4">
          <span className="absolute bottom-6 left-[3.75rem] top-3 w-0.5 bg-white/10" aria-hidden />
          {active.map((b, i) => (
            <TimelineRow key={b.id} b={b} showTime={i === 0 || active[i - 1].time !== b.time} />
          ))}
        </ol>
      )}

      {lost.length > 0 && (
        <div className="mt-4">
          <button type="button" onClick={() => setShowLost(!showLost)} className="min-h-11 text-sm font-semibold text-cream/55 underline underline-offset-4">
            {showLost ? "Nascondi" : "Mostra"} annullate e rifiutate ({lost.length})
          </button>
          {showLost && (
            <ol className="mt-2">
              {lost.map((b) => (
                <TimelineRow key={b.id} b={b} showTime />
              ))}
            </ol>
          )}
        </div>
      )}
    </section>
  );
}

function TimelineRow({ b, showTime }: { b: Row; showTime: boolean }) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [busy, start] = useTransition();
  const st = STATUS[b.status];
  const pending = b.status === "pending";
  const gone = !isActive(b);

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>, msg: string) =>
    start(async () => {
      const res = await fn();
      if (res.ok) {
        toast(msg);
        router.refresh();
      } else toast(res.error ?? "Errore", "error");
    });

  return (
    <li id={`row-${b.id}`} className="relative grid grid-cols-[3rem_1.5rem_1fr] items-start gap-x-1.5 pb-2">
      <span className="pt-3 text-base font-bold tabular-nums">{showTime ? b.time : ""}</span>
      <span className={`relative z-10 mt-[1.05rem] h-3 w-3 justify-self-center rounded-full ${pending ? "bg-ember" : gone ? "bg-cream/30" : "bg-gold"}`} aria-hidden />
      <div className={`min-w-0 rounded-xl transition-colors ${pending ? "border border-ember/30 bg-ember/[0.07]" : open ? "bg-white/[0.04]" : ""} ${gone ? "opacity-60" : ""}`}>
        <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className="flex w-full items-center gap-2 px-3 py-2 text-left">
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[1.05rem] font-semibold">{b.name}</span>
            <span className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1">
              <span className="inline-flex items-center gap-1 text-sm font-bold text-gold-light">
                <IconUsers className="h-4 w-4" /> {b.people}
              </span>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${st.cls}`}>{st.label}</span>
              {b.visits > 0 && <span className="text-xs font-semibold text-gold-light">{b.visits + 1}ª visita</span>}
              {b.source === "admin" && <span className="text-xs text-cream/50">telefonica</span>}
            </span>
          </span>
          <IconChevron dir={open ? "up" : "down"} className="h-5 w-5 shrink-0 text-cream/40" />
        </button>

        {open && (
          <div className="space-y-3 border-t border-white/[0.06] px-3 pb-3 pt-3 text-sm">
            {b.notes && (
              <p className="flex items-start gap-2 italic text-gold-light">
                <IconNote className="mt-0.5 h-4 w-4 shrink-0" /> “{b.notes}”
              </p>
            )}
            <p className="text-cream/70">{b.history}</p>
            <p className="text-cream/50">
              {b.source === "web" ? "Dal sito" : "Telefonica"} · ricevuta {b.ago}
            </p>
            <div className="flex flex-wrap gap-2">
              <a href={telHref(b.phone)} className="btn btn-line min-h-11 px-4 text-xs text-cream/85">
                <IconPhone className="h-4 w-4" /> {b.phone}
              </a>
              <a href={whatsappHref(b.phone)} target="_blank" rel="noopener" className="btn btn-line min-h-11 px-4 text-xs text-cream/85">
                <IconWhatsapp className="h-4 w-4" /> WhatsApp
              </a>
              <Link href={`${ADMIN_PATH}/clienti?tel=${phoneKey(b.phone)}`} className="btn btn-line min-h-11 px-4 text-xs text-cream/85">
                Storico
              </Link>
            </div>

            {pending && (
              <button
                type="button"
                onClick={() => document.getElementById(`b-${b.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" })}
                className="btn btn-gold min-h-11 w-full text-xs"
              >
                Rispondi alla richiesta
              </button>
            )}
            {b.status === "confirmed" &&
              (confirming ? (
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setConfirming(false)} className="btn btn-line min-h-11 text-xs text-cream/85">
                    No
                  </button>
                  <button type="button" disabled={busy} onClick={() => run(() => cancelBookingAction(b.id), "Prenotazione annullata")} className="btn min-h-11 bg-ember text-xs text-ink disabled:opacity-60">
                    Sì, annulla
                  </button>
                </div>
              ) : (
                <button type="button" onClick={() => setConfirming(true)} className="min-h-11 text-sm font-semibold text-ember underline underline-offset-4">
                  Annulla prenotazione (es. il cliente ha chiamato)
                </button>
              ))}
            {gone &&
              (confirming ? (
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setConfirming(false)} className="btn btn-line min-h-11 text-xs text-cream/85">
                    No
                  </button>
                  <button type="button" disabled={busy} onClick={() => run(() => deleteBookingAction(b.id), "Eliminata")} className="btn min-h-11 bg-ember text-xs text-ink disabled:opacity-60">
                    Sì, elimina
                  </button>
                </div>
              ) : (
                <button type="button" onClick={() => setConfirming(true)} className="min-h-11 text-sm font-semibold text-cream/60 underline underline-offset-4">
                  Elimina definitivamente
                </button>
              ))}
          </div>
        )}
      </div>
    </li>
  );
}
