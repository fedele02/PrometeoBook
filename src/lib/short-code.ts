/**
 * Short code of the guest's link, /p/K7M2QX9T: 8 characters out of 32 that
 * can't be confused when read aloud or copied (no 0/O, no 1/I), about 1.1
 * million million combinations. The database generates the same format
 * (public.gen_short_code, supabase/schema.sql); this copy serves the local demo.
 */
export const SHORT_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const SHORT_CODE_LENGTH = 8;

const VALID = new RegExp(`^[${SHORT_CODE_ALPHABET}]{${SHORT_CODE_LENGTH}}$`);

/** Typed in lowercase or with spaces it still works: K7M2 QX9T, k7m2qx9t. */
export const normalizeShortCode = (s: string) => s.replace(/[\s-]/g, "").toUpperCase();
export const isShortCode = (s: string) => VALID.test(s);

export function newShortCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(SHORT_CODE_LENGTH));
  return Array.from(bytes, (b) => SHORT_CODE_ALPHABET[b % SHORT_CODE_ALPHABET.length]).join("");
}
