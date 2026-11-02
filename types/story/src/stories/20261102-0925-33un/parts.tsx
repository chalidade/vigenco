import type { FC, ReactNode } from "react";
import { AbsoluteFill, interpolateColors, useCurrentFrame } from "remotion";
import { baloo } from "../../lib/fonts";
import { rand, wave } from "../../lib/kit";

// Episode 2 of the "Pulau Aru" series. Aru, the island, palm, fire and sea follow episode 1
// (stories/20261102-0127-d1d6) so the character looks the same; new set pieces are below.

export const W = 1080, H = 1920;
export const fontFamily = baloo;

/* ---------- palette ---------- */
export const NIGHT = "#0d1030";
export const UI = { bg: "#13263a", panel: "#1c3a52", line: "#2f5878", accent: "#ffd25a", text: "#f4f7fb", dim: "#8fb0c8", green: "#3cc58a", red: "#ff6b5a" };

/** Character colours. Residents pass their own `pal`; darker shades are derived. */
export type Pal = { skin: string; shirt: string; shorts: string; hair: string };
const ARU: Pal = { skin: "#c98b5f", shirt: "#e37b4e", shorts: "#2d7c84", hair: "#2a1a14" };
const dark = (c: string, k = 0.28) => interpolateColors(k, [0, 1], [c, "#000"]);
const tone = (shade: number, pal: Pal = ARU) => {
  const base = { skin: pal.skin, skinD: dark(pal.skin, 0.2), hair: pal.hair, shirt: pal.shirt, shirtD: dark(pal.shirt), shorts: pal.shorts, shortsD: dark(pal.shorts), ink: "#24150f" };
  if (shade <= 0) return base;
  const out = { ...base };
  (Object.keys(base) as (keyof typeof base)[]).forEach((k) => { out[k] = interpolateColors(shade, [0, 1], [base[k], NIGHT]); });
  return out;
};

export const RESIDENTS: { pal: Pal; style: HairStyle }[] = [
  { pal: { skin: "#e3a97c", shirt: "#4f8fd8", shorts: "#3b3b5c", hair: "#5a3020" }, style: "long" },
  { pal: { skin: "#8a5838", shirt: "#7bbf5a", shorts: "#6b4a2e", hair: "#1c120c" }, style: "cap" },
  { pal: { skin: "#f0c49b", shirt: "#d65a8a", shorts: "#2f4f6f", hair: "#1a1a1a" }, style: "bun" },
];

const rad = (a: number) => (a * Math.PI) / 180;
/** End point of a segment from (x,y), angle a (0 = straight down, + = forward), length l. */
const seg = (x: number, y: number, a: number, l: number): [number, number] => [x + Math.sin(rad(a)) * l, y + Math.cos(rad(a)) * l];

/** Camera: zoom `z` around (cx, cy), then shift by (dx, dy). */
export const Cam: FC<{ z: number; cx: number; cy: number; dx?: number; dy?: number; children: ReactNode }> = ({ z, cx, cy, dx = 0, dy = 0, children }) => (
  <g transform={`translate(${cx + dx} ${cy + dy}) scale(${z}) translate(${-cx} ${-cy})`}>{children}</g>
);

export const Canvas: FC<{ children: ReactNode }> = ({ children }) => (
  <AbsoluteFill>
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
      <defs>
        <radialGradient id="fire">
          <stop offset="0" stopColor="#ffd27a" stopOpacity="0.85" />
          <stop offset="0.4" stopColor="#ff8a3d" stopOpacity="0.3" />
          <stop offset="1" stopColor="#ff6a2a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="lamp">
          <stop offset="0" stopColor="#fff3c4" stopOpacity="0.95" />
          <stop offset="0.3" stopColor="#ffc85a" stopOpacity="0.45" />
          <stop offset="1" stopColor="#ff9a2a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="sunglow">
          <stop offset="0" stopColor="#fff2c2" stopOpacity="0.9" />
          <stop offset="1" stopColor="#ffd38a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="vig" cx="0.5" cy="0.5" r="0.75">
          <stop offset="0.55" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.75" />
        </radialGradient>
        <linearGradient id="beam" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff6c8" stopOpacity="0.7" />
          <stop offset="1" stopColor="#fff6c8" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="stone" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#8d9396" /><stop offset="0.55" stopColor="#7a8184" /><stop offset="1" stopColor="#5d6467" />
        </linearGradient>
      </defs>
      {children}
    </svg>
  </AbsoluteFill>
);

export const Vignette: FC<{ o?: number }> = ({ o = 1 }) => <rect width={W} height={H} fill="url(#vig)" opacity={o} />;

export const Sky: FC<{ id: string; stops: [number, string][]; h?: number }> = ({ id, stops, h = H }) => (
  <>
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
        {stops.map(([o, c], i) => <stop key={i} offset={o} stopColor={c} />)}
      </linearGradient>
    </defs>
    <rect width={W} height={h} fill={`url(#${id})`} />
  </>
);

export const Stars: FC<{ n?: number; opacity: number; maxY?: number; seed?: number }> = ({ n = 60, opacity, maxY = 1000, seed = 0 }) => {
  const f = useCurrentFrame();
  return (
    <g opacity={opacity}>
      {Array.from({ length: n }, (_, i) => {
        const k = i + seed;
        const r = 1.5 + rand(k + 7) * rand(k + 11) * 5;
        return <circle key={i} cx={rand(k) * W} cy={rand(k + 99) * maxY} r={r} fill="#fff" opacity={0.5 + wave(f, 0.45, 40 + rand(k + 3) * 60, k * 13)} />;
      })}
    </g>
  );
};

/** Sea from the horizon down, with drifting wave strokes. */
export const Sea: FC<{ id: string; y: number; top: string; bottom: string; line: string; lineO?: number; n?: number; speed?: number }> = ({
  id, y, top, bottom, line, lineO = 0.35, n = 34, speed = 1,
}) => {
  const f = useCurrentFrame();
  return (
    <g>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={top} /><stop offset="1" stopColor={bottom} />
        </linearGradient>
      </defs>
      <rect y={y} width={W} height={H - y + 400} fill={`url(#${id})`} />
      {Array.from({ length: n }, (_, i) => {
        const d = rand(i + 300);
        const yy = y + 8 + d * d * (H - y + 200);
        const len = 30 + d * 140;
        const x = ((rand(i + 500) * (W + 300) + f * speed * (0.3 + d * 1.2)) % (W + 300)) - 150;
        const bob = wave(f, 2 + d * 6, 50 + rand(i) * 40, i * 17);
        return <path key={i} d={`M${x} ${yy + bob} q${len / 2} ${-6 - d * 10} ${len} 0`} stroke={line} strokeOpacity={lineO * (0.4 + d * 0.6)}
          strokeWidth={2 + d * 5} fill="none" strokeLinecap="round" />;
      })}
    </g>
  );
};

/** The island: shallow-water halo, foam ring, sand mound. (x, y) is the centre of the sand top. */
export const Island: FC<{ x: number; y: number; rx: number; ry: number; sand: string; wet: string; shallow: string; foam?: string; foamO?: number }> = ({
  x, y, rx, ry, sand, wet, shallow, foam = "#fff", foamO = 0.8,
}) => {
  const f = useCurrentFrame();
  const breathe = wave(f, 6, 70);
  return (
    <g>
      <ellipse cx={x} cy={y + ry * 0.35} rx={rx * 1.28 + breathe} ry={ry * 1.5 + breathe * 0.4} fill={shallow} opacity={0.75} />
      <ellipse cx={x} cy={y + ry * 0.3} rx={rx * 1.06 + breathe} ry={ry * 1.12 + breathe * 0.3} fill="none" stroke={foam} strokeOpacity={foamO}
        strokeWidth={6} strokeDasharray="40 22" strokeDashoffset={-f * 1.5} />
      <ellipse cx={x} cy={y + ry * 0.25} rx={rx} ry={ry} fill={wet} />
      <path d={`M${x - rx * 0.96} ${y + ry * 0.2} Q${x - rx * 0.7} ${y - ry * 1.05} ${x} ${y - ry * 1.1} Q${x + rx * 0.75} ${y - ry * 1.05} ${x + rx * 0.96} ${y + ry * 0.2} Q${x} ${y + ry * 0.95} ${x - rx * 0.96} ${y + ry * 0.2}Z`} fill={sand} />
    </g>
  );
};

/** Coconut palm rooted at (x, y), leaning `lean` px at the crown, swaying. */
export const Palm: FC<{ x: number; y: number; h?: number; lean?: number; trunk: string; leaf: string; leafD: string; nut?: string; phase?: number }> = ({
  x, y, h = 420, lean = -70, trunk, leaf, leafD, nut = "#5a3b22", phase = 0,
}) => {
  const f = useCurrentFrame();
  const sway = wave(f, 8, 110, phase);
  const tx = x + lean + sway, ty = y - h;
  const fronds = [-160, -125, -90, -55, -20, 15, 50];
  const k = Math.min(1, h / 400);
  return (
    <g>
      <path d={`M${x} ${y} Q${x + lean * 0.1} ${y - h * 0.55} ${tx} ${ty}`} stroke={trunk} strokeWidth={30 * Math.max(0.6, k)} fill="none" strokeLinecap="round" />
      {Array.from({ length: 9 }, (_, i) => {
        const t = (i + 1) / 10, mx = (1 - t) * (1 - t) * x + 2 * (1 - t) * t * (x + lean * 0.1) + t * t * tx, my = (1 - t) * (1 - t) * y + 2 * (1 - t) * t * (y - h * 0.55) + t * t * ty;
        return <path key={i} d={`M${mx - 15} ${my} q15 6 30 0`} stroke="#000" strokeOpacity={0.22} strokeWidth={4} fill="none" />;
      })}
      {fronds.map((a, i) => {
        const aa = a + wave(f, 5, 90, phase + i * 11);
        const L = (230 - Math.abs(a + 70) * 0.5) * k;
        return (
          <g key={i} transform={`translate(${tx} ${ty}) rotate(${aa})`}>
            <path d={`M0 0 Q${L * 0.5} ${-40} ${L} ${30} Q${L * 0.5} ${10} 0 0Z`} fill={i % 2 ? leaf : leafD} />
            <path d={`M0 0 Q${L * 0.5} ${-30} ${L} ${30}`} stroke="#000" strokeOpacity={0.2} strokeWidth={4} fill="none" />
          </g>
        );
      })}
      <g transform={`translate(${tx} ${ty}) scale(${k})`}>
        <circle cx={-12} cy={16} r={15} fill={nut} /><circle cx={12} cy={18} r={14} fill={nut} /><circle cx={0} cy={30} r={13} fill={nut} />
      </g>
    </g>
  );
};

export const Gull: FC<{ x: number; y: number; s?: number; color?: string; phase?: number }> = ({ x, y, s = 1, color = "#fdfdf8", phase = 0 }) => {
  const f = useCurrentFrame();
  const w = wave(f, 14, 12, phase);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d={`M-40 ${-w} Q-20 ${-18 - w * 0.4} 0 0 Q20 ${-18 - w * 0.4} 40 ${-w}`} stroke={color} strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
};

export const Cloud: FC<{ x: number; y: number; s?: number; color: string; o?: number }> = ({ x, y, s = 1, color, o = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} fill={color} opacity={o}>
    <ellipse cx={0} cy={0} rx={120} ry={34} /><circle cx={-40} cy={-20} r={42} /><circle cx={30} cy={-34} r={54} /><circle cx={85} cy={-8} r={34} />
  </g>
);

/** Campfire at (x, y) (base). */
export const Campfire: FC<{ x: number; y: number; s?: number; glow?: number }> = ({ x, y, s = 1, glow = 1 }) => {
  const f = useCurrentFrame();
  const fl = (p: number, a: number) => wave(f, a, 7 + p, p * 5) + wave(f, a * 0.6, 3.3 + p * 0.3, p * 2);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle cy={-30} r={380 + fl(1, 14)} fill="url(#fire)" opacity={glow} />
      <ellipse cx={0} cy={6} rx={70} ry={16} fill="#6e6a62" />
      <path d="M-50 6 L46 -14 M-46 -14 L50 6" stroke="#4a2c1a" strokeWidth={16} strokeLinecap="round" />
      <path d={`M-34 0 Q-40 ${-50 + fl(2, 6)} ${-6 + fl(3, 4)} ${-110 + fl(4, 10)} Q0 -60 14 ${-80 + fl(5, 8)} Q40 -40 34 0Z`} fill="#ff7b2c" />
      <path d={`M-20 0 Q-22 -40 ${fl(6, 4)} ${-78 + fl(7, 8)} Q20 -40 20 0Z`} fill="#ffc94a" />
      <path d={`M-8 0 Q-8 -24 ${fl(8, 3)} ${-42 + fl(9, 5)} Q9 -24 8 0Z`} fill="#fff3c0" />
      {Array.from({ length: 8 }, (_, i) => {
        const t = ((f + i * 23) % 90) / 90;
        return <circle key={i} cx={wave(f, 18, 40, i * 20) + (rand(i) - 0.5) * 50} cy={-60 - t * 320} r={4 * (1 - t) + 1} fill="#ffcf6a" opacity={1 - t} />;
      })}
    </g>
  );
};

/* ---------- characters ---------- */

type Mood = "calm" | "smile" | "shout" | "sad" | "awe" | "grin";
type Limb = [number, number];
export type HairStyle = "aru" | "long" | "cap" | "bun";

const Mouth: FC<{ x: number; y: number; mood: Mood; ink: string }> = ({ x, y, mood, ink }) => {
  if (mood === "shout") return <ellipse cx={x} cy={y + 4} rx={9} ry={13} fill="#5a1f1a" />;
  if (mood === "awe") return <ellipse cx={x} cy={y + 2} rx={6} ry={8} fill="#5a1f1a" />;
  if (mood === "grin") return <path d={`M${x - 14} ${y - 3} Q${x} ${y + 18} ${x + 14} ${y - 3}Z`} fill="#5a1f1a" stroke={ink} strokeWidth={3} strokeLinejoin="round" />;
  if (mood === "smile") return <path d={`M${x - 12} ${y} Q${x} ${y + 12} ${x + 12} ${y - 2}`} stroke={ink} strokeWidth={4.5} fill="none" strokeLinecap="round" />;
  if (mood === "sad") return <path d={`M${x - 10} ${y + 6} Q${x} ${y - 2} ${x + 10} ${y + 6}`} stroke={ink} strokeWidth={4.5} fill="none" strokeLinecap="round" />;
  return <path d={`M${x - 8} ${y + 2} L${x + 8} ${y + 2}`} stroke={ink} strokeWidth={4.5} strokeLinecap="round" />;
};

const useBlink = (phase = 0) => {
  const f = useCurrentFrame();
  const t = (f + phase) % 105;
  return t < 4 ? 0.1 : 1;
};

export type SidePose = { lean?: number; head?: number; armF?: Limb; armB?: Limb; legF?: Limb; legB?: Limb };

/** A walk cycle pose for AruSide; `t` advances with frames. */
export const walkPose = (t: number, amp = 26): SidePose => {
  const s = Math.sin(t);
  return { lean: 4, legF: [amp * s, -Math.max(0, -s) * 30 - 6], legB: [-amp * s, -Math.max(0, s) * 30 - 6], armF: [-amp * 0.8 * s, 24], armB: [amp * 0.8 * s, 24] };
};

/** A character in profile, facing right (flip to face left). Origin = hip joint. */
export const AruSide: FC<{
  x: number; y: number; s?: number; pose?: SidePose; flip?: boolean; mood?: Mood; shade?: number; pal?: Pal; style?: HairStyle;
}> = ({ x, y, s = 1, pose = {}, flip = false, mood = "calm", shade = 0, pal, style = "aru" }) => {
  const c = tone(shade, pal);
  const blink = useBlink(Math.round(x));
  const { lean = 0, head = 0, armF = [10, 20], armB = [-10, 20], legF = [6, -4], legB = [-6, -4] } = pose;
  const leg = ([a, k]: Limb, back: boolean) => {
    const [kx, ky] = seg(0, 0, a, 50), [fx, fy] = seg(kx, ky, a + k, 50);
    const [sx, sy] = seg(0, 0, a, 28);
    const fa = a + k;
    return (
      <g>
        <path d={`M0 0 L${kx} ${ky} L${fx} ${fy}`} stroke={back ? c.skinD : c.skin} strokeWidth={22} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d={`M0 0 L${sx} ${sy}`} stroke={back ? c.shortsD : c.shorts} strokeWidth={34} strokeLinecap="round" />
        <path d={`M${fx} ${fy} l${Math.cos(rad(fa)) * 18} ${-Math.sin(rad(fa)) * 18}`} stroke={back ? c.skinD : c.skin} strokeWidth={20} strokeLinecap="round" />
      </g>
    );
  };
  const arm = ([a, e]: Limb, back: boolean) => {
    const sx0 = 4, sy0 = -84;
    const [ex, ey] = seg(sx0, sy0, a, 42), [hx, hy] = seg(ex, ey, a + e, 40);
    const [vx, vy] = seg(sx0, sy0, a, 18);
    return (
      <g>
        <path d={`M${sx0} ${sy0} L${ex} ${ey} L${hx} ${hy}`} stroke={back ? c.skinD : c.skin} strokeWidth={18} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d={`M${sx0} ${sy0} L${vx} ${vy}`} stroke={back ? c.shirtD : c.shirt} strokeWidth={30} strokeLinecap="round" />
        <circle cx={hx} cy={hy} r={11} fill={back ? c.skinD : c.skin} />
      </g>
    );
  };
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      {leg(legB, true)}
      <g transform={`rotate(${lean})`}>
        {arm(armB, true)}
        <path d="M-30 -2 Q-34 -60 -24 -96 Q4 -108 30 -96 Q38 -60 32 -2 Q0 8 -30 -2Z" fill={c.shirt} />
        <path d="M-30 -2 Q0 8 32 -2 L32 6 Q0 16 -30 6Z" fill={c.shortsD} />
        <g transform={`rotate(${head} 4 -100)`}>
          {style === "long" && <path d="M-40 -170 Q-56 -110 -30 -84 L6 -96 Q-4 -130 -10 -160Z" fill={c.hair} />}
          <rect x={-6} y={-114} width={20} height={20} fill={c.skinD} />
          <circle cx={10} cy={-150} r={48} fill={c.skin} />
          <path d="M54 -150 q12 8 2 18" fill={c.skin} />
          <ellipse cx={-4} cy={-146} rx={10} ry={13} fill={c.skinD} />
          {style === "cap"
            ? <><path d="M-38 -150 Q-40 -204 12 -204 Q58 -200 60 -160 Z" fill="#e8c547" /><path d="M40 -162 Q80 -166 92 -156 Q70 -150 40 -152Z" fill="#c9a52e" /></>
            : <path d="M-38 -128 Q-50 -186 4 -198 Q50 -204 62 -160 Q54 -150 46 -170 Q40 -156 30 -172 Q22 -158 12 -170 Q4 -150 -10 -158 Q-18 -136 -38 -128Z" fill={c.hair} />}
          {style === "aru" && <path d="M-8 -196 q-4 -26 18 -30 q-6 12 2 26" fill={c.hair} />}
          {style === "bun" && <circle cx={-24} cy={-196} r={22} fill={c.hair} />}
          {eyeClosed(blink)
            ? <path d="M30 -146 q8 6 16 0" stroke={c.ink} strokeWidth={4} fill="none" strokeLinecap="round" />
            : <ellipse cx={38} cy={-148} rx={6} ry={8} fill={c.ink} />}
          <path d={mood === "sad" ? "M28 -166 l18 -4" : "M28 -168 l20 2"} stroke={c.hair} strokeWidth={5} strokeLinecap="round" />
          <ellipse cx={34} cy={-128} rx={9} ry={5} fill="#e0705a" opacity={0.35 * (1 - shade)} />
          <Mouth x={44} y={-122} mood={mood} ink={c.ink} />
        </g>
      </g>
      {leg(legF, false)}
      <g transform={`rotate(${lean})`}>{arm(armF, false)}</g>
    </g>
  );
};
const eyeClosed = (b: number) => b < 0.2;

/** A character facing the viewer. Origin = hip centre. arms: [angle out from body, elbow bend]. */
export const AruFront: FC<{
  x: number; y: number; s?: number; armL?: Limb; armR?: Limb; mood?: Mood; shade?: number; bob?: number; legSpread?: number; look?: number; pal?: Pal; style?: HairStyle;
}> = ({ x, y, s = 1, armL = [12, 6], armR = [12, 6], mood = "smile", shade = 0, bob = 0, legSpread = 4, look = 0, pal, style = "aru" }) => {
  const c = tone(shade, pal);
  const blink = useBlink(Math.round(y + x));
  const arm = ([a, e]: Limb, side: -1 | 1) => {
    const sx0 = side * 40, sy0 = -92;
    const [ex0, ey] = seg(0, sy0, a, 44), [hx0, hy] = seg(ex0, ey, a + e, 42);
    const ex = sx0 + side * ex0, hx = sx0 + side * hx0;
    const [vx0, vy] = seg(0, sy0, a, 18);
    return (
      <g>
        <path d={`M${sx0} ${sy0} L${ex} ${ey} L${hx} ${hy}`} stroke={c.skin} strokeWidth={19} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d={`M${sx0} ${sy0} L${sx0 + side * vx0} ${vy}`} stroke={c.shirt} strokeWidth={32} strokeLinecap="round" />
        <circle cx={hx} cy={hy} r={12} fill={c.skin} />
      </g>
    );
  };
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${s})`}>
      {[-1, 1].map((sd) => (
        <g key={sd}>
          <path d={`M${sd * 18} 0 L${sd * (18 + legSpread)} 96`} stroke={c.skin} strokeWidth={24} strokeLinecap="round" />
          <ellipse cx={sd * (22 + legSpread)} cy={100} rx={18} ry={9} fill={c.skinD} />
        </g>
      ))}
      <path d="M-44 4 L44 4 L40 38 L6 38 L0 20 L-6 38 L-40 38Z" fill={c.shorts} />
      {arm(armL, -1)}
      {arm(armR, 1)}
      <path d="M-44 8 Q-48 -60 -40 -100 Q0 -112 40 -100 Q48 -60 44 8 Q0 16 -44 8Z" fill={c.shirt} />
      <path d="M-16 -104 Q0 -86 16 -104" stroke={c.shirtD} strokeWidth={6} fill="none" />
      <rect x={-10} y={-120} width={20} height={20} fill={c.skinD} />
      <g transform={`translate(${look} 0)`}>
        {style === "long" && <path d="M-58 -170 Q-66 -100 -48 -84 L48 -84 Q66 -100 58 -170Z" fill={c.hair} />}
        {style === "bun" && <circle cx={0} cy={-222} r={24} fill={c.hair} />}
        <circle cx={-50} cy={-158} r={11} fill={c.skinD} />
        <circle cx={50} cy={-158} r={11} fill={c.skinD} />
        <circle cx={0} cy={-162} r={50} fill={c.skin} />
        {style === "cap"
          ? <><path d="M-54 -162 Q-56 -222 0 -222 Q56 -222 54 -162 Q0 -178 -54 -162Z" fill="#e8c547" /><path d="M-40 -168 Q0 -150 40 -168 Q30 -158 0 -154 Q-30 -158 -40 -168Z" fill="#c9a52e" /></>
          : <path d="M-52 -150 Q-60 -214 0 -218 Q60 -214 52 -150 Q46 -176 30 -180 Q24 -168 10 -182 Q0 -166 -14 -182 Q-26 -168 -34 -180 Q-46 -174 -52 -150Z" fill={c.hair} />}
        {style === "aru" && <path d="M-6 -214 q-6 -26 18 -30 q-6 12 2 28" fill={c.hair} />}
        {blink < 0.5
          ? <><path d="M-26 -158 q8 6 16 0" stroke={c.ink} strokeWidth={4} fill="none" /><path d="M10 -158 q8 6 16 0" stroke={c.ink} strokeWidth={4} fill="none" /></>
          : <><ellipse cx={-18} cy={-160} rx={6} ry={8} fill={c.ink} /><ellipse cx={18} cy={-160} rx={6} ry={8} fill={c.ink} />
            <circle cx={-16} cy={-163} r={2} fill="#fff" /><circle cx={20} cy={-163} r={2} fill="#fff" /></>}
        <path d="M-28 -176 l18 -2 M10 -178 l18 2" stroke={c.hair} strokeWidth={5} strokeLinecap="round" />
        <ellipse cx={-30} cy={-140} rx={10} ry={6} fill="#e0705a" opacity={0.35 * (1 - shade)} />
        <ellipse cx={30} cy={-140} rx={10} ry={6} fill="#e0705a" opacity={0.35 * (1 - shade)} />
        <Mouth x={0} y={-134} mood={mood} ink={c.ink} />
      </g>
    </g>
  );
};

/** Soft ground shadow under a character. */
export const Shadow: FC<{ x: number; y: number; w?: number; o?: number }> = ({ x, y, w = 70, o = 0.22 }) => <ellipse cx={x} cy={y} rx={w} ry={w * 0.22} fill="#000" opacity={o} />;

/* ---------- set pieces ---------- */

/** Lighthouse standing on (x, y) (base centre). `lit` 0..1 lights the lantern and sweeps a beam. */
export const Lighthouse: FC<{ x: number; y: number; s?: number; lit?: number; shade?: number }> = ({ x, y, s = 1, lit = 0, shade = 0.6 }) => {
  const f = useCurrentFrame();
  const c = (col: string) => interpolateColors(shade, [0, 1], [col, NIGHT]);
  const a = (f * 1.6) % 360;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {lit > 0 && <g opacity={lit}>
        <g transform={`translate(0 -560) scale(${Math.cos(rad(a))} 1)`}><path d="M0 -20 L900 -140 L900 120 L0 20Z" fill="url(#beam)" /></g>
        <circle cx={0} cy={-560} r={110} fill="url(#lamp)" />
      </g>}
      <path d="M-120 0 L-80 -480 L80 -480 L120 0Z" fill={c("#f1ece2")} />
      {[0, 1, 2].map((i) => {
        const y0 = -60 - i * 150, y1 = y0 - 70, k0 = 1 + y0 / 1200, k1 = 1 + y1 / 1200;
        return <path key={i} d={`M${-120 * k0} ${y0} L${-120 * k1} ${y1} L${120 * k1} ${y1} L${120 * k0} ${y0}Z`} fill={c("#c8463c")} />;
      })}
      <path d="M40 0 L70 -480 L80 -480 L120 0Z" fill="#000" opacity={0.18} />
      <rect x={-22} y={-90} width={44} height={90} rx={22} fill={c("#3a2a22")} />
      <rect x={-110} y={-500} width={220} height={24} rx={6} fill={c("#2d3a46")} />
      <rect x={-58} y={-600} width={116} height={100} rx={8} fill={lit > 0 ? interpolateColors(lit, [0, 1], [c("#24313d"), "#ffe9a3"]) : c("#24313d")} />
      <path d="M-58 -600 v100 M-18 -600 v100 M18 -600 v100 M58 -600 v100" stroke={c("#2d3a46")} strokeWidth={8} />
      <path d="M-76 -600 L0 -670 L76 -600Z" fill={c("#c8463c")} />
      <circle cx={0} cy={-676} r={10} fill={c("#2d3a46")} />
    </g>
  );
};

/** A lantern on a post. `on` 0..1. Base at (x, y). */
export const Lamp: FC<{ x: number; y: number; s?: number; on?: number; shade?: number; phase?: number }> = ({ x, y, s = 1, on = 0, shade = 0.5, phase = 0 }) => {
  const f = useCurrentFrame();
  const flick = 0.9 + wave(f, 0.06, 5, phase) + wave(f, 0.04, 2.3, phase);
  const pop = on > 0 && on < 1 ? 1 + Math.sin(on * Math.PI) * 0.25 : 1;
  const post = interpolateColors(shade, [0, 1], ["#5b3b25", NIGHT]);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {on > 0 && <circle cx={0} cy={-170} r={170 * pop * flick} fill="url(#lamp)" opacity={on} />}
      <rect x={-7} y={-150} width={14} height={150} rx={5} fill={post} />
      <path d="M-26 -150 h52" stroke={post} strokeWidth={8} strokeLinecap="round" />
      <rect x={-22} y={-200} width={44} height={50} rx={8} fill={interpolateColors(on, [0, 1], ["#1d2233", "#ffd773"])} stroke={post} strokeWidth={6} />
      <path d="M-28 -200 L0 -222 L28 -200Z" fill={post} />
    </g>
  );
};

/** A-frame tent at (x, y) (base centre). */
export const Tent: FC<{ x: number; y: number; s?: number; color?: string }> = ({ x, y, s = 1, color = "#d9a441" }) => {
  const f = useCurrentFrame();
  const flap = wave(f, 4, 60);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-180 0 L0 -220 L180 0Z" fill={color} />
      <path d="M0 -220 L180 0 L60 0Z" fill="#000" opacity={0.18} />
      <path d={`M-50 0 L0 -150 L${30 + flap} 0Z`} fill="#3a2717" />
      <path d="M0 -220 L0 -250" stroke="#5b3b25" strokeWidth={8} strokeLinecap="round" />
      <path d={`M0 -250 l${40 + flap * 2} 10 l${-40 - flap * 2} 12Z`} fill="#e3554a" />
    </g>
  );
};

/** The Batu Nama: a tall standing stone with a panel. `open` 0..1 slides the doors; `names` 0..3 how many plates are carved; `glow` 0..1. */
export const NameStone: FC<{ x: number; y: number; s?: number; open?: number; names?: number; glow?: number }> = ({ x, y, s = 1, open = 0, names = 0, glow = 0 }) => {
  const f = useCurrentFrame();
  const plates = [0, 1, 2];
  const lens = [[150, 0.75], [130, 0.6], [170, 0.85]];
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {glow > 0 && <ellipse cx={0} cy={-300} rx={330} ry={380} fill="url(#lamp)" opacity={glow * (0.8 + wave(f, 0.2, 40))} />}
      <ellipse cx={0} cy={6} rx={200} ry={30} fill="#000" opacity={0.2} />
      <path d="M-160 0 Q-185 -330 -120 -540 Q0 -620 120 -540 Q185 -330 160 0Z" fill="url(#stone)" />
      <path d="M-120 -540 Q-60 -580 0 -585" stroke="#a9b0b2" strokeWidth={10} fill="none" strokeLinecap="round" />
      {[[-110, -120, 26], [100, -60, 18], [-90, -470, 16], [120, -380, 22]].map(([cx, cy, r], i) => <circle key={i} cx={cx} cy={cy} r={r} fill="#6b8f5a" opacity={0.55} />)}
      <text x={0} y={-470} textAnchor="middle" fontFamily={fontFamily} fontWeight={800} fontSize={48} fill="#4b5153" letterSpacing={4}>BATU NAMA</text>
      {/* panel recess */}
      <rect x={-115} y={-430} width={230} height={330} rx={14} fill="#3f4547" />
      <g opacity={Math.min(1, open * 2)}>
        {plates.map((i) => {
          const py = -405 + i * 100;
          const p = Math.max(0, Math.min(1, names - i));
          const bw = lens[i][0] - 40;
          return (
            <g key={i}>
              <rect x={-95} y={py} width={190} height={80} rx={10} fill={interpolateColors(Math.min(1, p * 4), [0, 1], ["#5a6163", "#d9c79a"])} />
              {p > 0 && <>
                <circle cx={-62} cy={py + 40} r={20} fill="#a88a4e" />
                <text x={-62} y={py + 52} textAnchor="middle" fontFamily={fontFamily} fontWeight={800} fontSize={32} fill="#6b5226">@</text>
                <rect x={-32} y={py + 22} width={bw * p} height={16} rx={8} fill="#7a5f2c" />
                <rect x={-32} y={py + 48} width={bw * lens[i][1] * p} height={10} rx={5} fill="#a88a4e" />
                {p < 1 && Array.from({ length: 6 }, (_, k) => {
                  const t = ((f + k * 5) % 14) / 14;
                  return <circle key={k} cx={-32 + bw * p + (rand(k + f) - 0.3) * 50 * t} cy={py + 30 - t * 50 * rand(k + 2)} r={5 * (1 - t) + 1} fill="#ffe08a" />;
                })}
              </>}
            </g>
          );
        })}
      </g>
      {/* stone doors */}
      <rect x={-115 - open * 115} y={-430} width={115} height={330} rx={10} fill="#757c7f" stroke="#5d6467" strokeWidth={6} />
      <rect x={open * 115} y={-430} width={115} height={330} rx={10} fill="#6b7275" stroke="#5d6467" strokeWidth={6} />
    </g>
  );
};

/** A big stone statue head on a base (the patung). Base centre at (x, y). */
export const Statue: FC<{ x: number; y: number; s?: number; blink?: number; squash?: number }> = ({ x, y, s = 1, blink = 0, squash = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s * (1 + squash * 0.12)} ${s * (1 - squash * 0.12)})`}>
    <ellipse cx={0} cy={4} rx={150} ry={24} fill="#000" opacity={0.2} />
    <rect x={-130} y={-60} width={260} height={64} rx={12} fill="#6f6a62" />
    <path d="M-95 -60 L-105 -330 Q-100 -420 0 -430 Q100 -420 105 -330 L95 -60Z" fill="#8b8478" />
    <path d="M30 -60 L50 -420 Q100 -410 105 -330 L95 -60Z" fill="#000" opacity={0.14} />
    <path d="M-110 -290 Q-130 -240 -112 -170 L-96 -180 L-98 -280Z" fill="#7a7368" />
    <path d="M110 -290 Q130 -240 112 -170 L96 -180 L98 -280Z" fill="#6c665c" />
    <path d="M-92 -320 L92 -320 L86 -296 L-86 -296Z" fill="#6c665c" />
    {blink > 0.5
      ? <><path d="M-62 -280 h44 M18 -280 h44" stroke="#3b3731" strokeWidth={8} strokeLinecap="round" /></>
      : <><ellipse cx={-40} cy={-276} rx={24} ry={14} fill="#4a453e" /><ellipse cx={40} cy={-276} rx={24} ry={14} fill="#4a453e" /></>}
    <path d="M0 -296 L-26 -170 Q0 -156 26 -170Z" fill="#9a9387" />
    <path d="M0 -296 L26 -170 Q14 -164 0 -164Z" fill="#000" opacity={0.15} />
    <path d="M-46 -122 Q0 -112 46 -122 Q30 -104 0 -102 Q-30 -104 -46 -122Z" fill="#4a453e" />
    <path d="M-70 -90 Q0 -70 70 -90 L66 -62 L-66 -62Z" fill="#7a7368" />
    <circle cx={-70} cy={-380} r={10} fill="#6b8f5a" opacity={0.6} />
  </g>
);

/** Broken wooden boat lying on the sand; rope tied to a post with a neat knot near (x + 300, y). */
export const Boat: FC<{ x: number; y: number; s?: number; shade?: number }> = ({ x, y, s = 1, shade = 0 }) => {
  const f = useCurrentFrame();
  const c = (col: string) => (shade > 0 ? interpolateColors(shade, [0, 1], [col, NIGHT]) : col);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={0} cy={16} rx={330} ry={40} fill="#000" opacity={0.2} />
      <g transform="rotate(-8)">
        <path d="M-300 -110 Q-250 30 0 40 Q250 30 300 -120 L230 -110 L-230 -100Z" fill={c("#8a5a34")} />
        {[0, 1, 2].map((i) => <path key={i} d={`M${-280 + i * 8} ${-80 + i * 38} Q0 ${-50 + i * 40} ${280 - i * 14} ${-90 + i * 38}`} stroke={c("#5e3c22")} strokeWidth={6} fill="none" />)}
        {/* hole with splintered planks */}
        <path d="M-40 -60 L10 -78 L40 -40 L70 -70 L90 -10 L30 10 L-20 -10Z" fill={c("#2a1a10")} />
        <path d="M10 -78 L-6 -110 M70 -70 L84 -104" stroke={c("#8a5a34")} strokeWidth={12} strokeLinecap="round" />
        <path d="M-300 -110 L300 -120" stroke={c("#5e3c22")} strokeWidth={14} strokeLinecap="round" />
        {/* snapped mast */}
        <path d="M-60 -110 L-60 -260" stroke={c("#6b4428")} strokeWidth={22} strokeLinecap="round" />
        <path d="M-72 -260 L-60 -284 L-52 -262 L-44 -276 L-48 -258Z" fill={c("#6b4428")} />
        <path d={`M-60 -250 Q-150 ${-200 + wave(f, 6, 50)} -230 -130`} stroke={c("#d8cfb8")} strokeWidth={4} fill="none" opacity={0.8} />
      </g>
      {/* post + neat rope */}
      <rect x={330} y={-170} width={34} height={190} rx={8} fill={c("#6b4428")} />
      <path d="M260 -100 Q300 -110 330 -116" stroke={c("#d9be86")} strokeWidth={12} fill="none" strokeLinecap="round" />
      {[0, 1, 2].map((i) => <path key={i} d={`M326 ${-128 + i * 16} Q347 ${-138 + i * 16} 368 ${-128 + i * 16}`} stroke={c("#e8d09a")} strokeWidth={10} fill="none" strokeLinecap="round" />)}
      <path d="M368 -100 q22 6 18 30 q-4 18 10 30" stroke={c("#d9be86")} strokeWidth={10} fill="none" strokeLinecap="round" />
      <circle cx={372} cy={-98} r={10} fill={c("#c9ab70")} />
    </g>
  );
};

/** Confetti burst started at frame `at` from (x, y). */
export const Confetti: FC<{ at: number; x: number; y: number; n?: number }> = ({ at, x, y, n = 60 }) => {
  const f = useCurrentFrame() - at;
  if (f < 0) return null;
  const cols = ["#ffd25a", "#ff6b5a", "#3cc58a", "#5aa8ff", "#ff9ad5", "#fff"];
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const a = rand(i + 3) * Math.PI * 2, v = 10 + rand(i + 9) * 22;
        const px = x + Math.cos(a) * v * f * 0.9, py = y + Math.sin(a) * v * f * 0.7 + 0.35 * f * f;
        const o = Math.max(0, 1 - f / 90);
        return <rect key={i} x={px} y={py} width={18} height={10} rx={3} fill={cols[i % cols.length]} opacity={o}
          transform={`rotate(${f * (8 + rand(i) * 10) + i * 30} ${px + 9} ${py + 5})`} />;
      })}
    </g>
  );
};

/** Dust puff at frame `at`. */
export const Dust: FC<{ at: number; x: number; y: number }> = ({ at, x, y }) => {
  const f = useCurrentFrame() - at;
  if (f < 0 || f > 40) return null;
  return (
    <g opacity={1 - f / 40}>
      {Array.from({ length: 10 }, (_, i) => {
        const d = i % 2 ? -1 : 1, k = f / 40;
        return <circle key={i} cx={x + d * (60 + rand(i) * 120) * (0.3 + k)} cy={y - rand(i + 5) * 40 * k - 10} r={20 + 30 * k * rand(i + 2) + 10} fill="#e6d4ae" />;
      })}
    </g>
  );
};

/* ---------- UI (HTML overlays) ---------- */

/** The in-game HUD pill, top-centre. Shows the island name (crossfading `from` → `to` by `flip`). */
export const Hud: FC<{ from: string; to?: string; flip?: number; residents?: number; day?: number; o?: number; pulse?: number; top?: number }> = ({
  from, to, flip = 0, residents = 4, day = 1, o = 1, pulse = 0, top = 90,
}) => (
  <div style={{ position: "absolute", left: 0, right: 0, top, display: "flex", justifyContent: "center", opacity: o }}>
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "14px 46px 10px", borderRadius: 34, transform: `scale(${1 + pulse * 0.12})`,
      background: "rgba(10,22,36,.72)", border: `4px solid rgba(255,210,90,${0.4 + pulse * 0.6})`, boxShadow: `0 0 ${12 + pulse * 50}px rgba(255,200,90,${0.2 + pulse * 0.5})`,
      fontFamily, fontWeight: 800, color: "#fff" }}>
      <div style={{ position: "relative", height: 74, minWidth: 520, fontSize: 64, lineHeight: "74px", textAlign: "center", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: -flip * 74, opacity: 1 - flip, color: "#cfd9e3" }}>{from}</div>
        {to && <div style={{ position: "absolute", left: 0, right: 0, top: (1 - flip) * 74, opacity: flip, color: UI.accent }}>{to}</div>}
      </div>
      <div style={{ fontSize: 34, color: UI.dim, letterSpacing: 1 }}>Hari ke-{day} · {residents} penduduk</div>
    </div>
  </div>
);

/** Storybook text overlay. */
export const Caption: FC<{ text: string; top: number; size?: number; o?: number; y?: number; s?: number; color?: string }> = ({
  text, top, size = 84, o = 1, y = 0, s = 1, color = "#fff7e0",
}) => (
  <div style={{ position: "absolute", left: 50, right: 50, top, textAlign: "center", opacity: o, transform: `translateY(${y}px) scale(${s})`,
    fontFamily, fontWeight: 800, fontSize: size, lineHeight: 1.1, color, textShadow: "0 6px 0 rgba(0,0,0,.35), 0 0 30px rgba(0,0,0,.35)" }}>{text}</div>
);

/** Rounded phone frame drawn in HTML, centred horizontally. Children fill the screen. */
export const Phone: FC<{ top: number; w: number; h: number; rot?: number; s?: number; children: ReactNode }> = ({ top, w, h, rot = 0, s = 1, children }) => (
  <div style={{ position: "absolute", left: (W - w) / 2, top, width: w, height: h, borderRadius: 70, background: "#0b0f16", padding: 22, boxSizing: "border-box",
    transform: `rotate(${rot}deg) scale(${s})`, boxShadow: "0 40px 80px rgba(0,0,0,.5), inset 0 0 0 4px #2a3240" }}>
    <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 50, overflow: "hidden", background: UI.bg }}>
      {children}
      <div style={{ position: "absolute", left: "50%", top: 14, width: 150, height: 34, marginLeft: -75, borderRadius: 20, background: "#0b0f16" }} />
    </div>
  </div>
);

/** A comment card. Unknown commenters are drawn as blurred bars (we don't invent usernames). */
export const CommentCard: FC<{ name?: string; text?: string; seed: number; hi?: number; w?: number; style?: React.CSSProperties }> = ({ name, text, seed, hi = 0, w = 620, style }) => {
  const hue = Math.floor(rand(seed) * 360);
  return (
    <div style={{ width: w, height: 120, borderRadius: 24, display: "flex", alignItems: "center", gap: 22, padding: "0 26px", boxSizing: "border-box",
      background: interpolateColors(hi, [0, 1], [UI.panel, "#fff4cf"]), border: `4px solid ${interpolateColors(hi, [0, 1], [UI.line, UI.accent])}`, fontFamily, fontWeight: 800, ...style }}>
      <div style={{ width: 70, height: 70, borderRadius: 35, flexShrink: 0, background: name ? "#1b1b1b" : `hsl(${hue} 55% 55%)`, color: "#fff", fontSize: 30,
        display: "flex", alignItems: "center", justifyContent: "center" }}>{name ? name[0] : ""}</div>
      {name ? (
        <div style={{ lineHeight: 1.05 }}>
          <div style={{ fontSize: 36, color: interpolateColors(hi, [0, 1], [UI.text, "#1b2a3a"]) }}>{name}</div>
          <div style={{ fontSize: 32, color: interpolateColors(hi, [0, 1], [UI.dim, "#4a5a6a"]) }}>{text}</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ width: 120 + rand(seed + 1) * 120, height: 18, borderRadius: 9, background: "#5f86a6" }} />
          <div style={{ width: 200 + rand(seed + 2) * 240, height: 14, borderRadius: 7, background: "#3f6584" }} />
        </div>
      )}
    </div>
  );
};

/** Big pressable button. `press` 0..1 pushes it in. */
export const Btn: FC<{ label: string; press?: number; color?: string; w?: number; size?: number }> = ({ label, press = 0, color = UI.accent, w = 420, size = 56 }) => (
  <div style={{ width: w, padding: "18px 0 12px", borderRadius: 30, textAlign: "center", fontFamily, fontWeight: 800, fontSize: size, color: "#1b2a3a",
    background: color, boxShadow: `0 ${12 - press * 10}px 0 ${dark(color, 0.35)}`, transform: `translateY(${press * 10}px)` }}>{label}</div>
);

/** A tapping fingertip (a soft white circle with ripple). */
export const Tap: FC<{ x: number; y: number; t: number }> = ({ x, y, t }) => (
  <div style={{ position: "absolute", left: x - 45, top: y - 45, width: 90, height: 90, borderRadius: 45, background: "rgba(255,255,255,.55)",
    boxShadow: `0 0 0 ${Math.max(0, t) * 60}px rgba(255,255,255,${0.35 * (1 - Math.min(1, Math.max(0, t)))})`, transform: `scale(${1 - Math.sin(Math.min(1, Math.max(0, t)) * Math.PI) * 0.2})` }} />
);
