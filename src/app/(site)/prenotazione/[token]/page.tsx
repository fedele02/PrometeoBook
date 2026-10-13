import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicContent, repo } from "@/lib/data";
import { GuestBookingSection } from "@/components/booking/GuestBookingSection";

export const metadata: Metadata = {
  title: "La tua prenotazione",
  robots: { index: false, follow: false },
};

/** The guest's private page by its long secret: the booking summary and links sent before the short ones (/p/<code>). */
export default async function GuestBookingPage({ params }: PageProps<"/prenotazione/[token]">) {
  const { token } = await params;
  const [{ settings }, booking] = await Promise.all([getPublicContent(), repo().getBookingByToken(token)]);
  if (!booking) notFound();
  return <GuestBookingSection booking={booking} settings={settings} />;
}
