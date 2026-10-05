import { requireAdmin } from "@/lib/auth";
import { repo } from "@/lib/data";
import { AdminNav } from "@/components/admin/AdminNav";
import { ToastProvider } from "@/components/admin/ui";

export default async function PanelLayout({ children }: LayoutProps<"/admin">) {
  const admin = await requireAdmin();
  const local = repo().kind === "local";

  return (
    <div className="md:flex">
      <AdminNav email={admin.email} />
      <div className="min-w-0 flex-1 pb-28 md:pb-12">
        {local && (
          <p className="border-b border-gold/20 bg-gold/10 px-5 py-2 text-center text-[0.8rem] text-gold-light">
            Modalità demo locale: i dati sono salvati in <code>data/local-db.json</code>. Collega Supabase per andare online.
          </p>
        )}
        <div className="mx-auto max-w-5xl px-4 pt-6 md:px-8 md:pt-10">
          <ToastProvider>{children}</ToastProvider>
        </div>
      </div>
    </div>
  );
}
