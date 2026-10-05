import { getImageProps } from "next/image";
import Link from "next/link";
import { IconArrow, IconStar } from "../Icons";
import { Emblem, Wordmark } from "../Logo";

type Props = {
  tagline: string;
  bookingEnabled: boolean;
  rating: { score: string; count: string; source: string };
};

/** Full-screen photo of the dining room, portrait crop on phones. */
export function Hero({ tagline, bookingEnabled, rating }: Props) {
  const common = { alt: "La sala del Prometeo con la luna illuminata", sizes: "100vw", quality: 75, priority: true };
  const {
    props: { srcSet: desktop },
  } = getImageProps({ ...common, src: "/img/sala-luna-1600.webp", width: 1600, height: 900 });
  const {
    props: { srcSet: mobile, ...img },
  } = getImageProps({ ...common, src: "/img/sala-tavolo-1600.webp", width: 1072, height: 1339 });

  return (
    <section className="relative flex h-[100svh] min-h-[540px] flex-col overflow-hidden bg-ink">
      <picture className="absolute inset-0">
        <source media="(min-width: 768px)" srcSet={desktop} />
        <source srcSet={mobile} />
        <img {...img} className="h-full w-full object-cover object-[50%_25%] md:object-center" alt={img.alt} />
      </picture>
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-transparent to-transparent" />
      {/* the lower part, where the text sits, goes almost black */}
      <div className="absolute inset-x-0 bottom-0 h-[72%] bg-gradient-to-t from-ink via-ink/85 to-transparent" />

      <div className="relative mx-auto mt-auto w-full max-w-7xl px-6 pb-[calc(env(safe-area-inset-bottom)+2rem)] md:px-10 md:pb-16">
        <h1 className="flex w-[min(74vw,480px)] flex-col text-gold [@media(max-height:640px)]:w-[min(60vw,400px)]">
          <span className="sr-only">Prometeo Fine Dining, Matera</span>
          <Emblem className="h-auto w-[19%]" />
          <Wordmark className="mt-4 h-auto w-full" title="" />
          <span className="font-display mt-2.5 whitespace-nowrap text-[clamp(0.66rem,2.6vw,0.95rem)] tracking-[0.62em]">
            FINE DINING
          </span>
        </h1>

        <p className="mt-6 max-w-[22rem] font-serif text-[1.55rem] italic leading-[1.2] text-cream md:mt-8 md:max-w-xl md:text-[2.1rem]">
          {tagline}
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-5 [@media(max-height:640px)]:mt-5">
          {bookingEnabled && (
            <Link href="/prenota" className="btn btn-gold w-full sm:w-auto">
              Prenota un tavolo
            </Link>
          )}
          <Link href="/menu" className="link-arrow text-cream">
            Scopri il menu <IconArrow className="h-4 w-4" />
          </Link>
        </div>

        {rating.score && (
          <p className="mt-8 flex items-center gap-2 text-sm text-cream/70 [@media(max-height:640px)]:hidden">
            <IconStar className="h-4 w-4 text-gold" />
            <span>
              <b className="font-semibold text-cream">{rating.score}/10</b> su {rating.source} · {rating.count} recensioni
            </span>
          </p>
        )}
      </div>
    </section>
  );
}
