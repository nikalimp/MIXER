"use client";
// Пасхалка (Ник, v1.0): логотип MIXER можно «поцарапать» — тянешь по горизонтали, буквы наклоняются, звучит скретч.
// Звук играет MixConsole (событие "mixer:scratch"). Вертикальная прокрутка на телефоне не мешает: touch-action: pan-y.
import { useRef } from "react";

const SEC_PER_WIDTH = 2.4; // протянуть логотип на всю ширину = 2,4 с трека

export function HeroLogo() {
  const ref = useRef<HTMLDivElement>(null);
  const st = useRef({ on: false, x: 0, t: 0, skew: 0 });

  const set = (skew: number, shift: number) => {
    const el = ref.current; if (!el) return;
    el.style.setProperty("--skew", `${skew.toFixed(2)}deg`);
    el.style.setProperty("--shift", `${shift.toFixed(1)}px`);
  };
  const down = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    st.current = { on: true, x: e.clientX, t: performance.now(), skew: 0 };
    ref.current?.classList.add("scratching");
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
  };
  const move = (e: React.PointerEvent) => {
    const s = st.current; if (!s.on || !ref.current) return;
    const now = performance.now(), dx = e.clientX - s.x, dt = Math.max((now - s.t) / 1000, 0.008);
    const dSec = (dx / ref.current.clientWidth) * SEC_PER_WIDTH;
    window.dispatchEvent(new CustomEvent("mixer:scratch", { detail: { dSec, dt } }));
    s.skew = Math.max(-18, Math.min(18, s.skew * 0.6 + (dx / dt) * -0.004));
    set(s.skew, Math.max(-24, Math.min(24, dx * 1.5)));
    s.x = e.clientX; s.t = now;
  };
  const up = () => { st.current.on = false; ref.current?.classList.remove("scratching"); set(0, 0); };

  return (
    <div ref={ref} className="hero-logo-wrap" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
      title="Попробуй поцарапать">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="hero-logo" src="/img/mixer.svg" alt="MIXER" width={1600} height={436} fetchPriority="high" draggable={false} />
    </div>
  );
}
