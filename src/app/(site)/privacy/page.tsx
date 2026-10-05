import type { Metadata } from "next";
import { getPublicContent } from "@/lib/data";

export const metadata: Metadata = { title: "Privacy", robots: { index: false } };

/**
 * Template GDPR notice for the booking form.
 * Have it reviewed and completed with the owner's company data before going live.
 */
export default async function PrivacyPage() {
  const { settings: s } = await getPublicContent();
  const h2 = "font-display mt-10 text-xl tracking-[0.06em] text-gold-light";

  return (
    <article className="mx-auto max-w-2xl px-6 pb-28 pt-32 text-[1.02rem] leading-relaxed text-cream/80 md:pt-40">
      <p className="label text-gold">Informativa</p>
      <h1 className="font-display mt-4 text-[2.2rem] leading-tight text-cream">Privacy e prenotazioni</h1>

      <h2 className={h2}>Titolare del trattamento</h2>
      <p className="mt-3">
        {s.name} {s.subtitle}, {s.address}, {s.city}
        {s.email && <> · {s.email}</>}
        {s.phone && <> · {s.phone}</>}.
      </p>

      <h2 className={h2}>Quali dati raccogliamo</h2>
      <p className="mt-3">
        Quando prenoti un tavolo ci comunichi nome, numero di telefono, data, orario, numero di persone ed eventuali note (ad esempio allergie).
        Non usiamo cookie di profilazione né strumenti di tracciamento pubblicitario.
      </p>

      <h2 className={h2}>Perché li usiamo</h2>
      <p className="mt-3">
        Esclusivamente per gestire la tua prenotazione e, se necessario, contattarti per confermarla o modificarla (art. 6.1.b GDPR). Le
        informazioni su allergie e intolleranze servono solo a prepararti piatti sicuri.
      </p>

      <h2 className={h2}>Per quanto tempo</h2>
      <p className="mt-3">I dati delle prenotazioni vengono conservati per il tempo necessario alla gestione del servizio e poi cancellati.</p>

      <h2 className={h2}>I tuoi diritti</h2>
      <p className="mt-3">
        Puoi chiedere in qualsiasi momento di accedere ai tuoi dati, correggerli o cancellarli contattandoci ai recapiti indicati sopra. Hai
        inoltre diritto di proporre reclamo al Garante per la protezione dei dati personali.
      </p>
    </article>
  );
}
