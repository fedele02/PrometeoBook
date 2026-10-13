"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { clearErrorLogsAction, testErrorLogAction, type ActionResult } from "@/app/gestore-prometeo-2026/actions";
import { useToast } from "./ui";

/** Buttons of the error log page: sample error, empty the log (asks first). */
export function ErrorLogTools({ hasLogs }: { hasLogs: boolean }) {
  const router = useRouter();
  const toast = useToast();
  const [busy, start] = useTransition();
  const [confirming, setConfirming] = useState(false);

  const run = (fn: () => Promise<ActionResult>, done: string) =>
    start(async () => {
      const res = await fn();
      setConfirming(false);
      if (res.ok) {
        toast(done);
        router.refresh();
      } else toast(res.error, "error");
    });

  if (confirming)
    return (
      <>
        <button type="button" onClick={() => setConfirming(false)} className="btn btn-line min-h-10 px-4 text-sm">
          No
        </button>
        <button type="button" disabled={busy} onClick={() => run(clearErrorLogsAction, "Log svuotato")} className="btn min-h-10 bg-ember px-4 text-sm text-ink disabled:opacity-60">
          Sì, cancella tutto
        </button>
      </>
    );

  return (
    <>
      <button type="button" disabled={busy} onClick={() => run(testErrorLogAction, "Errore di prova registrato")} className="btn btn-line min-h-10 px-4 text-sm disabled:opacity-60">
        Errore di prova
      </button>
      {hasLogs && (
        <button type="button" onClick={() => setConfirming(true)} className="btn btn-line min-h-10 px-4 text-sm">
          Svuota
        </button>
      )}
    </>
  );
}
