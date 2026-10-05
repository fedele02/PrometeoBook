"use client";

import { useState } from "react";
import { addDays, dayState, formatMonthYear, weekdayOf } from "@/lib/time";
import type { Settings } from "@/lib/types";
import { IconChevron } from "../Icons";

const WD = ["L", "M", "M", "G", "V", "S", "D"];
const WD_FULL = ["lunedì", "martedì", "mercoledì", "giovedì", "venerdì", "sabato", "domenica"];

const monthStart = (d: string) => `${d.slice(0, 7)}-01`;
function shiftMonth(first: string, n: number) {
  const [y, m] = first.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1 + n, 1)).toISOString().slice(0, 10);
}

/** Month grid with large cells. Closed and out-of-range days are disabled. */
export function Calendar({
  settings,
  today,
  value,
  onPick,
}: {
  settings: Settings;
  today: string;
  value: string | null;
  onPick: (d: string) => void;
}) {
  const last = addDays(today, settings.booking.daysAhead);
  const [month, setMonth] = useState(monthStart(value ?? today));
  const canPrev = month > monthStart(today);
  const canNext = shiftMonth(month, 1) <= last;

  const lead = (weekdayOf(month) + 6) % 7; // Monday first
  const days: (string | null)[] = Array(lead).fill(null);
  for (let d = month; d.slice(0, 7) === month.slice(0, 7); d = addDays(d, 1)) days.push(d);

  return (
    <div>
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setMonth(shiftMonth(month, -1))}
          disabled={!canPrev}
          aria-label="Mese precedente"
          className="grid h-12 w-12 place-items-center border border-ink/15 bg-white disabled:opacity-25"
        >
          <IconChevron dir="left" className="h-5 w-5" />
        </button>
        <p className="text-lg font-semibold capitalize" aria-live="polite">
          {formatMonthYear(month)}
        </p>
        <button
          type="button"
          onClick={() => setMonth(shiftMonth(month, 1))}
          disabled={!canNext}
          aria-label="Mese successivo"
          className="grid h-12 w-12 place-items-center border border-ink/15 bg-white disabled:opacity-25"
        >
          <IconChevron className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1.5 text-center">
        {WD.map((w, i) => (
          <abbr key={i} title={WD_FULL[i]} className="pb-1 text-sm font-semibold text-ink/50 no-underline">
            {w}
          </abbr>
        ))}
        {days.map((d, i) => {
          if (!d) return <span key={`e${i}`} />;
          const out = d < today || d > last;
          const closed = !out && dayState(settings, d).closed;
          const disabled = out || closed;
          const selected = d === value;
          return (
            <button
              type="button"
              key={d}
              disabled={disabled}
              onClick={() => onPick(d)}
              aria-pressed={selected}
              aria-label={`${Number(d.slice(8))}${closed ? ", chiuso" : ""}`}
              className={`relative grid aspect-square min-h-11 place-items-center text-lg font-semibold transition ${
                selected
                  ? "bg-ink text-cream"
                  : disabled
                    ? "text-ink/25 line-through decoration-ink/20"
                    : "border border-ink/15 bg-white text-ink hover:border-ink"
              } ${d === today && !selected && !disabled ? "border-ink" : ""}`}
            >
              {Number(d.slice(8))}
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-sm text-ink/50">I giorni barrati non sono prenotabili.</p>
    </div>
  );
}
