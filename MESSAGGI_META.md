# Messaggi WhatsApp da far approvare a Meta

Bozza **da approvare col cliente** prima dell'invio. Ogni messaggio è **in italiano e in inglese nello stesso messaggio** e dà del **Lei** al cliente.
I testi veri sono in `src/lib/whatsapp/templates.ts`: questo file li riporta per leggerli comodamente.
Le parti tra doppie graffe `{{1}}`, `{{2}}`… sono i dati che cambiano a ogni prenotazione.
Una volta approvato, un testo non si può più modificare: se serve cambiarlo si crea un modello nuovo (`_bi_v2`).

## Che cosa finisce al posto delle variabili

| Variabile | Cosa contiene | Esempio |
|---|---|---|
| `{{1}}` | nome e cognome come li ha scritti il cliente | Mario Rossi |
| `{{2}}` | giorno in italiano e in inglese | Sabato 18 ottobre / Saturday 18 October |
| `{{3}}` | orario | 21:00 |
| `{{4}}` | numero di persone, solo la cifra | 4 |
| `{{5}}` | solo nella conferma: indirizzo | Via Michele Torraca 10, Matera |

Ogni variabile compare una sola volta: il nome apre il messaggio per tutte e due le lingue e i dettagli (data, ora, persone) sono in comune. Il messaggio di rifiuto usa solo il nome.
Il link non sta nel testo: è il **pulsante** sotto il messaggio. Quando lo staff invia il messaggio a mano, il pulsante diventa un link scritto in fondo (“usi il link qui sotto / please use the link below”).

---

## 1. Richiesta ricevuta
Nome modello: `prenotazione_ricevuta_bi_v1` · Categoria: Utility · Lingua: Italiano

```
Gentile / Dear {{1}},

abbiamo ricevuto la Sua richiesta di prenotazione.
We have received your booking request.

Data / Date: {{2}}
Ora / Time: {{3}}
Persone / Guests: {{4}}

La prenotazione non è ancora confermata: stiamo verificando la disponibilità e Le risponderemo al più presto qui su WhatsApp.

Your booking is not confirmed yet: we are checking availability and will reply to you here on WhatsApp shortly.
```

Piè di pagina: `Prometeo Fine Dining · Matera`
Pulsante (link): `Gestisci / Manage` → `https://DOMINIO/p/{{1}}` (codice d'esempio per Meta: `K7M2QX9T`)

---

## 2. Prenotazione confermata
Nome modello: `prenotazione_confermata_bi_v1` · Categoria: Utility · Lingua: Italiano

```
Gentile / Dear {{1}},

la Sua prenotazione è confermata.
Your booking is confirmed.

Data / Date: {{2}}
Ora / Time: {{3}}
Persone / Guests: {{4}}
Indirizzo / Address: {{5}}

La aspettiamo. Se desidera modificare o annullare la prenotazione, utilizzi il pulsante qui sotto.

We look forward to welcoming you. If you wish to change or cancel your booking, please use the button below.
```

Piè di pagina: `Prometeo Fine Dining · Matera`
Pulsante (link): `Gestisci / Manage` → `https://DOMINIO/p/{{1}}`

---

## 3. Richiesta non accettata
Nome modello: `prenotazione_non_accettata_bi_v1` · Categoria: Utility · Lingua: Italiano

Nessun dettaglio e **nessun motivo**: c'è solo il nome del cliente.

```
Gentile / Dear {{1}},

purtroppo non possiamo accettare la Sua richiesta di prenotazione.
Unfortunately we are unable to accept your booking request.

Ci scusiamo per l'inconveniente. Se lo desidera, può scegliere un altro giorno o un altro orario dal nostro sito.

We apologise for the inconvenience. If you wish, you can choose another day or time on our website.
```

Piè di pagina: `Prometeo Fine Dining · Matera`
Pulsante (link): `Prenota / Book` → `https://DOMINIO/prenota` (link fisso)

In Gestione, *Rifiuta* fa scegliere tra **Messaggio standard** (questo, parte da solo) e **Scrivo io il messaggio** (testo libero che inizia con “Gentile / Dear Mario Rossi,” e parte solo a mano).

---

## 4. Prenotazione annullata
Nome modello: `prenotazione_annullata_bi_v1` · Categoria: Utility · Lingua: Italiano

```
Gentile / Dear {{1}},

Le confermiamo che la Sua prenotazione è stata annullata.
We confirm that your booking has been cancelled.

Data / Date: {{2}}
Ora / Time: {{3}}
Persone / Guests: {{4}}

Se ha bisogno di aiuto o desidera spostarla a un'altra data, risponda a questo messaggio o ci chiami. Sarà un piacere accoglierLa presto.

If you need help or would like to move it to another date, simply reply to this message or give us a call. We hope to welcome you soon.
```

Piè di pagina: `Prometeo Fine Dining · Matera`
Pulsante (link): `Prenota / Book` → `https://DOMINIO/prenota` (link fisso)

---

## 5. Auguri di compleanno
Nome modello: `auguri_compleanno_bi_v3` · Categoria: **Marketing** · Lingua: Italiano
(`_v1` e `_v2` sono stati ritirati mentre Meta li esaminava: quei nomi non si possono più usare. Il `_v3` scrive nel messaggio tutte le condizioni dell'offerta, giorni compresi.)

Parte solo ai clienti che nel modulo di prenotazione hanno indicato giorno e mese del compleanno **e** spuntato il consenso apposito.

| Variabile | Cosa contiene | Esempio |
|---|---|---|
| `{{1}}` | nome del cliente (solo il nome se quello completo non ci sta) | Mario Rossi |
| `{{2}}` | l'offerta scritta in *Gestione → Promozioni*, italiano / inglese (max 60 caratteri ciascuna) | un calice di benvenuto / a welcome glass of wine |
| `{{3}}` | i giorni validi, in italiano | per il giorno del Suo compleanno, mercoledì 28 ottobre · dal 27 al 30 ottobre · per domenica 1° novembre o martedì 3 novembre · dal 31 ottobre al 4 novembre (nei giorni di apertura) |
| `{{4}}` | telefono principale di *Locale e orari* | +39 391 352 9286 |
| `{{5}}` | i giorni validi, in inglese | on your birthday, Wednesday 28 October · from 27 to 30 October · … |

```
Gentile / Dear {{1}},

tanti auguri di buon compleanno da tutti noi di Prometeo!
Happy birthday from all of us at Prometeo!

Per festeggiare Le riserviamo / Our gift for you: {{2}}

Offerta personale, valida per una sola prenotazione {{3}}, con il pulsante qui sotto o al numero {{4}}, salvo disponibilità e nostra conferma. Il festeggiato mostra al ristorante un documento d'identità con la data di nascita. Non cumulabile con altre promozioni né convertibile in denaro.

Personal offer, valid for one booking {{5}}, via the button below or by phone, subject to availability and our confirmation. ID with date of birth required. Not combinable with other offers or exchangeable for cash.

Per non ricevere più questi messaggi risponda STOP.
Reply STOP to unsubscribe.
```

Piè di pagina: `Prometeo Fine Dining · Matera`
Pulsante (link): `Prenota / Book` → `https://DOMINIO/auguri/{{1}}` — il **link personale** del cliente (codice d'esempio per Meta: `K7M2QX9T`)

Esempio per Meta: Mario Rossi · un calice di benvenuto / a welcome glass of wine · dal 31 ottobre al 4 novembre · +39 391 352 9286 · from 31 October to 4 November

**Perché le condizioni sono tutte nel messaggio** (Codice del Consumo, artt. 20–23: le condizioni di un'offerta vanno date chiare *prima* che il cliente scelga): chi lo riceve sa subito per quali giorni vale, che vale una volta, che la prenotazione va confermata da noi, che serve un documento e che non si somma ad altre promozioni né si cambia in denaro. Le stesse condizioni sono scritte sulla pagina del link prima di prenotare.

**Le condizioni promesse non cambiano.** Offerta e giorni si fissano quando parte il messaggio e restano quelli per quel cliente (sono salvati sul suo link). Se in Gestione si cambia offerta o giorni, vale solo per gli auguri successivi. Se nel frattempo si aggiunge una chiusura straordinaria in uno dei giorni promessi, quel giorno sparisce dal link: conviene avvisare il cliente e proporgli un altro giorno.

**Il link personale** (`/auguri/K7M2QX9T`): si crea con gli auguri; apre la prenotazione con i soli giorni promessi, nome e numero già compilati, l'offerta di compleanno al posto delle promozioni. Le persone si scelgono come sempre, ma è sempre una richiesta che lo staff conferma in Gestione (anche per 1 persona); se il compleanno è un giorno di chiusura la pagina lo spiega. In Gestione la prenotazione compare solo quando il cliente la invia, con l'etichetta “Compleanno”. Si usa una volta; se il cliente annulla o la richiesta viene rifiutata, torna valido fino all'ultimo giorno. Per le telefonate lo staff trova offerta e giorni validi in *Clienti → Compleanni in arrivo*.

Meta chiede per il marketing un modo per smettere di riceverli: la riga STOP. Chi risponde STOP viene tolto in automatico (webhook).

---

## Come farli convalidare

1. ~~Collega il numero in YCloud~~ — fatto: +39 333 744 7469 (Prometeo Fine Dining) risulta collegato.
2. **Fai approvare i testi al cliente**: leggete insieme questo file e correggete quello che non va (le correzioni vanno poi riportate in `src/lib/whatsapp/templates.ts`).
3. **Aggiungi il metodo di pagamento su Meta** (Business Manager → Pagamenti WhatsApp): senza, i messaggi automatici non partono.
4. **Decidi il dominio definitivo** e mettilo in `NEXT_PUBLIC_SITE_URL` in `.env.local` e su Vercel. Il link del pulsante resta fissato da Meta e non si cambia più.
5. ~~Inviali a Meta~~ — fatto: i 4 modelli delle prenotazioni e gli auguri `_v3` (26/10/2026) sono in revisione; webhook con le risposte STOP attivo. Controlla con `npm run whatsapp -- check`.
6. **Aspetta l'approvazione**: di solito entro 24 ore. Controlla con `npm run whatsapp -- check`.
7. **Se Meta ne boccia uno**: in YCloud → Templates leggi il motivo, correggi il testo e rinvia con un nome nuovo (`_bi_v2`). Le cause più comuni sono un testo che sembra promozionale, una variabile attaccata all'inizio o alla fine, o un link che non porta al sito.
8. **Prova**: `npm run whatsapp -- test +39…` manda un messaggio vero, a pagamento.
