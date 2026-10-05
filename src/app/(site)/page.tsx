import Image from "next/image";
import Link from "next/link";
import { getPublicContent } from "@/lib/data";
import { SITE_URL, telHref } from "@/lib/site";
import { hoursSummary } from "@/lib/time";
import type { Settings } from "@/lib/types";
import { Hero } from "@/components/home/Hero";
import { Percorso, type Course } from "@/components/home/Percorso";
import { IconArrow, IconPhone, IconPin, IconPlus } from "@/components/Icons";
import { Ornament } from "@/components/Logo";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { OpenNow } from "@/components/site/OpenNow";

/** Dishes and words published by the restaurant itself on its Facebook page. */
const PERCORSO: Course[] = [
  {
    img: "/img/piatto-tonno-1600.webp",
    name: "Scottatino di tonno",
    notes: [
      {
        t: "Equilibrio di gusto",
        d: "Il tonno in doppia consistenza incontra la delicatezza della crema di zucchine; le zucchine croccanti aggiungono contrasto e carattere.",
      },
    ],
  },
  {
    img: "/img/piatto-cime-1600.webp",
    name: "Cime di rapa",
    notes: [{ t: "La cucina contadina", d: "Un gusto deciso e leggermente amarognolo. Tenere e saporite, custodiscono il profumo della Lucania." }],
  },
  {
    img: "/img/piatto-polpo-1600.webp",
    name: "Polpo rosticciato",
    notes: [{ t: "Mare e terra lucana", d: "Su purea di patate al peperone crusco." }],
  },
  {
    img: "/img/piatto-cannolo-1600.webp",
    name: "Cannolo scomposto",
    notes: [
      { t: "Consistenza e armonia", d: "La croccantezza della cialda e la cremosità della ricotta, in chiave contemporanea." },
      { t: "La dolcezza equilibrata", d: "Il cioccolato fondente aggiunge una nota amara e raffinata." },
    ],
  },
];

/** Splits the quote so its last clause can be set in gold. */
function splitQuote(q: string) {
  const i = q.lastIndexOf(",");
  return i > 0 ? [q.slice(0, i + 1), q.slice(i + 1).trim()] : [q, ""];
}

export default async function HomePage() {
  const { settings: s } = await getPublicContent();
  const [quoteA, quoteB] = splitQuote(s.about);

  return (
    <>
      <JsonLd s={s} />
      <Hero tagline={s.tagline} bookingEnabled={s.booking.enabled} rating={s.rating} />

      {/* ---------------- IL MITO ---------------- */}
      <section className="bg-ink px-6 py-20 md:px-10 md:py-36">
        <div className="mx-auto grid max-w-7xl items-center gap-12 md:grid-cols-[1.1fr_1fr] md:gap-20">
          <div>
            <Reveal as="blockquote" className="font-serif text-[2.15rem] leading-[1.12] text-cream md:text-[3.6rem]">
              {quoteA} {quoteB && <em className="text-gold">{quoteB}</em>}
            </Reveal>
            <Reveal as="p" delay={160} className="mt-7 max-w-lg text-[1.05rem] leading-relaxed text-cream/70">
              {s.intro}
            </Reveal>
          </div>
          <Reveal as="figure" className="relative -mx-6 md:mx-0">
            <div className="relative aspect-[4/5] overflow-hidden">
              <Image src="/img/chef-1600.webp" alt="Lo chef ai fornelli del Prometeo" fill sizes="(max-width: 768px) 100vw, 45vw" className="object-cover" />
            </div>
            <figcaption className="absolute bottom-0 left-0 bg-ink px-6 py-3 text-sm text-cream/80 md:px-4">In cucina</figcaption>
          </Reveal>
        </div>
      </section>

      {/* ---------------- PERCORSI DI SAPORI ---------------- */}
      <section className="overflow-hidden bg-ink pb-20 md:pb-36">
        <header className="mx-auto max-w-7xl px-6 md:px-10">
          <Ornament />
          <Reveal as="h2" className="caps mt-7 text-[2.5rem] text-gold md:text-[4.5rem]">
            Percorsi
            <br />
            di sapori
          </Reveal>
          <Reveal as="p" delay={100} className="mt-5 max-w-md text-[1.05rem] text-cream/70">
            Lasciati guidare alla scoperta della nostra selezione d&apos;eccellenza e tradizioni locali.
          </Reveal>
        </header>

        <Reveal delay={150} className="mt-10 lg:mt-24">
          <Percorso courses={PERCORSO} />
        </Reveal>

        <div className="mt-12 px-6 md:mt-28 md:text-center">
          <Link href="/menu" className="link-arrow text-gold">
            Scopri tutto il menu <IconArrow className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ---------------- LA SALA ---------------- */}
      <section id="sala" className="bg-ink-2 px-6 py-20 md:px-10 md:py-36">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 md:grid-cols-2 md:items-end md:gap-8">
            <Reveal as="h2" className="caps text-[2.5rem] text-cream md:text-[4.5rem]">
              La sala
            </Reveal>
            <Reveal delay={100} className="max-w-md md:justify-self-end">
              <p className="text-[1.05rem] leading-relaxed text-cream/75">
                Marmo nero venato d&apos;oro, un muro verde e una grande luna illuminata: il luogo dove la tradizione lucana diventa
                fine dining.
              </p>
              {s.features.length > 0 && <p className="mt-4 text-[0.95rem] leading-relaxed text-cream/55">{s.features.join(" · ")}</p>}
            </Reveal>
          </div>

          <Stagger className="mt-10 grid grid-cols-2 gap-2 md:mt-14 md:grid-cols-12 md:gap-5">
            <Photo
              src="/img/sala-luna-1600.webp"
              alt="La sala con la luna sul muro verde"
              caption="La luna"
              sizes="(max-width: 768px) 100vw, 66vw"
              className="col-span-2 aspect-[4/3] md:col-span-8 md:aspect-auto md:h-[36rem]"
            />
            <Photo
              src="/img/sala-servizio-1600.webp"
              alt="Il servizio in sala sotto l'insegna Prometeo"
              caption="Il servizio"
              sizes="(max-width: 768px) 50vw, 33vw"
              className="aspect-[3/4] md:col-span-4 md:aspect-auto md:h-[36rem]"
            />
            <Photo
              src="/img/sala-calici-1600.webp"
              alt="Calici sul tovagliato bianco"
              caption="La mise en place"
              sizes="(max-width: 768px) 50vw, 33vw"
              className="aspect-[3/4] md:col-span-4 md:aspect-auto md:h-[26rem]"
            />
            <Photo
              src="/img/esterno-1600.webp"
              alt="L'insegna e i tavoli all'aperto su via Torraca"
              caption="All'aperto, su via Torraca"
              sizes="(max-width: 768px) 100vw, 66vw"
              className="col-span-2 aspect-[4/3] md:col-span-8 md:aspect-auto md:h-[26rem]"
              position="object-[50%_40%]"
            />
          </Stagger>
        </div>
      </section>

      {/* ---------------- RECENSIONI (social proof) ---------------- */}
      {(s.reviews.length > 0 || s.rating.score) && (
        <section className="bg-ink px-6 py-20 md:px-10 md:py-32">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <Reveal as="h2" className="caps text-[2.5rem] text-cream md:text-[4rem]">
                Dicono di noi
              </Reveal>
              {s.rating.score && (
                <Reveal delay={80} className="flex items-baseline gap-3">
                  <span className="caps text-5xl text-gold md:text-6xl">{s.rating.score}</span>
                  <span className="text-cream/70">
                    / 10 su {s.rating.source}
                    {s.rating.count && (
                      <>
                        <br />
                        {s.rating.url ? (
                          <a href={s.rating.url} target="_blank" rel="noopener" className="underline underline-offset-4 hover:text-gold">
                            {s.rating.count} recensioni
                          </a>
                        ) : (
                          `${s.rating.count} recensioni`
                        )}
                      </>
                    )}
                  </span>
                </Reveal>
              )}
            </div>

            {s.reviews.length > 0 && (
              <Stagger
                as="ul"
                className="no-scrollbar -mx-6 mt-10 flex snap-x snap-mandatory scroll-px-6 gap-4 overflow-x-auto px-6 md:mx-0 md:mt-14 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0"
              >
                {s.reviews.map((r) => (
                  <StaggerItem as="li" key={r.author + r.quote} className="flex w-[82vw] max-w-sm shrink-0 snap-start flex-col border-t border-gold/50 pt-6 md:w-auto md:max-w-none">
                    <blockquote className="flex-1 font-serif text-[1.45rem] leading-snug text-cream">“{r.quote}”</blockquote>
                    <p className="mt-5 text-sm text-cream/60">
                      <span className="font-semibold text-cream">{r.author}</span> · {r.source}
                    </p>
                  </StaggerItem>
                ))}
              </Stagger>
            )}
          </div>
        </section>
      )}

      {/* ---------------- PRENOTA ---------------- */}
      {s.booking.enabled && (
        <section className="bg-ink md:px-10 md:py-32">
          <div className="mx-auto grid max-w-7xl md:grid-cols-2 md:items-center md:gap-16">
            <Reveal as="figure" className="relative aspect-[16/11] overflow-hidden md:aspect-[4/5]">
              <Image src="/img/sala-mise-1600.webp" alt="Un tavolo apparecchiato al Prometeo" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink to-transparent md:hidden" />
            </Reveal>
            <div className="px-6 pb-20 pt-4 md:px-0 md:py-0">
              <Reveal as="p" className="label text-gold">
                Prenotazioni
              </Reveal>
              <Reveal as="h2" delay={80} className="caps mt-5 text-[2.5rem] leading-[1.05] text-cream md:text-[4rem]">
                Il tuo tavolo
                <br />
                ti aspetta
              </Reveal>
              <Reveal as="p" delay={140} className="mt-6 max-w-md text-[1.05rem] text-cream/75">
                Persone, giorno, orario: bastano pochi secondi
                {s.booking.autoConfirm ? " e la conferma è immediata." : "."}
              </Reveal>
              <Reveal delay={200} className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link href="/prenota" className="btn btn-gold">
                  Prenota un tavolo
                </Link>
                {s.phone && (
                  <a href={telHref(s.phone)} className="btn btn-line text-cream">
                    <IconPhone className="h-4 w-4" /> Chiama
                  </a>
                )}
              </Reveal>
            </div>
          </div>
        </section>
      )}

      {/* ---------------- FAQ ---------------- */}
      {s.faq.length > 0 && (
        <section className="bg-ink-2 px-6 py-20 md:px-10 md:py-32">
          <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1fr_1.4fr] md:gap-20">
            <Reveal as="h2" className="caps text-[2.5rem] leading-[1.05] text-cream md:text-[3.5rem]">
              Domande
              <br />
              frequenti
            </Reveal>
            <Stagger className="border-t border-line">
              {s.faq.map((f) => (
                <StaggerItem key={f.q} className="border-b border-line">
                  <details className="group">
                    <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 py-5 text-[1.08rem] font-semibold text-cream [&::-webkit-details-marker]:hidden">
                      {f.q}
                      <IconPlus className="h-5 w-5 shrink-0 text-gold transition-transform duration-300 group-open:rotate-45" />
                    </summary>
                    <p className="max-w-xl pb-6 leading-relaxed text-cream/70">{f.a}</p>
                  </details>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>
      )}

      {/* ---------------- DOVE SIAMO ---------------- */}
      <section id="contatti" className="bg-ink px-6 pt-20 md:px-10 md:py-32">
        <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-2 md:gap-20">
          <div>
            <Reveal as="h2" className="caps text-[2.5rem] text-cream md:text-[3.5rem]">
              Dove siamo
            </Reveal>
            <Reveal delay={80}>
              <a href={s.mapsUrl} target="_blank" rel="noopener" className="mt-6 flex items-start gap-3 text-[1.15rem] leading-snug text-cream hover:text-gold">
                <IconPin className="mt-0.5 h-6 w-6 shrink-0 text-gold" />
                <span>
                  {s.address}
                  <span className="block text-cream/60">{s.city}</span>
                  <span className="link-arrow mt-3 text-[0.72rem] text-gold">
                    Indicazioni <IconArrow className="h-3.5 w-3.5" />
                  </span>
                </span>
              </a>
            </Reveal>

            <Reveal delay={140} className="mt-10">
              <p className="label text-[0.7rem] text-gold">Orari</p>
              <OpenNow settings={s} className="mt-3 text-[0.95rem] text-cream" />
              <ul className="mt-4 space-y-2 text-cream/80">
                {hoursSummary(s).map((g) => (
                  <li key={g.label} className="flex flex-wrap justify-between gap-x-4 border-b border-line pb-2">
                    <span>{g.label}</span>
                    <span className={g.closed ? "text-muted" : ""}>
                      {g.closed ? "Chiuso" : g.services.map((x) => `${x.open}–${x.close}`).join("  ·  ")}
                    </span>
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={200} className="mt-10">
              <p className="label text-[0.7rem] text-gold">Contatti</p>
              <div className="mt-2">
                {[s.phone, s.phone2].filter(Boolean).map((p) => (
                  <a key={p} href={telHref(p)} className="block py-2 text-[1.05rem] text-cream hover:text-gold">
                    {p}
                  </a>
                ))}
                {s.email && (
                  <a href={`mailto:${s.email}`} className="block py-2 text-[1.05rem] text-cream [overflow-wrap:anywhere] hover:text-gold">
                    {s.email}
                  </a>
                )}
              </div>
            </Reveal>
          </div>

          <Reveal delay={100} className="-mx-6 md:mx-0">
            <iframe
              title="Mappa: Prometeo Fine Dining, Via Michele Torraca 10, Matera"
              src={`https://www.google.com/maps?q=${encodeURIComponent(`${s.address}, ${s.city}`)}&output=embed`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-80 w-full border-0 [filter:invert(.92)_hue-rotate(180deg)_grayscale(1)_contrast(.9)] md:h-full md:min-h-[32rem]"
            />
          </Reveal>
        </div>
      </section>
    </>
  );
}

function Photo({
  src,
  alt,
  caption,
  sizes,
  className,
  position = "",
}: {
  src: string;
  alt: string;
  caption: string;
  sizes: string;
  className: string;
  position?: string;
}) {
  return (
    <StaggerItem as="figure" className={`group relative overflow-hidden ${className}`}>
      <Image src={src} alt={alt} fill sizes={sizes} className={`object-cover transition-transform duration-700 group-hover:scale-[1.03] ${position}`} />
      <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-3 pb-2.5 pt-8 text-[0.8rem] text-white md:px-5 md:pb-4 md:text-sm">
        {caption}
      </figcaption>
    </StaggerItem>
  );
}

/** Structured data: restaurant info and the FAQ, so Google can show both. */
function JsonLd({ s }: { s: Settings }) {
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const restaurant = {
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
  const faq = s.faq.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: s.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      }
    : null;
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq ? [restaurant, faq] : restaurant) }} />;
}
