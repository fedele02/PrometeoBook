import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getPublicContent, repo } from "@/lib/data";
import { isShortCode, normalizeShortCode } from "@/lib/short-code";
import { GuestBookingSection } from "@/components/booking/GuestBookingSection";

export const metadata: Metadata = {
  title: "La tua prenotazione",
  robots: { index: false, follow: false },
};

/*
 * Wrong codes are counted per address: after a few in a short time every
 * request gets "not found" without looking at the database, so nobody can try
 * codes one after another. (Per server instance: on top of 1.1 million million
 * possible codes, it only has to make guessing slow.)
 */
const MAX_MISSES = 10;
const WINDOW_MS = 15 * 60_000;
const misses = new Map<string, { since: number; n: number }>();

function blocked(ip: string) {
  const m = misses.get(ip);
  if (!m) return false;
  if (Date.now() - m.since > WINDOW_MS) {
    misses.delete(ip);
    return false;
  }
  return m.n >= MAX_MISSES;
}

function miss(ip: string) {
  const m = misses.get(ip);
  if (m && Date.now() - m.since <= WINDOW_MS) m.n++;
  else misses.set(ip, { since: Date.now(), n: 1 });
  if (misses.size > 5000) misses.clear();
}

/** The guest's private page by the short link sent in the messages: /p/K7M2QX9T. */
export default async function ShortLinkPage({ params }: PageProps<"/p/[code]">) {
  const code = normalizeShortCode((await params).code);
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (blocked(ip)) notFound();

  const booking = isShortCode(code) ? await repo().getBookingByCode(code) : null;
  if (!booking) {
    miss(ip);
    notFound();
  }
  const { settings } = await getPublicContent();
  return <GuestBookingSection booking={booking} settings={settings} />;
}
