export type Service = {
  /** "HH:MM" */
  open: string;
  /** "HH:MM" — closing time of the kitchen/service */
  close: string;
};

export type DayHours = {
  closed: boolean;
  services: Service[];
};

/** Index 0 = Sunday … 6 = Saturday (same as Date.getDay()). */
export type WeekHours = [DayHours, DayHours, DayHours, DayHours, DayHours, DayHours, DayHours];

export type Closure = {
  /** "YYYY-MM-DD" */
  date: string;
  note?: string;
};

export type BookingSettings = {
  enabled: boolean;
  /** minutes between two bookable times */
  slotMinutes: number;
  /** last bookable time = close − this */
  lastBookingBeforeClose: number;
  /**
   * max guests per service (lunch, dinner) of a day, whatever the time:
   * when a booking doesn't fit, the site answers "siamo al completo"
   */
  maxCoversPerService: number;
  /**
   * online bookings up to this many guests are confirmed at once; above, up to
   * the whole service, they are requests for the staff (0 = always the staff)
   */
  autoConfirmUpTo: number;
  /** how far in the future guests can book */
  daysAhead: number;
  /** minimum notice for same-day bookings */
  minNoticeMinutes: number;
  /** send the WhatsApp messages on their own (only when YCloud is configured) */
  whatsappAuto: boolean;
};

export type Settings = {
  name: string;
  subtitle: string;
  /** short slogan under the logo */
  tagline: string;
  /** the big quote on the home page */
  about: string;
  /** paragraph under the quote */
  intro: string;
  /** short line in the footer */
  footerLine: string;
  address: string;
  city: string;
  mapsUrl: string;
  /** partita IVA, shown in the footer */
  vatNumber: string;
  phone: string;
  phone2: string;
  whatsapp: string;
  email: string;
  instagram: string;
  facebook: string;
  rating: { score: string; count: string; source: string; url: string };
  /** short excerpts of real guest reviews, with author and platform */
  reviews: { quote: string; author: string; source: string }[];
  faq: { q: string; a: string }[];
  features: string[];
  hours: WeekHours;
  closures: Closure[];
  booking: BookingSettings;
  announcement: { enabled: boolean; text: string };
  /** discounts on bookings, TheFork-style (Gestione → Promozioni) */
  promotions: Promotion[];
  /** WhatsApp birthday wishes with an offer, to guests who agreed (Gestione → Promozioni) */
  birthday: BirthdaySettings;
};

/**
 * A discount for the bookings of a period: from–to (dates included), on some
 * weekdays, all day or only for arrival times between start and end (included).
 */
export type Promotion = {
  id: string;
  /** e.g. "Autunno a Prometeo" */
  name: string;
  /** 1–90 */
  percent: number;
  /** "YYYY-MM-DD", both included */
  from: string;
  to: string;
  /** 0 = Sunday … 6 = Saturday; empty = every day */
  weekdays: number[];
  allDay: boolean;
  /** "HH:MM", used when !allDay */
  start: string;
  end: string;
  /** shown to the guest before booking, e.g. "Solo menu alla carta, bevande escluse" */
  conditions: string;
  enabled: boolean;
};

/** The discount as it was when the guest booked: kept on the booking even if the promotion changes. */
export type AppliedPromotion = Pick<Promotion, "id" | "name" | "percent" | "conditions">;

export type BirthdaySettings = {
  /** ask for the birthday on the booking form and send the wishes */
  enabled: boolean;
  /** send the wishes this many days before the birthday (0 = on the day) */
  daysBefore: number;
  /**
   * the guest's link books from the birthday − this many days to + this many days
   * (open days only; 0 = the birthday itself, or the nearest open day before and after when closed)
   */
  windowDays: number;
  /** the offer, in Italian and English: fills the approved WhatsApp template */
  offerIt: string;
  offerEn: string;
};

/**
 * A guest who agreed to receive the birthday wishes, one per phone number.
 * Kept apart from the bookings: deleting bookings doesn't remove it, and a
 * "STOP" or the staff (Clienti) does.
 */
export type BirthdayContact = {
  /** phoneKey() of the number */
  phone_key: string;
  phone: string;
  name: string;
  /** "MM-DD": only day and month, never the year */
  birthday: string;
  /** the exact consent text the guest ticked, and when (renewed at every booking with the box ticked) */
  consent_text: string;
  consent_at: string;
  /** the birthday ("YYYY-MM-DD") the last wishes were for: never twice the same year */
  last_sent_for: string | null;
  last_error: string | null;
  /**
   * the guest's own booking link of this year's wishes, /auguri/<invite_code>: created
   * when the wishes are due, for the birthday `invite_for`; nothing appears in Gestione
   * until the guest books with it (`invite_booking_id`). Missing until the 2026-10-26 migration.
   */
  invite_code?: string | null;
  invite_for?: string | null;
  invite_booking_id?: string | null;
  /**
   * what the wishes promised, fixed when the link is created: changing the offer or the
   * days in Gestione later applies only to the next wishes, never to a promise already made
   */
  invite_terms?: BirthdayTerms | null;
};

/** The birthday offer as promised to one guest: the days its link books and the offer. */
export type BirthdayTerms = { dates: string[]; offerIt: string; offerEn: string };

/** Languages the menu can be translated into (Italian is the original). */
export type MenuLang = "en";
/**
 * A translation and the Italian it was made from (`src`, see lib/menu-i18n):
 * when the Italian changes the translation is flagged "da rivedere".
 */
export type Translated<T> = T & { src: string };
export type CategoryText = { name: string; description: string };
export type DishText = { name: string; description: string; price_note: string };

export type Category = {
  id: string;
  name: string;
  description: string;
  position: number;
  visible: boolean;
  tr: Partial<Record<MenuLang, Translated<CategoryText>>>;
};

export type Dish = {
  id: string;
  category_id: string;
  name: string;
  description: string;
  /** euro, null = no price shown */
  price: number | null;
  /** e.g. "minimo 2 persone" */
  price_note: string;
  image_url: string;
  tags: string[];
  /** EU allergen ids, see lib/allergens */
  allergens: number[];
  visible: boolean;
  /** temporarily sold out: shown greyed out */
  available: boolean;
  position: number;
  tr: Partial<Record<MenuLang, Translated<DishText>>>;
};

export type MenuData = {
  categories: Category[];
  dishes: Dish[];
};

/**
 * pending   → request from the site (or changed by the guest), waiting for the staff
 * confirmed → accepted by the staff (or taken by phone)
 * declined  → refused by the staff
 * cancelled → cancelled by the guest or by the staff
 */
export type BookingStatus = "pending" | "confirmed" | "declined" | "cancelled";

export type Booking = {
  id: string;
  created_at: string;
  /** "YYYY-MM-DD" */
  date: string;
  /** "HH:MM" */
  time: string;
  people: number;
  name: string;
  phone: string;
  email: string;
  notes: string;
  status: BookingStatus;
  source: "web" | "admin";
  /** secret for the guest's private page (/prenotazione/<token>) */
  manage_token: string;
  /**
   * short link of the same page, the one sent to the guest: /p/<short_code>
   * (missing only on a database where the 2026-10-18 migration hasn't run yet)
   */
  short_code?: string;
  /**
   * what the guest changed on their own, until the staff answers: the values from before the
   * first change and when the last one happened (missing until the 2026-10-19 migration has run)
   */
  guest_change?: GuestChange | null;
  /** discount of the promotion valid when booked (missing until the 2026-10-25 migration has run) */
  promotion?: AppliedPromotion | null;
  /**
   * booked with the birthday link: the offer promised in the wishes (Italian text), to be
   * given after checking an ID; promotions don't apply. Null for other bookings.
   */
  birthday_offer?: string | null;
};

export type NewBooking = Omit<Booking, "id" | "created_at" | "manage_token" | "short_code" | "guest_change">;

/** What a guest can change on their own booking (the discount follows the new date and time). */
export type BookingChange = BookingDetails & { promotion: AppliedPromotion | null };

/** The details a guest chooses, as shown before and after a change. */
export type BookingDetails = Pick<Booking, "date" | "time" | "people" | "notes">;

export type GuestChange = { at: string; before: BookingDetails };

/** Status of an online booking: confirmed at once (small party) or a request for the staff. */
export type OnlineStatus = Extract<BookingStatus, "pending" | "confirmed">;

/** Automatic WhatsApp messages to guests (approved Meta templates, sent through YCloud). */
export type WhatsappKind = "requested" | "confirmed" | "declined" | "cancelled";

/** accepted → sent → delivered → read, or failed at any point. */
export type WhatsappStatus = "accepted" | "sent" | "delivered" | "read" | "failed";

export type WhatsappMessage = {
  /** our id, also sent to YCloud as externalId */
  id: string;
  booking_id: string;
  kind: WhatsappKind;
  /** YCloud message id */
  provider_id: string | null;
  status: WhatsappStatus;
  error: string | null;
  created_at: string;
  updated_at: string;
};

/** Notification groups a device can turn on or off. */
export type NotifyPrefs = {
  /** new requests from the site */
  requests: boolean;
  /** a guest changed date, time or guests */
  changes: boolean;
  /** a guest cancelled */
  cancellations: boolean;
  /** what colleagues did on other devices (accepted, refused, phone bookings) */
  staff: boolean;
};

/** A phone or computer subscribed to the staff app's push notifications. */
export type PushDevice = {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  /** "iPhone", "Android", "Windows · Chrome"… */
  label: string;
  prefs: NotifyPrefs;
  created_at: string;
  last_used_at: string;
};

/**
 * Where an error happened: Next.js server (page render, API route, admin action,
 * proxy), the visitor's browser, or an error the app caught and handled itself.
 */
export type ErrorSource = "render" | "route" | "action" | "proxy" | "browser" | "handled";

/** One entry of the error log (Gestione → Log errori). */
export type ErrorLog = {
  id: string;
  created_at: string;
  source: ErrorSource;
  message: string;
  stack: string;
  /** page or API path, e.g. /prenota */
  path: string;
  /** extra details: route, method, browser, what the app was doing… */
  context: Record<string, unknown>;
};
