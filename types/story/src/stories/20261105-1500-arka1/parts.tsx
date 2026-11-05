import type { CSSProperties, FC, ReactNode } from "react";
import { AbsoluteFill, Easing, Img, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { baloo } from "../../lib/fonts";
import type { Word } from "../../lib/Story";
import { rand, tween, wave } from "../../lib/kit";

export const W = 1080, H = 1920;
export const ID = "20261105-1500-arka1";
export const fontFamily = baloo;
const ui = `"Inter", "Segoe UI", system-ui, sans-serif`;

/** Story palette: act 1 grey Bandung morning, act 2 the phone, act 3 warm dusk. */
export const C = {
  skin: "#c98d5e", skinDark: "#a8703f", hair: "#1c1715", shirt: "#3f7cc7", shirtDark: "#2c5c99", trousers: "#2d3142", bag: "#9a7b55", ink: "#2b1d16",
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


export type Mood = "calm" | "sad" | "smile" | "cry" | "hope";
const Face: FC<{ mood: Mood; blink: number; look?: number; skin: string; talk?: number }> = ({ mood, blink, look = 0, talk = 0 }) => {
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
          {talk > 0.05 ? (
            <ellipse cx={0} cy={16} rx={6 + talk * 2} ry={1.5 + talk * 6} fill="#5a2a22" />
          ) : (
            <path d={mood === "smile" || mood === "hope" ? "M-9 14 Q0 22 9 14" : "M-6 16 L6 16"} stroke={C.ink} strokeWidth={3} fill="none" strokeLinecap="round" />
          )}
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

// ───────────────────────── episode 3: Arka, Bandung ─────────────────────────

export type Pose = "stand" | "phone" | "sit" | "iron" | "lean" | "walk" | "folder";

/**
 * Arka, 24, former sewer at a Bandung garment factory: short black hair, plain blue short-sleeved shirt
 * (`top` swaps it, e.g. a white singlet while he irons), dark trousers. Origin at the feet, about 440 units tall at s=1.
 * pose: stand · phone (looking down at a lit phone) · sit (cross-legged) · iron (right hand forward) · lean (forearms on a rail,
 * drawn from the waist up) · walk (legs swing) · folder (a document folder held at the chest).
 */
export const Arka: FC<{ x: number; y: number; s?: number; pose?: Pose; mood?: Mood; flip?: boolean; look?: number; top?: string; glow?: number; bag?: boolean }> = ({
  x, y, s = 1, pose = "stand", mood = "calm", flip, look = 0, top = C.shirt, glow = 0, bag,
}) => {
  const f = useCurrentFrame();
  const blink = useBlink(4);
  const br = wave(f, 1.2, 82, 10);
  const swing = pose === "walk" ? wave(f, 16, 18) : 0;
  const singlet = top !== C.shirt;
  const sleeve = singlet ? C.skin : top;
  const head = pose === "phone" || pose === "sit" ? 8 : pose === "iron" ? 6 : 0; // looking down
  const arms: Record<Pose, [string, string, [number, number], [number, number]]> = {
    stand: ["M-52 -282 Q-66 -212 -58 -152", "M52 -282 Q66 -212 58 -152", [-58, -148], [58, -148]],
    walk: [`M-52 -282 Q-66 -212 ${-58 - swing * 0.8} -152`, `M52 -282 Q66 -212 ${58 + swing * 0.8} -152`, [-58 - swing * 0.8, -148], [58 + swing * 0.8, -148]],
    phone: ["M-52 -282 Q-72 -214 -16 -206", "M52 -282 Q72 -214 16 -206", [-16, -204], [16, -204]],
    sit: ["M-52 -282 Q-72 -214 -16 -206", "M52 -282 Q72 -214 16 -206", [-16, -204], [16, -204]],
    folder: ["M-52 -282 Q-80 -220 -26 -222", "M52 -282 Q80 -220 26 -222", [-26, -222], [26, -222]],
    iron: ["M-52 -282 Q-70 -214 -50 -170", `M52 -282 Q110 -250 ${150 + wave(f, 36, 34)} -214`, [-50, -166], [150 + wave(f, 36, 34), -214]],
    lean: ["M-52 -282 Q-80 -220 -40 -196", "M52 -282 Q80 -220 40 -196", [-40, -196], [40, -196]],
  };
  const [armL, armR, hL, hR] = arms[pose];
  const legs =
    pose === "sit" ? (
      <path d="M-70 -10 Q-40 -60 0 -40 Q40 -60 70 -10 Q60 6 0 2 Q-60 6 -70 -10Z" fill={C.trousers} />
    ) : pose === "lean" ? null : (
      <>
        <path d={`M-44 -196 L${-48 + swing * 0.5} 0 L${-12 + swing * 0.5} 0 L0 -150 L${10 - swing * 0.5} 0 L${48 - swing * 0.5} 0 L44 -196Z`} fill={C.trousers} />
        <path d={`M${-54 + swing * 0.5} 0 h44 v8 h-48Z M${12 - swing * 0.5} 0 h44 l4 8 h-48Z`} fill="#1b1b1f" />
      </>
    );
  const lift = pose === "sit" ? 150 : 0; // seated: the body sits on the folded legs
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      {legs}
      <g transform={`translate(0 ${lift})`}>
        {bag && <path d="M-40 -300 L44 -170" stroke={C.bag} strokeWidth={7} />}
        {bag && <rect x={30} y={-196} width={62} height={70} rx={10} fill={C.bag} stroke="#7a5e3d" strokeWidth={3} />}
        {/* shirt: collar and buttons, or a singlet */}
        <path d={`M-54 ${-192 + br} Q-62 -300 0 -312 Q62 -300 54 ${-192 + br}Z`} fill={top} />
        {singlet ? (
          <path d="M-24 -308 Q0 -270 24 -308" stroke={C.skin} strokeWidth={14} fill="none" />
        ) : (
          <>
            <path d="M-22 -308 L0 -282 L-6 -270 L-30 -296Z M22 -308 L0 -282 L6 -270 L30 -296Z" fill="#e9eef6" />
            <path d="M0 -280 V-196" stroke={C.shirtDark} strokeWidth={3} />
            {[-262, -236, -210].map((yy) => <circle key={yy} cx={0} cy={yy} r={3.2} fill="#e9eef6" />)}
            <rect x={18} y={-262} width={24} height={20} rx={3} fill="none" stroke={C.shirtDark} strokeWidth={3} />
          </>
        )}
        <path d={armL} stroke={sleeve} strokeWidth={26} strokeLinecap="round" fill="none" />
        <path d={armR} stroke={sleeve} strokeWidth={26} strokeLinecap="round" fill="none" />
        {!singlet && <path d="M-52 -282 Q-62 -256 -62 -236 M52 -282 Q62 -256 62 -236" stroke={top} strokeWidth={30} strokeLinecap="round" fill="none" />}
        {(pose === "phone" || pose === "sit") && (
          <>
            <ellipse cx={0} cy={-236} rx={70 * glow} ry={60 * glow} fill="#cfe8ff" opacity={0.35 * glow} />
            <rect x={-20} y={-240} width={40} height={64} rx={7} fill="#1d2233" />
            <rect x={-16} y={-235} width={32} height={52} rx={4} fill="#9fd0ff" opacity={0.4 + 0.6 * glow} />
          </>
        )}
        {pose === "folder" && <rect x={-46} y={-262} width={92} height={70} rx={4} fill="#f1d58a" stroke="#b8913d" strokeWidth={3} transform="rotate(-4 0 -226)" />}
        <circle cx={hL[0]} cy={hL[1]} r={11} fill={C.skin} />
        <circle cx={hR[0]} cy={hR[1]} r={11} fill={C.skin} />
        {/* head: short black hair with a side part */}
        <g transform={`translate(0 ${-362 + br}) rotate(${head})`}>
          <rect x={-10} y={26} width={20} height={26} fill={C.skin} />
          <ellipse cx={-38} cy={6} rx={8} ry={12} fill={C.skinDark} />
          <ellipse cx={38} cy={6} rx={8} ry={12} fill={C.skinDark} />
          <ellipse cx={0} cy={2} rx={38} ry={44} fill={C.skin} />
          <path d="M-40 -2 Q-46 -52 -4 -54 Q40 -56 42 -6 Q36 -30 20 -34 Q-6 -24 -30 -34 Q-38 -22 -40 -2Z" fill={C.hair} />
          <path d="M-30 -34 Q-10 -48 12 -40" stroke="#3a302b" strokeWidth={3} fill="none" />
          <g transform={`translate(0 ${head > 0 ? 3 : 0})`}>
            <Face mood={mood} blink={head > 0 ? Math.max(blink, 0.45) : blink} skin={C.skin} look={look} />
          </g>
        </g>
      </g>
    </g>
  );
};

/** Bandung's mountains on the horizon, two layers. */
export const Mountains: FC<{ y: number; back: string; front: string }> = ({ y, back, front }) => (
  <>
    <path d={`M0 ${y} L120 ${y - 150} L230 ${y - 90} L380 ${y - 260} L520 ${y - 120} L640 ${y - 200} L800 ${y - 70} L930 ${y - 210} L${W} ${y - 120} V${y + 200} H0Z`} fill={back} />
    <path d={`M0 ${y + 40} Q160 ${y - 70} 330 ${y + 10} T700 ${y - 30} T${W} ${y + 10} V${y + 260} H0Z`} fill={front} />
  </>
);

/** The garment factory: saw-tooth roof, a chimney (`smoke` 0…1), a closed sliding gate and a notice board with the list. */
export const Factory: FC<{ smoke: number; list: number }> = ({ smoke, list }) => {
  const f = useCurrentFrame();
  return (
    <g>
      {/* building */}
      <rect x={120} y={760} width={860} height={420} fill="#8c96a3" />
      {Array.from({ length: 6 }, (_, i) => (
        <path key={i} d={`M${120 + i * 143} 760 l143 -90 v90Z`} fill={i % 2 ? "#6f7986" : "#7a8592"} />
      ))}
      {Array.from({ length: 6 }, (_, i) => <rect key={i} x={160 + i * 136} y={830} width={90} height={60} rx={4} fill="#5c6673" opacity={0.8} />)}
      <rect x={830} y={480} width={60} height={290} fill="#6b5a4e" />
      <rect x={824} y={470} width={72} height={20} fill="#5a4a40" />
      {/* smoke that stops */}
      {Array.from({ length: 6 }, (_, i) => {
        const t = ((f / 60 + i / 6) % 1);
        return <circle key={i} cx={860 + t * 120 + wave(f, 10, 40, i * 9)} cy={440 - t * 280} r={26 + t * 40} fill="#dfe3e8" opacity={smoke * (1 - t) * 0.8} />;
      })}
      {/* wall, gate and sign */}
      <rect x={0} y={1060} width={W} height={160} fill="#b9ad9a" />
      <rect x={300} y={980} width={480} height={240} fill="#3d4450" />
      {Array.from({ length: 16 }, (_, i) => <rect key={i} x={312 + i * 29.5} y={990} width={10} height={230} fill="#59616e" />)}
      <rect x={300} y={1090} width={480} height={12} fill="#59616e" />
      <rect x={270} y={920} width={34} height={300} fill="#8a7d69" />
      <rect x={776} y={920} width={34} height={300} fill="#8a7d69" />
      <rect x={330} y={900} width={420} height={70} rx={8} fill="#2f3a52" />
      <text x={540} y={948} textAnchor="middle" fontFamily={fontFamily} fontWeight={800} fontSize={42} fill="#f3eee2" letterSpacing={6}>PABRIK GARMEN</text>
      <path d="M520 1090 h40 v16 h-40Z" fill="#c4b04a" />
      {/* notice board with the list */}
      <g transform="translate(870 1010)">
        <rect x={-6} y={60} width={12} height={150} fill="#6b5a4e" />
        <rect x={-90} y={-70} width={180} height={150} rx={6} fill="#8a6a4a" />
        <rect x={-74} y={-56} width={148} height={122} fill="#fbf7ee" />
        <text x={0} y={-30} textAnchor="middle" fontFamily={fontFamily} fontWeight={800} fontSize={20} fill="#7a1f1a">DAFTAR PHK</text>
        {Array.from({ length: 6 }, (_, i) => <rect key={i} x={-60} y={-16 + i * 13} width={i === 3 ? 104 : 80 + rand(i) * 40} height={5} rx={2} fill={i === 3 ? "#7a1f1a" : "#9a948a"} opacity={i === 3 ? 0.4 + 0.6 * list : 1} />)}
        {list > 0 && <rect x={-66} y={20} width={124 * list} height={14} rx={4} fill="none" stroke={C.yellow} strokeWidth={4} />}
      </g>
      <rect x={0} y={1220} width={W} height={H - 1220} fill="#7d7468" />
      <rect x={0} y={1220} width={W} height={14} fill="#5f574d" />
    </g>
  );
};

/** One person in the job fair queue: plain clothes, a document folder, seen from the side. */
export const QueuePerson: FC<{ x: number; y: number; s?: number; i: number; tired?: number }> = ({ x, y, s = 1, i, tired = 0 }) => {
  const f = useCurrentFrame();
  const shirts = ["#d36b5a", "#5a8fd3", "#e7c45c", "#6aa37a", "#8c6bb8", "#f1f1f1", "#c2875a", "#4d6a8a"];
  const hairs = ["#1c1715", "#2b211c", "#3b2a20", "#1c1715"];
  const hijab = i % 4 === 1;
  const sh = shirts[i % shirts.length], skin = ["#c98d5e", "#b77a4c", "#d9a273", "#a8703f"][i % 4];
  const b = wave(f, 1.5, 70 + i * 3, i * 13) + tired * 6;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-30 -150 L-34 0 L-8 0 L0 -110 L8 0 L34 0 L30 -150Z" fill="#33384a" />
      <path d={`M-38 ${-140 + b * 0.3} Q-44 -230 0 -238 Q44 -230 38 ${-140 + b * 0.3}Z`} fill={sh} />
      <rect x={10} y={-200} width={44} height={56} rx={3} fill="#f1d58a" stroke="#b8913d" strokeWidth={2} />
      <g transform={`translate(0 ${-276 + b}) rotate(${tired * 10})`}>
        {hijab ? (
          <path d="M-36 24 Q-42 -42 0 -46 Q42 -42 36 24 Q20 44 0 42 Q-20 44 -36 24Z" fill={["#7a4b8c", "#2f7a6a", "#a8463c"][i % 3]} />
        ) : (
          <path d="M-30 -2 Q-32 -38 0 -40 Q32 -38 30 -2Z" fill={hairs[i % 4]} />
        )}
        <ellipse cx={0} cy={4} rx={26} ry={30} fill={skin} />
        {!hijab && <path d="M-28 -6 Q-28 -36 0 -36 Q28 -36 28 -6 Q14 -20 0 -18 Q-14 -24 -28 -6Z" fill={hairs[i % 4]} />}
        <circle cx={-9} cy={2} r={3} fill={C.ink} />
        <circle cx={9} cy={2} r={3} fill={C.ink} />
        <path d="M-6 16 h12" stroke={C.ink} strokeWidth={2.5} strokeLinecap="round" />
      </g>
    </g>
  );
};

/** A small kos room: plain wall, a window (night with the moon, or morning), a thin mattress on the floor. */
export const KosRoom: FC<{ time: "night" | "morning"; children?: ReactNode }> = ({ time, children }) => {
  const f = useCurrentFrame();
  const night = time === "night";
  return (
    <g>
      <rect width={W} height={H} fill={night ? "#2a2f45" : "#efe3cf"} />
      <rect y={1300} width={W} height={H - 1300} fill={night ? "#3a3448" : "#c9b08a"} />
      <rect y={1290} width={W} height={14} fill={night ? "#211d2c" : "#a88d66"} />
      {/* window */}
      <rect x={140} y={300} width={380} height={460} rx={8} fill={night ? "#121a33" : "#cfe9f7"} />
      {night ? (
        <>
          <circle cx={420} cy={400} r={46} fill="#fff6d6" />
          <circle cx={440} cy={388} r={42} fill="#121a33" />
          {Array.from({ length: 10 }, (_, i) => <circle key={i} cx={170 + rand(i) * 320} cy={330 + rand(i + 9) * 380} r={2.5} fill="#fff" opacity={0.4 + wave(f, 0.4, 40 + i * 3, i * 9)} />)}
        </>
      ) : (
        <>
          <circle cx={430} cy={420} r={60} fill="#fff1c0" />
          <path d="M150 700 Q260 640 380 690 T520 680 V760 H150Z" fill="#9fb7a0" />
        </>
      )}
      <rect x={140} y={300} width={380} height={460} rx={8} fill="none" stroke={night ? "#4a4560" : "#8a6f4e"} strokeWidth={16} />
      <rect x={322} y={300} width={16} height={460} fill={night ? "#4a4560" : "#8a6f4e"} />
      <rect x={140} y={522} width={380} height={14} fill={night ? "#4a4560" : "#8a6f4e"} />
      {/* mattress */}
      <rect x={90} y={1250} width={760} height={90} rx={22} fill={night ? "#5b6a8c" : "#dfe6ef"} />
      <rect x={110} y={1218} width={180} height={52} rx={20} fill={night ? "#7a87a6" : "#f7f8fb"} />
      {children}
    </g>
  );
};

/** A wall calendar; `flip` 0…1 tears the 11 November page away to show 12, then `ring` circles it. */
export const Calendar: FC<{ x: number; y: number; flip: number; ring: number }> = ({ x, y, flip, ring }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-120} y={0} width={240} height={250} rx={10} fill="#fffdf7" stroke="#b9a98e" strokeWidth={4} />
    <rect x={-120} y={0} width={240} height={64} rx={10} fill="#c7362f" />
    <text x={0} y={44} textAnchor="middle" fontFamily={fontFamily} fontWeight={800} fontSize={32} fill="#fff">NOVEMBER</text>
    <text x={0} y={190} textAnchor="middle" fontFamily={fontFamily} fontWeight={800} fontSize={120} fill="#2b1d16">12</text>
    {ring > 0 && <ellipse cx={0} cy={150} rx={86} ry={70} fill="none" stroke="#c7362f" strokeWidth={8} pathLength={1} strokeDasharray={`${ring} 1`} transform="rotate(-8 0 150)" />}
    {flip < 1 && (
      <g transform={`rotate(${-flip * 70} -120 64) translate(0 ${flip * 40})`} opacity={1 - flip * 0.6}>
        <rect x={-120} y={64} width={240} height={186} fill="#fffdf7" stroke="#b9a98e" strokeWidth={3} />
        <text x={0} y={190} textAnchor="middle" fontFamily={fontFamily} fontWeight={800} fontSize={120} fill="#2b1d16">11</text>
      </g>
    )}
    <circle cx={0} cy={-10} r={8} fill="#6b5a4e" />
  </g>
);

/** An ironing board with the blue shirt on it, the iron sliding (`k` follows the hand) and some steam. */
export const IroningBoard: FC<{ x: number; y: number; k: number }> = ({ x, y, k }) => {
  const f = useCurrentFrame();
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M-200 0 L160 0 Q230 0 230 -12 Q230 -24 160 -24 L-200 -24Z" fill="#d8dde6" stroke="#9aa3b2" strokeWidth={3} />
      <path d="M-120 0 L60 200 M60 0 L-120 200" stroke="#7d8696" strokeWidth={8} />
      {/* the shirt laid flat */}
      <path d="M-170 -26 L-60 -26 L-30 -46 L60 -46 L90 -26 L150 -26 L150 -20 L-170 -20Z" fill={C.shirt} />
      <path d="M-20 -46 L15 -30 L50 -46" stroke="#e9eef6" strokeWidth={5} fill="none" />
      {/* iron */}
      <g transform={`translate(${k} -30)`}>
        <path d="M-50 0 L40 0 Q60 0 50 -26 L-30 -26 Q-50 -26 -50 0Z" fill="#e5e8ee" stroke="#6b7280" strokeWidth={3} />
        <path d="M-24 -26 Q-10 -60 30 -26" stroke="#4b5563" strokeWidth={8} fill="none" />
        {Array.from({ length: 3 }, (_, i) => {
          const t = ((f / 30 + i / 3) % 1);
          return <circle key={i} cx={-10 + i * 18 + wave(f, 6, 20, i * 7)} cy={-40 - t * 90} r={10 + t * 10} fill="#ffffff" opacity={(1 - t) * 0.6} />;
        })}
      </g>
    </g>
  );
};

/** Bandung at dusk from a kos balcony: lights coming on in the low houses, `on` 0…1. */
export const Town: FC<{ y: number; on: number }> = ({ y, on }) => {
  const f = useCurrentFrame();
  return (
    <g>
      {Array.from({ length: 14 }, (_, i) => {
        const w = 70 + rand(i) * 70, h = 60 + rand(i + 3) * 120, x = i * 80 - 20;
        return (
          <g key={i}>
            <rect x={x} y={y - h} width={w} height={h + 200} fill={i % 2 ? "#3a3157" : "#2f294a"} />
            <path d={`M${x - 8} ${y - h} L${x + w / 2} ${y - h - 34} L${x + w + 8} ${y - h}Z`} fill="#4a3a5a" />
            {Array.from({ length: 3 }, (_, k) => {
              const lit = rand(i * 7 + k) < 0.7 && on > rand(i * 5 + k);
              return lit ? <rect key={k} x={x + 12 + k * 20} y={y - h + 22} width={12} height={16} fill="#ffd27a" opacity={0.6 + 0.4 * Math.abs(Math.sin((f + i * 11 + k * 5) / 40))} /> : null;
            })}
          </g>
        );
      })}
    </g>
  );
};

/** A drawn chat bubble beside an illustration (not app UI): sender's initial and name, then lines that appear one by one. */
export const Chat: FC<{ x: number; y: number; name: string; lines: { text: string; o: number; link?: boolean }[]; o: number }> = ({ x, y, name, lines, o }) =>
  o <= 0 ? null : (
    <div style={{ position: "absolute", left: x, top: y, opacity: o, transform: `translateY(${(1 - o) * 30}px)`, display: "flex", gap: 18, alignItems: "flex-start" }}>
      <div style={{ width: 76, height: 76, borderRadius: 38, background: "#e7a64a", color: "#2b1d16", fontFamily, fontWeight: 800, fontSize: 40, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{name[0]}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ fontFamily: ui, fontWeight: 700, fontSize: 26, color: "#cfd6ea" }}>{name}</div>
        {lines.map((l, i) =>
          l.o <= 0 ? null : (
            <div key={i} style={{ opacity: l.o, transform: `scale(${0.9 + 0.1 * l.o})`, transformOrigin: "0 50%", background: "#fff", borderRadius: "8px 30px 30px 30px", padding: "16px 26px", fontFamily: ui, fontSize: 34, fontWeight: 600,
              color: l.link ? "#1d5fd0" : "#1b1b1f", textDecoration: l.link ? "underline" : "none", boxShadow: "0 10px 24px rgba(0,0,0,.25)", maxWidth: 640 }}>
              {l.text}
            </div>
          ),
        )}
      </div>
    </div>
  );
