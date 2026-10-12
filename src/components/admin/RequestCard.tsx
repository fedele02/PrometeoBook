"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { acceptBookingAction, declineBookingAction } from "@/app/gestore-prometeo-2026/actions";
import { acceptMessage, DECLINE_REASONS, declineMessage, type DeclineReason } from "@/lib/messages";
import { telHref, whatsappHref } from "@/lib/site";
import { capitalize, formatDateLong, serviceLabel } from "@/lib/time";
import type { Booking, Settings } from "@/lib/types";
import { IconCheck, IconNote, IconPhone, IconUser, IconWhatsapp } from "../Icons";
import { useToast } from "./ui";

export type Request = Booking & { history: string; ago: string };

const guests = (n: number) => `${n} ${n === 1 ? "persona" : "persone"}`;

/**
 * A request waiting for an answer. Accept or refuse here, then WhatsApp opens
 * with the message for the guest already written (the staff just taps send).
 */
export function RequestCard({ b, settings, showDate, fresh }: { b: Request; settings: Settings; showDate?: boolean; fresh?: boolean }) {
  const router = useRouter();
  const toast = useToast();
  const [busy, start] = useTransition();
  const [declining, setDeclining] = useState(false);
  const [reason, setReason] = useState<DeclineReason>("full");
  const [text, setText] = useState(() => declineMessage(b, settings, "full"));

  const when = `${showDate ? `${capitalize(formatDateLong(b.date))} · ` : ""}ore ${b.time} · ${serviceLabel(b.time)}`;

  const run = (action: (id: string) => Promise<{ ok: boolean; error?: string }>, done: string) =>
    start(async () => {
      const res = await action(b.id);
      if (res.ok) {
        toast(done);
        router.refresh();
      } else toast(res.error ?? "Errore", "error");
    });

  const pickReason = (r: DeclineReason) => {
    setReason(r);
    setText(declineMessage(b, settings, r));
  };

  if (declining)
    return (
      <article id={`b-${b.id}`} className="scroll-mt-24 rounded-2xl border-[1.5px] border-ember/60 bg-ink-2 p-4 min-[360px]:p-5">
        <p className="flex items-center gap-2 text-[0.7rem] font-bold uppercase tracking-[0.2em] text-ember">
          <span className="h-2 w-2 rounded-full bg-ember" aria-hidden /> Rifiuta la richiesta
        </p>
        <h3 className="mt-2 text-[1.3rem] font-semibold leading-snug">{b.name}</h3>
        <p className="mt-0.5 text-cream/80">
          {guests(b.people)} · {capitalize(formatDateLong(b.date))} · ore {b.time}
        </p>

        <div className="mt-5 border-t border-white/[0.08] pt-5">
          <h4 className="font-display text-[1.05rem] tracking-[0.04em]">Perché non puoi accettarla?</h4>
          <div role="radiogroup" aria-label="Motivo" className="mt-3 grid gap-2">
            {DECLINE_REASONS.map((r) => {
              const on = reason === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => pickReason(r.id)}
                  className={`flex min-h-12 items-center gap-3 rounded-xl border px-4 text-left transition-colors ${
                    on ? "border-ember/70 bg-ember/15 font-semibold" : "border-white/10 bg-white/[0.04] text-cream/80 hover:border-white/25"
                  }`}
                >
                  <span className={`grid h-4 w-4 shrink-0 place-items-center rounded-full border ${on ? "border-ember bg-ember" : "border-cream/40"}`} aria-hidden>
                    {on && <span className="h-1.5 w-1.5 rounded-full bg-ink-2" />}
                  </span>
                  {r.label}
                </button>
              );
            })}
          </div>

          <label className="mt-5 block">
            <span className="text-[0.7rem] font-bold uppercase tracking-[0.2em] text-gold">Messaggio WhatsApp</span>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={6}
              className="mt-2 block w-full resize-y rounded-xl border border-transparent bg-chat px-4 py-3 text-[0.95rem] leading-relaxed text-cream focus:border-gold focus:outline-none"
            />
          </label>
          <p className="mt-2 text-sm text-cream/50">Puoi modificare il testo prima di inviarlo.</p>
        </div>

        <div className="mt-5 grid grid-cols-[auto_1fr] gap-3">
          <button type="button" onClick={() => setDeclining(false)} className="btn btn-line min-h-12 px-5 text-xs text-cream/85">
            Indietro
          </button>
          <a
            href={whatsappHref(b.phone, text)}
            target="_blank"
            rel="noopener"
            aria-disabled={busy}
            onClick={() => run(declineBookingAction, "Rifiutata · messaggio pronto su WhatsApp")}
            className="btn min-h-12 bg-ember px-4 text-xs text-ink hover:bg-ember/90"
          >
            <IconWhatsapp className="h-5 w-5" /> Rifiuta e invia
          </a>
        </div>
        <p className="mt-3 text-sm text-cream/50">La richiesta passa a “Rifiutata” e i posti tornano liberi.</p>
      </article>
    );

  return (
    <article id={`b-${b.id}`} className={`scroll-mt-24 rounded-2xl bg-ink-2 p-4 min-[360px]:p-5 ${fresh ? "border-[1.5px] border-gold/55" : "border border-ember/35"}`}>
      <p className="flex items-center gap-2 text-[0.7rem] font-bold uppercase tracking-[0.2em] text-ember">
        <span className="h-2 w-2 rounded-full bg-ember" aria-hidden />
        {fresh ? `Nuova richiesta · ${b.ago}` : `Arrivata ${b.ago}`}
      </p>
      <h3 className="mt-2 text-[1.3rem] font-semibold leading-snug">{b.name}</h3>
      <p className="mt-0.5 text-cream/80">
        {guests(b.people)} · {when}
      </p>
      <p className="mt-3 flex items-start gap-2 text-sm font-semibold text-gold-light">
        <IconUser className="mt-px h-4 w-4 shrink-0" /> {b.history}
      </p>
      {b.notes && (
        <p className="mt-2 flex items-start gap-2 text-[0.95rem] italic text-gold-light">
          <IconNote className="mt-1 h-4 w-4 shrink-0 not-italic" /> “{b.notes}”
        </p>
      )}

      {/* the narrowest phones (320 px) get tighter letter spacing and no tick icon */}
      <div className="mt-4 grid grid-cols-[1fr_1fr_3rem] gap-2 min-[360px]:gap-2.5">
        <a
          href={whatsappHref(b.phone, acceptMessage(b, settings))}
          target="_blank"
          rel="noopener"
          aria-disabled={busy}
          onClick={() => run(acceptBookingAction, "Accettata · messaggio pronto su WhatsApp")}
          className="btn btn-gold min-h-12 min-w-0 px-2 text-xs tracking-[0.1em] min-[360px]:tracking-[0.18em]"
        >
          <IconCheck className="hidden h-5 w-5 min-[360px]:block" strokeWidth={2.2} /> Accetta
        </a>
        <button type="button" onClick={() => setDeclining(true)} className="btn min-h-12 min-w-0 border border-ember/70 px-2 text-xs tracking-[0.1em] text-ember hover:bg-ember/10 min-[360px]:tracking-[0.18em]">
          Rifiuta
        </button>
        <a href={telHref(b.phone)} aria-label={`Chiama ${b.name}`} className="btn btn-line min-h-12 w-full px-0 text-cream/85">
          <IconPhone className="h-5 w-5" />
        </a>
      </div>
    </article>
  );
}
