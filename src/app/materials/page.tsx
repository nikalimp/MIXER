import type { Metadata } from "next";
import { materials, materialsIndexable } from "@/content/materials";
import { site } from "@/content/site";
import { JsonLd } from "@/components/json-ld";
import { graph, orgId } from "@/lib/schema";

// «Полезное» (spec §7.2). Пока материалов меньше трёх — noindex и вне sitemap (стандарт §2.8).
export const metadata: Metadata = {
  title: "Полезные материалы для диджеев — бесплатно",
  description: "Бесплатные материалы от преподавателей школы диджеинга MIXER в Екатеринбурге: сэмплы, пресеты, гайды, чек-листы и плейлисты для начинающих диджеев.",
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
          Бесплатные материалы от преподавателей MIXER: сэмплы, пресеты, гайды, чек-листы и плейлисты. Скачивай без регистрации и тренируйся дома.
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
      </section>
    </>
  );
}
