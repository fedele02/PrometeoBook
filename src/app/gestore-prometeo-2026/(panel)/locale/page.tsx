import { repo } from "@/lib/data";
import { SettingsForm } from "@/components/admin/SettingsForm";

export const metadata = { title: "Locale e orari" };

export default async function SettingsPage() {
  const settings = await repo().getSettings();
  return <SettingsForm initial={settings} />;
}
