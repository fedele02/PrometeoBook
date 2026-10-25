# Messaggi WhatsApp da far approvare a Meta

Bozza **da approvare col cliente** prima dell'invio. Ogni messaggio è in italiano e in inglese.
Le parti tra doppie graffe `{{1}}`, `{{2}}`… sono i dati che cambiano a ogni prenotazione.
Una volta approvato, un testo non si può più modificare: se serve cambiarlo si crea un modello nuovo.

## Che cosa finisce al posto delle variabili

| Variabile | Cosa contiene | Esempio |
|---|---|---|
| nome | nome del cliente | Mario |
| persone | numero di persone, solo la cifra | 4 |
| giorno | giorno in italiano e in inglese | sabato 18 ottobre / Saturday 18 October |
| ora | orario | 21:00 |
| indirizzo | indirizzo del ristorante | Via Michele Torraca 10, Matera |
| motivo | motivo del rifiuto, già scritto nelle due lingue | siamo al completo a quell'ora / we are fully booked at that time |

Nei modelli le variabili sono numerate nell'ordine in cui compaiono.
Il link non sta nel testo: è il **pulsante** sotto il messaggio.

---

## 1. Richiesta ricevuta
Nome modello: `prenotazione_ricevuta_bi_v1` · Categoria: Utility · Lingua: Italiano

**Testo**

```
Ciao {{1}}, abbiamo ricevuto la tua richiesta per {{2}} persone, {{3}} alle {{4}}.
La prenotazione sarà valida solo dopo la nostra conferma: stiamo controllando la disponibilità e ti rispondiamo qui su WhatsApp.

Hi {{1}}, we have received your request for {{2}} guests, {{3}} at {{4}}.
Your booking is only valid once we confirm it: we are checking availability and will reply to you here on WhatsApp.
```

Piè di pagina: `Prometeo Fine Dining · Matera`
Pulsante (link): `Gestisci / Manage` → `https://DOMINIO/p/{{1}}`

Esempi per Meta: Mario · 4 · sabato 18 ottobre / Saturday 18 October · 21:00
Codice per il pulsante: `K7M2QX9T`

---

## 2. Prenotazione confermata
Nome modello: `prenotazione_confermata_bi_v1` · Categoria: Utility · Lingua: Italiano

**Testo**

```
Ciao {{1}}, la tua prenotazione è confermata: {{2}} persone, {{3}} alle {{4}}.
Ti aspettiamo in {{5}}. Se devi cambiarla o annullarla usa il pulsante qui sotto.

Hi {{1}}, your booking is confirmed: {{2}} guests, {{3}} at {{4}}.
We look forward to seeing you at {{5}}. To change or cancel it, use the button below.
```

Piè di pagina: `Prometeo Fine Dining · Matera`
Pulsante (link): `Gestisci / Manage` → `https://DOMINIO/p/{{1}}`

Esempi per Meta: Mario · 4 · sabato 18 ottobre / Saturday 18 October · 21:00 · Via Michele Torraca 10, Matera
Codice per il pulsante: `K7M2QX9T`

---

## 3. Richiesta non accettata
Nome modello: `prenotazione_non_accettata_bi_v1` · Categoria: Utility · Lingua: Italiano

**Testo**

```
Ciao {{1}}, purtroppo non riusciamo ad accettare la tua richiesta per {{2}} persone, {{3}} alle {{4}}: {{5}}.
Se vuoi, puoi scegliere un altro giorno o un altro orario dal nostro sito.

Hi {{1}}, unfortunately we cannot accept your request for {{2}} guests, {{3}} at {{4}}: {{5}}.
If you like, you can pick another day or time on our website.
```

Piè di pagina: `Prometeo Fine Dining · Matera`
Pulsante (link): `Prenota / Book` → `https://DOMINIO/prenota` (link fisso, senza variabile)

Esempi per Meta: Mario · 4 · sabato 18 ottobre / Saturday 18 October · 21:00 · siamo al completo a quell'ora / we are fully booked at that time

Motivi che il sistema sa scrivere nelle due lingue (da approvare):
- siamo al completo a quell'ora / we are fully booked at that time
- il locale è chiuso quel giorno / we are closed that day
- per un gruppo così numeroso non riusciamo a garantire il servizio / we cannot guarantee service for a group this size

---

## 4. Prenotazione annullata
Nome modello: `prenotazione_annullata_bi_v1` · Categoria: Utility · Lingua: Italiano

**Testo**

```
Ciao {{1}}, la tua prenotazione per {{2}} persone, {{3}} alle {{4}}, è stata annullata.
Se ti serve aiuto o vuoi spostarla, rispondi a questo messaggio o chiamaci. Ci farebbe piacere rivederti presto.

Hi {{1}}, your booking for {{2}} guests, {{3}} at {{4}}, has been cancelled.
If you need help or would like to move it, reply to this message or give us a call. We hope to see you soon.
```

Piè di pagina: `Prometeo Fine Dining · Matera`
Pulsante (link): `Prenota / Book` → `https://DOMINIO/prenota` (link fisso, senza variabile)

Esempi per Meta: Mario · 4 · sabato 18 ottobre / Saturday 18 October · 21:00

---

## Come farli convalidare

1. **Collega il numero in YCloud** (oggi il controllo dice che non è ancora collegato). In YCloud scegli *WhatsApp Business App coexistence* e conferma dal telefono con il QR code.
2. **Fai approvare i testi al cliente**: leggete insieme questo file e correggete quello che non va.
3. **Decidi il dominio definitivo** e mettilo in `NEXT_PUBLIC_SITE_URL` in `.env.local`. Il link del pulsante resta fissato da Meta e non si cambia più.
4. **Inviali a Meta** con `npm run whatsapp -- templates`. Lo faccio io dopo aver aggiornato `src/lib/whatsapp/templates.ts` con questi testi.
5. **Aspetta l'approvazione**: di solito entro 24 ore. Controlla con `npm run whatsapp -- check`.
6. **Se Meta ne boccia uno**: in YCloud → Templates leggi il motivo, correggi il testo e rinvia con un nome nuovo (`_v2`). Le cause più comuni sono un testo che sembra promozionale, una variabile attaccata all'inizio o alla fine, o un link che non porta al sito.
7. **Prova**: `npm run whatsapp -- test +39…` manda un messaggio vero, a pagamento.
