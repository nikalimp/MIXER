// Секреты формы заявок — отдельные секреты GitHub (Ник, 2026-11-13):
//   LEAD_BOT_TOKEN — токен Telegram-бота; LEAD_CHAT_ID — id канала или чата (-100… или @канал, бот — админ), несколько через запятую.
// Workflow собирает их в одну строку BUILD_ENV «LEAD_BOT_TOKEN=…;LEAD_CHAT_ID=…», deploy-kit пишет её в .env.production.local;
// после сборки этот скрипт кладёт значения в out/api/lead-secrets.php.
// PHP-файл исполняется, а не отдаётся текстом, плюс закрыт в public/api/.htaccess. В git секретов нет.
import fs from "node:fs";

const env = { ...process.env };
for (const f of [".env.production.local", ".env.local"]) {
  if (!fs.existsSync(f)) continue;
  for (const line of fs.readFileSync(f, "utf8").split("\n")) {
    for (const part of line.split(";")) { // «KEY=…;KEY=…» — несколько значений в одной строке
      const m = part.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
      if (m && m[2] && env[m[1]] === undefined) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
}
const token = env.LEAD_BOT_TOKEN || "", chats = (env.LEAD_CHAT_ID || "").split(",").map((s) => s.trim()).filter(Boolean);
if (!token || !chats.length) { console.log("lead-config: LEAD_BOT_TOKEN/LEAD_CHAT_ID не заданы — форма возьмёт www/lead-config.php на сервере"); process.exit(0); }
const q = (s) => "'" + String(s).replace(/\\/g, "\\\\").replace(/'/g, "\\'") + "'";
const php = `<?php // создано scripts/lead-config.mjs при сборке, не редактировать\nreturn ['tg_token' => ${q(token)}, 'tg_chat' => [${chats.map(q).join(", ")}], 'email' => ${q(env.LEAD_EMAIL || "")}, 'from' => ${q(env.LEAD_FROM || "")}];\n`;
fs.mkdirSync("out/api", { recursive: true });
fs.writeFileSync("out/api/lead-secrets.php", php);
console.log(`lead-config: out/api/lead-secrets.php — Telegram, чатов: ${chats.length}`);
