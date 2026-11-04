// Saling Jaga · Pola komunikasi. Landscape 1920×1080, 120 BPM, 35 s.
// The logo disc becomes HP "A", the phone that made the group (the hero shape, never cut).
// B, C, D join A. C types a message → it goes to A first → A copies it to B and D (Ketua RT + toa).
// E and F are out of reach → D is the bridge phone. Further still → A hands the message to a LoRa
// device; LoRa 1 → 2 → 3 → 4 re-broadcast with hop 3 → 2 → 1 and ignore duplicates (drop) → group G.
// Pull back to the whole route → A grows into the recap card → back to the logo.
(async function () {
  try {
    const { clamp, lerp, stepR, Track, ColorTrack, SP, vis, applyVis, press, ripple, outQ, inOut } = M;
    const C = { night: '#07110c', card: '#0f1f17', card2: '#13271d', cream: '#f2edd5', muted: '#a5b0a2',
      dim: '#6f7c6f', leaf: '#3cbf6e', ink: '#04140a', line: '#2c6544', lamp: '#f2c46b', sos: '#ef4b4b' };

    await Promise.all([
      document.fonts.load('800 60px "Plus Jakarta Sans"'), document.fonts.load('500 33px "Plus Jakarta Sans"'),
      document.fonts.load('700 24px "Plus Jakarta Sans"'), document.fonts.load('600 24px "JetBrains Mono"'),
      document.fonts.load('700 24px "JetBrains Mono"'), document.fonts.load('italic 400 72px "Instrument Serif"'),
    ].map((p) => p.catch(() => null)));
    await document.fonts.ready;

    const cues = [];
    const cue = (t, k, o = {}) => cues.push({ t, k, ...o });
    const world = document.getElementById('world');
    const hud = document.getElementById('hud');
    const scrim = document.getElementById('scrim');
    const draws = [];
    const add = (html, parent = world) => { const d = document.createElement('div'); d.innerHTML = html.trim(); const e = d.firstElementChild; parent.appendChild(e); return e; };
    const show = (e, tin, tout, extra = '') => draws.push((t) => applyVis(e, vis(t, tin, tout), typeof extra === 'function' ? extra(t) : extra));
    const popS = (t, tin, s0 = 0.5) => s0 + (1 - s0) * stepR(t - tin, SP.pop);
    const P = (d, sw = 2.4) => `<svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
    const I = {
      check: P('<path d="M20 6 9 17l-5-5"/>', 3.2),
      mail: P('<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m3.5 6.5 8.5 6.5 8.5-6.5"/>', 2.2),
      send: P('<path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4z"/>', 2.4),
      mega: P('<path d="M3 10v4a1 1 0 0 0 1 1h3l6 4V5L7 9H4a1 1 0 0 0-1 1z"/><path d="M17 8.5a5 5 0 0 1 0 7"/><path d="M19.8 6a8.5 8.5 0 0 1 0 12"/>', 2.2),
      x: P('<path d="M18 6 6 18M6 6l12 12"/>', 3),
      radio: P('<rect x="5" y="9" width="14" height="12" rx="2.5"/><path d="M9 9 15 2.5"/><circle cx="12" cy="15" r="2.2"/>', 2.2),
    };
    const NS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('width', '1'); svg.setAttribute('height', '1'); svg.style.overflow = 'visible';
    world.appendChild(svg);
    const sv = (tag, attrs = {}, parent = svg) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); parent.appendChild(e); return e; };

    // ───────────────────────── World layout ─────────────────────────
    const POS = {
      A: [0, 0], B: [0, -290], C: [-290, 180], D: [290, 180],
      E: [720, 180], F: [1000, 180],
      L1: [190, 480], L2: [1300, 620], L3: [2400, 420], L4: [3500, 560],
      G: [3800, 220], H: [3800, -80], I: [4100, 320],
    };
    const R = 70;

    // ───────────────────────── Camera ─────────────────────────
    const CX = new Track(0), CY = new Track(120), CZ = new Track(0), AX = new Track(960);
    const camTo = (t, x, y, z, ax, sp = SP.cam) => { CX.to(t, x, sp); CY.to(t, y, sp); CZ.to(t, Math.log(z), sp); AX.to(t, ax, sp); };
    camTo(3.0, 0, -20, 1.0, 1300);
    camTo(9.0, -230, 250, 1.45, 1300);
    camTo(12.0, 0, -20, 1.0, 1300);
    camTo(16.0, 330, -20, 0.72, 1370);
    camTo(21.0, 700, 300, 0.6, 1350);
    camTo(22.0, 1000, 390, 0.55, 1350);
    camTo(23.5, 1350, 400, 0.5, 1350);
    camTo(24.75, 2700, 430, 0.55, 1350);
    camTo(25.75, 3500, 250, 0.62, 1350);
    camTo(27.25, 1900, 260, 0.4, 960, { w: 6, z: 1 });
    camTo(29.0, 0, 0, 1.0, 960, { w: 8, z: 1 });
    const camZ = (t) => Math.exp(CZ.at(t) + 0.004 * Math.sin(t * 0.9));
    const scr = (t, x, y) => { const z = camZ(t); return [AX.at(t) + (x - CX.at(t)) * z, 540 + (y - CY.at(t)) * z]; };

    // scrim behind the left caption column
    draws.push((t) => { const o = clamp((t - 3.25) / 0.5) * (1 - clamp((t - 27.25) / 0.4)); scrim.style.opacity = o.toFixed(3); });

    // ───────────────────────── Captions (HUD, left column) ─────────────────────────
    // groups: [[ [t, html], [t, html] ... ], ...]; each group replaces the previous, items inside stack.
    function caption(tin, tout, kicker, heads, groups, listTop = 372) {
      const k = add(`<div class="kick">${kicker}</div>`, hud); k.style.left = '110px'; k.style.top = '150px';
      show(k, tin, tout);
      heads.forEach(([ts, html], i) => {
        const h = add(`<div class="head">${html}</div>`, hud); h.style.left = '110px'; h.style.top = '196px';
        show(h, ts, heads[i + 1] ? heads[i + 1][0] - 0.125 : tout);
      });
      groups.forEach((g, gi) => {
        const box = add('<div class="list"></div>', hud); box.style.left = '110px'; box.style.top = listTop + 'px';
        const gout = groups[gi + 1] ? groups[gi + 1][0][0] - 0.125 : tout;
        g.forEach(([ts, html, num]) => {
          const li = add(`<div class="li">${num ? `<span class="n">${num}</span>` : ''}<span>${html}</span></div>`, box);
          show(li, ts, gout);
          cue(ts, 'swap', { n: (gi + g.indexOf(g.find((x) => x[0] === ts))) % 5 });
        });
      });
    }

    // ───────────────────────── SVG backdrop: ring, links, waves ─────────────────────────
    const ring = sv('circle', { cx: 0, cy: 0, r: 440, fill: 'none', 'stroke-width': 3, 'stroke-dasharray': '10 14', stroke: C.dim });
    const ringTag = add('<div class="tag" style="color:#6f7c6f">jangkauan A · ±50–100 m</div>');
    ringTag.style.left = '0px'; ringTag.style.top = '-470px';
    draws.push((t) => {
      const v = vis(t, 7.5, 20.875);
      ring.style.opacity = v.gone ? 0 : (v.o * 0.6).toFixed(3);
      ring.setAttribute('r', (440 * (0.75 + 0.25 * v.e)).toFixed(1));
      const hot = clamp((t - 16.5) / 0.25) * (1 - clamp((t - 18.0) / 0.3));
      ring.setAttribute('stroke', M.mix(C.dim, C.lamp, hot));
      applyVis(ringTag, vis(t, 7.75, 15.875), 'translate(-50%,-50%)');
    });
    cue(7.5, 'whoosh', { v: 0.4 });

    function link(a, b, tin, tout, color = C.line, dash = null) {
      const [x1, y1] = POS[a], [x2, y2] = POS[b];
      const l = sv('line', { x1, y1, x2, y2, stroke: color, 'stroke-width': 5, 'stroke-linecap': 'round' });
      const len = Math.hypot(x2 - x1, y2 - y1);
      draws.push((t) => {
        const p = clamp(stepR(t - tin, { w: 16, z: 1 }));
        const o = 1 - clamp((t - tout) / 0.15);
        if (p <= 0.001 || o <= 0) { l.style.opacity = 0; return; }
        l.style.opacity = o.toFixed(3);
        if (dash) { l.setAttribute('stroke-dasharray', dash); l.setAttribute('x2', lerp(x1, x2, p)); l.setAttribute('y2', lerp(y1, y2, p)); }
        else { l.setAttribute('stroke-dasharray', `${len} ${len}`); l.setAttribute('stroke-dashoffset', (len * (1 - p)).toFixed(1)); }
      });
    }
    link('A', 'B', 5.0, 28.875); link('A', 'C', 5.5, 28.875); link('A', 'D', 6.0, 28.875);
    link('E', 'F', 16.75, 20.875);
    link('D', 'E', 18.0, 20.875, C.lamp, '14 12');
    link('A', 'L1', 21.5, 28.875, C.lamp, '14 12');
    link('L4', 'G', 25.5, 28.875, C.lamp, '14 12');
    link('G', 'H', 25.625, 28.875); link('G', 'I', 25.75, 28.875);

    // LoRa broadcast waves
    function wave(at, tb, maxR = 1250) {
      const [cx, cy] = POS[at];
      [0, 0.16].forEach((off) => {
        const c = sv('circle', { cx, cy, r: 0, fill: 'none', stroke: C.lamp, 'stroke-width': 6 });
        draws.push((t) => {
          const x = (t - tb - off) / 1.1;
          if (x < 0 || x > 1) { c.style.opacity = 0; return; }
          c.setAttribute('r', (60 + maxR * outQ(x)).toFixed(1));
          c.style.opacity = (0.55 * (1 - x) * (off ? 0.6 : 1)).toFixed(3);
        });
      });
    }
    wave('L1', 22.0); wave('L2', 23.5); wave('L3', 25.0);

    // distance ruler in the pull-back (site: "hingga beberapa km")
    const ruler = sv('g');
    sv('line', { x1: POS.L1[0], y1: 860, x2: POS.L4[0], y2: 860, stroke: C.muted, 'stroke-width': 4 }, ruler);
    sv('line', { x1: POS.L1[0], y1: 830, x2: POS.L1[0], y2: 890, stroke: C.muted, 'stroke-width': 4 }, ruler);
    sv('line', { x1: POS.L4[0], y1: 830, x2: POS.L4[0], y2: 890, stroke: C.muted, 'stroke-width': 4 }, ruler);
    const rulerTag = add('<div class="tag" style="font-size:64px;color:#f2c46b;background:#07110c;padding:0 30px">beberapa km</div>');
    rulerTag.style.left = ((POS.L1[0] + POS.L4[0]) / 2) + 'px'; rulerTag.style.top = '860px';
    draws.push((t) => {
      const v = vis(t, 27.75, 28.875);
      ruler.style.opacity = v.gone ? 0 : v.o.toFixed(3);
      applyVis(rulerTag, v, 'translate(-50%,-50%)');
    });

    // ───────────────────────── Nodes (phones) ─────────────────────────
    const nodeEls = {};
    function node(id, tin, tout, fill = C.card2, ink = C.cream) {
      const [x, y] = POS[id];
      const e = add(`<div class="disc">${id}</div>`);
      e.style.left = (x - R) + 'px'; e.style.top = (y - R) + 'px';
      const col = new ColorTrack(fill);
      nodeEls[id] = { e, col, ink, presses: [] };
      draws.push((t) => {
        const v = vis(t, tin, tout);
        let s = popS(t, tin, 0.4);
        for (const tc of nodeEls[id].presses) s *= press(t, tc);
        applyVis(e, v, `scale(${s.toFixed(3)})`);
        e.style.background = col.at(t);
        e.style.color = nodeEls[id].inkAt ? nodeEls[id].inkAt(t) : ink;
        e.style.boxShadow = `inset 0 0 0 4px ${C.line}, 0 30px 60px -24px rgba(0,0,0,.8)`;
      });
      return nodeEls[id];
    }
    node('B', 5.0, 28.875); node('C', 5.5, 28.875); node('D', 6.0, 28.875);
    node('E', 16.5, 20.875); node('F', 16.75, 20.875);
    node('G', 25.5, 28.875, C.leaf, C.ink); node('H', 25.625, 28.875); node('I', 25.75, 28.875);
    cue(5.0, 'pop', { n: 0 }); cue(5.5, 'pop', { n: 1 }); cue(6.0, 'pop', { n: 2 });
    cue(16.5, 'pop', { n: 3 }); cue(16.75, 'pop', { n: 4 });
    cue(25.5, 'pop', { n: 0 }); cue(25.625, 'pop', { n: 1 }); cue(25.75, 'pop', { n: 2 });
    // C is the sender: it turns amber when it starts typing
    nodeEls.C.col.to(9.0, C.lamp, { w: 20, z: 1 }); nodeEls.C.inkAt = (t) => (t > 9.1 ? C.ink : C.cream);

    // word labels under / beside nodes
    function wlabel(html, x, y, tin, tout, color = C.muted, size = 26, anchor = 'translate(-50%,-50%)') {
      const e = add(`<div class="tag" style="color:${color};font-size:${size}px">${html}</div>`);
      e.style.left = x + 'px'; e.style.top = y + 'px';
      draws.push((t) => applyVis(e, vis(t, tin, tout), `${anchor} scale(${popS(t, tin, 0.7).toFixed(3)})`));
      return e;
    }
    wlabel('pembuat grup', 96, -2, 4.5, 15.875, C.leaf, 26, 'translate(0,-50%)');
    wlabel('pengirim', POS.C[0], POS.C[1] + 104, 12.0, 15.875, C.lamp);
    wlabel('HP jembatan', POS.D[0], POS.D[1] + 104, 17.5, 20.875, C.lamp, 28);
    wlabel('di luar jangkauan A', (POS.E[0] + POS.F[0]) / 2, POS.E[1] + 104, 16.75, 17.875, C.sos, 28);
    wlabel('gerbang', 48, 290, 21.5, 23.375, C.lamp, 40, 'translate(-100%,-50%)');
    wlabel('kelompok lain', POS.H[0] + 150, POS.H[1] - 130, 26.0, 28.875, C.leaf, 44);
    cue(17.5, 'toggle'); cue(21.5, 'toggle');

    // badges (received ✓)
    function badge(id, tin, tout, scale = 1) {
      const [x, y] = POS[id];
      const e = add(`<div class="badge">${I.check}</div>`);
      e.style.left = (x + 50) + 'px'; e.style.top = (y - 50) + 'px';
      draws.push((t) => applyVis(e, vis(t, tin, tout), `translate(-50%,-50%) scale(${(popS(t, tin, 0.3) * scale).toFixed(3)})`));
    }
    function pulse(id, tc, color = C.leaf, big = 1.9) {
      const [x, y] = POS[id];
      const e = add(`<div class="pulse" style="border-color:${color}"></div>`);
      e.style.left = (x - R) + 'px'; e.style.top = (y - R) + 'px';
      draws.push((t) => {
        const q = (t - tc) / 0.6;
        if (q < 0 || q > 1) { e.style.visibility = 'hidden'; return; }
        e.style.visibility = 'visible';
        e.style.opacity = (0.8 * (1 - q)).toFixed(3);
        e.style.transform = `scale(${lerp(1, big, outQ(q)).toFixed(3)})`;
      });
    }
    badge('B', 13.5, 15.875); badge('D', 13.5, 15.875);
    badge('E', 19.0, 20.875); badge('F', 20.0, 20.875);
    badge('G', 26.5, 28.875, 1.3); badge('H', 27.25, 28.875, 1.3); badge('I', 27.25, 28.875, 1.3);
    pulse('A', 12.5); pulse('B', 13.5); pulse('D', 13.5); pulse('D', 18.5, C.lamp);
    pulse('E', 19.0); pulse('F', 20.0); pulse('G', 26.5); pulse('H', 27.25); pulse('I', 27.25);
    cue(12.5, 'settle'); cue(13.5, 'check'); cue(19.0, 'check'); cue(20.0, 'check');
    cue(26.5, 'check'); cue(27.25, 'check');

    // ───────────────────────── LoRa devices ─────────────────────────
    function lora(id, n, tin, tout, hits) {
      const [x, y] = POS[id];
      const e = add(`<div style="width:210px;height:210px;border-radius:56px;background:#1d1a0e;box-shadow:inset 0 0 0 6px #f2c46b,0 30px 60px -24px rgba(0,0,0,.8);color:#f2c46b;display:flex;align-items:center;justify-content:center"><span style="width:128px;height:128px;display:inline-flex">${I.radio}</span></div>`);
      e.style.left = (x - 105) + 'px'; e.style.top = (y - 105) + 'px';
      const tg = add(`<div class="tag" style="color:#f2c46b;font-size:54px;font-weight:700">LoRa ${n}</div>`);
      tg.style.left = x + 'px'; tg.style.top = (y + 160) + 'px';
      draws.push((t) => {
        const v = vis(t, tin, tout);
        let s = popS(t, tin, 0.3);
        for (const tc of hits) s *= 1 + 0.12 * Math.exp(-(((t - tc) / 0.09) ** 2));
        applyVis(e, v, `scale(${s.toFixed(3)})`);
        const hot = hits.reduce((m, tc) => Math.max(m, Math.exp(-Math.max(0, t - tc) * 4) * (t >= tc ? 1 : 0)), 0);
        e.style.background = M.mix('#1d1a0e', '#5a4818', hot);
        applyVis(tg, vis(t, tin + 0.125, tout), 'translate(-50%,-50%)');
      });
      cue(tin, 'born');
    }
    lora('L1', 1, 21.5, 28.875, [22.0]);
    lora('L2', 2, 22.5, 28.875, [23.0, 23.5]);
    lora('L3', 3, 23.5, 28.875, [24.5, 25.0]);
    lora('L4', 4, 25.0, 28.875, [26.0]);
    cue(21.0, 'riser', { d: 1.0 });
    cue(22.0, 'drop');

    // ───────────────────────── Envelopes (the message itself) ─────────────────────────
    function env(label, from, to, t0, t1, opts = {}) {
      const { s = 1, lift = 90, dark = false, die = false, swapAt = null, label2 = null } = opts;
      const e = add(`<div class="env" style="${dark ? 'background:#f2c46b' : ''}"><i>${I.mail}</i><span>${label}</span></div>`);
      const sp = e.querySelector('span');
      const [x0, y0] = Array.isArray(from) ? from : POS[from];
      const [x1, y1] = Array.isArray(to) ? to : POS[to];
      draws.push((t) => {
        if (t < t0 || t > t1 + 0.2) { e.style.visibility = 'hidden'; return; }
        e.style.visibility = 'visible';
        const q = clamp((t - t0) / (t1 - t0));
        const k = 0.5 - 0.5 * Math.cos(Math.PI * q);
        const x = lerp(x0, x1, k), y = lerp(y0, y1, k) - Math.sin(Math.PI * k) * lift;
        const inS = 0.4 + 0.6 * stepR(t - t0, SP.pop);
        const out = clamp((t - t1) / 0.2);
        const sc = s * inS * (die ? 1 + 0.4 * out : 1 - 0.7 * out);
        e.style.opacity = (1 - out).toFixed(3);
        e.style.filter = die && out > 0 ? `blur(${(out * 8).toFixed(2)}px)` : 'none';
        e.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) translate(-50%,-50%) scale(${sc.toFixed(3)})`;
        if (label2 && swapAt != null) sp.textContent = t >= swapAt ? label2 : label;
      });
      return e;
    }
    env('pesan C', 'C', 'A', 12.0, 12.5, { lift: 60 });
    env('pesan C', 'A', 'B', 13.0, 13.5, { lift: 40 });
    env('pesan C', 'A', 'D', 13.0, 13.5, { lift: 40 });
    env('pesan C', 'D', 'E', 18.5, 19.0, { lift: 70 });
    env('pesan C', 'E', 'F', 19.5, 20.0, { lift: 70 });
    env('pesan C', 'A', 'L1', 21.5, 22.0, { lift: 40, s: 1.4 });
    env('#7f3a · hop 3', 'L1', 'L2', 22.0, 23.0, { s: 2.4, lift: 200, dark: true });
    env('#7f3a · hop 2', 'L2', 'L3', 23.5, 24.5, { s: 2.4, lift: 200, dark: true });
    env('#7f3a · hop 2', 'L2', [POS.L1[0] + 120, POS.L1[1] - 60], 23.5, 24.0, { s: 1.6, lift: 120, dark: true, die: true });
    env('#7f3a · hop 1', 'L3', 'L4', 25.0, 26.0, { s: 2.4, lift: 200, dark: true });
    env('pesan C', 'L4', 'G', 26.0, 26.5, { s: 1.6, lift: 60 });
    env('pesan C', 'G', 'H', 26.75, 27.25, { s: 1.6, lift: 50 });
    env('pesan C', 'G', 'I', 26.75, 27.25, { s: 1.6, lift: 50 });
    cue(12.0, 'whoosh', { v: 0.45 }); cue(13.0, 'whoosh', { v: 0.55 }); cue(18.5, 'whoosh', { v: 0.45 }); cue(19.5, 'whoosh', { v: 0.4 });
    cue(21.5, 'whoosh', { v: 0.4 }); cue(23.5, 'whoosh', { v: 0.7 }); cue(25.0, 'whoosh', { v: 0.7 });
    cue(26.0, 'whoosh', { v: 0.4 }); cue(26.75, 'whoosh', { v: 0.45 });
    cue(23.0, 'note', { n: 0 }); cue(24.5, 'note', { n: 1 }); cue(26.0, 'note', { n: 2 });

    // duplicate ignored at LoRa 1
    const dup = add(`<div style="display:flex;align-items:center;gap:16px;padding:20px 30px;border-radius:999px;background:#2a1414;box-shadow:inset 0 0 0 4px #ef4b4b;color:#f2edd5;font:700 40px/1 'JetBrains Mono';white-space:nowrap"><span style="width:44px;height:44px;display:inline-flex;color:#ef4b4b">${I.x}</span>#7f3a sudah ada · abaikan</div>`);
    dup.style.left = (POS.L1[0] + 110) + 'px'; dup.style.top = (POS.L1[1] - 200) + 'px';
    draws.push((t) => applyVis(dup, vis(t, 24.0, 25.375), `translate(-10%,-50%) scale(${popS(t, 24.0, 0.6).toFixed(3)})`));
    cue(24.0, 'alert');

    // A's megaphone (Ketua RT + toa) when it copies the message out
    const mega = add(`<div style="width:84px;height:84px;border-radius:50%;background:#f2edd5;color:#04140a;display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 6px #07110c"><span style="width:50px;height:50px;display:inline-flex">${I.mega}</span></div>`);
    mega.style.left = '-92px'; mega.style.top = '-80px';
    draws.push((t) => applyVis(mega, vis(t, 12.75, 15.875), `translate(-50%,-50%) scale(${(popS(t, 12.75, 0.3) * press(t, 13.0)).toFixed(3)})`));
    cue(12.75, 'pop', { n: 4 });

    // ───────────────────────── C's chat bubble + typing ─────────────────────────
    const MSG = 'Jembatan putus!';
    const BUB = { x: -290, y: 340, w: 470, h: 96 };
    const bub = add(`<div style="width:${BUB.w}px;height:${BUB.h}px;border-radius:48px;background:#13271d;box-shadow:inset 0 0 0 3px #2c6544,0 30px 60px -24px rgba(0,0,0,.8);display:flex;align-items:center;box-sizing:border-box;padding:0 16px 0 34px">
      <div style="flex:1;font:600 34px/1 'Plus Jakarta Sans';color:#f2edd5;white-space:nowrap;position:relative"><span class="ty"></span><span class="ph" style="color:#6f7c6f">Tulis pesan…</span><i class="caret" style="display:inline-block;width:3px;height:38px;background:#f2c46b;vertical-align:-7px;margin-left:3px"></i></div>
      <div class="sb" style="width:66px;height:66px;border-radius:50%;background:#3cbf6e;color:#04140a;display:flex;align-items:center;justify-content:center"><span style="width:34px;height:34px;display:inline-flex">${I.send}</span></div></div>`);
    bub.style.left = (BUB.x - BUB.w / 2) + 'px'; bub.style.top = (BUB.y - BUB.h / 2) + 'px';
    const ty = bub.querySelector('.ty'), ph = bub.querySelector('.ph'), caret = bub.querySelector('.caret'), sb = bub.querySelector('.sb');
    const FOCUS = 9.75, K0 = 10.0, SEND = 12.0;
    const KEYS = [...MSG].map((_, i) => K0 + i * 0.125);
    KEYS.forEach((tk) => cue(tk, 'key'));
    cue(9.25, 'pop', { n: 3 }); cue(FOCUS, 'click'); cue(SEND, 'click');
    draws.push((t) => {
      const v = vis(t, 9.25, 15.875);
      const shrink = clamp(stepR(t - SEND, { w: 16, z: 1 }));
      applyVis(bub, v, `scale(${(popS(t, 9.25, 0.6) * (1 - 0.18 * shrink)).toFixed(3)})`);
      const n = KEYS.filter((tk) => t >= tk).length;
      const sent = t >= SEND;
      ty.textContent = sent ? '' : MSG.slice(0, n);
      ph.textContent = sent ? 'Terkirim ke grup ✓' : (n ? '' : 'Tulis pesan…');
      ph.style.color = sent ? C.leaf : C.dim;
      caret.style.visibility = !sent && t > FOCUS && (Math.floor((t - FOCUS) * 4) % 2 === 0 || (t > K0 && t < KEYS[KEYS.length - 1] + 0.2)) ? 'visible' : 'hidden';
      sb.style.transform = `scale(${press(t, SEND).toFixed(3)})`;
    });

    // ───────────────────────── Cursor "C" (HUD, follows world points) ─────────────────────────
    const cur = add(`<div class="cur"><svg viewBox="0 0 24 24"><path d="M4 2.5 20 11l-7 1.8L9.6 20z" fill="#f2c46b" stroke="#04140a" stroke-width="1.4" stroke-linejoin="round"/></svg><div class="pill">HP C</div></div>`, hud);
    const rip = add('<div class="rip"></div>', hud);
    const KX = new Track(-30), KY = new Track(620);       // world coordinates
    KX.to(9.25, -440, { w: 10, z: 0.95 }); KY.to(9.25, 352, { w: 10, z: 0.95 });
    for (let i = 1; i < KEYS.length; i += 3) KX.to(KEYS[i], -440 + i * 6, SP.soft);
    KX.to(11.625, -82, SP.cursor); KY.to(11.625, 348, SP.cursor);
    KX.to(12.25, 40, SP.cursor); KY.to(12.25, 620, SP.cursor);
    const CLK = [FOCUS, SEND];
    draws.push((t) => {
      if (t < 9.25 || t > 12.6) { cur.style.visibility = 'hidden'; rip.style.visibility = 'hidden'; return; }
      cur.style.visibility = 'visible';
      const [x, y] = scr(t, KX.at(t), KY.at(t));
      const [xp] = scr(t - 0.016, KX.at(t - 0.016), KY.at(t - 0.016));
      const vx = (x - xp) / 0.016;
      let s = 1; CLK.forEach((tc) => { s *= press(t, tc); });
      const fade = clamp((t - 9.25) / 0.2) * (1 - clamp((t - 12.35) / 0.25));
      cur.style.opacity = fade.toFixed(3);
      cur.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) rotate(${clamp(-vx * 0.0045, -14, 14).toFixed(2)}deg) scale(${s.toFixed(3)})`;
      cur.lastChild.style.transform = `translateX(${clamp(-vx * 0.012, -18, 18).toFixed(1)}px)`;
      let r = null; for (const tc of CLK) { const q = ripple(t, tc); if (q) r = q; }
      if (r) { rip.style.visibility = 'visible'; rip.style.transform = `translate(${x}px,${y}px) scale(${r.s.toFixed(3)})`; rip.style.opacity = r.o.toFixed(3); }
      else rip.style.visibility = 'hidden';
    });

    // ───────────────────────── Hero shape: logo → A → recap card → logo ─────────────────────────
    const hero = add('<div id="hero"></div>');
    const logo = add('<img src="assets/mark.png" alt="">', hero);
    await new Promise((r) => { if (logo.complete) r(); else { logo.onload = r; logo.onerror = r; } });
    const letterA = add('<div style="font:800 64px/1 \'Plus Jakarta Sans\';color:#04140a">A</div>', hero);
    const H = { x: new Track(0), y: new Track(0), w: new Track(0), h: new Track(0), r: new Track(150), bg: new ColorTrack(C.cream), bd: new Track(0) };
    const st = (t, x, y, w, h, r, bg, bd = 0, sp = SP.shape) => { H.x.to(t, x, sp); H.y.to(t, y, sp); H.w.to(t, w, sp); H.h.to(t, h, sp); H.r.to(t, r, sp); H.bg.to(t, bg, { w: 28, z: 1 }); H.bd.to(t, bd, SP.soft); };
    H.w.to(0.5, 300, SP.pop); H.h.to(0.5, 300, SP.pop); cue(0.5, 'born');
    st(3.0, 0, 0, 140, 140, 70, C.leaf); cue(3.0, 'whoosh', { v: 0.6 }); cue(3.0, 'swap', { n: 0 });
    st(29.0, 0, 0, 1560, 760, 48, C.card, 0.14, { w: 13, z: 0.86 }); cue(29.0, 'whoosh', { v: 0.8 });
    st(33.0, 0, -110, 300, 300, 150, C.cream, 0); cue(33.0, 'settle');
    const HP = [12.5, 13.0, 21.5];
    draws.push((t) => {
      const w = Math.max(0, H.w.at(t)), h = Math.max(0, H.h.at(t)), x = H.x.at(t), y = H.y.at(t);
      const r = Math.min(H.r.at(t), w / 2, h / 2);
      let s = 1; HP.forEach((tc) => { s *= press(t, tc); });
      hero.style.width = w + 'px'; hero.style.height = h + 'px';
      hero.style.transform = `translate(${(x - w / 2).toFixed(2)}px,${(y - h / 2).toFixed(2)}px) scale(${s.toFixed(3)})`;
      hero.style.borderRadius = r.toFixed(2) + 'px';
      hero.style.background = H.bg.at(t);
      hero.style.boxShadow = `inset 0 0 0 3px rgba(242,237,213,${clamp(H.bd.at(t), 0, 1).toFixed(3)}), 0 50px 100px -40px rgba(0,0,0,.85)`;
      const lv = t < 10 ? vis(t, 0.625, 2.875) : vis(t, 33.25, null);
      const sz = Math.min(w, h) * 0.86;
      logo.style.width = sz + 'px'; logo.style.height = sz + 'px';
      applyVis(logo, lv, '');
      logo.style.transform = `translate(-50%,-50%) translateY(${lv.dy.toFixed(2)}px) scale(${(0.85 + 0.15 * lv.e).toFixed(3)})`;
      const av = vis(t, 3.125, 28.875);
      applyVis(letterA, av, '');
      letterA.style.transform = `translate(-50%,-50%) translateY(${av.dy.toFixed(2)}px)`;
    });

    // Recap card content
    const card = add('<div style="width:1560px;height:760px;margin:-380px 0 0 -780px;padding:60px 80px;box-sizing:border-box"></div>', hero);
    const ck = add('<div class="kick">Ringkasnya</div>', card);
    const chd = add('<div class="head" style="font-size:58px;margin-top:20px;width:1400px">Satu pesan dari C, <span class="serif">tiga cara sampai.</span></div>', card);
    show(ck, 29.25, 32.875); show(chd, 29.375, 32.875);
    const rows = [
      ['Dalam satu grup', 'C → <b style="color:#3cbf6e">A</b> → semua anggota', 'Wi‑Fi Direct, ±50–100 m. A menyalin pesan ke semua.', C.leaf],
      ['Di luar jangkauan', 'D jadi <b style="color:#f2c46b">HP jembatan</b>', 'Meneruskan ke kelompok sebelah. Jangkauan +1 HP.', C.lamp],
      ['Antar kelompok', 'LoRa → LoRa → LoRa', 'Pancar ulang, hop 3 → 2 → 1. Duplikat diabaikan.', C.lamp],
    ];
    rows.forEach(([title, flow, desc, col], i) => {
      const tr = 29.75 + i * 0.5;
      const row = add(`<div style="position:absolute;left:80px;top:${226 + i * 158}px;width:1400px;height:132px;display:flex;align-items:center;gap:40px;border-top:2px solid #1f3a2a">
        <div style="flex:none;width:72px;height:72px;border-radius:50%;background:${col};color:#04140a;font:800 36px/72px 'Plus Jakarta Sans';text-align:center">${i + 1}</div>
        <div style="width:420px;font:700 38px/1.1 'Plus Jakarta Sans';color:#f2edd5;white-space:nowrap">${title}</div>
        <div><div style="font:700 36px/1.1 'JetBrains Mono';color:#f2edd5;white-space:nowrap">${flow}</div><div style="font:500 28px/1.3 'Plus Jakarta Sans';color:#a5b0a2;margin-top:10px;white-space:nowrap">${desc}</div></div></div>`, card);
      show(row, tr, 32.875);
      cue(tr, 'slam', { n: i });
    });

    // ───────────────────────── Intro / outro HUD ─────────────────────────
    const tIn = add('<div class="head" style="font-size:96px;text-align:center;width:1920px">Saling Jaga</div>', hud);
    tIn.style.left = '0px'; tIn.style.top = '630px'; show(tIn, 1.0, 2.875);
    const sIn = add('<div style="text-align:center;width:1920px;font:500 40px/1.3 \'Plus Jakarta Sans\';color:#c9cdb9">Kalau <b style="color:#f2c46b">C</b> kirim pesan, bagaimana sampai ke semua?</div>', hud);
    sIn.style.left = '0px'; sIn.style.top = '752px'; show(sIn, 1.5, 2.875);
    const chips = add('<div style="width:1920px;display:flex;justify-content:center;gap:22px"></div>', hud);
    chips.style.left = '0px'; chips.style.top = '846px';
    ['A', 'B', 'C', 'D'].forEach((L, i) => {
      const c = add(`<div style="width:84px;height:84px;border-radius:50%;display:flex;align-items:center;justify-content:center;font:800 40px/1 'Plus Jakarta Sans';background:${L === 'C' ? C.lamp : C.card2};color:${L === 'C' ? C.ink : C.cream};box-shadow:inset 0 0 0 3px ${C.line}">${L}</div>`, chips);
      const tc = 2.0 + i * 0.25;
      show(c, tc, 2.875, (t) => `scale(${popS(t, tc, 0.4).toFixed(3)})`);
      cue(tc, 'pop', { n: i });
    });
    cue(1.0, 'swap', { n: 0 }); cue(1.5, 'swap', { n: 1 });

    const tag = add('<div class="head" style="font-size:72px;text-align:center;width:1920px">Saat sinyal hilang, kita tetap <span class="serif">saling jaga.</span></div>', hud);
    tag.style.left = '0px'; tag.style.top = '640px'; show(tag, 33.5, null);
    const url = add('<div class="tag" style="text-align:center;width:1920px;color:#a5b0a2;font-size:30px">saling-jaga.my.id · tanpa server · tanpa sinyal</div>', hud);
    url.style.left = '0px'; url.style.top = '770px'; show(url, 34.0, null);
    cue(33.5, 'cta'); cue(34.0, 'shimmer');

    // bottom caption for the pull-back
    const pb = add('<div style="width:1920px;text-align:center;font:800 54px/1.1 \'Plus Jakarta Sans\';letter-spacing:-.02em">Pesan C sampai ke <span class="serif" style="color:#3cbf6e;font-size:1.14em">kelompok lain.</span></div>', hud);
    pb.style.left = '0px'; pb.style.top = '170px'; show(pb, 27.5, 28.875);
    const pbs = add('<div class="tag" style="width:1920px;text-align:center;color:#a5b0a2;font-size:30px">C → A → LoRa 1 → 2 → 3 → 4 → G → H, I · tanpa sinyal, tanpa server</div>', hud);
    pbs.style.left = '0px'; pbs.style.top = '256px'; show(pbs, 28.0, 28.875);
    cue(27.5, 'swap', { n: 2 }); cue(28.0, 'swap', { n: 3 });

    // ───────────────────────── Captions per scene ─────────────────────────
    caption(3.5, 8.875, '1 · Membentuk grup',
      [[3.625, 'Satu HP <span class="serif">membuat grup.</span>']],
      [[[4.5, '<b>A</b> membuat grup, jadi <span class="l">pusatnya</span>.', '1'],
        [6.0, '<b>B, C, D</b> bergabung ke A lewat Wi‑Fi Direct.', '2'],
        [7.5, 'Jangkauan HP ke HP sekitar <b>50–100 m</b>.', '3']]]);
    caption(9.0, 15.875, '2 · C kirim pesan',
      [[9.125, 'Kalau <b style="color:#f2c46b">C</b> yang <span class="serif">kirim?</span>'], [12.0, 'Lewat <b>A</b> <span class="serif">dulu.</span>']],
      [[[9.5, 'C mengetik pesan untuk seluruh grup…', '']],
       [[12.0, '<span class="a">C</span> kirim ke <b>A</b>, bukan langsung ke B atau D.', '1'],
        [13.0, '<b>A</b> menyalin pesan ke <b>semua anggota lain</b>.', '2'],
        [14.0, '<b>B</b> dan <b>D</b> terima. C tak dapat kiriman balik.', '3'],
        [14.75, '<span class="serif" style="font-size:40px;color:#f2edd5">“Titip ke Ketua RT, lalu diumumkan pakai toa.”</span>', '']]]);
    caption(16.0, 20.875, '3 · HP jembatan',
      [[16.125, 'E dan F <span class="serif">terlalu jauh.</span>']],
      [[[16.5, 'Mereka di luar jangkauan <b>A</b>.', '1'],
        [17.5, '<b>D</b> dekat dengan keduanya: jadi <span class="a">HP jembatan</span>.', '2'],
        [18.5, 'D meneruskan ke E, lalu E ke F.', '3'],
        [20.0, '<span class="l">Tiap HP jembatan menambah jangkauan.</span>', '']]]);
    caption(21.0, 27.25, '4 · LoRa Meshtastic',
      [[21.125, 'Lebih jauh? <span class="serif">Pakai LoRa.</span>'], [23.5, 'Multi LoRa: <span class="serif">estafet radio.</span>']],
      [[[21.5, '<b>A</b> menyerahkan pesan ke alat LoRa.', '1'],
        [22.25, 'LoRa memancar ke <b>segala arah</b>, hingga beberapa km.', '2']],
       [[23.5, 'Tiap alat <b>memancarkan ulang</b>. Hop berkurang: <span class="a">3 → 2 → 1</span>.', '3'],
        [24.0, 'Pesan yang sama datang lagi? <b>Diabaikan</b>, tak berputar.', '4'],
        [25.5, 'Batas hop bawaan Meshtastic: <b>3</b>.', '5']]]);
    cue(9.0, 'whoosh', { v: 0.5 }); cue(16.0, 'whoosh', { v: 0.6 }); cue(24.75, 'whoosh', { v: 0.4 }); cue(27.25, 'whoosh', { v: 0.6 });
    cue(3.625, 'swap', { n: 1 }); cue(9.125, 'swap', { n: 2 }); cue(16.125, 'swap', { n: 3 }); cue(21.125, 'swap', { n: 4 });

    // ───────────────────────── seek ─────────────────────────
    const DUR = 36.0;
    window.seek = (t) => {
      const z = camZ(t);
      world.style.transform = `translate(${AX.at(t).toFixed(2)}px,540px) scale(${z.toFixed(5)}) translate(${(-CX.at(t)).toFixed(2)}px,${(-CY.at(t)).toFixed(2)}px)`;
      for (const d of draws) d(t);
    };
    // dedupe identical cues, check the grid
    const seen = new Set();
    const out = cues.filter((c) => { const key = c.t + c.k; if (seen.has(key)) return false; seen.add(key); return true; });
    out.forEach((c) => { const g = c.t / 0.125; if (Math.abs(g - Math.round(g)) > 1e-6) throw new Error('cue off grid: ' + JSON.stringify(c)); });
    out.sort((a, b) => a.t - b.t);
    window.FILM = { width: 1920, height: 1080, bpm: 120, duration: DUR,
      sections: { intro: [0, 3], drop: [22, 26], outro: [33, DUR] }, cues: out };
    window.seek(0);
    window.READY = true;
  } catch (err) {
    console.error(err);
    window.FILM_ERROR = String(err && err.stack || err);
  }
})();
