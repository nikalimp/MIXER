"use client";
// Слайдер фото на CSS scroll-snap: листается пальцем без JS, стрелки и точки — улучшение.
import { useEffect, useRef, useState } from "react";

export function Slider({ slides }: { slides: { src: string; alt: string }[] }) {
  const track = useRef<HTMLDivElement>(null);
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = track.current; if (!t) return;
    const on = () => setI(Math.round(t.scrollLeft / t.clientWidth));
    t.addEventListener("scroll", on, { passive: true });
    return () => t.removeEventListener("scroll", on);
  }, []);
  const go = (d: number) => {
    const t = track.current; if (!t) return;
    const smooth = !matchMedia("(prefers-reduced-motion: reduce)").matches;
    t.scrollTo({ left: Math.max(0, Math.min(slides.length - 1, i + d)) * t.clientWidth, behavior: smooth ? "smooth" : "auto" });
  };
  return (
    <div className="slider" role="region" aria-roledescription="карусель" aria-label="Фото студии MIXER">
      <div ref={track} className="slider-track" tabIndex={0}>
        {slides.map((s, k) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={s.src} src={s.src} alt={s.alt} width={900} height={1125} loading={k === 0 ? "eager" : "lazy"} decoding="async" />
        ))}
      </div>
      <div className="slider-dots" aria-hidden="true">{slides.map((s, k) => <i key={s.src} className={k === i ? "on" : ""} />)}</div>
      <div className="slider-arrows">
        <button type="button" onClick={() => go(-1)} aria-label="Предыдущее фото">‹</button>
        <button type="button" onClick={() => go(1)} aria-label="Следующее фото">›</button>
      </div>
    </div>
  );
}
