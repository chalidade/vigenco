// Saling Jaga → Covatom · "Wajah baru". Portrait 1080×1920, 120 BPM, 36 s.
// One shape, never cut: the bear badge → the old green app → back to the badge → it turns into the
// "co" ligature (drop: covatom) → the mark becomes the app icon → the icon opens into the new home →
// chat → SOS sheet → offline compass → walkie-talkie → feature pills → the pill becomes the "co" again.
(async function () {
  try {
    const { clamp, lerp, outQ, stepR, Track, ColorTrack, SP, vis, applyVis, press, ripple, measure } = M;
    const C = {
      // before: Saling Jaga
      oldBg: '#EEF0E8', oldBar: '#2F6B2E', oldGreen: '#3C8D3F', oldBody: '#F2F1EC', oldInk: '#1E5A2A', oldBright: '#3BAA48',
      oldYellow: '#FBF1CF', oldGrey: '#E3E3DD',
      // after: Covatom
      bg: '#F3F5F9', navy: '#0F1B35', panel: '#18264A', line2: '#2C3D66', blue: '#1677FF', blueT: '#E7F0FF',
      ink: '#0F1B35', muted: '#6B7690', soft: '#9AA7C4', line: '#E3E7EF', grey: '#F1F3F7',
      red: '#E5383B', redT: '#FDECEC', green: '#12A150', greenT: '#E3F6EA', amber: '#B86E00', amberT: '#FFF4DF',
      orange: '#E07B2E', pink: '#D9447A', pGreen: '#2E9E5B',
    };
    const OF = "'Outfit'", IN = "'Inter'";
    const BEAR = '../../requests/20261122-0729-bfrq/files/03-gemini-generated-image-w07wg6w07wg6w07w-.png';
    await Promise.all([
      document.fonts.load(`500 100px ${OF}`), document.fonts.load(`600 100px ${OF}`), document.fonts.load(`400 40px ${OF}`),
      document.fonts.load(`400 24px ${IN}`), document.fonts.load(`500 24px ${IN}`), document.fonts.load(`600 24px ${IN}`), document.fonts.load(`700 24px ${IN}`),
      document.fonts.load(`400 24px Roboto`), document.fonts.load(`500 24px Roboto`), document.fonts.load(`700 24px Roboto`),
      document.fonts.load(`600 40px Fredoka`), document.fonts.load(`700 40px Fredoka`),
      new Promise((res) => { const im = new Image(); im.onload = res; im.onerror = res; im.src = BEAR; }),
    ].map((p) => p.catch(() => null)));
    await document.fonts.ready;

    const cues = [];
    const cue = (t, k, o = {}) => cues.push({ t, k, ...o });
    const stage = document.getElementById('stage');
    const world = document.getElementById('world');
    const hud = document.getElementById('hud');
    const draws = [];
    const W = (html, parent = world) => { const d = document.createElement('div'); d.innerHTML = html.trim(); const e = d.firstElementChild; if (parent !== world && parent !== hud && !parent.classList.contains('lay')) e.style.position = 'absolute'; parent.appendChild(e); return e; };
    const show = (e, tin, tout, extra = '', d = 0.12) => draws.push((t) => applyVis(e, vis(t, tin, tout, d), typeof extra === 'function' ? extra(t) : extra));
    const popS = (t, tin, s0 = 0.6) => s0 + (1 - s0) * stepR(t - tin, SP.pop);
    const bump = (t, tc, a = 0.06, d = 0.08) => 1 + a * Math.exp(-(((t - tc) / d) ** 2));
    const lin = (t, a, b) => clamp((t - a) / (b - a));
    const px = (v) => v.toFixed(2) + 'px';
    const A = (l, tp, w, h, inner, st = '') => `<div style="left:${l}px;top:${tp}px;${w != null ? `width:${w}px;` : ''}${h != null ? `height:${h}px;` : ''}${st}">${inner}</div>`;

    // icons: one stroke weight (2), round caps
    const P = (d, sw = 2) => `<svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
    const I = {
      back: P('<path d="m15 5-7 7 7 7"/>', 2.4),
      chev: P('<path d="m9 5 7 7-7 7"/>', 2.2),
      phone: P('<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>'),
      grid: P('<rect x="4" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5"/>'),
      home: P('<path d="M4 11 12 4l8 7v8.5a1.5 1.5 0 0 1-1.5 1.5H15v-6H9v6H5.5A1.5 1.5 0 0 1 4 19.5z"/>'),
      chat: P('<path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v10a1.5 1.5 0 0 1-1.5 1.5H9l-5 4z"/>'),
      compass: P('<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>'),
      mic: P('<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0"/><path d="M12 17.5V21"/>'),
      cam: P('<path d="M4 8h3l1.5-2.5h7L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>'),
      plus: P('<path d="M12 5v14M5 12h14"/>', 2.2),
      check: P('<path d="M20 6 9 17l-5-5"/>', 2.6),
      alert: P('<path d="M12 3 2 20h20z"/><path d="M12 10v4.5"/><path d="M12 17.5h.01" stroke-width="2.8"/>'),
      list: P('<path d="M9 6h11M9 12h11M9 18h11"/><path d="M4.5 6h.01M4.5 12h.01M4.5 18h.01" stroke-width="3"/>'),
      nav: P('<path d="M20 4 4 11l7 2 2 7z"/>'),
      wave: P('<path d="M3 12h2M7 8v8M11 5v14M15 8v8M19 11v2"/>'),
    };
    const ico = (k, s, col = 'currentColor') => `<span class="ic" style="width:${s}px;height:${s}px;color:${col}">${I[k]}</span>`;

    // covatom mark (from the brand file): c centre 391.1, o centre 632.9, R 195.57, r 103.23
    const MK_W = 632.9, MK_H = 391.14, MK_X0 = 195.53, MK_Y0 = 316.43;
    const C_PATH = 'M487.23 341.67A195.57 195.57 0 1 0 487.23 682.33A224.1 224.1 0 0 1 430.17 607.57A103.23 103.23 0 1 1 430.17 416.43A224.1 224.1 0 0 1 487.23 341.67Z';
    const O_PATH = 'M510.79 359.21A195.57 195.57 0 1 1 510.79 664.79A194.07 194.07 0 0 0 567.86 592.19A103.23 103.23 0 1 0 567.86 431.81A194.07 194.07 0 0 0 510.79 359.21Z';
    const B_PATH = 'M512 358.26A195.57 195.57 0 0 0 512 665.74A195.57 195.57 0 0 0 569.07 593.16A103.23 103.23 0 0 1 569.07 430.84A195.57 195.57 0 0 0 512 358.26Z';
    const miniMark = (h, a = C.navy, b = C.blue) => `<svg width="${(h * MK_W / MK_H).toFixed(1)}" height="${h}" viewBox="${MK_X0} ${MK_Y0} ${MK_W} ${MK_H}" style="display:block;flex:none"><path fill="${a}" d="${C_PATH}${O_PATH}"/><path fill="${b}" d="${B_PATH}"/></svg>`;
    const bearImg = (s) => { // the bear art crop (art spans ~115..390 × 80..345 of the 500px file)
      const k = (s * 0.87) / 275, bs = 500 * k;
      return `<div style="width:${s}px;height:${s}px;background:url('${BEAR}') no-repeat;background-size:${bs.toFixed(1)}px;background-position:${(s / 2 - 252 * k).toFixed(1)}px ${(s / 2 - 212 * k).toFixed(1)}px"></div>`;
    };

    // ───────────────────────── stage colour (old canvas → new canvas at the drop)
    const BG = new ColorTrack(C.oldBg).to(11.9, C.bg, { w: 16, z: 1 });

    // ───────────────────────── camera
    const zT = new Track(1.08)
      .to(0.0, 1.0, SP.cam).to(3.6, 0.98, SP.cam).to(7.5, 1.0, SP.cam)
      .to(10.9, 1.06, { w: 3, z: 1 }).to(12.0, 1.0, { w: 10, z: 0.8 })
      .to(23.9, 1.03, SP.cam).to(24.4, 1.0, SP.cam).to(33.0, 1.0, SP.cam).to(34.0, 1.03, { w: 2, z: 1 });

    // ───────────────────────── HERO: the one shape
    const hero = W(`<div style="overflow:hidden;box-shadow:0 28px 70px rgba(15,27,53,.10)"></div>`);
    const hole = W(`<div style="position:absolute;left:50%;top:50%;border-radius:50%"></div>`, hero);
    const HX = new Track(540), HY = new Track(900), HW = new Track(460), HH = new Track(460), HR = new Track(230);
    const HC = new ColorTrack('#FFFFFF');
    const morph = (t, x, y, w, h, r, col, sp = SP.shape) => {
      HX.to(t, x, sp); HY.to(t, y, sp); HW.to(t, w, sp); HH.to(t, h, sp); HR.to(t, r, sp); if (col) HC.to(t, col, SP.soft);
    };
    const lay = (w, h, html) => W(`<div class="lay" style="width:${w}px;height:${h}px;margin-left:${-w / 2}px;margin-top:${-h / 2}px">${html}</div>`, hero);

    // ───────────────────────── captions (top band)
    const cap = (html, tin, tout, col = C.navy, size = 76) => {
      const e = W(`<div class="o" style="left:60px;width:960px;top:150px;height:200px;display:flex;align-items:center;justify-content:center;text-align:center;font-weight:600;font-size:${size}px;letter-spacing:-0.015em;line-height:1.06;color:${col}">${html}</div>`, hud);
      show(e, tin, tout); return e;
    };

    // ══════════════ A · 0–4  the bear badge
    cue(0.0, 'born');
    const A1 = lay(460, 460, `<div style="left:0;top:0">${bearImg(460)}</div>`);
    show(A1, 0.05, 3.55);
    const word = W(`<div style="left:0;width:1080px;top:1210px;text-align:center;font-family:Fredoka;font-weight:700;font-size:104px;letter-spacing:.005em"><span style="color:${C.oldInk}">Saling</span> <span style="color:${C.oldBright}">Jaga</span></div>`);
    show(word, 1.0, 3.5);
    cue(1.0, 'pop');
    cap('Kenal Saling Jaga?', 0.5, 1.9, C.oldInk);
    cap('Siaga bersama,<br>bahkan tanpa sinyal.', 2.0, 3.4, C.oldInk);
    cue(0.5, 'note', { n: 0 }); cue(2.0, 'swap', { n: 1 }); cue(3.0, 'note', { n: 2 });

    // ══════════════ B · 4–8  the old app (green, Roboto, square)
    morph(3.6, 540, 1040, 860, 1420, 26, '#FFFFFF');
    cue(3.6, 'whoosh', { v: 0.5 });
    const OB = 860, OH = 1420;
    const B0 = lay(OB, OH, `
      ${A(0, 0, OB, OH, '', `background:${C.oldBody}`)}
      ${A(0, 0, OB, 160, `<div class="row rb" style="height:100%;padding:0 34px;gap:22px;color:#fff">
          ${ico('back', 38)}
          <div style="width:84px;height:84px;border-radius:42px;background:#fff;overflow:hidden;flex:none">${bearImg(84)}</div>
          <div><div style="font-size:40px;font-weight:500">Grup · 4 orang</div><div style="font-size:24px;opacity:.85;margin-top:4px">Budi, Sari, Pak RT</div></div>
          <div style="flex:1"></div>${ico('phone', 36)}
          <div style="width:64px;height:64px;border-radius:32px;background:#67B33A;display:flex;align-items:center;justify-content:center;font-size:30px;font-weight:500">C</div></div>`, `background:${C.oldBar}`)}`);
    show(B0, 3.85, 7.4);
    const oldMsgs = [
      [4.0, A(60, 200, 740, null, `<div class="rb" style="text-align:center;font-size:22px;color:#6E6E68;line-height:1.35;padding:14px 24px;background:#fff;border:1px solid ${C.oldGrey};border-radius:6px">Tanpa internet dan tanpa sinyal. Nyalakan Wi-Fi dan Lokasi di setiap HP, lalu ketuk ikon cari.</div>`)],
      [4.0, A(310, 310, 240, null, `<div class="rb" style="text-align:center;font-size:22px;color:#6E6E68;padding:8px 0;background:#fff;border:1px solid ${C.oldGrey};border-radius:6px">Budi bergabung</div>`)],
      [4.25, A(260, 400, 560, null, `<div class="rb" style="font-size:30px;line-height:1.35;color:#fff;padding:22px 26px;background:${C.oldBar};border-radius:8px">Oke, aku menuju ke sana lewat gang belakang.<div style="text-align:right;font-size:20px;opacity:.8;margin-top:6px">02:15</div></div>`)],
      [4.5, A(40, 600, 600, null, `<div class="rb" style="font-size:30px;line-height:1.35;color:#222;padding:20px 26px;background:#fff;border:1px solid ${C.oldGrey};border-radius:8px"><div style="font-size:22px;color:#C0392B;margin-bottom:4px">Budi</div>Aku sudah di masjid, aman. Air mulai naik di jalan utama.</div>`)],
      [4.75, A(40, 820, 780, null, `<div class="rb" style="font-size:30px;line-height:1.35;color:#222;padding:20px 26px;background:${C.oldYellow};border-radius:8px"><div style="font-size:20px;color:#8A6D00;margin-bottom:6px;letter-spacing:.04em">PENGUMUMAN · Pak RT</div>Titik kumpul pindah ke lapangan SD 2. Bawa obat dan air minum.</div>`)],
      [5.0, A(40, 1050, 580, null, `<div class="rb" style="font-size:30px;line-height:1.35;color:#222;padding:20px 26px;background:#fff;border:1px solid ${C.oldGrey};border-radius:8px"><div style="font-size:22px;color:#C0392B;margin-bottom:4px">Sari</div>Kakiku terkilir, ada yang bisa jemput?</div>`)],
      [4.0, A(0, OH - 130, OB, 130, `<div class="row rb" style="height:100%;padding:0 30px;gap:22px">
          <div class="osos" style="width:80px;height:80px;border-radius:40px;background:#D93A2F;color:#fff;font-size:24px;font-weight:700;display:flex;align-items:center;justify-content:center">SOS</div>
          <div class="row" style="flex:1;height:76px;border-radius:38px;background:#fff;border:1px solid ${C.oldGrey};padding:0 26px;gap:16px;color:#8A8A84;font-size:28px">${ico('plus', 28)}Ketik pesan<div style="flex:1"></div>${ico('cam', 30)}</div>
          <div style="width:80px;height:80px;border-radius:40px;background:${C.oldBar};color:#fff;display:flex;align-items:center;justify-content:center">${ico('mic', 34)}</div></div>`, 'background:#fff;border-top:1px solid #DDD')],
    ];
    oldMsgs.forEach(([tin, html]) => { const e = W(html, B0); show(e, tin, 7.4); });
    [4.25, 4.5, 4.75, 5.0].forEach((tc) => cue(tc, 'pop'));
    // old SOS dialog (square, text buttons)
    const dim = W(A(0, 0, OB, OH, '', 'background:rgba(0,0,0,.45)'), B0);
    show(dim, 6.0, 7.4);
    const oldDlg = W(A(80, 470, 700, 500, `<div class="rb" style="padding:44px 44px 0">
        <div style="font-size:44px;font-weight:500;color:#222">Kirim SOS?</div>
        <div style="font-size:28px;line-height:1.42;color:#444;margin-top:22px">Semua anggota grup akan mendengar alarm dan melihat lokasinya sampai SOS dibatalkan.</div></div>
        <div class="row rb" style="position:absolute;right:36px;bottom:34px;gap:44px;font-size:26px;font-weight:500;letter-spacing:.06em;color:${C.oldBar}"><span>SOS + SMS</span><span>BATAL</span><span class="ks">KIRIM SOS</span></div>`,
      'background:#fff;border-radius:4px;box-shadow:0 12px 40px rgba(0,0,0,.3)'), B0);
    show(oldDlg, 6.0, 7.4, (t) => `scale(${popS(t, 6.0, 0.92).toFixed(4)})`);
    cue(6.0, 'pop');
    cap('Fiturnya sudah lengkap.', 4.0, 5.9, C.oldInk);
    cap('Tapi tampilannya<br>butuh napas baru.', 6.0, 7.9, C.oldInk);

    // ══════════════ C · 8–12  the badge becomes the "co"
    morph(7.5, 540, 900, 460, 460, 230, '#FFFFFF');
    cue(7.5, 'whoosh', { v: 0.5 });
    const C1 = lay(460, 460, `<div style="left:0;top:0">${bearImg(460)}</div>`);
    show(C1, 7.75, 8.9);
    cue(7.75, 'settle');
    cap('Mulai dari logonya.', 8.0, 11.9, C.oldInk);
    const MB = 380; // big mark height = hero diameter
    morph(9.0, 540, 900, MB, MB, MB / 2, C.oldGreen);
    cue(9.0, 'swap', { n: 0 });
    HC.to(9.5, C.navy, SP.soft);
    cue(9.5, 'swap', { n: 2 });
    const HOLE = new Track(0).to(9.6, MB * 103.23 / 195.57, { w: 20, z: 0.86 }).to(13.0, 0, SP.snap);
    // ending hole: grows inside the end circle (diameter set later)
    let HOLE2 = null;

    // ══════════════ the wordmark (built once, used at the drop and at the end)
    const F0 = 200;
    const _ctx = document.createElement('canvas').getContext('2d');
    const xhAt = (F) => { _ctx.font = `500 ${F}px ${OF}`; return _ctx.measureText('x').actualBoundingBoxAscent; };
    const totAt = (F) => { const mh = xhAt(F); return mh * MK_W / MK_H + F * 0.035 + measure('vatom', `500 ${F}px ${OF}`); };
    const F = F0 * 860 / totAt(F0);
    const mh = xhAt(F), mw = mh * MK_W / MK_H, vw = measure('vatom', `500 ${F}px ${OF}`), gap = F * 0.035;
    const tot = mw + gap + vw;
    const LX = 540 - tot / 2, BASE = 960;
    const mcx = LX + mw / 2, mcy = BASE - mh / 2; // mark centre (world)
    const U = mh / MK_H; // px per mark unit
    const ringR = (195.57 + 103.23) / 2, ringW = 195.57 - 103.23;
    const logo = W(`<div style="left:${px(LX)};top:${px(BASE - mh)};width:${px(tot)};height:${px(mh)}">
      <svg class="mk" width="${mw.toFixed(2)}" height="${mh.toFixed(2)}" viewBox="${MK_X0} ${MK_Y0} ${MK_W} ${MK_H}" style="position:absolute;left:0;top:0;overflow:visible">
        <g class="rings"><circle class="rc" cx="391.1" cy="512" r="${ringR}" fill="none" stroke-width="${ringW}"/><circle class="ro" cx="632.9" cy="512" r="${ringR}" fill="none" stroke-width="${ringW}"/></g>
        <g class="brand"><path class="pc" d="${C_PATH}"/><path class="po" d="${O_PATH}"/><path class="pb" fill="${C.blue}" d="${B_PATH}"/></g></svg>
      <div style="position:absolute;left:${px(mw + gap)};top:${px(-F)};width:${px(vw + 40)};height:${px(F + mh + F * 0.3)};overflow:hidden">
        <svg class="vt" width="${(vw + 40).toFixed(1)}" height="${(F + mh + F * 0.3).toFixed(1)}" style="position:absolute;left:0;top:0;overflow:visible"><text x="0" y="${(F + mh).toFixed(2)}" font-family="Outfit" font-weight="500" font-size="${F.toFixed(2)}" fill="${C.navy}">vatom</text></svg></div>
    </div>`);
    const rc = logo.querySelector('.rc'), ro = logo.querySelector('.ro'), rings = logo.querySelector('.rings'), brand = logo.querySelector('.brand');
    const pc = logo.querySelector('.pc'), po = logo.querySelector('.po'), pb = logo.querySelector('.pb'), vt = logo.querySelector('.vt');
    const s0 = MB / mh, sIcon = 150 / mh;
    const LS = new Track(s0).to(12.0, 1, { w: 13, z: 0.84 }).to(14.0, sIcon, { w: 15, z: 0.86 }).to(32.9, 1, SP.snap);
    const LDX = new Track(540 - mcx).to(12.0, 0, { w: 13, z: 0.86 }).to(14.0, 540 - mcx, { w: 15, z: 0.88 }).to(32.9, 0, SP.snap);
    const LDY = new Track(900 - mcy).to(12.0, 0, { w: 13, z: 0.86 }).to(14.0, 900 - mcy, { w: 15, z: 0.88 }).to(32.9, 0, SP.snap);
    const SPLIT = new Track(1).to(10.0, 0, { w: 15, z: 0.84 }).to(32.9, 1, SP.snap).to(33.0, 0, { w: 15, z: 0.84 });
    const MFILL = new ColorTrack(C.navy).to(14.0, '#FFFFFF', SP.soft).to(32.9, C.navy, SP.snap);
    const VX = new Track(-vw - 60).to(12.0, 0, { w: 14, z: 0.88 }).to(13.9, -vw - 60, { w: 16, z: 1 }).to(33.5, 0, { w: 14, z: 0.88 });
    const markOn = (t) => (t >= 10.0 && t < 15.25) || t >= 33.0;
    const brandOn = (t) => (t >= 10.5 && t < 32.9) || t >= 33.5;
    cue(10.0, 'tick'); cue(10.0, 'whoosh', { v: 0.4 }); cue(10.5, 'pop'); cue(11.0, 'riser', { d: 1.0 });
    cue(12.0, 'drop'); cue(12.0, 'slam', { n: 0 });
    draws.push((t) => {
      const on = markOn(t);
      logo.style.visibility = on ? 'visible' : 'hidden';
      if (!on) return;
      const s = LS.at(t) * bump(t, 12.02, 0.05, 0.08) * bump(t, 33.52, 0.04, 0.08);
      const o = t < 32 ? 1 - lin(t, 15.0, 15.2) : 1;
      logo.style.opacity = o.toFixed(3);
      logo.style.filter = t > 15.0 && t < 15.25 ?`blur(${(lin(t, 15.0, 15.2) * 10).toFixed(2)}px)` : 'none';
      logo.style.transformOrigin = `${px(mw / 2)} ${px(mh / 2)}`;
      logo.style.transform = `translate(${px(LDX.at(t))},${px(LDY.at(t))}) scale(${s.toFixed(4)})`;
      const sp = SPLIT.at(t), off = 120.9 * sp;
      const fill = MFILL.at(t);
      const b = brandOn(t);
      rings.style.display = b ? 'none' : ''; brand.style.display = b ? '' : 'none';
      rc.setAttribute('stroke', fill); ro.setAttribute('stroke', fill);
      rc.setAttribute('transform', `translate(${off.toFixed(2)} 0)`); ro.setAttribute('transform', `translate(${(-off).toFixed(2)} 0)`);
      pc.setAttribute('fill', fill); po.setAttribute('fill', fill);
      const bo = t < 32.9 ? lin(t, 10.5, 10.65) : lin(t, 33.5, 33.65);
      pb.setAttribute('opacity', bo.toFixed(3));
      vt.style.transform = `translateX(${VX.at(t).toFixed(2)}px)`;
    });

    // ══════════════ D · 12–16  wordmark → app icon → the new app opens
    const tag = (tin, tout) => { const e = W(`<div class="o" style="left:0;width:1080px;top:${px(BASE + 70)};text-align:center;font-weight:400;font-size:50px;letter-spacing:.08em;color:#5A6789;white-space:nowrap">Every node, bonded.</div>`); show(e, tin, tout); return e; };
    tag(13.0, 13.85);
    cue(13.0, 'shimmer');
    cap('Nama baru: Covatom.', 12.5, 14.4);
    cue(12.5, 'note', { n: 3 });
    // icon: the hero returns as a navy app tile behind the mark
    morph(13.9, 540, 900, 300, 300, 76, C.navy, SP.snap);
    cue(14.0, 'pop');
    cap('Tampilan baru,<br>lebih segar.', 14.5, 19.4);
    cue(14.5, 'swap', { n: 4 });
    morph(15.0, 540, 1070, 880, 1480, 64, '#FFFFFF', { w: 14, z: 0.82 });
    cue(15.0, 'whoosh', { v: 0.7 });

    // ══════════════ E · 15.5–19.5  new home
    const NB = 880, NH = 1480;
    const E0 = lay(NB, NH, '');
    show(E0, 15.4, 19.45);
    const eItems = [
      [15.5, A(48, 44, 784, 72, `<div class="row" style="height:100%;gap:18px">${miniMark(56)}<span class="o" style="font-size:46px;font-weight:600;color:${C.ink}">Covatom</span><div style="flex:1"></div>
         <span style="color:${C.ink}">${ico('grid', 40)}</span><div style="width:72px;height:72px;border-radius:36px;background:${C.pGreen};color:#fff;font-size:32px;font-weight:600;display:flex;align-items:center;justify-content:center;margin-left:14px">C</div></div>`)],
      [15.625, A(48, 150, null, 52, `<div class="row" style="height:100%;padding:0 22px;gap:10px;border-radius:26px;background:${C.grey};font-size:23px;font-weight:500;color:${C.muted}"><i style="width:12px;height:12px;border-radius:6px;background:#B5BDCD"></i>Belum terhubung ke HP lain</div>`)],
      [15.75, A(48, 236, 784, 340, '', `border:2px solid ${C.line};border-radius:36px;background:#fff`)],
      [16.0, A(48, 620, 784, 40, `<div class="row" style="height:100%;font-size:22px;font-weight:600;letter-spacing:.08em;color:${C.muted}">GRUP &amp; CHAT<div style="flex:1"></div><span style="letter-spacing:0;font-size:25px;color:${C.blue}">Hubungkan HP</span></div>`)],
      [16.125, A(48, 680, 784, 150, `<div class="row" style="height:100%;padding:0 30px;gap:26px"><div style="width:88px;height:88px;border-radius:44px;background:${C.navy};display:flex;align-items:center;justify-content:center">${miniMark(30, '#fff')}</div>
         <div><div style="font-size:32px;font-weight:600;color:${C.ink}">Grup belum ada</div><div style="font-size:24px;color:${C.muted};margin-top:6px">Ketuk untuk menghubungkan HP</div></div></div>`, `border:2px solid ${C.line};border-radius:32px`)],
      [16.25, A(48, 854, 784, 170, `<div class="row" style="height:100%;padding:0 30px;gap:26px"><div style="width:88px;height:88px;border-radius:26px;background:${C.blueT};color:${C.blue};display:flex;align-items:center;justify-content:center">${ico('list', 40)}</div>
         <div style="flex:1"><div style="font-size:32px;font-weight:600;color:${C.ink}">Siap Siaga</div><div style="font-size:24px;color:${C.muted};margin-top:6px">2 dari 9 siap · persiapan sebelum bencana</div>
         <div style="margin-top:14px;height:10px;border-radius:5px;background:${C.grey}"><div class="bar" style="width:22%;height:100%;border-radius:5px;background:${C.blue}"></div></div></div><span style="color:${C.soft}">${ico('chev', 32)}</span></div>`, `border:2px solid ${C.line};border-radius:32px`)],
    ];
    eItems.forEach(([tin, html]) => { const e = W(html, E0); show(e, tin, 19.45); });
    [15.5, 16.0].forEach((tc) => cue(tc, 'pop'));
    // status card content
    const st1 = W(A(80, 268, 600, 40, `<div style="font-size:22px;font-weight:600;letter-spacing:.08em;color:${C.muted}">STATUS KAMU</div>`), E0); show(st1, 15.875, 19.45);
    const stA = W(A(80, 316, 700, 70, `<div class="row" style="height:100%;gap:18px"><i style="width:22px;height:22px;border-radius:11px;background:#B5BDCD"></i><span class="o" style="font-size:54px;font-weight:600;color:${C.ink}">Belum diatur</span><span style="font-size:22px;color:${C.muted};margin-left:12px">terkirim saat terhubung</span></div>`), E0);
    show(stA, 15.875, 17.55);
    const stB = W(A(80, 316, 700, 70, `<div class="row" style="height:100%;gap:18px"><i style="width:22px;height:22px;border-radius:11px;background:${C.green}"></i><span class="o" style="font-size:54px;font-weight:600;color:${C.green}">Aman</span><span style="font-size:22px;color:${C.muted};margin-left:12px">dikirim ke grup</span></div>`), E0);
    show(stB, 17.6, 19.45);
    const chipXs = [[80, 170, 'Aman'], [266, 300, 'Butuh bantuan'], [582, 214, 'Terluka']];
    const chips = chipXs.map(([l, w, s], i) => {
      const e = W(A(l, 436, w, 80, `<div class="row cp" style="height:100%;justify-content:center;gap:10px;border-radius:40px;border:2px solid ${C.line};font-size:28px;font-weight:600;color:${C.ink}">${i === 0 ? `<span class="ck" style="display:inline-flex;width:0;overflow:hidden">${ico('check', 28)}</span>` : ''}${s}</div>`), E0);
      show(e, 16.0 + i * 0.125, 19.45); return e;
    });
    const aman = chips[0].querySelector('.cp'), ck = chips[0].querySelector('.ck');
    const AMAN = 17.5;
    draws.push((t) => {
      const x = stepR(t - AMAN, SP.soft);
      aman.style.background = x > 0.01 ? `rgba(18,161,80,${(x * 0.12).toFixed(3)})` : 'transparent';
      aman.style.borderColor = x > 0.5 ? C.green : C.line;
      aman.style.color = x > 0.5 ? C.green : C.ink;
      ck.style.width = px(34 * stepR(t - AMAN, SP.pop));
      chips[0].style.transform += ` scale(${press(t, AMAN).toFixed(4)})`;
    });
    cue(AMAN, 'click'); cue(AMAN + 0.03, 'check');
    // bottom nav with a liquid indicator
    const nav = W(A(0, 1300, NB, 180, '', `border-top:2px solid ${C.line};background:#fff`), E0);
    show(nav, 15.75, 19.45);
    const ind = W(`<div style="left:0;top:16px;height:64px;border-radius:32px;background:${C.blueT}"></div>`, nav);
    const navItems = [['home', 'Beranda'], ['chat', 'Chat'], [null, 'Tahan'], ['compass', 'Kompas'], ['grid', 'Darurat']];
    const navEls = navItems.map(([k, s], i) => {
      const cx = 88 + i * 176;
      if (!k) return W(`<div style="left:${cx - 66}px;top:-40px;width:132px;text-align:center"><div style="width:132px;height:132px;border-radius:66px;background:${C.red};color:#fff;font-size:34px;font-weight:700;display:flex;align-items:center;justify-content:center;border:8px solid #fff">SOS</div><div style="font-size:22px;font-weight:600;color:${C.red};margin-top:6px">${s}</div></div>`, nav);
      return W(`<div style="left:${cx - 80}px;top:28px;width:160px;text-align:center"><div class="ni" style="height:40px;display:flex;justify-content:center">${ico(k, 40)}</div><div class="nl" style="font-size:22px;font-weight:600;margin-top:20px">${s}</div></div>`, nav);
    });
    const IL = new Track(28).to(19.0, 204, { w: 13, z: 0.9 });
    const IR = new Track(148).to(19.0, 324, { w: 30, z: 0.9 });
    const CHAT = 19.0;
    draws.push((t) => {
      const l = IL.at(t), r = IR.at(t);
      ind.style.left = px(l); ind.style.width = px(r - l);
      const x = stepR(t - CHAT, SP.text);
      navEls[0].style.color = M.mix(C.blue, '#8A93A8', x); navEls[1].style.color = M.mix('#8A93A8', C.blue, x);
      navEls[1].style.transform = `scale(${press(t, CHAT).toFixed(4)})`;
    });
    cue(CHAT, 'click'); cue(CHAT, 'drag', { d: 0.3 });

    // ══════════════ F · 19.5–23  new chat
    const F0c = lay(NB, NH, '');
    show(F0c, 19.45, 22.85);
    const fItems = [
      [19.5, A(0, 0, NB, 156, `<div class="row" style="height:100%;padding:0 34px;gap:22px">
          <span style="color:${C.ink}">${ico('back', 38)}</span>
          <div style="width:84px;height:84px;border-radius:42px;background:${C.navy};display:flex;align-items:center;justify-content:center">${miniMark(28, '#fff')}</div>
          <div><div class="o" style="font-size:42px;font-weight:600;color:${C.ink}">Grup</div>
            <div class="row" style="gap:10px;margin-top:4px;font-size:23px;color:${C.muted}"><span class="row">${[[C.pink, 'S'], [C.orange, 'B'], [C.pGreen, 'P']].map(([c, s], i) => `<i style="font-style:normal;width:30px;height:30px;border-radius:15px;background:${c};color:#fff;font-size:15px;font-weight:700;display:flex;align-items:center;justify-content:center;border:2px solid #fff;margin-left:${i ? -8 : 0}px">${s}</i>`).join('')}</span>4 orang · 3 aman</div></div>
          <div style="flex:1"></div><span style="color:${C.ink}">${ico('phone', 36)}</span>
          <div class="sos" style="width:150px;height:72px;border-radius:36px;background:${C.red};color:#fff;font-size:28px;font-weight:700;display:flex;align-items:center;justify-content:center;margin-left:10px">SOS</div></div>`, `border-bottom:2px solid ${C.line}`)],
      [19.75, A(90, 186, 700, null, `<div style="text-align:center;font-size:23px;line-height:1.4;color:${C.muted};padding:16px 26px;background:${C.grey};border-radius:20px">Bisa tanpa internet dan tanpa sinyal. Pastikan Wi-Fi dan Lokasi menyala di semua HP.</div>`)],
      [19.875, A(240, 318, 400, null, `<div style="text-align:center;font-size:22px;font-weight:500;color:${C.muted};padding:10px 0;background:${C.grey};border-radius:22px">Budi, Sari dan Pak RT bergabung</div>`)],
      [20.0, A(280, 404, 560, null, `<div style="font-size:30px;line-height:1.38;color:#fff;padding:24px 30px;background:${C.blue};border-radius:34px 34px 10px 34px">Oke, aku menuju ke sana lewat gang belakang.<div style="text-align:right;font-size:20px;opacity:.8;margin-top:6px">05:24</div></div>`)],
      [20.5, A(40, 600, 640, null, `<div class="row" style="align-items:flex-end;gap:16px"><i style="font-style:normal;width:56px;height:56px;border-radius:28px;background:${C.orange};color:#fff;font-size:24px;font-weight:700;display:flex;align-items:center;justify-content:center;flex:none">B</i>
          <div style="white-space:normal;font-size:30px;line-height:1.38;color:${C.ink};padding:22px 28px;background:${C.grey};border-radius:34px 34px 34px 10px"><div style="font-size:22px;font-weight:600;color:${C.orange};margin-bottom:4px">Budi</div>Aku sudah di masjid, aman. Air mulai naik di jalan utama.</div></div>`)],
      [21.0, A(40, 840, 800, null, `<div style="font-size:30px;line-height:1.38;color:${C.ink};padding:24px 30px;background:${C.amberT};border-radius:30px"><div style="font-size:21px;font-weight:600;letter-spacing:.06em;color:${C.amber};margin-bottom:6px">PENGUMUMAN · Pak RT</div><b style="font-weight:600">Titik kumpul pindah ke lapangan SD 2. Bawa obat dan air minum.</b></div>`)],
      [21.5, A(40, 1090, 640, null, `<div class="row" style="align-items:flex-end;gap:16px"><i style="font-style:normal;width:56px;height:56px;border-radius:28px;background:${C.pink};color:#fff;font-size:24px;font-weight:700;display:flex;align-items:center;justify-content:center;flex:none">S</i>
          <div style="white-space:normal;font-size:30px;line-height:1.38;color:${C.ink};padding:22px 28px;background:${C.grey};border-radius:34px 34px 34px 10px"><div style="font-size:22px;font-weight:600;color:${C.pink};margin-bottom:4px">Sari</div>Kakiku terkilir, ada yang bisa jemput?</div></div>`)],
      [19.75, A(0, NH - 130, NB, 130, `<div class="row" style="height:100%;padding:0 34px;gap:22px">
          <div class="row" style="flex:1;height:80px;border-radius:40px;background:${C.grey};padding:0 28px;gap:16px;color:${C.muted};font-size:28px">${ico('plus', 28)}Ketik pesan<div style="flex:1"></div>${ico('cam', 30)}</div>
          <div style="width:84px;height:84px;border-radius:42px;background:${C.blue};color:#fff;display:flex;align-items:center;justify-content:center">${ico('mic', 36)}</div></div>`, `border-top:2px solid ${C.line}`)],
    ];
    const fEls = fItems.map(([tin, html]) => { const e = W(html, F0c); show(e, tin, 22.85, (t) => (tin >= 20 ? `scale(${popS(t, tin, 0.9).toFixed(4)})` : '')); return e; });
    [20.0, 20.5, 21.0, 21.5].forEach((tc, i) => cue(tc, 'pop', { n: i }));
    const sosPill = fEls[0].querySelector('.sos');
    const SOSC = 22.5;
    draws.push((t) => { sosPill.style.transform = `scale(${(press(t, SOSC) * bump(t, 22.0, 0.06, 0.1)).toFixed(4)})`; });
    cue(SOSC, 'click');
    cap('Chat yang lebih lega.', 19.5, 22.4);
    cue(19.5, 'swap', { n: 1 });

    // ══════════════ G · 23–24.5  the SOS sheet
    morph(22.85, 540, 1000, 800, 580, 56, '#FFFFFF');
    cue(22.85, 'whoosh', { v: 0.4 });
    const G0 = lay(800, 580, `
      ${A(56, 56, 688, 80, `<div class="o" style="font-size:60px;font-weight:600;color:${C.ink}">Kirim SOS?</div>`)}
      ${A(56, 150, 688, 140, `<div style="font-size:31px;line-height:1.42;color:${C.muted}">Semua orang di dekatmu mendengar alarm dan melihat lokasimu.</div>`)}
      ${A(56, 420, 330, 104, `<div style="height:100%;border-radius:52px;background:${C.grey};font-size:32px;font-weight:600;color:${C.ink};display:flex;align-items:center;justify-content:center">Batal</div>`)}
      ${A(414, 420, 330, 104, `<div class="ks" style="height:100%;border-radius:52px;background:${C.red};font-size:32px;font-weight:600;color:#fff;display:flex;align-items:center;justify-content:center">Kirim SOS</div>`)}`);
    show(G0, 23.05, 24.35);
    const ksBtn = G0.querySelector('.ks');
    const KS = 24.0;
    draws.push((t) => { ksBtn.style.transform = `scale(${press(t, KS).toFixed(4)})`; });
    cue(23.0, 'pop'); cue(KS, 'click'); cue(KS + 0.02, 'alert');
    cap('SOS yang jelas.', 22.5, 24.4);
    const flash = W(`<div style="left:0;top:0;width:1080px;height:1920px;background:${C.red};opacity:0"></div>`, hud);
    hud.insertBefore(flash, hud.firstChild);
    draws.push((t) => { flash.style.opacity = t >= KS ? (0.22 * Math.exp(-(t - KS) / 0.14)).toFixed(3) : 0; });

    // ══════════════ H · 24.5–28  offline compass
    morph(24.35, 540, 1080, 880, 1300, 64, C.navy, { w: 14, z: 0.82 });
    cue(24.4, 'whoosh', { v: 0.6 });
    const KB = 880, KH = 1300, RCX = 440, RCY = 740, RR = 360;
    const ticks = Array.from({ length: 72 }, (_, i) => { const a = i / 72 * Math.PI * 2, l = i % 6 === 0 ? 22 : 10; return `<line x1="${RCX + Math.sin(a) * RR}" y1="${RCY - Math.cos(a) * RR}" x2="${RCX + Math.sin(a) * (RR - l)}" y2="${RCY - Math.cos(a) * (RR - l)}" stroke="${i % 6 === 0 ? '#5B6B91' : '#33456E'}" stroke-width="${i % 6 === 0 ? 3 : 2}"/>`; }).join('');
    const card = (s, a) => `<text x="${RCX + Math.sin(a) * (RR - 52)}" y="${RCY - Math.cos(a) * (RR - 52) + 11}" text-anchor="middle" font-family="Inter" font-weight="700" font-size="30" fill="${s === 'U' ? C.red : '#C7D0E4'}">${s}</text>`;
    const H0 = lay(KB, KH, `
      ${A(56, 60, 112, 112, `<div style="width:112px;height:112px;border-radius:56px;background:${C.red};color:#fff;display:flex;align-items:center;justify-content:center"><span style="transform:rotate(-45deg);display:inline-flex">${ico('nav', 52)}</span></div>`)}
      ${A(196, 58, 640, 40, `<div style="font-size:24px;font-weight:700;letter-spacing:.1em;color:#FF7B7D">SOS · SARI</div>`)}
      ${A(194, 88, 640, 120, `<div class="o" style="font-size:112px;font-weight:600;color:#fff;line-height:1.08">259 m</div>`)}
      ${A(198, 212, 640, 40, `<div style="font-size:28px;font-weight:500;color:${C.soft}">ke arah barat laut · baru saja</div>`)}`);
    show(H0, 24.6, 27.85);
    const radar = W(`<div style="left:0;top:0;width:${KB}px;height:${KH}px"><svg width="${KB}" height="${KH}" style="position:absolute;left:0;top:0">
        <circle cx="${RCX}" cy="${RCY}" r="${RR}" fill="${C.panel}" stroke="${C.line2}" stroke-width="2"/>
        <circle cx="${RCX}" cy="${RCY}" r="${RR * 0.66}" fill="none" stroke="${C.line2}" stroke-width="2" stroke-dasharray="4 10"/>
        <circle cx="${RCX}" cy="${RCY}" r="${RR * 0.33}" fill="none" stroke="${C.line2}" stroke-width="2" stroke-dasharray="4 10"/>
        ${ticks}${card('U', 0)}${card('T', Math.PI / 2)}${card('S', Math.PI)}${card('B', -Math.PI / 2)}</svg></div>`, H0);
    show(radar, 24.75, 27.85, (t) => `scale(${popS(t, 24.75, 0.85).toFixed(4)})`);
    const needle = W(`<div style="left:${RCX - 24}px;top:${RCY - 120}px;width:48px;height:120px;transform-origin:24px 120px"><svg width="48" height="120" viewBox="0 0 48 120"><path d="M24 2 L44 46 L29 41 L29 120 L19 120 L19 41 L4 46 Z" fill="${C.blue}" stroke-linejoin="round"/></svg></div>`, H0);
    const you = W(`<div style="left:${RCX - 26}px;top:${RCY - 26}px;width:52px;height:52px;border-radius:26px;background:${C.blue};border:7px solid #fff"></div>`, H0);
    show(you, 24.75, 27.85);
    const NEED = new Track(0).to(25.0, -45, { w: 10, z: 0.74 });
    draws.push((t) => {
      const v = vis(t, 24.85, 27.85);
      applyVis(needle, v);
      needle.style.transform = `rotate(${NEED.at(t).toFixed(2)}deg)`;
    });
    const pins = [
      [25.5, 'Sari', 259, -45, C.red, 'S', 'SOS'], [26.0, 'Budi', 252, 22, C.orange, 'B', null], [26.5, 'Pak RT', 470, 128, C.pGreen, 'P', null],
    ];
    pins.forEach(([tin, n, d, deg, col, s, badge]) => {
      const a = deg * Math.PI / 180, r = d / 500 * RR * 0.95;
      const x = RCX + Math.sin(a) * r, y = RCY - Math.cos(a) * r;
      const e = W(`<div style="left:${(x - 40).toFixed(1)}px;top:${(y - 40).toFixed(1)}px;width:80px;height:80px">
          <div style="width:80px;height:80px;border-radius:40px;background:${col};border:5px solid #fff;color:#fff;font-size:34px;font-weight:700;display:flex;align-items:center;justify-content:center">${s}</div>
          <div class="row" style="position:absolute;left:40px;top:90px;transform:translateX(-50%);height:44px;padding:0 16px;border-radius:22px;background:${badge ? C.red : 'rgba(255,255,255,.12)'};color:#fff;font-size:22px;font-weight:600">${n} · ${d} m</div></div>`, H0);
      show(e, tin, 27.85, (t) => `scale(${popS(t, tin, 0.5).toFixed(4)})`);
      cue(tin, 'pop', { n: 2 });
    });
    const pulse = W(`<div style="left:0;top:0;width:0;height:0"></div>`, H0);
    { // SOS pulse rings around Sari
      const a = -45 * Math.PI / 180, r = 259 / 500 * RR * 0.95, x = RCX + Math.sin(a) * r, y = RCY - Math.cos(a) * r;
      [0, 1].forEach((k) => {
        const ring = W(`<div style="left:${x - 40}px;top:${y - 40}px;width:80px;height:80px;border-radius:40px;border:3px solid ${C.red}"></div>`, H0);
        H0.insertBefore(ring, H0.children[H0.children.length - 4]);
        draws.push((t) => {
          if (t < 25.6 || t > 27.85) { ring.style.opacity = 0; return; }
          const x2 = ((t - 25.6 + k * 0.5) % 1.0);
          ring.style.opacity = (0.7 * (1 - x2)).toFixed(3); ring.style.transform = `scale(${(1 + 1.2 * outQ(x2)).toFixed(3)})`;
        });
      });
    }
    cue(25.0, 'swap', { n: 3 }); cue(27.0, 'settle');
    cap('Kompas menunjuk<br>yang butuh bantuan.', 24.5, 27.9);
    cue(24.5, 'note', { n: 1 });

    // ══════════════ I · 28–30.5  walkie-talkie
    const J0 = lay(KB, KH, `
      ${A(0, 54, KB, 60, `<div class="o" style="text-align:center;font-size:46px;font-weight:600;color:#fff">Grup</div>`)}
      ${A(0, 112, KB, 40, `<div style="text-align:center;font-size:26px;font-weight:500;color:${C.soft}">Walkie-talkie · 3 mendengar</div>`)}`);
    show(J0, 28.0, 30.35);
    cue(28.0, 'swap', { n: 0 });
    const bigAv = W(A(KB / 2 - 140, 210, 280, 280, `<div class="av" style="width:280px;height:280px;border-radius:140px;background:${C.pink};border:10px solid rgba(255,255,255,.14);color:#fff;font-size:130px;font-weight:600;display:flex;align-items:center;justify-content:center;font-family:Outfit">S</div>`), J0);
    show(bigAv, 28.1, 30.35, (t) => `scale(${popS(t, 28.1, 0.7).toFixed(4)})`);
    const avEl = bigAv.querySelector('.av');
    const talkA = W(A(0, 530, KB, 64, `<div class="o" style="text-align:center;font-size:52px;font-weight:600;color:#fff">Sari sedang bicara</div>`), J0);
    show(talkA, 28.25, 28.95);
    const talkB = W(A(0, 530, KB, 64, `<div class="o" style="text-align:center;font-size:52px;font-weight:600;color:#fff">Kamu sedang bicara</div>`), J0);
    show(talkB, 29.05, 30.35);
    const waveBox = W(A(KB / 2 - 280, 620, 560, 110, ''), J0);
    show(waveBox, 28.25, 30.35);
    const wbars = Array.from({ length: 34 }, (_, i) => W(`<div style="left:${i * 16.5}px;top:0;width:8px;height:110px;border-radius:4px;background:${C.blue}"></div>`, waveBox));
    const peers = W(A(KB / 2 - 150, 770, 300, 150, `<div class="row" style="gap:80px;justify-content:center">${[[C.orange, 'B', 'Budi'], [C.pGreen, 'P', 'Pak RT']].map(([c, s, n]) => `<div style="text-align:center"><div style="width:100px;height:100px;border-radius:50px;background:${c};color:#fff;font-size:44px;font-weight:700;display:flex;align-items:center;justify-content:center">${s}</div><div style="font-size:24px;color:${C.soft};margin-top:10px">${n}</div></div>`).join('')}</div>`), J0);
    show(peers, 28.375, 30.35);
    const mic = W(A(KB / 2 - 130, 960, 260, 260, `<div class="mb" style="width:260px;height:260px;border-radius:130px;background:${C.blue};color:#fff;display:flex;align-items:center;justify-content:center">${ico('mic', 100)}</div>`), J0);
    show(mic, 28.25, 30.35, (t) => `scale(${popS(t, 28.25, 0.7).toFixed(4)})`);
    const micLbl = W(A(0, 1232, KB, 40, `<div style="text-align:center;font-size:26px;font-weight:600;color:${C.soft}">Tahan untuk bicara</div>`), J0);
    show(micLbl, 28.375, 30.35);
    const micRings = [0, 1, 2].map(() => { const r = W(`<div style="left:${KB / 2 - 130}px;top:960px;width:260px;height:260px;border-radius:130px;border:4px solid ${C.blue}"></div>`, J0); J0.insertBefore(r, mic); return r; });
    const HOLD0 = 29.0, HOLD1 = 30.0;
    cue(HOLD0, 'click'); cue(HOLD0, 'drag', { d: 1.0 }); cue(HOLD1, 'release');
    draws.push((t) => {
      const held = t >= HOLD0 && t < HOLD1;
      const hs = held ? 1 - 0.08 * stepR(t - HOLD0, SP.pop) : 1 - 0.08 * (1 - stepR(t - HOLD1, SP.pop)) * (t >= HOLD1 ? 1 : 0);
      mic.querySelector('.mb').style.transform = `scale(${hs.toFixed(4)})`;
      avEl.style.background = t >= HOLD0 + 0.05 ? C.blue : C.pink;
      avEl.textContent = t >= HOLD0 + 0.05 ? 'C' : 'S';
      bigAv.style.transform += ` scale(${bump(t, HOLD0 + 0.05, 0.06, 0.08).toFixed(4)})`;
      micRings.forEach((r, k) => {
        if (!held) { r.style.opacity = 0; return; }
        const x = ((t - HOLD0 + k / 3) % 1.0);
        r.style.opacity = (0.5 * (1 - x)).toFixed(3); r.style.transform = `scale(${(1 + 0.45 * outQ(x)).toFixed(3)})`;
      });
      const speak = t < HOLD1 ? 1 : Math.max(0, 1 - (t - HOLD1) / 0.25);
      wbars.forEach((b, i) => {
        const a = Math.abs(Math.sin(t * 9.1 + i * 0.73) * Math.sin(t * 5.3 + i * 1.31)) * speak;
        const h = 10 + 96 * a * (0.55 + 0.45 * Math.sin(i * 0.37));
        b.style.height = px(h); b.style.top = px(55 - h / 2);
        b.style.background = t >= HOLD0 ? C.blue : C.pink;
      });
    });
    cap('Walkie-talkie,<br>tanpa sinyal.', 28.0, 30.4);
    cue(28.5, 'note', { n: 2 });

    // ══════════════ J · 30.5–32.5  feature pills, boom boom boom boom
    const PILLS = [[30.5, 'chat', 'Chat', C.navy], [31.0, 'mic', 'Walkie-talkie', C.blue], [31.5, 'compass', 'Kompas', C.navy], [32.0, 'alert', 'SOS', C.red]];
    PILLS.forEach(([tc, k, s, col], i) => {
      const w = measure(s, `600 92px ${OF}`) + 88 + 26 + 150;
      morph(tc - 0.08, 540, 960, w, 200, 100, col, { w: 24, z: 0.8 });
      const e = lay(w, 200, `<div class="row" style="left:0;top:0;width:${w}px;height:200px;justify-content:center;gap:26px;color:#fff">${ico(k, 88)}<span class="o" style="font-size:92px;font-weight:600">${s}</span></div>`);
      show(e, tc, i < 3 ? tc + 0.38 : 32.4, '', 0.08);
      cue(tc, 'slam', { n: i });
    });
    cap('Semua fitur tetap ada.', 30.5, 32.4);

    // ══════════════ K · 32.5–36  the pill becomes the "co" again
    morph(32.45, mcx, mcy, mh, mh, mh / 2, C.navy, { w: 18, z: 0.86 });
    HOLE2 = new Track(0).to(32.7, mh * 103.23 / 195.57, { w: 22, z: 0.88 });
    cue(32.5, 'whoosh', { v: 0.5 }); cue(33.0, 'tick'); cue(33.5, 'slam', { n: 4 });
    tag(34.0, null);
    cue(34.0, 'shimmer');
    cap('Saling Jaga,<br>kini Covatom.', 34.5, null);
    // lineage: the old badge hands over to the new icon
    const lin1 = W(`<div class="row" style="left:0;width:1080px;top:1420px;justify-content:center;gap:40px">
        <div style="width:150px;height:150px;border-radius:75px;background:#fff;overflow:hidden;box-shadow:0 14px 40px rgba(15,27,53,.10)">${bearImg(150)}</div>
        <span class="lnA" style="color:${C.soft}">${ico('chev', 56)}</span>
        <div style="width:150px;height:150px;border-radius:40px;background:${C.navy};display:flex;align-items:center;justify-content:center;box-shadow:0 14px 40px rgba(15,27,53,.14)">${miniMark(64, '#fff')}</div></div>`);
    show(lin1, 35.0, null, (t) => `scale(${popS(t, 35.0, 0.85).toFixed(4)})`);
    cue(35.0, 'pop');
    cue(34.5, 'cta');

    // ───────────────────────── cursor (world space)
    const cur = W(`<div style="left:0;top:0;width:0;height:0">
        <svg width="46" height="52" viewBox="0 0 40 46" style="position:absolute;left:-5px;top:-4px"><path d="M4 3 L4 37 L13 29 L19 43 L26 40 L20 26 L33 26 Z" fill="${C.navy}" stroke="#fff" stroke-width="2.6" stroke-linejoin="round"/></svg>
        <div class="pl" style="position:absolute;left:34px;top:46px;height:42px;padding:0 16px;border-radius:21px;background:${C.blue};color:#fff;font-size:22px;font-weight:600;display:flex;align-items:center;white-space:nowrap">Kamu</div>
        <div class="rp" style="position:absolute;left:-34px;top:-34px;width:68px;height:68px;border-radius:34px;border:3px solid ${C.blue}"></div></div>`);
    const rp = cur.querySelector('.rp'), pl = cur.querySelector('.pl');
    const CXT = new Track(980), CYT = new Track(1800);
    const go = (tArrive, x, y, lead = 0.42) => { CXT.to(tArrive - lead, x, SP.cursor); CYT.to(tArrive - lead, y, SP.cursor); };
    // old app: tap SOS, then KIRIM SOS
    go(5.5, 110 + 70, 330 + OH - 65); go(7.0, 110 + 620, 330 + 470 + 500 - 50);
    CXT.to(7.35, 960, SP.cursor); CYT.to(7.35, 1300, SP.cursor);
    go(8.5, 560, 920);
    CXT.to(8.75, 960, SP.cursor); CYT.to(8.75, 1500, SP.cursor);
    // new home: Aman chip, then Chat tab
    go(AMAN, 100 + 80 + 85, 330 + 436 + 44); go(CHAT, 100 + 264, 330 + 1300 + 50);
    CXT.to(19.3, 980, SP.cursor); CYT.to(19.3, 1500, SP.cursor);
    go(SOSC, 100 + 765, 330 + 80);
    go(KS, 140 + 414 + 165, 710 + 420 + 54);
    CXT.to(24.35, 1000, SP.cursor); CYT.to(24.35, 1700, SP.cursor);
    go(HOLD0, 540, 430 + 1090);
    CXT.to(30.1, 1000, SP.cursor); CYT.to(30.1, 1750, SP.cursor);
    const CLICKS = [5.5, 7.0, 8.5, AMAN, CHAT, SOSC, KS, HOLD0];
    [5.5, 7.0, 8.5].forEach((tc) => cue(tc, 'click'));
    const oldSos = B0.querySelector('.osos');
    const ksOld = oldDlg.querySelector('.ks');
    draws.push((t) => {
      oldSos.style.transform = `scale(${press(t, 5.5).toFixed(4)})`;
      ksOld.style.opacity = t > 7.0 && t < 7.25 ? 0.5 : 1;
    });
    const CURWIN = [[4.9, 7.4], [7.9, 8.85], [16.6, 19.4], [21.9, 24.45], [28.4, 30.25]];
    draws.push((t) => {
      const x = CXT.at(t), y = CYT.at(t);
      const vx = (CXT.at(t + 0.01) - CXT.at(t - 0.01)) / 0.02;
      let o = 0;
      for (const [a, b] of CURWIN) o = Math.max(o, lin(t, a, a + 0.15) * (1 - lin(t, b - 0.15, b)));
      let s = 1; for (const tc of CLICKS) s *= press(t, tc);
      if (t >= HOLD0 && t < HOLD1) s = Math.min(s, 0.88);
      cur.style.opacity = o.toFixed(3);
      cur.style.visibility = o > 0.001 ? 'visible' : 'hidden';
      cur.style.transform = `translate(${x.toFixed(2)}px,${y.toFixed(2)}px) rotate(${clamp(-vx * 0.004, -12, 12).toFixed(2)}deg) scale(${s.toFixed(4)})`;
      pl.style.transform = `translateX(${clamp(-vx * 0.01, -24, 24).toFixed(2)}px)`;
      let rr = null; for (const tc of CLICKS) { const r = ripple(t, tc); if (r) rr = r; }
      rp.style.opacity = rr ? rr.o.toFixed(3) : 0; rp.style.transform = rr ? `scale(${rr.s.toFixed(3)})` : 'none';
    });

    // ───────────────────────── seek
    const heroOn = (t) => (t < 10.0) || (t >= 14.0 && t < 33.0);
    window.seek = (t) => {
      const z = zT.at(t);
      const sh = (k) => (t >= k ? 9 * Math.exp(-(t - k) / 0.1) : 0);
      const s1 = sh(12.0) + sh(KS) * 0.6;
      world.style.transform = `translate(${(540 + Math.sin(t * 90) * s1).toFixed(2)}px,${(960 + Math.cos(t * 77) * s1).toFixed(2)}px) scale(${z.toFixed(5)}) translate(-540px,-960px)`;
      const bg = BG.at(t);
      stage.style.background = bg;
      draws.forEach((f) => f(t));
      const w = HW.at(t), h = HH.at(t), x = HX.at(t), y = HY.at(t);
      hero.style.left = px(x - w / 2); hero.style.top = px(y - h / 2);
      hero.style.width = px(w); hero.style.height = px(h);
      hero.style.borderRadius = px(Math.min(HR.at(t), Math.min(w, h) / 2));
      hero.style.background = HC.at(t);
      hero.style.boxShadow = (t > 8.9 && t < 10.0) || t > 32.4 ? 'none' : '0 28px 70px rgba(15,27,53,.10)';
      let s = popS(t, 0.0, 0.4);
      [1.0, 2.0, 3.0].forEach((tc) => { s *= bump(t, tc + 0.03, 0.035, 0.07); });
      s *= press(t, 8.5);
      if (t >= 14.0 && t < 15.0) s *= popS(t, 14.0, 0.7);
      [30.5, 31.0, 31.5, 32.0].forEach((tc) => { s *= bump(t, tc + 0.03, 0.06, 0.06); });
      s *= bump(t, 28.0, 0.025, 0.08);
      hero.style.transform = `scale(${s.toFixed(4)})`;
      hero.style.visibility = heroOn(t) ? 'visible' : 'hidden';
      const hd = t < 20 ? HOLE.at(t) : (HOLE2 ? HOLE2.at(t) : 0);
      hole.style.width = hole.style.height = px(hd);
      hole.style.marginLeft = hole.style.marginTop = px(-hd / 2);
      hole.style.background = bg;
      hole.style.display = hd > 0.5 ? 'block' : 'none';
    };
    window.FILM = {
      width: 1080, height: 1920, bpm: 120, duration: 36.0,
      sections: { intro: [0, 4], build: [8, 12], drop: [12, 16], outro: [32.5, 36] },
      cues: cues.sort((a, b) => a.t - b.t),
    };
    window.seek(0);
    window.READY = true;
  } catch (err) {
    window.FILM_ERROR = String(err && err.stack || err);
  }
})();
