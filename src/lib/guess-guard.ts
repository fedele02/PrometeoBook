import "server-only";
import { headers } from "next/headers";

/*
 * Wrong codes are counted per address: after a few in a short time every
 * request gets "not found" without looking at the database, so nobody can try
 * codes one after another. (Per server instance: on top of 1.1 million million
 * possible codes, it only has to make guessing slow.) Used by the guest's
 * link /p/<code> and the birthday link /auguri/<code>.
 */
const MAX_MISSES = 10;
const WINDOW_MS = 15 * 60_000;
const misses = new Map<string, { since: number; n: number }>();

/** The caller's address, as Vercel forwards it. */
export async function clientIp() {
  return (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

export function blocked(ip: string) {
  const m = misses.get(ip);
  if (!m) return false;
  if (Date.now() - m.since > WINDOW_MS) {
    misses.delete(ip);
    return false;
  }
  return m.n >= MAX_MISSES;
}

export function miss(ip: string) {
  const m = misses.get(ip);
  if (m && Date.now() - m.since <= WINDOW_MS) m.n++;
  else misses.set(ip, { since: Date.now(), n: 1 });
  if (misses.size > 5000) misses.clear();
}
