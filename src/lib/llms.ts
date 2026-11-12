// llms.txt и llms-full.txt (https://llmstxt.org) — из того же контента, что и страницы.
import { site } from "@/content/site";
import { home } from "@/content/home";
import { materials } from "@/content/materials";

const plain = (s: string) => s.replace(/\u00A0/g, " ").replace(/\u2060/g, "");
const a = site.contacts.address;

function contacts() {
  return [
    `- Адрес: ${a.city}, ${a.street}`,
    `- Яндекс Карты: ${site.contacts.yandexOrgUrl}`,
    site.contacts.hours && `- Часы работы: ${site.contacts.hours}`,
    ...site.socials.map((s) => `- ${s.label.replace("*", "")}: ${s.href}`),
    `- Сайт: ${site.url}`,
  ].filter(Boolean).join("\n");
}

export function llmsTxt() {
  return plain(`# ${site.brandLine} — ${home.h1.toLowerCase()}

> ${home.answer}

## Курсы
${home.courses.map((c) => `- Курс «${c.name}»: ${c.forWhom.toLowerCase()}; ${c.specs.join(", ")}.${c.price ? ` Цена: ${c.price}.` : ""}`).join("\n")}

## Дополнительные услуги
${home.services.map((s) => `- ${s.name}${s.note ? ` (${s.note})` : ""}: ${s.price}`).join("\n")}

## Преподаватели
${home.teachers.map((t) => `- ${t.name} — ${t.role.toLowerCase()}, ${t.years} опыта`).join("\n")}

## Оборудование
${home.equipment.map((e) => `- Pioneer ${e.name} (${e.kind.toLowerCase()})`).join("\n")}
${materials.length ? `\n## Полезные материалы\n${materials.map((m) => `- [${m.title}](${m.url}): ${m.description}`).join("\n")}\n` : ""}
## Как получить пробное занятие бесплатно
Сведи трек в игре на главной странице: переведи кроссфейдер на деку B на словах «boom boom» с точностью до 1 секунды — откроется форма записи на бесплатное пробное занятие.

## Контакты
${contacts()}
- Подробная версия для LLM: ${site.url}/llms-full.txt
`);
}

export function llmsFullTxt() {
  return plain(`${llmsTxt()}
---

# В школе ты
${home.about.points.map((p) => `- ${p}`).join("\n")}

${home.about.stats.map((s) => `${s.value} — ${s.label}`).join(". ")}.

# Курсы подробно
${home.courses.map((c) => `## Курс «${c.name}»\n${c.forWhom}. ${c.text}\n${c.specs.join(", ")}${c.extra ? `; ${c.extra}` : ""}.`).join("\n\n")}

# Частые вопросы
${home.faq.map((f) => `- ${f.q} ${f.a}`).join("\n")}
`);
}
