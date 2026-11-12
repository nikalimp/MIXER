/* eslint-disable @next/next/no-img-element */
import { home } from "@/content/home";
import { site } from "@/content/site";
import { materials, materialsHowTo } from "@/content/materials";
import { MixConsole } from "@/components/mix-console";
import { ScrollFill } from "@/components/scroll-fill";
import { LeadForm } from "@/components/lead-form";
import { FaqList } from "@/components/faq";
import { JsonLd } from "@/components/json-ld";
import { faqSchema, graph, orgId } from "@/lib/schema";

// Главная — spec §5 (v0.3): шапка на десктопе, логотип во всю ширину, пульт, секции bento, форма внизу.
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

      {/* О школе — манифест с заполнением по скроллу, цифры в той же плитке, коллаж из 7 фото (v0.6) */}
      <section className="sec" id="about" aria-labelledby="about-h">
        <div className="tile tile-white about-main">
          <p className="eyebrow">О школе</p>
          <ScrollFill id="about-h" className="h2 about-manifest" text={home.about.manifest} />
          <div className="about-body">
            <p className="lead-text">{home.answer}</p>
            <div className="about-stats">
              {home.about.stats.map((st, k) => (
                <div key={st.value} className={`stat stat-${k + 1}`}>
                  {k === 0 && <img className="g g-crown" src="/graffiti/doodle-crown.svg" alt="" width={220} height={160} loading="lazy" />}
                  {k === 1 && <img className="g g-circle" src="/graffiti/doodle-circle.svg" alt="" width={420} height={160} loading="lazy" />}
                  <p className="stat-value">{st.value}</p>
                  <p className="stat-label">{st.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="collage reveal-stagger">
          {home.slides.map((sl, k) => (
            <figure key={sl.src} className={`collage-ph ph-${k + 1}`}>
              <img src={sl.src} alt={sl.alt} width={900} height={1125} loading="lazy" decoding="async" />
            </figure>
          ))}
        </div>
      </section>

      {/* Курсы */}
      <section className="sec" id="courses" aria-labelledby="courses-h">
        <div className="sec-title reveal g-wrap">
          <h2 id="courses-h" className="h2">Курсы</h2>
          <img className="g g-star" src="/graffiti/doodle-star.svg" alt="" width={160} height={160} loading="lazy" />
        </div>
        <div className="bento bento-courses reveal-stagger">
          {home.courses.map((c, i) => (
            <article key={c.slug} className={`tile ${i === 0 ? "tile-blue course-big" : "tile-white"} course`}>
              <img className="course-graf spray" src={`/graffiti/throwup-${c.graffiti}.svg`} alt="" loading="lazy" />
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
        <h2 id="team-h" className="h2 sec-title reveal">Кто и на чём учит</h2>
        <div className="bento bento-team reveal-stagger">
          {home.teachers.map((t) => (
            <article key={t.name} className="tile tile-white teacher">
              <div className="teacher-ph">
                <img src={t.photo} alt={`${t.name} — ${t.role.toLowerCase()} MIXER`} width={800} height={1000} loading="lazy" />
                <img className="teacher-tag spray" src={`/graffiti/tag-${t.photo.match(/teacher-(\w+)/)![1]}.svg`} alt="" loading="lazy" />
              </div>
              <div className="teacher-info">
                <h3 className="h3">{t.name}</h3>
                <ul className="teacher-tags">
                  <li>{t.role}</li>
                  <li>{t.years} за пультом</li>
                </ul>
              </div>
            </article>
          ))}
          <h3 className="h3 eq-title">Оборудование</h3>
          {home.equipment.map((e) => (
            <div key={e.name} className="tile tile-white eq">
              <img src={e.photo} alt={`Pioneer ${e.name}`} width={600} height={600} loading="lazy" />
              <p className="eq-kind">{e.kind}</p>
              <p className="eq-name">{e.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Дополнительные услуги */}
      <section className="sec" id="studio" aria-labelledby="studio-h">
        <h2 id="studio-h" className="h2 sec-title reveal">Дополнительные услуги</h2>
        <div className="bento bento-services reveal-stagger">
          {home.services.map((s) => (
            <div key={s.name} className={`tile ${s.accent ? "tile-blue" : "tile-white"} service`}>
              <h3 className="h3">{s.name}</h3>
              {s.note && <p>{s.note}</p>}
              <p className={/\d/.test(s.price) ? "service-price" : "service-price small"}>{s.price}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Полезное — всё на главной (v0.5) */}
      {site.features.materials && materials.length > 0 && (
        <section className="sec" id="materials" aria-labelledby="mat-h">
          <h2 id="mat-h" className="h2 sec-title reveal">Полезное</h2>
          <div className="bento bento-mat reveal-stagger">
            {materials.map((m) => (
              <article key={m.url} className="tile tile-white mat">
                <p className="eyebrow">{m.type}{m.author ? ` · ${m.author}` : ""}</p>
                <h3 className="h3">{m.title}</h3>
                <p>{m.description}</p>
                <a href={m.url} className="btn btn-primary" target="_blank" rel="noopener">{m.cta}</a>
              </article>
            ))}
            <div className="tile tile-blue mat mat-howto">
              <h3 className="h3">С чего начать</h3>
              <ol className="steps">{materialsHowTo.map((t) => <li key={t}>{t}</li>)}</ol>
            </div>
          </div>
        </section>
      )}

      {/* Вопросы */}
      <section className="sec" aria-labelledby="faq-h">
        <h2 id="faq-h" className="h2 sec-title reveal">Частые вопросы</h2>
        <div className="reveal"><FaqList items={home.faq} /></div>
      </section>

      {/* Контакты */}
      <section className="sec" id="contacts" aria-labelledby="contacts-h">
        <h2 id="contacts-h" className="h2 sec-title reveal">Как найти нас</h2>
        <div className="bento bento-contacts reveal-stagger">
          <div className="tile tile-white addr">
            <p className="eyebrow">{a.city}</p>
            <p className="addr-main">{a.streetShort}</p>
            <p className="addr-sub">{a.floor}</p>
            {site.contacts.hours && <p>{site.contacts.hours}</p>}
            <a className="btn btn-dark" href={site.contacts.yandexOrgUrl} target="_blank" rel="noopener">Маршрут в Яндекс Картах</a>
          </div>
          {site.socials.map((s, i) => (
            <a key={s.href} className={`tile social social-${i + 1}`} href={s.href} target="_blank" rel="noopener me">
              <span className="eyebrow">Мы в соцсетях</span>
              <span className="social-name">{s.label}</span>
              <span className="social-handle">@{s.href.replace(/\/$/, "").split("/").pop()}</span>
              <span className="social-arrow" aria-hidden="true">↗</span>
            </a>
          ))}
        </div>
      </section>

      {/* Форма — синяя плитка, поля в один ряд (v0.7) */}
      <section className="sec" id="form" aria-labelledby="form-h">
        <div className="tile tile-blue form-tile reveal">
          <div className="form-head">
            <h2 id="form-h" className="h2">{home.form.title}</h2>
            <p className="lead-text">{home.form.text}</p>
          </div>
          <LeadForm source="form" button={home.form.button} dark row />
        </div>
      </section>
    </>
  );
}
