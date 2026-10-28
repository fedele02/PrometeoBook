import type { Category, Dish, MenuData } from "./types";

/*
 * Languages of the public site. Italian lives at the root (/menu, /qr), English
 * under /en (/en/menu, /en/qr). Only the menu is translated for now.
 */

export type Lang = "it" | "en";

/** Set when the guest picks a language: the QR page then stops guessing. */
export const LANG_COOKIE = "lang";

export const MENU_PATH: Record<Lang, { site: string; table: string }> = {
  it: { site: "/menu", table: "/qr" },
  en: { site: "/en/menu", table: "/en/qr" },
};

/** The menu in one language: missing translations fall back to the Italian. */
export function localizeMenu(menu: MenuData, lang: Lang): MenuData {
  if (lang === "it") return menu;
  const cat = (c: Category): Category => {
    const t = c.tr[lang];
    return t?.name ? { ...c, name: t.name, description: t.description || c.description } : c;
  };
  const dish = (d: Dish): Dish => {
    const t = d.tr[lang];
    if (!t?.name) return d;
    return { ...d, name: t.name, description: t.description || d.description, price_note: t.price_note || d.price_note };
  };
  return { categories: menu.categories.map(cat), dishes: menu.dishes.map(dish) };
}

/** Texts of the menu pages and the dish sheet. */
export const MENU_TEXT = {
  it: {
    title: "Menu",
    subtitle: "Cucina tradizionale rivisitata",
    tableSubtitle: "Buon appetito",
    empty: "Il menu è in aggiornamento.",
    allergyNote: "Allergie o intolleranze? Comunicacele al momento della prenotazione o chiedi al personale di sala.",
    tableAllergyNote: "Allergie o intolleranze? Chiedi al personale di sala: ti indicheremo gli allergeni di ogni piatto.",
    book: "Prenota un tavolo",
    filterLabel: "Filtra i piatti",
    showOnly: "Mostra solo:",
    soldOutShort: "esaurito oggi",
    soldOut: "Esaurito per oggi",
    allergens: "Allergeni",
    askAllergens: "Chiedi al personale di sala: ti indicheremo gli allergeni presenti in ogni piatto.",
    close: "Chiudi",
    language: "Lingua del menu",
  },
  en: {
    title: "Menu",
    subtitle: "Traditional cuisine, reimagined",
    tableSubtitle: "Enjoy your meal",
    empty: "The menu is being updated.",
    allergyNote: "Allergies or intolerances? Let us know when you book, or ask our staff.",
    tableAllergyNote: "Allergies or intolerances? Ask our staff: we will tell you the allergens in every dish.",
    book: "Book a table",
    filterLabel: "Filter the dishes",
    showOnly: "Show only:",
    soldOutShort: "sold out today",
    soldOut: "Sold out today",
    allergens: "Allergens",
    askAllergens: "Ask our staff: we will tell you the allergens in every dish.",
    close: "Close",
    language: "Menu language",
  },
} satisfies Record<Lang, Record<string, string>>;
