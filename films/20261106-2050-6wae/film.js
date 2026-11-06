// Saling Jaga 0.45 · "Seperti grup chat yang sudah kamu kenal". Landscape 1920×1080, 120 BPM, 72 s.
// One shape, never cut: the "no signal" pill → the phone (old layout) → every old block morphs into the new
// chat layout (card → header, buttons → +, talk disc → green button) → SOS card → pinned row → + → sheet →
// header → members panel → gear → settings → iPhone → logo disc.
(async function () {
  try {
    const { clamp, lerp, stepR, Track, ColorTrack, SP, vis, applyVis, press, ripple, outQ } = M;
    const C = { night: '#07110c', card: '#0f1f17', card2: '#13271d', cream: '#f2edd5', paper: '#f6f4ea', muted: '#a5b0a2',
      ink: '#1c2a21', grey: '#6b7469', leaf: '#3cbf6e', moss: '#1d4d31', appg: '#1f7a45', lamp: '#f2c46b',
      annInk: '#8a5300', sos: '#e03131', sosBg: '#fdecec', budi: '#e8590c', sari: '#d6336c', rt: '#1e7a45', you: '#5fa30f',
      rina: '#7048e8', joko: '#0c8599', line: '#e2e0d4' };

    await Promise.all([
      document.fonts.load('800 64px "Plus Jakarta Sans"'), document.fonts.load('500 30px "Plus Jakarta Sans"'),
      document.fonts.load('700 15px "Plus Jakarta Sans"'), document.fonts.load('600 24px "JetBrains Mono"'),
      document.fonts.load('italic 400 90px "Instrument Serif"'), document.fonts.load('400 15px "Plus Jakarta Sans"'),
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
    const at = (e, x, y) => { e.style.left = x + 'px'; e.style.top = y + 'px'; return e; };
    const rect = (e, x, y, w, h) => { e.style.left = x.toFixed(2) + 'px'; e.style.top = y.toFixed(2) + 'px'; e.style.width = Math.max(0, w).toFixed(2) + 'px'; e.style.height = Math.max(0, h).toFixed(2) + 'px'; };
    const show = (e, tin, tout, extra = '') => draws.push((t) => applyVis(e, vis(t, tin, tout), typeof extra === 'function' ? extra(t) : extra));
    const popS = (t, tin, s0 = 0.5) => s0 + (1 - s0) * stepR(t - tin, SP.pop);
    // fade without translate (for big containers)
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
      send: P('<path d="M4 12 20 4l-5 16-3.5-6.5z"/><path d="M11.5 13.5 20 4"/>'),
      plus: P('<path d="M12 5v14M5 12h14"/>', 2.4),
      cam: P('<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>'),
      gear: P('<circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"/>'),
      x: P('<path d="M18 6 6 18M6 6l12 12"/>', 2.6),
      back: P('<path d="M19 12H5"/><path d="m11 5-7 7 7 7"/>', 2.4),
      siren: P('<path d="M6 18v-6a6 6 0 0 1 12 0v6"/><path d="M4 18h16v3H4z"/><path d="M12 2v2M3.5 5.5 5 7M20.5 5.5 19 7"/>'),
      torch: P('<path d="M8 3h8v5l-2 3v10h-4V11L8 8z"/><path d="M12 14v2"/>'),
      family: P('<circle cx="9" cy="8" r="3"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><circle cx="17" cy="15" r="3"/><path d="m19.2 17.2 2.3 2.3"/>'),
      compass: P('<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>'),
      flag: P('<path d="M5 22V3.5"/><path d="M5 4h12l-2.5 4L17 12H5"/>'),
      mega: P('<path d="M3 10v4h3l7 4V6L6 10z"/><path d="M16.5 9a4 4 0 0 1 0 6"/>'),
      list: P('<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 3h6v3H9z"/><path d="m8.5 13 2 2 4-4"/>'),
      med: P('<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M12 9v6M9 12h6"/>'),
      book: P('<path d="M4 5a2 2 0 0 1 2-2h13v15H6a2 2 0 0 0-2 2z"/><path d="M4 20a2 2 0 0 0 2 2h13v-4"/><path d="M11.5 7v6M8.5 10h6"/>'),
      nosig: P('<path d="M4 20v-2M9 20v-6M14 20v-9M19 20V5"/><path d="M3 4l18 17"/>', 2.4),
      bat: P('<rect x="2.5" y="7" width="17" height="10" rx="2"/><path d="M21.5 10.5v3"/><path d="M5.5 10v4M8.5 10v4"/>'),
      check: P('<path d="M20 6 9 17l-5-5"/>', 3),
      play: '<svg viewBox="0 0 24 24" width="100%" height="100%"><path d="M7 4.5v15l12.5-7.5z" fill="currentColor"/></svg>',
      chev: P('<path d="m9 6 6 6-6 6"/>', 2.4),
      bridge: P('<path d="M2 16h20"/><path d="M4 16v4M20 16v4"/><path d="M2 12c4 0 6-5 10-5s6 5 10 5"/><path d="M7 16v-6M12 16V7M17 16v-6"/>'),
      speak: P('<path d="M4 10v4h3l5 4V6L7 10z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>'),
    };
    const ico = (k, s, col = 'currentColor', st = '') => `<span class="ic" style="width:${s}px;height:${s}px;color:${col};${st}">${I[k]}</span>`;

    // ───────────────────────── Camera (defined first: the cursor reads it) ─────────────────────────
    const CAM = { ax: new Track(960), cx: new Track(200), cy: new Track(480), lz: new Track(Math.log(1.1)) };
    const cam = (t, cx, cy, z, ax) => { CAM.cx.to(t, cx, SP.cam); CAM.cy.to(t, cy, SP.cam); CAM.lz.to(t, Math.log(z), SP.cam); if (ax != null) CAM.ax.to(t, ax, SP.cam); };
    cam(3.5, 200, 433, 1.1, 1390);
    cam(23.75, 200, 290, 1.55); cam(29.0, 200, 433, 1.1);
    cam(30.25, 200, 610, 1.4);
    cam(37.5, 200, 690, 1.7);
    cam(45.0, 200, 433, 1.1); cam(46.0, 200, 330, 1.35); cam(52.0, 200, 433, 1.1);
    cam(53.5, 200, 340, 1.3); cam(58.75, 200, 433, 1.1);
    cam(60.0, 200, 433, 1.0);
    cam(66.0, 200, 433, 1.0, 960);
    const toS = (lx, ly, t) => { const z = Math.exp(CAM.lz.at(t)); return [CAM.ax.at(t) + (lx - CAM.cx.at(t)) * z, 540 + (ly - CAM.cy.at(t)) * z]; };
    const shakes = [];
    const shake = (t) => { let x = 0; for (const ts of shakes) { const d = t - ts; if (d > 0 && d < 0.6) x += 12 * Math.exp(-d * 8) * Math.sin(d * 70); } return x; };

    // ───────────────────────── Phone body: the one shape ─────────────────────────
    const body = add('<div id="body"></div>', world);
    const PB = { l: new Track(200 - 222), t: new Track(560 - 42), r: new Track(200 + 222), b: new Track(560 + 42), rad: new Track(42), col: new ColorTrack(C.card2), bor: new Track(1) };
    const pm = (t, l, tp, r, b, rad, col, sp = SP.shape) => { PB.l.to(t, l, sp); PB.t.to(t, tp, sp); PB.r.to(t, r, sp); PB.b.to(t, b, sp); PB.rad.to(t, rad, sp); PB.col.to(t, col, SP.soft); };
    const bodyPress = [];
    draws.push((t) => {
      const l = PB.l.at(t), tp = PB.t.at(t), r = PB.r.at(t), b = PB.b.at(t);
      rect(body, l, tp, r - l, b - tp);
      body.style.borderRadius = Math.min(PB.rad.at(t), (r - l) / 2, (b - tp) / 2).toFixed(2) + 'px';
      body.style.background = PB.col.at(t);
      let s = popS(t, 0, 0.2); for (const tc of bodyPress) s *= 1 - 0.05 * Math.exp(-(((t - tc) / 0.08) ** 2));
      body.style.transform = `scale(${s.toFixed(4)})`;
      body.style.boxShadow = `0 50px 110px -30px rgba(0,0,0,.8), inset 0 0 0 ${(2 * PB.bor.at(t)).toFixed(2)}px rgba(242,237,213,.14)`;
    });
    // intro pill content
    const pillC = add(`<div style="position:absolute;display:flex;align-items:center;gap:14px;white-space:nowrap;font:600 26px/1 'JetBrains Mono';color:#c9cdb9;letter-spacing:.04em">
      ${ico('nosig', 32, C.sos)}Tanpa sinyal · 0 bar</div>`, world);
    draws.push((t) => {
      const v = vis(t, 0.25, 3.375);
      const w = pillC.offsetWidth;
      at(pillC, 200 - w / 2, 560 - 16);
      applyVis(pillC, v, `scale(${(1 + 0.05 * Math.exp(-(((t - 1.0) / 0.08) ** 2)) + 0.05 * Math.exp(-(((t - 2.5) / 0.08) ** 2))).toFixed(3)})`);
    });
    cue(0, 'born'); cue(0.25, 'pop'); cue(1.0, 'tick'); cue(2.5, 'tick');
    pm(3.5, -12, -12, 412, 878, 56, '#0b0f0d');
    cue(3.5, 'whoosh', { v: 0.7 }); cue(3.75, 'settle');
    // iPhone morph: platform factor
    const PF = new Track(0);
    PF.to(61.5, 1, SP.shape); PF.to(64.0, 0, SP.shape); PF.to(65.0, 1, SP.shape);
    draws.push((t) => { if (t > 60 && t < 66) { const p = PF.at(t); body.style.borderRadius = lerp(56, 64, p).toFixed(1) + 'px'; body.style.background = M.mix('#0b0f0d', '#2b2f2d', clamp(p)); } });
    // outro: the phone becomes the logo disc
    pm(66.0, 60, 133, 340, 413, 140, C.cream, { w: 18, z: 0.8 });

    // ───────────────────────── Screen ─────────────────────────
    const scr = add('<div id="scr"></div>', world);
    const s = (html) => add(html, scr);
    draws.push((t) => fade(scr, t, 3.75, 65.875, 0.2));

    // status bar + old header bar
    const hb = s(`<div style="left:0;top:0;width:400px;height:104px;background:${C.moss};z-index:1"></div>`);
    const oldTitle = s(`<div style="left:18px;top:52px;z-index:2;display:flex;align-items:center;gap:10px;color:#fff;font:800 19px/1 'Plus Jakarta Sans'">Saling Jaga
      <span style="font:600 11px/1 'JetBrains Mono';padding:5px 8px;border-radius:99px;background:rgba(255,255,255,.14);letter-spacing:.04em">TANPA SINYAL</span></div>`);
    show(oldTitle, 4.0, 11.875);
    const sb = s(`<div style="left:0;top:0;width:400px;height:36px;background:${C.moss};z-index:30;color:#fff;font:700 13px/1 'Plus Jakarta Sans'">
      <span style="position:absolute;left:24px;top:13px">18:04</span>
      <span style="position:absolute;right:22px;top:10px;display:flex;gap:6px;align-items:center">${ico('nosig', 16, '#fff')}${ico('bat', 18, '#fff')}</span></div>`);
    const hole = s(`<div style="z-index:31;background:#05080a"></div>`);
    draws.push((t) => { const p = clamp(PF.at(t), -0.1, 1.1); const w = lerp(13, 104, p), h = lerp(13, 30, p); rect(hole, 200 - w / 2, lerp(11.5, 6, p), w, h); hole.style.borderRadius = (h / 2) + 'px'; });
    const homeBar = s(`<div style="z-index:31;background:#1c2a21;height:4px;border-radius:2px;top:859px"></div>`);
    draws.push((t) => { const w = lerp(96, 130, clamp(PF.at(t))); homeBar.style.left = (200 - w / 2) + 'px'; homeBar.style.width = w + 'px'; });

    // ── chat viewport ──
    const VT = new Track(340), VB = new Track(612);
    const vp = s('<div style="left:0;width:400px;overflow:hidden;z-index:2"></div>');
    const col = add('<div style="position:absolute;left:0;right:0;bottom:8px;padding:0 12px"></div>', vp);
    draws.push((t) => { const a = VT.at(t), b = VB.at(t); vp.style.top = a + 'px'; vp.style.height = Math.max(0, b - a) + 'px'; });
    const wave = (n, h, colr, seed) => `<span style="display:inline-flex;align-items:center;gap:2.5px;height:${h}px">${Array.from({ length: n }, (_, i) => `<i style="display:block;width:3px;border-radius:2px;background:${colr};height:${Math.round(h * (0.25 + 0.75 * Math.abs(Math.sin(i * 1.7 + seed) * Math.cos(i * 0.6))))}px"></i>`).join('')}</span>`;
    const msgs = [
      { k: 'pill', x: 'Budi bergabung' }, { k: 'pill', x: 'Sari bergabung' }, { k: 'pill', x: 'Pak RT bergabung' },
      { k: 'me', x: 'Oke, aku menuju ke sana lewat gang belakang.', tm: '18:01' },
      { k: 'o', n: 'Budi', c: C.budi, x: 'Aku sudah di masjid, aman. Air mulai naik di jalan utama.', tm: '18:02' },
      { k: 'ann', x: 'Titik kumpul pindah ke lapangan SD 2. Bawa obat dan air minum.' },
      { k: 'o', n: 'Sari', c: C.sari, x: 'Kakiku terkilir, ada yang bisa jemput?', tm: '18:03', tin: 17.0 },
      { k: 'o', n: 'Budi', c: C.budi, x: 'Aku jaga masjid dulu. Siapa yang dekat Sari?', tm: '18:03', tin: 19.0 },
      { k: 'pill', x: '<b style="color:#e03131">Sari mengirim SOS</b>', tin: 22.5 },
      { k: 'o', n: 'Pak RT', c: C.rt, x: 'SOS Sari masuk. Siapa yang paling dekat?', tm: '18:04', tin: 26.0 },
      { k: 'voice', tin: 41.0 },
      { k: 'me', x: 'Aku jemput Sari.', tm: '18:05', tin: 44.5 },
      { k: 'o', n: 'Sari', c: C.sari, x: 'Terima kasih! Aku di depan warung.', tm: '18:05', tin: 63.0 },
    ];
    const bub = (m) => {
      if (m.k === 'pill') return `<div style="display:flex;justify-content:center"><div class="sp">${m.x}</div></div>`;
      if (m.k === 'me') return `<div style="display:flex;justify-content:flex-end"><div class="bm">${m.x}<div class="tm">${m.tm}</div></div></div>`;
      if (m.k === 'ann') return `<div class="an"><div class="nm">PENGUMUMAN · PAK RT · 18:02</div>${m.x}</div>`;
      if (m.k === 'voice') return `<div style="display:flex;justify-content:flex-end"><div class="bm" style="display:flex;align-items:center;gap:10px;padding:9px 14px">
        <span class="ic" style="width:30px;height:30px;border-radius:50%;background:#fff;color:#1f7a45;padding:8px 7px 8px 9px">${I.play}</span>${wave(20, 22, 'rgba(255,255,255,.85)', 1)}<span style="font:600 12px/1 'Plus Jakarta Sans'">0:02</span></div></div>`;
      return `<div style="display:flex"><div class="bo"><div class="nm" style="color:${m.c}">${m.n}</div>${m.x}<div class="tm">${m.tm}</div></div></div>`;
    };
    msgs.forEach((m) => {
      const w = add(`<div style="position:relative"></div>`, col);
      const c = add(`<div style="position:absolute;left:0;right:0;top:0">${bub(m)}</div>`, w);
      const h = c.offsetHeight + 8;
      const tin = m.tin ?? -1;
      draws.push((t) => {
        const g = tin < 0 ? 1 : clamp(stepR(t - tin, { w: 22, z: 1 }));
        w.style.height = (h * g).toFixed(2) + 'px';
        if (tin < 0) return;
        applyVis(c, vis(t, tin, null), `scale(${popS(t, tin, 0.85).toFixed(3)})`);
        c.style.transformOrigin = m.k === 'me' || m.k === 'voice' ? '100% 100%' : '0 100%';
      });
      if (tin > 0) cue(tin, 'pop');
    });

    // ── old group card → new header (the G shape) ──
    const G = { x: new Track(10), y: new Track(112), w: new Track(380), h: new Track(112), r: new Track(18), col: new ColorTrack('#ffffff'), bor: new Track(1) };
    const g = s('<div style="z-index:6;overflow:hidden"></div>');
    const avs = [['B', C.budi], ['S', C.sari], ['P', C.rt], ['R', C.rina], ['J', C.joko], ['C', C.you]];
    const gOld = add(`<div style="position:absolute;left:14px;top:13px;width:352px">
      <div style="display:flex;justify-content:space-between;align-items:center;font:800 16px/1 'Plus Jakarta Sans';color:${C.ink}">Grup · 6 orang
        <span style="font:600 11px/1 'Plus Jakarta Sans';color:#1e7a45;background:#e3f4e8;padding:5px 9px;border-radius:99px">6 terhubung</span></div>
      <div style="display:flex;gap:6px;margin-top:10px">${avs.map(([l, c]) => `<div class="av" style="width:32px;height:32px;background:${c};font-size:13px">${l}</div>`).join('')}</div>
      <div style="display:flex;align-items:center;gap:7px;margin-top:10px;font:700 13px/1 'Plus Jakarta Sans';color:#1e7a45">${ico('speak', 16)}Budi sedang bicara…</div></div>`, g);
    const gNew = add(`<div style="position:absolute;left:0;top:0;width:400px;height:72px">
      <div class="av" style="position:absolute;left:12px;top:12px;width:48px;height:48px;background:#f2edd5;overflow:hidden"><img src="assets/mark.png" style="width:44px;height:43px"></div>
      <div style="position:absolute;left:72px;top:15px;font:800 18px/1 'Plus Jakarta Sans';color:#fff">Grup · 6 orang</div>
      <div style="position:absolute;left:72px;top:41px;font:500 13px/1 'Plus Jakarta Sans';color:rgba(255,255,255,.78)">Budi, Sari, Pak RT, +2</div>
      <div style="position:absolute;left:316px;top:22px">${ico('gear', 28, '#fff')}</div>
      <div class="av" style="position:absolute;left:350px;top:16px;width:40px;height:40px;background:${C.you};font-size:17px">C</div></div>`, g);
    G.x.to(12.0, 0, SP.shape); G.y.to(12.0, 36, SP.shape); G.w.to(12.0, 400, SP.shape); G.h.to(12.0, 72, SP.shape); G.r.to(12.0, 0, SP.shape);
    G.col.to(12.0, C.moss, SP.soft); G.bor.to(12.0, 0, SP.soft);
    draws.push((t) => {
      rect(g, G.x.at(t), G.y.at(t), G.w.at(t), G.h.at(t));
      g.style.borderRadius = Math.max(0, G.r.at(t)).toFixed(2) + 'px'; g.style.background = G.col.at(t);
      g.style.boxShadow = `inset 0 0 0 ${clamp(G.bor.at(t)).toFixed(2)}px ${C.line}`;
      g.style.transform = `scale(${(popS(t, 4.5, 0.6) * press(t, 46.0)).toFixed(4)})`;
      fade(g, t, 4.5, null);
    });
    show(gOld, 4.625, 11.875); show(gNew, 12.25, null);
    cue(4.5, 'pop');

    // ── old button rows → collapse into + ──
    const chipsDef = [['SOS', 'sos', C.sos, '#fff'], ['Sirine', 'siren'], ['Senter', 'torch'], ['Kompas', 'compass'], ['Cari keluarga', 'family'], ['Titik kumpul', 'flag']];
    chipsDef.forEach(([lab, ic, bg, fg], i) => {
      const cx0 = 12 + (i % 3) * 126 + 59, cy0 = 232 + Math.floor(i / 3) * 54 + 24;
      const e = s(`<div style="z-index:5;width:118px;height:48px;margin:-24px 0 0 -59px;border-radius:14px;display:flex;align-items:center;justify-content:center;gap:6px;
        background:${bg || '#fff'};color:${fg || C.ink};box-shadow:inset 0 0 0 1px ${bg ? 'transparent' : C.line};font:700 12.5px/1 'Plus Jakarta Sans';white-space:nowrap">${ic === 'sos' ? '' : ico(ic, 17)}${lab}</div>`);
      const X = new Track(cx0).to(12.0, 92, { w: 15, z: 0.95 }), Y = new Track(cy0).to(12.0, 828, { w: 15, z: 0.95 }), S = new Track(1).to(12.0, 0.12, { w: 15, z: 1 });
      const tin = 5.0 + i * 0.125;
      cue(tin, 'pop', { n: i });
      draws.push((t) => {
        at(e, X.at(t), Y.at(t));
        const v = vis(t, tin, 12.25, 0.2);
        applyVis(e, { ...v, dy: 0 }, `scale(${(S.at(t) * popS(t, tin, 0.6)).toFixed(3)})`);
      });
    });

    // ── old bottom panel ──
    const OB = new Track(618); OB.to(12.0, 804, SP.shape);
    const obEl = s(`<div style="z-index:3;left:0;width:400px;background:#fff;border-top:1px solid ${C.line}"></div>`);
    draws.push((t) => { const tp = OB.at(t); obEl.style.top = tp + 'px'; obEl.style.height = (866 - tp) + 'px'; obEl.style.background = M.mix('#ffffff', '#f6f4ea', clamp(stepR(t - 12.0, SP.soft))); });
    const talkLbl = s(`<div style="z-index:4;left:0;width:400px;top:794px;text-align:center;font:700 14px/1 'Plus Jakarta Sans';color:${C.grey}">Tahan untuk bicara</div>`);
    show(talkLbl, 6.25, 11.875);

    // ── talk disc → green button (mic / send) ──
    const TK = { x: new Track(200), y: new Track(706), d: new Track(140) };
    TK.x.to(12.0, 362, SP.shape); TK.y.to(12.0, 828, SP.shape); TK.d.to(12.0, 48, SP.shape);
    const tk = s(`<div style="z-index:8;border-radius:50%;background:${C.appg};color:#fff"></div>`);
    const tkR = add(`<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center"><span class="ic" style="width:46%;height:46%">${I.radio}</span></div>`, tk);
    const tkS = add(`<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center"><span class="ic" style="width:44%;height:44%;margin-left:-2px">${I.send}</span></div>`, tk);
    const rings = [0, 1, 2].map(() => s(`<div style="z-index:7;border-radius:50%;border:3px solid ${C.appg}"></div>`));
    const hold = (t) => stepR(t - 39.0, SP.pop) - stepR(t - 41.0, SP.pop);
    draws.push((t) => {
      const d = TK.d.at(t), x = TK.x.at(t), y = TK.y.at(t);
      rect(tk, x - d / 2, y - d / 2, d, d);
      const sc = popS(t, 6.0, 0.4) * (1 + 0.22 * hold(t)) * press(t, 44.5);
      tk.style.transform = `scale(${sc.toFixed(4)})`;
      fade(tk, t, 6.0, null);
      // mic → send while typing (42.0) and back after send (44.75)
      applyVis(tkR, t < 44.75 ? vis(t, -1, 41.875, 0.12) : vis(t, 44.75, null));
      applyVis(tkS, vis(t, 42.0, 44.625));
      // speaking rings (old: Budi talking) and recording rings (hold)
      rings.forEach((r, i) => {
        let o = 0, k = 1;
        if (t > 6.5 && t < 11.9) { const ph = ((t - 6.5 + i / 3) % 1); k = 1 + ph * 0.5; o = 0.45 * (1 - ph) * clamp((11.9 - t) * 4); }
        if (t > 39.0 && t < 41.3) { const ph = ((t - 39.0 + i / 3) % 1); k = 1.4 + ph * 0.9; o = 0.5 * (1 - ph) * clamp((41.2 - t) * 5); }
        r.style.opacity = o.toFixed(3); r.style.visibility = o > 0.005 ? 'visible' : 'hidden';
        rect(r, x - d / 2, y - d / 2, d, d); r.style.transform = `scale(${k.toFixed(3)})`;
      });
    });
    cue(6.0, 'born');

    // ── new bottom bar ──
    const sosB = s(`<div class="av" style="z-index:8;left:12px;top:804px;width:48px;height:48px;background:${C.sos};font:800 13px/1 'Plus Jakarta Sans'">SOS</div>`);
    show(sosB, 12.25, null, (t) => `scale(${popS(t, 12.25, 0.4).toFixed(3)})`);
    const inp = s(`<div style="z-index:6;left:68px;top:804px;width:262px;height:48px;border-radius:24px;background:#fff;box-shadow:inset 0 0 0 1px ${C.line}"></div>`);
    show(inp, 12.25, null, (t) => `scale(${(popS(t, 12.25, 0.7) * press(t, 41.5)).toFixed(3)})`);
    const inPlus = add(`<div style="position:absolute;left:12px;top:12px">${ico('plus', 24, C.ink)}</div>`, inp);
    const inCam = add(`<div style="position:absolute;right:14px;top:12px">${ico('cam', 24, C.grey)}</div>`, inp);
    const inPh = add(`<div style="position:absolute;left:46px;top:15px;font:500 16px/1 'Plus Jakarta Sans';color:#8d958a;white-space:nowrap">Ketik pesan</div>`, inp);
    const inTx = add(`<div style="position:absolute;left:46px;top:15px;font:500 16px/1 'Plus Jakarta Sans';color:${C.ink};white-space:nowrap"></div>`, inp);
    const inRec = add(`<div style="position:absolute;left:14px;top:0;height:48px;display:flex;align-items:center;gap:9px;white-space:nowrap">
      <i style="display:block;width:10px;height:10px;border-radius:50%;background:${C.sos}"></i><span class="t mono" style="font:700 14px/1 'JetBrains Mono';color:${C.ink}">0:00</span>
      <span class="w" style="display:inline-flex;align-items:center;gap:2.5px;height:26px">${Array.from({ length: 16 }, () => `<i style="display:block;width:3px;border-radius:2px;background:${C.appg}"></i>`).join('')}</span>
      <span style="font:600 12px/1 'Plus Jakarta Sans';color:${C.grey}">Merekam…</span></div>`, inp);
    const recT = inRec.querySelector('.t'), recBars = [...inRec.querySelector('.w').children];
    const typed = 'Aku jemput Sari.';
    const T0 = 42.0;
    for (let i = 0; i < typed.length; i++) cue(T0 + i * 0.125, 'key');
    draws.push((t) => {
      // plus/cam/placeholder hide while recording and while text is present
      const recV = vis(t, 39.0, 41.0, 0.12);
      applyVis(inRec, recV);
      const baseIn = 12.5;
      const vP = vis(t, baseIn, null);
      const oPC = vP.o * (t < 38.875 ? 1 : t < 41.25 ? vis(t, -1, 38.875, 0.12).o : clamp(stepR(t - 41.25, SP.text)));
      [inPlus, inCam].forEach((e) => { e.style.opacity = oPC.toFixed(3); });
      inPlus.style.transform = `scale(${press(t, 31.0).toFixed(3)})`;
      let oPh = oPC;
      if (t >= T0 - 0.125 && t < 44.5) oPh = vis(t, -1, T0 - 0.125, 0.12).o;
      if (t >= 44.5) oPh = stepR(t - 44.625, SP.text);
      inPh.style.opacity = oPh.toFixed(3);
      const n = clamp(Math.floor((t - T0) / 0.125) + 1, 0, typed.length);
      const sent = t >= 44.5;
      inTx.innerHTML = sent || t < T0 ? '' : typed.slice(0, n) + `<i style="display:inline-block;width:2px;height:18px;margin-left:1px;vertical-align:-3px;background:${C.appg};opacity:${(Math.floor(t * 4) % 2 ? 0.2 : 1)}"></i>`;
      if (t > 39 && t < 41.3) {
        recT.textContent = '0:0' + clamp(Math.floor(t - 39.0), 0, 2);
        recBars.forEach((b, i) => { b.style.height = (5 + 19 * Math.abs(Math.sin(t * 9 + i * 1.3) * Math.sin(t * 3.1 + i * 0.7))).toFixed(1) + 'px'; });
      }
    });

    // ── SOS: card → pinned row ──
    const SB = { x: new Track(24), y: new Track(250), w: new Track(352), h: new Track(300), r: new Track(26) };
    SB.x.to(24.0, 8, SP.shape); SB.y.to(24.0, 112, SP.shape); SB.w.to(24.0, 384, SP.shape); SB.h.to(24.0, 46, SP.shape); SB.r.to(24.0, 14, SP.shape);
    VT.to(12.0, 108, SP.shape); VB.to(12.0, 800, SP.shape);
    VT.to(24.0, 164, SP.shape);
    const sbEl = s(`<div style="z-index:12;background:${C.sosBg};overflow:hidden"></div>`);
    const sbBig = add(`<div style="position:absolute;left:0;top:0;width:352px;height:300px;display:flex;flex-direction:column;align-items:center;padding-top:24px">
      <div class="av" style="width:64px;height:64px;background:${C.sari};font-size:28px">S</div>
      <div style="margin-top:12px;font:800 30px/1 'Plus Jakarta Sans';color:${C.sos};letter-spacing:-.02em">SOS</div>
      <div style="margin-top:8px;font:800 19px/1.2 'Plus Jakarta Sans';color:${C.ink}">Sari minta tolong</div>
      <div style="margin-top:6px;font:500 13.5px/1.2 'Plus Jakarta Sans';color:${C.grey}">259 m ke arah barat laut · baterai 21%</div>
      <div style="margin-top:16px;padding:12px 22px;border-radius:99px;background:${C.sos};color:#fff;font:800 15px/1 'Plus Jakarta Sans'">Matikan alarm</div></div>`, sbEl);
    const sbRow = add(`<div style="position:absolute;left:0;top:0;width:384px;height:46px;display:flex;align-items:center;padding:0 7px;gap:9px;white-space:nowrap">
      <div class="av" style="width:32px;height:32px;background:${C.sari};font-size:14px">S</div>
      <div style="font:800 14px/1 'Plus Jakarta Sans';color:${C.sos};flex:1">SOS · Sari · <span style="font-weight:600;color:${C.ink}">259 m barat laut</span></div>
      <div style="padding:8px 12px;border-radius:99px;background:${C.sos};color:#fff;font:800 12px/1 'Plus Jakarta Sans'">Matikan</div></div>`, sbEl);
    const sosFlash = s(`<div style="z-index:11;left:0;top:0;width:400px;height:866px;background:${C.sos}"></div>`);
    draws.push((t) => {
      rect(sbEl, SB.x.at(t), SB.y.at(t), SB.w.at(t), SB.h.at(t));
      sbEl.style.borderRadius = SB.r.at(t).toFixed(2) + 'px';
      // pulses every beat: stays loud
      let pulse = 0; for (let k = 0; k < 16; k++) { const d = t - (22.0 + k * 0.5); if (d > 0 && d < 0.5) pulse = Math.max(pulse, Math.exp(-d * 6)); }
      sbEl.style.boxShadow = `inset 0 0 0 ${(2 + 2 * pulse).toFixed(2)}px ${C.sos}, 0 ${t < 24 ? 30 : 6}px ${t < 24 ? 60 : 16}px -12px rgba(224,49,49,${(0.35 + 0.35 * pulse).toFixed(2)})`;
      fade(sbEl, t, 22.0, null);
      sbEl.style.transform = `scale(${popS(t, 22.0, 0.6).toFixed(3)})`;
      applyVis(sbBig, vis(t, 22.125, 23.875));
      applyVis(sbRow, vis(t, 24.25, null));
      const fl = (t > 22 && t < 24) ? 0.16 * (Math.exp(-((t - 22.0) % 0.5) * 7)) * clamp((24 - t) * 3) : 0;
      sosFlash.style.opacity = fl.toFixed(3); sosFlash.style.visibility = fl > 0.003 ? 'visible' : 'hidden';
      let rd = 0; if (t > 21.9 && t < 25) rd = (t < 22 ? 0 : 1) * (0.55 + 0.45 * Math.exp(-((t - 22) % 0.5) * 5)) * clamp((24.5 - t) * 1.5);
      redL.style.opacity = clamp(rd).toFixed(3);
    });
    shakes.push(22.0, 23.0);
    cue(21.0, 'riser', { d: 1 }); cue(22.0, 'alert'); cue(22.0, 'slam', { n: 0 }); cue(23.0, 'alert');
    cue(24.0, 'swap', { n: 1 }); cue(24.0, 'whoosh', { v: 0.5 }); cue(24.25, 'settle');

    // ── + sheet ──
    const scrim = s(`<div style="z-index:13;left:0;top:0;width:400px;height:866px;background:#0b130e"></div>`);
    const PS = { x: new Track(80), y: new Track(816), w: new Track(24), h: new Track(24), r: new Track(12) };
    [[31.0, 0, 470, 400, 396, 28], [36.5, 80, 816, 24, 24, 12]].forEach(([tt, x, y, w, h, r]) => { PS.x.to(tt, x, SP.shape); PS.y.to(tt, y, SP.shape); PS.w.to(tt, w, SP.shape); PS.h.to(tt, h, SP.shape); PS.r.to(tt, r, SP.shape); });
    const ps = s(`<div style="z-index:14;background:#fff;overflow:hidden"></div>`);
    const tiles = [['Sirine', 'siren'], ['Senter', 'torch'], ['Cari keluarga', 'family'], ['Kompas', 'compass'], ['Titik kumpul', 'flag'], ['Pengumuman', 'mega'], ['Absen', 'list'], ['Kartu medis', 'med'], ['Panduan P3K', 'book']];
    const psIn = add(`<div style="position:absolute;left:0;top:0;width:400px;height:396px">
      <i style="position:absolute;left:180px;top:9px;width:40px;height:5px;border-radius:3px;background:#d8d6cb"></i>
      <div style="position:absolute;left:16px;top:26px;font:800 17px/1 'Plus Jakarta Sans';color:${C.ink}">Fitur darurat</div></div>`, ps);
    show(psIn, 31.25, 36.375);
    tiles.forEach(([lab, ic], i) => {
      const x = 12 + (i % 3) * 126, y = 58 + Math.floor(i / 3) * 106;
      const e = add(`<div style="position:absolute;left:${x}px;top:${y}px;width:116px;height:96px;border-radius:16px;background:#f3f1e7;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:9px;
        font:700 13px/1.15 'Plus Jakarta Sans';color:${C.ink};text-align:center">${ico(ic, 30, i === 0 ? C.sos : C.appg)}<span>${lab}</span></div>`, ps);
      const tin = 31.5 + i * 0.125;
      cue(tin, 'pop', { n: i % 5 });
      const hov = i === 0 ? 33.0 : i === 2 ? 34.0 : i === 7 ? 35.0 : null;
      draws.push((t) => {
        let sc = popS(t, tin, 0.6);
        let ring = 0;
        if (hov != null) { ring = stepR(t - hov, SP.pop) - stepR(t - hov - 0.75, SP.soft); sc *= 1 + 0.06 * ring; }
        e.style.boxShadow = `inset 0 0 0 ${(2.5 * clamp(ring)).toFixed(2)}px ${i === 0 ? C.sos : C.appg}`;
        applyVis(e, vis(t, tin, 36.375), `scale(${sc.toFixed(3)})`);
      });
      if (hov != null) cue(hov, 'tick');
    });
    draws.push((t) => {
      rect(ps, PS.x.at(t), PS.y.at(t), PS.w.at(t), PS.h.at(t));
      ps.style.borderRadius = Math.max(0, PS.r.at(t)).toFixed(2) + 'px';
      const on = t >= 30.98 && t < 36.9;
      ps.style.visibility = on ? 'visible' : 'hidden';
      ps.style.opacity = on ? clamp(Math.min((t - 30.98) * 12, (36.9 - t) * 8)).toFixed(3) : 0;
      const sc = (stepR(t - 31.0, SP.soft) - stepR(t - 36.5, SP.soft)) * 0.42;
      scrim.style.opacity = clamp(sc).toFixed(3); scrim.style.visibility = sc > 0.003 ? 'visible' : 'hidden';
    });
    cue(31.0, 'whoosh', { v: 0.5 }); cue(36.5, 'whoosh', { v: 0.4 }); cue(37.0, 'settle');

    // ── members panel (header grows) ──
    const MP = new Track(72); MP.to(46.0, 830, SP.shape); MP.to(52.0, 72, SP.shape);
    const mp = s(`<div style="z-index:16;left:0;top:36px;width:400px;background:#f6f4ea;overflow:hidden"></div>`);
    add(`<div style="position:absolute;left:0;top:0;width:400px;height:72px;background:${C.moss}"></div>`, mp);
    const mpTop = add(`<div style="position:absolute;left:0;top:0;width:400px;height:72px">
      <div style="position:absolute;left:14px;top:23px">${ico('back', 26, '#fff')}</div>
      <div style="position:absolute;left:54px;top:15px;font:800 18px/1 'Plus Jakarta Sans';color:#fff">Grup · 6 orang</div>
      <div style="position:absolute;left:54px;top:41px;font:500 13px/1 'Plus Jakarta Sans';color:rgba(255,255,255,.78)">Siapa aman, siapa butuh bantuan</div></div>`, mp);
    show(mpTop, 46.25, 51.875);
    const sumRow = add(`<div style="position:absolute;left:14px;top:86px;display:flex;gap:8px">
      <span style="display:flex;align-items:center;gap:6px;padding:8px 13px;border-radius:99px;background:#e3f4e8;color:#1e7a45;font:800 13.5px/1 'Plus Jakarta Sans'">${ico('check', 14)}4 aman</span>
      <span style="display:flex;align-items:center;gap:6px;padding:8px 13px;border-radius:99px;background:${C.sosBg};color:${C.sos};font:800 13.5px/1 'Plus Jakarta Sans'"><i style="width:8px;height:8px;border-radius:50%;background:${C.sos}"></i>2 butuh bantuan</span></div>`, mp);
    show(sumRow, 48.5, 51.875);
    cue(48.5, 'check');
    const rows = [
      ['C', C.you, 'Kamu', 'Di sini', 1], ['B', C.budi, 'Budi', '252 m utara', 1], ['P', C.rt, 'Pak RT', '470 m tenggara', 1],
      ['S', C.sari, 'Sari', 'SOS · 259 m barat laut', 0], null,
      ['R', C.rina, 'Rina', 'lewat HP Budi', 1], ['J', C.joko, 'Pak Joko', 'lewat HP Budi', 0],
    ];
    let ry = 132;
    rows.forEach((r, i) => {
      const tin = 46.5 + i * 0.25;
      if (!r) {
        const e = add(`<div style="position:absolute;left:14px;top:${ry + 10}px;width:372px;display:flex;align-items:center;gap:8px;font:800 11.5px/1 'JetBrains Mono';letter-spacing:.06em;color:#1e7a45">${ico('bridge', 20)}DI SEBERANG JEMBATAN · LEWAT HP BUDI</div>`, mp);
        show(e, tin, 51.875); cue(tin, 'swap', { n: 3 });
        const box = add(`<div style="position:absolute;left:8px;top:${ry + 2}px;width:384px;height:158px;border-radius:16px"></div>`, mp);
        draws.push((t) => { const k = clamp(stepR(t - 49.5, SP.pop)) * (1 - clamp((t - 51.875) / 0.12)); box.style.boxShadow = `inset 0 0 0 ${(2.5 * k).toFixed(2)}px ${C.leaf}`; box.style.background = `rgba(60,191,110,${(0.08 * k).toFixed(3)})`; });
        ry += 36; return;
      }
      const [l, c, n, d, ok] = r;
      const e = add(`<div style="position:absolute;left:8px;top:${ry}px;width:384px;height:58px;display:flex;align-items:center;gap:12px;padding:0 8px;white-space:nowrap">
        <div class="av" style="width:40px;height:40px;background:${c};font-size:16px">${l}</div>
        <div style="flex:1;min-width:0"><div style="font:800 15.5px/1 'Plus Jakarta Sans';color:${C.ink}">${n}</div>
          <div style="margin-top:6px;font:500 12.5px/1 'Plus Jakarta Sans';color:${ok ? C.grey : C.sos};overflow:hidden;text-overflow:ellipsis">${d}</div></div>
        <span style="padding:7px 11px;border-radius:99px;font:800 12px/1 'Plus Jakarta Sans';background:${ok ? '#e3f4e8' : C.sos};color:${ok ? '#1e7a45' : '#fff'}">${ok ? 'Aman' : 'Butuh bantuan'}</span></div>`, mp);
      show(e, tin, 51.875);
      cue(tin, ok ? 'pop' : 'note', { n: ok ? i : 5 });
      ry += 60;
    });
    cue(49.5, 'shimmer');
    draws.push((t) => {
      const h = MP.at(t); mp.style.height = h + 'px';
      const on = t >= 45.99 && t < 52.7; mp.style.visibility = on ? 'visible' : 'hidden';
    });
    cue(46.0, 'whoosh', { v: 0.45 }); cue(52.0, 'whoosh', { v: 0.4 }); cue(52.5, 'settle');

    // ── settings sheet (gear grows) ──
    const SS = { x: new Track(316), y: new Track(58), w: new Track(28), h: new Track(28), r: new Track(14) };
    [[53.5, 0, 36, 400, 830, 0], [58.5, 356, 50, 28, 28, 14]].forEach(([tt, x, y, w, h, r]) => { SS.x.to(tt, x, SP.shape); SS.y.to(tt, y, SP.shape); SS.w.to(tt, w, SP.shape); SS.h.to(tt, h, SP.shape); SS.r.to(tt, r, SP.shape); });
    const ss = s(`<div style="z-index:17;background:#f6f4ea;overflow:hidden"></div>`);
    const ssTop = add(`<div style="position:absolute;left:0;top:0;width:400px;height:64px">
      <div style="position:absolute;left:18px;top:22px;font:800 21px/1 'Plus Jakarta Sans';color:${C.ink}">Pengaturan</div>
      <div class="xb" style="position:absolute;left:348px;top:14px;width:38px;height:38px;border-radius:50%;background:#e9e7dc;display:flex;align-items:center;justify-content:center">${ico('x', 20, C.ink)}</div></div>`, ss);
    show(ssTop, 53.75, 58.375);
    const xb = ssTop.querySelector('.xb');
    draws.push((t) => { xb.style.transform = `scale(${(press(t, 58.5) * (1 + 0.1 * (stepR(t - 58.0, SP.pop) - stepR(t - 58.6, SP.pop)))).toFixed(3)})`; });
    const groups = [
      ['Keselamatan', [['Kartu medis', 'chev'], ['SOS lewat 5× tombol volume', 'on'], ['SOS + SMS', 'on']]],
      ['Koneksi dan baterai', [['Sambung ulang otomatis', 'on'], ['Mode hemat baterai', 'flip'], ['Gerbang LoRa Meshtastic', 'chev']]],
      ['Aplikasi', [['Bahasa', 'chev', 'Indonesia'], ['Mode lansia (tombol besar)', 'off'], ['Riwayat chat tersimpan', 'on']]],
    ];
    const FLIP = 56.5;
    groups.forEach(([gn, items], k) => {
      const gy = 72 + k * 178, tin = 54.0 + k * 0.5;
      const hd = add(`<div style="position:absolute;left:20px;top:${gy}px;font:800 12px/1 'JetBrains Mono';letter-spacing:.1em;color:#1e7a45;text-transform:uppercase">${gn}</div>`, ss);
      show(hd, tin, 58.375); cue(tin, 'slam', { n: k });
      const card = add(`<div style="position:absolute;left:12px;top:${gy + 22}px;width:376px;height:138px;border-radius:16px;background:#fff;box-shadow:inset 0 0 0 1px ${C.line}"></div>`, ss);
      show(card, tin + 0.0625, 58.375, (t) => `scale(${popS(t, tin, 0.85).toFixed(3)})`);
      items.forEach(([lab, kind, val], j) => {
        const r = add(`<div style="position:absolute;left:0;top:${j * 46}px;width:376px;height:46px;display:flex;align-items:center;padding:0 14px;gap:10px;${j ? `border-top:1px solid ${C.line}` : ''}">
          <div style="flex:1;font:600 14.5px/1 'Plus Jakarta Sans';color:${C.ink};white-space:nowrap">${lab}</div>
          ${kind === 'chev' ? `<span style="font:500 13px/1 'Plus Jakarta Sans';color:${C.grey}">${val || ''}</span>${ico('chev', 18, C.grey)}` :
            `<div class="tg" style="position:relative;width:42px;height:26px;border-radius:13px"><i style="position:absolute;top:3px;height:20px;border-radius:10px;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.25)"></i></div>`}</div>`, card);
        show(r, tin + 0.125 + j * 0.0625, 58.375);
        const tg = r.querySelector('.tg');
        if (tg) {
          const kn = tg.querySelector('i');
          const on0 = kind === 'on' ? 1 : 0;
          const Lk = new Track(on0 ? 19 : 3), Rk = new Track(on0 ? 39 : 23);
          if (kind === 'flip') { Lk.to(FLIP, 19, { w: 16, z: 0.9 }); Rk.to(FLIP, 39, { w: 32, z: 0.9 }); }
          draws.push((t) => {
            const a = Lk.at(t), b = Rk.at(t); kn.style.left = a + 'px'; kn.style.width = (b - a) + 'px';
            const p = kind === 'flip' ? clamp(stepR(t - FLIP, SP.soft)) : on0;
            tg.style.background = M.mix('#cfcdc2', '#1f7a45', p);
          });
        }
      });
    });
    draws.push((t) => {
      rect(ss, SS.x.at(t), SS.y.at(t), SS.w.at(t), SS.h.at(t));
      ss.style.borderRadius = Math.max(0, SS.r.at(t)).toFixed(2) + 'px';
      const on = t >= 53.49 && t < 59.0; ss.style.visibility = on ? 'visible' : 'hidden';
      ss.style.opacity = on ? clamp(Math.min((t - 53.49) * 14, (59.0 - t) * 6)).toFixed(3) : 0;
    });
    cue(53.5, 'whoosh', { v: 0.45 }); cue(FLIP, 'toggle'); cue(58.5, 'whoosh', { v: 0.4 }); cue(59.0, 'settle');

    // ───────────────────────── World-space notes (right of the phone) ─────────────────────────
    const note = (y1, y2, txt, col, tin, tout, n) => {
      const e = add(`<div style="left:426px;top:${y1}px;height:${y2 - y1}px;width:260px">
        <i style="position:absolute;left:0;top:0;bottom:0;width:3px;border-radius:2px;background:${col}"></i>
        <i style="position:absolute;left:0;top:0;width:12px;height:3px;background:${col}"></i><i style="position:absolute;left:0;bottom:0;width:12px;height:3px;background:${col}"></i>
        <div class="note" style="position:absolute;left:20px;top:50%;margin-top:-10px;color:${col}">${txt}</div></div>`, world);
      show(e, tin, tout); if (n != null) cue(tin, 'note', { n });
      return e;
    };
    note(112, 224, 'Kartu grup', '#ff8a8a', 8.0, 11.875, 0);
    note(232, 336, 'Deretan tombol', '#ff8a8a', 8.5, 11.875, 1);
    note(618, 858, 'Tombol bicara', '#ff8a8a', 9.0, 11.875, 2);
    note(344, 610, 'Chat terjepit', C.muted, 10.5, 11.875, 3);
    note(36, 108, 'Nama grup & anggota', C.leaf, 14.0, 17.375, 0);
    note(116, 796, 'Chat lega di tengah', C.leaf, 14.5, 17.375, 2);
    note(804, 852, 'Satu baris tombol', C.leaf, 15.0, 17.375, 4);
    // red tint over the old controls + tag
    [[10, 112, 380, 112], [10, 230, 380, 108], [0, 618, 400, 248]].forEach(([x, y, w, h]) => {
      const e = s(`<div style="z-index:9;left:${x}px;top:${y}px;width:${w}px;height:${h}px;border-radius:16px;background:rgba(224,49,49,.16);box-shadow:inset 0 0 0 2px rgba(224,49,49,.7)"></div>`);
      draws.push((t) => fade(e, t, 9.5, 11.75, 0.2));
    });
    const tag = s(`<div style="z-index:10;left:0;width:400px;top:322px;display:flex;justify-content:center"><span style="padding:9px 16px;border-radius:99px;background:${C.sos};color:#fff;font:800 15px/1 'Plus Jakarta Sans'">Hampir separuh layar</span></div>`);
    show(tag, 9.5, 11.75, (t) => `scale(${popS(t, 9.5, 0.6).toFixed(3)})`);
    cue(9.5, 'slam', { n: 1 }); cue(11.0, 'riser', { d: 1 });
    cue(12.0, 'drop'); cue(12.0, 'whoosh', { v: 0.8 }); cue(12.25, 'pop', { n: 2 }); cue(12.5, 'settle');

    // ───────────────────────── Headlines (HUD, left column) ─────────────────────────
    const intro = [
      ['Saat bencana,', 0.5, 250, "font:800 104px/1 'Plus Jakarta Sans';letter-spacing:-.04em"],
      ['tidak ada waktu', 1.5, 372, "font:800 84px/1 'Plus Jakarta Sans';letter-spacing:-.035em;color:#c9cdb9"],
      ['untuk belajar <span class="serif" style="color:#3cbf6e;font-size:96px">aplikasi baru.</span>', 2.0, 472, "font:800 84px/1 'Plus Jakarta Sans';letter-spacing:-.035em;color:#c9cdb9"],
    ];
    intro.forEach(([h, tin, y, st], i) => {
      const e = at(add(`<div style="width:1920px;text-align:center;white-space:nowrap;${st}">${h}</div>`), 0, y);
      show(e, tin, 3.25, (t) => `scale(${popS(t, tin, 0.92).toFixed(3)})`);
      cue(tin, 'slam', { n: i });
    });
    cue(3.0, 'tick');
    const block = (tin, tout, lab, head, sub, subIn, n = 0, y0 = 300) => {
      const out = [];
      if (lab) { const l = at(add(`<div class="lbl">${lab}</div>`), 120, y0); show(l, tin, tout); out.push(l); }
      const h = at(add(`<div class="head">${head}</div>`), 120, y0 + 52); show(h, tin + 0.125, tout);
      if (sub) { const sb2 = at(add(`<div class="sub">${sub}</div>`), 120, y0 + 52 + h.offsetHeight + 28); show(sb2, subIn ?? tin + 1.0, tout); if (subIn) cue(subIn, 'tick'); }
      cue(tin, 'swap', { n });
      return h;
    };
    block(4.0, 11.875, 'Versi sebelumnya', 'Kartu grup, deretan tombol, dan tombol bicara.', 'Memakan hampir separuh layar.<br>Chat-nya sendiri terjepit.', 7.0, 0, 330);
    block(12.25, 21.875, 'Saling Jaga 0.45', 'Sekarang tampil seperti <span class="serif">grup chat</span> yang sudah kamu kenal.', 'Nama grup dan anggotanya di atas.<br>Chat lega di tengah.', 13.0, 1, 300);
    block(22.5, 29.875, 'SOS masuk', 'SOS disematkan <span class="serif">satu baris</span> di atas chat.', 'Tetap mencolok, tapi chat masih terbaca.', 25.0, 2, 330);
    block(30.0, 37.875, 'Satu tombol +', 'Semua fitur darurat, rapi di balik <span class="serif">satu tombol plus.</span>', 'Dari sirine sampai cari keluarga.', 32.0, 3, 330);
    block(38.0, 41.375, 'Tombol hijau', '<span class="serif">Tahan</span> untuk bicara.', 'Seperti merekam pesan suara.', 39.5, 4, 360);
    block(41.5, 44.875, null, 'Begitu kamu mengetik, jadi <span class="serif">tombol kirim.</span>', null, null, 5, 360);
    cue(45.0, 'tick');
    block(45.0, 52.875, 'Ketuk nama grup', 'Siapa yang <span class="serif">aman,</span> siapa yang butuh bantuan.', 'Termasuk anggota grup<br>di seberang jembatan.', 49.5, 0, 330);
    block(53.0, 59.875, 'Pengaturan', 'Dikelompokkan jadi <span class="serif">tiga.</span>', 'Keselamatan · Koneksi dan baterai · Aplikasi.<br>Tutup cukup dengan tombol X.', 55.5, 1, 330);
    block(60.0, 65.875, 'Android & iPhone', 'Tampilan yang sama juga ada di <span class="serif">iPhone.</span>', null, null, 2, 300);
    // segmented platform control
    const seg = at(add(`<div style="width:440px;height:84px;border-radius:42px;background:#13271d;box-shadow:inset 0 0 0 2px rgba(242,237,213,.12)">
      <i style="position:absolute;top:7px;height:70px;border-radius:35px;background:#3cbf6e"></i>
      <div style="position:absolute;left:0;top:0;width:220px;height:84px;display:flex;align-items:center;justify-content:center;font:800 30px/1 'Plus Jakarta Sans'">Android</div>
      <div style="position:absolute;left:220px;top:0;width:220px;height:84px;display:flex;align-items:center;justify-content:center;font:800 30px/1 'Plus Jakarta Sans'">iPhone</div></div>`), 120, 560);
    const segK = seg.querySelector('i'), segA = seg.children[1], segI = seg.children[2];
    const sL = new Track(7), sR = new Track(213);
    [[61.5, 1], [64.0, 0], [65.0, 1]].forEach(([tt, v]) => {
      const lead = { w: 30, z: 0.88 }, trail = { w: 15, z: 0.9 };
      if (v) { sR.to(tt, 433, lead); sL.to(tt, 227, trail); } else { sL.to(tt, 7, lead); sR.to(tt, 213, trail); }
      cue(tt, 'toggle'); cue(tt, 'swap', { n: v ? 3 : 1 });
    });
    show(seg, 60.5, 65.875, (t) => `scale(${(popS(t, 60.5, 0.8) * (1 - 0.03 * Math.exp(-(((t - 61.5) / 0.06) ** 2)) - 0.03 * Math.exp(-(((t - 64.0) / 0.06) ** 2)) - 0.03 * Math.exp(-(((t - 65.0) / 0.06) ** 2)))).toFixed(4)})`);
    cue(60.5, 'pop');
    draws.push((t) => {
      const a = sL.at(t), b = sR.at(t); segK.style.left = a + 'px'; segK.style.width = (b - a) + 'px';
      const p = clamp(PF.at(t));
      segA.style.color = M.mix('#04140a', '#a5b0a2', p); segI.style.color = M.mix('#a5b0a2', '#04140a', p);
    });

    // ───────────────────────── Outro ─────────────────────────
    const lg = add(`<img src="assets/mark.png" style="left:88px;top:162px;width:224px;height:218px">`, world);
    show(lg, 66.25, null, (t) => `scale(${popS(t, 66.25, 0.6).toFixed(3)})`);
    cue(66.0, 'whoosh', { v: 0.7 }); cue(66.25, 'slam', { n: 2 });
    const wm = at(add(`<div style="width:1920px;text-align:center;font:800 120px/1 'Plus Jakarta Sans';letter-spacing:-.045em;color:#f2edd5">Saling Jaga</div>`), 0, 580);
    show(wm, 66.75, null, (t) => `scale(${popS(t, 66.75, 0.9).toFixed(3)})`); cue(66.75, 'slam', { n: 3 });
    const ver = at(add(`<div style="width:1920px;display:flex;justify-content:center"><span style="font:700 30px/1 'JetBrains Mono';color:#04140a;background:#3cbf6e;padding:14px 26px;border-radius:99px;letter-spacing:.04em">versi 0.45</span></div>`), 0, 728);
    show(ver, 67.25, null, (t) => `scale(${popS(t, 67.25, 0.6).toFixed(3)})`); cue(67.25, 'pop', { n: 4 });
    const tg1 = at(add(`<div style="width:1920px;text-align:center;font:600 44px/1.2 'Plus Jakarta Sans';letter-spacing:-.02em;color:#c9cdb9">Tanpa internet, tanpa sinyal,</div>`), 0, 830);
    show(tg1, 68.0, null); cue(68.0, 'swap', { n: 2 });
    const tg2 = at(add(`<div style="width:1920px;text-align:center"><span class="serif" style="font-size:72px;color:#3cbf6e">tetap saling jaga.</span></div>`), 0, 888);
    show(tg2, 68.5, null); cue(68.5, 'cta'); cue(69.0, 'shimmer'); cue(70.0, 'note', { n: 4 }); cue(71.0, 'settle');

    // ───────────────────────── Cursor (screen space, follows the camera) ─────────────────────────
    const CU = { x: new Track(1700), y: new Track(1120) };
    const go = (t, x, y, sp = SP.cursor) => { CU.x.to(t, x, sp); CU.y.to(t, y, sp); };
    const goP = (t, lx, ly, tArr) => { const [x, y] = toS(lx, ly, tArr); go(t, x, y); };
    const cur = add(`<div class="cur"><svg viewBox="0 0 24 24"><path d="M4 2.5 20 11l-7 2-3.2 7z" fill="#f2edd5" stroke="#04140a" stroke-width="1.6" stroke-linejoin="round"/></svg><div class="pill">Kamu</div></div>`);
    const pill = cur.querySelector('.pill');
    const rip = add('<div class="rip"></div>');
    const clicks = [], holds = [[39.0, 41.0]];
    const wins = [[30.25, 37.5], [38.25, 45.25], [45.25, 59.25], [60.75, 65.5]];
    const click = (tc, lx, ly, k = 'click') => { const [x, y] = toS(lx, ly, tc); go(tc - 0.75, x, y); clicks.push(tc); cue(tc, k); return [x, y]; };
    go(30.0, 1720, 1000, SP.snap);
    click(31.0, 92, 828);
    goP(32.25, 70, 576, 33.0); goP(33.25, 322, 576, 34.0); goP(34.25, 196, 788, 35.0);
    click(36.5, 220, 330);
    go(37.25, 1760, 1060, SP.soft);
    go(38.0, 1760, 1060, SP.snap);
    goP(38.25, 362, 828, 39.0); cue(39.0, 'click'); cue(39.0, 'drag', { d: 2 }); cue(40.0, 'tick'); cue(41.0, 'tick'); cue(41.0, 'release');
    click(41.5, 210, 828);
    goP(42.25, 300, 880, 43.0);
    click(44.5, 362, 828);
    click(46.0, 140, 72);
    goP(46.75, 380, 420, 47.5);
    goP(48.5, 330, 120, 49.0);
    goP(49.25, 230, 500, 50.0);
    click(52.0, 28, 72);
    click(53.5, 330, 72);
    goP(54.5, 300, 600, 55.25);
    click(FLIP, 356, 36 + 72 + 178 + 22 + 46 + 23);
    goP(57.25, 300, 300, 58.0);
    click(58.5, 367, 69);
    go(59.0, 1720, 1100, SP.soft);
    go(60.5, 1000, 1100, SP.snap);
    go(60.75, 120 + 330, 560 + 42); clicks.push(61.5); cue(61.5, 'click');
    go(63.25, 120 + 110, 560 + 42); clicks.push(64.0); cue(64.0, 'click');
    go(64.25, 120 + 330, 560 + 42); clicks.push(65.0); cue(65.0, 'click');
    go(65.25, 700, 1150, SP.soft);
    draws.push((t) => {
      const x = CU.x.at(t), y = CU.y.at(t);
      const vx = (x - CU.x.at(t - 0.02)) / 0.02;
      let sc = 1; for (const tc of clicks) sc *= press(t, tc);
      for (const [a, b] of holds) sc *= 1 - 0.14 * (stepR(t - a, SP.pop) - stepR(t - b, SP.pop));
      const w = wins.find((c) => t >= c[0] - 0.01 && t < c[1] + 0.2);
      if (!w) cur.style.visibility = 'hidden';
      else {
        const v = vis(t, w[0], w[1]);
        cur.style.visibility = v.gone ? 'hidden' : 'visible'; cur.style.opacity = v.o.toFixed(3);
        cur.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) rotate(${clamp(-vx * 0.004, -14, 14).toFixed(2)}deg) scale(${sc.toFixed(3)})`;
        pill.style.transform = `translateX(${clamp(-vx * 0.01, -26, 26).toFixed(1)}px)`;
      }
      const c = clicks.slice().reverse().find((tc) => t >= tc && t < tc + 0.4);
      const r = c != null ? ripple(t, c) : null;
      if (!r) rip.style.visibility = 'hidden';
      else { rip.style.visibility = 'visible'; rip.style.opacity = r.o.toFixed(3); rip.style.transform = `translate(${CU.x.at(c)}px,${CU.y.at(c)}px) scale(${r.s.toFixed(3)})`; }
    });
    bodyPress.push(31.0, 39.0, 46.0, 53.5);

    // keep the old-scene beats alive: cues on the measurement beats
    cue(4.0, 'pop'); cue(5.75, 'tick'); cue(6.5, 'tick'); cue(7.5, 'tick');
    cue(13.5, 'tick'); cue(16.0, 'tick'); cue(18.0, 'tick'); cue(20.0, 'tick'); cue(27.0, 'tick'); cue(28.0, 'tick'); cue(29.0, 'whoosh', { v: 0.3 });
    cue(30.0, 'whoosh', { v: 0.3 }); cue(37.5, 'whoosh', { v: 0.3 }); cue(47.5, 'tick'); cue(50.5, 'tick'); cue(51.0, 'tick');
    cue(55.0, 'tick'); cue(57.5, 'tick'); cue(62.0, 'tick'); cue(62.5, 'tick');

    // ───────────────────────── seek ─────────────────────────
    const DUR = 72.0;
    window.seek = (t) => {
      const z = Math.exp(CAM.lz.at(t));
      world.style.transform = `translate(${(CAM.ax.at(t) + shake(t)).toFixed(2)}px,540px) scale(${z.toFixed(5)}) translate(${(-CAM.cx.at(t)).toFixed(2)}px,${(-CAM.cy.at(t)).toFixed(2)}px)`;
      for (const d of draws) d(t);
    };
    const seen = new Set();
    const out = cues.filter((c) => { const key = c.t + c.k; if (seen.has(key)) return false; seen.add(key); return true; });
    out.forEach((c) => { const gg = c.t / 0.125; if (Math.abs(gg - Math.round(gg)) > 1e-6) throw new Error('cue off grid: ' + JSON.stringify(c)); });
    out.sort((a, b) => a.t - b.t);
    window.FILM = { width: 1920, height: 1080, bpm: 120, duration: DUR,
      sections: { intro: [0, 4], drop: [12, 16], outro: [66, DUR] }, cues: out };
    window.seek(0);
    window.READY = true;
  } catch (err) {
    console.error(err);
    window.FILM_ERROR = String(err && err.stack || err);
  }
})();
