import type { FC } from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame } from "remotion";
import type { SceneProps, Word } from "../../lib/Story";
import { rand, tween, wave } from "../../lib/kit";
import {
  AruFront, AruSide, Bottle, Cam, Campfire, Canvas, Caption, Cloud, Counter, Gull, H, Island, Palm, Sea, Sky, Stars, Vignette, W, fontFamily,
} from "./parts";

/** Frame (within the scene) at which the nth word starting with `text` is spoken. */
const at = (words: Word[], lead: number, text: string, nth = 0) => {
  let k = 0;
  for (const w of words) if (w.text.toLowerCase().startsWith(text.toLowerCase()) && k++ === nth) return Math.round((lead + w.start) * 30);
  return 0;
};
const lin = (f: number, a: number, b: number, from: number, to: number) =>
  interpolate(f, [a, b], [from, to], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
const pop = (f: number, start: number) => spring({ frame: f - start, fps: 30, config: { damping: 11, stiffness: 140 } });

// 1 — Hook: a dark sea, an island that is on no map, the counter blinking
const Hook: FC<SceneProps> = ({ words, lead, frames }) => {
  const f = useCurrentFrame();
  const fPulau = at(words, lead, "pulau"), fTidak = at(words, lead, "tidak");
  const grid = tween(f, 5, 50, 0, 1);
  const ring = pop(f, fPulau);
  const q = pop(f, fTidak + 4);
  const z = lin(f, 0, frames, 1, 1.18);
  return (
    <>
      <Canvas>
        <Sky id="s1sky" stops={[[0, "#010208"], [0.5, "#06102a"], [0.56, "#0b1a3c"]]} />
        <Stars n={40} opacity={0.35} maxY={1000} />
        <Cam z={z} cx={540} cy={1040}>
          <Sea id="s1sea" y={1040} top="#0a1a3a" bottom="#01040c" line="#6f9ccc" lineO={0.25} speed={0.6} />
          <ellipse cx={540} cy={1046} rx={150} ry={10} fill="#8fb4ff" opacity={0.08 + wave(f, 0.04, 60)} />
          <Island x={540} y={1036} rx={95} ry={14} sand="#0d1426" wet="#0a0f1d" shallow="#0e2140" foamO={0.12} />
          <Palm x={565} y={1030} h={90} lean={-14} trunk="#060a16" leaf="#070c1a" leafD="#050813" nut="#050813" />
        </Cam>
        <g opacity={grid * 0.5} stroke="#6fa3d6" strokeWidth={2}>
          {Array.from({ length: 10 }, (_, i) => <line key={`v${i}`} x1={i * 120 + 0} y1={0} x2={i * 120} y2={H} strokeOpacity={0.35} />)}
          {Array.from({ length: 17 }, (_, i) => <line key={`h${i}`} x1={0} y1={i * 120} x2={W} y2={i * 120} strokeOpacity={0.35} />)}
        </g>
        <g opacity={grid * 0.7} transform="translate(170 560)" stroke="#8fb9e6" fill="none" strokeWidth={3}>
          <circle r={70} /><circle r={52} strokeDasharray="6 8" />
          <path d="M0 -95 L12 0 L0 95 L-12 0Z M-95 0 L0 12 L95 0 L0 -12Z" fill="#8fb9e6" fillOpacity={0.25} />
        </g>
        <circle cx={540} cy={1030} r={60 + ring * 90} fill="none" stroke="#ffd98a" strokeWidth={5} strokeDasharray="18 14"
          opacity={ring * (1 - lin(f, fPulau + 40, fPulau + 70, 0, 0.6))} />
        <g transform={`translate(540 ${880 - q * 20}) scale(${q})`} opacity={Math.min(1, q)}>
          <text textAnchor="middle" fontFamily={fontFamily} fontWeight={800} fontSize={150} fill="#ffd98a">?</text>
        </g>
        <Vignette />
      </Canvas>
      <Counter o={0.45 + wave(f, 0.45, 45)} pulse={Math.max(0, wave(f, 1, 45)) * 0.3} />
      <Caption text="PULAU TANPA NAMA" top={330} size={92} o={tween(f, 82, 100, 0, 1)} y={tween(f, 82, 100, 20, 0)} color="#ffe6a8" />
      <Caption text="Episode 0 · Penduduk: 1" top={440} size={50} o={tween(f, 92, 110, 0, 0.85)} color="#cfe0ff" />
    </>
  );
};

// 2 — Dawn: Aru wakes on wet sand; the camera pulls back to show a tiny empty island
const Wake: FC<SceneProps> = ({ words, lead }) => {
  const f = useCurrentFrame();
  const fWake = at(words, lead, "terbangun");
  const up = tween(f, fWake + 4, fWake + 34, 0, 1);
  const z = interpolate(f, [fWake + 10, 200], [2.7, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.quad) });
  const k = (z - 1) / 1.7;
  const ax = 430, ay = 1128;
  const look = f > fWake + 40 ? wave(f - fWake - 40, 12, 70) : 0;
  return (
    <>
      <Canvas>
        <Sky id="s2sky" stops={[[0, "#38427e"], [0.3, "#a9719a"], [0.5, "#f7b27a"]]} />
        <circle cx={790} cy={lin(f, 0, 208, 1000, 930)} r={260} fill="url(#sunglow)" />
        <circle cx={790} cy={lin(f, 0, 208, 1000, 930)} r={78} fill="#ffe2a8" />
        <Cloud x={220 + f * 0.25} y={560} s={1.2} color="#f2a0a8" o={0.6} />
        <Cloud x={820 - f * 0.2} y={420} s={0.9} color="#d98fae" o={0.5} />
        <Cam z={z} cx={ax} cy={ay} dx={(540 - ax) * k} dy={(880 - ay) * k}>
          <Sea id="s2sea" y={960} top="#f0ad84" bottom="#2d6289" line="#ffe3c4" lineO={0.45} />
          <rect x={700} y={962} width={180} height={300} fill="#ffe2a8" opacity={0.12} />
          <Island x={540} y={1160} rx={400} ry={90} sand="#f1d39a" wet="#c79f68" shallow="#86c9c0" />
          <Palm x={740} y={1150} h={420} lean={-70} trunk="#7b5636" leaf="#3f8a5a" leafD="#2f6d48" />
          <path d="M300 1185 q30 -8 60 0 M520 1200 q20 -6 40 0" stroke="#fff" strokeOpacity={0.6} strokeWidth={3} fill="none" />
          <AruSide x={ax} y={ay + 20 * (1 - up) - 8 * up} s={1} wet={1 - lin(f, 120, 208, 0, 0.4)} eyes={f < fWake ? 0 : 1}
            mood={f < fWake ? "sleep" : "awe"} pose={{
              lean: -92 + up * 84, head: look * up + 8 * (1 - up),
              armF: [lin(up, 0, 1, 10, 40), lin(up, 0, 1, 0, 30)], armB: [lin(up, 0, 1, -10, -40), 0],
              legF: [lin(up, 0, 1, 90, 84), lin(up, 0, 1, 0, -14)], legB: [lin(up, 0, 1, 88, 80), lin(up, 0, 1, 0, -8)],
            }} />
        </Cam>
        <Vignette o={0.5} />
      </Canvas>
      <Counter o={0.8} />
    </>
  );
};

// 3 — Searching: Aru runs and shouts; one trail of footprints; gulls fly off; a wave answers
const Search: FC<SceneProps> = ({ words, lead }) => {
  const f = useCurrentFrame();
  const fShout = at(words, lead, "berteriak"), fHabis = at(words, lead, "habis"), fOmbak = at(words, lead, "ombak");
  const runEnd = 150;
  const xAt = (t: number) => interpolate(t, [0, runEnd], [150, 720], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.quad) });
  const ground = 1180;
  const running = f < runEnd - 10;
  const sp = interpolate(f, [0, runEnd], [1, 0.3], { extrapolateRight: "clamp" });
  const ph = (f / 15) * Math.PI * 2;
  const sw = running ? Math.sin(ph) * sp : 0;
  const shout = f >= fShout - 3 && f < fHabis + 14;
  // swash: rises over the beach on "ombak", then recedes
  const front = interpolate(f, [fOmbak - 6, fOmbak + 14, fOmbak + 50], [1290, 1150, 1300], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const swashOn = f > fOmbak - 6;
  const prints = Array.from({ length: Math.floor(Math.min(f, runEnd - 10) / 7) }, (_, i) => {
    const t = i * 7;
    return { x: xAt(t) + 10, y: ground + 4 + (i % 2 ? 9 : -5), t };
  });
  return (
    <>
      <Canvas>
        <Sky id="s3sky" stops={[[0, "#4fa8e3"], [0.42, "#bfe7f5"]]} />
        <circle cx={200} cy={300} r={240} fill="url(#sunglow)" opacity={0.7} />
        <Cloud x={((f * 0.6 + 200) % 1400) - 200} y={420} s={1.1} color="#fff" o={0.9} />
        <Cloud x={((f * 0.4 + 900) % 1400) - 200} y={620} s={0.8} color="#fff" o={0.8} />
        <Sea id="s3sea" y={820} top="#57bcd3" bottom="#16698f" line="#e7fbff" lineO={0.5} />
        <defs><clipPath id="s3isl"><ellipse cx={540} cy={1150} rx={490} ry={170} /></clipPath></defs>
        <Island x={540} y={1110} rx={470} ry={150} sand="#f6dda4" wet="#d3ae74" shallow="#7fd3d2" />
        <Palm x={840} y={1060} h={480} lean={-90} trunk="#83603d" leaf="#46a165" leafD="#2f7a4b" />
        <g>
          {prints.map((p, i) => {
            const washed = swashOn && Math.min(front, 1290) < p.y + 12 && f > fOmbak;
            const o = washed ? lin(f, fOmbak + 4, fOmbak + 20, 0.55, 0) : 0.55;
            return <ellipse key={i} cx={p.x} cy={p.y} rx={11} ry={6} fill="#a8824e" opacity={o} />;
          })}
        </g>
        {swashOn && (
          <g clipPath="url(#s3isl)">
            <path d={`M0 ${front} ${Array.from({ length: 12 }, (_, i) => `Q${i * 90 + 45} ${front - 14 + wave(f, 6, 20, i * 7)} ${(i + 1) * 90} ${front}`).join(" ")} V1400 H0Z`}
              fill="#9fe3e6" opacity={0.85} />
            <path d={`M0 ${front} ${Array.from({ length: 12 }, (_, i) => `Q${i * 90 + 45} ${front - 14 + wave(f, 6, 20, i * 7)} ${(i + 1) * 90} ${front}`).join(" ")}`}
              stroke="#fff" strokeWidth={10} fill="none" strokeLinecap="round" />
          </g>
        )}
        {[0, 1, 2, 3].map((i) => {
          const t0 = fShout + 4 + i * 4;
          const tt = Math.max(0, f - t0);
          return <Gull key={i} x={640 + i * 70 + tt * (4 + i) + tt * tt * 0.03} y={930 - i * 40 - tt * (3 + i * 0.6) - tt * tt * 0.02} s={0.9 - i * 0.1} phase={i * 5} />;
        })}
        <AruSide x={xAt(f)} y={ground - 100 - (running ? Math.abs(Math.sin(ph)) * 10 * sp : 0)} s={1.15} mood={shout ? "shout" : f > runEnd ? "sad" : "calm"}
          pose={{
            lean: running ? 10 * sp : tween(f, runEnd - 10, runEnd + 20, 0, 14), head: shout ? -14 : f > runEnd ? 12 : 0,
            legF: [36 * sw, -14 - 30 * Math.max(0, Math.cos(ph)) * sp], legB: [-36 * sw, -14 - 30 * Math.max(0, -Math.cos(ph)) * sp],
            armB: [-40 * sw, 60], armF: shout ? [118, 74] : [40 * sw, 60],
          }} />
        {shout && (
          <g transform={`translate(${xAt(f) + 150} ${880})`} opacity={1 - lin(f, fHabis, fHabis + 14, 0, 1)}>
            {[0, 1, 2].map((i) => <path key={i} d={`M${i * 26} ${-30 - i * 10} q30 ${30 + i * 10} 0 ${60 + i * 20}`} stroke="#fff" strokeWidth={7} fill="none"
              strokeLinecap="round" opacity={0.5 + wave(f, 0.5, 8, i * 3)} transform={`translate(-50 -10)`} />)}
          </g>
        )}
      </Canvas>
      {[
        { t: "HOOOI!", at: fShout, x: 0.12 },
        { t: "Ada orang…?", at: fHabis - 10, x: 0.42 },
      ].map((b, i) => {
        const p = pop(f, b.at);
        const o = f < b.at ? 0 : 1 - lin(f, b.at + 30, b.at + 46, 0, 1);
        return <div key={i} style={{ position: "absolute", left: W * b.x, top: 470 + i * 140, fontFamily, fontWeight: 800, fontSize: 92, color: "#fff",
          textShadow: "0 6px 0 rgba(20,60,90,.45)", opacity: o, transform: `scale(${p}) rotate(${i ? 5 : -6}deg)` }}>{b.t}</div>;
      })}
      <Counter o={0.8} />
    </>
  );
};

// 4 — The first night: Aru hugs his knees by a small fire under a huge sky; the island shrinks
const Night: FC<SceneProps> = ({ words, lead, frames }) => {
  const f = useCurrentFrame();
  const fSepi = at(words, lead, "sepi", 1), fAda = at(words, lead, "kamu");
  const z = interpolate(f, [0, frames], [2.1, 0.92], { easing: Easing.inOut(Easing.sin) });
  const k = (z - 0.92) / 1.18;
  const ax = 520, ay = 1220;
  const shoot = lin(f, fSepi + 6, fSepi + 30, 0, 1);
  return (
    <>
      <Canvas>
        <Sky id="s4sky" stops={[[0, "#02040f"], [0.45, "#0a1534"], [0.6, "#1a2a55"]]} />
        <g opacity={0.55} transform="rotate(-28 540 600)">
          <ellipse cx={540} cy={600} rx={900} ry={120} fill="#3a4c8a" opacity={0.25} />
          {Array.from({ length: 140 }, (_, i) => (
            <circle key={i} cx={-360 + rand(i + 900) * 1800} cy={600 + (rand(i + 1200) - 0.5) * 240 * rand(i + 77)} r={1 + rand(i + 3) * 2.2} fill="#dfe6ff"
              opacity={0.4 + wave(f, 0.3, 50 + i % 30, i)} />
          ))}
        </g>
        <Stars n={170} opacity={1} maxY={1150} seed={40} />
        {shoot > 0 && shoot < 1 && (
          <path d={`M${860 - shoot * 600} ${200 + shoot * 260} l120 -52`} stroke="#fff" strokeWidth={4} strokeLinecap="round" opacity={Math.sin(shoot * Math.PI)} />
        )}
        <Cam z={z} cx={ax} cy={ay} dx={(540 - ax) * k} dy={(1040 - ay) * k}>
          <Sea id="s4sea" y={1160} top="#0d1d40" bottom="#030815" line="#6f8fd0" lineO={0.25} speed={0.5} />
          <ellipse cx={590} cy={1270} rx={200} ry={26} fill="#ff9a4a" opacity={0.12 + wave(f, 0.03, 7)} />
          <Island x={540} y={1250} rx={250} ry={55} sand="#3b3a55" wet="#26283f" shallow="#13284a" foamO={0.3} />
          <ellipse cx={590} cy={1240} rx={150} ry={30} fill="#ffb064" opacity={0.25 + wave(f, 0.05, 6)} />
          <Palm x={680} y={1236} h={290} lean={-50} trunk="#151a2e" leaf="#141c33" leafD="#0f1528" nut="#0d1222" />
          <Campfire x={600} y={1244} s={0.32} />
          <AruSide x={ax} y={ay} s={0.62} shade={0.3} mood="sad" pose={{
            lean: 20 + wave(f, 1.5, 90), head: 16, legF: [148, -140], legB: [142, -134], armF: [52, 62], armB: [60, 56],
          }} />
        </Cam>
        <Vignette o={0.7 + lin(f, fAda - 20, fAda + 20, 0, 0.3)} />
      </Canvas>
      <Counter o={0.75} />
    </>
  );
};

const scribble = (x: number, y: number, w: number, seed: number) => {
  let d = `M${x} ${y}`;
  for (let i = 1; i <= 10; i++) d += ` q${w / 20} ${-14 - rand(seed + i) * 12} ${w / 10} ${rand(seed + i * 3) * 8 - 4}`;
  return d;
};

// 5 — The bottle: Aru writes, seals and throws it; it floats toward us while the letter is read
const Letter: FC<SceneProps> = ({ words, lead, frames }) => {
  const f = useCurrentFrame();
  const fWrite = at(words, lead, "menulis"), fKalau = at(words, lead, "kalau"), fAku = at(words, lead, "aku"), fDatang = at(words, lead, "datanglah");
  const tRelease = fKalau + 6;
  const wind = tween(f, fKalau - 14, fKalau, 0, 1), fling = tween(f, fKalau, tRelease, 0, 1);
  const armA = 40 - wind * 190 + fling * 290;
  const paper = tween(f, fWrite - 34, fWrite - 18, 0, 1) * (1 - tween(f, fKalau - 26, fKalau - 14, 0, 1));
  const ax = 290, ay = 1190, s = 1.4;
  // flight: from hand to the sea
  const fl = lin(f, tRelease, tRelease + 22, 0, 1);
  const land = { x: 780, y: 1070 };
  const hx = 385, hy = 975;
  const flyX = hx + (land.x - hx) * fl, flyY = hy + (land.y - hy) * fl - Math.sin(fl * Math.PI) * 260;
  const floatT = interpolate(f, [tRelease + 30, frames], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.cubic) });
  const bx = land.x + (600 - land.x) * floatT, by = land.y + (1240 - land.y) * floatT + wave(f, 8, 34);
  const bs = 0.55 + floatT * 5.5;
  const splash = f - (tRelease + 22);
  const lines = [
    { t: "“Kalau ada yang", a: fKalau },
    { t: "menemukan ini…", a: fKalau + 18 },
    { t: "aku di sini.", a: fAku },
    { t: "Datanglah.”", a: fDatang },
  ];
  return (
    <>
      <Canvas>
        <Sky id="s5sky" stops={[[0, "#84c3ea"], [0.5, "#ffe2b4"]]} />
        <circle cx={860} cy={720} r={300} fill="url(#sunglow)" />
        <circle cx={860} cy={720} r={70} fill="#fff1c6" />
        <Cloud x={250 + f * 0.3} y={520} s={1} color="#fff" o={0.85} />
        <Sea id="s5sea" y={980} top="#76c6cf" bottom="#226f9b" line="#effcff" lineO={0.5} />
        <path d="M0 1170 Q300 1170 500 1290 Q680 1420 760 1920 L0 1920Z" fill="#c9a46a" />
        <path d="M0 1186 Q290 1186 484 1300 Q650 1420 730 1920 L0 1920Z" fill="#f3d9a2" />
        <path d="M0 1172 Q300 1172 500 1292 Q680 1422 760 1920" stroke="#fff" strokeWidth={8} fill="none" strokeDasharray="50 26" strokeDashoffset={-f * 2} opacity={0.8} />
        {splash >= 0 && splash < 50 && [0, 1].map((i) => (
          <ellipse key={i} cx={land.x} cy={land.y + 20} rx={20 + (splash - i * 8) * 3} ry={6 + (splash - i * 8)} fill="none" stroke="#fff" strokeWidth={4}
            opacity={Math.max(0, 1 - (splash - i * 8) / 40) * (splash > i * 8 ? 1 : 0)} />
        ))}
        <AruSide x={ax} y={ay} s={s} mood={f > tRelease + 10 ? "smile" : "calm"} pose={{
          lean: f < fKalau - 14 ? 8 : -6 * wind + 14 * fling, head: f < fKalau - 14 ? 14 : -6,
          armF: f < fKalau - 14 ? [62, 40] : f < tRelease + 16 ? [armA, 10] : [lin(f, tRelease + 16, tRelease + 40, 150, 155) + wave(f, 18, 18), 20],
          armB: f < fKalau - 14 ? [54, 46] : [-20 + fling * 20, 20],
          legF: [14 * fling, -4], legB: [-10, -4],
        }} hold={(hx2, hy2) => (f < tRelease ? <Bottle x={hx2} y={hy2 - 10} s={0.5} rot={armA - 180} letter={f > fKalau - 20} /> : null)} />
        {f >= tRelease && floatT === 0 && fl < 1 && <Bottle x={flyX} y={flyY} s={0.5} rot={fl * 400} />}
        {fl >= 1 && <Bottle x={bx} y={by} s={bs} rot={60 + wave(f, 10, 40)} />}
        {fl >= 1 && <ellipse cx={bx} cy={by + 20 * bs} rx={50 * bs} ry={8 * bs} fill="#fff" opacity={0.25} />}
      </Canvas>
      {paper > 0 && (
        <AbsoluteFill style={{ alignItems: "center", paddingTop: 240, opacity: paper }}>
          <svg width={720} height={460} viewBox="0 0 720 460" style={{ transform: `rotate(-3deg) scale(${0.9 + paper * 0.1})` }}>
            <path d="M20 20 L700 10 L690 440 L30 450Z" fill="#f6e7c6" stroke="#cdb184" strokeWidth={6} />
            {[0, 1, 2, 3].map((i) => {
              const rev = tween(f, fWrite - 14 + i * 8, fWrite - 4 + i * 8, 0, 1);
              return <path key={i} d={scribble(70, 110 + i * 80, i === 3 ? 260 : 560, i * 31)} stroke="#2b2622" strokeWidth={8} fill="none" strokeLinecap="round"
                pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - rev} />;
            })}
          </svg>
        </AbsoluteFill>
      )}
      {lines.map((l, i) => {
        const o = tween(f, l.a - 2, l.a + 10, 0, 1);
        return <div key={i} style={{ position: "absolute", left: 40, right: 40, top: 220 + i * 96, textAlign: "center", fontFamily, fontWeight: 800,
          fontSize: i === 3 ? 92 : 74, whiteSpace: "nowrap", color: "#3b2a1c", opacity: o, transform: `translateY(${(1 - o) * 16}px) rotate(-2deg)`,
          textShadow: "0 0 18px rgba(255,248,225,.95), 0 0 6px rgba(255,248,225,.9)" }}>{l.t}</div>;
      })}
      <Counter o={0.8} />
    </>
  );
};

/** Deterministic crack lines from the impact point. */
const CRACKS = Array.from({ length: 11 }, (_, i) => {
  const a = (i / 11) * Math.PI * 2 + rand(i) * 0.4;
  let x = 0, y = 0, d = "M0 0";
  const L = 260 + rand(i + 20) * 520;
  for (let j = 1; j <= 6; j++) {
    const r = (L / 6) * j, jit = (rand(i * 7 + j) - 0.5) * 0.5;
    x = Math.cos(a + jit) * r; y = Math.sin(a + jit) * r;
    d += ` L${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return d;
});

// 6 — The bottle hits the screen; the glass cracks; the letter unrolls to the viewer
const Arrive: FC<SceneProps> = ({ words, lead }) => {
  const f = useCurrentFrame();
  const hit = 20;
  const fSampai = at(words, lead, "sampai");
  const shake = f > hit && f < hit + 14 ? wave(f, 14 * (1 - (f - hit) / 14), 3) : 0;
  const bs = interpolate(f, [0, hit], [5.5, 13], { extrapolateRight: "clamp", easing: Easing.in(Easing.quad) });
  const crack = tween(f, hit, hit + 12, 0, 1);
  const open = tween(f, hit + 12, fSampai + 8, 0, 1);
  const ph = 780 * open;
  const cy = 820;
  const textLines = ["Kalau kamu", "membaca ini,", "kamu sudah", "menemukanku."];
  return (
    <>
      <AbsoluteFill style={{ transform: `translate(${shake}px, ${shake * 0.6}px)` }}>
        <Canvas>
          <Sky id="s6sky" stops={[[0, "#0f3f63"], [0.5, "#1c6f8f"], [1, "#0b2b45"]]} />
          {Array.from({ length: 26 }, (_, i) => {
            const t = ((f * (0.6 + rand(i) * 0.8) + rand(i + 4) * 2000) % 2000) / 2000;
            return <circle key={i} cx={rand(i + 10) * W + wave(f, 12, 50, i * 9)} cy={H - t * H} r={4 + rand(i + 2) * 10} fill="none" stroke="#cdf4ff"
              strokeWidth={2} opacity={0.35} />;
          })}
          {Array.from({ length: 7 }, (_, i) => (
            <path key={`r${i}`} d={`M${-100 + i * 180 + wave(f, 40, 90, i * 13)} 0 L${100 + i * 180 + wave(f, 60, 110, i * 7)} ${H}`} stroke="#bff0ff"
              strokeOpacity={0.06} strokeWidth={70} />
          ))}
          {f < hit + 2 && <Bottle x={560} y={820} s={bs} rot={60 - f * 1.2} />}
          {open > 0 && (
            <g transform={`translate(540 ${cy}) rotate(${wave(f, 1.2, 80)})`}>
              <rect x={-380} y={-ph / 2} width={760} height={ph} fill="#f5e4bf" />
              <rect x={-380} y={-ph / 2} width={760} height={ph} fill="none" stroke="#caa774" strokeWidth={5} />
              <rect x={-400} y={-ph / 2 - 30} width={800} height={50} rx={25} fill="#e6cf9e" stroke="#b38b57" strokeWidth={4} />
              <rect x={-400} y={ph / 2 - 20} width={800} height={50} rx={25} fill="#e6cf9e" stroke="#b38b57" strokeWidth={4} />
            </g>
          )}
          {f >= hit && (
            <g transform="translate(560 820)" opacity={0.75}>
              {CRACKS.map((d, i) => <path key={i} d={d} stroke="#fff" strokeWidth={3} fill="none" pathLength={1} strokeDasharray="1 1"
                strokeDashoffset={1 - crack} strokeLinejoin="bevel" />)}
              {[90, 190].map((r, i) => <circle key={i} r={r} fill="none" stroke="#fff" strokeWidth={2} strokeDasharray="30 50" opacity={crack * 0.7} />)}
              <circle r={26} fill="#fff" opacity={0.5 * crack} />
            </g>
          )}
          <Vignette o={0.6} />
        </Canvas>
        {open > 0.6 && textLines.map((t, i) => {
          const o = tween(f, fSampai - 6 + i * 7, fSampai + 6 + i * 7, 0, 1);
          return <div key={i} style={{ position: "absolute", left: 0, right: 0, top: cy - 300 + i * 140, textAlign: "center", fontFamily, fontWeight: 800,
            fontSize: 92, color: "#33261b", opacity: o, transform: `rotate(${-2 + wave(f, 1.2, 80)}deg) translateY(${(1 - o) * 14}px)` }}>{t}</div>;
        })}
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "#fff", opacity: f < hit ? 0 : 1 - lin(f, hit, hit + 14, 0, 1) }} />
    </>
  );
};

const GHOSTS = Array.from({ length: 22 }, (_, i) => {
  const t = i / 21;
  return { x: 110 + t * 860 + (rand(i + 40) - 0.5) * 40, y: 640 - Math.sin(t * Math.PI) * 260 + (i % 2) * 90 + (rand(i + 60) - 0.5) * 30, s: 0.8 + rand(i + 80) * 0.5 };
});
const CHOSEN = [7, 14];

// 7 — The invitation: Aru on his unfinished jetty, waving at us; future residents appear; two are chosen
const Invite: FC<SceneProps> = ({ words, lead, frames }) => {
  const f = useCurrentFrame();
  const fWarga = at(words, lead, "warganya"), fDua = at(words, lead, "dua");
  const beat = Math.max(0, Math.sin((f / 26) * Math.PI)) ** 6;
  const big = Math.max(0, 1 - Math.abs(f - fWarga - 4) / 14);
  const plank = (t: number) => ({ y: 1050 + t * 330, w: 110 + t * 300 });
  return (
    <>
      <Canvas>
        <Sky id="s7sky" stops={[[0, "#6aa6d6"], [0.3, "#f3c98c"], [0.45, "#f9d59a"]]} />
        <circle cx={830} cy={820} r={340} fill="url(#sunglow)" />
        <circle cx={830} cy={830} r={84} fill="#fff0c0" />
        <Cloud x={200 + f * 0.3} y={360} s={1} color="#ffe7c4" o={0.7} />
        <Sea id="s7sea" y={870} top="#f2bd84" bottom="#2c7895" line="#fff1d0" lineO={0.5} />
        <rect x={770} y={872} width={120} height={500} fill="#fff0c0" opacity={0.15} />
        <Island x={540} y={1000} rx={330} ry={70} sand="#f1cf92" wet="#c99d62" shallow="#8bc9bd" />
        <Palm x={700} y={995} h={330} lean={-60} trunk="#7b5636" leaf="#3f8a5a" leafD="#2f6d48" />
        {/* posts: finished section, then bare unfinished posts */}
        {Array.from({ length: 9 }, (_, i) => {
          const t = i / 8; const p = plank(t * 1.4);
          return [-1, 1].map((sd) => <rect key={`${i}${sd}`} x={540 + sd * p.w / 2 - 6 - t * 6} y={p.y - 6} width={12 + t * 12} height={60 + t * 130} fill="#5b3c25" />);
        })}
        {Array.from({ length: 14 }, (_, i) => {
          const t0 = i / 14, t1 = (i + 0.78) / 14;
          const a = plank(t0), b = plank(t1);
          return <path key={i} d={`M${540 - a.w / 2} ${a.y} L${540 + a.w / 2} ${a.y} L${540 + b.w / 2} ${b.y} L${540 - b.w / 2} ${b.y}Z`} fill={i % 3 ? "#a97a4c" : "#9a6d42"} />;
        })}
        {[0, 1].map((i) => <rect key={i} x={260 + i * 16} y={1300 - i * 22} width={160} height={20} rx={5} fill="#b2835a" transform={`rotate(${-8 + i * 12} 340 1300)`} />)}
        {GHOSTS.map((g, i) => {
          const app = tween(f, 14 + i * 3, 26 + i * 3, 0, 1);
          const chosen = CHOSEN.includes(i);
          const hi = chosen ? pop(f, fDua) : 0;
          const dim = f > fDua ? (chosen ? 1 : 0.45) : 1;
          const sc = g.s * (1 + hi * 0.7);
          const col = chosen && f > fDua ? "#ffd56a" : "#eaf4ff";
          return (
            <g key={i} transform={`translate(${g.x} ${g.y + wave(f, 6, 60, i * 9)}) scale(${sc * app})`} opacity={app * dim * (0.75 + wave(f, 0.2, 40, i * 5))}>
              {chosen && f > fDua && <circle r={60} fill="url(#sunglow)" opacity={0.9} />}
              <circle cy={-22} r={12} fill={col} /><path d="M-18 14 Q-18 -6 0 -6 Q18 -6 18 14Z" fill={col} />
            </g>
          );
        })}
        <AruFront x={540} y={1250} s={1.25} mood="smile" bob={wave(f, 3, 50)}
          armR={[158 + wave(f, 8, 16), 18 + wave(f, 22, 16, 4)]} armL={[14, 8]} />
      </Canvas>
      <Counter o={1} pulse={Math.max(beat * 0.5, big)} />
    </>
  );
};

// 8 — The question: Aru plants a blank sign; "What is its name?"; the counter flips 1 → 2; dark
const Name: FC<SceneProps> = ({ words, lead, frames }) => {
  const f = useCurrentFrame();
  const fKom = at(words, lead, "komentar"), fBesok = at(words, lead, "besok"), fSendiri = at(words, lead, "sendirian");
  const slam = 16;
  const lift = f < slam ? -110 * Math.sin((f / slam) * Math.PI * 0.5) * (1 - f / slam) - 60 * (1 - f / slam) : 0;
  const thud = f > slam ? Math.max(0, 1 - (f - slam) / 6) : 0;
  const flip = tween(f, fSendiri, fSendiri + 12, 0, 1);
  const dark = lin(f, frames - 56, frames - 12, 0, 0.94);
  const t1 = pop(f, fKom), t2 = pop(f, fBesok - 10);
  const signX = 690, ground = 1330;
  return (
    <>
      <AbsoluteFill style={{ transform: `translateY(${thud * 8}px)` }}>
        <Canvas>
          <Sky id="s8sky" stops={[[0, "#2b2a5c"], [0.35, "#c9677a"], [0.52, "#f7b067"]]} />
          <circle cx={540} cy={1000} r={330} fill="url(#sunglow)" />
          <circle cx={540} cy={1000 + f * 0.25} r={130} fill="#ffb15e" />
          <Stars n={30} opacity={lin(f, 60, frames, 0.1, 0.8)} maxY={600} seed={300} />
          <Sea id="s8sea" y={1000} top="#e48a64" bottom="#3c3661" line="#ffd9b0" lineO={0.45} />
          <rect x={470} y={1002} width={140} height={300} fill="#ffcf8a" opacity={0.2} />
          <path d={`M-40 ${ground - 80} Q540 ${ground - 170} 1120 ${ground - 60} L1120 ${H} L-40 ${H}Z`} fill="#d9a873" />
          <path d={`M-40 ${ground - 60} Q540 ${ground - 150} 1120 ${ground - 40} L1120 ${H} L-40 ${H}Z`} fill="#e9bd85" />
          {Array.from({ length: 6 }, (_, i) => {
            const t = Math.max(0, f - slam);
            return <circle key={i} cx={signX + (i - 2.5) * (18 + t * 3)} cy={ground - 6 - t * (1 + rand(i) * 1.5)} r={10 + t * 1.2} fill="#f3d5a8"
              opacity={f > slam ? Math.max(0, 0.8 - t / 24) : 0} />;
          })}
          <g transform={`translate(${signX} ${ground + lift}) rotate(${-3 + (f < slam ? -6 : 0)})`}>
            <rect x={-14} y={-330} width={28} height={340} fill="#7a5233" />
            <rect x={-170} y={-420} width={340} height={190} rx={14} fill="#b98654" stroke="#7a5233" strokeWidth={8} />
            <path d="M-162 -358 H162 M-162 -296 H162" stroke="#7a5233" strokeWidth={5} opacity={0.6} />
            {[[-140, -392], [140, -392], [-140, -258], [140, -258]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={7} fill="#4d3320" />)}
          </g>
          <AruFront x={420} y={ground - 108} s={1.2} mood={f > fSendiri ? "smile" : "calm"} look={f > fKom ? 6 : 10} bob={wave(f, 3, 50)}
            armR={f < slam + 10 ? [118, -40] : [lin(f, slam + 10, slam + 24, 118, 60), -10]} armL={[14 + wave(f, 3, 50), 10]} />
        </Canvas>
        <Caption text="Pulau ini belum" top={260} size={84} o={Math.min(1, t1)} s={t1} />
        <Caption text="punya nama." top={352} size={84} o={Math.min(1, t1)} s={t1} />
        <Caption text="Apa namanya?" top={480} size={136} o={Math.min(1, t2)} s={t2} color="#ffd56a" />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "#000", opacity: dark }} />
      <Counter flip={flip} s={1.15} pulse={Math.max(0, 1 - Math.abs(f - fSendiri - 10) / 18)} o={1 - lin(f, frames - 14, frames - 4, 0, 1)} />
    </>
  );
};

export const scenes = [Hook, Wake, Search, Night, Letter, Arrive, Invite, Name];
