import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/menu`, changeFrequency: "weekly", priority: 0.9, alternates: { languages: { en: `${SITE_URL}/en/menu` } } },
    { url: `${SITE_URL}/en/menu`, changeFrequency: "weekly", priority: 0.8, alternates: { languages: { it: `${SITE_URL}/menu` } } },
    { url: `${SITE_URL}/prenota`, changeFrequency: "monthly", priority: 0.9 },
  ];
}
