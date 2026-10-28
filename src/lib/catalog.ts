import type { Lang } from "./i18n";

/** The 14 allergens of EU Reg. 1169/2011 (numbered as on Italian menus); `en`: their names in the English text of the regulation. */
export const ALLERGENS: { id: number; label: string; short: string; en: string }[] = [
  { id: 1, label: "Cereali contenenti glutine", short: "Glutine", en: "Cereals containing gluten" },
  { id: 2, label: "Crostacei", short: "Crostacei", en: "Crustaceans" },
  { id: 3, label: "Uova", short: "Uova", en: "Eggs" },
  { id: 4, label: "Pesce", short: "Pesce", en: "Fish" },
  { id: 5, label: "Arachidi", short: "Arachidi", en: "Peanuts" },
  { id: 6, label: "Soia", short: "Soia", en: "Soybeans" },
  { id: 7, label: "Latte e lattosio", short: "Latte", en: "Milk" },
  { id: 8, label: "Frutta a guscio", short: "Frutta a guscio", en: "Nuts" },
  { id: 9, label: "Sedano", short: "Sedano", en: "Celery" },
  { id: 10, label: "Senape", short: "Senape", en: "Mustard" },
  { id: 11, label: "Semi di sesamo", short: "Sesamo", en: "Sesame seeds" },
  { id: 12, label: "Anidride solforosa e solfiti", short: "Solfiti", en: "Sulphur dioxide and sulphites" },
  { id: 13, label: "Lupini", short: "Lupini", en: "Lupin" },
  { id: 14, label: "Molluschi", short: "Molluschi", en: "Molluscs" },
];

export const DISH_TAGS: { id: string; label: string; en: string; filter: boolean }[] = [
  { id: "signature", label: "In evidenza", en: "Featured", filter: false },
  { id: "vegetariano", label: "Vegetariano", en: "Vegetarian", filter: true },
  { id: "vegano", label: "Vegano", en: "Vegan", filter: true },
  { id: "senza-glutine", label: "Senza glutine", en: "Gluten free", filter: true },
  { id: "km0", label: "Km 0", en: "Locally sourced", filter: false },
  { id: "piccante", label: "Piccante", en: "Spicy", filter: false },
  { id: "novita", label: "Novità", en: "New", filter: false },
];

export const tagLabel = (id: string, lang: Lang = "it") => {
  const t = DISH_TAGS.find((x) => x.id === id);
  return (lang === "en" ? t?.en : t?.label) ?? id;
};
export const allergenName = (id: number, lang: Lang = "it") => {
  const a = ALLERGENS.find((x) => x.id === id);
  return lang === "en" ? a?.en : a?.label;
};
export const allergenLabel = (id: number) => ALLERGENS.find((a) => a.id === id)?.short ?? String(id);
