import Link from "next/link";
import { hoursSummary } from "@/lib/time";
import { telHref } from "@/lib/site";
import type { Settings } from "@/lib/types";
import { Emblem, Wordmark } from "../Logo";

/** Phones get a compact footer (contacts are right above); desktop the full columns. */
export function Footer({ settings: s }: { settings: Settings }) {
  const social = [
    s.facebook && { href: s.facebook, label: "Facebook" },
    s.instagram && { href: s.instagram, label: "Instagram" },
  ].filter(Boolean) as { href: string; label: string }[];

  return (
    <footer className="bg-ink pb-[calc(env(safe-area-inset-bottom)+6rem)] pt-14 md:pb-12 md:pt-16">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 md:grid-cols-[1.4fr_1fr_1fr_1fr] md:gap-12 md:px-10">
        <div>
          <div className="text-gold">
            <Emblem className="h-12 w-auto md:h-14" />
            <Wordmark className="mt-4 h-4 w-auto md:mt-5 md:h-5" />
            <p className="font-display mt-2 text-[0.55rem] tracking-[0.5em]">FINE DINING</p>
          </div>
          {s.footerLine && <p className="mt-6 font-serif text-xl italic leading-snug text-cream/75">{s.footerLine}</p>}
        </div>

        <div className="hidden md:block">
          <h2 className="label text-gold">Dove</h2>
          <address className="mt-4 not-italic leading-relaxed text-cream/80">
            <a href={s.mapsUrl} target="_blank" rel="noopener" className="hover:text-gold">
              {s.address}
              <br />
              {s.city}
            </a>
          </address>
        </div>

        <div className="hidden md:block">
          <h2 className="label text-gold">Contatti</h2>
          <ul className="mt-4 space-y-1 text-cream/80">
            {[s.phone, s.phone2].filter(Boolean).map((p) => (
              <li key={p}>
                <a href={telHref(p)} className="hover:text-gold">
                  {p}
                </a>
              </li>
            ))}
            {s.email && (
              <li>
                <a href={`mailto:${s.email}`} className="[overflow-wrap:anywhere] hover:text-gold">
                  {s.email}
                </a>
              </li>
            )}
          </ul>
        </div>

        <div className="hidden md:block">
          <h2 className="label text-gold">Orari</h2>
          <ul className="mt-4 space-y-1 text-cream/80">
            {hoursSummary(s).map((g) => (
              <li key={g.label}>
                <span className="text-cream">{g.label}</span>
                <br />
                <span className={g.closed ? "text-muted" : ""}>
                  {g.closed ? "Chiuso" : g.services.map((x) => `${x.open}–${x.close}`).join(" · ")}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-10 flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-3 border-t border-line px-6 pt-6 text-sm text-muted md:mt-14 md:px-10">
        <p className="w-full md:w-auto md:flex-1">© {new Date().getFullYear()} Prometeo Fine Dining · Matera</p>
        {social.map((x) => (
          <a key={x.href} href={x.href} target="_blank" rel="noopener" className="py-2 hover:text-cream">
            {x.label}
          </a>
        ))}
        <Link href="/privacy" className="py-2 hover:text-cream">
          Privacy
        </Link>
      </div>
    </footer>
  );
}
