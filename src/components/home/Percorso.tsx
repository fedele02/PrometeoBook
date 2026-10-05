"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { IconChevron } from "../Icons";

export type Course = { img: string; name: string; notes: { t: string; d: string }[] };

/**
 * Phones: a horizontal journey, one dish per swipe, with a progress rule.
 * Desktop: the dishes alternate left and right down the page.
 */
export function Percorso({ courses }: { courses: Course[] }) {
  const track = useRef<HTMLOListElement>(null);
  const [active, setActive] = useState(0);

  // the current dish follows the scroll position of the track
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const cards = [...el.querySelectorAll<HTMLElement>("[data-i]")];
      const left = el.scrollLeft;
      let best = 0;
      cards.forEach((c, i) => {
        if (Math.abs(c.offsetLeft - 24 - left) < Math.abs(cards[best].offsetLeft - 24 - left)) best = i;
      });
      setActive(best);
    };
    const onScroll = () => (raf ||= requestAnimationFrame(update));
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const go = (i: number) => {
    const card = track.current?.querySelector<HTMLElement>(`[data-i="${i}"]`);
    if (card && track.current) track.current.scrollTo({ left: card.offsetLeft - 24, behavior: "smooth" });
  };

  return (
    <div>
      <ol
        ref={track}
        aria-label="Percorso dei piatti"
        className="no-scrollbar relative flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-6 px-6 lg:mx-auto lg:block lg:max-w-7xl lg:space-y-32 lg:overflow-visible lg:px-10"
      >
        {courses.map((c, i) => {
          const flip = i % 2 === 1;
          return (
            <li key={c.name} data-i={i} className="w-[84vw] max-w-[420px] shrink-0 snap-start lg:grid lg:w-auto lg:max-w-none lg:grid-cols-12 lg:items-center lg:gap-16">
              <figure className={`relative aspect-[4/5] overflow-hidden lg:col-span-7 lg:aspect-[5/4] ${flip ? "lg:order-2" : ""}`}>
                <Image src={c.img} alt={c.name} fill sizes="(max-width: 1024px) 84vw, 58vw" className="object-cover" />
                <span className="caps absolute left-4 top-4 bg-ink/70 px-2.5 py-1 text-xs tracking-[0.25em] text-gold lg:hidden">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </figure>
              <div className={`pt-6 lg:col-span-5 lg:pt-0 ${flip ? "lg:order-1" : ""}`}>
                <span className="caps hidden text-sm tracking-[0.3em] text-gold/80 lg:block">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="caps text-[1.75rem] text-cream lg:mt-3 lg:text-[2.7rem]">{c.name}</h3>
                <div className="mt-5 space-y-5 lg:mt-8">
                  {c.notes.map((n) => (
                    // annotated like their own posts: a thin rule, a bold title, a line of text
                    <div key={n.t} className="border-l border-cream/50 pl-4">
                      <p className="font-semibold text-cream">{n.t}</p>
                      <p className="mt-1 text-[0.98rem] leading-relaxed text-cream/70">{n.d}</p>
                    </div>
                  ))}
                </div>
              </div>
            </li>
          );
        })}
        {/* lets the last card snap to the start */}
        <li aria-hidden className="w-2 shrink-0 lg:hidden" />
      </ol>

      {/* progress + arrows, phones only */}
      <div className="mt-8 flex items-center gap-5 px-6 lg:hidden">
        <span className="caps w-14 text-sm tracking-[0.2em] text-gold" aria-live="polite">
          {String(active + 1).padStart(2, "0")}/{String(courses.length).padStart(2, "0")}
        </span>
        <span className="relative h-px flex-1 bg-cream/20">
          <span
            className="absolute inset-y-0 left-0 bg-gold transition-[width] duration-500"
            style={{ width: `${((active + 1) / courses.length) * 100}%` }}
          />
        </span>
        <button
          onClick={() => go(Math.max(0, active - 1))}
          disabled={active === 0}
          aria-label="Piatto precedente"
          className="grid h-11 w-11 place-items-center border border-cream/25 text-cream disabled:opacity-30"
        >
          <IconChevron dir="left" className="h-5 w-5" />
        </button>
        <button
          onClick={() => go(Math.min(courses.length - 1, active + 1))}
          disabled={active === courses.length - 1}
          aria-label="Piatto successivo"
          className="grid h-11 w-11 place-items-center border border-cream/25 text-cream disabled:opacity-30"
        >
          <IconChevron className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
