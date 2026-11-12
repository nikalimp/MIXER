import type { Metadata } from "next";
import { materials, materialsIndexable } from "@/content/materials";
import { site } from "@/content/site";
import { JsonLd } from "@/components/json-ld";
import { graph, orgId } from "@/lib/schema";

// «Полезное» (spec §7.2). Пока материалов меньше трёх — noindex и вне sitemap (стандарт §2.8).
export const metadata: Metadata = {
  title: "Полезные материалы для диджеев — бесплатно",
  description: "Бесплатные программы и справочники для начинающих диджеев от школы диджеинга MIXER в Екатеринбурге: rekordbox, Serato DJ Lite, Mixxx, инструкция к CDJ-2000NXS2.",
  alternates: { canonical: "/materials/" },
  robots: { index: materialsIndexable, follow: true },
};

export default function Materials() {
  const types = [...new Set(materials.map((m) => m.type))];
  return (
    <>
      {materials.length > 0 && (
        <JsonLd data={graph({
          "@type": "CollectionPage", name: "Полезные материалы MIXER", url: `${site.url}/materials/`, publisher: { "@id": orgId },
          mainEntity: { "@type": "ItemList", itemListElement: materials.map((m, i) => ({ "@type": "ListItem", position: i + 1, name: m.title, url: m.url })) },
        })} />
      )}
      <section className="legal">
        <a href="/" className="back">← На главную</a>
        <h1>Полезные материалы для диджеев</h1>
        <p className="lead-text" style={{ marginTop: 16 }}>
          Подборка бесплатных программ и справочников, с которыми можно начать сводить дома, ещё до первого занятия. Всё по ссылкам — на сайтах разработчиков, без регистрации у нас. Скоро здесь появятся сэмплы, пресеты и плейлисты от преподавателей MIXER.
        </p>
      </section>
      <section className="sec">
        {types.length > 1 && <p className="eyebrow" style={{ marginBottom: 12 }}>Разделы: {types.join(" · ")}</p>}
        {materials.length ? (
          <div className="bento bento-mat">
            {materials.map((m) => (
              <article key={m.url} className="tile tile-white mat">
                <p className="eyebrow">{m.type}{m.author ? ` · ${m.author}` : ""}</p>
                <h2 className="h3">{m.title}</h2>
                <p>{m.description}</p>
                <a href={m.url} className="btn btn-primary" target="_blank" rel="noopener">{m.cta}</a>
              </article>
            ))}
          </div>
        ) : (
          <div className="tile tile-white mat-empty">
            <p className="h3">Скоро здесь</p>
            <p>Первые материалы появятся в этом разделе, а анонсы — в нашем <a href={site.contacts.telegram}>Telegram</a>.</p>
          </div>
        )}
        <div className="tile tile-white mat-howto">
          <h2 className="h3">С чего начать</h2>
          <ol className="dash-list">
            <li>Поставь rekordbox: в нём готовят треки для плееров Pioneer, на которых проходят занятия в MIXER.</li>
            <li>Если пульта дома нет, тренируйся в Serato DJ Lite или Mixxx: обе программы работают на обычном ноутбуке.</li>
            <li>Проверь темп и тональность треков в Tunebat и собери первый плейлист из треков с близким BPM.</li>
            <li>Открой инструкцию к CDJ‑2000NXS2 и найди кнопки Play, Cue и регулятор темпа — с них начинается первое занятие.</li>
          </ol>
        </div>
      </section>
    </>
  );
}
