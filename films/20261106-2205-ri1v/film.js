// Saling Jaga · "Saat sinyal hilang". Landscape 1920×1080, 120 BPM, 32 s.
// One shape, never cut: signal pill → phone (cari perangkat → grup → walkie-talkie → SOS card → compass)
// → feature pill → logo disc.
(async function () {
  try {
    const { clamp, lerp, stepR, Track, ColorTrack, SP, vis, applyVis, press, ripple, outQ, measure } = M;
    const C = { night: '#07110c', card: '#0f1f17', card2: '#13271d', cream: '#f2edd5', paper: '#f6f4ea', muted: '#a5b0a2',
      ink: '#1c2a21', grey: '#6b7469', leaf: '#3cbf6e', leafInk: '#04140a', moss: '#1b4d2e', appg: '#1f7a45', lamp: '#f2c46b',
      sos: '#e03131', sosBg: '#fdecec', budi: '#e8590c', sari: '#d6336c', rt: '#1e7a45', you: '#5fa30f', line: '#e2e0d4' };

    await Promise.all([
      document.fonts.load('800 72px "Plus Jakarta Sans"'), document.fonts.load('500 31px "Plus Jakarta Sans"'),
      document.fonts.load('700 16px "Plus Jakarta Sans"'), document.fonts.load('600 24px "JetBrains Mono"'),
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
    const at = (e, x, y) => { e.style.left = x.toFixed(2) + 'px'; e.style.top = y.toFixed(2) + 'px'; return e; };
    const rect = (e, x, y, w, h) => { e.style.left = x.toFixed(2) + 'px'; e.style.top = y.toFixed(2) + 'px'; e.style.width = Math.max(0, w).toFixed(2) + 'px'; e.style.height = Math.max(0, h).toFixed(2) + 'px'; };
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
      plus: P('<path d="M12 5v14M5 12h14"/>', 2.4),
      cam: P('<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>'),
      siren: P('<path d="M6 18v-6a6 6 0 0 1 12 0v6"/><path d="M4 18h16v3H4z"/><path d="M12 2v2M3.5 5.5 5 7M20.5 5.5 19 7"/>'),
      family: P('<circle cx="9" cy="8" r="3"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><circle cx="17" cy="15" r="3"/><path d="m19.2 17.2 2.3 2.3"/>'),
      flag: P('<path d="M5 22V3.5"/><path d="M5 4h12l-2.5 4L17 12H5"/>'),
      list: P('<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 3h6v3H9z"/><path d="m8.5 13 2 2 4-4"/>'),
      med: P('<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M12 9v6M9 12h6"/>'),
      book: P('<path d="M4 5a2 2 0 0 1 2-2h13v15H6a2 2 0 0 0-2 2z"/><path d="M4 20a2 2 0 0 0 2 2h13v-4"/><path d="M11.5 7v6M8.5 10h6"/>'),
      wifi: P('<path d="M2 8.5a15 15 0 0 1 20 0"/><path d="M5 12a10.5 10.5 0 0 1 14 0"/><path d="M8.5 15.5a5.5 5.5 0 0 1 7 0"/><circle cx="12" cy="19" r="1" fill="currentColor"/>'),
      lock: P('<rect x="4.5" y="10.5" width="15" height="10.5" rx="2.5"/><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5"/>'),
      check: P('<path d="M20 6 9 17l-5-5"/>', 3),
      play: '<svg viewBox="0 0 24 24" width="100%" height="100%"><path d="M7 4.5v15l12.5-7.5z" fill="currentColor"/></svg>',
      arrow: P('<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>', 2.6),
      download: P('<path d="M12 3v12"/><path d="m6.5 10 5.5 5.5 5.5-5.5"/><path d="M4 20h16"/>', 2.6),
    };
    const ico = (k, s, col = 'currentColor', st = '') => `<span class="ic" style="width:${s}px;height:${s}px;color:${col};${st}">${I[k]}</span>`;
    const wave = (n, h, colr, seed) => `<span style="display:inline-flex;align-items:center;gap:3px;height:${h}px">${Array.from({ length: n }, (_, i) => `<i style="display:block;width:3px;border-radius:2px;background:${colr};height:${Math.round(h * (0.25 + 0.75 * Math.abs(Math.sin(i * 1.7 + seed) * Math.cos(i * 0.6))))}px"></i>`).join('')}</span>`;

    // ───────────────────────── Camera ─────────────────────────
    const CAM = { ax: new Track(960), cx: new Track(200), cy: new Track(563), lz: new Track(Math.log(1.1)) };
    const cam = (t, cx, cy, z, ax) => { CAM.cx.to(t, cx, SP.cam); CAM.cy.to(t, cy, SP.cam); CAM.lz.to(t, Math.log(z), SP.cam); if (ax != null) CAM.ax.to(t, ax, SP.cam); };
    cam(3.5, 200, 433, 1.1, 1340);
    cam(8.75, 200, 620, 1.4);         // push into the talk button
    cam(11.5, 200, 433, 1.1);
    cam(15.75, 200, 190, 1.8, 1370);   // drop: SOS card fills the frame
    cam(19.0, 200, 433, 1.1, 1340);
    cam(23.75, 200, 433, 1.0, 960);
    const toS = (lx, ly, t) => { const z = Math.exp(CAM.lz.at(t)); return [CAM.ax.at(t) + (lx - CAM.cx.at(t)) * z, 540 + (ly - CAM.cy.at(t)) * z]; };
    const shakes = [16.0];
    const shake = (t) => { let x = 0; for (const ts of shakes) { const d = t - ts; if (d > 0 && d < 0.6) x += 14 * Math.exp(-d * 8) * Math.sin(d * 70); } return x; };

    // ───────────────────────── The one shape (phone body) ─────────────────────────
    const body = add('<div id="body"></div>', world);
    const PB = { l: new Track(200 - 230), t: new Track(433 - 44), r: new Track(200 + 230), b: new Track(433 + 44), rad: new Track(44), col: new ColorTrack(C.card2) };
    const pm = (t, l, tp, r, b, rad, col, sp = SP.shape) => { PB.l.to(t, l, sp); PB.t.to(t, tp, sp); PB.r.to(t, r, sp); PB.b.to(t, b, sp); PB.rad.to(t, rad, sp); if (col) PB.col.to(t, col, SP.soft); };
    const bodyPress = [];
    draws.push((t) => {
      const l = PB.l.at(t), tp = PB.t.at(t), r = PB.r.at(t), b = PB.b.at(t);
      rect(body, l, tp, r - l, b - tp);
      body.style.borderRadius = Math.min(PB.rad.at(t), (r - l) / 2, (b - tp) / 2).toFixed(2) + 'px';
      body.style.background = PB.col.at(t);
      let s = popS(t, 0, 0.2); for (const tc of bodyPress) s *= 1 - 0.05 * Math.exp(-(((t - tc) / 0.08) ** 2));
      body.style.transform = `scale(${s.toFixed(4)})`;
      body.style.boxShadow = '0 50px 110px -30px rgba(0,0,0,.8), inset 0 0 0 2px rgba(242,237,213,.14)';
    });

    // ── Intro: the signal pill. Bars drop out one per beat. ──
    const pillC = add(`<div style="position:absolute;display:flex;align-items:center;gap:22px;white-space:nowrap;font:700 30px/1 'JetBrains Mono';letter-spacing:.04em"></div>`, world);
    const barsWrap = add('<span style="display:flex;gap:6px;align-items:flex-end;height:33px"></span>', pillC);
    const bars = [12, 19, 26, 33].map((h) => add(`<i style="display:block;width:9px;height:${h}px;border-radius:3px"></i>`, barsWrap));
    const pTxt = add('<span style="position:relative;display:inline-block;width:250px;height:30px"></span>', pillC);
    const p4g = add(`<span style="position:absolute;left:0;top:0;color:${C.cream}">4G · penuh</span>`, pTxt);
    const p0 = add(`<span style="position:absolute;left:0;top:0;color:#ff6b6b">Tanpa sinyal</span>`, pTxt);
    const barOff = [0.5, 1.0, 1.5, 2.0];
    const barCol = bars.map((_, i) => new ColorTrack(C.leaf).to(barOff[3 - i], '#3a4a40', { w: 30, z: 1 }));
    draws.push((t) => {
      const v = vis(t, 0.1, 3.375);
      at(pillC, 200 - 170, 433 - 17);
      let s = 1; barOff.forEach((tb) => { s *= bump(t, tb, 0.04); });
      applyVis(pillC, v, `scale(${s.toFixed(4)})`);
      bars.forEach((b, i) => { b.style.background = barCol[i].at(t); b.style.transform = `translateY(${(4 * (1 - stepR(t - barOff[3 - i], SP.pop)) * (t > barOff[3 - i] ? 1 : 0)).toFixed(2)}px)`; });
      applyVis(p4g, vis(t, -1, 1.875));
      applyVis(p0, vis(t, 2.0, 3.375));
    });
    cue(0, 'born'); cue(0.1, 'pop');
    barOff.forEach((tb, i) => cue(tb, 'tick', { n: 3 - i }));
    cue(2.0, 'alert');

    // intro headline words, one per beat
    const ih = add(`<div style="left:0;width:1920px;top:560px;text-align:center;font:800 92px/1.08 'Plus Jakarta Sans';letter-spacing:-.04em"></div>`);
    const words = [['Listrik', 0.5], ['padam.', 1.0], ['<br>', 0], ['Sinyal', 1.5], ['<span class="serif" style="color:#ff6b6b;font-size:1.12em">hilang.</span>', 2.0]];
    words.forEach(([w, tw]) => {
      if (w === '<br>') { ih.appendChild(document.createElement('br')); return; }
      const e = add(`<span style="display:inline-block;margin:0 .14em">${w}</span>`, ih); show(e, tw, 3.375);
    });
    const isub = add(`<div style="left:0;width:1920px;top:800px;text-align:center;font:500 34px/1.3 'Plus Jakarta Sans';color:${C.muted}">Grup chat sepi. Siapa yang aman? Siapa yang butuh bantuan?</div>`);
    show(isub, 2.5, 3.375);
    cue(0.5, 'slam', { n: 0 }); cue(1.0, 'slam', { n: 1 }); cue(1.5, 'slam', { n: 2 }); cue(2.0, 'slam', { n: 3 }); cue(2.5, 'pop');

    // pill → phone
    pm(3.5, -12, -12, 412, 878, 56, '#0b0f0d');
    cue(3.5, 'whoosh', { v: 0.8 }); cue(4.0, 'settle');

    // ───────────────────────── Screen ─────────────────────────
    const scr = add('<div id="scr"></div>', world);
    const s = (html) => add(html, scr);
    draws.push((t) => fade(scr, t, 3.75, 23.5, 0.2));

    // status bar + header
    s(`<div style="left:0;top:0;width:400px;height:104px;background:${C.moss}"></div>`);
    s(`<div style="left:0;top:0;width:400px;height:36px;z-index:30;color:#fff;font:700 13px/1 'Plus Jakarta Sans'">
      <span style="position:absolute;left:26px;top:13px">22:05</span>
      <span style="position:absolute;right:24px;top:12px;display:flex;gap:6px;align-items:center;font:600 11px/1 'JetBrains Mono'">TANPA SINYAL</span></div>`);
    s('<div style="z-index:31;background:#05080a;left:193px;top:12px;width:14px;height:14px;border-radius:7px"></div>');
    const hav = s(`<div style="left:16px;top:46px;width:46px;height:46px;border-radius:50%;background:${C.cream};overflow:hidden;z-index:2"><img src="assets/mark.png" style="width:42px;height:42px;margin:2px"></div>`);
    const H = (t1, t2, tin, tout) => {
      const e = s(`<div style="left:74px;top:48px;color:#fff;z-index:2;white-space:nowrap"><div style="font:800 20px/1.1 'Plus Jakarta Sans'">${t1}</div><div style="font:500 13.5px/1.3 'Plus Jakarta Sans';opacity:.8;margin-top:3px">${t2}</div></div>`);
      show(e, tin, tout);
    };
    H('Cari perangkat', 'Wi-Fi Direct · tanpa internet', 4.0, 7.875);
    H('Grup · 4 orang', 'Budi, Sari, Pak RT', 8.0, 19.75);
    H('Kompas', '4 orang · 1 titik kumpul', 19.875, 24);
    show(hav, 4.0, 24);

    // ── Scene A: cari perangkat ──
    const RC = [200, 280];
    const rings = [0, 1, 2].map(() => s(`<div style="border-radius:50%;border:2px solid ${C.appg}"></div>`));
    const me = s(`<div class="av" style="width:64px;height:64px;background:${C.you};font-size:24px;left:${RC[0] - 32}px;top:${RC[1] - 32}px">C</div>`);
    draws.push((t) => {
      const v = vis(t, 4.0, 7.875);
      rings.forEach((r, i) => {
        if (v.gone) { r.style.visibility = 'hidden'; return; }
        r.style.visibility = 'visible';
        const p = (((t - 4) * 0.5 + i / 3) % 1 + 1) % 1, rr = 40 + 140 * p;
        rect(r, RC[0] - rr, RC[1] - rr, rr * 2, rr * 2); r.style.opacity = (v.o * 0.5 * (1 - p)).toFixed(3);
      });
      applyVis(me, v, `scale(${bump(t, 7.0, 0.12).toFixed(3)})`);
    });
    const devs = [['B', 'Budi', C.budi, 5.0, -120, -60], ['S', 'Sari', C.sari, 5.5, -95, 85], ['R', 'Pak RT', C.rt, 6.0, 120, 50]];
    devs.forEach(([ini, nm, col, td, dx, dy], i) => {
      const dot = s(`<div class="av" style="width:40px;height:40px;background:${col};font-size:16px;left:${RC[0] + dx - 20}px;top:${RC[1] + dy - 20}px;box-shadow:0 0 0 4px #f6f4ea">${ini}</div>`);
      draws.push((t) => applyVis(dot, vis(t, td, 7.875), `scale(${popS(t, td, 0.3).toFixed(3)})`));
      const row = s(`<div style="left:16px;top:${470 + i * 76}px;width:368px;height:64px;background:#fff;border:1px solid ${C.line};border-radius:18px;display:flex;align-items:center;gap:12px;padding:0 12px">
        <div class="av" style="width:40px;height:40px;background:${col};font-size:16px">${ini}</div>
        <div style="flex:1"><div style="font:700 16px/1.2 'Plus Jakarta Sans'">${nm}</div><div style="font:500 12.5px/1.3 'Plus Jakarta Sans';color:${C.grey}">Siap dihubungkan</div></div>
        </div>`);
      const st = add(`<span style="position:relative;width:30px;height:30px;flex:none"></span>`, row);
      const wf = add(`<span style="position:absolute;inset:0;color:${C.grey}">${I.wifi}</span>`, st);
      const ck = add(`<span style="position:absolute;inset:0;border-radius:50%;background:${C.appg};color:#fff;padding:6px">${I.check}</span>`, st);
      const tc = 7.0 + i * 0.125;
      draws.push((t) => { applyVis(row, vis(t, td, 7.875)); applyVis(wf, vis(t, td, tc)); applyVis(ck, vis(t, tc, 7.875), `scale(${popS(t, tc, 0.4).toFixed(3)})`); });
      cue(td, 'pop', { n: i });
    });
    cue(7.0, 'check'); cue(7.125, 'check'); cue(7.25, 'check');
    const btnA = s(`<div style="left:16px;top:722px;width:368px;height:64px;border-radius:32px;display:flex;align-items:center;justify-content:center;color:#fff;font:800 18px/1 'Plus Jakarta Sans'"></div>`);
    const btnAt = add('<span style="position:relative;display:block;width:300px;height:22px"></span>', btnA);
    const ba1 = add(`<span style="position:absolute;left:0;right:0;text-align:center">Hubungkan semua</span>`, btnAt);
    const ba2 = add(`<span style="position:absolute;left:0;right:0;text-align:center">4 HP terhubung</span>`, btnAt);
    const btnACol = new ColorTrack(C.appg).to(7.0, C.leaf, SP.soft);
    draws.push((t) => {
      applyVis(btnA, vis(t, 6.25, 7.875), `scale(${press(t, 7.0).toFixed(4)})`);
      btnA.style.background = btnACol.at(t); btnA.style.color = t > 7.05 ? C.leafInk : '#fff';
      applyVis(ba1, vis(t, 6.25, 6.95)); applyVis(ba2, vis(t, 7.05, 7.875));
    });
    cue(6.25, 'pop'); cue(7.0, 'click');

    // ── Scene B: grup chat ──
    const colEl = s('<div style="left:0;top:104px;width:400px;height:660px;overflow:hidden"></div>');
    const items = [];
    const item = (html, tin, side = 'c') => {
      const e = add(html, colEl); e.style.position = 'absolute';
      items.push({ e, tin, side }); return e;
    };
    item('<div class="sp">Budi bergabung</div>', 8.0); item('<div class="sp">Sari bergabung</div>', 8.25); item('<div class="sp">Pak RT bergabung</div>', 8.5);
    item(`<div class="bm" style="display:flex;align-items:center;gap:10px;width:230px">${ico('play', 22, '#fff')}${wave(22, 26, 'rgba(255,255,255,.85)', 1.3)}<span style="font:600 13px/1 'JetBrains Mono'">0:03</span></div>`, 11.0, 'r');
    item(`<div class="bo" style="width:260px"><div class="nm" style="color:${C.budi}">Budi</div>Aku sudah di masjid. Aman.</div>`, 12.0, 'l');
    item(`<div class="an" style="width:368px"><div class="nm">PENGUMUMAN · PAK RT</div>Titik kumpul: lapangan SD 2. Bawa air minum.</div>`, 13.0, 'l');
    item(`<div class="bo" style="width:280px"><div class="nm" style="color:${C.sari}">Sari</div>Kakiku terkilir, ada yang bisa jemput?</div>`, 14.0, 'l');
    item('<div class="sp" style="color:#c92a2a;border-color:#f3b0b0">Sari mengirim SOS</div>', 16.0);
    let y = 14;
    const BOT = 664;   // chat is anchored to the input bar: each new item lifts the column
    let colY = null;
    items.forEach((it) => {
      const w = it.e.offsetWidth, h = it.e.offsetHeight;
      const x = it.side === 'r' ? 400 - 16 - w : it.side === 'l' ? 16 : 200 - w / 2;
      at(it.e, x, y); it.y = y; it.h = h; y += h + 10;
      if (!colY) colY = new Track(BOT - y); else colY.to(it.tin - 0.06, BOT - y, { w: 20, z: 0.9 });
    });
    draws.push((t) => {
      fade(colEl, t, 8.0, 19.0, 0.15);
      colEl.style.transform = `translateY(${colY.at(t).toFixed(2)}px)`;
      items.forEach((it) => applyVis(it.e, vis(t, it.tin, 99), `scale(${popS(t, it.tin, 0.85).toFixed(4)})`));
    });
    cue(8.0, 'pop', { n: 0 }); cue(8.25, 'pop', { n: 1 }); cue(8.5, 'pop', { n: 2 });
    cue(12.0, 'note', { n: 2 }); cue(13.0, 'alert'); cue(14.0, 'note', { n: 4 });

    // bottom bar: SOS disc, input, talk button (the talk button stretches into the walkie-talkie)
    const sosB = s(`<div class="av" style="left:14px;top:782px;width:62px;height:62px;background:${C.sos};font:800 17px/1 'Plus Jakarta Sans'">SOS</div>`);
    const inp = s(`<div style="left:86px;top:782px;width:218px;height:62px;border-radius:31px;background:#fff;border:1px solid ${C.line};display:flex;align-items:center;gap:10px;padding:0 16px;color:${C.grey};font:500 16px/1 'Plus Jakarta Sans'">${ico('plus', 22, C.grey)}<span style="flex:1">Ketik pesan</span>${ico('cam', 22, C.grey)}</div>`);
    const talk = s(`<div style="background:${C.appg};overflow:hidden;color:#fff"></div>`);
    const talkI = add(`<span style="position:absolute;width:28px;height:28px;color:#fff">${I.radio}</span>`, talk);
    const talkL = add(`<div style="position:absolute;left:24px;top:0;height:100%;display:flex;align-items:center;gap:14px;white-space:nowrap;font:800 17px/1 'Plus Jakarta Sans'"><span style="width:12px;height:12px;border-radius:6px;background:#ff6b6b"></span>Bicara ke grup</div>`);
    talk.appendChild(talkL);
    const bw = add('<div style="position:absolute;left:184px;top:0;height:100%;display:flex;align-items:center;gap:3px"></div>', talk);
    const wbars = Array.from({ length: 10 }, () => add('<i style="display:block;width:4px;border-radius:2px;background:rgba(255,255,255,.9)"></i>', bw));
    const tTime = add(`<div style="position:absolute;right:60px;top:0;height:100%;display:flex;align-items:center;font:600 14px/1 'JetBrains Mono'"></div>`, talk);
    const HOLD = 9.5, REL = 11.0;
    const TL = new Track(316).to(HOLD, 14, { w: 11, z: 0.86 }).to(REL, 316, { w: 14, z: 0.86 });
    const TR = new Track(378).to(HOLD, 386, { w: 30, z: 0.8 }).to(REL, 378, { w: 30, z: 0.8 });
    const TT = new Track(782).to(HOLD, 774, SP.pop).to(REL, 782, SP.pop);
    draws.push((t) => {
      const v = vis(t, 8.0, 19.75);
      applyVis(sosB, v, `scale(${(bump(t, 16.0, 0.18, 0.1) * bump(t, 16.5, 0.1) * bump(t, 17.0, 0.1)).toFixed(3)})`);
      const hv = clamp(1 - (stepR(t - HOLD + 0.1, SP.text) - stepR(t - REL, SP.text)));
      applyVis(inp, { ...v, o: v.o * hv, gone: v.gone });
      fade(talk, t, 8.0, 19.75);
      const l = TL.at(t), r = TR.at(t), tp = TT.at(t), h = 62 + 2 * (782 - tp);
      rect(talk, l, tp, r - l, h);
      talk.style.borderRadius = (h / 2).toFixed(2) + 'px';
      talk.style.transform = `scale(${press(t, HOLD).toFixed(4)})`;
      at(talkI, r - l - 31 - 14, h / 2 - 14);
      applyVis(talkL, vis(t, HOLD + 0.15, REL - 0.1, 0.08)); applyVis(bw, vis(t, HOLD + 0.25, REL - 0.1, 0.08)); applyVis(tTime, vis(t, HOLD + 0.25, REL - 0.1, 0.08));
      wbars.forEach((e, i) => { e.style.height = (6 + 22 * Math.abs(Math.sin(t * 9 + i * 0.9) * Math.sin(t * 3.3 + i * 0.37))).toFixed(1) + 'px'; });
      tTime.textContent = '0:0' + clamp(Math.floor((t - HOLD) * 2), 0, 3);
    });
    // while you hold: everyone in the group hears you
    const lis = s(`<div style="left:40px;top:420px;width:320px;height:190px;border-radius:26px;background:#fff;border:1px solid ${C.line};z-index:4"></div>`);
    const lav = [['B', C.budi], ['S', C.sari], ['R', C.rt]].map(([ini, col], i) => {
      const g = add(`<div style="position:absolute;left:${70 + i * 90}px;top:62px;width:0;height:0"></div>`, lis);
      const rg = add(`<div style="position:absolute;border-radius:50%;border:2.5px solid ${C.appg}"></div>`, g);
      add(`<div class="av" style="position:absolute;left:-28px;top:-28px;width:56px;height:56px;background:${col};font-size:21px">${ini}</div>`, g);
      return { g, rg, ti: 9.75 + i * 0.25 };
    });
    add(`<div style="position:absolute;left:0;right:0;top:120px;text-align:center;font:700 17px/1.3 'Plus Jakarta Sans';color:${C.ink}">Budi, Sari, Pak RT mendengar</div>`, lis);
    add(`<div style="position:absolute;left:0;right:0;top:146px;text-align:center;font:600 12.5px/1.3 'JetBrains Mono';color:${C.grey}">HP ke HP · tanpa sinyal</div>`, lis);
    draws.push((t) => {
      applyVis(lis, vis(t, 9.75, REL, 0.12), `scale(${popS(t, 9.75, 0.85).toFixed(4)})`);
      lav.forEach(({ g, rg, ti }) => {
        g.style.transform = `scale(${popS(t, ti, 0.4).toFixed(3)})`; g.style.opacity = t < ti ? 0 : 1;
        const p = (((t - ti) * 1.6) % 1 + 1) % 1, rr = 28 + 18 * p; rect(rg, -rr, -rr, rr * 2, rr * 2); rg.style.opacity = t < ti ? 0 : (0.7 * (1 - p)).toFixed(3);
      });
    });
    cue(9.75, 'pop', { n: 0 }); cue(10.0, 'pop', { n: 1 }); cue(10.25, 'pop', { n: 2 });
    cue(HOLD, 'click'); cue(HOLD, 'drag', { d: REL - HOLD }); cue(REL, 'release'); cue(REL, 'pop', { n: 3 });
    cue(10.0, 'tick'); cue(10.5, 'tick');

    // ── Drop: SOS card. It grows into the compass. ──
    const card = s('<div style="z-index:5;overflow:hidden"></div>');
    const CD = { l: new Track(200), t: new Track(156), r: new Track(200), b: new Track(156), col: new ColorTrack(C.sosBg) };
    const cm = (t, l, tp, r, b, sp = SP.shape) => { CD.l.to(t, l, sp); CD.t.to(t, tp, sp); CD.r.to(t, r, sp); CD.b.to(t, b, sp); };
    cm(16.0, 12, 114, 388, 192, { w: 22, z: 0.72 });
    CD.b.to(17.75, 248, SP.shape);
    cm(19.0, 0, 104, 400, 866, SP.shape); CD.col.to(19.0, C.card, { w: 30, z: 1 });
    const cardIn = add(`<div style="position:absolute;left:14px;top:14px;width:348px">
      <div style="display:flex;align-items:center;gap:12px">
        <div class="av" style="width:50px;height:50px;background:${C.sari};font-size:20px">S</div>
        <div><div style="font:800 19px/1.2 'Plus Jakarta Sans';color:#c92a2a">SOS · Sari minta tolong</div>
        <div style="font:500 14.5px/1.4 'Plus Jakarta Sans';color:${C.ink};margin-top:2px"><b class="mono" id="odo" style="color:${C.ink}">0</b> m ke arah barat laut · <span id="batt">baterai 21%</span></div></div>
      </div></div>`, card);
    const odo = cardIn.querySelector('#odo'), batt = cardIn.querySelector('#batt');
    const cbtn = add(`<div style="position:absolute;left:14px;top:76px;width:348px;height:44px;border-radius:22px;background:${C.sos};color:#fff;display:flex;align-items:center;justify-content:center;gap:10px;font:800 16px/1 'Plus Jakarta Sans'">Lihat arah ${ico('arrow', 18, '#fff')}</div>`, card);
    draws.push((t) => {
      if (t < 15.9 || t > 23.6) { card.style.visibility = 'hidden'; return; }
      card.style.visibility = 'visible';
      const l = CD.l.at(t), tp = CD.t.at(t), r = CD.r.at(t), b = CD.b.at(t);
      rect(card, l, tp, r - l, b - tp);
      const open = clamp((t - 19.0) / 0.4);
      card.style.borderRadius = lerp(20, 0, open).toFixed(1) + 'px';
      card.style.background = CD.col.at(t);
      card.style.border = `${(2 * (1 - open)).toFixed(2)}px solid rgba(224,49,49,${(0.7 * (1 - open)).toFixed(2)})`;
      card.style.opacity = clamp((t - 15.9) / 0.08).toFixed(3);
      card.style.transform = `scale(${(bump(t, 16.5, 0.03) * bump(t, 17.0, 0.03) * bump(t, 17.5, 0.03)).toFixed(4)})`;
      applyVis(cardIn, vis(t, 16.1, 18.875, 0.1));
      applyVis(cbtn, vis(t, 17.75, 18.875, 0.1), `scale(${press(t, 18.5).toFixed(4)})`);
      odo.textContent = String(Math.round(259 * outQ((t - 16.5) / 1.0)));
      batt.style.opacity = clamp((t - 17.5) / 0.15).toFixed(2);
    });
    cue(15.0, 'riser', { d: 1.0 });
    cue(16.0, 'drop'); cue(16.0, 'alert'); cue(16.5, 'alert'); cue(17.0, 'alert');
    for (let k = 0; k < 8; k++) cue(16.5 + k * 0.125, 'tick');
    cue(17.5, 'pop'); cue(17.75, 'pop'); cue(18.5, 'click'); cue(19.0, 'whoosh', { v: 0.6 });
    draws.push((t) => {
      let o = 0; [16.0, 16.5, 17.0, 17.5, 18.0].forEach((ta, i) => { const d = t - ta; if (d > 0) o = Math.max(o, (1 - 0.12 * i) * Math.exp(-d * 2.6)); });
      redL.style.opacity = o.toFixed(3);
    });

    // ── Compass (inside the opened card) ──
    const CC = [200, 380], R = 152;
    const comp = add(`<div style="position:absolute;left:0;top:0;width:400px;height:762px"></div>`, card);
    const cx0 = CC[0], cy0 = CC[1] - 104;
    add(`<div style="position:absolute;left:${cx0 - R}px;top:${cy0 - R}px;width:${2 * R}px;height:${2 * R}px;border-radius:50%;border:2px solid rgba(242,237,213,.28)"></div>`, comp);
    add(`<div style="position:absolute;left:${cx0 - R / 2}px;top:${cy0 - R / 2}px;width:${R}px;height:${R}px;border-radius:50%;border:2px dashed rgba(242,237,213,.14)"></div>`, comp);
    [['U', 0], ['T', 90], ['S', 180], ['B', 270]].forEach(([c, a]) => {
      const rr = R + 22, x = cx0 + rr * Math.sin(a * Math.PI / 180), yy = cy0 - rr * Math.cos(a * Math.PI / 180);
      add(`<div style="position:absolute;left:${x - 12}px;top:${yy - 10}px;width:24px;text-align:center;font:700 16px/20px 'JetBrains Mono';color:${c === 'U' ? C.leaf : C.muted}">${c}</div>`, comp);
    });
    const needle = add(`<div style="position:absolute;left:${cx0 - 3}px;top:${cy0 - 118}px;width:6px;height:118px;border-radius:3px;transform-origin:3px 118px"></div>`, comp);
    add(`<div class="av" style="position:absolute;left:${cx0 - 18}px;top:${cy0 - 18}px;width:36px;height:36px;background:${C.you};font-size:15px;box-shadow:0 0 0 5px ${C.card}">C</div>`, comp);
    const NA = new Track(0).to(21.5, -45, { w: 14, z: 0.78 });
    const NC = new ColorTrack(C.leaf).to(21.5, '#ff6b6b');
    const mem = [['B', 'Budi', '252 m', C.budi, 0, 252, 20.25], ['S', 'Sari', '259 m', C.sari, -45, 259, 20.5], ['R', 'Pak RT', '470 m', C.rt, 135, 470, 20.75], ['flag', 'Pos 3', '250 m', C.lamp, 45, 250, 21.0]];
    let sariXY = null;
    mem.forEach(([ini, nm, d, col, a, m, td]) => {
      const rr = 30 + 0.25 * m, x = cx0 + rr * Math.sin(a * Math.PI / 180), yy = cy0 - rr * Math.cos(a * Math.PI / 180);
      if (nm === 'Sari') sariXY = [x, yy + 104];
      const g = add(`<div style="position:absolute;left:${x}px;top:${yy}px;width:0;height:0"></div>`, comp);
      let ring = null;
      if (nm === 'Sari') ring = add(`<div style="position:absolute;border-radius:50%;border:3px solid #ff6b6b"></div>`, g);
      const dot = add(ini === 'flag'
        ? `<div class="av" style="position:absolute;left:-18px;top:-18px;width:36px;height:36px;background:${col};color:${C.leafInk};padding:8px">${I.flag}</div>`
        : `<div class="av" style="position:absolute;left:-18px;top:-18px;width:36px;height:36px;background:${col};font-size:15px;box-shadow:0 0 0 3px ${C.card}">${ini}</div>`, g);
      const lb = add(`<div style="position:absolute;left:-60px;top:${a === 0 || a === -45 || a === 45 ? -52 : 24}px;width:120px;text-align:center;white-space:nowrap;font:700 13.5px/1.25 'Plus Jakarta Sans';color:${C.cream}">${nm} <span style="font:600 12px 'JetBrains Mono';color:${C.muted}">${d}</span></div>`, g);
      draws.push((t) => {
        applyVis(dot, vis(t, td, null), `scale(${(popS(t, td, 0.3) * (nm === 'Sari' ? press(t, 22.25) : 1)).toFixed(3)})`);
        applyVis(lb, vis(t, td + 0.1, null));
        if (ring) { const p = ((t - td) * 1.4) % 1, rr2 = 18 + 26 * p; rect(ring, -rr2, -rr2, rr2 * 2, rr2 * 2); ring.style.opacity = t < td ? 0 : (0.8 * (1 - p)).toFixed(3); }
      });
      cue(td, 'pop', { n: ['B', 'S', 'R', 'flag'].indexOf(ini) });
    });
    // bottom sheet: Sari's info + medical card
    const sheet = add(`<div style="position:absolute;left:14px;top:520px;width:372px;height:134px;border-radius:22px;background:${C.cream};color:${C.ink};padding:16px">
      <div style="display:flex;align-items:center;gap:12px"><div class="av" style="width:46px;height:46px;background:${C.sari};font-size:18px">S</div>
      <div style="flex:1"><div style="font:800 18px/1.2 'Plus Jakarta Sans'">Sari · SOS</div><div style="font:500 14px/1.35 'Plus Jakarta Sans';color:${C.grey}">259 m ke barat laut · baterai 21%</div></div></div>
      <div style="margin-top:14px;display:flex;align-items:center;gap:8px;font:700 13.5px/1 'Plus Jakarta Sans';color:#c92a2a">${ico('med', 18, '#c92a2a')}Kartu medis ikut terkirim</div></div>`, comp);
    const go = add(`<div style="position:absolute;left:14px;top:668px;width:372px;height:60px;border-radius:30px;display:flex;align-items:center;justify-content:center;gap:10px;font:800 17px/1 'Plus Jakarta Sans'"></div>`, comp);
    const goT = add(`<span>Aku menuju ke sana</span>`, go);
    const goC = new ColorTrack(C.card2).to(23.0, C.leaf);
    draws.push((t) => {
      fade(comp, t, 19.75, 99);
      needle.style.transform = `rotate(${NA.at(t).toFixed(2)}deg)`;
      needle.style.background = NC.at(t);
      applyVis(sheet, vis(t, 22.5, null), `scale(${popS(t, 22.5, 0.9).toFixed(4)})`);
      applyVis(go, vis(t, 22.75, null), `scale(${press(t, 23.0).toFixed(4)})`);
      go.style.background = goC.at(t); go.style.color = t > 23.0 ? C.leafInk : C.cream;
      go.style.border = `2px solid ${t > 23.0 ? C.leaf : 'rgba(242,237,213,.25)'}`;
    });
    cue(21.5, 'swap', { n: 2 }); cue(22.25, 'click'); cue(22.5, 'pop'); cue(22.75, 'pop'); cue(23.0, 'check');

    // ───────────────────────── Features: the phone becomes one pill ─────────────────────────
    const FEAT = [['flag', 'Titik kumpul', C.leaf, C.leafInk], ['siren', 'Sirine & senter', C.cream, C.leafInk], ['med', 'Kartu medis', '#ff6b6b', '#2a0606'],
      ['book', 'Panduan bencana & P3K', C.lamp, '#2a1c02'], ['list', 'Absen & hitung kepala', C.card2, C.cream], ['family', 'Cari keluarga', C.leaf, C.leafInk]];
    const PH = 184;
    FEAT.forEach(([ic, tx, bg, fg], i) => {
      const tf = 24.0 + i * 0.5;
      const w = 36 + 120 + 32 + measure(tx, "800 78px 'Plus Jakarta Sans'") + 72;
      pm(tf - 0.12, 200 - w / 2, 433 - PH / 2, 200 + w / 2, 433 + PH / 2, PH / 2, bg, i === 0 ? SP.shape : { w: 22, z: 0.78 });
      const e = add(`<div style="position:absolute;display:flex;align-items:center;gap:32px;white-space:nowrap;font:800 78px/1 'Plus Jakarta Sans';letter-spacing:-.03em;color:${fg}">
        <span class="av" style="width:120px;height:120px;background:${fg};color:${bg};padding:28px">${I[ic]}</span>${tx}</div>`, world);
      at(e, 200 - w / 2 + 32, 433 - 60);
      show(e, tf, i === FEAT.length - 1 ? 27.25 : tf + 0.4, '');
      cue(tf, i === 0 ? 'whoosh' : 'swap', i === 0 ? { v: 0.7 } : { n: i });
    });
    const fh = add(`<div class="head" style="left:0;top:200px;width:1920px;text-align:center">Semua yang dibutuhkan <span class="serif">rombongan.</span></div>`);
    show(fh, 24.0, 27.25);
    const ff = add(`<div class="mono" style="left:0;top:720px;width:1920px;text-align:center;font:600 26px/1.5 'JetBrains Mono';color:${C.muted};letter-spacing:.04em">+ pesan suara · mode lansia · hemat baterai · sambung ulang otomatis</div>`);
    show(ff, 25.0, 27.25);
    const ff2 = add(`<div style="left:0;top:790px;width:1920px;display:flex;justify-content:center;gap:16px;font:600 22px/1 'JetBrains Mono';color:${C.leaf}">${ico('lock', 24, C.leaf)}AES-256-GCM · tersimpan di HP</div>`);
    show(ff2, 25.5, 27.25);

    // ───────────────────────── Outro: logo disc ─────────────────────────
    pm(27.5, 200 - 120, 223 - 120, 200 + 120, 223 + 120, 120, C.cream, { w: 16, z: 0.8 });
    const lg = add(`<img src="assets/mark.png" style="width:212px;height:212px">`, world);
    at(lg, 200 - 106, 223 - 106);
    show(lg, 27.75, null, (t) => `scale(${(popS(t, 27.75, 0.6) * bump(t, 28.0, 0.05)).toFixed(4)})`);
    cue(27.5, 'whoosh', { v: 0.6 }); cue(28.0, 'slam', { n: 0 });
    const wm = add(`<div style="left:0;top:476px;width:1920px;text-align:center;font:800 104px/1 'Plus Jakarta Sans';letter-spacing:-.045em">Saling Jaga</div>`);
    show(wm, 28.0, null, (t) => `scale(${bump(t, 28.0, 0.04).toFixed(4)})`);
    const tg = add(`<div style="left:0;top:604px;width:1920px;text-align:center;font:600 44px/1.2 'Plus Jakarta Sans';letter-spacing:-.02em;color:${C.cream}">Saat sinyal hilang, kita tetap <span class="serif" style="color:${C.leaf};font-size:1.18em">saling jaga.</span></div>`);
    show(tg, 28.5, null);
    cue(28.5, 'note', { n: 3 });
    const cta = add(`<div style="top:714px;height:84px;border-radius:42px;display:flex;align-items:center;justify-content:center;gap:16px;font:800 30px/1 'Plus Jakarta Sans';white-space:nowrap"></div>`);
    const ctaA = add(`<span style="position:absolute;display:flex;gap:14px;align-items:center">${ico('download', 30)}Pasang sekarang, sebelum dibutuhkan</span>`, cta);
    const ctaB = add(`<span style="position:absolute;display:flex;gap:14px;align-items:center">${ico('check', 30)}Gratis selamanya · tanpa iklan</span>`, cta);
    const ctaC = new ColorTrack(C.leaf).to(30.0, C.cream);
    const CW = new Track(640).to(30.0, 560, SP.shape);
    draws.push((t) => {
      const w = CW.at(t); cta.style.left = (960 - w / 2).toFixed(2) + 'px'; cta.style.width = w.toFixed(2) + 'px';
      applyVis(cta, vis(t, 29.0, null), `scale(${(popS(t, 29.0, 0.8) * press(t, 30.0)).toFixed(4)})`);
      cta.style.background = ctaC.at(t); cta.style.color = C.leafInk;
      applyVis(ctaA, vis(t, 29.1, 29.95, 0.08)); applyVis(ctaB, vis(t, 30.05, null));
    });
    cue(29.0, 'pop'); cue(30.0, 'cta');
    const fine = add(`<div class="mono" style="left:0;top:850px;width:1920px;text-align:center;font:600 24px/1 'JetBrains Mono';color:${C.muted};letter-spacing:.05em">Android 6.0+ · saling-jaga.com</div>`);
    show(fine, 30.5, null); cue(30.5, 'shimmer');

    // ───────────────────────── HUD copy (left column) ─────────────────────────
    const block = (y0, lbl, head, sub, tin, tout, lcol) => {
      const L = add(`<div class="lbl" style="left:150px;top:${y0}px;${lcol ? 'color:' + lcol : ''}">${lbl}</div>`);
      const Hh = add(`<div class="head" style="left:150px;top:${y0 + 56}px">${head}</div>`);
      const S = add(`<div class="sub" style="left:150px"></div>`); S.innerHTML = sub;
      show(L, tin, tout); show(Hh, tin + 0.25, tout);
      draws.push((t) => { S.style.top = (y0 + 56 + Hh.offsetHeight + 30) + 'px'; });
      show(S, tin + 0.5, tout);
    };
    block(330, 'Wi-Fi Direct', 'HP ke HP, <span class="serif">langsung.</span>', 'Tanpa internet, tanpa pulsa, tanpa BTS. Jangkauan 50–100 m di area terbuka.', 4.0, 7.875);
    block(330, 'Walkie-talkie & telepon', 'Tahan, lalu <span class="serif">bicara.</span>', 'Suaramu sampai ke seluruh grup sekaligus. Atau pindah ke telepon berdua.', 8.25, 11.875);
    block(330, 'Chat · foto · pengumuman', 'Grup tetap <span class="serif">hidup.</span>', 'Pesan grup dan pribadi, terenkripsi ujung ke ujung.', 12.0, 15.75);
    block(300, 'SOS dengan arah', 'Satu tombol, <span class="serif" style="color:#ff6b6b">semua HP berbunyi.</span>', 'Lengkap dengan jarak, arah, dan baterai pengirim. Bisa dipicu 5× tombol volume.', 16.0, 19.75, '#ff6b6b');
    block(330, 'Kompas & peta offline', 'Tahu siapa <span class="serif">di mana.</span>', 'Posisi tiap anggota dan titik kumpul di satu layar, tanpa internet.', 20.0, 23.5);
    [4.25, 8.5, 12.25, 16.25, 20.25].forEach((tt) => cue(tt, 'shimmer'));

    // ───────────────────────── Cursor ─────────────────────────
    const cur = add(`<div class="cur"><svg viewBox="0 0 24 24"><path d="M4 2.5 20 11l-7 1.8L9.6 20z" fill="#f2edd5" stroke="#04140a" stroke-width="1.6" stroke-linejoin="round"/></svg><span class="pill">Kamu</span></div>`);
    const rip = add('<div class="rip"></div>');
    const CX = new Track(470), CY = new Track(900), CO = new Track(0);
    const mv = (t, x, y, sp = SP.cursor) => { CX.to(t, x, sp); CY.to(t, y, sp); };
    const clicks = [7.0, HOLD, 18.5, 22.25, 23.0, 30.0];
    CO.to(6.0, 1, SP.text);
    mv(6.25, 230, 755);                     // Hubungkan semua
    mv(8.5, 352, 812);                       // talk button
    mv(11.25, 300, 700);
    mv(17.75, 300, 214);                     // Lihat arah (card button: top 114+76+22)
    mv(21.5, sariXY[0] + 6, sariXY[1] + 6);  // Sari on the compass
    mv(22.5, 290, 806);                      // Aku menuju ke sana
    CO.to(23.4, 0, SP.text);
    // outro: CTA lives in screen space; camera there is z=1, ax 960, cx 200, cy 433
    const W = (sx, sy) => [sx - 960 + 200, sy - 540 + 433];
    mv(28.75, ...W(1300, 950), SP.snap); CO.to(29.0, 1, SP.text);
    mv(29.25, ...W(1060, 760));
    mv(30.5, ...W(1240, 880), SP.soft);
    CO.to(31.25, 0, SP.text);
    cue(31.5, 'settle');
    draws.push((t) => {
      const [sx, sy] = toS(CX.at(t), CY.at(t), t);
      const o = clamp(CO.at(t));
      const vx = (toS(CX.at(t + 0.01), CY.at(t + 0.01), t + 0.01)[0] - sx) / 0.01;
      let sc = 1; for (const c of clicks) sc *= press(t, c);
      at(cur, sx, sy); cur.style.opacity = o.toFixed(3);
      cur.style.transform = `rotate(${clamp(-vx * 0.0045, -14, 14).toFixed(2)}deg) scale(${sc.toFixed(4)})`;
      let rp = null, rx = 0, ry = 0; for (const c of clicks) { const r = ripple(t, c); if (r) { rp = r; [rx, ry] = toS(CX.at(c), CY.at(c), t); } }
      if (rp && o > 0.3) { at(rip, rx, ry); rip.style.opacity = rp.o.toFixed(3); rip.style.transform = `scale(${rp.s.toFixed(3)})`; } else rip.style.opacity = 0;
    });

    // ───────────────────────── Seek ─────────────────────────
    const DUR = 32.0;
    window.seek = (t) => {
      const z = Math.exp(CAM.lz.at(t));
      world.style.transform = `translate(${(CAM.ax.at(t) + shake(t)).toFixed(2)}px, 540px) scale(${z.toFixed(5)}) translate(${(-CAM.cx.at(t)).toFixed(2)}px, ${(-CAM.cy.at(t)).toFixed(2)}px)`;
      for (const d of draws) d(t);
    };
    cues.sort((a, b) => a.t - b.t);
    window.FILM = { width: 1920, height: 1080, bpm: 120, duration: DUR,
      sections: { intro: [0, 4], build: [12, 16], drop: [16, 20], outro: [27.5, 32] }, cues };
    window.seek(0);
    window.READY = true;
  } catch (err) {
    window.FILM_ERROR = String(err && err.stack || err);
    console.error(err);
  }
})();
