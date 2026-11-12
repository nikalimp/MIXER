// Граффити MIXER (v0.6): теги, throw-up, стикеры, дудлы → public/graffiti/*.svg.
// Шрифты OFL (@fontsource: Sedgwick Ave Display, Rubik Wet Paint, Permanent Marker), rough.js (MIT).
// Шрифты на сайт не грузятся: буквы переводятся в векторные контуры. Запуск: node scripts/graffiti.mjs
import fs from "node:fs";
import opentype from "opentype.js";
import rough from "roughjs";

const F = (p) => opentype.parse(fs.readFileSync(p).buffer.slice(0));
const fonts = {
  tag: F("node_modules/@fontsource/sedgwick-ave-display/files/sedgwick-ave-display-latin-400-normal.woff"),
  wet: F("node_modules/@fontsource/rubik-wet-paint/files/rubik-wet-paint-latin-400-normal.woff"),
  marker: F("node_modules/@fontsource/permanent-marker/files/permanent-marker-latin-400-normal.woff"),
};
const OUT = process.argv[2] || "public/graffiti";
fs.mkdirSync(OUT, { recursive: true });

// детерминированный рандом
let seed = 7;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

function textPath(font, text, size, x = 0, y = 0, opts = {}) {
  const p = font.getPath(text, x, y, size, { kerning: true, ...opts });
  const r = (v) => Math.round(v * 10) / 10;
  const d = p.commands.map((c) => c.type === "M" || c.type === "L" ? `${c.type}${r(c.x)} ${r(c.y)}`
    : c.type === "Q" ? `Q${r(c.x1)} ${r(c.y1)} ${r(c.x)} ${r(c.y)}`
    : c.type === "C" ? `C${r(c.x1)} ${r(c.y1)} ${r(c.x2)} ${r(c.y2)} ${r(c.x)} ${r(c.y)}` : "Z").join("");
  return { d, bb: p.getBoundingBox() };
}
// потёки: капли от нижнего края букв
function drips(bb, color, n = 5, maxLen = 60, w = 7) {
  let s = "";
  for (let i = 0; i < n; i++) {
    const x = bb.x1 + (bb.x2 - bb.x1) * (0.08 + rnd() * 0.84);
    const y = bb.y2 - 6 - rnd() * 10;
    const len = 12 + rnd() * maxLen, ww = w * (0.6 + rnd() * 0.7);
    s += `<path d="M${x - ww / 2} ${y} v${len} a${ww / 2} ${ww / 2} 0 0 0 ${ww} 0 v${-len} z" fill="${color}"/>`;
    s += `<circle cx="${x}" cy="${y + len + ww * 1.6}" r="${ww * 0.38}" fill="${color}"/>`;
  }
  return s;
}
const wrap = (w, h, body, defs = "") =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}"><defs>${defs}</defs>${body}</svg>`;
const rough_ = (bb) => { const pad = 40; return { w: Math.ceil(bb.x2 - bb.x1 + pad * 2), h: Math.ceil(bb.y2 - bb.y1 + pad * 2), tx: pad - bb.x1, ty: pad - bb.y1 }; };
// фильтр «баллончик»: шершавый край + напыл
const SPRAY = `<filter id="sp" x="-20%" y="-20%" width="140%" height="160%">
  <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" result="n"/>
  <feDisplacementMap in="SourceGraphic" in2="n" scale="3.5" result="d"/>
  <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="b"/>
  <feColorMatrix in="b" type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 .35 0" result="o"/>
  <feMerge><feMergeNode in="o"/><feMergeNode in="d"/></feMerge></filter>`;

/* 1. Теги преподавателей и бренда */
function tag(name, text, color, size = 150, font = fonts.tag, umlautAt = -1) {
  let { d, bb } = textPath(font, text, size);
  if (umlautAt >= 0) { // «Ё»: точки над буквой — в шрифте нет кириллицы
    const x0 = font.getAdvanceWidth(text.slice(0, umlautAt), size), w = font.getAdvanceWidth(text[umlautAt], size), top = bb.y1 + size * 0.42, r = size * 0.055;
    for (const k of [0.3, 0.75]) d += `M${(x0 + w * k + r).toFixed(1)} ${top.toFixed(1)}a${r} ${r} 0 1 0 ${-2 * r} 0a${r} ${r} 0 1 0 ${2 * r} 0z`;
  }
  const dr = "";
  const g = rough_({ ...bb, y2: bb.y2 + 80 });
  fs.writeFileSync(`${OUT}/tag-${name}.svg`, wrap(g.w, g.h,
    `<g transform="translate(${g.tx} ${g.ty})" filter="url(#sp)"><path d="${d}" fill="${color}"/>${dr}</g>`, SPRAY));
}
tag("dierouzze", "Dierouzze", "#fff");
tag("klen", "Klen", "#fff", 170, fonts.tag, 2);
tag("yunpronto", "Yunpronto", "#fff");
tag("mixer", "Mixer", "#403BFF", 200);
tag("mixer-orange", "Mixer", "#FF8562", 200);

/* 2. Throw-up: пузырьковые буквы с обводкой, 3D-тенью и бликами */
function throwup(name, text, fill, outline = "#0A0A0F", font = fonts.wet, size = 220) {
  const { d, bb } = textPath(font, text, size);
  const g = rough_({ x1: bb.x1 - 30, y1: bb.y1 - 30, x2: bb.x2 + 40, y2: bb.y2 + 60 });
  // контур букв один раз в <defs>, дальше — <use>: файл в 4 раза легче
  const defs = `<path id="t" d="${d}"/><clipPath id="c"><use href="#t"/></clipPath>`;
  const body = `<g transform="translate(${g.tx} ${g.ty})">
    <use href="#t" transform="translate(14 14)" fill="${outline}" stroke="${outline}" stroke-width="34" stroke-linejoin="round"/>
    <use href="#t" fill="${fill}" stroke="${outline}" stroke-width="16" stroke-linejoin="round" paint-order="stroke"/>
    <g clip-path="url(#c)"><use href="#t" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="10" transform="translate(5 6)"/></g>
  </g>`;
  fs.writeFileSync(`${OUT}/throwup-${name}.svg`, wrap(g.w, g.h, body, defs));
}
throwup("mixer", "MIXER", "#FF8562");
throwup("boom", "BOOM", "#403BFF");
// курсы: «С нуля» — ZERO, «Левел ап» — LVL UP, «Миксмастер» — MIX, «Парный» — B2B (back-to-back)
throwup("zero", "ZERO", "#FF8562");
throwup("lvlup", "LVL UP", "#403BFF");
throwup("mix", "MIX", "#FF8562");
throwup("b2b", "B2B", "#403BFF");

/* 3. Стикеры */
function sticker(name, text, bg, fg, rot) {
  const { d, bb } = textPath(fonts.marker, text, 64);
  const pw = 34, ph = 22, w = bb.x2 - bb.x1 + pw * 2, h = bb.y2 - bb.y1 + ph * 2;
  const W = Math.ceil(w + 60), H = Math.ceil(h + 60);
  const body = `<g transform="translate(${W / 2} ${H / 2}) rotate(${rot}) translate(${-w / 2} ${-h / 2})">
    <rect x="4" y="6" width="${w}" height="${h}" rx="14" fill="#000" opacity=".22"/>
    <rect width="${w}" height="${h}" rx="14" fill="${bg}" stroke="#fff" stroke-width="6"/>
    <path d="${d}" transform="translate(${pw - bb.x1} ${ph - bb.y1})" fill="${fg}"/></g>`;
  fs.writeFileSync(`${OUT}/sticker-${name}.svg`, wrap(W, H, body));
}
sticker("noskip", "NO SKIP", "#FF8562", "#0A0A0F", -6);
sticker("1sec", "± 1 SEC", "#403BFF", "#fff", 5);
sticker("boomboom", "BOOM BOOM", "#0A0A0F", "#FF8562", -3);
sticker("staya", "STAYA CREW", "#fff", "#403BFF", 4);
sticker("dropit", "DROP IT", "#FF8562", "#fff", -4);
sticker("pass", "BACKSTAGE PASS", "#fff", "#0A0A0F", 3);

/* 4. Дудлы rough.js: корона, стрелка, звезда, обводка-«овал», подчёркивание */
const gen = rough.generator();
function doodle(name, w, h, drawables, color, sw = 6) {
  const paths = drawables.flatMap((dr) => gen.toPaths(dr)).map((p) =>
    `<path d="${p.d}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/>`).join("");
  fs.writeFileSync(`${OUT}/doodle-${name}.svg`, wrap(w, h, paths));
}
const o = { roughness: 1.6, bowing: 1.4, seed: 4 };
doodle("crown", 220, 160, [gen.linearPath([[20, 140], [30, 40], [75, 100], [110, 20], [145, 100], [190, 40], [200, 140], [20, 140]], o),
  gen.circle(30, 30, 18, o), gen.circle(110, 12, 18, o), gen.circle(190, 30, 18, o)], "#FF8562");
doodle("arrow", 260, 140, [gen.curve([[15, 110], [80, 40], [170, 30], [240, 70]], o), gen.linearPath([[200, 45], [242, 70], [205, 105]], o)], "#0A0A0F");
doodle("star", 160, 160, [gen.polygon([[80, 10], [98, 60], [150, 62], [108, 92], [124, 145], [80, 114], [36, 145], [52, 92], [10, 62], [62, 60]], o)], "#403BFF");
doodle("circle", 420, 160, [gen.ellipse(210, 80, 390, 130, { ...o, roughness: 2.2 }), gen.ellipse(212, 82, 380, 120, { ...o, seed: 9 })], "#FF8562", 5);
doodle("underline", 420, 60, [gen.curve([[10, 35], [140, 20], [280, 40], [410, 18]], o), gen.curve([[40, 48], [200, 34], [390, 40]], { ...o, seed: 11 })], "#403BFF", 7);
console.log(fs.readdirSync(OUT).length + " файлов в " + OUT);
