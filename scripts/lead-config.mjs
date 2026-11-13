// Секреты формы заявок — из GitHub (Ник, 2026-11-13): секрет BUILD_ENV, строки
//   LEAD_TG_TOKEN=123456:ABC…      — токен Telegram-бота
//   LEAD_TG_CHAT=-1001234567890    — id канала или чата (бот — админ канала); несколько — через запятую
//   LEAD_EMAIL=… (необязательно)
// deploy-kit пишет BUILD_ENV в .env.production.local; после сборки этот скрипт кладёт их в out/api/lead-secrets.php.
// PHP-файл исполняется, а не отдаётся текстом, плюс закрыт в public/api/.htaccess. В git секретов нет.
import fs from "node:fs";

const env = { ...process.env };
for (const f of [".env.production.local", ".env.local"]) {
  if (!fs.existsSync(f)) continue;
  for (const line of fs.readFileSync(f, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && env[m[1]] === undefined) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}
const token = env.LEAD_TG_TOKEN || "", chats = (env.LEAD_TG_CHAT || "").split(",").map((s) => s.trim()).filter(Boolean);
if (!token || !chats.length) { console.log("lead-config: LEAD_TG_TOKEN/LEAD_TG_CHAT не заданы — форма возьмёт www/lead-config.php на сервере"); process.exit(0); }
const q = (s) => "'" + String(s).replace(/\\/g, "\\\\").replace(/'/g, "\\'") + "'";
const php = `<?php // создано scripts/lead-config.mjs при сборке, не редактировать\nreturn ['tg_token' => ${q(token)}, 'tg_chat' => [${chats.map(q).join(", ")}], 'email' => ${q(env.LEAD_EMAIL || "")}, 'from' => ${q(env.LEAD_FROM || "")}];\n`;
fs.mkdirSync("out/api", { recursive: true });
fs.writeFileSync("out/api/lead-secrets.php", php);
console.log(`lead-config: out/api/lead-secrets.php — Telegram, чатов: ${chats.length}`);
