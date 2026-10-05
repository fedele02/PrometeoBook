"use client";

import { useEffect, useState } from "react";
import { openStatus } from "@/lib/time";
import type { Settings } from "@/lib/types";

/** Computed in the browser: the page itself is cached, the clock isn't. */
export function OpenNow({ settings, className = "" }: { settings: Settings; className?: string }) {
  const [st, setSt] = useState<ReturnType<typeof openStatus> | null>(null);
  useEffect(() => {
    const run = () => setSt(openStatus(settings));
    run();
    const t = setInterval(run, 60_000);
    return () => clearInterval(t);
  }, [settings]);

  return (
    <span className={`inline-flex items-center gap-2 ${className}`} aria-live="polite">
      <span className="relative flex h-2.5 w-2.5">
        {st?.open && <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/60" />}
        <span className={`relative h-2.5 w-2.5 rounded-full ${st ? (st.open ? "bg-emerald-400" : "bg-ember") : "bg-muted"}`} />
      </span>
      <span>{st ? st.label : " "}</span>
    </span>
  );
}
