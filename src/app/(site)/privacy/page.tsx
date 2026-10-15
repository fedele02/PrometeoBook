import type { Metadata } from "next";
import { getPublicContent } from "@/lib/data";
import { PRIVACY_UPDATED, RETENTION } from "@/lib/legal";
import { isWhatsappConfigured } from "@/lib/whatsapp";
import { ClearDeviceData } from "@/components/site/ClearDeviceData";

export const metadata: Metadata = {
  title: "Privacy e cookie",
  description: "Informativa sul trattamento dei dati personali e sui cookie del sito Prometeo Fine Dining.",
};

/**
 * Privacy and cookie notice (artt. 13–14 GDPR, art. 122 Codice privacy).
 * It describes this site only: when a provider, a form or a stored value changes,
 * update this page and PRIVACY_UPDATED. Text to be reviewed by the owner's privacy advisor.
 */
export default async function PrivacyPage() {
  const { settings: s } = await getPublicContent();
  const l = s.legal;
  const whatsapp = isWhatsappConfigured();
  const email = Boolean(process.env.RESEND_API_KEY);
  const contact = [s.email, l.pec && `PEC ${l.pec}`, s.phone].filter(Boolean).join(" · ");

  const h2 = "font-display mt-12 scroll-mt-28 text-xl tracking-[0.06em] text-gold-light";
  const ul = "mt-3 list-disc space-y-2 pl-5 marker:text-gold";

  return (
    <article className="mx-auto max-w-2xl px-6 pb-28 pt-32 text-[1.02rem] leading-relaxed text-cream/80 md:pt-40">
      <p className="label text-gold">Informativa</p>
      <h1 className="font-display mt-4 text-[2.2rem] leading-tight text-cream">Privacy e cookie</h1>
      <p className="mt-4">
        Qui spieghiamo quali dati personali tratta questo sito, perché, per quanto tempo e quali sono i tuoi diritti (artt. 13 e 14 del
        Regolamento UE 2016/679, “GDPR”).
      </p>

      <h2 className={h2}>Titolare del trattamento</h2>
      <p className="mt-3">
        {l.companyName || `${s.name} ${s.subtitle}`}
        {l.registeredOffice && <>, sede legale {l.registeredOffice}</>}
        {l.vatNumber && <>, P.IVA {l.vatNumber}</>}. Locale: {s.name} {s.subtitle}, {s.address}, {s.city}.
      </p>
      <p className="mt-2">Per qualsiasi domanda sulla privacy: {contact}.</p>

      <h2 className={h2}>Quali dati trattiamo</h2>
      <ul className={ul}>
        <li>
          <b className="text-cream">Prenotazione</b>: nome, numero di telefono, giorno, ora e numero di persone. Servono per gestire la
          prenotazione: senza non possiamo accettarla.
        </li>
        <li>
          <b className="text-cream">Richieste particolari</b> (facoltative): quello che scrivi nel campo note. Se indichi allergie o
          intolleranze si tratta di dati relativi alla salute: li usiamo solo con il tuo consenso esplicito, che dai spuntando la casella
          accanto al campo.
        </li>
        <li>
          <b className="text-cream">Messaggi WhatsApp</b> sulla prenotazione e il loro stato (inviato, consegnato, letto).
        </li>
        <li>
          <b className="text-cream">Dati tecnici</b>: come ogni sito, il server registra per sicurezza indirizzo IP, data e ora e pagina
          richiesta. Quando invii una prenotazione salviamo un&apos;impronta cifrata della tua connessione (non l&apos;indirizzo IP), per
          bloccare chi invia richieste in massa.
        </li>
      </ul>

      <h2 className={h2}>Perché e su quale base</h2>
      <ul className={ul}>
        <li>
          Gestire la prenotazione e inviarti su WhatsApp i messaggi che la riguardano (richiesta ricevuta, conferma, eventuale rifiuto o
          annullamento): esecuzione di un servizio che ci chiedi (art. 6.1.b GDPR). Non ti mandiamo pubblicità.
        </li>
        <li>Preparare piatti sicuri in base ad allergie e intolleranze: tuo consenso esplicito (art. 9.2.a GDPR), revocabile in ogni momento.</li>
        <li>
          Riconoscere i clienti che tornano e organizzare la sala: il personale vede le tue prenotazioni precedenti allo stesso numero.
          Base: nostro legittimo interesse (art. 6.1.f GDPR); puoi opporti in qualsiasi momento.
        </li>
        <li>
          Proteggere il sito da abusi e prenotazioni false, e rispettare gli obblighi di legge: legittimo interesse e obbligo legale (art.
          6.1.f e 6.1.c GDPR).
        </li>
      </ul>
      <p className="mt-3">Non prendiamo decisioni automatizzate e non creiamo profili a fini commerciali.</p>

      <h2 className={h2}>Chi vede i dati</h2>
      <p className="mt-3">
        Il personale del ristorante autorizzato e i fornitori che ci aiutano a far funzionare il servizio, nominati responsabili del
        trattamento (art. 28 GDPR):
      </p>
      <ul className={ul}>
        <li>Supabase: database e archivio, con server nell&apos;Unione Europea (Francoforte);</li>
        <li>Vercel: hosting del sito;</li>
        {whatsapp && <li>YCloud: invio automatico dei messaggi WhatsApp;</li>}
        <li>Meta Platforms (WhatsApp): consegna dei messaggi;</li>
        {email && <li>Resend: email interne al ristorante a ogni nuova prenotazione;</li>}
        <li>
          Google, Apple o Mozilla: recapitano allo staff le notifiche delle nuove prenotazioni (il contenuto viaggia cifrato).
        </li>
      </ul>
      <p className="mt-3">Non vendiamo né cediamo i tuoi dati a nessuno.</p>

      <h2 className={h2}>Trasferimenti fuori dall&apos;Unione Europea</h2>
      <p className="mt-3">
        Alcuni fornitori (Vercel, Meta{whatsapp && ", YCloud"}
        {email && ", Resend"}) hanno sede o server fuori dallo Spazio economico europeo. In questi casi il trasferimento avviene solo con le
        garanzie previste dal GDPR: decisione di adeguatezza della Commissione europea (per gli Stati Uniti, il Data Privacy Framework per i
        fornitori che vi aderiscono) oppure Clausole contrattuali standard approvate dalla Commissione (artt. 45 e 46 GDPR). Puoi chiederci
        copia delle garanzie ai recapiti sopra.
      </p>

      <h2 className={h2}>Per quanto tempo</h2>
      <ul className={ul}>
        <li>Prenotazioni e storico delle visite: {RETENTION.bookingsMonths} mesi dalla data della prenotazione, poi vengono cancellati.</li>
        <li>Richieste particolari (comprese allergie): cancellate {RETENTION.notesDaysAfterVisit} giorni dopo la data della visita.</li>
        <li>Stato dei messaggi WhatsApp: {RETENTION.whatsappMonths} mesi.</li>
        <li>Impronta della connessione (anti-spam): {RETENTION.attemptsDays} giorno.</li>
        <li>Dati tecnici del server: per il tempo strettamente necessario alla sicurezza, di norma pochi giorni.</li>
      </ul>
      <p className="mt-3">I messaggi restano anche nella tua chat WhatsApp, dove puoi cancellarli quando vuoi.</p>

      <h2 className={h2}>I tuoi diritti</h2>
      <p className="mt-3">In qualsiasi momento, gratuitamente, puoi chiederci di:</p>
      <ul className={ul}>
        <li>sapere quali dati abbiamo e averne copia (art. 15), anche in un formato leggibile da un computer (art. 20);</li>
        <li>correggerli (art. 16) o cancellarli (art. 17);</li>
        <li>limitarne l&apos;uso (art. 18) o opporti al trattamento basato sul legittimo interesse, come lo storico delle visite (art. 21);</li>
        <li>revocare il consenso sulle allergie, senza effetti sul trattamento già fatto (art. 7.3).</li>
      </ul>
      <p className="mt-3">
        Puoi modificare o annullare la prenotazione e cancellare le richieste particolari dalla tua pagina personale (il link è nel
        messaggio di conferma); per tutto il resto scrivici ai recapiti sopra. Rispondiamo entro un mese. Hai anche diritto di proporre
        reclamo al{" "}
        <a href="https://www.garanteprivacy.it" target="_blank" rel="noopener" className="underline underline-offset-2 hover:text-gold">
          Garante per la protezione dei dati personali
        </a>
        .
      </p>

      <h2 id="cookie" className={h2}>
        Cookie e dati sul tuo dispositivo
      </h2>
      <p className="mt-3">
        Il sito <b className="text-cream">non usa cookie di profilazione, di statistica o pubblicitari</b> e non carica contenuti di terze
        parti che ti traccino: i caratteri e la mappa sono serviti dal nostro sito. Google Maps si apre solo se tocchi “Apri in Google Maps”,
        e da quel momento vale l&apos;informativa di Google. Per questo non ti chiediamo il consenso con un banner (art. 122 Codice privacy e
        Linee guida del Garante sui cookie del 10 giugno 2021).
      </p>
      <p className="mt-3">Usiamo solo questi strumenti tecnici:</p>
      <ul className={ul}>
        <li>
          <b className="text-cream">prometeo:guest</b> (memoria del browser): il nome e il telefono dell&apos;ultima prenotazione, per
          compilarli al posto tuo la volta successiva. Resta solo sul tuo dispositivo finché non lo cancelli.
        </li>
        <li>
          <b className="text-cream">prometeo:bookings</b> (memoria del browser): il codice delle tue ultime prenotazioni, per ritrovarle da
          “Prenota”. Resta solo sul tuo dispositivo finché non lo cancelli.
        </li>
        <li>
          Cookie di sessione dell&apos;area riservata allo staff: li riceve solo il personale che accede, mai i clienti.
        </li>
      </ul>
      <ClearDeviceData />
      <p className="mt-3 text-[0.95rem] text-cream/60">Puoi cancellarli anche dalle impostazioni del browser (dati dei siti).</p>

      <h2 className={h2}>Modifiche</h2>
      <p className="mt-3">Se cambiamo il modo in cui trattiamo i dati, aggiorniamo questa pagina. Ultimo aggiornamento: {PRIVACY_UPDATED}.</p>
    </article>
  );
}
