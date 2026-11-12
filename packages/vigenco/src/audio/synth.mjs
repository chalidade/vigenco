// Vigenco soundtrack synth (pure JavaScript, no dependencies).
//
// Takes the film's exported data (bpm, duration, sections, cues) and writes a 48 kHz stereo WAV:
// an original 120 BPM music bed arranged to the film's sections (sparse intro, groove, snare build,
// drop on the film's big moment, ringing outro) plus synthesized UI sound effects, each placed so its
// own peak lands on its cue. Everything is generated from scratch: no samples, no licences.
//
// Optional: spec.audio.music = path to your own track (mixed instead of the synthesized bed),
// spec.audio.musicOffset = seconds into that track to start from (decoded with ffmpeg).
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const SR = 48000;
const TAU = Math.PI * 2;
const ns = (d) => Math.floor(d * SR);          // seconds → samples (int(d * SR))

// ---------------------------------------------------------------- deterministic randomness
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function makeRng(seed) {
  const u = mulberry32(seed);
  let spare = null;
  return {
    random: u,
    normal() {
      if (spare !== null) { const s = spare; spare = null; return s; }
      let a = 0; while (a === 0) a = u();
      const b = u(), r = Math.sqrt(-2 * Math.log(a));
      spare = r * Math.sin(TAU * b);
      return r * Math.cos(TAU * b);
    },
  };
}
let globalRng = makeRng(7);

// ---------------------------------------------------------------- small array helpers
const zeros = (n) => new Float64Array(Math.max(0, n));
function tAxis(d) { const n = ns(d), t = zeros(n); for (let i = 0; i < n; i++) t[i] = i / SR; return t; }
function mul(a, b) { const n = Math.min(a.length, b.length), y = zeros(n); for (let i = 0; i < n; i++) y[i] = a[i] * b[i]; return y; }
function scale(a, g) { const y = zeros(a.length); for (let i = 0; i < a.length; i++) y[i] = a[i] * g; return y; }
function addInto(dst, src, at = 0, g = 1) { const n = Math.min(src.length, dst.length - at); for (let i = 0; i < n; i++) dst[at + i] += src[i] * g; return dst; }
function hanning(n) { const w = zeros(n); if (n === 1) { w[0] = 1; return w; } for (let i = 0; i < n; i++) w[i] = 0.5 - 0.5 * Math.cos(TAU * i / (n - 1)); return w; }

/** attack (s) then exponential decay with time constant d (s). */
function envAD(n, a, d) {
  const e = zeros(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    e[i] = a > 0 && t < a ? t / a : Math.exp(-Math.max(t - a, 0) / d);
  }
  return e;
}

// ---------------------------------------------------------------- FFT band-limited noise
function fft(re, im, inverse) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = (inverse ? TAU : -TAU) / len, wr = Math.cos(ang), wi = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let cr = 1, ci = 0;
      for (let k = 0; k < len / 2; k++) {
        const ar = re[i + k], ai = im[i + k];
        const br = re[i + k + len / 2] * cr - im[i + k + len / 2] * ci;
        const bi = re[i + k + len / 2] * ci + im[i + k + len / 2] * cr;
        re[i + k] = ar + br; im[i + k] = ai + bi;
        re[i + k + len / 2] = ar - br; im[i + k + len / 2] = ai - bi;
        const nr = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = nr;
      }
    }
  }
  if (inverse) for (let i = 0; i < n; i++) { re[i] /= n; im[i] /= n; }
}
const HANN31 = (() => { const w = hanning(31); let s = 0; for (const v of w) s += v; return w.map((v) => v / s); })();

/** White noise band-passed to [lo, hi] Hz with soft spectral edges, normalised to peak 1. */
function bandNoise(d, lo, hi, seed) {
  const n = ns(d);
  if (n <= 0) return zeros(0);
  const g = seed === undefined ? globalRng : makeRng(seed);
  let N = 1; while (N < n) N <<= 1;
  const re = zeros(N), im = zeros(N);
  for (let i = 0; i < n; i++) re[i] = g.normal();
  fft(re, im, false);
  const half = N / 2, mask = zeros(half + 1), soft = zeros(half + 1);
  for (let k = 0; k <= half; k++) { const f = (k * SR) / N; mask[k] = f >= lo && f <= hi ? 1 : 0; }
  for (let k = 0; k <= half; k++) {
    let s = 0;
    for (let j = -15; j <= 15; j++) { const q = k + j; if (q >= 0 && q <= half) s += mask[q] * HANN31[j + 15]; }
    soft[k] = s;
  }
  for (let k = 0; k < N; k++) { const m = soft[k <= half ? k : N - k]; re[k] *= m; im[k] *= m; }
  fft(re, im, true);
  let peak = 1e-9; for (let i = 0; i < n; i++) peak = Math.max(peak, Math.abs(re[i]));
  const y = zeros(n); for (let i = 0; i < n; i++) y[i] = re[i] / peak;
  return y;
}

// ---------------------------------------------------------------- oscillators
const midi = (n) => 440 * 2 ** ((n - 69) / 12);
function saw(freq, d, harm = 12, bright = 1) {
  const n = ns(d), y = zeros(n);
  for (let k = 1; k <= harm; k++) {
    if (freq * k > 16000) break;
    const a = (bright ** (k - 1)) / k, w = TAU * freq * k / SR;
    for (let i = 0; i < n; i++) y[i] += Math.sin(w * i) * a;
  }
  for (let i = 0; i < n; i++) y[i] /= 1.7;
  return y;
}
function sine(freq, d, phase = 0) { const n = ns(d), y = zeros(n), w = TAU * freq / SR; for (let i = 0; i < n; i++) y[i] = Math.sin(w * i + phase); return y; }
function sweep(f0, f1, d, curve = 6) {
  const n = ns(d), y = zeros(n); let acc = 0;
  for (let i = 0; i < n; i++) { acc += f1 + (f0 - f1) * Math.exp(-(i / SR) * curve); y[i] = Math.sin(TAU * acc / SR); }
  return y;
}

// ---------------------------------------------------------------- mix bus
class Bus {
  constructor(dur) { const n = ns(dur + 2); this.L = zeros(n); this.R = zeros(n); }
  add(x, t, gain = 1, pan = 0, alignPeak = false) {
    if (!x || !x.length) return;
    let off = 0;
    if (alignPeak) { let m = -1; for (let i = 0; i < x.length; i++) { const v = Math.abs(x[i]); if (v > m) { m = v; off = i; } } }
    let i = Math.round(t * SR) - off, start = 0;
    if (i < 0) { start = -i; i = 0; }
    const j = Math.min(this.L.length, i + (x.length - start));
    if (j <= i) return;
    pan = Number.isFinite(pan) ? Math.min(1, Math.max(-1, pan)) : 0;   // films may pass any n; keep pan in range
    const gl = gain * Math.sqrt(0.5 * (1 - pan)), gr = gain * Math.sqrt(0.5 * (1 + pan));
    for (let k = 0; k < j - i; k++) {
      const v = x[start + k];
      if (!Number.isFinite(v)) continue;
      this.L[i + k] += v * gl; this.R[i + k] += v * gr;
    }
  }
}

// ---------------------------------------------------------------- instruments
function kick(strength = 1) {
  const d = 0.42, body = mul(sweep(150, 46, d, 28), envAD(ns(d), 0.001, 0.16));
  const click = mul(bandNoise(0.012, 2000, 8000), envAD(ns(0.012), 0.0005, 0.003));
  addInto(body, click, 0, 0.35);
  return scale(body, strength);
}
function snare(strength = 1) {
  const d = 0.22, n = mul(bandNoise(d, 1200, 9000), envAD(ns(d), 0.0008, 0.055));
  const tone = mul(sine(196, d), envAD(ns(d), 0.0005, 0.04));
  const y = zeros(n.length); for (let i = 0; i < y.length; i++) y[i] = (n[i] * 0.8 + tone[i] * 0.45) * strength;
  return y;
}
function clap() {
  const d = 0.25, n = bandNoise(d, 900, 6000), e = zeros(ns(d));
  [0, 0.011, 0.022].forEach((o, k) => { const i = ns(o); addInto(e, envAD(e.length - i, 0.0005, k < 2 ? 0.012 : 0.07), i); });
  return scale(mul(n, e), 0.8);
}
function hat(open = false) {
  const d = open ? 0.32 : 0.06;
  return scale(mul(bandNoise(d, 7000, 15000), envAD(ns(d), 0.0005, open ? 0.09 : 0.014)), 0.35);
}
function crash() { const d = 2.2; return scale(mul(bandNoise(d, 4000, 16000), envAD(ns(d), 0.002, 0.6)), 0.5); }
function pad(notes, d, bright = 0.55) {
  const y = zeros(ns(d));
  for (const n of notes) for (const det of [-0.08, 0.08]) addInto(y, saw(midi(n + det), d, 8, bright));
  const a = Math.min(0.35, d * 0.4), g = 1 / (notes.length * 2);
  for (let i = 0; i < y.length; i++) { const t = i / SR; y[i] *= Math.min(1, t / a) * Math.min(1, (d - t) / 0.25) * g; }
  return y;
}
function bass(note, d) {
  const a = saw(midi(note), d, 6, 0.5), b = sine(midi(note - 12), d), y = zeros(a.length);
  for (let i = 0; i < y.length; i++) y[i] = a[i] * 0.7 + b[i] * 0.6;
  return mul(y, envAD(y.length, 0.004, Math.max(0.08, d * 0.6)));
}
function stab(notes, d = 0.5) {
  const y = zeros(ns(d));
  for (const n of notes) addInto(y, saw(midi(n), d, 10, 0.7));
  return scale(mul(y, envAD(y.length, 0.002, 0.18)), 1 / notes.length);
}
function riser(d) {
  const n = ns(d), y = zeros(n), steps = 24;
  for (let k = 0; k < steps; k++) {
    const lo = 400 + 6000 * (k / steps) ** 2, seg = bandNoise(d / steps + 0.02, lo, lo * 2.2);
    const i = Math.floor(k * n / steps), j = Math.min(n, i + seg.length), w = hanning(j - i);
    for (let q = 0; q < j - i; q++) y[i + q] += seg[q] * w[q];
  }
  for (let i = 0; i < n; i++) { const r = 0.05 + (n > 1 ? (0.95 * i) / (n - 1) : 0); y[i] *= r * r * 0.5; }
  return y;
}

// ---------------------------------------------------------------- sound effects
const PENTA = [69, 72, 74, 76, 79, 81, 84, 86, 88, 91];   // A minor pentatonic
function pluck(note, d = 0.5, bright = 0.6) {
  const f = midi(note), a = sine(f, d), b = sine(2 * f, d), c = sine(3 * f, d), y = zeros(a.length);
  for (let i = 0; i < y.length; i++) y[i] = a[i] + 0.35 * b[i] * bright + 0.12 * c[i] * bright;
  return scale(mul(y, envAD(y.length, 0.002, d / 4)), 0.5);
}
function sfxClick() {
  const a = mul(bandNoise(0.01, 2500, 9000, 1), envAD(480, 0.0003, 0.0018));
  const tone = scale(mul(sine(3200, 0.012), envAD(576, 0.0003, 0.002)), 0.3);
  addInto(a, tone.subarray(0, a.length));
  const rel = scale(mul(bandNoise(0.008, 3000, 10000, 2), envAD(384, 0.0003, 0.0015)), 0.55);
  const y = zeros(ns(0.1)); addInto(y, a); addInto(y, rel, ns(0.07));
  return scale(y, 0.9);
}
function sfxKey(n) {
  const g = makeRng(100 + n), lo = 1800 + g.random() * 1200;
  const y = mul(bandNoise(0.014, lo, lo * 3, 200 + n), envAD(ns(0.014), 0.0003, 0.0022));
  return scale(y, 0.35 + 0.15 * g.random());
}
function sfxWhoosh(v = 1, d = 0.34) {
  const n = ns(d), y = zeros(n), steps = 16;
  for (let k = 0; k < steps; k++) {
    const c = 500 + 3500 * Math.sin(Math.PI * k / steps), seg = bandNoise(d / steps + 0.03, c * 0.6, c * 1.6, 300 + k);
    const i = Math.floor(k * n / steps), j = Math.min(n, i + seg.length), w = hanning(j - i);
    for (let q = 0; q < j - i; q++) y[i + q] += seg[q] * w[q];
  }
  for (let i = 0; i < n; i++) y[i] *= Math.sin(Math.PI * (n > 1 ? i / (n - 1) : 0)) ** 1.6 * 0.35 * v;
  return y;
}
function sfxChime(notes, d = 1.2) {
  const y = zeros(ns(d + 0.1 * notes.length));
  notes.forEach((n, k) => addInto(y, pluck(n, d, 0.4), ns(k * 0.06)));
  return scale(y, 0.7);
}
function sfxTick(n) { const f = 2400 + (n % 3) * 180; return scale(mul(sine(f, 0.02), envAD(ns(0.02), 0.0003, 0.004)), 0.22); }
function sfxThump(n) {
  const d = 0.45, body = mul(sweep(120, 48, d, 20), envAD(ns(d), 0.001, 0.12));
  addInto(body, mul(bandNoise(0.03, 300, 5000, 400 + n), envAD(ns(0.03), 0.0005, 0.008)), 0, 0.5);
  addInto(body, pluck(PENTA[(n * 2) % PENTA.length] - 12, 0.4, 0.3), 0, 0.5);
  return body;
}
function sfxDrag(d) {
  d = Math.max(0.1, d);
  const y = scale(bandNoise(d, 1500, 5000, 9), 0.08);
  for (let i = 0; i < y.length; i++) { const t = i / SR; y[i] *= Math.min(1, t / 0.05) * Math.min(1, (d - t) / 0.05); }
  return y;
}
function sfxImpact() {
  const d = 1.6, sub = mul(sweep(90, 32, d, 4), envAD(ns(d), 0.002, 0.45));
  addInto(sub, mul(bandNoise(0.5, 80, 3000, 11), envAD(ns(0.5), 0.001, 0.08)), 0, 0.6);
  return scale(sub, 0.9);
}
function sfxShimmer() {
  const y = zeros(ns(2.2));
  [81, 84, 88, 91, 93, 96].forEach((n, k) => addInto(y, scale(mul(sine(midi(n), 1.6), envAD(ns(1.6), 0.004, 0.5)), 0.18), ns(k * 0.045)));
  return y;
}

// ---------------------------------------------------------------- arrangement
function buildMusic(film) {
  const spb = 60 / film.bpm, dur = film.duration, S = film.sections || {}, music = new Bus(dur);
  // Sections are optional for bespoke films: sensible defaults on the beat grid.
  const snap = (x) => Math.round(x / spb) * spb;
  const introEnd = S.intro ? snap(S.intro[1]) : Math.min(snap(4 * spb), dur / 4);
  const out0 = S.outro ? snap(S.outro[0]) : Math.max(introEnd + 4 * spb, snap(dur - 6 * spb));
  let drop = S.drop ? snap(S.drop[0]) : S.logos ? snap(S.logos[0]) : snap(introEnd + (out0 - introEnd) * 0.62);
  drop = Math.min(Math.max(drop, introEnd + 2 * spb), out0);
  const feats = S.features || [introEnd + 4 * spb, drop];
  const chords = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]];   // Am F C G
  const roots = [45, 41, 48, 43];
  const nb = Math.ceil(dur / spb) + 1;

  for (let k = 0; k < nb; k++) {
    const t = k * spb, bar = Math.floor(k / 4), beat = k % 4, ch = chords[bar % 4], root = roots[bar % 4];
    const inBuild = drop - 2 * spb <= t && t < drop;
    const inDrop = drop <= t && t < out0 + 2 * spb;
    const groove = introEnd <= t && t < drop - 2 * spb;
    const full = feats[0] <= t && t < drop - 2 * spb;
    const ending = t >= out0 + 2 * spb;

    if (beat === 0 && t < out0 + 2 * spb) music.add(pad(ch.map((n) => n + 12), 4 * spb + 0.3, inDrop ? 0.6 : 0.45), t, 0.22);
    if (t < introEnd) { if (beat === 0) music.add(kick(0.55), t, 0.8); continue; }
    if (ending) continue;
    if (!(inBuild && t >= drop - 0.5 * spb)) music.add(kick(inDrop || full ? 1 : 0.75), t, 0.9);
    if (groove || inDrop) {
      music.add(hat(), t + spb / 2, 0.8, 0.25);
      if (full || inDrop) { music.add(hat(), t + spb / 4, 0.35, -0.2); music.add(hat(), t + 3 * spb / 4, 0.35, -0.2); }
    }
    if (inDrop) music.add(hat(true), t + spb / 2, 0.35, 0.3);
    if ((full || inDrop) && (beat === 1 || beat === 3)) music.add(clap(), t, 0.7);
    if (groove || inDrop) {
      music.add(bass(root, spb * 0.45), t + spb / 2, 0.55);
      if (inDrop || full) music.add(bass(root + (beat === 3 ? 7 : 0), spb * 0.3), t + 3 * spb / 4, 0.4);
    }
  }
  // snare build into the drop: 8ths -> 16ths -> 32nds
  const tb = drop - 2 * spb;
  const hits = [0, 1].map((i) => tb + i * spb / 2).concat([0, 1].map((i) => tb + spb + i * spb / 4), [0, 1, 2, 3].map((i) => tb + 1.5 * spb + i * spb / 8));
  hits.forEach((h, i) => music.add(snare(0.4 + 0.6 * i / hits.length), h, 0.6));
  music.add(riser(2 * spb), tb, 0.5);
  music.add(crash(), drop, 0.55);
  music.add(stab(chords[0].map((n) => n + 12).concat([chords[0][0] + 24]), 0.6), drop, 0.5);
  const tf = out0 + 2 * spb;   // outro: final chord rings out
  music.add(kick(1), tf, 0.9);
  music.add(pad([57, 64, 69, 72, 76], Math.max(1, dur - tf + 0.6), 0.5), tf, 0.32);
  music.add(crash(), tf, 0.3);
  return music;
}

function buildSfx(film) {
  const sfx = new Bus(film.duration);
  for (const c of film.cues || []) {
    const k = c.k, t = Number(c.t) || 0;
    let n = parseInt(c.n ?? 0, 10); if (!Number.isFinite(n)) n = 0;
    switch (k) {
      case 'born': sfx.add(pluck(PENTA[0] + 12, 0.4), t, 0.5, 0, true); break;
      case 'pop': case 'swap':
        sfx.add(pluck(PENTA[(((2 + 2 * n) % PENTA.length) + PENTA.length) % PENTA.length], 0.6), t, 0.55, ((((n % 3) + 3) % 3) - 1) * 0.2, true);
        sfx.add(sfxWhoosh(0.5, 0.22), t, 0.6, 0, true); break;
      case 'whoosh': sfx.add(sfxWhoosh(Number(c.v ?? 1)), t, 0.8, 0, true); break;
      case 'click': sfx.add(sfxClick(), t, 0.9, 0.15, true); break;
      case 'key': sfx.add(sfxKey(n), t, 0.8, -0.1 + 0.2 * ((((n * 37) % 10) + 10) % 10) / 10, true); break;
      case 'toggle': sfx.add(sfxClick(), t, 0.9, 0, true); sfx.add(pluck(PENTA[6], 0.35, 0.2), t + 0.04, 0.35, 0, true); break;
      case 'drag': sfx.add(sfxDrag(Number(c.d ?? 0.5)), t, 1); break;
      case 'release': sfx.add(sfxClick().subarray(0, ns(0.05)), t, 0.6, 0, true); break;
      case 'check': sfx.add(sfxChime([PENTA[3], PENTA[5], PENTA[7]]), t, 0.6, 0, true); break;
      case 'tick': sfx.add(sfxTick(((n % 3) + 3) % 3), t, 0.9, 0, true); break;
      case 'settle': sfx.add(pluck(PENTA[7], 0.8, 0.3), t, 0.4, 0, true); break;
      case 'drop': sfx.add(sfxImpact(), t, 0.7, 0, true); break;
      case 'slam': sfx.add(sfxThump(Math.abs(n)), t, 0.75, ((((n % 3) + 3) % 3) - 1) * 0.25, true); break;
      case 'cta': sfx.add(sfxClick(), t, 1, 0, true); sfx.add(sfxChime([PENTA[5], PENTA[7], PENTA[9]], 1.4), t + 0.03, 0.5, 0, true); break;
      case 'shimmer': sfx.add(sfxShimmer(), t, 0.8); break;
      case 'note': sfx.add(pluck(PENTA[((n % PENTA.length) + PENTA.length) % PENTA.length], 0.6), t, 0.5, 0, true); break;
      case 'alert': for (let i = 0; i < 3; i++) sfx.add(pluck(PENTA[7] + (i % 2 === 0 ? 0 : -5), 0.25, 0.8), t + i * 0.12, 0.5, 0, true); break;
      case 'riser': sfx.add(riser(Math.max(0.3, Number(c.d ?? 1))), t, 0.6); break;
      default: sfx.add(sfxClick(), t, 0.5, 0, true);   // unknown kind: a soft click rather than silence
    }
  }
  return sfx;
}

/** Decode a user-supplied track with ffmpeg to float stereo. */
function loadMusicFile(file, offset, dur) {
  const r = spawnSync('ffmpeg', ['-v', 'error', '-ss', String(offset || 0), '-i', file, '-t', String(dur + 1), '-f', 'f32le', '-ac', '2', '-ar', String(SR), '-'], { maxBuffer: 1 << 30 });
  if (r.status !== 0) throw new Error(`ffmpeg could not decode ${file}: ${String(r.stderr).slice(-300)}`);
  const f = new Float32Array(r.stdout.buffer, r.stdout.byteOffset, Math.floor(r.stdout.length / 4));
  const b = new Bus(dur), n = Math.min(b.L.length, f.length / 2);
  for (let i = 0; i < n; i++) { b.L[i] = f[2 * i]; b.R[i] = f[2 * i + 1]; }
  return b;
}

/**
 * Render the soundtrack for a film to a 16-bit 48 kHz stereo WAV.
 * @param {{bpm:number, duration:number, sections?:object, cues?:Array, spec?:object}} film
 * @param {string} outPath
 * @param {{baseDir?: string}} [opts] base directory for a relative spec.audio.music path
 */
export function synthesize(film, outPath, opts = {}) {
  globalRng = makeRng(7);
  film = { bpm: 120, cues: [], sections: {}, ...film };
  const dur = Number(film.duration);
  if (!(dur > 0)) throw new Error('film.duration must be a positive number of seconds');
  const au = (film.spec && film.spec.audio) || {};
  const musicPath = au.music ? path.resolve(opts.baseDir || process.cwd(), au.music) : null;
  let music, mg;
  if (musicPath && existsSync(musicPath)) { music = loadMusicFile(musicPath, au.musicOffset || 0, dur); mg = 0.6; }
  else { music = buildMusic(film); mg = 0.5; }
  const sfx = buildSfx(film);
  const n = ns(dur + 0.05), L = zeros(n), R = zeros(n);
  for (let i = 0; i < n; i++) { L[i] = music.L[i] * mg + sfx.L[i] * 0.62; R[i] = music.R[i] * mg + sfx.R[i] * 0.62; }
  const f = Math.min(n, ns(0.35));   // fade the very end so nothing clicks
  for (let q = 0; q < f; q++) { const g = (f > 1 ? 1 - q / (f - 1) : 0) ** 2; L[n - f + q] *= g; R[n - f + q] *= g; }
  let peak = 1e-9;
  for (let i = 0; i < n; i++) {
    if (!Number.isFinite(L[i])) L[i] = 0; if (!Number.isFinite(R[i])) R[i] = 0;
    peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
  }
  if (peak < 1e-4) throw new Error('audio: the mix is silent, refusing to write it');
  const g = 0.93 / peak, buf = Buffer.alloc(44 + n * 4);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + n * 4, 4); buf.write('WAVE', 8); buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22); buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(n * 4, 40);
  const pcm = (v) => Math.round(Math.max(-1, Math.min(1, v * g)) * 32767);
  for (let i = 0; i < n; i++) { buf.writeInt16LE(pcm(L[i]), 44 + i * 4); buf.writeInt16LE(pcm(R[i]), 46 + i * 4); }
  writeFileSync(outPath, buf);
  return { duration: dur, cues: (film.cues || []).length, out: outPath };
}

// CLI: node synth.mjs film.json out.wav
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [filmPath, out] = process.argv.slice(2);
  if (!filmPath || !out) { console.error('usage: node synth.mjs film.json out.wav'); process.exit(1); }
  const r = synthesize(JSON.parse(readFileSync(filmPath, 'utf8')), out);
  console.log(`audio: ${r.duration.toFixed(2)}s, ${r.cues} cues -> ${out}`);
}
