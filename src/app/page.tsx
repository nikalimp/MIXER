/* eslint-disable @next/next/no-img-element */
import { home } from "@/content/home";
import { site } from "@/content/site";
import { materials } from "@/content/materials";
import { MixConsole } from "@/components/mix-console";
import { Slider } from "@/components/slider";
import { LeadForm } from "@/components/lead-form";
import { FaqList } from "@/components/faq";
import { JsonLd } from "@/components/json-ld";
import { faqSchema, graph, orgId } from "@/lib/schema";

// Главная — spec §5 (v0.2): без шапки, логотип во всю ширину, пульт, секции bento, форма внизу.
export default function Home() {
  const a = site.contacts.address;
  const courseSchema = home.courses.map((c) => ({
    "@type": "Course",
    name: `Курс «${c.name}»`,
    description: `${c.forWhom}. ${c.text}`,
    provider: { "@id": orgId },
    inLanguage: "ru",
    hasCourseInstance: { "@type": "CourseInstance", courseMode: "onsite", location: `${a.city}, ${a.street}`, courseWorkload: c.specs.join(", ") },
  }));
  return (
    <>
      <JsonLd data={graph(faqSchema(home.faq), ...courseSchema)} />

      {/* Первый экран */}
      <section className="hero" id="top" aria-labelledby="h1">
        <img className="hero-logo" src="/img/mixer.svg" alt="MIXER" width={1600} height={436} fetchPriority="high" />
        <h1 id="h1" className="hero-h1">{home.h1}</h1>
        <p className="hero-sub">{home.sub}</p>
        {site.features.mixGame && <MixConsole />}
      </section>

      {/* О школе */}
      <section className="sec" id="about" aria-labelledby="about-h">
        <div className="bento bento-about">
          <div className="tile tile-white about-main">
            <h2 id="about-h" className="h2">{home.about.title}</h2>
            <p className="lead-text">{home.answer}</p>
            <ul className="dash-list">{home.about.points.map((p) => <li key={p}>{p}</li>)}</ul>
          </div>
          {home.about.stats.map((s, k) => (
            <div key={s.value} className={`tile tile-black stat stat-${k + 1}`}>
              <p className="stat-value">{s.value}</p>
              <p className="stat-label">{s.label}</p>
            </div>
          ))}
          <div className="tile tile-photo about-slider"><Slider slides={home.slides} /></div>
          <div className="tile tile-blue about-cta">
            <h3 className="h3">{home.about.cta.title}</h3>
            <p>{home.about.cta.text}</p>
            <a href="#top" className="btn btn-light">{home.about.cta.button}</a>
          </div>
        </div>
      </section>

      {/* Курсы */}
      <section className="sec" id="courses" aria-labelledby="courses-h">
        <h2 id="courses-h" className="h2 sec-title">Курсы</h2>
        <div className="bento bento-courses">
          {home.courses.map((c, i) => (
            <article key={c.slug} className={`tile ${i === 0 ? "tile-blue course-big" : "tile-white"} course`}>
              {c.image && <img className="course-art" src={c.image.src} alt="" width={500} height={500} loading="lazy" />}
              <p className="eyebrow">{c.forWhom}</p>
              <h3 className="h3">Курс «{c.name}»</h3>
              <ul className="chips">{c.specs.map((s) => <li key={s}>{s}</li>)}</ul>
              <p className="course-text">{c.text}</p>
              {c.extra && <p className="course-extra">{c.extra}</p>}
              {c.price && <p className="course-price">{c.price}</p>}
            </article>
          ))}
        </div>
      </section>

      {/* Кто и на чём учит */}
      <section className="sec" id="team" aria-labelledby="team-h">
        <h2 id="team-h" className="h2 sec-title">Кто и на чём учит</h2>
        <div className="bento bento-team">
          {home.teachers.map((t) => (
            <article key={t.name} className="tile tile-white teacher">
              <img src={t.photo} alt={`${t.name} — ${t.role.toLowerCase()} MIXER`} width={600} height={600} loading="lazy" />
              <div>
                <p className="eyebrow">{t.role}</p>
                <h3 className="h3">{t.name}</h3>
                <p className="teacher-years">{t.years} <span>за пультом</span></p>
              </div>
            </article>
          ))}
          <div className="tile tile-black equipment">
            <h3 className="h3">Оборудование</h3>
            <ul className="eq-grid">
              {home.equipment.map((e) => (
                <li key={e.name}>
                  <img src={e.photo} alt={`Pioneer ${e.name}`} width={600} height={600} loading="lazy" />
                  <p className="eq-kind">{e.kind}</p>
                  <p className="eq-name">{e.name}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Дополнительные услуги */}
      <section className="sec" id="studio" aria-labelledby="studio-h">
        <h2 id="studio-h" className="h2 sec-title">Дополнительные услуги</h2>
        <div className="bento bento-services">
          {home.services.map((s) => (
            <div key={s.name} className={`tile ${s.accent ? "tile-blue" : "tile-white"} service`}>
              <h3 className="h3">{s.name}</h3>
              {s.note && <p>{s.note}</p>}
              <p className={/\d/.test(s.price) ? "service-price" : "service-price small"}>{s.price}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Полезное */}
      {site.features.materials && (
        <section className="sec" id="materials" aria-labelledby="mat-h">
          <div className="sec-head">
            <h2 id="mat-h" className="h2">Полезное</h2>
            <a href="/materials/" className="btn btn-dark">Все материалы</a>
          </div>
          {materials.length ? (
            <div className="bento bento-mat">
              {materials.slice(0, 3).map((m) => (
                <article key={m.url} className="tile tile-white mat">
                  <p className="eyebrow">{m.type}</p>
                  <h3 className="h3">{m.title}</h3>
                  <p>{m.description}</p>
                  <a href={m.url} className="btn btn-primary" target="_blank" rel="noopener">{m.cta}</a>
                </article>
              ))}
            </div>
          ) : (
            <div className="tile tile-white mat-empty">
              <p className="h3">Скоро здесь</p>
              <p>Преподаватели MIXER собирают бесплатные материалы: сэмплы, пресеты, гайды и плейлисты. Первые материалы появятся в этом разделе, а анонсы — в нашем <a href={site.contacts.telegram}>Telegram</a>.</p>
            </div>
          )}
        </section>
      )}

      {/* Вопросы */}
      <section className="sec" aria-labelledby="faq-h">
        <h2 id="faq-h" className="h2 sec-title">Частые вопросы</h2>
        <FaqList items={home.faq} />
      </section>

      {/* Контакты */}
      <section className="sec" id="contacts" aria-labelledby="contacts-h">
        <h2 id="contacts-h" className="h2 sec-title">Как найти нас</h2>
        <div className="bento bento-contacts">
          <div className="tile tile-white addr">
            <p className="eyebrow">{a.city}</p>
            <p className="addr-main">{a.streetShort}</p>
            <p className="addr-sub">{a.floor}</p>
            {site.contacts.hours && <p>{site.contacts.hours}</p>}
            <a className="btn btn-dark" href={site.contacts.yandexOrgUrl} target="_blank" rel="noopener">Маршрут в Яндекс Картах</a>
          </div>
          <div className="tile tile-photo map">
            <iframe loading="lazy" title="MIXER на карте: Екатеринбург, Восточная 56"
              src={`https://yandex.ru/map-widget/v1/org/mikser/${site.contacts.yandexOrgId}/?ll=${site.contacts.geo!.lng}%2C${site.contacts.geo!.lat}&z=17`} />
          </div>
          <div className="tile tile-blue socials">
            <p className="h3">Мы в соцсетях</p>
            <ul>{site.socials.map((s) => <li key={s.href}><a href={s.href} target="_blank" rel="noopener me">{s.label}</a></li>)}</ul>
          </div>
          <div className="tile tile-white reviews">
            <p className="h3">Отзывы</p>
            <iframe loading="lazy" title="Отзывы о MIXER на Яндекс Картах" src={`https://yandex.ru/maps-reviews-widget/${site.contacts.yandexOrgId}?comments`} />
          </div>
        </div>
      </section>

      {/* Форма — последняя секция */}
      <section className="sec" id="form" aria-labelledby="form-h">
        <div className="tile tile-blue form-tile">
          <div>
            <h2 id="form-h" className="h2">{home.form.title}</h2>
            <p className="lead-text">{home.form.text}</p>
          </div>
          <LeadForm source="form" button={home.form.button} dark />
        </div>
      </section>
    </>
  );
}
