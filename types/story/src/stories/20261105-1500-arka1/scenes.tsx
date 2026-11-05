import type { FC, ReactNode } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import type { SceneProps } from "../../lib/Story";
import { rand, tween, wave } from "../../lib/kit";
import {
  Arka, C, Calendar, Canvas, Chat, Factory, H, IroningBoard, KosRoom, Label, Mountains, PhoneStage, QueuePerson, Screen, Sky, Town, W, at, fontFamily,
  type At, type Shot,
} from "./parts";

/** Cross-fade helper: 0 before frame a, 1 after a + d. */
const step = (f: number, a: number, d = 10) => interpolate(f, [a, a + d], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

/** A real app scene: the phone on its stage, the captures inside, optional pill label and overlay drawn over the stage. */
const App: FC<SceneProps & { shots: Shot[]; mood?: "night" | "day" | "warm"; pill?: { text: string; from: At; to?: At }; over?: (f: number) => ReactNode; clock?: string }> = ({
  frames, words, lead, shots, mood = "day", pill, over, clock,
}) => {
  const f = useCurrentFrame();
  let pillO = 0;
  if (pill) {
    const a = at(pill.from, frames, words, lead), b = pill.to === undefined ? frames + 99 : at(pill.to, frames, words, lead);
    pillO = step(f, a, 10) * (1 - step(f, b, 10));
  }
  return (
    <PhoneStage mood={mood} clock={clock} pill={pill && { text: pill.text, opacity: pillO }} over={over?.(f)}>
      <Screen shots={shots} frames={frames} words={words} lead={lead} />
    </PhoneStage>
  );
};

/** A sticker beside the phone (illustration, not app UI). */
const Sticker: FC<{ x: number; y: number; o: number; f: number; i?: number; rot?: number; children: ReactNode; bg?: string; color?: string }> = ({ x, y, o, f, i = 0, rot = -6, children, bg = "#fff", color = "#1b1b1f" }) =>
  o <= 0 ? null : (
    <div style={{ position: "absolute", left: x, top: y + wave(f, 6, 70, i * 20), transform: `translate(-50%,-50%) scale(${0.6 + o * 0.4}) rotate(${rot}deg)`, opacity: o,
      fontFamily, fontWeight: 800, fontSize: 40, color, background: bg, padding: "10px 24px", borderRadius: 26, boxShadow: "0 12px 28px rgba(0,0,0,.22)", whiteSpace: "nowrap" }}>
      {children}
    </div>
  );

// ───────────────────────── Act 1 · Bandung ─────────────────────────

// 1 — the closed factory gate on a grey morning; the chimney stops, the list on the board
const Gate: FC<SceneProps> = ({ frames, words, lead }) => {
  const f = useCurrentFrame();
  const stop = at({ w: "berhenti", f: 0.62 }, frames, words, lead);
  const phk = at({ w: "PHK", f: 0.92 }, frames, words, lead);
  const daftar = at({ w: "daftar", f: 0.85 }, frames, words, lead);
  const push = interpolate(f, [0, frames], [1.0, 1.08]);
  return (
    <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: "70% 60%" }}>
      <Canvas>
        <Sky id="s1" top="#8e9aab" mid="#c3cad3" bottom="#e2e3e0" />
        <Mountains y={720} back="#9aa6b6" front="#aab5b8" />
        <Factory smoke={1 - step(f, stop, 30)} list={step(f, daftar, 16)} />
        <Arka x={180} y={1400} s={1.25} pose="stand" bag mood={f > phk ? "sad" : "calm"} look={f > daftar - 10 ? 6 : 0} />
      </Canvas>
      <Label x={540} y={170} size={56} color="#2f3a52" opacity={step(f, 4, 12)}>Bandung</Label>
    </AbsoluteFill>
  );
};

// 2 — the old way: a long queue from dawn, the crowd, the doors close, he walks home
const QUEUE = Array.from({ length: 13 }, (_, i) => i);
const Queue: FC<SceneProps> = ({ frames, words, lead }) => {
  const f = useCurrentFrame();
  const crowd = at({ w: "berdesakan", f: 0.45 }, frames, words, lead);
  const home = at({ w: "pulang", f: 0.62 }, frames, words, lead);
  const day = tween(f, 0, home, 0, 1);
  const squeeze = tween(f, crowd - 6, crowd + 14, 0, 1);
  const walk = tween(f, home, frames, 0, 1);
  const leave = step(f, home, 20);
  const clock = f < crowd ? "04.30" : f < home ? "10.15" : "15.00";
  const mix = (a: number[], b: number[], t: number) => `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(",")})`;
  return (
    <AbsoluteFill>
      <Canvas>
        <rect width={W} height={H} fill={mix([46, 52, 92], [236, 214, 170], day)} />
        <circle cx={160 + day * 120} cy={760 - day * 380} r={70} fill="#ffe6a8" opacity={0.3 + day * 0.7} />
        {/* the hall */}
        <rect x={420} y={560} width={620} height={700} fill="#c9c2b6" />
        <rect x={420} y={520} width={620} height={60} fill="#a39a8c" />
        <rect x={470} y={620} width={520} height={110} rx={10} fill="#2f5fd0" />
        <text x={730} y={698} textAnchor="middle" fontFamily={fontFamily} fontWeight={800} fontSize={70} fill="#fff" letterSpacing={6}>JOB FAIR</text>
        <rect x={500} y={900} width={160} height={360} fill={f > home ? "#5b5148" : "#3a3330"} />
        {f > home && <text x={580} y={960} textAnchor="middle" fontFamily={fontFamily} fontWeight={800} fontSize={36} fill="#fff" opacity={leave}>TUTUP</text>}
        <rect y={1260} width={W} height={H - 1260} fill="#9b9488" />
        {/* the queue: back to front so the nearer people overlap; it bunches up on "berdesakan" */}
        {QUEUE.map((i) => {
          const gap = 70 - squeeze * 22;
          const x = 470 - i * gap + (i > 6 ? -40 : 0);
          const y = 1300 + (i % 2) * 26 + i * 6;
          if (i === 5) return null;
          return <g key={i} opacity={1 - leave * 0.75}><QueuePerson x={x} y={y} s={1.15} i={i} tired={step(f, crowd + 30, 40)} /></g>;
        })}
        <g transform={`translate(${walk * 700} ${walk * 60})`}>
          <Arka x={470 - 5 * (70 - squeeze * 22)} y={1340} s={0.82} pose={f > home ? "walk" : "folder"} flip={f > home} mood={f > home ? "sad" : "calm"} />
        </g>
      </Canvas>
      <Label x={540} y={230} size={84} color={day > 0.5 ? "#3b2a1e" : "#fff7e6"} opacity={step(f, 2, 10)}>{clock}</Label>
    </AbsoluteFill>
  );
};

// 3 — the kos room at night; a friend's message with the link (a drawn chat bubble)
const Link: FC<SceneProps> = ({ frames, words, lead }) => {
  const f = useCurrentFrame();
  const link = at({ w: "tautan", f: 0.3 }, frames, words, lead);
  const virt = at({ w: "virtual", f: 0.5 }, frames, words, lead);
  const daftar = at({ w: "Daftar", f: 0.65 }, frames, words, lead);
  const glow = step(f, link - 14, 10);
  return (
    <AbsoluteFill>
      <Canvas>
        <KosRoom time="night">
          <Arka x={560} y={1300} s={1.35} pose="sit" glow={glow} mood={f > daftar + 20 ? "hope" : "calm"} />
        </KosRoom>
      </Canvas>
      <Chat x={140} y={860} name="Yoga" o={step(f, link - 6, 10)} lines={[
        { text: "jobfair.co.id/jobfair-jabar", o: step(f, link, 10), link: true },
        { text: "Job fair virtual, Ka.", o: step(f, virt - 4, 10) },
        { text: "Daftar dulu, biar dapat tempat.", o: step(f, daftar - 2, 10) },
      ]} />
      <Label x={540} y={170} size={52} color="#fff7e6" opacity={step(f, 4, 12)}>Kamar kos, malam</Label>
    </AbsoluteFill>
  );
};

// ───────────────────────── Act 2 · the phone (real captures) ─────────────────────────

// 4 — the event page: date, place, then the form "Daftar sekarang"
const Event: FC<SceneProps> = (p) => (
  <App {...p} mood="night" shots={[
    { src: "s04-top.png", from: 0, marks: [
      { x: 16, y: 378, w: 200, h: 24, at: { w: "Tanggal", off: -2, f: 0.3 } },
      { x: 16, y: 408, w: 240, h: 26, at: { w: "tempat", off: -2, f: 0.45 } },
    ] },
    { src: "s04-form.png", from: { w: "satu", off: -6, f: 0.6 }, marks: [{ x: 30, y: 118, w: 190, h: 30, at: { w: "Daftar", off: -4, f: 0.85 } }] },
  ]} />
);

// 5 — the three steps of the form; nothing to pay, nobody in between
const Form: FC<SceneProps> = (p) => {
  const { frames, words, lead } = p;
  return (
    <App {...p} mood="night" shots={[
      { src: "s05-a.png", from: 0, h: 1813, cam: [{ y: 1250 }], marks: [
        { x: 35, y: 1118, w: 320, h: 50, at: { w: "namaku", off: -2, f: 0.1 } },
        { x: 35, y: 1233, w: 320, h: 50, at: { w: "emailku", off: -2, f: 0.22 } },
      ], tap: { x: 195, y: 1612, at: { w: "emailku", off: 14, f: 0.3 } } },
      { src: "s05-b.png", from: { w: "emailku", off: 20, f: 0.33 }, h: 2036, cam: [{ y: 1450 }], marks: [{ x: 165, y: 1442, w: 102, h: 44, at: { w: "pendidikanku", off: -2, f: 0.4 } }],
        tap: { x: 266, y: 1835, at: { w: "Tidak", off: -6, f: 0.52 } } },
      { src: "s05-c.png", from: { w: "Tidak", off: 2, f: 0.56 }, h: 2944, cam: [{ y: 2280 }, { y: 2560 }], marks: [{ x: 52, y: 2582, w: 286, h: 87, at: { w: "calo", off: -14, f: 0.8 } }],
        tap: { x: 266, y: 2743, at: { w: "calo", off: 6, f: 0.92 } } },
    ]}
      over={(f) => {
        const fee = at({ w: "biaya", f: 0.62 }, frames, words, lead);
        const calo = at({ w: "calo", f: 0.9 }, frames, words, lead);
        const x = step(f, calo + 4, 10);
        return (
          <>
            <Sticker x={150} y={560} o={step(f, fee - 4, 8)} f={f} bg={C.yellow}>Rp0</Sticker>
            {f > calo - 4 && (
              <div style={{ position: "absolute", left: 930, top: 820 + wave(f, 6, 70, 30), transform: `translate(-50%,-50%) scale(${0.6 + step(f, calo - 4, 8) * 0.4}) rotate(6deg)`, opacity: step(f, calo - 4, 8) }}>
                <div style={{ position: "relative", fontFamily, fontWeight: 800, fontSize: 40, color: "#1b1b1f", background: "#fff", padding: "10px 26px", borderRadius: 26, boxShadow: "0 12px 28px rgba(0,0,0,.22)" }}>
                  Calo
                  <div style={{ position: "absolute", left: 10, right: 10, top: "50%", height: 8, borderRadius: 4, background: "#e2483d", transform: `scaleX(${x}) rotate(-12deg)`, transformOrigin: "0 50%" }} />
                </div>
              </div>
            )}
          </>
        );
      }} />
  );
};

// 6 — the success page: the code and its QR, his "queue number"; a drawn ticket beside the phone
const Code: FC<SceneProps> = (p) => {
  const { frames, words, lead } = p;
  return (
    <App {...p} mood="night" shots={[
      { src: "s06-full.png", from: 0, h: 1998, cam: [{ y: 560 }, { y: 1080 }], marks: [
        { x: 30, y: 1004, w: 220, h: 54, at: { w: "nomor", off: 4, f: 0.2 } },
        { x: 118, y: 1072, w: 154, h: 152, at: { w: "antreanku", off: 6, f: 0.3 } },
      ] },
    ]}
      over={(f) => {
        const a = at({ w: "berdiri", f: 0.6 }, frames, words, lead);
        const o = step(f, a - 4, 10);
        if (o <= 0) return null;
        return (
          <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" style={{ position: "absolute" }}>
            <g opacity={o} transform={`translate(150 ${980 + wave(f, 6, 60)}) rotate(-8)`}>
              <rect x={-90} y={-60} width={180} height={120} rx={12} fill="#fff" stroke="#1b1b1f" strokeWidth={4} />
              <text x={0} y={-14} textAnchor="middle" fontFamily={fontFamily} fontWeight={800} fontSize={24} fill="#6b6b6b">ANTRE</text>
              <text x={0} y={34} textAnchor="middle" fontFamily={fontFamily} fontWeight={800} fontSize={52} fill="#1b1b1f">0 jam</text>
            </g>
          </svg>
        );
      }} />
  );
};

// 7 — opening day: the calendar flips to the 12th, he irons his shirt like a work day
const Morning: FC<SceneProps> = ({ frames, words, lead }) => {
  const f = useCurrentFrame();
  const hari = at({ w: "Hari", f: 0.05 }, frames, words, lead);
  const kerja = at({ w: "kerja", f: 0.65 }, frames, words, lead);
  const flip = tween(f, hari, hari + 18, 0, 1);
  const ring = tween(f, hari + 20, hari + 40, 0, 1);
  const k = wave(f, 36, 34) + 30;
  return (
    <AbsoluteFill>
      <Canvas>
        <KosRoom time="morning">
          <Calendar x={800} y={330} flip={flip} ring={ring} />
          <g transform="translate(760 760)">
            <rect x={-70} y={-60} width={140} height={120} rx={30} fill="#e7e2d6" stroke="#8a7d69" strokeWidth={4} />
            <text x={0} y={18} textAnchor="middle" fontFamily={fontFamily} fontWeight={800} fontSize={48} fill="#c7362f">05.30</text>
          </g>
          <IroningBoard x={560} y={1150} k={k} />
          <Arka x={300} y={1420} s={1.25} pose="iron" top="#f4f1ea" mood={f > kerja ? "smile" : "calm"} look={4} />
        </KosRoom>
      </Canvas>
      <Label x={540} y={170} size={56} color="#3b2a1e" opacity={step(f, 4, 12)}>Hari pembukaan</Label>
    </AbsoluteFill>
  );
};

// 8 — opening day on the event page: Masuk gedung, then the sign-in screen with Google
const SignIn: FC<SceneProps> = (p) => (
  <App {...p} clock="07.58" shots={[
    { src: "s08-enter.png", from: 0, marks: [{ x: 31, y: 557, w: 176, h: 48, at: { w: "Satu", off: -2, f: 0.05 }, until: { w: "tekan", off: 10, f: 0.15 } }], tap: { x: 119, y: 581, at: { w: "tekan", off: 2, f: 0.15 } } },
    { src: "s08-google.png", from: { w: "masuk", off: 2, f: 0.25 }, marks: [{ x: 32, y: 442, w: 326, h: 47, at: { w: "Google", off: -4, f: 0.45 } }], tap: { x: 195, y: 465, at: { w: "Tidak", off: 2, f: 0.6 } } },
  ]} />
);

// 9 — the hall: Lantai 2 full of stands, Arka's character, nobody pushing
const Hall: FC<SceneProps> = (p) => (
  <App {...p} clock="08.02" shots={[
    { src: "s09-a.png", from: 0, marks: [{ x: 170, y: 418, w: 50, h: 64, at: { w: "terbuka", off: 2, f: 0.25 }, until: { w: "penuh", off: 4, f: 0.5 } }] },
    { src: "s09-b.png", from: { w: "tidak", off: -4, f: 0.6 } },
  ]} />
);

// 10 — linking the code in the bag; the early-sign-up voucher coins
const Coins: FC<SceneProps> = (p) => {
  const { frames, words, lead } = p;
  return (
    <App {...p} clock="08.05" shots={[
      { src: "s10-code.png", from: 0, marks: [{ x: 39, y: 710, w: 217, h: 40, at: 0.02 }], tap: { x: 306, y: 730, at: { w: "tautkan", off: 0, f: 0.2 } } },
      { src: "s10-linked.png", from: { w: "tautkan", off: 8, f: 0.25 }, marks: [{ x: 35, y: 690, w: 320, h: 66, at: { w: "Ternyata", off: 0, f: 0.35 } }], tap: { x: 105, y: 611, at: { w: "koin", off: -10, f: 0.65 } } },
      { src: "s10-claimed.png", from: { w: "koin", off: 2, f: 0.7 }, marks: [{ x: 35, y: 708, w: 320, h: 44, at: { w: "koin", off: 8, f: 0.72 } }] },
      { src: "s10-coins.png", from: { w: "fitur", off: -4, f: 0.85 }, marks: [{ x: 257, y: 777, w: 56, h: 50, at: { w: "fitur", off: 2, f: 0.88 } }] },
    ]}
      over={(f) => {
        const a = at({ w: "koin", off: 6, f: 0.72 }, frames, words, lead);
        const t = (f - a) / 30;
        if (t < 0 || t > 2.2) return null;
        return <Sticker x={940} y={760 - t * 120} o={Math.min(1, t * 3) * (1 - Math.max(0, t - 1.6) / 0.6)} f={f} rot={6} bg={C.yellow}>+20 koin</Sticker>;
      }} />
  );
};

// 11 — Baja Prima, Operator Produksi: one tap, the application is sent (free)
const Apply: FC<SceneProps> = (p) => (
  <App {...p} clock="08.21" shots={[
    { src: "s11-booth.png", from: 0, tap: { x: 195, y: 737, at: 0.03 } },
    { src: "s11-menu.png", from: 0.1, marks: [{ x: 34, y: 525, w: 322, h: 38, at: 0.12 }], tap: { x: 195, y: 544, at: { w: "operator", off: -12, f: 0.16 } } },
    { src: "s11-jobs.png", from: { w: "operator", off: -4, f: 0.2 }, marks: [{ x: 30, y: 296, w: 330, h: 60, at: { w: "produksi", off: 0, f: 0.25 } }] },
    { src: "s11-job.png", from: { w: "Pengalamanku", off: -2, f: 0.35 }, marks: [{ x: 30, y: 400, w: 330, h: 84, at: { w: "enam", off: 0, f: 0.45 } }], tap: { x: 195, y: 538, at: { w: "lagi", off: 4, f: 0.6 } } },
    { src: "s11-form.png", from: { w: "Satu", off: -10, f: 0.66 }, marks: [{ x: 35, y: 100, w: 320, h: 60, at: { w: "Satu", off: -6, f: 0.68 } }], tap: { x: 282, y: 724, at: { w: "tekan", n: 0, off: 4, f: 0.78 } } },
    { src: "s11-sent.png", from: { w: "lamaranku", off: 0, f: 0.85 }, marks: [{ x: 4, y: 650, w: 380, h: 30, at: { w: "terkirim", off: -2, f: 0.92 } }] },
  ]} />
);

// ───────────────────────── Act 3 · the balcony at dusk ─────────────────────────

// 12 — on the kos balcony at dusk, a calm smile; then the end card
const Balcony: FC<SceneProps> = ({ frames, words, lead }) => {
  const f = useCurrentFrame();
  const card = at({ w: "benar", off: 22, f: 0.85 }, frames, words, lead);
  const end = step(f, card, 18);
  const tapi = at({ w: "Tapi", f: 0.25 }, frames, words, lead);
  const lights = tween(f, 0, card, 0.1, 1);
  return (
    <>
      <Canvas>
        <Sky id="s12" top="#2c2a5a" mid="#b85d6a" bottom="#f2a86a" />
        <circle cx={760} cy={980} r={260} fill="url(#sunGlow)" opacity={0.7} />
        <circle cx={760} cy={1000 + tween(f, 0, card, 0, 60)} r={70} fill="#ffd9a0" />
        <Mountains y={1000} back="#6a4d7a" front="#5a4470" />
        <Town y={1180} on={lights} />
        {Array.from({ length: 5 }, (_, i) => <circle key={i} cx={100 + rand(i) * 880} cy={160 + rand(i + 4) * 300} r={2.5} fill="#fff" opacity={step(f, 30 + i * 20, 30) * (0.5 + wave(f, 0.4, 50, i * 9))} />)}
        {/* the balcony: rail, a laundry line, the floor */}
        <path d="M0 520 Q540 580 1080 520" stroke="#3a2f45" strokeWidth={4} fill="none" />
        {[180, 320, 860].map((x, i) => <rect key={x} x={x} y={530 + i * 6} width={70} height={90} rx={6} fill={["#e7c45c", "#d36b5a", "#5a8fd3"][i]} opacity={0.9} />)}
        <Arka x={540} y={1420} s={1.3} pose="phone" glow={0.6} mood={f > tapi ? "smile" : "calm"} />
        <rect x={0} y={1200} width={W} height={24} fill="#4a3b52" />
        {Array.from({ length: 12 }, (_, i) => <rect key={i} x={20 + i * 92} y={1220} width={14} height={200} fill="#4a3b52" />)}
        <rect x={0} y={1420} width={W} height={H - 1420} fill="#2f2638" />
      </Canvas>
      <Label x={540} y={170} size={52} color="#fff7e6" opacity={step(f, 4, 12) * (1 - end)}>Malam ini</Label>
      {end > 0 && (
        <AbsoluteFill style={{ background: "#000", opacity: end, alignItems: "center" }}>
          <div style={{ marginTop: 420, display: "flex", flexDirection: "column", alignItems: "center", gap: 46, transform: `translateY(${(1 - end) * 30}px)` }}>
            <div style={{ fontFamily, fontWeight: 800, fontSize: 66, color: "#fff", textAlign: "center", lineHeight: 1.15, maxWidth: 900 }}>
              Daftar event, masuk, lamar.<br />Semua dari HP.
            </div>
            <div style={{ fontFamily, fontWeight: 800, fontSize: 104, color: C.yellow, letterSpacing: -1, opacity: step(f, card + 20, 14) }}>jobfair.co.id</div>
            <div style={{ width: 160, height: 10, borderRadius: 5, background: C.yellow, opacity: step(f, card + 30, 14), transform: `scaleX(${step(f, card + 30, 20)})` }} />
          </div>
        </AbsoluteFill>
      )}
    </>
  );
};

export const scenes = [Gate, Queue, Link, Event, Form, Code, Morning, SignIn, Hall, Coins, Apply, Balcony];
