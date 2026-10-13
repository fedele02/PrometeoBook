import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { SUPABASE_PUBLIC_KEY, SUPABASE_URL, isSupabaseEnabled } from "@/lib/supabase/env";

/**
 * Keeps the Supabase admin session fresh. The public site never runs through here.
 * getClaims() checks the login locally (the project signs with an asymmetric key)
 * and only calls Supabase when the session has to be renewed.
 */
export async function proxy(request: NextRequest) {
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

// the staff area only, without the app's static files (service worker, manifest, icons)
export const config = {
  matcher: ["/gestore-prometeo-2026", "/gestore-prometeo-2026/((?!sw\.js|manifest\.webmanifest|icons/|splash/).*)"],
};
