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
        {s.vatNumber && <> · P.IVA {s.vatNumber}</>}
        {s.email && <> · {s.email}</>}
        {s.phone && <> · {s.phone}</>}.
      </p>

      <h2 className={h2}>Quali dati raccogliamo</h2>
      <p className="mt-3">
        Quando prenoti un tavolo ci comunichi nome, numero di telefono, data, orario, numero di persone ed eventuali note (ad esempio allergie)
        e, solo se lo scegli, giorno e mese del tuo compleanno (vedi sotto).
        Non usiamo cookie di profilazione né strumenti di tracciamento pubblicitario.
      </p>

      <h2 className={h2}>Perché li usiamo</h2>
      <p className="mt-3">
        Esclusivamente per gestire la tua prenotazione e, se necessario, contattarti per confermarla o modificarla (art. 6.1.b GDPR). Le
        informazioni su allergie e intolleranze servono solo a prepararti piatti sicuri.
      </p>

      <h2 className={h2}>Messaggi su WhatsApp</h2>
      <p className="mt-3">
        Le comunicazioni sulla tua prenotazione (richiesta ricevuta, conferma, eventuale rifiuto o annullamento) ti arrivano su WhatsApp al
        numero che ci hai indicato. Per inviarle in automatico usiamo la piattaforma WhatsApp Business di Meta tramite il fornitore YCloud,
        che tratta per nostro conto solo i dati necessari al messaggio (nome, numero, giorno, ora e persone) e conserva lo storico dei
        messaggi per un massimo di 6 mesi. Se preferisci non riceverli, scrivici o chiamaci.
      </p>

      {/* da approvare: testo scritto da noi sulla base di cosa fa il sito (src/lib/birthday.ts) */}
      <h2 className={h2}>Auguri di compleanno (facoltativo)</h2>
      <p className="mt-3">
        Nel modulo di prenotazione puoi indicarci, se vuoi, il giorno e il mese del tuo compleanno (mai l&apos;anno) e spuntare una casella
        apposita per ricevere su WhatsApp i nostri auguri con un&apos;offerta riservata. È una finalità promozionale, distinta dalla
        prenotazione: la trattiamo solo con il tuo consenso (art. 6.1.a GDPR), che non serve per prenotare. Conserviamo nome, numero,
        giorno e mese, il testo del consenso e la data in cui l&apos;hai dato. Il messaggio contiene un link personale per prenotare
        intorno al compleanno: ci dice solo che la prenotazione fatta con quel link è per il tuo compleanno.
      </p>
      <p className="mt-3">
        Puoi ritirare il consenso quando vuoi rispondendo STOP a un nostro messaggio, scrivendoci o chiamandoci: la data viene cancellata
        subito. Se non prenoti di nuovo con la casella spuntata, la cancelliamo comunque dopo 24 mesi. I messaggi passano anche in questo
        caso da Meta (WhatsApp Business) tramite YCloud.
      </p>

      {/* da approvare: testo scritto da noi sulla base di cosa fa il sito */}
      <h2 className={h2}>Cookie</h2>
      <p className="mt-3">
        Il sito non usa cookie di profilazione, statistiche o strumenti pubblicitari, e non carica contenuti di terze parti che li installino.
        Per questo non ti chiediamo il consenso. Per comodità il modulo di prenotazione ricorda sul tuo dispositivo il nome, il numero di
        telefono e i link alle tue prenotazioni, così non devi riscriverli: restano solo nel tuo browser e puoi cancellarli svuotando i dati
        del sito.
      </p>
      <p className="mt-3">
        La mappa nella pagina è un&apos;immagine ospitata da noi (dati © OpenStreetMap contributors). Il pulsante &laquo;Apri in Google
        Maps&raquo; ti porta sul sito di Google, che da quel momento applica la propria informativa sui cookie.
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
