import type { FC } from "react";
import { AbsoluteFill, interpolate, interpolateColors, useCurrentFrame } from "remotion";
import type { SceneProps } from "../../lib/Story";
import { rand, tween, wave } from "../../lib/kit";
import {
  Birds, C, Canvas, Chat, Grass, H, Ibu, Label, Palm, PhoneStage, Rooster, Sari, Savanna, Screen, Sea, Ship, Sky, StiltHouse, W, Wok, at, fontFamily,
  type At, type Shot,
} from "./parts";

/** Cross-fade helper: 0 before frame a, 1 after a + d. */
const step = (f: number, a: number, d = 10) => interpolate(f, [a, a + d], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

// ───────────────────────── Act 1 · grey-blue dawn ─────────────────────────

// 1 — dawn in Sumba Timur: the rooster, Ibu frying pisang goreng; then inside, the diploma in its plastic folder on the cupboard
const Dawn: FC<SceneProps> = ({ frames, words, lead }) => {
  const f = useCurrentFrame();
  const cut = at({ w: "Ijazah", off: -8, f: 0.45 }, frames, words, lead);
  const inside = step(f, cut, 14);
  const crow = f < 70 ? Math.max(0, Math.sin(((f - 8) / 50) * Math.PI)) : 0;
  const push = tween(f, 0, cut, 1, 1.1);
  const light = tween(f, 0, frames, 0, 1);
  return (
    <>
      <Canvas>
        <g opacity={1 - inside}>
          <g transform={`translate(${540 - 540 * push} ${1300 - 1300 * push}) scale(${push})`}>
            <Sky id="s1" top={interpolateColors(light, [0, 1], ["#344466", "#4d6390"])} mid="#8ea0bf" bottom="#e7c3a6" h={1000} />
            <circle cx={820} cy={980} r={70} fill="#ffe2b8" opacity={0.5 + light * 0.3} />
            <circle cx={820} cy={980} r={260} fill="url(#sunGlow)" opacity={0.35 + light * 0.25} />
            <Sea y={980} color="#4b6585" shine="#c9d6ea" h={120} />
            <Savanna y={1060} back="#6f7a62" front="#59634f" />
            <Palm x={110} y={1260} s={1.3} color="#2f3a33" />
            <Palm x={980} y={1200} s={1.0} color="#3a463d" phase={40} />
            <StiltHouse x={620} y={1420} s={1.05} lit={0.6} />
            <Wok x={330} y={1440} s={1.1} />
            <Ibu x={190} y={1470} s={0.95} pose="fry" flip />
            <Rooster x={900} y={1330} s={1.2} crow={crow} />
            <rect y={1440} width={W} height={H - 1440} fill="#4a523f" />
            <Grass y={1460} color="#6b7558" n={46} />
          </g>
        </g>
        {inside > 0 && (
          <g opacity={inside}>
            <rect width={W} height={H} fill="#5a4231" />
            {Array.from({ length: 13 }, (_, i) => <rect key={i} x={i * 86} width={4} height={H} fill="#3e2c20" opacity={0.6} />)}
            <polygon points="120,0 360,0 760,1500 300,1500" fill="#ffe2b0" opacity={0.12 + wave(f, 0.03, 60)} />
            <g transform={`translate(0 ${tween(f, cut, frames, 0, 140)})`}>
              <rect x={600} y={760} width={380} height={760} fill="#7b5739" />
              <rect x={620} y={790} width={160} height={700} fill="#6b4a31" />
              <rect x={800} y={790} width={160} height={700} fill="#6b4a31" />
              <circle cx={770} cy={1140} r={10} fill="#d9b26a" />
              <circle cx={810} cy={1140} r={10} fill="#d9b26a" />
              <rect x={590} y={740} width={400} height={24} fill="#4a3222" />
              {/* the plastic folder: clear blue, a cream page with a seal inside */}
              <g transform={`translate(700 ${742 - wave(f, 1.5, 70)}) rotate(-3)`}>
                <rect x={0} y={-46} width={220} height={46} rx={4} fill="#f5ecd6" />
                <circle cx={180} cy={-24} r={12} fill="#c9592f" opacity={0.8} />
                <rect x={18} y={-34} width={120} height={6} fill="#a89a7a" />
                <rect x={18} y={-20} width={90} height={6} fill="#a89a7a" />
                <rect x={-8} y={-56} width={236} height={58} rx={6} fill="#7fb6e6" opacity={0.45} stroke="#5d97cf" strokeWidth={3} />
              </g>
              {Array.from({ length: 16 }, (_, i) => (
                <circle key={i} cx={200 + rand(i) * 600 + wave(f, 20, 120, i * 9)} cy={(400 + rand(i + 4) * 900 - f * 0.4 + 2000) % 1300 + 200} r={2 + rand(i + 2) * 3} fill="#fff1d0" opacity={0.5} />
              ))}
            </g>
            <Sari x={330} y={1560} s={1.45} pose="lookup" mood="calm" />
          </g>
        )}
      </Canvas>
      {f < 80 && <Label x={790} y={330} size={66} rotate={-6} opacity={crow}>kukuruyuk…</Label>}
    </>
  );
};

// 2 — the far job fair: a poster on a cracked phone, the map line to Jakarta and the fare, then Ibu's three months of selling
const Far: FC<SceneProps> = ({ frames, words, lead }) => {
  const f = useCurrentFrame();
  const mapA = at({ w: "Tiket", off: -10, f: 0.33 }, frames, words, lead);
  const fare = at({ w: "dua", f: 0.5 }, frames, words, lead);
  const ibuA = at({ w: "Uang", off: -8, f: 0.66 }, frames, words, lead);
  const m = step(f, mapA, 12) * (1 - step(f, ibuA, 12));
  const ib = step(f, ibuA, 12);
  const draw = tween(f, mapA + 6, fare, 0, 1);
  const rp = Math.round(tween(f, fare - 20, fare + 25, 0, 1950000) / 1000) * 1000;
  const months = Math.min(3, Math.max(0, Math.floor((f - ibuA - 20) / 22) + 1));
  return (
    <>
      <Canvas>
        {/* A: hands and the phone poster */}
        <g opacity={1 - step(f, mapA, 12)}>
          <rect width={W} height={H} fill="#46557a" />
          <circle cx={540} cy={760} r={620} fill="#6a7aa0" opacity={0.5} />
          <g transform={`translate(540 ${880 + wave(f, 6, 70)}) rotate(${wave(f, 1.5, 90)}) scale(${tween(f, 0, mapA, 1, 1.08)})`}>
            <ellipse cx={-230} cy={330} rx={90} ry={60} fill={C.skin} />
            <ellipse cx={230} cy={330} rx={90} ry={60} fill={C.skin} />
            <rect x={-210} y={-400} width={420} height={800} rx={46} fill="#1b1f2b" />
            <rect x={-186} y={-372} width={372} height={744} rx={30} fill="#f5e7c8" />
            <rect x={-186} y={-372} width={372} height={250} rx={30} fill="#1f3a6b" />
            <text x={0} y={-280} textAnchor="middle" fontFamily={fontFamily} fontWeight={800} fontSize={58} fill="#ffd54a">JOB FAIR</text>
            <text x={0} y={-200} textAnchor="middle" fontFamily={fontFamily} fontWeight={800} fontSize={44} fill="#fff">2026</text>
            <text x={0} y={-40} textAnchor="middle" fontFamily={fontFamily} fontWeight={800} fontSize={64} fill="#1f3a6b">JAKARTA</text>
            <text x={0} y={30} textAnchor="middle" fontFamily={fontFamily} fontWeight={800} fontSize={30} fill="#7a6a4f">Gedung Pameran · 3 hari</text>
            {[0, 1, 2].map((i) => <rect key={i} x={-130} y={90 + i * 50} width={260 - i * 40} height={18} rx={9} fill="#d8c7a2" />)}
            {/* the crack */}
            <path d="M120 -372 L80 -250 L130 -170 L60 -60 L100 40 M80 -250 L10 -220 M60 -60 L-40 -30" stroke="#fff" strokeWidth={3} fill="none" opacity={0.85} />
            <path d="M120 -372 L80 -250 L130 -170 L60 -60 L100 40" stroke="#000" strokeWidth={1.5} fill="none" opacity={0.35} transform="translate(2 2)" />
            <ellipse cx={-150} cy={290} rx={60} ry={40} fill={C.skin} />
          </g>
        </g>
        {/* B: the map */}
        {m > 0 && (
          <g opacity={m}>
            <rect width={W} height={H} fill="#3f5f86" />
            {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M0 ${200 + i * 150} q270 -20 540 0 t540 0`} stroke="#5878a0" strokeWidth={3} fill="none" opacity={0.6} />)}
            <path d="M40 520 Q200 450 420 500 Q520 520 600 540 Q520 600 300 600 Q120 610 40 590Z" fill="#7c8f6a" />
            <text x={150} y={470} fontFamily={fontFamily} fontWeight={800} fontSize={40} fill="#e9eef7">Jawa</text>
            <path d="M650 1230 Q760 1190 880 1230 Q900 1290 790 1300 Q680 1290 650 1230Z" fill="#9aa27a" />
            <text x={700} y={1360} fontFamily={fontFamily} fontWeight={800} fontSize={40} fill="#e9eef7">Sumba</text>
            <circle cx={180} cy={540} r={16} fill="#ffd54a" />
            <circle cx={780} cy={1245} r={16} fill="#ffd54a" />
            <path id="route" d="M780 1245 C 700 1000, 480 900, 420 760 S 230 600, 180 540" stroke="#ffd54a" strokeWidth={8} fill="none"
              pathLength={1} strokeDasharray={`${draw} 1`} strokeLinecap="round" />
            <g transform={`translate(${780 - draw * 360} ${1245 - draw * 480})`}>
              <Ship x={0} y={-30} s={0.32} />
            </g>
            <text x={520} y={930} fontFamily={fontFamily} fontWeight={800} fontSize={56} fill="#fff" opacity={draw}>± 2.000 km</text>
          </g>
        )}
        {/* C: Ibu's tray and three months */}
        {ib > 0 && (
          <g opacity={ib}>
            <rect width={W} height={H} fill="#55627f" />
            <rect y={1260} width={W} height={H - 1260} fill="#3f4660" />
            <Ibu x={540} y={1500} s={1.5} pose="stand" mood="calm" />
            <g transform={`translate(540 ${1170 + wave(f, 3, 60)})`}>
              <ellipse cx={0} cy={0} rx={250} ry={50} fill="#c9a26a" />
              {Array.from({ length: 9 }, (_, i) => <ellipse key={i} cx={-170 + (i % 5) * 85} cy={-14 + Math.floor(i / 5) * 22} rx={34} ry={13} fill="#e0a43a" transform={`rotate(${-15 + i * 7} ${-170 + (i % 5) * 85} -10)`} />)}
            </g>
          </g>
        )}
      </Canvas>
      {m > 0 && <Label x={540} y={300} size={110} color="#ffd54a" opacity={m * step(f, fare - 20, 8)}>Rp{rp.toLocaleString("id-ID")}</Label>}
      {m > 0 && <Label x={540} y={410} size={44} opacity={m * step(f, fare, 10)}>kapal + bus</Label>}
      {ib > 0 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 230, display: "flex", justifyContent: "center", gap: 34, opacity: ib }}>
          {[1, 2, 3].map((n) => (
            <div key={n} style={{ width: 230, height: 240, borderRadius: 24, background: n <= months ? "#fff7e6" : "rgba(255,255,255,.15)", boxShadow: "0 8px 0 rgba(0,0,0,.25)",
              transform: `scale(${n <= months ? 1 : 0.9}) rotate(${(n - 2) * 4}deg)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily, fontWeight: 800 }}>
              <div style={{ fontSize: 96, color: "#c0533b", lineHeight: 1 }}>{n}</div>
              <div style={{ fontSize: 40, color: "#3b3a52" }}>bulan</div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

// 3 — dusk on the shore: Sari puts the phone away and watches a ship of people in neat shirts sail off
const Shore: FC<SceneProps> = ({ frames }) => {
  const f = useCurrentFrame();
  const p = tween(f, 0, frames, 0, 1);
  return (
    <Canvas>
      <Sky id="s3" top={interpolateColors(p, [0, 1], ["#36466c", "#1f2a4a"])} mid={interpolateColors(p, [0, 1], ["#8c88a8", "#5a5f88"])} bottom={interpolateColors(p, [0, 1], ["#e3a07e", "#b97a6e"])} h={1060} />
      <circle cx={300} cy={tween(f, 0, frames, 1000, 1080)} r={90} fill="#ffcf9a" opacity={0.85} />
      <circle cx={300} cy={1040} r={300} fill="url(#sunGlow)" opacity={0.3} />
      <Sea y={1060} color={interpolateColors(p, [0, 1], ["#45577c", "#2c3757"])} shine="#e7b893" h={400} />
      <Ship x={tween(f, 0, frames, 380, 900)} y={1080} s={0.55} people color="#dcd6ca" />
      <Birds n={4} y={420} color="#262b45" />
      <path d={`M0 1380 Q300 1330 620 1370 T${W} 1350 V${H} H0Z`} fill="#3a3a48" />
      <ellipse cx={400} cy={1400} rx={170} ry={60} fill="#4a4652" />
      <Sari x={400} y={1380} s={1.15} pose="sit" />
      {/* the phone, face down beside her, its glow going out */}
      <rect x={560} y={1372} width={56} height={22} rx={6} fill="#1b1f2b" />
      <ellipse cx={588} cy={1372} rx={60} ry={14} fill="#bcd4ff" opacity={tween(f, 0, 40, 0.6, 0)} />
      <rect y={1440} width={W} height={H - 1440} fill="#2c2b36" />
      <Grass y={1450} color="#45465a" n={40} />
      <Palm x={960} y={1420} s={1.4} color="#22222e" phase={20} />
    </Canvas>
  );
};

// ───────────────────────── Act 2 · the app (real captures) ─────────────────────────

/** An app scene: the phone on its background, the shots inside, optional overlay. */
const App: FC<SceneProps & { shots: Shot[]; mood?: "night" | "day" | "warm"; pill?: { text: string; from: At; to?: At }; over?: (f: number) => React.ReactNode }> = ({
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

// 4 — night: the little brother's link, then the real jobfair.co.id home page, panning down to the live hall
const Link: FC<SceneProps> = (props) => {
  const { frames, words, lead } = props;
  const f = useCurrentFrame();
  const land = at({ w: "job", off: -4, f: 0.62 }, frames, words, lead);
  const show = [at({ w: "adikku", f: 0.15 }, frames, words, lead), at({ w: "tautan", f: 0.3 }, frames, words, lead), at({ w: "Katanya", off: 6, f: 0.5 }, frames, words, lead)];
  return (
    <PhoneStage mood="night">
      {f < land + 8 && (
        <AbsoluteFill>
          <Chat show={show} frame={f} />
        </AbsoluteFill>
      )}
      <AbsoluteFill style={{ opacity: step(f, land, 8), pointerEvents: "none" }}>
        <Screen frames={frames} words={words} lead={lead}
          shots={[{ src: "s04-landing-full.png", from: { w: "job", off: -4, f: 0.62 }, h: 1200, cam: [{ z: 1, x: 195, y: 422 }, { z: 1, x: 195, y: 760 }], tap: { x: 195, y: 451, at: 0.999 } }]} />
      </AbsoluteFill>
    </PhoneStage>
  );
};

// 5 — no ticket, no fare: the real Google sign-in, then the character creator (hijab, colours, "Masuk job fair")
const SignIn: FC<SceneProps> = (p) => (
  <App {...p} shots={[
    { src: "s05-google.png", from: 0, cam: [{ z: 1.05, x: 195, y: 440 }, { z: 1.15, x: 195, y: 460 }], tap: { x: 195, y: 465, at: { w: "Tidak", n: 1, off: -4, f: 0.3 } } },
    { src: "s05-cc0.png", from: { w: "Tidak", n: 1, off: 8, f: 0.35 }, cam: [{ z: 1, x: 195, y: 422 }, { z: 1.2, x: 195, y: 500 }], tap: { x: 339, y: 709, at: { w: "ongkos", off: 4, f: 0.55 } } },
    { src: "s05-cc2.png", from: { w: "Aku", off: -4, f: 0.65 }, cam: [{ z: 1.35, x: 195, y: 260 }, { z: 1.2, x: 195, y: 380 }] },
    { src: "s05-cc4.png", from: { w: "masuk", off: -14, f: 0.85 }, cam: [{ z: 1.1, x: 195, y: 600 }], tap: { x: 195, y: 759, at: { w: "masuk", off: 2, f: 0.9 } } },
  ]} />
);

// 6 — the wardrobe: kemeja, then the blazer, in red
const Blazer: FC<SceneProps> = (p) => (
  <App {...p} shots={[
    { src: "s06-wr0.png", from: 0, cam: [{ z: 1, x: 195, y: 422 }, { z: 1.12, x: 195, y: 420 }], tap: { x: 75, y: 568, at: { w: "pertama", f: 0.15 } } },
    { src: "s06-wr1.png", from: { w: "pertama", off: 10, f: 0.2 }, cam: [{ z: 1.12, x: 195, y: 420 }, { z: 1.2, x: 180, y: 380 }], tap: { x: 155, y: 568, at: { w: "blazer", off: -6, f: 0.32 } } },
    { src: "s06-wr2.png", from: { w: "blazer", off: 4, f: 0.36 }, cam: [{ z: 1.9, x: 100, y: 160 }, { z: 2.1, x: 100, y: 150 }] },
    { src: "s06-wr3.png", from: { w: "layar", off: -4, f: 0.58 }, cam: [{ z: 1.2, x: 195, y: 470 }], tap: { x: 82, y: 537, at: { w: "Tapi", f: 0.68 } } },
    { src: "s06-wr4.png", from: { w: "Tapi", off: 10, f: 0.72 }, cam: [{ z: 1.9, x: 100, y: 170 }, { z: 2.4, x: 100, y: 165 }] },
  ]} />
);

const PIN = ["Medan", "Makassar", "Papua"];
// 7 — the hall: a real recording of Sari walking past company stands, other visitors around; place names pop beside the phone
const Hall: FC<SceneProps> = (p) => {
  const { frames, words, lead } = p;
  return (
    <App {...p} shots={[{ src: "s07-walk.mp4", from: 0, video: {}, cam: [{ z: 1.05, x: 195, y: 430 }, { z: 1.15, x: 195, y: 420 }] }]}
      over={(f) => (
        <>
          {PIN.map((name, i) => {
            const a = at({ w: name, f: 0.35 + i * 0.12 }, frames, words, lead);
            const o = step(f, a - 4, 8);
            const left = i % 2 === 0;
            const x = left ? 112 : 968, y = 520 + i * 300;
            return o <= 0 ? null : (
              <div key={name} style={{ position: "absolute", left: x, top: y + wave(f, 6, 70, i * 20), transform: `translate(-50%,-50%) scale(${0.6 + o * 0.4}) rotate(${left ? -6 : 6}deg)`, opacity: o,
                fontFamily, fontWeight: 800, fontSize: 36, color: "#1b1b1f", background: "#fff", padding: "6px 18px", borderRadius: 30, boxShadow: "0 6px 0 rgba(0,0,0,.12)" }}>
                <span style={{ color: "#e2483d" }}>●</span> {name}
              </div>
            );
          })}
        </>
      )} />
  );
};

// 8 — the lift to Lantai 2 Teknologi & Keuangan, the map search "akuntansi", then the walk to the stand (real recording)
const Lift: FC<SceneProps> = (p) => (
  <App {...p} shots={[
    { src: "s08-lift.png", from: 0, cam: [{ z: 1.1, x: 195, y: 420 }, { z: 1.3, x: 195, y: 500 }], tap: { x: 195, y: 568, at: { w: "lift", off: 2, f: 0.15 } } },
    { src: "s08-map1.png", from: { w: "mencari", off: -4, f: 0.3 }, cam: [{ z: 1.15, x: 195, y: 320 }, { z: 1.25, x: 195, y: 330 }], tap: { x: 198, y: 385, at: { w: "keuangan", off: 6, f: 0.45 } } },
    { src: "s08-map2.png", from: { w: "keuangan", off: 16, f: 0.5 }, cam: [{ z: 1.25, x: 195, y: 360 }], tap: { x: 87, y: 426, at: { w: "seperti", off: -2, f: 0.6 } } },
    { src: "s08-walk.mp4", from: { w: "seperti", off: 10, f: 0.65 }, video: { startFrom: 120 }, cam: [{ z: 1.05, x: 195, y: 430 }] },
  ]} />
);

// 9 — the job card: Staf Akuntansi, placement in the regions; read three times (three highlight sweeps)
const Job: FC<SceneProps> = (p) => (
  <App {...p} shots={[
    { src: "s09-booth1.png", from: 0, cam: [{ z: 1.3, x: 195, y: 300 }] },
    { src: "s09-job.png", from: { w: "Staf", off: 2, f: 0.06 }, cam: [{ z: 1.3, x: 195, y: 330 }, { z: 1.38, x: 195, y: 360 }], marks: [
      { x: 55, y: 279, w: 136, h: 22, at: { w: "Staf", off: 8, f: 0.1 } },
      { x: 55, y: 342, w: 277, h: 20, at: { w: "Penempatan", off: 2, f: 0.3 } },
      { x: 41, y: 452, w: 300, h: 20, at: { w: "daerah", f: 0.45 } },
      { x: 55, y: 279, w: 136, h: 22, at: { w: "tiga", off: 6, f: 0.62 } },
    ] },
  ]} />
);

// 10 — Studio CV: D3 Akuntansi, then the village cooperative's bookkeeping, written honestly
const Cv: FC<SceneProps> = (p) => (
  <App {...p} shots={[
    { src: "s10-edu.png", from: 0, cam: [{ z: 1.25, x: 195, y: 350 }, { z: 1.3, x: 195, y: 370 }] },
    { src: "s10-exp1.png", from: { w: "membantu", off: -4, f: 0.25 }, cam: [{ z: 1.22, x: 195, y: 320 }, { z: 1.28, x: 195, y: 340 }] },
    { src: "s10-exp2.png", from: { w: "koperasi", off: -4, f: 0.45 }, cam: [{ z: 1.35, x: 195, y: 460 }] },
    { src: "s10-exp3.png", from: { w: "menulisnya", off: -4, f: 0.65 }, cam: [{ z: 1.35, x: 195, y: 460 }, { z: 1.3, x: 195, y: 450 }] },
  ]} />
);

// 11 — one tap, free: "Kirim lamaran · Gratis", the sent toast, the application list; a paper plane flies off toward Jakarta
const Apply: FC<SceneProps> = (p) => {
  const { frames, words, lead } = p;
  return (
    <App {...p} shots={[
      { src: "s11-form.png", from: 0, cam: [{ z: 1.05, x: 195, y: 520 }, { z: 1.25, x: 230, y: 640 }], tap: { x: 282, y: 724, at: { w: "tekan", off: 2, f: 0.12 } } },
      { src: "s11-form.png", from: { w: "Gratis", off: -6, f: 0.22 }, cam: [{ z: 1.8, x: 260, y: 715 }] },
      { src: "s11-sent.png", from: { w: "Lamaranku", off: -4, f: 0.35 }, cam: [{ z: 1.3, x: 195, y: 560 }, { z: 1.15, x: 195, y: 500 }] },
      { src: "s11-apps.png", from: { w: "tanpa", off: -4, f: 0.7 }, cam: [{ z: 1.3, x: 195, y: 400 }] },
    ]}
      over={(f) => {
        const a = at({ w: "sampai", f: 0.45 }, frames, words, lead);
        const t = tween(f, a, a + 70, 0, 1);
        if (f < a || t >= 1) return null;
        const x = 540 + t * 520, y = 760 - t * 720 - Math.sin(t * Math.PI) * 120;
        return (
          <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" style={{ position: "absolute" }}>
            <path d={`M540 760 Q${540 + t * 260} ${640 - t * 360} ${x} ${y}`} stroke="#fff" strokeWidth={6} strokeDasharray="14 14" fill="none" opacity={0.8 * (1 - t)} />
            <g transform={`translate(${x} ${y}) rotate(${-35 + t * 10}) scale(1.4)`}>
              <path d="M-40 0 L40 -26 L10 26Z" fill="#fff" stroke="#1b1b1f" strokeWidth={3} />
              <path d="M40 -26 L-6 8 L10 26" fill="#e8e8e8" stroke="#1b1b1f" strokeWidth={3} />
            </g>
          </svg>
        );
      }} />
  );
};

// 12 — while waiting: the live seminar "Lolos Interview Kerja Pertama" in the seminar room
const Seminar: FC<SceneProps> = (p) => (
  <App {...p} shots={[
    { src: "s12-sem0.png", from: 0, cam: [{ z: 1.05, x: 195, y: 420 }, { z: 1.25, x: 195, y: 330 }] },
    { src: "s12-sem3.png", from: { w: "seminar", off: 2, f: 0.3 }, cam: [{ z: 1.25, x: 195, y: 330 }] },
    { src: "s12-sem5.png", from: { w: "Belajar", off: -4, f: 0.5 }, cam: [{ z: 1.25, x: 195, y: 330 }, { z: 1.3, x: 195, y: 330 }] },
    { src: "s12-sem7.png", from: { w: "gugup", off: -14, f: 0.8 }, cam: [{ z: 1.3, x: 195, y: 330 }] },
  ]} />
);

// 13 — three days later: the bell, "Dilihat", the notification and the interview invitation
const Called: FC<SceneProps> = (p) => {
  const { frames, words, lead } = p;
  const ring = at({ w: "berbunyi", f: 0.25 }, frames, words, lead);
  return (
    <App {...p} pill={{ text: "Tiga hari kemudian", from: 0, to: { w: "Lamaranku", f: 0.4 } }} shots={[
      { src: "s13-bell.png", from: 0, cam: [{ z: 1.2, x: 195, y: 420 }, { z: 2.2, x: 330, y: 120 }], tap: { x: 357, y: 31, at: { w: "berbunyi", off: 12, f: 0.3 } } },
      { src: "s13-dilihat.png", from: { w: "Lamaranku", off: -4, f: 0.4 }, cam: [{ z: 1.3, x: 170, y: 400 }, { z: 1.55, x: 150, y: 420 }] },
      { src: "s13-notif.png", from: { w: "Lalu", off: -2, f: 0.6 }, cam: [{ z: 1.25, x: 195, y: 300 }] },
      { src: "s13-invite.png", from: { w: "wawancara", off: -6, f: 0.8 }, cam: [{ z: 1.2, x: 195, y: 320 }, { z: 1.3, x: 195, y: 320 }] },
    ]}
      over={(f) => {
        const t = f - ring;
        if (t < 0 || t > 40) return null;
        const o = interpolate(t, [0, 6, 30, 40], [0, 1, 1, 0]);
        return (
          <div style={{ position: "absolute", left: 840, top: 250, transform: `rotate(${wave(f, 14, 6)}deg)`, opacity: o, fontFamily, fontWeight: 800, fontSize: 52, color: "#1b1b1f" }}>
            ting!
          </div>
        );
      }} />
  );
};

// ───────────────────────── Act 3 · sunrise gold ─────────────────────────

// 14 — Ibu hugs Sari in front of the house at sunrise; end card: black, the jobfair wordmark in yellow
const Sunrise: FC<SceneProps> = ({ frames, words, lead }) => {
  const f = useCurrentFrame();
  const card = at({ w: "jarak", off: -6, f: 0.62 }, frames, words, lead);
  const end = step(f, card, 18);
  const rise = tween(f, 0, card, 1120, 900);
  return (
    <>
      <Canvas>
        <Sky id="s14" top="#f19a3e" mid="#ffcf73" bottom="#fff0c4" h={1060} />
        <g transform={`rotate(${f * 0.08} 540 ${rise})`}>
          {Array.from({ length: 14 }, (_, i) => (
            <path key={i} d={`M540 ${rise} L${540 + Math.cos((i / 14) * Math.PI * 2) * 1400} ${rise + Math.sin((i / 14) * Math.PI * 2) * 1400} L${540 + Math.cos(((i + 0.45) / 14) * Math.PI * 2) * 1400} ${rise + Math.sin(((i + 0.45) / 14) * Math.PI * 2) * 1400}Z`}
              fill="#fff6d8" opacity={0.18} />
          ))}
        </g>
        <circle cx={540} cy={rise} r={420} fill="url(#sunGlow)" />
        <circle cx={540} cy={rise} r={130} fill="#fff1c0" />
        <Sea y={1060} color="#e2a24a" shine="#fff1c0" h={140} />
        <Savanna y={1120} back="#c79b4e" front="#a8803d" />
        <Palm x={120} y={1330} s={1.3} color="#5a4123" />
        <StiltHouse x={860} y={1400} s={0.85} lit={0.3} />
        <Birds n={5} y={360} color="#7a4a1e" />
        <g transform={`translate(0 ${wave(f, 2, 90)})`}>
          <g transform="rotate(-9 640 1400)"><Sari x={640} y={1400} s={1.35} pose="hug" mood="hope" /></g>
          <g transform="rotate(6 450 1400)"><Ibu x={450} y={1400} s={1.4} pose="hug" mood="cry" /></g>
        </g>
        <rect y={1395} width={W} height={H - 1395} fill="#8f6b33" />
        <Grass y={1405} color="#b08a45" n={50} h={80} />
      </Canvas>
      {end > 0 && (
        <AbsoluteFill style={{ background: "#000", opacity: end, alignItems: "center" }}>
          <div style={{ marginTop: 420, display: "flex", flexDirection: "column", alignItems: "center", gap: 46, transform: `translateY(${(1 - end) * 30}px)` }}>
            <div style={{ fontFamily, fontWeight: 800, fontSize: 70, color: "#fff", textAlign: "center", lineHeight: 1.15, maxWidth: 900 }}>
              Job fair untuk semua,<br />dari mana saja.
            </div>
            <div style={{ fontFamily, fontWeight: 800, fontSize: 104, color: C.yellow, letterSpacing: -1, opacity: step(f, card + 20, 14) }}>jobfair.co.id</div>
            <div style={{ width: 160, height: 10, borderRadius: 5, background: C.yellow, opacity: step(f, card + 30, 14), transform: `scaleX(${step(f, card + 30, 20)})` }} />
          </div>
        </AbsoluteFill>
      )}
    </>
  );
};

export const scenes = [Dawn, Far, Shore, Link, SignIn, Blazer, Hall, Lift, Job, Cv, Apply, Seminar, Called, Sunrise];
