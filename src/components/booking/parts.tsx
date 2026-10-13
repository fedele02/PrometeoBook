"use client";

import { useEffect, useRef, useState } from "react";
import type { Availability } from "@/app/(site)/prenota/actions";
import { telHref } from "@/lib/site";
import { IconMinus, IconPhone, IconPlus } from "../Icons";

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
  const clamp = (v: number) => Math.min(max, Math.max(9, v));
  return (
    // label on its own line: the controls always fit, down to 320 px phones
    <div className="mt-3 border border-ink/15 p-2.5">
      <p className="px-1.5 pb-2 font-semibold">Più persone</p>
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => setN(clamp(n - 1))} aria-label="Meno" className="grid h-12 w-12 shrink-0 place-items-center border border-ink/15">
          <IconMinus className="h-5 w-5" />
        </button>
        {/* typed or stepped: groups can be as large as a whole service */}
        <input
          type="number"
          inputMode="numeric"
          min={9}
          max={max}
          value={n}
          onChange={(e) => setN(Number(e.target.value) || 9)}
          onBlur={() => setN(clamp(n))}
          aria-label="Numero di persone"
          className="h-12 w-12 min-w-0 border-0 bg-transparent p-0 text-center text-2xl font-semibold [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
        />
        <button type="button" onClick={() => setN(clamp(n + 1))} aria-label="Più" className="grid h-12 w-12 shrink-0 place-items-center border border-ink/15">
          <IconPlus className="h-5 w-5" />
        </button>
        <button type="button" onClick={() => onPick(clamp(n))} className="btn btn-dark ml-auto min-h-12 shrink-0 px-5">
          Ok
        </button>
      </div>
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

  const allFull = !avail.closed && avail.services.every((s) => s.full);
  if (avail.closed || allFull)
    return (
      <div className="mt-6 border border-ink/15 bg-paper p-5">
        <p className="text-lg font-semibold">{avail.closed ? avail.reason : "Siamo spiacenti, siamo al completo per questo giorno."}</p>
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
          {svc.full ? (
            // seats are counted per service: when it's full, every time of it is
            <p className="mt-2.5 border border-ink/15 bg-paper px-4 py-3 text-ink/70">
              Siamo spiacenti, siamo al completo per {svc.label === "Pranzo" ? "il pranzo" : "la cena"}.
            </p>
          ) : (
            <div className="mt-2.5 grid grid-cols-3 gap-2.5">
              {svc.slots.map((s) => (
                <Choice key={s.time} disabled={!s.free} selected={time === s.time} onClick={() => onPick(s.time)} className="h-14 flex-col text-lg">
                  {s.time}
                </Choice>
              ))}
            </div>
          )}
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
