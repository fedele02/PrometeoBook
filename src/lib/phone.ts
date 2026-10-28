/**
 * Country codes for the phone field. Guests pick their country, the number is saved
 * as "+44 7911 123456" so WhatsApp and the staff always know where to call.
 * Names are in the guest's own language: an English guest looks for "United Kingdom".
 */
export const COUNTRIES = [
  { iso: "IT", name: "Italia", dial: "39" },
  { iso: "GB", name: "United Kingdom", dial: "44" },
  { iso: "US", name: "United States / Canada", dial: "1" },
  { iso: "DE", name: "Deutschland", dial: "49" },
  { iso: "FR", name: "France", dial: "33" },
  { iso: "ES", name: "España", dial: "34" },
  { iso: "CH", name: "Schweiz / Suisse", dial: "41" },
  { iso: "AT", name: "Österreich", dial: "43" },
  { iso: "NL", name: "Nederland", dial: "31" },
  { iso: "BE", name: "België / Belgique", dial: "32" },
  { iso: "IE", name: "Ireland", dial: "353" },
  { iso: "PT", name: "Portugal", dial: "351" },
  { iso: "PL", name: "Polska", dial: "48" },
  { iso: "CZ", name: "Česko", dial: "420" },
  { iso: "HU", name: "Magyarország", dial: "36" },
  { iso: "RO", name: "România", dial: "40" },
  { iso: "GR", name: "Ελλάδα", dial: "30" },
  { iso: "SE", name: "Sverige", dial: "46" },
  { iso: "NO", name: "Norge", dial: "47" },
  { iso: "DK", name: "Danmark", dial: "45" },
  { iso: "BR", name: "Brasil", dial: "55" },
  { iso: "JP", name: "日本", dial: "81" },
] as const;

export type CountryIso = (typeof COUNTRIES)[number]["iso"];
/** "OTHER": any other country, the guest writes the code with the number. */
export type PhoneCountry = CountryIso | "OTHER";

export const DEFAULT_COUNTRY: CountryIso = "IT";

const byIso = new Map<string, (typeof COUNTRIES)[number]>(COUNTRIES.map((c) => [c.iso, c]));
// longest code first: "+353…" is Ireland, not "+35…"
const byDial = [...COUNTRIES].sort((a, b) => b.dial.length - a.dial.length);

export function dialCode(country: PhoneCountry) {
  return country === "OTHER" ? "" : (byIso.get(country)?.dial ?? "");
}

/**
 * Splits a saved number into country and the rest. Numbers without "+" or "00"
 * are Italian, as they were before the country field existed.
 */
export function splitPhone(value: string): { country: PhoneCountry; national: string } {
  const v = value.trim();
  if (!v) return { country: DEFAULT_COUNTRY, national: "" };
  const intl = v.startsWith("+") ? v.slice(1) : v.startsWith("00") ? v.slice(2) : null;
  if (intl === null) return { country: DEFAULT_COUNTRY, national: v };
  const digits = intl.replace(/\D/g, "");
  const c = byDial.find((x) => digits.startsWith(x.dial));
  if (!c) return { country: "OTHER", national: `+${intl.trimStart()}` };
  // drop the code and the separators right after it, keep the guest's own spacing
  let seen = 0;
  let i = 0;
  while (i < intl.length && seen < c.dial.length) if (/\d/.test(intl[i++])) seen++;
  return { country: c.iso, national: intl.slice(i).replace(/^[\s.-]+/, "") };
}

/**
 * Country + number as one string: "+39 333 123 4567". Outside Italy the trunk 0
 * is dropped ("07911…" in the UK becomes "+44 7911…"), as WhatsApp expects.
 */
export function joinPhone(country: PhoneCountry, national: string) {
  const n = national.trim();
  if (!n.replace(/\D/g, "")) return "";
  if (country === "OTHER") return n.startsWith("+") ? n : `+${n}`;
  return `+${dialCode(country)} ${country === "IT" ? n : n.replace(/^0+/, "")}`;
}

/** Digits of the number without the country code: enough to tell a typo from a phone number. */
export function nationalDigits(value: string) {
  const { country, national } = splitPhone(value);
  const d = national.replace(/\D/g, "");
  return country === "OTHER" ? Math.max(d.length - 3, 0) : d.length;
}
