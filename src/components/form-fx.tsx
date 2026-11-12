"use client";
// Финальная стена (v0.6): чем больше полей заполнено, тем быстрее крутится пластинка (data-level 0–4).
// После отправки заявки — data-level="done": пластинка разгоняется, стикеры подпрыгивают.
import { useEffect, useRef } from "react";

export function FormFx() {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const wall = ref.current?.closest<HTMLElement>(".form-wall");
    if (!wall) return;
    const count = () => {
      if (wall.querySelector(".lead-done")) { wall.dataset.level = "done"; return; }
      const filled = [...wall.querySelectorAll<HTMLInputElement>("input[name=name], input[name=phone], input[name=telegram], input[name=email]")]
        .filter((i) => i.value.trim().length > 1).length;
      wall.dataset.level = String(filled);
    };
    wall.addEventListener("input", count);
    const mo = new MutationObserver(count);
    mo.observe(wall, { childList: true, subtree: true });
    return () => { wall.removeEventListener("input", count); mo.disconnect(); };
  }, []);
  return <span ref={ref} hidden />;
}
