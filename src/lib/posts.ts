import fs from "node:fs";
import path from "node:path";
import { typograf } from "./typograf.mjs";
import { site } from "@/content/site";

// Статьи: content/blog/<slug>.md с frontmatter title, description, date (YYYY-MM-DD), опционально updated.
export type Post = { slug: string; title: string; description: string; date: string; updated?: string; body: string };

const dir = path.join(process.cwd(), "content/blog");

function parse(file: string): Post {
  const raw = fs.readFileSync(path.join(dir, file), "utf8");
  const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) throw new Error(`Нет frontmatter: ${file}`);
  const meta: Record<string, string> = {};
  for (const line of m[1].split("\n")) {
    const i = line.indexOf(":");
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^"|"$/g, "");
  }
  // Типограф при сборке: файлы статей не меняются
  return { slug: file.replace(/\.md$/, ""), title: typograf(meta.title), description: typograf(meta.description), date: meta.date, updated: meta.updated, body: typograf(m[2].trim()) };
}

export function getPosts(): Post[] {
  // Блог выключен флагом site.features.blog — статей нет нигде: ни в sitemap, ни в llms.txt
  if (!site.features.blog || !fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md") && !f.startsWith("_"))
    .map(parse)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getPost(slug: string): Post | undefined {
  return getPosts().find((p) => p.slug === slug);
}

export function formatDate(d: string) {
  return new Date(d).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
}
