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
  /** max guests that can be booked for the same time */
  maxCoversPerSlot: number;
  /** above this the guest is asked to call */
  maxPartySize: number;
  /** how far in the future guests can book */
  daysAhead: number;
  /** minimum notice for same-day bookings */
  minNoticeMinutes: number;
  /** if false bookings arrive as "da confermare" */
  autoConfirm: boolean;
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

export type BookingStatus = "pending" | "confirmed" | "cancelled";

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
};

export type NewBooking = Omit<Booking, "id" | "created_at">;
