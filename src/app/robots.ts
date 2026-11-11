import type { MetadataRoute } from "next";
import { site } from "@/content/site";

export const dynamic = "force-static";

// Стандарт §4.8: поисковые и AI-боты пускаются явно.
// Если клиент против обучения моделей на его контенте — убрать из списка GPTBot, Google-Extended, Applebot-Extended
// и добавить для них disallow; поисковых ботов (OAI-SearchBot, PerplexityBot, Claude-SearchBot, YandexBot) оставить.
const aiBots = ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "PerplexityBot", "ClaudeBot", "Claude-SearchBot", "Google-Extended", "YandexBot", "YandexAdditional", "DeepSeekBot", "Applebot-Extended"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }, ...aiBots.map((b) => ({ userAgent: b, allow: "/" }))],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
