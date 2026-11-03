import type { FC, ReactNode } from "react";
import { AbsoluteFill, Easing, Img, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { baloo } from "../../lib/fonts";
import { rand, tween, wave } from "../../lib/kit";
import type { SceneProps } from "../../lib/Story";
import data from "./data.json";

/**
 * A one-minute hands-on tutorial with no voice: four real takes of the demo game, recorded frame by
 * frame at a phone viewport (Sari is driven with real key presses and taps), played in a phone.
 * Speech is shown as comic bubbles that follow the speaker's name tag in the recording; taps get a
 * ripple and the tapped control a yellow outline. One scene, so there are no dips between steps.
 */
export const ID = "20261103-2330-tut1";
const W = 1080, H = 1920;
const Y = "#FFF000";
const ui = `"Inter", "Segoe UI", system-ui, sans-serif`;

// The device: app area AW × AH (390 × 844 CSS px scaled by K), under a status bar.
const BEZ = 22, STB = 40, HOME = 24;
const AH = 1560, AW = Math.round((AH * 390) / 844);
const SW = AW, SH = STB + AH + HOME;
const DW = SW + BEZ * 2, DH = SH + BEZ * 2;
const DX = Math.round((W - DW) / 2), DY = 168;
const K = AW / 390;
const AX = DX + BEZ, AY = DY + BEZ + STB; // app origin in the video

type Ev = { k: "tap" | "say" | "mark"; f: number; box?: number[]; label?: string; floor?: boolean; person?: string; who?: string; text?: string; dur?: number; lift?: number; below?: boolean };
type Take = { frames: number; events: Ev[]; names: Record<string, number[]>[]; fast: number[][] };
const TAKES = (data as unknown as { takes: Take[] }).takes;
const STEPS = ["Melamar kerja", "Ngobrol", "Tambah teman", "Cari anomali"];

export const INTRO = 75, END = 120;
const starts: number[] = [];
{
  let t = INTRO;
  for (const tk of TAKES) {
    starts.push(t);
    t += tk.frames;
  }
}
export const TOTAL = INTRO + TAKES.reduce((a, t) => a + t.frames, 0) + END;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.out(Easing.cubic);

// ───────────────────────── backdrop and device ─────────────────────────

const Backdrop: FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "radial-gradient(120% 80% at 50% 30%, #23242b 0%, #111216 60%, #08080a 100%)" }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" style={{ position: "absolute" }}>
        {Array.from({ length: 18 }, (_, i) => (
          <circle key={i} cx={rand(i) * W} cy={((rand(i + 30) * H - f * (0.25 + rand(i) * 0.4)) % H + H) % H} r={3 + rand(i + 5) * 7} fill={Y} opacity={0.08 + wave(f, 0.05, 50 + i, i * 7)} />
        ))}
      </svg>
    </AbsoluteFill>
  );
};

const Device: FC<{ children: ReactNode }> = ({ children }) => (
  <>
    <div style={{ position: "absolute", left: DX - 5, top: DY + 260, width: 6, height: 100, borderRadius: 3, background: "#33363f" }} />
    <div style={{ position: "absolute", left: DX + DW - 1, top: DY + 330, width: 6, height: 150, borderRadius: 3, background: "#33363f" }} />
    <div style={{ position: "absolute", left: DX, top: DY, width: DW, height: DH, borderRadius: 84,
      background: "linear-gradient(145deg, #3a3d46 0%, #1a1c21 45%, #2b2e36 100%)",
      boxShadow: "0 40px 90px rgba(0,0,0,.6), inset 0 0 0 2px #50555f, inset 0 0 0 6px #121318" }}>
      <div style={{ position: "absolute", left: BEZ, top: BEZ, width: SW, height: SH, borderRadius: 62, overflow: "hidden", background: "#0b0c10" }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: SW, height: STB, color: "#fff", fontFamily: ui, fontWeight: 600, fontSize: 22 }}>
          <div style={{ position: "absolute", left: 50, top: 9 }}>10.04</div>
          <div style={{ position: "absolute", left: SW / 2 - 10, top: 10, width: 20, height: 20, borderRadius: 10, background: "#000", boxShadow: "inset 0 0 0 3px #1d2027" }} />
          <svg style={{ position: "absolute", right: 44, top: 12 }} width={84} height={18} viewBox="0 0 84 18">
            {[0, 1, 2, 3].map((i) => <rect key={i} x={i * 6} y={12 - i * 3.5} width={4} height={5 + i * 3.5} rx={1} fill="#fff" />)}
            <path d="M34 8 Q42 0 50 8 M37 11 Q42 6 47 11" stroke="#fff" strokeWidth={2.2} fill="none" strokeLinecap="round" />
            <circle cx={42} cy={14} r={2} fill="#fff" />
            <rect x={56} y={3} width={24} height={12} rx={3} stroke="#fff" strokeWidth={1.6} fill="none" opacity={0.9} />
            <rect x={58} y={5} width={16} height={8} rx={1.5} fill="#fff" />
          </svg>
        </div>
        <div style={{ position: "absolute", left: 0, top: STB, width: AW, height: AH, overflow: "hidden", background: "#111" }}>{children}</div>
        <div style={{ position: "absolute", left: SW / 2 - 70, top: STB + AH + 10, width: 140, height: 5, borderRadius: 3, background: "#e8e8ec", opacity: 0.85 }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(125deg, rgba(255,255,255,.06) 0%, rgba(255,255,255,0) 30%)" }} />
      </div>
    </div>
  </>
);

// ───────────────────────── overlays on a take ─────────────────────────

/** The speaker's name tag in the recording at take frame t (the last place it was seen if hidden). */
const tagAt = (tk: Take, who: string, t: number) => {
  for (let i = Math.min(t, tk.names.length - 1); i >= 0; i--) {
    const b = tk.names[i]?.[who];
    if (b) return b;
  }
  return null;
};

const Bubble: FC<{ tk: Take; ev: Ev; t: number }> = ({ tk, ev, t }) => {
  const dt = t - ev.f;
  const dur = ev.dur ?? 50;
  if (dt < 0 || dt > dur + 8) return null;
  const tag = tagAt(tk, ev.who!, t);
  if (!tag) return null;
  const ax = AX + (tag[0] + tag[2] / 2) * K;
  const ay = AY + (tag[1] - 6 - (ev.lift ?? 0)) * K;
  const pop = dt < 10 ? Easing.out(Easing.back(2.2))(dt / 10) : 1;
  const out = interpolate(dt, [dur, dur + 8], [1, 0], clamp);
  const text = ev.text!;
  const fs = 40;
  const w = Math.min(640, Math.max(200, text.length * fs * 0.58 + 70));
  const below = !!ev.below;
  const by = AY + (tag[1] + 62) * K; // under the speaker's feet
  const left = Math.min(W - 18 - w, Math.max(18, ax - w / 2));
  const tail = Math.min(left + w - 46, Math.max(left + 46, ax));
  const me = ev.who === "Sari";
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: W, height: H, opacity: out }}>
      <div style={{ position: "absolute", left, ...(below ? { top: by + 26 } : { bottom: H - ay + 26 }), width: w, transformOrigin: `${tail - left}px ${below ? "0%" : "100%"}`, transform: `scale(${0.4 + 0.6 * pop})` }}>
        <div style={{ background: "#fff", border: "5px solid #111", borderRadius: 34, padding: "12px 26px 14px", fontFamily: baloo, fontWeight: 800, fontSize: fs, lineHeight: 1.12,
          color: "#111", textAlign: "center", boxShadow: `0 10px 0 ${me ? Y : "rgba(0,0,0,.25)"}, 0 16px 30px rgba(0,0,0,.35)` }}>
          {text}
        </div>
        {/* tail */}
        <svg style={{ position: "absolute", left: tail - left - 24, ...(below ? { top: -26, transform: "scaleY(-1)" } : { bottom: -26 }) }} width={48} height={32} viewBox="0 0 48 32">
          <path d="M4 0 L24 28 L44 0" fill="#fff" stroke="#111" strokeWidth={5} strokeLinejoin="round" />
          <rect x={6} y={-4} width={36} height={7} fill="#fff" />
        </svg>
      </div>
    </div>
  );
};

const Tap: FC<{ ev: Ev; t: number }> = ({ ev, t }) => {
  const dt = t - ev.f;
  if (dt < -8 || dt > 34 || !ev.box) return null;
  const [x, y, w, h] = ev.box;
  const cx = AX + (x + w / 2) * K, cy = AY + (y + h / 2) * K;
  const ring = (
    <div style={{ position: "absolute", left: cx, top: cy }}>
      <div style={{ position: "absolute", width: 64, height: 64, left: -32, top: -32, borderRadius: "50%", background: "rgba(20,20,30,.32)", border: "4px solid rgba(255,255,255,.95)",
        transform: `scale(${dt < 0 ? interpolate(dt, [-8, 0], [1.4, 1]) : dt < 6 ? 0.85 : 1})`, opacity: dt < 0 ? interpolate(dt, [-8, 0], [0, 1]) : interpolate(dt, [8, 20], [1, 0], clamp) }} />
      {dt >= 0 && (
        <div style={{ position: "absolute", width: 64, height: 64, left: -32, top: -32, borderRadius: "50%", border: `6px solid ${Y}`,
          transform: `scale(${1 + dt * 0.11})`, opacity: interpolate(dt, [0, 22], [1, 0], clamp) }} />
      )}
    </div>
  );
  // A control (not the floor, not a person, not the dialog box itself): a yellow outline around it, only
  // up to the moment of the tap (the screen often changes right after, so it must not linger).
  const outline = !ev.floor && !ev.person && ev.label !== "dialog" && dt >= -8 && (
    <div style={{ position: "absolute", left: AX + (x - 5) * K, top: AY + (y - 4) * K, width: (w + 10) * K, height: (h + 8) * K, borderRadius: 14,
      border: `5px solid ${Y}`, boxShadow: `0 0 0 ${6 + 6 * Math.max(0, 1 - Math.abs(dt) / 14)}px rgba(255,240,0,.3)`,
      opacity: interpolate(dt, [-10, -3, 0, 3], [0, 1, 1, 0], clamp) }} />
  );
  return (
    <>
      {outline}
      {ring}
    </>
  );
};

const TakeView: FC<{ i: number; t: number }> = ({ i, t }) => {
  const tk = TAKES[i];
  const fast = tk.fast.some(([a, b]) => t >= a && t < b);
  return (
    <>
      {tk.events.filter((e) => e.k === "tap").map((e, j) => <Tap key={`t${j}`} ev={e} t={t} />)}
      {tk.events.filter((e) => e.k === "say").map((e, j) => <Bubble key={`s${j}`} tk={tk} ev={e} t={t} />)}
      {fast && (
        <div style={{ position: "absolute", right: DX + 30, top: AY + 120, fontFamily: baloo, fontWeight: 800, fontSize: 34, color: "#111", background: Y, borderRadius: 30, padding: "4px 20px",
          border: "4px solid #111" }}>
          ▶▶ 2x
        </div>
      )}
    </>
  );
};

// ───────────────────────── step header ─────────────────────────

/** Step title: big in the middle while the take holds its first frame, then it docks above the phone. */
const StepTitle: FC<{ i: number; t: number }> = ({ i, t }) => {
  const hold = (data as unknown as { hold: number }).hold;
  const inn = ease(interpolate(t, [0, 10], [0, 1], clamp));
  const dock = Easing.inOut(Easing.cubic)(interpolate(t, [hold - 8, hold + 6], [0, 1], clamp));
  const cy = interpolate(dock, [0, 1], [H * 0.44, 84]);
  const s = interpolate(dock, [0, 1], [1.5, 1]);
  return (
    <>
      <AbsoluteFill style={{ background: "rgba(8,8,10,.62)", opacity: 1 - dock, pointerEvents: "none" }} />
      <div style={{ position: "absolute", left: W / 2, top: cy, transform: `translate(-50%, -50%) scale(${s * (0.7 + 0.3 * inn)})`, opacity: inn, display: "flex", alignItems: "center", gap: 18,
        fontFamily: baloo, fontWeight: 800, fontSize: 56, color: "#fff", whiteSpace: "nowrap" }}>
        <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 78, height: 78, borderRadius: 39, background: Y, color: "#111" }}>{i + 1}</span>
        <span>{STEPS[i]}</span>
      </div>
    </>
  );
};

const Progress: FC<{ step: number; p: number }> = ({ step, p }) => (
  <div style={{ position: "absolute", left: DX + 40, right: DX + 40, top: 144, display: "flex", gap: 10 }}>
    {STEPS.map((_, i) => (
      <div key={i} style={{ flex: 1, height: 7, borderRadius: 4, background: "rgba(255,255,255,.18)", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${i < step ? 100 : i === step ? p * 100 : 0}%`, background: Y }} />
      </div>
    ))}
  </div>
);

// ───────────────────────── intro and end card ─────────────────────────

const Intro: FC<{ f: number }> = ({ f }) => {
  const a = ease(interpolate(f, [4, 22], [0, 1], clamp));
  const b = ease(interpolate(f, [14, 32], [0, 1], clamp));
  const out = interpolate(f, [INTRO - 12, INTRO], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ background: "rgba(8,8,10,.78)", opacity: out, fontFamily: baloo, fontWeight: 800, color: "#fff", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
      <div style={{ fontSize: 46, color: Y, opacity: a, transform: `translateY(${(1 - a) * 30}px)` }}>Tutorial · langsung main</div>
      <div style={{ fontSize: 92, lineHeight: 1.02, marginTop: 10, opacity: b, transform: `translateY(${(1 - b) * 40}px)` }}>
        Job fair
        <br />
        dari HP-mu
      </div>
      <div style={{ fontSize: 40, marginTop: 26, opacity: b, color: "rgba(255,255,255,.85)" }}>4 langkah, 1 menit</div>
    </AbsoluteFill>
  );
};

const EndCard: FC<{ f: number }> = ({ f }) => {
  const a = ease(interpolate(f, [0, 16], [0, 1], clamp));
  const b = Easing.out(Easing.back(1.8))(interpolate(f, [10, 28], [0, 1], clamp));
  return (
    <AbsoluteFill style={{ background: "#000", opacity: a, fontFamily: baloo, fontWeight: 800, alignItems: "center", justifyContent: "center", textAlign: "center" }}>
      <div style={{ fontSize: 70, color: "#fff" }}>Coba sendiri di</div>
      <div style={{ fontSize: 112, color: Y, marginTop: 8, transform: `scale(${0.6 + 0.4 * b})`, opacity: b }}>jobfair.co.id</div>
      <div style={{ display: "flex", gap: 14, marginTop: 70, opacity: interpolate(f, [30, 46], [0, 1], clamp) }}>
        {STEPS.map((s, i) => (
          <div key={s} style={{ fontSize: 30, color: "#fff", border: "3px solid rgba(255,255,255,.35)", borderRadius: 26, padding: "4px 18px" }}>
            {i + 1}. {s}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ───────────────────────── the one scene ─────────────────────────

const Tutorial: FC<SceneProps> = () => {
  const f = useCurrentFrame();
  let step = -1;
  starts.forEach((s, i) => {
    if (f >= s) step = i;
  });
  const endAt = INTRO + TAKES.reduce((a, t) => a + t.frames, 0);
  const t = step >= 0 ? f - starts[step] : 0;
  const swap = step > 0 ? interpolate(t, [0, 6], [1, 0], clamp) : 0; // a short flash between takes
  return (
    <AbsoluteFill>
      <Backdrop />
      <Device>
        {f < INTRO && <Img src={staticFile(`${ID}/take1-first.jpg`)} style={{ width: "100%", height: "100%", display: "block" }} />}
        {TAKES.map((tk, i) => (
          <Sequence key={i} from={starts[i]} durationInFrames={tk.frames} layout="none">
            <OffthreadVideo src={staticFile(`${ID}/take${i + 1}.mp4`)} muted style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }} />
          </Sequence>
        ))}
        {f >= endAt && <Img src={staticFile(`${ID}/take${TAKES.length}-last.jpg`)} style={{ width: "100%", height: "100%", display: "block" }} />}
        <AbsoluteFill style={{ background: "#fff", opacity: swap * 0.5 }} />
      </Device>
      {step >= 0 && f < endAt && (
        <>
          <TakeView i={step} t={t} />
          <Progress step={step} p={t / TAKES[step].frames} />
          <StepTitle i={step} t={t} />
        </>
      )}
      <div style={{ position: "absolute", left: 0, right: 0, top: DY + DH + 14, textAlign: "center", fontFamily: baloo, fontWeight: 800, fontSize: 32, color: Y, opacity: 0.9 }}>jobfair.co.id</div>
      {f < INTRO && <Intro f={f} />}
      {f >= endAt && <EndCard f={f - endAt} />}
    </AbsoluteFill>
  );
};

export const scenes = [Tutorial];
