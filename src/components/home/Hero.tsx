import { getImageProps } from "next/image";
import Link from "next/link";
import { Emblem, Ornament, Wordmark } from "../Logo";

/** Full-screen photo of the dining room, portrait crop on phones. */
export function Hero({ tagline, address, bookingEnabled }: { tagline: string; address: string; bookingEnabled: boolean }) {
  const common = { alt: "La sala del Prometeo con la luna illuminata", sizes: "100vw", quality: 75, priority: true };
  const {
    props: { srcSet: desktop },
  } = getImageProps({ ...common, src: "/img/sala-luna-1600.webp", width: 1600, height: 900 });
  const {
    props: { srcSet: mobile, ...img },
  } = getImageProps({ ...common, src: "/img/sala-tavolo-1600.webp", width: 1072, height: 1339 });

  return (
    <section className="relative flex h-[100svh] min-h-[560px] flex-col overflow-hidden bg-ink">
      <picture className="absolute inset-0">
        <source media="(min-width: 768px)" srcSet={desktop} />
        <source srcSet={mobile} />
        <img {...img} className="anim-zoom h-full w-full object-cover object-[50%_30%] md:object-center" alt={img.alt} />
      </picture>
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-transparent" />
      {/* the lower part, where the text sits, goes almost black */}
      <div className="absolute inset-x-0 bottom-0 h-[70%] bg-gradient-to-t from-ink via-ink/85 to-transparent" />

      <div className="relative mt-auto px-6 pb-[calc(env(safe-area-inset-bottom)+2.5rem)] text-center md:pb-16">
        <h1 className="mx-auto flex w-[min(78vw,520px)] flex-col items-center text-gold">
          <span className="sr-only">Prometeo Fine Dining, Matera</span>
          <Emblem className="anim-rise h-auto w-[22%]" />
          <Wordmark className="anim-rise mt-5 h-auto w-full" title="" />
          <span
            className="anim-rise font-display mt-3 text-[clamp(0.7rem,2.6vw,1rem)] tracking-[0.55em]"
            style={{ "--d": "120ms" } as React.CSSProperties}
          >
            FINE DINING
          </span>
        </h1>
        <Ornament className="anim-rise mx-auto mt-6 w-48" />
        <p className="anim-rise mt-5 font-serif text-[1.6rem] italic text-cream md:text-3xl" style={{ "--d": "220ms" } as React.CSSProperties}>
          {tagline}
        </p>
        <div
          className="anim-rise mx-auto mt-8 flex max-w-sm flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center"
          style={{ "--d": "320ms" } as React.CSSProperties}
        >
          {bookingEnabled && (
            <Link href="/prenota" className="btn btn-gold">
              Prenota un tavolo
            </Link>
          )}
          <Link href="/menu" className="btn btn-line text-cream">
            Il menu
          </Link>
        </div>
        <p className="label mt-8 text-[0.68rem] text-cream/60">{address}</p>
      </div>
    </section>
  );
}
