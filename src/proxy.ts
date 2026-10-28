import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { SUPABASE_PUBLIC_KEY, SUPABASE_URL, isSupabaseEnabled } from "@/lib/supabase/env";
import { LANG_COOKIE } from "@/lib/i18n";

/**
 * One printed QR for everyone: a phone set to another language opens the English
 * menu, unless the guest already picked a language with the IT · EN switch.
 */
function tableMenuLanguage(request: NextRequest) {
  const chosen = request.cookies.get(LANG_COOKIE)?.value;
  const preferred = request.headers.get("accept-language")?.split(",")[0]?.trim().slice(0, 2).toLowerCase();
  const english = chosen ? chosen === "en" : !!preferred && preferred !== "it";
  return english ? NextResponse.redirect(new URL("/en/qr", request.url)) : NextResponse.next();
}

/**
 * Keeps the Supabase admin session fresh. Of the public site only /qr runs through here.
 * getClaims() checks the login locally (the project signs with an asymmetric key)
 * and only calls Supabase when the session has to be renewed.
 */
export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/qr") return tableMenuLanguage(request);

  let response = NextResponse.next({ request });
  if (!isSupabaseEnabled()) return response;

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(list) {
        for (const { name, value } of list) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of list) response.cookies.set(name, value, options);
      },
    },
  });
  await supabase.auth.getClaims();
  return response;
}

// the QR menu and the staff area, without the app's static files (service worker, manifest, icons)
export const config = {
  matcher: ["/qr", "/gestore-prometeo-2026", "/gestore-prometeo-2026/((?!sw\.js|manifest\.webmanifest|icons/|splash/).*)"],
};
