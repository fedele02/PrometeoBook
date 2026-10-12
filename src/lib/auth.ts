import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isSupabaseEnabled } from "./supabase/env";
import { createSessionClient } from "./supabase/server";
import { createAdminClient } from "./supabase/admin";

export type Admin = { email: string };

// ---------- local mode: single password from env ----------------------

const LOCAL_COOKIE = "pm_admin";
const SESSION_DAYS = 14;

function localPassword() {
  const pw = process.env.ADMIN_PASSWORD;
  if (pw) return pw;
  // A default is convenient for development, never acceptable online.
  return process.env.NODE_ENV === "production" ? null : "prometeo";
}

const sign = (payload: string) =>
  createHmac("sha256", process.env.ADMIN_SESSION_SECRET ?? `pm:${localPassword()}`).update(payload).digest("hex");

const safeEqual = (a: string, b: string) => {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

// ---------- API ---------------------------------------------------------

export async function getAdmin(): Promise<Admin | null> {
  if (isSupabaseEnabled()) {
    const supabase = await createSessionClient();
    const { data } = await supabase.auth.getUser();
    if (!data.user) return null;
    const { data: row } = await createAdminClient()
      .from("admins")
      .select("user_id")
      .eq("user_id", data.user.id)
      .maybeSingle();
    return row ? { email: data.user.email ?? "" } : null;
  }

  const raw = (await cookies()).get(LOCAL_COOKIE)?.value;
  if (!raw || !localPassword()) return null;
  const [exp, sig] = raw.split(".");
  if (!exp || !sig || Number(exp) < Date.now() || !safeEqual(sig, sign(exp))) return null;
  return { email: "admin" };
}

export async function requireAdmin(): Promise<Admin> {
  const admin = await getAdmin();
  if (!admin) redirect("/gestore-prometeo-2026/login");
  return admin;
}

/** Returns an error message, or null on success. */
export async function login(email: string, password: string): Promise<string | null> {
  if (isSupabaseEnabled()) {
    const supabase = await createSessionClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return "Email o password non corretti.";
    if (!(await getAdmin())) {
      await supabase.auth.signOut();
      return "Questo account non è abilitato all'area riservata.";
    }
    return null;
  }

  const expected = localPassword();
  if (!expected) return "Imposta ADMIN_PASSWORD oppure collega Supabase.";
  if (!safeEqual(password, expected)) return "Password non corretta.";
  const exp = String(Date.now() + SESSION_DAYS * 864e5);
  (await cookies()).set(LOCAL_COOKIE, `${exp}.${sign(exp)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 86400,
  });
  return null;
}

export async function logout() {
  if (isSupabaseEnabled()) await (await createSessionClient()).auth.signOut();
  else (await cookies()).delete(LOCAL_COOKIE);
}
