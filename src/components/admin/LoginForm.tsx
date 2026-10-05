"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/admin/actions";

export function LoginForm({ withEmail }: { withEmail: boolean }) {
  const [state, action, pending] = useActionState(loginAction, undefined);
  return (
    <form action={action} className="mt-10 space-y-4 rounded-lg border border-gold/15 bg-ink-2/90 p-6 backdrop-blur">
      {withEmail && (
        <label className="block">
          <span className="text-sm font-semibold text-cream/80">Email</span>
          <input name="email" type="email" autoComplete="username" required className="input mt-1.5" />
        </label>
      )}
      <label className="block">
        <span className="text-sm font-semibold text-cream/80">Password</span>
        <input name="password" type="password" autoComplete="current-password" required className="input mt-1.5" />
      </label>
      {state?.error && (
        <p role="alert" className="rounded-xl bg-ember/15 px-4 py-3 text-sm text-cream">
          {state.error}
        </p>
      )}
      <button disabled={pending} className="btn btn-gold w-full disabled:opacity-60">
        {pending ? "Accesso…" : "Entra"}
      </button>
    </form>
  );
}
