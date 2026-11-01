// Saling Jaga · fitur baru (v0.24 – v0.27). Landscape 1920×1080, 120 BPM, 32 s.
// One hero shape, never cut: logo → chat → peer network → one link lane → offline guide → topic →
// dialer → language switch → phone → logo. Every style is a pure function of t inside seek(t).
(async function () {
  try {
    const { clamp, lerp, outQ, inOut, stepR, Track, ColorTrack, SP, vis, applyVis, press, ripple } = M;
    const C = { night: '#07110c', night2: '#0b1811', card: '#0f1f17', card2: '#13271d', cream: '#f2edd5', muted: '#a5b0a2',
      dim: '#6f7c6f', leaf: '#3cbf6e', ink: '#04140a', moss: '#1b4d2e', lamp: '#f2c46b', sos: '#ef4b4b',
      budi: '#e8590c', sari: '#d6336c', rt: '#1e7a45' };

    // Fonts + logo before anything is measured.
    await Promise.all([
      document.fonts.load('800 70px "Plus Jakarta Sans"'), document.fonts.load('500 27px "Plus Jakarta Sans"'),
      document.fonts.load('700 24px "Plus Jakarta Sans"'), document.fonts.load('600 21px "JetBrains Mono"'),
      document.fonts.load('italic 400 70px "Instrument Serif"'),
    ].map((p) => p.catch(() => null)));
    await document.fonts.ready;

    const cues = [];
    const cue = (t, k, o = {}) => cues.push({ t, k, ...o });
    const world = document.getElementById('world');
    const draws = [];
    const add = (html, parent = world) => { const d = document.createElement('div'); d.innerHTML = html.trim(); const e = d.firstElementChild; parent.appendChild(e); return e; };
    const pos = (e, x, y) => { e.style.left = x + 'px'; e.style.top = y + 'px'; return e; };
    // show(e, tin, tout, extra): blur swap; extra is a transform suffix or fn(t)
    const show = (e, tin, tout, extra = '') => draws.push((t) => applyVis(e, vis(t, tin, tout), typeof extra === 'function' ? extra(t) : extra));

    const I = {
      mic: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0"/><path d="M12 17v5"/></svg>',
      play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z"/></svg>',
      check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
      x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>',
      nosig: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 20v-2M9 20v-5M14 20v-8M19 20V7" opacity=".45"/><path d="m3 3 18 18"/></svg>',
      alert: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>',
      pulse: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7z"/><path d="M3.5 12H8l1.5-2.5 2.5 5 2-3.5h6.5"/></svg>',
      book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5V5a2 2 0 0 1 2-2h14v15H6.5A2.5 2.5 0 0 0 4 20.5 2.5 2.5 0 0 0 6.5 23H20"/><path d="M12 7v6M9 10h6"/></svg>',
      phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/></svg>',
      spk: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/></svg>',
      globe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/></svg>',
      link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/></svg>',
      back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>',
    };
    const ic = (name, size, color = 'currentColor') => `<span style="display:inline-flex;width:${size}px;height:${size}px;color:${color};flex:none">${I[name].replace('<svg ', `<svg width="${size}" height="${size}" `)}</span>`;

    // ───────────────────────── Camera ─────────────────────────
    const camZ = new Track(Math.log(1.07)).to(0, 0, { w: 2.2, z: 1 })
      .to(16.5, Math.log(0.955), SP.cam).to(17.0, Math.log(1.0), { w: 16, z: 0.85 })
      .to(28.4, Math.log(0.985), SP.cam).to(29.0, 0, { w: 4, z: 1 });
    const camX = new Track(960), camY = new Track(540);
    const breathe = (t) => 0.006 * Math.sin(t * 0.9);

    // ───────────────────────── Hero shape ─────────────────────────
    const shape = add('<div id="shape"></div>');
    const logo = add('<img id="logo" src="assets/mark.png" alt="">', shape);
    await new Promise((r) => { if (logo.complete) r(); else { logo.onload = r; logo.onerror = r; } });
    const S = { x: new Track(960), y: new Track(390), w: new Track(0), h: new Track(0), r: new Track(110), bg: new ColorTrack(C.cream), bd: new Track(0) };
    const st = (t, x, y, w, h, r, bg, bd = 0.1, sp = SP.shape) => {
      S.x.to(t, x, sp); S.y.to(t, y, sp); S.w.to(t, w, sp); S.h.to(t, h, sp); S.r.to(t, r, sp); S.bg.to(t, bg, { w: 28, z: 1 }); S.bd.to(t, bd, SP.soft);
    };
    S.w.to(0.5, 220, SP.pop); S.h.to(0.5, 220, SP.pop); cue(0.5, 'born');
    st(3.5, 1300, 540, 780, 760, 40, C.card, 0.1); cue(3.5, 'whoosh', { v: 0.6 }); cue(3.5, 'swap', { n: 0 });
    st(10.0, 1300, 540, 820, 720, 44, C.card, 0.1); cue(10.0, 'swap', { n: 1 });
    st(13.5, 1300, 560, 860, 420, 36, C.card, 0.12); cue(13.5, 'swap', { n: 2 });
    st(17.0, 1300, 560, 860, 820, 40, C.card2, 0.1, SP.pop); cue(17.0, 'drop');
    st(22.0, 1300, 560, 760, 790, 40, C.card2, 0.1); cue(22.0, 'swap', { n: 3 });
    st(23.0, 1300, 560, 560, 790, 48, C.night2, 0.16); cue(23.0, 'swap', { n: 4 });
    st(24.5, 1300, 540, 700, 580, 44, C.card, 0.1); cue(24.5, 'swap', { n: 5 });
    st(27.0, 1300, 540, 400, 820, 64, C.night2, 0.22); cue(27.0, 'whoosh', { v: 0.5 });
    st(28.5, 960, 380, 220, 220, 110, C.cream, 0, SP.shape); cue(28.5, 'settle');
    draws.push((t) => {
      const w = Math.max(0, S.w.at(t)), h = Math.max(0, S.h.at(t)), x = S.x.at(t), y = S.y.at(t);
      const r = Math.min(S.r.at(t), w / 2, h / 2);
      shape.style.width = w + 'px'; shape.style.height = h + 'px';
      shape.style.transform = `translate(${(x - w / 2).toFixed(2)}px,${(y - h / 2).toFixed(2)}px)`;
      shape.style.borderRadius = r.toFixed(2) + 'px';
      shape.style.background = S.bg.at(t);
      shape.style.boxShadow = `inset 0 0 0 1.5px rgba(242,237,213,${clamp(S.bd.at(t), 0, 1).toFixed(3)}), 0 50px 90px -40px rgba(0,0,0,.75)`;
      // logo lives in the shape at the start and the end
      const v = t < 10 ? vis(t, 0.62, 3.375) : vis(t, 28.75, null);
      const sz = Math.min(w, h) * 0.86;
      logo.style.width = sz + 'px'; logo.style.height = sz + 'px';
      applyVis(logo, v, '');
      logo.style.transform = `translate(-50%,-50%) translateY(${v.dy.toFixed(2)}px) scale(${(0.85 + 0.15 * v.e).toFixed(3)})`;
    });

    // Radio rings from the shape: Wi‑Fi Direct, phone to phone.
    const rings = [...document.querySelectorAll('#rings circle')];
    const cam = (t) => { const z = Math.exp(camZ.at(t) + breathe(t)); return { z, x: camX.at(t), y: camY.at(t) }; };
    draws.push((t) => {
      const c = cam(t), sx = 960 + (S.x.at(t) - c.x) * c.z, sy = 540 + (S.y.at(t) - c.y) * c.z;
      const base = Math.max(S.w.at(t), S.h.at(t)) / 2 * c.z;
      rings.forEach((el, k) => {
        const ph = ((t * 0.32 + k / 3) % 1 + 1) % 1;
        el.setAttribute('cx', sx.toFixed(1)); el.setAttribute('cy', sy.toFixed(1));
        el.setAttribute('r', (base + 40 + ph * 520).toFixed(1));
        el.setAttribute('fill', 'none'); el.setAttribute('stroke', C.cream);
        el.setAttribute('stroke-width', '1.5');
        el.setAttribute('stroke-opacity', (0.09 * (1 - ph) * clamp(t / 1.5)).toFixed(3));
      });
    });

    // ───────────────────────── Captions (left column) ─────────────────────────
    const checkSvg = I.check;
    function caption(tin, tout, kicker, head, subs = []) {
      const g = add(`<div class="cap"><div class="kick">${kicker}</div><div class="head">${head}</div><div class="subs"></div></div>`);
      const [k, h, sb] = g.children;
      const subEls = subs.map(([ts, txt, icon]) => { const s = add(`<div class="sub">${icon ? I[icon] : checkSvg}<span>${txt}</span></div>`, sb); return [s, ts]; });
      pos(g, 150, 540 - g.offsetHeight / 2);
      show(k, tin, tout); show(h, tin + 0.125, tout);
      subEls.forEach(([s, ts]) => show(s, ts, tout));
      return g;
    }
    caption(4.0, 9.7, 'v0.24 · Pesan suara', 'Kolom kosong? Tombol kirim <span class="serif">jadi rekam.</span>', [
      [6.0, '<b>Hingga 1 menit</b>, AAC 24 kbit/s'], [6.5, 'Sekitar <b>180 KB</b> per menit'], [8.5, 'Tanda <b>“Terkirim ke”</b> tiap anggota'],
    ]);
    caption(10.0, 13.2, 'Tetap kompatibel', 'HP versi 0.23 <span class="serif">tetap tersambung.</span>', [
      [10.75, 'Tiap HP mengumumkan <b>bisa memutar</b> pesan suara'], [12.0, 'HP lama tak pernah dikirimi, jadi tak putus'],
    ]);
    caption(13.5, 16.75, 'Perbaikan dari tes CI', 'Tunggu satu teks <span class="serif">dari tiap HP.</span>', [
      [14.25, 'Frame di satu jalur <b>tiba berurutan</b>'], [15.5, 'Jadi pengumumannya pasti <b>sudah terbaca</b>'],
    ]);
    caption(17.0, 22.25, 'v0.25 · Panduan offline', 'Bencana dan P3K, <span class="serif">tanpa internet.</span>', [
      [18.5, '<b>6 bencana</b> dan <b>10 topik P3K</b>'], [19.0, 'Dari RJP sampai gigitan ular'], [21.0, 'Bisa dibuka <b>tanpa grup</b>'],
    ]);
    caption(22.375, 24.3, 'v0.25 · Nomor darurat', 'Satu ketuk, <span class="serif">langsung menelepon.</span>', [
      [23.5, 'Nomor darurat membuka <b>aplikasi telepon</b>', 'phone'],
    ]);
    caption(24.5, 26.8, 'v0.26 · Bahasa', 'Bahasa Indonesia, <span class="serif">kini juga English.</span>', []);
    caption(27.0, 28.35, 'v0.27 · Tampilan', 'Tata letak <span class="serif">yang baru.</span>', []);

    // ───────────────────────── Intro ─────────────────────────
    const ih = add('<div class="head" style="font-size:104px;white-space:nowrap;text-align:center">Fitur <span class="serif">baru</span> Saling Jaga</div>');
    pos(ih, 960 - ih.offsetWidth / 2, 548);
    show(ih, 1.0, 3.25); cue(1.0, 'whoosh', { v: 0.4 });
    const vers = [['v0.24', 'Pesan suara'], ['v0.25', 'Panduan offline'], ['v0.26', 'English'], ['v0.27', 'Tampilan baru']];
    const vEls = vers.map(([v, l]) => add(`<div class="chip" style="height:62px;padding:0 26px 0 12px;background:#0f1f17;box-shadow:inset 0 0 0 1.5px rgba(242,237,213,.14);font:600 26px/1 'Plus Jakarta Sans'"><span class="mono" style="background:#3cbf6e;color:#04140a;border-radius:999px;padding:9px 13px;font-size:20px">${v}</span>${l}</div>`));
    { let tw = vEls.reduce((a, e) => a + e.offsetWidth, 0) + 18 * 3, x = 960 - tw / 2;
      vEls.forEach((e, i) => { pos(e, x, 712); x += e.offsetWidth + 18; const tin = 2.0 + i * 0.25; cue(tin, 'slam', { n: i });
        show(e, tin, 3.25, (t) => `scale(${(1 + 0.12 * Math.exp(-((t - tin) * 9)) * (t > tin ? 1 : 0)).toFixed(3)})`); }); }

    // ───────────────────────── Scene 1: voice note (3.5 – 9.75) ─────────────────────────
    const CH0 = 3.75, CH1 = 9.7;
    const chHead = pos(add(`<div style="display:flex;align-items:center;gap:18px;width:700px">
        <div style="display:flex">${['K', 'B', 'S', 'P'].map((l, i) => `<div class="av" style="width:52px;height:52px;font-size:22px;margin-left:${i ? -14 : 0}px;box-shadow:0 0 0 3px #0f1f17;background:${[C.leaf, C.budi, C.sari, C.rt][i]}">${l}</div>`).join('')}</div>
        <div><div style="font:800 30px/1.1 'Plus Jakarta Sans'">Grup Pos 3</div><div style="font:500 20px/1.3 'Plus Jakarta Sans';color:#a5b0a2;display:flex;align-items:center;gap:8px"><i style="width:10px;height:10px;border-radius:50%;background:#3cbf6e;display:inline-block"></i>4 orang · Wi‑Fi Direct</div></div>
        <div class="chip mono" style="margin-left:auto;height:40px;padding:0 14px;color:#a5b0a2;font-size:18px;box-shadow:inset 0 0 0 1.5px rgba(242,237,213,.16)">${ic('nosig', 20)}0 bar</div></div>`), 950, 196);
    show(chHead, CH0, CH1);
    const rule = pos(add('<div style="width:700px;height:1.5px;background:rgba(242,237,213,.09)"></div>'), 950, 286);
    show(rule, CH0, CH1);
    const m1 = pos(add(`<div><div class="who" style="color:${C.budi}">Budi</div><div class="bubble">Air mulai naik di jalan utama.</div></div>`), 950, 318);
    const m2 = pos(add(`<div><div class="who" style="color:${C.sari}">Sari</div><div class="bubble">Aku sudah di masjid, aman.</div></div>`), 950, 446);
    show(m1, 3.875, CH1); show(m2, 4.0, CH1);
    // composer
    const comp = pos(add('<div style="width:590px;height:80px;border-radius:40px;background:#0b1811;box-shadow:inset 0 0 0 1.5px rgba(242,237,213,.12)"></div>'), 950, 818);
    show(comp, CH0, CH1);
    const ph = pos(add('<div style="font:500 26px/1 \'Plus Jakarta Sans\';color:#6f7c6f">Tulis pesan…</div>'), 986, 845);
    draws.push((t) => applyVis(ph, vis(t, CH0 + 0.1, t < 7.6 ? 5.0 : CH1, 0.1)));
    draws.push((t) => { if (t >= 7.6) applyVis(ph, vis(t, 7.75, CH1)); });
    const rec = pos(add(`<div style="display:flex;align-items:center;gap:18px;width:540px">
        <i style="width:16px;height:16px;border-radius:50%;background:#ef4b4b;display:block"></i>
        <span class="mono" style="font-size:28px;font-weight:600;width:74px">0:00</span>
        <div class="wave" style="color:#3cbf6e;height:50px">${'<i></i>'.repeat(30)}</div>
        <span class="mono" style="font-size:18px;color:#6f7c6f;margin-left:auto">maks 1:00</span></div>`), 982, 833);
    const recDot = rec.children[0], recTime = rec.children[1], recBars = [...rec.children[2].children];
    show(rec, 5.06, 7.5, '');
    const prog = pos(add('<div style="width:520px;height:5px;border-radius:3px;background:rgba(242,237,213,.08);overflow:hidden"><i style="display:block;height:100%;background:#ef4b4b;border-radius:3px"></i></div>'), 985, 882);
    show(prog, 5.06, 7.5);
    const REC0 = 5.0, REC1 = 7.5, secAt = (t) => clamp(Math.floor((t - REC0) / 0.25), 0, 10);
    for (let k = 1; k <= 9; k++) cue(REC0 + k * 0.25, 'tick');
    cue(REC0, 'drag', { d: 2.5 }); cue(REC1, 'release');
    draws.push((t) => {
      const s = secAt(t);
      recTime.textContent = `0:${String(s).padStart(2, '0')}`;
      prog.firstChild.style.width = (100 * clamp((t - REC0) / 2.5 * 10 / 60, 0, 10 / 60)).toFixed(2) + '%';
      recDot.style.opacity = (0.55 + 0.45 * Math.cos((t - REC0) * Math.PI * 4)).toFixed(3);
      recBars.forEach((b, i) => {
        const a = Math.abs(Math.sin(i * 1.71 + t * 13.0) * 0.6 + Math.sin(i * 0.63 - t * 8.3) * 0.4);
        b.style.height = (8 + 40 * a * clamp((t - REC0) * 4)).toFixed(1) + 'px';
      });
    });
    // send button = mic while the field is empty
    const send = pos(add(`<div style="width:84px;height:84px;margin:-42px 0 0 -42px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#04140a">${ic('mic', 38)}</div>`), 1612, 858);
    const sendBg = new ColorTrack(C.leaf).to(REC0, C.sos, { w: 30, z: 1 }).to(REC1, C.leaf, { w: 22, z: 1 });
    const sendS = new Track(1).to(REC0, 1.22, SP.pop).to(REC1, 1, SP.pop);
    draws.push((t) => {
      const v = vis(t, CH0 + 0.125, CH1);
      applyVis(send, v, `scale(${(sendS.at(t) * press(t, REC0) * press(t, REC1)).toFixed(3)})`);
      send.style.background = sendBg.at(t);
      send.style.color = t > REC0 + 0.05 && t < REC1 ? '#fff' : C.ink;
    });
    // hold ring around the button while recording
    const holdRing = pos(add('<svg width="132" height="132" viewBox="0 0 132 132" style="margin:-66px 0 0 -66px;overflow:visible"><circle cx="66" cy="66" r="60" fill="none" stroke="#ef4b4b" stroke-width="4" stroke-linecap="round" pathLength="1" stroke-dasharray="1" transform="rotate(-90 66 66)"/></svg>'), 1612, 858);
    draws.push((t) => {
      const v = vis(t, REC0, REC1, 0.1);
      applyVis(holdRing, v);
      holdRing.firstChild.setAttribute('stroke-dashoffset', (1 - clamp((t - REC0) / 2.5) * 10 / 60).toFixed(4));
    });
    // the sent voice note
    const vb = pos(add(`<div style="display:flex;align-items:center;gap:16px;height:92px;padding:0 26px 0 14px;border-radius:26px 26px 8px 26px;background:#3cbf6e;color:#04140a">
        <div style="width:64px;height:64px;border-radius:50%;background:#04140a;color:#3cbf6e;display:flex;align-items:center;justify-content:center">${ic('play', 30)}</div>
        <div class="wave" style="height:52px">${Array.from({ length: 26 }, (_, i) => `<i style="height:${(10 + 36 * Math.abs(Math.sin(i * 1.3) * 0.7 + Math.sin(i * 0.47) * 0.3)).toFixed(0)}px"></i>`).join('')}</div>
        <span class="mono" style="font-size:24px;font-weight:600">0:10</span></div>`), 0, 574);
    vb.style.left = (1650 - vb.offsetWidth) + 'px';
    show(vb, 7.62, CH1, (t) => `scale(${(0.9 + 0.1 * stepR(t - 7.62, SP.pop)).toFixed(3)})`); cue(7.75, 'pop');
    vb.style.transformOrigin = '100% 100%';
    const rc = add(`<div style="display:flex;align-items:center;gap:12px;font:600 21px/1 'JetBrains Mono';color:#a5b0a2">Terkirim ke
        <span class="chip" style="height:40px;padding:0 14px 0 6px;background:#13271d;color:#f2edd5;font:700 20px/1 'Plus Jakarta Sans'"><span class="av" style="width:30px;height:30px;font-size:15px;background:${C.budi}">B</span>Budi<span class="ck" style="color:#3cbf6e">${ic('check', 22)}</span></span>
        <span class="chip" style="height:40px;padding:0 14px 0 6px;background:#13271d;color:#f2edd5;font:700 20px/1 'Plus Jakarta Sans'"><span class="av" style="width:30px;height:30px;font-size:15px;background:${C.sari}">S</span>Sari<span class="ck" style="color:#3cbf6e">${ic('check', 22)}</span></span></div>`);
    pos(rc, 1650 - rc.offsetWidth, 690);
    show(rc, 8.25, CH1);
    const [ckB, ckS] = rc.querySelectorAll('.ck');
    draws.push((t) => {
      [[ckB, 8.5], [ckS, 9.0]].forEach(([e, tc]) => { const p = stepR(t - tc, SP.pop); e.style.opacity = clamp(p * 1.5).toFixed(3); e.style.transform = `scale(${(0.4 + 0.6 * p).toFixed(3)})`; });
    });
    cue(8.25, 'pop', { n: 1 }); cue(8.5, 'check'); cue(9.0, 'check');

    // ───────────────────────── Scene 2: peers announce, 0.23 untouched (10 – 13.25) ─────────────────────────
    const N0 = 10.125, N1 = 13.2;
    const nodes = [
      { id: 'K', name: 'Kamu', ver: 'v0.24', x: 1300, y: 520, c: C.leaf, tin: 10.125 },
      { id: 'B', name: 'Budi', ver: 'v0.24', x: 1050, y: 300, c: C.budi, tin: 10.25, tag: 10.75, ok: 12.5 },
      { id: 'S', name: 'Sari', ver: 'v0.24', x: 1550, y: 300, c: C.sari, tin: 10.375, tag: 11.0, ok: 12.625 },
      { id: 'P', name: 'Pak RT', ver: 'v0.23', x: 1300, y: 748, c: C.rt, tin: 10.5, tag: 11.25, old: true },
    ];
    const svgNS = 'http://www.w3.org/2000/svg';
    const lines = add('<svg width="1920" height="1080" viewBox="0 0 1920 1080" style="left:0;top:0;overflow:visible"></svg>');
    const K = nodes[0];
    nodes.slice(1).forEach((n) => {
      const l = document.createElementNS(svgNS, 'line');
      l.setAttribute('x1', K.x); l.setAttribute('y1', K.y); l.setAttribute('x2', n.x); l.setAttribute('y2', n.y);
      l.setAttribute('stroke', n.old ? C.muted : C.leaf); l.setAttribute('stroke-width', 3); l.setAttribute('stroke-linecap', 'round');
      l.setAttribute('pathLength', 1); l.setAttribute('stroke-dasharray', '1 1'); lines.appendChild(l); n.line = l;
    });
    draws.push((t) => {
      const v = vis(t, N0, N1); applyVis(lines, v);
      nodes.slice(1).forEach((n) => { const p = stepR(t - n.tin - 0.06, { w: 12, z: 1 }); n.line.setAttribute('stroke-dashoffset', (1 - p).toFixed(4)); n.line.setAttribute('stroke-opacity', n.old ? 0.45 : 0.75); });
    });
    nodes.forEach((n, i) => {
      const e = add(`<div style="display:flex;flex-direction:column;align-items:center;width:240px">
          <div class="av" style="background:${n.c};box-shadow:0 0 0 8px #0f1f17;position:relative">${n.id}<span class="okb" style="position:absolute;right:-8px;bottom:-6px;width:36px;height:36px;border-radius:50%;background:#3cbf6e;color:#04140a;display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 4px #0f1f17;opacity:0">${ic('check', 22)}</span></div>
          <div style="margin-top:14px;font:700 24px/1 'Plus Jakarta Sans';background:#0f1f17;padding:2px 8px;border-radius:8px">${n.name} <span class="mono" style="font-size:17px;color:#a5b0a2;font-weight:500">${n.ver}</span></div></div>`);
      pos(e, n.x - 120, n.y - 44);
      show(e, n.tin, N1, (t) => `scale(${(0.7 + 0.3 * stepR(t - n.tin, SP.pop)).toFixed(3)})`);
      e.style.transformOrigin = '50% 44px';
      cue(n.tin, 'pop', { n: i });
      if (n.ok) {
        const okb = e.querySelector('.okb');
        draws.push((t) => { const p = stepR(t - n.ok, SP.pop); okb.style.opacity = clamp(p * 1.4).toFixed(3); okb.style.transform = `scale(${(0.3 + 0.7 * p).toFixed(3)})`; });
        cue(n.ok, 'check');
      }
      if (n.tag) {
        const tg = add(n.old
          ? `<div class="chip" style="height:44px;padding:0 18px;background:#13271d;color:#a5b0a2;font:600 20px/1 'Plus Jakarta Sans';box-shadow:inset 0 0 0 1.5px rgba(242,237,213,.14)">${ic('x', 20)}belum bisa putar suara</div>`
          : `<div class="chip" style="height:44px;padding:0 18px;background:rgba(60,191,110,.14);color:#3cbf6e;font:600 20px/1 'Plus Jakarta Sans';box-shadow:inset 0 0 0 1.5px rgba(60,191,110,.4)">${ic('spk', 22)}bisa putar suara</div>`);
        if (n.old) pos(tg, n.x - 90 - tg.offsetWidth, n.y - 22); else pos(tg, n.x - tg.offsetWidth / 2, n.y + 92);
        show(tg, n.tag, N1); cue(n.tag, 'pop', { n: i + 3 });
      }
    });
    // Pak RT keeps the link: status pill
    const keep = add(`<div class="chip" style="height:44px;padding:0 18px;background:#3cbf6e;color:#04140a;font:700 20px/1 'Plus Jakarta Sans'">${ic('link', 22)}tetap tersambung</div>`);
    pos(keep, 1300 + 110, 748 - 22); show(keep, 13.0 - 0.25, N1); cue(12.75, 'settle');
    // voice packets fly to the phones that can play them
    [nodes[1], nodes[2]].forEach((n, i) => {
      const pk = add(`<div class="chip" style="height:46px;padding:0 14px;margin:-23px 0 0 -40px;background:#3cbf6e;color:#04140a">${ic('mic', 22)}<span class="wave" style="height:22px;gap:3px">${'<i style="width:4px;height:12px"></i><i style="width:4px;height:20px"></i><i style="width:4px;height:9px"></i>'}</span></div>`);
      const t0 = 12.0 + i * 0.125, t1 = n.ok;
      draws.push((t) => {
        const p = inOut((t - t0) / (t1 - t0));
        const on = t >= t0 && t < t1 + 0.12;
        pk.style.visibility = on ? 'visible' : 'hidden';
        pk.style.opacity = (on ? clamp((t - t0) * 8) * (1 - clamp((t - t1) / 0.12)) : 0).toFixed(3);
        pk.style.left = lerp(K.x, n.x, p).toFixed(1) + 'px'; pk.style.top = lerp(K.y, n.y, p).toFixed(1) + 'px';
      });
    });
    cue(12.0, 'whoosh', { v: 0.5 });

    // ───────────────────────── Scene 3: one link, frames in order (13.5 – 16.6) ─────────────────────────
    const L0 = 13.625, L1 = 16.75, LY = 600, LK = 1000, LS = 1600;
    const ci = add(`<div class="chip mono" style="height:46px;padding:0 18px;font-size:19px;font-weight:600"><span class="a" style="display:flex;align-items:center;gap:10px">${ic('x', 20)}tes CI · gagal sekali</span><span class="b" style="display:flex;align-items:center;gap:10px;position:absolute;left:18px">${ic('check', 20)}tes CI · lulus</span></div>`);
    pos(ci, 1300 - ci.offsetWidth / 2, 384);
    const [ciA, ciB] = ci.children; const CIOK = 16.25;
    draws.push((t) => {
      applyVis(ci, vis(t, L0, L1));
      const p = stepR(t - CIOK, { w: 26, z: 1 });
      ci.style.background = M.mix('#3a1515', '#3cbf6e', p);
      ci.style.color = p > 0.5 ? C.ink : '#ff8a8a';
      ciA.style.opacity = (1 - p).toFixed(3); ciA.style.filter = `blur(${(p * 8).toFixed(2)}px)`;
      ciB.style.opacity = p.toFixed(3); ciB.style.filter = `blur(${((1 - p) * 8).toFixed(2)}px)`;
    });
    cue(L0, 'alert'); cue(CIOK, 'check');
    const lane = pos(add(`<div style="width:${LS - LK - 120}px;height:3px;background:repeating-linear-gradient(90deg,rgba(242,237,213,.28) 0 14px,transparent 14px 26px)"></div>`), LK + 60, LY - 1.5);
    show(lane, L0 + 0.125, L1);
    const laneLbl = add('<div class="mono" style="font-size:19px;color:#6f7c6f;letter-spacing:.06em">satu jalur · urutan terjaga</div>');
    pos(laneLbl, 1300 - laneLbl.offsetWidth / 2, 676); show(laneLbl, 14.25, L1);
    [[LK, 'K', 'Kamu', C.leaf], [LS, 'S', 'Sari', C.sari]].forEach(([x, l, nm, c], i) => {
      const e = add(`<div style="display:flex;flex-direction:column;align-items:center;width:200px"><div class="av" style="width:80px;height:80px;font-size:34px;background:${c}">${l}</div><div style="margin-top:12px;font:700 22px/1 'Plus Jakarta Sans'">${nm}</div></div>`);
      pos(e, x - 100, LY - 40); show(e, L0 + i * 0.125, L1); cue(L0 + i * 0.125, 'pop', { n: i + 2 });
    });
    // gate over Kamu: waiting → ready
    const gate = add(`<div style="width:240px;height:40px"><span class="a mono" style="position:absolute;left:0;top:0;width:240px;text-align:center;font-size:19px;color:#a5b0a2">menunggu teks…</span><span class="b chip" style="position:absolute;left:50%;top:0;transform:translateX(-50%);height:40px;padding:0 16px;background:#3cbf6e;color:#04140a;font:700 19px/1 'Plus Jakarta Sans'">${ic('check', 18)}siap kirim</span></div>`);
    pos(gate, LK - 120, LY - 104);
    const [gA, gB] = gate.children, GATE = 15.5;
    draws.push((t) => {
      applyVis(gate, vis(t, 14.0, L1));
      const p = stepR(t - GATE, SP.pop);
      gA.style.opacity = (1 - clamp(p * 2)).toFixed(3); gA.style.filter = `blur(${(clamp(p * 2) * 8).toFixed(2)}px)`;
      gB.style.opacity = clamp(p * 1.4).toFixed(3); gB.style.transform = `translateX(-50%) scale(${(0.6 + 0.4 * p).toFixed(3)})`;
    });
    cue(GATE, 'toggle');
    const frames = [
      { txt: '<b class="mono" style="font-size:17px;opacity:.7">1</b>' + ic('spk', 20) + 'bisa putar suara', t0: 14.0, t1: 14.75, bg: 'rgba(60,191,110,.16)', col: C.leaf, bd: 'rgba(60,191,110,.5)' },
      { txt: '<b class="mono" style="font-size:17px;opacity:.7">2</b>“Oke, aku di masjid.”', t0: 14.5, t1: 15.25, bg: '#13271d', col: C.cream, bd: 'rgba(242,237,213,.2)' },
    ];
    frames.forEach((f) => {
      const e = add(`<div class="chip" style="height:48px;padding:0 18px;background:${f.bg};color:${f.col};box-shadow:inset 0 0 0 1.5px ${f.bd};font:600 20px/1 'Plus Jakarta Sans'">${f.txt}</div>`);
      const w = e.offsetWidth;
      draws.push((t) => {
        const on = t >= f.t0 - 0.05 && t < f.t1 + 0.15;
        e.style.visibility = on ? 'visible' : 'hidden';
        if (!on) return;
        const p = inOut((t - f.t0) / (f.t1 - f.t0)), out = clamp((t - f.t1) / 0.15);
        const x = lerp(LS - 70 - w, LK + 50, p);
        e.style.left = x.toFixed(1) + 'px'; e.style.top = (LY - 24) + 'px';
        e.style.opacity = (clamp((t - f.t0 + 0.05) * 8) * (1 - out)).toFixed(3);
        e.style.filter = out > 0 ? `blur(${(out * 8).toFixed(2)}px)` : 'none';
        e.style.transform = `scale(${(1 - 0.4 * out).toFixed(3)})`; e.style.transformOrigin = '0 50%';
      });
      cue(f.t0, 'whoosh', { v: 0.3 }); cue(f.t1, 'click');
    });
    // after the text arrives, the voice note goes out to Sari
    const vp = add(`<div class="chip" style="height:48px;padding:0 16px;background:#3cbf6e;color:#04140a;font:700 20px/1 'Plus Jakarta Sans'">${ic('mic', 22)}pesan suara</div>`);
    { const w = vp.offsetWidth, t0 = 15.75, t1 = 16.25;
      draws.push((t) => {
        const on = t >= t0 - 0.05 && t < t1 + 0.15; vp.style.visibility = on ? 'visible' : 'hidden'; if (!on) return;
        const p = inOut((t - t0) / (t1 - t0)), out = clamp((t - t1) / 0.15);
        vp.style.left = lerp(LK + 50, LS - 50 - w, p).toFixed(1) + 'px'; vp.style.top = (LY - 24) + 'px';
        vp.style.opacity = (clamp((t - t0 + 0.05) * 8) * (1 - out)).toFixed(3);
        vp.style.filter = out > 0 ? `blur(${(out * 8).toFixed(2)}px)` : 'none';
      });
      cue(t0, 'whoosh', { v: 0.6 });
    }
    cue(15.0, 'riser', { d: 2.0 });

    // ───────────────────────── Scene 4: offline guide (17 – 22) — the drop ─────────────────────────
    const G0 = 17.0, G1 = 22.0;
    const gHead = add(`<div style="display:flex;align-items:center;gap:16px;width:780px">${ic('book', 40, C.leaf)}<span style="font:800 40px/1 'Plus Jakarta Sans';letter-spacing:-.02em">Panduan darurat</span></div>`);
    pos(gHead, 910, 196); show(gHead, G0, G1);
    const badge = add(`<div class="chip mono" style="height:46px;padding:0 18px;background:rgba(60,191,110,.14);color:#3cbf6e;box-shadow:inset 0 0 0 1.5px rgba(60,191,110,.45);font-size:19px;font-weight:600">${ic('nosig', 20)}offline · tanpa grup</div>`);
    pos(badge, 1690 - badge.offsetWidth, 193); show(badge, 17.5, G1, (t) => `scale(${(0.8 + 0.2 * stepR(t - 17.5, SP.pop)).toFixed(3)})`); cue(17.5, 'pop');
    const tiles = [
      { x: 910, icon: 'alert', col: C.lamp, label: 'Bencana', unit: 'jenis bencana', n: 6, tick0: 17.75, chips: ['Gempa', 'Banjir', 'Tanah longsor'], more: '+3 lainnya', cin: 19.5 },
      { x: 1310, icon: 'pulse', col: C.sos, label: 'P3K', unit: 'topik pertolongan', n: 10, tick0: 18.0, chips: ['RJP (CPR)', 'Luka bakar', 'Gigitan ular'], more: '+7 lainnya', cin: 20.25 },
    ];
    let snake = null;
    tiles.forEach((T, ti) => {
      const tile = pos(add('<div class="tile" style="width:380px;height:640px"></div>'), T.x, 280);
      show(tile, G0 + 0.06 + ti * 0.125, G1);
      const lab = pos(add(`<div style="display:flex;align-items:center;gap:12px;font:700 28px/1 'Plus Jakarta Sans'">${ic(T.icon, 32, T.col)}${T.label}</div>`), T.x + 32, 316);
      show(lab, G0 + 0.125 + ti * 0.125, G1);
      const odo = pos(add('<div class="odo"><span></span><span></span></div>'), T.x + 28, 372);
      const unit = pos(add(`<div style="font:500 22px/1 'Plus Jakarta Sans';color:#a5b0a2">${T.unit}</div>`), T.x + 34, 540);
      show(odo, G0 + 0.25, G1); show(unit, G0 + 0.375, G1);
      const ticks = Array.from({ length: T.n }, (_, k) => T.tick0 + k * 0.125);
      ticks.forEach((tt) => cue(tt, 'tick'));
      const [sNew, sOld] = odo.children;
      draws.push((t) => {
        let n = 0; while (n < ticks.length && ticks[n] <= t) n++;
        const p = n ? stepR(t - ticks[n - 1], { w: 34, z: 1 }) : 1;
        sNew.textContent = n; sOld.textContent = Math.max(0, n - 1);
        sNew.style.transform = `translateY(${((1 - p) * 70).toFixed(1)}px)`; sNew.style.opacity = (n ? p : 1).toFixed(3);
        sOld.style.transform = `translateY(${(-p * 70).toFixed(1)}px)`; sOld.style.opacity = n ? (1 - p).toFixed(3) : 0;
        sNew.style.color = n === T.n ? T.col : C.cream;
      });
      [...T.chips, T.more].forEach((c, ci2) => {
        const more = ci2 === T.chips.length;
        const e = add(`<div class="chip gchip" style="${more ? 'background:transparent;color:#a5b0a2;box-shadow:none;border-style:dashed' : ''}">${c}</div>`);
        pos(e, T.x + 30, 600 + ci2 * 70);
        const tin = more ? 21.0 : T.cin + ci2 * 0.25;
        show(e, tin, c === 'Gigitan ular' ? 22.0 : G1, (t) => `scale(${(1 + 0.14 * Math.exp(-(t - tin) * 10) * (t > tin ? 1 : 0)).toFixed(3)})`);
        e.style.transformOrigin = '0 50%';
        cue(tin, more ? 'pop' : 'slam', { n: ti * 3 + ci2 });
        if (c === 'Gigitan ular') snake = e;
      });
    });
    // the chosen chip highlights on hover, before the click
    draws.push((t) => { const h = clamp((t - 21.6) / 0.2) * (t < 22.0 ? 1 : 0); snake.style.background = M.mix(C.card2, C.sos, h); });

    // ───────────────────────── Topic → dialer (22 – 24.3) ─────────────────────────
    const P0 = 22.125, P1 = 23.0;
    const crumb = pos(add(`<div style="display:flex;align-items:center;gap:6px;font:600 22px/1 'JetBrains Mono';color:#a5b0a2">${ic('back', 24)}P3K · offline</div>`), 966, 214);
    const ttl = pos(add(`<div style="font:800 76px/1 'Plus Jakarta Sans';letter-spacing:-.035em">Gigitan <span class="serif" style="color:#ef4b4b;font-size:1.1em">ular</span></div>`), 966, 268);
    show(crumb, P0, P1); show(ttl, P0 + 0.06, P1);
    // step skeleton (we do not quote medical steps)
    [0.8, 0.62, 0.72, 0.5].forEach((w, i) => {
      const row = pos(add(`<div style="display:flex;align-items:center;gap:22px;width:660px"><div class="mono" style="width:52px;height:52px;border-radius:50%;background:#0b1811;display:flex;align-items:center;justify-content:center;font-size:22px;color:#a5b0a2;flex:none">${i + 1}</div><div style="display:flex;flex-direction:column;gap:12px;flex:1"><i style="display:block;height:16px;border-radius:8px;background:rgba(242,237,213,.16);width:${w * 100}%"></i><i style="display:block;height:16px;border-radius:8px;background:rgba(242,237,213,.08);width:${w * 70}%"></i></div></div>`), 966, 410 + i * 92);
      show(row, P0 + 0.125 + i * 0.06, P1);
    });
    const call = add(`<div class="chip" style="width:668px;height:100px;justify-content:center;gap:16px;background:#ef4b4b;color:#fff;font:800 34px/1 'Plus Jakarta Sans';border-radius:30px">${ic('phone', 34)}Telepon 112</div>`);
    pos(call, 966, 806);
    show(call, P0 + 0.25, P1, (t) => `scale(${press(t, P1).toFixed(3)})`);
    // dialer
    const D0 = 23.25, D1 = 24.3;
    const dl = pos(add('<div style="width:500px;text-align:center;font:600 22px/1 \'JetBrains Mono\';color:#a5b0a2">membuka telepon…</div>'), 1050, 214);
    show(dl, D0, D1);
    const num = add('<div class="mono" style="width:500px;text-align:center;font-size:150px;font-weight:600;letter-spacing:.04em;height:160px"></div>');
    pos(num, 1050, 262); show(num, D0, D1);
    const digT = [23.25, 23.375, 23.5]; digT.forEach((d) => cue(d, 'key'));
    draws.push((t) => { let n = 0; digT.forEach((d) => { if (t >= d) n++; }); num.textContent = '112'.slice(0, n) || ' '; });
    const pad = pos(add(`<div style="display:grid;grid-template-columns:repeat(3,96px);gap:18px 46px">${['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((d) => `<div style="width:96px;height:62px;display:flex;align-items:center;justify-content:center;font:600 34px/1 'Plus Jakarta Sans';color:rgba(242,237,213,.5)">${d}</div>`).join('')}</div>`), 1300 - (96 * 3 + 92) / 2, 470);
    show(pad, D0 + 0.125, D1);
    const dial = pos(add(`<div style="width:116px;height:116px;margin:-58px 0 0 -58px;border-radius:50%;background:#3cbf6e;color:#04140a;display:flex;align-items:center;justify-content:center">${ic('phone', 46)}</div>`), 1300, 862);
    show(dial, 23.625, D1, (t) => `scale(${(0.6 + 0.4 * stepR(t - 23.625, SP.pop)).toFixed(3)})`); cue(23.625, 'pop', { n: 4 });

    // ───────────────────────── Scene 5: language (24.5 – 26.8) ─────────────────────────
    const LA0 = 24.625, LA1 = 26.8, TOG = 25.5;
    const segX = 1060, segY = 350, segW = 480, segH = 100;
    const seg = pos(add(`<div style="width:${segW}px;height:${segH}px;border-radius:50px;background:#0b1811;box-shadow:inset 0 0 0 1.5px rgba(242,237,213,.12)"></div>`), segX, segY);
    show(seg, LA0, LA1);
    const ind = pos(add('<div style="height:84px;border-radius:42px;background:#3cbf6e"></div>'), 0, segY + 8);
    const tgL = new Track(segX + 8).to(TOG, segX + segW / 2, { w: 17, z: 0.9 });
    const tgR = new Track(segX + segW / 2).to(TOG, segX + segW - 8, { w: 32, z: 0.88 });
    const opts = ['Indonesia', 'English'].map((s, i) => { const e = add(`<div style="width:${segW / 2 - 8}px;text-align:center;font:800 30px/1 'Plus Jakarta Sans'">${s}</div>`); pos(e, segX + 8 + i * (segW / 2 - 8), segY + 35); return e; });
    draws.push((t) => {
      const v = vis(t, LA0 + 0.06, LA1); const L = tgL.at(t), R = tgR.at(t);
      applyVis(ind, v); ind.style.left = L.toFixed(1) + 'px'; ind.style.width = (R - L).toFixed(1) + 'px';
      const mid = (L + R) / 2;
      opts.forEach((e, i) => { applyVis(e, vis(t, LA0 + 0.125, LA1)); const cx = segX + segW / 4 + i * segW / 2; const on = clamp(1 - Math.abs(mid - cx) / (segW / 2)); e.style.color = M.mix(C.cream, C.ink, on); });
    });
    cue(TOG, 'toggle');
    const glob = pos(add(`<div style="display:flex;align-items:center;gap:12px;font:600 20px/1 'JetBrains Mono';color:#a5b0a2">${ic('globe', 24)}BAHASA · LANGUAGE</div>`), segX, 300);
    show(glob, LA0, LA1);
    const rows = [['mic', 'Pesan suara', 'Voice notes'], ['book', 'Panduan darurat', 'Emergency guide'], ['link', 'Tetap tersambung', 'Stay connected']];
    rows.forEach(([icn, a, b], i) => {
      const y = 496 + i * 96, ts = 25.75 + i * 0.125;
      const box = pos(add(`<div style="width:520px;height:76px;border-radius:22px;background:#13271d;display:flex;align-items:center;gap:20px;padding:0 24px;box-sizing:border-box">${ic(icn, 30, C.leaf)}<div style="position:relative;flex:1;height:34px"><span class="a" style="position:absolute;left:0;top:0;font:700 29px/34px 'Plus Jakarta Sans';white-space:nowrap">${a}</span><span class="b" style="position:absolute;left:0;top:0;font:700 29px/34px 'Plus Jakarta Sans';white-space:nowrap">${b}</span></div></div>`), 1040, y);
      show(box, LA0 + 0.25 + i * 0.06, LA1);
      const ea = box.querySelector('.a'), eb = box.querySelector('.b');
      draws.push((t) => { applyVis(ea, vis(t, -1, ts, 0.12)); applyVis(eb, vis(t, ts + 0.04, null)); });
      cue(ts, 'swap', { n: 5 + i });
    });

    // ───────────────────────── Scene 6: new layout (27 – 28.4) ─────────────────────────
    const PH0 = 27.125, PH1 = 28.35, LAY = 27.75;
    const PX = 1128, PW = 344;
    const A = [[PX, 190, PW, 64], [PX, 284, PW, 120], [PX, 420, PW, 120], [PX, 556, PW, 120], [PX, 692, PW, 120], [PX, 840, PW, 68]];
    const B = [[PX, 190, PW, 100], [PX, 310, 164, 190], [PX + 180, 310, 164, 190], [PX, 516, 164, 190], [PX + 180, 516, 164, 190], [PX, 724, PW, 184]];
    const bcol = [C.moss, C.card2, C.card2, '#3a1d1d', C.card2, C.card2];
    const bcol2 = [C.moss, C.card2, '#3a1d1d', C.card2, C.card2, C.leaf];
    B.forEach((b, i) => {
      const e = add('<div style="border-radius:22px"></div>');
      const tr = [0, 1, 2, 3].map((k) => new Track(A[i][k]).to(LAY + i * 0.04, b[k], SP.shape));
      const col = new ColorTrack(bcol[i]).to(LAY + i * 0.04, bcol2[i], SP.soft);
      draws.push((t) => {
        applyVis(e, vis(t, PH0 + i * 0.05, PH1));
        e.style.left = tr[0].at(t) + 'px'; e.style.top = tr[1].at(t) + 'px'; e.style.width = tr[2].at(t) + 'px'; e.style.height = tr[3].at(t) + 'px';
        e.style.background = col.at(t);
      });
    });
    cue(LAY, 'swap', { n: 8 }); cue(PH0, 'pop', { n: 2 });

    // ───────────────────────── Outro (28.5 – 32) ─────────────────────────
    const wm = add('<div style="font:800 128px/1 \'Plus Jakarta Sans\';letter-spacing:-.045em;white-space:nowrap">Saling Jaga</div>');
    pos(wm, 960 - wm.offsetWidth / 2, 528);
    show(wm, 29.0, null, (t) => `scale(${(1 + 0.06 * Math.exp(-(t - 29) * 8) * (t > 29 ? 1 : 0)).toFixed(3)})`); cue(29.0, 'slam', { n: 4 });
    const tag = add('<div style="font:500 42px/1.2 \'Plus Jakarta Sans\';color:#c9cdb9;white-space:nowrap">Saat sinyal hilang, kita tetap <span class="serif" style="color:#3cbf6e;font-size:1.15em">saling jaga.</span></div>');
    pos(tag, 960 - tag.offsetWidth / 2, 680); show(tag, 29.5, null); cue(29.5, 'note', { n: 3 });
    const cta = add(`<div class="chip" style="height:76px;padding:0 34px;background:#3cbf6e;color:#04140a;font:800 30px/1 'Plus Jakarta Sans';gap:20px">Unduh APK gratis<span class="mono" style="font-size:24px;font-weight:600;opacity:.75">saling-jaga.my.id</span></div>`);
    pos(cta, 960 - cta.offsetWidth / 2, 790);
    show(cta, 30.0, null, (t) => `scale(${(press(t, 30.0) * (0.92 + 0.08 * stepR(t - 30, SP.pop))).toFixed(3)})`); cue(30.0, 'cta');
    const vrow = add(`<div class="mono" style="font-size:20px;color:#6f7c6f;letter-spacing:.08em;white-space:nowrap">v0.24 · v0.25 · v0.26 · v0.27 · Android 6.0+ · tanpa internet</div>`);
    pos(vrow, 960 - vrow.offsetWidth / 2, 916); show(vrow, 30.5, null); cue(30.5, 'shimmer');

    // ───────────────────────── Cursor "Kamu" ─────────────────────────
    const cur = add(`<div id="cur"><svg viewBox="0 0 24 24"><path d="M4 2.5 20 11l-7 1.8L9.6 20z" fill="#f2edd5" stroke="#04140a" stroke-width="1.4" stroke-linejoin="round"/></svg><div class="pill">Kamu</div></div>`);
    const rip = add('<div id="rip"></div>');
    const CX = new Track(780), CY = new Track(1130);
    const mv = (t, x, y, sp = SP.cursor) => { CX.to(t, x, sp); CY.to(t, y, sp); };
    mv(4.2, 1612, 868); mv(7.9, 1480, 1000);
    mv(9.4, 1600, 1160);
    // guide → topic → dialer
    CX.to(20.6, 1700, SP.snap); CY.to(20.6, 1150, SP.snap);
    const snakeC = [snake.offsetLeft + snake.offsetWidth * 0.55, snake.offsetTop + snake.offsetHeight * 0.55];
    mv(21.05, ...snakeC);
    mv(22.35, 1300, 862);
    mv(24.3, 1430, 406);
    mv(25.9, 1640, 980); mv(26.2, 1760, 1160);
    const clicks = [REC0, 22.0, P1, TOG];
    cue(22.0, 'click'); cue(P1, 'click'); cue(REC0, 'click'); cue(TOG, 'click');
    const curOn = (t) => (t > 3.95 && t < 9.95) || (t > 20.7 && t < 26.6);
    draws.push((t) => {
      const on = curOn(t);
      cur.style.visibility = on ? 'visible' : 'hidden';
      if (!on) { rip.style.visibility = 'hidden'; return; }
      const x = CX.at(t), y = CY.at(t);
      const vx = (x - CX.at(t - 0.016)) / 0.016;
      const lean = clamp(-vx * 0.0045, -14, 14);
      let s = 1; clicks.forEach((tc) => { s *= press(t, tc); });
      if (t > REC0 && t < REC1) s *= 0.9;
      cur.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) rotate(${lean.toFixed(2)}deg) scale(${s.toFixed(3)})`;
      const pill = cur.lastChild; pill.style.transform = `translateX(${clamp(-vx * 0.012, -18, 18).toFixed(1)}px)`;
      let r = null; for (const tc of clicks) { const q = ripple(t, tc); if (q) r = q; }
      if (r) { rip.style.visibility = 'visible'; rip.style.transform = `translate(${x}px,${y}px) scale(${r.s.toFixed(3)})`; rip.style.opacity = r.o.toFixed(3); }
      else rip.style.visibility = 'hidden';
    });

    // ───────────────────────── seek ─────────────────────────
    const DUR = 32.0;
    window.seek = (t) => {
      const c = cam(t);
      world.style.transform = `translate(960px,540px) scale(${c.z.toFixed(5)}) translate(${-c.x}px,${-c.y}px)`;
      for (const d of draws) d(t);
    };
    // pure-t check: ensure every cue is on the 16th grid
    cues.forEach((c) => { const g = c.t / 0.125; if (Math.abs(g - Math.round(g)) > 1e-6) throw new Error('cue off grid: ' + JSON.stringify(c)); });
    cues.sort((a, b) => a.t - b.t);
    window.FILM = { width: 1920, height: 1080, bpm: 120, duration: DUR,
      sections: { intro: [0, 3.5], drop: [17, 21], outro: [28.5, DUR] }, cues };
    window.seek(0);
    window.READY = true;
  } catch (err) {
    console.error(err);
    window.FILM_ERROR = String(err && err.stack || err);
  }
})();
