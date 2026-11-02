import type { FC } from "react";
import { Easing, interpolate, interpolateColors, spring, useCurrentFrame } from "remotion";
import type { SceneProps } from "../../lib/Story";
import { rand, tween, wave } from "../../lib/kit";
import {
  Aru, Badge, Bunting, C, Canvas, Fish, H, HAIRS, IslandShape, Label, Lighthouse, Palm, Pyramid, Resident, SHIRTS, SKINS, Sea, Sky,
  SpearRack, Stars, Tent, W, fontFamily, wf,
} from "./parts";

const pop = (f: number, at: number, damping = 11) => spring({ frame: f - at, fps: 30, config: { damping, stiffness: 160 } });

// village light positions on the night island (scene 1 & 10)
const LIGHTS = Array.from({ length: 140 }, (_, i) => {
  const x = 40 + rand(i + 500) * 1000;
  const top = 1080 - 150 * Math.sin((x / W) * Math.PI) ;
  return { x, y: top + 40 + rand(i + 600) * (1250 - top - 40), d: rand(i + 700) };
});

// 1 — night: 3 lights → 809 lights, lighthouse sweeping
const Hook: FC<SceneProps> = ({ words, lead, frames }) => {
  const f = useCurrentFrame();
  const tiga = wf(words, lead, 2), boom = wf(words, lead, 6);
  const zoom = interpolate(f, [0, frames], [1, 1.1]);
  const count = f < boom ? 3 : Math.round(interpolate(f, [boom, boom + 45], [3, 809], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }));
  const p3 = pop(f, tiga);
  return (
    <Canvas>
      <Sky top={C.night} bottom="#1d2d63" />
      <Stars opacity={1} n={70} maxY={1000} />
      <circle cx={820} cy={330} r={70} fill="#f4f1d0" />
      <circle cx={820} cy={330} r={160} fill="url(#glow)" opacity={0.25} />
      <g transform={`translate(540 1200) scale(${zoom}) translate(-540 -1200)`}>
        <Sea y={1240} top={C.nightSea} bottom="#06142b" shimmer="#ffd36b" id="nsea" />
        <IslandShape y={1250} color="#0e2240" />
        <Palm x={120} y={1180} s={0.55} color="#0b1a30" trunk="#0b1a30" phase={10} />
        <Palm x={250} y={1150} s={0.45} color="#0b1a30" trunk="#0b1a30" phase={40} lean={-6} />
        <Lighthouse x={900} y={1220} s={0.95} beam={f * 2.4} />
        {LIGHTS.map((l, i) => {
          const first = i < 3;
          const on = first ? 1 : tween(f, boom + l.d * 40, boom + l.d * 40 + 6, 0, 1);
          if (on <= 0) return null;
          const tw = 0.75 + wave(f, 0.25, 30 + l.d * 30, i * 7);
          const big = first ? 1 + 0.6 * p3 * (1 - tween(f, tiga + 15, tiga + 40, 0, 1)) : 1;
          return (
            <g key={i} opacity={on * tw}>
              <circle cx={l.x} cy={l.y} r={30 * big} fill="url(#glow)" />
              <circle cx={l.x} cy={l.y} r={5 * big} fill="#fff1b0" />
            </g>
          );
        })}
        {/* reflections */}
        {LIGHTS.slice(0, 40).map((l, i) => {
          const on = i < 3 ? 1 : tween(f, boom + l.d * 40, boom + l.d * 40 + 6, 0, 1);
          return <rect key={i} x={l.x - 3} y={1270 + rand(i) * 100} width={6} height={30} rx={3} fill="#ffd36b" opacity={0.3 * on} />;
        })}
      </g>
      <Label x={540} y={300} size={70} color="#ffe9a8" opacity={tween(f, 5, 25, 0, 1)}>HARI KE-2</Label>
      <Label x={540} y={560} size={230} color={f < boom ? "#ffffff" : C.gold} scale={f < boom ? 0.6 + 0.4 * p3 : 1 + 0.15 * (1 - pop(f, boom + 45, 8))}
        opacity={tween(f, tiga - 6, tiga, 0, 1)}>{count}</Label>
      <Label x={540} y={660} size={56} color="#cfe0ff" opacity={tween(f, tiga, tiga + 10, 0, 1)}>lampu menyala</Label>
    </Canvas>
  );
};

const CROWD = Array.from({ length: 22 }, (_, i) => ({
  row: i % 2, x: i * 150 + rand(i) * 60, c: SHIRTS[i % SHIRTS.length], sk: SKINS[i % SKINS.length], h: HAIRS[i % HAIRS.length], ph: rand(i + 40) * 6,
}));

// 2 — morning: camp pan, residents with name tags
const Camp: FC<SceneProps> = ({ words, lead }) => {
  const f = useCurrentFrame();
  const num = wf(words, lead, 4);
  const pan = f * 3.2;
  return (
    <Canvas>
      <Sky top="#7fd0ff" bottom="#e8f7ff" id="msky" />
      <circle cx={220} cy={330} r={90} fill="#fff4c2" />
      <circle cx={220} cy={330} r={220} fill="url(#glow)" opacity={0.6} />
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${((i * 420 + f * 0.8) % 1400) - 200} ${220 + i * 90})`} fill="#fff" opacity={0.9}>
          <ellipse rx={90} ry={34} /><ellipse cx={60} cy={-20} rx={60} ry={40} /><ellipse cx={-50} cy={-10} rx={50} ry={30} />
        </g>
      ))}
      <Sea y={820} top="#5fd6e0" bottom={C.sea} id="msea" />
      <rect y={900} width={W} height={H - 900} fill={C.sand} />
      <path d={`M0 900 Q270 880 540 905 T1080 895 V920 H0Z`} fill="#fff" opacity={0.7} />
      <g transform={`translate(${-pan * 0.5} 0)`}>
        {Array.from({ length: 6 }, (_, i) => <Palm key={i} x={100 + i * 360} y={930} s={0.6} phase={i * 17} lean={i % 2 ? -6 : 8} />)}
      </g>
      <g transform={`translate(${-pan} 0)`}>
        {Array.from({ length: 8 }, (_, i) => (
          <Tent key={i} x={160 + i * 300} y={1080 + (i % 2) * 30} s={0.85} color={["#e86a4a", "#4a9be8", "#f2b33d", "#55b86a"][i % 4]} />
        ))}
      </g>
      {CROWD.filter((p) => p.row === 0).map((p, i) => {
        const x = ((p.x - f * 1.2 + 3000) % 1500) - 200;
        return <Resident key={i} x={x} y={1200} s={0.8} color={p.c} skin={p.sk} hair={p.h} tag="x" walk={f * 0.3 + p.ph} face={-1} />;
      })}
      {CROWD.filter((p) => p.row === 1).map((p, i) => {
        const x = ((p.x + f * 2 + 200) % 1600) - 250;
        return <Resident key={i} x={x} y={1400} s={1.05} color={p.c} skin={p.sk} hair={p.h} tag="x" walk={f * 0.35 + p.ph} />;
      })}
      <Badge x={540} y={330} w={620} text="809 penduduk" size={84} bg="#fff8e6f2" color="#e2553a" scale={pop(f, num)} />
      <Label x={540} y={180} size={54} color="#1d4e6b" stroke="#ffffffcc" opacity={tween(f, 0, 15, 0, 1)}>PULAU NETIZEN</Label>
    </Canvas>
  );
};

// 3 — festival flags; milestone 100 already passed; Aru shrugs
const Festival: FC<SceneProps> = ({ words, lead }) => {
  const f = useCurrentFrame();
  const stamp = wf(words, lead, 4), shrug = wf(words, lead, 5);
  const sh = tween(f, shrug, shrug + 10, 0, 1);
  return (
    <Canvas>
      <Sky top="#ffb37a" bottom="#ffe6b8" id="fsky" />
      <Sea y={1000} top="#4fc6d4" bottom={C.seaDeep} id="fsea" />
      <rect y={1080} width={W} height={H - 1080} fill={C.sand} />
      <Palm x={60} y={1120} s={1.1} phase={5} />
      <Palm x={1030} y={1120} s={1.1} lean={-8} phase={30} />
      <Bunting x1={80} y1={760} x2={1000} y2={760} sag={130} n={12} />
      <Bunting x1={80} y1={560} x2={1000} y2={560} sag={90} n={11} phase={20} />
      {/* banner */}
      <g transform={`translate(540 ${360 + wave(f, 6, 60)}) rotate(${wave(f, 1.5, 70)})`}>
        <rect x={-330} y={-90} width={660} height={180} rx={24} fill="#e2553a" />
        <path d="M-330 -60 l-60 60 l60 60Z M330 -60 l60 60 l-60 60Z" fill="#b83c26" />
        <text y={-12} textAnchor="middle" fontFamily={fontFamily} fontWeight={800} fontSize={58} fill="#fff">FESTIVAL</text>
        <text y={64} textAnchor="middle" fontFamily={fontFamily} fontWeight={800} fontSize={72} fill="#ffe08a">100 PENDUDUK</text>
      </g>
      <g opacity={tween(f, stamp, stamp + 4, 0, 1)} transform={`translate(760 520) rotate(-14) scale(${1 + 1.2 * (1 - tween(f, stamp, stamp + 8, 0, 1))})`}>
        <rect x={-170} y={-60} width={340} height={120} rx={14} fill="none" stroke="#1d7a4a" strokeWidth={12} />
        <text y={26} textAnchor="middle" fontFamily={fontFamily} fontWeight={800} fontSize={76} fill="#1d7a4a">LEWAT!</text>
      </g>
      {Array.from({ length: 50 }, (_, i) => {
        const x = rand(i + 80) * W + wave(f, 30, 60, i * 5), y = ((rand(i + 90) * 1500 + f * (3 + rand(i) * 3)) % 1500) - 50;
        return <rect key={i} x={x} y={y} width={14} height={22} fill={SHIRTS[i % 8]} transform={`rotate(${f * 6 + i * 40} ${x + 7} ${y + 11})`} />;
      })}
      <Aru x={540} y={1440} s={1.45} mood={f < shrug ? "wow" : "sheep"} armL={12 + 110 * sh} armR={12 + 110 * sh} />
      {sh > 0 && <Label x={300} y={940} size={64} color="#fff" opacity={sh} rot={-12}>eh…</Label>}
    </Canvas>
  );
};

// 4 — the Name Stone filling with carved names
const ROWS = 11, COLS = 3;
const NameStone: FC<SceneProps> = ({ words, lead, frames }) => {
  const f = useCurrentFrame();
  const ukir = wf(words, lead, 3), namamu = wf(words, lead, 5);
  const total = ROWS * COLS;
  const shown = interpolate(f, [0, namamu], [18, total - 1], { extrapolateRight: "clamp" });
  const cur = Math.min(total - 2, Math.floor(shown));
  const curCol = cur % COLS, curRow = Math.floor(cur / COLS);
  const sx = 250 + curCol * 230 + 170 * (shown - Math.floor(shown)), sy = 470 + curRow * 72;
  const glow = tween(f, namamu, namamu + 15, 0, 1);
  return (
    <Canvas>
      <Sky top="#9fe0c8" bottom="#e9f5d0" id="nsky" />
      {[0, 1, 2, 3].map((i) => (
        <path key={i} d={`M${200 + i * 220} 0 L${100 + i * 220 + wave(f, 20, 120, i * 30)} 1500 L${260 + i * 220} 1500 L${300 + i * 220} 0Z`} fill="#fff" opacity={0.12} />
      ))}
      <path d="M0 1100 Q270 1000 540 1080 T1080 1040 V1920 H0Z" fill="#5fae5a" />
      <Palm x={60} y={1200} s={1.2} phase={10} />
      <Palm x={1010} y={1220} s={1.0} lean={-8} phase={50} />
      <rect y={1300} width={W} height={H - 1300} fill="#4c9a4a" />
      <g transform={`translate(0 ${wave(f, 3, 120)})`}>
        <path d="M150 1340 Q120 700 220 380 Q540 230 860 380 Q960 700 930 1340Z" fill="#8e979c" />
        <path d="M150 1340 Q120 700 220 380 Q300 340 360 330 Q260 700 300 1340Z" fill="#000" opacity={0.12} />
        <path d="M860 380 Q960 700 930 1340 L880 1340 Q900 700 820 360Z" fill="#fff" opacity={0.12} />
        <ellipse cx={540} cy={1350} rx={430} ry={40} fill="#000" opacity={0.2} />
        <text x={540} y={430} textAnchor="middle" fontFamily={fontFamily} fontWeight={800} fontSize={54} fill="#5d666b">BATU NAMA</text>
        {Array.from({ length: total }, (_, i) => {
          const col = i % COLS, row = Math.floor(i / COLS);
          const len = 110 + rand(i + 3) * 70;
          const filled = i < cur ? 1 : i === cur ? shown - Math.floor(shown) : 0;
          if (i === total - 1) return null;
          return <rect key={i} x={250 + col * 230} y={470 + row * 72} width={len * filled} height={22} rx={11} fill="#4a5256" />;
        })}
        {/* empty slot for "namamu" */}
        <g opacity={glow} transform={`translate(${250 + 2 * 230 + 80} ${470 + (ROWS - 1) * 72 + 10})`}>
          <rect x={-110} y={-40} width={220} height={64} rx={16} fill={C.gold} opacity={0.35 + wave(f, 0.15, 20)} />
          <rect x={-110} y={-40} width={220} height={64} rx={16} fill="none" stroke={C.gold} strokeWidth={5} strokeDasharray="14 8" />
          <text y={6} textAnchor="middle" fontFamily={fontFamily} fontWeight={800} fontSize={42} fill="#5a3a00">namamu?</text>
        </g>
      </g>
      {f < frames - 10 && cur < total - 2 && (
        <g transform={`translate(${sx} ${sy}) rotate(${-30 + wave(f, 10, 6)})`}>
          <rect x={-8} y={-110} width={16} height={100} rx={4} fill="#7a4b2a" />
          <path d="M-8 -12 L8 -12 L4 8 L-4 8Z" fill="#cfd8dc" />
        </g>
      )}
      {Array.from({ length: f >= ukir ? 10 : 4 }, (_, i) => {
        const t = (f * 3 + i * 9) % 18;
        const a = rand(i + Math.floor((f * 3 + i * 9) / 18) * 7) * Math.PI * 2;
        return <circle key={i} cx={sx + Math.cos(a) * t * 4} cy={sy + 10 + Math.sin(a) * t * 3} r={5 - t / 4} fill="#fff6b0" opacity={1 - t / 18} />;
      })}
      <Label x={540} y={220} size={66} color="#2f5b3a" stroke="#ffffffcc" opacity={tween(f, 0, 15, 0, 1)}>Cari namamu di sini</Label>
    </Canvas>
  );
};

// 5 — Undian: comment slot-machine stops on two winners
const RANDOM_CARDS = Array.from({ length: 16 }, (_, i) => ({ c: SHIRTS[(i * 3) % 8], a: 140 + rand(i + 11) * 220, b: 90 + rand(i + 12) * 260 }));
const CardShell: FC<{ y: number; gold?: number }> = ({ y, gold = 0 }) => (
  <rect x={140} y={y} width={800} height={190} rx={28} fill="#fff" stroke={interpolateColors(gold, [0, 1], ["#e3dcf2", C.gold])} strokeWidth={6 + gold * 8} />
);
const Undian: FC<SceneProps> = ({ words, lead }) => {
  const f = useCurrentFrame();
  const stop = wf(words, lead, 5), w1 = wf(words, lead, 6), w2 = wf(words, lead, 9);
  const scroll = interpolate(f, [0, stop], [0, 230 * 13], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const winners = [
    { at: w1, name: "VANZwlee", text: "tambah piramida", col: "#5b5f66" },
    { at: w2, name: "Akai", text: "buat tombak untuk", text2: "nangkap ikan", col: "#3a2a6a" },
  ];
  const slot = 1 - tween(f, stop + 2, w1 - 4, 0, 1);
  return (
    <Canvas>
      <Sky top="#2a1650" bottom="#5a2a7a" id="usky" />
      <g transform={`rotate(${f * 0.5} 540 760)`} opacity={0.18}>
        {Array.from({ length: 12 }, (_, i) => <path key={i} d="M540 760 L500 -800 L580 -800Z" fill="#fff" transform={`rotate(${i * 30} 540 760)`} />)}
      </g>
      {/* panel */}
      <rect x={90} y={240} width={900} height={1120} rx={44} fill="#f4effc" />
      <rect x={90} y={240} width={900} height={120} rx={44} fill="#7b4fd6" />
      <rect x={90} y={320} width={900} height={40} fill="#7b4fd6" />
      <text x={540} y={322} textAnchor="middle" fontFamily={fontFamily} fontWeight={800} fontSize={66} fill="#fff">UNDIAN</text>
      <defs><clipPath id="slot"><rect x={90} y={380} width={900} height={960} /></clipPath></defs>
      <g clipPath="url(#slot)" opacity={slot}>
        {RANDOM_CARDS.map((c, i) => {
          const y = 420 + i * 230 - scroll + 230 * 0;
          const yy = ((y - 380) % (230 * 16) + 230 * 16) % (230 * 16) + 380 - 230;
          return (
            <g key={i}>
              <CardShell y={yy} />
              <circle cx={220} cy={yy + 95} r={46} fill={c.c} />
              <rect x={290} y={yy + 50} width={c.a} height={28} rx={14} fill="#9a90b0" />
              <rect x={290} y={yy + 105} width={c.b + 200} height={30} rx={15} fill="#cfc8de" />
            </g>
          );
        })}
      </g>
      {f > stop - 4 && f < w1 && <Label x={540} y={860} size={80} color="#7b4fd6" stroke="#fff" opacity={tween(f, stop - 4, stop + 4, 0, 1) * (1 - tween(f, w1 - 8, w1, 0, 1))}>2 terpilih!</Label>}
      {[w1, w2].map((at, j) => Array.from({ length: 30 }, (_, i) => {
        if (f < at) return null;
        const t = f - at;
        const x = 540 + Math.cos(i * 1.3) * t * (8 + rand(i) * 8), y = 560 + j * 420 + Math.sin(i * 1.3) * t * (6 + rand(i + 1) * 6) + t * t * 0.3;
        return <circle key={`${j}-${i}`} cx={x} cy={y} r={9} fill={SHIRTS[i % 8]} opacity={1 - tween(f, at + 20, at + 50, 0, 1)} />;
      }))}
      {winners.map((w, i) => {
        const p = pop(f, w.at - 3, 10);
        if (f < w.at - 3) return null;
        const y = 440 + i * 420;
        return (
          <g key={i} transform={`translate(540 ${y + 120}) scale(${p}) translate(-540 ${-(y + 120)})`}>
            <rect x={130} y={y - 10} width={820} height={i ? 300 : 250} rx={30} fill="#fff" stroke={C.gold} strokeWidth={14} />
            <circle cx={240} cy={y + 90} r={62} fill={w.col} />
            <circle cx={240} cy={y + 72} r={22} fill="#cfd3da" /><path d={`M200 ${y + 130} Q240 ${y + 80} 280 ${y + 130}Z`} fill="#cfd3da" />
            <text x={330} y={y + 70} fontFamily={fontFamily} fontWeight={800} fontSize={48} fill="#8a8f99">{w.name}</text>
            <text x={330} y={y + 150} fontFamily={fontFamily} fontWeight={800} fontSize={60} fill="#1e1e2a">{w.text}</text>
            {w.text2 && <text x={330} y={y + 220} fontFamily={fontFamily} fontWeight={800} fontSize={60} fill="#1e1e2a">{w.text2}</text>}
            <g transform={`translate(860 ${y - 10}) rotate(12)`}>
              <rect x={-110} y={-36} width={220} height={66} rx={14} fill={C.gold} />
              <text y={14} textAnchor="middle" fontFamily={fontFamily} fontWeight={800} fontSize={40} fill="#5a3a00">TERPILIH</text>
            </g>
          </g>
        );
      })}
    </Canvas>
  );
};

// 6 — ghost pyramid, click, it rises; camera orbits
const PROPS6 = [
  { a: 60, kind: "tent", c: "#e86a4a" }, { a: 150, kind: "palm" }, { a: 210, kind: "tent", c: "#4a9be8" }, { a: 300, kind: "palm" },
  { a: 20, kind: "res", c: SHIRTS[0] }, { a: 100, kind: "res", c: SHIRTS[3] }, { a: 120, kind: "res", c: SHIRTS[4] }, { a: 250, kind: "tent", c: "#f2b33d" },
  { a: 80, kind: "res", c: SHIRTS[6] },
];
const PyramidScene: FC<SceneProps> = ({ words, lead }) => {
  const f = useCurrentFrame();
  const click = wf(words, lead, 2), tahu = wf(words, lead, 6), warga = wf(words, lead, 12);
  const built = f >= click;
  const grow = built ? spring({ frame: f - click, fps: 30, config: { damping: 9, stiffness: 120 } }) : 1;
  const theta = 20 + Math.max(0, f - click - 10) * 0.75;
  const cx = 540, cy = 1080;
  const cursor = { x: tween(f, 0, click - 4, 900, 600), y: tween(f, 0, click - 4, 1350, 900) };
  const items = PROPS6.map((p) => {
    const a = ((p.a + theta) * Math.PI) / 180;
    const depth = Math.sin(a);
    return { ...p, x: cx + 440 * Math.cos(a), y: cy + 150 * depth + 30, s: 0.7 + 0.25 * depth, depth };
  });
  const back = items.filter((i) => i.depth < 0).sort((a, b) => a.depth - b.depth);
  const front = items.filter((i) => i.depth >= 0).sort((a, b) => a.depth - b.depth);
  const draw = (it: (typeof items)[number], k: number) => {
    if (it.kind === "tent") return <Tent key={k} x={it.x} y={it.y} s={it.s * 0.8} color={it.c!} />;
    if (it.kind === "palm") return <Palm key={k} x={it.x} y={it.y} s={it.s * 0.75} phase={k * 13} />;
    const cheer = f > warga ? Math.abs(Math.sin((f - warga) / 5)) * 40 : 0;
    return (
      <g key={k}>
        <Resident x={it.x} y={it.y} s={it.s * 0.9} color={it.c!} skin={SKINS[k % 5]} tag="x" jump={cheer} face={it.x > cx ? -1 : 1} />
        {f > tahu && f < warga && <Label x={it.x} y={it.y - 230 * it.s} size={70} color="#fff" scale={pop(f, tahu + k * 2)}>?</Label>}
      </g>
    );
  };
  return (
    <Canvas>
      <Sky top="#56c3f5" bottom="#d8f3ff" id="psky" />
      <Sea y={760} top="#4fd0dc" bottom="#2aa9bf" id="psea" />
      <ellipse cx={cx} cy={cy + 40} rx={620} ry={260} fill={C.sand} />
      <ellipse cx={cx} cy={cy + 40} rx={620} ry={260} fill="none" stroke="#fff" strokeOpacity={0.6} strokeWidth={10} />
      {back.map(draw)}
      <g transform={built ? "" : `translate(0 ${wave(f, 10, 40)})`}>
        <Pyramid x={cx} y={cy} theta={theta} ghost={built ? 0 : 1} grow={grow} />
      </g>
      {front.map(draw)}
      {built && f < click + 30 && Array.from({ length: 14 }, (_, i) => {
        const t = f - click, a = (i / 14) * Math.PI * 2;
        return <circle key={i} cx={cx + Math.cos(a) * (260 + t * 6)} cy={cy + Math.sin(a) * (70 + t * 2)} r={40 + t} fill="#f0d8a8" opacity={0.7 * (1 - t / 30)} />;
      })}
      {f < click + 10 && (
        <g transform={`translate(${cursor.x} ${cursor.y}) scale(${f >= click - 4 && f < click + 2 ? 0.85 : 1})`} opacity={1 - tween(f, click, click + 10, 0, 1)}>
          <path d="M0 0 L0 80 L22 60 L38 96 L52 90 L36 54 L64 54Z" fill="#fff" stroke="#000" strokeWidth={5} strokeLinejoin="round" />
          {f >= click - 4 && <circle r={20 + (f - click + 4) * 6} fill="none" stroke="#7dffb0" strokeWidth={6} opacity={1 - (f - click + 4) / 14} />}
        </g>
      )}
      {!built && <Badge x={540} y={560} w={420} text="+ Piramida" size={56} bg="#1e6b3fdd" color="#c8ffd9" />}
      <Label x={540} y={300} size={70} color="#fff" stroke="#1a4a6acc" opacity={tween(f, tahu - 30, tahu - 15, 0, 1)}>Piramida… di pulau tropis?</Label>
    </Canvas>
  );
};

// 7 — spear rack, Aru wades in, misses, then hits
const Spear: FC<SceneProps> = ({ words, lead }) => {
  const f = useCurrentFrame();
  const take = wf(words, lead, 1), dangkal = wf(words, lead, 6), throw1 = wf(words, lead, 8), miss = wf(words, lead, 9);
  const coba = wf(words, lead, 10), kena = wf(words, lead, 12);
  const throw2 = kena - 12;
  const ax = tween(f, take + 6, dangkal + 6, 250, 470);
  const wading = tween(f, dangkal - 10, dangkal + 6, 0, 1);
  const ay = 1180 + 30 * wading;
  const holding = (f >= take && f < throw1 + 4) || (f >= coba - 6 && f < throw2 + 4);
  // wind up then release
  const arm = (t: number) => interpolate(f, [t - 14, t - 2, t + 4], [150, 200, 95], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const armR = f < take ? 15 : f < coba - 6 ? (f < throw1 + 10 ? arm(throw1 + 2) : 30) : f < throw2 + 10 ? (f < coba ? tween(f, coba - 6, coba, 30, 150) : arm(throw2 + 2)) : 160;
  // flying spears
  const fly = (t0: number, x1: number, y1: number, dur: number) => {
    const p = Math.min(1, Math.max(0, (f - t0) / dur));
    const sx = ax + 60, sy = ay - 470;
    const x = sx + (x1 - sx) * p, y = sy + (y1 - sy) * p - Math.sin(p * Math.PI) * 160;
    const ang = interpolate(p, [0, 1], [70, 150]);
    return { x, y, ang, p };
  };
  const s1 = fly(throw1 + 4, 860, 1290, 14);
  const s2 = fly(throw2 + 4, 760, 1290, 12);
  const fishHit = f >= kena;
  const lift = tween(f, kena + 4, kena + 30, 0, 1);
  const fishX = fishHit ? 760 : 980 - ((f * 2.4) % 400) * (f < throw1 + 18 ? 1 : 0) - (f >= throw1 + 18 ? 0 : 0);
  const darting = f >= throw1 + 17 && f < throw1 + 40;
  return (
    <Canvas>
      <Sky top="#4cc0f2" bottom="#c9efff" id="ssky" />
      <circle cx={880} cy={260} r={80} fill="#fff7c8" />
      <Sea y={760} top="#46d0de" bottom="#0f8faa" id="ssea" />
      <path d="M-20 1060 Q200 960 420 1180 L200 1920 L-20 1920Z" fill={C.sand} />
      <path d="M-20 1080 Q200 980 400 1180" stroke="#fff" strokeOpacity={0.6} strokeWidth={10} fill="none" />
      <SpearRack x={130} y={1120} s={0.9} count={4} />
      {/* swimming fish */}
      {[{ x: 640, y: 1330, c: "#ffb347", d: 0 }, { x: 900, y: 1260, c: "#5fb3e8", d: 1 }].map((fi, i) => (
        <Fish key={i} x={((fi.x + f * (1.5 + i) + i * 300) % 560) + 500} y={fi.y + wave(f, 10, 40, i * 20)} s={0.55} color={fi.c} />
      ))}
      {!fishHit && <Fish x={darting ? fishX + (f - throw1 - 17) * 14 : 900 + wave(f, 60, 90)} y={1300 + wave(f, 12, 30)} s={0.7} color="#5fb3e8" flip={!darting} />}
      <Aru x={ax} y={ay} s={1.1} mood={f >= miss && f < coba ? "sheep" : f >= kena ? "grin" : f >= dangkal ? "focus" : "happy"}
        armR={armR} armL={f >= kena ? 60 : 20} spear={holding || (f >= kena + 20)} fish={f >= kena + 20} walk={f > take + 6 && f < dangkal + 6 ? f * 0.35 : 0} bob />
      {/* water over legs */}
      <path d={`M420 ${ay - 60} L${W} ${ay - 60} L${W} ${H} L200 ${H}Z`} fill="#1fb5c4" opacity={0.55} />
      <path d={`M420 ${ay - 60} ${Array.from({ length: 14 }, (_, i) => `Q${430 + i * 50 + 25} ${ay - 70 + wave(f, 6, 20, i * 5)} ${430 + (i + 1) * 50} ${ay - 60}`).join(" ")}`} stroke="#fff" strokeWidth={6} fill="none" opacity={0.8} />
      {/* spear 1: misses */}
      {f > throw1 + 4 && f < miss + 30 && (
        <g transform={`translate(${s1.x} ${s1.y}) rotate(${s1.ang})`}>
          <rect x={-4} y={-170} width={8} height={300} fill="#a8743f" /><path d="M-11 126 L0 176 L11 126Z" fill="#cfd8dc" />
        </g>
      )}
      {/* spear 2: hits and lifts the fish */}
      {f > throw2 + 4 && f < kena + 20 && (
        <g transform={`translate(${s2.x} ${s2.y - lift * 200}) rotate(${s2.ang})`}>
          <rect x={-4} y={-170} width={8} height={300} fill="#a8743f" /><path d="M-11 126 L0 176 L11 126Z" fill="#cfd8dc" />
          {fishHit && <g transform="translate(0 140) rotate(90)"><Fish x={0} y={0} s={0.7} color="#5fb3e8" stuck /></g>}
        </g>
      )}
      {[{ t: throw1 + 18, x: 860 }, { t: kena, x: 760 }].map((sp, i) => f >= sp.t && f < sp.t + 24 && (
        <g key={i}>
          {Array.from({ length: 12 }, (_, k) => {
            const t = f - sp.t, a = Math.PI + (k / 11) * Math.PI;
            return <circle key={k} cx={sp.x + Math.cos(a) * t * 7} cy={1260 + Math.sin(a) * t * 9 + t * t * 0.6} r={10} fill="#e6fbff" opacity={1 - t / 24} />;
          })}
          <ellipse cx={sp.x} cy={1270} rx={(f - sp.t) * 8} ry={(f - sp.t) * 2} fill="none" stroke="#fff" strokeWidth={5} opacity={1 - (f - sp.t) / 24} />
        </g>
      ))}
      {f >= miss && f < coba + 6 && <Label x={760} y={560} size={110} color="#ff5b5b" stroke="#fff" rot={-8} scale={pop(f, miss)}>MELESET!</Label>}
      {f >= kena && <Label x={600} y={560} size={150} color={C.gold} stroke="#7a3b00" rot={-6} scale={pop(f, kena, 8)}>KENA!</Label>}
      {f < take + 30 && <Badge x={240} y={600} w={360} text="Rak Tombak" size={48} scale={pop(f, 2)} />}
    </Canvas>
  );
};

// 8 — sunset victory: first fish
const Victory: FC<SceneProps> = ({ words, lead }) => {
  const f = useCurrentFrame();
  const lapar = wf(words, lead, 9);
  const raise = tween(f, 0, 18, 120, 172);
  return (
    <Canvas>
      <Sky top="#ff7a59" bottom="#ffd27a" id="vsky" />
      <circle cx={540} cy={tween(f, 0, 170, 900, 960)} r={190} fill="#fff1a8" />
      <Sea y={1000} top="#ff9a6a" bottom="#7a3f7a" shimmer="#ffe6a8" id="vsea" />
      <rect y={1120} width={W} height={H - 1120} fill="#e8b878" />
      <Palm x={90} y={1160} s={1.2} color="#3a2a4a" trunk="#3a2a4a" phase={20} />
      <Palm x={1000} y={1150} s={1.0} color="#3a2a4a" trunk="#3a2a4a" lean={-8} phase={60} />
      {/* campfire */}
      <g transform="translate(820 1380)">
        <circle cy={-60} r={200} fill="url(#glow)" opacity={0.7 + wave(f, 0.15, 8)} />
        <rect x={-70} y={-14} width={140} height={22} rx={10} fill="#6b3f22" transform="rotate(14)" />
        <rect x={-70} y={-14} width={140} height={22} rx={10} fill="#5a3319" transform="rotate(-14)" />
        <path d={`M-40 -10 Q-50 -80 ${wave(f, 10, 9)} -150 Q50 -80 40 -10Z`} fill="#ff8a3d" />
        <path d={`M-20 -10 Q-26 -60 ${wave(f, 8, 7, 3)} -100 Q26 -60 20 -10Z`} fill="#ffe08a" />
      </g>
      <Aru x={460} y={1400} s={1.5} mood="grin" armR={raise} armL={f > lapar ? 40 + wave(f, 10, 12) : 30} spear fish />
      {f > lapar && Array.from({ length: 6 }, (_, i) => {
        const t = (f - lapar + i * 8) % 48;
        return <path key={i} d="M0 8 C-14 -6 -10 -18 0 -10 C10 -18 14 -6 0 8Z" transform={`translate(${300 + i * 60 + wave(f, 14, 30, i * 9)} ${1000 - t * 6}) scale(2.6)`} fill="#ff5b7a" opacity={1 - t / 48} />;
      })}
      {Array.from({ length: 10 }, (_, i) => (
        <path key={i} d="M0 -14 L4 -4 L14 0 L4 4 L0 14 L-4 4 L-14 0 L-4 -4Z" fill="#fff8c8"
          transform={`translate(${200 + rand(i) * 700} ${520 + rand(i + 9) * 380}) scale(${1 + wave(f, 0.8, 25, i * 7)})`} />
      ))}
      <g opacity={tween(f, 4, 20, 0, 1)} transform={`translate(540 ${300 + 30 * (1 - tween(f, 4, 20, 0, 1))})`}>
        <Label x={0} y={0} size={86} color="#fff" stroke="#9a3a2acc">Ikan pertama di</Label>
        <Label x={0} y={110} size={104} color={C.gold} stroke="#9a3a2acc">Pulau Netizen</Label>
      </g>
    </Canvas>
  );
};

// 9 — phone screen: residents spearfishing, a golden fish
const Phone: FC<SceneProps> = ({ words, lead }) => {
  const f = useCurrentFrame();
  const masuk = wf(words, lead, 6), emas = wf(words, lead, 15), langka = wf(words, lead, 17);
  const catchAt = langka + 4;
  const caught = f >= catchAt;
  const px = 200, py = 330, pw = 680, ph = 1240;
  const gx = interpolate(f, [emas - 10, catchAt], [px + pw + 80, 560], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const tilt = wave(f, 1.5, 90);
  return (
    <Canvas>
      <Sky top="#1b2a4a" bottom="#2c4f7a" id="phsky" />
      {Array.from({ length: 24 }, (_, i) => (
        <circle key={i} cx={rand(i + 1) * W} cy={((rand(i + 2) * H) - f * (1 + rand(i) * 2) + H) % H} r={4 + rand(i + 3) * 8} fill="#ffd36b" opacity={0.25} />
      ))}
      <g transform={`rotate(${tilt} 540 1000) translate(0 ${wave(f, 6, 70)})`}>
        <defs><clipPath id="screen"><rect x={px} y={py} width={pw} height={ph} rx={40} /></clipPath></defs>
        <rect x={px - 30} y={py - 50} width={pw + 60} height={ph + 100} rx={80} fill="#111" />
        <g clipPath="url(#screen)">
          <rect x={px} y={py} width={pw} height={ph} fill="#7fd0ff" />
          <rect x={px} y={py + 380} width={pw} height={ph} fill="#2bb7c6" />
          <path d={`M${px} ${py + 560} Q${px + 200} ${py + 500} ${px + 320} ${py + 700} L${px} ${py + 700}Z`} fill={C.sand} />
          {Array.from({ length: 10 }, (_, i) => (
            <rect key={i} x={px + ((rand(i) * pw + f * 1.2) % pw)} y={py + 420 + rand(i + 5) * 760} width={50} height={5} rx={3} fill="#fff" opacity={0.35} />
          ))}
          <Palm x={px + 80} y={py + 590} s={0.5} />
          <Resident x={px + 340} y={py + 760} s={0.95} color={SHIRTS[1]} skin={SKINS[2]} tag="x" />
          <g transform={`translate(${px + 380} ${py + 640}) rotate(${caught ? 10 : 150 + wave(f, 6, 20)})`}>
            <rect x={-4} y={0} width={8} height={260} fill="#a8743f" /><path d={`M-10 256 L0 300 L10 256Z`} fill="#cfd8dc" />
            {caught && <g transform="translate(0 250) rotate(90)"><Fish x={0} y={0} s={0.7} color={C.gold} stuck /></g>}
          </g>
          <rect x={px + 290} y={py + 720} width={pw} height={600} fill="#2bb7c6" opacity={0.5} />
          <Fish x={px + 120 + ((f * 2) % 500)} y={py + 1000} s={0.5} color="#ff9f43" />
          {!caught && f >= emas - 10 && (
            <g>
              <circle cx={gx} cy={py + 860} r={90 + wave(f, 12, 8)} fill="url(#glow)" />
              <Fish x={gx} y={py + 860} s={0.7} color={C.gold} flip />
            </g>
          )}
          {caught && f < catchAt + 20 && <circle cx={px + 470} cy={py + 820} r={(f - catchAt) * 10} fill="none" stroke="#fff" strokeWidth={8} opacity={1 - (f - catchAt) / 20} />}
          {/* game HUD */}
          <rect x={px + 20} y={py + 30} width={pw - 40} height={80} rx={40} fill="#00000066" />
          <text x={px + 60} y={py + 84} fontFamily={fontFamily} fontWeight={800} fontSize={40} fill="#fff">Hari ke-2</text>
          <text x={px + pw - 60} y={py + 84} textAnchor="end" fontFamily={fontFamily} fontWeight={800} fontSize={40} fill={C.gold}>809 warga</text>
          <circle cx={px + pw - 120} cy={py + 400} r={70} fill={C.gold} stroke="#fff" strokeWidth={6} opacity={0.95} transform={`scale(1)`} />
          <text x={px + pw - 120} y={py + 416} textAnchor="middle" fontFamily={fontFamily} fontWeight={800} fontSize={40} fill="#5a3a00">E</text>
          {caught && <Label x={px + pw / 2} y={py + 280} size={64} color={C.gold} stroke="#5a3a00" scale={pop(f, catchAt)}>+1 ikan emas!</Label>}
        </g>
        <rect x={px + pw / 2 - 70} y={py - 30} width={140} height={14} rx={7} fill="#333" />
      </g>
      {/* hand */}
      <path d="M170 1500 Q120 1300 230 1240 Q290 1260 260 1400 L320 1700 L120 1920 L0 1920 L0 1600Z" fill={C.skin} />
      <path d="M910 1380 Q980 1360 990 1430 Q960 1480 900 1470Z" fill={C.skin} />
      <path d="M910 1480 Q990 1470 990 1540 Q960 1580 900 1570Z" fill={C.skin} />
      <Badge x={540} y={160} w={640} text="bit.ly/pulau-ara" size={64} bg="#ffffff" color="#e2553a" scale={f < masuk ? 0 : pop(f, masuk)} />
    </Canvas>
  );
};

// 10 — ending: whole island at dusk, "what do we build tomorrow?"
const Ending: FC<SceneProps> = ({ words, lead, frames }) => {
  const f = useCurrentFrame();
  const kom = wf(words, lead, 4);
  const dusk = tween(f, 0, frames, 0, 1);
  return (
    <Canvas>
      <Sky top={interpolateColors(dusk, [0, 1], ["#ff9a6a", "#3a2a6a"])} bottom={interpolateColors(dusk, [0, 1], ["#ffd9a0", "#ff9a6a"])} id="esky" />
      <Stars opacity={dusk} n={30} maxY={700} />
      <Sea y={1150} top="#5a6aa8" bottom="#2a2a5a" shimmer="#ffd9a0" id="esea" />
      <IslandShape y={1200} color="#3c7a4a" />
      <Lighthouse x={930} y={1150} s={0.7} beam={f * 2.4} lit={dusk} />
      <Pyramid x={520} y={1130} r={110} h={150} theta={30 + f * 0.3} />
      <Tent x={240} y={1170} s={0.45} color="#e86a4a" lit={dusk} />
      <Tent x={330} y={1190} s={0.4} color="#4a9be8" lit={dusk} />
      <Tent x={700} y={1180} s={0.42} color="#f2b33d" lit={dusk} />
      <path d="M770 1180 Q760 1080 800 1060 Q840 1080 830 1180Z" fill="#8e979c" />
      <Palm x={90} y={1190} s={0.6} phase={4} />
      <g transform={`translate(540 ${700 + wave(f, 18, 40)}) scale(${pop(f, 6)})`}>
        <path d="M-210 -170 h420 a60 60 0 0 1 60 60 v200 a60 60 0 0 1 -60 60 h-180 l-70 80 l0 -80 h-170 a60 60 0 0 1 -60 -60 v-200 a60 60 0 0 1 60 -60Z" fill="#fff" />
        <text y={70} textAnchor="middle" fontFamily={fontFamily} fontWeight={800} fontSize={240} fill="#7b4fd6" transform={`rotate(${wave(f, 6, 30)})`}>?</text>
      </g>
      <Label x={540} y={290} size={92} color="#fff" stroke="#3a2a6acc" opacity={tween(f, 0, 12, 0, 1)}>Besok kita</Label>
      <Label x={540} y={400} size={110} color={C.gold} stroke="#3a2a6acc" opacity={tween(f, 6, 18, 0, 1)}>bangun apa?</Label>
      <g opacity={tween(f, kom - 4, kom + 6, 0, 1)} transform={`translate(540 ${1290 + wave(f, 14, 20)})`}>
        <path d="M-30 -60 h60 v50 h40 l-70 70 l-70 -70 h40Z" fill={C.gold} stroke="#5a3a00" strokeWidth={5} strokeLinejoin="round" />
      </g>
    </Canvas>
  );
};

export const scenes = [Hook, Camp, Festival, NameStone, Undian, PyramidScene, Spear, Victory, Phone, Ending];
