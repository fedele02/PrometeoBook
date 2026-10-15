"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Availability } from "@/app/(site)/prenota/actions";
import { telHref } from "@/lib/site";
import { IconCheck, IconMinus, IconPhone, IconPlus } from "../Icons";

/* Building blocks shared by the booking wizard and the guest's own booking page. */

export function Title({ children }: { children: React.ReactNode }) {
  return <h2 className="text-[1.6rem] font-semibold leading-tight">{children}</h2>;
}

export function Choice({
  children,
  selected,
  disabled,
  onClick,
  className = "",
}: {
  children: React.ReactNode;
  selected?: boolean;
  disabled?: boolean;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      className={`flex items-center justify-center gap-0.5 border font-semibold transition active:scale-[0.97] ${
        selected ? "border-ink bg-ink text-cream" : "border-ink/15 bg-white text-ink hover:border-ink"
      } disabled:pointer-events-none disabled:bg-paper disabled:text-ink/30 ${className}`}
    >
      {children}
    </button>
  );
}

export function MorePeople({ max, value, onPick }: { max: number; value: number | null; onPick: (n: number) => void }) {
  const [n, setN] = useState(value && value > 8 ? value : 9);
  return (
    <div className="mt-3 flex items-center gap-2 border border-ink/15 p-2.5">
      <span className="flex-1 pl-2 font-semibold">Più persone</span>
      <button type="button" onClick={() => setN(Math.max(9, n - 1))} aria-label="Meno" className="grid h-12 w-12 place-items-center border border-ink/15">
        <IconMinus className="h-5 w-5" />
      </button>
      <span className="w-9 text-center text-2xl font-semibold" aria-live="polite">
        {n}
      </span>
      <button type="button" onClick={() => setN(Math.min(max, n + 1))} aria-label="Più" className="grid h-12 w-12 place-items-center border border-ink/15">
        <IconPlus className="h-5 w-5" />
      </button>
      <button type="button" onClick={() => onPick(n)} className="btn btn-dark min-h-12 px-5">
        Ok
      </button>
    </div>
  );
}

export function Slots({
  avail,
  loading,
  time,
  onPick,
  onChangeDay,
  phone,
}: {
  avail: Availability | null;
  loading: boolean;
  time: string | null;
  onPick: (t: string) => void;
  onChangeDay: () => void;
  phone: string;
}) {
  if (loading || !avail)
    return (
      <div className="mt-6 grid grid-cols-3 gap-2.5" aria-busy>
        {Array.from({ length: 9 }, (_, i) => (
          <div key={i} className="h-14 animate-pulse bg-paper" />
        ))}
      </div>
    );

  const allFull = !avail.closed && avail.services.every((s) => s.slots.every((x) => !x.free));
  if (avail.closed || allFull)
    return (
      <div className="mt-6 border border-ink/15 bg-paper p-5">
        <p className="text-lg font-semibold">{avail.closed ? avail.reason : "Questo giorno è al completo."}</p>
        <p className="mt-1 text-ink/60">Prova con un altro giorno{phone ? " oppure chiamaci" : ""}.</p>
        <button type="button" onClick={onChangeDay} className="btn btn-dark mt-5 w-full">
          Scegli un altro giorno
        </button>
        {phone && (
          <a href={telHref(phone)} className="btn btn-line mt-3 w-full">
            <IconPhone className="h-5 w-5" /> Chiama
          </a>
        )}
      </div>
    );

  return (
    <div className="mt-5 space-y-6">
      {avail.services.map((svc) => (
        <div key={svc.label}>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-ink/55">{svc.label}</p>
          <div className="mt-2.5 grid grid-cols-3 gap-2.5">
            {svc.slots.map((s) => (
              <Choice key={s.time} disabled={!s.free} selected={time === s.time} onClick={() => onPick(s.time)} className="h-14 flex-col text-lg">
                {s.time}
                {!s.free && <span className="text-[0.7rem] font-medium">completo</span>}
              </Choice>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function Field({ label, hint, error, children }: { label: string; hint?: string; error?: boolean; children: React.ReactNode }) {
  return (
    <label className={`mt-5 block ${error ? "[&_.input]:border-ember" : ""}`}>
      <span className="font-semibold">{label}</span>
      {hint && <span className="block text-sm text-ink/55">{hint}</span>}
      <span className="mt-2 block">{children}</span>
    </label>
  );
}

/**
 * Explicit consent for the special requests (art. 9 GDPR): allergies and
 * intolerances are health data. Shown only once something is written there;
 * without it the guest can leave the field empty and tell the staff in person.
 */
export function NotesConsent({ checked, onChange, error }: { checked: boolean; onChange: (v: boolean) => void; error?: boolean }) {
  return (
    <label className={`mt-4 flex cursor-pointer items-start gap-4 border p-4 ${error ? "border-ember" : "border-ink/15"}`}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
      <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center border-2 border-ink/40 text-cream transition peer-checked:border-ink peer-checked:bg-ink peer-focus-visible:ring-2 peer-focus-visible:ring-gold">
        {checked && <IconCheck className="h-5 w-5" strokeWidth={3} />}
      </span>
      <span className="leading-snug text-ink/80">
        Acconsento all&apos;uso di queste richieste, comprese eventuali allergie o intolleranze, solo per preparare il tavolo e i piatti.
        <span className="mt-1 block text-sm text-ink/55">
          Facoltativo: se preferisci, lascia il campo vuoto e dillo in sala. Puoi cancellarle quando vuoi dalla pagina della prenotazione.
        </span>
      </span>
    </label>
  );
}

/** What happens to the guest's data, next to the send button: no checkbox, the booking itself is the legal basis. */
export function PrivacyNotice() {
  return (
    <p className="mt-4 text-sm leading-relaxed text-ink/60">
      Usiamo nome e telefono solo per gestire la prenotazione e inviarti su WhatsApp i messaggi che la riguardano.{" "}
      <Link href="/privacy" target="_blank" className="underline underline-offset-2 hover:text-ink">
        Informativa privacy
      </Link>
    </p>
  );
}

export function ErrorBox({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLParagraphElement>(null);
  // make sure the message is seen, even if it appears below the fold
  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [children]);
  return (
    <p ref={ref} role="alert" className="mt-5 border-l-4 border-ember bg-ember/10 px-4 py-3 text-ink">
      {children}
    </p>
  );
}
