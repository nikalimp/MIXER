import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { services } from "@/content/services";
import { getPosts } from "@/lib/posts";

export const dynamic = "force-static";

// Новая страница = новая строка здесь. Правила (стандарт AI-Ready сайта, §2 «Индексация»):
// - только страницы, открытые для индексации: noindex-страниц и политики конфиденциальности здесь нет;
// - lastmod — только настоящая дата изменения (у статей — updated/date из frontmatter). Дату сборки не ставим:
//   сайт пересобирается при каждом push, и «всё обновилось сегодня» приучает Google игнорировать lastmod.
export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getPosts();
  return [
    { url: `${site.url}/`, priority: 1 },
    { url: `${site.url}/services/`, priority: 0.9 },
    ...services.map((s) => ({ url: `${site.url}/services/${s.slug}/`, priority: 0.8 })),
    { url: `${site.url}/about/`, priority: 0.6 },
    { url: `${site.url}/contacts/`, priority: 0.6 },
    ...(posts.length ? [{ url: `${site.url}/blog/`, lastModified: posts.map((p) => p.updated ?? p.date).sort().at(-1), priority: 0.7 }] : []),
    ...posts.map((p) => ({ url: `${site.url}/blog/${p.slug}/`, lastModified: p.updated ?? p.date, priority: 0.7 })),
  ];
}
