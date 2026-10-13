"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/gestore-prometeo-2026/actions";
import { ADMIN_PATH } from "@/lib/pwa";
import { IconBell, IconBug, IconCalendar, IconHome, IconInbox, IconLogout, IconMenu, IconStore, IconUser } from "../Icons";
import { Emblem, Wordmark } from "../Logo";

const ITEMS = [
  { href: ADMIN_PATH, label: "Prenotazioni", icon: IconCalendar },
  { href: `${ADMIN_PATH}/richieste`, label: "Richieste", icon: IconInbox, badge: true },
  { href: `${ADMIN_PATH}/clienti`, label: "Clienti", icon: IconUser },
  { href: `${ADMIN_PATH}/menu`, label: "Menu", icon: IconMenu },
  { href: `${ADMIN_PATH}/locale`, label: "Locale", long: "Locale e orari", icon: IconStore },
] as const;

/** Small round counter: requests still to decide. */
function Count({ n, className = "" }: { n: number; className?: string }) {
  if (!n) return null;
  return (
    <span
      className={`grid h-5 min-w-5 place-items-center rounded-full bg-ember px-1.5 text-[0.7rem] font-bold leading-none text-ink ${className}`}
      aria-label={`${n} da confermare`}
    >
      {n > 99 ? "99+" : n}
    </span>
  );
}

export function AdminNav({ email, pending, showErrors }: { email: string; pending: number; showErrors: boolean }) {
  const pathname = usePathname();
  const isActive = (href: string) => (href === ADMIN_PATH ? pathname === ADMIN_PATH : pathname.startsWith(href));
  const notifyActive = pathname.startsWith(`${ADMIN_PATH}/notifiche`);
  const errorsActive = pathname.startsWith(`${ADMIN_PATH}/errori`);

  return (
    <>
      {/* desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-white/5 bg-ink-2 p-5 md:flex">
        <Link href={ADMIN_PATH} className="flex items-center gap-3 px-2 py-3 text-gold">
          <Emblem className="h-9 w-auto" />
          <span>
            <Wordmark className="block h-3.5 w-auto" />
            <span className="mt-1.5 block text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-cream/50">Gestione</span>
          </span>
        </Link>
        <nav className="mt-8 flex flex-col gap-1" aria-label="Sezioni">
          {ITEMS.map((it) => {
            const on = isActive(it.href);
            return (
              <Link
                key={it.href}
                href={it.href}
                aria-current={on ? "page" : undefined}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 font-semibold transition-colors ${
                  on ? "bg-gold/15 text-gold-light" : "text-cream/70 hover:bg-white/5 hover:text-cream"
                }`}
              >
                <it.icon className="h-5 w-5" />
                <span className="flex-1">{"long" in it ? it.long : it.label}</span>
                {"badge" in it && <Count n={pending} />}
              </Link>
            );
          })}
          <Link
            href={`${ADMIN_PATH}/notifiche`}
            aria-current={notifyActive ? "page" : undefined}
            className={`mt-4 flex items-center gap-3 rounded-xl px-3 py-3 font-semibold transition-colors ${
              notifyActive ? "bg-gold/15 text-gold-light" : "text-cream/70 hover:bg-white/5 hover:text-cream"
            }`}
          >
            <IconBell className="h-5 w-5" /> Notifiche e app
          </Link>
          {showErrors && (
            <Link
              href={`${ADMIN_PATH}/errori`}
              aria-current={errorsActive ? "page" : undefined}
              className={`flex items-center gap-3 rounded-xl px-3 py-3 font-semibold transition-colors ${
                errorsActive ? "bg-gold/15 text-gold-light" : "text-cream/70 hover:bg-white/5 hover:text-cream"
              }`}
            >
              <IconBug className="h-5 w-5" /> Log errori
            </Link>
          )}
          <Link href="/" target="_blank" className="flex items-center gap-3 rounded-xl px-3 py-3 font-semibold text-cream/70 transition-colors hover:bg-white/5 hover:text-cream">
            <IconHome className="h-5 w-5" /> Vedi il sito
          </Link>
        </nav>
        <div className="mt-auto border-t border-white/5 pt-4">
          <p className="truncate px-3 text-xs text-muted">{email}</p>
          <form action={logoutAction}>
            <button className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-3 font-semibold text-cream/70 transition-colors hover:bg-white/5 hover:text-cream">
              <IconLogout className="h-5 w-5" /> Esci
            </button>
          </form>
        </div>
      </aside>

      {/* phone: top bar */}
      <header className="sticky top-0 z-30 border-b border-white/5 bg-ink/90 pt-[env(safe-area-inset-top)] backdrop-blur-md md:hidden">
        <div className="flex h-16 items-center justify-between pl-[max(1rem,env(safe-area-inset-left))] pr-[max(0.75rem,env(safe-area-inset-right))]">
          <Link href={ADMIN_PATH} className="flex items-center gap-2.5 text-gold" aria-label="Prenotazioni">
            <Emblem className="h-7 w-auto" />
            <Wordmark className="h-3 w-auto" />
          </Link>
          <span className="flex gap-2">
            {showErrors && (
              <Link
                href={`${ADMIN_PATH}/errori`}
                aria-label="Log errori"
                aria-current={errorsActive ? "page" : undefined}
                className={`grid h-11 w-11 place-items-center rounded-full transition-colors ${errorsActive ? "bg-gold/15 text-gold-light" : "bg-white/[0.06] text-cream"}`}
              >
                <IconBug className="h-6 w-6" />
              </Link>
            )}
            <Link
              href={`${ADMIN_PATH}/notifiche`}
              aria-label="Notifiche e app"
              aria-current={notifyActive ? "page" : undefined}
              className={`grid h-11 w-11 place-items-center rounded-full transition-colors ${notifyActive ? "bg-gold/15 text-gold-light" : "bg-white/[0.06] text-cream"}`}
            >
              <IconBell className="h-6 w-6" />
            </Link>
          </span>
        </div>
      </header>

      {/* phone: bottom tabs */}
      <nav
        aria-label="Sezioni"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-white/[0.08] bg-ink-2 pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] md:hidden"
      >
        <div className="grid grid-cols-5">
          {ITEMS.map((it) => {
            const on = isActive(it.href);
            return (
              <Link
                key={it.href}
                href={it.href}
                aria-current={on ? "page" : undefined}
                className={`flex h-[4.25rem] flex-col items-center justify-center gap-1 text-[0.7rem] font-semibold ${on ? "text-gold-light" : "text-cream/60"}`}
              >
                <span className={`relative grid h-8 w-14 place-items-center rounded-full transition-colors ${on ? "bg-gold/15" : ""}`}>
                  <it.icon className="h-6 w-6" />
                  {"badge" in it && <Count n={pending} className="absolute -top-1 left-[calc(50%+0.4rem)]" />}
                </span>
                {it.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
