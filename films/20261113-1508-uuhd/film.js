// Saling Jaga · "No bars. Still together." Portrait 1080×1920, 120 BPM, 32 s.
// One shape, never cut: status pill (signal dies) → "No ___" strike pill → logo disc (find phones)
// → range card (drag the slider: 50–100 m → +1 phone → 1–3 km → km+) → feature card with liquid tabs
// (Talk · Chat · Map) → volume ×5 counter → SOS card (drop, pull back to a wall of ringing phones)
// → "be found" toggles (siren, flashlight, big buttons) → logo disc + tagline → CTA pill.
(async function () {
  try {
    const { clamp, lerp, stepR, Track, ColorTrack, SP, vis, applyVis, press, ripple } = M;
    const C = { night: '#07110c', card: '#0f1f17', card2: '#13271d', cream: '#f2edd5', paper: '#f6f4ea', muted: '#a5b0a2',
      dim: '#6f7c6f', ink: '#1c2a21', grey: '#6b7469', leaf: '#3cbf6e', leafInk: '#04140a', moss: '#1b4d2e',
      lamp: '#f2c46b', sos: '#ef4b4b', budi: '#e8590c', rt: '#1e7a45', sari: '#d6336c', line: '#e4e1d3', sky: '#3b82c4' };

    await Promise.all([
      document.fonts.load('800 100px "Plus Jakarta Sans"'), document.fonts.load('500 40px "Plus Jakarta Sans"'),
      document.fonts.load('700 38px "Plus Jakarta Sans"'), document.fonts.load('600 38px "Plus Jakarta Sans"'),
      document.fonts.load('600 30px "JetBrains Mono"'), document.fonts.load('700 40px "JetBrains Mono"'),
      document.fonts.load('italic 400 100px "Instrument Serif"'),
    ].map((p) => p.catch(() => null)));
    await document.fonts.ready;
    const logo = new Image(); logo.src = 'assets/mark.png';
    await new Promise((r) => { if (logo.complete) r(); logo.onload = r; logo.onerror = r; });

    const cues = [];
    const cue = (t, k, o = {}) => cues.push({ t, k, ...o });
    const world = document.getElementById('world');
    const hud = document.getElementById('hud');
    const redL = document.getElementById('red'), lampL = document.getElementById('lamp'), scrim = document.getElementById('scrim');
    const draws = [];
    const add = (html, parent = hud) => { const d = document.createElement('div'); d.innerHTML = html.trim(); const e = d.firstElementChild; parent.appendChild(e); return e; };
    const W = (html) => add(html, world);
    const at = (e, x, y) => { e.style.left = x.toFixed(2) + 'px'; e.style.top = y.toFixed(2) + 'px'; return e; };
    const rect = (e, x, y, w, h) => { at(e, x, y); e.style.width = Math.max(0, w).toFixed(2) + 'px'; e.style.height = Math.max(0, h).toFixed(2) + 'px'; };
    const ctr = (e, cx, cy) => at(e, cx - e.offsetWidth / 2, cy - e.offsetHeight / 2);
    const show = (e, tin, tout, extra = '') => draws.push((t) => applyVis(e, vis(t, tin, tout), typeof extra === 'function' ? extra(t) : extra));
    const popS = (t, tin, s0 = 0.5) => s0 + (1 - s0) * stepR(t - tin, SP.pop);
    const bump = (t, tc, a = 0.06, d = 0.08) => 1 + a * Math.exp(-(((t - tc) / d) ** 2));
    const P = (d, sw = 2.2) => `<svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
    const I = {
      mic: P('<rect x="9" y="2.5" width="6" height="11.5" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0"/><path d="M12 17.5V21"/>'),
      check: P('<path d="M20 6 9 17l-5-5"/>', 3),
      arrow: P('<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>', 2.6),
      lock: P('<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>'),
      nav: P('<path d="M12 2 19 21l-7-4-7 4z"/>', 2.2),
      bat: P('<rect x="2.5" y="7" width="17" height="10" rx="2"/><path d="M22 10.5v3"/><path d="M5 10v4" stroke-width="3"/>'),
      med: P('<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M12 9v6M9 12h6"/>'),
      siren: P('<path d="M6 18v-6a6 6 0 0 1 12 0v6"/><path d="M4 18h16v3H4z"/><path d="M12 2v2M4.2 5.2l1.4 1.4M19.8 5.2l-1.4 1.4"/>'),
      torch: P('<path d="M8 2h8v5l-2 3v12h-4V10L8 7z"/><path d="M12 13v2"/>'),
      big: P('<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>'),
      chat: P('<path d="M4 5h16v11H9l-5 4z"/>'),
      map: P('<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/>'),
      vol: P('<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M17 9.5a4 4 0 0 1 0 5"/>'),
      phone: P('<rect x="6" y="2" width="12" height="20" rx="3"/><path d="M11 18h2"/>'),
      ant: P('<path d="M12 9v13M8 22h8"/><path d="M8.5 5.5a5 5 0 0 0 0 7M15.5 5.5a5 5 0 0 1 0 7M5.5 3a9 9 0 0 0 0 12M18.5 3a9 9 0 0 1 0 12"/>'),
      post: P('<path d="M3 11 12 4l9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-5h4v5"/>'),
      nosig: P('<path d="M4 20v-2M9 20v-5M14 20v-8M19 20V7" opacity=".4"/><path d="m3 3 18 18"/>', 2.4),
    };
    const ico = (k, s, col = 'currentColor', st = '') => `<span class="ic" style="width:${s}px;height:${s}px;color:${col};${st}">${I[k]}</span>`;

    const SX = 540, SY = 1170;

    // ───────────────────────── Camera ─────────────────────────
    const CAM = { z: new Track(Math.log(1.06)) };
    const cam = (t, z, sp = SP.cam) => CAM.z.to(t, Math.log(z), sp);
    cam(0.0, 1.0);
    cam(3.5, 1.05); cam(6.5, 1.0);
    cam(8.0, 1.04); cam(10.5, 0.97, { w: 4, z: 1 }); cam(11.75, 1.0);
    cam(15.0, 1.08, { w: 4, z: 1 }); cam(15.875, 1.0, { w: 14, z: 0.85 });
    cam(17.25, 0.36, { w: 6, z: 1 }); cam(19.0, 1.0, { w: 7, z: 1 });
    cam(22.375, 1.0); cam(24.0, 1.08, { w: 14, z: 0.85 }); cam(25.0, 1.0, { w: 4, z: 1 });
    cam(28.0, 1.03); cam(30.0, 1.0);
    const shake = (t) => {
      let x = 0, y = 0;
      for (const [tb, a] of [[16.0, 18], [24.0, 8]]) { const h = t - tb; if (h > 0 && h < 0.6) { x += a * Math.exp(-h * 8) * Math.sin(h * 70); y += a * 0.5 * Math.exp(-h * 8) * Math.sin(h * 53); } }
      return [x, y];
    };
    const camZ = (t) => Math.exp(CAM.z.at(t));
    const toS = (x, y, t) => { const z = camZ(t), [qx, qy] = shake(t); return [SX + (x - SX) * z + qx, SY + (y - SY) * z + qy]; };

    // ───────────────────────── Weather: rain + washes ─────────────────────────
    const rainSvg = document.getElementById('rain');
    const NS = 'http://www.w3.org/2000/svg';
    let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const drops = [...Array(46)].map(() => { const l = document.createElementNS(NS, 'line'); l.setAttribute('stroke', C.cream); l.setAttribute('stroke-width', (1.5 + rnd() * 2).toFixed(1)); l.setAttribute('stroke-linecap', 'round'); rainSvg.appendChild(l); return { l, x: rnd() * 1180 - 50, y0: rnd() * 2200, v: 1500 + rnd() * 900, len: 40 + rnd() * 70, a: 0.06 + rnd() * 0.12 }; });
    draws.push((t) => {
      const amt = 1 - 0.6 * clamp((t - 24) / 1.5);
      drops.forEach((d) => {
        const y = ((d.y0 + t * d.v) % 2200) - 140, x = d.x - (y + 140) * 0.12;
        d.l.setAttribute('x1', x.toFixed(1)); d.l.setAttribute('y1', y.toFixed(1));
        d.l.setAttribute('x2', (x - d.len * 0.12).toFixed(1)); d.l.setAttribute('y2', (y + d.len).toFixed(1));
        d.l.setAttribute('opacity', (d.a * amt).toFixed(3));
      });
      // red: signal dies (dim), SOS beats (strong), siren pulses (soft)
      let r = 0.14 * clamp((t - 2.0) / 0.2) * clamp((3.75 - t) / 0.4);
      for (const tb of [16, 16.5, 17, 17.5, 18, 18.5, 19]) { const d = t - tb; if (d >= 0) r = Math.max(r, (tb === 16 ? 1 : 0.7) * Math.exp(-d * 3)); }
      r *= clamp((19.75 - t) / 0.4);
      for (const tb of [20.5, 21.0, 21.5, 22.0, 22.5, 23.0]) { const d = t - tb; if (d >= 0 && d < 0.5) r = Math.max(r, 0.35 * Math.exp(-d * 6)); }
      r *= clamp((23.75 - t) / 0.3);
      redL.style.opacity = r.toFixed(3);
      lampL.style.opacity = Math.max(stepR(t - 21.5, { w: 9, z: 1 }) * clamp((24.0 - t) / 0.5) * 0.9, stepR(t - 24.0, { w: 3, z: 1 })).toFixed(3);
      scrim.style.opacity = (stepR(t - 17.0, { w: 8, z: 1 }) * clamp((19.5 - t) / 0.5)).toFixed(3);
    });

    // ───────────────────────── SVG layer (under the shape) ─────────────────────────
    const svg = W(`<svg width="1080" height="1920" viewBox="0 0 1080 1920" style="left:0;top:0;overflow:visible"></svg>`);
    const sv = (tag, attrs, parent = svg) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); parent.appendChild(e); return e; };
    const ringsAt = (tbs, r0, grow, col) => tbs.map((tb) => ({ tb, e: sv('circle', { cx: SX, cy: SY, r: r0, fill: 'none', stroke: col, 'stroke-width': 4 }), r0, grow }));
    const rings = [...ringsAt([7.0, 7.5], 190, 380, C.leaf)];
    draws.push((t) => rings.forEach(({ tb, e, r0, grow }) => {
      const x = (t - tb) / 1.4;
      if (x < 0 || x > 1) { e.setAttribute('opacity', 0); return; }
      e.setAttribute('r', (r0 + grow * (1 - Math.pow(1 - x, 3))).toFixed(1));
      e.setAttribute('opacity', (0.6 * (1 - x)).toFixed(3));
    }));

    // the wall of ringing phones (revealed by the pull-back at the drop)
    const TILES = [];
    const names = ['252 m', '259 m', '470 m'];
    for (let ry = -3; ry <= 2; ry++) for (let rx = -1; rx <= 1; rx++) {
      if (rx === 0 && ry === 0) continue;
      const e = W(`<div style="width:940px;height:900px;border-radius:64px;background:${C.sos};display:flex;flex-direction:column;justify-content:center;gap:30px;padding:0 70px;color:#fff">
        <b class="mono" style="font:700 64px/1 'JetBrains Mono';letter-spacing:.14em">SOS</b>
        <b style="font:800 120px/1 'Plus Jakarta Sans';letter-spacing:-.04em">Rina</b>
        <b class="mono" style="font:700 80px/1 'JetBrains Mono';opacity:.85">${names[(rx + 3 + ry * 2 + 9) % 3]}</b></div>`);
      const cx = SX + rx * 1010, cy = SY + ry * 990;
      at(e, cx - 470, cy - 450);
      const tb = 17.25 + ((Math.abs(rx) + Math.abs(ry)) % 3) * 0.125;
      TILES.push({ e, tb });
      draws.push((t) => {
        const v = vis(t, tb, 18.875, 0.3);
        let s = popS(t, tb, 0.7);
        for (const tc of [18.0, 18.5, 19.0]) s *= bump(t, tc, 0.05, 0.09);
        applyVis(e, v, `scale(${s.toFixed(4)})`);
      });
    }

    // ───────────────────────── The one shape ─────────────────────────
    const body = W('<div style="box-shadow:0 30px 80px rgba(0,0,0,.35)"></div>');
    const PB = { l: new Track(SX - 330), t: new Track(SY - 70), r: new Track(SX + 330), b: new Track(SY + 70), rad: new Track(70), col: new ColorTrack(C.card2) };
    // leading/trailing edges: the edge in the direction of growth runs on a stiffer spring
    const pm = (t, w, h, rad, col, sp = SP.shape, cy = SY) => {
      const soft = { w: sp.w * 0.78, z: Math.min(1, sp.z + 0.08) };
      const L = SX - w / 2, R = SX + w / 2, T = cy - h / 2, B = cy + h / 2;
      PB.l.to(t, L, L < PB.l.cur ? sp : soft); PB.r.to(t, R, R > PB.r.cur ? sp : soft);
      PB.t.to(t, T, T < PB.t.cur ? sp : soft); PB.b.to(t, B, B > PB.b.cur ? sp : soft);
      PB.rad.to(t, rad, sp);
      if (col) PB.col.to(t, col, SP.soft);
    };
    const TAP = 7.0, GRAB = 8.5, LET = 11.25, TAB1 = 13.0, TAB2 = 14.0, NAV = 19.0, TG1 = 20.5, TG2 = 21.5, TG3 = 22.5, CTA = 29.5;
    pm(0.0, 660, 140, 70, C.card2);
    pm(3.375, 860, 170, 85, C.cream);
    pm(6.375, 380, 380, 190, C.cream, { w: 20, z: 0.8 });
    pm(7.875, 920, 660, 52, C.card2);
    pm(11.875, 900, 800, 52, C.paper);
    pm(14.875, 760, 210, 105, C.card2, { w: 20, z: 0.8 });
    pm(15.875, 940, 900, 64, C.sos, { w: 24, z: 0.78 });
    pm(19.875, 900, 700, 52, C.paper);
    pm(TG3 + 0.06, 980, 800, 60, C.paper, { w: 20, z: 0.78 });
    pm(23.875, 420, 420, 210, C.cream, { w: 20, z: 0.8 });
    pm(27.875, 820, 180, 90, C.leaf);
    const bodyHits = [TAP, TAB1, TAB2, 24.0];
    draws.push((t) => {
      const l = PB.l.at(t), tp = PB.t.at(t), r = PB.r.at(t), b = PB.b.at(t);
      rect(body, l, tp, r - l, b - tp);
      body.style.borderRadius = Math.min(PB.rad.at(t), (r - l) / 2, (b - tp) / 2).toFixed(2) + 'px';
      body.style.background = PB.col.at(t);
      let s = popS(t, 0, 0.3);
      for (const tc of bodyHits) s *= 1 - 0.035 * Math.exp(-(((t - tc) / 0.08) ** 2));
      for (const tc of [4.0, 4.5, 5.0, 5.5, 6.0]) s *= bump(t, tc + 0.03, 0.025, 0.07);
      for (const tc of [15.0, 15.25, 15.5, 15.625, 15.75]) s *= 1 - 0.03 * Math.exp(-(((t - tc) / 0.05) ** 2));
      for (const tc of [16.5, 17.0, 17.5, 18.0, 18.5, 19.0]) s *= bump(t, tc, 0.02, 0.09);
      s *= 1 - 0.4 * (1 - press(t, CTA));
      body.style.transform = `scale(${s.toFixed(4)})`;
    });

    // ───────────────────────── Headlines (screen space) ─────────────────────────
    const HX = 76, HY = 170;
    const block = (lbl, head, sub, tin, tout, lblCol) => {
      const e = add(`<div style="left:${HX}px;top:${HY}px;display:flex;flex-direction:column;gap:30px">
        ${lbl ? `<div class="lbl"${lblCol ? ` style="color:${lblCol}"` : ''}>${lbl}</div>` : ''}<div class="head">${head}</div>${sub ? `<div class="sub">${sub}</div>` : ''}</div>`);
      show(e, tin, tout); return e;
    };
    block('21:47 · Flood warning', 'The towers go <span class="serif">dark.</span>', 'And every phone goes quiet.', 0.25, 3.25);
    block('Saling Jaga', 'Needs <span class="serif">none</span> of it.', '', 3.5, 6.25);
    block('Wi‑Fi Direct', 'Phones talk to <span class="serif">phones.</span>', 'Tap once. Everyone nearby joins.', 6.5, 7.75);
    block('Range', 'From one alley to one <span class="serif">valley.</span>', '', 8.0, 11.75);
    block('In the app', 'Everything the group <span class="serif">needs.</span>', '', 12.0, 14.75);
    block('Hands shaking?', 'Press volume <span class="serif">five times.</span>', '', 15.0, 15.875);
    block('SOS', 'Every phone in the group <span class="serif" style="color:#ff8a8a">rings.</span>', '', 16.125, 19.625, '#ff7a7a');
    block('Be found', 'Loud. Bright. <span class="serif">Big.</span>', 'Siren, flashlight, and a large-button mode for elders.', 20.0, 23.75);
    block('', 'When the signal’s gone, we still <span class="serif">look out for each other.</span>', '', 24.125, 27.75);
    block('Free for residents · forever', 'Be ready <span class="serif">before</span> it happens.', 'No ads. No accounts. No servers.', 28.0, null);

    // ───────────────────────── S0 · status pill: the signal dies ─────────────────────────
    const s0a = W(`<div style="width:660px;height:140px;display:flex;align-items:center;justify-content:space-between;padding:0 56px">
      <span class="mono" style="font:700 52px/1 'JetBrains Mono';color:${C.cream}">21:47</span>
      <span style="display:flex;align-items:flex-end;gap:10px;height:56px">${[20, 30, 42, 56].map((h) => `<i style="display:block;width:14px;height:${h}px;border-radius:4px;background:${C.cream}"></i>`).join('')}
      <b style="font:800 36px/1 'Plus Jakarta Sans';margin-left:12px;align-self:center">4G</b></span></div>`);
    ctr(s0a, SX, SY); show(s0a, 0.125, 2.0);
    const barEls = [...s0a.querySelectorAll('i')], b4g = s0a.querySelector('b');
    draws.push((t) => {
      barEls.forEach((b, i) => { const tk = 1.0 + (3 - i) * 0.25; b.style.opacity = t < tk ? 1 : 0.16; b.style.transform = `scaleY(${t < tk ? 1 : 0.85})`; });
      b4g.style.opacity = t < 1.75 ? 1 : 0.2;
    });
    [1.0, 1.25, 1.5, 1.75].forEach((tt) => cue(tt, 'tick'));
    cue(1.0, 'slam', { n: 0 });
    const s0b = W(`<div style="width:660px;height:140px;display:flex;align-items:center;justify-content:center;gap:22px;color:#ff8a8a">
      ${ico('nosig', 58)}<span style="font:800 50px/1 'Plus Jakarta Sans';letter-spacing:-.02em">No service</span></div>`);
    ctr(s0b, SX, SY); show(s0b, 2.125, 3.25);
    cue(2.0, 'alert');

    // ───────────────────────── S1 · strike pill: No SIM / data / towers / server / account ─────────────────────────
    const NOS = ['No SIM', 'No data plan', 'No towers', 'No server', 'No account'];
    NOS.forEach((w, i) => {
      const e = W(`<div style="width:860px;height:170px;display:flex;align-items:center;justify-content:center;gap:24px">
        <span style="position:relative;font:800 74px/1 'Plus Jakarta Sans';letter-spacing:-.035em;color:${C.ink};white-space:nowrap">${w}
          <i style="position:absolute;left:-10px;right:-10px;top:52%;height:9px;border-radius:5px;background:${C.sos};transform-origin:0 50%;display:block"></i></span>
        <span class="mono" style="font:700 34px/1 'JetBrains Mono';color:${C.grey}">${i + 1}/5</span></div>`);
      ctr(e, SX, SY);
      const TIN = [3.625, 4.5, 5.0, 5.5, 6.0];
      const tin = TIN[i], tout = i === 4 ? 6.375 : TIN[i + 1] - 0.05;
      show(e, tin, tout);
      const strike = e.querySelector('i');
      const ts = i === 0 ? 4.0 : tin + 0.25;
      draws.push((t) => { strike.style.transform = `scaleX(${stepR(t - ts, { w: 30, z: 1 }).toFixed(4)})`; });
      if (i > 0) cue(tin, 'swap', { n: i });
      cue(ts, 'slam', { n: i % 4 });
    });

    // ───────────────────────── S1b · logo disc: tap to connect ─────────────────────────
    const s1 = W(`<div style="width:320px;height:320px"><img src="assets/mark.png" style="width:320px;height:320px;display:block"></div>`);
    ctr(s1, SX, SY); show(s1, 6.5, 7.75, (t) => `scale(${(popS(t, 6.5, 0.7) * press(t, TAP)).toFixed(4)})`);
    cue(6.5, 'born'); cue(TAP, 'click'); cue(7.0, 'note', { n: 0 }); cue(7.5, 'note', { n: 2 });
    // phone dots join around the disc
    const JOIN = [{ a: 200, tb: 7.125 }, { a: 330, tb: 7.25 }, { a: 30, tb: 7.375 }, { a: 150, tb: 7.5 }, { a: 270, tb: 7.625 }];
    JOIN.forEach((p, i) => {
      const x = SX + 330 * Math.cos(p.a * Math.PI / 180), y = SY + 330 * Math.sin(p.a * Math.PI / 180);
      const e = W(`<div class="av" style="width:96px;height:96px;background:${C.card2};border:4px solid ${C.leaf};color:${C.leaf}">${ico('phone', 46)}</div>`);
      ctr(e, x, y); show(e, p.tb, 7.75, (t) => `scale(${popS(t, p.tb, 0.4).toFixed(4)})`);
      cue(p.tb, 'pop', { n: i });
    });

    // ───────────────────────── S2 · range card + slider (drag) ─────────────────────────
    const RT = SY - 330, RB = SY + 330, DCY = RT + 178;           // diagram centre
    const TRK_L = SX - 360, TRK_R = SX + 360, TRK_Y = RB - 110;
    const STOPX = [0, 1, 2, 3].map((i) => TRK_L + (TRK_R - TRK_L) * i / 3);
    const STG = [8.0, 9.0, 10.0, 11.0];                           // stage starts
    const RANGE = [
      ['50–100 m', 'Phone to phone'], ['+1 phone', 'A middle phone relays'], ['1–3 km', 'Wi‑Fi at a command post'], ['km+', 'LoRa Meshtastic gateways'],
    ];
    // diagram: 8 nodes morphing between layouts (dx, dy, kind) — kind 0 phone, 1 post/antenna
    const ring = (n, r, cx, a0 = -90) => [...Array(n)].map((_, i) => [cx + r * Math.cos((a0 + i * 360 / n) * Math.PI / 180), r * Math.sin((a0 + i * 360 / n) * Math.PI / 180)]);
    const r2 = ring(6, 100, 0), rl = ring(3, 84, -270, -30), rr = ring(3, 84, 270, 150);
    const LAY = [
      { p: [[-170, 0], [170, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0]], o: [1, 1, 0, 0, 0, 0, 0, 0], links: [[0, 1]] },
      { p: [[-300, 0], [0, 0], [300, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0]], o: [1, 1, 1, 0, 0, 0, 0, 0], links: [[0, 1], [1, 2]] },
      { p: [r2[0], r2[1], r2[2], [0, 0], r2[3], r2[4], r2[5], [0, 0]], o: [1, 1, 1, 1, 1, 1, 1, 0], links: [[3, 0], [3, 1], [3, 2], [3, 4], [3, 5], [3, 6]] },
      { p: [rl[0], rl[1], rl[2], [-270, 0], rr[0], rr[1], rr[2], [270, 0]], o: [1, 1, 1, 1, 1, 1, 1, 1], links: [[3, 0], [3, 1], [3, 2], [7, 4], [7, 5], [7, 6], [3, 7]] },
    ];
    const ALL_LINKS = [];
    LAY.forEach((L, si) => L.links.forEach(([a, b]) => { if (!ALL_LINKS.find((k) => k.a === a && k.b === b)) ALL_LINKS.push({ a, b, st: [] }); ALL_LINKS.find((k) => k.a === a && k.b === b).st.push(si); }));
    const dg = sv('g', {});
    const linkEls = ALL_LINKS.map((k) => ({ ...k, e: sv('line', { stroke: C.leaf, 'stroke-width': 4, 'stroke-dasharray': '10 12', opacity: 0 }, dg) }));
    const NX = [...Array(8)].map((_, i) => new Track(SX + LAY[0].p[i][0]));
    const NY = [...Array(8)].map((_, i) => new Track(DCY + LAY[0].p[i][1]));
    const NO = [...Array(8)].map((_, i) => new Track(LAY[0].o[i]));
    LAY.forEach((L, si) => { if (si === 0) return; L.p.forEach(([x, y], i) => { NX[i].to(STG[si], SX + x, SP.shape); NY[i].to(STG[si], DCY + y, SP.shape); NO[i].to(STG[si], L.o[i], SP.text); }); });
    const nodeEls = [...Array(8)].map((_, i) => {
      const hub = i === 3 || i === 7;
      const e = W(`<div class="av" style="width:${hub ? 100 : 76}px;height:${hub ? 100 : 76}px;background:${hub ? C.lamp : C.card};border:4px solid ${hub ? C.lamp : C.leaf};color:${hub ? C.leafInk : C.leaf}">
        <span class="ic" style="width:${hub ? 54 : 38}px;height:${hub ? 54 : 38}px;position:absolute">${I.post}</span></div>`);
      return { e, hub };
    });
    // hubs switch icon from post to antenna on the last stage
    const antEls = [3, 7].map((i) => { const a = add(`<span class="ic" style="width:54px;height:54px;position:absolute;opacity:0">${I.ant}</span>`, nodeEls[i].e); return { a, post: nodeEls[i].e.firstElementChild }; });
    nodeEls.forEach((n, i) => { if (!n.hub) n.e.firstElementChild.innerHTML = I.phone; });
    const RW = [7.875, 11.75];
    draws.push((t) => {
      const on = t >= RW[0] + 0.1 && t < RW[1] + 0.2;
      const g = vis(t, RW[0] + 0.125, RW[1], 0.15);
      nodeEls.forEach((n, i) => {
        const x = NX[i].at(t), y = NY[i].at(t), o = clamp(NO[i].at(t)) * g.o;
        ctr(n.e, x, y); n.e.style.opacity = on ? o.toFixed(3) : 0;
        n.e.style.transform = `scale(${(0.6 + 0.4 * clamp(NO[i].at(t))).toFixed(3)})`;
        n.e.style.filter = g.b > 0.05 ? `blur(${g.b.toFixed(2)}px)` : 'none';
      });
      antEls.forEach(({ a, post }) => { const k = stepR(t - 11.0, SP.text); a.style.opacity = k.toFixed(3); post.style.opacity = (1 - k).toFixed(3); });
      linkEls.forEach((k) => {
        const si = STG.filter((s) => t >= s).length - 1;
        let o = 0;
        k.st.forEach((s) => { const a = stepR(t - STG[s] - 0.15, { w: 14, z: 1 }), b = s < 3 ? clamp((t - STG[s + 1]) / 0.12) : 0; if (si >= s) o = Math.max(o, a * (1 - b)); });
        o *= on ? g.o : 0;
        k.e.setAttribute('x1', NX[k.a].at(t).toFixed(1)); k.e.setAttribute('y1', NY[k.a].at(t).toFixed(1));
        k.e.setAttribute('x2', NX[k.b].at(t).toFixed(1)); k.e.setAttribute('y2', NY[k.b].at(t).toFixed(1));
        k.e.setAttribute('opacity', (0.75 * o).toFixed(3));
        k.e.setAttribute('stroke', k.a === 3 && k.b === 7 ? C.lamp : C.leaf);
        k.e.setAttribute('stroke-dashoffset', (-t * 70).toFixed(1));
      });
    });
    // put the diagram SVG group above the card: move svg after body later (see z-order fix below)
    // readouts
    RANGE.forEach(([big, small], i) => {
      const e = W(`<div style="width:880px;display:flex;flex-direction:column;align-items:center;gap:14px">
        <span class="mono" style="font:700 112px/1 'JetBrains Mono';letter-spacing:-.05em;color:${C.cream};white-space:nowrap">${big}</span>
        <span style="font:700 40px/1 'Plus Jakarta Sans';color:${C.muted};white-space:nowrap">${small}</span></div>`);
      ctr(e, SX, RT + 420);
      const tin = i === 0 ? 8.125 : STG[i] + 0.04, tout = i === 3 ? RW[1] : STG[i + 1] - 0.04;
      show(e, tin, tout);
      if (i > 0) { cue(STG[i], 'tick'); cue(STG[i], 'swap', { n: i + 1 }); }
    });
    // slider
    const trk = W(`<div style="width:${TRK_R - TRK_L + 36}px;height:14px;border-radius:7px;background:rgba(242,237,213,.14)"></div>`);
    at(trk, TRK_L - 18, TRK_Y - 7); show(trk, 8.25, RW[1]);
    const fill = W(`<div style="height:14px;border-radius:7px;background:${C.leaf}"></div>`);
    const stopEls = STOPX.map((x) => { const e = W(`<div style="width:22px;height:22px;border-radius:11px;background:${C.card2};border:4px solid rgba(242,237,213,.4)"></div>`); ctr(e, x, TRK_Y); show(e, 8.25, RW[1]); return e; });
    const knob = W(`<div style="width:64px;height:64px;border-radius:32px;background:${C.cream};box-shadow:0 6px 16px rgba(0,0,0,.4)"></div>`);
    const stopLbl = W(`<div class="mono" style="width:${TRK_R - TRK_L + 120}px;display:flex;justify-content:space-between;font:700 26px/1 'JetBrains Mono';color:${C.dim};letter-spacing:.06em">
      <span>ALLEY</span><span>STREET</span><span>VILLAGE</span><span>VALLEY</span></div>`);
    at(stopLbl, TRK_L - 60, TRK_Y + 46); show(stopLbl, 8.375, RW[1]);

    // ───────────────────────── Cursor ("You") tracks ─────────────────────────
    const CX = new Track(780), CYt = new Track(1720), CO = new Track(0);
    const mv = (t, x, y, sp = SP.cursor) => { CX.to(t, x, sp); CYt.to(t, y, sp); };
    CO.to(6.25, 1, SP.text);
    mv(6.375, SX + 40, SY + 50);                  // tap the logo disc
    mv(7.5, 820, 1560, SP.soft);
    mv(8.0, STOPX[0] + 6, TRK_Y + 10);            // grab the knob
    mv(8.625, STOPX[1] + 6, TRK_Y + 10, { w: 9, z: 0.95 });
    mv(9.625, STOPX[2] + 6, TRK_Y + 10, { w: 9, z: 0.95 });
    mv(10.625, STOPX[3] + 10, TRK_Y + 10, { w: 9, z: 0.95 });
    mv(LET + 0.25, 860, 1700, SP.soft);
    const TABX = (i) => 120 + 30 + i * 280 + 140 - 30;          // tab centres (card left 90 + pad)
    const CT3 = SY - 400;                                         // feature card top
    mv(12.375, TABX(1), CT3 + 80);
    mv(13.375, TABX(2), CT3 + 80);
    mv(14.25, 900, 1760, SP.soft);
    CO.to(14.5, 0, SP.text);
    CO.to(20.0, 1, SP.text);
    const TGX = SX + 335, ROW0 = SY - 350 + 40 + 105, ROWH = 210;
    mv(19.5, 860, 1700, SP.snap);
    mv(20.0, TGX + 10, ROW0 + 10);
    mv(21.0, TGX + 10, ROW0 + ROWH + 10);
    mv(22.0, TGX + 10, ROW0 + 2 * ROWH + 10);
    mv(23.0, 880, 1760, SP.soft);
    CO.to(23.5, 0, SP.text);
    CO.to(28.25, 1, SP.text);
    mv(28.0, 860, 1700, SP.snap);
    mv(28.75, SX + 120, SY + 30);
    mv(30.25, 820, 1560, SP.soft);

    // knob: direct manipulation while held, spring home after release
    const KHOME = new Track(STOPX[0]).to(LET, STOPX[3], { w: 16, z: 0.8 });
    const knobX = (t) => t >= GRAB && t < LET ? clamp(CX.at(t) - 6, TRK_L, TRK_R) : (t < GRAB ? STOPX[0] : (() => {
      const xr = clamp(CX.at(LET) - 6, TRK_L, TRK_R); return STOPX[3] + (xr - STOPX[3]) * (1 - stepR(t - LET, { w: 16, z: 0.8 }));
    })());
    const kG = (t) => vis(t, 8.25, RW[1]);
    draws.push((t) => {
      const x = knobX(t), g = kG(t);
      const held = t >= GRAB && t < LET ? 1 : 0;
      ctr(knob, x, TRK_Y);
      applyVis(knob, g, `scale(${(press(t, GRAB) * (1 + 0.12 * held * clamp((t - GRAB) / 0.1))).toFixed(4)})`);
      rect(fill, TRK_L - 18, TRK_Y - 7, x - TRK_L + 18, 14); applyVis(fill, g);
      stopEls.forEach((s, i) => { s.style.borderColor = x >= STOPX[i] - 4 ? C.leaf : 'rgba(242,237,213,.4)'; s.style.background = x >= STOPX[i] - 4 ? C.leaf : C.card2; });
    });
    cue(GRAB, 'click'); cue(GRAB, 'drag', { d: LET - GRAB }); cue(LET, 'release'); cue(11.5, 'settle');
    cue(8.0, 'swap', { n: 0 }); cue(8.0, 'whoosh', { v: 0.6 });

    // ───────────────────────── S3 · feature card with liquid tabs ─────────────────────────
    const CL3 = SX - 450;
    const tabBar = W(`<div style="width:840px;height:110px;border-radius:55px;background:#ebe7d8"></div>`);
    at(tabBar, CL3 + 30, CT3 + 30); show(tabBar, 12.125, 14.75);
    const ind = W(`<div style="height:94px;border-radius:47px;background:${C.ink}"></div>`);
    const IL = new Track(CL3 + 38).to(TAB1, CL3 + 38 + 280, { w: 15, z: 0.9 }).to(TAB2, CL3 + 38 + 560, { w: 15, z: 0.9 });
    const IR = new Track(CL3 + 38 + 264).to(TAB1, CL3 + 38 + 544, { w: 30, z: 0.85 }).to(TAB2, CL3 + 38 + 824, { w: 30, z: 0.85 });
    draws.push((t) => { rect(ind, IL.at(t), CT3 + 38, IR.at(t) - IL.at(t), 94); applyVis(ind, vis(t, 12.25, 14.75)); });
    const TABS = [['mic', 'Talk'], ['chat', 'Chat'], ['map', 'Map']];
    TABS.forEach(([ic, nm], i) => {
      const e = W(`<div style="width:280px;height:110px;display:flex;align-items:center;justify-content:center;gap:14px;font:800 40px/1 'Plus Jakarta Sans'">${ico(ic, 40)}${nm}</div>`);
      at(e, CL3 + 30 + i * 280, CT3 + 30); show(e, 12.25, 14.75);
      const ton = [12.0, TAB1, TAB2][i], toff = [TAB1, TAB2, 99][i];
      draws.push((t) => { const a = clamp((i === 0 ? 1 : stepR(t - ton, SP.text)) - stepR(t - toff, SP.text)); e.style.color = M.mix(C.grey, C.cream, a); });
    });
    cue(12.0, 'swap', { n: 2 }); cue(TAB1, 'click'); cue(TAB1, 'swap', { n: 3 }); cue(TAB2, 'click'); cue(TAB2, 'swap', { n: 4 });
    const CTOP = CT3 + 170;   // content top
    // Talk
    const talk = W(`<div style="width:900px;height:600px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:34px">
      <span class="av" style="width:220px;height:220px;background:${C.leaf};color:${C.leafInk}">${ico('mic', 104)}</span>
      <span id="wv" style="display:flex;align-items:center;gap:10px;height:70px">${[...Array(17)].map(() => `<i style="display:block;width:14px;border-radius:7px;background:${C.rt}"></i>`).join('')}</span>
      <span style="font:800 46px/1 'Plus Jakarta Sans';color:${C.ink};letter-spacing:-.02em">Hold to talk to everyone</span></div>`);
    at(talk, CL3, CTOP); show(talk, 12.25, TAB1 - 0.06);
    const wv = [...talk.querySelectorAll('#wv i')];
    draws.push((t) => wv.forEach((e, i) => { const a = 0.2 + 0.8 * Math.abs(Math.sin(t * 9.1 + i * 0.85) * Math.sin(t * 3.7 + i * 0.41)); e.style.height = (10 + 58 * a).toFixed(1) + 'px'; }));
    const talkRing = W(`<div style="width:220px;height:220px;border-radius:110px;border:5px solid ${C.leaf}"></div>`);
    draws.push((t) => { const x = ((t - 12.25) % 0.5) / 0.5; ctr(talkRing, SX, CTOP + 208); const on = t > 12.3 && t < TAB1 - 0.06; talkRing.style.opacity = on ? (0.6 * (1 - x)).toFixed(3) : 0; talkRing.style.transform = `scale(${(1 + 0.45 * x).toFixed(3)})`; });
    // Chat
    const bub = (who, col, txt, me) => `<div style="align-self:${me ? 'flex-end' : 'flex-start'};max-width:680px;padding:24px 30px;border-radius:${me ? '32px 32px 10px 32px' : '32px 32px 32px 10px'};background:${me ? C.rt : '#fff'};border:${me ? 'none' : `2px solid ${C.line}`};display:flex;flex-direction:column;gap:10px">
      ${who ? `<b style="font:700 30px/1 'Plus Jakarta Sans';color:${col}">${who}</b>` : ''}<span style="font:600 40px/1.22 'Plus Jakarta Sans';color:${me ? '#fff' : C.ink}">${txt}</span></div>`;
    const chat = W(`<div style="width:900px;height:600px;display:flex;flex-direction:column;justify-content:center;gap:22px;padding:0 44px">
      ${bub('Dimas', C.budi, 'Water’s rising at the bridge.')}
      ${bub('', '', 'Moving everyone to the mosque.', true)}
      <span style="align-self:center;margin-top:18px;display:flex;align-items:center;gap:14px;padding:16px 26px;border-radius:999px;background:#e6f4ea;color:${C.rt};font:700 32px/1 'Plus Jakarta Sans'">${ico('lock', 34)} Encrypted · AES‑256‑GCM</span></div>`);
    at(chat, CL3, CTOP); show(chat, TAB1 + 0.06, TAB2 - 0.06);
    const chatKids = [...chat.children];
    draws.push((t) => chatKids.forEach((k, i) => { const tb = TAB1 + 0.06 + i * 0.25; const e = stepR(t - tb, SP.pop); k.style.opacity = clamp(e * 1.5).toFixed(3); k.style.transform = `scale(${(0.85 + 0.15 * e).toFixed(4)})`; }));
    cue(TAB1 + 0.25, 'pop', { n: 2 }); cue(TAB1 + 0.5, 'pop', { n: 4 });
    // Map
    const mapPins = [['D', C.budi, 250, 170, 'Dimas'], ['R', C.sari, 600, 140, 'Rina'], ['A', C.sky, 680, 380, 'Ayu'], ['Y', C.leaf, 360, 400, 'You']];
    const map = W(`<div style="width:840px;height:560px;border-radius:36px;overflow:hidden;background:#e9eddc;position:absolute">
      <svg width="840" height="560" style="position:absolute;left:0;top:0">
        <path d="M-20 300 C 200 250, 380 360, 860 280" stroke="#9cc3e6" stroke-width="56" fill="none"/>
        <path d="M120 -10 L 220 580 M 520 -10 L 470 580 M -10 120 L 850 90 M -10 470 L 850 500" stroke="#fff" stroke-width="22" fill="none"/>
        <rect x="560" y="200" width="120" height="70" rx="12" fill="#d9dfc7"/><rect x="250" y="410" width="90" height="80" rx="12" fill="#d9dfc7"/>
      </svg>
      ${mapPins.map(([n, col, x, y, nm]) => `<div style="position:absolute;left:${x - 38}px;top:${y - 38}px;display:flex;align-items:center;gap:10px">
        <span class="av" style="width:76px;height:76px;background:${col};font-size:34px;border:5px solid #fff">${n}</span>
        <b style="font:800 30px/1 'Plus Jakarta Sans';color:${C.ink};background:#fff;padding:8px 14px;border-radius:14px">${nm}</b></div>`).join('')}
    </div>`);
    at(map, CL3 + 30, CTOP + 10); show(map, TAB2 + 0.06, 14.75);
    const mapPinEls = [...map.querySelectorAll(':scope > div')];
    draws.push((t) => mapPinEls.forEach((p, i) => { const tb = TAB2 + 0.125 + i * 0.125; const e = stepR(t - tb, SP.pop); p.style.opacity = clamp(e * 1.6).toFixed(3); p.style.transform = `translateY(${((1 - e) * -30).toFixed(1)}px)`; }));
    [0, 1, 2, 3].forEach((i) => cue(TAB2 + 0.125 + i * 0.125, 'pop', { n: i }));
    const mapCap = W(`<div style="width:900px;text-align:center;font:700 34px/1 'Plus Jakarta Sans';color:${C.grey}">Offline map · everyone’s position</div>`);
    at(mapCap, CL3, CTOP + 590); show(mapCap, TAB2 + 0.25, 14.75);

    // ───────────────────────── S3b · volume ×5 counter ─────────────────────────
    const VOLT = [15.0, 15.25, 15.5, 15.625, 15.75];
    const vol = W(`<div style="width:760px;height:210px;display:flex;align-items:center;justify-content:center;gap:34px;color:${C.cream}">
      <span class="av" style="width:120px;height:120px;background:${C.cream};color:${C.leafInk}">${ico('vol', 60)}</span>
      <span style="display:flex;gap:20px">${VOLT.map(() => `<i style="display:block;width:64px;height:64px;border-radius:32px;border:5px solid rgba(242,237,213,.35)"></i>`).join('')}</span></div>`);
    ctr(vol, SX, SY); show(vol, 14.875, 15.9);
    const volDots = [...vol.querySelectorAll('i')], volBtn = vol.querySelector('.av');
    draws.push((t) => {
      volDots.forEach((d, i) => { const on = t >= VOLT[i]; d.style.background = on ? C.sos : 'transparent'; d.style.borderColor = on ? C.sos : 'rgba(242,237,213,.35)'; d.style.transform = `scale(${on ? bump(t, VOLT[i] + 0.03, 0.18, 0.05).toFixed(4) : 1})`; });
      let s = 1; VOLT.forEach((tc) => { s *= press(t, tc); }); volBtn.style.transform = `scale(${s.toFixed(4)})`;
    });
    VOLT.forEach((tt, i) => { cue(tt, 'click'); cue(tt, 'slam', { n: i }); });
    cue(14.0, 'riser', { d: 2.0 });

    // ───────────────────────── S4 · SOS card (the drop) ─────────────────────────
    const ST = SY - 450, SL = SX - 470;
    const s4a = W(`<div style="width:940px;display:flex;align-items:center;gap:34px;padding:0 60px">
      <span class="av" style="width:140px;height:140px;background:${C.cream};color:${C.sari};font-size:64px">R</span>
      <span style="display:flex;flex-direction:column;gap:14px;color:#fff">
        <b class="mono" style="font:700 34px/1 'JetBrains Mono';letter-spacing:.16em;opacity:.9">SOS · NOW</b>
        <b style="font:800 70px/1.02 'Plus Jakarta Sans';letter-spacing:-.035em">Rina needs help</b></span></div>`);
    at(s4a, SL, ST + 70); show(s4a, 16.125, 19.625, (t) => `scale(${popS(t, 16.125, 0.85).toFixed(4)})`);
    const stat = (ic, v, k) => `<div style="flex:1;display:flex;flex-direction:column;gap:12px;padding:26px 24px;border-radius:30px;background:rgba(255,255,255,.16)">
      ${ico(ic, 44, '#fff')}<b class="mono" style="font:700 54px/1 'JetBrains Mono';color:#fff;letter-spacing:-.03em">${v}</b><span style="font:600 28px/1 'Plus Jakarta Sans';color:rgba(255,255,255,.8)">${k}</span></div>`;
    const s4b = W(`<div style="width:940px;display:flex;gap:20px;padding:0 60px">${stat('nav', '252 m', 'Distance')}${stat('nav', 'NE', 'Direction')}${stat('bat', '21%', 'Battery')}</div>`);
    at(s4b, SL, ST + 280);
    const s4bKids = [...s4b.children];
    draws.push((t) => s4bKids.forEach((k, i) => { const tb = 16.5 + i * 0.25; const v = vis(t, tb, 19.625); applyVis(k, v, `scale(${popS(t, tb, 0.8).toFixed(4)})`); }));
    s4bKids[1].querySelector('.ic').style.transform = 'rotate(45deg)';
    const s4c = W(`<div style="padding:20px 30px;border-radius:24px;background:rgba(255,255,255,.16);color:#fff;font:700 36px/1 'Plus Jakarta Sans';display:flex;align-items:center;gap:16px;white-space:nowrap">
      ${ico('med', 42)} Medical card attached</div>`);
    at(s4c, SL + 60, ST + 540); show(s4c, 17.25, 19.625);
    const s4d = W(`<div style="width:820px;height:126px;border-radius:63px;background:${C.cream};color:${C.sos};display:flex;align-items:center;justify-content:center;gap:20px;font:800 48px/1 'Plus Jakarta Sans'">
      Guide me to Rina ${ico('arrow', 48)}</div>`);
    at(s4d, SX - 410, ST + 900 - 60 - 126); show(s4d, 17.5, 19.625);
    cue(16.0, 'drop'); cue(16.0, 'slam', { n: 2 });
    [16.5, 16.75, 17.0].forEach((tt) => cue(tt, 'pop', { n: 3 }));
    cue(17.25, 'tick'); cue(17.5, 'pop', { n: 4 });
    cue(17.25, 'whoosh', { v: 0.8 });
    [18.0, 18.5, 19.0].forEach((tt) => cue(tt, 'alert'));
    cue(19.0, 'whoosh', { v: 0.6 });

    // ───────────────────────── S5 · "be found" toggles ─────────────────────────
    const CT5 = SY - 350;
    const ROWS = [['siren', 'Siren', 'Loud enough to be heard', C.sos, TG1], ['torch', 'Flashlight', 'Blinks for rescuers', '#c48a12', TG2], ['big', 'Large buttons', 'Easy for elders', C.rt, TG3]];
    const s5 = W(`<div style="width:900px;height:700px;display:flex;flex-direction:column;padding:40px 40px 0 40px"></div>`);
    const tgl = [];
    ROWS.forEach(([ic, nm, sub, col, tt], i) => {
      const r = add(`<div style="height:${ROWH}px;display:flex;align-items:center;gap:30px;border-bottom:${i < 2 ? `2px solid ${C.line}` : 'none'}">
        <span class="av" style="width:110px;height:110px;background:${col}1f;color:${col}">${ico(ic, 56)}</span>
        <span style="flex:1;display:flex;flex-direction:column;gap:12px"><b style="font:800 50px/1 'Plus Jakarta Sans';color:${C.ink};letter-spacing:-.02em">${nm}</b>
          <span style="font:600 30px/1 'Plus Jakarta Sans';color:${C.grey}">${sub}</span></span>
        <span style="position:relative;width:150px;height:84px;border-radius:42px;background:#d8d5c6;flex:none"><i style="position:absolute;top:8px;height:68px;border-radius:34px;background:#fff;display:block;box-shadow:0 3px 8px rgba(0,0,0,.18)"></i></span></div>`, s5);
      const tr = r.lastElementChild, kn = tr.firstElementChild;
      const kL = new Track(8).to(tt, 74, { w: 16, z: 0.9 }), kR = new Track(76).to(tt, 142, { w: 34, z: 0.88 });
      tgl.push({ tr, kn, kL, kR, tt, col: C.leaf });
      cue(tt, 'click'); cue(tt + 0.06, 'toggle');
    });
    at(s5, SX - 450, CT5);
    show(s5, 20.125, 23.75, (t) => `scale(${(1 + 0.1 * stepR(t - TG3 - 0.06, { w: 20, z: 0.78 })).toFixed(4)})`);
    draws.push((t) => tgl.forEach(({ tr, kn, kL, kR, tt }) => {
      const l = kL.at(t), r = kR.at(t);
      kn.style.left = l.toFixed(1) + 'px'; kn.style.width = (r - l).toFixed(1) + 'px';
      tr.style.background = M.mix('#d8d5c6', C.leaf, clamp((t - tt) / 0.15));
      tr.style.transform = `scale(${press(t, tt).toFixed(4)})`;
    }));
    // siren & torch side effects: the siren icon pulses, the lamp wash (bg) turns on
    [20.5, 21.0, 21.5, 22.0, 22.5, 23.0].forEach((tt) => cue(tt, 'alert'));
    cue(TG3 + 0.06, 'whoosh', { v: 0.5 }); cue(23.0, 'settle');
    cue(20.0, 'swap', { n: 1 });

    // ───────────────────────── S6 · logo disc + tagline ─────────────────────────
    const s6 = W(`<div style="width:360px;height:360px"><img src="assets/mark.png" style="width:360px;height:360px;display:block"></div>`);
    ctr(s6, SX, SY); show(s6, 24.0, 27.75, (t) => `scale(${popS(t, 24.0, 0.6).toFixed(4)})`);
    const wm = W(`<div style="font:800 70px/1 'Plus Jakarta Sans';letter-spacing:-.04em;color:${C.cream};white-space:nowrap">Saling Jaga</div>`);
    ctr(wm, SX, SY + 320); show(wm, 24.5, 27.75);
    const chips = W(`<div style="display:flex;gap:18px">${['Free forever', 'No ads', 'Android 7.0+'].map((c) => `<span style="padding:18px 28px;border-radius:999px;background:${C.card2};border:2px solid rgba(242,237,213,.14);font:700 34px/1 'Plus Jakarta Sans';color:${C.cream};white-space:nowrap">${c}</span>`).join('')}</div>`);
    ctr(chips, SX, SY + 450);
    const chipEls = [...chips.children];
    draws.push((t) => chipEls.forEach((c, i) => { const tb = 25.5 + i * 0.5; applyVis(c, vis(t, tb, 27.75), `scale(${popS(t, tb, 0.7).toFixed(4)})`); }));
    cue(24.0, 'slam', { n: 3 }); cue(24.0, 'drop'); cue(24.5, 'shimmer');
    [25.5, 26.0, 26.5].forEach((tt, i) => cue(tt, 'pop', { n: i + 1 }));
    cue(27.0, 'riser', { d: 1.0 });

    // ───────────────────────── S7 · CTA pill ─────────────────────────
    const ctaA = W(`<div style="width:820px;height:180px;display:flex;align-items:center;justify-content:center;gap:22px;color:${C.leafInk};font:800 56px/1 'Plus Jakarta Sans';letter-spacing:-.03em">
      Join the Android test ${ico('arrow', 56)}</div>`);
    ctr(ctaA, SX, SY); show(ctaA, 28.125, CTA + 0.05, (t) => `scale(${press(t, CTA).toFixed(4)})`);
    const ctaB = W(`<div style="width:820px;height:180px;display:flex;align-items:center;justify-content:center;gap:20px;color:${C.leafInk};font:800 60px/1 'Plus Jakarta Sans';letter-spacing:-.03em">
      ${ico('check', 58)} saling-jaga.com</div>`);
    ctr(ctaB, SX, SY); show(ctaB, CTA + 0.125, null);
    const endLogo = W(`<div style="display:flex;align-items:center;gap:22px;white-space:nowrap"><img src="assets/mark.png" style="width:110px;height:110px"><b style="font:800 56px/1 'Plus Jakarta Sans';letter-spacing:-.03em;color:${C.cream}">Saling Jaga</b></div>`);
    ctr(endLogo, SX, SY + 260); show(endLogo, 28.5, null);
    const fine = add(`<div class="mono" style="left:0;top:1700px;width:1080px;text-align:center;font:600 30px/1.6 'JetBrains Mono';color:${C.muted};letter-spacing:.03em">Android 7.0+ · iPhone on TestFlight soon</div>`);
    show(fine, 30.0, null);
    cue(28.0, 'swap', { n: 3 }); cue(CTA, 'cta'); cue(30.0, 'shimmer'); cue(31.0, 'settle');

    // z-order: diagram svg + tiles beneath the body, nodes and contents above
    world.insertBefore(body, svg.nextSibling);
    world.insertBefore(svg, body.nextSibling);
    TILES.forEach(({ e }) => world.insertBefore(e, world.firstChild));

    // ───────────────────────── Cursor draw ─────────────────────────
    const cur = add(`<div class="cur"><svg viewBox="0 0 24 24"><path d="M4 2.5 20 11l-7 1.8L9.6 20z" fill="#f2edd5" stroke="#04140a" stroke-width="1.6" stroke-linejoin="round"/></svg><span class="pill">You</span></div>`);
    const rip = add('<div class="rip"></div>');
    const curPill = cur.querySelector('.pill');
    const clicks = [TAP, GRAB, TAB1, TAB2, TG1, TG2, TG3, CTA];
    draws.push((t) => {
      const [sx, sy] = toS(CX.at(t), CYt.at(t), t);
      const o = clamp(CO.at(t));
      const vx = (toS(CX.at(t + 0.01), CYt.at(t + 0.01), t + 0.01)[0] - sx) / 0.01;
      let sc = 1; for (const c of clicks) sc *= press(t, c);
      sc *= 1 - 0.12 * clamp((t - GRAB) / 0.08) * clamp((LET - t) / 0.08);
      at(cur, sx, sy); cur.style.opacity = o.toFixed(3);
      const flip = clamp((sx - 820) / 80); curPill.style.left = lerp(44, -curPill.offsetWidth - 4, flip).toFixed(1) + 'px';
      cur.style.transform = `rotate(${clamp(-vx * 0.0045, -14, 14).toFixed(2)}deg) scale(${sc.toFixed(4)})`;
      let rp = null, rx = 0, ry = 0; for (const c of clicks) { const r = ripple(t, c); if (r) { rp = r; [rx, ry] = toS(CX.at(c), CYt.at(c), t); } }
      if (rp && o > 0.3) { at(rip, rx, ry); rip.style.opacity = rp.o.toFixed(3); rip.style.transform = `scale(${rp.s.toFixed(3)})`; } else rip.style.opacity = 0;
    });

    // ───────────────────────── Seek ─────────────────────────
    const DUR = 32.0;
    window.seek = (t) => {
      const z = camZ(t), [qx, qy] = shake(t);
      world.style.transform = `translate(${(SX + qx).toFixed(2)}px, ${(SY + qy).toFixed(2)}px) scale(${z.toFixed(5)}) translate(${-SX}px, ${-SY}px)`;
      hud.style.transform = `translate(${(qx * 0.5).toFixed(2)}px, ${(qy * 0.5).toFixed(2)}px)`;
      for (const d of draws) d(t);
    };
    cue(0.0, 'born'); cue(0.5, 'whoosh', { v: 0.7 });
    cues.sort((a, b) => a.t - b.t);
    window.FILM = { width: 1080, height: 1920, bpm: 120, duration: DUR,
      sections: { intro: [0, 4], build: [12, 16], drop: [16, 20], outro: [28, 32] }, cues };
    window.seek(0);
    window.READY = true;
  } catch (err) {
    window.FILM_ERROR = String(err && err.stack || err);
    console.error(err);
  }
})();
