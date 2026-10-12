"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { ADMIN_PATH } from "@/lib/pwa";
import { IconClose, IconDownload, IconShare } from "../Icons";
import { useInstall } from "./pwa";

const DISMISSED = "prometeo:install-dismissed";
const noop = () => () => {};
const readDismissed = () => {
  try {
    return localStorage.getItem(DISMISSED) === "1";
  } catch {
    return false;
  }
};

/**
 * "Install the app" card, staff area only.
 * Android / desktop Chrome: one tap opens the system install dialog.
 * iPhone: links to the step-by-step guide (Apple allows no install button).
 */
export function InstallBanner() {
  const pathname = usePathname();
  const { ready, platform, standalone, canPrompt, prompt } = useInstall();
  const stored = useSyncExternalStore(noop, readDismissed, () => true);
  const [closed, setClosed] = useState(false);
  const dismissed = stored || closed;

  const dismiss = () => {
    setClosed(true);
    try {
      localStorage.setItem(DISMISSED, "1");
    } catch {}
  };

  const iosGuide = platform === "ios";
  if (!ready || standalone || dismissed || pathname.startsWith(`${ADMIN_PATH}/notifiche`) || (!canPrompt && !iosGuide)) return null;

  return (
    <div className="mb-6 flex items-center gap-4 rounded-2xl border border-gold/30 bg-ink-2 p-4">
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gold/15 text-gold-light">
        {iosGuide ? <IconShare className="h-6 w-6" /> : <IconDownload className="h-6 w-6" />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold">Installa l&apos;app Prometeo Gestione</p>
        <p className="text-sm text-cream/60">{iosGuide ? "Aggiungila alla schermata Home per ricevere le notifiche." : "Si apre in un tocco e ti avvisa delle nuove richieste."}</p>
      </div>
      {iosGuide ? (
        <Link href={`${ADMIN_PATH}/notifiche`} className="btn btn-gold min-h-11 shrink-0 px-4 text-xs">
          Come fare
        </Link>
      ) : (
        <button type="button" onClick={prompt} className="btn btn-gold min-h-11 shrink-0 px-4 text-xs">
          Installa
        </button>
      )}
      <button type="button" onClick={dismiss} aria-label="Non ora" className="-mr-1 grid h-11 w-9 shrink-0 place-items-center text-cream/50 hover:text-cream">
        <IconClose className="h-5 w-5" />
      </button>
    </div>
  );
}
