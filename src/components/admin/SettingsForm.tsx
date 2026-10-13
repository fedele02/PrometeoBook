"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { saveSettingsAction } from "@/app/gestore-prometeo-2026/actions";
import { WEEKDAYS, WEEK_ORDER, formatDateLong, romeNow } from "@/lib/time";
import type { Settings } from "@/lib/types";
import { IconPlus, IconTrash } from "../Icons";
import { Card, FieldLabel, PageTitle, Toggle, iconBtn, smallInput, useToast } from "./ui";

/** What the server knows about the WhatsApp connection (YCloud env vars). */
export type WhatsappSetup = { configured: boolean; webhook: boolean; from: string | null };

export function SettingsForm({ initial, whatsapp }: { initial: Settings; whatsapp: WhatsappSetup }) {
  const router = useRouter();
  const toast = useToast();
  const [s, setS] = useState(initial);
  const [saved, setSaved] = useState(JSON.stringify(initial));
  const [busy, start] = useTransition();
  const dirty = JSON.stringify(s) !== saved;

  // don't lose edits by closing the tab
  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => e.preventDefault();
    addEventListener("beforeunload", h);
    return () => removeEventListener("beforeunload", h);
  }, [dirty]);

  const up = (patch: Partial<Settings>) => setS((x) => ({ ...x, ...patch }));
  const upBooking = (patch: Partial<Settings["booking"]>) => setS((x) => ({ ...x, booking: { ...x.booking, ...patch } }));
  const setDay = (i: number, day: Settings["hours"][number]) =>
    setS((x) => {
      const hours = [...x.hours] as Settings["hours"];
      hours[i] = day;
      return { ...x, hours };
    });

  const save = () =>
    start(async () => {
      const clean = {
        ...s,
        features: s.features.map((f) => f.trim()).filter(Boolean),
        reviews: s.reviews.filter((r) => r.quote.trim() && r.author.trim()),
        faq: s.faq.filter((f) => f.q.trim() && f.a.trim()),
      };
      const res = await saveSettingsAction(clean);
      if (res.ok) {
        setS(clean);
        setSaved(JSON.stringify(clean));
        toast("Modifiche salvate e pubblicate");
        router.refresh();
      } else toast(res.error, "error");
    });

  const num = (v: string) => Math.max(0, Math.round(Number(v) || 0));
  const missing = [!s.phone && "telefono", !s.email && "email"].filter(Boolean);

  return (
    <div className="pb-24">
      <PageTitle title="Locale e orari" subtitle="Informazioni mostrate sul sito e regole delle prenotazioni." />

      {missing.length > 0 && (
        <p className="mb-5 rounded-md border border-ember/30 bg-ember/10 px-4 py-3 text-sm">
          Da completare: <b>{missing.join(", ")}</b>. Senza telefono il sito non mostra il tasto “Chiama”.
        </p>
      )}

      <div className="space-y-5">
        {/* ---------- announcement ---------- */}
        <Card>
          <Toggle
            checked={s.announcement.enabled}
            onChange={(v) => up({ announcement: { ...s.announcement, enabled: v } })}
            label="Avviso in cima al sito"
            hint="es. “Chiusi per ferie dal 10 al 20 gennaio”"
          />
          {s.announcement.enabled && (
            <input
              value={s.announcement.text}
              onChange={(e) => up({ announcement: { ...s.announcement, text: e.target.value } })}
              maxLength={200}
              className={`${smallInput} mt-4`}
              placeholder="Testo dell'avviso"
            />
          )}
        </Card>

        {/* ---------- hours ---------- */}
        <Card>
          <h2 className="font-display text-lg tracking-[0.06em]">Orari di apertura</h2>
          <p className="mt-1 text-sm text-cream/55">Per ogni giorno puoi avere uno o più turni (es. pranzo e cena).</p>
          <ul className="mt-5 divide-y divide-white/5">
            {WEEK_ORDER.map((i) => {
              const day = s.hours[i];
              const open = !day.closed;
              return (
                <li key={i} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between gap-3">
                    <span className="w-28 font-semibold">{WEEKDAYS[i]}</span>
                    <span className={`flex-1 text-sm ${open ? "text-emerald-300" : "text-cream/40"}`}>{open ? "Aperto" : "Chiuso"}</span>
                    <Toggle
                      checked={open}
                      onChange={(v) =>
                        setDay(i, { closed: !v, services: v && !day.services.length ? [{ open: "19:30", close: "23:00" }] : day.services })
                      }
                    />
                  </div>
                  {open && (
                    <div className="mt-3 space-y-2">
                      {day.services.map((svc, si) => (
                        <div key={si} className="flex items-center gap-2">
                          <input
                            type="time"
                            value={svc.open}
                            onChange={(e) => setDay(i, { ...day, services: day.services.map((x, k) => (k === si ? { ...x, open: e.target.value } : x)) })}
                            className={`${smallInput} [color-scheme:dark]`}
                            aria-label="Apertura"
                          />
                          <span className="text-cream/40">–</span>
                          <input
                            type="time"
                            value={svc.close}
                            onChange={(e) => setDay(i, { ...day, services: day.services.map((x, k) => (k === si ? { ...x, close: e.target.value } : x)) })}
                            className={`${smallInput} [color-scheme:dark]`}
                            aria-label="Chiusura"
                          />
                          <button
                            onClick={() => setDay(i, { ...day, services: day.services.filter((_, k) => k !== si) })}
                            className={iconBtn}
                            aria-label="Rimuovi turno"
                          >
                            <IconTrash className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                      {day.services.length < 3 && (
                        <button
                          onClick={() => setDay(i, { ...day, services: [...day.services, { open: "12:30", close: "15:00" }] })}
                          className="flex items-center gap-1.5 text-sm font-semibold text-gold-light"
                        >
                          <IconPlus className="h-4 w-4" /> Aggiungi turno
                        </button>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
          <button
            onClick={() => {
              const ref = s.hours[WEEK_ORDER.find((i) => !s.hours[i].closed) ?? 2];
              const hours = s.hours.map((d) => (d.closed ? d : structuredClone(ref))) as Settings["hours"];
              up({ hours });
            }}
            className="mt-5 text-sm font-semibold text-cream/60 underline underline-offset-4"
          >
            Copia gli orari del primo giorno aperto su tutti i giorni aperti
          </button>
        </Card>

        {/* ---------- closures ---------- */}
        <Closures value={s.closures} onChange={(closures) => up({ closures })} />

        {/* ---------- bookings ---------- */}
        <Card>
          <h2 className="font-display text-lg tracking-[0.06em]">Prenotazioni online</h2>
          <div className="mt-5 space-y-5">
            <Toggle checked={s.booking.enabled} onChange={(v) => upBooking({ enabled: v })} label="Accetta prenotazioni dal sito" />
            <Toggle
              checked={whatsapp.configured && s.booking.whatsappAuto}
              disabled={!whatsapp.configured}
              onChange={(v) => upBooking({ whatsappAuto: v })}
              label="Messaggi WhatsApp automatici"
              hint={
                whatsapp.configured
                  ? `Richiesta ricevuta, conferma, rifiuto e annullamento partono da soli dal numero ${whatsapp.from}. Se spento, l'app apre WhatsApp con il messaggio pronto.`
                  : "Non ancora collegati (YCloud, vedi README): per ora l'app apre WhatsApp con il messaggio pronto da inviare."
              }
            />
            {whatsapp.configured && !whatsapp.webhook && (
              <p className="rounded-xl bg-ember/15 px-4 py-3 text-sm">
                Manca il webhook di YCloud: i messaggi partono, ma l&apos;app non sa se sono stati consegnati o letti. Esegui <code>npm run whatsapp -- webhook</code> e imposta <code>YCLOUD_WEBHOOK_SECRET</code>.
              </p>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <FieldLabel label="Coperti massimi per servizio" hint="Persone in tutto a pranzo e, separatamente, a cena. Raggiunto il limite il sito risponde “siamo al completo”">
                <input type="number" min={1} value={s.booking.maxCoversPerService} onChange={(e) => upBooking({ maxCoversPerService: num(e.target.value) })} className={smallInput} />
              </FieldLabel>
              <FieldLabel label="Conferma automatica fino a" hint="persone: confermate subito. Oltre, e fino ai coperti del servizio, sono richieste che conferma lo staff (0 = sempre lo staff)">
                <input type="number" min={0} value={s.booking.autoConfirmUpTo} onChange={(e) => upBooking({ autoConfirmUpTo: num(e.target.value) })} className={smallInput} />
              </FieldLabel>
              <FieldLabel label="Intervallo tra gli orari">
                <select value={s.booking.slotMinutes} onChange={(e) => upBooking({ slotMinutes: Number(e.target.value) })} className={smallInput}>
                  {[15, 30, 45, 60].map((m) => (
                    <option key={m} value={m}>
                      ogni {m} minuti
                    </option>
                  ))}
                </select>
              </FieldLabel>
              <FieldLabel label="Ultima prenotazione prima della chiusura" hint="in minuti">
                <input type="number" min={0} value={s.booking.lastBookingBeforeClose} onChange={(e) => upBooking({ lastBookingBeforeClose: num(e.target.value) })} className={smallInput} />
              </FieldLabel>
              <FieldLabel label="Preavviso minimo" hint="in minuti, per le prenotazioni in giornata">
                <input type="number" min={0} value={s.booking.minNoticeMinutes} onChange={(e) => upBooking({ minNoticeMinutes: num(e.target.value) })} className={smallInput} />
              </FieldLabel>
              <FieldLabel label="Prenotabile fino a" hint="giorni nel futuro">
                <input type="number" min={1} value={s.booking.daysAhead} onChange={(e) => upBooking({ daysAhead: num(e.target.value) })} className={smallInput} />
              </FieldLabel>
            </div>
          </div>
        </Card>

        {/* ---------- contacts ---------- */}
        <Card>
          <h2 className="font-display text-lg tracking-[0.06em]">Contatti</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <FieldLabel label="Telefono principale" hint="Usato dai tasti “Chiama”">
              <input type="tel" value={s.phone} onChange={(e) => up({ phone: e.target.value })} className={smallInput} placeholder="+39 0835 …" />
            </FieldLabel>
            <FieldLabel label="Secondo telefono" hint="Facoltativo">
              <input type="tel" value={s.phone2} onChange={(e) => up({ phone2: e.target.value })} className={smallInput} />
            </FieldLabel>
            <FieldLabel label="Email">
              <input type="email" value={s.email} onChange={(e) => up({ email: e.target.value })} className={smallInput} />
            </FieldLabel>
            <FieldLabel label="Indirizzo">
              <input value={s.address} onChange={(e) => up({ address: e.target.value })} className={smallInput} />
            </FieldLabel>
            <FieldLabel label="CAP e città">
              <input value={s.city} onChange={(e) => up({ city: e.target.value })} className={smallInput} />
            </FieldLabel>
            <FieldLabel label="Link Google Maps">
              <input value={s.mapsUrl} onChange={(e) => up({ mapsUrl: e.target.value })} className={smallInput} />
            </FieldLabel>
            <FieldLabel label="Instagram (link)">
              <input value={s.instagram} onChange={(e) => up({ instagram: e.target.value })} className={smallInput} placeholder="https://instagram.com/…" />
            </FieldLabel>
            <FieldLabel label="Facebook (link)">
              <input value={s.facebook} onChange={(e) => up({ facebook: e.target.value })} className={smallInput} placeholder="https://facebook.com/…" />
            </FieldLabel>
          </div>
        </Card>

        {/* ---------- texts ---------- */}
        <Card>
          <h2 className="font-display text-lg tracking-[0.06em]">Testi del sito</h2>
          <div className="mt-5 grid gap-4">
            <FieldLabel label="Motto sotto il logo" hint="es. Accendi il gusto">
              <input value={s.tagline} onChange={(e) => up({ tagline: e.target.value })} className={smallInput} />
            </FieldLabel>
            <FieldLabel label="Frase del footer" hint="In fondo a ogni pagina">
              <input value={s.footerLine} onChange={(e) => up({ footerLine: e.target.value })} className={smallInput} />
            </FieldLabel>
            <FieldLabel label="Frase grande in homepage">
              <textarea value={s.about} onChange={(e) => up({ about: e.target.value })} rows={2} className={`${smallInput} py-3`} />
            </FieldLabel>
            <FieldLabel label="Presentazione" hint="Il paragrafo sotto la frase">
              <textarea value={s.intro} onChange={(e) => up({ intro: e.target.value })} rows={4} className={`${smallInput} py-3`} />
            </FieldLabel>
            <FieldLabel label="Punti di forza" hint="Uno per riga (es. Terrazza all'aperto)">
              <textarea
                value={s.features.join("\n")}
                onChange={(e) => up({ features: e.target.value.split("\n") })}
                onBlur={() => up({ features: s.features.map((f) => f.trim()).filter(Boolean) })}
                rows={4}
                className={`${smallInput} py-3`}
              />
            </FieldLabel>
          </div>
        </Card>

        {/* ---------- reviews ---------- */}
        <Card>
          <h2 className="font-display text-lg tracking-[0.06em]">Recensioni in homepage</h2>
          <p className="mt-1 text-sm text-cream/55">Brevi estratti di recensioni vere, con nome e piattaforma (es. Tripadvisor, TheFork, Google).</p>
          <div className="mt-5 space-y-4">
            {s.reviews.map((r, i) => (
              <div key={i} className="space-y-3 rounded-md border border-white/10 p-4">
                <textarea
                  value={r.quote}
                  onChange={(e) => up({ reviews: s.reviews.map((x, k) => (k === i ? { ...x, quote: e.target.value } : x)) })}
                  rows={2}
                  maxLength={300}
                  placeholder="Testo della recensione"
                  className={`${smallInput} py-3`}
                />
                <div className="flex gap-2">
                  <input
                    value={r.author}
                    onChange={(e) => up({ reviews: s.reviews.map((x, k) => (k === i ? { ...x, author: e.target.value } : x)) })}
                    placeholder="Nome (es. Anna P.)"
                    className={smallInput}
                  />
                  <input
                    value={r.source}
                    onChange={(e) => up({ reviews: s.reviews.map((x, k) => (k === i ? { ...x, source: e.target.value } : x)) })}
                    placeholder="Piattaforma"
                    className={smallInput}
                  />
                  <button onClick={() => up({ reviews: s.reviews.filter((_, k) => k !== i) })} className={iconBtn} aria-label="Rimuovi recensione">
                    <IconTrash className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
            {s.reviews.length < 12 && (
              <button
                onClick={() => up({ reviews: [...s.reviews, { quote: "", author: "", source: "Tripadvisor" }] })}
                className="flex items-center gap-1.5 text-sm font-semibold text-gold-light"
              >
                <IconPlus className="h-4 w-4" /> Aggiungi recensione
              </button>
            )}
          </div>
        </Card>

        {/* ---------- faq ---------- */}
        <Card>
          <h2 className="font-display text-lg tracking-[0.06em]">Domande frequenti</h2>
          <p className="mt-1 text-sm text-cream/55">Compaiono in homepage e su Google.</p>
          <div className="mt-5 space-y-4">
            {s.faq.map((f, i) => (
              <div key={i} className="space-y-3 rounded-md border border-white/10 p-4">
                <div className="flex gap-2">
                  <input
                    value={f.q}
                    onChange={(e) => up({ faq: s.faq.map((x, k) => (k === i ? { ...x, q: e.target.value } : x)) })}
                    placeholder="Domanda"
                    className={smallInput}
                  />
                  <button onClick={() => up({ faq: s.faq.filter((_, k) => k !== i) })} className={iconBtn} aria-label="Rimuovi domanda">
                    <IconTrash className="h-4 w-4" />
                  </button>
                </div>
                <textarea
                  value={f.a}
                  onChange={(e) => up({ faq: s.faq.map((x, k) => (k === i ? { ...x, a: e.target.value } : x)) })}
                  rows={2}
                  placeholder="Risposta"
                  className={`${smallInput} py-3`}
                />
              </div>
            ))}
            {s.faq.length < 20 && (
              <button onClick={() => up({ faq: [...s.faq, { q: "", a: "" }] })} className="flex items-center gap-1.5 text-sm font-semibold text-gold-light">
                <IconPlus className="h-4 w-4" /> Aggiungi domanda
              </button>
            )}
          </div>
        </Card>

        {/* ---------- rating ---------- */}
        <Card>
          <h2 className="font-display text-lg tracking-[0.06em]">Recensioni</h2>
          <p className="mt-1 text-sm text-cream/55">Il voto mostrato in homepage. Lascia il voto vuoto per nascondere la sezione.</p>
          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <FieldLabel label="Voto">
              <input value={s.rating.score} onChange={(e) => up({ rating: { ...s.rating, score: e.target.value } })} className={smallInput} placeholder="9,8" />
            </FieldLabel>
            <FieldLabel label="N. recensioni">
              <input value={s.rating.count} onChange={(e) => up({ rating: { ...s.rating, count: e.target.value } })} className={smallInput} />
            </FieldLabel>
            <FieldLabel label="Fonte">
              <input value={s.rating.source} onChange={(e) => up({ rating: { ...s.rating, source: e.target.value } })} className={smallInput} />
            </FieldLabel>
            <FieldLabel label="Link">
              <input value={s.rating.url} onChange={(e) => up({ rating: { ...s.rating, url: e.target.value } })} className={smallInput} />
            </FieldLabel>
          </div>
        </Card>
      </div>

      {/* sticky save bar */}
      <div
        className={`fixed inset-x-0 bottom-16 z-20 px-4 pb-[env(safe-area-inset-bottom)] transition-all duration-300 md:bottom-6 md:left-64 ${
          dirty ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"
        }`}
      >
        <div className="mx-auto flex max-w-3xl items-center gap-3 rounded-md border border-gold/30 bg-ink-3/95 p-3 shadow-2xl backdrop-blur">
          <span className="flex-1 pl-2 text-sm text-cream/80">Modifiche non salvate</span>
          <button onClick={() => setS(JSON.parse(saved))} className="btn min-h-11 px-4 text-sm text-cream/60">
            Annulla
          </button>
          <button onClick={save} disabled={busy} className="btn btn-gold min-h-11 px-5 text-sm">
            {busy ? "Salvo…" : "Salva"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Closures({ value, onChange }: { value: Settings["closures"]; onChange: (v: Settings["closures"]) => void }) {
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");
  const today = romeNow().date;
  const upcoming = value.filter((c) => c.date >= today);

  const add = () => {
    if (!date || value.some((c) => c.date === date)) return;
    onChange([...value, { date, note: note.trim() }].sort((a, b) => a.date.localeCompare(b.date)));
    setDate("");
    setNote("");
  };

  return (
    <Card>
      <h2 className="font-display text-lg tracking-[0.06em]">Chiusure straordinarie</h2>
      <p className="mt-1 text-sm text-cream/55">Ferie, festività, eventi privati: in quei giorni non si potrà prenotare.</p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <input type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)} className={`${smallInput} [color-scheme:dark] sm:w-48`} />
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Motivo (facoltativo)" className={smallInput} />
        <button onClick={add} disabled={!date} className="btn btn-line min-h-12 shrink-0 px-5 text-sm disabled:opacity-40">
          <IconPlus className="h-4 w-4" /> Aggiungi
        </button>
      </div>
      {upcoming.length > 0 && (
        <ul className="mt-4 space-y-2">
          {upcoming.map((c) => (
            <li key={c.date} className="flex items-center gap-3 rounded-xl bg-white/[0.04] px-4 py-2.5">
              <span className="flex-1">
                <span className="font-semibold capitalize">{formatDateLong(c.date)}</span>
                {c.note && <span className="text-cream/55"> · {c.note}</span>}
              </span>
              <button onClick={() => onChange(value.filter((x) => x.date !== c.date))} className={iconBtn} aria-label="Rimuovi">
                <IconTrash className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
