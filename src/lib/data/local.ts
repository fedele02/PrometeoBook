import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { seedCategories, seedDishes, seedSettings } from "../seed";
import type { Booking, Category, Dish, Settings } from "../types";
import { SlotFullError, type Repo } from "./repo";

type Db = { settings: Settings; categories: Category[]; dishes: Dish[]; bookings: Booking[] };

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
    db.settings = { ...seedSettings, ...db.settings, booking: { ...seedSettings.booking, ...db.settings.booking } };
    return db;
  } catch {
    return {
      settings: structuredClone(seedSettings),
      categories: structuredClone(seedCategories),
      dishes: structuredClone(seedDishes),
      bookings: [],
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
  async coversByTime(date) {
    const out: Record<string, number> = {};
    for (const b of (await read()).bookings)
      if (b.date === date && b.status !== "cancelled") out[b.time] = (out[b.time] ?? 0) + b.people;
    return out;
  },
  createBooking: (nb, maxCovers) =>
    locked(async () => {
      const db = await read();
      if (maxCovers !== null) {
        const taken = db.bookings
          .filter((b) => b.date === nb.date && b.time === nb.time && b.status !== "cancelled")
          .reduce((n, b) => n + b.people, 0);
        if (taken + nb.people > maxCovers) throw new SlotFullError();
      }
      const booking: Booking = { ...nb, id: randomUUID(), created_at: new Date().toISOString() };
      db.bookings.push(booking);
      await write(db);
      return booking;
    }),
  setBookingStatus: (id, status) =>
    mutate((db) => {
      const b = db.bookings.find((x) => x.id === id);
      if (b) b.status = status;
    }),
  deleteBooking: (id) => mutate((db) => void (db.bookings = db.bookings.filter((b) => b.id !== id))),
  async countBookingsByPhone(phone, sinceIso) {
    return (await read()).bookings.filter((b) => b.phone === phone && b.created_at >= sinceIso).length;
  },

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
