"use client";
// Игра «Сведи трек» (spec §7.1, v0.2): цельный пульт — дека A | микшер | дека B.
// Web Audio API без библиотек. Звук грузится только после первого клика.
// Удача — кроссфейдер переведён на B не дальше 1 с от 0:40 трека A → кнопка «Получить пробное занятие».
import { useCallback, useEffect, useRef, useState } from "react";
import { SevenSeg } from "./seven-seg";
import { LeadDialog } from "./lead-dialog";

const MIX_AT = 40; // секунда трека A, где нужно свести (слова «boom\u00A0boom»)
const WIN = 1; // окно удачи, ±с (решение Ника 2026-11-12)
const MISS_AFTER = 5; // через сколько секунд после 0:40 засчитываем «упустил»
const BPM_A = 117.5, BPM_B = 129.2;
const B_START_RATE = BPM_A / BPM_B, B_RAMP = 8; // дека B стартует в темпе A и за 8 с выходит на свой
const B_PLAY = 30;
const SEC_PER_REV = 1.8; // оборот джога = 1,8 с трека
const TRACKS = { A: "/audio/deck-a.mp3", B: "/audio/deck-b.mp3" };

type Phase = "idle" | "loading" | "playing" | "mixed" | "missed" | "end";
type DeckId = "A" | "B";
type Deck = {
  id: DeckId; buffer: AudioBuffer | null; rev: AudioBuffer | null; gain: GainNode | null; src: AudioBufferSourceNode | null;
  pos: number; rate: number; playing: boolean; t0: number; p0: number; scratching: boolean; wasPlaying: boolean;
  ramp: null | { from: number; to: number; t0: number; dur: number }; fader: number; bpm: number;
};

const goal = (name: string) => {
  try { (window as unknown as { ym?: (...a: unknown[]) => void }).ym?.(99510129, "reachGoal", name); } catch {}
};
const fmt = (s: number) => {
  const v = Math.max(0, s), m = Math.floor(v / 60), r = v - m * 60;
  return `${String(m).padStart(2, "0")}:${r.toFixed(1).padStart(4, "0")}`;
};

/* ---------- Геометрия пульта (viewBox 0 0 1000 440) ---------- */
const JOG = { A: { cx: 190, cy: 270 }, B: { cx: 810, cy: 270 } };
const FADER = { top: 150, bottom: 330, A: 452, B: 548 };
const XF = { left: 430, right: 570, y: 392 };

function Wave({ x, color, seed }: { x: number; color: string; seed: number }) {
  // Одна фигура вместо 58 прямоугольников — меньше узлов DOM, быстрее отрисовка (PageSpeed, стандарт §6.6)
  const d = Array.from({ length: 58 }, (_, i) => {
    const h = 6 + Math.abs(Math.sin(i * 1.7 + seed) * 16 + Math.sin(i * 0.37) * 7);
    return `M${(x + 10 + i * 5.2).toFixed(1)} ${(66 - h / 2).toFixed(1)}h3v${h.toFixed(1)}h-3z`;
  }).join("");
  return <path d={d} fill={color} opacity={0.85} />;
}

export function MixConsole() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [hint, setHint] = useState("Нажми ▶ на деке A — заиграет LOBODA. Переведи кроссфейдер на B на словах «boom\u00A0boom».");
  const [won, setWonState] = useState(false);
  const wonRef = useRef(false);
  const setWon = (v: boolean) => { wonRef.current = v; setWonState(v); };
  const [dialog, setDialog] = useState(false);
  const [timer, setTimer] = useState(fmt(MIX_AT));
  const [pulse, setPulse] = useState(false);

  const svg = useRef<SVGSVGElement>(null);
  const phaseRef = useRef<Phase>("idle");
  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const xfRef = useRef(0); // 0 — дека A, 1 — дека B
  const xfAnim = useRef<number | null>(null);
  const raf = useRef(0);
  const reduced = useRef(false);
  const lastTimer = useRef("");
  const mkDeck = (id: DeckId, bpm: number): Deck => ({
    id, buffer: null, rev: null, gain: null, src: null, pos: 0, rate: 1, playing: false, t0: 0, p0: 0,
    scratching: false, wasPlaying: false, ramp: null, fader: 0.85, bpm,
  });
  const decks = useRef<Record<DeckId, Deck>>({ A: mkDeck("A", BPM_A), B: mkDeck("B", BPM_B) });

  const setPhaseBoth = (p: Phase) => { phaseRef.current = p; setPhase(p); };

  /* ---------- Звук ---------- */
  const now = () => ctxRef.current?.currentTime ?? 0;
  const dur = (d: Deck) => d.buffer?.duration ?? 0;
  const clampPos = (d: Deck, p: number) => Math.max(0, Math.min(p, Math.max(0, dur(d) - 0.01)));
  const curPos = (d: Deck) => (d.playing && !d.scratching ? d.p0 + (now() - d.t0) * d.rate : d.pos);
  const stopSrc = (d: Deck) => {
    if (!d.src) return;
    try { d.src.onended = null; d.src.stop(); } catch {}
    d.src.disconnect(); d.src = null;
  };
  const play = (d: Deck) => {
    const ctx = ctxRef.current; if (!ctx || !d.buffer || !d.gain) return;
    stopSrc(d);
    const s = ctx.createBufferSource();
    s.buffer = d.buffer; s.playbackRate.value = d.rate; s.connect(d.gain);
    s.start(0, clampPos(d, d.pos));
    s.onended = () => { if (d.src === s) { d.pos = curPos(d); d.playing = false; d.src = null; } };
    d.src = s; d.t0 = ctx.currentTime; d.p0 = d.pos; d.playing = true;
  };
  const pause = (d: Deck) => { d.pos = curPos(d); stopSrc(d); d.playing = false; };
  const setRate = (d: Deck, r: number) => {
    if (d.playing && !d.scratching) { d.pos = curPos(d); d.p0 = d.pos; d.t0 = now(); }
    d.rate = r; d.src?.playbackRate.setValueAtTime(r, now());
  };
  // Громкость канала = фейдер × кривая кроссфейдера (равная мощность)
  const applyGains = useCallback(() => {
    const ctx = ctxRef.current; if (!ctx) return;
    const { A, B } = decks.current, x = xfRef.current;
    A.gain?.gain.setTargetAtTime(A.fader * Math.cos((x * Math.PI) / 2), ctx.currentTime, 0.015);
    B.gain?.gain.setTargetAtTime(B.fader * Math.sin((x * Math.PI) / 2), ctx.currentTime, 0.015);
  }, []);

  const reverse = (ctx: AudioContext, buf: AudioBuffer) => {
    const out = ctx.createBuffer(buf.numberOfChannels, buf.length, buf.sampleRate);
    for (let c = 0; c < buf.numberOfChannels; c++) {
      const a = buf.getChannelData(c), b = out.getChannelData(c);
      for (let i = 0, n = a.length; i < n; i++) b[i] = a[n - 1 - i];
    }
    return out;
  };

  /* ---------- Отрисовка кадра ---------- */
  const q = (sel: string) => svg.current?.querySelector(sel) as SVGElement | null;
  const draw = useCallback(() => {
    (["A", "B"] as DeckId[]).forEach((id) => {
      const d = decks.current[id];
      if (d.ramp) {
        const k = Math.min(1, (now() - d.ramp.t0) / d.ramp.dur);
        setRate(d, d.ramp.from + (d.ramp.to - d.ramp.from) * k);
        if (k >= 1) d.ramp = null;
      }
      const p = curPos(d), deg = (p / SEC_PER_REV) * 360, { cx, cy } = JOG[id];
      if (!reduced.current) q(`[data-platter=${id}]`)?.setAttribute("transform", `rotate(${deg % 360} ${cx} ${cy})`);
      q(`[data-played=${id}]`)?.setAttribute("width", String(dur(d) ? 300 * Math.min(1, p / dur(d)) : 0));
      const bpm = q(`[data-bpm=${id}]`); if (bpm) bpm.textContent = `${(d.bpm * d.rate).toFixed(1)} BPM`;
      q(`[data-fader=${id}]`)?.setAttribute("y", String(FADER.bottom - d.fader * (FADER.bottom - FADER.top) - 9));
    });
    q("[data-xf]")?.setAttribute("x", String(XF.left + xfRef.current * (XF.right - XF.left) - 14));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ---------- Игра ---------- */
  const endGame = useCallback((p: Phase, text: string) => {
    const ctx = ctxRef.current;
    (["A", "B"] as DeckId[]).forEach((id) => {
      const d = decks.current[id]; if (!ctx || !d.gain) return;
      d.gain.gain.cancelScheduledValues(ctx.currentTime);
      d.gain.gain.setValueAtTime(d.gain.gain.value, ctx.currentTime);
      d.gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1);
      setTimeout(() => pause(d), 1100);
    });
    setPhaseBoth(p); setHint(text); setPulse(false);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const mix = useCallback(() => {
    if (phaseRef.current !== "playing") return;
    const { A, B } = decks.current, ctx = ctxRef.current!;
    const delta = curPos(A) - MIX_AT, ad = Math.abs(delta);
    setPhaseBoth("mixed"); setPulse(false); goal("mix_switch");
    B.pos = 0; B.rate = B_START_RATE; play(B); B.ramp = { from: B_START_RATE, to: 1, t0: ctx.currentTime, dur: B_RAMP };
    applyGains();
    setTimeout(() => { if (xfRef.current > 0.95) pause(A); }, 1200);
    if (ad <= WIN) {
      setWon(true); goal("mix_win");
      setHint("Поздравляем, дарим вам бесплатное пробное занятие! Нажми кнопку под пультом.");
    } else {
      goal("mix_miss");
      setHint(`Мимо на ${ad.toFixed(1)} с: ${delta < 0 ? "рано" : "поздно"}. Попробуй ещё раз, чтобы получить пробное занятие.`);
    }
  }, [applyGains]); // eslint-disable-line react-hooks/exhaustive-deps

  const loop = useCallback(() => {
    cancelAnimationFrame(raf.current);
    const tick = () => {
      draw();
      const ph = phaseRef.current, { A, B } = decks.current;
      let t = lastTimer.current;
      if (ph === "playing") {
        const rem = MIX_AT - curPos(A);
        t = fmt(rem);
        setPulse(rem <= 3 && rem > -WIN);
        if (rem < -MISS_AFTER) {
          goal("mix_missed");
          endGame("missed", "Упустил момент — «boom\u00A0boom» прошёл. Попробуй ещё раз, чтобы получить пробное занятие.");
        }
      } else if (ph === "mixed") {
        const pb = curPos(B);
        t = fmt(B_PLAY - pb);
        if (pb >= B_PLAY) {
          setPhaseBoth("end");
          endGame("end", wonRef.current ? "Поздравляем, дарим вам бесплатное пробное занятие! Нажми кнопку под пультом." : "Попробуй ещё раз, чтобы получить пробное занятие.");
        }
      }
      if (t !== lastTimer.current) { lastTimer.current = t; setTimer(t); }
      if (phaseRef.current !== "idle") raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  }, [draw, endGame]);

  const start = useCallback(async () => {
    if (phaseRef.current === "loading") return;
    try {
      if (!ctxRef.current) {
        setPhaseBoth("loading"); setHint("Загружаем треки…");
        const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AC(); ctxRef.current = ctx;
        const master = ctx.createGain(); master.gain.value = 0.9; master.connect(ctx.destination); masterRef.current = master;
        const load = async (u: string) => ctx.decodeAudioData(await (await fetch(u)).arrayBuffer());
        const [a, b] = await Promise.all([load(TRACKS.A), load(TRACKS.B)]);
        const { A, B } = decks.current;
        A.buffer = a; B.buffer = b; A.rev = reverse(ctx, a); B.rev = reverse(ctx, b);
        [A, B].forEach((d) => { d.gain = ctx.createGain(); d.gain.gain.value = 0; d.gain.connect(master); });
      }
      await ctxRef.current.resume();
    } catch {
      setPhaseBoth("idle"); setHint("Треки не загрузились. Проверь интернет и нажми ▶ ещё раз.");
      return;
    }
    const { A, B } = decks.current;
    [A, B].forEach((d) => { stopSrc(d); d.playing = false; d.scratching = false; d.pos = 0; d.rate = 1; d.ramp = null; });
    xfRef.current = 0; applyGains();
    setPhaseBoth("playing"); goal("mix_start");
    // Таймер и кроссфейдер должны быть видны одновременно: если пульт не целиком на экране — показать его
    const r = svg.current?.getBoundingClientRect();
    if (r && (r.top < 0 || r.bottom > window.innerHeight - 90)) {
      svg.current?.closest(".mix")?.scrollIntoView({ block: "center", behavior: reduced.current ? "auto" : "smooth" });
    }
    setHint("Играет LOBODA. Переведи кроссфейдер на B на словах «boom\u00A0boom» — следи за таймером.");
    play(A);
    loop();
  }, [applyGains, loop]);

  /* ---------- Кроссфейдер: клик — плавный переход, перетаскивание — вручную ---------- */
  const animateXf = (to: number) => {
    if (xfAnim.current) cancelAnimationFrame(xfAnim.current);
    const from = xfRef.current, t0 = performance.now(), len = 450;
    const step = () => {
      const k = Math.min(1, (performance.now() - t0) / len);
      xfRef.current = from + (to - from) * (1 - Math.pow(1 - k, 3));
      applyGains(); draw();
      if (k < 1) xfAnim.current = requestAnimationFrame(step);
    };
    xfAnim.current = requestAnimationFrame(step);
  };
  const svgPoint = (e: PointerEvent | React.PointerEvent) => {
    const s = svg.current!, pt = s.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    return pt.matrixTransform(s.getScreenCTM()!.inverse());
  };

  useEffect(() => {
    reduced.current = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const s = svg.current!;
    const off: (() => void)[] = [];
    const on = <K extends keyof SVGElementEventMap>(el: Element | null, ev: K, fn: (e: SVGElementEventMap[K]) => void) => {
      if (!el) return; el.addEventListener(ev, fn as EventListener); off.push(() => el.removeEventListener(ev, fn as EventListener));
    };

    // Джоги: скретч
    (["A", "B"] as DeckId[]).forEach((id) => {
      const d = decks.current[id], jog = s.querySelector(`[data-jog=${id}]`);
      let last = 0, lastT = 0;
      const ang = (e: PointerEvent) => { const p = svgPoint(e); return Math.atan2(p.y - JOG[id].cy, p.x - JOG[id].cx); };
      on(jog, "pointerdown", (e) => {
        const ctx = ctxRef.current; if (!ctx || !d.buffer) return;
        e.preventDefault(); (jog as Element).setPointerCapture(e.pointerId);
        d.pos = curPos(d); d.wasPlaying = d.playing; stopSrc(d); d.playing = false; d.scratching = true;
        last = ang(e); lastT = performance.now();
      });
      on(jog, "pointermove", (e) => {
        const ctx = ctxRef.current; if (!d.scratching || !ctx || !d.buffer || !d.rev || !d.gain) return;
        const a = ang(e), t = performance.now();
        let da = a - last; if (da > Math.PI) da -= 2 * Math.PI; if (da < -Math.PI) da += 2 * Math.PI;
        const dt = Math.max((t - lastT) / 1000, 0.008), dSec = (da / (2 * Math.PI)) * SEC_PER_REV, from = d.pos;
        d.pos = clampPos(d, d.pos + dSec);
        const v = dSec / dt, rate = Math.min(Math.abs(v), 4);
        if (rate > 0.05) {
          const src = ctx.createBufferSource(), g = ctx.createGain(), n = ctx.currentTime, len = Math.max(dt, 0.025);
          src.buffer = v > 0 ? d.buffer : d.rev; src.playbackRate.value = rate;
          g.gain.setValueAtTime(0, n); g.gain.linearRampToValueAtTime(1, n + 0.004);
          g.gain.setValueAtTime(1, n + len - 0.006); g.gain.linearRampToValueAtTime(0, n + len);
          src.connect(g).connect(d.gain);
          src.start(n, Math.max(0, v > 0 ? from : d.buffer.duration - from), len * rate + 0.01);
        }
        last = a; lastT = t; draw();
      });
      const up = () => { if (!d.scratching) return; d.scratching = false; if (d.wasPlaying) play(d); };
      on(jog, "pointerup", up); on(jog, "pointercancel", up);
    });

    // Фейдеры громкости каналов
    (["A", "B"] as DeckId[]).forEach((id) => {
      const d = decks.current[id], el = s.querySelector(`[data-fader-hit=${id}]`);
      let drag = false;
      const set = (e: PointerEvent) => {
        const p = svgPoint(e);
        d.fader = Math.max(0, Math.min(1, (FADER.bottom - p.y) / (FADER.bottom - FADER.top)));
        applyGains(); draw();
      };
      on(el, "pointerdown", (e) => { drag = true; (el as Element).setPointerCapture(e.pointerId); set(e); });
      on(el, "pointermove", (e) => { if (drag) set(e); });
      on(el, "pointerup", () => { drag = false; });
      on(el, "keydown", (e) => {
        const k = (e as KeyboardEvent).key;
        if (k === "ArrowUp" || k === "ArrowDown") { e.preventDefault(); d.fader = Math.max(0, Math.min(1, d.fader + (k === "ArrowUp" ? 0.05 : -0.05))); applyGains(); draw(); }
      });
    });

    // Кроссфейдер
    const xf = s.querySelector("[data-xf-hit]");
    let xDrag = false, moved = false;
    on(xf, "pointerdown", (e) => {
      if (phaseRef.current !== "playing" && phaseRef.current !== "mixed") return;
      xDrag = true; moved = false; (xf as Element).setPointerCapture(e.pointerId);
    });
    on(xf, "pointermove", (e) => {
      if (!xDrag) return; moved = true;
      if (xfAnim.current) cancelAnimationFrame(xfAnim.current);
      const p = svgPoint(e);
      xfRef.current = Math.max(0, Math.min(1, (p.x - XF.left) / (XF.right - XF.left)));
      if (xfRef.current > 0.5 && phaseRef.current === "playing") mix();
      applyGains(); draw();
    });
    on(xf, "pointerup", () => {
      if (!xDrag) return; xDrag = false;
      if (!moved && phaseRef.current === "playing") { mix(); animateXf(1); }
    });
    on(xf, "keydown", (e) => {
      const k = (e as KeyboardEvent).key;
      if ((k === "Enter" || k === " " || k === "ArrowRight") && phaseRef.current === "playing") { e.preventDefault(); mix(); animateXf(1); }
    });

    const onKey = (e: KeyboardEvent) => {
      const tag = (document.activeElement?.tagName ?? "").toUpperCase();
      if (e.code === "Space" && phaseRef.current === "playing" && !["INPUT", "TEXTAREA", "BUTTON", "A", "SELECT"].includes(tag)) {
        e.preventDefault(); mix(); animateXf(1);
      }
    };
    document.addEventListener("keydown", onKey);
    const onVis = () => { const c = ctxRef.current; if (c) { if (document.hidden) c.suspend(); else c.resume(); } };
    document.addEventListener("visibilitychange", onVis);
    draw();
    return () => {
      off.forEach((f) => f()); document.removeEventListener("keydown", onKey); document.removeEventListener("visibilitychange", onVis);
      cancelAnimationFrame(raf.current); ctxRef.current?.close();
    };
  }, [mix]); // eslint-disable-line react-hooks/exhaustive-deps

  const playDeck = (id: DeckId) => {
    const ph = phaseRef.current;
    if (id === "A" && (ph === "idle" || ph === "missed" || ph === "end")) { setWon(false); start(); return; }
    const d = decks.current[id]; if (!d.buffer) return;
    if ((id === "A" && ph === "playing") || (id === "B" && ph === "mixed")) { if (d.playing) pause(d); else play(d); }
  };
  const canRestart = phase === "idle" || phase === "missed" || phase === "end" || (phase === "mixed" && !won);

  /* ---------- Разметка ---------- */
  const deck = (id: DeckId, x: number, color: string, title: string) => {
    const { cx, cy } = JOG[id];
    return (
      <g>
        <rect x={x + 16} y={22} width={330} height={84} rx={10} fill="#090b14" stroke="#2c2e3a" />
        <clipPath id={`scr${id}`}><rect x={x + 20} y={26} width={322} height={76} rx={7} /></clipPath>
        <g clipPath={`url(#scr${id})`}>
          <Wave x={x + 14} color={color} seed={id === "A" ? 1 : 5} />
          <rect data-played={id} x={x + 20} y={26} width={0} height={76} fill="#000" opacity={0.45} />
        </g>
        <rect x={x + 180} y={44} width={2} height={58} fill="#fff" />
        <text x={x + 28} y={40} fill="#fff" fontSize={10} fontWeight={700}>{id} · {title}</text>
        <text data-bpm={id} x={x + 336} y={98} fill="#fff" fontSize={10} textAnchor="end">—</text>
        <g data-jog={id} style={{ cursor: "grab", touchAction: "none" }} role="img" aria-label={`Джог деки ${id}: зажми и крути — скретч`}>
          <circle cx={cx} cy={cy} r={120} fill={`url(#rim)`} />
          <circle cx={cx} cy={cy} r={105} fill="#14151c" />
          <g data-platter={id}>
            <circle cx={cx} cy={cy} r={86} fill="none" stroke="#2a2b36" strokeWidth={24} strokeDasharray="2 9.26" />
            <circle cx={cx} cy={cy} r={64} fill="#0f1017" stroke="#2a2b36" />
            <rect x={cx - 2} y={cy - 104} width={4} height={24} rx={2} fill="#fff" opacity={0.9} />
          </g>
          <circle cx={cx} cy={cy} r={40} fill="#090b14" stroke={color} strokeWidth={3} />
          <text x={cx} y={cy + 5} fill="#fff" fontSize={14} fontWeight={800} textAnchor="middle">{id}</text>
        </g>
        <g role="button" tabIndex={0} aria-label={id === "A" ? "Play деки A — начать игру" : "Play / пауза деки B"} style={{ cursor: "pointer" }}
          onClick={() => playDeck(id)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); playDeck(id); } }}>
          <circle cx={id === "A" ? x + 40 : x + 324} cy={398} r={22} fill="#14151c" stroke="#2fd36b" strokeWidth={3} />
          <path d={id === "A" ? `M${x + 33} 389 L${x + 33} 407 L${x + 49} 398 Z` : `M${x + 317} 389 L${x + 317} 407 L${x + 333} 398 Z`} fill="#2fd36b" />
        </g>
      </g>
    );
  };

  return (
    <div className="mix">
      <p className="mix-hint" aria-live="polite">{hint}</p>
      <svg ref={svg} viewBox="0 0 1000 440" className="mix-svg" role="group" aria-label="Пульт: игра «Сведи трек»">
        <defs>
          <radialGradient id="rim" cx="50%" cy="40%" r="60%"><stop offset="0" stopColor="#e9ecf2" /><stop offset=".55" stopColor="#9a9ea8" /><stop offset="1" stopColor="#4a4d56" /></radialGradient>
        </defs>
        <rect x={2} y={2} width={996} height={436} rx={28} fill="var(--deck)" stroke="#33343f" strokeWidth={2} />
        <line x1={380} y1={16} x2={380} y2={424} stroke="#0b0c12" strokeWidth={3} />
        <line x1={620} y1={16} x2={620} y2={424} stroke="#0b0c12" strokeWidth={3} />
        {deck("A", 0, "#6f6bff", "LOBODA feat. PHARAOH — BOOM BOOM")}
        {deck("B", 620, "#FF8562", "SIDODGI, DUBOSHIT — BOOM")}
        {/* Микшер */}
        <g>
          <rect x={398} y={22} width={204} height={84} rx={10} fill="#060708" stroke="#2c2e3a" />
          <SevenSeg text={timer} x={412} y={42} h={46} on="#FF8562" off="#2a1a12" />
          <text x={500} y={134} fill="#9a9ea8" fontSize={9} textAnchor="middle">ДО «BOOM BOOM»</text>
          {(["A", "B"] as DeckId[]).map((id) => (
            <g key={id}>
              <rect x={FADER[id] - 4} y={FADER.top} width={8} height={FADER.bottom - FADER.top} rx={4} fill="#0b0c12" />
              <rect data-fader={id} x={FADER[id] - 18} y={FADER.top} width={36} height={18} rx={4} fill="#cfd2d8" />
              <rect x={FADER[id] - 15} y={FADER.top} width={30} height={2} fill="#666" opacity={0} />
              <text x={FADER[id]} y={FADER.bottom + 22} fill="#9a9ea8" fontSize={10} textAnchor="middle">{id}</text>
              <rect data-fader-hit={id} x={FADER[id] - 34} y={FADER.top - 14} width={68} height={FADER.bottom - FADER.top + 28} fill="transparent"
                style={{ cursor: "ns-resize", touchAction: "none" }} tabIndex={0} role="slider" aria-label={`Громкость канала ${id}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={85} />
            </g>
          ))}
          <rect x={XF.left - 6} y={XF.y - 4} width={XF.right - XF.left + 12} height={8} rx={4} fill="#0b0c12" />
          <rect data-xf x={XF.left - 14} y={XF.y - 15} width={28} height={30} rx={5} fill={pulse ? "#FF8562" : "#cfd2d8"} className={pulse ? "mix-pulse" : undefined} />
          <text x={XF.left - 24} y={XF.y + 4} fill="#9a9ea8" fontSize={10} textAnchor="end">A</text>
          <text x={XF.right + 24} y={XF.y + 4} fill="#9a9ea8" fontSize={10}>B</text>
          <rect data-xf-hit x={XF.left - 34} y={XF.y - 50} width={XF.right - XF.left + 68} height={96} fill="transparent"
            style={{ cursor: "ew-resize", touchAction: "none" }} tabIndex={0} role="button" aria-label="Кроссфейдер: перевести на деку B — свести трек" />
        </g>
      </svg>
      <div className="mix-actions">
        {canRestart && phase !== "idle" && (
          <button type="button" className="btn btn-dark" onClick={() => { setWon(false); start(); }}>Ещё раз</button>
        )}
        {phase === "idle" && <button type="button" className="btn btn-dark" onClick={start}>Играть ▶</button>}
        {phase === "playing" && (
          <button type="button" className="btn btn-dark mix-mobile" onClick={() => { mix(); animateXf(1); }}>Свести на B</button>
        )}
        <button type="button" className="btn btn-primary" disabled={!won} onClick={() => { goal("mix_cta"); setDialog(true); }}>
          Получить пробное занятие
        </button>
      </div>
      <p className="mix-note">{won ? "Пробное занятие — твоё. Оставь контакты, и мы подберём время." : "Кнопка станет активной после удачного сведения — попади в «boom\u00A0boom» с точностью до 1 секунды."}</p>
      <LeadDialog open={dialog} onClose={() => setDialog(false)} />
    </div>
  );
}
