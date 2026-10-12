"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { capitalize, formatDateLong } from "@/lib/time";
import type { Settings } from "@/lib/types";
import { RequestCard, type Request } from "./RequestCard";

export type RequestDay = { date: string; covers: number; requests: Request[] };
type Filter = "all" | "today" | "next";

export function RequestsList({ days, today, settings, waAuto, oldest }: { days: RequestDay[]; today: string; settings: Settings; waAuto: boolean; oldest: string | null }) {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("all");

  // new requests appear on their own (push refreshes at once, this is the fallback)
  useEffect(() => {
    const refresh = () => document.visibilityState === "visible" && router.refresh();
    const t = setInterval(refresh, 60_000);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      clearInterval(t);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [router]);

  const count = (f: Filter) => days.filter((d) => f === "all" || (f === "today") === (d.date === today)).reduce((n, d) => n + d.requests.length, 0);
  const total = count("all");
  const shown = days.filter((d) => filter === "all" || (filter === "today") === (d.date === today));
  const filters: [Filter, string][] = [
    ["all", "Tutte"],
    ["today", "Oggi"],
    ["next", "Prossimi giorni"],
  ];

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-[1.65rem] leading-tight tracking-[0.03em] sm:text-[2rem]">Da confermare</h1>
      <p className="mt-1 text-cream/60">
        {total === 0 ? "Nessuna richiesta in attesa." : `${total} ${total === 1 ? "richiesta" : "richieste"} in ${days.length} ${days.length === 1 ? "giorno" : "giorni"}`}
      </p>
      {total > 0 && oldest && <p className="text-sm text-cream/45">La più vecchia è arrivata {oldest}</p>}

      {total > 0 && (
        <div role="tablist" aria-label="Filtro" className="no-scrollbar -mx-4 mt-5 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
          {filters.map(([f, label]) => {
            const on = filter === f;
            return (
              <button
                key={f}
                role="tab"
                aria-selected={on}
                onClick={() => setFilter(f)}
                className={`min-h-11 shrink-0 rounded-full border px-4 text-sm transition-colors ${
                  on ? "border-gold/60 bg-gold/[0.18] font-bold text-gold-light" : "border-white/10 bg-white/[0.05] text-cream/75 hover:text-cream"
                }`}
              >
                {label} · {count(f)}
              </button>
            );
          })}
        </div>
      )}

      {total === 0 ? (
        <div className="mt-8 rounded-2xl border border-white/[0.07] bg-ink-2 px-6 py-10 text-center">
          <p className="font-display text-xl tracking-[0.04em] text-gold-light">Tutto gestito</p>
          <p className="mt-2 text-cream/60">Quando arriva una nuova richiesta dal sito la trovi qui, e ti avvisa una notifica.</p>
        </div>
      ) : shown.length === 0 ? (
        <p className="mt-8 text-center text-cream/60">Nessuna richiesta {filter === "today" ? "per oggi" : "per i prossimi giorni"}.</p>
      ) : (
        <div className="mt-6 space-y-8">
          {shown.map((d) => (
            <section key={d.date} aria-label={formatDateLong(d.date)}>
              <div className="mb-3 flex items-baseline justify-between gap-3">
                <h2 className="text-[0.7rem] font-bold uppercase tracking-[0.2em] text-gold">
                  {d.date === today ? `Oggi · ${formatDateLong(d.date)}` : capitalize(formatDateLong(d.date))}
                </h2>
                <p className="shrink-0 text-sm text-cream/55">{d.covers} coperti</p>
              </div>
              <div className="space-y-3">
                {d.requests.map((b) => (
                  <RequestCard key={b.id} b={b} settings={settings} waAuto={waAuto} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
