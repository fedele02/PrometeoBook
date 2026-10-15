import type { LegalInfo } from "./types";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

/** "+39 0835 123456" → "+390835123456" */
export const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`;

export function whatsappHref(number: string, text?: string) {
  let n = number.replace(/\D/g, "");
  if (n.length <= 10) n = `39${n}`; // Italian number without prefix
  return `https://wa.me/${n}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

export const euro = (n: number) =>
  new Intl.NumberFormat("it-IT", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 }).format(n);

/** Company data for the footer, in the usual order; empty fields are skipped. */
export function legalParts(l: Partial<LegalInfo> = {}): string[] {
  return [
    l.companyName,
    l.registeredOffice && `Sede legale ${l.registeredOffice}`,
    l.vatNumber && `P.IVA ${l.vatNumber}`,
    l.taxCode && `C.F. ${l.taxCode}`,
    l.rea && `REA ${l.rea}`,
    l.shareCapital && `Capitale sociale ${l.shareCapital}`,
    l.pec && `PEC ${l.pec}`,
  ].filter(Boolean) as string[];
}
