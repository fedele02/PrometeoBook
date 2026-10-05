import Image from "next/image";
import Link from "next/link";
import { getPublicContent } from "@/lib/data";
import { SITE_URL, telHref } from "@/lib/site";
import { hoursSummary } from "@/lib/time";
import type { Settings } from "@/lib/types";
import { Hero } from "@/components/home/Hero";
import { IconArrow } from "@/components/Icons";
import { Flame, Ornament } from "@/components/Logo";
import { OpenNow } from "@/components/site/OpenNow";

/**
 * "Percorsi di sapori": dishes and words published by the restaurant
 * itself on its Facebook page.
 */
const PERCORSO = [
  {
    img: "/img/piatto-tonno-1600.webp",
    name: "Scottatino di tonno",
    notes: [
      {
        t: "Equilibrio di gusto",
        d: "La tenerezza del tonno in doppia consistenza incontra la delicatezza della crema di zucchine; le zucchine croccanti aggiungono contrasto e carattere.",
      },
    ],
  },
  {
    img: "/img/piatto-cime-1600.webp",
    name: "Cime di rapa",
    notes: [
      {
        t: "La cucina contadina",
        d: "Un gusto deciso e leggermente amarognolo. Tenere e saporite, custodiscono il profumo della Lucania.",
      },
    ],
  },
  {
    img: "/img/piatto-polpo-1600.webp",
    name: "Polpo rosticciato",
    notes: [{ t: "Mare e terra lucana", d: "Polpo rosticciato su purea di patate al peperone crusco." }],
  },
  {
    img: "/img/piatto-cannolo-1600.webp",
    name: "Cannolo scomposto",
    notes: [
      { t: "Consistenza e armonia", d: "La croccantezza della cialda dà vita a un equilibrio di consistenze in chiave contemporanea." },
      { t: "La dolcezza equilibrata", d: "Il gusto intenso del cioccolato fondente aggiunge una nota amara e raffinata." },
    ],
  },
];

export default async function HomePage() {
  const { settings: s } = await getPublicContent();
  const d = (ms: number) => ({ "--d": `${ms}ms` }) as React.CSSProperties;

  return (
    <>
      <JsonLd s={s} />
      <Hero tagline={s.tagline} address={`${s.address} · Matera`} bookingEnabled={s.booking.enabled} />

      {/* ---------------- IL MITO ---------------- */}
      <section className="bg-ink px-6 py-24 md:px-10 md:py-36">
        <div className="mx-auto grid max-w-7xl items-center gap-14 md:grid-cols-[1.1fr_1fr] md:gap-20">
          <div>
            <span data-reveal className="block text-gold">
              <Flame className="h-6 w-6" />
            </span>
            <blockquote data-reveal style={d(80)} className="caps mt-8 text-[1.9rem] leading-[1.18] text-cream md:text-[3.2rem]">
              {s.about}
            </blockquote>
            <p data-reveal style={d(160)} className="mt-8 max-w-lg text-[1.08rem] leading-relaxed text-cream/70">
              {s.intro}
            </p>
            <p data-reveal style={d(220)} className="caps mt-10 flex flex-wrap gap-x-4 gap-y-2 text-sm tracking-[0.3em] text-gold">
              {["Cucina", "Dono", "Origine", "Sapore"].map((w, i) => (
                <span key={w} className="flex items-center gap-4">
                  {i > 0 && <span className="h-1 w-1 rotate-45 bg-gold/60" />}
                  {w}
                </span>
              ))}
            </p>
          </div>
          <figure data-reveal>
            <div className="relative aspect-[4/5] overflow-hidden">
              <Image src="/img/chef-1600.webp" alt="Lo chef ai fornelli del Prometeo" fill sizes="(max-width: 768px) 100vw, 45vw" className="object-cover" />
            </div>
            <figcaption className="label mt-4 text-[0.68rem] text-muted">In cucina</figcaption>
          </figure>
        </div>
      </section>

      {/* ---------------- PERCORSI DI SAPORI ---------------- */}
      <section className="bg-ink pb-24 md:pb-36">
        <header className="mx-auto max-w-7xl px-6 md:px-10">
          <Ornament className="max-w-xs" />
          <h2 data-reveal className="caps mt-8 text-[2.6rem] text-gold md:text-[4.5rem]">
            Percorsi
            <br />
            di sapori
          </h2>
          <p data-reveal style={d(100)} className="mt-6 max-w-md text-[1.05rem] text-cream/70">
            Lasciati guidare alla scoperta della nostra selezione d&apos;eccellenza e tradizioni locali.
          </p>
        </header>

        <div className="mx-auto mt-16 max-w-7xl space-y-20 md:mt-24 md:space-y-32 md:px-10">
          {PERCORSO.map((p, i) => {
            const flip = i % 2 === 1;
            return (
              <article key={p.name} className="grid items-center gap-8 lg:grid-cols-12 lg:gap-16">
                <figure data-reveal className={`relative aspect-[4/3] overflow-hidden lg:col-span-7 lg:aspect-[5/4] ${flip ? "lg:order-2" : ""}`}>
                  <Image src={p.img} alt={p.name} fill sizes="(max-width: 768px) 100vw, 58vw" className="object-cover" />
                </figure>
                <div className={`px-6 md:px-0 lg:col-span-5 ${flip ? "lg:order-1" : ""}`}>
                  <span data-reveal className="caps block text-sm tracking-[0.3em] text-gold/80">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 data-reveal style={d(60)} className="caps mt-3 text-[2rem] text-cream md:text-[2.7rem]">
                    {p.name}
                  </h3>
                  <div className="mt-8 space-y-6">
                    {p.notes.map((n, k) => (
                      // annotated like their own posts: a thin rule, a bold title, a line of text
                      <div key={n.t} data-reveal style={d(120 + k * 80)} className="border-l border-cream/60 pl-5">
                        <p className="font-semibold text-cream">{n.t}</p>
                        <p className="mt-1 leading-relaxed text-cream/70">{n.d}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-20 text-center md:mt-28">
          <Link href="/menu" className="link-arrow text-gold">
            Scopri tutto il menu <IconArrow className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ---------------- LA SALA (linen) ---------------- */}
      <section id="sala" className="bg-paper px-6 py-24 text-ink md:px-10 md:py-36">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 md:grid-cols-2 md:items-end">
            <h2 data-reveal className="caps text-[2.6rem] md:text-[4.5rem]">
              La sala
            </h2>
            <p data-reveal style={d(100)} className="max-w-md text-[1.05rem] leading-relaxed text-ink/75 md:justify-self-end">
              Il marmo nero venato d&apos;oro, il muro verde e una grande luna illuminata. E, nelle sere d&apos;estate, i tavoli
              all&apos;aperto su via Torraca.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-2 gap-3 md:grid-cols-12 md:gap-5">
            <figure data-reveal className="relative col-span-2 aspect-[16/10] overflow-hidden md:col-span-8 md:aspect-auto md:h-[36rem]">
              <Image src="/img/sala-luna-1600.webp" alt="La sala con la luna sul muro verde" fill sizes="(max-width: 768px) 100vw, 66vw" className="object-cover" />
            </figure>
            <figure data-reveal style={d(80)} className="relative aspect-[3/4] overflow-hidden md:col-span-4 md:aspect-auto md:h-[36rem]">
              <Image
                src="/img/sala-servizio-1600.webp"
                alt="Il servizio in sala sotto l'insegna Prometeo"
                fill
                sizes="(max-width: 768px) 50vw, 33vw"
                className="object-cover"
              />
            </figure>
            <figure data-reveal style={d(120)} className="relative aspect-[3/4] overflow-hidden md:col-span-4 md:aspect-auto md:h-[26rem]">
              <Image src="/img/sala-calici-1600.webp" alt="Calici sul tovagliato bianco" fill sizes="(max-width: 768px) 50vw, 33vw" className="object-cover" />
            </figure>
            <figure data-reveal style={d(160)} className="relative col-span-2 aspect-[16/10] overflow-hidden md:col-span-8 md:aspect-auto md:h-[26rem]">
              <Image
                src="/img/esterno-1600.webp"
                alt="L'insegna e i tavoli all'aperto su via Torraca"
                fill
                sizes="(max-width: 768px) 100vw, 66vw"
                className="object-cover object-[50%_40%]"
              />
            </figure>
          </div>

          {s.features.length > 0 && (
            <ul className="mt-12 grid grid-cols-2 gap-y-4 border-t border-ink/15 pt-8 md:grid-cols-4">
              {s.features.map((f) => (
                <li key={f} className="flex items-center gap-3 text-[0.95rem] text-ink/80">
                  <span className="h-1.5 w-1.5 shrink-0 rotate-45 bg-gold-deep" />
                  {f}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* ---------------- PRENOTA + CONTATTI ---------------- */}
      <section id="contatti" className="bg-ink px-6 py-24 md:px-10 md:py-36">
        <div className="mx-auto grid max-w-7xl gap-16 md:grid-cols-2 md:gap-20">
          <div>
            <h2 data-reveal className="caps text-[2.6rem] text-cream md:text-[4rem]">
              Il tuo tavolo
            </h2>
            <p data-reveal style={d(80)} className="mt-6 max-w-md text-[1.05rem] text-cream/70">
              Prenota online in pochi secondi: scegli quante persone, il giorno e l&apos;orario. Oppure chiamaci.
            </p>
            <div data-reveal style={d(140)} className="mt-10 flex flex-col gap-3 sm:flex-row">
              {s.booking.enabled && (
                <Link href="/prenota" className="btn btn-gold">
                  Prenota un tavolo
                </Link>
              )}
              {s.phone && (
                <a href={telHref(s.phone)} className="btn btn-line text-cream">
                  Chiama
                </a>
              )}
            </div>
            {s.rating.score && (
              <p data-reveal style={d(200)} className="mt-12 text-cream/70">
                <span className="caps text-3xl text-gold">{s.rating.score}</span>
                <span className="text-cream/50"> / 10</span>
                <span className="mx-3 text-cream/30">·</span>
                {s.rating.url ? (
                  <a href={s.rating.url} target="_blank" rel="noopener" className="underline underline-offset-4 hover:text-gold">
                    {s.rating.count} recensioni su {s.rating.source}
                  </a>
                ) : (
                  `${s.rating.count} recensioni`
                )}
              </p>
            )}
          </div>

          <div data-reveal style={d(100)}>
            <dl className="divide-y divide-line border-y border-line">
              <Row label="Indirizzo">
                <a href={s.mapsUrl} target="_blank" rel="noopener" className="hover:text-gold">
                  {s.address}, {s.city}
                </a>
              </Row>
              {(s.phone || s.phone2) && (
                <Row label="Telefono">
                  {[s.phone, s.phone2].filter(Boolean).map((p) => (
                    <a key={p} href={telHref(p)} className="block hover:text-gold">
                      {p}
                    </a>
                  ))}
                </Row>
              )}
              {s.email && (
                <Row label="Email">
                  <a href={`mailto:${s.email}`} className="[overflow-wrap:anywhere] hover:text-gold">
                    {s.email}
                  </a>
                </Row>
              )}
              <Row label="Orari">
                <OpenNow settings={s} className="mb-2 text-sm text-cream/70" />
                {hoursSummary(s).map((g) => (
                  <span key={g.label} className="flex justify-between gap-4">
                    <span>{g.label}</span>
                    <span className={`text-right ${g.closed ? "text-muted" : ""}`}>
                      {g.closed ? "Chiuso" : g.services.map((x) => `${x.open}–${x.close}`).join(" · ")}
                    </span>
                  </span>
                ))}
              </Row>
            </dl>
            <iframe
              title="Mappa: Prometeo Fine Dining, Via Michele Torraca 10, Matera"
              src={`https://www.google.com/maps?q=${encodeURIComponent(`${s.address}, ${s.city}`)}&output=embed`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="mt-8 h-64 w-full border-0 grayscale md:h-72"
            />
          </div>
        </div>
      </section>
    </>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="py-5 sm:grid sm:grid-cols-[8rem_1fr] sm:gap-4">
      <dt className="label pb-2 text-[0.68rem] text-gold sm:pb-0 sm:pt-1">{label}</dt>
      <dd className="min-w-0 text-cream/85">{children}</dd>
    </div>
  );
}

/** Structured data so Google shows address, phone, hours and booking link. */
function JsonLd({ s }: { s: Settings }) {
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const data = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: `${s.name} ${s.subtitle}`,
    image: `${SITE_URL}/img/og-image.jpg`,
    url: SITE_URL,
    telephone: s.phone || undefined,
    email: s.email || undefined,
    servesCuisine: ["Lucana", "Italiana"],
    acceptsReservations: `${SITE_URL}/prenota`,
    menu: `${SITE_URL}/menu`,
    sameAs: [s.facebook, s.instagram].filter(Boolean),
    address: {
      "@type": "PostalAddress",
      streetAddress: s.address,
      addressLocality: "Matera",
      postalCode: "75100",
      addressRegion: "MT",
      addressCountry: "IT",
    },
    openingHoursSpecification: s.hours.flatMap((day, i) =>
      day.closed ? [] : day.services.map((x) => ({ "@type": "OpeningHoursSpecification", dayOfWeek: dayNames[i], opens: x.open, closes: x.close })),
    ),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
