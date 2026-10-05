"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/admin/actions";
import { IconCalendar, IconHome, IconLogout, IconMenu, IconStore } from "../Icons";
import { Emblem, Wordmark } from "../Logo";

const ITEMS = [
  { href: "/admin", label: "Prenotazioni", icon: IconCalendar },
  { href: "/admin/menu", label: "Menu", icon: IconMenu },
  { href: "/admin/locale", label: "Locale e orari", short: "Locale", icon: IconStore },
];

export function AdminNav({ email }: { email: string }) {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  return (
    <>
      {/* desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-white/5 bg-ink-2 p-5 md:flex">
        <Link href="/admin" className="flex items-center gap-3 px-2 py-3 text-cream">
          <Emblem className="h-9 w-auto text-gold" />
          <Wordmark className="h-3.5 w-auto text-gold" />
        </Link>
        <nav className="mt-8 flex flex-col gap-1">
          {ITEMS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-xl px-3 py-3 font-semibold transition ${
                isActive(href) ? "bg-gold/15 text-gold-light" : "text-cream/70 hover:bg-white/5 hover:text-cream"
              }`}
            >
              <Icon className="h-5 w-5" /> {label}
            </Link>
          ))}
          <Link href="/" target="_blank" className="flex items-center gap-3 rounded-xl px-3 py-3 font-semibold text-cream/70 hover:bg-white/5 hover:text-cream">
            <IconHome className="h-5 w-5" /> Vedi il sito
          </Link>
        </nav>
        <div className="mt-auto border-t border-white/5 pt-4">
          <p className="truncate px-3 text-xs text-muted">{email}</p>
          <form action={logoutAction}>
            <button className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-3 font-semibold text-cream/70 hover:bg-white/5 hover:text-cream">
              <IconLogout className="h-5 w-5" /> Esci
            </button>
          </form>
        </div>
      </aside>

      {/* mobile top bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-white/5 bg-ink/90 px-4 pt-[env(safe-area-inset-top)] backdrop-blur md:hidden">
        <Link href="/admin" className="flex items-center gap-2 text-cream">
          <Emblem className="h-7 w-auto text-gold" />
          <span className="font-display text-sm tracking-[0.14em]">ADMIN</span>
        </Link>
        <div className="flex items-center gap-1">
          <Link href="/" target="_blank" className="grid h-10 w-10 place-items-center text-cream/70" aria-label="Vedi il sito">
            <IconHome className="h-5 w-5" />
          </Link>
          <form action={logoutAction}>
            <button className="grid h-10 w-10 place-items-center text-cream/70" aria-label="Esci">
              <IconLogout className="h-5 w-5" />
            </button>
          </form>
        </div>
      </header>

      {/* mobile bottom tabs */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-white/5 bg-ink-2/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
        {ITEMS.map(({ href, label, short, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex h-16 flex-1 flex-col items-center justify-center gap-1 text-xs font-semibold ${
              isActive(href) ? "text-gold-light" : "text-cream/60"
            }`}
          >
            <Icon className="h-6 w-6" />
            {short ?? label}
          </Link>
        ))}
      </nav>
    </>
  );
}
