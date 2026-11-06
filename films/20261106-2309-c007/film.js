// Saling Jaga · "Satu malam, empat HP". Portrait 1080×1920, 120 BPM, 32 s.
// One shape, never cut: signal pill → "Cari" disc → walkie-talkie capsule → group chat card
// → SOS card (drop) → compass disc → range gauge → logo disc.
(async function () {
  try {
    const { clamp, lerp, stepR, Track, ColorTrack, SP, vis, applyVis, press, ripple, outQ } = M;
    const C = { night: '#07110c', card: '#0f1f17', card2: '#13271d', cream: '#f2edd5', paper: '#f6f4ea', muted: '#a5b0a2',
      dim: '#6f7c6f', ink: '#1c2a21', grey: '#6b7469', leaf: '#3cbf6e', leafInk: '#04140a', moss: '#1b4d2e', appg: '#1f7a45',
      lamp: '#f2c46b', sos: '#e03131', red: '#ff6b6b', budi: '#e8590c', sari: '#d6336c', rt: '#1e7a45', line: '#e2e0d4' };

    await Promise.all([
      document.fonts.load('800 100px "Plus Jakarta Sans"'), document.fonts.load('500 40px "Plus Jakarta Sans"'),
      document.fonts.load('700 34px "Plus Jakarta Sans"'), document.fonts.load('600 30px "JetBrains Mono"'),
      document.fonts.load('700 30px "JetBrains Mono"'), document.fonts.load('italic 400 110px "Instrument Serif"'),
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
    const fade = (e, t, tin, tout, dOut = 0.15) => {
      const v = vis(t, tin, tout, dOut);
      if (v.gone) { e.style.visibility = 'hidden'; e.style.opacity = 0; return v; }
      e.style.visibility = 'visible'; e.style.opacity = v.o.toFixed(3);
      e.style.filter = v.b > 0.05 ? `blur(${(v.b * 0.6).toFixed(2)}px)` : 'none';
      return v;
    };
    const P = (d, sw = 2.2) => `<svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
    const I = {
      radio: P('<rect x="6.5" y="8" width="11" height="13.5" rx="2.5"/><path d="M9 8V2.5"/><path d="M9.5 12.5h5M9.5 15.5h5M9.5 18.5h5"/>'),
      wifi: P('<path d="M2 8.5a15 15 0 0 1 20 0"/><path d="M5 12a10.5 10.5 0 0 1 14 0"/><path d="M8.5 15.5a5.5 5.5 0 0 1 7 0"/><circle cx="12" cy="19" r="1" fill="currentColor"/>'),
      lock: P('<rect x="4.5" y="10.5" width="15" height="10.5" rx="2.5"/><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5"/>'),
      check: P('<path d="M20 6 9 17l-5-5"/>', 3),
      arrow: P('<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>', 2.6),
      flag: P('<path d="M5 22V3.5"/><path d="M5 4h12l-2.5 4L17 12H5"/>', 2.4),
      med: P('<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M12 9v6M9 12h6"/>'),
      batt: P('<rect x="2.5" y="7.5" width="17" height="9" rx="2"/><path d="M21.5 10.5v3"/><path d="M5 10v4" stroke-width="3"/>'),
      nosig: P('<path d="M4 20v-2M9 20v-5M14 20v-8M19 20V7"/><path d="m3 3 18 18"/>', 2.4),
      download: P('<path d="M12 3v12"/><path d="m6.5 10 5.5 5.5 5.5-5.5"/><path d="M4 20h16"/>', 2.6),
      mega: P('<path d="M3 10v4h3l7 4V6L6 10z"/><path d="M17 9a4 4 0 0 1 0 6"/>'),
    };
    const ico = (k, s, col = 'currentColor', st = '') => `<span class="ic" style="width:${s}px;height:${s}px;color:${col};${st}">${I[k]}</span>`;

    // ───────────────────────── Camera (zoom about a point + pan) ─────────────────────────
    const CAM = { z: new Track(Math.log(1.1)), zx: new Track(540), zy: new Track(1180), px: new Track(0), py: new Track(0) };
    const cam = (t, z, zx, zy, sp = SP.cam) => { CAM.z.to(t, Math.log(z), sp); if (zx != null) { CAM.zx.to(t, zx, sp); CAM.zy.to(t, zy, sp); } };
    cam(0.25, 1.0);
    cam(8.75, 1.1, 540, 1250); cam(10.75, 1.0);
    cam(15.875, 1.07, 540, 1240, { w: 16, z: 0.8 }); cam(17.0, 1.0);
    cam(21.5, 1.08, 400, 1060); cam(23.25, 1.0, 540, 1220);
    const shakes = [16.0];
    const shake = (t) => { let x = 0; for (const ts of shakes) { const d = t - ts; if (d > 0 && d < 0.6) x += 18 * Math.exp(-d * 8) * Math.sin(d * 70); } return x; };
    const toS = (x, y, t) => { const z = Math.exp(CAM.z.at(t)), zx = CAM.zx.at(t), zy = CAM.zy.at(t); return [zx + (x - zx) * z + shake(t), zy + (y - zy) * z]; };

    // ───────────────────────── The one shape ─────────────────────────
    const body = W('<div></div>');
    const PB = { l: new Track(540 - 330), t: new Track(1180 - 85), r: new Track(540 + 330), b: new Track(1180 + 85), rad: new Track(85), col: new ColorTrack(C.card2), bd: new Track(1) };
    const pm = (t, cx, cy, w, h, rad, col, sp = SP.shape) => {
      PB.l.to(t, cx - w / 2, sp); PB.t.to(t, cy - h / 2, sp); PB.r.to(t, cx + w / 2, sp); PB.b.to(t, cy + h / 2, sp); PB.rad.to(t, rad, sp);
      if (col) PB.col.to(t, col, SP.soft);
    };
    const bodyPress = [4.0, 19.0, 30.0];
    draws.push((t) => {
      const l = PB.l.at(t), tp = PB.t.at(t), r = PB.r.at(t), b = PB.b.at(t);
      rect(body, l, tp, r - l, b - tp);
      body.style.borderRadius = Math.min(PB.rad.at(t), (r - l) / 2, (b - tp) / 2).toFixed(2) + 'px';
      body.style.background = PB.col.at(t);
      let s = popS(t, 0, 0.2); for (const tc of bodyPress) s *= 1 - 0.05 * Math.exp(-(((t - tc) / 0.08) ** 2));
      body.style.transform = `scale(${s.toFixed(4)})`;
      const bd = clamp(PB.bd.at(t));
      body.style.boxShadow = `0 60px 120px -30px rgba(0,0,0,.75), inset 0 0 0 3px rgba(242,237,213,${(0.14 * bd).toFixed(3)})`;
    });

    // ───────────────────────── Status bar (the night's clock) ─────────────────────────
    const sb = add(`<div style="left:70px;top:70px;width:940px;height:60px"></div>`);
    const clocks = [['17:58', 0, 7.875], ['18:01', 8.0, 11.875], ['18:02', 12.0, 15.875], ['18:04', 16.0, 19.875], ['18:20', 20.0, 27.25]];
    clocks.forEach(([tx, tin, tout]) => {
      const e = add(`<div class="mono" style="position:absolute;left:0;top:10px;font:700 38px/1 'JetBrains Mono';color:${tx === '18:04' ? C.red : C.cream}">${tx}</div>`, sb);
      show(e, tin === 0 ? 0.125 : tin, tout);
    });
    const sbA = add(`<div class="mono" style="position:absolute;right:0;top:12px;display:flex;align-items:center;gap:14px;font:700 28px/1 'JetBrains Mono';letter-spacing:.08em;color:${C.red}">${ico('nosig', 36)}TANPA SINYAL</div>`, sb);
    const sbB = add(`<div class="mono" style="position:absolute;right:0;top:12px;display:flex;align-items:center;gap:14px;font:700 28px/1 'JetBrains Mono';letter-spacing:.08em;color:${C.leaf}">${ico('wifi', 36)}4 HP TERHUBUNG</div>`, sb);
    show(sbA, 2.0, 6.875); show(sbB, 7.0, 27.25);

    // ───────────────────────── HUD copy ─────────────────────────
    const block = (lbl, head, sub, tin, tout, lcol) => {
      const L = add(`<div class="lbl" style="left:80px;top:220px;${lcol ? 'color:' + lcol : ''}">${lbl}</div>`);
      const Hh = add(`<div class="head" style="left:80px;top:280px">${head}</div>`);
      show(L, tin, tout); show(Hh, tin + 0.125, tout);
      if (sub) { const S = add(`<div class="sub" style="left:80px;top:${280 + Hh.offsetHeight + 28}px">${sub}</div>`); show(S, tin + 0.375, tout); }
      cue(tin, 'shimmer');
    };

    // ══ INTRO 0–4: the signal pill, bars drop out one per beat ══
    const ih = add(`<div style="left:80px;top:260px;width:920px;font:800 128px/1.0 'Plus Jakarta Sans';letter-spacing:-.045em"></div>`);
    [['Listrik', 0.5], ['padam.', 1.0], ['<br>', 0], ['Sinyal', 1.5], [`<span class="serif" style="color:${C.red};font-size:1.14em">hilang.</span>`, 2.0]].forEach(([w, tw]) => {
      if (w === '<br>') { ih.appendChild(document.createElement('br')); return; }
      const e = add(`<span style="display:inline-block;margin-right:.22em">${w}</span>`, ih); show(e, tw, 3.375, (t) => `scale(${bump(t, tw, 0.05).toFixed(4)})`);
    });
    const isub = add(`<div class="sub" style="left:80px;top:${260 + ih.offsetHeight + 36}px">Grup chat sepi. Siapa yang aman?<br>Siapa yang butuh bantuan?</div>`);
    show(isub, 2.5, 3.375);
    [0.5, 1.0, 1.5, 2.0].forEach((tt, i) => cue(tt, 'slam', { n: i }));
    cue(0, 'born'); cue(2.5, 'pop');

    const pillC = W(`<div style="display:flex;align-items:center;gap:36px;white-space:nowrap;font:700 50px/1 'JetBrains Mono'"></div>`);
    const barsWrap = add('<span style="display:flex;gap:10px;align-items:flex-end;height:78px"></span>', pillC);
    const bars = [26, 44, 62, 80].map((h) => add(`<i style="display:block;width:20px;height:${h}px;border-radius:5px"></i>`, barsWrap));
    const pTxt = add('<span style="position:relative;display:inline-block;width:400px;height:52px"></span>', pillC);
    const p4g = add(`<span style="position:absolute;left:0;top:0;color:${C.cream}">4G · penuh</span>`, pTxt);
    const p0 = add(`<span style="position:absolute;left:0;top:0;color:${C.red}">Tanpa sinyal</span>`, pTxt);
    ctr(pillC, 540, 1180);
    const barOff = [0.5, 1.0, 1.5, 2.0];
    const barCol = bars.map((_, i) => new ColorTrack(C.leaf).to(barOff[3 - i], '#34443a', { w: 30, z: 1 }));
    draws.push((t) => {
      let s = 1; barOff.forEach((tb) => { s *= bump(t, tb, 0.04); });
      applyVis(pillC, vis(t, 0.125, 3.375), `scale(${s.toFixed(4)})`);
      bars.forEach((b, i) => { const tb = barOff[3 - i]; b.style.background = barCol[i].at(t); b.style.transform = `translateY(${(t > tb ? 8 * (1 - stepR(t - tb, SP.pop)) : 0).toFixed(2)}px)`; });
      applyVis(p4g, vis(t, -1, 1.875)); applyVis(p0, vis(t, 2.0, 3.375));
    });
    barOff.forEach((tb, i) => cue(tb, 'tick', { n: 3 - i }));
    cue(2.0, 'alert');

    // ══ SEARCH 4–8: pill → "Cari" disc → radar → three phones found ══
    const HUB = [540, 1180];
    pm(3.5, HUB[0], HUB[1], 300, 300, 150, C.leaf);
    pm(4.125, HUB[0], HUB[1], 220, 220, 110, null, SP.pop);
    PB.bd.to(3.5, 0, SP.text);
    cue(3.5, 'whoosh', { v: 0.8 }); cue(3.75, 'settle');
    const cari = W(`<div style="display:flex;flex-direction:column;align-items:center;gap:10px;color:${C.leafInk};font:800 46px/1 'Plus Jakarta Sans'">${ico('wifi', 84)}Cari</div>`);
    ctr(cari, HUB[0], HUB[1]);
    show(cari, 3.625, 3.95, (t) => `scale(${press(t, 4.0).toFixed(4)})`);
    const hubI = W(`<div>${ico('wifi', 104, C.leafInk)}</div>`); ctr(hubI, HUB[0], HUB[1] - 6);
    show(hubI, 4.05, 7.625);
    const rings = [0, 1, 2].map(() => W(`<div style="border-radius:50%;border:3px solid ${C.leaf}"></div>`));
    draws.push((t) => {
      const on = t > 4.0 && t < 7.75;
      rings.forEach((r, i) => {
        if (!on) { r.style.visibility = 'hidden'; return; }
        r.style.visibility = 'visible';
        const p = (((t - 4) * 0.5 + i / 3) % 1 + 1) % 1, rr = 110 + 360 * p;
        rect(r, HUB[0] - rr, HUB[1] - rr, rr * 2, rr * 2);
        r.style.opacity = (0.5 * (1 - p) * clamp((t - 4.0) / 0.2) * clamp((7.75 - t) / 0.25)).toFixed(3);
      });
    });
    cue(4.0, 'click');

    // peers: same elements travel from the radar to the walkie row
    const svg = W(`<svg width="1080" height="1920" style="left:0;top:0;overflow:visible" fill="none"></svg>`);
    const PEERS = [
      { ini: 'B', nm: 'Budi', col: C.budi, td: 4.5, a: [250, 960], b: [290, 950] },
      { ini: 'S', nm: 'Sari', col: C.sari, td: 5.0, a: [300, 1480], b: [540, 950] },
      { ini: 'R', nm: 'Pak RT', col: C.rt, td: 5.5, a: [830, 1330], b: [790, 950] },
    ];
    PEERS.forEach((p, i) => {
      p.X = new Track(p.a[0]).to(7.75 + i * 0.06, p.b[0], SP.shape);
      p.Y = new Track(p.a[1]).to(7.75 + i * 0.06, p.b[1], SP.shape);
      const g = W('<div style="width:0;height:0"></div>');
      const ring = add(`<div style="position:absolute;border-radius:50%;border:4px solid ${C.leaf}"></div>`, g);
      const av = add(`<div class="av" style="position:absolute;left:-56px;top:-56px;width:112px;height:112px;background:${p.col};font-size:46px;box-shadow:0 0 0 6px ${C.night}">${p.ini}</div>`, g);
      const nm = add(`<div style="position:absolute;left:-180px;top:72px;width:360px;text-align:center;font:800 36px/1.1 'Plus Jakarta Sans'">${p.nm}</div>`, g);
      const tl = 6.0 + i * 0.25, th = 9.25 + i * 0.25;
      const st = [['Siap dihubungkan', C.muted, p.td + 0.125, tl - 0.05], ['✓ Terhubung', C.leaf, tl, th - 0.05], ['Mendengar…', C.lamp, th, 10.875], ['✓ Terkirim', C.leaf, 10.875, 11.625]].map(([tx, col, a, b]) => {
        const e = add(`<div class="mono" style="position:absolute;left:-180px;top:120px;width:360px;text-align:center;font:600 26px/1 'JetBrains Mono';color:${col}">${tx}</div>`, g);
        show(e, a, b); return e;
      });
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('stroke', C.leaf); line.setAttribute('stroke-width', '4'); line.setAttribute('stroke-dasharray', '2 14'); line.setAttribute('stroke-linecap', 'round');
      svg.appendChild(line);
      draws.push((t) => {
        const x = p.X.at(t), y = p.Y.at(t);
        at(g, x, y);
        const v = vis(t, p.td, 11.625);
        applyVis(av, v, `scale(${(popS(t, p.td, 0.3) * bump(t, tl, 0.12) * bump(t, th, 0.1)).toFixed(4)})`);
        applyVis(nm, vis(t, p.td + 0.06, 11.625));
        const hearing = t > th && t < 10.875;
        const q = (((t - th) * 1.6) % 1 + 1) % 1, rr = 56 + 30 * q;
        rect(ring, -rr, -rr, rr * 2, rr * 2); ring.style.opacity = hearing ? (0.8 * (1 - q)).toFixed(3) : 0;
        const lk = clamp((t - tl) / 0.25), lo = clamp((7.75 - t) / 0.2);
        if (lk <= 0 || lo <= 0) { line.style.opacity = 0; return; }
        const ex = HUB[0] + (x - HUB[0]) * outQ(lk), ey = HUB[1] + (y - HUB[1]) * outQ(lk);
        const dx = x - HUB[0], dy = y - HUB[1], dl = Math.hypot(dx, dy);
        line.setAttribute('x1', (HUB[0] + dx / dl * 125).toFixed(1)); line.setAttribute('y1', (HUB[1] + dy / dl * 125).toFixed(1));
        line.setAttribute('x2', (ex - dx / dl * 70 * lk).toFixed(1)); line.setAttribute('y2', (ey - dy / dl * 70 * lk).toFixed(1));
        line.style.opacity = (lo * 0.9).toFixed(3); line.setAttribute('stroke-dashoffset', (-t * 40).toFixed(1));
      });
      cue(p.td, 'pop', { n: i }); cue(tl, 'check');
    });
    const conn = add(`<div style="height:96px;padding:0 40px;border-radius:48px;background:${C.leaf};color:${C.leafInk};display:flex;align-items:center;gap:18px;font:800 38px/1 'Plus Jakarta Sans';white-space:nowrap">${ico('check', 40)}4 HP terhubung</div>`);
    ctr(conn, 540, 1700);
    show(conn, 7.0, 7.75, (t) => `scale(${popS(t, 7.0, 0.7).toFixed(4)})`);
    cue(7.0, 'cta');
    block('Wi‑Fi Direct', 'HP ke HP, <span class="serif">langsung.</span>', 'Tanpa internet, pulsa, atau BTS.', 4.0, 7.625);

    // ══ WALKIE 8–12: disc → hold-to-talk capsule (edges stretch while held) ══
    const CY = 1300;
    pm(7.75, 540, CY, 820, 210, 105, C.appg);
    cue(7.75, 'whoosh', { v: 0.7 }); cue(8.0, 'settle');
    const HOLD = 9.0, REL = 10.5;
    // leading edges stiff, trailing soft: the capsule stretches when pressed
    PB.l.to(HOLD, 540 - 470, { w: 30, z: 0.8 }); PB.r.to(HOLD, 540 + 470, { w: 16, z: 0.85 });
    PB.t.to(HOLD, CY - 150, { w: 30, z: 0.78 }); PB.b.to(HOLD, CY + 150, { w: 14, z: 0.85 }); PB.rad.to(HOLD, 150, { w: 22, z: 0.85 });
    PB.col.to(HOLD, C.leaf, SP.soft);
    PB.l.to(REL, 540 - 410, { w: 16, z: 0.8 }); PB.r.to(REL, 540 + 410, { w: 30, z: 0.8 });
    PB.t.to(REL, CY - 105, { w: 16, z: 0.8 }); PB.b.to(REL, CY + 105, { w: 30, z: 0.8 }); PB.rad.to(REL, 105, { w: 22, z: 0.85 });
    PB.col.to(REL, C.appg, SP.soft);
    const tk1 = W(`<div style="display:flex;align-items:center;gap:26px;color:#fff;font:800 46px/1 'Plus Jakarta Sans';white-space:nowrap">${ico('radio', 60)}Tahan untuk bicara</div>`);
    ctr(tk1, 540, CY); show(tk1, 8.0, HOLD - 0.1);
    const tk2 = W(`<div style="display:flex;align-items:center;gap:30px;color:${C.leafInk};white-space:nowrap"></div>`);
    add(`<span style="width:26px;height:26px;border-radius:13px;background:${C.sos}"></span>`, tk2);
    const wv = add('<span style="display:flex;align-items:center;gap:7px;height:110px"></span>', tk2);
    const wbars = Array.from({ length: 22 }, () => add(`<i style="display:block;width:9px;border-radius:5px;background:${C.leafInk}"></i>`, wv));
    const tTime = add(`<span class="mono" style="font:700 44px/1 'JetBrains Mono';width:110px">0:00</span>`, tk2);
    ctr(tk2, 540, CY); show(tk2, HOLD + 0.125, REL - 0.08);
    const tk3 = W(`<div style="display:flex;align-items:center;gap:22px;color:#fff;font:800 44px/1 'Plus Jakarta Sans';white-space:nowrap">${ico('check', 52)}Terdengar di 3 HP</div>`);
    ctr(tk3, 540, CY); show(tk3, REL + 0.125, 11.625);
    draws.push((t) => {
      wbars.forEach((e, i) => { e.style.height = (14 + 90 * Math.abs(Math.sin(t * 9 + i * 0.9) * Math.sin(t * 3.3 + i * 0.37))).toFixed(1) + 'px'; });
      tTime.textContent = '0:0' + clamp(Math.floor((t - HOLD) * 2), 0, 3);
    });
    cue(HOLD, 'click'); cue(HOLD, 'drag', { d: REL - HOLD }); cue(REL, 'release'); cue(10.625, 'check');
    [9.25, 9.5, 9.75].forEach((tt, i) => cue(tt, 'pop', { n: i + 2 }));
    block('Walkie-talkie', 'Tahan, lalu <span class="serif">bicara.</span>', 'Satu tombol, seluruh grup mendengar.', 8.0, 11.625);

    // ══ CHAT 12–16: capsule → group chat card ══
    const CH = { cx: 540, cy: 1270, w: 940, h: 760 };
    pm(11.75, CH.cx, CH.cy, CH.w, CH.h, 56, C.paper);
    cue(11.75, 'whoosh', { v: 0.6 });
    const chT = CH.cy - CH.h / 2, chL = CH.cx - CH.w / 2;
    const chHead = W(`<div style="display:flex;align-items:center;gap:22px;color:${C.ink}">
      <div style="width:84px;height:84px;border-radius:50%;background:${C.cream};overflow:hidden;border:2px solid ${C.line}"><img src="assets/mark.png" style="width:80px;height:80px;display:block"></div>
      <div><div style="font:800 38px/1.1 'Plus Jakarta Sans'">Grup RT 04 · 4 orang</div><div class="mono" style="font:600 24px/1.4 'JetBrains Mono';color:${C.grey};margin-top:4px">HP ke HP · tanpa server</div></div></div>`);
    at(chHead, chL + 44, chT + 40); show(chHead, 12.0, 15.875);
    const chSep = W(`<div style="height:2px;background:${C.line}"></div>`); rect(chSep, chL + 44, chT + 156, CH.w - 88, 2); show(chSep, 12.0, 15.875);
    const col = W(`<div style="display:flex;flex-direction:column;gap:22px;width:${CH.w - 88}px"></div>`);
    at(col, chL + 44, chT + 186);
    const bub = (html, tin, st) => { const e = add(`<div style="${st}">${html}</div>`, col); show(e, tin, 15.875, (t) => `scale(${popS(t, tin, 0.88).toFixed(4)})`); return e; };
    const bo = 'align-self:flex-start;max-width:700px;background:#fff;border:2px solid #e2e0d4;border-radius:30px 30px 30px 8px;padding:18px 26px;font:500 34px/1.3 Plus Jakarta Sans;color:#1c2a21;transform-origin:0 100%';
    bub(`<div style="font:800 26px/1.2 'Plus Jakarta Sans';color:${C.budi};margin-bottom:6px">Budi</div>Aku sudah di masjid. Aman.`, 12.25, bo);
    bub(`<div style="display:flex;align-items:center;gap:12px;font:800 24px/1.2 'JetBrains Mono';letter-spacing:.06em;color:#8a5300;margin-bottom:10px">${ico('mega', 30)}PENGUMUMAN · PAK RT</div><span style="font-weight:700">Titik kumpul pindah ke Pos 3, 250 m ke timur laut.</span>`, 13.0,
      'background:#fdf0d6;border-radius:28px;padding:22px 26px;font:500 36px/1.3 Plus Jakarta Sans;color:#1c2a21;transform-origin:50% 100%');
    bub(`<div style="font:800 26px/1.2 'Plus Jakarta Sans';color:${C.sari};margin-bottom:6px">Sari</div>Kakiku terkilir. Ada yang bisa jemput?`, 13.75, bo);
    const lockC = W(`<div class="mono" style="display:flex;align-items:center;gap:12px;font:600 24px/1 'JetBrains Mono';color:${C.appg};white-space:nowrap">${ico('lock', 28)}Terenkripsi AES‑256‑GCM</div>`);
    ctr(lockC, 540, chT + CH.h - 44); show(lockC, 14.5, 15.875);
    cue(12.25, 'note', { n: 2 }); cue(13.0, 'alert'); cue(13.75, 'note', { n: 4 }); cue(14.5, 'tick');
    cue(15.0, 'riser', { d: 1.0 });
    block('Chat · pengumuman', 'Grup tetap <span class="serif">hidup.</span>', 'Pesan pindah dari HP ke HP. Tanpa server di tengah.', 12.0, 15.625);

    // ══ DROP 16–20: chat card → SOS card. Every phone rings. ══
    const SO = { cx: 540, cy: 1250, w: 960, h: 800 };
    pm(15.875, SO.cx, SO.cy, SO.w, SO.h, 64, C.sos, { w: 22, z: 0.72 });
    const soT = SO.cy - SO.h / 2, soL = SO.cx - SO.w / 2;
    const soHead = W(`<div style="display:flex;align-items:center;gap:26px;color:#fff">
      <div class="av" style="width:120px;height:120px;background:${C.sari};font-size:52px;box-shadow:0 0 0 6px rgba(255,255,255,.9)">S</div>
      <div><div style="font:800 64px/1 'Plus Jakarta Sans';letter-spacing:-.03em">SOS · Sari</div><div style="font:600 34px/1.3 'Plus Jakarta Sans';opacity:.9;margin-top:8px">minta tolong</div></div></div>`);
    at(soHead, soL + 56, soT + 56); show(soHead, 16.0, 18.875);
    // odometer: 0 → 259 m
    const odo = W(`<div style="display:flex;align-items:flex-end;gap:18px;color:#fff"></div>`);
    const digWrap = add(`<div style="display:flex;height:250px;overflow:hidden;font:700 250px/250px 'JetBrains Mono';letter-spacing:-.04em"></div>`, odo);
    const strips = [2, 1, 0].map(() => { const s = add('<div style="display:flex;flex-direction:column"></div>', add('<div style="height:250px"></div>', digWrap)); for (let d = 0; d <= 10; d++) add(`<div style="height:250px">${d % 10}</div>`, s); return s; });
    add(`<div style="font:800 84px/1 'Plus Jakarta Sans';padding-bottom:30px">m</div>`, odo);
    at(odo, soL + 56, soT + 230);
    show(odo, 16.25, 18.875);
    const dirL = W(`<div style="color:#fff;font:700 50px/1.1 'Plus Jakarta Sans';white-space:nowrap">ke arah <span class="serif" style="font-size:1.25em">barat laut</span></div>`);
    at(dirL, soL + 60, soT + 500); show(dirL, 17.0, 18.875);
    const chips = W(`<div style="display:flex;gap:18px"></div>`);
    const chip = (html) => add(`<div style="height:76px;padding:0 28px;border-radius:38px;background:rgba(255,255,255,.18);color:#fff;display:flex;align-items:center;gap:14px;font:700 32px/1 'Plus Jakarta Sans';white-space:nowrap">${html}</div>`, chips);
    const c1 = chip(`${ico('batt', 40)}Baterai 21%`), c2 = chip(`${ico('med', 40)}Kartu medis`);
    at(chips, soL + 56, soT + 600);
    show(c1, 17.5, 18.875, (t) => `scale(${popS(t, 17.5, 0.7).toFixed(4)})`); show(c2, 18.0, 18.875, (t) => `scale(${popS(t, 18.0, 0.7).toFixed(4)})`);
    const lihat = W(`<div style="height:110px;border-radius:55px;background:#fff;color:${C.sos};display:flex;align-items:center;justify-content:center;gap:16px;font:800 40px/1 'Plus Jakarta Sans'">Lihat arah ${ico('arrow', 44)}</div>`);
    rect(lihat, soL + 56, SO.cy + SO.h / 2 + 40, SO.w - 112, 110);
    show(lihat, 18.25, 19.125, (t) => `scale(${(popS(t, 18.25, 0.8) * press(t, 19.0)).toFixed(4)})`);
    draws.push((t) => {
      const v = 259 * outQ((t - 16.5) / 1.0);
      [2, 1, 0].forEach((p, i) => {
        const P10 = 10 ** p, carry = Math.max(0, (v % P10) - (P10 - 1));
        const pos = (Math.floor(v / P10) % 10) + carry;
        strips[i].style.transform = `translateY(${(-pos * 250).toFixed(1)}px)`;
        strips[i].parentElement.style.opacity = p > 0 && v < P10 - 0.5 ? 0.3 : 1;
      });
      let o = 0; [16.0, 16.5, 17.0, 17.5, 18.0].forEach((ta, i) => { const d = t - ta; if (d > 0) o = Math.max(o, (1 - 0.12 * i) * Math.exp(-d * 2.6)); });
      redL.style.opacity = o.toFixed(3);
    });
    cue(16.0, 'drop'); cue(16.0, 'alert'); cue(16.5, 'alert'); cue(17.0, 'alert'); cue(17.5, 'pop'); cue(18.0, 'pop');
    for (let k = 0; k < 8; k++) cue(16.5 + k * 0.125, 'tick');
    cue(18.25, 'pop'); cue(19.0, 'click');
    block('SOS dengan arah', 'Semua HP <span class="serif" style="color:#ff6b6b">berbunyi.</span>', 'Lengkap dengan jarak, arah, dan baterai.', 16.0, 19.625, C.red);
    const throb = (t) => { let s = 1; [16.5, 17.0, 17.5, 18.0].forEach((tb) => { s *= bump(t, tb, 0.012, 0.07); }); return s; };
    draws.push((t) => { if (t > 15.9 && t < 19.2) body.style.transform += ` scale(${throb(t).toFixed(4)})`; });

    // ══ COMPASS 20–24: SOS card → compass disc ══
    const CC = [540, 1180], R = 380;
    pm(19.25, CC[0], CC[1], 2 * R, 2 * R, R, C.card);
    PB.bd.to(19.25, 1, SP.text);
    cue(19.25, 'whoosh', { v: 0.7 }); cue(19.75, 'settle');
    const comp = W('<div style="left:0;top:0;width:1080px;height:1920px"></div>');
    add(`<div style="position:absolute;left:${CC[0] - R * 0.66}px;top:${CC[1] - R * 0.66}px;width:${R * 1.32}px;height:${R * 1.32}px;border-radius:50%;border:2px dashed rgba(242,237,213,.16)"></div>`, comp);
    add(`<div style="position:absolute;left:${CC[0] - R * 0.33}px;top:${CC[1] - R * 0.33}px;width:${R * 0.66}px;height:${R * 0.66}px;border-radius:50%;border:2px dashed rgba(242,237,213,.12)"></div>`, comp);
    [['U', 0], ['T', 90], ['S', 180], ['B', 270]].forEach(([c, a]) => {
      const rr = R + 44, x = CC[0] + rr * Math.sin(a * Math.PI / 180), y = CC[1] - rr * Math.cos(a * Math.PI / 180);
      add(`<div class="mono" style="position:absolute;left:${x - 25}px;top:${y - 18}px;width:50px;text-align:center;font:700 34px/36px 'JetBrains Mono';color:${c === 'U' ? C.leaf : C.muted}">${c}</div>`, comp);
    });
    const needle = add(`<div style="position:absolute;left:${CC[0] - 5}px;top:${CC[1] - 210}px;width:10px;height:210px;border-radius:5px;transform-origin:5px 210px"></div>`, comp);
    add(`<div class="av" style="position:absolute;left:${CC[0] - 34}px;top:${CC[1] - 34}px;width:68px;height:68px;background:${C.leaf};color:${C.leafInk};font-size:24px;box-shadow:0 0 0 8px ${C.card}">Aku</div>`, comp);
    const NA = new Track(0).to(21.75, -45, { w: 14, z: 0.78 });
    const NC = new ColorTrack(C.leaf).to(21.75, C.red);
    const MEM = [['B', 'Budi', '252 m', C.budi, 0, 252, 20.0], ['S', 'Sari', '259 m', C.sari, -45, 259, 20.5], ['R', 'Pak RT', '470 m', C.rt, 135, 470, 21.0], ['flag', 'Pos 3', '250 m', C.lamp, 45, 250, 21.5]];
    let sariXY = null;
    MEM.forEach(([ini, nm, d, colr, a, m, td], i) => {
      const rr = 60 + 0.62 * m, x = CC[0] + rr * Math.sin(a * Math.PI / 180), y = CC[1] - rr * Math.cos(a * Math.PI / 180);
      if (nm === 'Sari') sariXY = [x, y];
      const g = add(`<div style="position:absolute;left:${x}px;top:${y}px;width:0;height:0"></div>`, comp);
      const ring = nm === 'Sari' ? add(`<div style="position:absolute;border-radius:50%;border:4px solid ${C.red}"></div>`, g) : null;
      const dot = add(ini === 'flag'
        ? `<div class="av" style="position:absolute;left:-36px;top:-36px;width:72px;height:72px;background:${colr};color:${C.leafInk};padding:16px">${I.flag}</div>`
        : `<div class="av" style="position:absolute;left:-36px;top:-36px;width:72px;height:72px;background:${colr};font-size:30px;box-shadow:0 0 0 5px ${C.card}">${ini}</div>`, g);
      const below = a === 135;
      const lb = add(`<div style="position:absolute;left:-130px;top:${below ? 46 : -122}px;width:260px;text-align:center;white-space:nowrap;font:800 30px/1.15 'Plus Jakarta Sans';color:${C.cream}">${nm}<br><span class="mono" style="font:600 24px 'JetBrains Mono';color:${C.muted}">${d}</span></div>`, g);
      draws.push((t) => {
        applyVis(dot, vis(t, td, 23.625), `scale(${(popS(t, td, 0.3) * (nm === 'Sari' ? press(t, 22.25) : 1)).toFixed(3)})`);
        applyVis(lb, vis(t, td + 0.125, 23.625));
        if (ring) { const q = ((t - td) * 1.4) % 1, r2 = 36 + 40 * q; rect(ring, -r2, -r2, r2 * 2, r2 * 2); ring.style.opacity = t < 21.75 || t > 23.6 ? 0 : (0.85 * (1 - q)).toFixed(3); }
      });
      cue(td, 'pop', { n: i });
    });
    const go = W(`<div style="height:120px;border-radius:60px;display:flex;align-items:center;justify-content:center;gap:18px;font:800 42px/1 'Plus Jakarta Sans';white-space:nowrap"></div>`);
    rect(go, 110, 1650, 860, 120);
    const goA = add(`<span style="position:absolute;display:flex;align-items:center;gap:16px">Aku menuju ke Sari ${ico('arrow', 44)}</span>`, go);
    const goB = add(`<span style="position:absolute;display:flex;align-items:center;gap:16px">${ico('check', 44)}Sari tahu kamu datang</span>`, go);
    const goC = new ColorTrack(C.card2).to(23.0, C.leaf);
    draws.push((t) => {
      fade(comp, t, 19.625, 23.625);
      needle.style.transform = `rotate(${NA.at(t).toFixed(2)}deg)`;
      needle.style.background = NC.at(t);
      applyVis(go, vis(t, 22.5, 23.625), `scale(${(popS(t, 22.5, 0.85) * press(t, 23.0)).toFixed(4)})`);
      go.style.background = goC.at(t); go.style.color = t > 23.0 ? C.leafInk : C.cream;
      go.style.border = `3px solid ${t > 23.0 ? C.leaf : 'rgba(242,237,213,.25)'}`;
      applyVis(goA, vis(t, 22.5, 22.95, 0.08)); applyVis(goB, vis(t, 23.05, 23.625));
    });
    cue(21.75, 'swap', { n: 2 }); cue(22.25, 'click'); cue(22.5, 'pop'); cue(23.0, 'check');
    block('Kompas & titik kumpul', 'Tahu siapa <span class="serif">di mana.</span>', null, 20.0, 23.5);

    // ══ RANGE 24–27.5: the disc becomes a gauge that climbs one rung per two beats ══
    const GX = 230, GB = 1740, GW = 150;
    pm(23.75, GX, GB - 150, GW, 300, 40, C.leaf);
    cue(23.75, 'whoosh', { v: 0.6 });
    PB.t.to(23.94, GB - 330, { w: 20, z: 0.78 });
    const RUNG = [['50–100', 'm', 'HP ke HP · Wi‑Fi Direct', 24.0, 330], ['+1', 'HP', 'HP jembatan meneruskan pesan', 24.75, 560], ['1–3', 'km', 'Wi‑Fi posko', 25.5, 820], ['km+', 'LoRa', 'Gerbang Meshtastic', 26.25, 1080]];
    RUNG.forEach(([n, u, cap, tr, h], i) => {
      if (i > 0) { PB.t.to(tr - 0.06, GB - h, { w: 20, z: 0.78 }); }
      const y = GB - h;
      const tick = W(`<div style="height:4px;background:${C.leaf};border-radius:2px"></div>`);
      rect(tick, GX + GW / 2 + 20, y, 50, 4);
      const lb = W(`<div style="white-space:nowrap"><div class="mono" style="font:700 84px/1 'JetBrains Mono';letter-spacing:-.04em;color:${C.cream}">${n}<span style="font-size:.5em;color:${C.leaf};margin-left:12px;letter-spacing:0">${u}</span></div><div style="font:600 34px/1.2 'Plus Jakarta Sans';color:${C.muted};margin-top:12px">${cap}</div></div>`);
      at(lb, GX + GW / 2 + 96, y - 14);
      const nxt = RUNG[i + 1] ? RUNG[i + 1][3] : 99;
      draws.push((t) => {
        const v = vis(t, tr, 27.375);
        const dimv = 1 - 0.55 * stepR(t - nxt, SP.text);
        applyVis(lb, { ...v, o: v.o * dimv });
        applyVis(tick, v, `scaleX(${popS(t, tr, 0).toFixed(3)})`);
      });
      cue(tr, 'slam', { n: i });
    });
    block('Jangkauan', 'Mulai dari <span class="serif">dua HP.</span>', null, 24.0, 27.25);

    // ══ OUTRO 27.5–32: gauge → logo disc ══
    const LC = [540, 720];
    pm(27.5, LC[0], LC[1], 380, 380, 190, C.cream, { w: 16, z: 0.8 });
    PB.bd.to(23.75, 0, SP.text);
    cue(27.5, 'whoosh', { v: 0.7 });
    const lg = W(`<img src="assets/mark.png" style="width:330px;height:330px">`);
    at(lg, LC[0] - 165, LC[1] - 165);
    show(lg, 27.75, null, (t) => `scale(${(popS(t, 27.75, 0.6) * bump(t, 28.0, 0.05)).toFixed(4)})`);
    cue(28.0, 'slam', { n: 0 });
    const wm = add(`<div style="left:0;top:990px;width:1080px;text-align:center;font:800 140px/1 'Plus Jakarta Sans';letter-spacing:-.05em">Saling Jaga</div>`);
    show(wm, 28.0, null, (t) => `scale(${bump(t, 28.0, 0.04).toFixed(4)})`);
    const tg = add(`<div style="left:90px;top:1180px;width:900px;text-align:center;font:600 54px/1.22 'Plus Jakarta Sans';letter-spacing:-.02em;color:${C.cream}">Saat sinyal hilang,<br>kita tetap <span class="serif" style="color:${C.leaf};font-size:1.2em">saling jaga.</span></div>`);
    show(tg, 28.5, null); cue(28.5, 'note', { n: 3 });
    const cta = add(`<div style="top:1430px;height:130px;border-radius:65px;display:flex;align-items:center;justify-content:center;font:800 44px/1 'Plus Jakarta Sans';white-space:nowrap"></div>`);
    const ctaA = add(`<span style="position:absolute;display:flex;gap:18px;align-items:center">${ico('download', 46)}Unduh APK gratis</span>`, cta);
    const ctaB = add(`<span style="position:absolute;display:flex;gap:18px;align-items:center">${ico('check', 46)}Pasang sebelum dibutuhkan</span>`, cta);
    const ctaC = new ColorTrack(C.leaf).to(30.0, C.cream);
    const CW = new Track(660).to(30.0, 800, SP.shape);
    draws.push((t) => {
      const w = CW.at(t); cta.style.left = (540 - w / 2).toFixed(2) + 'px'; cta.style.width = w.toFixed(2) + 'px';
      applyVis(cta, vis(t, 29.0, null), `scale(${(popS(t, 29.0, 0.8) * press(t, 30.0)).toFixed(4)})`);
      cta.style.background = ctaC.at(t); cta.style.color = C.leafInk;
      applyVis(ctaA, vis(t, 29.125, 29.95, 0.08)); applyVis(ctaB, vis(t, 30.05, null));
    });
    cue(29.0, 'pop'); cue(30.0, 'cta');
    const fine = add(`<div class="mono" style="left:0;top:1640px;width:1080px;text-align:center;font:600 30px/1.6 'JetBrains Mono';color:${C.muted};letter-spacing:.04em">Tanpa akun · tanpa server · tanpa iklan<br><span style="color:${C.leaf}">Android 6.0+ · saling-jaga.com</span></div>`);
    show(fine, 30.5, null); cue(30.5, 'shimmer');

    // ───────────────────────── Cursor ("Kamu") ─────────────────────────
    const cur = add(`<div class="cur"><svg viewBox="0 0 24 24"><path d="M4 2.5 20 11l-7 1.8L9.6 20z" fill="#f2edd5" stroke="#04140a" stroke-width="1.6" stroke-linejoin="round"/></svg><span class="pill">Kamu</span></div>`);
    const rip = add('<div class="rip"></div>');
    const CX = new Track(880), CYt = new Track(1700), CO = new Track(0);
    const mv = (t, x, y, sp = SP.cursor) => { CX.to(t, x, sp); CYt.to(t, y, sp); };
    const clicks = [4.0, HOLD, 19.0, 22.25, 23.0, 30.0];
    CO.to(2.75, 1, SP.text);
    mv(3.0, 570, 1210);                      // Cari
    mv(4.375, 900, 1660, SP.soft);
    mv(8.125, 600, 1320);                    // hold-to-talk
    mv(10.75, 900, 1660, SP.soft);
    mv(18.375, 560, SO.cy + SO.h / 2 + 100); // Lihat arah
    mv(21.25, sariXY[0] + 8, sariXY[1] + 8); // Sari on the compass
    mv(22.375, 870, 1730);                // Aku menuju ke Sari
    CO.to(23.5, 0, SP.text);
    mv(28.5, 880, 1780, SP.snap); CO.to(28.875, 1, SP.text);
    mv(29.125, 600, 1500);                   // CTA
    mv(30.5, 960, 1340, SP.soft);
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
    window.FILM = { width: 1080, height: 1920, bpm: 120, duration: DUR,
      sections: { intro: [0, 4], build: [12, 16], drop: [16, 20], outro: [27.5, 32] }, cues };
    window.seek(0);
    window.READY = true;
  } catch (err) {
    window.FILM_ERROR = String(err && err.stack || err);
    console.error(err);
  }
})();
