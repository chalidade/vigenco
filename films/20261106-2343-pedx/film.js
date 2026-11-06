// Saling Jaga · "Pesan yang tidak terkirim". Landscape 1920×1080, 120 BPM, 32 s.
// One shape, never cut: failed chat bubble → "Cari" disc → walkie-talkie capsule → group chat card
// → SOS card (drop) → compass disc → range capsule → logo disc.
(async function () {
  try {
    const { clamp, lerp, stepR, Track, ColorTrack, SP, vis, applyVis, press, ripple, mix } = M;
    const C = { night: '#07110c', card: '#0f1f17', card2: '#13271d', cream: '#f2edd5', paper: '#f6f4ea', muted: '#a5b0a2',
      dim: '#6f7c6f', ink: '#1c2a21', grey: '#6b7469', leaf: '#3cbf6e', leafInk: '#04140a', moss: '#1b4d2e',
      lamp: '#f2c46b', sos: '#e03131', red: '#ff6b6b', fail: '#3a1717', budi: '#e8590c', sari: '#d6336c', rt: '#1e7a45' };

    await Promise.all([
      document.fonts.load('800 80px "Plus Jakarta Sans"'), document.fonts.load('500 30px "Plus Jakarta Sans"'),
      document.fonts.load('700 30px "Plus Jakarta Sans"'), document.fonts.load('600 24px "JetBrains Mono"'),
      document.fonts.load('700 30px "JetBrains Mono"'), document.fonts.load('italic 400 90px "Instrument Serif"'),
    ].map((p) => p.catch(() => null)));
    await document.fonts.ready;
    const logo = new Image(); logo.src = 'assets/mark.png';
    await new Promise((r) => { if (logo.complete) r(); logo.onload = r; logo.onerror = r; });

    const cues = [];
    const cue = (t, k, o = {}) => cues.push({ t, k, ...o });
    const world = document.getElementById('world');
    const hud = document.getElementById('hud');
    const redL = document.getElementById('red');
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
      wifi: P('<path d="M2 8.5a15 15 0 0 1 20 0"/><path d="M5 12a10.5 10.5 0 0 1 14 0"/><path d="M8.5 15.5a5.5 5.5 0 0 1 7 0"/><circle cx="12" cy="19" r="1" fill="currentColor"/>'),
      mic: P('<rect x="9" y="2.5" width="6" height="11.5" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0"/><path d="M12 17.5V21"/>'),
      lock: P('<rect x="4.5" y="10.5" width="15" height="10.5" rx="2.5"/><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5"/>'),
      check: P('<path d="M20 6 9 17l-5-5"/>', 3),
      x: P('<path d="M6 6l12 12M18 6 6 18"/>', 3),
      send: P('<path d="M4 12h14"/><path d="m12 5 7 7-7 7"/>', 2.8),
      arrow: P('<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>', 2.6),
      up: P('<path d="M12 20V4"/><path d="m5 11 7-7 7 7"/>', 2.8),
      flag: P('<path d="M5 22V3.5"/><path d="M5 4h12l-2.5 4L17 12H5"/>', 2.4),
      med: P('<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M12 9v6M9 12h6"/>'),
      batt: P('<rect x="2.5" y="7.5" width="17" height="9" rx="2"/><path d="M21.5 10.5v3"/><path d="M5 10v4" stroke-width="3"/>'),
      nosig: P('<path d="M4 20v-2M9 20v-5M14 20v-8M19 20V7"/><path d="m3 3 18 18"/>', 2.4),
      mega: P('<path d="M3 10v4h3l7 4V6L6 10z"/><path d="M17 9a4 4 0 0 1 0 6"/>'),
      spk: P('<path d="M4 9.5v5h3.5L13 19V5L7.5 9.5z"/><path d="M16.5 8.5a5 5 0 0 1 0 7"/><path d="M19.5 6a8.5 8.5 0 0 1 0 12"/>'),
      vol: P('<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M3.5 8v4"/>'),
    };
    const ico = (k, s, col = 'currentColor', st = '') => `<span class="ic" style="width:${s}px;height:${s}px;color:${col};${st}">${I[k]}</span>`;

    // ───────────────────────── Camera ─────────────────────────
    const CAM = { z: new Track(Math.log(1.08)), zx: new Track(1320), zy: new Track(560) };
    const cam = (t, z, zx, zy, sp = SP.cam) => { CAM.z.to(t, Math.log(z), sp); if (zx != null) { CAM.zx.to(t, zx, sp); CAM.zy.to(t, zy, sp); } };
    cam(0.25, 1.0);
    cam(3.5, 1.035, 1320, 560, { w: 18, z: 0.85 }); cam(4.25, 1.0);
    cam(8.5, 1.05); cam(10.5, 1.0);
    cam(12.0, 1.0, 960, 540);
    cam(15.875, 1.07, 960, 560, { w: 16, z: 0.8 }); cam(16.75, 1.0);
    cam(20.0, 1.06, 1320, 560); cam(21.75, 1.0, 960, 540);
    cam(23.75, 1.14, 960, 640); cam(24.25, 1.0, 960, 540, { w: 6, z: 1 });
    cam(31.0, 1.03);
    const shakes = [[3.5, 7], [16.0, 16]];
    const shake = (t) => { let x = 0; for (const [ts, a] of shakes) { const d = t - ts; if (d > 0 && d < 0.6) x += a * Math.exp(-d * 8) * Math.sin(d * 70); } return x; };
    const toS = (x, y, t) => { const z = Math.exp(CAM.z.at(t)), zx = CAM.zx.at(t), zy = CAM.zy.at(t); return [zx + (x - zx) * z + shake(t), zy + (y - zy) * z]; };

    // ───────────────────────── Radar lines (under the shape) ─────────────────────────
    const svg = W(`<svg width="1920" height="1080" viewBox="0 0 1920 1080" style="left:0;top:0;overflow:visible"></svg>`);
    const NS = 'http://www.w3.org/2000/svg';
    const sv = (tag, attrs) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); svg.appendChild(e); return e; };

    // radar rings for the search (5.0 → 7.0)
    const rings = [5.0, 5.5, 6.0, 6.5, 7.0].map((tb) => ({ tb, e: sv('circle', { cx: 1320, cy: 560, r: 150, fill: 'none', stroke: C.leaf, 'stroke-width': 3 }) }));
    draws.push((t) => rings.forEach(({ tb, e }) => {
      const x = (t - tb) / 1.6;
      if (x < 0 || x > 1 || t > 11.9) { e.setAttribute('opacity', 0); return; }
      e.setAttribute('r', (150 + 420 * (1 - Math.pow(1 - x, 3))).toFixed(1));
      e.setAttribute('opacity', (0.55 * (1 - x)).toFixed(3));
    }));

    // ───────────────────────── The one shape ─────────────────────────
    const body = W('<div></div>');
    const PB = { l: new Track(1320 - 340), t: new Track(560 - 75), r: new Track(1320 + 340), b: new Track(560 + 75), rad: new Track(75), col: new ColorTrack(C.card2), bd: new Track(1) };
    const pm = (t, cx, cy, w, h, rad, col, sp = SP.shape) => {
      PB.l.to(t, cx - w / 2, sp); PB.t.to(t, cy - h / 2, sp); PB.r.to(t, cx + w / 2, sp); PB.b.to(t, cy + h / 2, sp); PB.rad.to(t, rad, sp);
      if (col) PB.col.to(t, col, SP.soft);
    };
    const bodyPress = [2.5, 5.0, 30.0];
    const HOLD = 8.5, REL = 10.5;
    draws.push((t) => {
      const l = PB.l.at(t), tp = PB.t.at(t), r = PB.r.at(t), b = PB.b.at(t);
      rect(body, l, tp, r - l, b - tp);
      body.style.borderRadius = Math.min(PB.rad.at(t), (r - l) / 2, (b - tp) / 2).toFixed(2) + 'px';
      body.style.background = PB.col.at(t);
      let s = popS(t, 0, 0.3); for (const tc of bodyPress) s *= 1 - 0.05 * Math.exp(-(((t - tc) / 0.08) ** 2));
      s *= 1 - 0.035 * clamp((t - HOLD) / 0.1) * clamp((REL - t) / 0.1);
      for (const tc of [16.0, 17.0, 18.0, 19.0]) s *= 1 + 0.018 * Math.exp(-(((t - tc) / 0.09) ** 2));
      body.style.transform = `scale(${s.toFixed(4)})`;
      const bd = clamp(PB.bd.at(t));
      body.style.boxShadow = `0 50px 110px -30px rgba(0,0,0,.75), inset 0 0 0 3px rgba(242,237,213,${(0.14 * bd).toFixed(3)})`;
    });

    // shape schedule
    PB.col.to(3.5, C.fail, { w: 30, z: 1 });
    pm(3.875, 1320, 560, 300, 300, 150, C.leaf);
    PB.bd.to(3.875, 0, SP.text);
    pm(7.75, 1320, 560, 640, 200, 100, C.card2); PB.bd.to(7.75, 1, SP.text);
    PB.col.to(HOLD, C.leaf, { w: 24, z: 1 }); PB.col.to(REL, C.card2, SP.soft);
    pm(11.75, 1320, 560, 760, 820, 40, C.paper); PB.bd.to(11.75, 0, SP.text);
    pm(15.75, 960, 560, 1640, 860, 56, C.sos, { w: 15, z: 0.78 });
    pm(19.875, 1320, 560, 760, 760, 380, C.card); PB.bd.to(19.875, 1, SP.text);
    pm(23.75, 960, 640, 1640, 300, 150, C.card2);
    pm(27.75, 960, 320, 260, 260, 130, C.cream); PB.bd.to(27.75, 0, SP.text);

    // ───────────────────────── Left column copy ─────────────────────────
    const block = (lbl, head, sub, tin, tout, lcol) => {
      const L = add(`<div class="lbl" style="left:140px;top:0;${lcol ? 'color:' + lcol : ''}">${lbl}</div>`);
      const Hh = add(`<div class="head" style="left:140px;top:0">${head}</div>`);
      const S = sub ? add(`<div class="sub" style="left:140px;top:0">${sub}</div>`) : null;
      const total = 24 + 34 + Hh.offsetHeight + (S ? 30 + S.offsetHeight : 0);
      const y0 = 540 - total / 2;
      L.style.top = y0 + 'px'; Hh.style.top = (y0 + 58) + 'px';
      if (S) S.style.top = (y0 + 58 + Hh.offsetHeight + 30) + 'px';
      show(L, tin, tout); show(Hh, tin + 0.125, tout);
      if (S) show(S, tin + 0.375, tout);
      cue(tin, 'shimmer');
      return { L, Hh, S };
    };

    // ══ 0–4 · the message that never arrives ══
    const ih = add(`<div class="head" style="left:140px;top:0;font-size:100px"></div>`);
    const il = add(`<div class="lbl" style="left:140px;top:0;color:${C.red}">${ico('nosig', 30)}Tidak ada layanan</div>`);
    [['Sinyal', 0.5], [`<span class="serif" style="color:${C.red}">hilang.</span>`, 1.0]].forEach(([w, tw], i) => {
      if (i) ih.appendChild(document.createElement('br'));
      const e = add(`<span style="display:inline-block">${w}</span>`, ih); show(e, tw, 3.75, (t) => `scale(${bump(t, tw, 0.05).toFixed(4)})`);
      cue(tw, 'slam', { n: i });
    });
    const isub = add(`<div class="sub" style="left:140px;top:0">Grup chat diam. Pesan<br>tidak pernah sampai.</div>`);
    const iy = 540 - (58 + ih.offsetHeight + 30 + isub.offsetHeight) / 2;
    il.style.top = iy + 'px'; ih.style.top = (iy + 58) + 'px'; isub.style.top = (iy + 58 + ih.offsetHeight + 30) + 'px';
    show(il, 0.25, 3.75); show(isub, 3.5, 3.75);
    cue(0, 'born');

    // chat bubble content
    const grp = W(`<div class="mono" style="font:600 22px/1 'JetBrains Mono';color:${C.dim};letter-spacing:.06em;white-space:nowrap">GRUP KELUARGA · terakhir aktif 17:52</div>`);
    at(grp, 1320 - 340 + 10, 560 - 75 - 52);
    show(grp, 0.25, 3.625);
    const msg = 'Semua aman?';
    const typed = W(`<div style="font:600 44px/1 'Plus Jakarta Sans';color:${C.cream};white-space:nowrap;display:flex;align-items:center"></div>`);
    const chars = [...msg].map((ch, i) => ({ e: add(`<span>${ch === ' ' ? '&nbsp;' : ch}</span>`, typed), tk: 0.75 + i * 0.125 }));
    const caret = add(`<span style="display:inline-block;width:4px;height:48px;background:${C.leaf};margin-left:4px;border-radius:2px"></span>`, typed);
    at(typed, 1320 - 340 + 60, 560 - 24);
    chars.forEach(({ tk }) => cue(tk, 'key'));
    const sendB = W(`<div style="width:100px;height:100px;border-radius:50%;background:${C.leaf};color:${C.leafInk};display:flex;align-items:center;justify-content:center">${ico('send', 46)}</div>`);
    ctr(sendB, 1320 + 340 - 75, 560);
    const sending = W(`<div class="mono" style="font:600 24px/1 'JetBrains Mono';color:${C.muted};white-space:nowrap;letter-spacing:.04em">Mengirim<span>.</span><span>.</span><span>.</span></div>`);
    at(sending, 1320 + 340 - 230, 560 + 75 + 30);
    const failed = W(`<div style="display:flex;align-items:center;gap:12px;font:700 26px/1 'Plus Jakarta Sans';color:${C.red};white-space:nowrap">${ico('x', 28)}Gagal terkirim · tidak ada sinyal</div>`);
    at(failed, 1320 + 340 - failed.offsetWidth, 560 + 75 + 28);
    draws.push((t) => {
      const v = vis(t, 0.25, 3.625);
      applyVis(typed, v);
      chars.forEach(({ e, tk }) => { e.style.opacity = t >= tk ? 1 : 0; });
      caret.style.opacity = (t < 2.5 && Math.floor(t * 4) % 2 === 0) || (t >= 0.75 && t < 2.125) ? 1 : 0;
      applyVis(sendB, vis(t, 0.5, 3.625), `scale(${(press(t, 2.5) * popS(t, 0.5, 0.6)).toFixed(4)})`);
      sendB.style.background = t < 3.5 ? C.leaf : mix(C.leaf, '#5a2a2a', clamp((t - 3.5) / 0.15));
      applyVis(sending, vis(t, 2.5, 3.375));
      [...sending.children].forEach((d, i) => { d.style.opacity = (Math.floor(t * 6) % 4) > i ? 1 : 0.15; });
      applyVis(failed, vis(t, 3.5, 3.75), `scale(${bump(t, 3.5, 0.06).toFixed(4)})`);
    });
    cue(2.5, 'click'); cue(2.75, 'tick'); cue(3.0, 'tick'); cue(3.25, 'tick'); cue(3.5, 'alert');

    // ══ 4–8 · Cari ══
    block('02 · Saling Jaga', `Ketuk <span class="serif">cari.</span>`, 'HP di sekitar muncul dalam hitungan detik. Langsung lewat Wi‑Fi Direct: tanpa internet, pulsa, atau BTS.', 4.0, 7.625);
    cue(4.0, 'swap', { n: 0 });
    const cari = W(`<div style="display:flex;flex-direction:column;align-items:center;gap:10px;color:${C.leafInk};font:800 54px/1 'Plus Jakarta Sans';letter-spacing:-.02em">${ico('wifi', 64)}Cari</div>`);
    ctr(cari, 1320, 560);
    const conn = W(`<div style="display:flex;flex-direction:column;align-items:center;gap:6px;color:${C.leafInk};text-align:center"><span style="font:800 88px/1 'Plus Jakarta Sans';letter-spacing:-.04em">4 HP</span><span class="mono" style="font:700 22px/1 'JetBrains Mono';letter-spacing:.1em">TERHUBUNG</span></div>`);
    ctr(conn, 1320, 560);
    show(cari, 4.25, 6.875, (t) => `scale(${press(t, 5.0).toFixed(4)})`);
    show(conn, 7.0, 7.625, (t) => `scale(${bump(t, 7.0, 0.07).toFixed(4)})`);
    cue(5.0, 'click'); cue(5.0, 'whoosh', { v: 0.5 }); cue(7.0, 'check');

    // peers (site demo group: Budi, Sari, Pak RT)
    const peers = [
      { n: 'Budi', i: 'B', c: C.budi, d: '252 m · utara', x: 1660, y: 300, tin: 5.5 },
      { n: 'Sari', i: 'S', c: C.sari, d: '259 m · barat laut', x: 1000, y: 300, tin: 6.0 },
      { n: 'Pak RT', i: 'P', c: C.rt, d: '470 m · tenggara', x: 1320, y: 860, tin: 6.5 },
    ];
    peers.forEach((p) => {
      p.line = sv('line', { x1: 1320, y1: 560, x2: p.x, y2: p.y, stroke: C.leaf, 'stroke-width': 3, 'stroke-dasharray': '6 10', opacity: 0 });
      p.e = W(`<div style="display:flex;align-items:center;gap:14px;padding:12px 24px 12px 12px;border-radius:999px;background:${C.card2};white-space:nowrap">
        <div class="av" style="width:56px;height:56px;background:${p.c};font-size:26px">${p.i}</div>
        <div><div style="font:700 26px/1.1 'Plus Jakarta Sans'">${p.n}</div><div class="mono" style="font:600 18px/1.3 'JetBrains Mono';color:${C.muted}">${p.d}</div></div>
        <span class="spk" style="display:inline-flex;margin-left:6px">${ico('spk', 30, C.leaf)}</span></div>`);
      p.spk = p.e.querySelector('.spk');
      cue(p.tin, 'pop');
      draws.push((t) => {
        ctr(p.e, p.x, p.y);
        applyVis(p.e, vis(t, p.tin, 11.625), `scale(${popS(t, p.tin, 0.6).toFixed(4)})`);
        const held = clamp((t - HOLD) / 0.15) * clamp((REL - t) / 0.15);
        p.e.style.boxShadow = `inset 0 0 0 3px rgba(60,191,110,${(0.15 + 0.85 * held).toFixed(3)})`;
        p.spk.style.opacity = held.toFixed(3);
        p.spk.style.width = (36 * held).toFixed(1) + 'px';
        const lv = vis(t, p.tin - 0.125, 11.625);
        p.line.setAttribute('opacity', (lv.o * (0.5 + 0.4 * held)).toFixed(3));
        p.line.setAttribute('stroke-dashoffset', (-t * 60).toFixed(1));
      });
    });

    // ══ 8–12 · walkie-talkie ══
    block('03 · Walkie‑talkie', `Tahan. Semua <span class="serif">mendengar.</span>`, 'Bicara ke seluruh grup sekaligus, atau beralih ke telepon dua arah.', 8.0, 11.625);
    const ptt = W(`<div style="display:flex;align-items:center;gap:20px;color:${C.cream};font:700 38px/1 'Plus Jakarta Sans';white-space:nowrap">${ico('mic', 50, C.leaf)}Tahan untuk bicara</div>`);
    ctr(ptt, 1320, 560); show(ptt, 8.0, 8.5, '');
    const wave = W(`<div style="display:flex;align-items:center;gap:8px;height:120px"></div>`);
    const wbars = Array.from({ length: 26 }, () => add(`<i style="display:block;width:10px;border-radius:5px;background:${C.leafInk}"></i>`, wave));
    ctr(wave, 1320, 560);
    const sent = W(`<div style="display:flex;align-items:center;gap:16px;color:${C.cream};font:700 36px/1 'Plus Jakarta Sans';white-space:nowrap">${ico('check', 40, C.leaf)}Didengar 3 HP</div>`);
    ctr(sent, 1320, 560); show(sent, 10.625, 11.625);
    draws.push((t) => {
      const v = vis(t, HOLD + 0.05, REL - 0.05);
      applyVis(wave, v);
      if (v.gone) return;
      wbars.forEach((b, i) => {
        const env = 0.35 + 0.65 * Math.abs(Math.sin(t * 2.2 + i * 0.21));
        const h = 14 + 90 * env * Math.abs(Math.sin(t * 9.3 + i * 0.77)) * (0.5 + 0.5 * Math.sin(i * 0.4 + 1));
        b.style.height = h.toFixed(1) + 'px';
      });
    });
    cue(HOLD, 'click'); cue(HOLD, 'drag', { d: REL - HOLD }); cue(REL, 'release');
    [9.0, 9.5, 10.0].forEach((tt, i) => cue(tt, 'note', { n: i }));
    cue(10.625, 'check');

    // ══ 12–16 · group chat ══
    block('04 · Grup', `Satu pengumuman, <span class="serif">semua tahu</span> arah.`, 'Chat, pesan suara, foto dan pesan pribadi. Terenkripsi AES‑256‑GCM dari HP ke HP.', 12.0, 15.625);
    const CL = 1320 - 380, CT = 560 - 410;
    const chatH = W(`<div style="width:760px;padding:0 44px;display:flex;align-items:center;gap:18px;color:${C.ink}">
      <div style="display:flex">${['B', 'S', 'P'].map((x, i) => `<div class="av" style="width:56px;height:56px;font-size:24px;background:${[C.budi, C.sari, C.rt][i]};border:4px solid ${C.paper};margin-left:${i ? -16 : 0}px">${x}</div>`).join('')}</div>
      <div><div style="font:800 32px/1.1 'Plus Jakarta Sans';letter-spacing:-.02em">Rombongan RT 04</div>
      <div style="display:flex;align-items:center;gap:8px;font:600 20px/1.3 'Plus Jakarta Sans';color:${C.grey}">${ico('lock', 20)}4 anggota · terenkripsi · tanpa sinyal</div></div></div>`);
    at(chatH, CL, CT + 40);
    const ann = W(`<div style="width:672px;padding:22px 26px;border-radius:24px;background:#fbefd0;color:${C.ink};box-shadow:inset 0 0 0 2px #ecd59a">
      <div class="mono" style="display:flex;align-items:center;gap:10px;font:700 18px/1 'JetBrains Mono';letter-spacing:.1em;color:#9a6a12">${ico('mega', 24)}PENGUMUMAN · PAK RT</div>
      <div style="margin-top:12px;font:700 30px/1.25 'Plus Jakarta Sans'">Titik kumpul pindah ke <b>Pos 3</b>, 250 m ke timur laut.</div></div>`);
    at(ann, CL + 44, CT + 150);
    const bub = (who, col, txt, x, y, right) => W(`<div style="max-width:520px;padding:18px 24px;border-radius:26px;${right ? `border-bottom-right-radius:8px;background:${C.leaf};color:${C.leafInk}` : `border-bottom-left-radius:8px;background:#e9e7dc;color:${C.ink}`}">
      ${who ? `<div style="font:800 20px/1 'Plus Jakarta Sans';color:${col};margin-bottom:8px">${who}</div>` : ''}<div style="font:600 28px/1.3 'Plus Jakarta Sans'">${txt}</div></div>`);
    const b1 = bub('Budi', C.budi, 'Aku sudah di luar rumah. Aman.', 0, 0); at(b1, CL + 44, CT + 360);
    const b2 = W(`<div style="padding:16px 24px;border-radius:26px;border-bottom-left-radius:8px;background:#e9e7dc;color:${C.ink};display:flex;align-items:center;gap:16px">
      <div style="font:800 20px/1 'Plus Jakarta Sans';color:${C.sari}">Sari</div>${ico('mic', 26, C.ink)}
      <div style="display:flex;gap:5px;align-items:center;height:32px">${[10, 22, 30, 16, 26, 12, 20, 28, 14, 24, 10, 18].map((h) => `<i style="display:block;width:6px;height:${h}px;border-radius:3px;background:${C.ink}"></i>`).join('')}</div>
      <span class="mono" style="font:600 20px/1 'JetBrains Mono';color:${C.grey}">0:04</span></div>`);
    at(b2, CL + 44, CT + 500);
    const mine = bub('', '', 'Menuju Pos 3.', 0, 0, true);
    at(mine, CL + 760 - 44 - mine.offsetWidth, CT + 610);
    const inp = W(`<div style="width:672px;height:84px;border-radius:42px;background:#e9e7dc;display:flex;align-items:center;padding:0 12px 0 30px;color:${C.ink}"></div>`);
    const inT = add(`<div style="flex:1;font:600 28px/1 'Plus Jakarta Sans';white-space:nowrap;display:flex;align-items:center"></div>`, inp);
    const inSend = add(`<div style="width:62px;height:62px;border-radius:50%;background:${C.leaf};color:${C.leafInk};display:flex;align-items:center;justify-content:center">${ico('send', 30)}</div>`, inp);
    at(inp, CL + 44, CT + 820 - 44 - 84);
    const msg2 = 'Menuju Pos 3.';
    const SEND = 15.25;
    const ch2 = [...msg2].map((ch, i) => ({ e: add(`<span>${ch === ' ' ? '&nbsp;' : ch}</span>`, inT), tk: 13.5 + i * 0.125 }));
    const ph = add(`<span style="color:${C.grey};position:absolute">Tulis pesan…</span>`, inT);
    ch2.forEach(({ tk }) => cue(tk, 'key'));
    show(chatH, 12.0, 15.625); show(ann, 12.5, 15.625, (t) => `scale(${bump(t, 12.5, 0.03).toFixed(4)})`);
    show(b1, 13.0, 15.625); show(b2, 13.25, 15.625); show(mine, SEND + 0.125, 15.625);
    cue(12.5, 'pop'); cue(13.0, 'pop'); cue(13.25, 'pop'); cue(SEND, 'click'); cue(SEND + 0.125, 'whoosh', { v: 0.4 });
    draws.push((t) => {
      applyVis(inp, vis(t, 12.25, 15.625));
      ch2.forEach(({ e, tk }) => { e.style.opacity = t >= tk && t < SEND ? 1 : 0; });
      ph.style.opacity = t < 13.5 || t >= SEND ? 1 : 0;
      inSend.style.transform = `scale(${press(t, SEND).toFixed(4)})`;
    });
    cue(14.0, 'riser', { d: 2.0 });

    // ══ 16–20 · SOS (the drop) ══
    cue(16.0, 'drop'); cue(16.0, 'slam', { n: 3 });
    [16.0, 17.0, 18.0, 19.0].forEach((tt) => cue(tt, 'alert'));
    draws.push((t) => {
      let o = 0;
      if (t > 15.9 && t < 20.2) for (const tc of [16.0, 17.0, 18.0, 19.0]) { const d = t - tc; if (d > -0.05) o = Math.max(o, Math.exp(-Math.max(0, d) * 3) * 0.9); }
      o *= clamp((20.0 - t) / 0.3);
      redL.style.opacity = o.toFixed(3);
    });
    const SL = 140, ST = 130;
    const sosTop = W(`<div class="mono" style="display:flex;align-items:center;gap:16px;font:700 26px/1 'JetBrains Mono';letter-spacing:.14em;color:#fff;white-space:nowrap">
      <span style="padding:10px 16px;border-radius:12px;background:#fff;color:${C.sos}">SOS</span>ALARM DI SEMUA HP</div>`);
    at(sosTop, SL + 90, ST + 80);
    const sosH = W(`<div style="font:800 112px/1 'Plus Jakarta Sans';letter-spacing:-.045em;color:#fff;white-space:nowrap">Sari butuh <span class="serif" style="font-size:1.16em">bantuan.</span></div>`);
    at(sosH, SL + 90, ST + 160);
    const tile = (big, small, icon) => W(`<div style="width:300px;height:170px;border-radius:30px;background:rgba(255,255,255,.16);color:#fff;padding:26px 30px;display:flex;flex-direction:column;justify-content:space-between">
      <div style="display:flex;align-items:center;gap:12px;font:800 62px/1 'Plus Jakarta Sans';letter-spacing:-.03em">${icon || ''}${big}</div>
      <div class="mono" style="font:600 20px/1 'JetBrains Mono';letter-spacing:.1em;opacity:.85">${small}</div></div>`);
    const tiles = [
      [tile('259 m', 'JARAK'), 16.5],
      [tile('BL', 'ARAH · BARAT LAUT', `<span class="ic" style="width:56px;height:56px;transform:rotate(-45deg)">${I.up}</span>`), 17.0],
      [tile('21%', 'BATERAI SARI', ico('batt', 52)), 17.5],
    ];
    tiles.forEach(([e, tin], i) => { at(e, SL + 90 + i * 330, ST + 340); show(e, tin, 19.75, (t) => `scale(${popS(t, tin, 0.7).toFixed(4)})`); cue(tin, 'slam', { n: 4 + i }); });
    const medC = W(`<div style="display:flex;align-items:center;gap:14px;padding:16px 24px;border-radius:999px;background:#fff;color:${C.sos};font:700 26px/1 'Plus Jakarta Sans';white-space:nowrap">${ico('med', 30)}Kartu medis ikut terkirim</div>`);
    at(medC, SL + 90, ST + 580);
    const volC = W(`<div style="display:flex;align-items:center;gap:14px;padding:16px 24px;border-radius:999px;background:rgba(255,255,255,.16);color:#fff;font:700 26px/1 'Plus Jakarta Sans';white-space:nowrap">${ico('vol', 30)}Atau tekan 5× tombol volume</div>`);
    at(volC, SL + 90 + medC.offsetWidth + 20, ST + 580);
    show(sosTop, 16.0, 19.75); show(sosH, 16.125, 19.75, (t) => `scale(${bump(t, 16.125, 0.03).toFixed(4)})`);
    show(medC, 18.0, 19.75); show(volC, 18.5, 19.75); cue(18.0, 'pop'); cue(18.5, 'pop');
    // direction disc
    const dirD = W(`<div style="width:340px;height:340px;border-radius:50%;background:rgba(255,255,255,.14);box-shadow:inset 0 0 0 3px rgba(255,255,255,.35)">
      <div class="mono" style="position:absolute;left:0;right:0;top:16px;text-align:center;font:700 24px/1 'JetBrains Mono';color:#fff">U</div>
      <div class="arr" style="position:absolute;left:70px;top:70px;width:200px;height:200px;color:#fff">${I.up}</div></div>`);
    const arr = dirD.querySelector('.arr');
    ctr(dirD, 1500, ST + 330);
    const ROT = new Track(60).to(16.5, -45, { w: 9, z: 0.6 });
    draws.push((t) => { applyVis(dirD, vis(t, 16.25, 19.75), `scale(${popS(t, 16.25, 0.7).toFixed(4)})`); arr.style.transform = `rotate(${ROT.at(t).toFixed(2)}deg)`; });
    const goB = W(`<div style="display:flex;align-items:center;gap:14px;padding:24px 40px;border-radius:999px;background:#fff;color:${C.sos};font:800 32px/1 'Plus Jakarta Sans';white-space:nowrap">Lihat arah ke Sari${ico('arrow', 34)}</div>`);
    const GO = 19.5;
    at(goB, 1780 - 90 - goB.offsetWidth, ST + 860 - 80 - goB.offsetHeight);
    show(goB, 18.75, 19.75, (t) => `scale(${press(t, GO).toFixed(4)})`); cue(18.75, 'pop'); cue(GO, 'click');

    // ══ 20–24 · compass ══
    const cb1 = block('05 · Kompas', `Panah ke <span class="serif">yang butuh</span> bantuan.`, 'Radar posisi setiap anggota dan titik kumpul. Ketuk nama, langsung diarahkan.', 20.0, 21.875);
    const cpL = add(`<div class="lbl" style="left:140px;top:0">05 · Kompas</div>`);
    const cpH = add(`<div class="head" style="left:140px;top:0">Siapa sudah tiba, <span class="serif">kelihatan.</span></div>`);
    const cnt = add(`<div style="left:140px;top:0;display:flex;align-items:center;gap:22px;padding:20px 30px 20px 20px;border-radius:28px;background:${C.card2};white-space:nowrap">
      <div style="width:64px;height:64px;border-radius:50%;background:${C.leaf};color:${C.leafInk};display:flex;align-items:center;justify-content:center">${ico('flag', 34)}</div>
      <div><div class="mono" style="font:600 18px/1 'JetBrains Mono';letter-spacing:.1em;color:${C.muted}">TIBA DI POS 3</div>
      <div style="display:flex;align-items:baseline;gap:4px;margin-top:6px;font:800 54px/1 'Plus Jakarta Sans'"><span class="n" style="display:inline-block;width:34px;text-align:right">0</span><span style="color:${C.dim}">/4</span></div></div></div>`);
    const cntN = cnt.querySelector('.n');
    const cy0 = 540 - (58 + cpH.offsetHeight + 34 + cnt.offsetHeight) / 2;
    cpL.style.top = cy0 + 'px'; cpH.style.top = (cy0 + 58) + 'px'; cnt.style.top = (cy0 + 58 + cpH.offsetHeight + 34) + 'px';
    show(cpL, 22.0, 23.625); show(cpH, 22.125, 23.625); show(cnt, 22.25, 23.625);
    cue(22.0, 'shimmer');
    const arrivals = [[22.5, 1], [23.0, 2], [23.5, 4]];
    draws.push((t) => { let n = 0; for (const [ta, v] of arrivals) if (t >= ta) n = v; cntN.textContent = n; cntN.style.transform = `scale(${arrivals.reduce((s, [ta]) => s * bump(t, ta, 0.18), 1).toFixed(4)})`; });
    arrivals.forEach(([ta]) => cue(ta, 'check'));
    // compass face
    const OX = 1320, OY = 560, RR = 380;
    const face = W(`<div style="width:${RR * 2}px;height:${RR * 2}px"></div>`);
    at(face, OX - RR, OY - RR);
    [120, 240, 350].forEach((r) => add(`<div style="position:absolute;left:${RR - r}px;top:${RR - r}px;width:${r * 2}px;height:${r * 2}px;border-radius:50%;box-shadow:inset 0 0 0 2px rgba(242,237,213,.1)"></div>`, face));
    [['U', 0, -1], ['T', 1, 0], ['S', 0, 1], ['B', -1, 0]].forEach(([l, dx, dy]) => {
      const e = add(`<div class="mono" style="position:absolute;font:700 22px/1 'JetBrains Mono';color:${l === 'U' ? C.leaf : C.dim}">${l}</div>`, face);
      at(e, RR + dx * 318 - 7, RR + dy * 318 - 11);
    });
    show(face, 20.0, 23.75);
    const sweep = W(`<div style="width:${RR * 2}px;height:${RR * 2}px;border-radius:50%;background:conic-gradient(from 0deg, rgba(60,191,110,.0) 0deg, rgba(60,191,110,.0) 300deg, rgba(60,191,110,.16) 360deg)"></div>`);
    at(sweep, OX - RR, OY - RR);
    draws.push((t) => applyVis(sweep, vis(t, 20.125, 23.75), `rotate(${((t - 20) * 120).toFixed(2)}deg)`));
    // members
    const SC = 350 / 500; // 350 px = 500 m
    const pol = (m, deg) => [OX + Math.sin(deg * Math.PI / 180) * m * SC, OY - Math.cos(deg * Math.PI / 180) * m * SC];
    const POS3 = pol(250, 45);
    const flag = W(`<div style="width:0;height:0"><div style="position:absolute;left:-30px;top:-30px;width:60px;height:60px;border-radius:50%;background:${C.leaf};color:${C.leafInk};display:flex;align-items:center;justify-content:center">${ico('flag', 32)}</div>
      <div style="position:absolute;left:42px;top:-14px;font:800 26px/1 'Plus Jakarta Sans';white-space:nowrap">Pos 3</div></div>`);
    at(flag, POS3[0], POS3[1]);
    draws.push((t) => applyVis(flag, vis(t, 20.5, 23.75), `scale(${popS(t, 20.5, 0.5).toFixed(4)})`));
    cue(20.5, 'pop');
    const mem = [
      { n: 'Budi', i: 'B', c: C.budi, p: pol(252, 0), ta: 22.5 },
      { n: 'Pak RT', i: 'P', c: C.rt, p: pol(470, 135), ta: 23.0 },
      { n: 'Sari', i: 'S', c: C.sari, p: pol(259, -45), ta: 23.5, sos: true },
      { n: 'Kamu', i: '', c: C.cream, p: [OX, OY], ta: 23.5, me: true },
    ];
    mem.forEach((m, k) => {
      m.e = W(`<div style="width:0;height:0"><div class="dot" style="position:absolute;left:-26px;top:-26px;width:52px;height:52px;border-radius:50%;background:${m.c};color:${m.me ? C.leafInk : '#fff'};display:flex;align-items:center;justify-content:center;font:800 24px/1 'Plus Jakarta Sans';box-shadow:0 0 0 5px ${C.card}">${m.i}</div>
        <div class="nm" style="position:absolute;left:36px;top:-30px;white-space:nowrap;font:700 24px/1.15 'Plus Jakarta Sans'">${m.n}${m.sos ? `<div class="mono" style="font:700 17px/1.2 'JetBrains Mono';color:${C.red}">SOS · 259 m</div>` : ''}</div></div>`);
      if (m.me) m.e.querySelector('.nm').style.cssText += ';left:-30px;top:34px';
      if (m.sos) m.ring = W(`<div style="width:52px;height:52px;margin:-26px 0 0 -26px;border-radius:50%;border:3px solid ${C.red}"></div>`);
      const off = [[-26, -40], [36, 20], [-20, 34], [26, 30]][k];
      m.X = new Track(m.p[0]).to(m.ta - 0.35, POS3[0] + off[0] * 0.9, SP.soft);
      m.Y = new Track(m.p[1]).to(m.ta - 0.35, POS3[1] + off[1] * 0.9, SP.soft);
      const tin = 20.25 + k * 0.125;
      cue(tin, 'pop');
      const nm = m.e.querySelector('.nm');
      draws.push((t) => {
        const x = m.X.at(t), y = m.Y.at(t);
        at(m.e, x, y);
        applyVis(m.e, vis(t, tin, 23.75), `scale(${popS(t, tin, 0.4).toFixed(4)})`);
        nm.style.opacity = (1 - clamp((t - (m.ta - 0.45)) / 0.2)).toFixed(3);
        if (m.ring) {
          const ph = ((t - 20.25) % 1) / 1;
          const live = t > 20.25 && t < m.ta - 0.4;
          at(m.ring, x, y); m.ring.style.opacity = live ? (0.8 * (1 - ph)).toFixed(3) : 0; m.ring.style.transform = `scale(${(1 + ph * 1.6).toFixed(3)})`;
        }
      });
    });
    // big arrow to Sari
    const sari = mem[2];
    const ARW = W(`<div style="height:0;width:0"><div class="shaft" style="position:absolute;left:0;top:-7px;height:14px;border-radius:7px;background:${C.red}"></div>
      <div class="ahd" style="position:absolute;top:-24px;width:0;height:0;border-top:24px solid transparent;border-bottom:24px solid transparent;border-left:36px solid ${C.red}"></div></div>`);
    const shaft = ARW.querySelector('.shaft'), ahead = ARW.querySelector('.ahd');
    const AL = new Track(0).to(20.75, 1, { w: 14, z: 0.9 });
    const sariLen = Math.hypot(sari.p[0] - OX, sari.p[1] - OY) - 44;
    draws.push((t) => {
      const v = vis(t, 20.75, 21.875);
      at(ARW, OX, OY);
      applyVis(ARW, v, `rotate(-135deg)`);
      ARW.style.transformOrigin = '0 0';
      const L = sariLen * clamp(AL.at(t), 0, 1.05);
      shaft.style.width = Math.max(0, L - 30).toFixed(1) + 'px';
      ahead.style.left = Math.max(0, L - 34).toFixed(1) + 'px';
    });
    cue(20.75, 'whoosh', { v: 0.5 }); cue(21.0, 'note', { n: 2 }); cue(21.5, 'note', { n: 4 });

    // ══ 24–28 · range ══
    const rL = add(`<div class="lbl" style="left:0;top:206px;width:1920px;justify-content:center">06 · Jangkauan</div>`);
    const rH = add(`<div class="head" style="left:0;top:254px;width:1920px;text-align:center;font-size:84px">Dari satu gang sampai <span class="serif">satu lembah.</span></div>`);
    show(rL, 24.0, 27.625); show(rH, 24.125, 27.625); cue(24.0, 'shimmer');
    const RX = 140, RY = 490, RW = 1640, RHh = 300, CWc = RW / 4;
    const ind = W(`<div style="border-radius:130px;background:${C.leaf}"></div>`);
    const tiers = [
      ['50–100', 'm', 'HP ke HP'], ['+1', 'HP', 'HP jembatan'], ['1–3', 'km', 'Wi‑Fi posko'], ['km+', 'LoRa', 'Gerbang Meshtastic'],
    ].map(([n, u, l], i) => {
      const e = W(`<div style="width:${CWc}px;text-align:center;white-space:nowrap">
        <div style="font:800 78px/1 'Plus Jakarta Sans';letter-spacing:-.045em">${n}<span style="font-size:.42em;letter-spacing:0;margin-left:10px">${u}</span></div>
        <div class="mono" style="margin-top:16px;font:700 22px/1 'JetBrains Mono';letter-spacing:.1em;text-transform:uppercase">${l}</div></div>`);
      at(e, RX + i * CWc, RY + RHh / 2 - e.offsetHeight / 2);
      return { e, tin: 24.5 + i * 0.5 };
    });
    const IL = new Track(RX + 20), IR = new Track(RX + 20);
    tiers.forEach(({ tin }, i) => {
      const l = RX + 20 + i * CWc, r = RX + (i + 1) * CWc - 20;
      if (i === 0) { IL.to(tin, l, { w: 22, z: 0.85 }); IR.to(tin, r, { w: 22, z: 0.85 }); }
      else { IR.to(tin, r, { w: 30, z: 0.85 }); IL.to(tin, l, { w: 15, z: 0.88 }); }
      cue(tin, 'slam', { n: 7 + i }); cue(tin, 'swap', { n: i });
    });
    draws.push((t) => {
      const l = IL.at(t), r = IR.at(t);
      rect(ind, l, RY + 20, r - l, RHh - 40);
      const v = vis(t, 24.5, 27.625);
      ind.style.opacity = v.o.toFixed(3); ind.style.visibility = v.gone ? 'hidden' : 'visible';
      const mid = (l + r) / 2;
      tiers.forEach(({ e, tin }, i) => {
        applyVis(e, vis(t, tin - 0.125, 27.625), `scale(${bump(t, tin, 0.06).toFixed(4)})`);
        const cx = RX + (i + 0.5) * CWc;
        const on = clamp(1 - Math.abs(mid - cx) / (CWc * 0.6));
        e.style.color = mix(C.cream, C.leafInk, on);
      });
    });
    const rS = add(`<div class="sub" style="left:0;top:836px;width:1920px;text-align:center">Mulai dari dua HP saja. Jangkauan bisa ditambah bertahap.</div>`);
    show(rS, 26.5, 27.625); cue(26.5, 'settle');

    // ══ 28–32 · logo ══
    const lg = W(`<div style="width:220px;height:220px;background:url(assets/mark.png) center/contain no-repeat"></div>`);
    ctr(lg, 960, 320);
    draws.push((t) => applyVis(lg, vis(t, 28.0, null), `scale(${popS(t, 28.0, 0.6).toFixed(4)})`));
    cue(28.0, 'slam', { n: 11 }); cue(28.0, 'born');
    const wm = add(`<div style="left:0;top:486px;width:1920px;text-align:center;font:800 120px/1 'Plus Jakarta Sans';letter-spacing:-.05em">Saling Jaga</div>`);
    const tg = add(`<div style="left:0;top:628px;width:1920px;text-align:center;font:500 40px/1.2 'Plus Jakarta Sans';color:${C.muted}">Saat sinyal hilang, kita tetap <span class="serif" style="color:${C.leaf};font-size:1.3em">saling jaga.</span></div>`);
    show(wm, 28.5, null); show(tg, 29.0, null); cue(28.5, 'pop'); cue(29.0, 'shimmer');
    const cta = add(`<div style="top:748px;height:96px;border-radius:48px;display:flex;align-items:center;justify-content:center;font:800 36px/1 'Plus Jakarta Sans';white-space:nowrap;overflow:hidden"></div>`);
    const ctaA = add(`<span style="position:absolute;display:flex;align-items:center;gap:14px">Unduh APK gratis${ico('arrow', 36)}</span>`, cta);
    const ctaB = add(`<span style="position:absolute" class="mono">saling-jaga.com</span>`, cta);
    const ctaC = new ColorTrack(C.leaf).to(30.0, C.cream, SP.soft);
    const CWt = new Track(500).to(30.0, 460, SP.shape);
    draws.push((t) => {
      const w = CWt.at(t); cta.style.left = (960 - w / 2).toFixed(2) + 'px'; cta.style.width = w.toFixed(2) + 'px';
      applyVis(cta, vis(t, 29.5, null), `scale(${(popS(t, 29.5, 0.8) * press(t, 30.0)).toFixed(4)})`);
      cta.style.background = ctaC.at(t); cta.style.color = C.leafInk;
      applyVis(ctaA, vis(t, 29.625, 29.95, 0.08)); applyVis(ctaB, vis(t, 30.05, null));
    });
    cue(29.5, 'pop'); cue(30.0, 'cta');
    const fine = add(`<div class="mono" style="left:0;top:900px;width:1920px;text-align:center;font:600 24px/1.6 'JetBrains Mono';color:${C.muted};letter-spacing:.04em">Gratis · tanpa akun · tanpa server · tanpa iklan · Android 6.0+</div>`);
    show(fine, 30.5, null); cue(30.5, 'shimmer');

    // ───────────────────────── Cursor ("Kamu") ─────────────────────────
    const cur = add(`<div class="cur"><svg viewBox="0 0 24 24"><path d="M4 2.5 20 11l-7 1.8L9.6 20z" fill="#f2edd5" stroke="#04140a" stroke-width="1.6" stroke-linejoin="round"/></svg><span class="pill">Kamu</span></div>`);
    const rip = add('<div class="rip"></div>');
    const CX = new Track(1720), CYt = new Track(980), CO = new Track(0);
    const mv = (t, x, y, sp = SP.cursor) => { CX.to(t, x, sp); CYt.to(t, y, sp); };
    const clicks = [2.5, 5.0, HOLD, SEND, GO, 30.0];
    CO.to(1.5, 1, SP.text);
    mv(1.75, 1320 + 340 - 70, 565);          // send
    mv(2.875, 1700, 900, SP.soft);
    mv(4.375, 1335, 590);                    // Cari
    mv(5.375, 1720, 960, SP.soft);
    mv(7.875, 1330, 585);                    // hold-to-talk
    mv(10.875, 1760, 960, SP.soft);
    mv(14.625, 1320 + 380 - 44 - 28, 560 + 410 - 44 - 40);   // chat send
    mv(15.5, 1760, 980, SP.soft);
    mv(18.875, 1780 - 90 - 120, ST + 860 - 80 - 40);          // Lihat arah
    mv(19.875, 1760, 1000, SP.soft);
    CO.to(20.125, 0, SP.text);
    mv(28.75, 1700, 1000, SP.snap); CO.to(29.0, 1, SP.text);
    mv(29.375, 990, 800);                    // CTA
    mv(30.5, 1300, 960, SP.soft);
    CO.to(31.25, 0, SP.text);
    cue(31.5, 'settle');
    draws.push((t) => {
      const [sx, sy] = toS(CX.at(t), CYt.at(t), t);
      const o = clamp(CO.at(t));
      const vx = (toS(CX.at(t + 0.01), CYt.at(t + 0.01), t + 0.01)[0] - sx) / 0.01;
      let sc = 1; for (const c of clicks) sc *= press(t, c);
      sc *= 1 - 0.12 * clamp((t - HOLD) / 0.08) * clamp((REL - t) / 0.08);
      at(cur, sx, sy); cur.style.opacity = o.toFixed(3);
      cur.style.transform = `rotate(${clamp(-vx * 0.0045, -14, 14).toFixed(2)}deg) scale(${sc.toFixed(4)})`;
      let rp = null, rx = 0, ry = 0; for (const c of clicks) { const r = ripple(t, c); if (r) { rp = r; [rx, ry] = toS(CX.at(c), CYt.at(c), t); } }
      if (rp && o > 0.3) { at(rip, rx, ry); rip.style.opacity = rp.o.toFixed(3); rip.style.transform = `scale(${rp.s.toFixed(3)})`; } else rip.style.opacity = 0;
    });

    // ───────────────────────── Seek ─────────────────────────
    const DUR = 32.0;
    window.seek = (t) => {
      const z = Math.exp(CAM.z.at(t)), zx = CAM.zx.at(t), zy = CAM.zy.at(t);
      world.style.transform = `translate(${(zx + shake(t)).toFixed(2)}px, ${zy.toFixed(2)}px) scale(${z.toFixed(5)}) translate(${(-zx).toFixed(2)}px, ${(-zy).toFixed(2)}px)`;
      for (const d of draws) d(t);
    };
    cues.sort((a, b) => a.t - b.t);
    window.FILM = { width: 1920, height: 1080, bpm: 120, duration: DUR,
      sections: { intro: [0, 4], build: [12, 16], drop: [16, 20], outro: [28, 32] }, cues };
    window.seek(0);
    window.READY = true;
  } catch (err) {
    window.FILM_ERROR = String(err && err.stack || err);
    console.error(err);
  }
})();
