// covatom · "Saat sinyal hilang." Landscape 1920×1080, 120 BPM, 34 s.
// One shape, never cut: the status pill (signal dies) → your phone as a node (neighbours appear,
// bond, relay) → the node opens into the group chat → DROP: chat turns into Sari's SOS → offline
// compass → roll call → fact pill slams → the pill becomes the "c" of the covatom mark.
(async function () {
  try {
    const { clamp, lerp, outQ, stepR, Track, ColorTrack, SP, vis, applyVis, press, ripple, measure } = M;
    const C = {
      navy: '#0E1A33', panel: '#16264A', panel2: '#1F3360', line2: '#33456E', blue: '#1677FF',
      blueT: '#E7F0FF', white: '#FFFFFF', ink: '#0E1A33', muted: '#6B7690', soft: '#9AA7C4',
      coral: '#FF4D4F', coralT: '#FFE5E5', green: '#12A150', greenT: '#E3F6EA', amber: '#D97706', amberT: '#FFF1DC',
      grey: '#EEF1F6',
    };
    const OF = "'Outfit'", IN = "'Inter'";
    await Promise.all([
      document.fonts.load(`500 100px ${OF}`), document.fonts.load(`600 100px ${OF}`), document.fonts.load(`700 100px ${OF}`),
      document.fonts.load(`400 40px ${OF}`),
      document.fonts.load(`400 24px ${IN}`), document.fonts.load(`500 24px ${IN}`), document.fonts.load(`600 24px ${IN}`), document.fonts.load(`700 24px ${IN}`),
    ].map((p) => p.catch(() => null)));
    await document.fonts.ready;

    const cues = [];
    const cue = (t, k, o = {}) => cues.push({ t, k, ...o });
    const world = document.getElementById('world');
    const hud = document.getElementById('hud');
    const flash = document.getElementById('flash');
    const grid = document.getElementById('grid');
    const draws = [];
    const W = (html, parent = world) => { const d = document.createElement('div'); d.innerHTML = html.trim(); const e = d.firstElementChild; parent.appendChild(e); return e; };
    const show = (e, tin, tout, extra = '', d = 0.12) => draws.push((t) => applyVis(e, vis(t, tin, tout, d), typeof extra === 'function' ? extra(t) : extra));
    const popS = (t, tin, s0 = 0.6) => s0 + (1 - s0) * stepR(t - tin, SP.pop);
    const bump = (t, tc, a = 0.06, d = 0.08) => 1 + a * Math.exp(-(((t - tc) / d) ** 2));
    const lin = (t, a, b) => clamp((t - a) / (b - a));
    const px = (v) => v.toFixed(2) + 'px';

    // icons: one stroke weight (2), round caps
    const P = (d, sw = 2) => `<svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
    const I = {
      check: P('<path d="M20 6 9 17l-5-5"/>', 2.6),
      send: P('<path d="M5 12h13"/><path d="m12 5 7 7-7 7"/>', 2.4),
      pin: P('<path d="M9 3.5h6l-1 6 3.5 3.5h-11L10 9.5z"/><path d="M12 13v7.5"/>'),
      bt: P('<path d="m7 7 10 10-5 4V3l5 4L7 17"/>'),
      phone: P('<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>'),
      mobile: P('<rect x="6" y="2.5" width="12" height="19" rx="3"/><path d="M11 18.5h2"/>'),
      users: P('<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18.5 14a6.5 6.5 0 0 1 3 6"/>'),
      alert: P('<path d="M12 3 2 20h20z"/><path d="M12 10v4.5"/><path d="M12 17.5h.01" stroke-width="2.8"/>'),
      compass: P('<circle cx="12" cy="12" r="9.5"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>'),
      x: P('<path d="M6 6l12 12M18 6 6 18"/>', 2.4),
      clip: P('<rect x="5" y="4" width="14" height="17.5" rx="2.5"/><path d="M9 2.5h6v3H9z"/><path d="m9 13 2 2 4-4"/>'),
    };
    const ico = (k, s, col = 'currentColor') => `<span class="ic" style="width:${s}px;height:${s}px;color:${col}">${I[k]}</span>`;

    // ───────────────────────── camera
    const zT = new Track(1.14)
      .to(0.2, 1.06, SP.cam).to(3.7, 0.98, SP.cam).to(9.8, 1.0, SP.cam)
      .to(15.9, 0.96, SP.cam).to(16.0, 1.0, { w: 9, z: 0.8 }).to(19.5, 1.0, SP.cam)
      .to(27.5, 1.0, SP.cam).to(30.0, 1.04, SP.cam).to(31.0, 1.0, { w: 3, z: 1 });
    const toS = (x, y, z) => [960 + (x - 960) * z, 540 + (y - 540) * z];

    // ───────────────────────── HERO: the one shape
    const hero = W(`<div style="overflow:hidden;will-change:auto"></div>`);
    const HX = new Track(960), HY = new Track(540), HW = new Track(300), HH = new Track(116), HR = new Track(58);
    const HC = new ColorTrack(C.white);
    const heroBumps = [];
    const morph = (t, x, y, w, h, r, col, sp = SP.shape) => {
      HX.to(t, x, sp); HY.to(t, y, sp); HW.to(t, w, sp); HH.to(t, h, sp); HR.to(t, r, sp); if (col) HC.to(t, col, SP.soft);
    };
    const lay = (w, h, html) => W(`<div class="lay" style="width:${w}px;height:${h}px;margin-left:${-w / 2}px;margin-top:${-h / 2}px">${html}</div>`, hero);

    // ───────────────────────── HUD captions
    const caps = [];
    const capC = (html, y, tin, tout, size = 76) => {
      const e = W(`<div class="o" style="left:0;width:1920px;top:${y}px;text-align:center;font-weight:600;font-size:${size}px;letter-spacing:-0.01em;line-height:1.05;color:#fff">${html}</div>`, hud);
      show(e, tin, tout); return e;
    };
    const capL = (html, sub, tin, tout) => {
      const e = W(`<div style="left:150px;top:0;width:700px;height:1080px;display:flex;flex-direction:column;justify-content:center">
        <div class="o" style="font-weight:600;font-size:84px;letter-spacing:-0.015em;line-height:1.04;color:#fff">${html}</div>
        ${sub ? `<div style="margin-top:28px;font-size:28px;line-height:1.4;color:${C.soft};font-weight:500">${sub}</div>` : ''}</div>`, hud);
      show(e, tin, tout); return e;
    };

    // ══════════════ A · 0–4  the signal dies
    cue(0.0, 'born');
    const A1 = lay(300, 116, `<div class="row" style="width:100%;height:100%;justify-content:center;gap:22px">
        <div class="row bars" style="gap:7px;align-items:flex-end;height:44px">${[16, 24, 33, 42].map((h) => `<i style="display:block;width:10px;height:${h}px;border-radius:3px;background:${C.ink}"></i>`).join('')}</div>
        <span class="o" style="font-weight:600;font-size:48px;color:${C.ink}">4G</span></div>`);
    show(A1, 0.05, 1.9);
    const bars = [...A1.querySelectorAll('i')];
    const DROPS = [0.5, 1.0, 1.5]; // bars fall: 4 → 3 → 2 → 1
    DROPS.forEach((tc, i) => cue(tc, 'tick'));
    draws.push((t) => {
      bars.forEach((b, i) => {
        const k = 3 - i; // bar 3 drops first
        const tc = DROPS[k - 1];
        const off = tc == null ? 0 : lin(t, tc, tc + 0.18);
        b.style.background = off > 0.5 ? '#C9CFDC' : C.ink;
        b.style.transform = `scaleY(${(1 - 0.75 * outQ(off)).toFixed(3)})`;
        b.style.transformOrigin = '50% 100%';
      });
    });
    const A2 = lay(560, 116, `<div class="row" style="width:100%;height:100%;justify-content:center;gap:20px">
        <div class="row" style="gap:7px;align-items:flex-end;height:44px">${[16, 24, 33, 42].map((h) => `<i style="display:block;width:10px;height:${h * 0.25 + 4}px;border-radius:3px;background:${C.coral};opacity:.55"></i>`).join('')}</div>
        <span class="o" style="font-weight:600;font-size:44px;color:${C.coral}">Tanpa layanan</span></div>`);
    show(A2, 2.0, 3.75);
    cue(2.0, 'swap', { n: 0 });
    const fail = W(`<div class="row" style="gap:14px;padding:18px 28px;border-radius:22px;background:${C.panel};border:2px solid ${C.line2}">
        <span class="ic" style="width:34px;height:34px;border-radius:17px;background:${C.coral};color:#fff;justify-content:center;align-items:center">${ico('x', 20)}</span>
        <span style="font-size:28px;font-weight:600;color:#fff">Pesan gagal terkirim</span>
        <span style="font-size:24px;color:${C.soft};font-weight:500">· Coba lagi</span></div>`);
    fail.style.left = '960px'; fail.style.top = '640px';
    show(fail, 2.5, 3.6, (t) => `translateX(-50%) scale(${popS(t, 2.5, 0.85).toFixed(4)})`);
    cue(2.5, 'alert');
    const capA = [
      capC('Gempa.', 300, 0.5, 3.6), capC('Listrik padam.', 300, 1.0, 3.6), capC('Sinyal hilang.', 300, 1.5, 3.6),
    ];
    // three words land in one line: position them side by side
    {
      const ws = ['Gempa.', 'Listrik padam.', 'Sinyal hilang.'].map((s) => measure(s, `600 76px ${OF}`));
      const gap = 30, tot = ws.reduce((a, b) => a + b, 0) + gap * 2;
      let x = 960 - tot / 2;
      capA.forEach((e, i) => { e.style.width = 'auto'; e.style.left = px(x); x += ws[i] + gap; });
      capA[2].style.color = C.coral;
    }
    [0.5, 1.0, 1.5].forEach((tc, i) => cue(tc, 'slam', { n: i }));
    draws.push((t) => { // pill shudders when service drops
      const s = Math.exp(-(((t - 2.0) / 0.25) ** 2));
      heroBumps[0] = Math.sin(t * 70) * 7 * s;
    });
    HW.to(1.85, 560, SP.shape); HC.to(1.85, C.coralT, SP.soft);

    // ══════════════ B · 4–10  neighbours, bond, relay
    const KX = 960, KY = 600;
    morph(3.7, KX, KY, 180, 180, 90, C.blue);
    cue(4.0, 'whoosh', { v: 0.5 });
    const B1 = lay(180, 180, `<div class="row" style="width:100%;height:100%;justify-content:center;color:#fff">${ico('mobile', 76)}</div>`);
    show(B1, 4.1, 9.8);
    const kamuL = W(`<div style="text-align:center;width:300px"><div class="o" style="font-weight:600;font-size:34px">Kamu</div></div>`);
    kamuL.style.left = px(KX - 150); kamuL.style.top = px(KY + 110);
    show(kamuL, 4.3, 9.75);
    capC('Tapi tetanggamu masih dekat.', 110, 4.0, 7.85, 64);
    capC('Ponsel tersambung langsung. <span style="color:#7FB0FF">Tanpa internet.</span>', 110, 8.0, 9.75, 64);

    // radar pulses
    [4.5, 5.75].forEach((tp) => {
      const r = W(`<div style="width:180px;height:180px;border-radius:50%;border:2px solid ${C.blue}"></div>`);
      r.style.left = px(KX - 90); r.style.top = px(KY - 90);
      draws.push((t) => {
        const x = lin(t, tp, tp + 1.6);
        r.style.opacity = (x <= 0 || x >= 1) ? 0 : (0.55 * (1 - x)).toFixed(3);
        r.style.transform = `scale(${(1 + 4.5 * outQ(x)).toFixed(3)})`;
      });
      cue(tp, 'whoosh', { v: 0.3 });
    });

    const NODES = [
      { n: 'Budi', ini: 'B', x: 1330, y: 400, d: '40 m', tin: 5.0, tb: 8.0, note: 0 },
      { n: 'Pak RT', ini: 'RT', x: 1300, y: 800, d: '55 m', tin: 5.5, tb: 8.25, note: 1 },
      { n: 'Dika', ini: 'D', x: 660, y: 470, d: '80 m', tin: 6.0, tb: 8.5, note: 2 },
      { n: 'Sari', ini: 'S', x: 380, y: 300, d: '160 m · di luar jangkauan', tin: 6.5, tb: 9.0, note: 4, via: 2 },
    ];
    const svg = W(`<svg width="1920" height="1080" viewBox="0 0 1920 1080" style="left:0;top:0;overflow:visible"></svg>`);
    const NR = 62;
    NODES.forEach((N, i) => {
      const fx = N.via != null ? NODES[N.via].x : KX, fy = N.via != null ? NODES[N.via].y : KY;
      const fr = N.via != null ? NR : 90;
      const dx = N.x - fx, dy = N.y - fy, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
      const x1 = fx + ux * (fr + 10), y1 = fy + uy * (fr + 10), x2 = N.x - ux * (NR + 10), y2 = N.y - uy * (NR + 10);
      const len = Math.hypot(x2 - x1, y2 - y1);
      const ln = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      Object.entries({ x1, y1, x2, y2, stroke: C.blue, 'stroke-width': 4, 'stroke-linecap': 'round' }).forEach(([k, v]) => ln.setAttribute(k, v));
      ln.setAttribute('stroke-dasharray', `${len} ${len}`);
      svg.appendChild(ln);
      const pk = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      pk.setAttribute('r', 8); pk.setAttribute('fill', '#fff'); svg.appendChild(pk);
      const dash = W(`<div></div>`); // dashed "nearby" hint before bonding
      draws.push((t) => {
        const p = stepR(t - N.tb, { w: 16, z: 1 });
        const out = lin(t, 9.75, 9.95);
        ln.setAttribute('stroke-dashoffset', (len * (1 - p)).toFixed(2));
        ln.style.opacity = (p > 0.001 ? 1 - out : 0).toFixed(3);
        // a packet hops along each bond after it forms (messages flowing)
        const ph = ((t - N.tb - 0.5) % 1.0 + 1.0) % 1.0;
        const on = t > N.tb + 0.5 && out < 1;
        pk.setAttribute('cx', lerp(x1, x2, ph).toFixed(2)); pk.setAttribute('cy', lerp(y1, y2, ph).toFixed(2));
        pk.style.opacity = on ? (Math.sin(Math.PI * ph) * (1 - out)).toFixed(3) : 0;
      });
      const node = W(`<div style="width:${NR * 2}px;height:${NR * 2}px;border-radius:50%;border:3px solid ${C.line2};background:${C.panel};display:flex;align-items:center;justify-content:center">
          <span class="o" style="font-weight:600;font-size:${N.ini.length > 1 ? 36 : 44}px">${N.ini}</span></div>`);
      node.style.left = px(N.x - NR); node.style.top = px(N.y - NR);
      const ini = node.firstElementChild;
      const bg = new ColorTrack(C.panel).to(N.tb + 0.1, C.white), bd = new ColorTrack(C.line2).to(N.tb + 0.1, C.blue), fg = new ColorTrack(C.soft).to(N.tb + 0.1, C.ink);
      show(node, N.tin, 9.8, (t) => `scale(${(popS(t, N.tin, 0.5) * bump(t, N.tb + 0.12, 0.1)).toFixed(4)})`);
      draws.push((t) => { node.style.background = bg.at(t); node.style.borderColor = bd.at(t); ini.style.color = fg.at(t); });
      const lab = W(`<div style="width:420px;text-align:center"><div class="o" style="font-weight:600;font-size:30px">${N.n}</div>
          <div style="font-size:21px;font-weight:500;color:${C.soft};margin-top:4px">${N.d}</div></div>`);
      lab.style.left = px(N.x - 210); lab.style.top = px(N.y + NR + 14);
      show(lab, N.tin + 0.1, 9.75);
      cue(N.tin, 'pop', { n: i });
      cue(N.tb, 'check', { n: N.note });
    });
    const relay = W(`<div class="row" style="gap:10px;padding:10px 18px;border-radius:999px;background:${C.blue};font-size:21px;font-weight:600;color:#fff">${ico('bt', 22)}diteruskan lewat ponsel Dika</div>`);
    relay.style.left = px(500); relay.style.top = px(228);
    show(relay, 9.2, 9.75);
    cue(9.25, 'note', { n: 5 });
    // invite button
    const ajak = W(`<div class="row" style="height:72px;padding:0 34px;gap:12px;border-radius:36px;background:#fff;color:${C.ink};font-size:28px;font-weight:600">${ico('users', 30, C.blue)}Ajak tetangga</div>`);
    const AJX = KX, AJY = 820;
    ajak.style.left = px(AJX); ajak.style.top = px(AJY - 36);
    show(ajak, 6.75, 7.9, (t) => `translateX(-50%) scale(${(popS(t, 6.75, 0.8) * press(t, 7.5)).toFixed(4)})`);
    cue(6.75, 'pop', { n: 3 });

    // ══════════════ C · 10–16  group chat over the mesh
    const CX = 1250, CY = 545, CW = 680, CH = 800;
    morph(9.8, CX, CY, CW, CH, 44, C.white);
    cue(10.0, 'whoosh', { v: 0.6 });
    capL('Chat & telepon,<br>tanpa sinyal.', 'Grup terbentuk dalam hitungan detik.<br>Tanpa akun, tanpa nomor HP.', 10.2, 13.85);
    capL('Pengumuman<br>sampai ke semua.', 'Yang sempat terputus menerimanya<br>begitu tersambung lagi.', 14.0, 15.8);
    const typed = 'Kami aman.';
    const T0 = 11.5, TS = 0.125;
    for (let i = 0; i < typed.length; i++) cue(T0 + i * TS, 'key');
    const C1 = lay(CW, CH, `
      <div class="row" style="position:absolute;left:32px;right:32px;top:28px;gap:18px">
        <div class="row" style="width:60px;height:60px;border-radius:30px;background:${C.blue};color:#fff;justify-content:center">${ico('users', 30)}</div>
        <div><div class="o" style="font-weight:600;font-size:32px;color:${C.ink}">Grup RT 04</div>
          <div class="row" style="gap:6px;font-size:20px;font-weight:500;color:${C.muted};margin-top:2px">${ico('bt', 20, C.blue)}5 ponsel · tanpa internet</div></div>
        <div style="flex:1"></div>
        <div class="row" style="width:60px;height:60px;border-radius:30px;background:${C.blueT};color:${C.blue};justify-content:center">${ico('phone', 28)}</div>
      </div>
      <div style="position:absolute;left:0;right:0;top:116px;height:2px;background:${C.grey}"></div>
      <div class="pinb row" style="position:absolute;left:24px;right:24px;top:134px;height:84px;padding:0 22px;gap:16px;border-radius:20px;background:${C.blueT}">
        <div class="row" style="width:44px;height:44px;border-radius:22px;background:${C.blue};color:#fff;justify-content:center">${ico('pin', 24)}</div>
        <div><div style="font-size:24px;font-weight:600;color:${C.ink}">Titik kumpul: Lapangan RT 04</div>
          <div style="font-size:18px;font-weight:500;color:${C.muted};margin-top:2px">Disematkan Pak RT · untuk semua</div></div>
      </div>
      <div class="msgs" style="position:absolute;left:32px;right:32px;top:146px;display:flex;flex-direction:column;gap:22px">
        <div class="m1"><div style="font-size:19px;font-weight:600;color:${C.muted};margin:0 0 6px 6px">Pak RT</div>
          <div style="display:inline-block;max-width:470px;padding:16px 22px;border-radius:8px 24px 24px 24px;background:${C.grey};font-size:25px;line-height:1.35;color:${C.ink}">Semua aman? Jangan masuk rumah dulu.</div></div>
        <div class="m2"><div style="font-size:19px;font-weight:600;color:${C.muted};margin:0 0 6px 6px">Budi</div>
          <div style="display:inline-block;max-width:470px;padding:16px 22px;border-radius:8px 24px 24px 24px;background:${C.grey};font-size:25px;line-height:1.35;color:${C.ink}">Aman. Aku bawa senter.</div></div>
        <div class="m3" style="text-align:right"><div style="display:inline-block;padding:16px 22px;border-radius:24px 8px 24px 24px;background:${C.blue};font-size:25px;line-height:1.35;color:#fff">${typed}</div>
          <div class="dl row" style="justify-content:flex-end;gap:6px;font-size:19px;font-weight:600;color:${C.blue};margin-top:8px">${ico('check', 18)}Terkirim lewat 2 ponsel</div></div>
      </div>
      <div class="row" style="position:absolute;left:24px;right:24px;bottom:24px;height:84px;gap:14px">
        <div class="row inp" style="flex:1;height:84px;border-radius:42px;background:#F2F4F8;padding:0 30px;font-size:26px;color:${C.ink}"><span class="ph" style="color:#9AA2B5">Tulis pesan…</span><span class="ty"></span><i class="car" style="display:block;width:3px;height:32px;background:${C.blue};margin-left:2px"></i></div>
        <div class="row snd" style="width:84px;height:84px;border-radius:42px;background:${C.blue};color:#fff;justify-content:center">${ico('send', 34)}</div>
      </div>`);
    show(C1, 10.2, 15.85);
    const q = (s) => C1.querySelector(s);
    const pinb = q('.pinb'), msgs = q('.msgs'), m1 = q('.m1'), m2 = q('.m2'), m3 = q('.m3'), dl = q('.dl');
    const ty = q('.ty'), ph = q('.ph'), car = q('.car'), snd = q('.snd');
    const shift = new Track(0).to(13.85, 92, SP.soft);
    show(m1, 10.5, null); show(m2, 11.0, null); show(m3, 13.0, null); show(dl, 13.5, null);
    show(pinb, 14.0, null, (t) => `scale(${popS(t, 14.0, 0.92).toFixed(4)})`);
    cue(10.5, 'pop', { n: 1 }); cue(11.0, 'pop', { n: 2 }); cue(13.0, 'click'); cue(13.0, 'whoosh', { v: 0.4 }); cue(13.5, 'check', { n: 4 });
    cue(14.0, 'drop'); cue(14.0, 'note', { n: 3 });
    draws.push((t) => {
      msgs.style.transform = `translateY(${shift.at(t).toFixed(2)}px)`;
      const n = clamp(Math.floor((t - T0) / TS) + 1, 0, typed.length);
      const sent = t >= 13.0;
      ty.textContent = sent ? '' : typed.slice(0, n);
      ph.style.display = (n > 0 && !sent) ? 'none' : 'inline';
      car.style.opacity = (t > 11.2 && (Math.floor(t * 4) % 2 === 0 || (t > T0 && t < 12.8))) ? 1 : 0;
      snd.style.transform = `scale(${press(t, 13.0).toFixed(4)})`;
    });
    // incoming SOS alarm tint on the card edge
    const sosEdge = W(`<div style="border-radius:44px;border:6px solid ${C.coral}"></div>`, hero);
    sosEdge.style.position = 'absolute'; sosEdge.style.inset = '0';
    draws.push((t) => { const a = lin(t, 15.0, 15.3) * (1 - lin(t, 15.95, 16.05)); sosEdge.style.opacity = (a * (0.6 + 0.4 * Math.sin(t * 25))).toFixed(3); });
    cue(14.5, 'riser', { d: 1.5 });
    cue(15.0, 'alert');

    // ══════════════ D · 16–20  DROP: SOS
    const DX = 960, DY = 490, DW = 920, DH = 640;
    morph(15.85, DX, DY, DW, DH, 52, C.coral, { w: 20, z: 0.78 });
    cue(16.0, 'drop'); cue(16.0, 'slam', { n: 0 });
    capC('Satu ketuk SOS. Semua ponsel di grup berbunyi.', 885, 16.6, 19.4, 44);
    const D1 = lay(DW, DH, `
      <div class="row" style="position:absolute;left:56px;right:56px;top:52px;gap:14px;font-size:22px;font-weight:700;letter-spacing:.08em;color:#fff">
        <span class="row" style="width:46px;height:46px;border-radius:23px;background:#fff;color:${C.coral};justify-content:center">${ico('alert', 26)}</span>SOS · GRUP RT 04<span style="flex:1"></span><span style="font-weight:500;letter-spacing:0;opacity:.85">baru saja</span></div>
      <div class="o dt" style="position:absolute;left:56px;top:122px;font-weight:700;font-size:86px;letter-spacing:-0.02em;color:#fff">Sari butuh bantuan</div>
      <div class="ds" style="position:absolute;left:58px;top:230px;font-size:28px;font-weight:500;color:#fff;opacity:.9">Terjebak di dapur, rumah no. 7</div>
      <div class="row" style="position:absolute;left:56px;right:56px;top:300px;gap:20px">
        ${[['160 m', 'jarak'], ['Barat laut', 'arah'], ['21%', 'baterai Sari']].map(([v, l], i) => `<div class="tile t${i}" style="flex:1;height:136px;border-radius:26px;background:rgba(255,255,255,.17);padding:22px 26px">
          <div class="o" style="font-weight:600;font-size:50px;color:#fff">${v}</div><div style="font-size:21px;font-weight:500;color:#fff;opacity:.85;margin-top:4px">${l}</div></div>`).join('')}
      </div>
      <div class="row go" style="position:absolute;left:56px;top:480px;height:96px;padding:0 40px;gap:14px;border-radius:48px;background:#fff;color:${C.coral};font-size:30px;font-weight:700">${ico('compass', 34)}Arahkan ke Sari</div>`);
    show(D1, 16.0, 19.45);
    show(D1.querySelector('.dt'), 16.05, null); show(D1.querySelector('.ds'), 16.25, null);
    [16.5, 17.0, 17.5].forEach((tc, i) => { show(D1.querySelector('.t' + i), tc, null, (t) => `scale(${popS(t, tc, 0.8).toFixed(4)})`); cue(tc, 'slam', { n: i + 1 }); });
    const go = D1.querySelector('.go');
    show(go, 18.0, null, (t) => `scale(${(popS(t, 18.0, 0.85) * press(t, 19.0)).toFixed(4)})`);
    cue(18.0, 'pop', { n: 4 });
    // alarm rings behind the card
    [16.0, 17.0, 18.0].forEach((tp) => {
      const r = W(`<div style="border-radius:60px;border:3px solid ${C.coral}"></div>`);
      r.style.left = px(DX - DW / 2); r.style.top = px(DY - DH / 2); r.style.width = px(DW); r.style.height = px(DH);
      world.insertBefore(r, hero);
      draws.push((t) => { const x = lin(t, tp, tp + 1.1); r.style.opacity = (x <= 0 || x >= 1) ? 0 : (0.7 * (1 - x)).toFixed(3); r.style.transform = `scale(${(1 + 0.22 * outQ(x)).toFixed(4)})`; });
    });
    cue(18.0, 'alert');
    draws.push((t) => { flash.style.opacity = (0.32 * Math.exp(-Math.max(0, t - 16.0) / 0.12) * (t >= 16.0 ? 1 : 0)).toFixed(3); });

    // ══════════════ E · 19.5–24  offline compass
    const EX = 1250, EY = 540, ED = 660;
    morph(19.4, EX, EY, ED, ED, ED / 2, C.white);
    cue(19.5, 'whoosh', { v: 0.6 });
    capL('Kompas offline<br>menuntun ke Sari.', 'Tanpa peta online. Jaraknya<br>menyusut setiap langkah.', 19.7, 23.85);
    let ticks = '';
    for (let i = 0; i < 72; i++) {
      const a = (i * 5) * Math.PI / 180, big = i % 18 === 0, mid = i % 9 === 0;
      const r1 = 300, r2 = r1 - (big ? 34 : mid ? 24 : 14);
      ticks += `<line x1="${(330 + Math.sin(a) * r1).toFixed(1)}" y1="${(330 - Math.cos(a) * r1).toFixed(1)}" x2="${(330 + Math.sin(a) * r2).toFixed(1)}" y2="${(330 - Math.cos(a) * r2).toFixed(1)}" stroke="${big ? C.ink : '#C5CCDA'}" stroke-width="${big ? 4 : 2.5}" stroke-linecap="round"/>`;
    }
    const card = (s, a) => `<text x="${(330 + Math.sin(a) * 228).toFixed(1)}" y="${(330 - Math.cos(a) * 228 + 13).toFixed(1)}" text-anchor="middle" font-family="Outfit" font-weight="600" font-size="38" fill="${s === 'U' ? C.blue : C.muted}">${s}</text>`;
    const E1 = lay(ED, ED, `
      <svg width="${ED}" height="${ED}" viewBox="0 0 660 660" style="position:absolute;left:0;top:0">${ticks}${card('U', 0)}${card('T', Math.PI / 2)}${card('S', Math.PI)}${card('B', -Math.PI / 2)}</svg>
      <div class="ndl" style="position:absolute;left:0;top:0;width:660px;height:660px">
        <svg width="660" height="660" viewBox="0 0 660 660" style="position:absolute;left:0;top:0"><path d="M330 8 L352 56 L308 56 Z" fill="${C.blue}"/><circle cx="330" cy="330" r="268" fill="none" stroke="${C.blue}" stroke-width="6" stroke-dasharray="0 1683.8" class="arc"/></svg>
      </div>
      <div class="rd" style="position:absolute;left:0;right:0;top:220px;text-align:center">
        <div class="row" style="justify-content:center;align-items:baseline;gap:8px"><span class="o num" style="font-weight:600;font-size:150px;line-height:1;color:${C.ink};font-variant-numeric:tabular-nums">160</span><span class="o" style="font-weight:500;font-size:56px;color:${C.ink}">m</span></div>
        <div class="row" style="justify-content:center;gap:10px;margin-top:14px;font-size:26px;font-weight:600;color:${C.coral}"><i style="display:block;width:12px;height:12px;border-radius:6px;background:${C.coral}"></i>Sari · barat laut</div>
      </div>
      <div class="fd" style="position:absolute;left:0;right:0;top:230px;text-align:center">
        <div class="row" style="margin:0 auto;width:120px;height:120px;border-radius:60px;background:${C.green};color:#fff;justify-content:center">${ico('check', 64)}</div>
        <div class="o" style="font-weight:600;font-size:46px;color:${C.ink};margin-top:24px">Sari ditemukan</div>
      </div>`);
    show(E1, 19.7, 23.85);
    const ndl = E1.querySelector('.ndl'), num = E1.querySelector('.num'), rd = E1.querySelector('.rd'), fd = E1.querySelector('.fd');
    const ang = new Track(30).to(19.9, -45, { w: 11, z: 0.62 });
    const DIST = [160, 141, 122, 104, 87, 71, 56, 42, 29, 18, 9, 4];
    DIST.forEach((d, i) => { if (i) cue(20.5 + (i - 1) * 0.25, 'tick'); });
    show(rd, 19.8, 23.3); show(fd, 23.5, null, (t) => `scale(${popS(t, 23.5, 0.7).toFixed(4)})`);
    cue(23.5, 'check', { n: 6 });
    draws.push((t) => {
      const a = ang.at(t) + 4 * Math.sin(t * 5.3) * lin(t, 20.4, 21) * (1 - lin(t, 22.6, 23.2));
      ndl.style.transform = `rotate(${a.toFixed(2)}deg)`;
      ndl.style.opacity = (1 - lin(t, 23.25, 23.45)).toFixed(3);
      const i = clamp(Math.floor((t - 20.5) / 0.25) + 1, 0, DIST.length - 1);
      num.textContent = DIST[t < 20.5 ? 0 : i];
      num.style.display = 'inline-block';
      num.style.transform = `scale(${bump(t, 20.5 + (i - 1) * 0.25, 0.05, 0.06).toFixed(4)})`;
    });

    // ══════════════ F · 24–27.5  roll call
    const FX = 1250, FY = 540, FW = 680, FH = 780;
    morph(23.8, FX, FY, FW, FH, 44, C.white);
    cue(24.0, 'whoosh', { v: 0.5 });
    capL('Absen<br>satu ketuk.', 'Siapa aman, siapa terluka,<br>siapa belum menjawab.', 24.1, 27.35);
    const PEOPLE = [['K', 'Kamu', 0], ['B', 'Budi', 0], ['RT', 'Pak RT', 0], ['D', 'Dika', 0], ['S', 'Sari', 1]];
    const F1 = lay(FW, FH, `
      <div class="row" style="position:absolute;left:36px;right:36px;top:32px;gap:16px">
        <div><div class="o" style="font-weight:600;font-size:38px;color:${C.ink}">Absen</div><div style="font-size:20px;font-weight:500;color:${C.muted};margin-top:2px">Grup RT 04 · 5 ponsel</div></div>
        <div style="flex:1"></div>
        <div class="btn row" style="height:64px;padding:0 28px;border-radius:32px;background:${C.blue};color:#fff;font-size:24px;font-weight:600;gap:10px">${ico('clip', 26)}<span class="bl">Mulai absen</span></div>
      </div>
      <div style="position:absolute;left:36px;right:36px;top:130px">
        ${PEOPLE.map(([ini, n, s], i) => `<div class="row" style="height:96px;gap:18px;border-bottom:2px solid ${C.grey}">
          <div class="row" style="width:58px;height:58px;border-radius:29px;background:${C.navy};color:#fff;justify-content:center"><span class="o" style="font-weight:600;font-size:${ini.length > 1 ? 21 : 26}px">${ini}</span></div>
          <div style="font-size:27px;font-weight:600;color:${C.ink}">${n}</div><div style="flex:1"></div>
          <div style="position:relative;width:200px;height:50px">
            <div class="w${i} row" style="position:absolute;right:0;top:0;height:50px;padding:0 20px;border-radius:25px;background:${C.grey};color:#98A0B3;font-size:21px;font-weight:600">menunggu…</div>
            <div class="s${i} row" style="position:absolute;right:0;top:0;height:50px;padding:0 20px;gap:8px;border-radius:25px;background:${s ? C.amberT : C.greenT};color:${s ? C.amber : C.green};font-size:22px;font-weight:700">${s ? ico('alert', 20) + 'Luka ringan' : ico('check', 20) + 'Aman'}</div>
          </div></div>`).join('')}
      </div>
      <div class="sum row" style="position:absolute;left:36px;right:36px;bottom:36px;height:76px;border-radius:22px;background:${C.navy};justify-content:center;gap:12px;font-size:25px;font-weight:600;color:#fff">
        <span style="color:#5BD08D">4 aman</span><span style="opacity:.5">·</span><span style="color:#FFB547">1 luka ringan</span><span style="opacity:.5">·</span><span>0 belum jawab</span></div>`);
    show(F1, 24.1, 27.35);
    const btn = F1.querySelector('.btn');
    draws.push((t) => { btn.style.transform = `scale(${press(t, 24.5).toFixed(4)})`; btn.style.opacity = t > 24.5 ? 0.45 : 1; });
    cue(24.5, 'click');
    PEOPLE.forEach((p, i) => {
      const tc = 25.0 + i * 0.25;
      show(F1.querySelector('.w' + i), 24.6 + i * 0.05, tc - 0.06, '', 0.08);
      show(F1.querySelector('.s' + i), tc, null, (t) => `scale(${popS(t, tc, 0.7).toFixed(4)})`);
      cue(tc, p[2] ? 'alert' : 'check', { n: i });
    });
    show(F1.querySelector('.sum'), 26.5, null);
    cue(26.5, 'settle');

    // ══════════════ G · 27.5–30  fact slams (one pill, re-sized every hit)
    const FACTS = [
      ['0 server', C.white, C.ink],
      ['0 akun', C.blue, '#fff'],
      ['±550 KB', C.panel2, '#fff'],
      ['Gratis untuk warga', C.white, C.ink],
    ];
    morph(27.4, 960, 540, 380, 180, 90, C.white);
    cue(27.5, 'whoosh', { v: 0.5 });
    capC('Tidak ada yang disimpan. Tidak ada yang dijual.', 760, 28.0, 29.85, 40).style.color = C.soft;
    FACTS.forEach(([s, bg, fg], i) => {
      const tc = 28.0 + i * 0.5;
      const w = measure(s, `600 92px ${OF}`) + 150;
      const l = lay(w, 180, `<div class="row o" style="width:100%;height:100%;justify-content:center;font-weight:600;font-size:92px;letter-spacing:-0.01em;color:${fg}">${s}</div>`);
      show(l, tc, i < 3 ? tc + 0.42 : 29.85, '', 0.06);
      HW.to(tc - 0.12, w, { w: 26, z: 0.8 }); HC.to(tc - 0.1, bg, { w: 30, z: 1 });
      cue(tc, 'slam', { n: i });
    });

    // ══════════════ H · 30–34  the pill becomes the "c" — covatom
    // mark from the brand file: c centre (391.1,512), o centre (632.9,512), R 195.57 → bbox 195.5..828.4 × 316.4..707.6
    const MK_W = 632.9, MK_H = 391.14, MK_X0 = 195.53, MK_Y0 = 316.43;
    const F = 250;
    const _ctx = document.createElement('canvas').getContext('2d');
    _ctx.font = `500 ${F}px ${OF}`;
    const xm = _ctx.measureText('x');
    const xh = xm.actualBoundingBoxAscent;
    const mh = xh * 1.0, mw = mh * MK_W / MK_H;
    const vw = measure('vatom', `500 ${F}px ${OF}`);
    const gap = F * 0.035;
    const tot = mw + gap + vw;
    const LX = 960 - tot / 2, BASE = 560;
    const cR = mh / 2, cCx = LX + (391.1 - MK_X0) / MK_H * mh, cCy = BASE - mh / 2;
    morph(29.9, cCx, cCy, mh, mh, mh / 2, C.white, { w: 20, z: 0.85 });
    const logo = W(`<div style="left:${px(LX)};top:${px(BASE - mh)};width:${px(tot)};height:${px(mh)}">
      <svg width="${mw.toFixed(2)}" height="${mh.toFixed(2)}" viewBox="${MK_X0} ${MK_Y0} ${MK_W} ${MK_H}" style="position:absolute;left:0;top:0;overflow:visible">
        <path fill="#FFFFFF" d="M487.23 341.67A195.57 195.57 0 1 0 487.23 682.33A224.1 224.1 0 0 1 430.17 607.57A103.23 103.23 0 1 1 430.17 416.43A224.1 224.1 0 0 1 487.23 341.67ZM510.79 359.21A195.57 195.57 0 1 1 510.79 664.79A194.07 194.07 0 0 0 567.86 592.19A103.23 103.23 0 1 0 567.86 431.81A194.07 194.07 0 0 0 510.79 359.21Z"/>
        <path fill="${C.blue}" d="M512 358.26A195.57 195.57 0 0 0 512 665.74A195.57 195.57 0 0 0 569.07 593.16A103.23 103.23 0 0 1 569.07 430.84A195.57 195.57 0 0 0 512 358.26Z"/></svg>
      <div style="position:absolute;left:${px(mw + gap)};top:${px(-F)};width:${px(vw + 40)};height:${px(F + mh + F * 0.3)};overflow:hidden">
        <svg class="vt" width="${(vw + 40).toFixed(1)}" height="${(F + mh + F * 0.3).toFixed(1)}" style="position:absolute;left:0;top:0;overflow:visible"><text x="0" y="${(F + mh).toFixed(2)}" font-family="Outfit" font-weight="500" font-size="${F}" fill="#fff">vatom</text></svg></div>
    </div>`);
    const svgMk = logo.querySelector('svg'), vt = logo.querySelector('.vt');
    const vX = new Track(-vw - 60).to(30.85, 0, { w: 14, z: 0.88 });
    draws.push((t) => {
      const on = t >= 30.45;
      svgMk.style.opacity = on ? 1 : 0;
      svgMk.style.transformOrigin = `${((391.1 - MK_X0) / MK_H * mh).toFixed(1)}px 50%`;
      svgMk.style.transform = `scale(${(popS(t, 30.45, 0.88) * bump(t, 30.5, 0.05)).toFixed(4)})`;
      vt.style.transform = `translateX(${vX.at(t).toFixed(2)}px)`;
      vt.style.opacity = t > 30.8 ? 1 : 0;
    });
    cue(30.5, 'slam', { n: 4 }); cue(31.0, 'whoosh', { v: 0.6 });
    const tag = W(`<div class="o" style="left:${px(LX + 6)};top:${px(BASE + 60)};font-weight:400;font-size:52px;letter-spacing:.08em;color:#B8C3DB;white-space:nowrap">Every node, bonded.</div>`);
    show(tag, 31.5, null);
    cue(31.5, 'shimmer');
    const cta = W(`<div class="row" style="left:960px;top:${px(BASE + 210)};height:84px;padding:0 40px;gap:14px;border-radius:42px;background:${C.blue};color:#fff;font-size:30px;font-weight:600">${ico('bt', 30)}Chat, telepon & SOS — saat sinyal hilang</div>`);
    show(cta, 32.5, null, (t) => `translateX(-50%) scale(${popS(t, 32.5, 0.85).toFixed(4)})`);
    cue(32.5, 'cta');

    // ───────────────────────── cursor (screen space)
    const cur = W(`<div style="left:0;top:0;width:0;height:0">
        <svg width="40" height="46" viewBox="0 0 40 46" style="position:absolute;left:-4px;top:-3px"><path d="M4 3 L4 37 L13 29 L19 43 L26 40 L20 26 L33 26 Z" fill="#fff" stroke="${C.navy}" stroke-width="2.6" stroke-linejoin="round"/></svg>
        <div class="pl" style="position:absolute;left:30px;top:40px;height:36px;padding:0 14px;border-radius:18px;background:${C.blue};color:#fff;font-size:19px;font-weight:600;display:flex;align-items:center;white-space:nowrap">Kamu</div>
        <div class="rp" style="position:absolute;left:-30px;top:-30px;width:60px;height:60px;border-radius:30px;border:3px solid #fff"></div></div>`, hud);
    const rp = cur.querySelector('.rp'), pl = cur.querySelector('.pl');
    const zAt = (t) => zT.at(t);
    const sAt = (x, y, tt) => toS(x, y, zAt(tt));
    const CUR = new Track(0), CURY = new Track(0);
    const CXT = new Track(1700), CYT = new Track(1000);
    const CLICKS = [7.5, 13.0, 19.0, 24.5];
    const go1 = (tArrive, x, y) => { CXT.to(tArrive - 0.45, x, SP.cursor); CYT.to(tArrive - 0.45, y, SP.cursor); };
    let p = sAt(AJX + 60, AJY + 14, 7.5); go1(7.4, p[0], p[1]);
    p = sAt(CX + CW / 2 - 24 - 42 + 6, CY + CH / 2 - 24 - 42 + 8, 13.0); CXT.to(10.6, 1760, SP.cursor); CYT.to(10.6, 1000, SP.cursor); go1(12.95, p[0], p[1]);
    p = sAt(DX - DW / 2 + 56 + 180, DY - DH / 2 + 480 + 56, 19.0); CXT.to(16.0, 1500, SP.cursor); CYT.to(16.0, 1060, SP.cursor); go1(18.95, p[0], p[1]);
    CXT.to(19.3, 1650, SP.cursor); CYT.to(19.3, 1050, SP.cursor);
    p = sAt(FX + FW / 2 - 36 - 110, FY - FH / 2 + 32 + 40, 24.5); go1(24.45, p[0], p[1]);
    CXT.to(24.9, 1780, SP.cursor); CYT.to(24.9, 1050, SP.cursor);
    CLICKS.forEach((tc) => cue(tc, 'click'));
    const CURWIN = [[6.6, 8.1], [11.9, 13.5], [18.3, 19.4], [23.95, 25.0]];
    draws.push((t) => {
      const x = CXT.at(t), y = CYT.at(t);
      const vx = (CXT.at(t + 0.01) - CXT.at(t - 0.01)) / 0.02;
      let o = 0;
      for (const [a, b] of CURWIN) o = Math.max(o, lin(t, a, a + 0.15) * (1 - lin(t, b - 0.15, b)));
      let s = 1; for (const tc of CLICKS) s *= press(t, tc);
      cur.style.opacity = o.toFixed(3);
      cur.style.transform = `translate(${x.toFixed(2)}px,${y.toFixed(2)}px) rotate(${clamp(-vx * 0.004, -12, 12).toFixed(2)}deg) scale(${s.toFixed(4)})`;
      pl.style.transform = `translateX(${clamp(-vx * 0.01, -24, 24).toFixed(2)}px)`;
      let rr = null; for (const tc of CLICKS) { const r = ripple(t, tc); if (r) rr = r; }
      rp.style.opacity = rr ? rr.o.toFixed(3) : 0; rp.style.transform = rr ? `scale(${rr.s.toFixed(3)})` : 'none';
    });

    // ───────────────────────── seek
    window.seek = (t) => {
      const z = zAt(t);
      const sh = 10 * Math.exp(-Math.max(0, t - 16.0) / 0.1) * (t >= 16.0 ? 1 : 0);
      world.style.transform = `translate(${(960 + Math.sin(t * 90) * sh).toFixed(2)}px,${(540 + Math.cos(t * 77) * sh).toFixed(2)}px) scale(${z.toFixed(5)}) translate(-960px,-540px)`;
      grid.style.transform = `translate(${(-(t * 6) % 80).toFixed(2)}px,0) scale(${z.toFixed(4)})`;
      draws.forEach((f) => f(t));
      const w = HW.at(t), h = HH.at(t), x = HX.at(t) + (heroBumps[0] || 0), y = HY.at(t);
      hero.style.left = px(x - w / 2); hero.style.top = px(y - h / 2);
      hero.style.width = px(w); hero.style.height = px(h);
      hero.style.borderRadius = px(Math.min(HR.at(t), Math.min(w, h) / 2));
      hero.style.background = HC.at(t);
      let s = popS(t, 0.0, 0.4);
      s *= bump(t, 16.0, 0.05, 0.1);
      [28.0, 28.5, 29.0, 29.5].forEach((tc) => { s *= bump(t, tc + 0.03, 0.05, 0.06); });
      hero.style.transform = `scale(${s.toFixed(4)})`;
      hero.style.opacity = (1 - lin(t, 30.45, 30.55)).toFixed(3);
      hero.style.visibility = t > 30.6 ? 'hidden' : 'visible';
    };
    window.FILM = {
      width: 1920, height: 1080, bpm: 120, duration: 34.0,
      sections: { intro: [0, 4], build: [4, 16], drop: [16, 20], outro: [30, 34] },
      cues: cues.sort((a, b) => a.t - b.t),
    };
    window.seek(0);
    window.READY = true;
  } catch (err) {
    window.FILM_ERROR = String(err && err.stack || err);
  }
})();
