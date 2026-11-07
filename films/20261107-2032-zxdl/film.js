// Saling Jaga · "Saat bencana datang". Landscape 1920×1080, 120 BPM, 32 s.
// A narrated night: an earthquake at 02.14, one family, no signal.
// One shape, never cut: status-bar pill → logo disc (search) → headcount card → walkie capsule
// → SOS card (drop) → compass disc → meeting-point bar → logo disc.
(async function () {
  try {
    const { clamp, lerp, stepR, Track, ColorTrack, SP, vis, applyVis, press, ripple, mix } = M;
    const C = { night: '#07110c', card: '#0f1f17', card2: '#13271d', cream: '#f2edd5', paper: '#f6f4ea', muted: '#a5b0a2',
      dim: '#6f7c6f', ink: '#1c2a21', grey: '#6b7469', leaf: '#3cbf6e', leafInk: '#04140a', moss: '#1b4d2e',
      lamp: '#f2c46b', sos: '#ef4b4b', red: '#ff6b6b', ayah: '#e8590c', dimas: '#1e7a45', nenek: '#d6336c', line: '#e4e1d3' };

    await Promise.all([
      document.fonts.load('800 80px "Plus Jakarta Sans"'), document.fonts.load('500 30px "Plus Jakarta Sans"'),
      document.fonts.load('700 30px "Plus Jakarta Sans"'), document.fonts.load('600 30px "Plus Jakarta Sans"'),
      document.fonts.load('600 24px "JetBrains Mono"'), document.fonts.load('700 30px "JetBrains Mono"'),
      document.fonts.load('italic 400 90px "Instrument Serif"'),
    ].map((p) => p.catch(() => null)));
    await document.fonts.ready;
    const logo = new Image(); logo.src = 'assets/mark.png';
    await new Promise((r) => { if (logo.complete) r(); logo.onload = r; logo.onerror = r; });

    const cues = [];
    const cue = (t, k, o = {}) => cues.push({ t, k, ...o });
    const world = document.getElementById('world');
    const hud = document.getElementById('hud');
    const redL = document.getElementById('red');
    const lampL = document.getElementById('lamp');
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
      check: P('<path d="M20 6 9 17l-5-5"/>', 3),
      x: P('<path d="M6 6l12 12M18 6 6 18"/>', 3),
      arrow: P('<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>', 2.6),
      up: P('<path d="M12 20V4"/><path d="m5 11 7-7 7 7"/>', 2.8),
      flag: P('<path d="M5 22V3.5"/><path d="M5 4h12l-2.5 4L17 12H5"/>', 2.4),
      med: P('<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M12 9v6M9 12h6"/>'),
      batt: P('<rect x="2.5" y="7.5" width="17" height="9" rx="2"/><path d="M21.5 10.5v3"/><path d="M5 10v4" stroke-width="3"/>'),
      nosig: P('<path d="M4 20v-2M9 20v-5M14 20v-8M19 20V7"/><path d="m3 3 18 18"/>', 2.4),
      bolt: P('<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>'),
      vol: P('<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M3.5 8v4"/>'),
      siren: P('<path d="M6 18v-6a6 6 0 0 1 12 0v6"/><path d="M4 21h16"/><path d="M12 2v2M4.2 5.2l1.4 1.4M19.8 5.2l-1.4 1.4"/>'),
      users: P('<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7"/><path d="M18 14a6.5 6.5 0 0 1 3.5 6"/>'),
    };
    const ico = (k, s, col = 'currentColor', st = '') => `<span class="ic" style="width:${s}px;height:${s}px;color:${col};${st}">${I[k]}</span>`;

    // ───────────────────────── Camera + earthquake ─────────────────────────
    const CAM = { z: new Track(Math.log(1.1)), zx: new Track(1320), zy: new Track(560) };
    const cam = (t, z, zx, zy, sp = SP.cam) => { CAM.z.to(t, Math.log(z), sp); if (zx != null) { CAM.zx.to(t, zx, sp); CAM.zy.to(t, zy, sp); } };
    cam(0.25, 1.0);
    cam(4.0, 1.04); cam(7.0, 1.0);
    cam(8.0, 1.03, 1320, 560); cam(11.0, 1.0);
    cam(12.5, 1.06, 1320, 560); cam(14.5, 1.0);
    cam(15.875, 1.07, 960, 560, { w: 16, z: 0.8 }); cam(16.75, 1.0);
    cam(20.0, 1.05, 1320, 560); cam(23.5, 1.0, 960, 540);
    cam(23.75, 1.1, 960, 640); cam(24.25, 1.0, 960, 540, { w: 6, z: 1 });
    cam(31.0, 1.03);
    // the quake: a long rumble from 0.5, peaking at 1.0, plus a hit at the drop
    const quake = (t) => {
      let x = 0, y = 0;
      const d = t - 0.5;
      if (d > 0 && d < 3.2) {
        const env = clamp(d / 0.5) * Math.exp(-Math.max(0, d - 0.5) * 1.3);
        x += 16 * env * (Math.sin(d * 47) + 0.5 * Math.sin(d * 83 + 1.3));
        y += 9 * env * (Math.sin(d * 39 + 0.7) + 0.4 * Math.sin(d * 71));
      }
      const h = t - 16.0;
      if (h > 0 && h < 0.6) x += 14 * Math.exp(-h * 8) * Math.sin(h * 70);
      return [x, y];
    };
    const toS = (x, y, t) => { const z = Math.exp(CAM.z.at(t)), zx = CAM.zx.at(t), zy = CAM.zy.at(t), [qx, qy] = quake(t); return [zx + (x - zx) * z + qx, zy + (y - zy) * z + qy]; };

    // lamp: warm room light that dies in the quake, comes back as dawn at the end
    draws.push((t) => {
      let o;
      if (t < 1.0) o = 1;
      else if (t < 1.75) { const k = Math.floor((t - 1.0) * 16); o = [0.2, 0.9, 0.1, 0.6, 0, 0.35, 0, 0.15, 0, 0, 0, 0][k] ?? 0; }
      else o = 0;
      o += 0.55 * stepR(t - 28.0, { w: 3, z: 1 });
      lampL.style.opacity = o.toFixed(3);
    });

    // ───────────────────────── SVG layer (under the shape) ─────────────────────────
    const svg = W(`<svg width="1920" height="1080" viewBox="0 0 1920 1080" style="left:0;top:0;overflow:visible"></svg>`);
    const NS = 'http://www.w3.org/2000/svg';
    const sv = (tag, attrs) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); svg.appendChild(e); return e; };
    const rings = [5.0, 5.5, 6.0, 6.5, 7.0].map((tb) => ({ tb, e: sv('circle', { cx: 1320, cy: 560, r: 150, fill: 'none', stroke: C.leaf, 'stroke-width': 3 }) }));
    draws.push((t) => rings.forEach(({ tb, e }) => {
      const x = (t - tb) / 1.6;
      if (x < 0 || x > 1 || t > 7.8) { e.setAttribute('opacity', 0); return; }
      e.setAttribute('r', (150 + 420 * (1 - Math.pow(1 - x, 3))).toFixed(1));
      e.setAttribute('opacity', (0.55 * (1 - x)).toFixed(3));
    }));

    // ───────────────────────── The one shape ─────────────────────────
    const body = W('<div></div>');
    const PB = { l: new Track(1320 - 320), t: new Track(560 - 75), r: new Track(1320 + 320), b: new Track(560 + 75), rad: new Track(75), col: new ColorTrack(C.card2), bd: new Track(1) };
    const pm = (t, cx, cy, w, h, rad, col, sp = SP.shape) => {
      PB.l.to(t, cx - w / 2, sp); PB.t.to(t, cy - h / 2, sp); PB.r.to(t, cx + w / 2, sp); PB.b.to(t, cy + h / 2, sp); PB.rad.to(t, rad, sp);
      if (col) PB.col.to(t, col, SP.soft);
    };
    const CARI = 5.0, CEK = 8.5, HOLD = 12.5, REL = 14.5, GO = 19.5, CTA = 30.0;
    const bodyPress = [CARI, CEK];
    draws.push((t) => {
      const l = PB.l.at(t), tp = PB.t.at(t), r = PB.r.at(t), b = PB.b.at(t);
      rect(body, l, tp, r - l, b - tp);
      body.style.borderRadius = Math.min(PB.rad.at(t), (r - l) / 2, (b - tp) / 2).toFixed(2) + 'px';
      body.style.background = PB.col.at(t);
      let s = popS(t, 0, 0.3); for (const tc of bodyPress) s *= 1 - 0.04 * Math.exp(-(((t - tc) / 0.08) ** 2));
      s *= 1 - 0.035 * clamp((t - HOLD) / 0.1) * clamp((REL - t) / 0.1);
      for (const tc of [16.0, 17.0, 18.0, 19.0]) s *= 1 + 0.018 * Math.exp(-(((t - tc) / 0.09) ** 2));
      body.style.transform = `scale(${s.toFixed(4)})`;
      const bd = clamp(PB.bd.at(t));
      body.style.boxShadow = `0 50px 110px -30px rgba(0,0,0,.75), inset 0 0 0 3px rgba(242,237,213,${(0.14 * bd).toFixed(3)})`;
    });
    // schedule
    pm(3.875, 1320, 560, 320, 320, 160, C.cream); PB.bd.to(3.875, 0, SP.text);
    pm(7.75, 1320, 560, 760, 840, 40, C.paper);
    pm(11.75, 1320, 560, 660, 200, 100, C.card2); PB.bd.to(11.75, 1, SP.text);
    PB.col.to(HOLD, C.leaf, { w: 24, z: 1 }); PB.col.to(REL, C.card2, SP.soft);
    pm(15.75, 960, 560, 1640, 860, 56, C.sos, { w: 15, z: 0.78 }); PB.bd.to(15.75, 0, SP.text);
    pm(19.875, 1320, 560, 760, 760, 380, C.card); PB.bd.to(19.875, 1, SP.text);
    pm(23.75, 960, 660, 1640, 300, 150, C.card2);
    pm(27.75, 960, 300, 260, 260, 130, C.cream); PB.bd.to(27.75, 0, SP.text);

    // ───────────────────────── Narrative clock (top left) ─────────────────────────
    const clockBox = add(`<div style="left:140px;top:72px;height:58px;display:flex;align-items:center;gap:16px;padding:0 24px 0 18px;border-radius:29px;background:rgba(19,39,29,.85);box-shadow:inset 0 0 0 2px rgba(242,237,213,.1);white-space:nowrap"></div>`);
    const dot = add(`<span style="width:14px;height:14px;border-radius:50%;background:${C.red}"></span>`, clockBox);
    const slot = add(`<span class="mono" style="position:relative;display:inline-block;width:96px;height:30px;font:700 28px/30px 'JetBrains Mono';color:${C.cream}"></span>`, clockBox);
    const stat = add(`<span class="mono" style="position:relative;display:inline-block;width:190px;height:30px;font:600 22px/30px 'JetBrains Mono';letter-spacing:.06em;color:${C.muted}"></span>`, clockBox);
    const times = [[0, '02.14', 'TANPA SINYAL'], [4, '02.15', 'TANPA SINYAL'], [8, '02.16', 'TANPA SINYAL'], [12, '02.17', 'TANPA SINYAL'],
      [16, '02.18', 'SOS MASUK'], [20, '02.19', 'MENUJU NENEK'], [24, '02.31', 'TITIK KUMPUL']];
    times.forEach(([tb, hh, st], i) => {
      const nx = times[i + 1] ? times[i + 1][0] - 0.125 : 27.75;
      const e = add(`<span style="position:absolute;left:0;top:0">${hh}</span>`, slot);
      show(e, i === 0 ? 0.125 : tb, nx);
      const prevSt = i ? times[i - 1][2] : null;
      const s = add(`<span style="position:absolute;left:0;top:0">${st}</span>`, stat);
      if (st !== prevSt) { const nxs = times.slice(i + 1).find((x) => x[2] !== st); show(s, i === 0 ? 0.25 : tb, nxs ? nxs[0] - 0.125 : 27.75); }
      else s.style.display = 'none';
      if (i) cue(tb, 'tick');
    });
    draws.push((t) => {
      applyVis(clockBox, vis(t, 0.125, 27.75));
      dot.style.opacity = (0.35 + 0.65 * (Math.floor(t * 2) % 2 === 0 ? 1 : 0.2)).toFixed(2);
      dot.style.background = t >= 24.0 ? C.leaf : C.red;
    });

    // ───────────────────────── Left column copy ─────────────────────────
    const block = (lbl, head, sub, tin, tout, lcol) => {
      const L = add(`<div class="lbl" style="left:140px;top:0;${lcol ? 'color:' + lcol : ''}">${lbl}</div>`);
      const Hh = add(`<div class="head" style="left:140px;top:0">${head}</div>`);
      const S = sub ? add(`<div class="sub" style="left:140px;top:0">${sub}</div>`) : null;
      const total = 24 + 34 + Hh.offsetHeight + (S ? 30 + S.offsetHeight : 0);
      const y0 = 560 - total / 2;
      L.style.top = y0 + 'px'; Hh.style.top = (y0 + 58) + 'px';
      if (S) S.style.top = (y0 + 58 + Hh.offsetHeight + 30) + 'px';
      show(L, tin, tout); show(Hh, tin + 0.125, tout);
      if (S) show(S, tin + 0.375, tout);
      cue(tin, 'shimmer');
      return { L, Hh, S };
    };

    // ══ 0–4 · the quake ══
    const il = add(`<div class="lbl" style="left:140px;top:0;color:${C.lamp}">01 · Dini hari</div>`);
    const ih = add(`<div class="head" style="left:140px;top:0;font-size:104px"></div>`);
    [['Bumi', 0.5], [`<span class="serif" style="color:${C.red}">berguncang.</span>`, 1.0]].forEach(([w, tw], i) => {
      if (i) ih.appendChild(document.createElement('br'));
      const e = add(`<span style="display:inline-block">${w}</span>`, ih); show(e, tw, 3.75, (t) => `scale(${bump(t, tw, 0.05).toFixed(4)})`);
      cue(tw, 'slam', { n: i });
    });
    const isub = add(`<div class="sub" style="left:140px;top:0">Listrik padam. Sinyal hilang.<br>Satu keluarga terpencar dalam gelap.</div>`);
    const iy = 560 - (58 + ih.offsetHeight + 30 + isub.offsetHeight) / 2;
    il.style.top = iy + 'px'; ih.style.top = (iy + 58) + 'px'; isub.style.top = (iy + 58 + ih.offsetHeight + 30) + 'px';
    show(il, 0.25, 3.75); show(isub, 2.5, 3.75);
    cue(0, 'born'); cue(1.0, 'drop'); cue(2.5, 'shimmer');

    // status-bar content inside the pill
    const sbar = W(`<div style="width:640px;height:150px;display:flex;align-items:center;padding:0 54px;gap:0"></div>`);
    at(sbar, 1320 - 320, 560 - 75);
    add(`<div class="mono" style="font:700 46px/1 'JetBrains Mono';color:${C.cream};letter-spacing:-.02em">02.14</div>`, sbar);
    add(`<div style="flex:1"></div>`, sbar);
    const sig = add(`<div style="position:relative;width:250px;height:56px"></div>`, sbar);
    const bars = [18, 30, 42, 54].map((h, i) => add(`<i style="position:absolute;bottom:0;left:${i * 18}px;width:12px;height:${h}px;border-radius:3px;background:${C.cream}"></i>`, sig));
    const wifiI = add(`<div style="position:absolute;left:92px;top:6px">${ico('wifi', 44, C.cream)}</div>`, sig);
    const battI = add(`<div style="position:absolute;left:160px;top:4px;display:flex;align-items:center;gap:6px;font:700 26px/1 'Plus Jakarta Sans';color:${C.cream}">${ico('batt', 44)}</div>`, sig);
    const noSvc = add(`<div style="position:absolute;right:0;top:0;height:56px;display:flex;align-items:center;gap:12px;color:${C.red};font:700 30px/1 'Plus Jakarta Sans';white-space:nowrap">${ico('nosig', 36)}Tidak ada layanan</div>`, sig);
    const pwr = W(`<div style="display:flex;align-items:center;gap:12px;padding:14px 22px;border-radius:999px;background:${C.card2};color:${C.lamp};font:700 24px/1 'Plus Jakarta Sans';white-space:nowrap">${ico('bolt', 26)}Listrik padam</div>`);
    at(pwr, 1320 - 320, 560 + 75 + 28);
    const drops = [1.5, 1.75, 2.0, 2.25];
    drops.forEach((td) => cue(td, 'tick'));
    cue(1.25, 'alert'); cue(2.75, 'alert');
    draws.push((t) => {
      applyVis(sbar, vis(t, 0.125, 3.625));
      bars.forEach((b, i) => {
        const td = drops[3 - i];
        const x = clamp((t - td) / 0.18);
        b.style.opacity = (1 - 0.85 * x * (t < 2.75 ? 1 : 1)).toFixed(3);
        b.style.transform = `translateY(${(x * 4).toFixed(1)}px)`;
        b.style.background = x > 0 ? mix(C.cream, C.dim, x) : C.cream;
      });
      const v1 = vis(t, 0.125, 2.625, 0.1);
      [...bars, wifiI, battI].forEach((e) => { e.style.visibility = v1.gone ? 'hidden' : 'visible'; });
      wifiI.style.opacity = (v1.o * (1 - 0.85 * clamp((t - 1.25) / 0.15))).toFixed(3);
      battI.style.opacity = v1.o.toFixed(3);
      applyVis(noSvc, vis(t, 2.75, 3.625), `scale(${bump(t, 2.75, 0.06).toFixed(4)})`);
      applyVis(pwr, vis(t, 1.25, 3.625), `scale(${bump(t, 1.25, 0.06).toFixed(4)})`);
    });

    // ══ 4–8 · phones find each other ══
    block('02 · Saling Jaga', `HP saling <span class="serif">menemukan.</span>`, 'Tanpa internet, pulsa, atau BTS. Langsung dari HP ke HP lewat Wi‑Fi Direct.', 4.0, 7.625);
    cue(4.0, 'swap', { n: 0 });
    const lg1 = W(`<div style="width:236px;height:236px;background:url(assets/mark.png) center/contain no-repeat"></div>`);
    ctr(lg1, 1320, 560);
    show(lg1, 4.125, 6.875, (t) => `scale(${(press(t, CARI) * popS(t, 4.125, 0.6)).toFixed(4)})`);
    const conn = W(`<div style="display:flex;flex-direction:column;align-items:center;gap:8px;color:${C.leafInk};text-align:center"><span style="font:800 96px/1 'Plus Jakarta Sans';letter-spacing:-.04em">3 HP</span><span class="mono" style="font:700 22px/1 'JetBrains Mono';letter-spacing:.1em">TERHUBUNG</span></div>`);
    ctr(conn, 1320, 560);
    show(conn, 7.0, 7.625, (t) => `scale(${bump(t, 7.0, 0.07).toFixed(4)})`);
    cue(CARI, 'click'); cue(CARI, 'whoosh', { v: 0.5 }); cue(7.0, 'check');

    const fam = [
      { n: 'Ayah', i: 'A', c: C.ayah, d: '60 m · barat', x: 990, y: 300, tin: 5.5 },
      { n: 'Dimas', i: 'D', c: C.dimas, d: '85 m · utara', x: 1640, y: 300, tin: 6.0 },
      { n: 'Nenek', i: 'N', c: C.nenek, d: '140 m · timur laut', x: 1500, y: 860, tin: 6.5 },
    ];
    fam.forEach((p) => {
      p.line = sv('line', { x1: 1320, y1: 560, x2: p.x, y2: p.y, stroke: C.leaf, 'stroke-width': 3, 'stroke-dasharray': '6 10', opacity: 0 });
      p.e = W(`<div style="display:flex;align-items:center;gap:14px;padding:12px 26px 12px 12px;border-radius:999px;background:${C.card2};white-space:nowrap;box-shadow:inset 0 0 0 3px rgba(60,191,110,.25)">
        <div class="av" style="width:56px;height:56px;background:${p.c};font-size:26px">${p.i}</div>
        <div><div style="font:700 26px/1.1 'Plus Jakarta Sans'">${p.n}</div><div class="mono" style="font:600 18px/1.3 'JetBrains Mono';color:${C.muted}">${p.d}</div></div></div>`);
      cue(p.tin, 'pop');
      draws.push((t) => {
        ctr(p.e, p.x, p.y);
        applyVis(p.e, vis(t, p.tin, 7.625), `scale(${popS(t, p.tin, 0.6).toFixed(4)})`);
        const lv = vis(t, p.tin - 0.125, 7.625);
        p.line.setAttribute('opacity', (lv.o * 0.6).toFixed(3));
        p.line.setAttribute('stroke-dashoffset', (-t * 60).toFixed(1));
      });
    });

    // ══ 8–12 · headcount ══
    block('03 · Hitung kepala', `Siapa yang <span class="serif">belum</span> kabar?`, 'Status dan baterai setiap anggota terlihat, walau tanpa sinyal.', 8.0, 11.625);
    const CL = 1320 - 380, CT = 560 - 420;
    const hcH = W(`<div style="width:760px;padding:0 44px;display:flex;align-items:center;gap:18px;color:${C.ink}">
      <div style="width:60px;height:60px;border-radius:18px;background:${C.moss};color:${C.cream};display:flex;align-items:center;justify-content:center">${ico('users', 34)}</div>
      <div style="flex:1"><div style="font:800 32px/1.1 'Plus Jakarta Sans';letter-spacing:-.02em">Keluarga</div>
      <div style="font:600 20px/1.3 'Plus Jakarta Sans';color:${C.grey}">4 anggota · tanpa sinyal</div></div>
      <div style="text-align:right"><div class="mono" style="font:700 16px/1 'JetBrains Mono';letter-spacing:.1em;color:${C.grey}">AMAN</div>
      <div style="font:800 56px/1 'Plus Jakarta Sans';letter-spacing:-.03em;margin-top:4px"><span class="hcn" style="display:inline-block">1</span><span style="color:#b6b9ab">/4</span></div></div></div>`);
    at(hcH, CL, CT + 44);
    const hcN = hcH.querySelector('.hcn');
    const rows = [
      { n: 'Kamu', i: 'K', c: C.moss, b: '71%', tc: null },
      { n: 'Ayah', i: 'A', c: C.ayah, b: '58%', tc: 9.0 },
      { n: 'Dimas', i: 'D', c: C.dimas, b: '34%', tc: 9.5 },
      { n: 'Nenek', i: 'N', c: C.nenek, b: '12%', tc: 10.0, miss: true },
    ];
    rows.forEach((r, k) => {
      r.e = W(`<div style="width:672px;height:128px;display:flex;align-items:center;gap:20px;padding:0 4px;border-top:2px solid ${C.line};color:${C.ink}">
        <div class="av" style="width:60px;height:60px;background:${r.c};font-size:26px">${r.i}</div>
        <div style="flex:1;font:700 30px/1 'Plus Jakarta Sans'">${r.n}</div>
        <div class="mono" style="display:flex;align-items:center;gap:6px;font:600 20px/1 'JetBrains Mono';color:${C.grey};width:110px">${ico('batt', 28)}${r.b}</div>
        <div class="st" style="position:relative;width:236px;height:48px"></div></div>`);
      at(r.e, CL + 44, CT + 150 + k * 128);
      const st = r.e.querySelector('.st');
      r.wait = add(`<div style="position:absolute;right:0;top:0;height:48px;display:flex;align-items:center;font:600 24px/1 'Plus Jakarta Sans';color:#a3a697">menunggu…</div>`, st);
      r.ok = add(`<div style="position:absolute;right:0;top:0;height:48px;display:flex;align-items:center;gap:10px;padding:0 20px 0 14px;border-radius:24px;background:#d7f0dd;color:#14692f;font:700 24px/1 'Plus Jakarta Sans'">${ico('check', 24)}Aman</div>`, st);
      r.bad = add(`<div style="position:absolute;right:0;top:0;height:48px;display:flex;align-items:center;gap:10px;padding:0 20px 0 14px;border-radius:24px;background:#fde0e0;color:#c92a2a;font:700 24px/1 'Plus Jakarta Sans';white-space:nowrap"><span style="width:12px;height:12px;border-radius:50%;background:#e03131"></span>Belum menjawab</div>`, st);
      const tin = 8.125 + k * 0.125;
      draws.push((t) => {
        applyVis(r.e, vis(t, tin, 11.625));
        const tc = r.tc ?? -1;
        applyVis(r.wait, vis(t, 0, r.tc == null ? 0 : tc - 0.125, 0.1));
        if (r.tc == null) r.wait.style.visibility = 'hidden';
        applyVis(r.miss ? r.bad : r.ok, vis(t, r.tc == null ? 0 : tc, null), `scale(${bump(t, tc, 0.08).toFixed(4)})`);
        (r.miss ? r.ok : r.bad).style.visibility = 'hidden';
        if (r.miss) r.e.style.background = t > tc ? `rgba(255,107,107,${(0.12 * clamp((t - tc) / 0.2) * (0.6 + 0.4 * Math.cos((t - tc) * Math.PI * 2))).toFixed(3)})` : 'transparent';
      });
    });
    const cekB = W(`<div style="width:672px;height:84px;border-radius:42px;background:${C.moss};color:${C.cream};display:flex;align-items:center;justify-content:center;gap:14px;font:800 30px/1 'Plus Jakarta Sans'">${ico('check', 30)}Cek kondisi semua</div>`);
    at(cekB, CL + 44, CT + 840 - 44 - 84);
    show(hcH, 8.0, 11.625);
    show(cekB, 8.25, 11.625, (t) => `scale(${press(t, CEK).toFixed(4)})`);
    cue(CEK, 'click'); cue(9.0, 'check'); cue(9.5, 'check'); cue(10.0, 'alert'); cue(10.5, 'note', { n: 1 }); cue(11.0, 'note', { n: 0 });
    draws.push((t) => {
      const n = t >= 9.5 ? 3 : t >= 9.0 ? 2 : 1;
      hcN.textContent = n;
      hcN.style.transform = `scale(${(bump(t, 9.0, 0.2) * bump(t, 9.5, 0.2)).toFixed(4)})`;
    });

    // ══ 12–16 · walkie-talkie, no answer ══
    block('04 · Walkie‑talkie', `Tahan. <span class="serif">Panggil</span> semua.`, 'Suara sampai ke seluruh grup sekaligus. Bisa juga telepon dua arah.', 12.0, 15.625);
    const ptt = W(`<div style="display:flex;align-items:center;gap:20px;color:${C.cream};font:700 38px/1 'Plus Jakarta Sans';white-space:nowrap">${ico('mic', 50, C.leaf)}Tahan untuk bicara</div>`);
    ctr(ptt, 1320, 560); show(ptt, 12.0, 12.375);
    const wave = W(`<div style="display:flex;align-items:center;gap:8px;height:120px"></div>`);
    const wbars = Array.from({ length: 28 }, () => add(`<i style="display:block;width:10px;border-radius:5px;background:${C.leafInk}"></i>`, wave));
    ctr(wave, 1320, 560);
    const waitT = W(`<div style="display:flex;align-items:center;gap:0;color:${C.cream};font:700 34px/1 'Plus Jakarta Sans';white-space:nowrap">Menunggu Nenek&nbsp;<span class="d">.</span><span class="d">.</span><span class="d">.</span></div>`);
    ctr(waitT, 1320, 560); show(waitT, 14.625, 15.625);
    const dots = [...waitT.querySelectorAll('.d')];
    const said = W(`<div style="padding:22px 30px;border-radius:30px;border-bottom-left-radius:8px;background:${C.cream};color:${C.ink};font:700 34px/1.25 'Plus Jakarta Sans';white-space:nowrap">“Nenek, dengar? Di mana?”</div>`);
    at(said, 1320 - 330, 560 - 100 - 40 - 96);
    show(said, 12.75, 15.625, (t) => `scale(${popS(t, 12.75, 0.85).toFixed(4)})`);
    const heardRow = W(`<div style="display:flex;gap:14px;white-space:nowrap"></div>`);
    const heard = [
      ['Ayah', C.ayah, 'A', true, 13.5], ['Dimas', C.dimas, 'D', true, 14.0], ['Nenek', C.nenek, 'N', false, 15.0],
    ].map(([n, c, i, ok, tin], k) => {
      const e = W(`<div style="display:flex;align-items:center;gap:12px;padding:10px 22px 10px 10px;border-radius:999px;background:${ok ? C.card2 : '#3a1717'};white-space:nowrap">
        <div class="av" style="width:44px;height:44px;background:${c};font-size:20px">${i}</div>
        <span style="font:700 24px/1 'Plus Jakarta Sans';color:${ok ? C.cream : C.red}">${ok ? 'Mendengar' : 'Tidak menjawab'}</span>${ok ? ico('check', 24, C.leaf) : ''}</div>`);
      heardRow.appendChild(e);
      show(e, tin, 15.625, (t) => `scale(${popS(t, tin, 0.7).toFixed(4)})`);
      cue(tin, ok ? 'pop' : 'alert');
      return e;
    });
    at(heardRow, 1320 - heardRow.offsetWidth / 2, 560 + 100 + 36);
    draws.push((t) => {
      const v = vis(t, HOLD + 0.05, REL - 0.05);
      applyVis(wave, v);
      dots.forEach((d, i) => { d.style.opacity = (Math.floor(t * 6) % 4) > i ? 1 : 0.15; });
      if (v.gone) return;
      wbars.forEach((b, i) => {
        const env = 0.35 + 0.65 * Math.abs(Math.sin(t * 2.2 + i * 0.21));
        const h = 14 + 90 * env * Math.abs(Math.sin(t * 9.3 + i * 0.77)) * (0.5 + 0.5 * Math.sin(i * 0.4 + 1));
        b.style.height = h.toFixed(1) + 'px';
      });
    });
    cue(HOLD, 'click'); cue(HOLD, 'drag', { d: REL - HOLD }); cue(REL, 'release');
    cue(12.75, 'pop');
    cue(14.0, 'riser', { d: 2.0 });
    [15.25, 15.5, 15.625, 15.75, 15.875].forEach((tt) => cue(tt, 'tick'));

    // ══ 16–20 · SOS from Nenek (the drop) ══
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
    const sosH = W(`<div style="font:800 112px/1 'Plus Jakarta Sans';letter-spacing:-.045em;color:#fff;white-space:nowrap">Nenek butuh <span class="serif" style="font-size:1.16em">bantuan.</span></div>`);
    at(sosH, SL + 90, ST + 160);
    const tile = (big, small, icon) => W(`<div style="width:300px;height:170px;border-radius:30px;background:rgba(255,255,255,.16);color:#fff;padding:26px 30px;display:flex;flex-direction:column;justify-content:space-between">
      <div style="display:flex;align-items:center;gap:12px;font:800 62px/1 'Plus Jakarta Sans';letter-spacing:-.03em">${icon || ''}${big}</div>
      <div class="mono" style="font:600 20px/1 'JetBrains Mono';letter-spacing:.1em;opacity:.85">${small}</div></div>`);
    const tiles = [
      [tile('140 m', 'JARAK'), 16.5],
      [tile('TL', 'ARAH · TIMUR LAUT', `<span class="ic" style="width:56px;height:56px;transform:rotate(45deg)">${I.up}</span>`), 17.0],
      [tile('12%', 'BATERAI NENEK', ico('batt', 52)), 17.5],
    ];
    tiles.forEach(([e, tin], i) => { at(e, SL + 90 + i * 330, ST + 340); show(e, tin, 19.75, (t) => `scale(${popS(t, tin, 0.7).toFixed(4)})`); cue(tin, 'slam', { n: 4 + i }); });
    const volC = W(`<div style="display:flex;align-items:center;gap:14px;padding:16px 24px;border-radius:999px;background:#fff;color:${C.sos};font:700 26px/1 'Plus Jakarta Sans';white-space:nowrap">${ico('vol', 30)}Dikirim dengan 5× tombol volume</div>`);
    at(volC, SL + 90, ST + 580);
    const medC = W(`<div style="display:flex;align-items:center;gap:14px;padding:16px 24px;border-radius:999px;background:rgba(255,255,255,.16);color:#fff;font:700 26px/1 'Plus Jakarta Sans';white-space:nowrap">${ico('med', 30)}Kartu medis ikut terkirim</div>`);
    at(medC, SL + 90 + volC.offsetWidth + 20, ST + 580);
    show(sosTop, 16.0, 19.75); show(sosH, 16.125, 19.75, (t) => `scale(${bump(t, 16.125, 0.03).toFixed(4)})`);
    show(volC, 18.0, 19.75); show(medC, 18.5, 19.75); cue(18.0, 'pop'); cue(18.5, 'pop');
    const dirD = W(`<div style="width:340px;height:340px;border-radius:50%;background:rgba(255,255,255,.14);box-shadow:inset 0 0 0 3px rgba(255,255,255,.35)">
      <div class="mono" style="position:absolute;left:0;right:0;top:16px;text-align:center;font:700 24px/1 'JetBrains Mono';color:#fff">U</div>
      <div class="arr" style="position:absolute;left:70px;top:70px;width:200px;height:200px;color:#fff">${I.up}</div></div>`);
    const arr = dirD.querySelector('.arr');
    ctr(dirD, 1500, ST + 330);
    const ROT = new Track(-60).to(16.5, 45, { w: 9, z: 0.6 });
    draws.push((t) => { applyVis(dirD, vis(t, 16.25, 19.75), `scale(${popS(t, 16.25, 0.7).toFixed(4)})`); arr.style.transform = `rotate(${ROT.at(t).toFixed(2)}deg)`; });
    const goB = W(`<div style="display:flex;align-items:center;gap:14px;padding:24px 40px;border-radius:999px;background:#fff;color:${C.sos};font:800 32px/1 'Plus Jakarta Sans';white-space:nowrap">Arahkan ke Nenek${ico('arrow', 34)}</div>`);
    at(goB, 1780 - 90 - goB.offsetWidth, ST + 860 - 80 - goB.offsetHeight);
    show(goB, 18.75, 19.75, (t) => `scale(${press(t, GO).toFixed(4)})`); cue(18.75, 'pop'); cue(GO, 'click');

    // ══ 20–24 · compass to Nenek ══
    const cpL = add(`<div class="lbl" style="left:140px;top:0">05 · Kompas</div>`);
    const cpH = add(`<div class="head" style="left:140px;top:0">Panah menuju <span class="serif">Nenek.</span></div>`);
    const dist = add(`<div style="left:140px;top:0;display:flex;align-items:center;gap:22px;padding:20px 34px 20px 20px;border-radius:28px;background:${C.card2};white-space:nowrap">
      <div class="ar" style="width:64px;height:64px;border-radius:50%;background:${C.red};color:#fff;display:flex;align-items:center;justify-content:center"><span class="ic" style="width:36px;height:36px;transform:rotate(45deg)">${I.up}</span></div>
      <div><div class="mono" style="font:600 18px/1 'JetBrains Mono';letter-spacing:.1em;color:${C.muted}">JARAK KE NENEK</div>
      <div style="display:flex;align-items:baseline;gap:8px;margin-top:6px;font:800 54px/1 'Plus Jakarta Sans'"><span class="n" style="display:inline-block;width:100px;text-align:right">140</span><span style="color:${C.dim}">m</span></div></div></div>`);
    const distN = dist.querySelector('.n'), distAr = dist.querySelector('.ar');
    const sirC = add(`<div style="left:140px;top:0;display:flex;align-items:center;gap:14px;padding:14px 24px;border-radius:999px;background:#3a1717;color:${C.red};font:700 24px/1 'Plus Jakarta Sans';white-space:nowrap">${ico('siren', 28)}Sirene & senter menyala di HP Nenek</div>`);
    const cy0 = 560 - (58 + cpH.offsetHeight + 34 + dist.offsetHeight + 24 + sirC.offsetHeight) / 2;
    cpL.style.top = cy0 + 'px'; cpH.style.top = (cy0 + 58) + 'px'; dist.style.top = (cy0 + 58 + cpH.offsetHeight + 34) + 'px';
    sirC.style.top = (cy0 + 58 + cpH.offsetHeight + 34 + dist.offsetHeight + 24) + 'px';
    show(cpL, 20.0, 23.625); show(cpH, 20.125, 23.625); show(dist, 20.25, 23.625); show(sirC, 21.5, 23.625);
    cue(20.0, 'shimmer'); cue(21.5, 'pop');
    const steps = [[21.0, 105], [21.5, 70], [22.0, 35], [22.5, 10], [23.0, 0]];
    steps.forEach(([ts]) => cue(ts, 'tick'));
    draws.push((t) => {
      let n = 140; for (const [ts, v] of steps) if (t >= ts) n = v;
      distN.textContent = n;
      distN.style.transform = `scale(${steps.reduce((s, [ts]) => s * bump(t, ts, 0.1), 1).toFixed(4)})`;
      distAr.style.background = t >= 23.0 ? C.leaf : C.red;
    });
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
    const SC = 330 / 160;
    const pol = (m, deg) => [OX + Math.sin(deg * Math.PI / 180) * m * SC, OY - Math.cos(deg * Math.PI / 180) * m * SC];
    const NEN = pol(140, 45);
    const dotEl = (i, c, name, extra = '') => W(`<div style="width:0;height:0"><div style="position:absolute;left:-28px;top:-28px;width:56px;height:56px;border-radius:50%;background:${c};color:${c === C.cream ? C.leafInk : '#fff'};display:flex;align-items:center;justify-content:center;font:800 24px/1 'Plus Jakarta Sans';box-shadow:0 0 0 5px ${C.card}">${i}</div>
      <div class="nm" style="position:absolute;left:38px;top:-28px;white-space:nowrap;font:700 24px/1.15 'Plus Jakarta Sans'">${name}${extra}</div></div>`);
    const others = [[dotEl('A', C.ayah, 'Ayah'), pol(70, -80), 20.375], [dotEl('D', C.dimas, 'Dimas'), pol(85, -15), 20.5]];
    others.forEach(([e, p, tin]) => { at(e, p[0], p[1]); draws.push((t) => applyVis(e, vis(t, tin, 23.75), `scale(${popS(t, tin, 0.4).toFixed(4)})`)); cue(tin, 'pop'); });
    const nen = dotEl('N', C.nenek, 'Nenek', `<div class="mono" style="font:700 17px/1.2 'JetBrains Mono';color:${C.red}">SOS</div>`);
    at(nen, NEN[0], NEN[1]);
    draws.push((t) => applyVis(nen, vis(t, 20.25, 23.75), `scale(${popS(t, 20.25, 0.4).toFixed(4)})`));
    const sRings = [0, 1, 2].map(() => W(`<div style="width:56px;height:56px;border-radius:50%;border:3px solid ${C.red}"></div>`));
    draws.push((t) => sRings.forEach((e, k) => {
      const ph = (((t - 21.5) / 1.0 + k / 3) % 1 + 1) % 1;
      const live = t > 21.5 && t < 23.6;
      ctr(e, NEN[0], NEN[1]);
      e.style.opacity = live ? (0.8 * (1 - ph) * clamp((t - 21.5) / 0.2)).toFixed(3) : 0;
      e.style.transform = `scale(${(1 + ph * 2.4).toFixed(3)})`;
      e.style.borderColor = t >= 23.0 ? C.leaf : C.red;
    }));
    // "Kamu" walks toward Nenek; the arrow shrinks with the distance
    const me = dotEl('K', C.cream, 'Kamu');
    const meNm = me.querySelector('.nm'); meNm.style.left = '-34px'; meNm.style.top = '38px';
    const MX = new Track(OX), MY = new Track(OY);
    steps.forEach(([ts, v]) => { const f = 1 - v / 140, d = Math.max(0, 1 - f) ; const px = OX + (NEN[0] - OX) * f * 0.86, py = OY + (NEN[1] - OY) * f * 0.86; MX.to(ts - 0.125, px, SP.soft); MY.to(ts - 0.125, py, SP.soft); void d; });
    draws.push((t) => { at(me, MX.at(t), MY.at(t)); applyVis(me, vis(t, 20.25, 23.75), `scale(${popS(t, 20.25, 0.4).toFixed(4)})`); });
    const ARW = W(`<div style="height:0;width:0;transform-origin:0 0"><div class="shaft" style="position:absolute;left:0;top:-7px;height:14px;border-radius:7px;background:${C.red}"></div>
      <div class="ahd" style="position:absolute;top:-24px;width:0;height:0;border-top:24px solid transparent;border-bottom:24px solid transparent;border-left:36px solid ${C.red}"></div></div>`);
    const shaft = ARW.querySelector('.shaft'), ahead = ARW.querySelector('.ahd');
    const AL = new Track(0).to(20.75, 1, { w: 14, z: 0.9 });
    const ang = Math.atan2(NEN[1] - OY, NEN[0] - OX) * 180 / Math.PI;
    draws.push((t) => {
      const v = vis(t, 20.75, 22.75);
      const mx = MX.at(t), my = MY.at(t);
      at(ARW, mx, my);
      ARW.style.transformOrigin = '0 0';
      applyVis(ARW, v, `rotate(${ang.toFixed(2)}deg)`);
      const L = (Math.hypot(NEN[0] - mx, NEN[1] - my) - 40) * clamp(AL.at(t), 0, 1.05);
      shaft.style.left = '38px';
      shaft.style.width = Math.max(0, L - 30 - 38).toFixed(1) + 'px';
      ahead.style.left = Math.max(38, L - 34).toFixed(1) + 'px';
      ahead.style.opacity = L > 80 ? 1 : 0; shaft.style.opacity = L > 80 ? 1 : 0;
    });
    const found = W(`<div style="display:flex;align-items:center;gap:12px;padding:14px 26px 14px 18px;border-radius:999px;background:${C.leaf};color:${C.leafInk};font:800 30px/1 'Plus Jakarta Sans';white-space:nowrap">${ico('check', 30)}Ketemu.</div>`);
    ctr(found, NEN[0] - 40, NEN[1] + 96);
    show(found, 23.0, 23.75, (t) => `scale(${popS(t, 23.0, 0.6).toFixed(4)})`);
    cue(20.75, 'whoosh', { v: 0.5 }); cue(23.0, 'check'); cue(23.5, 'settle');

    // ══ 24–28 · meeting point, everyone safe ══
    const rL = add(`<div class="lbl" style="left:0;top:230px;width:1920px;justify-content:center">06 · Titik kumpul</div>`);
    const rH = add(`<div class="head" style="left:0;top:278px;width:1920px;text-align:center;font-size:84px">Semua tiba. <span class="serif">Semua aman.</span></div>`);
    show(rL, 24.0, 27.625); show(rH, 24.125, 27.625); cue(24.0, 'shimmer');
    const MPX = 140, MPY = 660 - 150;
    const mpL = W(`<div style="display:flex;align-items:center;gap:26px;white-space:nowrap">
      <div style="width:120px;height:120px;border-radius:50%;background:${C.leaf};color:${C.leafInk};display:flex;align-items:center;justify-content:center">${ico('flag', 60)}</div>
      <div><div class="mono" style="font:700 22px/1 'JetBrains Mono';letter-spacing:.12em;color:${C.leaf}">DITANDAI AYAH</div>
      <div style="font:800 48px/1.1 'Plus Jakarta Sans';letter-spacing:-.03em;margin-top:10px">Lapangan masjid</div></div></div>`);
    at(mpL, MPX + 90, MPY + 150 - 60);
    show(mpL, 24.25, 27.625, (t) => `scale(${popS(t, 24.25, 0.8).toFixed(4)})`); cue(24.25, 'pop');
    const arrive = [['K', C.cream, 24.5], ['A', C.ayah, 25.0], ['D', C.dimas, 25.5], ['N', C.nenek, 26.0]];
    const slots = arrive.map(([i, c, ta], k) => {
      const x = MPX + 960 + k * 108;
      const ph = W(`<div style="width:92px;height:92px;border-radius:50%;box-shadow:inset 0 0 0 3px rgba(242,237,213,.16)"></div>`);
      at(ph, x, MPY + 104);
      show(ph, 24.25 + k * 0.0625, 27.625);
      const av = W(`<div class="av" style="width:92px;height:92px;background:${c};color:${c === C.cream ? C.leafInk : '#fff'};font-size:38px;box-shadow:0 0 0 5px ${C.card2}">${i}</div>`);
      at(av, x, MPY + 104);
      show(av, ta, 27.625, (t) => `translateY(${(-60 * (1 - stepR(t - ta, SP.pop))).toFixed(1)}px) scale(${popS(t, ta, 0.4).toFixed(4)})`);
      cue(ta, 'check');
      return av;
    });
    const cntB = W(`<div style="text-align:right;white-space:nowrap"><div class="mono" style="font:700 20px/1 'JetBrains Mono';letter-spacing:.12em;color:${C.muted}">TIBA</div>
      <div style="font:800 64px/1 'Plus Jakarta Sans';letter-spacing:-.03em;margin-top:6px"><span class="n">0</span><span style="color:${C.dim}">/4</span></div></div>`);
    at(cntB, MPX + 1640 - 90 - 150, MPY + 98);
    cntB.style.width = '150px';
    const cntN = cntB.querySelector('.n');
    show(cntB, 24.375, 27.625);
    draws.push((t) => {
      let n = 0; for (const [, , ta] of arrive) if (t >= ta) n++;
      cntN.textContent = n;
      cntN.style.color = n === 4 ? C.leaf : C.cream;
      cntN.style.display = 'inline-block';
      cntN.style.transform = `scale(${arrive.reduce((s, [, , ta]) => s * bump(t, ta, 0.18), 1).toFixed(4)})`;
    });
    cue(26.0, 'slam', { n: 7 });
    const rS = add(`<div class="sub" style="left:0;top:866px;width:1920px;text-align:center">Tandai titik kumpul, lihat siapa yang sudah sampai.</div>`);
    show(rS, 26.5, 27.625); cue(26.5, 'settle');

    // ══ 28–32 · logo ══
    const lg = W(`<div style="width:210px;height:210px;background:url(assets/mark.png) center/contain no-repeat"></div>`);
    ctr(lg, 960, 300);
    draws.push((t) => applyVis(lg, vis(t, 28.0, null), `scale(${popS(t, 28.0, 0.6).toFixed(4)})`));
    cue(28.0, 'slam', { n: 11 }); cue(28.0, 'born');
    const wm = add(`<div style="left:0;top:470px;width:1920px;text-align:center;font:800 120px/1 'Plus Jakarta Sans';letter-spacing:-.05em">Saling Jaga</div>`);
    const tg = add(`<div style="left:0;top:612px;width:1920px;text-align:center;font:500 40px/1.2 'Plus Jakarta Sans';color:${C.muted}">Saat sinyal hilang, kita tetap <span class="serif" style="color:${C.leaf};font-size:1.3em">saling jaga.</span></div>`);
    show(wm, 28.5, null); show(tg, 29.0, null); cue(28.5, 'pop'); cue(29.0, 'shimmer');
    const cta = add(`<div style="top:740px;height:96px;border-radius:48px;display:flex;align-items:center;justify-content:center;font:800 34px/1 'Plus Jakarta Sans';white-space:nowrap;overflow:hidden"></div>`);
    const ctaA = add(`<span style="position:absolute;display:flex;align-items:center;gap:14px">Pasang sebelum dibutuhkan${ico('arrow', 34)}</span>`, cta);
    const ctaB = add(`<span style="position:absolute" class="mono">saling-jaga.com</span>`, cta);
    const ctaC = new ColorTrack(C.leaf).to(CTA, C.cream, SP.soft);
    const CWt = new Track(600).to(CTA, 460, SP.shape);
    draws.push((t) => {
      const w = CWt.at(t); cta.style.left = (960 - w / 2).toFixed(2) + 'px'; cta.style.width = w.toFixed(2) + 'px';
      applyVis(cta, vis(t, 29.5, null), `scale(${(popS(t, 29.5, 0.8) * press(t, CTA)).toFixed(4)})`);
      cta.style.background = ctaC.at(t); cta.style.color = C.leafInk;
      applyVis(ctaA, vis(t, 29.625, 29.95, 0.08)); applyVis(ctaB, vis(t, 30.05, null));
    });
    cue(29.5, 'pop'); cue(CTA, 'cta');
    const fine = add(`<div class="mono" style="left:0;top:892px;width:1920px;text-align:center;font:600 24px/1.6 'JetBrains Mono';color:${C.muted};letter-spacing:.04em">Gratis · tanpa akun · tanpa server · tanpa iklan · Android 6.0+</div>`);
    show(fine, 30.5, null); cue(30.5, 'shimmer');

    // ───────────────────────── Cursor ("Kamu") ─────────────────────────
    const cur = add(`<div class="cur"><svg viewBox="0 0 24 24"><path d="M4 2.5 20 11l-7 1.8L9.6 20z" fill="#f2edd5" stroke="#04140a" stroke-width="1.6" stroke-linejoin="round"/></svg><span class="pill">Kamu</span></div>`);
    const rip = add('<div class="rip"></div>');
    const CX = new Track(1660), CYt = new Track(930), CO = new Track(0);
    const mv = (t, x, y, sp = SP.cursor) => { CX.to(t, x, sp); CYt.to(t, y, sp); };
    const clicks = [CARI, CEK, HOLD, GO, CTA];
    CO.to(3.75, 1, SP.text);
    mv(4.25, 1335, 590);                       // logo disc: search
    mv(5.375, 1660, 930, SP.soft);
    mv(7.875, 1330, CT + 840 - 44 - 42 + 6);   // "Cek kondisi"
    mv(8.875, 1820, 930, SP.soft);
    mv(11.875, 1330, 585);                     // hold to talk
    mv(14.875, 1660, 930, SP.soft);
    mv(18.875, 1780 - 90 - 140, ST + 860 - 80 - 40);   // Arahkan ke Nenek
    mv(19.875, 1660, 1000, SP.soft);
    CO.to(20.125, 0, SP.text);
    mv(28.75, 1600, 980, SP.snap); CO.to(29.0, 1, SP.text);
    mv(29.375, 990, 795);                      // CTA
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
      const z = Math.exp(CAM.z.at(t)), zx = CAM.zx.at(t), zy = CAM.zy.at(t), [qx, qy] = quake(t);
      world.style.transform = `translate(${(zx + qx).toFixed(2)}px, ${(zy + qy).toFixed(2)}px) scale(${z.toFixed(5)}) translate(${(-zx).toFixed(2)}px, ${(-zy).toFixed(2)}px)`;
      hud.style.transform = `translate(${(qx * 0.5).toFixed(2)}px, ${(qy * 0.5).toFixed(2)}px)`;
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
