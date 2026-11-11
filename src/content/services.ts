// Услуги: одна запись — одна страница /services/<slug>/.
// Заполняется по specs/02-spec.md, §4–5. Каждое поле — факт от клиента или TODO(клиент).

export type Price = { name: string; value: string; note?: string; amount?: number }; // amount — число в рублях для Schema Offer
export type Faq = { q: string; a: string };

export type Service = {
  slug: string; // английские слова через дефис (стандарт §2.2): roof-repair
  title: string; // название в меню и карточках
  h1: string;
  metaTitle: string; // до 60 символов, главный запрос кластера ближе к началу
  metaDescription: string; // 120–160 символов
  short: string; // одна фраза для карточки
  answer: string; // прямой ответ в первом абзаце: что, для кого, сколько стоит, сколько длится
  forWhom: string[];
  includes: { title: string; text: string }[];
  process: { title: string; text: string }[];
  prices: Price[];
  timeline: string;
  faq: Faq[];
  related: string[]; // slug связанных услуг
};

export const services: Service[] = [
  {
    slug: "example-service",
    title: "TODO(клиент): Название услуги",
    h1: "TODO(клиент): H1 под главный запрос кластера",
    metaTitle: "TODO(клиент): title услуги",
    metaDescription: "TODO(клиент): description услуги с ценой и сроком",
    short: "TODO(клиент): одна фраза о пользе услуги",
    answer:
      "TODO(клиент): первый абзац — прямой ответ на главный вопрос страницы. Что это за услуга, кому подходит, сколько стоит и сколько длится. 40⁠–⁠80 слов, только факты.",
    forWhom: ["TODO(клиент): сегмент 1", "TODO(клиент): сегмент 2"],
    includes: [{ title: "TODO(клиент): что входит", text: "TODO(клиент): описание" }],
    process: [{ title: "TODO(клиент): этап", text: "TODO(клиент): что происходит" }],
    prices: [{ name: "TODO(клиент): тариф", value: "от 0 ₽", amount: 0 }],
    timeline: "TODO(клиент): срок",
    faq: [{ q: "TODO(клиент): частый вопрос клиента?", a: "TODO(клиент): ответ в 1⁠–⁠3 предложениях." }],
    related: [],
  },
];

export const serviceBySlug = (slug: string) => services.find((s) => s.slug === slug);
