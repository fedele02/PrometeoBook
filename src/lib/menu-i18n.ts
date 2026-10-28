import type { Category, CategoryText, Dish, DishText, MenuLang } from "./types";

/*
 * Menu translations by file: Gestione exports one JSON file with the instructions for
 * the AI inside, the staff gives it to Claude or ChatGPT, the AI gives back the same file
 * with the English filled in, and the import shows every change before saving.
 */

export const FORMAT = "prometeo-menu-translation";
export const LANGS: Record<MenuLang, { name: string; label: string }> = {
  en: { name: "British English", label: "inglese" },
};

// same limits as the editor (lib/schemas)
export const LIMITS = {
  category: { name: 60, description: 200 },
  dish: { name: 120, description: 600, price_note: 80 },
} as const;

export const categoryText = (c: Pick<Category, "name" | "description">): CategoryText => ({ name: c.name, description: c.description });
export const dishText = (d: Pick<Dish, "name" | "description" | "price_note">): DishText => ({
  name: d.name,
  description: d.description,
  price_note: d.price_note,
});

/** Short fingerprint of the Italian a translation was made from (FNV-1a, 32 bit). */
export function fingerprint(t: CategoryText | DishText) {
  const s = Object.values(t).map((v) => v.trim()).join("\u0001");
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 0x01000193);
  return (h >>> 0).toString(16).padStart(8, "0");
}

export type TrStatus = "ok" | "missing" | "outdated";

/** missing: never translated · outdated: the Italian changed after the translation. */
export function trStatus(item: Category | Dish, lang: MenuLang): TrStatus {
  const t = item.tr[lang];
  if (!t || !t.name.trim()) return "missing";
  const it = "price_note" in item ? dishText(item) : categoryText(item);
  return t.src === fingerprint(it) ? "ok" : "outdated";
}

/* ---------- export ------------------------------------------------------ */

const INSTRUCTIONS = (lang: MenuLang, outName: string) => [
  `You are translating the menu of Prometeo Fine Dining, a fine-dining restaurant in Matera (Basilicata, Italy), from Italian into ${LANGS[lang].name}, for the restaurant's website.`,
  "",
  "TASK",
  `1. In every entry of "categories" and "dishes", fill in the "${lang}" object by translating the "it" object field by field (name → name, description → description, price_note → price_note).`,
  "2. Return the WHOLE file with exactly the same structure, keys and order. Change nothing else: not \"format\", \"version\", \"language\", \"instructions\", any \"id\", the \"category\" labels, or the \"it\" texts. Do not add, remove, merge or reorder entries.",
  `3. Answer with a downloadable file named "${outName}" that contains only the JSON. If you cannot create files, answer with the complete JSON only, in one \`\`\`json code block, with no text before or after it.`,
  `4. If a "${lang}" object already contains text, it is a previous translation: keep it when it is correct, fix it only when it is wrong or no longer matches the Italian.`,
  "",
  "RULES",
  "- British English spelling and vocabulary (flavour, courgette, aubergine, starter, main course, dessert).",
  "- Be faithful: translate only what the Italian says. Never add ingredients, cooking methods, origins, adjectives or claims that are not in the Italian, and never leave anything out. Every ingredient named in Italian must be named in English too: guests read it for allergies.",
  "- Traditional Italian and local dish names (e.g. cavatelli, orecchiette, peperoni cruschi, crapiata, pane di Matera) stay in Italian in \"name\"; the description explains them in English. A purely descriptive name is translated (e.g. \"Filetto di manzo al pepe verde\" → \"Beef fillet with green peppercorn sauce\").",
  "- Keep proper nouns, producers, wine names and place names as they are. DOP → PDO, IGP → PGI.",
  "- Keep every number, quantity, unit and price exactly as in the Italian.",
  "- Tone: elegant, concise and natural for a fine-dining menu, no exaggeration. Sentence case, no full stop at the end of a name.",
  "- An empty Italian field gets an empty translation (\"\").",
  `- Maximum length in characters: category name ${LIMITS.category.name}, category description ${LIMITS.category.description}; dish name ${LIMITS.dish.name}, dish description ${LIMITS.dish.description}, price_note ${LIMITS.dish.price_note}.`,
  "",
  "DOUBTS",
  "- If something is uncertain (a local ingredient or dialect word you do not know, a possible typo in the Italian, a word with two meanings), still write your best translation AND explain the doubt IN ITALIAN in the \"doubts\" field of that entry, in one short sentence (e.g. \"«cruschi»: peperoni secchi e croccanti, ho lasciato il nome in italiano\"). The restaurant staff reads these notes before saving.",
  "- Never invent: if you really cannot translate a word, keep it in Italian and say so in \"doubts\".",
  "- When there is no doubt, \"doubts\" stays \"\".",
  "",
  "FINAL CHECK before answering: the JSON is valid; same number of entries; every id unchanged; every \"it\" text unchanged; only the \"" +
    lang +
    "\" objects and the \"doubts\" fields have changed.",
];

export type FileCategory = { id: string; it: CategoryText; doubts: string } & Partial<Record<MenuLang, CategoryText>>;
export type FileDish = { id: string; category: string; it: DishText; doubts: string } & Partial<Record<MenuLang, DishText>>;
export type MenuFile = {
  format: typeof FORMAT;
  version: 1;
  language: MenuLang;
  exported_at: string;
  instructions: string[];
  categories: FileCategory[];
  dishes: FileDish[];
};

export function exportFileName(lang: MenuLang, date: string, translated = false) {
  return `prometeo-menu-${lang}-${date}${translated ? "-tradotto" : ""}.json`;
}

/** The file for the AI. `onlyPending`: just what is missing or changed since the last translation. */
export function buildExport(categories: Category[], dishes: Dish[], lang: MenuLang, date: string, onlyPending: boolean): MenuFile {
  const keep = (x: Category | Dish) => !onlyPending || trStatus(x, lang) !== "ok";
  const catName = new Map(categories.map((c) => [c.id, c.name]));
  return {
    format: FORMAT,
    version: 1,
    language: lang,
    exported_at: date,
    instructions: INSTRUCTIONS(lang, exportFileName(lang, date, true)),
    categories: categories.filter(keep).map((c) => {
      const t = c.tr[lang];
      return { id: c.id, it: categoryText(c), [lang]: { name: t?.name ?? "", description: t?.description ?? "" }, doubts: "" };
    }),
    dishes: dishes.filter(keep).map((d) => {
      const t = d.tr[lang];
      return {
        id: d.id,
        category: catName.get(d.category_id) ?? "",
        it: dishText(d),
        [lang]: { name: t?.name ?? "", description: t?.description ?? "", price_note: t?.price_note ?? "" },
        doubts: "",
      };
    }),
  };
}

/* ---------- import ------------------------------------------------------ */

export type ImportRow = {
  kind: "category" | "dish";
  id: string;
  /** what the staff sees: "Antipasti" or "Primi · Cavatelli…" */
  where: string;
  /** current Italian in the menu */
  it: DishText;
  /** the translation from the file (editable in the preview) */
  text: DishText;
  /** fingerprint of the Italian the AI translated */
  src: string;
  /** the AI's doubts and our own checks: the staff must confirm the row */
  warnings: string[];
};

export type ImportResult =
  | { ok: false; error: string }
  | { ok: true; lang: MenuLang; rows: ImportRow[]; skipped: { where: string; why: string }[] };

/** Accepts the file or the text the AI wrote (with or without the ```json fence). */
function parseJson(raw: string): unknown {
  const s = raw.trim().replace(/^﻿/, "");
  const a = s.indexOf("{");
  const b = s.lastIndexOf("}");
  if (a < 0 || b < a) throw new Error();
  return JSON.parse(s.slice(a, b + 1));
}

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
const digits = (s: string) => (s.match(/\d+(?:[.,]\d+)?/g) ?? []).map((x) => x.replace(",", ".")).sort().join(" ");

export function readImport(raw: string, categories: Category[], dishes: Dish[]): ImportResult {
  let file: Partial<MenuFile>;
  try {
    file = parseJson(raw) as Partial<MenuFile>;
  } catch {
    return { ok: false, error: "Il file non è leggibile: non è il file del menu, oppure l'AI l'ha rovinato. Chiedile di restituire il file completo." };
  }
  if (file?.format !== FORMAT) return { ok: false, error: "Questo non è un file di traduzione del menu esportato da Gestione." };
  const lang = file.language;
  if (!lang || !(lang in LANGS)) return { ok: false, error: "Lingua del file non riconosciuta." };
  if (!Array.isArray(file.categories) || !Array.isArray(file.dishes))
    return { ok: false, error: "Il file è incompleto: mancano le categorie o i piatti. Chiedi all'AI di restituire il file intero." };

  const cats = new Map(categories.map((c) => [c.id, c]));
  const dishById = new Map(dishes.map((d) => [d.id, d]));
  const rows: ImportRow[] = [];
  const skipped: { where: string; why: string }[] = [];

  const add = (kind: ImportRow["kind"], entry: Record<string, unknown>) => {
    const id = str(entry?.id);
    const fileIt = (entry?.it ?? {}) as Record<string, unknown>;
    const out = (entry?.[lang] ?? {}) as Record<string, unknown>;
    const label = str(fileIt.name) || id || "?";
    const item = kind === "category" ? cats.get(id) : dishById.get(id);
    if (!item) return skipped.push({ where: label, why: "non c'è più nel menu" });

    const it: DishText = { name: item.name, description: item.description, price_note: kind === "dish" ? (item as Dish).price_note : "" };
    const text: DishText = { name: str(out.name), description: str(out.description), price_note: kind === "dish" ? str(out.price_note) : "" };
    const where = kind === "category" ? item.name : `${cats.get((item as Dish).category_id)?.name ?? ""} · ${item.name}`;
    if (!text.name && it.name) return skipped.push({ where, why: "l'AI non l'ha tradotto" });

    // the Italian the AI translated, as it was when exported
    const sent = { name: str(fileIt.name), description: str(fileIt.description), price_note: str(fileIt.price_note) };
    const fromFile = kind === "category" ? categoryText(sent) : dishText(sent);
    const now = kind === "category" ? categoryText(it) : dishText(it);
    const src = fingerprint(fromFile);
    const fields = (kind === "category" ? ["name", "description"] : ["name", "description", "price_note"]) as (keyof DishText)[];
    const old = item.tr[lang] as (Partial<DishText> & { src: string }) | undefined;
    if (old?.src === src && fields.every((k) => (old[k] ?? "") === text[k])) return skipped.push({ where, why: "nessuna modifica" });

    const warnings: string[] = [];
    const doubts = str(entry?.doubts);
    if (doubts) warnings.push(`Dubbio dell'AI: ${doubts}`);
    if (src !== fingerprint(now)) warnings.push("L'italiano è stato modificato dopo l'esportazione: la traduzione è di quello vecchio.");
    const lim: Partial<Record<keyof DishText, number>> = kind === "category" ? LIMITS.category : LIMITS.dish;
    for (const k of fields) {
      const max = lim[k] ?? 0;
      if (text[k].length > max) warnings.push(`Testo troppo lungo (${text[k].length} caratteri, massimo ${max}): accorcialo qui sotto.`);
      if (it[k] && !text[k]) warnings.push(k === "description" ? "Manca la descrizione in inglese." : "Manca la nota sul prezzo in inglese.");
      else if (!it[k] && text[k]) warnings.push("L'AI ha scritto un testo dove in italiano non c'è niente.");
      else if (digits(it[k]) !== digits(text[k])) warnings.push("I numeri non corrispondono all'italiano: controlla quantità e prezzi.");
    }
    if (it.description.length > 25 && text.description === it.description) warnings.push("La descrizione sembra non tradotta (è uguale all'italiano).");

    rows.push({ kind, id, where, it, text, src, warnings: [...new Set(warnings)] });
  };

  for (const c of file.categories) add("category", c as unknown as Record<string, unknown>);
  for (const d of file.dishes) add("dish", d as unknown as Record<string, unknown>);
  return { ok: true, lang, rows, skipped };
}

/** True when the row can be saved as it is (the editor limits). */
export function rowTooLong(r: ImportRow) {
  const lim = r.kind === "category" ? LIMITS.category : LIMITS.dish;
  return (Object.entries(lim) as [keyof DishText, number][]).some(([k, max]) => r.text[k].length > max);
}
