import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/auth";
import { isSupabaseEnabled } from "@/lib/supabase/env";
import { Emblem, Wordmark } from "@/components/Logo";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata = { title: "Accesso" };

export default async function LoginPage() {
  if (await getAdmin()) redirect("/admin");

  return (
    <main className="grid min-h-dvh place-items-center px-5 py-12">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-gold">
          <Emblem className="h-14 w-auto" />
          <Wordmark className="mt-4 h-5 w-auto" />
          <p className="label mt-6 text-cream/70">Area riservata</p>
        </div>
        <LoginForm withEmail={isSupabaseEnabled()} />
      </div>
    </main>
  );
}
