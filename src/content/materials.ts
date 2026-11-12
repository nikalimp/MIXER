// Раздел «Полезное» (spec §7.2). Как добавить материал — одна запись в массив ниже, через веб-редактор GitHub:
// { title: "Название", type: "Сэмплы", description: "1–2 строки", url: "https://…", cta: "Скачать", date: "2026-11-20", author: "KLЁN" }
// type — одно из: Сэмплы, Пресеты, Гайд, Чек-лист, Плейлист, Видео. Новые материалы — сверху.
// Пока материалов меньше трёх, страница /materials/ закрыта от поисковиков и не попадает в sitemap (стандарт §2.8).

export type Material = {
  title: string;
  type: "Сэмплы" | "Пресеты" | "Гайд" | "Чек-лист" | "Плейлист" | "Видео";
  description: string;
  url: string;
  cta: "Скачать" | "Открыть";
  date: string;
  author?: string;
};

export const materials: Material[] = [
  // TODO(клиент): первые материалы от преподавателей (requests.md §2.4)
];

export const materialsIndexable = materials.length >= 3;
