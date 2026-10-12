"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { logoutAction, removeDeviceAction, testPushAction, updateDevicePrefsAction } from "@/app/gestore-prometeo-2026/actions";
import type { NotifyPrefs } from "@/lib/types";
import { IconAddSquare, IconBell, IconCheck, IconDownload, IconLogout, IconShare, IconTrash } from "../Icons";
import { Emblem } from "../Logo";
import { usePush, useInstall, type PushState } from "./pwa";
import { Toggle, useToast } from "./ui";

type Device = { id: string; label: string; created_at: string; prefs: NotifyPrefs };

const GROUPS: { key: keyof NotifyPrefs; label: string; hint: string }[] = [
  { key: "requests", label: "Nuove richieste", hint: "Chi prenota dal sito: nome, persone, giorno e ora" },
  { key: "changes", label: "Modifiche dei clienti", hint: "Cambio di giorno, ora o persone" },
  { key: "cancellations", label: "Annullamenti dei clienti", hint: "Con i posti che si liberano" },
  { key: "staff", label: "Azioni dei colleghi", hint: "Accettate, rifiutate e telefoniche da altri dispositivi" },
];

const card = "rounded-2xl border border-white/[0.07] bg-ink-2 p-5";
const sectionLabel = "text-[0.7rem] font-bold uppercase tracking-[0.22em] text-gold";
const since = new Intl.DateTimeFormat("it-IT", { day: "numeric", month: "long", year: "numeric" });

export function NotificationsPanel({
  email,
  pushReady,
  publicKey,
  currentId,
  devices,
}: {
  email: string;
  pushReady: boolean;
  publicKey: string;
  currentId: string | null;
  devices: Device[];
}) {
  const router = useRouter();
  const toast = useToast();
  const install = useInstall();
  const push = usePush(publicKey);
  const [busy, start] = useTransition();
  const me = devices.find((d) => d.id === currentId && push.state === "on");
  const [prefs, setPrefs] = useState<NotifyPrefs | null>(me?.prefs ?? null);
  const shownPrefs = prefs ?? me?.prefs ?? null;

  const enable = () =>
    start(async () => {
      const res = await push.enable();
      if (res.ok) {
        toast("Notifiche attive su questo dispositivo");
        router.refresh();
      } else toast(res.error ?? "Errore", "error");
    });

  const disable = () =>
    start(async () => {
      await push.disable(me?.id);
      setPrefs(null);
      toast("Notifiche spente su questo dispositivo");
      router.refresh();
    });

  const setPref = (key: keyof NotifyPrefs, v: boolean) => {
    if (!me || !shownPrefs) return;
    const next = { ...shownPrefs, [key]: v };
    setPrefs(next);
    start(async () => {
      const res = await updateDevicePrefsAction(me.id, next);
      if (!res.ok) toast(res.error, "error");
    });
  };

  const test = () =>
    start(async () => {
      const res = await testPushAction();
      toast(res.ok ? "Notifica di prova inviata" : res.error, res.ok ? "ok" : "error");
    });

  const remove = (id: string) =>
    start(async () => {
      const res = id === me?.id ? (await push.disable(id), { ok: true as const }) : await removeDeviceAction(id);
      if (res.ok) {
        toast("Dispositivo scollegato");
        router.refresh();
      } else toast(res.error, "error");
    });

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-[1.65rem] leading-tight tracking-[0.03em] sm:text-[2rem]">Notifiche e app</h1>
      <p className="mt-1 text-cream/60">Ricevi le nuove richieste sul telefono e sul computer, anche ad app chiusa.</p>

      {/* ---------- install ---------- */}
      <section className={`${card} mt-6`} aria-labelledby="app-title">
        <h2 id="app-title" className={sectionLabel}>
          App sul telefono
        </h2>
        <div className="mt-4 flex items-center gap-4">
          <span className="grid h-16 w-16 shrink-0 place-items-center rounded-[1.1rem] border border-gold/40 bg-ink">
            <Emblem className="h-8 w-auto text-gold" />
          </span>
          <div className="min-w-0">
            <p className="text-lg font-semibold">Prometeo Gestione</p>
            <p className="text-sm text-cream/60">Un&apos;app solo per lo staff: il sito dei clienti non si installa.</p>
          </div>
        </div>
        {install.ready && <InstallSteps install={install} />}
      </section>

      {/* ---------- push on this device ---------- */}
      <section className={`${card} mt-4`} aria-labelledby="push-title">
        <h2 id="push-title" className={sectionLabel}>
          Notifiche su questo dispositivo
        </h2>
        {!pushReady ? (
          <p className="mt-3 text-cream/70">
            Le notifiche non sono ancora configurate sul server: mancano le chiavi <code className="text-gold-light">VAPID</code> (vedi README).
          </p>
        ) : (
          <PushControls state={push.state} busy={busy} onEnable={enable} onDisable={disable} onTest={test} />
        )}

        {pushReady && push.state === "on" && shownPrefs && (
          <div className="mt-5 space-y-5 border-t border-white/[0.06] pt-5">
            <p className="text-sm font-semibold text-cream/70">Avvisami per</p>
            {GROUPS.map((g) => (
              <Toggle key={g.key} checked={shownPrefs[g.key]} onChange={(v) => setPref(g.key, v)} label={g.label} hint={g.hint} />
            ))}
          </div>
        )}
      </section>

      {/* ---------- devices ---------- */}
      {devices.length > 0 && (
        <section className={`${card} mt-4`} aria-labelledby="devices-title">
          <h2 id="devices-title" className={sectionLabel}>
            Dispositivi collegati · {devices.length}
          </h2>
          <ul className="mt-3 divide-y divide-white/[0.06]">
            {devices.map((d) => (
              <li key={d.id} className="flex items-center gap-3 py-3">
                <IconBell className="h-5 w-5 shrink-0 text-cream/50" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">
                    {d.label}
                    {d.id === me?.id && <span className="ml-2 rounded-full bg-gold/15 px-2 py-0.5 text-xs font-semibold text-gold-light">questo</span>}
                  </p>
                  <p className="text-sm text-cream/50">Collegato dal {since.format(new Date(d.created_at))}</p>
                </div>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => remove(d.id)}
                  aria-label={`Scollega ${d.label}`}
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-cream/60 transition-colors hover:bg-white/5 hover:text-ember disabled:opacity-40"
                >
                  <IconTrash className="h-5 w-5" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ---------- account (phones: the sidebar is hidden) ---------- */}
      <section className={`${card} mt-4 md:hidden`} aria-labelledby="account-title">
        <h2 id="account-title" className={sectionLabel}>
          Account
        </h2>
        <p className="mt-3 truncate text-cream/70">{email}</p>
        <form action={logoutAction} className="mt-3">
          <button className="btn btn-line min-h-11 w-full text-xs text-cream/85">
            <IconLogout className="h-4 w-4" /> Esci
          </button>
        </form>
      </section>
    </div>
  );
}

function PushControls({ state, busy, onEnable, onDisable, onTest }: { state: PushState; busy: boolean; onEnable: () => void; onDisable: () => void; onTest: () => void }) {
  switch (state) {
    case "loading":
      return <p className="mt-3 h-12 animate-pulse rounded-xl bg-white/[0.04]" aria-busy />;
    case "needs-install":
      return <p className="mt-3 text-cream/75">Su iPhone le notifiche arrivano solo dall&apos;app installata: segui i passaggi qui sopra, poi apri l&apos;app dall&apos;icona e torna qui.</p>;
    case "unsupported":
      return <p className="mt-3 text-cream/75">Questo browser non supporta le notifiche. Usa Chrome, Edge, Firefox o Safari aggiornati.</p>;
    case "denied":
      return (
        <p className="mt-3 text-cream/75">
          Le notifiche sono bloccate. Riattivale dalle impostazioni del telefono o del browser (Notifiche → Prometeo), poi ricarica questa pagina.
        </p>
      );
    case "off":
      return (
        <div className="mt-3">
          <p className="text-cream/75">Spente su questo dispositivo.</p>
          <button type="button" onClick={onEnable} disabled={busy} className="btn btn-gold mt-4 min-h-12 w-full text-xs disabled:opacity-60">
            <IconBell className="h-5 w-5" /> {busy ? "Attivazione…" : "Attiva le notifiche"}
          </button>
        </div>
      );
    case "on":
      return (
        <div className="mt-3">
          <p className="flex items-center gap-2 font-semibold text-ok">
            <IconCheck className="h-5 w-5" strokeWidth={2.4} /> Attive su questo dispositivo
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2.5">
            <button type="button" onClick={onTest} disabled={busy} className="btn btn-line min-h-12 text-xs text-cream/85 disabled:opacity-60">
              Invia una prova
            </button>
            <button type="button" onClick={onDisable} disabled={busy} className="btn btn-line min-h-12 text-xs text-cream/85 disabled:opacity-60">
              Spegni
            </button>
          </div>
        </div>
      );
  }
}

function InstallSteps({ install }: { install: ReturnType<typeof useInstall> }) {
  if (install.standalone)
    return (
      <p className="mt-4 flex items-center gap-2 font-semibold text-ok">
        <IconCheck className="h-5 w-5" strokeWidth={2.4} /> App installata: la stai usando ora
      </p>
    );

  if (install.platform === "ios")
    return (
      <ol className="mt-5 space-y-3">
        {[
          { icon: IconShare, text: "Apri questa pagina in Safari e tocca Condividi, in basso" },
          { icon: IconAddSquare, text: "Scorri e scegli “Aggiungi alla schermata Home”, poi Aggiungi" },
          { icon: IconBell, text: "Apri Prometeo dall'icona e attiva le notifiche qui sotto" },
        ].map((s, i) => (
          <li key={i} className="flex items-center gap-3 rounded-xl bg-white/[0.04] p-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gold text-sm font-bold text-ink">{i + 1}</span>
            <s.icon className="h-5 w-5 shrink-0 text-gold-light" />
            <span className="text-[0.95rem]">{s.text}</span>
          </li>
        ))}
      </ol>
    );

  if (install.canPrompt)
    return (
      <button type="button" onClick={install.prompt} className="btn btn-gold mt-5 min-h-12 w-full text-xs">
        <IconDownload className="h-5 w-5" /> Installa l&apos;app
      </button>
    );

  return (
    <p className="mt-4 text-sm text-cream/60">
      {install.platform === "android"
        ? "Apri questa pagina con Chrome: comparirà il pulsante Installa (oppure menu ⋮ → Installa app)."
        : "Da computer puoi installarla con Chrome o Edge: icona Installa nella barra dell'indirizzo."}
    </p>
  );
}
