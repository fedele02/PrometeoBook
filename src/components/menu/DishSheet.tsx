"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useDragControls } from "motion/react";
import { useEffect } from "react";
import { ALLERGENS, tagLabel } from "@/lib/catalog";
import { euro } from "@/lib/site";
import type { Dish } from "@/lib/types";
import { IconClose } from "../Icons";

/** Bottom sheet on phones (drag the handle down to close), dialog on desktop. */
export function DishSheet({ dish, onClose }: { dish: Dish | null; onClose: () => void }) {
  const drag = useDragControls();

  useEffect(() => {
    if (!dish) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = prev;
      removeEventListener("keydown", onKey);
    };
  }, [dish, onClose]);

  const tags = dish?.tags.filter((t) => t !== "signature") ?? [];

  return (
    <AnimatePresence>
      {dish && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center md:items-center md:p-8">
          <motion.div
            className="absolute inset-0 bg-black/75"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="dish-title"
            className="relative max-h-[92dvh] w-full overflow-y-auto overscroll-contain bg-ink-2 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] md:max-w-xl md:pb-8"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 34, stiffness: 340 }}
            drag="y"
            dragControls={drag}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, info) => (info.offset.y > 120 || info.velocity.y > 600) && onClose()}
          >
            {/* drag zone: only here, so scrolling the content never moves the sheet */}
            <div onPointerDown={(e) => drag.start(e)} className="absolute inset-x-0 top-0 z-10 h-14 touch-none md:hidden" aria-hidden>
              <div className="mx-auto mt-2.5 h-1 w-12 rounded-full bg-white/50" />
            </div>
            <button
              onClick={onClose}
              aria-label="Chiudi"
              className="absolute right-3 top-3 z-20 grid h-11 w-11 place-items-center bg-black/60 text-cream"
            >
              <IconClose className="h-5 w-5" />
            </button>

            {dish.image_url ? (
              <div className="relative aspect-[4/3] w-full">
                <Image src={dish.image_url} alt={dish.name} fill sizes="(max-width: 768px) 100vw, 576px" className="pointer-events-none object-cover" />
              </div>
            ) : (
              <div className="h-16" />
            )}

            <div className="px-6 pt-6 md:px-8">
              <div className="flex items-start justify-between gap-4">
                <h2 id="dish-title" className="text-[1.5rem] font-semibold leading-tight text-cream">
                  {dish.name}
                </h2>
                {dish.price !== null && <span className="caps shrink-0 pt-1 text-2xl text-gold">€ {euro(dish.price)}</span>}
              </div>
              {dish.price_note && <p className="mt-1 italic text-gold/80">{dish.price_note}</p>}
              {!dish.available && <p className="mt-3 font-semibold text-ember">Esaurito per oggi</p>}
              {dish.description && <p className="mt-4 text-[1.05rem] leading-relaxed text-cream/75">{dish.description}</p>}
              {tags.length > 0 && <p className="mt-4 text-sm text-gold">{tags.map(tagLabel).join(" · ")}</p>}

              <div className="mt-6 border-t border-line pt-5">
                <p className="label text-[0.68rem] text-gold">Allergeni</p>
                <p className="mt-2 text-[0.95rem] text-cream/75">
                  {dish.allergens.length
                    ? dish.allergens
                        .map((id) => ALLERGENS.find((a) => a.id === id)?.label)
                        .filter(Boolean)
                        .join(" · ")
                    : "Chiedi al personale di sala: ti indicheremo gli allergeni presenti in ogni piatto."}
                </p>
              </div>

              <Link href="/prenota" onClick={onClose} className="btn btn-gold mt-7 w-full">
                Prenota un tavolo
              </Link>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
