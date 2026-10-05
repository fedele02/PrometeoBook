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
