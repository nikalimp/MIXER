"use client";
// Шапка (Ник, v0.3): десктоп — логотип, якоря, «Записаться»; активный раздел подсвечивается белым.
// v0.8: шапка всегда компактная — по ширине содержимого, по центру.
// Телефон и планшет — только плавающая «Записаться». Без JS ссылки работают как обычные якоря.
import { useEffect, useState } from "react";
import { nav, site } from "@/content/site";

export function SiteHeader() {
  const [active, setActive] = useState("");
  useEffect(() => {
    const ids = nav.map((n) => n.href.split("#")[1]).filter(Boolean);
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    // Раздел активен, когда пересекает линию на 35 % высоты экрана
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id === "top" ? "" : e.target.id); }),
      { rootMargin: "-35% 0px -60% 0px" },
    );
    const top = document.getElementById("top"); // первый экран — ничего не подсвечено
    if (top) io.observe(top);
    els.forEach((el) => io.observe(el));
    const onTop = () => { if (window.scrollY < 200) setActive(""); };
    window.addEventListener("scroll", onTop, { passive: true });
    return () => { io.disconnect(); window.removeEventListener("scroll", onTop); };
  }, []);
  return (
    <>
      <header className="hdr">
        <a href="/" className="hdr-logo" aria-label="MIXER — наверх">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/img/mixer.svg" alt="MIXER" width={117} height={32} />
        </a>
        <nav aria-label="Разделы страницы">
          <ul className="hdr-links">
            {nav.map((n) => {
              const id = n.href.split("#")[1];
              return (
                <li key={n.href}>
                  <a href={n.href} className={active === id ? "on" : undefined} aria-current={active === id ? "true" : undefined}>{n.label}</a>
                </li>
              );
            })}
          </ul>
        </nav>
        <a href={site.cta.href} className="btn btn-primary">{site.cta.label}</a>
      </header>
      <a href={site.cta.href} className="btn btn-primary fab">{site.cta.label}</a>
    </>
  );
}
