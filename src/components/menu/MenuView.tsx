"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { DISH_TAGS, tagLabel } from "@/lib/catalog";
import { euro } from "@/lib/site";
import type { Category, Dish } from "@/lib/types";
import { DishSheet } from "./DishSheet";

/** vegan dishes are vegetarian too */
const matches = (d: Dish, f: string) => d.tags.includes(f) || (f === "vegetariano" && d.tags.includes("vegano"));

export function MenuView({ categories, dishes }: { categories: Category[]; dishes: Dish[] }) {
  const [filter, setFilter] = useState<string | null>(null);
  const [active, setActive] = useState(categories[0]?.id);
  const [open, setOpen] = useState<Dish | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  // dietary filters appear only when the kitchen has tagged some dish
  const filters = DISH_TAGS.filter((t) => t.filter && dishes.some((d) => matches(d, t.id)));

  const byCat = useMemo(() => {
    const shown = filter ? dishes.filter((d) => matches(d, filter)) : dishes;
    const m = new Map<string, Dish[]>();
    for (const d of shown) m.set(d.category_id, [...(m.get(d.category_id) ?? []), d]);
    return m;
  }, [dishes, filter]);
  const visibleCats = categories.filter((c) => byCat.get(c.id)?.length);

  // scroll-spy for the category bar
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        const top = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (top) setActive(top.target.id.replace("cat-", ""));
      },
      { rootMargin: "-150px 0px -55% 0px" },
    );
    document.querySelectorAll("[data-cat]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [visibleCats.length, filter]);

  // keep the active tab visible inside the horizontal bar
  useEffect(() => {
    const bar = navRef.current;
    const tab = bar?.querySelector<HTMLElement>(`[data-tab="${active}"]`);
    if (bar && tab) bar.scrollTo({ left: tab.offsetLeft - bar.clientWidth / 2 + tab.clientWidth / 2, behavior: "smooth" });
  }, [active]);

  // deep link: /menu#dish-id opens that dish
  useEffect(() => {
    const id = decodeURIComponent(location.hash.slice(1));
    const d = dishes.find((x) => x.id === id);
    if (!d) return;
    const raf = requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ block: "center" });
      setOpen(d);
    });
    return () => cancelAnimationFrame(raf);
  }, [dishes]);

  const jump = (id: string) => {
    const el = document.getElementById(`cat-${id}`);
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 140, behavior: "smooth" });
  };

  return (
    <>
      {/* sticky category tabs */}
      <div className="sticky top-[var(--header-h,4rem)] z-30 border-y border-line bg-ink">
        <div ref={navRef} className="no-scrollbar mx-auto flex max-w-4xl justify-start gap-8 overflow-x-auto px-6 sm:justify-center">
          {visibleCats.map((c) => (
            <button
              key={c.id}
              data-tab={c.id}
              onClick={() => jump(c.id)}
              aria-current={active === c.id}
              className={`label relative shrink-0 py-5 transition-colors ${active === c.id ? "text-gold" : "text-cream/70 hover:text-cream"}`}
            >
              {c.name}
              <span className={`absolute inset-x-0 bottom-0 h-0.5 bg-gold transition-opacity ${active === c.id ? "opacity-100" : "opacity-0"}`} />
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6">
        {filters.length > 0 && (
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-8 text-sm" role="group" aria-label="Filtra i piatti">
            <span className="text-muted">Mostra solo:</span>
            {filters.map((f) => (
              <button
                key={f.id}
                aria-pressed={filter === f.id}
                onClick={() => setFilter(filter === f.id ? null : f.id)}
                className={`border-b py-1 font-semibold transition ${filter === f.id ? "border-gold text-gold" : "border-transparent text-cream/70"}`}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}

        {visibleCats.map((c) => (
          <section key={c.id} id={`cat-${c.id}`} data-cat className="scroll-mt-40 pt-16 md:pt-20">
            <h2 className="caps text-center text-[1.9rem] text-gold md:text-[2.4rem]">{c.name}</h2>
            {c.description && <p className="mt-2 text-center font-serif text-lg italic text-cream/60">{c.description}</p>}
            <ul className="mt-8 border-t border-line">
              {byCat.get(c.id)!.map((d) => (
                <li key={d.id}>
                  <DishRow d={d} onOpen={() => setOpen(d)} />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <DishSheet dish={open} onClose={() => setOpen(null)} />
    </>
  );
}

function DishRow({ d, onOpen }: { d: Dish; onOpen: () => void }) {
  const extra = d.tags.filter((t) => t !== "signature");
  return (
    <button
      id={d.id}
      onClick={onOpen}
      className={`group flex w-full items-start gap-4 border-b border-line py-5 text-left md:gap-6 md:py-6 ${d.available ? "" : "opacity-50"}`}
    >
      {d.image_url && (
        <span className="relative aspect-square w-20 shrink-0 overflow-hidden md:w-28">
          <Image src={d.image_url} alt="" fill sizes="112px" className="object-cover transition-transform duration-700 group-hover:scale-105" />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline justify-between gap-4">
          <span className="text-[1.08rem] font-semibold leading-snug text-cream group-hover:text-gold md:text-[1.15rem]">{d.name}</span>
          {d.price !== null && <span className="caps shrink-0 text-lg text-gold">{euro(d.price)}</span>}
        </span>
        {d.description && <span className="mt-1.5 block leading-relaxed text-cream/65">{d.description}</span>}
        {(d.price_note || extra.length > 0 || !d.available) && (
          <span className="mt-2 block text-sm italic text-gold/80">
            {[d.price_note, ...extra.map(tagLabel), !d.available ? "esaurito oggi" : ""].filter(Boolean).join(" · ")}
          </span>
        )}
      </span>
    </button>
  );
}
