import { z } from "zod";

// validation messages in Italian for the admin panel
z.config(z.locales.it());

const hhmm = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Orario non valido (HH:MM)");
const ymd = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const text = (max: number) => z.string().trim().max(max);
const url = z.union([z.literal(""), z.url("Link non valido")]);

const day = z.object({
  closed: z.boolean(),
  services: z.array(z.object({ open: hhmm, close: hhmm })).max(4),
});

export const settingsSchema = z.object({
  name: text(60).min(1),
  subtitle: text(60),
  tagline: text(200),
  about: text(400),
  intro: text(1200),
  footerLine: text(120),
  address: text(120).min(1),
  city: text(120),
  mapsUrl: url,
  vatNumber: text(20),
  phone: text(30),
  phone2: text(30),
  whatsapp: text(30),
  email: z.union([z.literal(""), z.email("Email non valida")]),
  instagram: url,
  facebook: url,
  rating: z.object({ score: text(8), count: text(12), source: text(40), url }),
  reviews: z.array(z.object({ quote: text(300).min(1), author: text(60).min(1), source: text(40) })).max(12),
  faq: z.array(z.object({ q: text(200).min(1), a: text(800).min(1) })).max(20),
  features: z.array(text(60).min(1)).max(12),
  hours: z.tuple([day, day, day, day, day, day, day]),
  closures: z.array(z.object({ date: ymd, note: text(120).optional() })).max(200),
  booking: z.object({
    enabled: z.boolean(),
    slotMinutes: z.number().int().min(10).max(120),
    lastBookingBeforeClose: z.number().int().min(0).max(240),
    maxCoversPerService: z.number().int().min(1).max(1000),
    autoConfirmUpTo: z.number().int().min(0).max(1000),
    daysAhead: z.number().int().min(1).max(365),
    minNoticeMinutes: z.number().int().min(0).max(1440),
    whatsappAuto: z.boolean(),
  }),
  announcement: z.object({ enabled: z.boolean(), text: text(200) }),
  promotions: z.array(z.lazy(() => promotionSchema)).max(50),
  birthday: z.lazy(() => birthdaySchema),
});

export const promotionSchema = z
  .object({
    id: z.string().min(1).max(64),
    name: text(60).min(1, "Dai un nome alla promozione"),
    percent: z.number().int().min(1, "Lo sconto va da 1 a 90%").max(90, "Lo sconto va da 1 a 90%"),
    from: ymd,
    to: ymd,
    weekdays: z.array(z.number().int().min(0).max(6)).max(7),
    allDay: z.boolean(),
    start: hhmm,
    end: hhmm,
    conditions: text(300),
    enabled: z.boolean(),
  })
  .refine((p) => p.from <= p.to, { message: "Il primo giorno viene dopo l'ultimo", path: ["from"] })
  .refine((p) => p.allDay || p.start <= p.end, { message: "L'ora di inizio viene dopo quella di fine", path: ["start"] });

export const birthdaySchema = z.object({
  enabled: z.boolean(),
  daysBefore: z.number().int().min(0).max(30),
  windowDays: z.number().int().min(0).max(14),
  // together they are one template parameter: one line, cut at 300 characters (cleanParam)
  // 60 each: the filled WhatsApp message must stay within Meta's 1024 characters
  offerIt: text(60),
  offerEn: text(60),
});

// same limits as the Italian fields
const src = z.string().max(16);
export const categoryTextSchema = z.object({ name: text(60), description: text(200) });
export const dishTextSchema = z.object({ name: text(120), description: text(600), price_note: text(80) });

export const categorySchema = z.object({
  id: z.string().min(1).max(64),
  name: text(60).min(1, "Il nome è obbligatorio"),
  description: text(200),
  position: z.number().int(),
  visible: z.boolean(),
  tr: z.object({ en: categoryTextSchema.extend({ src }).optional() }).default({}),
});

export const dishSchema = z.object({
  id: z.string().min(1).max(64),
  category_id: z.string().min(1),
  name: text(120).min(1, "Il nome è obbligatorio"),
  description: text(600),
  price: z.number().min(0).max(10000).nullable(),
  price_note: text(80),
  image_url: z.string().max(500),
  tags: z.array(z.string().max(30)).max(10),
  allergens: z.array(z.number().int().min(1).max(14)).max(14),
  visible: z.boolean(),
  available: z.boolean(),
  position: z.number().int(),
  tr: z.object({ en: dishTextSchema.extend({ src }).optional() }).default({}),
});

export const adminBookingSchema = z.object({
  date: ymd,
  time: hhmm,
  people: z.number().int().min(1).max(1000),
  name: text(80).min(2, "Inserisci il nome"),
  phone: text(25).min(6, "Inserisci il telefono"),
  notes: text(500),
  /** send the WhatsApp confirmation (when the automatic messages are on) */
  sendWhatsapp: z.boolean().default(false),
});

const FIELD_NAMES: Record<string, string> = {
  name: "Nome",
  phone: "Telefono",
  phone2: "Secondo telefono",
  email: "Email",
  address: "Indirizzo",
  city: "Città",
  mapsUrl: "Link Google Maps",
  vatNumber: "Partita IVA",
  instagram: "Instagram",
  facebook: "Facebook",
  tagline: "Motto",
  about: "Frase in homepage",
  intro: "Presentazione",
  footerLine: "Frase del footer",
  features: "Punti di forza",
  hours: "Orari",
  closures: "Chiusure",
  booking: "Prenotazioni",
  announcement: "Avviso",
  promotions: "Promozioni",
  birthday: "Compleanni",
  percent: "Sconto",
  from: "Dal giorno",
  to: "Al giorno",
  start: "Dalle ore",
  end: "Alle ore",
  conditions: "Condizioni",
  offerIt: "Offerta (italiano)",
  offerEn: "Offerta (inglese)",
  daysBefore: "Giorni prima",
  windowDays: "Giorni intorno al compleanno",
  rating: "Voto",
  reviews: "Recensioni",
  faq: "Domande frequenti",
  description: "Descrizione",
  price: "Prezzo",
  price_note: "Nota prezzo",
  date: "Data",
  time: "Ora",
  people: "Persone",
  notes: "Note",
};

/** First message of a zod error, with the field name in Italian. */
export const firstError = (e: z.ZodError) => {
  const i = e.issues[0];
  const field = i.path.length ? (FIELD_NAMES[String(i.path[0])] ?? String(i.path[0])) : "";
  return field ? `${field}: ${i.message}` : i.message;
};
