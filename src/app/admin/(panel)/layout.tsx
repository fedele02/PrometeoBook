import { requireAdmin } from "@/lib/auth";
import { AdminNav } from "@/components/admin/AdminNav";
import { ToastProvider } from "@/components/admin/ui";

export default async function PanelLayout({ children }: LayoutProps<"/admin">) {
  const admin = await requireAdmin();

  return (
    <div className="md:flex">
      <AdminNav email={admin.email} />
      <div className="min-w-0 flex-1 pb-28 md:pb-12">
        <div className="mx-auto max-w-5xl px-4 pt-6 md:px-8 md:pt-10">
          <ToastProvider>{children}</ToastProvider>
        </div>
      </div>
    </div>
  );
}
