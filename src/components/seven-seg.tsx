// Семисегментный индикатор на SVG: цифры, двоеточие и точка. Погашенные сегменты видны тускло — как на реальном дисплее.
const SEG: Record<string, string> = {
  "0": "abcdef", "1": "bc", "2": "abged", "3": "abgcd", "4": "fgbc", "5": "afgcd", "6": "afgedc", "7": "abc", "8": "abcdefg", "9": "abcdfg", "-": "g", " ": "",
};

function Digit({ ch, x, y, w, h, on, off }: { ch: string; x: number; y: number; w: number; h: number; on: string; off: string }) {
  const t = w * 0.18, sk = h * 0.1, lit = SEG[ch] ?? "";
  const hy = h / 2;
  // Горизонтальный и вертикальный сегмент — шестиугольники; наклон как у дисплея плеера
  const hs = (x0: number, y0: number) => `${x0 + t / 2},${y0} ${x0 + t},${y0 - t / 2} ${x0 + w - t},${y0 - t / 2} ${x0 + w - t / 2},${y0} ${x0 + w - t},${y0 + t / 2} ${x0 + t},${y0 + t / 2}`;
  const vs = (x0: number, y0: number, len: number) => `${x0},${y0 + t / 2} ${x0 + t / 2},${y0 + t} ${x0 + t / 2},${y0 + len - t} ${x0},${y0 + len - t / 2} ${x0 - t / 2},${y0 + len - t} ${x0 - t / 2},${y0 + t}`;
  const segs: Record<string, string> = {
    a: hs(x, y), g: hs(x, y + hy), d: hs(x, y + h),
    f: vs(x + t / 2, y, hy), b: vs(x + w - t / 2, y, hy), e: vs(x + t / 2, y + hy, hy), c: vs(x + w - t / 2, y + hy, hy),
  };
  return (
    <g transform={`skewX(-6) translate(${sk} 0)`}>
      {Object.entries(segs).map(([k, pts]) => <polygon key={k} points={pts} fill={lit.includes(k) ? on : off} />)}
    </g>
  );
}

export function SevenSeg({ text, x, y, h, on, off }: { text: string; x: number; y: number; h: number; on: string; off: string }) {
  const w = h * 0.5, gap = h * 0.16;
  let cx = x;
  const out: React.ReactNode[] = [];
  text.split("").forEach((ch, i) => {
    if (ch === ":") {
      out.push(<circle key={i} cx={cx + gap} cy={y + h * 0.3} r={h * 0.06} fill={on} />, <circle key={`${i}b`} cx={cx + gap} cy={y + h * 0.72} r={h * 0.06} fill={on} />);
      cx += gap * 2;
    } else if (ch === ".") {
      out.push(<circle key={i} cx={cx + gap * 0.2} cy={y + h * 0.96} r={h * 0.065} fill={on} />);
      cx += gap * 1.1;
    } else {
      out.push(<Digit key={i} ch={ch} x={cx} y={y} w={w} h={h} on={on} off={off} />);
      cx += w + gap;
    }
  });
  return <g aria-hidden="true">{out}</g>;
}
