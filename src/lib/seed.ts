import type { Category, Dish, Settings } from "./types";

/*
 * Initial content, taken only from the restaurant's own material:
 *  - printed menu "Antipasti" (photo on TheFork): names and prices
 *  - TheFork listing: primi and prices, rating, services
 *  - Facebook page: contacts, slogans, dish descriptions of the posts
 * Opening hours are NOT published anywhere: the ones below are placeholders
 * to be confirmed from the admin panel. Allergens are left empty on purpose:
 * they must be filled in by the kitchen, never guessed.
 */

const lunchDinner = {
  closed: false,
  services: [
    { open: "12:30", close: "15:00" },
    { open: "19:30", close: "23:00" },
  ],
};

export const seedSettings: Settings = {
  name: "Prometeo",
  subtitle: "Fine Dining",
  // from the printed menu
  tagline: "Tradizione rubata alla fiamma. Eccellenza servita al palato.",
  about: "Prometeo donò il fuoco agli uomini, noi abbiamo donato loro il gusto.",
  intro:
    "Cucina tradizionale rivisitata nel cuore di Matera. Lasciati guidare alla scoperta della nostra selezione d'eccellenza e delle tradizioni locali.",
  footerLine: "Ti aspettiamo sotto la nostra luna.",
  address: "Via Michele Torraca, 10",
  city: "75100 Matera",
  mapsUrl: "https://maps.google.com/?q=Prometeo+Fine+Dining+Via+Michele+Torraca+10+Matera",
  phone: "+39 391 352 9286",
  phone2: "+39 333 744 7469",
  whatsapp: "",
  email: "prometeofinedining@gmail.com",
  instagram: "",
  facebook: "https://www.facebook.com/people/Prometeo-Fine-Dining/61572345512137/",
  rating: {
    score: "9,8",
    count: "392",
    source: "TheFork",
    url: "https://www.thefork.it/ristorante/prometeo-fine-dining-r860721",
  },
  // excerpts of public Tripadvisor reviews (Jun–Sep 2026): verify and keep up to date from the admin
  reviews: [
    {
      quote: "Qualità del servizio, qualità delle materie prime, qualità della tecnica.",
      author: "Annalisa P.",
      source: "Tripadvisor",
    },
    {
      quote: "Un'esperienza di cucina locale rivisitata in chiave contemporanea.",
      author: "Cosimo L.",
      source: "Tripadvisor",
    },
    {
      quote: "Per la terza volta siamo tornati in questo ristorante e, ancora una volta, ne siamo usciti pienamente soddisfatti!",
      author: "Rossana R.",
      source: "Tripadvisor",
    },
  ],
  faq: [
    {
      q: "Come posso prenotare?",
      a: "Online, in pochi secondi, dalla pagina Prenota: scegli persone, giorno e orario. Oppure chiamaci.",
    },
    {
      q: "Siamo un gruppo numeroso, possiamo prenotare?",
      a: "Online puoi prenotare fino a 10 persone. Per gruppi più numerosi chiamaci: organizziamo insieme la serata.",
    },
    {
      q: "Come segnalo allergie o intolleranze?",
      a: "Scrivile nelle richieste particolari quando prenoti, oppure dillo al personale di sala: ti indicheremo gli allergeni di ogni piatto.",
    },
    { q: "Ci sono opzioni vegetariane?", a: "Sì, nel menu ci sono piatti vegetariani: chiedi al personale per un consiglio." },
    { q: "Avete tavoli all'aperto?", a: "Sì, nella bella stagione ci sono tavoli all'aperto su via Michele Torraca." },
    { q: "Posso venire con il mio cane?", a: "Sì, i cani sono i benvenuti." },
  ],
  features: ["Ingredienti a km 0", "Tavoli all'aperto", "Opzioni vegetariane", "Cani ammessi"],
  hours: [
    lunchDinner, // domenica
    { closed: true, services: [] }, // lunedì
    lunchDinner,
    lunchDinner,
    lunchDinner,
    lunchDinner,
    lunchDinner,
  ],
  closures: [],
  booking: {
    enabled: true,
    slotMinutes: 30,
    lastBookingBeforeClose: 60,
    maxCoversPerSlot: 16,
    maxPartySize: 10,
    daysAhead: 60,
    minNoticeMinutes: 60,
  },
  announcement: { enabled: false, text: "" },
};

export const seedCategories: Category[] = [
  { id: "cat-antipasti", name: "Antipasti", description: "", position: 0, visible: true },
  { id: "cat-primi", name: "Primi", description: "", position: 1, visible: true },
  { id: "cat-secondi", name: "Secondi", description: "", position: 2, visible: true },
  { id: "cat-dolci", name: "Dolci", description: "", position: 3, visible: true },
];

let pos = 0;
const dish = (d: Partial<Dish> & Pick<Dish, "id" | "category_id" | "name">): Dish => ({
  description: "",
  price: null,
  price_note: "",
  image_url: "",
  tags: [],
  allergens: [],
  visible: true,
  available: true,
  position: pos++,
  ...d,
});

export const seedDishes: Dish[] = [
  // ---- Antipasti: menu cartaceo ----
  dish({
    id: "d-percorso",
    category_id: "cat-antipasti",
    name: "Percorso Prometeo",
    description: "Degustazione di antipasti locali in 8 portate.",
    price: 19,
    price_note: "minimo per 2 persone",
    tags: ["signature"],
  }),
  dish({ id: "d-tagliere", category_id: "cat-antipasti", name: "Tagliere di salumi e formaggi", price: 20 }),
  dish({
    id: "d-baccala-insalata",
    category_id: "cat-antipasti",
    name: "Insalata di baccalà",
    description: "Con mela verde, capperi e cipolla croccante.",
    price: 14,
  }),
  dish({
    id: "d-uovo",
    category_id: "cat-antipasti",
    name: "Uovo cotto a bassa temperatura",
    description: "Con fonduta di grana e scaglie di tartufo.",
    price: 15,
  }),
  dish({
    id: "d-burrata",
    category_id: "cat-antipasti",
    name: "Burrata",
    description: "Con pomodoro camone, datterino giallo, rosso e verde.",
    price: 10,
  }),
  dish({
    id: "d-calamari",
    category_id: "cat-antipasti",
    name: "Calamari grigliati",
    description: "Con emulsione di prezzemolo.",
    price: 15,
  }),
  dish({
    id: "d-frittura",
    category_id: "cat-antipasti",
    name: "Frittura di polpo e calamari",
    description: "Con mayo di polpo.",
    price: 18,
  }),
  dish({ id: "d-parmigiana", category_id: "cat-antipasti", name: "Parmigiana", price: 10 }),
  dish({ id: "d-baccala-fritto", category_id: "cat-antipasti", name: "Baccalà fritto", price: 12, price_note: "5 pezzi" }),
  // dai post Facebook
  dish({
    id: "d-cuore-baccala",
    category_id: "cat-antipasti",
    name: "Cuore di baccalà",
    description:
      "Cotto a bassa temperatura per una consistenza delicata. Le gocce di crema al peperone crusco donano equilibrio e una nota dolce.",
    tags: ["signature"],
  }),
  dish({
    id: "d-polpo",
    category_id: "cat-antipasti",
    name: "Polpo rosticciato",
    description: "Con purea di patate al peperone crusco.",
    image_url: "/img/piatto-polpo-1600.webp",
  }),

  // ---- Primi: TheFork + Facebook ----
  dish({
    id: "d-orecchiette",
    category_id: "cat-primi",
    name: "Orecchiette alle cime di rapa “a modo nostro”",
    description:
      "Un gusto deciso e leggermente amarognolo che racconta la cucina autentica e contadina: il profumo della Lucania.",
    price: 14,
    image_url: "/img/piatto-cime-1600.webp",
    tags: ["signature"],
  }),
  dish({ id: "d-carbonara", category_id: "cat-primi", name: "Carbonara lucana", price: 14 }),
  dish({ id: "d-fusillone", category_id: "cat-primi", name: "Fusillone all'Aglianico", price: 14 }),
  dish({
    id: "d-tagliatelle",
    category_id: "cat-primi",
    name: "Tagliatelle con bisque di crostacei",
    description: "Tartare di mazzancolle e tartufo: la bisque avvolge la pasta con un gusto intenso e ricco di profondità.",
    tags: ["signature"],
  }),
  dish({
    id: "d-capuntini",
    category_id: "cat-primi",
    name: "Capuntini con vellutata di piselli",
    description: "Fonduta di Grana e guanciale croccante: un equilibrio di consistenze.",
  }),

  // ---- Secondi: Facebook ----
  dish({
    id: "d-tonno",
    category_id: "cat-secondi",
    name: "Scottatino di tonno",
    description:
      "Tonno in doppia consistenza, crema di zucchine e zucchine croccanti: un piatto equilibrato, morbido e ricco di gusto.",
    image_url: "/img/piatto-tonno-1600.webp",
    tags: ["signature"],
  }),
  dish({
    id: "d-filetto",
    category_id: "cat-secondi",
    name: "Filetto di suino nero lucano",
    description: "Cotto a bassa temperatura e accompagnato da una salsa ai sette pepi.",
    image_url: "/img/piatto-filetto-1600.webp",
  }),

  // ---- Dolci: Facebook ----
  dish({
    id: "d-cannolo",
    category_id: "cat-dolci",
    name: "Cannolo scomposto",
    description:
      "La cremosità della ricotta, le gocce di cioccolato fondente e la croccantezza della cialda: un grande classico reinterpretato.",
    image_url: "/img/piatto-cannolo-1600.webp",
    tags: ["signature"],
  }),
  dish({
    id: "d-sporcamuss",
    category_id: "cat-dolci",
    name: "Sporcamuss",
    description: "Sfoglia fragrante e crema chantilly: la dolcezza della tradizione pugliese.",
    image_url: "/img/piatto-sporcamuss-1600.webp",
  }),
];
