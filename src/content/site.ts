// Единый источник правды о компании. Заполняется по specs/00-brief.md и specs/02-spec.md.
// Всё, что помечено TODO(клиент), должно быть заменено фактами до запуска: `npm run check` не пропустит TODO.

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

export const site = {
  url: "https://example.ru", // TODO(клиент): боевой домен без слеша на конце
  name: "TODO(клиент): Бренд",
  legalName: "TODO(клиент): ООО «Название»",
  // Тип организации в Schema.org — самый точный из подходящих: https://schema.org/LocalBusiness#subtypes
  orgType: "LocalBusiness" as OrgType,
  title: "TODO(клиент): Бренд — услуга в городе", // title главной, до 60 символов
  description: "TODO(клиент): описание компании для поиска и нейросетей, 120⁠–⁠160 символов, с фактами: что, где, для кого, цена или срок.",
  // Одна фраза о компании для llms.txt и футера
  tagline: "TODO(клиент): что делаем и для кого",
  lang: "ru",
  locale: "ru_RU",
  foundingYear: 2015, // TODO(клиент)
  areaServed: ["RU"],

  contacts: {
    phone: "", // формат +7XXXXXXXXXX; пусто — блок не показывается
    phoneDisplay: "",
    email: "",
    telegram: "", // https://t.me/…
    whatsapp: "", // https://wa.me/7XXXXXXXXXX
    address: {
      street: "",
      city: "",
      region: "",
      postalCode: "",
      country: "RU",
    },
    geo: null as null | { lat: number; lng: number },
    hours: "", // для людей: «Пн–Пт 9:00–19:00»
    openingHours: [] as { days: string[]; opens: string; closes: string }[], // для Schema: days — Monday…Sunday
  },

  // Главное целевое действие — на него ведут все CTA
  cta: {
    label: "TODO(клиент): Записаться",
    href: "https://t.me/TODO", // TODO(клиент): ссылка на мессенджер, форму или tel:
  },

  // Реквизиты для футера и политики ПДн (152-ФЗ)
  legal: {
    inn: "TODO(клиент)",
    ogrn: "TODO(клиент)",
    privacyEmail: "", // почта для запросов по персональным данным; пусто — берётся contacts.email
  },

  // Профили бренда на внешних площадках: одинаковые название, адрес и телефон везде
  sameAs: [] as string[],
  socials: [] as { label: string; href: string }[], // Instagram и Facebook — с «*» в label
  metaNote: "", // «*Meta Platforms Inc. признана экстремистской и запрещена в РФ» — если есть ссылки на Instagram/Facebook

  // Лицо компании — основатель или эксперт. null, если не нужен
  person: null as null | { name: string; jobTitle: string; description: string; sameAs: string[] },

  metrikaId: 0, // номер счётчика Яндекс Метрики; 0 — счётчик не подключается (на боевом домене npm run check этого не пропустит)
  darkTheme: true, // переключатель темы в шапке

  // Функции включаются и выключаются флагами, а не удалением кода (стандарт §1.9):
  // снятый с сайта блок остаётся в репозитории и возвращается одной строкой.
  features: {
    blog: true, // блог: пункт меню, /blog/, статьи в sitemap и llms.txt
  },
};

export const nav = [
  { href: "/services/", label: "Услуги" },
  ...(site.features.blog ? [{ href: "/blog/", label: "Блог" }] : []),
  { href: "/about/", label: "О компании" },
  { href: "/contacts/", label: "Контакты" },
];
