// Нижняя панель (decisions 2026-11-12): десктоп — логотип, якоря, «Записаться»; телефон и планшет — только плавающая «Записаться».
// Без JavaScript: position: fixed, якоря — обычные ссылки.
import { nav, site } from "@/content/site";

export function BottomBar() {
  return (
    <>
      <nav className="bbar" aria-label="Разделы страницы">
        <a href="/" className="bbar-logo" aria-label="MIXER — наверх">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/img/mixer.svg" alt="MIXER" width={117} height={32} />
        </a>
        <ul className="bbar-links">
          {nav.map((n) => <li key={n.href}><a href={n.href}>{n.label}</a></li>)}
        </ul>
        <a href={site.cta.href} className="btn btn-primary">{site.cta.label}</a>
      </nav>
      <a href={site.cta.href} className="btn btn-primary fab">{site.cta.label}</a>
    </>
  );
}
