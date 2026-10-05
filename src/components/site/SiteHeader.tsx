"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { telHref } from "@/lib/site";
import { Emblem, Wordmark } from "../Logo";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/#sala", label: "La sala" },
  { href: "/#contatti", label: "Contatti" },
];

export function SiteHeader({
  bookingEnabled,
  announcement,
  phone,
  address,
}: {
  bookingEnabled: boolean;
  announcement: string;
  phone: string;
  address: string;
}) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const bar = useRef<HTMLDivElement>(null);

  // publish the real header height (it grows with the announcement) for sticky bars
  useEffect(() => {
    const el = bar.current;
    if (!el) return;
    const ro = new ResizeObserver(() => document.documentElement.style.setProperty("--header-h", `${el.offsetHeight}px`));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    on();
    addEventListener("scroll", on, { passive: true });
    return () => removeEventListener("scroll", on);
  }, []);

  // lock the page behind the open menu
  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
  }, [open]);

  // transparent only on top of the home photo
  const solid = scrolled || pathname !== "/" || open;

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div ref={bar}>
      {announcement && (
        <p className="relative z-10 bg-gold px-4 py-2 pt-[calc(env(safe-area-inset-top)+0.5rem)] text-center text-sm font-semibold text-ink">
          {announcement}
        </p>
      )}
      <div
        className={`relative z-10 transition-colors duration-500 ${announcement ? "" : "pt-[env(safe-area-inset-top)]"} ${
          !solid ? "bg-transparent" : pathname === "/" ? "bg-ink/90 backdrop-blur-md" : "bg-ink"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:h-20 md:px-10">
          <Link href="/" aria-label="Prometeo Fine Dining, home" className="flex items-center gap-3 text-gold">
            <Emblem className="h-8 w-auto md:h-9" />
            <Wordmark className="h-3.5 w-auto md:h-4" />
          </Link>

          <nav className="hidden items-center gap-10 md:flex" aria-label="Principale">
            {LINKS.slice(1).map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`label transition-colors hover:text-gold ${pathname === l.href ? "text-gold" : "text-cream"}`}
              >
                {l.label}
              </Link>
            ))}
            {bookingEnabled && (
              <Link href="/prenota" className="btn btn-gold min-h-11 px-6">
                Prenota
              </Link>
            )}
          </nav>

          <button
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-controls="menu-mobile"
            aria-label={open ? "Chiudi il menu" : "Apri il menu"}
            className="-mr-2 flex h-12 w-12 flex-col items-center justify-center gap-[7px] md:hidden"
          >
            <span className={`h-px w-7 bg-cream transition-transform duration-300 ${open ? "translate-y-[4px] rotate-45" : ""}`} />
            <span className={`h-px w-7 bg-cream transition-transform duration-300 ${open ? "-translate-y-[4px] -rotate-45" : ""}`} />
          </button>
        </div>
      </div>
      </div>

      {/* mobile menu */}
      <div
        id="menu-mobile"
        className={`fixed inset-0 flex flex-col bg-ink px-6 pb-[calc(env(safe-area-inset-bottom)+2rem)] transition-[opacity,visibility] duration-300 md:hidden ${
          announcement ? "pt-[calc(env(safe-area-inset-top)+8.5rem)]" : "pt-[calc(env(safe-area-inset-top)+6rem)]"
        } ${
          open ? "visible opacity-100" : "invisible opacity-0"
        }`}
      >
        <nav className="flex flex-col" aria-label="Menu">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="caps border-b border-line py-5 text-[1.9rem] text-cream">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto space-y-4">
          {bookingEnabled && (
            <Link href="/prenota" onClick={() => setOpen(false)} className="btn btn-gold w-full">
              Prenota un tavolo
            </Link>
          )}
          {phone && (
            <a href={telHref(phone)} className="btn btn-line w-full text-cream">
              Chiama {phone}
            </a>
          )}
          <p className="pt-2 text-center text-sm text-muted">{address}</p>
        </div>
      </div>
    </header>
  );
}
