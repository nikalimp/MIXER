import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { materialsIndexable } from "@/content/materials";

export const dynamic = "force-static";

// Только индексируемые страницы; lastmod — только настоящая дата (стандарт §2.10–2.11).
// /materials/ — в sitemap, когда материалов 3+ (до этого noindex).
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${site.url}/`, priority: 1 },
    ...(site.features.materials && materialsIndexable ? [{ url: `${site.url}/materials/`, priority: 0.6 }] : []),
  ];
}
