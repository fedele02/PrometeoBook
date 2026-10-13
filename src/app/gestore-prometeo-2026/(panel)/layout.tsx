import { canSeeErrors, requireAdmin } from "@/lib/auth";
import { pendingCount } from "@/lib/events";
import { AdminNav } from "@/components/admin/AdminNav";
import { InstallBanner } from "@/components/admin/InstallBanner";
import { AppBadge } from "@/components/admin/pwa";
import { ToastProvider } from "@/components/admin/ui";

export default async function PanelLayout({ children }: LayoutProps<"/gestore-prometeo-2026">) {
  const [admin, pending] = await Promise.all([requireAdmin(), pendingCount()]);

  return (
    <div className="md:flex">
      <AdminNav email={admin.email} pending={pending} showErrors={canSeeErrors(admin)} />
      <AppBadge count={pending} />
      <div className="min-w-0 flex-1 pb-[calc(env(safe-area-inset-bottom)+6.5rem)] md:pb-12">
        <div className="mx-auto max-w-5xl pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] pt-6 md:px-8 md:pt-10">
          <ToastProvider>
            <InstallBanner />
            {children}
          </ToastProvider>
        </div>
      </div>
    </div>
  );
}
