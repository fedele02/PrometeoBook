import type { Metadata } from "next";
import { SiteMenu } from "@/components/menu/MenuPages";

export const metadata: Metadata = {
  title: "Menu",
  description: "The menu of Prometeo Fine Dining in Matera: starters, first courses, main courses and desserts. Traditional Lucanian cuisine, reimagined.",
  alternates: { languages: { it: "/menu", en: "/en/menu" } },
  openGraph: { locale: "en_GB" },
};

export default function EnglishMenuPage() {
  return <SiteMenu lang="en" />;
}
