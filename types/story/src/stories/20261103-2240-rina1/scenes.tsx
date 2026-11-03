import type { FC, ReactNode } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import type { SceneProps } from "../../lib/Story";
import { rand, tween, wave } from "../../lib/kit";
import {
  Birds, C, Canvas, Folders, Grass, H, Ibu, IndoMap, Label, MAP_POS, Office, Palm, PhoneStage, Rina, Sari, Savanna, Screen, Sea, Ship, Sky, StiltHouse, W, at, fontFamily,
  type At, type Shot,
} from "./parts";

/** Cross-fade helper: 0 before frame a, 1 after a + d. */
const step = (f: number, a: number, d = 10) => interpolate(f, [a, a + d], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

/** A real app scene: the phone on its stage, the captures inside, optional pill label and overlay drawn over the stage. */
const App: FC<SceneProps & { shots: Shot[]; mood?: "night" | "day" | "warm"; pill?: { text: string; from: At; to?: At }; over?: (f: number) => ReactNode }> = ({
  frames, words, lead, shots, mood = "day", pill, over,
}) => {
  const f = useCurrentFrame();
  let pillO = 0;
  if (pill) {
    const a = at(pill.from, frames, words, lead), b = pill.to === undefined ? frames + 99 : at(pill.to, frames, words, lead);
    pillO = step(f, a, 10) * (1 - step(f, b, 10));
  }
  return (
    <PhoneStage mood={mood} pill={pill && { text: pill.text, opacity: pillO }} over={over?.(f)}>
      <Screen shots={shots} frames={frames} words={words} lead={lead} />
    </PhoneStage>
  );
};

/** A place pin beside the phone (illustration, not app data). */
const Pin: FC<{ name: string; x: number; y: number; o: number; f: number; i: number; left?: boolean }> = ({ name, x, y, o, f, i, left }) =>
  o <= 0 ? null : (
    <div style={{ position: "absolute", left: x, top: y + wave(f, 6, 70, i * 20), transform: `translate(-50%,-50%) scale(${0.6 + o * 0.4}) rotate(${left ? -5 : 5}deg)`, opacity: o,
      fontFamily, fontWeight: 800, fontSize: 30, color: "#1b1b1f", background: "#fff", padding: "6px 16px", borderRadius: 32, boxShadow: "0 10px 24px rgba(0,0,0,.18)", whiteSpace: "nowrap" }}>
      <span style={{ color: "#e2483d" }}>●</span> {name}
    </div>
  );

// ───────────────────────── Act 1 · Jakarta at night ─────────────────────────

// 1 — Bu Rina at her desk at night; the folders on the desk all come from the same city
const Desk: FC<SceneProps> = ({ frames, words, lead }) => {
  const f = useCurrentFrame();
  const lift = at({ w: "berkas", f: 0.5 }, frames, words, lead);
  const same = at({ w: "sama", f: 0.85 }, frames, words, lead);
  const city = at({ w: "Jakarta", f: 0.25 }, frames, words, lead);
  const up = tween(f, lift, lift + 24, 0, 1) * (1 - tween(f, same + 30, same + 54, 0, 1));
  const push = interpolate(f, [0, frames], [1.08, 1]);
  return (
    <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: "50% 60%" }}>
      <Canvas>
        <Office mood="night" behind={<Rina x={330} y={1650} s={2.05} pose="sit" mood={f > same ? "sad" : "calm"} look={f > lift ? 4 : 0} />}>
          <Folders x={790} y={1232} n={10} s={1.25} lift={up} />
          {[0, 1, 2].map((i) => {
            const o = step(f, same - 6 + i * 6, 8);
            return o <= 0 ? null : (
              <g key={i} opacity={o} transform={`translate(${640 + i * 130} ${860 - i * 50 + wave(f, 5, 60, i * 15)}) rotate(${-8 + i * 8})`}>
                <rect x={-80} y={-30} width={160} height={52} rx={10} fill="#fffaf0" stroke="#7a2f2a" strokeWidth={4} />
                <text x={0} y={6} textAnchor="middle" fontSize={30} fontWeight={800} fill="#7a2f2a" fontFamily={fontFamily}>JAKARTA</text>
              </g>
            );
          })}
        </Office>
      </Canvas>
      <Label x={540} y={170} size={56} opacity={step(f, city - 4, 12)}>Jakarta, malam</Label>
    </AbsoluteFill>
  );
};

// ───────────────────────── Act 2 · the company portal (real captures) ─────────────────────────

const ROW = (y: number) => ({ x: 35, y, w: 320, h: 90 });
const PINS2 = ["Aceh", "Pontianak", "Makassar", "Papua"];

// 2 — the Pelamar tab of Bank Sejahtera, then the Staf Akuntansi filter; place pins beside the phone on "seluruh Indonesia"
const List: FC<SceneProps> = (p) => {
  const { frames, words, lead } = p;
  return (
    <App {...p} shots={[
      { src: "s02-list.png", from: 0, marks: [{ x: 86, y: 784, w: 72, h: 48, at: { w: "stand", off: -4, f: 0.2 }, until: { w: "Pelamar", off: -6, f: 0.45 } },
        { ...ROW(397), at: { w: "Pelamar", f: 0.5 } }, { ...ROW(492), at: { w: "Pelamar", off: 5, f: 0.52 } }, { ...ROW(588), at: { w: "Pelamar", off: 10, f: 0.54 } }, { ...ROW(684), at: { w: "Pelamar", off: 15, f: 0.56 } }] },
      { src: "s02-job.png", from: { w: "seluruh", off: 6, f: 0.75 }, marks: [{ x: 35, y: 155, w: 320, h: 40, at: { w: "Indonesia", f: 0.82 } }] },
    ]}
      over={(f) => (
        <>
          {PINS2.map((name, i) => {
            const a = at({ w: "seluruh", off: i * 5, f: 0.7 }, frames, words, lead);
            const left = i % 2 === 0;
            return <Pin key={name} name={name} i={i} f={f} left={left} o={step(f, a - 4, 8)} x={left ? 124 : 956} y={330 + i * 240} />;
          })}
        </>
      )} />
  );
};

// 3 — one name: the province filter leaves Sari from NTT; her detail, Domisili Sumba Timur, the honest experience
const Detail: FC<SceneProps> = (p) => (
  <App {...p} shots={[
    { src: "s03-ntt.png", from: 0, marks: [{ x: 199, y: 250, w: 156, h: 40, at: 0.03 }, { ...ROW(397), at: { w: "berhenti", off: -10, f: 0.15 } }], tap: { x: 195, y: 440, at: { w: "berhenti", off: 4, f: 0.18 } } },
    { src: "s03-top.png", from: { w: "berhenti", off: 12, f: 0.22 }, marks: [{ x: 35, y: 154, w: 320, h: 64, at: { w: "Sari", off: -2, f: 0.3 } }] },
    { src: "s03-facts.png", from: { w: "Sumba", off: -8, f: 0.45 }, marks: [
      { x: 35, y: 134, w: 321, h: 21, at: { w: "Sumba", off: 2, f: 0.48 } },
      { x: 35, y: 326, w: 321, h: 105, at: { w: "Pengalamannya", off: 2, f: 0.65 } },
    ] },
  ]} />
);

// 4 — shortlist, then the interview invitation by video call; no boat needed
const Invite: FC<SceneProps> = (p) => {
  const { frames, words, lead } = p;
  return (
    <App {...p} shots={[
      { src: "s03-top.png", from: 0, tap: { x: 113, y: 469, at: 0.05 } },
      { src: "s04-short.png", from: { w: "kirim", off: -8, f: 0.1 }, marks: [{ x: 35, y: 449, w: 156, h: 40, at: { w: "kirim", off: -6, f: 0.12 } }] },
      { src: "s04-form.png", from: { w: "wawancara", off: -6, f: 0.3 }, marks: [{ x: 47, y: 210, w: 296, h: 36, at: { w: "video", off: -2, f: 0.5 } }], tap: { x: 195, y: 428, at: { w: "supaya", off: 2, f: 0.62 } } },
      { src: "s04-sent.png", from: { w: "supaya", off: 10, f: 0.66 }, marks: [{ x: 98, y: 690, w: 195, h: 58, at: { w: "supaya", off: 14, f: 0.68 } }, { x: 35, y: 98, w: 320, h: 51, at: { w: "laut", off: -10, f: 0.85 } }] },
    ]}
      over={(f) => {
        const a = at({ w: "menyeberang", off: -4, f: 0.8 }, frames, words, lead);
        const o = step(f, a, 10), x = step(f, a + 14, 10);
        if (o <= 0) return null;
        return (
          <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" style={{ position: "absolute" }}>
            <g opacity={o} transform={`translate(960 ${1060 + wave(f, 6, 50)})`}>
              <circle r={92} fill="#fff" stroke="#1b1b1f" strokeWidth={4} />
              <path d="M-80 36 Q-40 24 0 36 T80 36 V70 H-80Z" fill="#7cc4e0" />
              <Ship x={0} y={30} s={0.34} />
              <path d={`M-62 -62 L${-62 + 124 * x} ${-62 + 124 * x}`} stroke="#e2483d" strokeWidth={12} strokeLinecap="round" />
            </g>
          </svg>
        );
      }} />
  );
};

// 5 — the in-app video call: real CallScreen, the remote picture is the drawn placeholder of Sari
const CALL_FRAMES = 300; // s05-call.mp4 is about 10 s
const Call: FC<SceneProps> = (p) => {
  const { frames } = p;
  const shots: Shot[] = [{ src: "s05-call.mp4", from: 0, video: {}, marks: [{ x: 160, y: 711, w: 70, h: 28, at: { w: "runtut", off: -2, f: 0.6 } }] }];
  // a longer narration than the recording: rest on the call's last frame instead of an empty screen
  if (frames > CALL_FRAMES - 6) shots.push({ src: "s05-call-end.png", from: (CALL_FRAMES - 10) / frames });
  return <App {...p} shots={shots} />;
};

// ───────────────────────── Act 3 · the turn, dusk to gold ─────────────────────────

const FAINT = ["Aceh", "Medan", "Pontianak", "Surabaya", "Makassar", "Papua"];
// 6 — Bu Rina at the wall map: Kupang, Sumba next door; the dots everywhere she never knew how to find
const MapScene: FC<SceneProps> = ({ frames, words, lead }) => {
  const f = useCurrentFrame();
  const kup = at({ w: "Kupang", f: 0.2 }, frames, words, lead);
  const area = at({ w: "daerahnya", f: 0.45 }, frames, words, lead);
  const sel = at({ w: "Selama", f: 0.6 }, frames, words, lead);
  const find = at({ w: "menemukannya", f: 0.9 }, frames, words, lead);
  const MX = 50, MY = 400, MS = 0.96;
  const pt = (n: string) => [MX + MAP_POS[n][0] * MS, MY + MAP_POS[n][1] * MS] as const;
  const [kx, ky] = pt("Kupang"), [sx, sy] = pt("Sumba Timur");
  const reach = step(f, kup - 20, 16);
  const drop = tween(f, kup, kup + 12, 0, 1);
  const line = tween(f, area, area + 20, 0, 1);
  return (
    <>
    <Canvas>
      <rect width={W} height={H} fill="#e9dcc6" />
      <rect y={0} width={W} height={20} fill="#cdb894" />
      <rect y={1380} width={W} height={H - 1380} fill="#8a6a4a" />
      <IndoMap x={MX} y={MY} s={MS} />
      {/* the other cities: faint until "menemukannya" */}
      {FAINT.map((n, i) => {
        const [x, y] = pt(n);
        const o = step(f, sel + i * 4, 10) * 0.35 + step(f, find + i * 3, 8) * 0.65;
        return o <= 0 ? null : (
          <g key={n} opacity={o} transform={`translate(${x} ${y})`}>
            <circle r={14 + 10 * step(f, find + i * 3, 8) * Math.abs(Math.sin((f - find) / 9))} fill="none" stroke="#e2483d" strokeWidth={3} opacity={0.6} />
            <circle r={9} fill="#e2483d" />
          </g>
        );
      })}
      {/* Sumba and Kupang linked */}
      {line > 0 && <path d={`M${sx} ${sy} Q${(sx + kx) / 2} ${sy - 50} ${kx} ${ky}`} stroke="#c7362f" strokeWidth={5} strokeDasharray="12 10" fill="none" pathLength={1} strokeDashoffset={0} opacity={line} />}
      {line > 0 && (
        <g opacity={line} transform={`translate(${sx} ${sy})`}>
          <circle r={10} fill="#2f5fd0" />
          <text x={-10} y={46} fontFamily={fontFamily} fontWeight={800} fontSize={30} fill="#22479f" textAnchor="middle">Sumba Timur</text>
        </g>
      )}
      {f >= kup && (
        <g transform={`translate(${kx} ${ky - (1 - drop) * 120})`}>
          <path d="M0 0 C-22 -30 -22 -60 0 -62 C22 -60 22 -30 0 0Z" fill="#e2483d" stroke="#7a1f1a" strokeWidth={3} />
          <circle cy={-40} r={8} fill="#fff" />
          <text x={34} y={-38} fontFamily={fontFamily} fontWeight={800} fontSize={40} fill="#7a1f1a" opacity={drop}>Kupang</text>
        </g>
      )}
      <Rina x={880} y={1700} s={2.0} pose={f > kup - 20 && f < area + 30 ? "point" : "stand"} reach={reach} mood={f > find ? "smile" : "calm"} flip />
    </Canvas>
    <Label x={540} y={250} size={56} color="#3b2a1e" opacity={step(f, 4, 12)}>Cabang Kupang</Label>
    </>
  );
};

// 7 — Friday afternoon: the status becomes Diterima; a little confetti outside the phone
const Accept: FC<SceneProps> = (p) => {
  const { frames, words, lead } = p;
  return (
    <App {...p} mood="warm" pill={{ text: "Jumat sore", from: 0, to: { w: "aku", f: 0.3 } }} shots={[
      { src: "s07-before.png", from: 0, marks: [{ x: 199, y: 449, w: 156, h: 40, at: 0.05, until: { w: "ubah", off: -4, f: 0.3 } }], tap: { x: 113, y: 565, at: { w: "statusnya", off: -2, f: 0.4 } } },
      { src: "s07-after.png", from: { w: "statusnya", off: 6, f: 0.45 }, marks: [{ x: 35, y: 545, w: 156, h: 40, at: { w: "Diterima", off: -4, f: 0.55 } }] },
      { src: "s07-list.png", from: { w: "Diterima", off: 26, f: 0.75 }, marks: [{ x: 106, y: 740, w: 66, h: 22, at: { w: "Diterima", off: 32, f: 0.8 } }] },
    ]}
      over={(f) => {
        const a = at({ w: "Diterima", f: 0.55 }, frames, words, lead);
        if (f < a) return null;
        return (
          <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" style={{ position: "absolute" }}>
            {Array.from({ length: 36 }, (_, i) => {
              const t = (f - a) / 30;
              const side = i % 2 ? 1 : -1;
              const x = 540 + side * (330 + rand(i) * 160) + side * t * 40 * rand(i + 5);
              const y = 300 + rand(i + 9) * 600 - 260 * Math.max(0, 1 - t) * rand(i + 2) + t * t * 160;
              const col = ["#FFF000", "#e2483d", "#2f5fd0", "#3bb273", "#ffffff"][i % 5];
              return <rect key={i} x={x} y={y} width={14} height={22} rx={3} fill={col} transform={`rotate(${f * 6 * (rand(i + 1) - 0.5) + i * 20} ${x + 7} ${y + 11})`} opacity={Math.max(0, 1 - t / 3)} />;
            })}
          </svg>
        );
      }} />
  );
};

// 8 — split screen: Rina smiling in Jakarta / Sari and Ibu hugging in Sumba at sunrise; then the end card
const Split: FC<SceneProps> = ({ frames, words, lead }) => {
  const f = useCurrentFrame();
  const card = at({ w: "bahagia", off: 18, f: 0.82 }, frames, words, lead);
  const end = step(f, card, 18);
  const open = tween(f, 0, 30, 0, 1);
  const hug = at({ w: "keluarga", f: 0.65 }, frames, words, lead);
  const rise = tween(f, 0, card, 1300, 1150);
  const mid = 958;
  return (
    <>
      <Canvas>
        <defs>
          <clipPath id="top8"><rect x={0} y={0} width={W} height={mid} /></clipPath>
          <clipPath id="bot8"><rect x={0} y={mid} width={W} height={H - mid} /></clipPath>
        </defs>
        {/* Jakarta, golden hour */}
        <g clipPath="url(#top8)">
          <g transform={`translate(0 ${-360 - (1 - open) * 40})`}>
            <Office mood="gold" lamp={0.5} behind={<Rina x={470} y={1650} s={1.95} pose="sit" mood={f > at({ w: "Tapi", f: 0.3 }, frames, words, lead) ? "smile" : "calm"} />} />
          </g>
        </g>
        {/* Sumba, sunrise */}
        <g clipPath="url(#bot8)">
          <Sky id="s8" top="#f19a3e" mid="#ffcf73" bottom="#fff0c4" h={H} />
          <circle cx={540} cy={rise} r={300} fill="url(#sunGlow)" />
          <circle cx={540} cy={rise} r={90} fill="#fff1c0" />
          <Sea y={1250} color="#e2a24a" shine="#fff1c0" h={120} />
          <Savanna y={1300} back="#c79b4e" front="#a8803d" />
          <Palm x={110} y={1440} s={0.9} color="#5a4123" />
          <StiltHouse x={860} y={1440} s={0.6} lit={0.3} />
          <Birds n={4} y={1060} color="#7a4a1e" />
          <g transform={`translate(0 ${wave(f, 2, 90)})`}>
            <g transform={`rotate(${-9 * step(f, hug - 10, 16)} 590 1440)`}><Sari x={590} y={1440} s={0.95} pose={f > hug - 10 ? "hug" : "stand"} mood="hope" /></g>
            <g transform={`rotate(${6 * step(f, hug - 10, 16)} 450 1440)`}><Ibu x={450} y={1440} s={1} pose={f > hug - 10 ? "hug" : "stand"} mood={f > hug ? "cry" : "smile"} /></g>
          </g>
          <rect y={1436} width={W} height={H - 1436} fill="#8f6b33" />
          <Grass y={1446} color="#b08a45" n={50} h={60} />
        </g>
        {/* the sea between them */}
        <rect x={0} y={mid - 8} width={W} height={16} fill="#fff6d8" />
        <path d={`M0 ${mid} Q270 ${mid - 12 + wave(f, 6, 60)} 540 ${mid} T${W} ${mid}`} stroke="#e8b45a" strokeWidth={6} fill="none" />
      </Canvas>
      <Label x={190} y={90} size={46} opacity={step(f, 6, 12)}>Jakarta</Label>
      <Label x={230} y={mid + 70} size={46} color="#5a3410" opacity={step(f, 14, 12)}>Sumba Timur</Label>
      {end > 0 && (
        <AbsoluteFill style={{ background: "#000", opacity: end, alignItems: "center" }}>
          <div style={{ marginTop: 420, display: "flex", flexDirection: "column", alignItems: "center", gap: 46, transform: `translateY(${(1 - end) * 30}px)` }}>
            <div style={{ fontFamily, fontWeight: 800, fontSize: 66, color: "#fff", textAlign: "center", lineHeight: 1.15, maxWidth: 900 }}>
              Temukan talenta<br />dari seluruh Indonesia.
            </div>
            <div style={{ fontFamily, fontWeight: 800, fontSize: 104, color: C.yellow, letterSpacing: -1, opacity: step(f, card + 20, 14) }}>jobfair.co.id</div>
            <div style={{ width: 160, height: 10, borderRadius: 5, background: C.yellow, opacity: step(f, card + 30, 14), transform: `scaleX(${step(f, card + 30, 20)})` }} />
          </div>
        </AbsoluteFill>
      )}
    </>
  );
};

export const scenes = [Desk, List, Detail, Invite, Call, MapScene, Accept, Split];
