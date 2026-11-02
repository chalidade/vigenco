import type { FC, ReactNode } from "react";
import { AbsoluteFill, Easing, interpolate, interpolateColors, useCurrentFrame } from "remotion";
import type { SceneProps, Word } from "../../lib/Story";
import { rand, tween, wave } from "../../lib/kit";
import {
  AruFront, AruSide, Boat, Btn, Cam, Campfire, Canvas, Caption, Cloud, CommentCard, Confetti, Dust, Gull, H, Hud, Island, Lamp, Lighthouse,
  NameStone, Palm, Phone, RESIDENTS, Sea, Shadow, Sky, Stars, Statue, Tap, Tent, UI, Vignette, W, fontFamily, walkPose,
} from "./parts";

/** Frame (within the scene) at which word i starts. */
const at = (words: Word[], lead: number, i: number) => Math.round((lead + (words[i]?.start ?? 0)) * 30);
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
/** Springy pop 0 → 1 with a small overshoot, starting at frame a. */
const pop = (f: number, a: number, d = 12) => {
  const t = clamp01((f - a) / d);
  return t <= 0 ? 0 : 1 + Math.sin(t * Math.PI) * 0.18 * (1 - t) - (1 - t) * (1 - t) * (1 - t);
};

/** Day beach: sky, sun, drifting clouds, sea at the horizon, sand to the bottom. */
const Beach: FC<{ warm?: number; horizon?: number; children?: ReactNode }> = ({ warm = 0, horizon = 880, children }) => {
  const f = useCurrentFrame();
  const sky = (a: string, b: string) => interpolateColors(warm, [0, 1], [a, b]);
  return (
    <>
      <Sky id="daysky" stops={[[0, sky("#5fb7e8", "#4b3f8a")], [0.35, sky("#9bd6f0", "#e98a6b")], [0.5, sky("#d9f1f5", "#ffcf8a")]]} />
      <circle cx={820} cy={300 + warm * 420} r={95} fill={sky("#fff6d6", "#ffd27a")} />
      <circle cx={820} cy={300 + warm * 420} r={240} fill="url(#sunglow)" opacity={0.6} />
      <Cloud x={((f * 0.6 + 200) % 1400) - 200} y={260} s={1.1} color="#fff" o={0.85 - warm * 0.4} />
      <Cloud x={((f * 0.4 + 900) % 1400) - 200} y={480} s={0.7} color="#fff" o={0.7 - warm * 0.4} />
      <Gull x={300 + wave(f, 40, 160)} y={420 + wave(f, 20, 90)} s={0.8} />
      <Gull x={420 + wave(f, 50, 170, 30)} y={380 + wave(f, 18, 80, 20)} s={0.6} phase={6} />
      <Sea id="daysea" y={horizon} top={sky("#3aa6c9", "#6b5a9a")} bottom={sky("#2b86b0", "#3b3f7a")} line="#ffffff" lineO={0.45} n={22} />
      <path d={`M0 ${horizon + 120} Q300 ${horizon + 60} 620 ${horizon + 100} T${W} ${horizon + 90} V${H} H0Z`} fill={sky("#9ee0d8", "#b58a8a")} opacity={0.7} />
      <path d={`M0 ${horizon + 150} Q320 ${horizon + 90} 640 ${horizon + 130} T${W} ${horizon + 120} V${H} H0Z`} fill={sky("#f3dca5", "#d9a77a")} />
      <rect y={horizon + 420} width={W} height={H} fill={sky("#e8cb8e", "#c48e6a")} opacity={0.6} />
      {Array.from({ length: 18 }, (_, i) => <ellipse key={i} cx={rand(i + 40) * W} cy={horizon + 220 + rand(i + 60) * 760} rx={10 + rand(i) * 10} ry={4} fill="#c9a86a" opacity={0.5} />)}
      {children}
    </>
  );
};

// 1 — night; a dark island, a lighthouse; three lamps light one by one. Title card.
const Hook: FC<SceneProps> = ({ words, lead, frames }) => {
  const f = useCurrentFrame();
  const t1 = at(words, lead, 6) + 4, t2 = at(words, lead, 7) + 4, t3 = at(words, lead, 9);
  const on = [tween(f, t1, t1 + 6, 0, 1), tween(f, t2, t2 + 6, 0, 1), tween(f, t3, t3 + 6, 0, 1)];
  const warm = (on[0] + on[1] + on[2]) / 3;
  const z = tween(f, 0, frames, 1, 1.12);
  return (
    <>
      <Canvas>
        <Sky id="nsky" stops={[[0, "#05061a"], [0.6, "#0e1440"], [1, "#1a1f55"]]} />
        <Stars opacity={0.9} n={90} maxY={1050} />
        <Cam z={z} cx={540} cy={1150}>
          <Sea id="nsea" y={1060} top="#0c1236" bottom="#060820" line="#6f86d6" lineO={0.25} n={26} speed={0.6} />
          <path d="M60 1270 Q140 1150 300 1140 Q420 1060 560 1080 Q760 1080 860 1160 Q980 1200 1040 1290 Z" fill={interpolateColors(warm, [0, 1], ["#0a0c22", "#2a2236"])} />
          <path d="M60 1270 Q300 1240 540 1260 Q800 1250 1040 1290 L1040 1340 L60 1340Z" fill={interpolateColors(warm, [0, 1], ["#080a1c", "#211b2c"])} />
          <ellipse cx={550} cy={1290} rx={560} ry={60} fill="#7f9cff" opacity={0.08 + warm * 0.1} />
          <Lighthouse x={560} y={1110} s={0.95} shade={0.82 - warm * 0.2} />
          <Lamp x={250} y={1200} s={1.05} on={on[0]} shade={0.75} phase={0} />
          <Lamp x={420} y={1130} s={0.9} on={on[1]} shade={0.75} phase={7} />
          <Lamp x={800} y={1170} s={1.0} on={on[2]} shade={0.75} phase={13} />
          {on.map((o, i) => o > 0 && (
            <ellipse key={i} cx={[250, 420, 800][i]} cy={[1300, 1200, 1270][i]} rx={60} ry={14} fill="#ffcf6a" opacity={o * 0.25 + wave(f, 0.05, 20, i * 9)} />
          ))}
        </Cam>
        <Vignette o={1 - warm * 0.3} />
      </Canvas>
      <Caption text="Hari ke-1:" top={170} size={72} color="#ffd98a" o={tween(f, 6, 24, 0, 1)} y={tween(f, 6, 24, 30, 0)} />
      <Caption text="Pulau ini punya nama" top={250} size={96} o={tween(f, 14, 32, 0, 1)} y={tween(f, 14, 32, 30, 0)} />
    </>
  );
};

/** One resident walking in from `fromX` to `toX`, arriving at `arrive`, then facing front. */
const Walker: FC<{ i: number; fromX: number; toX: number; y: number; start: number; arrive: number; s?: number; wave?: boolean; cheer?: number }> = ({
  i, fromX, toX, y, start, arrive, s = 1, wave: waving = false, cheer = 0,
}) => {
  const f = useCurrentFrame();
  const r = RESIDENTS[i];
  if (f < start) return null;
  const x = interpolate(f, [start, arrive], [fromX, toX], { extrapolateRight: "clamp", easing: Easing.out(Easing.quad) });
  const walking = f < arrive;
  const hop = cheer > 0 ? Math.abs(Math.sin((f + i * 7) / 6)) * -30 * cheer : 0;
  return (
    <g>
      <Shadow x={x} y={y + 100 * s} w={60 * s} />
      {walking
        ? <AruSide x={x} y={y + Math.abs(Math.sin(f / 4)) * -6} s={s} flip={toX < fromX} pose={walkPose(f / 4)} pal={r.pal} style={r.style} mood="smile" />
        : <AruFront x={x} y={y + hop} s={s} pal={r.pal} style={r.style} mood={cheer > 0 ? "grin" : "smile"} bob={wave(f, 3, 50, i * 20)}
          armR={cheer > 0 ? [150 + wave(f, 10, 8), 20] : waving ? [120 + wave(f, 25, 10), 30] : [14, 8]}
          armL={cheer > 0 ? [150 + wave(f, 10, 8, 4), 20] : [14, 8]} look={toX < 540 ? 6 : -6} />}
    </g>
  );
};

/** The PENDUDUK counter (top). `n` is the current count; `p` pulses on change. */
const Count: FC<{ n: number; p: number; from?: number }> = ({ n, p, from = 1 }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top: 120, display: "flex", justifyContent: "center" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 22, padding: "16px 44px 8px", borderRadius: 999, background: "rgba(10,22,36,.7)",
      border: `4px solid rgba(255,210,90,${0.45 + p * 0.55})`, transform: `scale(${1 + p * 0.1})`, boxShadow: `0 0 ${20 + p * 50}px rgba(255,200,90,${0.25 + p * 0.4})`,
      fontFamily, fontWeight: 800, fontSize: 70, color: "#ffe6a8" }}>
      <span>Penduduk:</span>
      {n > from && <><span style={{ color: "#cfd9e3" }}>{from}</span><span style={{ color: "#cfd9e3" }}>→</span></>}
      <span style={{ color: "#fff", display: "inline-block", minWidth: 44, transform: `scale(${1 + p * 0.35})` }}>{n}</span>
    </div>
  </div>
);

// 2 — morning camp; three residents walk in, the counter climbs 1 → 4, Aru waves them in.
const Arrive: FC<SceneProps> = ({ words, lead }) => {
  const f = useCurrentFrame();
  const a = [at(words, lead, 2), at(words, lead, 5), at(words, lead, 7)];
  const n = 1 + a.filter((t) => f >= t).length;
  const last = [...a].reverse().find((t) => f >= t) ?? -99;
  const p = clamp01(1 - (f - last) / 14);
  const greet = at(words, lead, 8);
  return (
    <>
      <Canvas>
        <Beach>
          <Palm x={1010} y={1120} h={520} lean={-90} trunk="#8a6040" leaf="#3d9a52" leafD="#2c7a40" />
          <Palm x={70} y={1060} h={380} lean={60} trunk="#8a6040" leaf="#3d9a52" leafD="#2c7a40" phase={40} />
          <Tent x={300} y={1100} s={0.85} />
          <Campfire x={560} y={1330} s={0.75} glow={0.45} />
          <Walker i={2} fromX={-120} toX={380} y={1150} start={a[2] - 40} arrive={a[2]} s={0.88} cheer={f > greet + 10 ? 0.6 : 0} />
          <Walker i={0} fromX={-140} toX={190} y={1240} start={a[0] - 36} arrive={a[0]} cheer={f > greet + 10 ? 0.6 : 0} />
          <Walker i={1} fromX={1240} toX={910} y={1250} start={a[1] - 40} arrive={a[1]} cheer={f > greet + 10 ? 0.6 : 0} />
          <Shadow x={735} y={1330} />
          <AruFront x={735} y={1230 + (f > greet ? Math.abs(Math.sin(f / 6)) * -26 : 0)} mood={f > greet ? "grin" : "smile"} bob={wave(f, 3, 45)}
            armR={f < a[0] ? [14, 8] : [125 + wave(f, 25, 9), 30]} armL={f > greet ? [140 + wave(f, 12, 8, 3), 25] : [14, 8]} look={f < a[1] ? -8 : 8} />
        </Beach>
      </Canvas>
      <Count n={n} p={p} />
    </>
  );
};

// 3 — Aru walks to the Batu Nama, opens the panel; three names carve themselves; it glows on "Selamanya".
const Carve: FC<SceneProps> = ({ words, lead, frames }) => {
  const f = useCurrentFrame();
  const carveAt = at(words, lead, 4), forever = at(words, lead, 7);
  const arrive = 40;
  const x = tween(f, 0, arrive, 120, 330);
  const open = tween(f, arrive + 2, carveAt - 4, 0, 1);
  const names = interpolate(f, [carveAt - 6, forever - 4], [0, 3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const glow = tween(f, forever, forever + 15, 0, 1);
  const z = tween(f, 0, frames, 1, 1.08);
  return (
    <>
      <Canvas>
        <Beach horizon={860}>
          <Cam z={z} cx={640} cy={900}>
            <Palm x={60} y={1140} h={600} lean={80} trunk="#8a6040" leaf="#3d9a52" leafD="#2c7a40" />
            <NameStone x={680} y={1330} s={1.12} open={open} names={names} glow={glow} />
            <Shadow x={x} y={1335} />
            <AruSide x={x} y={1235 + (f < arrive ? Math.abs(Math.sin(f / 4)) * -6 : 0)} pose={f < arrive ? walkPose(f / 4) : { armF: [open < 1 ? 70 : 20, 20], armB: [-10, 20], head: f > forever ? -8 : 0 }}
              mood={f > forever ? "smile" : f > carveAt ? "awe" : "calm"} />
          </Cam>
        </Beach>
        {glow > 0 && Array.from({ length: 16 }, (_, i) => {
          const t = ((f - forever + i * 9) % 60) / 60;
          return <circle key={i} cx={680 + (rand(i) - 0.5) * 420} cy={1150 - t * 600} r={6 * (1 - t) + 2} fill="#fff1b8" opacity={glow * (1 - t)} />;
        })}
      </Canvas>
      <Caption text="Selamanya." top={170} size={100} color="#ffe6a8" o={glow} s={0.8 + glow * 0.2} />
    </>
  );
};

const CARD_H = 140;
const WINNER = 11;
const Tabs: FC<{ active: "Undian" | "Kelola" }> = ({ active }) => (
  <div style={{ display: "flex", gap: 14, padding: "70px 24px 0" }}>
    {["Warga", "Undian", "Kelola"].map((t) => (
      <div key={t} style={{ flex: 1, textAlign: "center", padding: "14px 0 8px", borderRadius: 22, fontFamily, fontWeight: 800, fontSize: 40,
        background: t === active ? UI.accent : UI.panel, color: t === active ? "#1b2a3a" : UI.dim }}>{t}</div>
    ))}
  </div>
);

// 4 — the Undian tab: comments are pasted in, UNDI is pressed, cards shuffle and stop.
const Draw: FC<SceneProps> = ({ words, lead }) => {
  const f = useCurrentFrame();
  const press = at(words, lead, 6); // "undian"
  const stop = at(words, lead, 10); // "terpilih"
  const roll = interpolate(f, [press + 6, stop], [0, WINNER * CARD_H], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const rolling = f > press + 6;
  const hi = tween(f, stop, stop + 8, 0, 1);
  const pressT = clamp01(1 - Math.abs(f - press) / 6);
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 35%, #24486a, #0b1624 70%)" }}>
      {Array.from({ length: 10 }, (_, i) => (
        <div key={i} style={{ position: "absolute", left: rand(i) * W, top: ((rand(i + 4) * H - f * (1 + rand(i) * 2)) % H + H) % H, width: 14, height: 14, borderRadius: 7, background: "#5f86a6", opacity: 0.4 }} />
      ))}
      <Phone top={110} w={900} h={1300}>
        <Tabs active="Undian" />
        <div style={{ padding: "26px 34px 0", fontFamily, fontWeight: 800, fontSize: 38, color: UI.dim }}>{rolling ? "Mengacak komentar…" : "Tempel komentar:"}</div>
        {/* window of cards */}
        <div style={{ position: "absolute", left: 34, right: 34, top: 250, height: 3 * CARD_H + 20, overflow: "hidden", borderRadius: 26, background: "rgba(0,0,0,.25)" }}>
          <div style={{ position: "absolute", left: 22, top: 10 + (rolling ? -roll + CARD_H : 0) }}>
            {Array.from({ length: WINNER + 3 }, (_, i) => {
              const inAt = 8 + i * 5;
              const vis = rolling ? 1 : tween(f, inAt, inAt + 8, 0, 1);
              const win = i === WINNER;
              return (
                <div key={i} style={{ height: CARD_H, opacity: vis, transform: `translateX(${(1 - vis) * 200}px)` }}>
                  <CommentCard seed={i * 3 + 1} w={740} name={win ? "SUPREME®" : undefined} text={win ? "namanya ganti pulau netizen" : undefined} hi={win ? hi : 0}
                    style={{ filter: rolling && f < stop - 8 ? `blur(${Math.min(6, (stop - f) / 10)}px)` : "none" }} />
                </div>
              );
            })}
          </div>
          {/* selection frame */}
          <div style={{ position: "absolute", left: 10, right: 10, top: CARD_H + 2, height: CARD_H + 6, borderRadius: 30, border: `6px solid ${rolling ? UI.accent : "transparent"}`,
            boxShadow: rolling ? `0 0 ${20 + hi * 40}px rgba(255,210,90,.7)` : "none" }} />
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 830, display: "flex", justifyContent: "center" }}>
          <Btn label={f >= stop ? "TERPILIH!" : "UNDI"} press={pressT} color={f >= stop ? UI.green : UI.accent} w={520} size={68} />
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 1010, textAlign: "center", fontFamily, fontWeight: 800, fontSize: 36, color: UI.dim }}>
          {WINNER + 3} komentar diundi
        </div>
        {f > press - 12 && f < press + 16 && <Tap x={428} y={880} t={(f - press) / 14} />}
      </Phone>
    </AbsoluteFill>
  );
};

// 5 — the winning comment, big; confetti on "SUPREME"; "Pulau Netizen" stamps in on the name.
const Winner: FC<SceneProps> = ({ words, lead }) => {
  const f = useCurrentFrame();
  const sup = at(words, lead, 2), name = at(words, lead, 5);
  const card = pop(f, 0, 16);
  const stamp = pop(f, name, 10);
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 40%, #ffcf5a, #f08a3c 55%, #8a3a5a)" }}>
      <AbsoluteFill>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
          <g transform={`rotate(${f * 0.4} 540 760)`}>
            {Array.from({ length: 16 }, (_, i) => <path key={i} d={`M540 760 L${540 + Math.cos((i / 16) * Math.PI * 2) * 1600} ${760 + Math.sin((i / 16) * Math.PI * 2) * 1600} L${540 + Math.cos(((i + 0.5) / 16) * Math.PI * 2) * 1600} ${760 + Math.sin(((i + 0.5) / 16) * Math.PI * 2) * 1600}Z`} fill="#fff" opacity={0.12} />)}
          </g>
        </svg>
      </AbsoluteFill>
      <Caption text="Komentar terpilih" top={170} size={78} color="#fff7e0" o={tween(f, 4, 16, 0, 1)} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 560, display: "flex", justifyContent: "center", transform: `scale(${1.35 * card}) rotate(${wave(f, 1.5, 70)}deg)` }}>
        <CommentCard seed={34} w={680} name="SUPREME®" text="namanya ganti pulau netizen" hi={1} style={{ boxShadow: "0 20px 50px rgba(0,0,0,.3)" }} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 930, textAlign: "center", opacity: clamp01(stamp * 2), transform: `scale(${stamp > 0 ? 2.2 - 1.2 * stamp : 0}) rotate(-6deg)` }}>
        <span style={{ display: "inline-block", padding: "18px 50px 6px", borderRadius: 30, border: "10px solid #fff", fontFamily, fontWeight: 800, fontSize: 120, color: "#fff",
          background: "rgba(200,40,70,.85)", textShadow: "0 6px 0 rgba(0,0,0,.25)" }}>Pulau Netizen</span>
      </div>
      <AbsoluteFill>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
          <Confetti at={sup} x={540} y={650} n={70} />
          <Confetti at={name + 4} x={540} y={1000} n={50} />
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Camp scene with everyone; used for the rename reveal. */
const Camp: FC<{ cheer: number }> = ({ cheer }) => {
  const f = useCurrentFrame();
  const hop = (i: number) => Math.abs(Math.sin((f + i * 9) / 6)) * -30 * cheer;
  return (
    <Beach>
      <Palm x={1010} y={1120} h={520} lean={-90} trunk="#8a6040" leaf="#3d9a52" leafD="#2c7a40" />
      <Tent x={300} y={1100} s={0.85} />
      <NameStone x={830} y={1120} s={0.55} names={3} open={1} />
      <Campfire x={560} y={1330} s={0.75} glow={0.4} />
      {[{ i: 2, x: 380, y: 1150, s: 0.88 }, { i: 0, x: 190, y: 1240, s: 1 }, { i: 1, x: 910, y: 1250, s: 1 }].map(({ i, x, y, s }) => (
        <g key={i}>
          <Shadow x={x} y={y + 100 * s} w={60 * s} />
          <AruFront x={x} y={y + hop(i + 1)} s={s} pal={RESIDENTS[i].pal} style={RESIDENTS[i].style} mood={cheer > 0.5 ? "grin" : "smile"}
            armL={[30 + cheer * 120 + wave(f, 10, 8, i), 20]} armR={[30 + cheer * 120 + wave(f, 10, 8, i + 4), 20]} bob={wave(f, 3, 50, i * 20)} />
        </g>
      ))}
      <Shadow x={735} y={1330} />
      <AruFront x={735} y={1230 + hop(0)} mood="grin" armL={[40 + cheer * 110 + wave(f, 12, 8), 25]} armR={[40 + cheer * 110 + wave(f, 12, 8, 3), 25]} />
    </Beach>
  );
};

// 6 — Kelola → Pulau: rename and publish; cut to the island, the HUD flips to "Pulau Netizen", everyone cheers.
const Rename: FC<SceneProps> = ({ words, lead }) => {
  const f = useCurrentFrame();
  const pub = at(words, lead, 3) - 2; // "namanya"
  const cut = at(words, lead, 4) - 4; // "Pulau"
  const flip = tween(f, cut + 4, at(words, lead, 5) + 6, 0, 1);
  const old = "Pulau Tanpa Nama", neu = "Pulau Netizen";
  const del = Math.round(interpolate(f, [4, 16], [old.length, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const typ = Math.round(interpolate(f, [17, pub - 8], [0, neu.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const field = f < 17 ? old.slice(0, del) : neu.slice(0, typ);
  const cheer = tween(f, at(words, lead, 8), at(words, lead, 8) + 10, 0.3, 1);
  if (f < cut) {
    const pressT = clamp01(1 - Math.abs(f - pub) / 5);
    return (
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 35%, #24486a, #0b1624 70%)" }}>
        <Phone top={110} w={900} h={1300}>
          <Tabs active="Kelola" />
          <div style={{ display: "flex", gap: 14, padding: "26px 34px 0" }}>
            {["Pulau", "Bangunan"].map((t) => (
              <div key={t} style={{ padding: "8px 30px 2px", borderRadius: 18, fontFamily, fontWeight: 800, fontSize: 36, color: t === "Pulau" ? UI.text : UI.dim,
                borderBottom: t === "Pulau" ? `6px solid ${UI.accent}` : "6px solid transparent" }}>{t}</div>
            ))}
          </div>
          <div style={{ padding: "50px 40px 0", fontFamily, fontWeight: 800, fontSize: 40, color: UI.dim }}>Nama pulau</div>
          <div style={{ margin: "14px 40px 0", height: 120, borderRadius: 24, background: "#0d1a28", border: `5px solid ${UI.accent}`, display: "flex", alignItems: "center",
            padding: "8px 30px 0", fontFamily, fontWeight: 800, fontSize: 64, color: UI.text }}>
            {field}<span style={{ width: 5, height: 64, marginLeft: 6, marginTop: -8, background: UI.accent, opacity: Math.floor(f / 8) % 2 ? 0 : 1 }} />
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 740, display: "flex", justifyContent: "center" }}>
            <Btn label={f > pub + 3 ? "Terbit ✓" : "Terbitkan"} press={pressT} color={f > pub + 3 ? UI.green : UI.accent} w={560} size={64} />
          </div>
          {f > pub - 10 && <Tap x={428} y={790} t={(f - pub) / 12} />}
        </Phone>
      </AbsoluteFill>
    );
  }
  return (
    <>
      <Canvas>
        <Camp cheer={cheer} />
        <Confetti at={at(words, lead, 5) + 4} x={540} y={300} n={60} />
      </Canvas>
      <Hud from="Pulau Tanpa Nama" to="Pulau Netizen" flip={flip} pulse={clamp01(Math.sin(flip * Math.PI))} />
    </>
  );
};

// 7 — a stone statue drops beside the Batu Nama; Aru jumps back, then grins. The statue blinks.
const Statue7: FC<SceneProps> = ({ words, lead }) => {
  const f = useCurrentFrame();
  const land = at(words, lead, 6) + 4; // "patung"
  const sy = interpolate(f, [land - 14, land], [-600, 1330], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.quad) });
  const squash = f >= land ? Math.max(0, Math.sin(((f - land) / 12) * Math.PI)) * (1 - clamp01((f - land) / 12)) : 0;
  const shake = f >= land && f < land + 10 ? wave(f, 8, 2) : 0;
  const startle = f >= land && f < land + 22;
  const ax = 520 - tween(f, land, land + 8, 0, 80);
  const blink = (f - land - 40) % 60 < 5 && f > land + 40 ? 1 : 0;
  return (
    <>
      <Canvas>
        <g transform={`translate(${shake} ${shake * 0.5})`}>
          <Beach horizon={860}>
            <Palm x={1040} y={1120} h={520} lean={-90} trunk="#8a6040" leaf="#3d9a52" leafD="#2c7a40" />
            <NameStone x={250} y={1330} s={0.95} names={3} open={1} />
            <Statue x={800} y={sy} s={1.0} squash={squash} blink={blink} />
            <Dust at={land} x={800} y={1330} />
            <Shadow x={ax} y={1335} />
            <AruSide x={ax} y={1235 + (startle ? -Math.sin(((f - land) / 22) * Math.PI) * 70 : 0)}
              pose={startle ? { armF: [150, 10], armB: [140, 10], legF: [20, -30], legB: [-20, -20], lean: -10 } : { armF: [f > land + 30 ? 60 : 10, 30], armB: [-10, 20] }}
              mood={startle ? "shout" : f > land + 22 ? "grin" : "calm"} />
          </Beach>
        </g>
      </Canvas>
      <Caption text="+ Patung" top={170} size={96} color="#ffe6a8" o={tween(f, land + 2, land + 12, 0, 1)} s={pop(f, land + 2, 12) || 0.01} />
    </>
  );
};

// 8 — dusk; the camera drifts to the broken boat and closes in on a neatly tied rope.
const Mystery: FC<SceneProps> = ({ words, lead, frames }) => {
  const f = useCurrentFrame();
  const knotX = 480 + 372 * 1.1, knotY = 1180 - 112 * 1.1;
  const z = interpolate(f, [0, 40, frames], [1, 1.05, 1.9], { extrapolateRight: "clamp", easing: Easing.inOut(Easing.quad) });
  const pan = tween(f, 0, frames, 1, 0);
  const ring = tween(f, at(words, lead, 4), at(words, lead, 4) + 14, 0, 1);
  return (
    <>
      <Canvas>
        <Sky id="dsky" stops={[[0, "#1d1a4a"], [0.45, "#6a3f7a"], [0.62, "#e3866a"]]} />
        <Stars opacity={0.5} n={40} maxY={600} />
        <circle cx={260} cy={1120} r={120} fill="#ffb27a" opacity={0.7} />
        <Cam z={z} cx={knotX} cy={knotY} dx={(540 - knotX) * (1 - pan)} dy={(820 - knotY) * (1 - pan)}>
          {[-1, 0, 1].map((k) => (
            <g key={k} transform={`translate(${k * W} 0)`}>
              <Sea id={`dsea${k + 1}`} y={1050} top="#5a4a8a" bottom="#2a2a5a" line="#ffd0a8" lineO={0.3} n={24} speed={0.5} />
            </g>
          ))}
          <path d="M-1200 1180 L0 1180 Q400 1110 760 1150 Q1000 1185 1300 1170 Q1700 1150 2400 1160 V2400 H-1200Z" fill="#b58a7a" />
          <path d="M-1200 1230 L0 1230 Q400 1170 760 1200 Q1000 1230 1300 1220 Q1700 1205 2400 1210 V2400 H-1200Z" fill="#9a7268" />
          <Boat x={480} y={1180} s={1.1} shade={0.25} />
          {Array.from({ length: 6 }, (_, i) => <ellipse key={i} cx={180 + i * 150} cy={1290 + rand(i) * 120} rx={14} ry={6} fill="#6e5050" opacity={0.6} />)}
          {ring > 0 && <circle cx={knotX - 12} cy={knotY + 10} r={70 + (1 - ring) * 80} fill="none" stroke="#ffe08a" strokeWidth={6} opacity={ring * (0.7 + wave(f, 0.3, 20))} strokeDasharray="14 10" />}
        </Cam>
        <Vignette o={0.6 + pan * 0.2} />
      </Canvas>
      <Caption text="Petunjuk #1" top={170} size={88} color="#ffe08a" o={ring} y={(1 - ring) * 20} />
      <Caption text="tali diikat rapi…" top={280} size={56} color="#f4e6ff" o={tween(f, at(words, lead, 4) + 18, at(words, lead, 4) + 34, 0, 1)} />
    </>
  );
};

/** The game as seen on the phone: a little island from above, with a walking resident. */
const GameScreen: FC<{ walk: number; found: number }> = ({ walk, found }) => {
  const f = useCurrentFrame();
  const px = interpolate(walk, [0, 1], [120, 400]), py = interpolate(walk, [0, 1], [700, 470]);
  return (
    <svg viewBox="0 0 856 1256" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
      <rect width={856} height={1256} fill="#2b8fb8" />
      {Array.from({ length: 14 }, (_, i) => <path key={i} d={`M${((rand(i) * 900 + f * 1.5) % 980) - 60} ${rand(i + 9) * 1256} q30 -8 60 0`} stroke="#fff" strokeOpacity={0.35} strokeWidth={5} fill="none" strokeLinecap="round" />)}
      <Island x={428} y={640} rx={360} ry={300} sand="#f0d79c" wet="#d9b97a" shallow="#6fd0d8" />
      <ellipse cx={280} cy={560} rx={110} ry={70} fill="#7cc66a" opacity={0.7} />
      <Palm x={620} y={560} h={180} lean={-30} trunk="#8a6040" leaf="#3d9a52" leafD="#2c7a40" />
      <Tent x={240} y={520} s={0.4} />
      <NameStone x={440} y={480} s={0.34} names={3} open={1} glow={found} />
      <Statue x={540} y={500} s={0.28} />
      <Campfire x={400} y={760} s={0.35} glow={0.3} />
      <Shadow x={px} y={py + 34} w={22} />
      <AruSide x={px} y={py} s={0.34} pose={walk < 1 ? walkPose(f / 4) : {}} pal={RESIDENTS[0].pal} style={RESIDENTS[0].style} mood="smile" />
      {found > 0 && (
        <g opacity={found} transform={`translate(440 ${300 - found * 20})`}>
          <rect x={-120} y={-44} width={240} height={70} rx={20} fill="#fff4cf" stroke="#ffd25a" strokeWidth={5} />
          <text x={0} y={6} textAnchor="middle" fontFamily={fontFamily} fontWeight={800} fontSize={42} fill="#1b2a3a">@kamu</text>
        </g>
      )}
    </svg>
  );
};

/** What to build tomorrow: three little ideas, drawn simply. */
const Ideas: FC<{ o: number }> = ({ o }) => {
  const f = useCurrentFrame();
  const items = [
    <g key="hut"><path d="M-80 0 L-80 -80 L80 -80 L80 0Z" fill="#c98b5f" /><path d="M-110 -80 L0 -160 L110 -80Z" fill="#d9a441" /><rect x={-20} y={-55} width={40} height={55} fill="#5b3b25" /></g>,
    <g key="jetty"><rect x={-110} y={-50} width={220} height={30} fill="#a8774a" />{[-90, -30, 30, 90].map((x) => <rect key={x} x={x - 6} y={-20} width={12} height={40} fill="#6b4428" />)}<path d="M-120 20 q30 -10 60 0 t60 0 t60 0 t60 0" stroke="#5aa8ff" strokeWidth={8} fill="none" /></g>,
    <g key="garden">{[-60, 0, 60].map((x, i) => <g key={x}><path d={`M${x} 0 v-60`} stroke="#3d9a52" strokeWidth={8} /><circle cx={x} cy={-70} r={24} fill={["#ff6b5a", "#ffd25a", "#ff9ad5"][i]} /></g>)}<rect x={-100} y={0} width={200} height={24} rx={10} fill="#6b4a2e" /></g>,
  ];
  return (
    <g opacity={o}>
      {items.map((it, i) => (
        <g key={i} transform={`translate(${200 + i * 340} ${1130 + wave(f, 14, 40, i * 13)}) scale(${1.0 + 0.2 * o})`}>
          <circle cx={0} cy={-60} r={140} fill="#fff" opacity={0.12} />
          {it}
          <text x={0} y={90} textAnchor="middle" fontFamily={fontFamily} fontWeight={800} fontSize={60} fill="#ffe6a8">?</text>
        </g>
      ))}
    </g>
  );
};

// 9 — the phone opens the game: log in, walk as a resident, find your name. Link card; closing question.
const Visit: FC<SceneProps> = ({ words, lead }) => {
  const f = useCurrentFrame();
  const open = at(words, lead, 5), user = at(words, lead, 7), find = at(words, lead, 10), stone = at(words, lead, 14), ask = at(words, lead, 16);
  const login = f >= open + 6;
  const inGame = f >= find - 6;
  const typed = "@kamu".slice(0, Math.round(interpolate(f, [user + 4, user + 30], [0, 5], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })));
  const walk = tween(f, find, stone + 6, 0, 1);
  const found = tween(f, stone + 4, stone + 14, 0, 1);
  const out = tween(f, ask - 6, ask + 14, 0, 1);
  const linkIn = tween(f, 0, 16, 0, 1);
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 30%, #2a5a7a, #0b1624 75%)" }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 120, textAlign: "center", opacity: linkIn, fontFamily, fontWeight: 800 }}>
        <div style={{ display: "inline-block", padding: "16px 50px 6px", borderRadius: 36, background: UI.accent, color: "#1b2a3a", fontSize: 92,
          transform: `scale(${1 + clamp01(1 - Math.abs(f - open) / 10) * 0.08})` }}>bit.ly/pulau-ara</div>
        <div style={{ marginTop: 14, fontSize: 52, color: "#fff7e0", textShadow: "0 4px 0 rgba(0,0,0,.3)" }}>link juga di bio</div>
      </div>
      <div style={{ opacity: 1 - out, transform: `translateY(${out * 200}px)` }}>
        <Phone top={420} w={760} h={1000} rot={wave(f, 1.2, 90)}>
          {!login && (
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 30, fontFamily, fontWeight: 800 }}>
              <div style={{ fontSize: 70, color: UI.text }}>Pulau Netizen</div>
              <div style={{ fontSize: 36, color: UI.dim }}>Pulau yang diatur warganya</div>
              <Btn label="Buka" press={clamp01(1 - Math.abs(f - open) / 5)} w={340} />
            </div>
          )}
          {login && !inGame && (
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 26, fontFamily, fontWeight: 800 }}>
              <div style={{ fontSize: 44, color: UI.dim }}>Username TikTok</div>
              <div style={{ width: 560, height: 110, borderRadius: 24, background: "#0d1a28", border: `5px solid ${UI.accent}`, display: "flex", alignItems: "center", padding: "6px 30px 0", boxSizing: "border-box", fontSize: 60, color: UI.text }}>
                {typed}<span style={{ width: 5, height: 56, marginLeft: 6, marginTop: -8, background: UI.accent, opacity: Math.floor(f / 8) % 2 ? 0 : 1 }} />
              </div>
              <Btn label="Masuk" press={clamp01(1 - Math.abs(f - (find - 10)) / 5)} w={340} color={UI.green} />
            </div>
          )}
          {inGame && <>
            <GameScreen walk={walk} found={found} />
            <div style={{ position: "absolute", left: 0, right: 0, top: 70, textAlign: "center", fontFamily, fontWeight: 800 }}>
              <span style={{ padding: "8px 26px 2px", borderRadius: 20, background: "rgba(10,22,36,.75)", color: UI.accent, fontSize: 40 }}>Pulau Netizen</span>
            </div>
          </>}
          {f > open - 10 && f < open + 14 && <Tap x={358} y={560} t={(f - open) / 12} />}
        </Phone>
      </div>
      {out > 0 && <>
        <Caption text="Komentar:" top={440} size={80} color="#ffd98a" o={out} y={(1 - out) * 30} />
        <Caption text="Besok kita bangun apa?" top={540} size={116} o={tween(f, at(words, lead, 17) - 4, at(words, lead, 17) + 10, 0, 1)}
          s={pop(f, at(words, lead, 17) - 4, 14) || 0.01} />
        <AbsoluteFill><svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%"><Ideas o={tween(f, at(words, lead, 20), at(words, lead, 20) + 14, 0, 1)} /></svg></AbsoluteFill>
      </>}
    </AbsoluteFill>
  );
};

export const scenes = [Hook, Arrive, Carve, Draw, Winner, Rename, Statue7, Mystery, Visit];
