// toowl · "Satu kotak cari, 100+ tools." Portrait 1080×1920, 120 BPM, 31 s.
// One shape, never cut: app pill (one app per need, the problem) → lime block → lime tile that wipes in the
// toowl monogram (the attached logo replaces every "toowl" wordmark) → the phone (home → search "pdf" →
// Kompres PDF: preset, drag quality, compress) → DROP −65% → category pill slamming the real counts under a
// 100+ odometer → settings card (four toggles) → lime monogram tile → CTA pill "toowl.my.id".
(async function () {
  try {
    const { clamp, lerp, outQ, inOut, stepR, Track, ColorTrack, SP, vis, applyVis, press, ripple, measure } = M;
    const C = { bg: '#070707', phone: '#0D0D0D', panel: '#151515', panel2: '#1C1C1C', line: 'rgba(255,255,255,.08)',
      text: '#F5F5F2', muted: '#8A8A84', dim: '#55554F', lime: '#CBFF3B', ink: '#0A0A0A' };
    const F = "'Geist'", MO = "'Geist Mono'";
    // the person's attached logo (1254² PNG, black on white); crop box of the mark inside it
    const LOGO = '../../requests/20261118-0137-5q1f/files/02-geometric-black-7oow-monogram.png';
    const LX = 102, LY = 154, LWID = 1040, LHGT = 928, LSRC = 1254;

    await Promise.all([
      document.fonts.load(`700 108px ${F}`), document.fonts.load(`600 52px ${F}`), document.fonts.load(`500 38px ${F}`),
      document.fonts.load(`400 28px ${F}`), document.fonts.load(`800 200px ${F}`),
      document.fonts.load(`500 26px ${MO}`), document.fonts.load(`600 40px ${MO}`),
    ].map((p) => p.catch(() => null)));
    await document.fonts.ready;
    await new Promise((res) => { const im = new Image(); im.onload = res; im.onerror = res; im.src = LOGO; });

    const cues = [];
    const cue = (t, k, o = {}) => cues.push({ t, k, ...o });
    const world = document.getElementById('world');
    const flash = document.getElementById('flash');
    const draws = [];
    const W = (html) => { const d = document.createElement('div'); d.innerHTML = html.trim(); const e = d.firstElementChild; world.appendChild(e); return e; };
    const at = (e, x, y) => { e.style.left = x.toFixed(2) + 'px'; e.style.top = y.toFixed(2) + 'px'; return e; };
    const rect = (e, x, y, w, h) => { at(e, x, y); e.style.width = Math.max(0, w).toFixed(2) + 'px'; e.style.height = Math.max(0, h).toFixed(2) + 'px'; };
    const ctr = (e, cx, cy) => at(e, cx - e.offsetWidth / 2, cy - e.offsetHeight / 2);
    const show = (e, tin, tout, extra = '', d = 0.12) => draws.push((t) => applyVis(e, vis(t, tin, tout, d), typeof extra === 'function' ? extra(t) : extra));
    const popS = (t, tin, s0 = 0.6) => s0 + (1 - s0) * stepR(t - tin, SP.pop);
    const bump = (t, tc, a = 0.06, d = 0.08) => 1 + a * Math.exp(-(((t - tc) / d) ** 2));
    // logo element: width w, filter 'lw' (white) or 'li' (ink); the mark is cropped out of the attachment
    const logoEl = (w, f) => {
      const k = w / LWID;
      return W(`<div class="logo" style="width:${w}px;height:${(LHGT * k).toFixed(2)}px"><img src="${LOGO}" style="width:${(LSRC * k).toFixed(2)}px;height:${(LSRC * k).toFixed(2)}px;left:${(-LX * k).toFixed(2)}px;top:${(-LY * k).toFixed(2)}px;filter:url(#${f})"></div>`);
    };
    // slanted wipe that follows the monogram's own "/" strokes
    const wipe = (p) => `polygon(-60% -10%, ${(p).toFixed(2)}% -10%, ${(p - 45).toFixed(2)}% 110%, -60% 110%)`;

    // icons: one stroke weight everywhere
    const P = (d) => `<svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
    const I = {
      zip: P('<path d="M6 2.5h8l4 4v15H6z"/><path d="M14 2.5v4h4"/><path d="M10 6h1M10 9h1M10 12h1"/><rect x="9" y="14" width="3" height="3.5" rx=".6"/>'),
      id: P('<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2"/><path d="M6 16c.6-1.6 1.7-2.3 3-2.3s2.4.7 3 2.3M14.5 10h3.5M14.5 13.5h3.5"/>'),
      qr: P('<rect x="3.5" y="3.5" width="6" height="6" rx="1"/><rect x="14.5" y="3.5" width="6" height="6" rx="1"/><rect x="3.5" y="14.5" width="6" height="6" rx="1"/><path d="M14.5 14.5h2.5v2.5M20.5 14.5v.01M17 20.5h3.5v-3"/>'),
      wallet: P('<path d="M4 7.5h15a1.5 1.5 0 0 1 1.5 1.5v9A1.5 1.5 0 0 1 19 19.5H5A1.5 1.5 0 0 1 3.5 18V6A1.5 1.5 0 0 1 5 4.5h11"/><path d="M15.5 12.5h5v3h-5z"/>'),
      merge: P('<rect x="3.5" y="3.5" width="7" height="7" rx="1"/><rect x="13.5" y="13.5" width="7" height="7" rx="1"/><path d="M14 7h3.5v3.5M10 17H6.5v-3.5"/>'),
      word: P('<path d="M6 2.5h8l4 4v15H6z"/><path d="M14 2.5v4h4"/><path d="m8.8 12 1.2 5 2-4 2 4 1.2-5"/>'),
      cut: P('<circle cx="6" cy="6" r="2.5"/><circle cx="6" cy="18" r="2.5"/><path d="M8 7.5 20 19M8 16.5 20 5"/>'),
      pen: P('<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>'),
      lock: P('<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>'),
      img: P('<rect x="3.5" y="3.5" width="17" height="17" rx="2"/><circle cx="9" cy="9" r="1.8"/><path d="m20.5 15-5-5-11 10.5"/>'),
      stamp: P('<path d="M9.5 3.5h5v5l2 3h-9l2-3z"/><path d="M5 14.5h14v3H5zM6 20.5h12"/>'),
      search: P('<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>'),
      grid: P('<rect x="4" y="4" width="6.5" height="6.5" rx="1.2"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.2"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.2"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.2"/>'),
      back: P('<path d="m15 5-7 7 7 7"/>'),
      dots: P('<path d="M6 12h.01M12 12h.01M18 12h.01" stroke-width="3"/>'),
      enter: P('<path d="M19 5v6a3 3 0 0 1-3 3H6"/><path d="m9.5 10.5-3.5 3.5 3.5 3.5"/>'),
      arrow: P('<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>'),
      dl: P('<path d="M12 4v11"/><path d="m7 10 5 5 5-5"/><path d="M5 20h14"/>'),
      shield: P('<path d="M12 3 4.5 6v5.5c0 4.5 3.2 8 7.5 9.5 4.3-1.5 7.5-5 7.5-9.5V6z"/><path d="m8.8 12 2.2 2.2 4.4-4.4"/>'),
      check: P('<path d="M20 6 9 17l-5-5"/>'),
      tuner: P('<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>'),
      moon: P('<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z"/>'),
      calc: P('<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8.5 7h7M8.5 11h.01M12 11h.01M15.5 11h.01M8.5 14.5h.01M12 14.5h.01M15.5 14.5h.01M8.5 18h7"/>'),
      erase: P('<path d="m14 4 6 6-9 9H6l-3-3z"/><path d="M9 9l6 6M11 19h9"/>'),
      sun: P('<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>'),
    };
    const ico = (k, s, col = 'currentColor') => `<span class="ic" style="width:${s}px;height:${s}px;color:${col}">${I[k]}</span>`;
    const box = (k, s, bg = C.panel2, col = C.text, r = 0.24) => `<span class="ic" style="width:${s}px;height:${s}px;border-radius:${(s * r).toFixed(0)}px;background:${bg};color:${col};align-items:center;justify-content:center;box-shadow:inset 0 0 0 2px ${C.line}">${ico(k, Math.round(s * 0.5))}</span>`;

    const SX = 540, SY = 960;

    // ───────────────────────── Camera ─────────────────────────
    const CZ = new Track(Math.log(1.0));
    const cam = (t, z, sp = SP.cam) => CZ.to(t, Math.log(z), sp);
    cam(0, 1.0); cam(0.0, 1.03, { w: 1.2, z: 1 }); cam(3.5, 1.0, { w: 12, z: 0.9 });
    cam(4.0, 1.06, { w: 1.6, z: 1 }); cam(5.5, 1.0, { w: 7, z: 1 });
    cam(8.0, 1.02, { w: 3, z: 1 }); cam(10.5, 1.0, { w: 6, z: 1 });
    cam(12.5, 1.05, { w: 3, z: 1 }); cam(15.25, 1.0, { w: 6, z: 1 });
    cam(16.0, 1.12, { w: 30, z: 0.8 }); cam(16.25, 1.0, { w: 5, z: 1 });
    cam(18.0, 1.0); cam(19.5, 1.04, { w: 1.5, z: 1 }); cam(22.25, 1.0, { w: 6, z: 1 });
    cam(26.0, 1.1, { w: 30, z: 0.8 }); cam(26.25, 1.0, { w: 4, z: 1 }); cam(28.0, 1.03, { w: 1.2, z: 1 });
    const shake = (t) => {
      let x = 0, y = 0;
      for (const [tb, a] of [[3.5, 6], [4.0, 5], [16.0, 16], [26.0, 10]]) { const h = t - tb; if (h > 0 && h < 0.6) { x += a * Math.exp(-h * 9) * Math.sin(h * 70); y += a * 0.6 * Math.exp(-h * 9) * Math.sin(h * 53); } }
      return [x, y];
    };
    draws.push((t) => {
      const z = Math.exp(CZ.at(t)), [qx, qy] = shake(t);
      world.style.transform = `translate(${qx.toFixed(2)}px,${qy.toFixed(2)}px) scale(${z.toFixed(5)})`;
      let f = 0;
      for (const [tb, a] of [[4.0, 0.1], [16.0, 0.22], [26.0, 0.16]]) { const d = t - tb; if (d >= 0) f = Math.max(f, a * Math.exp(-d * 4)); }
      flash.style.opacity = f.toFixed(3);
    });

    // ───────────────────────── Key times ─────────────────────────
    const T_BLOCK = 3.5, T_MARK = 4.0, T_PHONE = 5.5;
    const T_TAP = 8.0, T_PICK = 10.5, T_SEG = 12.0, GRAB = 12.75, LET = 13.75, T_GO = 15.5, DROP = 16.0;
    const T_CAT = 17.75, T_FEAT = 22.5, TOG = [23.0, 23.5, 24.0, 24.5], T_LOGO = 26.0, T_CTA = 28.25, CLICK = 29.5;
    const END = 31.0;

    // ───────────────────────── Background wall of real tool names (pull-back at 18) ─────────────────────────
    const NAMES = ['Gabung PDF', 'Pisah PDF', 'OCR – Foto ke Teks', 'Tuner Gitar', 'Metronom', 'Jadwal Sholat', 'Redaksi PDF',
      'Generator QR Code', 'JSON Beautifier', 'Pas Foto', 'Hapus Latar Gambar', 'Kompres Video', 'Rekam Layar', 'Cek NIK',
      'Kalkulator Zakat', 'Word ke PDF', 'Piano Online', 'Drum Online', 'Favicon Generator', 'PDF ke Markdown', 'Color Picker',
      'Watermark PDF', 'PDF ke Excel', 'Kamus Chord', 'Tanda Tangan PDF', 'Potong Video', 'Panduan P3K', 'SOS & Senter',
      'Kalkulator PPh 21', 'Kompres Gambar', 'Kartu Medis', 'Encode / Decode'];
    const WALL_ROWS = [200, 300, 400, 1460, 1560, 1660, 1760];
    let ni = 0;
    WALL_ROWS.forEach((y, ri) => {
      let x = -60 - (ri % 3) * 90;
      while (x < 1100 && ni < NAMES.length * 2) {
        const name = NAMES[ni % NAMES.length]; ni++;
        const w = measure(name, `500 32px ${F}`) + 56;
        const e = W(`<div style="height:72px;padding:0 28px;border-radius:36px;box-shadow:inset 0 0 0 2px rgba(255,255,255,.09);color:#6c6c66;font:500 32px/72px ${F};white-space:nowrap">${name}</div>`);
        at(e, x, y - 36);
        const tb = 18.0 + ((ri * 3 + ni) % 8) * 0.0625, dir = ri % 2 ? 1 : -1;
        show(e, tb, 22.125, (t) => `translateX(${(dir * (t - 18) * 22).toFixed(2)}px) scale(${popS(t, tb, 0.85).toFixed(4)})`, 0.25);
        x += w + 20;
      }
    });

    // ───────────────────────── The one shape ─────────────────────────
    const body = W('<div></div>');
    const PB = { l: new Track(SX - 300), t: new Track(1100 - 75), r: new Track(SX + 300), b: new Track(1100 + 75), rad: new Track(75), col: new ColorTrack(C.panel) };
    const pm = (t, w, h, rad, col, sp = SP.shape, cx = SX, cy = SY) => {
      const soft = { w: sp.w * 0.78, z: Math.min(1, sp.z + 0.08) };
      const L = cx - w / 2, R = cx + w / 2, T = cy - h / 2, B = cy + h / 2;
      PB.l.to(t, L, L < PB.l.cur ? sp : soft); PB.r.to(t, R, R > PB.r.cur ? sp : soft);
      PB.t.to(t, T, T < PB.t.cur ? sp : soft); PB.b.to(t, B, B > PB.b.cur ? sp : soft);
      PB.rad.to(t, rad, sp);
      if (col) PB.col.to(t, col, { w: 16, z: 1 });
    };
    const RING = new Track(1);   // ring + shadow strength (dark states)
    const ring = (t, v) => RING.to(t, v, SP.text);

    // ── Intro: one app per need ──
    const APPS = [['zip', 'Kompres PDF'], ['id', 'Pas Foto'], ['qr', 'Generator QR'], ['tuner', 'Tuner Gitar'],
      ['moon', 'Jadwal Sholat'], ['calc', 'Kalkulator Zakat'], ['word', 'PDF ke Word'], ['erase', 'Hapus Latar Gambar']];
    const APP_T = [0.5, 1.0, 1.5, 2.0, 2.5, 2.75, 3.0, 3.25];
    const pillW = (name) => 32 + 84 + 26 + measure(name, `600 50px ${F}`) + 30 + 72 + 32;
    pm(0.0, pillW(APPS[0][1]), 150, 75, C.panel, SP.shape, SX, 1100);
    APPS.forEach(([k, name], i) => {
      const tin = APP_T[i], tout = i < APPS.length - 1 ? APP_T[i + 1] - 0.0625 : T_BLOCK - 0.125;
      if (i > 0) pm(tin - 0.0625, pillW(name), 150, 75, C.panel, { w: 26, z: 0.8 }, SX, 1100);
      const e = W(`<div class="row" style="gap:26px;font:600 50px/1 ${F};color:${C.text}">${box(k, 84, '#222', C.lime)}<span>${name}</span>
        <span class="ic" style="width:72px;height:72px;border-radius:36px;background:#262626;color:${C.muted};align-items:center;justify-content:center">${ico('dl', 36)}</span></div>`);
      ctr(e, SX, 1100);
      show(e, tin, tout, '', 0.07);
      cue(tin, 'swap', { n: i });
    });
    const head1 = W(`<div style="font:700 104px/1 ${F};letter-spacing:-.045em;white-space:nowrap">Satu kebutuhan,</div>`);
    const head2 = W(`<div style="font:700 104px/1 ${F};letter-spacing:-.045em;white-space:nowrap;color:#6a6a64">satu aplikasi lagi?</div>`);
    ctr(head1, SX, 640); ctr(head2, SX, 760);
    show(head1, 0.125, T_BLOCK - 0.25); show(head2, 0.5, T_BLOCK - 0.25);
    const counter = W(`<div class="lbl tnum" style="font-size:30px"></div>`);
    draws.push((t) => {
      let n = 0; APP_T.forEach((ta, i) => { if (t >= ta) n = i + 1; });
      counter.textContent = `aplikasi terpasang · ${String(n).padStart(2, '0')}`;
      counter.style.color = n >= 6 ? '#B9B9B0' : '#77776F';
      ctr(counter, SX, 1250);
      let s = 1; APP_T.forEach((ta) => { s *= bump(t, ta + 0.02, 0.08, 0.06); });
      applyVis(counter, vis(t, 0.625, T_BLOCK - 0.25), `scale(${s.toFixed(4)})`);
    });
    cue(0.0, 'born'); cue(0.5, 'whoosh', { v: 0.4 });

    // ── Block → lime tile → the monogram wipes in ──
    pm(T_BLOCK, 72, 150, 10, C.lime, { w: 26, z: 0.78 }, SX, 1100);
    ring(T_BLOCK - 0.125, 0);
    cue(T_BLOCK, 'slam', { n: 0 });
    const TILE = 470, TCY = 860;
    pm(T_MARK - 0.25, TILE, TILE, 72, C.lime, { w: 19, z: 0.82 }, SX, TCY);
    cue(T_MARK - 0.25, 'whoosh', { v: 0.45 });
    const mark = logoEl(340, 'li');
    ctr(mark, SX, TCY);
    draws.push((t) => {
      const v = vis(t, T_MARK, T_PHONE - 0.125, 0.1);
      const p = lerp(-10, 150, inOut((t - T_MARK) / 0.375));
      mark.style.clipPath = wipe(p);
      applyVis(mark, v, `scale(${(popS(t, T_MARK, 0.86) * bump(t, 4.5, 0.03, 0.07) * bump(t, 5.0, 0.03, 0.07)).toFixed(4)})`);
    });
    cue(T_MARK, 'drop'); cue(T_MARK, 'pop'); cue(T_MARK + 0.125, 'shimmer');
    const tag = W(`<div style="font:600 64px/1.15 ${F};letter-spacing:-.03em;color:${C.muted};white-space:nowrap;text-align:center">Semua tools.<br><span style="color:${C.text}">Satu kotak cari.</span></div>`);
    ctr(tag, SX, 1290);
    show(tag, 4.5, T_PHONE - 0.125, '', 0.1);
    const tag2 = W(`<div class="lbl" style="font-size:30px;color:${C.lime}">100+ tools · terus bertambah</div>`);
    ctr(tag2, SX, 1460);
    show(tag2, 5.0, T_PHONE - 0.125, '', 0.1);
    cue(4.5, 'note', { n: 2 }); cue(5.0, 'note', { n: 4 });

    // ── Phone ──
    pm(T_PHONE, 860, 1720, 96, C.phone, { w: 15, z: 0.84 }, SX, SY);
    ring(T_PHONE, 1);
    cue(T_PHONE, 'whoosh', { v: 0.8 });

    // phone geometry (world space)
    const IL = 166, IR = 914, IW = IR - IL;

    // home header (persists through home + search): the monogram replaces the "toowl" text
    const hdrLogo = logoEl(92, 'lw');
    at(hdrLogo, IL, 160);
    show(hdrLogo, 6.0, 10.625, (t) => `scale(${popS(t, 6.0, 0.7).toFixed(4)})`);
    const hdr = W(`<div class="row" style="gap:30px;color:${C.muted}"><span class="mono" style="font:500 26px/1 ${MO};letter-spacing:.08em"><b style="color:${C.text};font-weight:600">ID</b> / EN</span>${ico('sun', 34)}</div>`);
    at(hdr, IR - hdr.offsetWidth, 160 + 41 - hdr.offsetHeight / 2);
    show(hdr, 6.0, 10.625);
    const title = W(`<div style="font:700 92px/1.02 ${F};letter-spacing:-.045em">Butuh tool<br><span style="color:#6a6a64">apa hari ini?</span></div>`);
    at(title, IL, 300);
    show(title, 6.125, T_TAP + 0.0625);
    const lb1 = W(`<div class="lbl row" style="width:${IW}px;justify-content:space-between"><span>Terakhir dipakai</span><span>04</span></div>`);
    at(lb1, IL, 545); show(lb1, 6.375, T_TAP + 0.0625);
    const TILES = [['zip', 'Kompres PDF'], ['id', 'Pas Foto'], ['qr', 'Generator QR'], ['wallet', 'Gaji Bersih']];
    TILES.forEach(([k, n], i) => {
      const e = W(`<div style="width:364px;height:200px;border-radius:30px;background:${C.panel};box-shadow:inset 0 0 0 2px ${C.line};padding:30px 30px;display:flex;flex-direction:column;justify-content:space-between">
        ${ico(k, 50, C.lime)}<span style="font:500 36px/1 ${F}">${n}</span></div>`);
      at(e, IL + (i % 2) * 384, 590 + Math.floor(i / 2) * 220);
      const tb = 6.5 + i * 0.125;
      show(e, tb, T_TAP + 0.0625, (t) => `scale(${popS(t, tb, 0.8).toFixed(4)})`);
      cue(tb, 'pop');
    });
    const lb2 = W(`<div class="lbl row" style="width:${IW}px;justify-content:space-between"><span>Populer</span><span class="lime">100+ tools</span></div>`);
    at(lb2, IL, 1080); show(lb2, 7.0, T_TAP + 0.0625);
    [['merge', 'Gabung PDF'], ['word', 'PDF ke Word'], ['img', 'Kompres Gambar'], ['erase', 'Hapus Latar Gambar']].forEach(([k, n], i) => {
      const e = W(`<div class="row" style="width:${IW}px;height:112px;gap:28px;border-bottom:2px solid ${C.line};font:500 38px/1 ${F}">${box(k, 72)}<span style="flex:1">${n}</span><span style="color:${C.dim};width:30px">${ico('arrow', 30)}</span></div>`);
      at(e, IL, 1120 + i * 112);
      show(e, 7.0 + i * 0.125, T_TAP + 0.0625);
    });

    // search bar (home + search), at the bottom where the thumb is
    const sbar = W(`<div class="row" style="width:780px;height:124px;border-radius:40px;background:${C.panel};box-shadow:inset 0 0 0 2px rgba(255,255,255,.1);padding:0 22px 0 36px;gap:22px">
      ${ico('search', 44, C.muted)}<span id="sq" style="flex:1;font:400 42px/1 ${F};color:${C.dim};position:relative"></span>
      <span id="sbtn" class="ic" style="width:84px;height:84px;border-radius:24px;background:${C.lime};color:${C.ink};align-items:center;justify-content:center">${ico('grid', 42)}</span></div>`);
    at(sbar, SX - 390, 1652);
    const sq = sbar.querySelector('#sq'), sbtn = sbar.querySelector('#sbtn');
    const KEYS = [8.375, 8.5, 8.625];
    KEYS.forEach((tk) => cue(tk, 'key'));
    draws.push((t) => {
      const nk = KEYS.filter((k) => t >= k).length;
      const caret = `<i style="display:inline-block;width:4px;height:48px;background:${C.lime};vertical-align:middle;margin:0 4px;opacity:${(Math.floor(t * 2) % 2 === 0 || (t > T_TAP && t < 9.5)) ? 1 : 0}"></i>`;
      if (t < T_TAP) sq.innerHTML = `${caret}Cari 100+ tools…`, sq.style.color = C.dim;
      else sq.innerHTML = `<span style="color:${C.text}">${'pdf'.slice(0, nk)}</span>${caret}`;
      const xo = t >= T_TAP + 0.0625 ? 1 : 0;
      sbtn.style.background = xo ? '#262626' : C.lime; sbtn.style.color = xo ? C.muted : C.ink;
      sbtn.innerHTML = ico(xo ? 'erase' : 'grid', 42);
      const s = press(t, T_TAP) * 0.6 + 0.4;
      applyVis(sbar, vis(t, 7.5, 10.625), `scale(${(s * popS(t, 7.5, 0.85)).toFixed(4)})`);
    });
    cue(7.5, 'pop');

    // search results
    const rh = W(`<div class="lbl">Hasil untuk “pdf”</div>`);
    at(rh, IL, 285); show(rh, 8.75, 10.625);
    const RES = [['zip', 'Kompres', 'Kecilkan ukuran, teks tetap tajam.'], ['merge', 'Gabung', 'Banyak file jadi satu.'],
      ['word', ' ke Word', 'Jadi dokumen yang bisa diedit.'], ['cut', 'Pisah', 'Ambil halaman yang kamu perlu.'],
      ['pen', 'Tanda Tangan', 'Tempel tanda tangan di halaman.'], ['lock', 'Proteksi', 'Kunci dengan password AES-256.'],
      ['img', 'Gambar ke', 'Foto-foto jadi satu PDF.'], ['stamp', 'Watermark', 'Teks atau logo di tiap halaman.']];
    const ROW0 = 330, RH = 134;
    const hl = W(`<div style="width:${IW + 28}px;height:${RH - 8}px;border-radius:30px;background:rgba(203,255,59,.07);box-shadow:inset 0 0 0 2px rgba(203,255,59,.28)"></div>`);
    at(hl, IL - 14, ROW0 + 4);
    show(hl, 9.25, 10.625, (t) => `scale(${(press(t, T_PICK) * 0.3 + 0.7).toFixed(4)},1)`);
    RES.forEach(([k, n, d], i) => {
      const nm = n.startsWith(' ') ? `<span class="lime">PDF</span>${n}` : `${n} <span class="lime">PDF</span>`;
      const e = W(`<div class="row" style="width:${IW}px;height:${RH}px;gap:28px">
        <span class="b">${box(k, 80)}</span><span style="flex:1"><span style="display:block;font:500 40px/1.1 ${F}">${nm}</span>
        <span style="display:block;font:400 28px/1.3 ${F};color:${C.muted};margin-top:8px">${d}</span></span>
        ${i === 0 ? `<span class="ic" style="width:60px;height:48px;border-radius:12px;box-shadow:inset 0 0 0 2px rgba(255,255,255,.18);color:${C.muted};align-items:center;justify-content:center">${ico('enter', 28)}</span>` : ''}</div>`);
      at(e, IL, ROW0 + i * RH);
      const tb = 8.75 + i * 0.0625;
      show(e, tb, 10.625 + (i === 0 ? 0.0625 : 0));
      if (i === 0) {
        const b = e.querySelector('.b');
        draws.push((t) => { const on = clamp(stepR(t - 9.25, SP.text)); b.innerHTML = on > 0.5 ? box(k, 80, C.lime, C.ink) : box(k, 80); });
      }
    });
    cue(8.75, 'whoosh', { v: 0.35 }); cue(9.25, 'tick');
    const CH = [['Semua', ''], ['Ke PDF', 4], ['Dari PDF', 5], ['Olah PDF', 12]];
    let chx = IL;
    CH.forEach(([n, c], i) => {
      const lab = c === '' ? n : `${n} <sup style="font:500 20px ${MO};opacity:.7">${c}</sup>`;
      const w = measure(n, `500 30px ${F}`) + (c === '' ? 56 : 92);
      const e = W(`<div style="height:72px;line-height:72px;padding:0 28px;border-radius:36px;white-space:nowrap;font:500 30px/72px ${F};${i === 0 ? `background:${C.lime};color:${C.ink}` : `background:${C.panel};box-shadow:inset 0 0 0 2px ${C.line};color:${C.text}`}">${lab}</div>`);
      at(e, chx, 1550); chx += w + 14;
      const tb = 9.5 + i * 0.0625;
      show(e, tb, 10.625, (t) => `scale(${popS(t, tb, 0.7).toFixed(4)})`);
    });
    cue(9.5, 'pop');

    // tool page: Kompres PDF
    const tHdr = W(`<div class="row" style="width:${IW}px;justify-content:space-between">
      <span class="ic" style="width:80px;height:80px;border-radius:24px;background:${C.panel};box-shadow:inset 0 0 0 2px ${C.line};align-items:center;justify-content:center">${ico('back', 36)}</span>
      <span style="font:600 44px/1 ${F}">Kompres PDF</span>
      <span class="ic" style="width:80px;height:80px;border-radius:24px;background:${C.panel};box-shadow:inset 0 0 0 2px ${C.line};align-items:center;justify-content:center;color:${C.muted}">${ico('dots', 36)}</span></div>`);
    at(tHdr, IL, 150); show(tHdr, 11.0, 17.5);
    const card = (y, h, inner, tin, tout, extra = '') => {
      const e = W(`<div style="width:${IW + 8}px;height:${h}px;border-radius:34px;background:${C.panel};box-shadow:inset 0 0 0 2px ${C.line};padding:34px 38px;${extra}">${inner}</div>`);
      at(e, IL - 4, y);
      show(e, tin, tout, (t) => `scale(${popS(t, tin, 0.88).toFixed(4)})`);
      cue(tin, 'pop');
      return e;
    };
    card(270, 156, `<div class="row" style="gap:26px;height:100%"><span class="ic" style="width:88px;height:88px;border-radius:18px;background:#202020;color:${C.lime};font:600 22px/88px ${MO};justify-content:center">PDF</span>
      <span style="flex:1"><span style="display:block;font:500 38px/1.1 ${F}">laporan-q3-2026.pdf</span><span class="mono" style="display:block;font:400 26px/1.4 ${MO};color:${C.muted};margin-top:6px">8,4 MB · 24 halaman</span></span></div>`, 11.25, 17.5, 'padding:0 30px');
    const qc = card(456, 360, `<div class="row" style="justify-content:space-between;font:500 34px/1 ${F};color:#cfcfc8"><span>Kualitas foto</span><span id="qv" class="mono tnum" style="font:600 34px/1 ${MO};color:${C.text}">85%</span></div>`, 11.5, 17.5);
    const qv = qc.querySelector('#qv');
    // slider (world space, own elements, so the cursor drags them directly)
    const TX0 = 200, TX1 = 880, TY = 590;
    const trk = W(`<div style="height:10px;border-radius:5px;background:#2a2a2a"></div>`);
    const fil = W(`<div style="height:10px;border-radius:5px;background:${C.lime}"></div>`);
    const knob = W(`<div style="width:52px;height:52px;border-radius:26px;background:#fff;box-shadow:0 6px 16px rgba(0,0,0,.5)"></div>`);
    const qAt = (t) => {
      if (t < GRAB) return 85;
      if (t < LET) { const x = cursorX(t); return clamp(Math.round(((x - TX0) / (TX1 - TX0)) * 100), 0, 100); }
      return 68;
    };
    const segs = ['Ringan', 'Seimbang', 'Kuat'];
    const SGX = 200, SGW = 680, SGY = 640, SGH = 100, sw = SGW / 3;
    const segBg = W(`<div style="width:${SGW}px;height:${SGH}px;border-radius:26px;background:#0E0E0E;box-shadow:inset 0 0 0 2px ${C.line}"></div>`);
    at(segBg, SGX, SGY);
    const segInd = W(`<div style="height:${SGH - 16}px;border-radius:20px;background:#2A2A2A"></div>`);
    const segL = new Track(SGX + 8).to(T_SEG, SGX + sw + 4, { w: 15, z: 0.9 });
    const segR = new Track(SGX + sw - 4).to(T_SEG, SGX + 2 * sw - 4, { w: 30, z: 0.85 });
    const segTx = segs.map((s, i) => { const e = W(`<div style="width:${sw}px;text-align:center;font:500 32px/1 ${F}">${s}</div>`); at(e, SGX + i * sw, SGY + SGH / 2 - 16); return e; });
    draws.push((t) => {
      const v = vis(t, 11.5, 17.5);
      const q = qAt(t);
      const kx = TX0 + (TX1 - TX0) * q / 100;
      rect(trk, TX0, TY - 5, TX1 - TX0, 10); rect(fil, TX0, TY - 5, kx - TX0, 10);
      const held = t >= GRAB && t < LET;
      const ks = held ? 1.18 : 1 + 0.18 * Math.exp(-(t - LET) * 12) * (t >= LET ? 1 : 0) + 0.18 * clamp((t - (GRAB - 0.08)) / 0.08) * (t < GRAB ? 1 : 0);
      at(knob, kx - 26, TY - 26);
      [trk, fil, segBg].forEach((e) => applyVis(e, v));
      applyVis(knob, v, `scale(${ks.toFixed(4)})`);
      qv.textContent = q + '%';
      const l = segL.at(t), r = segR.at(t);
      rect(segInd, l, SGY + 8, r - l, SGH - 16);
      applyVis(segInd, v, `scale(${(press(t, T_SEG) * 0.4 + 0.6).toFixed(4)})`);
      const act = t >= T_SEG + 0.06 ? 1 : 0;
      segTx.forEach((e, i) => { applyVis(e, v); e.style.color = i === act ? C.text : C.muted; e.style.fontWeight = i === act ? 600 : 500; });
    });
    cue(T_SEG, 'click'); cue(T_SEG + 0.02, 'toggle');
    cue(GRAB, 'click'); cue(GRAB, 'drag', { d: LET - GRAB }); cue(LET, 'release');
    [13.0, 13.25, 13.5].forEach((tt) => cue(tt, 'tick'));

    // estimate card → result at the drop
    card(846, 330, '', 11.75, 17.5);
    const estA = W(`<div style="width:${IW - 70}px"><div class="row" style="justify-content:space-between;font:500 32px/1 ${F};color:#cfcfc8"><span>Perkiraan hasil</span>
      <span id="ea" class="mono tnum" style="font:500 30px/1 ${MO};color:${C.text}"></span></div>
      <div id="eb" class="mono tnum" style="font:600 120px/1 ${MO};letter-spacing:-.04em;margin-top:44px;color:${C.text}"></div></div>`);
    at(estA, IL + 34, 882);
    const ea = estA.querySelector('#ea'), eb = estA.querySelector('#eb');
    const sizeAt = (q) => 4.6 - (85 - q) / 17 * 1.7;
    show(estA, 11.875, DROP - 0.125, '', 0.08);
    draws.push((t) => {
      const sz = sizeAt(qAt(t));
      ea.textContent = `8,4 MB → ${sz.toFixed(1).replace('.', ',')} MB`;
      eb.innerHTML = `−${Math.round((1 - sz / 8.4) * 100)}<span style="font-size:.55em;color:${C.muted}">%</span>`;
    });
    const res = W(`<div style="width:${IW - 70}px"><div class="row" style="justify-content:space-between;font:500 32px/1 ${F};color:${C.lime}"><span class="row" style="gap:12px">${ico('check', 34)}Selesai</span>
      <span class="mono" style="font:500 30px/1 ${MO};color:${C.text}">8,4 MB → 2,9 MB</span></div>
      <div class="row" style="align-items:baseline;gap:22px;margin-top:20px"><span style="font:800 200px/1 ${F};letter-spacing:-.06em;color:${C.lime}">−65%</span><span class="mono" style="font:500 30px ${MO};color:${C.muted}">lebih kecil</span></div></div>`);
    at(res, IL + 34, 882);
    show(res, DROP, 17.5, (t) => `scale(${popS(t, DROP, 1.25).toFixed(4)})`);
    card(1210, 150, `<div class="row" style="gap:24px;height:100%;font:400 31px/1.3 ${F};color:#cfcfc8">${ico('shield', 48, C.lime)}<span>Diproses di HP-mu.<br>Tidak pernah di-upload.</span></div>`, 16.75, 17.5, 'padding:0 34px');
    cue(16.75, 'check');
    // CTA button inside the phone
    const btn = W(`<div style="width:${IW + 30}px;height:130px;border-radius:40px;background:${C.lime};color:${C.ink};overflow:hidden;position:absolute">
      <div id="bp" style="position:absolute;left:0;top:0;bottom:0;background:rgba(0,0,0,.14)"></div>
      <div id="b1" class="row" style="position:absolute;inset:0;justify-content:center;gap:16px;font:600 44px/1 ${F}">Kompres sekarang ${ico('arrow', 40)}</div>
      <div id="b2" class="row" style="position:absolute;inset:0;justify-content:center;gap:16px;font:600 44px/1 ${F}">${ico('dl', 40)} Unduh hasil</div></div>`);
    at(btn, IL - 15, 1630);
    const bp = btn.querySelector('#bp'), b1 = btn.querySelector('#b1'), b2 = btn.querySelector('#b2');
    const foot = W(`<div class="mono" style="font:400 26px/1 ${MO};color:${C.dim};letter-spacing:.06em;white-space:nowrap">gratis · tanpa akun · tanpa upload</div>`);
    ctr(foot, SX, 1786); show(foot, 14.5, 17.5);
    draws.push((t) => {
      applyVis(btn, vis(t, 14.25, 17.5), `scale(${(popS(t, 14.25, 0.8) * (press(t, T_GO) * 0.5 + 0.5)).toFixed(4)})`);
      bp.style.width = (t < T_GO ? 0 : t < DROP ? (IW + 30) * outQ((t - T_GO) / 0.5) : 0) + 'px';
      applyVis(b1, vis(t, 14.25, DROP - 0.125, 0.08));
      applyVis(b2, vis(t, DROP + 0.125, null));
    });
    cue(14.25, 'pop'); cue(15.0, 'riser', { d: 1.0 }); cue(T_GO, 'click');
    cue(DROP, 'drop'); cue(DROP, 'slam', { n: 3 }); cue(16.5, 'settle');

    // ── Pull back: categories ──
    pm(T_CAT, 620, 150, 75, C.panel, { w: 13, z: 0.86 }, SX, 1200);
    ring(T_CAT, 0.5);
    cue(T_CAT, 'whoosh', { v: 0.9 });
    const big = W(`<div class="tnum" style="font:800 300px/1 ${F};letter-spacing:-.06em;white-space:nowrap;text-align:center;width:900px"></div>`);
    at(big, SX - 450, 560);
    const bigSub = W(`<div style="font:500 50px/1 ${F};color:${C.muted};white-space:nowrap">tools — dan terus bertambah</div>`);
    ctr(bigSub, SX, 940);
    show(bigSub, 19.0, 22.125);
    draws.push((t) => {
      const n = Math.round(100 * outQ((t - 18.0) / 1.0));
      const plus = stepR(t - 19.0, SP.pop);
      big.innerHTML = `${n}<span style="color:${C.lime};display:inline-block;transform:scale(${(0.3 + 0.7 * plus).toFixed(3)});opacity:${clamp(plus * 3).toFixed(3)}">+</span>`;
      applyVis(big, vis(t, 18.0, 22.125), `scale(${bump(t, 19.0, 0.05, 0.09).toFixed(4)})`);
    });
    for (let k = 0; k < 8; k++) cue(18.0 + k * 0.125, 'tick');
    cue(19.0, 'slam', { n: 1 });
    // pill shows each category, real counts from toowl.my.id
    const CATS = [['8 kategori', ''], ['Ke PDF', 4], ['Dari PDF', 5], ['Olah & Amankan PDF', 12], ['Gambar & Media', 24],
      ['Musik', 9], ['Developer & Desain', 10], ['Produktivitas', 35], ['Darurat', 6]];
    const CAT_T = [18.0, 19.5, 20.0, 20.5, 21.0, 21.25, 21.5, 21.75, 22.0];
    const CAT_C = [[C.panel, C.text], [C.lime, C.ink], [C.text, C.ink], [C.panel2, C.text], [C.lime, C.ink], [C.text, C.ink], [C.panel2, C.text], [C.lime, C.ink], [C.text, C.ink]];
    CATS.forEach(([n, c], i) => {
      const tin = CAT_T[i], tout = i < CATS.length - 1 ? CAT_T[i + 1] - 0.0625 : T_FEAT - 0.125;
      const nw = measure(n, `600 56px ${F}`) + (c === '' ? 0 : measure(String(c), `600 40px ${MO}`) + 72);
      if (i > 0) pm(tin - 0.0625, nw + 120, 150, 75, CAT_C[i][0], { w: 28, z: 0.78 }, SX, 1200);
      const e = W(`<div class="row" style="gap:22px;font:600 56px/1 ${F};color:${CAT_C[i][1]}">${n}${c === '' ? '' : `<span class="mono" style="font:600 40px/1 ${MO};padding:10px 16px;border-radius:18px;background:rgba(0,0,0,.12);box-shadow:inset 0 0 0 2px rgba(127,127,127,.35)">${c}</span>`}</div>`);
      ctr(e, SX, 1200);
      show(e, tin + 0.03, tout, '', 0.06);
      if (i > 0) cue(tin, 'slam', { n: i % 5 });
    });
    const catHits = CAT_T.slice(1);

    // ── Features card with four toggles ──
    pm(T_FEAT, 860, 840, 52, C.phone, { w: 15, z: 0.84 }, SX, 1010);
    ring(T_FEAT, 1);
    cue(T_FEAT, 'whoosh', { v: 0.6 });
    const ft = W(`<div style="font:700 80px/1 ${F};letter-spacing:-.045em;white-space:nowrap">Tanpa ribet.</div>`);
    at(ft, IL, 650); show(ft, 22.75, 25.625);
    const FEATS = [['Gratis', 'semua tools, tanpa langganan'], ['Tanpa akun', 'buka, langsung pakai'], ['Tanpa upload', 'file diproses di perangkatmu'], ['Bisa dipasang', 'jadi app di HP-mu']];
    const FY = 780, FH = 140;
    FEATS.forEach(([a, b], i) => {
      const y = FY + i * FH;
      const e = W(`<div class="row" style="width:${IW}px;height:${FH}px;border-top:2px solid ${C.line}"><span style="flex:1"><span style="display:block;font:600 44px/1.1 ${F}">${a}</span><span style="display:block;font:400 29px/1.3 ${F};color:${C.muted};margin-top:6px">${b}</span></span></div>`);
      at(e, IL, y);
      const tb = 22.875 + i * 0.0625;
      show(e, tb, 25.625);
      const tg = W(`<div style="width:132px;height:76px;border-radius:38px;position:absolute"></div>`);
      const kn = W(`<div style="height:60px;border-radius:30px;background:#fff;position:absolute"></div>`);
      const TT = TOG[i];
      const kl = new Track(IR - 132 + 8).to(TT, IR - 8 - 60, { w: 17, z: 0.9 });
      const kr = new Track(IR - 132 + 8 + 60).to(TT, IR - 8, { w: 34, z: 0.88 });
      const tc = new ColorTrack('#2E2E2E').to(TT, C.lime, { w: 22, z: 1 });
      at(tg, IR - 132, y + FH / 2 - 38);
      draws.push((t) => {
        const v = vis(t, tb, 25.625);
        tg.style.background = tc.at(t);
        const l = kl.at(t), r = kr.at(t);
        rect(kn, l, y + FH / 2 - 30, r - l, 60);
        kn.style.background = t >= TT + 0.05 ? C.ink : '#fff';
        applyVis(tg, v, `scale(${(press(t, TT) * 0.5 + 0.5).toFixed(4)})`); applyVis(kn, v);
      });
      cue(TT, 'click'); cue(TT + 0.01, 'toggle');
    });
    const oss = W(`<div class="lbl" style="color:${C.muted}">Open source · MIT</div>`);
    at(oss, IL, 1352); show(oss, 25.0, 25.625);
    cue(25.0, 'note', { n: 4 });

    // ── Logo tile (the attached monogram is the wordmark) ──
    const ECY = 760;
    pm(T_LOGO - 0.25, TILE, TILE, 72, C.lime, { w: 22, z: 0.8 }, SX, ECY);
    ring(T_LOGO - 0.25, 0);
    const LG = 340;
    const logoA = logoEl(LG, 'li');
    const logoB = logoEl(LG, 'lw');
    ctr(logoA, SX, ECY); ctr(logoB, SX, ECY);
    cue(T_LOGO, 'slam', { n: 4 }); cue(T_LOGO, 'drop');
    const ot = W(`<div style="font:600 60px/1.15 ${F};letter-spacing:-.03em;color:${C.muted};text-align:center;width:960px">Kumpulan tools gratis,<br><span style="color:${C.text}">langsung di browser.</span></div>`);
    ctr(ot, SX, 1150);
    show(ot, 27.0, null);
    const ol = W(`<div class="lbl" style="font-size:30px;color:${C.lime}">100+ tools · terus bertambah</div>`);
    ctr(ol, SX, 1310);
    show(ol, 27.5, null);
    cue(27.0, 'note', { n: 3 }); cue(27.5, 'note', { n: 5 });
    // tile → CTA pill
    pm(T_CTA, 660, 150, 75, C.lime, { w: 15, z: 0.84 }, SX, 1540);
    const cta = W(`<div class="row" style="gap:18px;font:600 50px/1 ${F};color:${C.ink}">toowl.my.id ${ico('arrow', 44)}</div>`);
    ctr(cta, SX, 1540);
    show(cta, T_CTA + 0.25, null);
    cue(T_CTA, 'whoosh', { v: 0.5 }); cue(CLICK, 'cta'); cue(30.0, 'shimmer');
    draws.push((t) => {
      const a = stepR(t - T_LOGO, SP.text) * (1 - clamp((t - (T_CTA - 0.05)) / 0.18));
      const sA = popS(t, T_LOGO, 1.5);
      logoA.style.opacity = a.toFixed(3);
      logoA.style.transform = `scale(${sA.toFixed(4)})`;
      logoA.style.filter = a < 0.98 ? `blur(${((1 - a) * 8).toFixed(2)}px)` : 'none';
      const b = clamp((t - (T_CTA - 0.1)) / 0.25);
      logoB.style.opacity = (b * b * (3 - 2 * b)).toFixed(3);
      logoB.style.transform = `scale(${(0.94 + 0.06 * stepR(t - T_CTA, SP.soft)).toFixed(4)})`;
      logoA.style.visibility = a > 0.001 ? 'visible' : 'hidden';
      logoB.style.visibility = b > 0.001 ? 'visible' : 'hidden';
    });

    // body sits under everything; the wall sits under the body
    world.insertBefore(body, world.firstChild);
    const bodyHits = [T_BLOCK, T_MARK, T_PHONE, T_TAP, T_PICK, T_GO, DROP, ...catHits, T_LOGO];
    draws.unshift((t) => {
      const l = PB.l.at(t), tp = PB.t.at(t), r = PB.r.at(t), b = PB.b.at(t);
      rect(body, l, tp, r - l, b - tp);
      body.style.borderRadius = Math.max(0, Math.min(PB.rad.at(t), (r - l) / 2, (b - tp) / 2)).toFixed(2) + 'px';
      body.style.background = PB.col.at(t);
      const rg = clamp(RING.at(t));
      body.style.boxShadow = `0 50px 120px rgba(0,0,0,${(0.6 * rg).toFixed(3)}), inset 0 0 0 3px rgba(255,255,255,${(0.1 * rg).toFixed(3)})`;
      let s = popS(t, 0, 0.4);
      for (const tc of bodyHits) s *= 1 - 0.03 * Math.exp(-(((t - tc) / 0.08) ** 2));
      for (const tc of APP_T) s *= bump(t, tc, 0.025, 0.06);
      s *= bump(t, 4.5, 0.02, 0.07) * bump(t, 5.0, 0.02, 0.07);
      s *= 1 - 0.35 * (1 - press(t, CLICK));
      body.style.transform = `scale(${s.toFixed(4)})`;
    });
    const wallEls = Array.from(world.children).slice(1, 1 + ni);
    wallEls.forEach((e) => world.insertBefore(e, body));

    // ───────────────────────── Cursor (“Kamu”) ─────────────────────────
    const cur = W(`<div style="width:0;height:0;z-index:50">
      <svg viewBox="0 0 24 24" style="position:absolute;left:-6px;top:-4px;width:64px;height:64px;filter:drop-shadow(0 8px 14px rgba(0,0,0,.6))"><path d="M4 2.5 19.5 12l-6.6 1.6L9.2 20z" fill="#fff" stroke="#0A0A0A" stroke-width="1.4" stroke-linejoin="round"/></svg>
      <div class="pill" style="position:absolute;left:44px;top:56px;font:600 28px/1 ${F};padding:11px 20px;border-radius:999px;background:${C.lime};color:${C.ink};white-space:nowrap">Kamu</div></div>`);
    const rip = W(`<div style="width:120px;height:120px;border-radius:60px;border:5px solid ${C.lime};z-index:49"></div>`);
    const pill = cur.querySelector('.pill');
    const CX = new Track(1000), CY = new Track(1960);
    const go = (t, x, y, sp = SP.cursor) => { CX.to(t, x, sp); CY.to(t, y, sp); };
    go(7.125, 360, 1712);                 // search bar
    go(9.0, 600, 410);                     // first result
    go(11.375, SGX + sw * 1.5, SGY + 58);  // Seimbang
    go(12.25, TX0 + (TX1 - TX0) * 0.85, TY + 6); // knob
    go(12.75, TX0 + (TX1 - TX0) * 0.68, TY + 6, { w: 9, z: 1 }); // released at 68%
    go(14.75, 600, 1700);                  // CTA
    go(16.25, 1000, 1980, { w: 6, z: 1 }); // leaves
    go(22.25, 980, 1900, SP.snap);
    TOG.forEach((tt, i) => go(tt - 0.4, IR - 60, FY + i * FH + FH / 2 + 8));
    go(25.125, 1060, 1500, { w: 7, z: 1 });
    go(28.0, 960, 1900, SP.snap);
    go(28.875, 600, 1556);
    const cursorX = (t) => t >= GRAB && t < LET ? lerp(TX0 + (TX1 - TX0) * 0.85, TX0 + (TX1 - TX0) * 0.68, inOut((t - GRAB) / (LET - GRAB - 0.15))) : CX.at(t);
    const CLICKS = [T_TAP, T_PICK, T_SEG, GRAB, T_GO, ...TOG, CLICK];
    cue(T_TAP, 'click'); cue(T_PICK, 'click');
    const curOn = (t) => Math.min(clamp((t - 7.125) / 0.2), clamp((16.75 - t) / 0.3)) + Math.min(clamp((t - 22.375) / 0.2), clamp((25.5 - t) / 0.3)) + Math.min(clamp((t - 28.125) / 0.2), clamp((30.75 - t) / 0.3));
    draws.push((t) => {
      const o = clamp(curOn(t));
      if (o <= 0.001) { cur.style.visibility = 'hidden'; rip.style.visibility = 'hidden'; return; }
      cur.style.visibility = 'visible';
      const x = cursorX(t), y = CY.at(t);
      const vx = (cursorX(t + 0.01) - cursorX(t - 0.01)) / 0.02;
      at(cur, x, y);
      let s = 1; for (const tc of CLICKS) s *= press(t, tc);
      if (t >= GRAB && t < LET) s *= 0.88;
      cur.style.opacity = o.toFixed(3);
      cur.style.transform = `rotate(${clamp(-vx * 0.0045, -14, 14).toFixed(2)}deg) scale(${s.toFixed(4)})`;
      pill.style.transform = `translateX(${clamp(-vx * 0.012, -30, 30).toFixed(2)}px)`;
      let rp = null; for (const tc of CLICKS) { const r = ripple(t, tc); if (r) rp = r; }
      if (rp) { rip.style.visibility = 'visible'; at(rip, x - 60, y - 60); rip.style.opacity = (rp.o * o).toFixed(3); rip.style.transform = `scale(${rp.s.toFixed(3)})`; }
      else rip.style.visibility = 'hidden';
    });

    window.seek = (t) => { for (const d of draws) d(t); };
    window.FILM = {
      width: 1080, height: 1920, bpm: 120, duration: END,
      sections: { intro: [0, 4], drop: [16, 20], outro: [26, END] },
      cues: cues.sort((a, b) => a.t - b.t),
    };
    window.seek(0);
    window.READY = true;
  } catch (err) {
    console.error(err);
    window.FILM_ERROR = String(err && err.stack || err);
  }
})();
