import { Easing, interpolate } from "remotion";

/** Eased, clamped tween of frame f over [a, b] → [from, to]. */
export const tween = (f: number, a: number, b: number, from: number, to: number) =>
  interpolate(f, [a, b], [from, to], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });

/** Gentle sine wobble: amplitude, period in frames, phase offset. */
export const wave = (f: number, amp: number, period: number, phase = 0) => amp * Math.sin(((f + phase) / period) * Math.PI * 2);

/** Deterministic pseudo-random in [0,1) for seed i (Math.random() is forbidden: frames must be reproducible). */
export const rand = (i: number) => { const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); };
