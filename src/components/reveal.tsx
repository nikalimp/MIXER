"use client";
// Анимации появления (Ник, v0.3; стандарт §6 «Анимации — бюджет»): только opacity и transform,
// секция или сетка целиком, prefers-reduced-motion отключает всё. Без JS элементы видны сразу:
// класс .js ставится скриптом в <head>, скрытое состояние действует только при нём.
import { useEffect } from "react";

export function Reveal() {
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.querySelectorAll(".reveal, .reveal-stagger").forEach((el) => el.classList.add("in", "done"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) {
        const el = e.target; el.classList.add("in"); io.unobserve(el);
        setTimeout(() => el.classList.add("done"), 1400); // после появления hover без задержек
      } }),
      { rootMargin: "0px 0px -10% 0px", threshold: 0.08 },
    );
    document.querySelectorAll(".reveal, .reveal-stagger").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return null;
}
