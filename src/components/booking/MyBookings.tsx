"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";
import { rememberedBookings, storedBookings } from "@/lib/guest-bookings";
import { dateParts, romeNow } from "@/lib/time";
import { IconChevron } from "../Icons";

const onStorage = (cb: () => void) => {
  addEventListener("storage", cb);
  return () => removeEventListener("storage", cb);
};

/** "You already have a booking": brings returning guests back to their private page. */
export function MyBookings() {
  // the page is static and cached: the list only exists on the guest's phone
  const raw = useSyncExternalStore(onStorage, storedBookings, () => "[]");
  const list = useMemo(() => rememberedBookings(romeNow().date, raw), [raw]);

  if (!list.length) return null;
  return (
    <div className="mb-6 space-y-2">
      {list.map((b) => {
        const p = dateParts(b.date);
        return (
          <Link
            key={b.token}
            href={`/prenotazione/${b.token}`}
            className="flex min-h-16 items-center gap-4 border border-ink/15 bg-white px-4 py-3 transition hover:border-ink"
          >
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold uppercase tracking-[0.14em] text-ink/55">La tua prenotazione</span>
              <span className="block font-semibold">
                {p.wd} {p.day} {p.month} · ore {b.time} · {b.people} {b.people === 1 ? "persona" : "persone"}
              </span>
            </span>
            <span className="text-sm font-semibold underline underline-offset-4">Gestisci</span>
            <IconChevron className="h-5 w-5 shrink-0 text-ink/50" />
          </Link>
        );
      })}
    </div>
  );
}
