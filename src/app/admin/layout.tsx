import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Area riservata", template: "%s · Admin Prometeo" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return <div className="min-h-dvh bg-ink text-cream">{children}</div>;
}
