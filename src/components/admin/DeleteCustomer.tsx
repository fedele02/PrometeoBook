"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteCustomerAction } from "@/app/gestore-prometeo-2026/actions";
import { Card, useToast } from "./ui";

/** For a guest who asks to be forgotten, or not to be kept in the history (GDPR). */
export function DeleteCustomer({ phoneKey, upcoming }: { phoneKey: string; upcoming: number }) {
  const router = useRouter();
  const toast = useToast();
  const [confirming, setConfirming] = useState(false);
  const [busy, start] = useTransition();

  const erase = () =>
    start(async () => {
      const res = await deleteCustomerAction(phoneKey);
      if (!res.ok) return toast(res.error, "error");
      toast(res.kept ? `Storico eliminato · restano ${res.kept} prenotazioni in arrivo` : "Dati del cliente eliminati");
      router.push(res.kept ? `/gestore-prometeo-2026/clienti?tel=${phoneKey}` : "/gestore-prometeo-2026/clienti");
      router.refresh();
    });

  return (
    <Card className="mt-10">
      <h2 className="font-display text-sm tracking-[0.2em] text-cream/60">PRIVACY</h2>
      <p className="mt-2 text-sm leading-relaxed text-cream/70">
        Se il cliente chiede di cancellare i suoi dati o di non essere nello storico, elimina tutte le sue prenotazioni passate, annullate e
        rifiutate, con i messaggi WhatsApp.
        {upcoming > 0 && ` Le ${upcoming} prenotazioni in arrivo restano valide: annullale dalla scheda del giorno se lo chiede.`} Non si può
        annullare.
      </p>
      {confirming ? (
        <div className="mt-4 grid grid-cols-2 gap-2 sm:max-w-sm">
          <button type="button" onClick={() => setConfirming(false)} className="btn btn-line min-h-11 text-xs text-cream/85">
            No
          </button>
          <button type="button" disabled={busy} onClick={erase} className="btn min-h-11 bg-ember text-xs text-ink disabled:opacity-60">
            {busy ? "Elimino…" : "Sì, elimina"}
          </button>
        </div>
      ) : (
        <button type="button" onClick={() => setConfirming(true)} className="mt-3 min-h-11 text-sm font-semibold text-ember underline underline-offset-4">
          Elimina i dati del cliente
        </button>
      )}
    </Card>
  );
}
