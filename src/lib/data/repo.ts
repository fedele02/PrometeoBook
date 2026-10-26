import type { BirthdayContact, Booking, BookingChange, BookingStatus, Category, Dish, ErrorLog, MenuData, NewBooking, OnlineStatus, PushDevice, Settings, WhatsappMessage, WhatsappStatus } from "../types";

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
  getBooking(id: string): Promise<Booking | null>;
  getBookingByToken(token: string): Promise<Booking | null>;
  /** by the short code of the guest's link (/p/<code>), already normalized */
  getBookingByCode(code: string): Promise<Booking | null>;
  /** guests already booked per time on a date (only pending and confirmed hold seats) */
  coversByTime(date: string, ignoreId?: string): Promise<Record<string, number>>;
  /**
   * Atomically checks that the booking fits in its service (lunch or dinner of
   * that day: max guests per service, null = no limit) and inserts; throws SlotFullError.
   */
  createBooking(b: NewBooking, maxCovers: number | null): Promise<Booking>;
  /**
   * A guest changes their booking: atomically checks the new service (ignoring the
   * booking's own seats), saves it with the given status. Throws SlotFullError.
   */
  changeBooking(id: string, change: BookingChange, status: OnlineStatus, maxCovers: number): Promise<Booking>;
  setBookingStatus(id: string, status: BookingStatus): Promise<void>;
  deleteBooking(id: string): Promise<void>;
  countBookingsByPhone(phone: string, sinceIso: string): Promise<number>;

  /** devices subscribed to the staff app's notifications */
  listDevices(): Promise<PushDevice[]>;
  /** insert or update by id (an endpoint belongs to one device only) */
  saveDevice(d: PushDevice): Promise<void>;
  deleteDevice(id: string): Promise<void>;

  /** automatic WhatsApp messages to guests */
  saveWhatsappMessage(m: WhatsappMessage): Promise<void>;
  getWhatsappMessage(match: { id: string } | { providerId: string }): Promise<WhatsappMessage | null>;
  /** find by our id or by YCloud's id; returns the updated row (null if unknown) */
  updateWhatsappMessage(
    match: { id: string } | { providerId: string },
    patch: { status: WhatsappStatus; error?: string | null; provider_id?: string | null },
  ): Promise<WhatsappMessage | null>;
  listWhatsappMessages(bookingIds: string[]): Promise<WhatsappMessage[]>;

  /** guests who agreed to the birthday wishes, one per phone number */
  listBirthdays(): Promise<BirthdayContact[]>;
  /** insert or replace by phone_key */
  saveBirthday(c: BirthdayContact): Promise<void>;
  /** by the code of the guest's birthday link (/auguri/<code>), already normalized */
  getBirthdayByInvite(code: string): Promise<BirthdayContact | null>;
  updateBirthday(
    phoneKey: string,
    patch: Partial<Pick<BirthdayContact, "last_sent_for" | "last_error" | "invite_code" | "invite_for" | "invite_booking_id" | "invite_terms">>,
  ): Promise<void>;
  deleteBirthday(phoneKey: string): Promise<void>;
  /** consents older than the date (not renewed by a later booking) */
  deleteBirthdaysBefore(iso: string): Promise<void>;

  /** error log (Gestione → Log errori), newest first */
  saveErrorLog(e: ErrorLog): Promise<void>;
  listErrorLogs(limit: number): Promise<ErrorLog[]>;
  /** removes the entries older than the date, or all of them without one */
  clearErrorLogs(beforeIso?: string): Promise<void>;

  /** stores an image and returns its public URL */
  uploadImage(bytes: ArrayBuffer, contentType: string, ext: string): Promise<string>;
  deleteImage(url: string): Promise<void>;
}
