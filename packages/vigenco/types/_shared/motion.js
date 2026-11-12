// Shared motion primitives for every Vigenco video type.
// Every frame is a pure function of time: nothing here keeps state between frames.
// Spring / Track / vis patterns adapted from AbubakrChan/product-launch-motion (MIT), see NOTICE.

(function (g) {
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const lerp = (a, b, x) => a + (b - a) * x;
  const outQ = (x) => 1 - Math.pow(1 - clamp(x), 4);
  const inOut = (x) => { x = clamp(x); return x < 0.5 ? 8 * x ** 4 : 1 - Math.pow(-2 * x + 2, 4) / 2; };

  // Closed-form damped spring step response, 0 -> 1.
  function stepR(tau, { w, z }) {
    if (tau <= 0) return 0;
    if (z >= 1) { const x = w * tau; return 1 - Math.exp(-x) * (1 + x); }
    const wd = w * Math.sqrt(1 - z * z);
    return 1 - Math.exp(-z * w * tau) * (Math.cos(wd * tau) + (z * w / wd) * Math.sin(wd * tau));
  }

  // Many target changes = the sum of one spring per change. Pure in t.
  class Track {
    constructor(v0) { this.v0 = v0; this.cur = v0; this.ev = []; }
    to(t, v, sp = SP.soft) { if (v !== this.cur) { this.ev.push([t, v - this.cur, sp]); this.cur = v; } return this; }
    set(t, v) { return this.to(t, v, SP.snap); }
    at(t) { let v = this.v0; for (const [ti, d, sp] of this.ev) v += d * stepR(t - ti, sp); return v; }
  }

  const SP = {
    snap: { w: 400, z: 1 },
    shape: { w: 17, z: 0.8 },   // the hero shape: a tiny overshoot
    soft: { w: 13, z: 0.86 },
    cam: { w: 7.5, z: 1 },      // camera never overshoots
    text: { w: 26, z: 1 },
    cursor: { w: 11, z: 0.92 },
    pop: { w: 24, z: 0.72 },
  };

  // Content swap: enter on a spring, exit short and early with a blur.
  function vis(t, tin, tout, dOut = 0.12) {
    const e = stepR(t - tin, SP.text);
    const x = tout == null ? 0 : clamp((t - tout) / dOut), xo = x * x;
    return { o: e * (1 - xo), b: (1 - e) * 10 + xo * 10, dy: (1 - e) * 16 - xo * 10, e, gone: xo >= 1 || e <= 0.001 };
  }
  function applyVis(el, v, extra = '') {
    if (v.gone) { el.style.opacity = 0; el.style.visibility = 'hidden'; return; }
    el.style.visibility = 'visible';
    el.style.opacity = v.o.toFixed(4);
    el.style.filter = v.b > 0.05 ? `blur(${v.b.toFixed(2)}px)` : 'none';
    el.style.transform = `translateY(${v.dy.toFixed(2)}px) ${extra}`;
  }

  // Colours ride three springs, one per channel.
  function hexRgb(h) {
    h = h.replace('#', '');
    if (h.length === 3) h = h.split('').map((c) => c + c).join('');
    const n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  class ColorTrack {
    constructor(hex) { const c = hexRgb(hex); this.ch = c.map((v) => new Track(v)); }
    to(t, hex, sp = SP.soft) { hexRgb(hex).forEach((v, i) => this.ch[i].to(t, v, sp)); return this; }
    at(t) { return `rgb(${this.ch.map((c) => Math.round(clamp(c.at(t), 0, 255))).join(',')})`; }
  }
  function mix(hexA, hexB, x) {
    const a = hexRgb(hexA), b = hexRgb(hexB);
    return '#' + a.map((v, i) => Math.round(lerp(v, b[i], x)).toString(16).padStart(2, '0')).join('');
  }
  function luma(hex) { const [r, g2, b] = hexRgb(hex); return (0.2126 * r + 0.7152 * g2 + 0.0722 * b) / 255; }

  // Press scale and ripple for a click at tc.
  const press = (t, tc) => 1 - 0.16 * Math.exp(-(((t - tc) / 0.045) ** 2));
  function ripple(t, tc, dur = 0.4) {
    const x = (t - tc) / dur;
    if (x < 0 || x > 1) return null;
    return { s: lerp(0.3, 1.6, outQ(x)), o: 0.45 * (1 - x) };
  }

  // Text measuring (call after document.fonts.ready).
  const _cv = document.createElement('canvas').getContext('2d');
  function measure(text, font) { _cv.font = font; return _cv.measureText(text).width; }

  g.M = { clamp, lerp, outQ, inOut, stepR, Track, ColorTrack, SP, vis, applyVis, hexRgb, mix, luma, press, ripple, measure };
})(window);
