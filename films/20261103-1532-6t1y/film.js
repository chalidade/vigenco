// Saling Jaga · Wajah baru, kabar baru. Portrait 1080×1920, 120 BPM, 33 s.
// One hero shape, never cut: logo → the app's new light UI (group card folds, mic becomes a bar,
// profile sheet with switches) → the site's "Segera hadir" cards → a prefilled email → drop
// "Segera hadir" → FAQ (3 new answers, ID/EN) → Trakteer card + footer link → logo.
(async function () {
  try {
    const { clamp, lerp, stepR, Track, ColorTrack, SP, vis, applyVis, press, ripple, mix } = M;
    const C = { night: '#07110c', night2: '#0b1811', card: '#0f1f17', card2: '#13271d', cream: '#f2edd5', muted: '#a5b0a2',
      dim: '#6f7c6f', leaf: '#3cbf6e', ink: '#04140a', moss: '#1b4d2e', lamp: '#f2c46b', sos: '#ef4b4b',
      // the app's own light theme (from the 3 Nov screenshots)
      app: '#f5f4ee', appCard: '#ffffff', appInk: '#1c2a22', appGreen: '#217a4a', appHead: '#1f4f35', appGray: '#6b7068',
      appLine: '#e4e3dc', appTint: '#e6f2ea', red: '#d92d2d', redTint: '#fde8e8', amber: '#8a5a00', amberTint: '#fdf3dc',
      d: '#5c9e12', b: '#e8590c', s: '#d6336c', p: '#1e7a45' };

    await Promise.all([
      document.fonts.load('800 84px "Plus Jakarta Sans"'), document.fonts.load('500 32px "Plus Jakarta Sans"'),
      document.fonts.load('700 24px "Plus Jakarta Sans"'), document.fonts.load('600 22px "JetBrains Mono"'),
      document.fonts.load('400 30px "Plus Jakarta Sans"'), document.fonts.load('italic 400 84px "Instrument Serif"'),
    ].map((p) => p.catch(() => null)));
    await document.fonts.ready;

    const cues = [];
    const cue = (t, k, o = {}) => cues.push({ t, k, ...o });
    const world = document.getElementById('world');
    const draws = [];
    const add = (html, parent = world) => { const d = document.createElement('div'); d.innerHTML = html.trim(); const e = d.firstElementChild; parent.appendChild(e); return e; };
    const pos = (e, x, y) => { e.style.left = x + 'px'; e.style.top = y + 'px'; return e; };
    const posC = (e, cx, y) => pos(e, cx - e.offsetWidth / 2, y);
    const show = (e, tin, tout, extra = '') => draws.push((t) => applyVis(e, vis(t, tin, tout), typeof extra === 'function' ? extra(t) : extra));
    const hit = (tin, amt = 0.12, k = 9) => (t) => `scale(${(1 + amt * Math.exp(-(t - tin) * k) * (t > tin ? 1 : 0)).toFixed(3)})`;
    const popIn = (tin, s0 = 0.7) => (t) => `scale(${(s0 + (1 - s0) * stepR(t - tin, SP.pop)).toFixed(3)})`;
    const F = (w, s, lh = 1.2) => `font:${w} ${s}px/${lh} 'Plus Jakarta Sans'`;

    const P = (d, sw = 2.2) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
    const I = {
      check: P('<path d="M20 6 9 17l-5-5"/>', 2.8),
      chev: P('<path d="m6 9 6 6 6-6"/>', 2.6),
      right: P('<path d="m9 6 6 6-6 6"/>', 2.6),
      plus: P('<path d="M12 5v14M5 12h14"/>', 2.6),
      mic: P('<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0"/><path d="M12 17v5"/>'),
      kb: P('<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M6 9h.01M10 9h.01M14 9h.01M18 9h.01M7 15h10"/>'),
      phone: P('<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>'),
      vol: P('<path d="M11 5 6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/>'),
      pin: P('<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>'),
      med: P('<path d="M12 5v14M5 12h14"/>', 3),
      batt: P('<rect x="6" y="4" width="12" height="18" rx="2"/><path d="M10 2h4M12 9v6M9 12h6"/>'),
      big: P('<path d="M4 7V5h10v2M9 5v14M7 19h4M14 12v-1h6v1M17 11v8M15.5 19h3"/>'),
      cam: P('<path d="M3 8a2 2 0 0 1 2-2h2l2-2h6l2 2h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><circle cx="12" cy="13" r="3.5"/>'),
      pen: P('<path d="M17 3a2.8 2.8 0 0 1 4 4L7.5 20.5 2 22l1.5-5.5z"/>'),
      iphone: P('<rect x="6" y="2" width="12" height="20" rx="3"/><path d="M11 18h2"/>'),
      dl: P('<path d="M12 3v12M7 10l5 5 5-5"/><path d="M5 21h14"/>'),
      bell: P('<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/>'),
      heart: P('<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21.2l8.8-8.8a5.5 5.5 0 0 0 0-7.8z"/>'),
      send: P('<path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4z"/>'),
      mail: P('<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 6-10 7L2 6"/>'),
      globe: P('<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/>', 2),
      help: P('<circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01"/>', 2),
      wifi: P('<path d="M5 12.6a10 10 0 0 1 14 0M8.5 16.1a5 5 0 0 1 7 0M2 8.8a15 15 0 0 1 20 0M12 20h.01"/>'),
      swap: P('<path d="M17 3l4 4-4 4M21 7H9M7 21l-4-4 4-4M3 17h12"/>'),
      ruler: P('<path d="M3 12h18M3 8v8M21 8v8M8 10v4M12 10v4M16 10v4"/>'),
    };
    const ic = (name, size, color = 'currentColor') => `<span style="display:inline-flex;width:${size}px;height:${size}px;color:${color};flex:none">${I[name].replace('<svg ', `<svg width="${size}" height="${size}" `)}</span>`;

    // ───────────────────────── Camera ─────────────────────────
    const camZ = new Track(0)
      .to(3.25, Math.log(0.97), SP.cam).to(3.75, 0, { w: 6, z: 1 })
      .to(10.75, Math.log(0.97), SP.cam).to(11.25, 0, { w: 6, z: 1 })
      .to(15.75, Math.log(0.95), { w: 10, z: 1 }).to(16.0, Math.log(1.04), { w: 18, z: 0.8 }).to(16.75, 0, SP.cam)
      .to(18.75, Math.log(0.97), SP.cam).to(19.25, 0, { w: 6, z: 1 })
      .to(24.75, Math.log(0.97), SP.cam).to(25.25, 0, { w: 6, z: 1 })
      .to(28.75, Math.log(0.97), SP.cam).to(29.25, 0, { w: 4, z: 1 });
    const breathe = (t) => 0.004 * Math.sin(t * 0.9);
    const cam = (t) => ({ z: Math.exp(camZ.at(t) + breathe(t)), x: 540, y: 960 });

    // ───────────────────────── Hero shape ─────────────────────────
    const shape = add('<div id="shape"></div>');
    const logo = add('<img id="logo" src="assets/mark.png" alt="">', shape);
    await new Promise((r) => { if (logo.complete) r(); else { logo.onload = r; logo.onerror = r; } });
    const S = { x: new Track(540), y: new Track(900), w: new Track(0), h: new Track(0), r: new Track(160), bg: new ColorTrack(C.cream), bd: new Track(0) };
    const st = (t, x, y, w, h, r, bg, bd = 0.1, sp = SP.shape) => {
      S.x.to(t, x, sp); S.y.to(t, y, sp); S.w.to(t, w, sp); S.h.to(t, h, sp); S.r.to(t, r, sp); S.bg.to(t, bg, { w: 28, z: 1 }); S.bd.to(t, bd, SP.soft);
    };
    S.w.to(0.5, 300, SP.pop); S.h.to(0.5, 300, SP.pop); cue(0.5, 'born');
    st(3.5, 540, 1200, 820, 1240, 64, C.app, 0); cue(3.5, 'whoosh', { v: 0.6 }); cue(3.5, 'swap', { n: 0 });
    st(11.0, 540, 1180, 900, 1060, 48, C.night2, 0.13); cue(11.0, 'whoosh', { v: 0.5 }); cue(11.0, 'swap', { n: 1 });
    st(13.0, 540, 1120, 860, 860, 40, '#fbfaf4', 0); cue(13.0, 'swap', { n: 2 });
    st(16.0, 540, 1000, 920, 1000, 60, C.leaf, 0, { w: 20, z: 0.75 }); cue(16.0, 'drop');
    st(19.0, 540, 1220, 920, 1160, 48, C.card, 0.1); cue(19.0, 'whoosh', { v: 0.6 }); cue(19.0, 'swap', { n: 3 });
    st(25.0, 540, 1150, 880, 780, 48, C.card2, 0.1); cue(25.0, 'whoosh', { v: 0.5 }); cue(25.0, 'swap', { n: 4 });
    st(29.0, 540, 700, 300, 300, 150, C.cream, 0); cue(29.0, 'settle');
    draws.push((t) => {
      const w = Math.max(0, S.w.at(t)), h = Math.max(0, S.h.at(t)), x = S.x.at(t), y = S.y.at(t);
      const r = Math.min(S.r.at(t), w / 2, h / 2);
      shape.style.width = w + 'px'; shape.style.height = h + 'px';
      shape.style.transform = `translate(${(x - w / 2).toFixed(2)}px,${(y - h / 2).toFixed(2)}px)`;
      shape.style.borderRadius = r.toFixed(2) + 'px';
      shape.style.background = S.bg.at(t);
      shape.style.boxShadow = `inset 0 0 0 2px rgba(242,237,213,${clamp(S.bd.at(t), 0, 1).toFixed(3)}), 0 60px 110px -40px rgba(0,0,0,.8)`;
      const v = t < 10 ? vis(t, 0.62, 3.375) : vis(t, 29.25, null);
      const sz = Math.min(w, h) * 0.86;
      logo.style.width = sz + 'px'; logo.style.height = sz + 'px';
      applyVis(logo, v, '');
      logo.style.transform = `translate(-50%,-50%) translateY(${v.dy.toFixed(2)}px) scale(${(0.85 + 0.15 * v.e).toFixed(3)})`;
    });
    // A panel lives inside the shape at its nominal size, centred, so the shape's morph clips it.
    const panel = (w, h) => add(`<div class="panel" style="width:${w}px;height:${h}px;margin:${-h / 2}px 0 0 ${-w / 2}px"></div>`, shape);
    const inP = (pnl, html) => add(html, pnl);

    // ───────────────────────── Captions (top block) ─────────────────────────
    function caption(tin, tout, kicker, head, subs = []) {
      const g = add(`<div class="cap"><div class="kick">${kicker}</div><div class="head">${head}</div></div>`);
      const [k, h] = g.children;
      pos(g, 80, 150);
      show(k, tin, tout); show(h, tin + 0.125, tout);
      subs.forEach(([ts, txt], i) => {
        const s = pos(add(`<div class="sub">${txt}</div>`), 80, 346);
        const next = subs[i + 1] ? subs[i + 1][0] - 0.125 : tout;
        show(s, ts, next);
      });
    }
    caption(3.75, 10.85, 'Aplikasi · desain baru', 'Lebih <span class="serif">lega.</span>', [
      [4.25, 'Tampilan baru, <b>3 November</b>'],
      [5.125, 'Kartu grup jadi <b>satu baris avatar</b>'],
      [6.625, 'Tombol bicara jadi <b>bar lebar</b>'],
      [8.625, 'Menu profil jadi <b>sheet dengan saklar</b>'],
    ]);
    caption(11.25, 15.85, 'Situs · segera hadir', 'Pakai <span class="serif">iPhone?</span>', [
      [11.75, 'Dua tombol <b>Kabari saya</b>'],
      [13.125, 'Satu ketuk, <b>email sudah terisi</b>'],
    ]);
    caption(19.25, 24.85, 'Situs · FAQ', 'Tiga jawaban <span class="serif">baru.</span>', [
      [19.75, 'iPhone, Play Store, <b>cari grup</b>'],
      [23.375, 'Dalam <b>Bahasa Indonesia</b> dan <b>Inggris</b>'],
    ]);
    caption(25.25, 28.85, 'Situs · dukung', 'Ikut <span class="serif">menjaga.</span>', [
      [25.75, 'Kartu <b>Trakteer</b> untuk pengembang'],
      [27.625, 'Juga di <b>footer</b> situs'],
    ]);

    // ───────────────────────── Intro (0 – 3.5) ─────────────────────────
    const ih = add('<div class="head" style="font-size:104px;text-align:center;width:960px;line-height:1.02;white-space:normal">Wajah <span class="serif">baru,</span><br>kabar baru.</div>');
    posC(ih, 540, 1120); show(ih, 1.0, 3.25); cue(1.0, 'whoosh', { v: 0.4 });
    [['Desain aplikasi', 'big'], ['Segera hadir: iPhone & Play Store', 'bell'], ['Dukung via Trakteer', 'heart']].forEach(([l, icn], i) => {
      const e = add(`<div class="chip" style="height:80px;padding:0 32px 0 22px;background:${C.card};box-shadow:inset 0 0 0 2px rgba(242,237,213,.14);${F(700, 34, 1)}">${ic(icn, 34, C.leaf)}${l}</div>`);
      posC(e, 540, 1380 + i * 102);
      const tin = 1.75 + i * 0.5; cue(tin, 'slam', { n: i });
      show(e, tin, 3.25, hit(tin, 0.12));
    });

    // ───────────────────────── Toggle with edge-split knob ─────────────────────────
    function toggle(parent, x, y, on0, tFlip) {
      const el = inP(parent, `<div class="abs" style="left:${x}px;top:${y}px;width:104px;height:62px;border-radius:31px"><i class="abs" style="top:7px;height:48px;border-radius:24px;background:#fff;box-shadow:0 2px 6px rgba(0,0,0,.18)"></i></div>`);
      const kn = el.firstElementChild;
      const Lt = new Track(on0 ? 49 : 7), Rt = new Track(on0 ? 97 : 55);
      if (tFlip != null) { Lt.to(tFlip, 49, { w: 19, z: 0.9 }); Rt.to(tFlip, 97, { w: 34, z: 0.9 }); }
      draws.push((t) => {
        const L = Lt.at(t), R = Rt.at(t), on = clamp((L - 7) / 42);
        kn.style.left = L.toFixed(2) + 'px'; kn.style.width = (R - L).toFixed(2) + 'px';
        el.style.background = mix('#e3e2db', C.appGreen, on);
      });
      return el;
    }

    // ───────────────────────── Scene A: the app's new look (3.5 – 11) ─────────────────────────
    const A0 = 3.75, A1 = 10.875;
    const pA = panel(820, 1240);
    const aGrp = (el, tin = A0, tout = A1, extra = '') => show(el, tin, tout, extra);
    // header
    const hdr = inP(pA, `<div class="abs" style="left:36px;top:34px;width:748px;height:96px;display:flex;align-items:center;gap:18px">
      <img src="assets/mark.png" style="width:86px;height:84px">
      <div><div style="${F(800, 40, 1.1)};color:${C.appHead}">Saling Jaga</div>
      <div style="${F(500, 26, 1.3)};color:${C.appGray};display:flex;align-items:center;gap:10px"><i style="width:14px;height:14px;border-radius:50%;background:${C.appGreen};display:block"></i>Terhubung · 4 orang</div></div></div>`);
    aGrp(hdr);
    const meAv = inP(pA, `<div class="abs av" style="left:680px;top:36px;width:92px;height:92px;background:${C.d};font-size:40px">D</div>`);
    aGrp(meAv, A0, A1, (t) => `scale(${press(t, 8.5).toFixed(3)})`);
    // group card: big (MVP) → one row (new)
    const COL = 5.0;
    const gH = new Track(420).to(COL, 108, { w: 15, z: 0.86 });
    const gCard = inP(pA, `<div class="abs" style="left:36px;top:150px;width:748px;border-radius:40px;background:#fff;box-shadow:inset 0 0 0 2px ${C.appLine};overflow:hidden"></div>`);
    const gTitle = inP(gCard, `<div class="abs" style="left:30px;top:30px;${F(700, 34, 1.4)};color:${C.appInk};white-space:nowrap">Grup · 4</div>`);
    const gChev = inP(gCard, `<div class="abs" style="left:520px;top:32px;color:${C.appGray}">${ic('chev', 40)}</div>`);
    const gOut = inP(gCard, `<div class="abs chip" style="left:588px;top:24px;height:62px;padding:0 24px;background:${C.redTint};color:${C.red};${F(700, 28, 1)}">Keluar</div>`);
    const mem = [['D', C.d, 'Dewi (kamu)'], ['B', C.b, 'Budi'], ['S', C.s, 'Sari'], ['P', C.p, 'Pak RT']];
    const memEls = mem.map(([l, col, nm], i) => {
      const av = inP(gCard, `<div class="abs av" style="width:62px;height:62px;background:${col};font-size:26px;box-shadow:0 0 0 4px #fff, 0 0 0 7px ${i < 2 ? C.appGreen : 'transparent'}">${l}</div>`);
      const name = inP(gCard, `<div class="abs" style="left:126px;top:${106 + i * 74 + 14}px;${F(600, 30, 1.2)};color:${C.appInk};white-space:nowrap">${nm}</div>`);
      const X = new Track(36).to(COL, 196 + i * 76, { w: 15 + i * 1.5, z: 0.84 });
      const Y = new Track(106 + i * 74).to(COL, 23, { w: 15 + i * 1.5, z: 0.84 });
      draws.push((t) => { av.style.left = X.at(t).toFixed(1) + 'px'; av.style.top = Y.at(t).toFixed(1) + 'px'; applyVis(name, vis(t, -1, COL - 0.125, 0.1)); });
      return av;
    });
    const gchevSpin = new Track(0).to(COL, 1, SP.pop);
    draws.push((t) => {
      gCard.style.height = gH.at(t).toFixed(1) + 'px';
      gChev.style.transform = `rotate(${(180 - 180 * gchevSpin.at(t)).toFixed(1)}deg) scale(${press(t, COL).toFixed(3)})`;
      gChev.style.left = lerp(620, 560, stepR(t - COL, SP.soft)).toFixed(1) + 'px';
      gOut.style.left = lerp(588, 620, stepR(t - COL, SP.soft)).toFixed(1) + 'px';
      gOut.style.opacity = stepR(t - COL, SP.text).toFixed(3);
    });
    aGrp(gCard); cue(COL, 'click'); cue(COL, 'swap', { n: 5 });
    // chip row arrives with the new design
    const chips = inP(pA, `<div class="abs" style="left:36px;width:780px;display:flex;gap:14px">
      <span class="chip" style="height:60px;padding:0 24px;background:${C.red};color:#fff;${F(800, 26, 1)}">SOS</span>
      <span class="chip" style="height:60px;padding:0 24px;background:${C.redTint};color:${C.red};${F(700, 26, 1)}">Sirine &amp; senter</span>
      <span class="chip" style="height:60px;padding:0 24px;background:#fff;box-shadow:inset 0 0 0 2px ${C.appLine};color:${C.appGreen};${F(700, 26, 1)}">Status: Aman</span></div>`);
    const CH = 5.25; cue(CH, 'pop', { n: 1 });
    const chipS = (t) => 82 * stepR(t - CH, { w: 16, z: 0.9 });
    draws.push((t) => { chips.style.top = (150 + gH.at(t) + 20).toFixed(1) + 'px'; });
    aGrp(chips, CH, A1);
    // chat
    const chat = inP(pA, `<div class="abs" style="left:36px;width:748px;display:flex;flex-direction:column;gap:18px">
      <div style="align-self:flex-start;max-width:600px;background:#fff;border-radius:30px;padding:20px 28px;box-shadow:inset 0 0 0 2px ${C.appLine}">
        <div style="${F(700, 24, 1.3)};color:${C.appGreen}">Budi</div><div style="${F(500, 31, 1.3)};color:${C.appInk}">Aku sudah di masjid, aman.</div></div>
      <div style="background:${C.amberTint};border-radius:30px;padding:20px 28px">
        <div class="mono" style="font-size:20px;font-weight:600;color:${C.amber};letter-spacing:.04em">PENGUMUMAN · PAK RT</div><div style="${F(800, 32, 1.25)};color:${C.appInk};margin-top:6px">Titik kumpul pindah ke lapangan SD 2.</div></div>
      <div style="align-self:flex-start;max-width:640px;background:#fff;border-radius:30px;padding:20px 28px;box-shadow:inset 0 0 0 2px ${C.appLine}">
        <div style="${F(700, 24, 1.3)};color:${C.appGreen}">Sari</div><div style="${F(500, 31, 1.3)};color:${C.appInk}">Kakiku terkilir, ada yang bisa jemput?</div></div></div>`);
    draws.push((t) => { chat.style.top = (150 + gH.at(t) + 26 + chipS(t)).toFixed(1) + 'px'; });
    aGrp(chat, A0 + 0.25, A1);
    // mic: round button (MVP) → wide "Tahan untuk bicara" bar (new)
    const MIC = 6.5, H0 = 7.25, H1 = 8.0;
    const mL = new Track(340).to(MIC, 152, { w: 15, z: 0.85 }), mR = new Track(480).to(MIC, 574, { w: 26, z: 0.85 });
    const mHt = new Track(140).to(MIC, 110, SP.soft);
    const micEl = inP(pA, `<div class="abs" style="background:${C.appGreen};color:#fff;display:flex;align-items:center;justify-content:center;overflow:hidden"></div>`);
    const micIc = inP(micEl, `<div class="abs" style="top:50%;margin-top:-23px">${ic('mic', 46)}</div>`);
    const micLbl = inP(micEl, `<div class="abs" style="left:100px;top:50%;margin-top:-20px;${F(700, 31, 1.25)};white-space:nowrap">Tahan untuk bicara</div>`);
    const micWave = inP(micEl, `<div class="abs" style="left:112px;top:50%;margin-top:-24px;height:48px;display:flex;align-items:center;gap:8px">${Array.from({ length: 16 }, () => '<i style="display:block;width:8px;border-radius:4px;background:#fff"></i>').join('')}</div>`);
    const waveBars = [...micWave.children];
    draws.push((t) => {
      const L = mL.at(t), R = mR.at(t), h = mHt.at(t), held = t > H0 && t < H1;
      micEl.style.left = L.toFixed(1) + 'px'; micEl.style.width = (R - L).toFixed(1) + 'px';
      micEl.style.height = h.toFixed(1) + 'px'; micEl.style.top = (1140 - h / 2).toFixed(1) + 'px';
      micEl.style.borderRadius = (h / 2).toFixed(1) + 'px';
      micEl.style.transform = `scale(${(press(t, MIC) * press(t, H0) * press(t, H1) * (held ? 0.97 : 1)).toFixed(3)})`;
      micEl.style.background = held ? '#18603a' : C.appGreen;
      const k = stepR(t - MIC, SP.soft);
      micIc.style.left = lerp((R - L) / 2 - 23, 40, k).toFixed(1) + 'px';
      applyVis(micLbl, held ? vis(t, -1, H0, 0.1) : vis(t, t < H1 ? MIC + 0.125 : H1 + 0.06, A1));
      applyVis(micWave, vis(t, H0 + 0.04, H1, 0.1));
      waveBars.forEach((b, i) => { b.style.height = (10 + 34 * Math.abs(Math.sin(t * 9 + i * 0.9) * Math.sin(t * 3.3 + i * 1.7))).toFixed(1) + 'px'; });
    });
    aGrp(micEl); cue(MIC, 'click'); cue(MIC, 'swap', { n: 6 }); cue(H0, 'click'); cue(H0, 'drag', { d: 0.75 }); cue(H1, 'release');
    [['kb', 72, 98, 0], ['phone', 640, 98, 1], ['vol', 748, 98, 2]].forEach(([n, cx, d, i]) => {
      const b = inP(pA, `<div class="abs av" style="left:${cx - d / 2}px;top:${1140 - d / 2}px;width:${d}px;height:${d}px;background:#fff;box-shadow:inset 0 0 0 2px ${C.appLine};color:${C.appGreen}">${ic(n, 40)}</div>`);
      const tin = MIC + 0.25 + i * 0.125; cue(tin, 'pop', { n: 2 + i });
      aGrp(b, tin, A1, popIn(tin, 0.5));
    });
    // profile sheet
    const SH = 8.625, TG = 9.75;
    const dim = inP(pA, '<div class="abs" style="left:0;top:0;width:820px;height:1240px;background:#0b1811"></div>');
    const sheet = inP(pA, `<div class="abs" style="left:0;width:820px;height:1080px;background:#fff;border-radius:48px 48px 0 0;box-shadow:0 -20px 50px rgba(0,0,0,.15)"></div>`);
    const sY = new Track(1260).to(SH, 170, { w: 15, z: 0.9 });
    draws.push((t) => {
      sheet.style.top = sY.at(t).toFixed(1) + 'px';
      const o = 0.42 * stepR(t - SH, SP.text) * (1 - clamp((t - A1) / 0.12));
      dim.style.opacity = o.toFixed(3); dim.style.visibility = o > 0.001 ? 'visible' : 'hidden';
      sheet.style.visibility = t > SH - 0.01 && t < A1 + 0.12 ? 'visible' : 'hidden';
    });
    cue(SH, 'whoosh', { v: 0.35 }); cue(8.5, 'click');
    inP(sheet, `<i class="abs" style="left:370px;top:22px;width:80px;height:10px;border-radius:5px;background:${C.appLine}"></i>`);
    inP(sheet, `<div class="abs" style="left:40px;top:66px;width:740px;display:flex;align-items:center;gap:30px">
      <div style="position:relative"><div class="av" style="width:132px;height:132px;background:${C.d};font-size:58px">D</div>
      <span class="av" style="position:absolute;right:-6px;bottom:-4px;width:50px;height:50px;background:${C.appGreen};box-shadow:0 0 0 5px #fff">${ic('cam', 26, '#fff')}</span></div>
      <div><div style="${F(700, 44, 1.15)};color:${C.appInk}">Dewi</div><div style="${F(500, 26, 1.4)};color:${C.appGray}">Nama &amp; foto ini terlihat oleh grup</div></div>
      <span class="av" style="margin-left:auto;width:88px;height:88px;background:${C.appTint};color:${C.appGreen}">${ic('pen', 34)}</span></div>`);
    const lbl = (y, s) => inP(sheet, `<div class="abs mono" style="left:52px;top:${y}px;font-size:24px;font-weight:600;letter-spacing:.12em;color:${C.appGray}">${s}</div>`);
    lbl(252, 'KESELAMATAN'); lbl(824, 'LAINNYA');
    const box = (y, n) => inP(sheet, `<div class="abs" style="left:36px;top:${y}px;width:748px;height:${n * 120}px;border-radius:36px;background:${C.app}"></div>`);
    box(292, 4); box(864, 1);
    const rows = [
      [292, 'pin', 'Bagikan lokasi', 'Posisimu terlihat di peta grup', 'on'],
      [412, 'med', 'Kartu medis', '<span style="color:#8a5a00">Belum diisi</span>', 'go', true],
      [532, 'vol', 'SOS tombol volume', 'Tekan volume 5 kali', 'on'],
      [652, 'batt', 'Hemat baterai', 'Lokasi diperbarui lebih jarang', 'flip'],
      [864, 'big', 'Mode lansia', 'Tombol besar: SOS, Saya aman, Bicara', 'off'],
    ];
    rows.forEach(([y, icn, ti, su, kind, warm], i) => {
      inP(sheet, `<div class="abs" style="left:64px;top:${y + 18}px;width:640px;height:84px;display:flex;align-items:center;gap:26px">
        <span class="av" style="width:80px;height:80px;border-radius:22px;background:${warm ? C.amberTint : C.appTint};color:${warm ? C.amber : C.appGreen}">${ic(icn, 36)}</span>
        <div><div style="${F(600, 32, 1.25)};color:${C.appInk};white-space:nowrap">${ti}</div><div style="${F(500, 25, 1.35)};color:${C.appGray};white-space:nowrap">${su}</div></div></div>`);
      if (i > 0 && i < 4) inP(sheet, `<i class="abs" style="left:186px;top:${y}px;width:598px;height:2px;background:${C.appLine}"></i>`);
      if (kind === 'go') inP(sheet, `<div class="abs" style="left:704px;top:${y + 40}px;color:${C.appGray}">${ic('right', 40)}</div>`);
      else toggle(sheet, 660, y + 29, kind === 'on', kind === 'flip' ? TG : null);
    });
    cue(TG, 'toggle');
    const tgRip = inP(sheet, `<i class="abs" style="left:660px;top:681px;width:104px;height:62px;border-radius:31px;box-shadow:0 0 0 0 rgba(33,122,74,.35)"></i>`);
    draws.push((t) => { const x = clamp((t - TG) / 0.5); tgRip.style.boxShadow = x > 0 && x < 1 ? `0 0 0 ${(18 * x).toFixed(1)}px rgba(33,122,74,${(0.3 * (1 - x)).toFixed(3)})` : 'none'; });

    // ───────────────────────── Scene B: "Segera hadir" cards (11 – 13) ─────────────────────────
    const B0 = 11.25, B1 = 12.875, KAB = 13.0;
    const pB = panel(900, 1060);
    const nCard = (y, icn, title, body, btn, primary, tin) => {
      const c = inP(pB, `<div class="abs" style="left:40px;top:${y}px;width:820px;height:468px;border-radius:36px;background:${C.card};box-shadow:inset 0 0 0 2px rgba(242,237,213,.1);padding:40px 44px">
        <div style="display:flex;align-items:center;gap:20px">${ic(icn, 52, C.leaf)}<span style="${F(800, 44, 1.1)}">${title}</span></div>
        <div style="${F(500, 31, 1.4)};color:#c9cdb9;margin-top:22px;width:720px">${body}</div>
        <div class="chip kb" style="position:absolute;left:44px;bottom:40px;height:92px;padding:0 38px 0 30px;${primary ? `background:${C.leaf};color:${C.ink}` : `box-shadow:inset 0 0 0 2.5px rgba(242,237,213,.4);color:${C.cream}`};${F(800, 34, 1)}">${ic('bell', 34)}${btn}</div></div>`);
      show(c, tin, B1, popIn(tin, 0.94)); cue(tin, 'pop', { n: tin === B0 + 0.25 ? 0 : 1 });
      return c.querySelector('.kb');
    };
    const kabBtn = nCard(40, 'iphone', 'Versi iPhone', 'Aplikasinya sudah jadi dan bisa satu grup dengan HP Android. Uji coba lewat TestFlight.', 'Kabari saya', true, B0 + 0.25);
    nCard(548, 'dl', 'Google Play Store', 'Segera tersedia, jadi update datang sendiri. Sambil menunggu, APK di situs sama.', 'Kabari saat rilis', false, B0 + 0.75);
    draws.push((t) => { kabBtn.style.transform = `scale(${press(t, KAB).toFixed(3)})`; });
    cue(KAB, 'click');

    // ───────────────────────── Scene B2: the prefilled email (13 – 16) ─────────────────────────
    const E0 = 13.125, E1 = 15.875, NAMEC = 13.75, TY0 = 14.0, SEND = 15.0;
    const pE = panel(860, 860);
    const eTop = inP(pE, `<div class="abs" style="left:0;top:0;width:860px;height:124px;display:flex;align-items:center;padding:0 40px;gap:18px;border-bottom:2px solid ${C.appLine}">
      ${ic('mail', 40, C.appGreen)}<span style="${F(800, 38, 1)};color:${C.appInk}">Pesan baru</span>
      <span class="chip snd" style="margin-left:auto;height:80px;padding:0 34px 0 28px;background:${C.appGreen};color:#fff;${F(800, 32, 1)}">${ic('send', 32)}Kirim</span></div>`);
    show(eTop, E0, E1);
    const sendBtn = eTop.querySelector('.snd');
    draws.push((t) => { sendBtn.style.transform = `scale(${press(t, SEND).toFixed(3)})`; });
    const eRow = (y, k, v, tin) => {
      const r = inP(pE, `<div class="abs" style="left:40px;top:${y}px;width:780px;min-height:96px;display:flex;gap:18px;align-items:baseline;padding-top:28px;border-bottom:2px solid ${C.appLine}">
        <span style="${F(600, 28, 1.3)};color:${C.appGray};white-space:nowrap">${k}</span><span style="${F(700, 30, 1.3)};color:${C.appInk}">${v}</span></div>`);
      show(r, tin, E1); cue(tin, 'tick');
      return r;
    };
    eRow(124, 'Kepada', 'chalidade@gmail.com', 13.25);
    eRow(220, 'Subjek', 'Kabari saya: Saling Jaga untuk iPhone', 13.375);
    const body = inP(pE, `<div class="abs" style="left:40px;top:350px;width:780px;${F(500, 32, 1.45)};color:${C.appInk}">
      <div>Halo, kabari saya saat Saling Jaga bisa dipasang di iPhone.</div>
      <div style="margin-top:34px;display:flex;align-items:center;height:56px"><span style="color:${C.appGray}">Nama:&nbsp;</span><b class="nm" style="font-weight:800"></b><i class="caret" style="display:block;width:3px;height:40px;margin-left:3px;background:${C.appGreen}"></i></div>
      <div style="color:${C.appGray};height:56px;display:flex;align-items:center">Kota:</div>
      <div style="color:${C.appGray}">Mau ikut uji coba TestFlight (ya/tidak):</div></div>`);
    show(body, 13.5, E1); cue(13.5, 'tick');
    const nmEl = body.querySelector('.nm'), caret = body.querySelector('.caret');
    const NAME = 'Rani';
    for (let i = 0; i < NAME.length; i++) cue(TY0 + i * 0.125, 'key');
    cue(NAMEC, 'click');
    draws.push((t) => {
      const n = clamp(Math.floor((t - TY0) / 0.125) + 1, 0, NAME.length);
      nmEl.textContent = t < TY0 ? '' : NAME.slice(0, n);
      caret.style.opacity = t > NAMEC && t < SEND ? (Math.floor(t * 4) % 2 ? 0.25 : 1) : 0;
    });
    const auto = inP(pE, `<div class="abs chip mono" style="left:40px;top:740px;height:64px;padding:0 24px;background:${C.appTint};color:${C.appGreen};font-size:24px;font-weight:600">${ic('check', 26)}Subjek &amp; isi terisi otomatis</div>`);
    show(auto, 13.625, E1, popIn(13.625, 0.85)); cue(13.625, 'check');
    const sent = inP(pE, `<div class="abs" style="left:0;top:0;width:860px;height:860px;background:#fbfaf4;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:30px">
      <span class="av" style="width:150px;height:150px;background:${C.appGreen}">${ic('check', 80, '#fff')}</span>
      <span style="${F(800, 48, 1.1)};color:${C.appInk}">Terkirim</span><span style="${F(500, 30, 1.3)};color:${C.appGray}">Kamu akan dikabari saat rilis</span></div>`);
    show(sent, SEND + 0.25, E1, popIn(SEND + 0.25, 0.9)); cue(SEND, 'click'); cue(SEND + 0.25, 'whoosh', { v: 0.4 }); cue(SEND + 0.5, 'check');

    // ───────────────────────── Drop: Segera hadir (16 – 19) ─────────────────────────
    const D0 = 16.125, D1 = 18.875;
    const pD = panel(920, 1000);
    const dK = inP(pD, `<div class="abs mono" style="left:70px;top:90px;font-size:28px;font-weight:600;letter-spacing:.14em;color:${C.ink};opacity:.7">SALING JAGA</div>`);
    show(dK, D0, D1);
    const dH = inP(pD, `<div class="abs" style="left:66px;top:150px;${F(800, 128, 1)};letter-spacing:-.045em;color:${C.ink};white-space:nowrap">Segera<br><span class="serif" style="font-size:1.1em;letter-spacing:-.01em">hadir.</span></div>`);
    show(dH, D0, D1, hit(D0, 0.06, 8));
    [['iphone', 'Versi iPhone', 'Uji coba lewat TestFlight', 16.5], ['dl', 'Google Play Store', 'Update datang sendiri', 17.0]].forEach(([icn, ti, su, tin], i) => {
      const e = inP(pD, `<div class="abs" style="left:60px;top:${470 + i * 172}px;width:800px;height:150px;border-radius:40px;background:${C.ink};display:flex;align-items:center;gap:30px;padding:0 40px">
        <span class="av" style="width:90px;height:90px;border-radius:26px;background:${C.leaf};color:${C.ink}">${ic(icn, 48)}</span>
        <div><div style="${F(800, 42, 1.15)};color:${C.cream}">${ti}</div><div style="${F(500, 28, 1.3)};color:${C.muted}">${su}</div></div></div>`);
      show(e, tin, D1, hit(tin, 0.1)); cue(tin, 'slam', { n: 3 + i });
    });
    const dNote = inP(pD, `<div class="abs" style="left:70px;top:840px;width:780px;${F(600, 30, 1.35)};color:${C.ink}">Sambil menunggu, APK di situs adalah aplikasi yang sama.</div>`);
    show(dNote, 17.75, D1); cue(17.75, 'note', { n: 2 });

    // ───────────────────────── Scene C: FAQ (19 – 25) ─────────────────────────
    const C0 = 19.25, C1 = 24.875, OPEN = 20.75, EN = 23.25;
    const pC = panel(920, 1160);
    const swapTxt = (id, en, tout = C1) => {
      const w = document.createElement('span'); w.style.position = 'relative'; w.style.display = 'block';
      w.innerHTML = `<span class="i" style="display:block">${id}</span><span class="e" style="display:block;position:absolute;left:0;top:0;width:100%">${en}</span>`;
      const [a, b] = w.children;
      draws.push((t) => { applyVis(a, vis(t, -1, EN, 0.1)); applyVis(b, vis(t, EN + 0.06, null)); });
      return w;
    };
    const cTop = inP(pC, `<div class="abs" style="left:44px;top:40px;width:832px;height:84px;display:flex;align-items:center;gap:18px">${ic('help', 46, C.leaf)}<span style="${F(800, 42, 1)}">Tanya jawab</span></div>`);
    show(cTop, C0, C1);
    const seg = inP(pC, `<div class="abs" style="left:656px;top:44px;width:220px;height:76px;border-radius:38px;background:${C.night2};box-shadow:inset 0 0 0 2px rgba(242,237,213,.12)">
      <i class="abs" style="top:6px;height:64px;border-radius:32px;background:${C.leaf}"></i>
      <span class="abs mono a" style="left:0;top:0;width:110px;height:76px;display:flex;align-items:center;justify-content:center;font-size:26px;font-weight:600">ID</span>
      <span class="abs mono b" style="left:110px;top:0;width:110px;height:76px;display:flex;align-items:center;justify-content:center;font-size:26px;font-weight:600">EN</span></div>`);
    show(seg, C0 + 0.125, C1);
    const segI = seg.firstElementChild, segA = seg.querySelector('.a'), segB = seg.querySelector('.b');
    const sL = new Track(6).to(EN, 110, { w: 19, z: 0.9 }), sR = new Track(110).to(EN, 214, { w: 34, z: 0.9 });
    draws.push((t) => {
      const L = sL.at(t), R = sR.at(t), k = clamp((L - 6) / 104);
      segI.style.left = L.toFixed(1) + 'px'; segI.style.width = (R - L).toFixed(1) + 'px';
      segA.style.color = mix(C.ink, C.muted, k); segB.style.color = mix(C.muted, C.ink, k);
      seg.style.transform = `translateY(0) scale(${press(t, EN).toFixed(3)})`;
    });
    cue(EN, 'click'); cue(EN, 'swap', { n: 7 });
    const qs = [['Ada versi iPhone?', 'Is there an iPhone version?'], ['Kapan ada di Play Store?', 'When will it be on Play Store?'], ['HP saya tidak menemukan grup. Kenapa?', 'My phone can’t find the group. Why?']];
    const rowH = (i) => (i === 2 ? new Track(146).to(OPEN, 616, { w: 15, z: 0.88 }) : new Track(146));
    let yAcc = 160;
    qs.forEach(([id, en], i) => {
      const H = rowH(i), y = yAcc; yAcc += 146 + 20;
      const r = inP(pC, `<div class="abs" style="left:40px;top:${y}px;width:840px;border-radius:32px;background:${C.card2};box-shadow:inset 0 0 0 2px rgba(242,237,213,${i === 2 ? '.16' : '.08'});overflow:hidden"></div>`);
      const q = inP(r, `<div class="abs" style="left:40px;top:0;width:660px;height:146px;display:flex;align-items:center;${F(700, 34, 1.25)}"></div>`);
      q.appendChild(swapTxt(id, en));
      const pl = inP(r, `<div class="abs" style="left:752px;top:47px;color:${C.leaf}">${ic('plus', 52)}</div>`);
      draws.push((t) => {
        r.style.height = H.at(t).toFixed(1) + 'px';
        if (i === 2) { pl.style.transform = `rotate(${(45 * stepR(t - OPEN, SP.pop)).toFixed(1)}deg)`; r.style.transform = `scale(${(1 - 0.03 * Math.exp(-(((t - OPEN) / 0.05) ** 2))).toFixed(4)})`; }
      });
      const tin = 19.5 + i * 0.25; show(r, tin, C1, popIn(tin, 0.94)); cue(tin, 'pop', { n: i });
      if (i === 2) {
        const ans = [['wifi', 'Wi‑Fi dan Lokasi menyala di kedua HP', 'Wi‑Fi and Location on, on both phones'],
          ['ruler', 'Jarak tidak lebih dari 50–100 m', 'No more than 50–100 m apart'],
          ['swap', 'Masih gagal? Tukar peran: yang mencari jadi pembuat grup', 'Still failing? Swap roles: the searching phone creates the group']];
        ans.forEach(([icn, aid, aen], j) => {
          const a = inP(r, `<div class="abs" style="left:40px;top:${160 + j * 140}px;width:760px;display:flex;gap:22px;align-items:flex-start;${F(500, 31, 1.35)};color:#c9cdb9">
            <span class="av" style="width:64px;height:64px;border-radius:20px;background:rgba(60,191,110,.16);color:${C.leaf};flex:none">${ic(icn, 32)}</span><div style="flex:1;padding-top:10px"></div></div>`);
          a.lastElementChild.appendChild(swapTxt(aid, aen));
          const ta = 21.25 + j * 0.5; show(a, ta, C1); cue(ta, 'check');
        });
      }
    });
    cue(OPEN, 'click'); cue(OPEN, 'swap', { n: 8 });

    // ───────────────────────── Scene D: Trakteer (25 – 29) ─────────────────────────
    const T0 = 25.25, T1 = 28.875, TRK = 27.0, FT = 27.5, FH = 28.0;
    const pT = panel(880, 780);
    const heart = inP(pT, `<div class="abs av" style="left:56px;top:56px;width:120px;height:120px;border-radius:34px;background:rgba(242,196,107,.16);color:${C.lamp}">${ic('heart', 60)}</div>`);
    show(heart, T0, T1, (t) => `scale(${(1 + 0.22 * Math.exp(-(t - TRK - 0.125) * 7) * (t > TRK + 0.125 ? 1 : 0) + 0.12 * Math.exp(-(t - TRK - 0.625) * 7) * (t > TRK + 0.625 ? 1 : 0)).toFixed(3)})`);
    const tH = inP(pT, `<div class="abs" style="left:56px;top:216px;${F(800, 54, 1.1)};white-space:nowrap">Mau ikut membantu?</div>`);
    show(tH, T0 + 0.125, T1);
    const tP = inP(pT, `<div class="abs" style="left:56px;top:300px;width:770px;${F(500, 32, 1.42)};color:#c9cdb9">Saling Jaga gratis selamanya dan dibuat mandiri. Dukunganmu membantu biaya akun <b style="color:${C.cream}">Apple Developer</b> untuk versi iPhone.</div>`);
    show(tP, T0 + 0.25, T1);
    const tBtn = inP(pT, `<div class="abs chip" style="left:56px;top:560px;height:104px;padding:0 44px 0 34px;background:${C.lamp};color:${C.ink};${F(800, 36, 1)}">${ic('heart', 38)}Traktir di Trakteer</div>`);
    show(tBtn, T0 + 0.5, T1, (t) => `scale(${(press(t, TRK) * (0.92 + 0.08 * stepR(t - T0 - 0.5, SP.pop))).toFixed(3)})`);
    cue(T0 + 0.5, 'pop', { n: 2 }); cue(TRK, 'click'); cue(TRK + 0.125, 'note', { n: 4 }); cue(TRK + 0.625, 'note', { n: 6 });
    // footer row of the site
    const fLbl = add(`<div class="mono" style="font-size:22px;font-weight:600;letter-spacing:.12em;color:${C.dim}">FOOTER SITUS</div>`);
    pos(fLbl, 100, 1600); show(fLbl, FT, T1);
    const fl = [['Lapor masalah'], ['Usul fitur'], ['Dukung via Trakteer', true], ['Privasi']];
    let fx = 100;
    fl.forEach(([s, hot], i) => {
      const e = add(`<div class="chip" style="height:64px;padding:0 24px;${F(700, 27, 1)};color:${C.muted};box-shadow:inset 0 0 0 2px rgba(242,237,213,.12)">${hot ? ic('heart', 26) : ''}${s}</div>`);
      if (i === 3) { fx = 100; }
      pos(e, fx, i < 3 ? 1646 : 1730); fx += e.offsetWidth + 14;
      const tin = FT + i * 0.125; cue(tin, 'tick');
      if (hot) {
        draws.push((t) => {
          const k = stepR(t - FH, { w: 24, z: 0.8 });
          e.style.background = `rgba(242,196,107,${(0.95 * k).toFixed(3)})`;
          e.style.color = mix(C.muted, C.ink, k);
        });
        show(e, tin, T1, hit(FH, 0.12));
      } else show(e, tin, T1);
    });
    cue(FH, 'slam', { n: 5 });

    // ───────────────────────── Outro (29 – 33) ─────────────────────────
    const wm = add(`<div style="${F(800, 128, 1)};letter-spacing:-.045em;white-space:nowrap">Saling Jaga</div>`);
    posC(wm, 540, 920); show(wm, 29.5, null, hit(29.5, 0.06, 8)); cue(29.5, 'slam', { n: 6 });
    const tag = add(`<div style="${F(500, 46, 1.25)};color:#c9cdb9;text-align:center;width:900px">Saat sinyal hilang,<br>kita tetap <span class="serif" style="color:#3cbf6e;font-size:1.18em">saling jaga.</span></div>`);
    posC(tag, 540, 1090); show(tag, 30.0, null); cue(30.0, 'note', { n: 3 });
    [['Desain baru', 'big'], ['Segera: iPhone & Play Store', 'bell'], ['Dukung via Trakteer', 'heart']].forEach(([l, icn], i) => {
      const e = add(`<div class="chip" style="height:76px;padding:0 30px 0 22px;background:${C.card};box-shadow:inset 0 0 0 2px rgba(242,237,213,.14);${F(700, 32, 1)}">${ic(icn, 32, C.leaf)}${l}</div>`);
      posC(e, 540, 1310 + i * 96);
      const tin = 30.5 + i * 0.25; cue(tin, 'pop', { n: i + 2 });
      show(e, tin, null, popIn(tin, 0.85));
    });
    const url = add('<div class="mono" style="font-size:36px;font-weight:600;color:#f2edd5">saling-jaga.my.id</div>');
    posC(url, 540, 1640); show(url, 31.5, null); cue(31.5, 'cta');
    const fine = add(`<div class="mono" style="font-size:24px;color:${C.dim};letter-spacing:.06em;white-space:nowrap">Gratis · tanpa iklan · tanpa akun</div>`);
    posC(fine, 540, 1710); show(fine, 32.0, null); cue(32.0, 'shimmer');

    // ───────────────────────── Cursor ─────────────────────────
    function cursor(name, pillBg, pillFg, X, Y, clicks, on, held = () => false) {
      const cur = add(`<div class="cur"><svg viewBox="0 0 24 24"><path d="M4 2.5 20 11l-7 1.8L9.6 20z" fill="#f2edd5" stroke="#04140a" stroke-width="1.4" stroke-linejoin="round"/></svg><div class="pill" style="background:${pillBg};color:${pillFg}">${name}</div></div>`);
      const rip = add('<div class="rip"></div>');
      draws.push((t) => {
        const vis1 = on(t);
        cur.style.visibility = vis1 ? 'visible' : 'hidden';
        if (!vis1) { rip.style.visibility = 'hidden'; return; }
        const x = X.at(t), y = Y.at(t), vx = (x - X.at(t - 0.016)) / 0.016;
        let s = 1; clicks.forEach((tc) => { s *= press(t, tc); }); if (held(t)) s *= 0.9;
        cur.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) rotate(${clamp(-vx * 0.0045, -14, 14).toFixed(2)}deg) scale(${s.toFixed(3)})`;
        cur.lastChild.style.transform = `translateX(${clamp(-vx * 0.012, -18, 18).toFixed(1)}px)`;
        let r = null; for (const tc of clicks) { const q = ripple(t, tc); if (q) r = q; }
        if (r) { rip.style.visibility = 'visible'; rip.style.transform = `translate(${x}px,${y}px) scale(${r.s.toFixed(3)})`; rip.style.opacity = r.o.toFixed(3); }
        else rip.style.visibility = 'hidden';
      });
    }
    const KX = new Track(1000), KY = new Track(1980);
    const mv = (t, x, y, sp = SP.cursor) => { KX.to(t, x, sp); KY.to(t, y, sp); };
    mv(4.35, 690, 790);            // chevron, click 5.0
    mv(5.85, 540, 1716);           // round mic, click 6.5
    mv(6.75, 600, 1726);           // hold 7.25 – 8.0
    mv(7.9, 876, 668);             // header avatar, click 8.5
    mv(9.1, 838, 1456);            // Hemat baterai, click 9.75
    mv(10.15, 1010, 1990);
    mv(11.9, 1000, 1980, SP.snap);
    mv(12.35, 330, 1075);          // Kabari saya, click 13.0
    mv(13.25, 520, 1192);          // Nama, click 13.75
    mv(14.4, 822, 752);            // Kirim, click 15.0
    mv(15.35, 1010, 1990);
    mv(19.9, 1000, 1980, SP.snap);
    mv(20.15, 560, 1112);          // row 3, click 20.75
    mv(22.6, 912, 716);            // EN, click 23.25
    mv(23.6, 1010, 1990);
    mv(25.9, 1000, 1980, SP.snap);
    mv(26.35, 380, 1392);          // Trakteer, click 27.0
    mv(27.4, 1010, 1990);
    cursor('Kamu', C.leaf, C.ink, KX, KY, [COL, MIC, H0, H1, 8.5, TG, KAB, NAMEC, SEND, OPEN, EN, TRK],
      (t) => (t > 4.3 && t < 10.7) || (t > 12.2 && t < 15.8) || (t > 20.0 && t < 24.0) || (t > 26.2 && t < 27.9), (t) => t > H0 && t < H1);

    // ───────────────────────── seek ─────────────────────────
    const DUR = 33.0;
    window.seek = (t) => {
      const c = cam(t);
      world.style.transform = `translate(540px,960px) scale(${c.z.toFixed(5)}) translate(${-c.x}px,${-c.y}px)`;
      for (const d of draws) d(t);
    };
    cues.forEach((c) => { const g = c.t / 0.125; if (Math.abs(g - Math.round(g)) > 1e-6) throw new Error('cue off grid: ' + JSON.stringify(c)); });
    cues.sort((a, b) => a.t - b.t);
    window.FILM = { width: 1080, height: 1920, bpm: 120, duration: DUR,
      sections: { intro: [0, 3.5], drop: [16, 19], outro: [29, DUR] }, cues };
    window.seek(0);
    window.READY = true;
  } catch (err) {
    console.error(err);
    window.FILM_ERROR = String(err && err.stack || err);
  }
})();
