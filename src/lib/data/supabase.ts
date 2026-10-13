import "server-only";
import { randomUUID } from "node:crypto";
import { seedSettings } from "../seed";
import type { Booking, Category, Dish, ErrorLog, PushDevice, Settings, WhatsappMessage } from "../types";
import { createAdminClient } from "../supabase/admin";
import { SlotFullError, type Repo } from "./repo";

const BUCKET = "media";

/** Throws on error; list queries without error always return an array. */
function check<T>(res: { data: T | null; error: { message: string } | null }): NonNullable<T> {
  if (res.error) throw new Error(res.error.message);
  return (res.data ?? []) as NonNullable<T>;
}

const normDish = (d: Dish): Dish => ({
  ...d,
  price: d.price === null ? null : Number(d.price),
  tags: d.tags ?? [],
  allergens: d.allergens ?? [],
});

export function supabaseRepo(): Repo {
  // Server-only client with the secret key: every access goes through
  // validated server code; RLS only exposes the public menu/settings.
  const db = createAdminClient();

  return {
    kind: "supabase",

    async getSettings() {
      const res = await db.from("settings").select("data").eq("id", 1).maybeSingle();
      if (res.error) throw new Error(res.error.message);
      const s = (res.data?.data ?? {}) as Partial<Settings>;
      return { ...seedSettings, ...s, booking: { ...seedSettings.booking, ...s.booking } };
    },
    async saveSettings(s) {
      check(await db.from("settings").upsert({ id: 1, data: s, updated_at: new Date().toISOString() }));
    },

    async getMenu(opts) {
      let cq = db.from("categories").select("*").order("position");
      let dq = db.from("dishes").select("*").order("position");
      if (!opts?.includeHidden) {
        cq = cq.eq("visible", true);
        dq = dq.eq("visible", true);
      }
      const [c, d] = await Promise.all([cq, dq]);
      const categories = check(c) as Category[];
      const ids = new Set(categories.map((x) => x.id));
      return { categories, dishes: (check(d) as Dish[]).map(normDish).filter((x) => ids.has(x.category_id)) };
    },
    async upsertCategory(c) {
      check(await db.from("categories").upsert(c));
    },
    async deleteCategory(id) {
      check(await db.from("categories").delete().eq("id", id));
    },
    async reorderCategories(ids) {
      await Promise.all(ids.map((id, position) => db.from("categories").update({ position }).eq("id", id)));
    },
    async upsertDish(d) {
      check(await db.from("dishes").upsert(d));
    },
    async deleteDish(id) {
      check(await db.from("dishes").delete().eq("id", id));
    },
    async reorderDishes(ids) {
      await Promise.all(ids.map((id, position) => db.from("dishes").update({ position }).eq("id", id)));
    },

    async listBookings(from, to) {
      // PostgREST returns at most 1000 rows per request: page through them
      const PAGE = 1000;
      const out: Booking[] = [];
      for (let start = 0; ; start += PAGE) {
        const page = check(
          await db
            .from("bookings")
            .select("*")
            .gte("date", from)
            .lte("date", to)
            .order("date")
            .order("time")
            .order("id")
            .range(start, start + PAGE - 1),
        ) as Booking[];
        out.push(...page);
        if (page.length < PAGE) return out;
      }
    },
    async getBooking(id) {
      const res = await db.from("bookings").select("*").eq("id", id).maybeSingle();
      if (res.error) throw new Error(res.error.message);
      return (res.data as Booking | null) ?? null;
    },
    async getBookingByToken(token) {
      // malformed tokens would make Postgres throw on the uuid cast
      if (!/^[0-9a-f-]{36}$/i.test(token)) return null;
      const res = await db.from("bookings").select("*").eq("manage_token", token).maybeSingle();
      if (res.error) throw new Error(res.error.message);
      return (res.data as Booking | null) ?? null;
    },
    async coversByTime(date, ignoreId) {
      let q = db.from("bookings").select("time, people").eq("date", date).in("status", ["pending", "confirmed"]);
      if (ignoreId) q = q.neq("id", ignoreId);
      const rows = check(await q);
      const out: Record<string, number> = {};
      for (const r of rows as { time: string; people: number }[]) out[r.time] = (out[r.time] ?? 0) + r.people;
      return out;
    },
    async createBooking(b, maxCovers) {
      // The SQL function locks the service (date + lunch/dinner) so two guests
      // can't grab the last seats at the same moment.
      const res = await db.rpc("create_booking", { p: b, max_covers: maxCovers });
      if (res.error) {
        if (res.error.message.includes("SLOT_FULL")) throw new SlotFullError();
        throw new Error(res.error.message);
      }
      return res.data as Booking;
    },
    async changeBooking(id, change, status, maxCovers) {
      // same service lock as create_booking, ignoring the booking's own seats
      const res = await db.rpc("change_booking", { p_id: id, p: { ...change, status }, max_covers: maxCovers });
      if (res.error) {
        if (res.error.message.includes("SLOT_FULL")) throw new SlotFullError();
        throw new Error(res.error.message);
      }
      return res.data as Booking;
    },
    async setBookingStatus(id, status) {
      check(await db.from("bookings").update({ status }).eq("id", id));
    },
    async deleteBooking(id) {
      check(await db.from("bookings").delete().eq("id", id));
    },
    async countBookingsByPhone(phone, sinceIso) {
      const res = await db
        .from("bookings")
        .select("id", { count: "exact", head: true })
        .eq("phone", phone)
        .gte("created_at", sinceIso);
      if (res.error) throw new Error(res.error.message);
      return res.count ?? 0;
    },

    async listDevices() {
      return check(await db.from("push_devices").select("*").order("created_at")) as PushDevice[];
    },
    async saveDevice(d) {
      // an endpoint belongs to one device only
      check(await db.from("push_devices").delete().eq("endpoint", d.endpoint).neq("id", d.id));
      check(await db.from("push_devices").upsert(d));
    },
    async deleteDevice(id) {
      check(await db.from("push_devices").delete().eq("id", id));
    },

    async saveWhatsappMessage(m) {
      check(await db.from("whatsapp_messages").upsert(m));
    },
    async getWhatsappMessage(match) {
      const q = db.from("whatsapp_messages").select("*");
      const res = await ("id" in match ? q.eq("id", match.id) : q.eq("provider_id", match.providerId)).maybeSingle();
      if (res.error) throw new Error(res.error.message);
      return (res.data as WhatsappMessage | null) ?? null;
    },
    async updateWhatsappMessage(match, patch) {
      const q = db.from("whatsapp_messages").update({ ...patch, updated_at: new Date().toISOString() });
      const res = await ("id" in match ? q.eq("id", match.id) : q.eq("provider_id", match.providerId)).select().maybeSingle();
      if (res.error) throw new Error(res.error.message);
      return (res.data as WhatsappMessage | null) ?? null;
    },
    async listWhatsappMessages(bookingIds) {
      if (!bookingIds.length) return [];
      const out: WhatsappMessage[] = [];
      // keep URLs short: query in chunks
      for (let i = 0; i < bookingIds.length; i += 100) {
        const res = await db.from("whatsapp_messages").select("*").in("booking_id", bookingIds.slice(i, i + 100)).order("created_at");
        out.push(...(check(res) as WhatsappMessage[]));
      }
      return out;
    },

    async saveErrorLog(e) {
      check(await db.from("error_logs").insert(e));
    },
    async listErrorLogs(limit) {
      return check(await db.from("error_logs").select("*").order("created_at", { ascending: false }).limit(limit)) as ErrorLog[];
    },
    async clearErrorLogs(beforeIso) {
      // delete needs a filter: "older than" or, to empty the log, every row
      check(await db.from("error_logs").delete().lt("created_at", beforeIso ?? "9999-12-31"));
    },

    async uploadImage(bytes, contentType, ext) {
      const key = `menu/${randomUUID()}.${ext}`;
      check(await db.storage.from(BUCKET).upload(key, bytes, { contentType, cacheControl: "31536000" }));
      return db.storage.from(BUCKET).getPublicUrl(key).data.publicUrl;
    },
    async deleteImage(url) {
      const marker = `/storage/v1/object/public/${BUCKET}/`;
      const i = url.indexOf(marker);
      if (i < 0) return;
      await db.storage.from(BUCKET).remove([url.slice(i + marker.length)]);
    },
  };
}
