import { site } from "@/content/site";

export function Footer() {
  const req = [site.legalName, site.legal.inn && `ИНН ${site.legal.inn}`, site.legal.ogrn && `${site.legalName.startsWith("ИП") ? "ОГРНИП" : "ОГРН"} ${site.legal.ogrn}`].filter(Boolean).join(" · ");
  return (
    <footer className="foot">
      <div className="foot-row">
        <span>© {site.copyright.since}–{new Date().getFullYear()} {site.copyright.holder}{req && ` · ${req}`}</span>
        <span className="foot-links">
          {site.socials.map((s) => <a key={s.href} href={s.href} target="_blank" rel="noopener me">{s.label}</a>)}
        </span>
        <span className="foot-links">
          <a href="/privacy-policy/">Политика конфиденциальности</a>
          <a href="/consent/">Согласие на обработку ПДн</a>
          <a href="https://nikalimp.ru" target="_blank" rel="noopener">Разработка сайта</a>
        </span>
      </div>
      <p className="foot-note">{site.metaNote}</p>
    </footer>
  );
}
