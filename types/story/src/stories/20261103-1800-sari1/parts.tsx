import type { CSSProperties, FC, ReactNode } from "react";
import { AbsoluteFill, Easing, Img, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { baloo } from "../../lib/fonts";
import type { Word } from "../../lib/Story";
import { rand, tween, wave } from "../../lib/kit";

export const W = 1080, H = 1920;
export const ID = "20261103-1800-sari1";
export const fontFamily = baloo;
const ui = `"Inter", "Segoe UI", system-ui, sans-serif`;

/** Story palette: act 1 grey-blue dawn, act 2 bright app days, act 3 sunrise gold. */
export const C = {
  hijab: "#2f5fd0", hijabDark: "#22479f", blouse: "#f3e6cf", skirt: "#3b3a52", skin: "#a86a3f", skinDark: "#8a5431",
  ibuSkin: "#8f5a35", ibuCloth: "#7a2f2a", ibuScarf: "#d9a441", ink: "#2b1d16", wood: "#6b4a33", woodDark: "#4a3222", thatch: "#a88a5c",
  yellow: "#FFF000",
};

// ───────────────────────── timing helpers ─────────────────────────

/** A moment in a scene: a fraction of its length, or the first word starting with `w` (nth match), plus an offset in frames. */
export type At = number | { w: string; n?: number; off?: number; f?: number };
const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[^a-z0-9]/g, "");
/** Resolve an At to a frame. Word anchors keep actions on the spoken word when the voice is regenerated. */
export const at = (a: At, frames: number, words: Word[], lead: number) => {
  if (typeof a === "number") return Math.round(a * frames);
  const target = norm(a.w);
  let n = a.n ?? 0;
  for (const wd of words) {
    if (norm(wd.text).startsWith(target) && n-- === 0) return Math.round((lead + wd.start) * 30) + (a.off ?? 0);
  }
  return Math.round((a.f ?? 0.5) * frames) + (a.off ?? 0); // the word was not found: fall back to a fraction
};

// ───────────────────────── illustration kit ─────────────────────────

export const Canvas: FC<{ children: ReactNode; style?: CSSProperties }> = ({ children, style }) => (
  <AbsoluteFill style={style}>
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
      <defs>
        <radialGradient id="sunGlow">
          <stop offset="0" stopColor="#fff6d0" stopOpacity="0.95" />
          <stop offset="0.3" stopColor="#ffd77a" stopOpacity="0.55" />
          <stop offset="1" stopColor="#ffb347" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="warmWin">
          <stop offset="0" stopColor="#ffd98a" stopOpacity="0.9" />
          <stop offset="1" stopColor="#ffb85c" stopOpacity="0" />
        </radialGradient>
      </defs>
      {children}
    </svg>
  </AbsoluteFill>
);

/** Sky as a 3-stop vertical gradient. */
export const Sky: FC<{ id: string; top: string; mid: string; bottom: string; h?: number }> = ({ id, top, mid, bottom, h = H }) => (
  <>
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={top} />
        <stop offset="0.6" stopColor={mid} />
        <stop offset="1" stopColor={bottom} />
      </linearGradient>
    </defs>
    <rect width={W} height={h} fill={`url(#${id})`} />
  </>
);

/** The sea from `y` down, with drifting light streaks. */
export const Sea: FC<{ y: number; color: string; shine: string; h?: number }> = ({ y, color, shine, h = H - y }) => {
  const f = useCurrentFrame();
  return (
    <g>
      <rect y={y} width={W} height={h} fill={color} />
      {Array.from({ length: 14 }, (_, i) => {
        const yy = y + 14 + rand(i) * Math.min(h - 20, 260);
        const len = 60 + rand(i + 4) * 140;
        const x = ((rand(i + 9) * W + f * (0.6 + rand(i) * 0.8)) % (W + 300)) - 150;
        return <rect key={i} x={x} y={yy} width={len} height={4} rx={2} fill={shine} opacity={0.35 + wave(f, 0.25, 50 + i * 7, i * 11)} />;
      })}
    </g>
  );
};

/** Rolling savanna hills; `tone` colours from back to front. */
export const Savanna: FC<{ y: number; back: string; front: string }> = ({ y, back, front }) => (
  <>
    <path d={`M0 ${y + 40} Q200 ${y - 50} 430 ${y + 10} T860 ${y - 10} T${W} ${y + 20} V${H} H0Z`} fill={back} />
    <path d={`M0 ${y + 120} Q260 ${y + 50} 560 ${y + 110} T${W} ${y + 90} V${H} H0Z`} fill={front} />
  </>
);

/** A lontar palm, swaying. */
export const Palm: FC<{ x: number; y: number; s?: number; color: string; phase?: number }> = ({ x, y, s = 1, color, phase = 0 }) => {
  const f = useCurrentFrame();
  const sway = wave(f, 2.2, 140, phase);
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) rotate(${sway})`}>
      <path d="M-6 0 Q-14 -160 4 -330 L12 -330 Q0 -160 8 0Z" fill={color} />
      {Array.from({ length: 9 }, (_, i) => {
        const a = -170 + i * 20 + wave(f, 3, 90, i * 13 + phase);
        return <path key={i} d="M8 -330 q40 -20 90 -6 q-46 6 -90 14Z" fill={color} transform={`rotate(${a + 90} 8 -330)`} />;
      })}
    </g>
  );
};

/** Sumba stilt house: posts, plank walls, wide thatched roof with the tall central peak. `lit` warms the window. */
export const StiltHouse: FC<{ x: number; y: number; s?: number; lit?: number; dim?: number }> = ({ x, y, s = 1, lit = 0, dim = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {[-200, -70, 70, 200].map((px) => <rect key={px} x={px - 9} y={-150} width={18} height={150} fill={C.woodDark} />)}
    <rect x={-240} y={-168} width={480} height={22} fill={C.wood} />
    <rect x={-220} y={-330} width={440} height={164} fill="#8a6446" />
    {Array.from({ length: 10 }, (_, i) => <rect key={i} x={-220 + i * 44} y={-330} width={3} height={164} fill={C.woodDark} opacity={0.5} />)}
    <rect x={-60} y={-290} width={120} height={84} fill={lit ? "#ffcf7a" : "#3c2c22"} />
    {lit > 0 && <circle cx={0} cy={-248} r={160} fill="url(#warmWin)" opacity={lit} />}
    <rect x={-60} y={-290} width={120} height={84} fill="none" stroke={C.woodDark} strokeWidth={8} />
    <rect x={-3} y={-290} width={6} height={84} fill={C.woodDark} />
    {/* roof: wide skirt, then the tall peak */}
    <path d="M-320 -310 L320 -310 L180 -420 L-180 -420Z" fill={C.thatch} />
    <path d="M-110 -415 L110 -415 L40 -660 L-40 -660Z" fill="#b89766" />
    <path d="M-40 -660 L40 -660 L22 -700 L-22 -700Z" fill="#8f744b" />
    {Array.from({ length: 12 }, (_, i) => <path key={i} d={`M${-300 + i * 52} -312 L${-170 + i * 30} -418`} stroke="#8f744b" strokeWidth={4} />)}
    <path d="M-34 -700 L-48 -740 M34 -700 L48 -740" stroke={C.woodDark} strokeWidth={6} strokeLinecap="round" />
    {dim > 0 && <rect x={-330} y={-750} width={660} height={760} fill="#1d2440" opacity={dim} />}
  </g>
);

/** The rooster on a fence post; `crow` 0..1 opens the beak and lifts the head. */
export const Rooster: FC<{ x: number; y: number; s?: number; crow?: number }> = ({ x, y, s = 1, crow = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-12} y={0} width={24} height={140} fill={C.woodDark} />
    <g transform={`rotate(${-crow * 18} 0 -10)`}>
      <path d="M-40 -10 Q-70 -60 -30 -70 Q-10 -40 0 -30Z" fill="#2f5a3a" />
      <ellipse cx={0} cy={-25} rx={34} ry={24} fill="#b8432b" />
      <path d="M10 -40 Q22 -80 30 -84 Q42 -60 30 -38Z" fill="#c9592f" />
      <circle cx={30} cy={-84} r={14} fill="#c9592f" />
      <path d="M24 -100 q4 -12 10 0 q4 -12 10 2 q-4 6 -20 6Z" fill="#e23b2e" />
      <circle cx={34} cy={-87} r={2.6} fill={C.ink} />
      <path d={`M43 -86 L58 ${-84 + crow * -6} L44 -80Z`} fill="#f2b33d" />
      {crow > 0.3 && <path d="M44 -80 L56 -72 L43 -78Z" fill="#f2b33d" />}
      <path d="M33 -74 q2 10 -3 12" stroke="#e23b2e" strokeWidth={6} fill="none" strokeLinecap="round" />
    </g>
    <path d="M-6 0 v-8 M8 0 v-8" stroke="#f2b33d" strokeWidth={4} />
  </g>
);

type Mood = "calm" | "sad" | "smile" | "cry" | "hope";
const Face: FC<{ mood: Mood; blink: number; look?: number; skin: string }> = ({ mood, blink, look = 0 }) => {
  const eh = Math.max(0.12, 1 - blink);
  return (
    <g>
      <ellipse cx={-14 + look} cy={-4} rx={4.6} ry={5.6 * eh} fill={C.ink} />
      <ellipse cx={14 + look} cy={-4} rx={4.6} ry={5.6 * eh} fill={C.ink} />
      {mood === "sad" || mood === "cry" ? (
        <>
          <path d="M-22 -18 L-8 -15 M22 -18 L8 -15" stroke={C.ink} strokeWidth={3} strokeLinecap="round" />
          <path d="M-7 18 Q0 13 7 18" stroke={C.ink} strokeWidth={3} fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <path d="M-22 -17 L-9 -18 M22 -17 L9 -18" stroke={C.ink} strokeWidth={3} strokeLinecap="round" />
          <path d={mood === "smile" || mood === "hope" ? "M-9 14 Q0 22 9 14" : "M-6 16 L6 16"} stroke={C.ink} strokeWidth={3} fill="none" strokeLinecap="round" />
        </>
      )}
      <ellipse cx={-21} cy={9} rx={6} ry={3.5} fill="#e07a6a" opacity={0.45} />
      <ellipse cx={21} cy={9} rx={6} ry={3.5} fill="#e07a6a" opacity={0.45} />
      {mood === "cry" && <path d="M-16 4 q-3 10 0 14 q3 -4 0 -14Z" fill="#9fd3ff" />}
    </g>
  );
};

const useBlink = (seed: number) => {
  const f = useCurrentFrame();
  const t = (f + seed * 37) % 110;
  return t < 3 ? 1 : 0;
};

/**
 * Sari: blue hijab, cream blouse, dark ikat skirt. Origin at the feet, about 440 units tall at s=1.
 * pose: stand · lookup (head tilted up) · sit (on a rock, seen from behind-side) · phone (holding a phone) · hug.
 */
export const Sari: FC<{ x: number; y: number; s?: number; pose?: "stand" | "lookup" | "sit" | "phone" | "hug"; mood?: Mood; flip?: boolean; breathe?: boolean }> = ({
  x, y, s = 1, pose = "stand", mood = "calm", flip, breathe = true,
}) => {
  const f = useCurrentFrame();
  const blink = useBlink(3);
  const br = breathe ? wave(f, 1.2, 80) : 0;
  const tilt = pose === "lookup" ? -10 : pose === "sit" ? 4 : 0;
  if (pose === "sit")
    return (
      <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
        <path d="M-80 0 Q-90 -70 -40 -100 L60 -110 Q130 -100 150 -40 Q150 0 120 0Z" fill={C.skirt} />
        <path d="M-70 -30 h200 M-60 -70 h170" stroke="#c9a14a" strokeWidth={6} opacity={0.6} />
        <path d={`M-50 ${-96 + br} Q-62 -220 0 -236 Q60 -220 54 ${-96 + br}Z`} fill={C.blouse} />
        <path d="M40 -190 Q90 -140 110 -100" stroke={C.blouse} strokeWidth={24} strokeLinecap="round" fill="none" />
        <circle cx={112} cy={-98} r={11} fill={C.skin} />
        <g transform={`translate(0 ${-266 + br}) rotate(${tilt})`}>
          <path d="M-62 30 Q-70 -60 0 -70 Q70 -60 62 30 Q30 60 0 58 Q-30 60 -62 30Z" fill={C.hijab} />
          <path d="M-40 0 Q-40 -46 0 -48 Q30 -46 34 -10 Q30 20 6 26 Q-30 24 -40 0Z" fill={C.hijabDark} />
          <path d="M22 -30 Q40 -10 34 14 Q24 28 10 26 Q24 0 22 -30Z" fill={C.skin} />
        </g>
      </g>
    );
  const armL = pose === "phone" ? "M-50 -280 Q-70 -210 -18 -200" : pose === "hug" ? "M-50 -280 Q-110 -240 -60 -190" : "M-52 -280 Q-66 -210 -58 -150";
  const armR = pose === "phone" ? "M50 -280 Q70 -210 18 -200" : pose === "hug" ? "M50 -280 Q110 -240 60 -190" : "M52 -280 Q66 -210 58 -150";
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <path d="M-46 -200 L46 -200 L66 0 L-66 0Z" fill={C.skirt} />
      <path d="M-56 -60 h112 M-52 -110 h104 M-48 -160 h96" stroke="#c9a14a" strokeWidth={6} opacity={0.6} />
      <path d="M-34 0 v6 h22 v-6 M12 0 v6 h22 v-6" fill={C.ink} />
      <path d={`M-52 ${-196 + br} Q-60 -300 0 -312 Q60 -300 52 ${-196 + br}Z`} fill={C.blouse} />
      <path d={armL} stroke={C.blouse} strokeWidth={26} strokeLinecap="round" fill="none" />
      <path d={armR} stroke={C.blouse} strokeWidth={26} strokeLinecap="round" fill="none" />
      {pose === "phone" && <rect x={-22} y={-232} width={44} height={70} rx={8} fill="#1d2233" />}
      <circle cx={pose === "phone" ? -18 : pose === "hug" ? -60 : -58} cy={pose === "phone" ? -198 : pose === "hug" ? -188 : -146} r={11} fill={C.skin} />
      <circle cx={pose === "phone" ? 18 : pose === "hug" ? 60 : 58} cy={pose === "phone" ? -198 : pose === "hug" ? -188 : -146} r={11} fill={C.skin} />
      <g transform={`translate(0 ${-366 + br}) rotate(${tilt})`}>
        <path d="M-66 40 Q-74 -64 0 -74 Q74 -64 66 40 Q40 78 0 76 Q-40 78 -66 40Z" fill={C.hijab} />
        <ellipse cx={0} cy={2} rx={38} ry={44} fill={C.skin} />
        <path d="M-40 -14 Q-36 -50 0 -52 Q36 -50 40 -14 Q30 -36 0 -38 Q-30 -36 -40 -14Z" fill={C.hijabDark} />
        <g transform={`translate(0 ${pose === "lookup" ? -6 : 0})`}>
          <Face mood={mood} blink={blink} skin={C.skin} look={pose === "phone" ? 0 : 0} />
        </g>
      </g>
    </g>
  );
};

/** Ibu: hair in a bun with a yellow headscarf band, red ikat sarong. `pose`: fry (wok and spatula) · hug · stand. */
export const Ibu: FC<{ x: number; y: number; s?: number; pose?: "fry" | "hug" | "stand"; mood?: Mood; flip?: boolean }> = ({ x, y, s = 1, pose = "stand", mood = "calm", flip }) => {
  const f = useCurrentFrame();
  const blink = useBlink(7);
  const stir = pose === "fry" ? wave(f, 14, 26) : 0;
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <path d="M-56 -190 L56 -190 L70 0 L-70 0Z" fill={C.ibuCloth} />
      <path d="M-62 -50 h124 M-60 -100 h120 M-58 -150 h116" stroke="#e0b25a" strokeWidth={7} opacity={0.75} />
      <path d="M-62 -186 Q-70 -300 0 -310 Q70 -300 62 -186Z" fill="#5b6b8a" />
      {pose === "hug" ? (
        <>
          <path d="M-56 -280 Q-130 -230 -70 -180" stroke="#5b6b8a" strokeWidth={28} strokeLinecap="round" fill="none" />
          <path d="M56 -280 Q130 -230 70 -180" stroke="#5b6b8a" strokeWidth={28} strokeLinecap="round" fill="none" />
        </>
      ) : pose === "fry" ? (
        <>
          <path d="M-56 -280 Q-80 -220 -10 -200" stroke="#5b6b8a" strokeWidth={26} strokeLinecap="round" fill="none" />
          <path d={`M56 -280 Q90 -230 ${50 + stir} -205`} stroke="#5b6b8a" strokeWidth={26} strokeLinecap="round" fill="none" />
          <path d={`M${50 + stir} -205 L${10 + stir * 1.4} -160`} stroke={C.woodDark} strokeWidth={6} strokeLinecap="round" />
        </>
      ) : (
        <>
          <path d="M-56 -280 Q-70 -210 -60 -150" stroke="#5b6b8a" strokeWidth={26} strokeLinecap="round" fill="none" />
          <path d="M56 -280 Q70 -210 60 -150" stroke="#5b6b8a" strokeWidth={26} strokeLinecap="round" fill="none" />
        </>
      )}
      <g transform="translate(0 -356)">
        <circle cx={0} cy={-40} r={26} fill="#2a2220" />
        <ellipse cx={0} cy={0} rx={40} ry={46} fill={C.ibuSkin} />
        <path d="M-42 -8 Q-40 -50 0 -52 Q40 -50 42 -8 Q30 -34 0 -34 Q-30 -34 -42 -8Z" fill="#2a2220" />
        <path d="M-44 -22 Q0 -40 44 -22 L44 -12 Q0 -30 -44 -12Z" fill={C.ibuScarf} />
        <path d="M-12 22 Q0 26 12 22" stroke={C.skinDark} strokeWidth={2} fill="none" opacity={0.6} />
        <Face mood={mood} blink={blink} skin={C.ibuSkin} />
      </g>
    </g>
  );
};

/** A wok of pisang goreng on a clay stove, with rising steam. */
export const Wok: FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => {
  const f = useCurrentFrame();
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-70 0 L-60 -70 L60 -70 L70 0Z" fill="#9c5a3c" />
      <path d="M-30 -20 Q0 -50 30 -20Z" fill="#f2994a" opacity={0.6 + wave(f, 0.3, 9)} />
      <path d="M-95 -80 Q0 -10 95 -80Z" fill="#2c2a2a" />
      {[-50, -20, 12, 42].map((px, i) => <ellipse key={i} cx={px} cy={-80 + (i % 2) * 6} rx={20} ry={8} fill="#e0a43a" transform={`rotate(${-12 + i * 9} ${px} -80)`} />)}
      {Array.from({ length: 4 }, (_, i) => {
        const t = ((f + i * 22) % 90) / 90;
        return <circle key={i} cx={-30 + i * 22 + wave(f, 10, 40, i * 10)} cy={-100 - t * 220} r={14 + t * 26} fill="#fff" opacity={0.35 * (1 - t)} />;
      })}
    </g>
  );
};

/** A small ship; `people` draws tiny passengers in neat shirts at the rail. */
export const Ship: FC<{ x: number; y: number; s?: number; color?: string; people?: boolean }> = ({ x, y, s = 1, color = "#e8e3d8", people }) => {
  const f = useCurrentFrame();
  return (
    <g transform={`translate(${x} ${y + wave(f, 3, 60)}) scale(${s})`}>
      <path d="M-160 0 L160 0 L130 50 L-130 50Z" fill="#2f3d5c" />
      <rect x={-120} y={-50} width={220} height={50} fill={color} />
      <rect x={-60} y={-90} width={110} height={40} fill={color} />
      <rect x={10} y={-130} width={22} height={40} fill="#c0533b" />
      {Array.from({ length: 6 }, (_, i) => <rect key={i} x={-108 + i * 34} y={-38} width={20} height={14} rx={3} fill="#9fb4cf" />)}
      {people && Array.from({ length: 7 }, (_, i) => (
        <g key={i} transform={`translate(${-110 + i * 30} -50)`}>
          <circle cy={-26} r={7} fill="#3a2a22" />
          <rect x={-7} y={-19} width={14} height={20} rx={3} fill={i % 2 ? "#f6f6f6" : "#dde6f2"} />
        </g>
      ))}
    </g>
  );
};

export const Birds: FC<{ n?: number; y?: number; color?: string }> = ({ n = 5, y = 500, color = "#2b2f45" }) => {
  const f = useCurrentFrame();
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const x = ((f * (1.4 + rand(i) * 0.8) + rand(i + 3) * W) % (W + 200)) - 100;
        const yy = y + rand(i + 8) * 220 + wave(f, 10, 60, i * 9);
        const flap = wave(f, 10, 12, i * 4);
        return <path key={i} d={`M${x - 22} ${yy - flap} Q${x - 10} ${yy - 8} ${x} ${yy} Q${x + 10} ${yy - 8} ${x + 22} ${yy - flap}`} stroke={color} strokeWidth={4} fill="none" strokeLinecap="round" />;
      })}
    </g>
  );
};

export const Grass: FC<{ y: number; color: string; n?: number; h?: number }> = ({ y, color, n = 40, h = 70 }) => {
  const f = useCurrentFrame();
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const x = (i / n) * W + rand(i) * 20;
        const hh = h * (0.6 + rand(i + 2) * 0.7);
        const b = wave(f, 8, 70, i * 7);
        return <path key={i} d={`M${x} ${y} Q${x + b * 0.5} ${y - hh / 2} ${x + b} ${y - hh}`} stroke={color} strokeWidth={5} fill="none" strokeLinecap="round" />;
      })}
    </g>
  );
};

/** Storybook text on top of an illustration (kept out of the bottom quarter). */
export const Label: FC<{ children: ReactNode; x: number; y: number; size?: number; color?: string; opacity?: number; rotate?: number }> = ({
  children, x, y, size = 64, color = "#fff7e6", opacity = 1, rotate = 0,
}) => (
  <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%, -50%) rotate(${rotate}deg)`, fontFamily, fontWeight: 800, fontSize: size, color, opacity,
    textShadow: "0 4px 0 rgba(0,0,0,.35)", whiteSpace: "nowrap" }}>
    {children}
  </div>
);

// ───────────────────────── the phone: real app captures ─────────────────────────

/**
 * The device. Captures are 390×844 CSS px (shot at 3× = 1170×2532) and always fill the full screen width:
 * the camera never zooms or crops sideways, it only pans down a capture taller than the screen.
 * The app sits below a status bar (punch-hole camera) and above a home-indicator strip, so nothing
 * covers it, and the whole device ends above the caption zone (captions can reach y ≈ 1366).
 */
export const BEZ = 22, STB = 40, HOME = 24; // bezel, status bar, home strip (video px)
export const AH = 1200, AW = Math.round((AH * 390) / 844); // app area: 554 × 1200
export const SW = AW, SH = STB + AH + HOME; // the screen (glass)
export const DW = SW + BEZ * 2, DH = SH + BEZ * 2; // the device: 598 × 1308
export const DX = Math.round((W - DW) / 2), DY = 30; // device top-left; bottom edge at 1338
const K = AW / 390; // video px per CSS px

/** Camera: `y` is the CSS point a tall capture centres on (x and z are kept for old shot lists and ignored). */
export type Cam = { z?: number; x?: number; y: number };
export type Mark = { x: number; y: number; w: number; h: number; at: At; until?: At };
export type Shot = {
  src: string; // file in public/<id>/app
  from: At; // when it appears
  cam?: [Cam, Cam?]; // vertical camera at the start and at the end of the shot
  tap?: { x: number; y: number; at: At };
  video?: { startFrom?: number }; // an .mp4 clip (frames at 30 fps)
  h?: number; // CSS height when the capture is taller than the screen (a full page)
  marks?: Mark[]; // soft outline highlights (CSS px)
};

const ShotView: FC<{ shot: Shot; start: number; end: number; frames: number; words: Word[]; lead: number }> = ({ shot, start, end, frames, words, lead }) => {
  const f = useCurrentFrame();
  const h = shot.h ?? 844;
  const [c0, c1 = c0] = shot.cam ?? [{ y: 422 }];
  const p = Easing.inOut(Easing.cubic)(tween(f, start, Math.max(start + 1, end), 0, 1));
  const cy = c0.y + (c1.y - c0.y) * p;
  const top = Math.min(0, Math.max(AH - h * K, AH / 2 - cy * K));
  const k = K;
  const tapF = shot.tap ? at(shot.tap.at, frames, words, lead) : -1;
  const tt = f - tapF;
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, top, width: AW, height: h * k }}>
        {shot.video ? (
          <Sequence from={start} layout="none">
            <OffthreadVideo src={staticFile(`${ID}/app/${shot.src}`)} muted startFrom={shot.video.startFrom ?? 0} style={{ width: "100%", height: "100%", display: "block" }} />
          </Sequence>
        ) : (
          <Img src={staticFile(`${ID}/app/${shot.src}`)} style={{ width: "100%", height: "100%", display: "block" }} />
        )}
        {shot.marks?.map((m, i) => {
          const mf = at(m.at, frames, words, lead);
          if (f < mf) return null;
          const g = Easing.out(Easing.cubic)(interpolate(f, [mf, mf + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
          const off = m.until === undefined ? 1 : 1 - interpolate(f, [at(m.until, frames, words, lead), at(m.until, frames, words, lead) + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const pulse = 1 + 0.15 * Math.max(0, 1 - (f - mf) / 30) * Math.sin(((f - mf) / 30) * Math.PI);
          return (
            <div key={i} style={{ position: "absolute", left: (m.x - 5) * k, top: (m.y - 4) * k, width: (m.w + 10) * k, height: (m.h + 8) * k, borderRadius: 8 * k,
              border: `${3.2}px solid ${C.yellow}`, background: "rgba(255,240,0,.10)",
              boxShadow: `0 0 0 ${6 * pulse}px rgba(255,240,0,.28), 0 6px 22px rgba(0,0,0,.25)`,
              opacity: g * off, transform: `scale(${1.08 - 0.08 * g})` }} />
          );
        })}
        {tapF >= 0 && tt >= -8 && tt < 26 && (
          <div style={{ position: "absolute", left: shot.tap!.x * k, top: shot.tap!.y * k }}>
            {/* fingertip comes in, presses, ring spreads */}
            <div style={{ position: "absolute", width: 34 * k, height: 34 * k, left: -17 * k, top: -17 * k, borderRadius: "50%",
              background: "rgba(20,20,30,.28)", border: `${2 * k}px solid rgba(255,255,255,.9)`,
              transform: `scale(${tt < 0 ? interpolate(tt, [-8, 0], [1.4, 1]) : tt < 6 ? 0.85 : 1})`, opacity: tt < 0 ? interpolate(tt, [-8, 0], [0, 1]) : interpolate(tt, [8, 20], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }} />
            {tt >= 0 && (
              <div style={{ position: "absolute", width: 34 * k, height: 34 * k, left: -17 * k, top: -17 * k, borderRadius: "50%", border: `${3 * k}px solid ${C.yellow}`,
                transform: `scale(${1 + tt * 0.12})`, opacity: interpolate(tt, [0, 22], [1, 0], { extrapolateRight: "clamp" }) }} />
            )}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};

/** The screen content of an app scene: shots cross-dissolve (6 frames) in order. */
export const Screen: FC<{ shots: Shot[]; frames: number; words: Word[]; lead: number }> = ({ shots, frames, words, lead }) => {
  const f = useCurrentFrame();
  const starts = shots.map((s) => at(s.from, frames, words, lead));
  return (
    <>
      {shots.map((s, i) => {
        const a = starts[i], b = i + 1 < shots.length ? starts[i + 1] : frames;
        if (f < a - 1 || f > b + 9) return null;
        const o = i === 0 ? 1 : interpolate(f, [a, a + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return (
          <AbsoluteFill key={i} style={{ opacity: o }}>
            <ShotView shot={s} start={a} end={b} frames={frames} words={words} lead={lead} />
          </AbsoluteFill>
        );
      })}
    </>
  );
};

export type Mood2 = "night" | "day" | "warm";
const BG: Record<Mood2, [string, string, string]> = {
  night: ["#0f1630", "#1f2c55", "#2c3b6b"],
  day: ["#fff6e3", "#ffe9c4", "#cfe6f2"],
  warm: ["#fff3d6", "#ffe0a8", "#f6c27a"],
};

/** Soft background, floating dots and the phone; children go inside the screen. `pill` is a label above the phone. */
export const PhoneStage: FC<{ mood?: Mood2; children: ReactNode; pill?: { text: string; opacity: number }; tilt?: number; over?: ReactNode; clock?: string }> = ({
  mood = "day", children, pill, over, clock,
}) => {
  const f = useCurrentFrame();
  const [a, b, c] = BG[mood];
  const dot = mood === "night" ? "#ffffff" : "#f3b23f";
  const time = clock ?? (mood === "night" ? "21.04" : "10.46");
  const bottom = DY + DH; // the caption band starts right under the device
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${a} 0%, ${b} 55%, ${c} 100%)` }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" style={{ position: "absolute" }}>
        {Array.from({ length: mood === "night" ? 40 : 16 }, (_, i) => (
          <circle key={i} cx={rand(i) * W} cy={((rand(i + 30) * H - f * (0.3 + rand(i) * 0.5)) % H + H) % H} r={mood === "night" ? 1.5 + rand(i + 5) * 2.5 : 6 + rand(i + 5) * 16}
            fill={dot} opacity={mood === "night" ? 0.4 + wave(f, 0.4, 40 + i, i * 9) : 0.12} />
        ))}
        {/* soft floor shadow under the device */}
        <ellipse cx={W / 2} cy={bottom + 6} rx={DW * 0.46} ry={22} fill="#0a0f28" opacity={mood === "night" ? 0.5 : 0.18} />
      </svg>
      {/* caption band below the device */}
      <div style={{ position: "absolute", left: 0, right: 0, top: bottom + 8, bottom: 0,
        background: `linear-gradient(180deg, rgba(16,18,30,0) 0%, rgba(16,18,30,${mood === "night" ? 0.4 : 0.62}) 18%, rgba(16,18,30,${mood === "night" ? 0.55 : 0.78}) 100%)` }} />
      {/* side buttons */}
      <div style={{ position: "absolute", left: DX - 5, top: DY + 230, width: 6, height: 90, borderRadius: 3, background: "#2a2d35" }} />
      <div style={{ position: "absolute", left: DX - 5, top: DY + 340, width: 6, height: 90, borderRadius: 3, background: "#2a2d35" }} />
      <div style={{ position: "absolute", left: DX + DW - 1, top: DY + 290, width: 6, height: 140, borderRadius: 3, background: "#2a2d35" }} />
      {/* the device */}
      <div style={{ position: "absolute", left: DX, top: DY, width: DW, height: DH, borderRadius: 78,
        background: "linear-gradient(145deg, #2b2e36 0%, #15171c 45%, #23262d 100%)",
        boxShadow: "0 50px 90px rgba(12,16,40,.38), 0 14px 30px rgba(12,16,40,.22), inset 0 0 0 2px #454a55, inset 0 0 0 6px #121318" }}>
        <div style={{ position: "absolute", left: BEZ, top: BEZ, width: SW, height: SH, borderRadius: 58, overflow: "hidden", background: "#0b0c10" }}>
          {/* status bar with a punch-hole camera; the app starts below it */}
          <div style={{ position: "absolute", left: 0, top: 0, width: SW, height: STB, color: "#fff", fontFamily: ui, fontWeight: 600, fontSize: 21 }}>
            <div style={{ position: "absolute", left: 46, top: 9 }}>{time}</div>
            <div style={{ position: "absolute", left: SW / 2 - 10, top: 10, width: 20, height: 20, borderRadius: 10, background: "#000", boxShadow: "inset 0 0 0 3px #1d2027" }} />
            <svg style={{ position: "absolute", right: 40, top: 12 }} width={84} height={18} viewBox="0 0 84 18">
              {[0, 1, 2, 3].map((i) => <rect key={i} x={i * 6} y={12 - i * 3.5} width={4} height={5 + i * 3.5} rx={1} fill="#fff" />)}
              <path d="M34 8 Q42 0 50 8 M37 11 Q42 6 47 11" stroke="#fff" strokeWidth={2.2} fill="none" strokeLinecap="round" />
              <circle cx={42} cy={14} r={2} fill="#fff" />
              <rect x={56} y={3} width={24} height={12} rx={3} stroke="#fff" strokeWidth={1.6} fill="none" opacity={0.9} />
              <rect x={58} y={5} width={16} height={8} rx={1.5} fill="#fff" />
              <rect x={81} y={7} width={2} height={4} rx={1} fill="#fff" />
            </svg>
          </div>
          <div style={{ position: "absolute", left: 0, top: STB, width: AW, height: AH, overflow: "hidden", background: "#111" }}>{children}</div>
          <div style={{ position: "absolute", left: SW / 2 - 70, top: STB + AH + 10, width: 140, height: 5, borderRadius: 3, background: "#e8e8ec", opacity: 0.85 }} />
          {/* glass sheen */}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(125deg, rgba(255,255,255,.07) 0%, rgba(255,255,255,0) 32%)", pointerEvents: "none" }} />
        </div>
      </div>
      {over}
      {pill && pill.opacity > 0 && (
        <div style={{ position: "absolute", left: W / 2, top: DY + BEZ + STB + 150, transform: `translate(-50%, -50%) scale(${0.9 + pill.opacity * 0.1})`, opacity: pill.opacity, fontFamily, fontWeight: 800, fontSize: 48,
          color: "#fff", background: "rgba(16,18,30,.88)", padding: "8px 36px", borderRadius: 44, boxShadow: "0 10px 30px rgba(0,0,0,.3)", whiteSpace: "nowrap" }}>
          {pill.text}
        </div>
      )}
    </AbsoluteFill>
  );
};

/** An illustrated chat on the phone (not the job fair app): the little brother sends the link. */
export const Chat: FC<{ show: number[]; frame: number }> = ({ show, frame }) => {
  const msgs: { me?: boolean; text: ReactNode }[] = [
    { text: "Kak, coba buka ini." },
    { text: <span><b style={{ color: "#1a5fd1", textDecoration: "underline" }}>jobfair.co.id</b><br /><span style={{ fontSize: 22, color: "#555" }}>Job fair virtual, lamar dari HP</span></span> },
    { text: "Kak, job fair-nya bisa dari HP." },
  ];
  return (
    <AbsoluteFill style={{ background: "#e9e3d8", fontFamily: ui }}>
      <div style={{ height: 120, background: "#2f4a6b", color: "#fff", display: "flex", alignItems: "flex-end", padding: "0 28px 20px", gap: 16 }}>
        <div style={{ width: 54, height: 54, borderRadius: 27, background: "#f2b33d", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 26, color: "#2b1d16" }}>A</div>
        <div style={{ fontSize: 30, fontWeight: 700 }}>Adik<div style={{ fontSize: 20, fontWeight: 400, opacity: 0.8 }}>online</div></div>
      </div>
      <div style={{ padding: "30px 24px", display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ alignSelf: "center", fontSize: 20, color: "#7a7062", background: "rgba(255,255,255,.6)", padding: "4px 14px", borderRadius: 10 }}>Malam ini 21.14</div>
        {msgs.map((m, i) => {
          const t = frame - show[i];
          if (t < 0) return null;
          const o = interpolate(t, [0, 8], [0, 1], { extrapolateRight: "clamp" });
          return (
            <div key={i} style={{ alignSelf: m.me ? "flex-end" : "flex-start", maxWidth: "80%", background: "#fff", borderRadius: 22, borderTopLeftRadius: 6, padding: "16px 22px",
              fontSize: 30, lineHeight: 1.3, color: "#1d1d1d", boxShadow: "0 2px 0 rgba(0,0,0,.08)", opacity: o, transform: `translateY(${(1 - o) * 20}px)` }}>
              {m.text}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
