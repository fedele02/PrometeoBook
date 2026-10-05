import Image from "next/image";
import Link from "next/link";
import { getPublicContent } from "@/lib/data";
import { SITE_URL, telHref } from "@/lib/site";
import { hoursSummary } from "@/lib/time";
import type { Settings } from "@/lib/types";
import { Hero } from "@/components/home/Hero";
import { Percorso, type Course } from "@/components/home/Percorso";
import { IconArrow, IconPhone, IconPin } from "@/components/Icons";
import { Flame, Ornament } from "@/components/Logo";
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
  const d = (ms: number) => ({ "--d": `${ms}ms` }) as React.CSSProperties;
  const [quoteA, quoteB] = splitQuote(s.about);

  return (
    <>
      <JsonLd s={s} />
      <Hero tagline={s.tagline} bookingEnabled={s.booking.enabled} rating={s.rating} />

      {/* ---------------- IL MITO ---------------- */}
      <section className="bg-ink px-6 pb-20 pt-20 md:px-10 md:py-36">
        <div className="mx-auto grid max-w-7xl items-center gap-12 md:grid-cols-[1.1fr_1fr] md:gap-20">
          <div>
            <span data-reveal className="block text-gold">
              <Flame className="h-6 w-6" />
            </span>
            <blockquote data-reveal style={d(80)} className="mt-6 font-serif text-[2.15rem] leading-[1.12] text-cream md:text-[3.6rem]">
              {quoteA} {quoteB && <em className="text-gold">{quoteB}</em>}
            </blockquote>
            <p data-reveal style={d(160)} className="mt-7 max-w-lg text-[1.05rem] leading-relaxed text-cream/70">
              {s.intro}
            </p>
          </div>
          <figure data-reveal className="relative -mx-6 md:mx-0">
            <div className="relative aspect-[4/5] overflow-hidden">
              <Image src="/img/chef-1600.webp" alt="Lo chef ai fornelli del Prometeo" fill sizes="(max-width: 768px) 100vw, 45vw" className="object-cover" />
            </div>
            <figcaption className="absolute bottom-0 left-0 bg-ink px-6 py-3 text-sm text-cream/80 md:px-4">
              In cucina
            </figcaption>
          </figure>
        </div>
      </section>

      {/* ---------------- PERCORSI DI SAPORI ---------------- */}
      <section className="overflow-hidden bg-ink pb-20 md:pb-36">
        <header className="mx-auto max-w-7xl px-6 md:px-10">
          <Ornament className="max-w-[12rem]" />
          <h2 data-reveal className="caps mt-7 text-[2.5rem] text-gold md:text-[4.5rem]">
            Percorsi
            <br />
            di sapori
          </h2>
          <p data-reveal style={d(100)} className="mt-5 max-w-md text-[1.05rem] text-cream/70">
            Lasciati guidare alla scoperta della nostra selezione d&apos;eccellenza e tradizioni locali.
          </p>
        </header>

        <div data-reveal style={d(150)} className="mt-10 lg:mt-24">
          <Percorso courses={PERCORSO} />
        </div>

        <div className="mt-12 px-6 md:mt-28 md:text-center">
          <Link href="/menu" className="link-arrow text-gold">
            Scopri tutto il menu <IconArrow className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ---------------- LA SALA (linen) ---------------- */}
      <section id="sala" className="bg-paper px-6 py-20 text-ink md:px-10 md:py-36">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 md:grid-cols-2 md:items-end md:gap-8">
            <h2 data-reveal className="caps text-[2.5rem] md:text-[4.5rem]">
              La sala
            </h2>
            <div data-reveal style={d(100)} className="max-w-md md:justify-self-end">
              <p className="text-[1.05rem] leading-relaxed text-ink/75">
                Marmo nero venato d&apos;oro, un muro verde e una grande luna illuminata: il luogo dove la tradizione lucana diventa
                fine dining.
              </p>
              {s.features.length > 0 && <p className="mt-4 text-[0.95rem] leading-relaxed text-ink/60">{s.features.join(" · ")}</p>}
            </div>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-2 md:mt-14 md:grid-cols-12 md:gap-5">
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
              delay={80}
            />
            <Photo
              src="/img/sala-calici-1600.webp"
              alt="Calici sul tovagliato bianco"
              caption="La mise en place"
              sizes="(max-width: 768px) 50vw, 33vw"
              className="aspect-[3/4] md:col-span-4 md:aspect-auto md:h-[26rem]"
              delay={120}
            />
            <Photo
              src="/img/esterno-1600.webp"
              alt="L'insegna e i tavoli all'aperto su via Torraca"
              caption="All'aperto, su via Torraca"
              sizes="(max-width: 768px) 100vw, 66vw"
              className="col-span-2 aspect-[4/3] md:col-span-8 md:aspect-auto md:h-[26rem]"
              position="object-[50%_40%]"
              delay={160}
            />
          </div>
        </div>
      </section>

      {/* ---------------- PRENOTA ---------------- */}
      {s.booking.enabled && (
        <section className="relative isolate overflow-hidden px-6 py-24 md:px-10 md:py-40">
          <Image src="/img/sala-servizio-1600.webp" alt="" fill sizes="100vw" className="-z-10 object-cover object-[50%_35%]" />
          <div className="absolute inset-0 -z-10 bg-ink/80" />
          <div className="mx-auto max-w-3xl md:text-center">
            <p data-reveal className="label text-gold">
              Prenotazioni
            </p>
            <h2 data-reveal style={d(80)} className="caps mt-5 text-[2.5rem] leading-[1.05] text-cream md:text-[4.2rem]">
              Il tuo tavolo
              <br />
              ti aspetta
            </h2>
            <p data-reveal style={d(140)} className="mt-6 max-w-md text-[1.05rem] text-cream/80 md:mx-auto">
              Persone, giorno, orario: bastano pochi secondi
              {s.booking.autoConfirm ? " e la conferma è immediata." : "."}
            </p>
            <div data-reveal style={d(200)} className="mt-9 flex flex-col gap-3 sm:flex-row md:justify-center">
              <Link href="/prenota" className="btn btn-gold">
                Prenota un tavolo
              </Link>
              {s.phone && (
                <a href={telHref(s.phone)} className="btn btn-line text-cream">
                  <IconPhone className="h-4 w-4" /> Chiama
                </a>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ---------------- CONTATTI ---------------- */}
      <section id="contatti" className="bg-ink px-6 py-20 md:px-10 md:py-32">
        <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-2 md:gap-20">
          <div>
            <h2 data-reveal className="caps text-[2.5rem] text-cream md:text-[3.5rem]">
              Dove siamo
            </h2>
            <a
              data-reveal
              style={d(80)}
              href={s.mapsUrl}
              target="_blank"
              rel="noopener"
              className="mt-6 flex items-start gap-3 text-[1.15rem] leading-snug text-cream hover:text-gold"
            >
              <IconPin className="mt-0.5 h-6 w-6 shrink-0 text-gold" />
              <span>
                {s.address}
                <span className="block text-cream/60">{s.city}</span>
                <span className="link-arrow mt-3 text-[0.72rem] text-gold">
                  Indicazioni <IconArrow className="h-3.5 w-3.5" />
                </span>
              </span>
            </a>

            <div data-reveal style={d(140)} className="mt-10">
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
            </div>

            <div data-reveal style={d(200)} className="mt-10 space-y-1.5">
              <p className="label text-[0.7rem] text-gold">Contatti</p>
              {[s.phone, s.phone2].filter(Boolean).map((p) => (
                <a key={p} href={telHref(p)} className="block py-1 text-[1.05rem] text-cream hover:text-gold">
                  {p}
                </a>
              ))}
              {s.email && (
                <a href={`mailto:${s.email}`} className="block py-1 text-[1.05rem] text-cream [overflow-wrap:anywhere] hover:text-gold">
                  {s.email}
                </a>
              )}
            </div>
          </div>

          <div data-reveal style={d(100)} className="-mx-6 md:mx-0">
            <iframe
              title="Mappa: Prometeo Fine Dining, Via Michele Torraca 10, Matera"
              src={`https://www.google.com/maps?q=${encodeURIComponent(`${s.address}, ${s.city}`)}&output=embed`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-80 w-full border-0 grayscale md:h-full md:min-h-[32rem]"
            />
          </div>
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
  delay = 0,
}: {
  src: string;
  alt: string;
  caption: string;
  sizes: string;
  className: string;
  position?: string;
  delay?: number;
}) {
  return (
    <figure data-reveal style={{ "--d": `${delay}ms` } as React.CSSProperties} className={`group relative overflow-hidden ${className}`}>
      <Image src={src} alt={alt} fill sizes={sizes} className={`object-cover transition-transform duration-700 group-hover:scale-[1.03] ${position}`} />
      <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 pb-2.5 pt-8 text-[0.8rem] text-white md:px-5 md:pb-4 md:text-sm">
        {caption}
      </figcaption>
    </figure>
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
