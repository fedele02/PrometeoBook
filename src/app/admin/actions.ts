"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { login, logout, requireAdmin } from "@/lib/auth";
import { CONTENT_TAG, repo } from "@/lib/data";
import { adminBookingSchema, categorySchema, dishSchema, firstError, settingsSchema } from "@/lib/schemas";
import type { BookingStatus, Category, Dish, Settings } from "@/lib/types";

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
  redirect("/admin");
}

export async function logoutAction() {
  await logout();
  redirect("/admin/login");
}

// ---------- bookings -------------------------------------------------

export async function setBookingStatusAction(id: string, status: BookingStatus) {
  return guarded(() => repo().setBookingStatus(id, status));
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
    await repo().createBooking({ ...p.data, email: "", status: "confirmed", source: "admin" }, null);
  });
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
