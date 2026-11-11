// llms.txt и llms-full.txt (https://llmstxt.org) — генерируются из того же контента, что и страницы.
import { site } from "@/content/site";
import { services } from "@/content/services";
import { about, home } from "@/content/home";
import { getPosts } from "./posts";

// Простой текст для нейросетей: неразрывные пробелы типографа заменяем обычными
const plain = (s: string) => s.replace(/\u00A0/g, " ").replace(/\u2060/g, "");
const c = site.contacts;

function contacts() {
  return [
    c.phone && `- Телефон: ${c.phoneDisplay || c.phone}`,
    c.email && `- Почта: ${c.email}`,
    c.telegram && `- Telegram: ${c.telegram}`,
    c.whatsapp && `- WhatsApp: ${c.whatsapp}`,
    c.address.street && `- Адрес: ${[c.address.city, c.address.street].filter(Boolean).join(", ")}`,
    c.hours && `- Часы работы: ${c.hours}`,
    `- Сайт: ${site.url}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export function llmsTxt() {
  const posts = getPosts();
  return plain(`# ${site.name}

> ${home.answer}

## Услуги
${services.map((s) => `- [${s.title}](${site.url}/services/${s.slug}/): ${s.short} ${s.prices[0] ? `${s.prices[0].name} — ${s.prices[0].value}.` : ""}`).join("\n")}
${posts.length ? `\n## Статьи\n${posts.map((p) => `- [${p.title}](${site.url}/blog/${p.slug}/): ${p.description}`).join("\n")}\n` : ""}
## О компании
- [О компании](${site.url}/about/): ${site.tagline}
- [Контакты](${site.url}/contacts/)
- Подробная версия для LLM: ${site.url}/llms-full.txt

## Контакты
${contacts()}
`);
}

export function llmsFullTxt() {
  const blocks = services.map(
    (s) =>
      `## ${s.h1}\nURL: ${site.url}/services/${s.slug}/\n\n${s.answer}\n\nКому подходит:\n${s.forWhom.map((f) => `- ${f}`).join("\n")}\n\nЧто входит:\n${s.includes.map((i) => `- ${i.title}: ${i.text}`).join("\n")}\n\nСтоимость:\n${s.prices.map((p) => `- ${p.name}: ${p.value}${p.note ? ` (${p.note})` : ""}`).join("\n")}\n\nСроки: ${s.timeline}\n${s.faq.length ? `\nВопросы:\n${s.faq.map((f) => `- ${f.q} ${f.a}`).join("\n")}\n` : ""}`,
  );
  const posts = getPosts().map((p) => `## ${p.title}\nURL: ${site.url}/blog/${p.slug}/\nДата: ${p.updated ?? p.date}\n\n${p.body}`);
  return plain(
    `${llmsTxt()}\n---\n\n# Частые вопросы\n\n${home.faq.map((f) => `- ${f.q} ${f.a}`).join("\n")}\n\n---\n\n# Услуги\n\n${blocks.join("\n\n")}\n\n---\n\n# О компании\n\n${about.body}\n${posts.length ? `\n---\n\n# Статьи\n\n${posts.join("\n\n")}\n` : ""}`,
  );
}
