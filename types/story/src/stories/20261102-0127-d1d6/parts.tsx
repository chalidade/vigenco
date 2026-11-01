import type { FC, ReactNode } from "react";
import { AbsoluteFill, interpolateColors, useCurrentFrame } from "remotion";
import { baloo } from "../../lib/fonts";
import { rand, wave } from "../../lib/kit";

export const W = 1080, H = 1920;
export const fontFamily = baloo;

/** Aru's colours, darkened toward night navy by `shade` 0..1. */
const BASE = { skin: "#c98b5f", skinD: "#a46b45", hair: "#2a1a14", shirt: "#e37b4e", shirtD: "#b95a35", shorts: "#2d7c84", shortsD: "#1f5a60", ink: "#24150f" };
const NIGHT = "#0d1030";
const tone = (shade: number) => {
  const c = (k: keyof typeof BASE) => (shade <= 0 ? BASE[k] : interpolateColors(shade, [0, 1], [BASE[k], NIGHT]));
  return { skin: c("skin"), skinD: c("skinD"), hair: c("hair"), shirt: c("shirt"), shirtD: c("shirtD"), shorts: c("shorts"), shortsD: c("shortsD"), ink: c("ink") };
};

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
        <radialGradient id="sunglow">
          <stop offset="0" stopColor="#fff2c2" stopOpacity="0.9" />
          <stop offset="1" stopColor="#ffd38a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="vig" cx="0.5" cy="0.5" r="0.75">
          <stop offset="0.55" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.75" />
        </radialGradient>
      </defs>
      {children}
    </svg>
  </AbsoluteFill>
);

export const Vignette: FC<{ o?: number }> = ({ o = 1 }) => <rect width={W} height={H} fill="url(#vig)" opacity={o} />;

export const Sky: FC<{ id: string; stops: [number, string][] ; h?: number }> = ({ id, stops, h = H }) => (
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
        return <circle key={i} cx={rand(k) * W} cy={rand(k + 99) * maxY} r={r} fill="#fff"
          opacity={0.5 + wave(f, 0.45, 40 + rand(k + 3) * 60, k * 13)} />;
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
        const d = rand(i + 300); // depth 0 far .. 1 near
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
  const k = Math.min(1, h / 400); // small palms get small fronds
  return (
    <g>
      <path d={`M${x} ${y} Q${x + lean * 0.1} ${y - h * 0.55} ${tx} ${ty}`} stroke={trunk} strokeWidth={30} fill="none" strokeLinecap="round" />
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
        <circle cx={-12} cy={16} r={15} fill={nut} />
        <circle cx={12} cy={18} r={14} fill={nut} />
        <circle cx={0} cy={30} r={13} fill={nut} />
      </g>
    </g>
  );
};

/** A gull as a flapping "m". */
export const Gull: FC<{ x: number; y: number; s?: number; color?: string; phase?: number }> = ({ x, y, s = 1, color = "#fdfdf8", phase = 0 }) => {
  const f = useCurrentFrame();
  const w = wave(f, 14, 12, phase);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d={`M-40 ${-w} Q-20 ${-18 - w * 0.4} 0 0 Q20 ${-18 - w * 0.4} 40 ${-w}`} stroke={color} strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M0 0 l0 -2" stroke="#333" strokeWidth={6} strokeLinecap="round" />
    </g>
  );
};

export const Cloud: FC<{ x: number; y: number; s?: number; color: string; o?: number }> = ({ x, y, s = 1, color, o = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} fill={color} opacity={o}>
    <ellipse cx={0} cy={0} rx={120} ry={34} /><circle cx={-40} cy={-20} r={42} /><circle cx={30} cy={-34} r={54} /><circle cx={85} cy={-8} r={34} />
  </g>
);

/** Small campfire at (x, y) (base). `k` 0..1 overall size. */
export const Campfire: FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => {
  const f = useCurrentFrame();
  const fl = (p: number, a: number) => wave(f, a, 7 + p, p * 5) + wave(f, a * 0.6, 3.3 + p * 0.3, p * 2);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle cy={-30} r={380 + fl(1, 14)} fill="url(#fire)" />
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

/** Glass bottle with a rolled letter, drawn upright, centred at (x, y). */
export const Bottle: FC<{ x: number; y: number; s?: number; rot?: number; letter?: boolean }> = ({ x, y, s = 1, rot = 0, letter = true }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-30} y={-40} width={60} height={110} rx={22} fill="#7fd1c0" fillOpacity={0.55} stroke="#d8fff4" strokeOpacity={0.8} strokeWidth={4} />
    <path d="M-14 -40 Q-14 -64 -10 -78 L10 -78 Q14 -64 14 -40Z" fill="#7fd1c0" fillOpacity={0.55} stroke="#d8fff4" strokeOpacity={0.8} strokeWidth={4} />
    <rect x={-11} y={-96} width={22} height={22} rx={5} fill="#a8774a" />
    {letter && <g><rect x={-17} y={-22} width={34} height={78} rx={10} fill="#f5e6c4" /><path d="M-17 -6 h34 M-17 40 h34" stroke="#c9a46a" strokeWidth={3} /></g>}
    <path d="M-20 -26 Q-24 20 -18 58" stroke="#fff" strokeOpacity={0.7} strokeWidth={6} fill="none" strokeLinecap="round" />
  </g>
);

type Mood = "calm" | "smile" | "shout" | "sad" | "sleep" | "awe";
type Limb = [number, number];

const Mouth: FC<{ x: number; y: number; mood: Mood; ink: string }> = ({ x, y, mood, ink }) => {
  if (mood === "shout") return <ellipse cx={x} cy={y + 4} rx={9} ry={13} fill="#5a1f1a" />;
  if (mood === "awe") return <ellipse cx={x} cy={y + 2} rx={6} ry={8} fill="#5a1f1a" />;
  if (mood === "smile") return <path d={`M${x - 12} ${y} Q${x} ${y + 12} ${x + 12} ${y - 2}`} stroke={ink} strokeWidth={4.5} fill="none" strokeLinecap="round" />;
  if (mood === "sad") return <path d={`M${x - 10} ${y + 6} Q${x} ${y - 2} ${x + 10} ${y + 6}`} stroke={ink} strokeWidth={4.5} fill="none" strokeLinecap="round" />;
  return <path d={`M${x - 8} ${y + 2} L${x + 8} ${y + 2}`} stroke={ink} strokeWidth={4.5} strokeLinecap="round" />;
};

/** Blink factor 1 (open) .. 0.1 (closed), every ~3.5 s. */
const useBlink = (phase = 0) => {
  const f = useCurrentFrame();
  const t = (f + phase) % 105;
  return t < 4 ? 0.1 : 1;
};

const Drips: FC<{ x: number; y: number; n?: number; color?: string }> = ({ x, y, n = 3, color = "#9fdcff" }) => {
  const f = useCurrentFrame();
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const t = ((f + i * 17) % 40) / 40;
        return <path key={i} d={`M${x + (i - 1) * 26} ${y + t * 70} q-5 9 0 12 q5 -3 0 -12Z`} fill={color} opacity={1 - t} />;
      })}
    </g>
  );
};

export type SidePose = { lean?: number; head?: number; armF?: Limb; armB?: Limb; legF?: Limb; legB?: Limb };

/**
 * Aru in profile, facing right (flip to face left). Origin = hip joint.
 * Limb = [shoulder/hip angle, elbow/knee bend] in degrees; 0 = straight down, + = forward.
 */
export const AruSide: FC<{
  x: number; y: number; s?: number; pose?: SidePose; flip?: boolean; mood?: Mood; wet?: number; shade?: number; eyes?: number;
  hold?: (hx: number, hy: number) => ReactNode;
}> = ({ x, y, s = 1, pose = {}, flip = false, mood = "calm", wet = 0, shade = 0, eyes = 1, hold }) => {
  const c = tone(shade);
  const blink = useBlink(Math.round(x));
  const { lean = 0, head = 0, armF = [10, 20], armB = [-10, 20], legF = [6, -4], legB = [-6, -4] } = pose;
  const shirt = wet > 0 ? interpolateColors(wet, [0, 1], [c.shirt, c.shirtD]) : c.shirt;
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
        <path d={`M${sx0} ${sy0} L${vx} ${vy}`} stroke={back ? c.shirtD : shirt} strokeWidth={30} strokeLinecap="round" />
        <circle cx={hx} cy={hy} r={11} fill={back ? c.skinD : c.skin} />
        {!back && hold?.(hx, hy)}
      </g>
    );
  };
  const torsoT = `rotate(${lean})`;
  const eyeOpen = Math.min(blink, eyes);
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      {leg(legB, true)}
      <g transform={torsoT}>
        {arm(armB, true)}
        <path d="M-30 -2 Q-34 -60 -24 -96 Q4 -108 30 -96 Q38 -60 32 -2 Q0 8 -30 -2Z" fill={shirt} />
        <path d="M-30 -2 Q0 8 32 -2 L32 6 Q0 16 -30 6Z" fill={c.shortsD} />
        <g transform={`rotate(${head} 4 -100)`}>
          <rect x={-6} y={-114} width={20} height={20} fill={c.skinD} />
          <circle cx={10} cy={-150} r={48} fill={c.skin} />
          <path d="M54 -150 q12 8 2 18" fill={c.skin} />
          <ellipse cx={-4} cy={-146} rx={10} ry={13} fill={c.skinD} />
          <path d="M-38 -128 Q-50 -186 4 -198 Q50 -204 62 -160 Q54 -150 46 -170 Q40 -156 30 -172 Q22 -158 12 -170 Q4 -150 -10 -158 Q-18 -136 -38 -128Z" fill={c.hair} />
          <path d="M-8 -196 q-4 -26 18 -30 q-6 12 2 26" fill={c.hair} />
          {mood === "sleep" || eyeOpen < 0.2
            ? <path d="M30 -146 q8 6 16 0" stroke={c.ink} strokeWidth={4} fill="none" strokeLinecap="round" />
            : <ellipse cx={38} cy={-148} rx={6} ry={8 * eyeOpen} fill={c.ink} />}
          <path d={mood === "sad" ? "M28 -166 l18 -4" : "M28 -168 l20 2"} stroke={c.hair} strokeWidth={5} strokeLinecap="round" />
          <ellipse cx={34} cy={-128} rx={9} ry={5} fill="#e0705a" opacity={0.35 * (1 - shade)} />
          <Mouth x={44} y={-122} mood={mood} ink={c.ink} />
          {wet > 0.3 && <Drips x={-10} y={-140} n={3} />}
        </g>
      </g>
      {leg(legF, false)}
      <g transform={torsoT}>{arm(armF, false)}</g>
      {wet > 0.3 && <Drips x={4} y={-20} n={2} />}
    </g>
  );
};

/** Aru facing the viewer. Origin = hip centre. arms: [angle out from body, elbow bend]. */
export const AruFront: FC<{
  x: number; y: number; s?: number; armL?: Limb; armR?: Limb; mood?: Mood; shade?: number; bob?: number; legSpread?: number;
  holdR?: (hx: number, hy: number) => ReactNode; holdL?: (hx: number, hy: number) => ReactNode; look?: number;
}> = ({ x, y, s = 1, armL = [12, 6], armR = [12, 6], mood = "smile", shade = 0, bob = 0, legSpread = 4, holdR, holdL, look = 0 }) => {
  const c = tone(shade);
  const blink = useBlink(Math.round(y));
  const arm = ([a, e]: Limb, side: -1 | 1, hold?: (hx: number, hy: number) => ReactNode) => {
    const sx0 = side * 40, sy0 = -92;
    const [ex0, ey] = seg(0, sy0, a, 44), [hx0, hy] = seg(ex0, ey, a + e, 42);
    const ex = sx0 + side * ex0, hx = sx0 + side * hx0;
    const [vx0, vy] = seg(0, sy0, a, 18);
    return (
      <g>
        <path d={`M${sx0} ${sy0} L${ex} ${ey} L${hx} ${hy}`} stroke={c.skin} strokeWidth={19} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d={`M${sx0} ${sy0} L${sx0 + side * vx0} ${vy}`} stroke={c.shirt} strokeWidth={32} strokeLinecap="round" />
        <circle cx={hx} cy={hy} r={12} fill={c.skin} />
        {hold?.(hx, hy)}
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
      {arm(armL, -1, holdL)}
      {arm(armR, 1, holdR)}
      <path d="M-44 8 Q-48 -60 -40 -100 Q0 -112 40 -100 Q48 -60 44 8 Q0 16 -44 8Z" fill={c.shirt} />
      <path d="M-16 -104 Q0 -86 16 -104" stroke={c.shirtD} strokeWidth={6} fill="none" />
      <rect x={-10} y={-120} width={20} height={20} fill={c.skinD} />
      <g transform={`translate(${look} 0)`}>
        <circle cx={-50} cy={-158} r={11} fill={c.skinD} />
        <circle cx={50} cy={-158} r={11} fill={c.skinD} />
        <circle cx={0} cy={-162} r={50} fill={c.skin} />
        <path d="M-52 -150 Q-60 -214 0 -218 Q60 -214 52 -150 Q46 -176 30 -180 Q24 -168 10 -182 Q0 -166 -14 -182 Q-26 -168 -34 -180 Q-46 -174 -52 -150Z" fill={c.hair} />
        <path d="M-6 -214 q-6 -26 18 -30 q-6 12 2 28" fill={c.hair} />
        {blink < 0.5 || mood === "sleep"
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

/** The "PENDUDUK: n" counter, top-right. `flip` 0..1 animates n → n+1. */
export const Counter: FC<{ n?: number; flip?: number; o?: number; pulse?: number; s?: number }> = ({ n = 1, flip = 0, o = 1, pulse = 0, s = 1 }) => (
  <div style={{ position: "absolute", right: 56, top: 84, opacity: o, transform: `scale(${s * (1 + pulse * 0.18)})`, transformOrigin: "100% 0%",
    display: "flex", alignItems: "center", gap: 14, padding: "10px 26px 6px 22px", borderRadius: 999,
    background: "rgba(8,12,28,.55)", border: `3px solid rgba(255,214,120,${0.35 + pulse * 0.6})`,
    boxShadow: `0 0 ${10 + pulse * 40}px rgba(255,200,90,${0.15 + pulse * 0.5})`, fontFamily, fontWeight: 800, color: "#ffe6a8", fontSize: 44, letterSpacing: 2 }}>
    <svg width={30} height={38} viewBox="0 0 30 38" style={{ marginTop: -4 }}>
      <circle cx={15} cy={9} r={8} fill="#ffe6a8" /><path d="M1 37 Q1 19 15 19 Q29 19 29 37Z" fill="#ffe6a8" />
    </svg>
    <span>PENDUDUK:</span>
    <span style={{ position: "relative", display: "inline-block", width: 30, height: 56, overflow: "hidden" }}>
      <span style={{ position: "absolute", left: 0, top: -flip * 56, opacity: 1 - flip }}>{n}</span>
      <span style={{ position: "absolute", left: 0, top: (1 - flip) * 56, opacity: flip, color: "#fff4c8" }}>{n + 1}</span>
    </span>
  </div>
);

/** Storybook text overlay. */
export const Caption: FC<{ text: string; top: number; size?: number; o?: number; y?: number; s?: number; color?: string; children?: ReactNode }> = ({
  text, top, size = 84, o = 1, y = 0, s = 1, color = "#fff7e0",
}) => (
  <div style={{ position: "absolute", left: 60, right: 60, top, textAlign: "center", opacity: o, transform: `translateY(${y}px) scale(${s})`,
    fontFamily, fontWeight: 800, fontSize: size, lineHeight: 1.1, color, textShadow: "0 6px 0 rgba(0,0,0,.35), 0 0 30px rgba(0,0,0,.35)" }}>{text}</div>
);
