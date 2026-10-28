"use client";

import { useState, useTransition } from "react";
import { createBookingAction, type AnswerResult } from "@/app/gestore-prometeo-2026/actions";
import { PhoneInput } from "../PhoneInput";
import { FieldLabel, Modal, smallInput, Toggle } from "./ui";

/** Bookings taken by phone: already confirmed, no capacity limit (the staff decides). */
export function PhoneBookingModal({
  open,
  date,
  waAuto,
  onClose,
  onDone,
}: {
  open: boolean;
  date: string;
  waAuto: boolean;
  onClose: () => void;
  onDone: (res: AnswerResult) => void;
}) {
  const [f, setF] = useState({ date, time: "20:00", people: 2, name: "", phone: "", notes: "" });
  const [sendWhatsapp, setSendWhatsapp] = useState(true);
  const [error, setError] = useState("");
  const [busy, start] = useTransition();
  const set = (k: keyof typeof f, v: string | number) => setF((x) => ({ ...x, [k]: v }));

  const save = () =>
    start(async () => {
      const res = await createBookingAction({ ...f, sendWhatsapp: waAuto && sendWhatsapp });
      if (res.ok) {
        setF((x) => ({ ...x, name: "", phone: "", notes: "" }));
        setError("");
        onDone(res);
      } else setError(res.error);
    });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Prenotazione telefonica"
      footer={
        <button onClick={save} disabled={busy} className="btn btn-gold w-full disabled:opacity-60">
          {busy ? "Salvataggio…" : "Salva prenotazione"}
        </button>
      }
    >
      <div className="grid gap-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="col-span-2 sm:col-span-1">
            <FieldLabel label="Giorno">
              <input type="date" value={f.date} onChange={(e) => set("date", e.target.value)} className={`${smallInput} [color-scheme:dark]`} />
            </FieldLabel>
          </div>
          <FieldLabel label="Ora">
            <input type="time" step={900} value={f.time} onChange={(e) => set("time", e.target.value)} className={`${smallInput} [color-scheme:dark]`} />
          </FieldLabel>
          <FieldLabel label="Persone">
            <input type="number" inputMode="numeric" min={1} max={60} value={f.people} onChange={(e) => set("people", Number(e.target.value))} className={smallInput} />
          </FieldLabel>
        </div>
        <FieldLabel label="Nome">
          <input value={f.name} onChange={(e) => set("name", e.target.value)} autoCapitalize="words" className={smallInput} />
        </FieldLabel>
        <FieldLabel label="Telefono">
          <PhoneInput tone="dark" value={f.phone} onChange={(v) => set("phone", v)} className="!min-h-12 !text-base" />
        </FieldLabel>
        <FieldLabel label="Note">
          <textarea value={f.notes} onChange={(e) => set("notes", e.target.value)} rows={2} className={`${smallInput} py-3`} />
        </FieldLabel>
        {waAuto && (
          <Toggle
            checked={sendWhatsapp}
            onChange={setSendWhatsapp}
            label="Invia la conferma su WhatsApp"
            hint="Il cliente riceve il messaggio di conferma con il link per modificare o annullare"
          />
        )}
        <p className="text-sm text-cream/55">Le prenotazioni inserite qui sono già confermate e non contano il limite di coperti.</p>
        {error && <p className="rounded-xl bg-ember/15 px-4 py-3 text-sm">{error}</p>}
      </div>
    </Modal>
  );
}
