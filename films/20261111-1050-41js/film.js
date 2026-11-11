// Saling Jaga · "Saat bencana datang, kita saling jaga" + the 12-tester ask. Portrait 1080×1920, 120 BPM, 37 s.
// One shape, never cut: status pill (signal dies) → logo disc (find phones) → walkie capsule → group chat card
// → SOS card (drop) → compass disc → meeting-point bar → logo disc (tagline) → tester card (12 slots → 14 days)
// → "Daftar jadi penguji" button.
(async function () {
  try {
    const { clamp, lerp, stepR, Track, ColorTrack, SP, vis, applyVis, press, ripple } = M;
    const C = { night: '#07110c', card: '#0f1f17', card2: '#13271d', cream: '#f2edd5', paper: '#f6f4ea', muted: '#a5b0a2',
      dim: '#6f7c6f', ink: '#1c2a21', grey: '#6b7469', leaf: '#3cbf6e', leafInk: '#04140a', moss: '#1b4d2e',
      lamp: '#f2c46b', sos: '#ef4b4b', budi: '#e8590c', rt: '#1e7a45', nenek: '#d6336c', line: '#e4e1d3' };

    await Promise.all([
      document.fonts.load('800 96px "Plus Jakarta Sans"'), document.fonts.load('500 38px "Plus Jakarta Sans"'),
      document.fonts.load('700 38px "Plus Jakarta Sans"'), document.fonts.load('600 38px "Plus Jakarta Sans"'),
      document.fonts.load('600 30px "JetBrains Mono"'), document.fonts.load('700 40px "JetBrains Mono"'),
      document.fonts.load('italic 400 100px "Instrument Serif"'),
    ].map((p) => p.catch(() => null)));
    await document.fonts.ready;
    const logo = new Image(); logo.src = 'assets/mark.png';
    await new Promise((r) => { if (logo.complete) r(); logo.onload = r; logo.onerror = r; });

    const cues = [];
    const cue = (t, k, o = {}) => cues.push({ t, k, ...o });
    const world = document.getElementById('world');
    const hud = document.getElementById('hud');
    const redL = document.getElementById('red');
    const lampL = document.getElementById('lamp');
    const draws = [];
    const add = (html, parent = hud) => { const d = document.createElement('div'); d.innerHTML = html.trim(); const e = d.firstElementChild; parent.appendChild(e); return e; };
    const W = (html) => add(html, world);
    const at = (e, x, y) => { e.style.left = x.toFixed(2) + 'px'; e.style.top = y.toFixed(2) + 'px'; return e; };
    const rect = (e, x, y, w, h) => { e.style.left = x.toFixed(2) + 'px'; e.style.top = y.toFixed(2) + 'px'; e.style.width = Math.max(0, w).toFixed(2) + 'px'; e.style.height = Math.max(0, h).toFixed(2) + 'px'; };
    const ctr = (e, cx, cy) => at(e, cx - e.offsetWidth / 2, cy - e.offsetHeight / 2);
    const show = (e, tin, tout, extra = '') => draws.push((t) => applyVis(e, vis(t, tin, tout), typeof extra === 'function' ? extra(t) : extra));
    const popS = (t, tin, s0 = 0.5) => s0 + (1 - s0) * stepR(t - tin, SP.pop);
    const bump = (t, tc, a = 0.06, d = 0.08) => 1 + a * Math.exp(-(((t - tc) / d) ** 2));
    const P = (d, sw = 2.2) => `<svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
    const I = {
      mic: P('<rect x="9" y="2.5" width="6" height="11.5" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0"/><path d="M12 17.5V21"/>'),
      check: P('<path d="M20 6 9 17l-5-5"/>', 3),
      arrow: P('<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>', 2.6),
      send: P('<path d="M4 12 20 4l-6 16-3-7z"/>', 2.4),
      flag: P('<path d="M5 22V3.5"/><path d="M5 4h12l-2.5 4L17 12H5"/>', 2.4),
      med: P('<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M12 9v6M9 12h6"/>'),
      nosig: P('<path d="M4 20v-2M9 20v-5M14 20v-8M19 20V7" opacity=".4"/><path d="m3 3 18 18"/>', 2.4),
      user: P('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'),
      lock: P('<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>'),
      nav: P('<path d="M12 2 19 21l-7-4-7 4z"/>', 2.2),
    };
    const ico = (k, s, col = 'currentColor', st = '') => `<span class="ic" style="width:${s}px;height:${s}px;color:${col};${st}">${I[k]}</span>`;

    const SX = 540, SY = 1150;

    // ───────────────────────── Camera + quake ─────────────────────────
    const CAM = { z: new Track(Math.log(1.08)), zx: new Track(SX), zy: new Track(SY) };
    const cam = (t, z, sp = SP.cam) => CAM.z.to(t, Math.log(z), sp);
    cam(0.0, 1.0);
    cam(3.5, 1.05); cam(6.5, 1.0);
    cam(9.0, 1.06); cam(10.5, 1.0);
    cam(14.0, 1.07, { w: 3, z: 1 }); cam(15.875, 1.0, { w: 14, z: 0.85 });
    cam(20.0, 1.05); cam(23.5, 1.0);
    cam(26.0, 1.08, { w: 14, z: 0.85 }); cam(27.0, 1.0, { w: 4, z: 1 });
    cam(31.5, 1.03); cam(34.25, 1.0);
    const quake = (t) => {
      let x = 0, y = 0;
      const d = t - 0.5;
      if (d > 0 && d < 3.0) {
        const env = clamp(d / 0.5) * Math.exp(-Math.max(0, d - 0.5) * 1.5);
        x += 15 * env * (Math.sin(d * 47) + 0.5 * Math.sin(d * 83 + 1.3));
        y += 9 * env * (Math.sin(d * 39 + 0.7) + 0.4 * Math.sin(d * 71));
      }
      const h = t - 16.0;
      if (h > 0 && h < 0.6) x += 14 * Math.exp(-h * 8) * Math.sin(h * 70);
      return [x, y];
    };
    const BASE = 1.06;   // portrait: the shape fills more of the frame
    const toS = (x, y, t) => { const z = BASE * Math.exp(CAM.z.at(t)), zx = CAM.zx.at(t), zy = CAM.zy.at(t), [qx, qy] = quake(t); return [zx + (x - zx) * z + qx, zy + (y - zy) * z + qy]; };

    // red wash on the SOS beats; warm lamp at the end ("dawn")
    draws.push((t) => {
      let r = 0.12 * clamp((t - 2.0) / 0.2) * clamp((3.5 - t) / 0.4);
      for (const tb of [16, 17, 18, 19]) { const d = t - tb; if (d >= 0) r = Math.max(r, 0.95 * Math.exp(-d * 2.4)); }
      r *= clamp((20.25 - t) / 0.4);
      redL.style.opacity = r.toFixed(3);
      lampL.style.opacity = (stepR(t - 26.0, { w: 3, z: 1 })).toFixed(3);
    });

    // ───────────────────────── SVG layer (under the shape) ─────────────────────────
    const svg = W(`<svg width="1080" height="1920" viewBox="0 0 1080 1920" style="left:0;top:0;overflow:visible"></svg>`);
    const NS = 'http://www.w3.org/2000/svg';
    const sv = (tag, attrs) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); svg.appendChild(e); return e; };
    const rings = [4.5, 5.0, 5.5, 6.0].map((tb) => ({ tb, e: sv('circle', { cx: SX, cy: SY, r: 190, fill: 'none', stroke: C.leaf, 'stroke-width': 4 }) }));
    draws.push((t) => rings.forEach(({ tb, e }) => {
      const x = (t - tb) / 1.5;
      if (x < 0 || x > 1) { e.setAttribute('opacity', 0); return; }
      e.setAttribute('r', (190 + 330 * (1 - Math.pow(1 - x, 3))).toFixed(1));
      e.setAttribute('opacity', (0.6 * (1 - x)).toFixed(3));
    }));
    // the mesh: avatars around the disc, each linked to the disc and to its neighbour
    const PEERS = [
      { n: 'B', name: 'Budi', col: C.budi, a: 205, tb: 5.0 },
      { n: 'R', name: 'Pak RT', col: C.rt, a: 335, tb: 5.5 },
      { n: 'N', name: 'Nenek', col: C.nenek, a: 25, tb: 6.0 },
      { n: 'K', name: 'Kamu', col: C.leaf, a: 155, tb: 6.5 },
    ].map((p) => ({ ...p, x: SX + 340 * Math.cos(p.a * Math.PI / 180), y: SY + 340 * Math.sin(p.a * Math.PI / 180) }));
    const PIN = 7.375;
    PEERS.forEach((p, i) => {
      p.ln = sv('line', { x1: SX, y1: SY, x2: SX, y2: SY, stroke: C.leaf, 'stroke-width': 3, 'stroke-dasharray': '10 12', opacity: 0 });
    });
    draws.push((t) => PEERS.forEach((p) => {
      const e = stepR(t - p.tb, { w: 14, z: 1 });
      const o = 0.55 * e * clamp((PIN + 0.12 - t) / 0.12);
      p.ln.setAttribute('x2', lerp(SX, p.x, e).toFixed(1)); p.ln.setAttribute('y2', lerp(SY, p.y, e).toFixed(1));
      p.ln.setAttribute('opacity', o.toFixed(3));
      p.ln.setAttribute('stroke-dashoffset', (-t * 60).toFixed(1));
    }));

    // ───────────────────────── The one shape ─────────────────────────
    const body = W('<div style="box-shadow:0 30px 80px rgba(0,0,0,.35)"></div>');
    const PB = { l: new Track(SX - 320), t: new Track(SY - 64), r: new Track(SX + 320), b: new Track(SY + 64), rad: new Track(64), col: new ColorTrack(C.card2) };
    const pm = (t, w, h, rad, col, sp = SP.shape, cy = SY) => {
      PB.l.to(t, SX - w / 2, sp); PB.t.to(t, cy - h / 2, sp); PB.r.to(t, SX + w / 2, sp); PB.b.to(t, cy + h / 2, sp); PB.rad.to(t, rad, sp);
      if (col) PB.col.to(t, col, SP.soft);
    };
    const CARI = 4.5, HOLD = 9.0, REL = 10.5, SEND = 15.0, GO = 19.5, CTA = 35.25;
    pm(3.375, 380, 380, 190, C.cream);
    pm(7.375, 820, 220, 110, C.leaf);
    pm(HOLD, 820, 220, 110, C.moss, SP.shape);
    pm(REL, 820, 220, 110, C.leaf);
    pm(11.375, 880, 720, 48, C.paper);
    pm(15.875, 900, 620, 56, C.sos, { w: 22, z: 0.78 });
    pm(19.875, 680, 680, 340, C.card2);
    pm(23.375, 880, 380, 48, C.paper);
    pm(25.875, 420, 420, 210, C.cream, { w: 20, z: 0.8 });
    pm(27.875, 920, 840, 52, C.card2);
    pm(34.25, 780, 170, 85, C.leaf);
    const bodyHits = [CARI, SEND, GO, 26.0];
    draws.push((t) => {
      const l = PB.l.at(t), tp = PB.t.at(t), r = PB.r.at(t), b = PB.b.at(t);
      rect(body, l, tp, r - l, b - tp);
      body.style.borderRadius = Math.min(PB.rad.at(t), (r - l) / 2, (b - tp) / 2).toFixed(2) + 'px';
      body.style.background = PB.col.at(t);
      let s = popS(t, 0, 0.3);
      for (const tc of bodyHits) s *= 1 - 0.035 * Math.exp(-(((t - tc) / 0.08) ** 2));
      s *= 1 - 0.035 * clamp((t - HOLD) / 0.1) * clamp((REL - t) / 0.1);
      for (const tc of [16.0, 17.0, 18.0, 19.0]) s *= 1 + 0.02 * Math.exp(-(((t - tc) / 0.09) ** 2));
      s *= 1 - 0.4 * (1 - press(t, CTA)); // gentle press on the CTA
      body.style.transform = `scale(${s.toFixed(4)})`;
    });

    // ───────────────────────── Headlines (screen space) ─────────────────────────
    const HX = 80, HY = 180;
    const block = (lbl, head, sub, tin, tout) => {
      const e = add(`<div style="left:${HX}px;top:${HY}px;display:flex;flex-direction:column;gap:30px">
        ${lbl ? `<div class="lbl">${lbl}</div>` : ''}<div class="head">${head}</div>${sub ? `<div class="sub">${sub}</div>` : ''}</div>`);
      show(e, tin, tout); return e;
    };
    block('02.14 · Gempa', 'Saat bencana <span class="serif">datang,</span>', 'sinyal yang pertama hilang.', 0.25, 3.25);
    block('HP ke HP', 'Saling Jaga <span class="serif">menyambungkan</span> kita.', 'Lewat Wi‑Fi Direct. Tanpa internet, pulsa, atau BTS.', 3.5, 7.25);
    block('Walkie-talkie', 'Tahan, lalu bicara ke <span class="serif">semua.</span>', 'Satu tombol untuk seluruh grup.', 7.5, 11.25);
    block('Chat grup', 'Kabar tetap <span class="serif">sampai.</span>', 'Terenkripsi ujung ke ujung.', 11.5, 15.75);
    block('<span style="color:#ff7a7a">SOS</span>', 'Satu tombol, semua HP <span class="serif" style="color:#ff8a8a">berbunyi.</span>', 'Lengkap dengan jarak, arah, dan kartu medis.', 16.125, 19.75);
    block('Kompas offline', 'Ikuti panah ke yang butuh <span class="serif">bantuan.</span>', '', 20.0, 23.25);
    block('Titik kumpul', 'Lihat siapa yang sudah <span class="serif">tiba.</span>', 'Semua tercatat, tanpa satu bar sinyal.', 23.5, 25.75);
    block('', 'Saat sinyal hilang, kita tetap <span class="serif">saling jaga.</span>', '', 26.125, 27.75);
    const askHead = add(`<div style="left:${HX}px;top:${HY}px;display:flex;flex-direction:column;gap:30px">
      <div class="lbl">Menuju Play Store</div><div class="head">Bantu kami <span class="serif">rilis.</span></div></div>`);
    show(askHead, 28.125, 34.125);
    const askSubA = add(`<div class="sub" style="left:${HX}px;top:${HY + 30 + 30 + 98 + 30}px">Sebelum masuk Play Store, Saling Jaga harus diuji dulu.</div>`);
    const askSubB = add(`<div class="sub" style="left:${HX}px;top:${HY + 30 + 30 + 98 + 30}px">12 penguji internal selama 14 hari, lalu <b style="color:#f2edd5">rilis di Play Store.</b></div>`);
    show(askSubA, 28.375, 31.5); show(askSubB, 31.75, 34.125);
    block('Jadi penguji', 'Jadi salah satu dari <span class="serif">12?</span>', 'Daftar lewat saling-jaga.com', 34.375, null);

    // ───────────────────────── S0 · status pill: the signal dies ─────────────────────────
    const s0a = W(`<div style="width:640px;height:128px;display:flex;align-items:center;justify-content:space-between;padding:0 54px">
      <span class="mono" style="font:700 48px/1 'JetBrains Mono';color:${C.cream}">02.14</span>
      <span style="display:flex;align-items:flex-end;gap:9px;height:52px" id="bars">${[18, 28, 40, 52].map((h) => `<i style="display:block;width:13px;height:${h}px;border-radius:4px;background:${C.cream}"></i>`).join('')}
      <b style="font:800 34px/1 'Plus Jakarta Sans';margin-left:12px;align-self:center">4G</b></span></div>`);
    ctr(s0a, SX, SY); show(s0a, 0.125, 2.0, 'scale(1)');
    const barEls = [...s0a.querySelectorAll('i')];
    const bars4g = s0a.querySelector('b');
    draws.push((t) => {
      barEls.forEach((b, i) => { const k = 3 - i, tk = 1.0 + k * 0.25; b.style.opacity = t < tk ? 1 : 0.16; b.style.transform = `scaleY(${t < tk ? 1 : 0.85})`; });
      bars4g.style.opacity = t < 1.75 ? 1 : 0.2;
    });
    [1.0, 1.25, 1.5, 1.75].forEach((tt) => cue(tt, 'tick'));
    cue(1.0, 'slam', { n: 0 });
    const s0b = W(`<div style="width:640px;height:128px;display:flex;align-items:center;justify-content:center;gap:22px;color:#ff8a8a">
      ${ico('nosig', 56)}<span style="font:800 46px/1 'Plus Jakarta Sans';letter-spacing:-.02em">Tanpa sinyal</span></div>`);
    ctr(s0b, SX, SY); show(s0b, 2.125, 3.25);
    cue(2.0, 'alert');

    // ───────────────────────── S1 · logo disc: find nearby phones ─────────────────────────
    const s1 = W(`<div style="width:300px;height:300px"><img src="assets/mark.png" style="width:300px;height:300px;display:block"></div>`);
    ctr(s1, SX, SY); show(s1, 3.625, PIN, (t) => `scale(${(popS(t, 3.625, 0.7) * press(t, CARI)).toFixed(4)})`);
    cue(3.5, 'swap', { n: 0 });
    const pill = (txt, col = C.cream, bg = C.card2) => `<div style="padding:18px 32px;border-radius:999px;background:${bg};color:${col};font:700 36px/1 'Plus Jakarta Sans';white-space:nowrap;display:flex;align-items:center;gap:14px">${txt}</div>`;
    const l1 = W(pill('Ketuk untuk cari HP sekitar')), l2 = W(pill('Mencari…', C.leaf)), l3 = W(pill(`${ico('check', 34, C.leafInk)} 4 HP terhubung`, C.leafInk, C.leaf));
    ctr(l1, SX, SY + 470); ctr(l2, SX, SY + 470); ctr(l3, SX, SY + 470);
    show(l1, 3.875, 4.5); show(l2, 4.625, 6.375); show(l3, 6.5, PIN, (t) => `scale(${popS(t, 6.5, 0.8).toFixed(4)})`);
    cue(CARI, 'click'); cue(5.0, 'note', { n: 0 });
    cue(6.5, 'check');
    PEERS.forEach((p, i) => {
      const e = W(`<div style="display:flex;flex-direction:column;align-items:center;gap:12px;width:200px">
        <div class="av" style="width:120px;height:120px;background:${p.col};font-size:52px;border:6px solid ${C.night}">${p.n}</div>
        <span style="font:700 30px/1 'Plus Jakarta Sans';color:${C.cream}">${p.name}</span></div>`);
      at(e, p.x - 100, p.y - 60);
      show(e, p.tb, PIN, (t) => `scale(${popS(t, p.tb, 0.4).toFixed(4)})`);
      cue(p.tb, 'pop', { n: i });
    });

    // ───────────────────────── S2 · walkie capsule ─────────────────────────
    const s2a = W(`<div style="width:820px;height:220px;display:flex;align-items:center;justify-content:center;gap:28px;color:${C.leafInk}">
      <span class="av" style="width:120px;height:120px;background:${C.leafInk};color:${C.leaf}">${ico('mic', 60)}</span>
      <span style="font:800 54px/1 'Plus Jakarta Sans';letter-spacing:-.03em">Tahan untuk bicara</span></div>`);
    ctr(s2a, SX, SY); show(s2a, 7.625, HOLD - 0.05);
    cue(7.5, 'swap', { n: 1 });
    const wave = [...Array(15)].map((_, i) => `<i style="display:block;width:14px;border-radius:7px;background:${C.leaf}"></i>`).join('');
    const s2b = W(`<div style="width:820px;height:220px;display:flex;align-items:center;justify-content:center;gap:30px;color:${C.cream}">
      <span class="av" style="width:120px;height:120px;background:${C.leaf};color:${C.leafInk}">${ico('mic', 60)}</span>
      <span style="display:flex;flex-direction:column;gap:14px"><span style="font:800 44px/1 'Plus Jakarta Sans';letter-spacing:-.02em">Bicara ke 3 HP…</span>
      <span id="wv" style="display:flex;align-items:center;gap:9px;height:56px">${wave}</span></span></div>`);
    ctr(s2b, SX, SY); show(s2b, HOLD + 0.06, REL);
    const wvEls = [...s2b.querySelectorAll('i')];
    draws.push((t) => wvEls.forEach((e, i) => {
      const a = 0.25 + 0.75 * Math.abs(Math.sin(t * 9.3 + i * 0.9) * Math.sin(t * 4.1 + i * 0.37));
      e.style.height = (8 + 48 * a).toFixed(1) + 'px';
    }));
    const s2c = W(`<div style="width:820px;height:220px;display:flex;align-items:center;justify-content:center;gap:24px;color:${C.leafInk}">
      ${ico('check', 64)}<span style="font:800 52px/1 'Plus Jakarta Sans';letter-spacing:-.03em">Terkirim ke grup</span></div>`);
    ctr(s2c, SX, SY); show(s2c, REL + 0.125, 11.25);
    // ring pulses while talking
    const talkRings = [9.25, 9.75, 10.25].map((tb) => ({ tb, e: sv('rect', { fill: 'none', stroke: C.leaf, 'stroke-width': 4 }) }));
    draws.push((t) => talkRings.forEach(({ tb, e }) => {
      const x = (t - tb) / 1.0;
      if (x < 0 || x > 1) { e.setAttribute('opacity', 0); return; }
      const g = 70 * (1 - Math.pow(1 - x, 3)), w = 820 + 2 * g, h = 220 + 2 * g;
      e.setAttribute('x', SX - w / 2); e.setAttribute('y', SY - h / 2); e.setAttribute('width', w); e.setAttribute('height', h);
      e.setAttribute('rx', h / 2); e.setAttribute('opacity', (0.5 * (1 - x)).toFixed(3));
    }));
    cue(HOLD, 'click'); cue(HOLD, 'drag', { d: REL - HOLD }); cue(REL, 'release'); cue(REL + 0.25, 'check');

    // ───────────────────────── S3 · group chat card ─────────────────────────
    const CL = SX - 440, CT = SY - 360;
    const s3h = W(`<div style="width:880px;height:120px;display:flex;align-items:center;gap:22px;padding:0 40px;border-bottom:2px solid ${C.line}">
      <img src="assets/mark.png" style="width:72px;height:72px">
      <span style="display:flex;flex-direction:column;gap:8px"><b style="font:800 38px/1 'Plus Jakarta Sans';color:${C.ink}">Grup RT 04 · 4 orang</b>
      <span style="font:600 26px/1 'Plus Jakarta Sans';color:${C.rt}">Tanpa sinyal · tetap terhubung</span></span></div>`);
    at(s3h, CL, CT); show(s3h, 11.625, 15.75);
    cue(11.5, 'swap', { n: 2 });
    const bubble = (who, col, txt) => `<div style="max-width:640px;padding:22px 28px;border-radius:30px 30px 30px 10px;background:#fff;border:2px solid ${C.line};display:flex;flex-direction:column;gap:10px">
      <b style="font:700 28px/1 'Plus Jakarta Sans';color:${col}">${who}</b><span style="font:500 36px/1.25 'Plus Jakarta Sans';color:${C.ink}">${txt}</span></div>`;
    const m1 = W(bubble('Budi', C.budi, 'Aku di pos ronda, aman.'));
    at(m1, CL + 36, CT + 150); show(m1, 12.0, 15.75, (t) => `scale(${popS(t, 12.0, 0.85).toFixed(4)})`); m1.style.transformOrigin = '0 100%';
    const m2 = W(`<div style="width:808px;padding:22px 28px;border-radius:28px;background:#fdf1d8;display:flex;flex-direction:column;gap:12px">
      <b class="mono" style="font:700 24px/1 'JetBrains Mono';letter-spacing:.08em;color:#9a6a10">PENGUMUMAN · PAK RT</b>
      <span style="font:800 38px/1.2 'Plus Jakarta Sans';color:${C.ink}">Kumpul di balai desa. Bawa senter.</span></div>`);
    at(m2, CL + 36, CT + 300); show(m2, 12.5, 15.75, (t) => `scale(${popS(t, 12.5, 0.9).toFixed(4)})`);
    cue(12.0, 'pop', { n: 1 }); cue(12.5, 'pop', { n: 3 });
    const MSG = 'Aku jemput Nenek.';
    const m3 = W(`<div style="padding:22px 30px;border-radius:30px 30px 10px 30px;background:${C.rt};color:#fff;font:600 38px/1.2 'Plus Jakarta Sans'">${MSG}</div>`);
    at(m3, CL + 880 - 36 - m3.offsetWidth, CT + 470); m3.style.transformOrigin = '100% 100%';
    show(m3, SEND + 0.05, 15.75, (t) => `scale(${popS(t, SEND + 0.05, 0.7).toFixed(4)})`);
    const comp = W(`<div style="width:808px;height:96px;border-radius:48px;background:#fff;border:2px solid ${C.line};display:flex;align-items:center;padding:0 14px 0 34px;gap:16px">
      <span id="ty" style="flex:1;font:500 36px/1 'Plus Jakarta Sans';color:${C.ink};white-space:nowrap"></span>
      <span class="av" style="width:72px;height:72px;background:${C.rt};color:#fff">${ico('send', 36)}</span></div>`);
    at(comp, CL + 36, CT + 720 - 36 - 96); show(comp, 11.875, 15.75);
    const ty = comp.querySelector('#ty'), sendBtn = comp.querySelector('.av');
    const TY0 = 12.75;
    for (let i = 0; i < MSG.length; i++) cue(TY0 + i * 0.125, 'key');
    draws.push((t) => {
      const n = t >= SEND ? 0 : clamp(Math.floor((t - TY0) / 0.125) + 1, 0, MSG.length);
      const caret = t < SEND && t > 12.0 && Math.floor(t * 4) % 2 === 0 ? '<span style="color:#1e7a45">|</span>' : '';
      ty.innerHTML = n === 0 && t < TY0 ? `<span style="color:${C.grey}">Ketik pesan</span>` : (n === 0 ? `<span style="color:${C.grey}">Ketik pesan</span>` : MSG.slice(0, n) + caret);
      sendBtn.style.transform = `scale(${press(t, SEND).toFixed(4)})`;
    });
    cue(14.0, 'riser', { d: 2.0 }); cue(SEND, 'click'); cue(SEND, 'whoosh', { v: 0.5 });

    // ───────────────────────── S4 · SOS card (the drop) ─────────────────────────
    const ST = SY - 310, SL = SX - 450;
    const s4a = W(`<div style="width:900px;display:flex;align-items:center;gap:30px;padding:0 50px">
      <span class="av" style="width:130px;height:130px;background:${C.cream};color:${C.nenek};font-size:60px">N</span>
      <span style="display:flex;flex-direction:column;gap:12px;color:#fff">
        <b class="mono" style="font:700 32px/1 'JetBrains Mono';letter-spacing:.14em;opacity:.85">SOS MASUK</b>
        <b style="font:800 58px/1.04 'Plus Jakarta Sans';letter-spacing:-.03em">Nenek minta tolong</b></span></div>`);
    at(s4a, SL, ST + 60); show(s4a, 16.125, 19.75, (t) => `scale(${popS(t, 16.125, 0.85).toFixed(4)})`);
    const s4b = W(`<div class="mono" style="width:900px;padding:0 50px;font:700 40px/1 'JetBrains Mono';color:#fff;display:flex;gap:26px;white-space:nowrap">
      <span>${ico('nav', 40, '#fff', 'transform:rotate(0deg)')} 180 m</span><span style="opacity:.6">·</span><span>utara</span><span style="opacity:.6">·</span><span>baterai 18%</span></div>`);
    at(s4b, SL, ST + 240); show(s4b, 16.375, 19.75);
    const s4c = W(`<div style="padding:18px 28px;border-radius:22px;background:rgba(255,255,255,.18);color:#fff;font:700 34px/1 'Plus Jakarta Sans';display:flex;align-items:center;gap:16px;white-space:nowrap">
      ${ico('med', 40)} Kartu medis: darah tinggi</div>`);
    at(s4c, SL + 50, ST + 320); show(s4c, 16.625, 19.75);
    const s4d = W(`<div style="width:800px;height:120px;border-radius:60px;background:${C.cream};color:${C.sos};display:flex;align-items:center;justify-content:center;gap:20px;font:800 46px/1 'Plus Jakarta Sans'">
      Arahkan ke Nenek ${ico('arrow', 46)}</div>`);
    at(s4d, SX - 400, ST + 620 - 50 - 120); show(s4d, 17.125, 19.75, (t) => `scale(${press(t, GO).toFixed(4)})`);
    cue(16.0, 'drop'); cue(16.0, 'slam', { n: 2 });
    cue(16.375, 'tick'); cue(16.625, 'tick'); cue(17.125, 'pop', { n: 4 });
    [17.0, 18.0, 19.0].forEach((tt) => cue(tt, 'alert'));
    cue(GO, 'click');

    // ───────────────────────── S5 · compass disc ─────────────────────────
    const cmp = W(`<svg width="680" height="680" viewBox="-340 -340 680 680" style="overflow:visible">
      <g id="dial">${[...Array(72)].map((_, i) => { const a = i * 5 * Math.PI / 180, r1 = i % 6 === 0 ? 270 : 284, w = i % 6 === 0 ? 4 : 2;
        return `<line x1="${(Math.sin(a) * r1).toFixed(1)}" y1="${(-Math.cos(a) * r1).toFixed(1)}" x2="${(Math.sin(a) * 304).toFixed(1)}" y2="${(-Math.cos(a) * 304).toFixed(1)}" stroke="${C.muted}" stroke-width="${w}" opacity=".6"/>`; }).join('')}
        ${[['U', 0], ['T', 90], ['S', 180], ['B', 270]].map(([s, d]) => { const a = d * Math.PI / 180; return `<text x="${(Math.sin(a) * 232).toFixed(1)}" y="${(-Math.cos(a) * 232 + 14).toFixed(1)}" text-anchor="middle" font-family="JetBrains Mono" font-weight="700" font-size="40" fill="${s === 'U' ? C.sos : C.cream}">${s}</text>`; }).join('')}
        <g id="tgt"><circle cx="0" cy="-292" r="34" fill="${C.nenek}" stroke="${C.card2}" stroke-width="6"/><text x="0" y="-279" text-anchor="middle" font-family="Plus Jakarta Sans" font-weight="800" font-size="36" fill="#fff">N</text></g>
      </g>
      <path id="needle" d="M0 -200 L34 -120 L0 -138 L-34 -120 Z" fill="${C.leaf}"/>
    </svg>`);
    at(cmp, SX - 340, SY - 340); show(cmp, 20.125, 23.25, (t) => `rotate(0deg) scale(${popS(t, 20.125, 0.85).toFixed(4)})`);
    const dial = cmp.querySelector('#dial');
    const HEAD = new Track(-64).to(20.25, -30, { w: 5, z: 0.95 }).to(21.5, 8, { w: 6, z: 0.9 }).to(22.5, 0, { w: 7, z: 0.95 });
    draws.push((t) => dial.setAttribute('transform', `rotate(${HEAD.at(t).toFixed(2)})`));
    const dist = W(`<div style="width:400px;display:flex;flex-direction:column;align-items:center;gap:10px">
      <span id="dn" class="mono" style="font:700 120px/1 'JetBrains Mono';color:${C.cream};letter-spacing:-.04em;font-variant-numeric:tabular-nums">180 m</span>
      <span style="font:700 34px/1 'Plus Jakarta Sans';color:${C.muted}">ke Nenek</span></div>`);
    ctr(dist, SX, SY + 50); show(dist, 20.25, 23.25);
    const dn = dist.querySelector('#dn');
    const D_T = [20.5, 20.75, 21.0, 21.25, 21.5, 21.75, 22.0, 22.25, 22.5, 22.75, 23.0];
    const D_V = [180, 162, 141, 120, 104, 86, 69, 52, 38, 24, 12];
    draws.push((t) => { let v = 180; D_T.forEach((tt, i) => { if (t >= tt) v = D_V[i]; }); dn.innerHTML = v + '<span style="font-size:64px;margin-left:14px;color:#a5b0a2">m</span>'; });
    D_T.forEach((tt) => cue(tt, 'tick'));
    cue(20.0, 'swap', { n: 3 }); cue(20.0, 'whoosh', { v: 0.6 }); cue(23.0, 'settle');

    // ───────────────────────── S6 · meeting-point bar ─────────────────────────
    const BT = SY - 190, BL = SX - 440;
    const s6h = W(`<div style="width:880px;display:flex;align-items:center;gap:22px;padding:0 50px">
      <span class="av" style="width:84px;height:84px;background:${C.leaf};color:${C.leafInk}">${ico('flag', 44)}</span>
      <span style="display:flex;flex-direction:column;gap:8px"><b style="font:800 44px/1 'Plus Jakarta Sans';color:${C.ink};letter-spacing:-.02em">Balai desa</b>
      <span id="cnt" class="mono" style="font:700 28px/1 'JetBrains Mono';color:${C.rt};letter-spacing:.06em">0/4 TIBA</span></span></div>`);
    at(s6h, BL, BT + 50); show(s6h, 23.625, 25.75);
    const cnt = s6h.querySelector('#cnt');
    const ARR = [24.0, 24.5, 25.0, 25.25];
    draws.push((t) => { const n = ARR.filter((a) => t >= a).length; cnt.textContent = `${n}/4 TIBA${n === 4 ? ' · SEMUA AMAN' : ''}`; });
    const s6row = W(`<div style="width:880px;display:flex;justify-content:space-between;padding:0 70px"></div>`);
    at(s6row, BL, BT + 190); show(s6row, 23.75, 25.75);
    PEERS.forEach((p, i) => {
      const a = add(`<div style="position:relative;display:flex;flex-direction:column;align-items:center;gap:10px;width:150px">
        <div class="av" style="width:110px;height:110px;background:${p.col};font-size:48px">${p.n}</div>
        <span style="font:700 26px/1 'Plus Jakarta Sans';color:${C.ink}">${p.name}</span>
        <span class="av" style="position:absolute;left:96px;top:-6px;width:50px;height:50px;background:${C.leaf};color:${C.leafInk};border:5px solid ${C.paper}">${ico('check', 26)}</span></div>`, s6row);
      const av = a.firstElementChild, ck = a.lastElementChild;
      draws.push((t) => {
        const on = t >= ARR[i];
        av.style.opacity = on ? 1 : 0.28;
        av.style.transform = `scale(${on ? bump(t, ARR[i] + 0.05, 0.1, 0.08).toFixed(4) : 0.92})`;
        ck.style.opacity = on ? clamp((t - ARR[i]) / 0.06) : 0;
        ck.style.transform = `scale(${on ? popS(t, ARR[i], 0.2).toFixed(4) : 0.2})`;
      });
      cue(ARR[i], 'check');
    });
    cue(23.5, 'swap', { n: 4 });

    // ───────────────────────── S7 · logo disc + tagline ─────────────────────────
    const s7 = W(`<div style="width:340px;height:340px"><img src="assets/mark.png" style="width:340px;height:340px;display:block"></div>`);
    ctr(s7, SX, SY); show(s7, 26.0, 27.75, (t) => `scale(${popS(t, 26.0, 0.6).toFixed(4)})`);
    const wm = W(`<div style="font:800 64px/1 'Plus Jakarta Sans';letter-spacing:-.04em;color:${C.cream};white-space:nowrap">Saling Jaga</div>`);
    ctr(wm, SX, SY + 320); show(wm, 26.5, 27.75);
    cue(26.0, 'slam', { n: 3 }); cue(26.5, 'shimmer');

    // ───────────────────────── S8 · tester card: 12 slots → 14 days ─────────────────────────
    const KT = SY - 420;
    const tag = W(`<div class="mono" style="width:920px;text-align:center;font:700 28px/1 'JetBrains Mono';letter-spacing:.16em;color:${C.leaf}">UJI INTERNAL · SEBELUM RILIS</div>`);
    at(tag, SX - 460, KT + 64); show(tag, 28.125, 34.125);
    const big = (n, a, b) => W(`<div style="display:flex;align-items:center;gap:28px;white-space:nowrap">
      <span class="mono" style="font:700 200px/0.9 'JetBrains Mono';color:${C.leaf};letter-spacing:-.06em">${n}</span>
      <span style="display:flex;flex-direction:column;gap:6px;font:800 60px/1 'Plus Jakarta Sans';letter-spacing:-.03em;color:${C.cream}"><span>${a}</span><span style="color:${C.muted}">${b}</span></span></div>`);
    const bigA = big('12', 'penguji', 'internal'), bigB = big('14', 'hari', 'pengujian');
    ctr(bigA, SX, KT + 240); ctr(bigB, SX, KT + 240);
    show(bigA, 28.25, 31.5); show(bigB, 31.75, 34.125);
    // 12 person slots, 6×2
    const slots = W(`<div style="width:800px;display:grid;grid-template-columns:repeat(6,110px);gap:26px 28px;justify-content:center"></div>`);
    const SL0 = 28.25;
    const slotEls = [...Array(12)].map((_, i) => {
      const last = i === 11;
      const s = add(`<div style="position:relative;width:110px;height:110px;border-radius:55px;border:4px dashed ${last ? C.lamp : 'rgba(60,191,110,.6)'};color:${last ? C.lamp : C.leaf};display:flex;align-items:center;justify-content:center">
        ${ico('user', 54)}</div>`, slots);
      return s;
    });
    ctr(slots, SX, KT + 520); show(slots, 28.125, 31.5);
    const you = W(`<div style="padding:12px 22px;border-radius:999px;background:${C.lamp};color:${C.leafInk};font:800 30px/1 'Plus Jakarta Sans';white-space:nowrap">Kamu?</div>`);
    draws.push((t) => slotEls.forEach((s, i) => {
      const tb = SL0 + i * 0.25;
      s.style.opacity = t < tb ? 0 : clamp((t - tb) / 0.06);
      s.style.transform = `scale(${t < tb ? 0.3 : popS(t, tb, 0.3).toFixed(4)})`;
      if (t < tb) return;
    }));
    // anchor the "Kamu?" tag under the last slot (slot 12 = col 6, row 2)
    const slotPos = (i) => ({ x: SX - 400 + (800 - (6 * 110 + 5 * 28)) / 2 + (i % 6) * 138 + 55, y: (KT + 520) - (110 * 2 + 26) / 2 + Math.floor(i / 6) * 136 + 55 });
    { const p = slotPos(11); ctr(you, p.x - 10, p.y + 100); }
    show(you, 31.0, 31.5, (t) => `scale(${popS(t, 31.0, 0.6).toFixed(4)})`);
    for (let i = 0; i < 12; i++) cue(SL0 + i * 0.25, 'pop', { n: i % 5 });
    // 14-day calendar, 7×2
    const cal = W(`<div style="width:820px;display:grid;grid-template-columns:repeat(7,100px);gap:18px 18px;justify-content:center"></div>`);
    const CAL0 = 31.875;
    const cells = [...Array(14)].map((_, i) => add(`<div style="width:100px;height:100px;border-radius:24px;border:3px solid rgba(242,237,213,.18);display:flex;align-items:center;justify-content:center;font:700 38px/1 'JetBrains Mono';color:${C.muted}">${i + 1}</div>`, cal));
    ctr(cal, SX, KT + 520); show(cal, 31.625, 34.125);
    draws.push((t) => cells.forEach((c, i) => {
      const tb = CAL0 + i * 0.125, on = t >= tb;
      c.style.background = on ? C.leaf : 'transparent';
      c.style.borderColor = on ? C.leaf : 'rgba(242,237,213,.18)';
      c.style.color = on ? C.leafInk : C.muted;
      c.style.transform = `scale(${on ? bump(t, tb + 0.04, 0.12, 0.06).toFixed(4) : 1})`;
    }));
    for (let i = 0; i < 14; i++) cue(CAL0 + i * 0.125, 'tick');
    const store = W(`<div style="display:flex;align-items:center;gap:16px;font:800 40px/1 'Plus Jakarta Sans';color:${C.cream};white-space:nowrap">
      Hari ke-14 ${ico('arrow', 40, C.leaf)} <span style="color:${C.leaf}">Play Store</span></div>`);
    ctr(store, SX, KT + 740); show(store, 33.625, 34.125);
    const memo = W(`<div style="font:600 34px/1 'Plus Jakarta Sans';color:${C.muted};white-space:nowrap">Satu tempat bisa jadi milikmu.</div>`);
    ctr(memo, SX, KT + 760); show(memo, 29.5, 31.5);
    cue(28.0, 'swap', { n: 0 }); cue(31.5, 'swap', { n: 2 }); cue(33.625, 'settle');

    // ───────────────────────── S9 · CTA button ─────────────────────────
    const ctaA = W(`<div style="width:780px;height:170px;display:flex;align-items:center;justify-content:center;gap:22px;color:${C.leafInk};font:800 56px/1 'Plus Jakarta Sans';letter-spacing:-.03em">
      Daftar jadi penguji ${ico('arrow', 56)}</div>`);
    ctr(ctaA, SX, SY); show(ctaA, 34.5, CTA + 0.05, (t) => `scale(${press(t, CTA).toFixed(4)})`);
    const ctaB = W(`<div style="width:780px;height:170px;display:flex;align-items:center;justify-content:center;gap:20px;color:${C.leafInk};font:800 58px/1 'Plus Jakarta Sans';letter-spacing:-.03em">
      ${ico('check', 56)} saling-jaga.com</div>`);
    ctr(ctaB, SX, SY); show(ctaB, CTA + 0.125, null);
    const endLogo = W(`<div style="display:flex;align-items:center;gap:20px;white-space:nowrap"><img src="assets/mark.png" style="width:96px;height:96px"><b style="font:800 50px/1 'Plus Jakarta Sans';letter-spacing:-.03em;color:${C.cream}">Saling Jaga</b></div>`);
    ctr(endLogo, SX, SY - 260); show(endLogo, 34.625, null);
    const fine = add(`<div class="mono" style="left:0;top:1700px;width:1080px;text-align:center;font:600 28px/1.6 'JetBrains Mono';color:${C.muted};letter-spacing:.03em">Gratis · tanpa akun · Android 6.0+</div>`);
    show(fine, 35.75, null);
    cue(34.25, 'swap', { n: 3 }); cue(CTA, 'cta'); cue(35.75, 'shimmer'); cue(36.25, 'settle');

    // ───────────────────────── Cursor ("Kamu") ─────────────────────────
    const cur = add(`<div class="cur"><svg viewBox="0 0 24 24"><path d="M4 2.5 20 11l-7 1.8L9.6 20z" fill="#f2edd5" stroke="#04140a" stroke-width="1.6" stroke-linejoin="round"/></svg><span class="pill">Kamu</span></div>`);
    const rip = add('<div class="rip"></div>');
    const curPill = cur.querySelector('.pill');
    const CX = new Track(760), CYt = new Track(1690), CO = new Track(0);
    const mv = (t, x, y, sp = SP.cursor) => { CX.to(t, x, sp); CYt.to(t, y, sp); };
    const clicks = [CARI, HOLD, SEND, GO, CTA];
    CO.to(3.75, 1, SP.text);
    mv(3.875, SX + 30, SY + 40);                 // logo disc: search
    mv(4.875, 760, 1690, SP.soft);
    mv(8.375, SX - 230, SY + 20);                // hold to talk (mic)
    mv(10.875, 760, 1690, SP.soft);
    mv(14.375, CL + 36 + 808 - 50, CT + 720 - 36 - 48);   // send
    mv(15.375, 760, 1690, SP.soft);
    mv(18.875, SX + 40, ST + 620 - 50 - 60);     // Arahkan ke Nenek
    mv(19.875, 760, 1690, SP.soft);
    CO.to(20.25, 0, SP.text);
    mv(33.75, 760, 1690, SP.snap); CO.to(34.25, 1, SP.text);
    mv(34.625, SX + 60, SY + 20);                // CTA
    mv(35.75, 820, 1520, SP.soft);
    draws.push((t) => {
      const [sx, sy] = toS(CX.at(t), CYt.at(t), t);
      const o = clamp(CO.at(t));
      const vx = (toS(CX.at(t + 0.01), CYt.at(t + 0.01), t + 0.01)[0] - sx) / 0.01;
      let sc = 1; for (const c of clicks) sc *= press(t, c);
      sc *= 1 - 0.12 * clamp((t - HOLD) / 0.08) * clamp((REL - t) / 0.08);
      at(cur, sx, sy); cur.style.opacity = o.toFixed(3);
      const flip = clamp((sx - 820) / 80); curPill.style.left = lerp(44, -curPill.offsetWidth - 4, flip).toFixed(1) + 'px';
      cur.style.transform = `rotate(${clamp(-vx * 0.0045, -14, 14).toFixed(2)}deg) scale(${sc.toFixed(4)})`;
      let rp = null, rx = 0, ry = 0; for (const c of clicks) { const r = ripple(t, c); if (r) { rp = r; [rx, ry] = toS(CX.at(c), CYt.at(c), t); } }
      if (rp && o > 0.3) { at(rip, rx, ry); rip.style.opacity = rp.o.toFixed(3); rip.style.transform = `scale(${rp.s.toFixed(3)})`; } else rip.style.opacity = 0;
    });

    // ───────────────────────── Seek ─────────────────────────
    const DUR = 37.0;
    window.seek = (t) => {
      const z = BASE * Math.exp(CAM.z.at(t)), zx = CAM.zx.at(t), zy = CAM.zy.at(t), [qx, qy] = quake(t);
      world.style.transform = `translate(${(zx + qx).toFixed(2)}px, ${(zy + qy).toFixed(2)}px) scale(${z.toFixed(5)}) translate(${(-zx).toFixed(2)}px, ${(-zy).toFixed(2)}px)`;
      hud.style.transform = `translate(${(qx * 0.5).toFixed(2)}px, ${(qy * 0.5).toFixed(2)}px)`;
      for (const d of draws) d(t);
    };
    cue(0.0, 'born'); cue(0.5, 'whoosh', { v: 0.7 });
    cues.sort((a, b) => a.t - b.t);
    window.FILM = { width: 1080, height: 1920, bpm: 120, duration: DUR,
      sections: { intro: [0, 4], build: [12, 16], drop: [16, 20], outro: [33, 37] }, cues };
    window.seek(0);
    window.READY = true;
  } catch (err) {
    window.FILM_ERROR = String(err && err.stack || err);
    console.error(err);
  }
})();
