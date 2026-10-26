"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { savePromotionsAction } from "@/app/gestore-prometeo-2026/actions";
import { birthdayOffer, birthdayText, birthdayTooLong, birthdayValues } from "@/lib/messages";
import { BIRTHDAY_TEMPLATE } from "@/lib/whatsapp/templates";
import { bestPercentOn, hoursLabel, percentLabel, periodLabel, promotionState, weekdaysLabel } from "@/lib/promotions";
import { ADMIN_PATH } from "@/lib/pwa";
import { addDays, capitalize, formatDateLong, formatMonthYear, romeNow, weekdayOf, WEEK_ORDER, WEEKDAYS } from "@/lib/time";
import type { BirthdaySettings, BirthdayTerms, Promotion, Settings } from "@/lib/types";
import { IconChevron, IconEdit, IconGift, IconPlus, IconTag, IconTrash } from "../Icons";
import { Card, FieldLabel, PageTitle, Toggle, iconBtn, smallInput, useToast } from "./ui";

const PERCENTS = [10, 15, 20, 25, 30, 50];
const WD_SHORT = ["D", "L", "M", "M", "G", "V", "S"];

const STATE = {
  live: { label: "In corso", cls: "bg-ok/15 text-ok" },
  next: { label: "In programma", cls: "bg-gold/15 text-gold-light" },
  past: { label: "Scaduta", cls: "bg-white/[0.06] text-cream/55" },
  off: { label: "Spenta", cls: "bg-white/[0.06] text-cream/55" },
} as const;

const monthStart = (d: string) => `${d.slice(0, 7)}-01`;
function shiftMonth(first: string, n: number) {
  const [y, m] = first.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1 + n, 1)).toISOString().slice(0, 10);
}
/** Days of the month of `first`, with empty cells before the 1st (Monday first). */
function monthCells(first: string) {
  const cells: (string | null)[] = Array((weekdayOf(first) + 6) % 7).fill(null);
  for (let d = first; d.slice(0, 7) === first.slice(0, 7); d = addDays(d, 1)) cells.push(d);
  return cells;
}

const blank = (today: string): Promotion => ({
  id: crypto.randomUUID(),
  name: "",
  percent: 20,
  from: today,
  to: addDays(today, 30),
  weekdays: [],
  allDay: true,
  start: "19:30",
  end: "20:30",
  conditions: "",
  enabled: true,
});

export function PromotionsManager({
  initial,
  today,
  whatsappConfigured,
  consents,
  phone,
}: {
  initial: { promotions: Promotion[]; birthday: BirthdaySettings };
  today: string;
  whatsappConfigured: boolean;
  /** the number written in the wishes (Locale e orari), "" if none */
  phone: string;
  /** guests who agreed to the birthday wishes (null: table not created yet) */
  consents: number | null;
}) {
  const router = useRouter();
  const toast = useToast();
  const [promotions, setPromotions] = useState(initial.promotions);
  const [birthday, setBirthday] = useState(initial.birthday);
  const [savedBirthday, setSavedBirthday] = useState(JSON.stringify(initial.birthday));
  // the promotion being edited (a copy), or null
  const [editing, setEditing] = useState<Promotion | null>(null);
  const [busy, start] = useTransition();

  const persist = (next: { promotions: Promotion[]; birthday: BirthdaySettings }, done: string, after?: () => void) =>
    start(async () => {
      const res = await savePromotionsAction(next);
      if (!res.ok) return toast(res.error, "error");
      setPromotions([...next.promotions].sort((a, b) => a.from.localeCompare(b.from)));
      setSavedBirthday(JSON.stringify(next.birthday));
      after?.();
      toast(done);
      router.refresh();
    });

  const savePromotion = (p: Promotion) => {
    const exists = promotions.some((x) => x.id === p.id);
    const list = exists ? promotions.map((x) => (x.id === p.id ? p : x)) : [...promotions, p];
    persist({ promotions: list, birthday: JSON.parse(savedBirthday) }, exists ? "Promozione aggiornata e pubblicata" : "Promozione pubblicata", () => setEditing(null));
  };
  const remove = (id: string) => persist({ promotions: promotions.filter((x) => x.id !== id), birthday: JSON.parse(savedBirthday) }, "Promozione eliminata");
  const toggle = (p: Promotion, enabled: boolean) =>
    persist({ promotions: promotions.map((x) => (x.id === p.id ? { ...x, enabled } : x)), birthday: JSON.parse(savedBirthday) }, enabled ? "Promozione attivata" : "Promozione spenta");

  const current = promotions.filter((p) => p.to >= today);
  const past = promotions.filter((p) => p.to < today);

  return (
    <div className="pb-12">
      <Link href={`${ADMIN_PATH}/locale`} className="mb-3 inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-cream/60 hover:text-cream">
        <IconChevron dir="left" className="h-4 w-4" /> Locale e orari
      </Link>
      <PageTitle title="Promozioni" subtitle="Sconti sulle prenotazioni e auguri di compleanno.">
        {!editing && (
          <button type="button" onClick={() => setEditing(blank(today))} className="btn btn-gold min-h-12 px-5 text-xs">
            <IconPlus className="h-4 w-4" /> Nuova
          </button>
        )}
      </PageTitle>

      <div className="space-y-5">
        {editing && !promotions.some((p) => p.id === editing.id) && (
          <Editor value={editing} onChange={setEditing} onCancel={() => setEditing(null)} onSave={savePromotion} busy={busy} today={today} />
        )}

        <Overview promotions={promotions} today={today} />

        <section aria-labelledby="promo-list">
          <h2 id="promo-list" className="text-[0.7rem] font-bold uppercase tracking-[0.22em] text-gold">
            Promozioni {current.length > 0 && `· ${current.length}`}
          </h2>
          {current.length === 0 && !editing && (
            <Card className="mt-3">
              <p className="text-cream/70">Nessuna promozione in corso o in programma.</p>
              <p className="mt-1 text-sm text-cream/50">Esempio: −20% dal martedì al giovedì, solo per chi arriva tra le 19:30 e le 20:30.</p>
            </Card>
          )}
          <ul className="mt-3 space-y-3">
            {current.map((p) =>
              editing?.id === p.id ? (
                <li key={p.id}>
                  <Editor value={editing} onChange={setEditing} onCancel={() => setEditing(null)} onSave={savePromotion} busy={busy} today={today} />
                </li>
              ) : (
                <PromoItem key={p.id} p={p} today={today} busy={busy} onEdit={() => setEditing({ ...p })} onToggle={(v) => toggle(p, v)} onRemove={() => remove(p.id)} />
              ),
            )}
          </ul>
          {past.length > 0 && (
            <details className="mt-4">
              <summary className="min-h-11 cursor-pointer py-2 text-sm font-semibold text-cream/60">Scadute ({past.length})</summary>
              <ul className="mt-2 space-y-3">
                {past.map((p) =>
                  editing?.id === p.id ? (
                    <li key={p.id}>
                      <Editor value={editing} onChange={setEditing} onCancel={() => setEditing(null)} onSave={savePromotion} busy={busy} today={today} />
                    </li>
                  ) : (
                    <PromoItem key={p.id} p={p} today={today} busy={busy} onEdit={() => setEditing({ ...p })} onToggle={(v) => toggle(p, v)} onRemove={() => remove(p.id)} />
                  ),
                )}
              </ul>
            </details>
          )}
        </section>

        <BirthdayCard
          value={birthday}
          onChange={setBirthday}
          dirty={JSON.stringify(birthday) !== savedBirthday}
          busy={busy}
          onSave={() => persist({ promotions, birthday }, "Auguri di compleanno salvati")}
          whatsappConfigured={whatsappConfigured}
          consents={consents}
          phone={phone}
        />
      </div>
    </div>
  );
}

/* ---------- list ---------- */

function PromoItem({
  p,
  today,
  busy,
  onEdit,
  onToggle,
  onRemove,
}: {
  p: Promotion;
  today: string;
  busy: boolean;
  onEdit: () => void;
  onToggle: (v: boolean) => void;
  onRemove: () => void;
}) {
  const [asking, setAsking] = useState(false);
  const st = STATE[promotionState(p, today)];
  return (
    <li className="rounded-lg border border-white/[0.07] bg-ink-2 p-4 md:p-5">
      <div className="flex items-start gap-4">
        <span className="grid h-14 w-16 shrink-0 place-items-center rounded-lg bg-ok/15 text-xl font-bold text-ok">{percentLabel(p.percent)}</span>
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-2">
            <span className="text-lg font-semibold leading-snug">{p.name}</span>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${st.cls}`}>{st.label}</span>
          </p>
          <p className="mt-1 text-cream/75">{capitalize(periodLabel(p))}</p>
          <p className="text-sm text-cream/60">
            {capitalize(weekdaysLabel(p))} · {hoursLabel(p)}
          </p>
          {p.conditions && <p className="mt-2 text-sm italic text-cream/60">“{p.conditions}”</p>}
        </div>
        <Toggle checked={p.enabled} onChange={onToggle} disabled={busy} />
      </div>
      {asking ? (
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/[0.06] pt-3">
          <span className="flex-1 text-sm">Eliminare la promozione? Chi ha già prenotato mantiene lo sconto.</span>
          <button type="button" onClick={() => setAsking(false)} className="btn btn-line min-h-11 px-4 text-xs">
            No
          </button>
          <button type="button" onClick={onRemove} disabled={busy} className="btn min-h-11 bg-ember px-4 text-xs text-ink disabled:opacity-60">
            Sì, elimina
          </button>
        </div>
      ) : (
        <div className="mt-3 flex gap-2 border-t border-white/[0.06] pt-3">
          <button type="button" onClick={onEdit} className="btn btn-line min-h-11 flex-1 px-4 text-xs">
            <IconEdit className="h-4 w-4" /> Modifica
          </button>
          <button type="button" onClick={() => setAsking(true)} className={iconBtn + " !h-11 !w-11"} aria-label={`Elimina ${p.name}`}>
            <IconTrash className="h-4 w-4" />
          </button>
        </div>
      )}
    </li>
  );
}

/** Month overview: the highest discount of every day, at a glance. */
function Overview({ promotions, today }: { promotions: Promotion[]; today: string }) {
  const [month, setMonth] = useState(monthStart(today));
  const s = { promotions };
  return (
    <Card>
      <MonthHeader month={month} onMonth={setMonth} canPrev={month > monthStart(today)} />
      <div className="mt-3 grid grid-cols-7 gap-1 text-center">
        {WEEK_ORDER.map((i) => (
          <abbr key={i} title={WEEKDAYS[i]} className="pb-1 text-xs font-semibold text-cream/45 no-underline">
            {WD_SHORT[i]}
          </abbr>
        ))}
        {monthCells(month).map((d, i) => {
          if (!d) return <span key={`e${i}`} />;
          const pct = bestPercentOn(s, d);
          const pastDay = d < today;
          return (
            <span
              key={d}
              className={`flex aspect-square min-h-10 flex-col items-center justify-center rounded-md text-sm font-semibold leading-none ${
                pct ? "bg-ok/15 text-cream" : "text-cream/55"
              } ${pastDay ? "opacity-40" : ""} ${d === today ? "ring-1 ring-gold" : ""}`}
              aria-label={`${Number(d.slice(8))}${pct ? `, sconto ${pct}%` : ""}`}
            >
              {Number(d.slice(8))}
              {pct > 0 && <span className="mt-0.5 text-[0.7rem] font-bold text-ok">{percentLabel(pct)}</span>}
            </span>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-cream/50">Lo sconto più alto del giorno, anche se vale solo in alcuni orari. Le promozioni spente non compaiono.</p>
    </Card>
  );
}

function MonthHeader({ month, onMonth, canPrev = true }: { month: string; onMonth: (m: string) => void; canPrev?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <button type="button" onClick={() => onMonth(shiftMonth(month, -1))} disabled={!canPrev} aria-label="Mese precedente" className={iconBtn + " !h-11 !w-11"}>
        <IconChevron dir="left" className="h-5 w-5" />
      </button>
      <p className="font-semibold capitalize" aria-live="polite">
        {formatMonthYear(month)}
      </p>
      <button type="button" onClick={() => onMonth(shiftMonth(month, 1))} aria-label="Mese successivo" className={iconBtn + " !h-11 !w-11"}>
        <IconChevron className="h-5 w-5" />
      </button>
    </div>
  );
}

/* ---------- editor ---------- */

function Editor({
  value: p,
  onChange,
  onCancel,
  onSave,
  busy,
  today,
}: {
  value: Promotion;
  onChange: (p: Promotion) => void;
  onCancel: () => void;
  onSave: (p: Promotion) => void;
  busy: boolean;
  today: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const up = (patch: Partial<Promotion>) => onChange({ ...p, ...patch });
  const custom = !PERCENTS.includes(p.percent);

  const submit = () => {
    const clean = { ...p, name: p.name.trim(), conditions: p.conditions.trim() };
    if (!clean.name) return setError("Dai un nome alla promozione (es. “Autunno a Prometeo”).");
    if (!(clean.percent >= 1 && clean.percent <= 90)) return setError("Lo sconto va da 1 a 90%.");
    if (clean.from > clean.to) return setError("Il primo giorno viene dopo l'ultimo.");
    if (!clean.allDay && clean.start > clean.end) return setError("L'ora di inizio viene dopo quella di fine.");
    setError(null);
    onSave(clean);
  };

  return (
    <Card className="border-gold/40">
      <h2 className="font-display text-lg tracking-[0.06em]">{p.name ? p.name : "Nuova promozione"}</h2>

      <div className="mt-5 space-y-6">
        <FieldLabel label="Nome" hint="Lo vede il cliente, es. “Autunno a Prometeo”">
          <input value={p.name} onChange={(e) => up({ name: e.target.value })} maxLength={60} className={smallInput} />
        </FieldLabel>

        <fieldset>
          <legend className="text-sm font-semibold text-cream/85">Sconto</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {PERCENTS.map((n) => (
              <Chip key={n} on={p.percent === n} onClick={() => up({ percent: n })}>
                {percentLabel(n)}
              </Chip>
            ))}
            <label className={`flex min-h-11 items-center gap-1 rounded-full border px-3 ${custom ? "border-gold bg-gold/15" : "border-white/15"}`}>
              <span className="sr-only">Altro sconto in percentuale</span>
              <span className="text-cream/60">−</span>
              <input
                type="number"
                inputMode="numeric"
                min={1}
                max={90}
                value={p.percent}
                onChange={(e) => up({ percent: Math.round(Number(e.target.value) || 0) })}
                className="w-10 bg-transparent text-center font-semibold [appearance:textfield] focus:outline-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <span className="text-cream/60">%</span>
            </label>
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-sm font-semibold text-cream/85">Periodo</legend>
          <p className="text-xs text-cream/50">Tocca il primo giorno e poi l&apos;ultimo (compresi).</p>
          <RangeCalendar from={p.from} to={p.to} today={today} onChange={(from, to) => up({ from, to })} />
          <div className="mt-3 grid grid-cols-2 gap-2">
            <FieldLabel label="Dal">
              <input type="date" value={p.from} onChange={(e) => e.target.value && up({ from: e.target.value })} className={`${smallInput} [color-scheme:dark]`} />
            </FieldLabel>
            <FieldLabel label="Al">
              <input type="date" value={p.to} min={p.from} onChange={(e) => e.target.value && up({ to: e.target.value })} className={`${smallInput} [color-scheme:dark]`} />
            </FieldLabel>
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-sm font-semibold text-cream/85">Giorni della settimana</legend>
          <p className="text-xs text-cream/50">{p.weekdays.length === 0 ? "Tutti i giorni del periodo. Tocca per sceglierne solo alcuni." : capitalize(weekdaysLabel(p))}</p>
          <div className="mt-2 grid grid-cols-7 gap-1.5">
            {WEEK_ORDER.map((d) => {
              const on = p.weekdays.includes(d);
              return (
                <button
                  key={d}
                  type="button"
                  aria-pressed={on}
                  aria-label={WEEKDAYS[d]}
                  onClick={() => up({ weekdays: on ? p.weekdays.filter((x) => x !== d) : [...p.weekdays, d].sort() })}
                  className={`grid min-h-11 place-items-center rounded-lg border text-sm font-semibold transition-colors ${
                    on ? "border-gold bg-gold/15 text-gold-light" : "border-white/10 text-cream/70 hover:border-white/25"
                  }`}
                >
                  {WD_SHORT[d]}
                </button>
              );
            })}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-sm font-semibold text-cream/85">Orario</legend>
          <div className="mt-2 grid grid-cols-2 gap-2" role="radiogroup" aria-label="Orario">
            <Chip on={p.allDay} onClick={() => up({ allDay: true })} wide>
              Tutto il giorno
            </Chip>
            <Chip on={!p.allDay} onClick={() => up({ allDay: false })} wide>
              Solo in certi orari
            </Chip>
          </div>
          {!p.allDay && (
            <>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <FieldLabel label="Dalle">
                  <input type="time" value={p.start} onChange={(e) => up({ start: e.target.value })} className={`${smallInput} [color-scheme:dark]`} />
                </FieldLabel>
                <FieldLabel label="Alle">
                  <input type="time" value={p.end} onChange={(e) => up({ end: e.target.value })} className={`${smallInput} [color-scheme:dark]`} />
                </FieldLabel>
              </div>
              <p className="mt-2 text-xs text-cream/50">Orario di arrivo del cliente, estremi compresi: es. dalle 19:30 alle 20:30 vale anche per le 20:30.</p>
            </>
          )}
        </fieldset>

        <FieldLabel label="Condizioni" hint="Le legge il cliente prima di prenotare, es. “Solo menu alla carta, bevande escluse. Non cumulabile.”">
          <textarea value={p.conditions} onChange={(e) => up({ conditions: e.target.value })} maxLength={300} rows={3} className={`${smallInput} py-3`} />
        </FieldLabel>

        {/* what the guest will see on the booking page */}
        <div>
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.22em] text-gold">Come lo vede il cliente</p>
          <div className="mt-2 flex gap-3 border-l-2 border-ok-deep bg-paper px-4 py-3.5 text-ink">
            <IconTag className="mt-0.5 h-5 w-5 shrink-0 text-ok-deep" />
            <div className="min-w-0">
              <p className="font-semibold">
                {percentLabel(p.percent || 0)} · {p.name || "Nome della promozione"}
              </p>
              <p className="mt-0.5 text-ink/75">{capitalize(hoursLabel(p))}</p>
              {p.conditions && <p className="mt-0.5 text-ink/75">{p.conditions}</p>}
            </div>
          </div>
        </div>

        <Toggle checked={p.enabled} onChange={(v) => up({ enabled: v })} label="Attiva" hint="Spenta, resta salvata ma non compare sul sito." />
      </div>

      {error && (
        <p role="alert" className="mt-5 rounded-md bg-ember/15 px-4 py-3 text-sm">
          {error}
        </p>
      )}
      <div className="mt-5 grid grid-cols-[auto_1fr] gap-3">
        <button type="button" onClick={onCancel} className="btn btn-line min-h-12 px-5 text-xs text-cream/85">
          Annulla
        </button>
        <button type="button" onClick={submit} disabled={busy} className="btn btn-gold min-h-12 px-5 text-xs disabled:opacity-60">
          {busy ? "Salvo…" : "Salva e pubblica"}
        </button>
      </div>
      <p className="mt-3 text-xs text-cream/50">Chi ha già prenotato mantiene lo sconto che ha visto, anche se cambi o elimini la promozione.</p>
    </Card>
  );
}

function Chip({ on, onClick, wide, children }: { on: boolean; onClick: () => void; wide?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={`min-h-11 rounded-full border px-4 text-sm font-semibold transition-colors ${wide ? "w-full" : ""} ${
        on ? "border-gold bg-gold/15 text-gold-light" : "border-white/15 text-cream/75 hover:border-white/30"
      }`}
    >
      {children}
    </button>
  );
}

/** Pick a period on a month grid: first tap = first day, second tap = last day. */
function RangeCalendar({ from, to, today, onChange }: { from: string; to: string; today: string; onChange: (from: string, to: string) => void }) {
  const [month, setMonth] = useState(monthStart(from < today ? today : from));
  // waiting for the last day after picking the first one
  const [picking, setPicking] = useState(false);

  const pick = (d: string) => {
    if (!picking || d < from) {
      onChange(d, d);
      setPicking(true);
    } else {
      onChange(from, d);
      setPicking(false);
    }
  };

  return (
    <div className="mt-3 rounded-lg border border-white/[0.07] p-3">
      <MonthHeader month={month} onMonth={setMonth} />
      <div className="mt-3 grid grid-cols-7 gap-1 text-center">
        {WEEK_ORDER.map((i) => (
          <abbr key={i} title={WEEKDAYS[i]} className="pb-1 text-xs font-semibold text-cream/45 no-underline">
            {WD_SHORT[i]}
          </abbr>
        ))}
        {monthCells(month).map((d, i) => {
          if (!d) return <span key={`e${i}`} />;
          const edge = d === from || d === to;
          const inside = d > from && d < to;
          return (
            <button
              key={d}
              type="button"
              onClick={() => pick(d)}
              // a period can't start in the past (an old one keeps its dates)
              disabled={d < today && !edge && !inside}
              aria-pressed={edge || inside}
              aria-label={capitalize(formatDateLong(d))}
              className={`grid aspect-square min-h-10 place-items-center rounded-md text-sm font-semibold transition-colors disabled:text-cream/25 ${
                edge ? "bg-gold text-ink" : inside ? "bg-gold/20 text-cream" : "text-cream/75 hover:bg-white/[0.06]"
              } ${d === today && !edge ? "ring-1 ring-gold/60" : ""}`}
            >
              {Number(d.slice(8))}
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-sm text-cream/75" aria-live="polite">
        {picking ? "Ora tocca l'ultimo giorno." : capitalize(periodLabel({ from, to } as Promotion))}
      </p>
    </div>
  );
}

/* ---------- birthday wishes ---------- */

function BirthdayCard({
  value: b,
  onChange,
  dirty,
  busy,
  onSave,
  whatsappConfigured,
  consents,
  phone,
}: {
  value: BirthdaySettings;
  onChange: (b: BirthdaySettings) => void;
  dirty: boolean;
  busy: boolean;
  onSave: () => void;
  whatsappConfigured: boolean;
  consents: number | null;
  phone: string;
}) {
  const up = (patch: Partial<BirthdaySettings>) => onChange({ ...b, ...patch });
  const preview = { birthday: b, phone, phone2: "" } as Settings;
  const noOffer = !birthdayOffer(b);
  // the preview: a birthday in a month, its days around it (closing days aside)
  const [sampleDay] = useState(() => addDays(romeNow().date, 30));
  const sample: BirthdayTerms = {
    dates: Array.from({ length: b.windowDays * 2 + 1 }, (_, i) => addDays(sampleDay, i - b.windowDays)),
    offerIt: b.offerIt,
    offerEn: b.offerEn,
  };
  // a long name must still fit in Meta's limit
  const tooLong = birthdayTooLong(birthdayValues("Maria Alessandra Della Valle Rossi", sampleDay, sample, preview));

  return (
    <Card>
      <h2 className="flex items-center gap-2 font-display text-lg tracking-[0.06em]">
        <IconGift className="h-5 w-5 text-gold" /> Auguri di compleanno
      </h2>
      <p className="mt-1 text-sm text-cream/55">
        Nel modulo di prenotazione compare il campo facoltativo “Il tuo compleanno” (giorno e mese) con un consenso a parte. A chi lo dà arriva su WhatsApp un messaggio di auguri con
        l&apos;offerta qui sotto e un link personale per prenotare intorno al compleanno: in Gestione la prenotazione compare solo quando il cliente la invia, sempre come
        richiesta da confermare (anche per una persona), con l&apos;etichetta “Compleanno” (le altre promozioni non valgono). L&apos;offerta si dà mostrando un documento con la data di nascita.
      </p>
      <p className="mt-2 text-sm text-cream/55">
        Ogni messaggio scrive le condizioni (offerta e giorni validi) e il link le mantiene: se qui cambi offerta o giorni, valgono per i prossimi
        auguri, non per quelli già inviati.
      </p>

      <div className="mt-5 space-y-5">
        <Toggle checked={b.enabled} onChange={(v) => up({ enabled: v })} label="Chiedi il compleanno e invia gli auguri" />

        <div className="grid gap-4 sm:grid-cols-2">
          <FieldLabel label="Offerta in italiano" hint="Completa “Per festeggiare insieme Le riserviamo…”">
            <input value={b.offerIt} onChange={(e) => up({ offerIt: e.target.value })} maxLength={60} className={smallInput} placeholder="es. un calice di benvenuto" />
          </FieldLabel>
          <FieldLabel label="Offerta in inglese" hint="La stessa offerta, per i clienti stranieri">
            <input value={b.offerEn} onChange={(e) => up({ offerEn: e.target.value })} maxLength={60} className={smallInput} placeholder="e.g. a welcome glass of wine" />
          </FieldLabel>
          <FieldLabel label="Quando inviarli">
            <select value={b.daysBefore} onChange={(e) => up({ daysBefore: Number(e.target.value) })} className={smallInput}>
              {[0, 3, 5, 7, 10, 14].map((n) => (
                <option key={n} value={n}>
                  {n === 0 ? "il giorno del compleanno" : `${n} giorni prima`}
                </option>
              ))}
            </select>
          </FieldLabel>
          <FieldLabel label="Giorni prenotabili col link" hint="Intorno al compleanno, solo giorni aperti. Se il compleanno è un giorno di chiusura si aggiungono il giorno aperto prima e quello dopo.">
            <select value={b.windowDays} onChange={(e) => up({ windowDays: Number(e.target.value) })} className={smallInput}>
              {[0, 1, 2, 3, 5, 7, 10, 14].map((n) => (
                <option key={n} value={n}>
                  {n === 0 ? "solo il giorno del compleanno" : `da ${n} ${n === 1 ? "giorno" : "giorni"} prima a ${n} dopo`}
                </option>
              ))}
            </select>
          </FieldLabel>
        </div>
        {b.windowDays > b.daysBefore && (
          <p className="text-sm text-cream/60">
            Gli auguri partono {b.daysBefore === 0 ? "il giorno del compleanno" : `${b.daysBefore} giorni prima`}: i giorni del link prima di quella data saranno già passati.
          </p>
        )}

        {b.enabled && noOffer && <p className="rounded-md bg-ember/15 px-4 py-3 text-sm">Scrivi l&apos;offerta: senza, gli auguri non partono (il campo sul sito compare comunque).</p>}
        {b.enabled && !phone && (
          <p className="rounded-md bg-ember/15 px-4 py-3 text-sm">
            Manca il telefono in{" "}
            <Link href={`${ADMIN_PATH}/locale`} className="font-semibold underline underline-offset-4">
              Locale e orari
            </Link>
            : il messaggio invita a chiamare, senza numero gli auguri non partono.
          </p>
        )}

        <div>
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.22em] text-gold">Anteprima del messaggio</p>
          <p className="mt-1 text-sm text-cream/55">Esempio con un compleanno il {formatDateLong(sampleDay)}.</p>
          <p className="mt-2 whitespace-pre-line rounded-xl bg-chat px-4 py-3 text-[0.95rem] leading-relaxed">
            {birthdayText("Mario Rossi", sampleDay, sample, preview, "K7M2QX9T")}
          </p>
          {tooLong && (
            <p className="mt-2 rounded-md bg-ember/15 px-4 py-3 text-sm">Il messaggio è troppo lungo per WhatsApp: accorcia l&apos;offerta.</p>
          )}
        </div>

        <ul className="space-y-1.5 text-sm text-cream/60">
          <li>
            {consents === null
              ? "Per salvare i compleanni va eseguita su Supabase la migrazione 2026-10-25_promozioni-compleanni.sql."
              : `${consents} ${consents === 1 ? "cliente ha" : "clienti hanno"} dato il consenso.`}{" "}
            <Link href={`${ADMIN_PATH}/clienti#compleanni`} className="font-semibold text-cream underline underline-offset-4">
              Compleanni in arrivo
            </Link>
          </li>
          <li>
            {whatsappConfigured
              ? `Partono da soli ogni mattina, dal numero del ristorante, quando Meta ha approvato il modello “${BIRTHDAY_TEMPLATE.name}”.`
              : "WhatsApp automatico non collegato: li invii a mano da Clienti → Compleanni in arrivo."}
          </li>
          <li>Chi risponde STOP non li riceve più. Dopo 24 mesi senza nuove prenotazioni la data viene cancellata.</li>
        </ul>
      </div>

      <div className="mt-5 flex justify-end">
        <button type="button" onClick={onSave} disabled={busy || !dirty} className="btn btn-gold min-h-12 px-6 text-xs disabled:opacity-40">
          {busy ? "Salvo…" : dirty ? "Salva" : "Salvato"}
        </button>
      </div>
    </Card>
  );
}
