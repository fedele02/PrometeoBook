import Link from "next/link";
import { hoursSummary } from "@/lib/time";
import { telHref } from "@/lib/site";
import type { Settings } from "@/lib/types";
import { Emblem, Wordmark } from "../Logo";

export function Footer({ settings: s }: { settings: Settings }) {
  return (
    <footer className="border-t border-line bg-ink pb-28 pt-16 md:pb-12">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 md:grid-cols-[1.4fr_1fr_1fr_1fr] md:px-10">
        <div className="text-gold">
          <Emblem className="h-14 w-auto" />
          <Wordmark className="mt-5 h-5 w-auto" />
          <p className="font-display mt-2 text-[0.6rem] tracking-[0.5em]">FINE DINING</p>
          <p className="mt-6 max-w-xs font-serif text-lg italic text-cream/70">{s.tagline}</p>
        </div>

        <div>
          <h2 className="label text-gold">Dove</h2>
          <address className="mt-4 not-italic leading-relaxed text-cream/80">
            <a href={s.mapsUrl} target="_blank" rel="noopener" className="hover:text-gold">
              {s.address}
              <br />
              {s.city}
            </a>
          </address>
        </div>

        <div>
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
                <a href={`mailto:${s.email}`} className="break-all hover:text-gold">
                  {s.email}
                </a>
              </li>
            )}
            {s.facebook && (
              <li>
                <a href={s.facebook} target="_blank" rel="noopener" className="hover:text-gold">
                  Facebook
                </a>
              </li>
            )}
            {s.instagram && (
              <li>
                <a href={s.instagram} target="_blank" rel="noopener" className="hover:text-gold">
                  Instagram
                </a>
              </li>
            )}
          </ul>
        </div>

        <div>
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

      <div className="mx-auto mt-14 flex max-w-7xl flex-col gap-2 border-t border-line px-6 pt-6 text-xs text-muted md:flex-row md:justify-between md:px-10">
        <p>© {new Date().getFullYear()} Prometeo Fine Dining · Matera</p>
        <p className="flex gap-6">
          <Link href="/privacy" className="hover:text-cream">
            Privacy
          </Link>
          <Link href="/admin" prefetch={false} className="hover:text-cream">
            Area riservata
          </Link>
        </p>
      </div>
    </footer>
  );
}
