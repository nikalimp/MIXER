# 04 · План — MIXER

> Статус: утверждён Ником 2026-11-12 (вместе с правками v0.2)

## Архитектура
- Next.js 16, статический экспорт (`out/`), стартер AI-Ready. Шрифт — `@fontsource-variable/unbounded`.
- Контент: `src/content/site.ts` (школа, контакты, флаги), `home.ts` (главная), `materials.ts` («Полезное»).
- Страницы: `/`, `/materials/` (noindex, пока < 3 материалов), `/privacy-policy/`, `/consent/`, 404. Маршруты стартера `/services/`, `/blog/`, `/about/`, `/contacts/` удалены — их нет в spec.
- Игра: `src/components/mix-console.tsx` (Web Audio, SVG), `seven-seg.tsx`; аудио — `public/audio/deck-a.mp3` (LOBODA, 0:00–0:50), `deck-b.mp3` (sidodgi, 0:00–0:36), грузятся после клика.
- Заявки: `lead-form.tsx` → `public/api/lead.php` → Telegram-бот школы; секреты — `www/lead-config.php` на сервере, вне репозитория.
- JSON-LD: WebSite, EducationalOrganization (адрес, geo, hasMap, parentOrganization СТАЯ), Course ×4, FAQPage.

## Хостинг и выкладка
- Тест: **REG.RU, ISPmanager, сайт `mixer.nikalimp.ru`**, deploy-kit `ssh-ftp` (SSH → FTP). Pre-flight — по «Хостинги — что проверено»: сайт в ISPmanager, A-запись поддомена, Let's Encrypt, PHP 8.3, FTP-пользователь, секреты GitHub (`FTP_HOST`, `FTP_USER`, `FTP_PASS`, `FTP_DIR=www/mixer.nikalimp.ru/`). Мастер — `deploy-kit/setup-site.sh`.
- Боевой: решение Ника до запуска на домене школы.

## Порядок
1. Сборка v0.2 (этот PR) → 2. хостинг теста и секреты → 3. выкладка на mixer.nikalimp.ru → 4. проверка на iPhone и Android → 5. ответы клиента (цены, FAQ, реквизиты, материалы) → 6. домен школы, 301 со stayaekb.ru/mixer, Метрика 99510129.
