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
   **Database già creato con una versione precedente?** Esegui, in ordine e una volta sola, i file di `supabase/migrations/` che non hai ancora eseguito: `2026-10-13_app-gestione.sql` (stato “rifiutata”, link privato del cliente, tabella `push_devices`, funzione `change_booking`), poi `2026-10-14_whatsapp.sql` (tabella `whatsapp_messages`), poi `2026-10-15_error-logs.sql` (tabella `error_logs`, Log errori), poi `2026-10-16_coperti-per-servizio.sql` (posti per servizio, modifica che resta confermata), poi `2026-10-17_gruppi-fino-al-servizio.sql` (gruppi fino a 1000 persone invece di 60), poi `2026-10-18_link-corto.sql` (link corto del cliente `/p/K7M2QX9T`), poi `2026-10-19_modifiche-cliente.sql` (colonna `guest_change`: in Gestione si vede in chiaro cosa ha modificato il cliente), poi `2026-10-25_promozioni-compleanni.sql` (colonna `promotion` sulle prenotazioni, tabella `birthdays` dei consensi agli auguri), poi `2026-10-26_link-compleanno.sql` (link personale `/auguri/<codice>` e offerta di compleanno sulla prenotazione), poi `2026-10-28_menu-traduzioni.sql` (colonna `tr` di categorie e piatti: le traduzioni del menu). Si possono rilanciare senza danni.
3. **Project Settings → API Keys**: copia URL, *publishable key* e *secret key* in `.env.local` (vedi `.env.example`).
4. Carica menu e impostazioni iniziali: `npm run seed:supabase`
5. **Authentication → Users → Add user**: crea l'utente del ristorante (email + password).
   Poi in **SQL Editor** abilitalo all'area admin:
   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email = 'email-del-ristorante@esempio.it';
   ```
   Senza questa riga il login risponde “Questo account non è abilitato all'area riservata”. Per abilitare in un colpo tutti gli utenti creati: `insert into public.admins (user_id) select id from auth.users on conflict do nothing;`
   **Sessione**: chi entra resta collegato (cookie di 400 giorni, rinnovato a ogni apertura dell'app; Supabase non fa scadere le sessioni se non si attivano i limiti di sessione del piano Pro). Le notifiche arrivano al dispositivo anche se si esce.
6. **Authentication → Sign In / Providers**: disattiva *Allow new users to sign up* (gli admin si creano solo a mano).

## Pubblicare su Vercel

> Prima Supabase, poi Vercel: online i dati **devono** stare su Supabase (su Vercel i file non si possono scrivere, la modalità demo locale non funziona).
>
> **Il sito mostra il menu di esempio e in Gestione ogni salvataggio dà errore?** Mancano su Vercel le variabili di Supabase (punto 4): aggiungile e fai **Redeploy**.

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
   | `YCLOUD_API_KEY`, `YCLOUD_WHATSAPP_FROM`, `YCLOUD_WEBHOOK_SECRET` | messaggi WhatsApp automatici ai clienti (vedi *Messaggi WhatsApp automatici*); senza, l'app apre WhatsApp con il messaggio pronto |
   | `RESEND_API_KEY`, `BOOKING_NOTIFY_EMAIL`, `BOOKING_FROM_EMAIL` | facoltative, email a ogni prenotazione |
   | `CRON_SECRET` | una stringa lunga a caso (es. `openssl rand -hex 32`): protegge i cron (Supabase sempre attivo, auguri di compleanno) |

5. **Deploy**. Alla fine apri l'indirizzo `*.vercel.app` e prova: home, menu, una prenotazione, accesso a `/gestore-prometeo-2026` con l'utente Supabase, installazione dell'app e notifica di prova (Notifiche e app → Invia una prova).
6. **Dominio**: Project → Settings → **Domains** → aggiungi il dominio e imposta i DNS indicati da Vercel presso il registrar. Poi aggiorna `NEXT_PUBLIC_SITE_URL` con il dominio e fai **Redeploy** (Deployments → ⋯ → Redeploy).
7. In Supabase → Authentication → **URL Configuration** imposta *Site URL* al dominio definitivo.
8. Solo ora scarica e stampa il **QR del menu** da Gestione → Menu (punta a `NEXT_PUBLIC_SITE_URL/qr`).

**Regione**: `vercel.json` fa girare il server a Francoforte (`fra1`), vicino al database Supabase (EU): ogni lettura dal database impiega pochi millisecondi invece di attraversare l'oceano. Se il progetto Supabase fosse in un'altra regione, cambia `regions` di conseguenza.

Ogni `git push` su `main` pubblica automaticamente una nuova versione. Le pagine pubbliche sono statiche e si rigenerano da sole quando l'admin salva una modifica.

### Supabase sempre attivo (cron di Vercel)
Il piano gratuito di Supabase mette in pausa il database dopo 7 giorni senza attività. `vercel.json` fa chiamare a Vercel, ogni giorno alle 6:00 UTC, `/api/cron/keepalive`, che fa una piccola lettura sul database: niente servizi esterni. Si vede in Vercel → Project → **Settings → Cron Jobs** (lì c'è anche *Run* per provarlo). Con `CRON_SECRET` impostato risponde solo a Vercel.

### Notifica email delle prenotazioni (facoltativa)
Crea un account [Resend](https://resend.com), verifica il dominio e imposta `RESEND_API_KEY`, `BOOKING_NOTIFY_EMAIL`, `BOOKING_FROM_EMAIL`. È un'aggiunta alle notifiche push: l'app si aggiorna da sola appena arriva una notifica (e comunque ogni 60 secondi).

### Icona e nome nei risultati di Google
Google mostra accanto al risultato l'icona del sito e il nome “Prometeo Fine Dining”. Le icone nascono tutte da `src/app/icon.svg`: `npm run assets:favicon` crea `src/app/favicon.ico` (16/32/48 px, all'indirizzo `/favicon.ico` che Google cerca sempre), `src/app/icon1.png` (192 px, multiplo di 48 come chiede Google), `src/app/apple-icon.png` (180 px) e `public/logo.png` (512 px, il logo nei dati strutturati della home insieme al nome del sito). Se cambi il logo, cambia `icon.svg` e rilancia il comando.

Google aggiorna l'icona solo quando ripassa sulla home, di solito da qualche giorno a qualche settimana. Per accelerare: [Google Search Console](https://search.google.com/search-console) → aggiungi la proprietà `prometeofinedining.it` (verifica con il record DNS) → *Controllo URL* → `https://www.prometeofinedining.it/` → **Richiedi indicizzazione**. Nello stesso pannello invia la sitemap `https://www.prometeofinedining.it/sitemap.xml`.

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
| **Clienti** | storico per numero di telefono: prenotazioni, coperti, annullate o rifiutate, date; **Compleanni in arrivo** (30 giorni: auguri inviati o “Invia a mano”); nella scheda del cliente il compleanno con “Togli dagli auguri” |
| **Menu** | categorie e piatti: foto (ridimensionate nel browser, anche scattate dal telefono), descrizione, prezzo, allergeni UE, vegetariano/vegano/senza glutine, “firma dello chef” (in home), nascondi, esaurito, ordine |
| **Locale e orari** | in cima il link a **Promozioni** (vedi sotto); avviso in cima al sito, orari con più turni, chiusure straordinarie, regole prenotazioni (coperti per servizio, conferma automatica fino a N persone, intervallo, preavviso), contatti, testi, recensioni |
| **Notifiche e app** | installazione, notifiche su questo dispositivo, cosa ricevere, dispositivi collegati, notifica di prova, esci |
| **Log errori** | solo per chi entra con un'email che inizia per `debiasi` (sviluppatore): ogni errore del sito e di Gestione — server (pagine, API, azioni, proxy), browser dei visitatori, errori gestiti (notifiche, WhatsApp, email, foto) — con percorso, dettagli e stack; filtro per tipo, errore di prova, svuota. Si cancellano da soli dopo 30 giorni (cron giornaliero). Non salva mai cookie, password o dati dei moduli |

**Accetta / Rifiuta.** Lo staff non modifica le prenotazioni (lo fa solo il cliente): risponde. Con YCloud collegato il messaggio al cliente parte da solo (vedi *Messaggi WhatsApp automatici*); altrimenti *Accetta* apre WhatsApp con la conferma già scritta (con il link per modificare o annullare) e *Rifiuta* apre la card con la scelta tra *Messaggio standard* (non dà motivi) e *Scrivo io il messaggio*, poi WhatsApp.

## Messaggi WhatsApp automatici (YCloud)

Il cliente riceve **da solo**, dal numero WhatsApp del ristorante, quattro messaggi: *richiesta ricevuta* (appena prenota dal sito), *conferma* (quando lo staff tocca Accetta, anche per le telefoniche se si lascia l'opzione attiva), *richiesta non accettata* (Rifiuta: senza motivo né dettagli, solo il nome del cliente) e *annullata* (quando lo staff annulla una prenotazione; senza WhatsApp automatico il pulsante “Annulla e avvisa” apre WhatsApp con il messaggio già scritto). Ogni messaggio è **in italiano e in inglese nello stesso messaggio** e dà del **Lei** (“Gentile / Dear Mario Rossi, … la Sua prenotazione è confermata. / Your booking is confirmed.”), con data, ora e persone in comune alle due lingue. Modelli `prenotazione_*_bi_v1`, testi leggibili in `MESSAGGI_META.md`: vanno **approvati dal cliente** e inviati a Meta con `npm run whatsapp -- templates`; finché Meta non li approva, l’invio automatico fallisce e l’app propone l’invio a mano. Il numero resta anche nell'app **WhatsApp Business** sul telefono (modalità *coexistence*): lì si vedono anche i messaggi automatici e si risponde ai clienti come sempre.

**Costi**: piano YCloud *Free* (0 €), più quanto fa pagare Meta per ogni messaggio automatico (modelli *utility*, circa 2–3 centesimi in Italia; verificare il listino Meta). I messaggi scritti a mano dall'app restano gratuiti.

**Finché non è collegato** l'app funziona come prima: Accetta / Rifiuta aprono WhatsApp con lo stesso messaggio già scritto. In ogni momento si può spegnere da *Gestione → Locale e orari → Messaggi WhatsApp automatici*.

### Attivazione (una volta)

1. Il numero del ristorante deve essere su **WhatsApp Business** (app aggiornata) e in uso da qualche settimana.
2. Su [ycloud.com](https://www.ycloud.com) crea l'account (piano Free) e collega il numero esistente scegliendo **“WhatsApp Business App coexistence”**: la procedura si conferma dall'app sul telefono con un QR code. Aggiungi su Meta il metodo di pagamento per i messaggi.
3. YCloud → Developers → **API Keys**: crea una chiave.
4. In `.env.local` (e poi su Vercel) imposta `YCLOUD_API_KEY`, `YCLOUD_WHATSAPP_FROM` (il numero, es. `+39333…`) e `NEXT_PUBLIC_SITE_URL` con il **dominio definitivo** (i link nei messaggi vengono fissati da Meta).
5. `npm run whatsapp -- check` → controlla chiave e numero.
6. `npm run whatsapp -- templates` → invia a Meta i modelli (i 4 delle prenotazioni + gli auguri di compleanno, categoria *marketing*; quelli già inviati vengono saltati) (testi in `src/lib/whatsapp/templates.ts`, riportati in `MESSAGGI_META.md`, *da approvare* col cliente prima di inviarli). Meta li approva di solito entro 24 ore: ricontrolla con `check`.
7. Dopo il deploy: `npm run whatsapp -- webhook` → registra `https://<dominio>/api/whatsapp/webhook` e stampa il secret: mettilo in `YCLOUD_WEBHOOK_SECRET` su Vercel e fai **Redeploy**. Senza webhook i messaggi partono lo stesso, ma l'app non sa se sono stati consegnati o letti e chi risponde STOP agli auguri non viene tolto. **Webhook registrato prima degli auguri?** Rilancia `npm run whatsapp -- webhook`: aggiunge le risposte dei clienti (STOP) all'endpoint esistente, il secret non cambia.
8. Facoltativo: `npm run whatsapp -- test +39…` manda una prova (messaggio reale, a pagamento).
9. Su Supabase esegui una volta `supabase/migrations/2026-10-14_whatsapp.sql` (tabella `whatsapp_messages`).

### Come si vede nell'app

- La card della richiesta dice “Il cliente riceve la risposta su WhatsApp in automatico”; *Rifiuta* mostra l'anteprima esatta del messaggio standard, che non dà motivi. *Scrivo io il messaggio* resta a mano (Meta permette l'invio automatico solo di testi approvati).
- Aprendo una prenotazione in *In sala* si vedono i messaggi inviati e il loro stato: in invio, inviato ✓, consegnato ✓✓, letto ✓✓.
- **Se un messaggio non parte o non arriva** (numero senza WhatsApp, modello non approvato, YCloud non raggiungibile…): la prenotazione resta valida, lo staff riceve una notifica push e nell'app compare **“Invia a mano”** con il testo già pronto.
- Tutto passa dal server: la chiave YCloud non arriva mai al browser; il webhook accetta solo richieste firmate da YCloud (`YCloud-Signature`, HMAC-SHA256, scarto oltre 5 minuti).

## Menu al tavolo (QR)

`/qr` è il menu per chi è già seduto: niente tasti di prenotazione, niente barra “Chiama/Prenota”, non indicizzato da Google.
Il QR da stampare si scarica da **Gestione → Menu** (PNG o SVG per la tipografia). Generarlo **dopo** aver impostato `NEXT_PUBLIC_SITE_URL` con il dominio definitivo.
Il menu pubblico `/menu` ha un solo invito a prenotare, in fondo alla pagina.

## Traduzione del menu (inglese)

Da **Gestione → Menu → Traduzione inglese**. Il riquadro mostra quanti testi sono tradotti, quanti mancano e quanti sono *da rivedere*; nella lista ogni piatto senza inglese ha l'etichetta `EN` barrata, `EN ↻` se è da rivedere.

1. **Esporta** scarica un solo file (`prometeo-menu-en-<data>.json`) con dentro le **istruzioni per l'AI** (inglese britannico, fedele all'italiano, niente ingredienti aggiunti o tolti, nomi tipici lasciati in italiano, numeri invariati, lunghezze massime, dubbi spiegati in italiano) e, per ogni categoria e piatto, il testo italiano e il campo inglese da compilare. Se una parte è già tradotta si sceglie *solo i testi nuovi o modificati* oppure *tutto il menu*.
2. Il file si allega a **Claude o ChatGPT** scrivendo solo “Segui le istruzioni contenute nel file e restituiscimi il file tradotto.” (c'è il tasto Copia). L'AI restituisce lo stesso file con l'inglese compilato.
3. **Importa** carica il file (o il testo, se l'AI ha risposto in chat) e, **prima di salvare**, mostra ogni traduzione accanto all'italiano. Quelle con un **dubbio dell'AI** o un problema trovato dai controlli (numeri diversi dall'italiano, testo troppo lungo, campo mancante o aggiunto, descrizione non tradotta, italiano cambiato dopo l'esportazione) vanno **confermate una per una** dall'operatore, che può anche correggerle lì. Le altre sono già spuntate e si possono togliere o modificare.

**Controlla** mostra tutto il menu con italiano e inglese affiancati (filtri *Da tradurre* / *Da rivedere*) e un tasto **Modifica** su ogni voce; **Apri il menu in inglese sul sito** apre `/en/menu` in una nuova scheda.

**Il menu inglese per i clienti**: `/en/menu` (sito) e `/en/qr` (tavolo), con il selettore **IT · EN** sotto il titolo; dove manca la traduzione si vede l'italiano. Il **QR stampato resta uno solo** (`/qr`): chi lo apre con il telefono in un'altra lingua va da solo su `/en/qr` (`src/proxy.ts`, dall'intestazione *Accept-Language*), e la scelta fatta col selettore viene ricordata (cookie `lang`). Allergeni ed etichette (vegetariano, piccante…) sono tradotti nel codice (`src/lib/catalog.ts`), i testi fissi delle pagine del menu in `src/lib/i18n.ts`. Per ora intestazione, piè di pagina e prenotazione del sito restano in italiano.

L'import scrive **solo** i testi inglesi: prezzi, allergeni, foto e testi italiani non vengono mai toccati, e il server ricontrolla tutto. Ogni traduzione ricorda da quale italiano è stata fatta: se poi si cambia l'italiano, il piatto diventa *da rivedere* (nella scheda del piatto, sezione **Inglese**, si corregge oppure si conferma “va bene così”). Istruzioni per l'AI e controlli: `src/lib/menu-i18n.ts`.

## Promozioni e compleanni

*Gestione → Locale e orari → Promozioni e compleanni* (`/gestore-prometeo-2026/locale/promozioni`; sul telefono resta attiva la scheda Locale).

**Promozioni (sconti come su TheFork).** Ogni promozione ha nome, sconto (1–90%), periodo dal giorno X al giorno Y (calendario: tocca il primo e l'ultimo giorno), giorni della settimana (tutti o solo alcuni), orario (*tutto il giorno* oppure *dalle X alle Y*, orario di arrivo, estremi compresi) e **condizioni** scritte dal ristorante. Si può spegnere senza cancellarla. Il calendario in alto mostra lo sconto più alto di ogni giorno.
- Sul sito: nel calendario i giorni con promozione hanno “−20%” in verde, negli orari l'etichetta compare solo sugli orari validi; prima di scegliere l'ora il cliente legge nome, orari e condizioni (solo delle promozioni che valgono davvero su almeno un orario), e prima di confermare “Sconto −20% su questa prenotazione”. Riepilogo e pagina del cliente mostrano sconto e condizioni.
- Se due promozioni valgono per lo stesso orario vince lo sconto più alto. Lo sconto viene **salvato sulla prenotazione** com'era al momento della prenotazione: cambiare o cancellare la promozione non lo toglie a chi ha già prenotato. Se il cliente sposta giorno o ora, vale lo sconto del nuovo orario (o nessuno: la pagina lo avvisa prima di salvare); se cambia solo persone o note, lo sconto resta.
- Le prenotazioni telefoniche prendono lo stesso sconto del sito per quel giorno e ora. In Gestione lo sconto compare come “−20%” nella riga e, aperta la prenotazione o nella richiesta, con nome e condizioni.

**Auguri di compleanno (marketing, GDPR art. 6.1.a).** Con l'interruttore acceso il modulo di prenotazione mostra il riquadro facoltativo *Il tuo compleanno*: solo **giorno e mese** (mai l'anno) e una casella di consenso **separata**, mai già spuntata e non necessaria per prenotare (testo in `src/lib/birthday.ts`). Data senza spunta o spunta senza data = messaggio d'errore, la prenotazione non parte finché non si sistema. Il consenso è salvato per numero di telefono nella tabella `birthdays`, con il testo esatto e la data; si rinnova a ogni prenotazione con la casella spuntata ed è separato dalle prenotazioni (cancellarle non lo toglie).
- Ogni giorno alle 09:00 UTC il cron `/api/cron/birthdays` manda il modello `auguri_compleanno_bi_v3` (italiano + inglese, col Lei) *N* giorni prima del compleanno (impostabile, 0–14) con l'offerta scritta in Gestione nelle due lingue (max 60 caratteri ciascuna), il telefono del ristorante e **tutte le condizioni**: giorni validi scritti per esteso, una sola prenotazione, salvo disponibilità e conferma, documento con la data di nascita, non cumulabile né convertibile in denaro. **Offerta e giorni si fissano quando parte il messaggio** (colonna `invite_terms`): cambiarli in Gestione vale solo per gli auguri successivi; una volta sola per compleanno; chi dà il consenso a ridosso del compleanno li riceve lo stesso finché resta un giorno prenotabile; il 29 febbraio diventa 28 negli anni non bisestili. Senza offerta o senza telefono in *Locale e orari* non parte nulla; senza YCloud il link si crea comunque e in *Clienti → Compleanni in arrivo* lo staff invia gli auguri a mano con il testo pronto.
- **Link personale** `/auguri/<codice>` (pulsante del messaggio, 8 caratteri come il link corto, stessa protezione contro i tentativi): apre la prenotazione con nome e numero già compilati e i soli giorni ammessi: dal compleanno −X al compleanno +X (*Giorni prenotabili col link*, 0–14), giorni aperti e prenotabili; con X = 0 solo il compleanno; se il compleanno è un giorno di chiusura si aggiungono il primo giorno aperto prima e il primo dopo. Il cliente sceglie persone (fino ai coperti del servizio) e orario come sempre, ma la prenotazione è **sempre una richiesta**: la conferma lo staff in Gestione, qualunque sia il numero di persone (niente conferma automatica, e se il cliente la modifica torna da confermare). Se il compleanno è un giorno di chiusura la pagina lo dice (“…il giorno del tuo compleanno, il ristorante è chiuso: puoi festeggiare con noi in uno di questi giorni”) e mostra quel giorno come “chiuso”. **Le promozioni non valgono**: la prenotazione salva l'offerta di compleanno (`birthday_offer`) e in Gestione ha l'etichetta “Compleanno” con “prima verificare un documento con la data di nascita”. Finché il cliente non invia la prenotazione, in Gestione non c'è nulla; la pagina del link, se riaperta, dice se è ancora una richiesta o già confermata. Un link = una prenotazione; se viene annullata il link torna valido; scade dopo l'ultimo giorno ammesso. Il cliente può spostarla solo tra i giorni del link. Per telefono lo staff prende la prenotazione come sempre.
- Chi risponde **STOP** (anche “basta”, “cancellami”, “unsubscribe”) viene tolto subito (webhook); lo staff può toglierlo da *Clienti* (“Togli dagli auguri”). Dopo **24 mesi** senza una nuova prenotazione con la casella spuntata la data viene cancellata dal cron.
- Costi: i messaggi *marketing* costano più degli *utility* (indicativamente 5–7 centesimi l'uno in Italia, verificare il listino Meta).

## Come funziona la prenotazione

1. **Persone** → 2. **Giorno** (Oggi / Domani / calendario, giorni chiusi disattivati) → 3. **Orario** → 4. **Nome e telefono (WhatsApp)**.

Le regole si impostano in *Gestione → Locale e orari* (salvate nel database):

| Prenotazione dal sito | Cosa succede |
|---|---|
| il servizio non ha più posti per quelle persone | **rifiutata subito**: “Siamo spiacenti, siamo al completo” (gli orari di quel servizio non si possono scegliere) |
| fino a *Conferma automatica fino a* persone | **confermata subito**: il riepilogo dice “Prenotazione confermata, ti aspettiamo”; con YCloud parte il WhatsApp di conferma; lo staff riceve “Nuova prenotazione · confermata in automatico” |
| oltre, fino ai *coperti massimi per servizio* | **richiesta** (“Da confermare”): lo staff accetta o rifiuta. Non c'è un limite per gruppo: si può prenotare fino a tutti i posti del servizio |

**Coperti massimi per servizio**: un limite per il pranzo (orari prima delle 17:00) e uno per la cena (dalle 17:00) di ogni giorno, a qualunque ora del servizio: es. 40 = 20 tavoli da 2. Contano le prenotazioni *da confermare* e *confermate*. Le prenotazioni telefoniche inserite dallo staff non hanno limite (decide lo staff).
Stati: *da confermare* → *confermata* oppure *rifiutata*; *annullata* se annulla il cliente o lo staff.
Il server ricontrolla tutto: orari validi, chiusure, capienza. La funzione SQL `create_booking` blocca il servizio durante l'inserimento, così due clienti non possono prendere gli ultimi posti nello stesso istante.
Regole per numero di telefono (scritto in qualsiasi formato: `+39 333…`, `0039…`, `333 …`): **una sola prenotazione attiva a pranzo e una a cena per giorno**, e al massimo 4 richieste in 24 ore (anti-spam, insieme al campo nascosto).

**Pagina del cliente**: nei messaggi WhatsApp il link è corto, `/p/K7M2QX9T` (8 caratteri senza 0/O e 1/I, oltre mille miliardi di combinazioni; dopo 10 codici sbagliati in 15 minuti lo stesso indirizzo riceve solo “non trovata”). Lo stesso indirizzo esiste anche come `/prenotazione/<codice segreto lungo>` (riepilogo dopo la prenotazione, link già inviati). Nessuno dei due è l'id della prenotazione: aprono solo quella prenotazione e passano dal server, mai dal database direttamente. La pagina torna anche su `/prenota` dallo stesso telefono. Nel messaggio inviato a mano il testo dice “usa il link qui sotto” (con YCloud è un pulsante). Il cliente vede lo stato e può **modificare** giorno, ora, persone e note (resta confermata se le persone rientrano nella conferma automatica, e riceve di nuovo la conferma su WhatsApp; altrimenti torna “da confermare”) o **annullare**, fino al preavviso minimo impostato in *Locale e orari*; dopo, la pagina invita a chiamare.

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
src/lib/messages.ts    valori e testo dei messaggi WhatsApp (uguale per invio automatico e a mano)
src/lib/whatsapp/      modelli Meta (templates.ts), client YCloud, invio e webhook
src/app/api/whatsapp/  webhook YCloud (stato dei messaggi)
src/app/api/cron/      cron di Vercel: Supabase sempre attivo + pulizia del log errori (keepalive), auguri di compleanno (birthdays)
src/lib/promotions.ts  regole delle promozioni (sito, server e Gestione usano le stesse)
src/lib/birthday.ts    consenso, date, giorni del link e calcolo degli auguri di compleanno
src/lib/birthday-booking.ts  link personale /auguri/<codice>: stato del link e giorni di una prenotazione di compleanno
src/lib/guess-guard.ts limite ai codici sbagliati (link /p/ e /auguri/)
src/lib/errors.ts      log errori: src/instrumentation.ts (server), src/instrumentation-client.ts → /api/log-error (browser), logError() (errori gestiti)
src/lib/pwa.ts         percorso, nome e immagini dell'app Gestione
supabase/schema.sql    database (nuova installazione) · supabase/migrations/ per i database esistenti
design/app-icon/       icona dell'app esportata da Penpot
scripts/               seed Supabase, immagini dell'app (make-app-assets.ts), icone del sito (make-favicons.ts), mappa (make-map.ts), configurazione YCloud (whatsapp.ts)
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
| Nomi inglesi dei 14 allergeni | testo inglese del Regolamento UE 1169/2011, allegato II |
| Traduzioni inglesi del menu | preparate con l'AI dal file esportato, confermate dallo staff all'import |
| Partita IVA (footer e informativa privacy, modificabile da Gestione → Locale e orari → Contatti) | comunicata dal titolare; da confrontare con la visura camerale |
| Voto 9,8/10 e 392 recensioni, km 0, tavoli all'aperto, cani ammessi, opzioni vegetariane | TheFork |
| Estratti di recensioni (Annalisa P., Cosimo L., Rossana R.) | Tripadvisor, giugno–settembre 2026 — da verificare e aggiornare dall'admin |
| Domande frequenti | risposte basate sui servizi indicati su TheFork e sul funzionamento del sito |
| Mappa della sezione “Dove siamo” | immagine statica da OpenStreetMap (© OpenStreetMap contributors, ODbL), servita dal sito: nessun cookie di terze parti. Si rigenera con `npm run assets:map` (`scripts/make-map.ts`); il pulsante apre il “Link Google Maps” impostato dall'admin |

Testi scritti da noi (da far approvare al cliente): la descrizione della sala, i testi della sezione prenotazione, le didascalie delle foto e la frase del footer “Ti aspettiamo sotto la nostra luna.” (modificabile dall'admin).
**Da approvare anche**: il riepilogo dopo la richiesta (“Questa è una richiesta di prenotazione, non ancora confermata…”) e dopo la conferma automatica (“Prenotazione confermata… ti aspettiamo”), il messaggio “Siamo spiacenti, siamo al completo”, la FAQ sui gruppi (“Sì, anche online: per i gruppi più numerosi la prenotazione è una richiesta…”), i testi della pagina del cliente, i 4 messaggi WhatsApp automatici in italiano e inglese, con il Lei, e il messaggio degli auguri di compleanno (`MESSAGGI_META.md` / `src/lib/whatsapp/templates.ts`), la nota sotto il telefono (“Numero straniero? Tocca la bandiera.”), le istruzioni per l'AI nel file di traduzione del menu (`src/lib/menu-i18n.ts`), le traduzioni inglesi del menu (le prepara l'AI, le conferma lo staff all'import), i testi fissi del menu inglese e le etichette inglesi dei piatti (es. “Km 0” → “Locally sourced”) in `src/lib/i18n.ts` e `src/lib/catalog.ts`, il consenso WhatsApp e il consenso agli auguri di compleanno nel modulo di prenotazione (`src/lib/birthday.ts`), la sezione WhatsApp, la sezione Auguri di compleanno e la sezione Cookie dell'informativa privacy, la nota sotto il calendario sui giorni in promozione e i testi delle notifiche (`src/lib/events.ts`).

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
- **Privacy**: `src/app/(site)/privacy/page.tsx` è un modello: la P.IVA c'è già (dalle impostazioni), manca la ragione sociale dell'azienda.
- **Testi WhatsApp e notifiche**: approvare i messaggi di conferma/rifiuto e il riepilogo della richiesta (vedi sopra).
- **Email per le notifiche push**: mettere l'email del ristorante in `VAPID_SUBJECT`.
- **WhatsApp automatico**: attivare YCloud seguendo *Messaggi WhatsApp automatici* (numero su WhatsApp Business da qualche settimana, modelli approvati da Meta) ed eseguire `supabase/migrations/2026-10-14_whatsapp.sql`.
- **Privacy e YCloud**: chiedere a YCloud il contratto per il trattamento dei dati (DPA, GDPR) e completare l'informativa.
- **Promozioni e compleanni**: eseguire `supabase/migrations/2026-10-25_promozioni-compleanni.sql`; le promozioni (sconti, orari, condizioni) e l'offerta di compleanno le decide e le scrive il ristorante in Gestione, il sito non ne inventa nessuna; eseguire anche `2026-10-26_link-compleanno.sql`; modello degli auguri `_v3` inviato a Meta il 26/10/2026 (`_v2` ritirato: non scriveva i giorni validi), in attesa di approvazione come gli altri 4 (`npm run whatsapp -- check`); webhook per lo STOP già aggiornato. Approvare col cliente la regola del documento d'identità e il testo della pagina `/auguri/`.
- **Traduzione del menu**: eseguire `supabase/migrations/2026-10-28_menu-traduzioni.sql` prima di usare Esporta/Importa; poi far tradurre il menu e far rileggere le traduzioni a qualcuno del ristorante (soprattutto ingredienti e allergeni).
- **Diritti sulle foto**: sono foto pubblicate dal ristorante; confermare con il cliente che si possano usare sul sito (e chi ne è l'autore).
