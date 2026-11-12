import type { MetadataRoute } from "next";
import { site } from "@/content/site";

export const dynamic = "force-static";

// Только индексируемые страницы; lastmod — только настоящая дата (стандарт §2.10–2.11).
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${site.url}/`, priority: 1 },
  ];
}
