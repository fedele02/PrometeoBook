/** The 14 allergens of EU Reg. 1169/2011 (numbered as on Italian menus). */
export const ALLERGENS: { id: number; label: string; short: string }[] = [
  { id: 1, label: "Cereali contenenti glutine", short: "Glutine" },
  { id: 2, label: "Crostacei", short: "Crostacei" },
  { id: 3, label: "Uova", short: "Uova" },
  { id: 4, label: "Pesce", short: "Pesce" },
  { id: 5, label: "Arachidi", short: "Arachidi" },
  { id: 6, label: "Soia", short: "Soia" },
  { id: 7, label: "Latte e lattosio", short: "Latte" },
  { id: 8, label: "Frutta a guscio", short: "Frutta a guscio" },
  { id: 9, label: "Sedano", short: "Sedano" },
  { id: 10, label: "Senape", short: "Senape" },
  { id: 11, label: "Semi di sesamo", short: "Sesamo" },
  { id: 12, label: "Anidride solforosa e solfiti", short: "Solfiti" },
  { id: 13, label: "Lupini", short: "Lupini" },
  { id: 14, label: "Molluschi", short: "Molluschi" },
];

export const DISH_TAGS: { id: string; label: string; filter: boolean }[] = [
  { id: "signature", label: "In evidenza", filter: false },
  { id: "vegetariano", label: "Vegetariano", filter: true },
  { id: "vegano", label: "Vegano", filter: true },
  { id: "senza-glutine", label: "Senza glutine", filter: true },
  { id: "km0", label: "Km 0", filter: false },
  { id: "piccante", label: "Piccante", filter: false },
  { id: "novita", label: "Novità", filter: false },
];

export const tagLabel = (id: string) => DISH_TAGS.find((t) => t.id === id)?.label ?? id;
export const allergenLabel = (id: number) => ALLERGENS.find((a) => a.id === id)?.short ?? String(id);
