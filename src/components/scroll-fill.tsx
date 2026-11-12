"use client";
// Заголовок, который «заполняется» по мере прокрутки (Ник, v0.4).
// Слова отрисованы в HTML сразу (текст виден поисковикам и без JS). Без JS и при «уменьшить движение» — залит целиком.
import { useEffect, useRef } from "react";

export function ScrollFill({ text, id, className }: { text: string; id?: string; className?: string }) {
  const ref = useRef<HTMLHeadingElement>(null);
  // Делим на слова и по обычным, и по неразрывным пробелам; пробел остаётся в конце слова, так что неразрывность Типографа сохраняется
  const words = text.match(/[^ \u00a0]+[ \u00a0]?/g) ?? [text];

  useEffect(() => {
    const el = ref.current; if (!el) return;
    const spans = [...el.querySelectorAll<HTMLSpanElement>(".fill-w")];
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { spans.forEach((s) => s.classList.add("on")); return; }
    let raf = 0, last = -1;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect(), vh = window.innerHeight;
      // 0 — верх заголовка на 90 % высоты экрана, 1 — низ заголовка на 45 %
      const p = Math.min(1, Math.max(0, (vh * 0.9 - r.top) / (vh * 0.45 + r.height)));
      const n = Math.round(p * spans.length);
      if (n === last) return;
      last = n;
      spans.forEach((s, i) => s.classList.toggle("on", i < n));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    el.classList.add("fill-ready");
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); cancelAnimationFrame(raf); };
  }, []);

  return (
    <h2 ref={ref} id={id} className={`scroll-fill ${className ?? ""}`}>
      {words.map((w, i) => (
        <span key={i} className="fill-w">{w}</span>
      ))}
    </h2>
  );
}
