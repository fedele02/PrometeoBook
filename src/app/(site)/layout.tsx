import { getPublicContent } from "@/lib/data";
import { MotionProvider } from "@/components/motion/Reveal";
import { Footer } from "@/components/site/Footer";
import { MobileBar } from "@/components/site/MobileBar";
import { SiteHeader } from "@/components/site/SiteHeader";

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const { settings } = await getPublicContent();
  const booking = settings.booking.enabled;

  return (
    <MotionProvider>
      <SiteHeader
        bookingEnabled={booking}
        announcement={settings.announcement.enabled ? settings.announcement.text : ""}
        phone={settings.phone}
        address={`${settings.address}, ${settings.city}`}
      />
      <main>{children}</main>
      <Footer settings={settings} />
      <MobileBar phone={settings.phone} bookingEnabled={booking} />
    </MotionProvider>
  );
}
