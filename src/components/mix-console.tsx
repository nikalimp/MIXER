"use client";
// Игра «Сведи трек» (spec §7.1, v0.4: корпус пульта — фон контейнера .mix-board, без отдельной плашки в SVG): пульт — дека A | центр (семисегментный таймер + большая круглая кнопка) | дека B.
// Кнопка: «Начать» → «Свести» → «Записаться» (удача, ±1 с от 0:40) или «Ещё раз» (промах).
// Web Audio API без библиотек. Звук грузится только после первого нажатия. Джоги — скретч.
import { useCallback, useEffect, useRef, useState } from "react";
import { SevenSeg } from "./seven-seg";
import { LeadDialog } from "./lead-dialog";

const MIX_AT = 40; // секунда трека A, где нужно свести (слова «boom boom»)
const WIN = 1; // окно удачи, ±с (решение Ника 2026-11-12)
const MISS_AFTER = 5; // через сколько секунд после 0:40 засчитываем «упустил»
const BPM_A = 117.5, BPM_B = 129.2;
const B_START_RATE = BPM_A / BPM_B, B_RAMP = 8; // дека B стартует в темпе A и за 8 с выходит на свой
const B_PLAY = 30;
const SEC_PER_REV = 1.8; // оборот джога = 1,8 с трека
const XFADE = 0.6; // длительность кроссфейда, с
const TRACKS = { A: "/audio/deck-a.mp3", B: "/audio/deck-b.mp3" };

type Phase = "idle" | "loading" | "playing" | "won" | "lost";
type DeckId = "A" | "B";
type Deck = {
  id: DeckId; buffer: AudioBuffer | null; rev: AudioBuffer | null; gain: GainNode | null; src: AudioBufferSourceNode | null;
  pos: number; rate: number; playing: boolean; t0: number; p0: number; scratching: boolean; wasPlaying: boolean;
  ramp: null | { from: number; to: number; t0: number; dur: number }; bpm: number;
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

function Wave({ x, color, seed }: { x: number; color: string; seed: number }) {
  const d = Array.from({ length: 58 }, (_, i) => {
    const h = 6 + Math.abs(Math.sin(i * 1.7 + seed) * 16 + Math.sin(i * 0.37) * 7);
    return `M${(x + 10 + i * 5.2).toFixed(1)} ${(66 - h / 2).toFixed(1)}h3v${h.toFixed(1)}h-3z`;
  }).join("");
  return <path d={d} fill={color} opacity={0.85} />;
}

const LABEL: Record<Phase, string> = { idle: "Начать", loading: "Загрузка…", playing: "Свести", won: "Записаться", lost: "Ещё раз" };

export function MixConsole() {
  const [phase, setPhaseState] = useState<Phase>("idle");
  const [status, setStatus] = useState("ДО «BOOM BOOM»");
  const [live, setLive] = useState("");
  const [dialog, setDialog] = useState(false);
  const [timer, setTimer] = useState(fmt(MIX_AT));
  const [pulse, setPulse] = useState(false);

  const svg = useRef<SVGSVGElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const phaseRef = useRef<Phase>("idle");
  const mixedRef = useRef(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const raf = useRef(0);
  const reduced = useRef(false);
  const lastTimer = useRef("");
  const lastPulse = useRef(false);
  const timers = useRef<number[]>([]); // отложенные паузы; сбрасываются при новом старте
  const later = (fn: () => void, ms: number) => { timers.current.push(window.setTimeout(fn, ms)); };
  const mkDeck = (id: DeckId, bpm: number): Deck => ({
    id, buffer: null, rev: null, gain: null, src: null, pos: 0, rate: 1, playing: false, t0: 0, p0: 0,
    scratching: false, wasPlaying: false, ramp: null, bpm,
  });
  const decks = useRef<Record<DeckId, Deck>>({ A: mkDeck("A", BPM_A), B: mkDeck("B", BPM_B) });
  const setPhase = (p: Phase) => { phaseRef.current = p; setPhaseState(p); };
  const pulseOn = (v: boolean) => { if (v !== lastPulse.current) { lastPulse.current = v; setPulse(v); } };

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
  const fade = (d: Deck, to: number, len: number) => {
    const g = d.gain?.gain, t = now(); if (!g) return;
    g.cancelScheduledValues(t); g.setValueAtTime(g.value, t); g.linearRampToValueAtTime(to, t + len);
  };
  const reverse = (ctx: AudioContext, buf: AudioBuffer) => {
    const out = ctx.createBuffer(buf.numberOfChannels, buf.length, buf.sampleRate);
    for (let c = 0; c < buf.numberOfChannels; c++) {
      const a = buf.getChannelData(c), b = out.getChannelData(c);
      for (let i = 0, n = a.length; i < n; i++) b[i] = a[n - 1 - i];
    }
    return out;
  };

  /* ---------- Кадр ---------- */
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
      q(`[data-played=${id}]`)?.setAttribute("width", String(dur(d) ? 322 * Math.min(1, p / dur(d)) : 0));
      const bpm = q(`[data-bpm=${id}]`); if (bpm) bpm.textContent = `${(d.bpm * d.rate).toFixed(1)} BPM`;
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const stopAll = useCallback((len = 1) => {
    (["A", "B"] as DeckId[]).forEach((id) => { const d = decks.current[id]; fade(d, 0, len); later(() => pause(d), len * 1000 + 100); });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ---------- Сведение ---------- */
  const mix = useCallback(() => {
    if (phaseRef.current !== "playing" || mixedRef.current) return;
    mixedRef.current = true;
    const { A, B } = decks.current, ctx = ctxRef.current!;
    const delta = curPos(A) - MIX_AT, ad = Math.abs(delta);
    pulseOn(false); goal("mix_switch");
    B.pos = 0; B.rate = B_START_RATE; B.gain!.gain.setValueAtTime(0, ctx.currentTime); play(B);
    B.ramp = { from: B_START_RATE, to: 1, t0: ctx.currentTime, dur: B_RAMP };
    fade(B, 1, XFADE); fade(A, 0, XFADE); later(() => pause(A), XFADE * 1000 + 100);
    if (ad <= WIN) {
      setPhase("won"); goal("mix_win");
      setStatus("ИДЕАЛЬНО!");
      setLive("Поздравляем, дарим вам бесплатное пробное занятие. Нажмите «Записаться».");
    } else {
      setPhase("lost"); goal("mix_miss");
      setStatus(`${delta < 0 ? "РАНО" : "ПОЗДНО"} НА ${ad.toFixed(1)} С`);
      setLive(`Мимо на ${ad.toFixed(1)} секунды. Нажмите «Ещё раз».`);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loop = useCallback(() => {
    cancelAnimationFrame(raf.current);
    const tick = () => {
      draw();
      const { A, B } = decks.current;
      let t = lastTimer.current;
      if (phaseRef.current === "playing") {
        const rem = MIX_AT - curPos(A);
        t = fmt(rem);
        pulseOn(rem <= 3 && rem > -WIN);
        if (rem < -MISS_AFTER) {
          goal("mix_missed"); setPhase("lost"); pulseOn(false); stopAll();
          setStatus("УПУСТИЛ МОМЕНТ"); setLive("«Boom boom» прошёл. Нажмите «Ещё раз».");
        }
      } else if (mixedRef.current) {
        const pb = curPos(B);
        t = fmt(B_PLAY - pb);
        if (pb >= B_PLAY && B.playing) stopAll();
      }
      if (t !== lastTimer.current) { lastTimer.current = t; setTimer(t); }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  }, [draw, stopAll]); // eslint-disable-line react-hooks/exhaustive-deps

  const start = useCallback(async () => {
    if (phaseRef.current === "loading") return;
    try {
      if (!ctxRef.current) {
        setPhase("loading");
        const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AC(); ctxRef.current = ctx;
        const master = ctx.createGain(); master.gain.value = 0.9; master.connect(ctx.destination);
        const load = async (u: string) => ctx.decodeAudioData(await (await fetch(u)).arrayBuffer());
        const [a, b] = await Promise.all([load(TRACKS.A), load(TRACKS.B)]);
        const { A, B } = decks.current;
        A.buffer = a; B.buffer = b; A.rev = reverse(ctx, a); B.rev = reverse(ctx, b);
        [A, B].forEach((d) => { d.gain = ctx.createGain(); d.gain.gain.value = 0; d.gain.connect(master); });
      }
      await ctxRef.current.resume();
    } catch {
      ctxRef.current = null;
      setPhase("idle"); setStatus("НЕТ СВЯЗИ"); setLive("Треки не загрузились. Проверьте интернет и нажмите «Начать».");
      return;
    }
    timers.current.forEach(clearTimeout); timers.current = [];
    const { A, B } = decks.current;
    [A, B].forEach((d) => { stopSrc(d); d.playing = false; d.scratching = false; d.pos = 0; d.rate = 1; d.ramp = null; });
    A.gain!.gain.cancelScheduledValues(now()); B.gain!.gain.cancelScheduledValues(now());
    A.gain!.gain.setValueAtTime(1, now()); B.gain!.gain.setValueAtTime(0, now());
    mixedRef.current = false;
    setPhase("playing"); setStatus("ДО «BOOM BOOM»"); goal("mix_start");
    setLive("Играет LOBODA. Нажмите «Свести» на словах boom boom.");
    play(A);
    // Таймер и кнопка должны быть видны: если пульт не целиком на экране — показать его
    const r = wrap.current?.getBoundingClientRect();
    if (r && (r.top < 70 || r.bottom > window.innerHeight)) wrap.current?.scrollIntoView({ block: "center", behavior: reduced.current ? "auto" : "smooth" });
    loop();
  }, [loop]); // eslint-disable-line react-hooks/exhaustive-deps

  const onButton = () => {
    const ph = phaseRef.current;
    if (ph === "idle" || ph === "lost") start();
    else if (ph === "playing") mix();
    else if (ph === "won") { goal("mix_cta"); setDialog(true); }
  };

  /* ---------- Джоги: скретч ---------- */
  useEffect(() => {
    reduced.current = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const s = svg.current!;
    const svgPoint = (e: PointerEvent) => {
      const pt = s.createSVGPoint();
      pt.x = e.clientX; pt.y = e.clientY;
      return pt.matrixTransform(s.getScreenCTM()!.inverse());
    };
    const off: (() => void)[] = [];
    const on = (el: Element | null, ev: string, fn: (e: PointerEvent) => void) => {
      if (!el) return; el.addEventListener(ev, fn as EventListener); off.push(() => el.removeEventListener(ev, fn as EventListener));
    };
    (["A", "B"] as DeckId[]).forEach((id) => {
      const d = decks.current[id], jog = s.querySelector(`[data-jog=${id}]`);
      let last = 0, lastT = 0;
      const ang = (e: PointerEvent) => { const p = svgPoint(e); return Math.atan2(p.y - JOG[id].cy, p.x - JOG[id].cx); };
      on(jog, "pointerdown", (e) => {
        if (!ctxRef.current || !d.buffer) return;
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
    const onKey = (e: KeyboardEvent) => {
      const tag = (document.activeElement?.tagName ?? "").toUpperCase();
      if (e.code === "Space" && phaseRef.current === "playing" && !["INPUT", "TEXTAREA", "BUTTON", "A", "SELECT"].includes(tag)) { e.preventDefault(); mix(); }
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
        <text x={x + 28} y={42} fill="#fff" fontSize={10} fontWeight={700}>{id} · {title}</text>
        <text data-bpm={id} x={x + 336} y={98} fill="#fff" fontSize={10} textAnchor="end">{id === "A" ? BPM_A : BPM_B} BPM</text>
        <g data-jog={id} style={{ cursor: "grab", touchAction: "none" }} role="img" aria-label={`Джог деки ${id}: зажмите и крутите — скретч`}>
          <circle cx={cx} cy={cy} r={120} fill="url(#rim)" />
          <circle cx={cx} cy={cy} r={105} fill="#14151c" />
          <g data-platter={id}>
            <circle cx={cx} cy={cy} r={86} fill="none" stroke="#2a2b36" strokeWidth={24} strokeDasharray="2 9.26" />
            <circle cx={cx} cy={cy} r={64} fill="#0f1017" stroke="#2a2b36" />
            <rect x={cx - 2} y={cy - 104} width={4} height={24} rx={2} fill="#fff" opacity={0.9} />
          </g>
          <circle cx={cx} cy={cy} r={40} fill="#090b14" stroke={color} strokeWidth={3} />
          <text x={cx} y={cy + 5} fill="#fff" fontSize={14} fontWeight={800} textAnchor="middle">{id}</text>
        </g>
      </g>
    );
  };

  return (
    <div className="mix" ref={wrap}>
      <p className="mix-hint">Сведите ваш первый трек с&nbsp;точностью до&nbsp;1&nbsp;секунды и&nbsp;получите первое занятие бесплатно</p>
      <div className="mix-board-wrap">
      <img className="mix-sticker ms-1" src="/graffiti/sticker-1sec.svg" alt="" width={300} height={140} />
      <img className="mix-sticker ms-2" src="/graffiti/sticker-noskip.svg" alt="" width={300} height={140} />
      <div className="mix-board">
        <svg ref={svg} viewBox="0 0 1000 440" className="mix-svg" role="group" aria-label="Пульт: игра «Сведи трек»">
          <defs>
            <radialGradient id="rim" cx="50%" cy="40%" r="60%"><stop offset="0" stopColor="#e9ecf2" /><stop offset=".55" stopColor="#9a9ea8" /><stop offset="1" stopColor="#4a4d56" /></radialGradient>
          </defs>
          <line x1={380} y1={16} x2={380} y2={424} stroke="#0b0c12" strokeWidth={3} />
          <line x1={620} y1={16} x2={620} y2={424} stroke="#0b0c12" strokeWidth={3} />
          {deck("A", 0, "#6f6bff", "LOBODA feat. PHARAOH — BOOM BOOM")}
          {deck("B", 638, "#FF8562", "SIDODGI, DUBOSHIT — BOOM")}
          <rect x={398} y={22} width={204} height={84} rx={10} fill="#060708" stroke="#2c2e3a" />
          <SevenSeg text={timer} x={412} y={42} h={46} on="#FF8562" off="#2a1a12" />
          <text x={500} y={140} fill={phase === "won" ? "#FF8562" : "#9a9ea8"} fontSize={11} fontWeight={700} textAnchor="middle">{status}</text>
          <circle cx={500} cy={290} r={112} fill="none" stroke="#2a2b36" strokeWidth={2} />
        </svg>
        <button type="button" onClick={onButton} disabled={phase === "loading"}
          className={`mix-btn mix-btn-${phase}${pulse ? " mix-pulse" : ""}`} aria-describedby="mix-live">
          {LABEL[phase]}
        </button>
      </div>
      </div>
      <p className="sr-only" id="mix-live" aria-live="polite">{live}</p>
      <LeadDialog open={dialog} onClose={() => setDialog(false)} />
    </div>
  );
}
