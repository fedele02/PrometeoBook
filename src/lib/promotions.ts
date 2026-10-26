import { formatDateLong, weekdayOf, WEEK_ORDER, WEEKDAYS } from "./time";
import type { AppliedPromotion, Promotion, Settings } from "./types";

/*
 * Discounts on bookings (Gestione → Promozioni). One set of rules for the site
 * (calendar and times), the server (what is saved on the booking) and the staff app.
 * When more promotions cover the same date and time, the highest discount wins.
 */

/** Promotions switched on and valid on that date (period and weekday). */
export const promotionsOn = (s: Pick<Settings, "promotions">, date: string) =>
  (s.promotions ?? []).filter(
    (p) => p.enabled && p.from <= date && date <= p.to && (p.weekdays.length === 0 || p.weekdays.includes(weekdayOf(date))),
  );

/** The arrival time falls in the promotion's hours (all day, or start–end with both included). */
export const coversTime = (p: Promotion, time: string) => p.allDay || (p.start <= time && time <= p.end);

const best = (list: Promotion[]) => list.reduce<Promotion | null>((a, p) => (!a || p.percent > a.percent ? p : a), null);

/** The discount for a booking at that date and time, or null. */
export function promotionFor(s: Pick<Settings, "promotions">, date: string, time: string): AppliedPromotion | null {
  const p = best(promotionsOn(s, date).filter((x) => coversTime(x, time)));
  return p ? { id: p.id, name: p.name, percent: p.percent, conditions: p.conditions } : null;
}

/** Highest discount of a day, for the badge on the calendar (some hours only, maybe). */
export const bestPercentOn = (s: Pick<Settings, "promotions">, date: string) => best(promotionsOn(s, date))?.percent ?? 0;

/** "tutti i giorni" · "lunedì, martedì" */
export const weekdaysLabel = (p: Promotion) =>
  p.weekdays.length === 0 || p.weekdays.length === 7 ? "tutti i giorni" : WEEK_ORDER.filter((d) => p.weekdays.includes(d)).map((d) => WEEKDAYS[d].toLowerCase()).join(", ");

/** "tutto il giorno" · "dalle 19:00 alle 20:30" */
export const hoursLabel = (p: Promotion) => (p.allDay ? "tutto il giorno" : `dalle ${p.start} alle ${p.end}`);

/** "dal 3 novembre al 30 novembre" · "solo il 3 novembre" */
export const periodLabel = (p: Promotion) => {
  const d = (x: string) => formatDateLong(x).replace(/^\S+ /, "");
  return p.from === p.to ? `solo il ${d(p.from)}` : `dal ${d(p.from)} al ${d(p.to)}`;
};

/** Status for the staff list, from today's date. */
export function promotionState(p: Promotion, today: string): "off" | "past" | "next" | "live" {
  if (!p.enabled) return "off";
  if (p.to < today) return "past";
  return p.from > today ? "next" : "live";
}

/** "−20%" with a real minus sign */
export const percentLabel = (n: number) => `−${n}%`;
