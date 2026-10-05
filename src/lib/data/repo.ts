import type { Booking, BookingStatus, Category, Dish, MenuData, NewBooking, Settings } from "../types";

export class SlotFullError extends Error {
  constructor() {
    super("SLOT_FULL");
  }
}

/**
 * Storage backend. Two implementations:
 * - supabase: production (Vercel), used when the Supabase env vars are set
 * - local:    a JSON file in /data, for development and demos without a database
 */
export interface Repo {
  readonly kind: "supabase" | "local";

  getSettings(): Promise<Settings>;
  saveSettings(s: Settings): Promise<void>;

  getMenu(opts?: { includeHidden?: boolean }): Promise<MenuData>;
  upsertCategory(c: Category): Promise<void>;
  deleteCategory(id: string): Promise<void>;
  reorderCategories(ids: string[]): Promise<void>;
  upsertDish(d: Dish): Promise<void>;
  deleteDish(id: string): Promise<void>;
  reorderDishes(ids: string[]): Promise<void>;

  listBookings(from: string, to: string): Promise<Booking[]>;
  /** guests already booked per time on a date (cancelled excluded) */
  coversByTime(date: string): Promise<Record<string, number>>;
  /** atomically checks capacity and inserts; throws SlotFullError */
  createBooking(b: NewBooking, maxCovers: number | null): Promise<Booking>;
  setBookingStatus(id: string, status: BookingStatus): Promise<void>;
  deleteBooking(id: string): Promise<void>;
  countBookingsByPhone(phone: string, sinceIso: string): Promise<number>;

  /** stores an image and returns its public URL */
  uploadImage(bytes: ArrayBuffer, contentType: string, ext: string): Promise<string>;
  deleteImage(url: string): Promise<void>;
}
