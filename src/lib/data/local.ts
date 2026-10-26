import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { seedCategories, seedDishes, seedSettings } from "../seed";
import { isActive } from "../customers";
import { serviceLabel } from "../time";
import { newShortCode, SHORT_CODE_ALPHABET, SHORT_CODE_LENGTH } from "../short-code";
import type { BirthdayContact, Booking, Category, Dish, ErrorLog, PushDevice, Settings, WhatsappMessage } from "../types";
import { SlotFullError, type Repo } from "./repo";

type Db = { settings: Settings; categories: Category[]; dishes: Dish[]; bookings: Booking[]; devices: PushDevice[]; whatsapp: WhatsappMessage[]; errors: ErrorLog[]; birthdays: BirthdayContact[] };

const codeFromToken = (token: string) => {
  const hex = token.replace(/-/g, "");
  return Array.from({ length: SHORT_CODE_LENGTH }, (_, i) => SHORT_CODE_ALPHABET[parseInt(hex.slice(i * 2, i * 2 + 2), 16) % 32]).join("");
};

const DB_FILE = path.join(process.cwd(), "data", "local-db.json");
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

// Serialize every read-modify-write so concurrent requests can't lose data.
let queue: Promise<unknown> = Promise.resolve();
function locked<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(fn, fn);
  queue = run.catch(() => {});
  return run;
}

async function read(): Promise<Db> {
  try {
    const db = JSON.parse(await fs.readFile(DB_FILE, "utf8")) as Db;
    // settings added in later versions get their defaults
    db.settings = { ...seedSettings, ...db.settings, booking: { ...seedSettings.booking, ...db.settings.booking }, birthday: { ...seedSettings.birthday, ...db.settings.birthday } };
    db.devices ??= [];
    db.whatsapp ??= [];
    db.errors ??= [];
    db.birthdays ??= [];
    // bookings saved before guests could manage them get their private link
    for (const b of db.bookings) {
      b.manage_token ??= randomUUID();
      // derived from the token, so the same booking always gets the same code
      b.short_code ??= codeFromToken(b.manage_token);
    }
    return db;
  } catch {
    return {
      settings: structuredClone(seedSettings),
      categories: structuredClone(seedCategories),
      dishes: structuredClone(seedDishes),
      bookings: [],
      devices: [],
      whatsapp: [],
      errors: [],
      birthdays: [],
    };
  }
}

async function write(db: Db) {
  await fs.mkdir(path.dirname(DB_FILE), { recursive: true });
  const tmp = `${DB_FILE}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(db, null, 2));
  await fs.rename(tmp, DB_FILE);
}

const mutate = (fn: (db: Db) => void | Promise<void>) =>
  locked(async () => {
    const db = await read();
    await fn(db);
    await write(db);
  });

/** guests holding seats in the service (lunch or dinner) of a date and time */
const taken = (db: Db, date: string, time: string, ignoreId?: string) =>
  db.bookings
    .filter((b) => b.date === date && serviceLabel(b.time) === serviceLabel(time) && isActive(b) && b.id !== ignoreId)
    .reduce((n, b) => n + b.people, 0);

const byPos = <T extends { position: number }>(a: T, b: T) => a.position - b.position;

export const localRepo: Repo = {
  kind: "local",

  getSettings: async () => (await read()).settings,
  saveSettings: (s) => mutate((db) => void (db.settings = s)),

  async getMenu(opts) {
    const db = await read();
    const all = opts?.includeHidden;
    const categories = db.categories.filter((c) => all || c.visible).sort(byPos);
    const ids = new Set(categories.map((c) => c.id));
    const dishes = db.dishes.filter((d) => ids.has(d.category_id) && (all || d.visible)).sort(byPos);
    return { categories, dishes };
  },
  upsertCategory: (c) =>
    mutate((db) => {
      const i = db.categories.findIndex((x) => x.id === c.id);
      if (i >= 0) db.categories[i] = c;
      else db.categories.push(c);
    }),
  deleteCategory: (id) =>
    mutate((db) => {
      db.categories = db.categories.filter((c) => c.id !== id);
      db.dishes = db.dishes.filter((d) => d.category_id !== id);
    }),
  reorderCategories: (ids) =>
    mutate((db) => {
      for (const c of db.categories) if (ids.includes(c.id)) c.position = ids.indexOf(c.id);
    }),
  upsertDish: (d) =>
    mutate((db) => {
      const i = db.dishes.findIndex((x) => x.id === d.id);
      if (i >= 0) db.dishes[i] = d;
      else db.dishes.push(d);
    }),
  deleteDish: (id) => mutate((db) => void (db.dishes = db.dishes.filter((d) => d.id !== id))),
  reorderDishes: (ids) =>
    mutate((db) => {
      for (const d of db.dishes) if (ids.includes(d.id)) d.position = ids.indexOf(d.id);
    }),

  async listBookings(from, to) {
    const db = await read();
    return db.bookings
      .filter((b) => b.date >= from && b.date <= to)
      .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  },
  getBooking: async (id) => (await read()).bookings.find((b) => b.id === id) ?? null,
  getBookingByToken: async (token) => (await read()).bookings.find((b) => b.manage_token === token) ?? null,
  getBookingByCode: async (code) => (await read()).bookings.find((b) => b.short_code === code) ?? null,
  async coversByTime(date, ignoreId) {
    const out: Record<string, number> = {};
    for (const b of (await read()).bookings)
      if (b.date === date && isActive(b) && b.id !== ignoreId) out[b.time] = (out[b.time] ?? 0) + b.people;
    return out;
  },
  createBooking: (nb, maxCovers) =>
    locked(async () => {
      const db = await read();
      if (maxCovers !== null && taken(db, nb.date, nb.time) + nb.people > maxCovers) throw new SlotFullError();
      const booking: Booking = { ...nb, id: randomUUID(), created_at: new Date().toISOString(), manage_token: randomUUID(), short_code: newShortCode() };
      db.bookings.push(booking);
      await write(db);
      return booking;
    }),
  changeBooking: (id, change, status, maxCovers) =>
    locked(async () => {
      const db = await read();
      const b = db.bookings.find((x) => x.id === id);
      if (!b) throw new Error("Prenotazione non trovata");
      if (taken(db, change.date, change.time, id) + change.people > maxCovers) throw new SlotFullError();
      // keep the values from before the first change until the staff answers
      const before = b.guest_change?.before ?? { date: b.date, time: b.time, people: b.people, notes: b.notes };
      Object.assign(b, change, { status, guest_change: { at: new Date().toISOString(), before } });
      await write(db);
      return b;
    }),
  setBookingStatus: (id, status) =>
    mutate((db) => {
      const b = db.bookings.find((x) => x.id === id);
      if (b) {
        b.status = status;
        b.guest_change = null;
      }
    }),
  deleteBooking: (id) => mutate((db) => void (db.bookings = db.bookings.filter((b) => b.id !== id))),
  async countBookingsByPhone(phone, sinceIso) {
    return (await read()).bookings.filter((b) => b.phone === phone && b.created_at >= sinceIso).length;
  },

  listDevices: async () => (await read()).devices,
  saveDevice: (d) =>
    mutate((db) => {
      // an endpoint belongs to one device only
      db.devices = db.devices.filter((x) => x.id !== d.id && x.endpoint !== d.endpoint);
      db.devices.push(d);
    }),
  deleteDevice: (id) => mutate((db) => void (db.devices = db.devices.filter((d) => d.id !== id))),

  saveWhatsappMessage: (m) =>
    mutate((db) => {
      db.whatsapp = db.whatsapp.filter((x) => x.id !== m.id);
      db.whatsapp.push(m);
    }),
  async getWhatsappMessage(match) {
    return (await read()).whatsapp.find((x) => ("id" in match ? x.id === match.id : x.provider_id === match.providerId)) ?? null;
  },
  updateWhatsappMessage: (match, patch) =>
    locked(async () => {
      const db = await read();
      const m = db.whatsapp.find((x) => ("id" in match ? x.id === match.id : x.provider_id === match.providerId));
      if (!m) return null;
      Object.assign(m, patch, { updated_at: new Date().toISOString() });
      await write(db);
      return m;
    }),
  async listWhatsappMessages(bookingIds) {
    const ids = new Set(bookingIds);
    return (await read()).whatsapp.filter((m) => ids.has(m.booking_id)).sort((a, b) => a.created_at.localeCompare(b.created_at));
  },

  listBirthdays: async () => (await read()).birthdays.sort((a, b) => a.birthday.localeCompare(b.birthday)),
  saveBirthday: (c) =>
    mutate((db) => {
      db.birthdays = db.birthdays.filter((x) => x.phone_key !== c.phone_key);
      db.birthdays.push(c);
    }),
  getBirthdayByInvite: async (code) => (await read()).birthdays.find((x) => x.invite_code === code) ?? null,
  updateBirthday: (phoneKey, patch) =>
    mutate((db) => {
      const c = db.birthdays.find((x) => x.phone_key === phoneKey);
      if (c) Object.assign(c, patch);
    }),
  deleteBirthday: (phoneKey) => mutate((db) => void (db.birthdays = db.birthdays.filter((x) => x.phone_key !== phoneKey))),
  deleteBirthdaysBefore: (iso) => mutate((db) => void (db.birthdays = db.birthdays.filter((x) => x.consent_at >= iso))),

  saveErrorLog: (e) =>
    mutate((db) => {
      // the JSON file must stay small: keep the latest 500
      db.errors = [e, ...db.errors].slice(0, 500);
    }),
  listErrorLogs: async (limit) => (await read()).errors.sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, limit),
  clearErrorLogs: (beforeIso) => mutate((db) => void (db.errors = beforeIso ? db.errors.filter((e) => e.created_at >= beforeIso) : [])),

  async uploadImage(bytes, _type, ext) {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    const name = `${randomUUID()}.${ext}`;
    await fs.writeFile(path.join(UPLOAD_DIR, name), Buffer.from(bytes));
    return `/uploads/${name}`;
  },
  async deleteImage(url) {
    if (!url.startsWith("/uploads/")) return;
    await fs.rm(path.join(UPLOAD_DIR, path.basename(url)), { force: true });
  },
};
