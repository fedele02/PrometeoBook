"use client";

import { useState } from "react";
import { DEVICE_KEYS } from "@/lib/legal";

/** Lets the guest erase, in one tap, what the site remembers on this device. */
export function ClearDeviceData() {
  const [done, setDone] = useState(false);

  const clear = () => {
    try {
      for (const k of DEVICE_KEYS) localStorage.removeItem(k);
    } catch {}
    setDone(true);
  };

  return (
    <div className="mt-5">
      <button type="button" onClick={clear} disabled={done} className="btn btn-line text-cream disabled:opacity-60">
        {done ? "Dati cancellati da questo dispositivo" : "Cancella i dati salvati su questo dispositivo"}
      </button>
      <p className="sr-only" role="status">
        {done ? "Dati cancellati" : ""}
      </p>
    </div>
  );
}
