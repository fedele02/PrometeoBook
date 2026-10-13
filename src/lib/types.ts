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
};

export type Category = {
  id: string;
  name: string;
  description: string;
  position: number;
  visible: boolean;
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
};

export type NewBooking = Omit<Booking, "id" | "created_at" | "manage_token" | "short_code">;

/** What a guest can change on their own booking. */
export type BookingChange = Pick<Booking, "date" | "time" | "people" | "notes">;

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
