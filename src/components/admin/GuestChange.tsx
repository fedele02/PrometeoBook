import { agoLabel } from "@/lib/board";
import { dateParts } from "@/lib/time";
import type { Booking } from "@/lib/types";
import { IconArrow } from "../Icons";

const shortDate = (d: string) => {
  const p = dateParts(d);
  return `${p.wd} ${p.day} ${p.month}`;
};

/** What differs between the booking as the guest first made it and as it is now. */
export function changeLines(b: Booking): { what: string; was: string; now: string }[] {
  const was = b.guest_change?.before;
  if (!was) return [];
  const out: { what: string; was: string; now: string }[] = [];
  if (was.date !== b.date) out.push({ what: "Giorno", was: shortDate(was.date), now: shortDate(b.date) });
  if (was.time !== b.time) out.push({ what: "Orario", was: was.time, now: b.time });
  if (was.people !== b.people) out.push({ what: "Persone", was: String(was.people), now: String(b.people) });
  if (was.notes !== b.notes) out.push({ what: "Note", was: was.notes ? `“${was.notes}”` : "nessuna", now: b.notes ? `“${b.notes}”` : "nessuna" });
  return out;
}

/** “Modificata dal cliente” box: each changed field, old value → new value. */
export function GuestChange({ b }: { b: Booking }) {
  const lines = changeLines(b);
  if (!lines.length || !b.guest_change) return null;
  return (
    <div className="mt-3 rounded-xl border border-gold/50 bg-gold/10 px-3.5 py-3 text-sm">
      <p className="text-[0.7rem] font-bold uppercase tracking-[0.2em] text-gold-light">Modificata dal cliente · {agoLabel(b.guest_change.at)}</p>
      <ul className="mt-2 space-y-1.5">
        {lines.map((l) => (
          <li key={l.what} className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="font-semibold text-cream">{l.what}:</span>
            <span className="text-cream/55 line-through decoration-cream/30">{l.was}</span>
            <IconArrow className="h-3.5 w-3.5 shrink-0 translate-y-0.5 text-gold-light" />
            <span className="font-bold text-gold-light">{l.now}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
