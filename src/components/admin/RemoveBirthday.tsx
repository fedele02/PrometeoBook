"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { removeBirthdayAction } from "@/app/gestore-prometeo-2026/actions";
import { useToast } from "./ui";

/** The guest asked to stop the birthday wishes: deletes the date and the consent (asks Sì/No in place). */
export function RemoveBirthday({ phoneKey }: { phoneKey: string }) {
  const router = useRouter();
  const toast = useToast();
  const [asking, setAsking] = useState(false);
  const [busy, start] = useTransition();

  if (!asking)
    return (
      <button type="button" onClick={() => setAsking(true)} className="btn btn-line min-h-11 px-4 text-xs text-cream/85">
        Togli dagli auguri
      </button>
    );
  return (
    <span className="flex flex-wrap items-center gap-2">
      <span className="text-sm">Cancellare la data del compleanno?</span>
      <button type="button" onClick={() => setAsking(false)} className="btn btn-line min-h-11 px-4 text-xs">
        No
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={() =>
          start(async () => {
            const res = await removeBirthdayAction(phoneKey);
            if (!res.ok) return toast(res.error, "error");
            toast("Compleanno cancellato: non riceverà più gli auguri");
            router.refresh();
          })
        }
        className="btn min-h-11 bg-ember px-4 text-xs text-ink disabled:opacity-60"
      >
        Sì, cancella
      </button>
    </span>
  );
}
