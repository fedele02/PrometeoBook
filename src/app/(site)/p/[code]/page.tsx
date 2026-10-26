import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicContent, repo } from "@/lib/data";
import { blocked, clientIp, miss } from "@/lib/guess-guard";
import { isShortCode, normalizeShortCode } from "@/lib/short-code";
import { GuestBookingSection } from "@/components/booking/GuestBookingSection";

export const metadata: Metadata = {
  title: "La tua prenotazione",
  robots: { index: false, follow: false },
};

/** The guest's private page by the short link sent in the messages: /p/K7M2QX9T. */
export default async function ShortLinkPage({ params }: PageProps<"/p/[code]">) {
  const code = normalizeShortCode((await params).code);
  const ip = await clientIp();
  if (blocked(ip)) notFound();

  const booking = isShortCode(code) ? await repo().getBookingByCode(code) : null;
  if (!booking) {
    miss(ip);
    notFound();
  }
  const { settings } = await getPublicContent();
  return <GuestBookingSection booking={booking} settings={settings} />;
}
