# Prometeo Fine Dining — sito web

Sito del ristorante **Prometeo Fine Dining** (Via Michele Torraca 10, Matera): home emozionale, menu con foto, prenotazione tavoli in 4 tocchi e area admin.

**Stack:** Next.js 16 (App Router) · React 19 · Tailwind CSS v4 · Motion · Supabase (database, login admin, foto) · Vercel.

## Avvio in locale

```bash
npm install
npm run dev        # http://localhost:3000
```

Senza variabili Supabase il sito gira in **modalità demo locale**: i dati stanno in `data/local-db.json` (creato al primo salvataggio, cancellalo per tornare ai dati iniziali) e le foto in `public/uploads/`.
Admin: <http://localhost:3000/admin> · password di sviluppo `prometeo` (o `ADMIN_PASSWORD`).

> Gli script npm chiamano `node …/next` direttamente perché il percorso della cartella contiene `&` (“A & C HOLDING”), che rompe i comandi `.cmd` di Windows.

## Collegare Supabase

1. Crea un progetto su [supabase.com](https://supabase.com) (regione **EU – Frankfurt**, per il GDPR).
2. **SQL Editor** → incolla ed esegui tutto `supabase/schema.sql` (tabelle, sicurezza RLS, funzione di prenotazione atomica, bucket foto `media`).
3. **Project Settings → API Keys**: copia URL, *publishable key* e *secret key* in `.env.local` (vedi `.env.example`).
4. Carica menu e impostazioni iniziali: `npm run seed:supabase`
5. **Authentication → Users → Add user**: crea l'utente del ristorante (email + password).
   Poi in **SQL Editor** abilitalo all'area admin:
   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email = 'email-del-ristorante@esempio.it';
   ```
6. **Authentication → Sign In / Providers**: disattiva *Allow new users to sign up* (gli admin si creano solo a mano).

## Pubblicare su Vercel

1. Carica il progetto su GitHub e importalo su [vercel.com](https://vercel.com/new) (Framework: Next.js, nessuna configurazione extra).
2. **Settings → Environment Variables**: aggiungi le variabili di `.env.example` (`NEXT_PUBLIC_SITE_URL` = dominio definitivo).
3. Collega il dominio in **Settings → Domains**.

Le pagine pubbliche sono statiche e si rigenerano da sole quando l'admin salva una modifica, quindi caricano all'istante e costano quasi nulla.

### Notifica email delle prenotazioni (facoltativa)
Crea un account [Resend](https://resend.com), verifica il dominio e imposta `RESEND_API_KEY`, `BOOKING_NOTIFY_EMAIL`, `BOOKING_FROM_EMAIL`. Comunque, la pagina Prenotazioni dell'admin si aggiorna da sola ogni 45 secondi.

## Area admin

| Sezione | Cosa si fa |
|---|---|
| **Prenotazioni** | giorni in fila con coperti e richieste in attesa, conferma/annulla, chiama, messaggio WhatsApp precompilato, prenotazioni telefoniche |
| **Menu** | categorie e piatti: foto (ridimensionate nel browser, anche scattate dal telefono), descrizione, prezzo, allergeni UE, vegetariano/vegano/senza glutine, “firma dello chef” (in home), nascondi, esaurito, ordine |
| **Locale e orari** | avviso in cima al sito, orari con più turni, chiusure straordinarie, regole prenotazioni (coperti per orario, intervallo, preavviso, conferma automatica), contatti, testi, recensioni |

## Come funziona la prenotazione

1. **Persone** → 2. **Giorno** (Oggi / Domani / calendario, giorni chiusi disattivati) → 3. **Orario** (solo quelli con posti liberi) → 4. **Nome e telefono**.
Il server ricontrolla tutto: orari validi, chiusure, capienza. La funzione SQL `create_booking` blocca l'orario durante l'inserimento, così due clienti non possono prendere gli ultimi posti nello stesso istante. Anti-spam: campo nascosto + massimo 4 prenotazioni al giorno per numero.

## Struttura

```
src/app/(site)/        home, menu, prenota (+ server actions), privacy
src/app/admin/         login, prenotazioni, menu, locale (+ server actions)
src/components/        home, menu, booking, admin, site (header, footer), logo vettoriale
src/lib/data/          repository: supabase.ts (produzione) | local.ts (demo)
src/lib/time.ts        orari, turni e disponibilità (fuso Europe/Rome)
supabase/schema.sql    database
scripts/               seed Supabase
```

## Da dove vengono i contenuti

| Contenuto | Fonte |
|---|---|
| Logo (mano + fiamma, scritta PROMETEO) | logo ufficiale della pagina Facebook, vettorializzato (`src/components/logo-paths.ts`) |
| Foto della sala, dello chef e dei piatti | pagina Facebook del ristorante; foto dell'esterno e dell'ingresso da TheFork |
| “Accendi il gusto”, “Prometeo donò il fuoco agli uomini, noi abbiamo donato loro il gusto.”, “Percorsi di sapori”, “Cucina tradizionale rivisitata” | post e pagina Facebook |
| “Cucina · Dono · Origine · Sapore” | scritta sulla porta d'ingresso (foto TheFork) |
| “Tradizione rubata alla fiamma. Eccellenza servita al palato.” | menu cartaceo (foto TheFork) |
| Antipasti e prezzi | menu cartaceo; primi e prezzi da TheFork |
| Descrizioni di tonno, cime di rapa, filetto, cannolo, sporcamuss, tagliatelle, capuntini, cuore di baccalà, polpo | testi dei post Facebook (leggermente accorciati) |
| Telefoni ed email | pagina Facebook (sezione Informazioni) e locandina di Ferragosto |
| Voto 9,8/10 e 392 recensioni, km 0, tavoli all'aperto, cani ammessi, opzioni vegetariane | TheFork |

Testi scritti da noi (da far approvare al cliente): la descrizione della sala, i testi della sezione prenotazione e le didascalie brevi.

## Da completare con il cliente

- **Orari di apertura**: non sono pubblicati da nessuna parte, quelli attuali (mar–dom 12:30–15:00 e 19:30–23:00, lunedì chiuso) sono **indicativi** → Admin → Locale e orari.
- **Prezzi mancanti**: i piatti presi dai post Facebook non hanno prezzo; vanno aggiunti dall'admin.
- **Allergeni**: lasciati volutamente vuoti, li deve indicare la cucina piatto per piatto (sul sito compare “chiedi al personale”).
- **Instagram** se esiste un profilo.
- **Privacy**: `src/app/(site)/privacy/page.tsx` è un modello, va completato con ragione sociale e P.IVA.
- **Diritti sulle foto**: sono foto pubblicate dal ristorante; confermare con il cliente che si possano usare sul sito (e chi ne è l'autore).
