import type { FC, ReactNode } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { baloo } from "../../lib/fonts";
import { rand, wave } from "../../lib/kit";
import type { Word } from "../../lib/Story";

export const W = 1080, H = 1920;
export const fontFamily = baloo;

export const C = {
  night: "#0a1433", nightSea: "#0f2a4f", sea: "#1fb5c4", seaDeep: "#0d7f9c", sand: "#f3d79c", sandDark: "#ddb877",
  palm: "#2f9a52", palmDark: "#1f6e3d", trunk: "#8a5a36", warm: "#ffd36b", ink: "#2a1a12", cream: "#fff6dc",
  shirt: "#ff8a3d", bandana: "#e23d3d", skin: "#c98a5a", hair: "#2b1a14", gold: "#ffc93c", stone: "#9aa3a8",
};

/** Frame (within the scene) at which word `i` is spoken. */
export const wf = (words: Word[], lead: number, i: number) => Math.round((lead + (words[i]?.start ?? 0)) * 30);

export const Canvas: FC<{ children: ReactNode }> = ({ children }) => (
  <AbsoluteFill>
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
      <defs>
        <radialGradient id="glow">
          <stop offset="0" stopColor="#fff3b0" stopOpacity="0.95" />
          <stop offset="0.35" stopColor="#ffd36b" stopOpacity="0.45" />
          <stop offset="1" stopColor="#ffb340" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="beamGlow">
          <stop offset="0" stopColor="#fffbe0" stopOpacity="1" />
          <stop offset="1" stopColor="#fffbe0" stopOpacity="0" />
        </radialGradient>
      </defs>
      {children}
    </svg>
  </AbsoluteFill>
);

export const Sky: FC<{ top: string; bottom: string; id?: string }> = ({ top, bottom, id = "sky" }) => (
  <>
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={top} />
        <stop offset="1" stopColor={bottom} />
      </linearGradient>
    </defs>
    <rect width={W} height={H} fill={`url(#${id})`} />
  </>
);

export const Stars: FC<{ n?: number; opacity: number; maxY?: number }> = ({ n = 50, opacity, maxY = 900 }) => {
  const f = useCurrentFrame();
  return (
    <g opacity={opacity}>
      {Array.from({ length: n }, (_, i) => (
        <circle key={i} cx={rand(i) * W} cy={rand(i + 99) * maxY} r={1.5 + rand(i + 7) * 3} fill="#fff"
          opacity={0.5 + wave(f, 0.45, 40 + rand(i + 3) * 50, i * 13)} />
      ))}
    </g>
  );
};

/** Flat sea from y down, with drifting shimmer dashes. */
export const Sea: FC<{ y: number; top: string; bottom: string; shimmer?: string; id?: string }> = ({ y, top, bottom, shimmer = "#ffffff", id = "sea" }) => {
  const f = useCurrentFrame();
  return (
    <>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={top} />
          <stop offset="1" stopColor={bottom} />
        </linearGradient>
      </defs>
      <rect y={y} width={W} height={H - y} fill={`url(#${id})`} />
      {Array.from({ length: 22 }, (_, i) => {
        const yy = y + 20 + rand(i + 300) * (H - y - 40);
        const len = 30 + rand(i + 310) * 70 * (yy / H);
        const x = ((rand(i + 320) * W + f * (0.6 + rand(i) * 0.8)) % (W + 200)) - 100;
        return <rect key={i} x={x} y={yy} width={len} height={4} rx={2} fill={shimmer} opacity={0.25 + wave(f, 0.2, 50, i * 9)} />;
      })}
    </>
  );
};

/** Palm tree rooted at (x, y). */
export const Palm: FC<{ x: number; y: number; s?: number; color?: string; trunk?: string; phase?: number; lean?: number }> = ({
  x, y, s = 1, color = C.palm, trunk = C.trunk, phase = 0, lean = 8,
}) => {
  const f = useCurrentFrame();
  const sway = wave(f, 3, 90, phase);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d={`M-14 0 Q${lean * 4} -200 ${lean * 6} -400 L${lean * 6 + 18} -400 Q${lean * 4 + 18} -200 14 0Z`} fill={trunk} />
      {Array.from({ length: 7 }, (_, i) => (
        <rect key={i} x={lean * (0.6 * i) - 16} y={-50 - i * 52} width={32 + 2} height={6} rx={3} fill="#000" opacity={0.18} />
      ))}
      <g transform={`translate(${lean * 6 + 9} -400) rotate(${sway})`}>
        {[-160, -120, -60, -20, 20, 70, 200].map((a, i) => (
          <g key={i} transform={`rotate(${a + wave(f, 4, 70, phase + i * 11)})`}>
            <path d="M0 0 Q90 -50 190 10 Q100 -10 0 12Z" fill={i % 2 ? color : C.palmDark} />
          </g>
        ))}
        <circle cx={-6} cy={10} r={12} fill="#6b3f22" /><circle cx={10} cy={14} r={12} fill="#5a3319" />
      </g>
    </g>
  );
};

/** Tent with door; base centre at (x, y). */
export const Tent: FC<{ x: number; y: number; s?: number; color: string; dark?: string; lit?: number }> = ({ x, y, s = 1, color, dark = "#00000040", lit = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={6} rx={140} ry={16} fill="#000" opacity={0.15} />
    <path d="M-130 0 L0 -170 L130 0Z" fill={color} />
    <path d="M0 -170 L130 0 L60 0Z" fill={dark} />
    <path d="M-30 0 L0 -90 L30 0Z" fill={lit > 0 ? C.warm : "#3a2418"} opacity={lit > 0 ? 0.6 + 0.4 * lit : 1} />
    <path d="M0 -170 L0 -200" stroke="#6b3f22" strokeWidth={6} />
  </g>
);

/** Lighthouse standing at (x, y). `beam` = angle of the sweeping light (deg), `lit` 0..1. */
export const Lighthouse: FC<{ x: number; y: number; s?: number; beam?: number; lit?: number }> = ({ x, y, s = 1, beam = 0, lit = 1 }) => {
  const f = useCurrentFrame();
  const rad = (beam * Math.PI) / 180;
  const len = 900 * Math.abs(Math.cos(rad)) + 120;
  const dir = Math.cos(rad) >= 0 ? 1 : -1;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {lit > 0 && (
        <g opacity={lit * (0.35 + 0.25 * Math.abs(Math.cos(rad)))}>
          <path d={`M0 -330 L${dir * len} ${-330 - 70 - 30 * Math.sin(rad)} L${dir * len} ${-330 + 70 - 30 * Math.sin(rad)}Z`} fill="#fff6c8" />
        </g>
      )}
      <path d="M-60 0 L-38 -300 L38 -300 L60 0Z" fill="#f4efe6" />
      {[0, 1, 2].map((i) => {
        const y1 = -60 - i * 90, y2 = y1 - 45, w1 = 60 - (22 * -y1) / 300, w2 = 60 - (22 * -y2) / 300;
        return <path key={i} d={`M${-w1} ${y1} L${-w2} ${y2} L${w2} ${y2} L${w1} ${y1}Z`} fill="#d9433a" />;
      })}
      <rect x={-50} y={-312} width={100} height={14} rx={4} fill="#3a2a2a" />
      <rect x={-30} y={-370} width={60} height={58} rx={6} fill={lit > 0 ? "#fff1a8" : "#5b6b80"} />
      {lit > 0 && <circle cx={0} cy={-340} r={110 + wave(f, 10, 30)} fill="url(#glow)" opacity={lit} />}
      <path d="M-42 -370 L0 -410 L42 -370Z" fill="#3a2a2a" />
      <rect x={-12} y={-80} width={24} height={60} rx={10} fill="#3a2a2a" />
    </g>
  );
};

type ArmProps = { angle: number; side: 1 | -1; spear?: boolean; fish?: boolean; spearOpacity?: number };
const Arm: FC<ArmProps> = ({ angle, side, spear, fish, spearOpacity = 1 }) => (
  <g transform={`translate(${side * 44} -200) rotate(${side * angle})`}>
    {spear && (
      <g opacity={spearOpacity}>
        <line x1={0} y1={-90} x2={0} y2={-90} stroke="none" />
        <path d="M-4 -40 L-4 300 L4 300 L4 -40Z" fill="#a8743f" />
        <path d="M-12 296 L0 350 L12 296Z" fill="#cfd8dc" stroke="#7d8a90" strokeWidth={2} />
        {fish && <g transform="translate(0 292) rotate(90)"><Fish x={0} y={0} s={0.9} color="#5fb3e8" stuck /></g>}
      </g>
    )}
    <rect x={-13} y={-6} width={26} height={98} rx={13} fill={C.skin} />
    <path d="M-16 -8 h32 v34 h-32Z" fill={C.shirt} />
    <circle cx={0} cy={96} r={16} fill={C.skin} />
  </g>
);

/**
 * Aru, the castaway who started the island. Feet at (x, y); about 380 tall at s=1.
 * Arm angles in degrees: 0 = hanging down, 90 = out sideways, 180 = straight up.
 */
export const Aru: FC<{
  x: number; y: number; s?: number; mood?: "happy" | "grin" | "sheep" | "focus" | "wow";
  armL?: number; armR?: number; spear?: boolean; fish?: boolean; spearOpacity?: number; walk?: number; face?: 1 | -1; bob?: boolean;
}> = ({ x, y, s = 1, mood = "happy", armL = 12, armR = 12, spear, fish, spearOpacity, walk = 0, face = 1, bob = true }) => {
  const f = useCurrentFrame();
  const breathe = bob ? wave(f, 3, 50) : 0;
  const blink = f % 96 > 90;
  const step = walk ? Math.sin(walk) : 0;
  return (
    <g transform={`translate(${x} ${y}) scale(${s * face} ${s})`}>
      <ellipse cx={0} cy={4} rx={80} ry={14} fill="#000" opacity={0.18} />
      {/* legs */}
      <g transform={`rotate(${step * 18} -20 -120)`}><rect x={-34} y={-130} width={28} height={128} rx={12} fill={C.skin} /><ellipse cx={-22} cy={-4} rx={24} ry={10} fill="#5a3a26" /></g>
      <g transform={`rotate(${-step * 18} 20 -120)`}><rect x={6} y={-130} width={28} height={128} rx={12} fill={C.skin} /><ellipse cx={22} cy={-4} rx={24} ry={10} fill="#5a3a26" /></g>
      <g transform={`translate(0 ${breathe})`}>
        <path d="M-50 -150 h100 l6 46 h-112Z" fill="#3d6fa8" />
        {/* back arm */}
        <Arm angle={armL} side={-1} />
        {/* torso */}
        <rect x={-52} y={-232} width={104} height={96} rx={30} fill={C.shirt} />
        <rect x={-50} y={-200} width={100} height={10} fill="#fff" opacity={0.55} />
        <rect x={-50} y={-172} width={100} height={10} fill="#fff" opacity={0.55} />
        {/* head */}
        <g transform="translate(0 -290)">
          <circle r={66} fill={C.skin} />
          <circle cx={-48} cy={-30} r={30} fill={C.hair} /><circle cx={-16} cy={-56} r={32} fill={C.hair} /><circle cx={24} cy={-54} r={30} fill={C.hair} /><circle cx={52} cy={-26} r={24} fill={C.hair} />
          <path d="M-64 -24 Q0 -54 64 -24 L62 -8 Q0 -36 -62 -8Z" fill={C.bandana} />
          <path d="M-60 -16 l-36 -6 l10 22Z" fill={C.bandana} transform={`rotate(${wave(f, 8, 40)} -60 -16)`} />
          <circle cx={-34} cy={24} r={11} fill="#e57a6a" opacity={0.5} /><circle cx={40} cy={24} r={11} fill="#e57a6a" opacity={0.5} />
          {blink ? (
            <><path d="M-30 4 h18" stroke={C.ink} strokeWidth={5} strokeLinecap="round" /><path d="M14 4 h18" stroke={C.ink} strokeWidth={5} strokeLinecap="round" /></>
          ) : mood === "grin" ? (
            <><path d="M-32 8 Q-21 -6 -10 8" stroke={C.ink} strokeWidth={6} fill="none" strokeLinecap="round" /><path d="M12 8 Q23 -6 34 8" stroke={C.ink} strokeWidth={6} fill="none" strokeLinecap="round" /></>
          ) : (
            <><ellipse cx={-21} cy={2} rx={9} ry={mood === "wow" ? 13 : 11} fill={C.ink} /><ellipse cx={23} cy={2} rx={9} ry={mood === "wow" ? 13 : 11} fill={C.ink} />
              <circle cx={-18} cy={-2} r={3} fill="#fff" /><circle cx={26} cy={-2} r={3} fill="#fff" /></>
          )}
          {mood === "focus" && <><path d="M-34 -14 l24 6" stroke={C.ink} strokeWidth={5} strokeLinecap="round" /><path d="M36 -14 l-24 6" stroke={C.ink} strokeWidth={5} strokeLinecap="round" /></>}
          {mood === "sheep" && <><path d="M-34 -16 l24 -4" stroke={C.ink} strokeWidth={5} strokeLinecap="round" /><path d="M36 -16 l-24 -4" stroke={C.ink} strokeWidth={5} strokeLinecap="round" /></>}
          {mood === "happy" && <path d="M-16 30 Q2 44 20 30" stroke={C.ink} strokeWidth={6} fill="none" strokeLinecap="round" />}
          {mood === "grin" && <path d="M-24 26 Q2 60 28 26Z" fill="#7a2a22" />}
          {mood === "sheep" && <path d="M-16 34 Q-6 28 4 34 T22 32" stroke={C.ink} strokeWidth={5} fill="none" strokeLinecap="round" />}
          {mood === "focus" && <path d="M-10 34 h20" stroke={C.ink} strokeWidth={6} strokeLinecap="round" />}
          {mood === "wow" && <ellipse cx={2} cy={36} rx={11} ry={14} fill="#7a2a22" />}
        </g>
        {/* front arm */}
        <Arm angle={armR} side={1} spear={spear} fish={fish} spearOpacity={spearOpacity} />
      </g>
    </g>
  );
};

/** A small resident with a name tag. Feet at (x, y). */
export const Resident: FC<{ x: number; y: number; s?: number; color: string; skin?: string; tag?: string; walk?: number; jump?: number; hair?: string; face?: 1 | -1 }> = ({
  x, y, s = 1, color, skin = "#d29a6a", tag, walk = 0, jump = 0, hair = "#2b1a14", face = 1,
}) => {
  const f = useCurrentFrame();
  const st = Math.sin(walk);
  const blink = (f + Math.round(x)) % 110 > 104;
  return (
    <g transform={`translate(${x} ${y - Math.abs(st) * 6 - jump}) scale(${s})`}>
      <ellipse cx={0} cy={4 + Math.abs(st) * 6 + jump} rx={40} ry={8} fill="#000" opacity={0.15} />
      <rect x={-20 + st * 8} y={-50} width={14} height={50} rx={7} fill="#3b3b4f" />
      <rect x={6 - st * 8} y={-50} width={14} height={50} rx={7} fill="#3b3b4f" />
      <rect x={-34} y={-122} width={68} height={80} rx={24} fill={color} />
      <rect x={-46} y={-116} width={16} height={56} rx={8} fill={color} transform={`rotate(${st * 20 + (jump > 0 ? 140 : 0)} -38 -112)`} />
      <rect x={30} y={-116} width={16} height={56} rx={8} fill={color} transform={`rotate(${-st * 20 - (jump > 0 ? 140 : 0)} 38 -112)`} />
      {tag && (
        <g transform="translate(0 -88)">
          <rect x={-30} y={-13} width={60} height={26} rx={5} fill="#fff" stroke="#00000030" strokeWidth={2} />
          <rect x={-22} y={-4} width={44} height={8} rx={4} fill="#5a6070" />
        </g>
      )}
      <g transform={`translate(0 -158) scale(${face} 1)`}>
        <circle r={42} fill={skin} />
        <path d="M-42 -6 Q-40 -46 0 -46 Q40 -46 42 -6 Q20 -26 -42 -6Z" fill={hair} />
        {blink ? <><path d="M-18 4 h12 M8 4 h12" stroke={C.ink} strokeWidth={4} strokeLinecap="round" /></>
          : <><circle cx={-12} cy={4} r={6} fill={C.ink} /><circle cx={14} cy={4} r={6} fill={C.ink} /></>}
        <path d="M-8 20 Q2 28 12 20" stroke={C.ink} strokeWidth={4} fill="none" strokeLinecap="round" />
      </g>
    </g>
  );
};

export const SHIRTS = ["#ef5b5b", "#4aa3df", "#f7c548", "#6cc56c", "#b07cd8", "#ff9f43", "#2ec4b6", "#ff6fa5"];
export const SKINS = ["#d29a6a", "#b97a4f", "#e8b98c", "#8d5a3b", "#c48a5e"];
export const HAIRS = ["#2b1a14", "#3d2a1e", "#1a1a1a", "#6b3f22"];

/** Fish facing right, centre at (x, y). */
export const Fish: FC<{ x: number; y: number; s?: number; color: string; flip?: boolean; stuck?: boolean }> = ({ x, y, s = 1, color, flip, stuck }) => {
  const f = useCurrentFrame();
  const tail = wave(f, stuck ? 18 : 10, stuck ? 8 : 16);
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <path d={`M-50 0 L-86 ${-24 + tail} L-82 ${24 + tail}Z`} fill={color} />
      <ellipse rx={60} ry={30} fill={color} />
      <path d="M-10 -28 Q10 -48 30 -24Z" fill={color} />
      <ellipse cx={-4} cy={8} rx={34} ry={12} fill="#fff" opacity={0.3} />
      <circle cx={34} cy={-6} r={8} fill="#fff" /><circle cx={36} cy={-6} r={4} fill={C.ink} />
    </g>
  );
};

/** Spear rack (wooden A-frame with spears) standing at (x, y). */
export const SpearRack: FC<{ x: number; y: number; s?: number; count?: number }> = ({ x, y, s = 1, count = 4 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={6} rx={130} ry={14} fill="#000" opacity={0.15} />
    {Array.from({ length: count }, (_, i) => {
      const sx = -75 + i * 50;
      return (
        <g key={i} transform={`rotate(${-6 + i * 4} ${sx} 0)`}>
          <rect x={sx - 4} y={-300} width={8} height={300} fill="#a8743f" />
          <path d={`M${sx - 11} -296 L${sx} -346 L${sx + 11} -296Z`} fill="#cfd8dc" stroke="#7d8a90" strokeWidth={2} />
        </g>
      );
    })}
    <rect x={-120} y={-200} width={240} height={18} rx={6} fill="#7a4b2a" />
    <rect x={-120} y={-80} width={240} height={18} rx={6} fill="#7a4b2a" />
    <rect x={-118} y={-210} width={16} height={210} rx={5} fill="#6b3f22" />
    <rect x={102} y={-210} width={16} height={210} rx={5} fill="#6b3f22" />
  </g>
);

/** Square pyramid seen from the side, orbiting by `theta` degrees. Base centre (x, y). */
export const Pyramid: FC<{ x: number; y: number; r?: number; h?: number; theta?: number; ghost?: number; grow?: number }> = ({
  x, y, r = 260, h = 340, theta = 20, ghost = 0, grow = 1,
}) => {
  const corners = [0, 1, 2, 3].map((k) => {
    const a = ((theta + k * 90) * Math.PI) / 180;
    return { x: x + r * Math.cos(a), y: y + r * 0.3 * Math.sin(a), a };
  });
  const apex = { x, y: y - h * grow };
  const faces = corners.map((c, k) => {
    const d = corners[(k + 1) % 4];
    const mid = (c.a + d.a) / 2 + (k === 3 ? Math.PI : 0);
    return { c, d, depth: Math.sin(mid), light: Math.cos(mid - 2.3) };
  }).sort((p, q) => p.depth - q.depth);
  return (
    <g>
      {ghost < 1 && <ellipse cx={x} cy={y + 10} rx={r * 1.15} ry={r * 0.36} fill="#000" opacity={0.18 * (1 - ghost)} />}
      {faces.map(({ c, d, light }, i) => {
        const l = Math.round(170 + 60 * light);
        const fill = ghost > 0 ? `rgba(80,255,140,${0.22 + 0.12 * light})` : `rgb(${l + 20},${l - 10},${l - 80})`;
        return (
          <path key={i} d={`M${c.x} ${c.y} L${d.x} ${d.y} L${apex.x} ${apex.y}Z`} fill={fill}
            stroke={ghost > 0 ? "#7dffb0" : "#8a6a3a"} strokeWidth={ghost > 0 ? 5 : 3} strokeLinejoin="round" strokeDasharray={ghost > 0 ? "18 10" : undefined} />
        );
      })}
      {ghost === 0 && faces.slice(2).map(({ c, d }, i) => (
        Array.from({ length: 5 }, (_, j) => {
          const t = (j + 1) / 6;
          return <path key={`${i}-${j}`} d={`M${c.x + (apex.x - c.x) * t} ${c.y + (apex.y - c.y) * t} L${d.x + (apex.x - d.x) * t} ${d.y + (apex.y - d.y) * t}`} stroke="#8a6a3a" strokeOpacity={0.45} strokeWidth={3} />;
        })
      ))}
    </g>
  );
};

/** Small triangle flag string between two points, flapping. */
export const Bunting: FC<{ x1: number; y1: number; x2: number; y2: number; sag?: number; n?: number; phase?: number }> = ({ x1, y1, x2, y2, sag = 90, n = 10, phase = 0 }) => {
  const f = useCurrentFrame();
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2 + sag;
  const pt = (t: number) => ({
    x: (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * mx + t * t * x2,
    y: (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * my + t * t * y2,
  });
  return (
    <g>
      <path d={`M${x1} ${y1} Q${mx} ${my} ${x2} ${y2}`} stroke="#6b3f22" strokeWidth={4} fill="none" />
      {Array.from({ length: n }, (_, i) => {
        const p = pt((i + 0.5) / n);
        return <path key={i} d="M-22 0 L22 0 L0 54Z" fill={SHIRTS[i % SHIRTS.length]} transform={`translate(${p.x} ${p.y}) rotate(${wave(f, 10, 30, phase + i * 7)})`} />;
      })}
    </g>
  );
};

/** Text label drawn in SVG with the storybook face. */
export const Label: FC<{ x: number; y: number; size: number; color?: string; children: ReactNode; anchor?: "middle" | "start" | "end"; stroke?: string; opacity?: number; rot?: number; scale?: number }> = ({
  x, y, size, color = "#fff", children, anchor = "middle", stroke = "#00000088", opacity = 1, rot = 0, scale = 1,
}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${scale})`} opacity={opacity}>
    <text textAnchor={anchor} fontFamily={fontFamily} fontWeight={800} fontSize={size} fill={color} stroke={stroke} strokeWidth={size * 0.12} paintOrder="stroke" strokeLinejoin="round">{children}</text>
  </g>
);

/** Rounded pill badge with text. */
export const Badge: FC<{ x: number; y: number; w: number; text: string; size?: number; bg?: string; color?: string; scale?: number }> = ({
  x, y, w, text, size = 56, bg = "#ffffffee", color = C.ink, scale = 1,
}) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <rect x={-w / 2} y={-size * 0.95} width={w} height={size * 1.6} rx={size * 0.8} fill={bg} stroke="#00000022" strokeWidth={4} />
    <text y={size * 0.35} textAnchor="middle" fontFamily={fontFamily} fontWeight={800} fontSize={size} fill={color}>{text}</text>
  </g>
);

/** Island silhouette layer: hills from `y`, `color`. */
export const IslandShape: FC<{ y: number; color: string; x0?: number; x1?: number }> = ({ y, color, x0 = -40, x1 = W + 40 }) => (
  <path d={`M${x0} ${y + 60} Q${x0 + 120} ${y - 140} ${x0 + 330} ${y - 120} Q${x0 + 520} ${y - 260} ${x0 + 720} ${y - 150} Q${x0 + 900} ${y - 110} ${x1} ${y - 40} L${x1} ${y + 80} L${x0} ${y + 80}Z`} fill={color} />
);
