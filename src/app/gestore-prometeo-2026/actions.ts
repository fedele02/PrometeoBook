"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath, updateTag } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { z } from "zod";
import { login, logout, requireAdmin } from "@/lib/auth";
import { CONTENT_TAG, repo } from "@/lib/data";
import { announce, pendingCount } from "@/lib/events";
import { DEFAULT_PREFS, DEVICE_COOKIE, pushToDevices } from "@/lib/push";
import { ADMIN_PATH } from "@/lib/pwa";
import { adminBookingSchema, categorySchema, dishSchema, firstError, settingsSchema } from "@/lib/schemas";
import type { BookingStatus, Category, Dish, NotifyPrefs, PushDevice, Settings } from "@/lib/types";

export type ActionResult = { ok: true } | { ok: false; error: string };

/** Public pages are cached: refresh them right after any content change. */
function publish() {
  updateTag(CONTENT_TAG);
  revalidatePath("/", "layout");
}

async function guarded(fn: () => Promise<void>): Promise<ActionResult> {
  await requireAdmin();
  try {
    await fn();
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: e instanceof Error ? e.message : "Errore imprevisto" };
  }
}

// ---------- session ----------------------------------------------------

export async function loginAction(_: unknown, form: FormData): Promise<{ error: string } | undefined> {
  const error = await login(String(form.get("email") ?? ""), String(form.get("password") ?? ""));
  if (error) return { error };
  redirect("/gestore-prometeo-2026");
}

export async function logoutAction() {
  await logout();
  redirect("/gestore-prometeo-2026/login");
}

// ---------- bookings -------------------------------------------------
// The staff only answers: accept, refuse, cancel. Changing a booking is up to the guest.

type StaffEvent = "accepted" | "declined" | "cancelledByStaff";

async function answer(id: string, status: BookingStatus, event: StaffEvent): Promise<ActionResult> {
  return guarded(async () => {
    const r = repo();
    const b = await r.getBooking(id);
    if (!b) throw new Error("Prenotazione non trovata");
    if (b.status === status) return;
    await r.setBookingStatus(id, status);
    after(() => announce({ type: event, booking: { ...b, status } }));
  });
}

export async function acceptBookingAction(id: string) {
  return answer(id, "confirmed", "accepted");
}
export async function declineBookingAction(id: string) {
  return answer(id, "declined", "declined");
}
export async function cancelBookingAction(id: string) {
  return answer(id, "cancelled", "cancelledByStaff");
}

export async function deleteBookingAction(id: string) {
  return guarded(() => repo().deleteBooking(id));
}

/** Bookings taken by phone: no capacity check, the staff decides. */
export async function createBookingAction(input: unknown): Promise<ActionResult> {
  await requireAdmin();
  const p = adminBookingSchema.safeParse(input);
  if (!p.success) return { ok: false, error: firstError(p.error) };
  return guarded(async () => {
    const booking = await repo().createBooking({ ...p.data, email: "", status: "confirmed", source: "admin" }, null);
    after(() => announce({ type: "phoneBooking", booking }));
  });
}

// ---------- notifications (this device) -------------------------------

const deviceSchema = z.object({
  endpoint: z.url().max(1000),
  keys: z.object({ p256dh: z.string().min(10).max(200), auth: z.string().min(8).max(100) }),
  label: z.string().trim().max(60),
});

const cookieOpts = { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: ADMIN_PATH, maxAge: 60 * 60 * 24 * 400 } as const;

/** Saves this browser's push subscription and remembers it in a cookie. */
export async function registerDeviceAction(input: unknown): Promise<ActionResult & { id?: string }> {
  await requireAdmin();
  const p = deviceSchema.safeParse(input);
  if (!p.success) return { ok: false, error: "Iscrizione alle notifiche non valida" };
  const jar = await cookies();
  const r = repo();
  const known = (await r.listDevices()).find((d) => d.endpoint === p.data.endpoint || d.id === jar.get(DEVICE_COOKIE)?.value);
  const now = new Date().toISOString();
  const device: PushDevice = {
    id: known?.id ?? randomUUID(),
    endpoint: p.data.endpoint,
    p256dh: p.data.keys.p256dh,
    auth: p.data.keys.auth,
    label: p.data.label || "Dispositivo",
    prefs: known?.prefs ?? DEFAULT_PREFS,
    created_at: known?.created_at ?? now,
    last_used_at: now,
  };
  const res = await guarded(() => r.saveDevice(device));
  if (res.ok) jar.set(DEVICE_COOKIE, device.id, cookieOpts);
  return { ...res, id: device.id };
}

export async function updateDevicePrefsAction(id: string, prefs: NotifyPrefs): Promise<ActionResult> {
  return guarded(async () => {
    const r = repo();
    const d = (await r.listDevices()).find((x) => x.id === id);
    if (!d) throw new Error("Dispositivo non trovato");
    const clean = z.object({ requests: z.boolean(), changes: z.boolean(), cancellations: z.boolean(), staff: z.boolean() }).parse(prefs);
    await r.saveDevice({ ...d, prefs: clean });
  });
}

export async function removeDeviceAction(id: string): Promise<ActionResult> {
  const res = await guarded(() => repo().deleteDevice(id));
  const jar = await cookies();
  if (res.ok && jar.get(DEVICE_COOKIE)?.value === id) jar.delete({ name: DEVICE_COOKIE, path: ADMIN_PATH });
  return res;
}

/** Sends a test notification to this device only. */
export async function testPushAction(): Promise<ActionResult> {
  await requireAdmin();
  const id = (await cookies()).get(DEVICE_COOKIE)?.value;
  if (!id) return { ok: false, error: "Attiva prima le notifiche su questo dispositivo" };
  const { sent } = await pushToDevices(
    { title: "Prova notifica · Prometeo Gestione", body: "Funziona: qui arriveranno le nuove richieste.", url: ADMIN_PATH, tag: "test", badge: await pendingCount() },
    { group: "requests", onlyDevice: id },
  );
  return sent ? { ok: true } : { ok: false, error: "Notifica non inviata: riattiva le notifiche su questo dispositivo" };
}

// ---------- settings -------------------------------------------------

export async function saveSettingsAction(input: Settings): Promise<ActionResult> {
  await requireAdmin();
  const p = settingsSchema.safeParse(input);
  if (!p.success) return { ok: false, error: firstError(p.error) };
  const s = p.data as Settings;
  s.closures.sort((a, b) => a.date.localeCompare(b.date));
  return guarded(async () => {
    await repo().saveSettings(s);
    publish();
  });
}

// ---------- menu -----------------------------------------------------

export async function saveCategoryAction(input: Omit<Category, "id"> & { id?: string }): Promise<ActionResult> {
  await requireAdmin();
  const p = categorySchema.safeParse({ ...input, id: input.id || `cat-${randomUUID().slice(0, 8)}` });
  if (!p.success) return { ok: false, error: firstError(p.error) };
  return guarded(async () => {
    await repo().upsertCategory(p.data);
    publish();
  });
}

export async function deleteCategoryAction(id: string) {
  return guarded(async () => {
    const r = repo();
    const { dishes } = await r.getMenu({ includeHidden: true });
    await Promise.all(dishes.filter((d) => d.category_id === id && d.image_url).map((d) => r.deleteImage(d.image_url)));
    await r.deleteCategory(id);
    publish();
  });
}

export async function reorderCategoriesAction(ids: string[]) {
  return guarded(async () => {
    await repo().reorderCategories(ids);
    publish();
  });
}

export async function saveDishAction(input: Omit<Dish, "id"> & { id?: string }): Promise<ActionResult> {
  await requireAdmin();
  const p = dishSchema.safeParse({ ...input, id: input.id || `d-${randomUUID().slice(0, 8)}` });
  if (!p.success) return { ok: false, error: firstError(p.error) };
  return guarded(async () => {
    const r = repo();
    // drop the old photo if it was replaced
    if (input.id) {
      const old = (await r.getMenu({ includeHidden: true })).dishes.find((d) => d.id === input.id);
      if (old?.image_url && old.image_url !== p.data.image_url) await r.deleteImage(old.image_url);
    }
    await r.upsertDish(p.data);
    publish();
  });
}

export async function deleteDishAction(id: string) {
  return guarded(async () => {
    const r = repo();
    const d = (await r.getMenu({ includeHidden: true })).dishes.find((x) => x.id === id);
    if (d?.image_url) await r.deleteImage(d.image_url);
    await r.deleteDish(id);
    publish();
  });
}

export async function reorderDishesAction(ids: string[]) {
  return guarded(async () => {
    await repo().reorderDishes(ids);
    publish();
  });
}

/** Photos arrive already resized to WebP by the browser (see ImagePicker). */
export async function uploadImageAction(form: FormData): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  await requireAdmin();
  const file = form.get("file");
  if (!(file instanceof File)) return { ok: false, error: "Nessun file" };
  const types: Record<string, string> = { "image/webp": "webp", "image/jpeg": "jpg", "image/png": "png" };
  const ext = types[file.type];
  if (!ext) return { ok: false, error: "Formato non supportato (usa JPG, PNG o WebP)" };
  if (file.size > 5 * 1024 * 1024) return { ok: false, error: "Immagine troppo grande (max 5 MB)" };
  try {
    return { ok: true, url: await repo().uploadImage(await file.arrayBuffer(), file.type, ext) };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Caricamento non riuscito" };
  }
}
