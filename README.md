# AI-Ready сайт — стартер

Шаблон клиентского сайта NikitOS: Next.js 16 (App Router, статический экспорт) + Tailwind 4 + shadcn/ui. GEO-фундамент работает из коробки. Гайд — `Resources/Know-how/Стартер AI-Ready сайта — гайд.md`, стандарт — `Resources/Frameworks/AI-Ready сайт — стандарт.md`.

## Что уже есть
- Страницы (адреса — английские слова, стандарт §2.2): `/`, `/services/` и `/services/<slug>/`, `/blog/` и статьи, `/about/`, `/contacts/`, `/privacy-policy/`, `/consent/` (отдельное согласие на обработку ПДн по 156-ФЗ), 404. Чекбокс согласия для форм — `src/components/consent-checkbox.tsx`.
- `/llms.txt`, `/llms-full.txt`, `/robots.txt` (AI-боты открыты), `/sitemap.xml` — генерируются при сборке из контента.
- JSON-LD: WebSite, Organization/LocalBusiness, Person, Service + Offer, FAQPage, BlogPosting, BreadcrumbList, ItemList, AboutPage, ContactPage.
- Типограф перед каждой сборкой, баннер cookies, Яндекс Метрика по номеру счётчика, тёмная тема, мобильное меню и FAQ без JavaScript.
- `npm run check` — проверка перед запуском: TODO, домен, geo-check, индексация, Метрика, ИНН и ОГРН по контрольной сумме, политика и согласие, Главред, цвета в обход токенов, geo-check «до» для переноса, ориентиры `estimate`.
- Флаги функций: `site.features` — функция снимается флагом, код остаётся.
- `.github/workflows/deploy.yml` — вызов общего сценария `nikalimp/deploy-kit`: SSH → FTP → артефакт; `scripts/deploy-site.sh` — выкладка вручную с Mac. Подробно — гайд «Хостинги — что проверено».

## Где что править
| Что | Файл |
|---|---|
| Компания, контакты, реквизиты, CTA, Метрика, флаги функций | `src/content/site.ts` |
| Услуги | `src/content/services.ts` |
| Главная, «О компании» | `src/content/home.ts` |
| Статьи | `content/blog/<slug>.md` (образец — `_primer.md`) |
| Цвета, радиус | `src/app/globals.css` |
| Шрифт | `src/app/layout.tsx` (`@fontsource-variable/…`) |
| OG-картинка | `public/og.png` (1200×630) |

## Команды
```bash
npm install
npm run dev       # http://localhost:3010
npm run build     # out/
npm run check     # сборка + проверки (всегда строгие)
npm run preview   # просмотр out/ на http://localhost:3011
```
