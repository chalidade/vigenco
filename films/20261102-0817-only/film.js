// Saling Jaga · Cari keluarga (0.34.0) + Mode lansia (0.33.0). Portrait 1080×1920, 120 BPM, 32 s.
// One hero shape, never cut: logo → missing-person card → network plate (groups, bridge, LoRa) →
// the card again (found) → elder-mode phone → logo. Every style is a pure function of t inside seek(t).
(async function () {
  try {
    const { clamp, lerp, inOut, stepR, Track, ColorTrack, SP, vis, applyVis, press, ripple } = M;
    const C = { night: '#07110c', night2: '#0b1811', card: '#0f1f17', card2: '#13271d', cream: '#f2edd5', muted: '#a5b0a2',
      dim: '#6f7c6f', leaf: '#3cbf6e', ink: '#04140a', moss: '#1b4d2e', lamp: '#f2c46b', sos: '#ef4b4b', cari: '#f08c2e',
      budi: '#e8590c', sari: '#d6336c', rt: '#1e7a45', dewi: '#7950f2', joko: '#1c7ed6', ani: '#c2410c' };

    await Promise.all([
      document.fonts.load('800 76px "Plus Jakarta Sans"'), document.fonts.load('500 32px "Plus Jakarta Sans"'),
      document.fonts.load('700 24px "Plus Jakarta Sans"'), document.fonts.load('600 22px "JetBrains Mono"'),
      document.fonts.load('italic 400 76px "Instrument Serif"'),
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

    const I = {
      search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
      check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
      send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4z"/></svg>',
      pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>',
      eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
      link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/></svg>',
      ant: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 12v10"/><path d="M8 22h8"/><circle cx="12" cy="10" r="2"/><path d="M7.8 5.8a6 6 0 0 0 0 8.4M16.2 5.8a6 6 0 0 1 0 8.4M4.9 2.9a10 10 0 0 0 0 14.2M19.1 2.9a10 10 0 0 1 0 14.2"/></svg>',
      save: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><path d="M17 21v-8H7v8M7 3v5h8"/></svg>',
      mic: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0"/><path d="M12 17v5"/></svg>',
      shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>',
      mega: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>',
      user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>',
      globe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/></svg>',
      batt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="17" height="10" rx="2"/><path d="M22 11v2M6 10v4M10 10v4"/></svg>',
      big: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="7" rx="2"/><rect x="3" y="14" width="18" height="7" rx="2"/></svg>',
    };
    const ic = (name, size, color = 'currentColor') => `<span style="display:inline-flex;width:${size}px;height:${size}px;color:${color};flex:none">${I[name].replace('<svg ', `<svg width="${size}" height="${size}" `)}</span>`;

    // ───────────────────────── Camera ─────────────────────────
    const camZ = new Track(Math.log(1.08)).to(0, 0, { w: 2.2, z: 1 })
      .to(7.75, Math.log(0.97), SP.cam).to(8.25, 0, { w: 6, z: 1 })
      .to(15.75, Math.log(0.96), { w: 10, z: 1 }).to(16.0, Math.log(1.035), { w: 18, z: 0.8 }).to(16.75, 0, SP.cam)
      .to(27.75, Math.log(0.97), SP.cam).to(28.25, 0, { w: 4, z: 1 });
    const camX = new Track(540), camY = new Track(960);
    const breathe = (t) => 0.005 * Math.sin(t * 0.9);
    const cam = (t) => ({ z: Math.exp(camZ.at(t) + breathe(t)), x: camX.at(t), y: camY.at(t) });

    // ───────────────────────── Hero shape ─────────────────────────
    const shape = add('<div id="shape"></div>');
    const logo = add('<img id="logo" src="assets/mark.png" alt="">', shape);
    await new Promise((r) => { if (logo.complete) r(); else { logo.onload = r; logo.onerror = r; } });
    const S = { x: new Track(540), y: new Track(840), w: new Track(0), h: new Track(0), r: new Track(160), bg: new ColorTrack(C.cream), bd: new Track(0) };
    const st = (t, x, y, w, h, r, bg, bd = 0.1, sp = SP.shape) => {
      S.x.to(t, x, sp); S.y.to(t, y, sp); S.w.to(t, w, sp); S.h.to(t, h, sp); S.r.to(t, r, sp); S.bg.to(t, bg, { w: 28, z: 1 }); S.bd.to(t, bd, SP.soft);
    };
    S.w.to(0.5, 320, SP.pop); S.h.to(0.5, 320, SP.pop); cue(0.5, 'born');
    st(3.5, 540, 1200, 860, 1080, 48, C.card, 0.1); cue(3.5, 'whoosh', { v: 0.6 }); cue(3.5, 'swap', { n: 0 });
    st(8.0, 540, 1200, 980, 1120, 44, C.night2, 0.13); cue(8.0, 'whoosh', { v: 0.5 }); cue(8.0, 'swap', { n: 1 });
    st(15.0, 540, 1110, 860, 800, 48, C.card2, 0.1); cue(15.0, 'swap', { n: 2 });
    S.bg.to(16.0, C.moss, { w: 22, z: 1 }); S.w.to(16.0, 880, SP.pop); cue(16.0, 'drop');
    st(19.0, 540, 1210, 640, 1180, 70, C.night2, 0.2); cue(19.0, 'whoosh', { v: 0.6 }); cue(19.0, 'swap', { n: 3 });
    st(28.0, 540, 760, 320, 320, 160, C.cream, 0, SP.shape); cue(28.0, 'settle');
    draws.push((t) => {
      const w = Math.max(0, S.w.at(t)), h = Math.max(0, S.h.at(t)), x = S.x.at(t), y = S.y.at(t);
      const r = Math.min(S.r.at(t), w / 2, h / 2);
      shape.style.width = w + 'px'; shape.style.height = h + 'px';
      shape.style.transform = `translate(${(x - w / 2).toFixed(2)}px,${(y - h / 2).toFixed(2)}px)`;
      shape.style.borderRadius = r.toFixed(2) + 'px';
      shape.style.background = S.bg.at(t);
      shape.style.boxShadow = `inset 0 0 0 2px rgba(242,237,213,${clamp(S.bd.at(t), 0, 1).toFixed(3)}), 0 60px 110px -40px rgba(0,0,0,.8)`;
      const v = t < 10 ? vis(t, 0.62, 3.375) : vis(t, 28.25, null);
      const sz = Math.min(w, h) * 0.86;
      logo.style.width = sz + 'px'; logo.style.height = sz + 'px';
      applyVis(logo, v, '');
      logo.style.transform = `translate(-50%,-50%) translateY(${v.dy.toFixed(2)}px) scale(${(0.85 + 0.15 * v.e).toFixed(3)})`;
    });

    // Radio rings from the shape: phone to phone, no towers.
    const rings = [...document.querySelectorAll('#rings circle')];
    draws.push((t) => {
      const c = cam(t), sx = 540 + (S.x.at(t) - c.x) * c.z, sy = 960 + (S.y.at(t) - c.y) * c.z;
      const base = Math.max(S.w.at(t), S.h.at(t)) / 2 * c.z;
      rings.forEach((el, k) => {
        const ph = ((t * 0.32 + k / 3) % 1 + 1) % 1;
        el.setAttribute('cx', sx.toFixed(1)); el.setAttribute('cy', sy.toFixed(1));
        el.setAttribute('r', (base + 40 + ph * 560).toFixed(1));
        el.setAttribute('fill', 'none'); el.setAttribute('stroke', C.cream); el.setAttribute('stroke-width', '1.5');
        el.setAttribute('stroke-opacity', (0.09 * (1 - ph) * clamp(t / 1.5)).toFixed(3));
      });
    });

    // ───────────────────────── Captions (top block) ─────────────────────────
    function caption(tin, tout, kicker, head, subs = []) {
      const g = add(`<div class="cap"><div class="kick">${kicker}</div><div class="head">${head}</div><div class="subs"></div></div>`);
      const [k, h, sb] = g.children;
      const subEls = subs.map(([ts, txt, icon]) => [add(`<div class="sub">${I[icon || 'check']}<span>${txt}</span></div>`, sb), ts]);
      pos(g, 80, 150);
      show(k, tin, tout); show(h, tin + 0.125, tout);
      subEls.forEach(([s, ts]) => show(s, ts, tout));
      return g;
    }
    caption(3.75, 7.85, 'v0.34 · Cari keluarga', 'Ada yang <span class="serif">belum kembali?</span>', [
      [5.0, 'Buat kartu <b>“pernah lihat orang ini?”</b>', 'eye'],
    ]);
    caption(8.25, 14.85, 'Kartu yang berpindah', 'Satu kartu, <span class="serif">semua HP.</span>', [
      [8.75, 'Sampai ke <b>tiap HP di grup</b>, juga yang baru gabung'],
      [10.5, 'Menyeberang lewat <b>jembatan</b> ke grup lain', 'link'],
      [12.0, 'Lewat <b>LoRa</b> sebagai satu baris pendek', 'ant'],
      [13.25, 'Disimpan <b>7 hari</b>, maks <b>30</b>, dibawa ke grup berikutnya', 'save'],
    ]);
    caption(16.25, 18.85, 'Siapa pun bisa menandai', 'Ketemu. <span class="serif">Semua HP tahu.</span>', [
      [17.0, 'Pembaruan <b>mengganti kartu</b> di mana-mana'],
    ]);
    caption(19.25, 23.85, 'v0.33 · Mode lansia', 'Tiga tombol <span class="serif">besar.</span>', [
      [19.75, 'Nyalakan dari <b>profil</b>, mati secara bawaan', 'user'],
      [21.25, '<b>SOS</b>, <b>Saya aman</b>, <b>tahan untuk bicara</b>', 'big'],
      [23.25, 'Tombol yang ditahan <b>tak terputus</b> oleh pembaruan', 'mic'],
    ]);
    caption(24.0, 27.85, 'Satu layar', 'Keluarga, <span class="serif">sekilas.</span>', [
      [24.5, 'Status tiap orang dan <b>pengumuman</b> terbaru'],
      [25.0, '<b>Garis merah</b> saat ada yang SOS', 'shield'],
      [26.5, 'Juga di <b>iOS</b> · kembali lewat “Mode lengkap”', 'globe'],
    ]);

    // ───────────────────────── Intro (0 – 3.5) ─────────────────────────
    const ih = add('<div class="head" style="font-size:104px;text-align:center;width:960px;line-height:1.02">Dua fitur <span class="serif">baru</span><br>untuk keluarga</div>');
    posC(ih, 540, 1080); show(ih, 1.0, 3.25); cue(1.0, 'whoosh', { v: 0.4 });
    [['v0.34', 'Cari keluarga', 'search'], ['v0.33', 'Mode lansia', 'big']].forEach(([v, l, icn], i) => {
      const e = add(`<div class="chip" style="height:84px;padding:0 34px 0 14px;background:#0f1f17;box-shadow:inset 0 0 0 2px rgba(242,237,213,.14);font:700 36px/1 'Plus Jakarta Sans'"><span class="mono" style="background:#3cbf6e;color:#04140a;border-radius:999px;padding:12px 16px;font-size:26px">${v}</span>${ic(icn, 34, C.leaf)}${l}</div>`);
      posC(e, 540, 1340 + i * 112);
      const tin = 2.0 + i * 0.5; cue(tin, 'slam', { n: i });
      show(e, tin, 3.25, hit(tin, 0.12));
    });

    // ───────────────────────── Scene A1: make the card (3.5 – 8) ─────────────────────────
    const A0 = 3.75, A1 = 7.9;
    const aHead = add(`<div style="display:flex;align-items:center;gap:16px;width:760px">${ic('search', 38, C.cari)}<span style="font:800 36px/1 'Plus Jakarta Sans'">Kartu Cari keluarga</span><span class="chip mono" style="margin-left:auto;height:42px;padding:0 16px;font-size:20px;color:#a5b0a2;box-shadow:inset 0 0 0 1.5px rgba(242,237,213,.16)">Grup Pos 3</span></div>`);
    pos(aHead, 160, 712); show(aHead, A0, A1);
    const avA = add(`<div class="av" style="width:190px;height:190px;font-size:84px;background:${C.ani};box-shadow:0 0 0 8px rgba(240,140,46,.18)">A</div>`);
    posC(avA, 540, 790); show(avA, A0 + 0.125, A1, popIn(A0 + 0.125)); cue(3.875, 'pop', { n: 0 });
    const fLbl = pos(add('<div class="mono" style="font-size:22px;color:#a5b0a2;letter-spacing:.08em">NAMA</div>'), 160, 1012);
    show(fLbl, A0 + 0.25, A1);
    const field = pos(add('<div style="width:760px;height:96px;border-radius:24px;background:#0b1811;box-sizing:border-box"></div>'), 160, 1046);
    show(field, A0 + 0.25, A1);
    const NAME = 'Nenek Ani', TY0 = 4.5;
    const typed = pos(add('<div style="font:800 48px/96px \'Plus Jakarta Sans\';white-space:nowrap;display:flex;align-items:center"><span></span><i style="display:block;width:4px;height:52px;margin-left:4px;border-radius:2px;background:#f08c2e"></i></div>'), 190, 1046);
    show(typed, A0 + 0.25, A1);
    const [tyTxt, caret] = typed.children;
    for (let i = 0; i < NAME.length; i++) cue(TY0 + i * 0.125, 'key');
    draws.push((t) => {
      const n = clamp(Math.floor((t - TY0) / 0.125) + 1, 0, NAME.length);
      tyTxt.textContent = NAME.slice(0, n);
      const focus = clamp((t - 4.25) * 8) * (1 - clamp((t - 6.0) * 6));
      field.style.boxShadow = `inset 0 0 0 ${(1.5 + 1.5 * focus).toFixed(2)}px ${M.mix('#2a3a30', C.cari, focus)}`;
      caret.style.opacity = (focus * (t < 5.6 ? 1 : (Math.cos((t - 5.6) * Math.PI * 4) > 0 ? 1 : 0))).toFixed(2);
      if (n === 0) tyTxt.textContent = '';
    });
    const tags = [['72 tahun', 5.75], ['kerudung biru', 5.875], ['tongkat kayu', 6.0]];
    { let x = 160; tags.forEach(([s, tin], i) => {
      const e = add(`<div class="chip" style="height:58px;padding:0 24px;background:#13271d;box-shadow:inset 0 0 0 1.5px rgba(242,237,213,.14);font:600 28px/1 'Plus Jakarta Sans'">${s}</div>`);
      pos(e, x, 1168); x += e.offsetWidth + 14; show(e, tin, A1, hit(tin, 0.14)); e.style.transformOrigin = '0 50%'; cue(tin, 'pop', { n: i + 1 });
    }); }
    const seen = pos(add(`<div style="display:flex;align-items:center;gap:14px;font:600 29px/1.2 'Plus Jakarta Sans';color:#c9cdb9;width:760px">${ic('pin', 34, C.cari)}<span>Terakhir terlihat dekat <b style="color:#f2edd5">Masjid Al-Ikhlas</b></span></div>`), 160, 1262);
    show(seen, 6.25, A1); cue(6.25, 'pop', { n: 4 });
    const ask = pos(add(`<div style="width:760px;box-sizing:border-box;padding:26px 30px;border-radius:28px 28px 28px 8px;background:rgba(240,140,46,.14);box-shadow:inset 0 0 0 2px rgba(240,140,46,.45);font:700 34px/1.25 'Plus Jakarta Sans';color:#ffd2a6;display:flex;gap:16px;align-items:center">${ic('eye', 40, C.cari)}Pernahkah Anda melihat orang ini?</div>`), 160, 1340);
    show(ask, 6.5, A1, popIn(6.5, 0.9)); cue(6.5, 'swap', { n: 2 });
    const SEND = 7.0;
    const sendB = pos(add(`<div class="chip" style="width:760px;height:112px;justify-content:center;border-radius:32px;font:800 38px/1 'Plus Jakarta Sans';position:absolute">
        <span class="a" style="display:flex;align-items:center;gap:16px;position:absolute">${ic('send', 38)}Sebarkan kartu</span>
        <span class="b" style="display:flex;align-items:center;gap:16px;position:absolute">${ic('check', 40)}Terkirim ke grup</span></div>`), 160, 1576);
    const [sbA, sbB] = sendB.children;
    const sendBg = new ColorTrack(C.cari).to(SEND, C.leaf, { w: 26, z: 1 });
    draws.push((t) => {
      applyVis(sendB, vis(t, 6.0, A1), `scale(${press(t, SEND).toFixed(3)})`);
      sendB.style.background = sendBg.at(t); sendB.style.color = C.ink;
      applyVis(sbA, vis(t, -1, SEND, 0.1)); applyVis(sbB, vis(t, SEND + 0.06, null));
    });
    cue(6.0, 'pop', { n: 5 }); cue(SEND, 'click'); cue(7.25, 'check');

    // ───────────────────────── Scene A2: the card travels (8 – 15.5) ─────────────────────────
    const N1 = 14.85;
    const svgNS = 'http://www.w3.org/2000/svg';
    const lines = add('<svg width="1080" height="1920" viewBox="0 0 1080 1920" style="left:0;top:0;overflow:visible"></svg>');
    const boxes = [
      { x: 80, y: 690, w: 920, h: 300, lbl: 'Grup Pos 3', tin: 8.25, tout: N1 },
      { x: 80, y: 1170, w: 920, h: 270, lbl: 'Grup RW 5', tin: 10.75, tout: N1 },
      { x: 80, y: 1480, w: 920, h: 250, lbl: 'LoRa · desa seberang', tin: 12.0, tout: 13.4, dashed: true },
      { x: 80, y: 1480, w: 920, h: 250, lbl: 'Grup berikutnya · Posko', tin: 13.5, tout: N1 },
    ];
    boxes.forEach((b) => {
      const e = pos(add(`<div class="gbox" style="width:${b.w}px;height:${b.h}px;${b.dashed ? 'box-shadow:none;border:2px dashed rgba(242,237,213,.16);box-sizing:border-box' : ''}"><div class="glbl" style="position:absolute;left:28px;top:24px">${b.lbl}</div></div>`), b.x, b.y);
      show(e, b.tin, b.tout);
    });
    // nodes
    const mkNode = (name, letter, col, x, y, tin, tout = N1) => {
      const e = add(`<div style="width:200px;display:flex;flex-direction:column;align-items:center">
          <div class="av" style="background:${col};box-shadow:0 0 0 7px #0b1811">${letter}<span class="badge" style="background:${C.cari};color:${C.ink};opacity:0">${ic('search', 26)}</span></div>
          <div class="nm" style="margin-top:12px">${name}</div></div>`);
      const n = { e, x: typeof x === 'number' ? new Track(x) : x, y: typeof y === 'number' ? new Track(y) : y, tin, badge: e.querySelector('.badge'), got: null };
      e.style.transformOrigin = '50% 42px';
      draws.push((t) => {
        e.style.left = (n.x.at(t) - 100).toFixed(1) + 'px'; e.style.top = (n.y.at(t) - 42).toFixed(1) + 'px';
        applyVis(e, vis(t, tin, tout), popIn(tin)(t));
        if (n.got != null) {
          const p = stepR(t - n.got, SP.pop);
          n.badge.style.opacity = clamp(p * 1.5).toFixed(3); n.badge.style.transform = `scale(${(0.3 + 0.7 * p).toFixed(3)})`;
        }
      });
      cue(tin, 'pop', { n: Math.round(x.at ? 0 : x / 200) % 6 });
      return n;
    };
    const P = (n, t) => [n.x.at(t), n.y.at(t)];
    const kamu = mkNode('Kamu', 'K', C.leaf, 210, 840, 8.25);
    const budi = mkNode('Budi', 'B', C.budi, 410, 840, 8.375);
    const sari = mkNode('Sari', 'S', C.sari, 640, 840, 8.5);
    const dewi = mkNode('Dewi', 'D', C.dewi, 850, 840, 9.5);
    const joko = mkNode('Joko', 'J', C.joko, 850, 1080, 10.5);
    const rw = [mkNode('Pak RT', 'R', C.rt, 290, 1310, 10.75), mkNode('Wati', 'W', '#0ca678', 530, 1310, 10.875), mkNode('Eko', 'E', '#e64980', 770, 1310, 11.0)];
    const gate = mkNode('Gateway', ic('ant', 40), '#2b3a31', 200, 1610, 12.0, 13.4);
    const far = mkNode('Desa seberang', 'D', '#5c7cfa', 880, 1610, 12.125, 13.4);
    const posko = [mkNode('Bu Lina', 'L', '#f59f00', 560, 1610, 13.5), mkNode('Pak Edi', 'E', '#4dabf7', 820, 1610, 13.625)];
    // late joiner tag + bridge tag
    const lateTag = add(`<div class="chip mono" style="height:40px;padding:0 14px;background:rgba(121,80,242,.18);color:#c0aaff;font-size:19px;box-shadow:inset 0 0 0 1.5px rgba(121,80,242,.5)">baru gabung</div>`);
    posC(lateTag, 850, 746); show(lateTag, 9.625, N1); cue(9.625, 'pop', { n: 3 });
    const brTag = add(`<div class="chip" style="height:44px;padding:0 16px;background:rgba(28,126,214,.18);color:#9fd0ff;font:700 21px/1 'Plus Jakarta Sans';box-shadow:inset 0 0 0 1.5px rgba(28,126,214,.55)">${ic('link', 22)}jembatan</div>`);
    pos(brTag, 850 - 100 - brTag.offsetWidth - 6, 1058); show(brTag, 10.625, N1); cue(10.625, 'pop', { n: 4 });
    // links
    const link = (a, b, tin, tout, col = C.leaf) => {
      const l = document.createElementNS(svgNS, 'line');
      l.setAttribute('stroke', col); l.setAttribute('stroke-width', 3); l.setAttribute('stroke-linecap', 'round');
      l.setAttribute('pathLength', 1); l.setAttribute('stroke-dasharray', '1 1'); lines.appendChild(l);
      draws.push((t) => {
        const [x1, y1] = P(a, t), [x2, y2] = P(b, t);
        l.setAttribute('x1', x1); l.setAttribute('y1', y1); l.setAttribute('x2', x2); l.setAttribute('y2', y2);
        const p = stepR(t - tin, { w: 12, z: 1 }), o = 1 - clamp((t - tout) / 0.12);
        l.setAttribute('stroke-dashoffset', (1 - p).toFixed(4)); l.setAttribute('stroke-opacity', (0.5 * o * (t >= tin ? 1 : 0)).toFixed(3));
      });
    };
    // packets: a mini card flies along a link and lands as a badge
    const fly = (a, b, t0, t1, n) => {
      const pk = add(`<div style="width:46px;height:46px;margin:-23px 0 0 -23px;border-radius:13px;background:${C.cari};color:${C.ink};display:flex;align-items:center;justify-content:center;box-shadow:0 8px 20px rgba(0,0,0,.4)">${ic('search', 26)}</div>`);
      draws.push((t) => {
        const on = t >= t0 - 0.03 && t < t1 + 0.1;
        pk.style.visibility = on ? 'visible' : 'hidden'; if (!on) return;
        const p = inOut((t - t0) / (t1 - t0)); const [x1, y1] = P(a, t), [x2, y2] = P(b, t);
        pk.style.left = lerp(x1 + 40, x2 + 40, p).toFixed(1) + 'px'; pk.style.top = lerp(y1 - 40, y2 - 40, p).toFixed(1) + 'px';
        pk.style.opacity = (clamp((t - t0 + 0.03) * 10) * (1 - clamp((t - t1) / 0.1))).toFixed(3);
      });
      b.got = t1; cue(t1, 'check');
    };
    // the card starts on Kamu's phone
    kamu.got = 8.5; cue(8.5, 'pop', { n: 5 });
    const MOVE = 13.875;
    link(kamu, budi, 8.75, N1); link(budi, sari, 8.75, MOVE);
    fly(kamu, budi, 8.75, 9.25); fly(budi, sari, 9.25, 9.75); cue(8.75, 'whoosh', { v: 0.3 });
    link(sari, dewi, 9.75, MOVE); fly(sari, dewi, 9.75, 10.25); cue(9.75, 'whoosh', { v: 0.3 });
    link(dewi, joko, 10.5, N1, '#4dabf7'); fly(dewi, joko, 10.5, 10.875); cue(10.5, 'whoosh', { v: 0.4 });
    rw.forEach((n, i) => { link(joko, n, 11.0, N1, '#4dabf7'); fly(joko, n, 11.0 + i * 0.125, 11.5 + i * 0.125); });
    cue(11.0, 'whoosh', { v: 0.5 });
    // LoRa: a short text line crosses to the next village
    const lora = add(`<div class="chip mono" style="height:46px;padding:0 18px;background:#13271d;color:#ffd2a6;font-size:20px;font-weight:600;box-shadow:inset 0 0 0 1.5px rgba(240,140,46,.55)">CARI · Nenek Ani, 72 · Masjid Al-Ikhlas</div>`);
    { const t0 = 12.25, t1 = 13.25, x0 = 270;
      const LC = 'CARI · Nenek Ani, 72 · Masjid Al-Ikhlas';
      draws.push((t) => {
        const on = t >= t0 && t < 13.4;
        lora.style.visibility = on ? 'visible' : 'hidden'; if (!on) return;
        const p = inOut((t - t0) / (t1 - t0));
        const n = clamp(Math.floor((t - t0) * 48) + 1, 0, LC.length);
        lora.textContent = LC.slice(0, Math.min(LC.length, Math.max(n, 1)));
        
        lora.style.left = (x0 + 30 * (1 - p)).toFixed(1) + 'px'; lora.style.top = '1586px';
        const o = 1 - clamp((t - 13.25) / 0.15);
        lora.style.opacity = (clamp((t - t0) * 10) * o).toFixed(3);
      });
      cue(12.25, 'whoosh', { v: 0.6 });
      for (let k = 0; k < 8; k++) cue(12.25 + k * 0.125, 'key');
      far.got = 13.0; cue(13.0, 'check');
      gate.got = 12.125;
    }
    // Sari keeps it (7 days, max 30) and carries it to the next group she joins
    const keep = add(`<div class="chip mono" style="height:38px;padding:0 12px;gap:8px;background:#f2edd5;color:${C.ink};font-size:18px;font-weight:600">${ic('save', 20)}7 hari</div>`);
    draws.push((t) => { const [x, y] = P(sari, t); keep.style.left = (x - 48 - keep.offsetWidth).toFixed(1) + 'px'; keep.style.top = (y - 19).toFixed(1) + 'px'; });
    show(keep, 13.25, N1, hit(13.25, 0.15)); cue(13.25, 'pop', { n: 2 });
    sari.x.to(MOVE, 290, { w: 9, z: 0.95 }); sari.y.to(MOVE, 1610, { w: 9, z: 0.95 });
    cue(MOVE, 'drag', { d: 0.5 }); cue(14.375, 'release');
    posko.forEach((n, i) => { link(sari, n, 14.375, N1); fly(sari, n, 14.375 + i * 0.125, 14.625 + i * 0.125); });
    cue(14.5, 'riser', { d: 1.5 });
    draws.push((t) => applyVis(lines, vis(t, 8.25, N1)));

    // ───────────────────────── Drop: found (15.5 – 19) ─────────────────────────
    const F0 = 15.125, F1 = 18.9, FOUND = 16.0;
    const avF = add(`<div class="av" style="width:180px;height:180px;font-size:80px;background:${C.ani}">A<span style="position:absolute;right:-6px;bottom:-6px;width:64px;height:64px;border-radius:50%;background:${C.leaf};color:${C.ink};display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 6px #1b4d2e">${ic('check', 38)}</span></div>`);
    posC(avF, 540, 750); show(avF, F0, F1);
    const avChk = avF.lastElementChild;
    draws.push((t) => { const p = stepR(t - FOUND - 0.06, SP.pop); avChk.style.opacity = clamp(p * 1.5).toFixed(3); avChk.style.transform = `scale(${(0.2 + 0.8 * p).toFixed(3)})`; });
    const fName = add('<div style="font:800 76px/1 \'Plus Jakarta Sans\';letter-spacing:-.035em;white-space:nowrap">Nenek Ani</div>');
    posC(fName, 540, 960); show(fName, F0 + 0.06, F1);
    const stA = add(`<div class="chip" style="height:60px;padding:0 26px;background:rgba(240,140,46,.18);color:#ffd2a6;font:700 28px/1 'Plus Jakarta Sans'">${ic('search', 28)}Dicari</div>`);
    const stB = add(`<div class="chip" style="height:60px;padding:0 26px;background:${C.leaf};color:${C.ink};font:800 28px/1 'Plus Jakarta Sans'">${ic('check', 30)}Ditemukan</div>`);
    posC(stA, 540, 1066); posC(stB, 540, 1066);
    show(stA, F0 + 0.125, FOUND, ''); show(stB, FOUND + 0.06, F1, hit(FOUND + 0.06, 0.2)); cue(FOUND + 0.125, 'slam', { n: 3 });
    const dA = add(`<div style="display:flex;align-items:center;gap:12px;font:600 30px/1 'Plus Jakarta Sans';color:#c9cdb9;white-space:nowrap">${ic('pin', 32, C.cari)}Terakhir dekat Masjid Al-Ikhlas</div>`);
    const dB = add(`<div style="display:flex;align-items:center;gap:12px;font:600 30px/1 'Plus Jakarta Sans';color:#e9f5ec;white-space:nowrap">${ic('pin', 32, C.leaf)}Aman di Posko Balai Desa</div>`);
    posC(dA, 540, 1168); posC(dB, 540, 1168);
    show(dA, F0 + 0.19, FOUND); show(dB, FOUND + 0.19, F1);
    const mark = add(`<div class="chip" style="width:720px;height:112px;justify-content:center;border-radius:32px;font:800 36px/1 'Plus Jakarta Sans'">
        <span class="a" style="display:flex;align-items:center;gap:14px;position:absolute">${ic('check', 38)}Tandai ditemukan</span>
        <span class="b" style="display:flex;align-items:center;gap:14px;position:absolute">Ditandai oleh Budi</span></div>`);
    pos(mark, 180, 1340);
    const [mA, mB] = mark.children; const markBg = new ColorTrack(C.leaf).to(FOUND, '#f2edd5', { w: 24, z: 1 });
    draws.push((t) => {
      applyVis(mark, vis(t, F0 + 0.25, F1), `scale(${press(t, FOUND).toFixed(3)})`);
      mark.style.background = markBg.at(t); mark.style.color = C.ink;
      applyVis(mA, vis(t, -1, FOUND, 0.1)); applyVis(mB, vis(t, FOUND + 0.06, null));
    });
    cue(FOUND, 'click');
    // every phone's copy is replaced by the update
    const MINI = 6, mw = 130, gap = 20, mx0 = 540 - (MINI * mw + (MINI - 1) * gap) / 2;
    for (let i = 0; i < MINI; i++) {
      const tf = 17.25 + i * 0.125;
      const e = pos(add(`<div style="width:${mw}px;height:160px;border-radius:24px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px">
          <div class="av" style="width:58px;height:58px;font-size:26px;background:${C.ani}">A</div>
          <div class="ic" style="height:30px;position:relative;width:30px"><span class="a" style="position:absolute;inset:0">${ic('search', 30)}</span><span class="b" style="position:absolute;inset:0">${ic('check', 30)}</span></div></div>`), mx0 + i * (mw + gap), 1610);
      const [ia, ib] = e.querySelector('.ic').children;
      draws.push((t) => {
        applyVis(e, vis(t, 16.75 + i * 0.0625, F1), hit(tf, 0.1)(t));
        const p = stepR(t - tf, { w: 30, z: 1 });
        e.style.background = M.mix('#3a2412', C.leaf, p); e.style.color = M.mix(C.cari, C.ink, p);
        e.style.boxShadow = `inset 0 0 0 2px ${M.mix('#7a4419', C.leaf, p)}`;
        ia.style.opacity = (1 - p).toFixed(3); ib.style.opacity = p.toFixed(3);
      });
      cue(tf, 'check');
    }
    cue(16.75, 'whoosh', { v: 0.35 });

    // ───────────────────────── Scene B: elder mode (19 – 28) ─────────────────────────
    const PX = 260, PW = 560;   // phone inner column (phone: x 220–860, y 620–1800)
    const B0 = 19.25, PROF1 = 20.75, TOG = 20.0, H0 = 20.875, B1 = 27.85;
    // profile sheet
    const pTitle = pos(add(`<div style="display:flex;align-items:center;gap:20px;width:${PW}px"><div class="av" style="width:84px;height:84px;background:#9c36b5">S</div><div><div style="font:800 38px/1.1 'Plus Jakarta Sans'">Bu Siti</div><div class="mono" style="font-size:20px;color:#a5b0a2;margin-top:6px">Profil</div></div></div>`), PX, 680);
    show(pTitle, B0, PROF1);
    const rowsP = [['globe', 'Bahasa', 'Indonesia', 820], ['batt', 'Hemat baterai', 'Mati', 1120]];
    rowsP.forEach(([icn, a, b, y], i) => {
      const e = pos(add(`<div style="width:${PW}px;height:96px;box-sizing:border-box;padding:0 26px;border-radius:26px;background:#13271d;display:flex;align-items:center;gap:18px;font:700 30px/1 'Plus Jakarta Sans'">${ic(icn, 32, C.muted)}${a}<span style="margin-left:auto;color:#a5b0a2;font-weight:500">${b}</span></div>`), PX, y);
      show(e, B0 + 0.125 + i * 0.125, PROF1);
    });
    const tRow = pos(add(`<div style="width:${PW}px;height:180px;box-sizing:border-box;padding:28px 26px;border-radius:28px;background:#13271d;box-shadow:inset 0 0 0 2px rgba(60,191,110,.45)">
        <div style="display:flex;align-items:center;gap:18px;font:800 34px/1 'Plus Jakarta Sans'">${ic('big', 36, C.leaf)}Mode lansia</div>
        <div style="font:500 24px/1.3 'Plus Jakarta Sans';color:#a5b0a2;margin-top:16px;width:340px">Tombol besar. Mati secara bawaan.</div></div>`), PX, 932);
    show(tRow, B0 + 0.19, PROF1);
    const trk = pos(add('<div style="width:132px;height:72px;border-radius:36px"></div>'), PX + PW - 26 - 132, 932 + 28);
    const knob = pos(add('<div style="height:58px;border-radius:29px;background:#f2edd5"></div>'), 0, 932 + 35);
    const kL = new Track(trk.offsetLeft + 7).to(TOG, trk.offsetLeft + 132 - 7 - 58, { w: 17, z: 0.88 });
    const kR = new Track(trk.offsetLeft + 7 + 58).to(TOG, trk.offsetLeft + 132 - 7, { w: 34, z: 0.86 });
    draws.push((t) => {
      const v = vis(t, B0 + 0.25, PROF1); applyVis(trk, v); applyVis(knob, v);
      const L = kL.at(t), R = kR.at(t); knob.style.left = L.toFixed(1) + 'px'; knob.style.width = (R - L).toFixed(1) + 'px';
      trk.style.background = M.mix('#2c3c32', C.leaf, stepR(t - TOG, { w: 26, z: 1 }));
    });
    cue(TOG, 'toggle'); cue(TOG, 'click');
    // elder home
    const top = pos(add(`<div style="display:flex;align-items:center;gap:14px;width:${PW}px;font:800 32px/1 'Plus Jakarta Sans'"><i style="width:16px;height:16px;border-radius:50%;background:#3cbf6e;display:block"></i>Grup Pos 3<span class="mono" style="margin-left:auto;font-size:20px;color:#a5b0a2;font-weight:500">5 orang</span></div>`), PX, 660);
    show(top, H0, B1);
    const bigB = (html, y, h, bg, col, tin) => {
      const e = pos(add(`<div style="width:${PW}px;height:${h}px;border-radius:36px;background:${bg};color:${col};display:flex;align-items:center;justify-content:center;gap:20px;font:800 46px/1 'Plus Jakarta Sans';position:absolute;overflow:hidden">${html}</div>`), PX, y);
      return e;
    };
    const SOSB = bigB(`<span style="font-size:88px;letter-spacing:.02em">SOS</span>`, 716, 200, C.sos, '#fff');
    const AMAN = 22.0;
    const amanB = bigB(`<span class="a" style="display:flex;align-items:center;gap:18px;position:absolute">${ic('shield', 50)}Saya aman</span><span class="b" style="display:flex;align-items:center;gap:18px;position:absolute">${ic('check', 50)}Terkirim</span>`, 936, 140, C.leaf, C.ink);
    const TALK0 = 22.75, TALK1 = 23.75;
    const talkB = bigB(`<span class="a" style="display:flex;align-items:center;gap:18px;position:absolute;font-size:40px">${ic('mic', 46)}Tahan untuk bicara</span>
        <span class="b" style="display:flex;align-items:center;gap:22px;position:absolute;font-size:40px"><span class="wave" style="height:56px">${'<i></i>'.repeat(12)}</span>Bicara…</span>
        <i class="pr" style="position:absolute;left:0;bottom:0;height:8px;background:#04140a;opacity:.35;display:block"></i>`, 1096, 140, C.cream, C.ink);
    [[SOSB, 21.0], [amanB, 21.25], [talkB, 21.5]].forEach(([e, tin], i) => {
      show(e, tin, B1, (t) => `${hit(tin, 0.08)(t)} scale(${(e === amanB ? press(t, AMAN) : 1).toFixed(3)}) scale(${(e === talkB ? (t >= TALK0 && t < TALK1 + 0.3 ? lerp(1, 0.96, stepR(t - TALK0, SP.pop)) + (t >= TALK1 ? 0.04 * stepR(t - TALK1, SP.pop) : 0) : 1) : 1).toFixed(3)})`);
      cue(tin, 'slam', { n: i + 1 });
    });
    { const [a, b] = amanB.children;
      draws.push((t) => { if (t < 21) return; applyVis(a, vis(t, -1, AMAN, 0.1)); applyVis(b, vis(t, AMAN + 0.06, 22.75)); if (t > 22.75) applyVis(a, vis(t, 22.8, null)); });
      cue(AMAN, 'click'); cue(AMAN + 0.125, 'check'); }
    { const [a, b, pr] = talkB.children; const bars = [...b.querySelector('.wave').children];
      const bg = new ColorTrack(C.cream).to(TALK0, C.leaf, { w: 30, z: 1 }).to(TALK1, C.cream, { w: 22, z: 1 });
      draws.push((t) => {
        if (t < 21) return;
        talkB.style.background = bg.at(t);
        applyVis(a, vis(t, t < TALK1 ? -1 : TALK1 + 0.06, t < TALK1 ? TALK0 : null, 0.1));
        applyVis(b, vis(t, TALK0 + 0.06, TALK1, 0.1));
        bars.forEach((e, i) => { const q = Math.abs(Math.sin(i * 1.71 + t * 13) * 0.6 + Math.sin(i * 0.63 - t * 8.3) * 0.4); e.style.height = (10 + 44 * q).toFixed(1) + 'px'; });
        pr.style.width = (PW * clamp((t - TALK0) / (TALK1 - TALK0)) * (t < TALK1 + 0.15 ? 1 : 0)).toFixed(1) + 'px';
      });
      cue(TALK0, 'click'); cue(TALK0, 'drag', { d: 1.0 }); cue(TALK1, 'release'); }
    // SOS red line
    const SOS_T = 24.5;
    const redL = pos(add(`<div style="width:${PW}px;height:64px;border-radius:20px;background:${C.sos};color:#fff;display:flex;align-items:center;gap:14px;padding:0 22px;box-sizing:border-box;font:800 28px/1 'Plus Jakarta Sans'"><i style="width:14px;height:14px;border-radius:50%;background:#fff;display:block"></i>Pak RT sedang SOS</div>`), PX, 1258);
    draws.push((t) => {
      if (t < SOS_T) { redL.style.visibility = 'hidden'; return; }
      const v = vis(t, SOS_T, B1); applyVis(redL, v, `scaleX(${(0.6 + 0.4 * stepR(t - SOS_T, SP.pop)).toFixed(3)})`);
      redL.firstElementChild.style.opacity = (0.5 + 0.5 * Math.cos((t - SOS_T) * Math.PI * 4)).toFixed(3);
    });
    cue(SOS_T, 'alert');
    // family list
    const fam = [['Budi', 'B', C.budi, 'aman', 'aman', null], ['Sari', 'S', C.sari, 'aman', 'di Posko', 23.25], ['Pak RT', 'R', C.rt, 'aman', 'SOS', SOS_T]];
    const famY = (t) => 1258 + 84 * stepR(t - SOS_T, { w: 16, z: 0.9 });
    const fl = pos(add('<div class="mono" style="font-size:20px;color:#a5b0a2;letter-spacing:.1em">KELUARGA</div>'), PX + 6, 0);
    draws.push((t) => { fl.style.top = (famY(t) + 2).toFixed(1) + 'px'; });
    show(fl, 21.75, B1);
    fam.forEach(([nm, l, col, s0, s1, ts], i) => {
      const e = add(`<div style="width:${PW}px;height:72px;display:flex;align-items:center;gap:18px;font:700 30px/1 'Plus Jakarta Sans'"><div class="av" style="width:56px;height:56px;font-size:24px;background:${col}">${l}</div>${nm}
          <span style="margin-left:auto;position:relative;height:44px;width:180px"><span class="a chip" style="position:absolute;right:0;top:0;height:44px;padding:0 18px;background:rgba(60,191,110,.16);color:#3cbf6e;font:700 22px/1 'Plus Jakarta Sans'">${s0}</span>
          <span class="b chip" style="position:absolute;right:0;top:0;height:44px;padding:0 18px;font:800 22px/1 'Plus Jakarta Sans';${s1 === 'SOS' ? `background:${C.sos};color:#fff` : 'background:rgba(77,171,247,.18);color:#9fd0ff'}">${s1}</span></span></div>`);
      e.style.left = PX + 'px';
      const a = e.querySelector('.a'), b = e.querySelector('.b');
      draws.push((t) => {
        e.style.top = (famY(t) + 36 + i * 80).toFixed(1) + 'px';
        if (ts == null) { b.style.visibility = 'hidden'; return; }
        applyVis(a, vis(t, -1, ts, 0.1)); applyVis(b, vis(t, ts + 0.06, null), hit(ts + 0.06, 0.15)(t));
      });
      show(e, 21.875 + i * 0.125, B1); cue(21.875 + i * 0.125, 'pop', { n: i });
      if (ts && ts !== SOS_T) cue(ts, 'swap', { n: 4 });
    });
    const ann = add(`<div style="width:${PW}px;box-sizing:border-box;padding:22px 24px;border-radius:26px;background:#13271d;display:flex;gap:16px;align-items:flex-start;font:600 26px/1.3 'Plus Jakarta Sans';color:#c9cdb9">${ic('mega', 34, C.lamp)}<span><b style="color:#f2c46b">Pengumuman</b><br>Kumpul di Balai Desa sebelum gelap.</span></div>`);
    ann.style.left = PX + 'px';
    draws.push((t) => { ann.style.top = (famY(t) + 300).toFixed(1) + 'px'; });
    show(ann, 25.25, B1, popIn(25.25, 0.92)); cue(25.25, 'pop', { n: 3 });
    const iosC = add(`<div class="chip mono" style="height:48px;padding:0 20px;font-size:21px;color:#a5b0a2;box-shadow:inset 0 0 0 1.5px rgba(242,237,213,.18)">Mode lengkap ›</div>`);
    posC(iosC, 540, 1826); show(iosC, 26.5, B1); cue(26.5, 'pop', { n: 5 });

    // ───────────────────────── Outro (28 – 32) ─────────────────────────
    const wm = add('<div style="font:800 128px/1 \'Plus Jakarta Sans\';letter-spacing:-.045em;white-space:nowrap">Saling Jaga</div>');
    posC(wm, 540, 990); show(wm, 28.5, null, hit(28.5, 0.06, 8)); cue(28.5, 'slam', { n: 4 });
    const tag = add('<div style="font:500 46px/1.25 \'Plus Jakarta Sans\';color:#c9cdb9;text-align:center;width:900px">Saat sinyal hilang,<br>kita tetap <span class="serif" style="color:#3cbf6e;font-size:1.18em">saling jaga.</span></div>');
    posC(tag, 540, 1160); show(tag, 29.0, null); cue(29.0, 'note', { n: 3 });
    const cta = add(`<div class="chip" style="height:104px;padding:0 48px;background:#3cbf6e;color:#04140a;font:800 40px/1 'Plus Jakarta Sans'">Unduh APK gratis</div>`);
    posC(cta, 540, 1370); show(cta, 29.5, null, (t) => `scale(${(press(t, 29.5) * (0.92 + 0.08 * stepR(t - 29.5, SP.pop))).toFixed(3)})`); cue(29.5, 'cta');
    const url = add('<div class="mono" style="font-size:32px;font-weight:600;color:#f2edd5">saling-jaga.my.id</div>');
    posC(url, 540, 1510); show(url, 30.0, null); cue(30.0, 'note', { n: 5 });
    const vrow = add('<div class="mono" style="font-size:24px;color:#6f7c6f;letter-spacing:.06em;white-space:nowrap">v0.33 Mode lansia · v0.34 Cari keluarga</div>');
    posC(vrow, 540, 1600); show(vrow, 30.5, null); cue(30.5, 'shimmer');

    // ───────────────────────── Cursors ─────────────────────────
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
    // "Kamu": makes the card, then becomes Bu Siti's finger in elder mode
    const KX = new Track(980), KY = new Track(1960);
    const mv = (X, Y, t, x, y, sp = SP.cursor) => { X.to(t, x, sp); Y.to(t, y, sp); };
    mv(KX, KY, 3.75, 640, 1110);          // name field, click at 4.25
    mv(KX, KY, 5.6, 720, 1500);           // drift toward the button
    mv(KX, KY, 6.55, 620, 1640);          // on the button, click 7.0
    mv(KX, KY, 7.35, 1000, 1980);
    mv(KX, KY, 18.9, 980, 1960, SP.snap);
    mv(KX, KY, 19.45, 744, 1000);         // toggle, click 20.0
    mv(KX, KY, 21.5, 620, 1010);          // Saya aman, click 22.0
    mv(KX, KY, 22.35, 600, 1170);         // talk, hold 22.75 – 23.75
    mv(KX, KY, 24.0, 1000, 1980);
    cue(4.25, 'click');
    cursor('Kamu', C.leaf, C.ink, KX, KY, [4.25, SEND, TOG, AMAN, TALK0, TALK1], (t) => (t > 3.8 && t < 7.85) || (t > 19.2 && t < 24.45), (t) => t > TALK0 && t < TALK1);
    // "Budi" marks her found
    const BX = new Track(1000), BY = new Track(1980);
    mv(BX, BY, 15.25, 660, 1400); mv(BX, BY, 16.5, 1000, 1990);
    cursor('Budi', C.budi, '#fff', BX, BY, [FOUND], (t) => t > 15.2 && t < 16.95);

    // ───────────────────────── seek ─────────────────────────
    const DUR = 32.0;
    window.seek = (t) => {
      const c = cam(t);
      world.style.transform = `translate(540px,960px) scale(${c.z.toFixed(5)}) translate(${-c.x}px,${-c.y}px)`;
      for (const d of draws) d(t);
    };
    cues.forEach((c) => { const g = c.t / 0.125; if (Math.abs(g - Math.round(g)) > 1e-6) throw new Error('cue off grid: ' + JSON.stringify(c)); });
    cues.sort((a, b) => a.t - b.t);
    window.FILM = { width: 1080, height: 1920, bpm: 120, duration: DUR,
      sections: { intro: [0, 3.5], drop: [16, 19], outro: [28, DUR] }, cues };
    window.seek(0);
    window.READY = true;
  } catch (err) {
    console.error(err);
    window.FILM_ERROR = String(err && err.stack || err);
  }
})();
