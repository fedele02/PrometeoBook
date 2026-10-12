# Prometeo Fine Dining — sito web

Sito del ristorante **Prometeo Fine Dining** (Via Michele Torraca 10, Matera): home emozionale, menu con foto, prenotazione tavoli in 4 tocchi, pagina privata del cliente per modificare o annullare e **app “Prometeo Gestione”** per lo staff (installabile, con notifiche push).

**Stack:** Next.js 16 (App Router) · React 19 · Tailwind CSS v4 · Motion · Supabase (database, login admin, foto) · Web Push (`web-push`) · Vercel.

## Avvio in locale

```bash
npm install
npm run dev        # http://localhost:3000
```

Senza variabili Supabase il sito gira in **modalità demo locale**: i dati stanno in `data/local-db.json` (creato al primo salvataggio, cancellalo per tornare ai dati iniziali) e le foto in `public/uploads/`.
Area di gestione: <http://localhost:3000/gestore-prometeo-2026> · password di sviluppo `prometeo` (o `ADMIN_PASSWORD`).
L'indirizzo non è linkato da nessuna parte del sito e non è in `robots.txt`: chi non lo conosce non lo trova (la vera protezione resta la password / l'utente Supabase). `/admin` non esiste più.

Per le notifiche push in locale servono le chiavi VAPID in `.env.local` (vedi `.env.example`): `npx web-push generate-vapid-keys`.

> Gli script npm chiamano `node …/next` direttamente perché il percorso della cartella contiene `&` (“A & C HOLDING”), che rompe i comandi `.cmd` di Windows.

## Collegare Supabase

1. Crea un progetto su [supabase.com](https://supabase.com) (regione **EU – Frankfurt**, per il GDPR).
2. **SQL Editor** → incolla ed esegui tutto `supabase/schema.sql` (tabelle, sicurezza RLS, funzioni di prenotazione e modifica atomiche, dispositivi per le notifiche, bucket foto `media`).
   **Database già creato con una versione precedente?** Esegui una volta `supabase/migrations/2026-10-13_app-gestione.sql` (stato “rifiutata”, link privato del cliente, tabella `push_devices`, funzione `change_booking`): si può rilanciare senza danni.
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

> Prima Supabase, poi Vercel: online i dati **devono** stare su Supabase (su Vercel i file non si possono scrivere, la modalità demo locale non funziona).

1. Completa **Collegare Supabase** (sopra), compreso `npm run seed:supabase` e l'utente admin.
2. Su [vercel.com/new](https://vercel.com/new) → **Import Git Repository** → `fedele02/PrometeoBook` (collega l'account GitHub se richiesto).
3. Nella schermata di import: Framework **Next.js** (rilevato da solo), Root Directory `./`, Build/Install command **lasciati di default**.
4. Apri **Environment Variables** e aggiungi, per *Production, Preview e Development*:

   | Nome | Valore |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
   | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | chiave *publishable* (`sb_publishable_…`) |
   | `SUPABASE_SECRET_KEY` | chiave *secret* (`sb_secret_…`) — mai pubblicarla |
   | `NEXT_PUBLIC_SITE_URL` | per ora `https://<progetto>.vercel.app`, poi il dominio definitivo |
   | `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` | notifiche push dell'app Gestione: `npx web-push generate-vapid-keys` (le stesse in locale e online, altrimenti i telefoni vanno ricollegati) |
   | `VAPID_SUBJECT` | `mailto:` con l'email del ristorante (contatto per i servizi push di Google/Apple) |
   | `RESEND_API_KEY`, `BOOKING_NOTIFY_EMAIL`, `BOOKING_FROM_EMAIL` | facoltative, email a ogni prenotazione |

5. **Deploy**. Alla fine apri l'indirizzo `*.vercel.app` e prova: home, menu, una prenotazione, accesso a `/gestore-prometeo-2026` con l'utente Supabase, installazione dell'app e notifica di prova (Notifiche e app → Invia una prova).
6. **Dominio**: Project → Settings → **Domains** → aggiungi il dominio e imposta i DNS indicati da Vercel presso il registrar. Poi aggiorna `NEXT_PUBLIC_SITE_URL` con il dominio e fai **Redeploy** (Deployments → ⋯ → Redeploy).
7. In Supabase → Authentication → **URL Configuration** imposta *Site URL* al dominio definitivo.
8. Solo ora scarica e stampa il **QR del menu** da Gestione → Menu (punta a `NEXT_PUBLIC_SITE_URL/qr`).

Ogni `git push` su `main` pubblica automaticamente una nuova versione. Le pagine pubbliche sono statiche e si rigenerano da sole quando l'admin salva una modifica.

### Notifica email delle prenotazioni (facoltativa)
Crea un account [Resend](https://resend.com), verifica il dominio e imposta `RESEND_API_KEY`, `BOOKING_NOTIFY_EMAIL`, `BOOKING_FROM_EMAIL`. È un'aggiunta alle notifiche push: l'app si aggiorna da sola appena arriva una notifica (e comunque ogni 60 secondi).

## Mappa del codice (graphify)

Il grafo del progetto è in `graphify-out/` (`graph.html` da aprire nel browser, `GRAPH_REPORT.md`, `graph.json`).
- Dopo modifiche al codice: `graphify update .` (lo fa anche l'hook post-commit).
- Dopo modifiche ai documenti: `/graphify . --update` in Claude Code.
- Domande sul codice: `graphify query "come funziona la prenotazione?"`.
Le regole per Claude (aggiornare grafo, README, design system e modello dati a ogni modifica) sono in `CLAUDE.md`.

## App “Prometeo Gestione” (area di gestione)

Indirizzo: `/gestore-prometeo-2026`. Solo questa sezione è un'app installabile: il sito dei clienti non ha manifest né service worker.

**Installazione**
- **Android / computer (Chrome, Edge)**: banner “Installa l'app” in cima, oppure *Notifiche e app → Installa l'app*.
- **iPhone**: Safari → Condividi → *Aggiungi alla schermata Home* (Apple non permette un pulsante; la guida passo passo è in *Notifiche e app*). Su iPhone le notifiche funzionano **solo** dall'app installata (iOS 16.4+).
- Icona: logo Prometeo + “GESTIONE” (disegnata in Penpot, esportata in `design/app-icon/`), schermate di avvio nere per gli iPhone. Per rigenerare tutte le immagini: `npm run assets:app`.

**Notifiche** (Web Push, senza pulsanti: un tocco apre l'app sulla prenotazione giusta). Si attivano per dispositivo in *Notifiche e app*, dove si sceglie anche cosa ricevere:

| Evento | Esempio |
|---|---|
| Nuova richiesta dal sito | *Nuova richiesta · Mario Rossi* — 4 persone · sab 18 ott, ore 21:00 (cena) |
| Il cliente modifica | *Modificata · Giulia Bianchi* — ore 20:00 → 20:30 · 2 → 3 persone · Da riconfermare |
| Il cliente annulla | *Annullata · Luca Esposito* — Il cliente ha annullato: 6 posti liberati |
| Un collega accetta, rifiuta, annulla o aggiunge una telefonica | arriva agli **altri** dispositivi, non a chi l'ha fatto |

Il numero sull'icona dell'app (dove il sistema lo supporta) e sulla scheda *Richieste* = richieste ancora da decidere. Le visite precedenti del cliente si vedono **solo nell'app**, mai nelle notifiche.

| Sezione | Cosa si fa |
|---|---|
| **Prenotazioni** | giorno scelto con titolo e stato del servizio; fila dei **soli giorni con prenotazioni** (coperti e richieste in attesa) + calendario per gli altri; coperti per pranzo/cena con grafico per fascia oraria (arancio quando è quasi pieno); richieste del giorno con **Accetta / Rifiuta**; “In sala” in timeline con dettagli, storico, chiama/WhatsApp, annulla; prenotazione telefonica (+) |
| **Richieste** | tutte le richieste da confermare, raggruppate per giorno, filtri Tutte / Oggi / Prossimi giorni |
| **Clienti** | storico per numero di telefono: prenotazioni, coperti, annullate o rifiutate, date |
| **Menu** | categorie e piatti: foto (ridimensionate nel browser, anche scattate dal telefono), descrizione, prezzo, allergeni UE, vegetariano/vegano/senza glutine, “firma dello chef” (in home), nascondi, esaurito, ordine |
| **Locale e orari** | avviso in cima al sito, orari con più turni, chiusure straordinarie, regole prenotazioni (coperti per orario, intervallo, preavviso), contatti, testi, recensioni |
| **Notifiche e app** | installazione, notifiche su questo dispositivo, cosa ricevere, dispositivi collegati, notifica di prova, esci |

**Accetta / Rifiuta.** Lo staff non modifica le prenotazioni (lo fa solo il cliente): risponde. *Accetta* conferma e apre WhatsApp con il messaggio di conferma già scritto (con il link per modificare o annullare); *Rifiuta* apre la card con il motivo (completo, chiuso, gruppo troppo numeroso, testo libero) e il messaggio modificabile, poi WhatsApp. Il messaggio va inviato a mano: WhatsApp non permette l'invio automatico senza la Business API (account Meta a pagamento).

## Menu al tavolo (QR)

`/qr` è il menu per chi è già seduto: niente tasti di prenotazione, niente barra “Chiama/Prenota”, non indicizzato da Google.
Il QR da stampare si scarica da **Gestione → Menu** (PNG o SVG per la tipografia). Generarlo **dopo** aver impostato `NEXT_PUBLIC_SITE_URL` con il dominio definitivo.
Il menu pubblico `/menu` ha un solo invito a prenotare, in fondo alla pagina.

## Come funziona la prenotazione

1. **Persone** → 2. **Giorno** (Oggi / Domani / calendario, giorni chiusi disattivati) → 3. **Orario** (solo quelli con posti liberi) → 4. **Nome e telefono (WhatsApp)**.
Ogni prenotazione dal sito è una **richiesta** (“Da confermare”): il riepilogo lo dice chiaramente e indica il numero WhatsApp su cui arriverà la conferma. Stati: *da confermare* → *confermata* oppure *rifiutata*; *annullata* se annulla il cliente o lo staff. Solo “da confermare” e “confermata” occupano posti.
Il server ricontrolla tutto: orari validi, chiusure, capienza. La funzione SQL `create_booking` blocca l'orario durante l'inserimento, così due clienti non possono prendere gli ultimi posti nello stesso istante.
Regole per numero di telefono (scritto in qualsiasi formato: `+39 333…`, `0039…`, `333 …`): **una sola prenotazione attiva a pranzo e una a cena per giorno**, e al massimo 4 richieste in 24 ore (anti-spam, insieme al campo nascosto).

**Pagina del cliente** `/prenotazione/<codice segreto>`: il link compare nel riepilogo, nel messaggio WhatsApp di conferma e torna su `/prenota` dallo stesso telefono. Il cliente vede lo stato e può **modificare** giorno, ora, persone e note (la prenotazione torna “da confermare”) o **annullare**, fino al preavviso minimo impostato in *Locale e orari*; dopo, la pagina invita a chiamare.

## Struttura

```
src/app/(site)/        home, menu, prenota (+ server actions), privacy
src/app/(site)/prenotazione/[token]/  pagina privata del cliente
src/app/gestore-prometeo-2026/        app Gestione: login, prenotazioni, richieste, clienti, menu, locale, notifiche (+ server actions)
public/gestore-prometeo-2026/         manifest, service worker (sw.js), icone e schermate di avvio dell'app
src/components/        home, menu, booking, admin, site (header, footer), logo vettoriale
src/lib/data/          repository: supabase.ts (produzione) | local.ts (demo)
src/lib/time.ts        orari, turni e disponibilità (fuso Europe/Rome)
src/lib/events.ts      cosa succede a una prenotazione → testo della notifica (push.ts la invia)
src/lib/messages.ts    messaggi WhatsApp di conferma e rifiuto
src/lib/pwa.ts         percorso, nome e immagini dell'app Gestione
supabase/schema.sql    database (nuova installazione) · supabase/migrations/ per i database esistenti
design/app-icon/       icona dell'app esportata da Penpot
scripts/               seed Supabase, immagini dell'app (make-app-assets.ts)
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
| Estratti di recensioni (Annalisa P., Cosimo L., Rossana R.) | Tripadvisor, giugno–settembre 2026 — da verificare e aggiornare dall'admin |
| Domande frequenti | risposte basate sui servizi indicati su TheFork e sul funzionamento del sito |

Testi scritti da noi (da far approvare al cliente): la descrizione della sala, i testi della sezione prenotazione, le didascalie delle foto e la frase del footer “Ti aspettiamo sotto la nostra luna.” (modificabile dall'admin).
**Da approvare anche**: il riepilogo dopo la richiesta (“Questa è una richiesta di prenotazione, non ancora confermata…”), i testi della pagina del cliente, i messaggi WhatsApp di conferma e di rifiuto (`src/lib/messages.ts`) e i testi delle notifiche (`src/lib/events.ts`).

## Design

- Direzione presa dal materiale del ristorante: nero, oro del logo, capitali “romane” (Cinzel) come l'insegna, testo sans (Hanken Grotesk), linee sottili con la fiamma.
- **Mobile first**: verificato su 320×568, 360×640, 360×780, 375×667, 390×844, 412×915, 430×932, telefono in orizzontale, tablet e desktop.
- I “Percorsi di sapori” sul telefono sono un percorso orizzontale da sfogliare (pattern *Horizontal Scroll Journey*), su desktop si alternano a destra e sinistra.
- Skill di design **UI UX Pro Max** installata in `.claude/skills/ui-ux-pro-max`; il design system è in `design-system/prometeo-fine-dining/MASTER.md` (generato dalla skill e adattato al brand, con le scelte scartate e il perché).
- Animazioni con **Motion** (`src/components/motion/Reveal.tsx`): fade + slide-up e stagger, rispettano “riduci movimento”.
- Home tutta scura con toni alternati (`ink` / `ink-2`), niente salti chiaro/scuro; carta chiara solo nella pagina Prenota.
- Lighthouse mobile (build di produzione, rete 4G simulata): Accessibilità, Best practice e SEO 100 su home, menu e prenota; Performance 85–92 a seconda della pagina e del giro (LCP reale misurato 0,2–0,3 s).

## Da completare con il cliente

- **Orari di apertura**: non sono pubblicati da nessuna parte, quelli attuali (mar–dom 12:30–15:00 e 19:30–23:00, lunedì chiuso) sono **indicativi** → Gestione → Locale e orari.
- **Prezzi mancanti**: i piatti presi dai post Facebook non hanno prezzo; vanno aggiunti dall'admin.
- **Allergeni**: lasciati volutamente vuoti, li deve indicare la cucina piatto per piatto (sul sito compare “chiedi al personale”).
- **Instagram** se esiste un profilo.
- **Privacy**: `src/app/(site)/privacy/page.tsx` è un modello, va completato con ragione sociale e P.IVA.
- **Testi WhatsApp e notifiche**: approvare i messaggi di conferma/rifiuto e il riepilogo della richiesta (vedi sopra).
- **Email per le notifiche push**: mettere l'email del ristorante in `VAPID_SUBJECT`.
- **Database esistente**: eseguire `supabase/migrations/2026-10-13_app-gestione.sql` su Supabase (una volta).
- **Diritti sulle foto**: sono foto pubblicate dal ristorante; confermare con il cliente che si possano usare sul sito (e chi ne è l'autore).
