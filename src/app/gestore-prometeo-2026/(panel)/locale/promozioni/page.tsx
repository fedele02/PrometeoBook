import { repo } from "@/lib/data";
import { logError } from "@/lib/errors";
import { romeNow } from "@/lib/time";
import { birthdayPhone } from "@/lib/messages";
import { isWhatsappConfigured } from "@/lib/whatsapp";
import { PromotionsManager } from "@/components/admin/PromotionsManager";

export const metadata = { title: "Promozioni" };

export default async function PromotionsPage() {
  const r = repo();
  const settings = await r.getSettings();
  // the birthdays table exists only after the 2026-10-25 migration
  const consents = await r.listBirthdays().then(
    (l) => l.length,
    async (e) => {
      await logError("Compleanni non letti", e);
      return null;
    },
  );
  return (
    <PromotionsManager
      initial={{ promotions: settings.promotions, birthday: settings.birthday }}
      today={romeNow().date}
      whatsappConfigured={isWhatsappConfigured()}
      consents={consents}
      phone={birthdayPhone(settings)}
    />
  );
}
