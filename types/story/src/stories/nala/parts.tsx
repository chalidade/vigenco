import type { FC, ReactNode } from "react";
import { AbsoluteFill, interpolateColors, useCurrentFrame } from "remotion";
import { baloo } from "../../lib/fonts";
import { rand, wave } from "../../lib/kit";

export const W = 1080, H = 1920;
export const fontFamily = baloo;

/** Full-frame SVG canvas with the shared gradients. */
export const Canvas: FC<{ children: ReactNode }> = ({ children }) => (
  <AbsoluteFill>
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
      <defs>
        <radialGradient id="glow">
          <stop offset="0" stopColor="#fff6a0" stopOpacity="0.95" />
          <stop offset="0.35" stopColor="#ffe45c" stopOpacity="0.45" />
          <stop offset="1" stopColor="#ffd23f" stopOpacity="0" />
        </radialGradient>
      </defs>
      {children}
    </svg>
  </AbsoluteFill>
);

export const Sky: FC<{ top: string; bottom: string }> = ({ top, bottom }) => (
  <>
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={top} />
        <stop offset="1" stopColor={bottom} />
      </linearGradient>
    </defs>
    <rect width={W} height={H} fill="url(#sky)" />
  </>
);

export const Stars: FC<{ n?: number; opacity: number }> = ({ n = 40, opacity }) => {
  const f = useCurrentFrame();
  return (
    <g opacity={opacity}>
      {Array.from({ length: n }, (_, i) => (
        <circle key={i} cx={rand(i) * W} cy={rand(i + 99) * H * 0.55} r={2 + rand(i + 7) * 3} fill="#fff"
          opacity={0.55 + wave(f, 0.45, 40 + rand(i + 3) * 50, i * 13)} />
      ))}
    </g>
  );
};

/** A bamboo stalk rooted at the bottom edge; `bend` in degrees, swaying on its own. */
export const Bamboo: FC<{ x: number; h: number; color: string; bend?: number; phase?: number }> = ({ x, h, color, bend = 0, phase = 0 }) => {
  const f = useCurrentFrame();
  const top = H - h;
  return (
    <g transform={`rotate(${bend + wave(f, 1.2, 100, phase)} ${x} ${H})`}>
      <rect x={x - 16} y={top} width={32} height={h} rx={14} fill={color} />
      {Array.from({ length: Math.floor(h / 140) }, (_, i) => (
        <rect key={i} x={x - 19} y={top + (i + 1) * 140} width={38} height={8} rx={4} fill="#000" opacity={0.3} />
      ))}
      <path d={`M${x} ${top + 70} Q${x + 70} ${top + 20} ${x + 170} ${top + 50} Q${x + 80} ${top + 85} ${x} ${top + 70}Z`} fill={color} />
      <path d={`M${x} ${top + 190} Q${x - 70} ${top + 140} ${x - 160} ${top + 175} Q${x - 75} ${top + 205} ${x} ${top + 190}Z`} fill={color} />
    </g>
  );
};

export const Hills: FC<{ back: string; front: string }> = ({ back, front }) => (
  <>
    <path d={`M0 1500 Q270 1380 560 1470 T${W} 1430 V${H} H0Z`} fill={back} />
    <path d={`M0 1660 Q300 1580 620 1650 T${W} 1620 V${H} H0Z`} fill={front} />
  </>
);

export const BigLeaf: FC<{ x: number; y: number; s?: number; rot?: number; color: string }> = ({ x, y, s = 1, rot = 0, color }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <path d="M-380 0 Q-120 -270 390 -30 Q-40 230 -380 0Z" fill={color} />
    <path d="M-380 0 Q0 -40 390 -30" stroke="#000" strokeOpacity={0.25} strokeWidth={8} fill="none" />
  </g>
);

/** Nala. `glow` 0..1 lights the tail; `mood` sets the mouth. Drawn upright, head up. */
export const Firefly: FC<{ x: number; y: number; s?: number; glow?: number; mood?: "happy" | "scared"; tilt?: number }> = ({
  x, y, s = 1, glow = 0, mood = "happy", tilt = 0,
}) => {
  const f = useCurrentFrame();
  const flap = wave(f, 18, 4);
  return (
    <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${s})`}>
      {glow > 0 && <circle r={50 + 230 * glow} fill="url(#glow)" opacity={Math.min(1, glow * 1.3)} />}
      <ellipse cx={-30} cy={-6} rx={30} ry={13} fill="#e6f6ff" opacity={0.7} transform={`rotate(${-25 + flap} -6 -4)`} />
      <ellipse cx={30} cy={-6} rx={30} ry={13} fill="#e6f6ff" opacity={0.7} transform={`rotate(${25 - flap} 6 -4)`} />
      <ellipse cx={0} cy={24} rx={16} ry={21} fill={interpolateColors(glow, [0, 1], ["#7a6640", "#fff47a"])} />
      <ellipse cx={0} cy={2} rx={18} ry={15} fill="#3d2f52" />
      <circle cx={0} cy={-22} r={20} fill="#55437a" />
      <circle cx={-8} cy={-25} r={7} fill="#fff" />
      <circle cx={8} cy={-25} r={7} fill="#fff" />
      <circle cx={-7} cy={-24} r={3.5} fill="#1b1430" />
      <circle cx={9} cy={-24} r={3.5} fill="#1b1430" />
      {mood === "happy"
        ? <path d="M-6 -13 Q0 -8 6 -13" stroke="#1b1430" strokeWidth={2.5} fill="none" strokeLinecap="round" />
        : <ellipse cx={0} cy={-12} rx={3} ry={3.5} fill="#1b1430" />}
      <path d="M-6 -40 Q-12 -60 -24 -64" stroke="#3d2f52" strokeWidth={3} fill="none" strokeLinecap="round" />
      <path d="M6 -40 Q12 -60 24 -64" stroke="#3d2f52" strokeWidth={3} fill="none" strokeLinecap="round" />
    </g>
  );
};

export const Chick: FC<{ x: number; y: number; s?: number; color: string; crying?: boolean }> = ({ x, y, s = 1, color, crying }) => {
  const f = useCurrentFrame();
  const drop = (f * 2.2) % 80;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle r={62} fill={color} />
      <circle cx={-6} cy={-58} r={8} fill={color} />
      <ellipse cx={34} cy={10} rx={22} ry={30} fill="#000" opacity={0.12} />
      <circle cx={-20} cy={-14} r={9} fill="#1b1430" />
      <circle cx={18} cy={-14} r={9} fill="#1b1430" />
      <path d="M-10 4 L10 4 L0 18Z" fill="#f2994a" />
      {crying
        ? <path d={`M-22 ${-2 + drop} q-7 12 0 16 q7 -4 0 -16Z`} fill="#8fd3ff" opacity={1 - drop / 80} />
        : <path d="M-14 26 Q0 36 14 26" stroke="#1b1430" strokeWidth={4} fill="none" strokeLinecap="round" />}
      <path d="M-20 60 v16 M20 60 v16" stroke="#f2994a" strokeWidth={5} strokeLinecap="round" />
    </g>
  );
};

export const Branch: FC<{ color: string }> = ({ color }) => (
  <path d="M1100 640 Q860 660 560 760" stroke={color} strokeWidth={34} strokeLinecap="round" fill="none" />
);

export const Title: FC<{ opacity: number; y?: number }> = ({ opacity, y = 260 }) => (
  <AbsoluteFill style={{ alignItems: "center", paddingTop: y, opacity }}>
    <div style={{ fontFamily, fontWeight: 800, fontSize: 118, color: "#fff7d6", textShadow: "0 6px 0 rgba(0,0,0,.35)" }}>Nala &amp; Cahaya</div>
  </AbsoluteFill>
);
