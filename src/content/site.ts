// Единый источник правды о школе. Факты — из specs/00-transfer-audit.md, specs/02-spec.md и decisions.md.
// Неизвестное — пустое значение и комментарий TODO(клиент): блок на сайте не показывается, пока факта нет.

export type OrgType =
  | "Organization"
  | "LocalBusiness"
  | "ProfessionalService"
  | "Dentist"
  | "MedicalClinic"
  | "LegalService"
  | "EducationalOrganization"
  | "HomeAndConstructionBusiness"
  | "Store";

// Тестовая копия (стандарт «Боевой + тестовый»): сборка с NEXT_PUBLIC_STAGING=1 выкладывается на технический домен
// (mixer.nikalimp.ru) параллельно с боевым. В ней noindex, robots Disallow, без Метрики, плашка «Тестовая версия»,
// заявки помечаются «[ТЕСТ]». canonical и sitemap остаются на боевой домен.
export const isStaging = process.env.NEXT_PUBLIC_STAGING === "1";

export const site = {
  // Тестовый адрес. Боевой домен школы — Ник сообщит (requests.md §1.2); при переезде заменить здесь, в publish и workflow.
  url: "https://mixerekb.ru",
  name: "MIXER",
  brandLine: "MIXER by СТАЯ",
  legalName: "", // TODO(клиент): ООО / ИП для политики ПДн и футера
  orgType: "EducationalOrganization" as OrgType,
  title: "Школа диджеинга в Екатеринбурге — MIXER by СТАЯ",
  description:
    "Школа диджеинга MIXER в Екатеринбурге: курсы с нуля, «Левел ап», «Миксмастер» и парный. Учат резиденты «СТАЯ» на CDJ-2000NXS2 и DJM-900NXS2.",
  tagline: "Школа диджеинга в Екатеринбурге от действующих резидентов творческого объединения «СТАЯ»",
  lang: "ru",
  locale: "ru_RU",
  foundingYear: 0, // TODO(клиент): год основания (на сайте — «4 года обучаем»)
  areaServed: ["Екатеринбург"],

  contacts: {
    phone: "", // TODO(клиент)
    phoneDisplay: "",
    email: "", // TODO(клиент)
    telegram: "https://t.me/mixerdjschoolekb",
    whatsapp: "",
    address: {
      street: "Восточная улица, 56, 3 этаж, офис 304",
      streetShort: "Восточная 56",
      floor: "3 этаж, офис 304",
      city: "Екатеринбург",
      region: "Свердловская область",
      postalCode: "",
      country: "RU",
    },
    geo: { lat: 56.842437, lng: 60.631481 } as null | { lat: number; lng: number },
    yandexOrgId: "162551378144",
    yandexOrgUrl: "https://yandex.ru/maps/org/mikser/162551378144/",
    hours: "", // TODO(клиент): часы работы
    openingHours: [] as { days: string[]; opens: string; closes: string }[],
  },

  cta: { label: "Записаться", href: "#form" },

  legal: {
    inn: "", // TODO(клиент)
    ogrn: "", // TODO(клиент)
    privacyEmail: "",
  },

  sameAs: [
    "https://t.me/mixerdjschoolekb",
    "https://vk.com/mixerdjschoolekb",
    "https://www.instagram.com/mixer_djschool",
    "https://yandex.ru/maps/org/mikser/162551378144/",
  ],
  socials: [
    { label: "Telegram", href: "https://t.me/mixerdjschoolekb" },
    { label: "ВКонтакте", href: "https://vk.com/mixerdjschoolekb" },
    { label: "Instagram*", href: "https://www.instagram.com/mixer_djschool" },
  ],
  metaNote: "*Instagram принадлежит компании Meta Platforms Inc., деятельность которой признана экстремистской и запрещена в РФ.",
  parent: { name: "СТАЯ", url: "https://stayaekb.ru" },

  person: null as null | { name: string; jobTitle: string; description: string; sameAs: string[] },

  // Метрика школы (Ник, 2026-11-13) — включается вместе с переездом на mixerekb.ru (стандарт §9.0).
  metrikaId: isStaging ? 0 : 114227234,
  darkTheme: false,

  features: {
    blog: false,
    mixGame: true, // игра «Сведи трек» в hero (spec §7.1)
    materials: false, // раздел «Полезное» скрыт (Ник, v0.6); материалы остаются в src/content/materials.ts
  },
};

export const nav = [
  { href: "/#about", label: "О школе" },
  { href: "/#courses", label: "Курсы" },
  { href: "/#team", label: "Преподаватели" },
  { href: "/#studio", label: "Услуги" },
  ...(site.features.materials ? [{ href: "/#materials", label: "Полезное" }] : []),
  { href: "/#contacts", label: "Контакты" },
];
