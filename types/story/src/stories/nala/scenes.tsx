import type { FC } from "react";
import { interpolateColors, useCurrentFrame } from "remotion";
import type { SceneProps } from "../../lib/Story";
import { rand, tween, wave } from "../../lib/kit";
import { Bamboo, BigLeaf, Branch, Canvas, Chick, Firefly, H, Hills, Sky, Stars, Title, W, fontFamily } from "./parts";

const NIGHT = "#0c0a26";

// 1 — dusk, Nala flies in, title
const Dusk: FC<SceneProps> = () => {
  const f = useCurrentFrame();
  return (
    <>
      <Canvas>
        <Sky top="#3b2a63" bottom="#f39a5d" />
        <circle cx={540} cy={tween(f, 0, 160, 1400, 1470)} r={170} fill="#ffcf73" opacity={0.9} />
        <Hills back="#6a3f6e" front="#2a1d3d" />
        <Bamboo x={80} h={1550} color="#24183a" />
        <Bamboo x={210} h={1250} color="#2e1f45" phase={30} />
        <Bamboo x={990} h={1500} color="#24183a" phase={60} />
        <Bamboo x={870} h={1150} color="#2e1f45" phase={15} />
        <Firefly x={tween(f, 0, 100, -140, 540)} y={860 + wave(f, 36, 55)} s={2.6} glow={0.25} tilt={wave(f, 6, 55)} />
      </Canvas>
      <Title opacity={tween(f, 15, 45, 0, 1)} />
    </>
  );
};

// 2 — night falls, Nala peeks out from behind a leaf, trembling
const Hiding: FC<SceneProps> = ({ frames }) => {
  const f = useCurrentFrame();
  const p = tween(f, 0, 90, 0, 1);
  const peek = tween(f, 50, 75, 0, 1) - tween(f, frames - 60, frames - 35, 0, 1);
  return (
    <Canvas>
      <Sky top={interpolateColors(p, [0, 1], ["#3b2a63", NIGHT])} bottom={interpolateColors(p, [0, 1], ["#f39a5d", "#24204d"])} />
      <Stars opacity={p} />
      <Hills back={interpolateColors(p, [0, 1], ["#6a3f6e", "#1d1838"])} front="#140f26" />
      <Bamboo x={80} h={1550} color="#1a1230" />
      <Bamboo x={990} h={1500} color="#1a1230" phase={60} />
      <Firefly x={560 + wave(f, 4, 3)} y={1010 - peek * 150} s={2.6} mood="scared" />
      <BigLeaf x={560} y={1080} s={1.15} rot={-12} color={interpolateColors(p, [0, 1], ["#3a7a50", "#1c3d2e"])} />
    </Canvas>
  );
};

const HOUSES = [
  { x: 60, w: 200, h: 170 }, { x: 280, w: 170, h: 220 }, { x: 470, w: 230, h: 180 }, { x: 720, w: 160, h: 240 }, { x: 900, w: 160, h: 160 },
];

// 3 — wind blows out the village lights one by one
const Wind: FC<SceneProps> = () => {
  const f = useCurrentFrame();
  return (
    <Canvas>
      <Sky top={NIGHT} bottom="#1e1c48" />
      <Stars opacity={0.8} />
      <circle cx={790} cy={420} r={90} fill="#f4f1d0" />
      <g transform={`translate(${tween(f, 10, 90, -420, 790)} 430)`} fill="#2b2957">
        <circle cx={-90} cy={20} r={70} /><circle cx={0} cy={-20} r={100} /><circle cx={100} cy={20} r={75} /><rect x={-160} y={20} width={330} height={70} rx={35} />
      </g>
      <Bamboo x={80} h={1550} color="#151028" bend={tween(f, 0, 30, 0, 7) + wave(f, 2, 18)} />
      <Bamboo x={990} h={1500} color="#151028" bend={tween(f, 0, 30, 0, 7) + wave(f, 2, 18, 7)} />
      {HOUSES.map((b, i) => {
        const off = 28 + i * 14;
        const lit = f < off - 6 ? 1 : f < off ? (Math.floor(f / 2) % 2) : 0; // flicker, then out
        const base = 1640;
        return (
          <g key={i}>
            <path d={`M${b.x - 14} ${base - b.h} L${b.x + b.w / 2} ${base - b.h - 90} L${b.x + b.w + 14} ${base - b.h}Z`} fill="#120d22" />
            <rect x={b.x} y={base - b.h} width={b.w} height={b.h} fill="#1a1430" />
            <rect x={b.x + b.w * 0.3} y={base - b.h + 45} width={b.w * 0.4} height={60} rx={6} fill={lit ? "#ffd36b" : "#0d0a1c"} />
          </g>
        );
      })}
      <rect y={1640} width={W} height={H - 1640} fill="#0e0a1c" />
      {Array.from({ length: 7 }, (_, i) => {
        const x = ((f * 30 + i * 260) % 1700) - 400, y = 380 + rand(i) * 1000;
        return <path key={i} d={`M${x} ${y} q120 -30 240 0 t240 0`} stroke="#cfd6ff" strokeOpacity={0.35} strokeWidth={6} fill="none" strokeLinecap="round" />;
      })}
      <rect width={W} height={H} fill="#000" opacity={tween(f, 60, 120, 0, 0.3)} />
    </Canvas>
  );
};

// 4 — a lost chick cries; Nala leaves the leaf and flies to it
const Brave: FC<SceneProps> = ({ frames }) => {
  const f = useCurrentFrame();
  const go = tween(f, 50, frames - 30, 0, 1);
  return (
    <>
      <Canvas>
        <Sky top="#05051a" bottom="#121030" />
        <Stars opacity={0.35} n={25} />
        <Branch color="#1d1726" />
        <Chick x={734} y={610} color="#8a8064" crying />
        <Firefly x={260 + go * 280 + wave(f, 6 * (1 - go) + 1, 3)} y={1180 - go * 400 + wave(f, 18, 45) * go} s={2.4} mood="scared"
          glow={tween(f, frames - 50, frames, 0, 0.18)} tilt={go * 12} />
        <BigLeaf x={200} y={1290} s={0.9} rot={-20} color="#11261d" />
      </Canvas>
      <div style={{ position: "absolute", left: 640, top: 430, fontFamily, fontWeight: 800, fontSize: 52, color: "#b9c6ff",
        opacity: 0.5 + wave(f, 0.5, 30), transform: `rotate(-8deg)` }}>ciap… ciap…</div>
    </>
  );
};

// 5 — Nala glows; the light reveals the forest in colour and other fireflies join
const Light: FC<SceneProps> = ({ frames }) => {
  const f = useCurrentFrame();
  const g = tween(f, 0, 90, 0.2, 1);
  const r = tween(f, 10, 170, 120, 1500);
  const nx = 540, ny = 860 + wave(f, 22, 60);
  return (
    <>
      <Canvas>
        <defs>
          <radialGradient id="reveal" gradientUnits="userSpaceOnUse" cx={nx} cy={ny} r={r}>
            <stop offset="0.55" stopColor="#fff" /><stop offset="1" stopColor="#000" />
          </radialGradient>
          <mask id="lit"><rect width={W} height={H} fill="url(#reveal)" /></mask>
        </defs>
        <rect width={W} height={H} fill="#05051a" />
        <g mask="url(#lit)">
          <Sky top="#1b2559" bottom="#2f6a6a" />
          <Stars opacity={1} />
          <Hills back="#2e6b4f" front="#1f4a37" />
          <Bamboo x={80} h={1550} color="#3f8a58" />
          <Bamboo x={210} h={1250} color="#4f9c66" phase={30} />
          <Bamboo x={990} h={1500} color="#3f8a58" phase={60} />
          <Branch color="#6b4a3a" />
          <Chick x={734} y={610} color="#ffd86b" />
          {Array.from({ length: 26 }, (_, i) => {
            const t = 110 + i * 5;
            if (f < t) return null;
            const a = tween(f, t, t + 20, 0, 1);
            const x = rand(i + 5) * W + wave(f, 30, 70 + i * 3, i * 9), y = 300 + rand(i + 50) * 1100 + wave(f, 24, 60 + i * 2, i * 5);
            return <g key={i} opacity={a}><circle cx={x} cy={y} r={46} fill="url(#glow)" /><circle cx={x} cy={y} r={7} fill="#fff8b0" /></g>;
          })}
        </g>
        <Firefly x={nx} y={ny} s={2.7} glow={g} mood={f < 40 ? "scared" : "happy"} />
      </Canvas>
      <Title opacity={tween(f, frames - 70, frames - 40, 0, 1)} />
    </>
  );
};

export const scenes = [Dusk, Hiding, Wind, Brave, Light];
