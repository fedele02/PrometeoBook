"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { telHref } from "@/lib/site";
import { IconPhone } from "../Icons";

/**
 * Phones only: "Chiama" and "Prenota" always at thumb reach.
 * On the home page it appears once the cover photo has scrolled away.
 */
export function MobileBar({ phone, bookingEnabled }: { phone: string; bookingEnabled: boolean }) {
  const pathname = usePathname();
  const [past, setPast] = useState(false);

  useEffect(() => {
    const on = () => setPast(window.scrollY > window.innerHeight * 0.6);
    on();
    addEventListener("scroll", on, { passive: true });
    return () => removeEventListener("scroll", on);
  }, []);

  // not on the booking pages (the birthday link too: "Prenota" there would lose the offer),
  // nor on the menu (people may be reading it at the table)
  if (pathname.startsWith("/prenota") || pathname.startsWith("/auguri") || pathname.startsWith("/menu") || (!bookingEnabled && !phone)) return null;

  return (
    <div
      // hidden over the home photo: decided by CSS, not by the pathname (see SiteHeader)
      className={`fixed inset-x-0 bottom-0 z-40 flex border-t border-line bg-ink pb-[env(safe-area-inset-bottom)] transition-transform duration-500 md:hidden ${
        past ? "translate-y-0" : "translate-y-0 [body:has([data-hero])_&]:translate-y-full"
      }`}
    >
      {phone && (
        <a href={telHref(phone)} className="flex h-16 flex-1 items-center justify-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-cream">
          <IconPhone className="h-5 w-5" /> Chiama
        </a>
      )}
      {bookingEnabled && (
        <Link
          href="/prenota"
          className="flex h-16 flex-[1.4] items-center justify-center bg-gold text-sm font-semibold uppercase tracking-[0.16em] text-ink"
        >
          Prenota un tavolo
        </Link>
      )}
    </div>
  );
}
