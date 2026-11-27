import type { FC, ReactNode } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { baloo } from "../../lib/fonts";
import { rand, tween, wave } from "../../lib/kit";

export const W = 1080, H = 1920;
export const fontFamily = baloo;

/** Brand-ish palette: deep night navy, Covatom teal signal, alert colours. */
export const C = {
  night: "#070b1d",
  navy: "#101a3d",
  ink: "#0b1230",
  teal: "#2ee6c5",
  cyan: "#45b8ff",
  violet: "#a77bff",
  amber: "#ffb547",
  sos: "#ff4d5e",
  green: "#4be08a",
  grey: "#8b93ad",
  cream: "#f4f1e6",
};

/** Full-frame SVG canvas with shared gradients. `shake` jitters everything. */
export const Canvas: FC<{ children: ReactNode; shake?: number }> = ({ children, shake = 0 }) => {
  const f = useCurrentFrame();
  const dx = shake ? (rand(f) - 0.5) * 2 * shake : 0, dy = shake ? (rand(f + 500) - 0.5) * 2 * shake : 0;
  return (
    <AbsoluteFill>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
        <defs>
          <radialGradient id="tealGlow">
            <stop offset="0" stopColor={C.teal} stopOpacity="0.9" />
            <stop offset="0.4" stopColor={C.teal} stopOpacity="0.3" />
            <stop offset="1" stopColor={C.teal} stopOpacity="0" />
          </radialGradient>
          <radialGradient id="redGlow">
            <stop offset="0" stopColor={C.sos} stopOpacity="0.9" />
            <stop offset="0.45" stopColor={C.sos} stopOpacity="0.3" />
            <stop offset="1" stopColor={C.sos} stopOpacity="0" />
          </radialGradient>
          <radialGradient id="warmGlow">
            <stop offset="0" stopColor="#ffe6a8" stopOpacity="0.95" />
            <stop offset="0.4" stopColor="#ffb06a" stopOpacity="0.4" />
            <stop offset="1" stopColor="#ff8a5a" stopOpacity="0" />
          </radialGradient>
        </defs>
        <g transform={`translate(${dx} ${dy})`}>{children}</g>
      </svg>
    </AbsoluteFill>
  );
};

export const Sky: FC<{ id: string; top: string; bottom: string }> = ({ id, top, bottom }) => (
  <>
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={top} />
        <stop offset="1" stopColor={bottom} />
      </linearGradient>
    </defs>
    <rect x={-40} y={-40} width={W + 80} height={H + 80} fill={`url(#${id})`} />
  </>
);

export const Stars: FC<{ n?: number; opacity: number; maxY?: number }> = ({ n = 40, opacity, maxY = 0.45 }) => {
  const f = useCurrentFrame();
  return (
    <g opacity={opacity}>
      {Array.from({ length: n }, (_, i) => (
        <circle key={i} cx={rand(i) * W} cy={rand(i + 99) * H * maxY} r={1.5 + rand(i + 7) * 2.5} fill="#fff"
          opacity={0.5 + wave(f, 0.45, 40 + rand(i + 3) * 50, i * 13)} />
      ))}
    </g>
  );
};

/** Floating dust / sparks drifting upward. */
export const Motes: FC<{ n?: number; color: string; opacity?: number }> = ({ n = 30, color, opacity = 0.5 }) => {
  const f = useCurrentFrame();
  return (
    <g opacity={opacity}>
      {Array.from({ length: n }, (_, i) => {
        const y = (rand(i + 3) * H - f * (0.6 + rand(i) * 1.2) + H * 2) % H;
        return <circle key={i} cx={rand(i + 11) * W + wave(f, 14, 90, i * 20)} cy={y} r={2 + rand(i + 5) * 4} fill={color} />;
      })}
    </g>
  );
};

const BUILDINGS = Array.from({ length: 11 }, (_, i) => ({
  x: -30 + i * 102 + rand(i + 40) * 20,
  w: 90 + rand(i + 1) * 40,
  h: 260 + rand(i + 2) * 420,
}));

/** City skyline standing on `base`. `lit(i)` 0..1 per window index; `color` building tint. */
export const City: FC<{ base: number; color: string; lit: (i: number) => number; win?: string }> = ({ base, color, lit, win = "#ffd36b" }) => (
  <g>
    {BUILDINGS.map((b, bi) => {
      const cols = Math.floor(b.w / 34), rows = Math.floor(b.h / 54);
      return (
        <g key={bi}>
          <rect x={b.x} y={base - b.h} width={b.w} height={b.h + 400} fill={color} />
          {Array.from({ length: cols * rows }, (_, k) => {
            const c = k % cols, r = Math.floor(k / cols);
            const idx = bi * 50 + k;
            if (rand(idx + 300) < 0.3) return null;
            const o = lit(idx);
            return <rect key={k} x={b.x + 12 + c * 34} y={base - b.h + 22 + r * 54} width={18} height={26} rx={3}
              fill={win} opacity={0.12 + 0.88 * o} />;
          })}
        </g>
      );
    })}
  </g>
);

/** A smartphone centred at x,y. Children draw in screen space: (0,0)…(348,728). */
export const Phone: FC<{ id: string; x: number; y: number; s?: number; rot?: number; screen?: string; glow?: string; children?: ReactNode }> = ({
  id, x, y, s = 1, rot = 0, screen = "#0d1533", glow, children,
}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    {glow && <ellipse rx={330} ry={480} fill={`url(#${glow})`} opacity={0.6} />}
    <rect x={-190} y={-380} width={380} height={760} rx={56} fill="#1c2235" stroke="#3a4363" strokeWidth={4} />
    <defs>
      <clipPath id={`scr-${id}`}><rect x={-174} y={-364} width={348} height={728} rx={42} /></clipPath>
    </defs>
    <g clipPath={`url(#scr-${id})`}>
      <rect x={-174} y={-364} width={348} height={728} fill={screen} />
      <g transform="translate(-174 -364)">{children}</g>
    </g>
    <rect x={-50} y={-356} width={100} height={22} rx={11} fill="#05070f" />
  </g>
);

/** Signal bars (0..4 active) drawn at x,y (bottom-left). */
export const Bars: FC<{ x: number; y: number; n: number; color?: string; s?: number }> = ({ x, y, n, color = "#fff", s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {[0, 1, 2, 3].map((i) => (
      <rect key={i} x={i * 12} y={-10 - i * 7} width={8} height={10 + i * 7} rx={2} fill={color} opacity={i < n ? 1 : 0.22} />
    ))}
  </g>
);

export const Txt: FC<{ x: number; y: number; size: number; color?: string; anchor?: "start" | "middle" | "end"; opacity?: number; children: ReactNode; stroke?: boolean }> = ({
  x, y, size, color = "#fff", anchor = "middle", opacity = 1, children, stroke,
}) => (
  <text x={x} y={y} fontFamily={fontFamily} fontWeight={800} fontSize={size} fill={color} textAnchor={anchor} opacity={opacity}
    stroke={stroke ? "rgba(0,0,0,.45)" : undefined} strokeWidth={stroke ? size * 0.08 : undefined} paintOrder="stroke">
    {children}
  </text>
);

/** Rounded pill label that pops in with p (0..1). */
export const Chip: FC<{ x: number; y: number; p: number; label: string; color: string; w?: number; size?: number; dark?: boolean; icon?: ReactNode }> = ({
  x, y, p, label, color, w = 300, size = 46, dark, icon,
}) => {
  if (p <= 0) return null;
  const sc = 0.6 + 0.4 * p + Math.sin(p * Math.PI) * 0.12;
  const h = size * 1.7;
  return (
    <g transform={`translate(${x} ${y}) scale(${sc})`} opacity={Math.min(1, p * 1.5)}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={h / 2} fill={color} />
      {icon && <g transform={`translate(${-w / 2 + h / 2 + 6} 0)`}>{icon}</g>}
      <Txt x={icon ? h / 4 : 0} y={size * 0.36} size={size} color={dark ? C.ink : "#fff"}>{label}</Txt>
    </g>
  );
};

/** Covatom mark: a core with three orbits and travelling sparks. `p` 0..1 grows it. */
export const Mark: FC<{ x: number; y: number; s?: number; p?: number; color?: string }> = ({ x, y, s = 1, p = 1, color = C.teal }) => {
  const f = useCurrentFrame();
  const spin = f * 0.6;
  return (
    <g transform={`translate(${x} ${y}) scale(${s * p}) rotate(${spin * 0.2})`} opacity={Math.min(1, p * 2)}>
      <circle r={190} fill="url(#tealGlow)" opacity={0.55} />
      {[0, 60, 120].map((a, i) => {
        const t = ((f * 2.2 + i * 120) % 360) * (Math.PI / 180);
        return (
          <g key={a} transform={`rotate(${a})`}>
            <ellipse rx={120} ry={44} fill="none" stroke={color} strokeWidth={10} opacity={0.9} />
            <circle cx={120 * Math.cos(t)} cy={44 * Math.sin(t)} r={13} fill="#fff" />
          </g>
        );
      })}
      <circle r={30 + wave(f, 3, 40)} fill={color} />
      <circle r={14} fill="#fff" />
    </g>
  );
};

/** A simple rounded person. Body colour, mood, arm raising a phone (lift 0..1), phone screen glow. */
export const Person: FC<{ x: number; y: number; s?: number; color: string; skin?: string; hair?: string; mood?: "worried" | "happy" | "calm"; lift?: number; glow?: string; flip?: boolean; phase?: number }> = ({
  x, y, s = 1, color, skin = "#c98d64", hair = "#24182a", mood = "calm", lift = 0, glow = C.teal, flip, phase = 0,
}) => {
  const f = useCurrentFrame();
  const breathe = wave(f, 3, 70, phase);
  const blink = (f + phase) % 110 < 5 ? 0.15 : 1;
  const armA = -20 - lift * 110;
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <ellipse cx={0} cy={4} rx={90} ry={16} fill="#000" opacity={0.25} />
      <path d={`M-75 0 Q-80 ${-170 - breathe} 0 ${-185 - breathe} Q80 ${-170 - breathe} 75 0Z`} fill={color} />
      {/* arm with phone */}
      <g transform={`translate(42 ${-140 - breathe}) rotate(${armA})`}>
        <rect x={-14} y={-6} width={28} height={110} rx={14} fill={color} stroke="#000" strokeOpacity={0.15} strokeWidth={3} />
        <g transform="translate(0 110)">
          <circle r={16} fill={skin} />
          <g transform={`rotate(${-armA})`}>
            <circle r={40} fill={glow} opacity={0.25 + 0.15 * lift} />
            <rect x={-17} y={-30} width={34} height={58} rx={7} fill="#1c2235" />
            <rect x={-13} y={-25} width={26} height={46} rx={4} fill={glow} opacity={0.9} />
          </g>
        </g>
      </g>
      <g transform={`translate(0 ${-250 - breathe})`}>
        <circle r={68} fill={skin} />
        <path d="M-70 -6 Q-72 -78 0 -78 Q72 -78 70 -6 Q40 -40 0 -46 Q-40 -40 -70 -6Z" fill={hair} />
        <ellipse cx={-24} cy={6} rx={8} ry={10 * blink} fill="#1b1430" />
        <ellipse cx={24} cy={6} rx={8} ry={10 * blink} fill="#1b1430" />
        {mood === "worried" && <>
          <path d="M-38 -10 L-14 -20 M38 -10 L14 -20" stroke="#1b1430" strokeWidth={5} strokeLinecap="round" />
          <path d="M-14 40 Q0 30 14 40" stroke="#1b1430" strokeWidth={5} fill="none" strokeLinecap="round" />
        </>}
        {mood === "happy" && <path d="M-20 30 Q0 50 20 30" stroke="#1b1430" strokeWidth={5} fill="none" strokeLinecap="round" />}
        {mood === "calm" && <path d="M-14 34 Q0 40 14 34" stroke="#1b1430" strokeWidth={5} fill="none" strokeLinecap="round" />}
        <circle cx={-40} cy={26} r={9} fill="#ff8b8b" opacity={mood === "happy" ? 0.5 : 0} />
        <circle cx={40} cy={26} r={9} fill="#ff8b8b" opacity={mood === "happy" ? 0.5 : 0} />
      </g>
    </g>
  );
};

/** A link drawn from a to b; p 0..1 is how far it has been drawn. A spark runs along it. */
export const Link: FC<{ a: [number, number]; b: [number, number]; p: number; color?: string; width?: number; spark?: number }> = ({
  a, b, p, color = C.teal, width = 6, spark,
}) => {
  if (p <= 0) return null;
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const st = spark === undefined ? null : spark % 1;
  return (
    <g>
      <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={color} strokeWidth={width * 3} opacity={0.15}
        strokeDasharray={`${len * p} ${len}`} strokeLinecap="round" />
      <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={color} strokeWidth={width}
        strokeDasharray={`${len * p} ${len}`} strokeLinecap="round" />
      {st !== null && p >= 1 && <circle cx={a[0] + (b[0] - a[0]) * st} cy={a[1] + (b[1] - a[1]) * st} r={width * 1.6} fill="#fff" />}
    </g>
  );
};

/** Glowing phone node seen from above. */
export const Node: FC<{ x: number; y: number; p: number; color?: string; phase?: number }> = ({ x, y, p, color = C.teal, phase = 0 }) => {
  const f = useCurrentFrame();
  if (p <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${p})`}>
      <circle r={70 + wave(f, 10, 50, phase)} fill="url(#tealGlow)" opacity={0.6} />
      <rect x={-16} y={-28} width={32} height={56} rx={7} fill="#1c2235" stroke={color} strokeWidth={3} />
      <rect x={-11} y={-22} width={22} height={42} rx={3} fill={color} />
    </g>
  );
};

/** Cell tower; `x` crosses it out (0..1). */
export const Tower: FC<{ x: number; y: number; s?: number; cross: number; color?: string }> = ({ x, y, s = 1, cross, color = "#5a6488" }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-50 160 L0 -120 L50 160 M-36 80 L36 80 M-22 0 L22 0 M-36 80 L22 0 M36 80 L-22 0" stroke={color} strokeWidth={8} fill="none" strokeLinejoin="round" />
    <circle cy={-130} r={12} fill={color} />
    <path d="M-40 -165 Q-60 -130 -40 -95 M40 -165 Q60 -130 40 -95" stroke={color} strokeWidth={7} fill="none" strokeLinecap="round" />
    {cross > 0 && (
      <g stroke={C.sos} strokeWidth={18} strokeLinecap="round">
        <line x1={-90} y1={-150} x2={-90 + 180 * Math.min(1, cross * 2)} y2={-150 + 280 * Math.min(1, cross * 2)} />
        {cross > 0.5 && <line x1={90} y1={-150} x2={90 - 180 * (cross * 2 - 1)} y2={-150 + 280 * (cross * 2 - 1)} />}
      </g>
    )}
  </g>
);

/** Expanding ripple rings from a point, repeating every `period` frames after `start`. */
export const Ripples: FC<{ x: number; y: number; start: number; color: string; max?: number; period?: number; n?: number; width?: number }> = ({
  x, y, start, color, max = 500, period = 45, n = 3, width = 8,
}) => {
  const f = useCurrentFrame();
  if (f < start) return null;
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const local = f - start - (i * period) / n;
        if (local < 0) return null;
        const t = (local % period) / period;
        return <circle key={i} cx={x} cy={y} r={40 + t * max} fill="none" stroke={color} strokeWidth={width} opacity={(1 - t) * 0.8} />;
      })}
    </g>
  );
};

export { tween };
