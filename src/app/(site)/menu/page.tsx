import type { Metadata } from "next";
import { SiteMenu } from "@/components/menu/MenuPages";

export const metadata: Metadata = {
  title: "Menu",
  description: "Il menu del Prometeo Fine Dining di Matera: antipasti, primi, secondi e dolci. Cucina tradizionale lucana rivisitata.",
  alternates: { languages: { it: "/menu", en: "/en/menu" } },
};

export default function MenuPage() {
  return <SiteMenu lang="it" />;
}
