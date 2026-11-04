// Saling Jaga · Gandengan tangan. Landscape 1920×1080, 120 BPM, 35 s.
// The logo disc becomes HP "A" (the hero shape, never cut). Every phone is a person; Wi‑Fi Direct is
// their hand. A drags B into reach → they hold hands → C, D, E join (the chain reaches further) →
// a message is passed A→B→C→D→E → a second group across a river → LoRa Meshtastic is the bridge
// (drop) → SOS crosses back to A → A morphs into the real range ladder → back to the logo.
(async function () {
  try {
    const { clamp, lerp, stepR, Track, ColorTrack, SP, vis, applyVis, press, ripple, mix, outQ, inOut } = M;
    const C = { night: '#07110c', night2: '#0b1811', card: '#0f1f17', card2: '#13271d', cream: '#f2edd5', muted: '#a5b0a2',
      dim: '#6f7c6f', leaf: '#3cbf6e', ink: '#04140a', moss: '#1b4d2e', lamp: '#f2c46b', sos: '#ef4b4b' };

    await Promise.all([
      document.fonts.load('800 64px "Plus Jakarta Sans"'), document.fonts.load('500 36px "Plus Jakarta Sans"'),
      document.fonts.load('700 24px "Plus Jakarta Sans"'), document.fonts.load('600 24px "JetBrains Mono"'),
      document.fonts.load('italic 400 72px "Instrument Serif"'),
    ].map((p) => p.catch(() => null)));
    await document.fonts.ready;

    const cues = [];
    const cue = (t, k, o = {}) => cues.push({ t, k, ...o });
    const world = document.getElementById('world');
    const hud = document.getElementById('hud');
    const draws = [];
    const add = (html, parent = world) => { const d = document.createElement('div'); d.innerHTML = html.trim(); const e = d.firstElementChild; parent.appendChild(e); return e; };
    const show = (e, tin, tout, extra = '') => draws.push((t) => applyVis(e, vis(t, tin, tout), typeof extra === 'function' ? extra(t) : extra));
    const popIn = (tin, s0 = 0.6) => (t) => (s0 + (1 - s0) * stepR(t - tin, SP.pop));
    const P = (d, sw = 2.4) => `<svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
    const I = {
      check: P('<path d="M20 6 9 17l-5-5"/>', 3),
      send: P('<path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4z"/>'),
      nosig: P('<path d="M2 20h.01M7 20v-4M12 20v-8M17 20V8M22 4 14 12M14 4l8 8"/>'),
    };
    const NS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('width', '1'); svg.setAttribute('height', '1'); svg.style.overflow = 'visible';
    world.appendChild(svg);
    const sv = (tag, attrs = {}, parent = svg) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); parent.appendChild(e); return e; };

    const Y = 640, R = 66;         // node row and node radius (world px)

    // ───────────────────────── Camera ─────────────────────────
    const CX = new Track(560), CY = new Track(740), CZ = new Track(0);
    const camTo = (t, x, y, z, sp = SP.cam) => { CX.to(t, x, sp); CY.to(t, y, sp); CZ.to(t, Math.log(z), sp); };
    camTo(3.0, 720, 528, 1.25);
    camTo(8.0, 1200, 500, 1.0);
    camTo(19.5, 2010, 364, 0.58);
    CZ.to(22.0, Math.log(0.62), { w: 18, z: 0.8 }).to(22.5, Math.log(0.58), SP.cam);
    camTo(27.0, 560, 600, 1.0, { w: 6, z: 1 });
    camTo(31.0, 560, 700, 1.0);

    // ───────────────────────── Captions (HUD, top-left) ─────────────────────────
    function caption(tin, tout, kicker, heads, subs) {
      const k = add(`<div class="kick">${kicker}</div>`, hud); k.style.left = '120px'; k.style.top = '92px';
      show(k, tin, tout);
      heads.forEach(([ts, html], i) => {
        const h = add(`<div class="head">${html}</div>`, hud); h.style.left = '120px'; h.style.top = '136px';
        show(h, ts, heads[i + 1] ? heads[i + 1][0] - 0.125 : tout);
      });
      subs.forEach(([ts, html], i) => {
        const s = add(`<div class="sub">${html}</div>`, hud); s.style.left = '120px'; s.style.top = '228px';
        show(s, ts, subs[i + 1] ? subs[i + 1][0] - 0.125 : tout);
      });
    }

    // ───────────────────────── SVG backdrop: ring, river, links, bridge ─────────────────────────
    // A's reach (dashed ring)
    const ring = sv('circle', { cx: 560, cy: Y, r: 330, fill: 'none', 'stroke-width': 3, 'stroke-dasharray': '10 14' });
    draws.push((t) => {
      const v = vis(t, 3.5, 11.875);
      const hi = clamp((t - 10.0) / 0.3) * (1 - clamp((t - 11.6) / 0.3));
      ring.setAttribute('stroke', mix(C.dim, C.leaf, hi));
      ring.style.opacity = v.gone ? 0 : (v.o * (0.45 + 0.4 * hi)).toFixed(3);
      ring.setAttribute('r', (330 * (0.7 + 0.3 * v.e)).toFixed(1));
    });

    // River between the two groups
    const river = sv('g');
    sv('rect', { x: 1990, y: 240, width: 660, height: 1000, rx: 40, fill: '#0c2419' }, river);
    for (let i = 0; i < 6; i++) {
      const x0 = 2050 + i * 105;
      sv('path', { d: `M${x0} 300 q 26 60 0 120 t 0 120 t 0 120 t 0 120 t 0 120 t 0 120`, fill: 'none', stroke: '#2a5a40', 'stroke-width': 5, 'stroke-linecap': 'round' }, river);
    }
    draws.push((t) => {
      const v = vis(t, 19.75, 26.875);
      river.style.opacity = v.gone ? 0 : v.o.toFixed(3);
      river.setAttribute('transform', `translate(0 ${(-((t * 40) % 120)).toFixed(1)})`);
    });
    const riverClip = sv('clipPath', { id: 'rc' }); sv('rect', { x: 1990, y: 240, width: 660, height: 860, rx: 40 }, riverClip);
    river.setAttribute('clip-path', 'url(#rc)');
    // the clip moves with the group, so counter-translate the clip rect
    draws.push((t) => { riverClip.firstChild.setAttribute('y', (240 + ((t * 40) % 120)).toFixed(1)); });

    // Nodes (people = phones). X is a function of time.
    const nodes = {};
    const linkLayer = sv('g');
    function node(id, X, tin, tout, bg, fg) {
      const n = { id, X, tin, tout };
      if (id !== 'A') {
        n.el = add(`<div class="node"><div class="disc" style="background:${bg};color:${fg}">${id}</div></div>`);
        draws.push((t) => {
          const v = vis(t, tin, tout);
          let s = popIn(tin)(t);
          if (n.held && n.held(t)) s *= 1.08;
          applyVis(n.el, v, '');
          n.el.style.transform = `translate(${(X(t) - R).toFixed(2)}px,${(Y - R + v.dy).toFixed(2)}px) scale(${s.toFixed(3)})`;
        });
      }
      nodes[id] = n;
      return n;
    }

    // B is dragged by the cursor (direct manipulation), then springs home on release.
    const KX = new Track(1520), KY = new Track(960);
    const HOLD0 = 4.5, HOLD1 = 5.5, B0 = 1300, BH = 880;
    const bHeld = (t) => KX.at(t) - (KX.at(HOLD0) - B0);
    const bRel = bHeld(HOLD1);
    const bX = (t) => t < HOLD0 ? B0 : t < HOLD1 ? bHeld(t) : bRel + (BH - bRel) * stepR(t - HOLD1, SP.shape);

    node('A', () => 560, 3.0, 26.875);
    node('B', bX, 4.0, 26.875, C.cream, C.ink).held = (t) => t > HOLD0 && t < HOLD1;
    node('C', () => 1200, 8.5, 26.875, C.cream, C.ink);
    node('D', () => 1520, 9.0, 26.875, C.cream, C.ink);
    node('E', () => 1840, 9.5, 26.875, C.cream, C.ink);
    node('F', () => 2800, 20.0, 26.875, C.moss, C.cream);
    node('G', () => 3120, 20.25, 26.875, C.moss, C.cream);
    node('H', () => 3440, 20.5, 26.875, C.moss, C.cream);
    cue(4.0, 'pop'); cue(8.5, 'pop', { n: 1 }); cue(9.0, 'pop', { n: 2 }); cue(9.5, 'pop', { n: 3 });
    cue(20.0, 'pop', { n: 0 }); cue(20.25, 'pop', { n: 1 }); cue(20.5, 'pop', { n: 2 });

    // Links = two arms reaching for each other; a clasp where the hands meet.
    // lit: [[on, off, colour]] while a message travels over it.
    function link(a, b, tr, tout, lit = []) {
      const g = sv('g', {}, linkLayer);
      const l1 = sv('line', { 'stroke-width': 12, 'stroke-linecap': 'round' }, g);
      const l2 = sv('line', { 'stroke-width': 12, 'stroke-linecap': 'round' }, g);
      const clasp = sv('circle', { r: 15 }, g);
      draws.push((t) => {
        const v = vis(t, tr, tout);
        if (t < tr || v.gone) { g.style.opacity = 0; return; }
        g.style.opacity = v.o.toFixed(3);
        const ax = nodes[a].X(t) + R - 4, bx = nodes[b].X(t) - R + 4, mid = (ax + bx) / 2;
        const pl = clamp(stepR(t - tr, { w: 22, z: 0.9 })), pr = clamp(stepR(t - tr, { w: 15, z: 0.9 }));
        l1.setAttribute('x1', ax); l1.setAttribute('y1', Y); l1.setAttribute('x2', lerp(ax, mid, pl)); l1.setAttribute('y2', Y);
        l2.setAttribute('x1', bx); l2.setAttribute('y1', Y); l2.setAttribute('x2', lerp(bx, mid, pr)); l2.setAttribute('y2', Y);
        let col = '#8f9a88';
        for (const [on, off, c] of lit) { const x = clamp((t - on) / 0.2) * (1 - clamp((t - off) / 0.3)); if (x > 0) col = mix('#8f9a88', c, x); }
        l1.setAttribute('stroke', col); l2.setAttribute('stroke', col);
        const cs = popIn(tr + 0.25, 0)(t);
        clasp.setAttribute('cx', mid); clasp.setAttribute('cy', Y);
        clasp.setAttribute('r', (15 * cs).toFixed(2));
        clasp.setAttribute('fill', col === '#8f9a88' ? C.cream : col);
      });
    }
    const LIT3 = (on) => [[on, 19.375, C.leaf]];
    link('A', 'B', 5.5, 26.875, [...LIT3(15.0), [25.75, 26.875, C.sos]]);
    link('B', 'C', 8.75, 26.875, [...LIT3(16.0), [25.5, 26.875, C.sos]]);
    link('C', 'D', 9.25, 26.875, [...LIT3(17.0), [25.25, 26.875, C.sos]]);
    link('D', 'E', 9.75, 26.875, [...LIT3(18.0), [25.0, 26.875, C.sos]]);
    link('F', 'G', 20.75, 26.875, [[23.5, 26.875, C.sos]]);
    link('G', 'H', 21.0, 26.875, [[23.0, 26.875, C.sos]]);
    cue(5.5, 'release'); cue(5.75, 'check');
    cue(8.75, 'click'); cue(9.0, 'check'); cue(9.25, 'click'); cue(9.5, 'check'); cue(9.75, 'click'); cue(10.0, 'check');
    cue(20.75, 'click'); cue(21.0, 'click');

    // E reaches for F across the river and can't
    const reach = sv('line', { 'stroke-width': 12, 'stroke-linecap': 'round', stroke: '#8f9a88', 'stroke-dasharray': '2 20' });
    draws.push((t) => {
      const p = stepR(t - 20.5, { w: 14, z: 0.75 }) - stepR(t - 21.0, { w: 12, z: 1 });
      if (t < 20.5 || p < 0.01) { reach.style.opacity = 0; return; }
      reach.style.opacity = 1;
      const x0 = 1840 + R;
      reach.setAttribute('x1', x0); reach.setAttribute('y1', Y); reach.setAttribute('x2', x0 + 250 * p); reach.setAttribute('y2', Y);
    });
    cue(20.5, 'drag', { d: 0.5 });
    const noReach = add('<div class="tag" style="color:#ef4b4b;font-size:40px">✕ tak sampai</div>');
    draws.push((t) => { const v = vis(t, 20.75, 21.75); applyVis(noReach, v, ''); noReach.style.transform = `translate(${1960}px,${Y + 110 + v.dy}px)`; });

    // LoRa devices + the bridge
    const devSvg = '<svg viewBox="0 0 80 170" width="80" height="170"><path d="M40 4v58" stroke="#f2edd5" stroke-width="7" stroke-linecap="round"/><circle cx="40" cy="6" r="8" fill="#f2c46b"/><rect x="6" y="60" width="68" height="104" rx="16" fill="#f2edd5"/><rect x="18" y="76" width="44" height="30" rx="6" fill="#13271d"/><circle cx="40" cy="136" r="9" fill="#3cbf6e"/></svg>';
    const devs = [[1975, 'E'], [2665, 'F']].map(([x]) => {
      const d = add(`<div style="width:80px;height:170px">${devSvg}<div class="tag" style="position:absolute;left:50%;top:186px;transform:translateX(-50%);color:#f2c46b;font-size:34px">LoRa</div></div>`);
      draws.push((t) => {
        const v = vis(t, 21.0, 26.875); applyVis(d, v, '');
        d.style.transform = `translate(${x - 40}px,${Y - 150 + v.dy}px) scale(${popIn(21.0, 0.4)(t).toFixed(3)})`;
      });
      return d;
    });
    cue(21.0, 'born'); cue(21.0, 'riser', { d: 1.0 });
    const BR = { x0: 1975, y0: Y - 146, cx: 2320, cy: 60, x1: 2665, y1: Y - 146 };
    const bridgeD = `M${BR.x0} ${BR.y0} Q${BR.cx} ${BR.cy} ${BR.x1} ${BR.y1}`;
    const bridge = sv('path', { d: bridgeD, fill: 'none', 'stroke-width': 14, 'stroke-linecap': 'round', pathLength: 1 });
    const waves = [0, 1].map(() => [0, 1, 2].map(() => sv('circle', { fill: 'none', 'stroke-width': 4, stroke: C.lamp })));
    draws.push((t) => {
      const v = vis(t, 22.0, 26.875);
      const p = clamp(stepR(t - 22.0, { w: 12, z: 1 }));
      bridge.style.opacity = t < 22 || v.gone ? 0 : v.o.toFixed(3);
      bridge.setAttribute('stroke-dasharray', `${p.toFixed(4)} 1`);
      let col = C.leaf; const x = clamp((t - 24.0) / 0.2); if (x > 0) col = mix(C.leaf, C.sos, x);
      bridge.setAttribute('stroke', col);
      waves.forEach((ws, j) => ws.forEach((c, i) => {
        const ph = ((t - 22.0) / 1.0 + i / 3) % 1;
        if (t < 22 || v.gone) { c.style.opacity = 0; return; }
        c.setAttribute('cx', j ? BR.x1 : BR.x0); c.setAttribute('cy', BR.y0 - 10);
        c.setAttribute('r', (20 + 90 * ph).toFixed(1)); c.style.opacity = (0.55 * (1 - ph) * v.o).toFixed(3);
      }));
    });
    const brLabel = add('<div class="tag" style="color:#f2edd5;font-size:44px;font-weight:600">jembatan LoRa · hingga beberapa km</div>');
    draws.push((t) => {
      const v = vis(t, 22.25, 26.875); applyVis(brLabel, v, '');
      brLabel.style.transform = `translate(${2320 - brLabel.offsetWidth / 2}px,${110 + v.dy}px)`;
    });
    cue(22.0, 'drop');
    const rvLabel = add('<div class="tag" style="color:#a5b0a2;font-size:40px">sungai</div>');
    draws.push((t) => { const v = vis(t, 20.0, 26.875); applyVis(rvLabel, v, ''); rvLabel.style.transform = `translate(${2320 - rvLabel.offsetWidth / 2}px,${900 + v.dy}px)`; });

    // Ruler between A and B: "sekitar 50–100 m"
    const ruler = add(`<div style="width:${BH - 560}px;height:60px"><div style="position:absolute;left:0;right:0;top:12px;height:3px;background:#f2c46b"></div><div style="position:absolute;left:0;top:0;width:3px;height:27px;background:#f2c46b"></div><div style="position:absolute;right:0;top:0;width:3px;height:27px;background:#f2c46b"></div><div class="tag" style="position:absolute;left:50%;top:36px;transform:translateX(-50%);color:#f2c46b;font-size:26px">sekitar 50–100 m</div></div>`);
    draws.push((t) => { const v = vis(t, 6.5, 7.875); applyVis(ruler, v, ''); ruler.style.transform = `translate(560px,${Y + 96 + v.dy}px)`; });
    cue(6.5, 'tick');

    // Bracket under the chain: A … E
    const brk = add(`<div style="width:${1840 - 560}px;height:80px"><div style="position:absolute;left:0;right:0;top:0;height:24px;border:3px solid #3cbf6e;border-top:none;border-radius:0 0 14px 14px"></div><div class="tag" style="position:absolute;left:50%;top:44px;transform:translateX(-50%);color:#3cbf6e;font-size:30px">A sampai ke E lewat 3 teman di tengah</div></div>`);
    draws.push((t) => { const v = vis(t, 10.5, 11.875); applyVis(brk, v, ''); brk.style.transform = `translate(560px,${Y + 100 + v.dy}px)`; });
    cue(10.5, 'swap', { n: 2 });

    // Pulses + relay badges on nodes
    const pulses = [['A', 14.5, C.leaf], ['B', 15.5, C.leaf], ['C', 16.5, C.leaf], ['D', 17.5, C.leaf], ['E', 18.5, C.leaf],
      ['H', 23.0, C.sos], ['G', 23.5, C.sos], ['F', 24.0, C.sos], ['E', 25.0, C.sos], ['D', 25.25, C.sos], ['C', 25.5, C.sos], ['B', 25.75, C.sos], ['A', 26.0, C.sos], ['A', 26.5, C.sos]];
    pulses.forEach(([id, tp, col]) => {
      const p = add(`<div class="pulse" style="border:5px solid ${col}"></div>`);
      draws.push((t) => {
        const x = (t - tp) / 0.7;
        if (x < 0 || x > 1) { p.style.visibility = 'hidden'; return; }
        p.style.visibility = 'visible';
        p.style.opacity = (0.9 * (1 - x)).toFixed(3);
        p.style.transform = `translate(${nodes[id].X(t) - R}px,${Y - R}px) scale(${lerp(1, 2.1, outQ(x)).toFixed(3)})`;
      });
    });
    [['B', 15.5], ['C', 16.5], ['D', 17.5], ['E', 18.5]].forEach(([id, ta]) => {
      const b = add(`<div style="width:46px;height:46px;border-radius:50%;background:#3cbf6e;color:#04140a;padding:10px;box-sizing:border-box;box-shadow:0 0 0 5px #07110c">${I.check}</div>`);
      draws.push((t) => { const v = vis(t, ta, 19.375); applyVis(b, v, ''); b.style.transform = `translate(${nodes[id].X(t) + 30}px,${Y - 74}px) scale(${popIn(ta, 0.3)(t).toFixed(3)})`; });
    });
    cue(15.5, 'note', { n: 0 }); cue(16.5, 'note', { n: 1 }); cue(17.5, 'note', { n: 2 }); cue(18.5, 'note', { n: 3 }); cue(18.5, 'check');

    // ───────────────────────── Message pill (scene 3) ─────────────────────────
    const MSG = 'Kumpul di Pos 3';
    const K0 = 12.5, KEYS = [...MSG].map((_, i) => K0 + i * 0.125), SEND = 14.5;
    KEYS.forEach((tk) => cue(tk, 'key'));
    const msg = add(`<div style="height:84px;border-radius:42px;background:#f2edd5;color:#04140a;display:flex;align-items:center;gap:14px;padding:0 12px 0 30px;box-sizing:border-box;white-space:nowrap;box-shadow:0 24px 50px -20px rgba(0,0,0,.8)">
      <span style="font:700 34px/1 'Plus Jakarta Sans'"><span class="tx"></span><span class="caret" style="display:inline-block;width:3px;height:36px;background:#1b4d2e;vertical-align:-6px;margin-left:3px"></span></span>
      <span class="sb" style="width:60px;height:60px;border-radius:50%;background:#3cbf6e;color:#04140a;padding:15px;box-sizing:border-box;flex:none">${I.send}</span></div>`);
    const tx = msg.querySelector('.tx'), caret = msg.querySelector('.caret'), sb = msg.querySelector('.sb');
    tx.textContent = MSG; msg.style.width = 'auto';
    const MW = msg.offsetWidth; // full width with text
    const hopsA = [[15.0, 15.5, 560, () => nodes.B.X(15.5)], [16.0, 16.5, 880, 1200], [17.0, 17.5, 1200, 1520], [18.0, 18.5, 1520, 1840]];
    hopsA.forEach(([d]) => cue(d, 'whoosh', { v: 0.35 }));
    function hopPos(t, hops, rest, lift) {
      if (t < hops[0][0]) return { x: hops[0][2], y: rest, travel: false };
      for (const [d, a, f, to] of hops) {
        const fx = typeof f === 'function' ? f() : f, tx2 = typeof to === 'function' ? to() : to;
        if (t < d) return { x: fx, y: rest };
        if (t < a) { const u = inOut((t - d) / (a - d)); return { x: lerp(fx, tx2, u), y: rest - Math.sin(Math.PI * u) * lift, travel: true }; }
      }
      const l = hops[hops.length - 1]; return { x: typeof l[3] === 'function' ? l[3]() : l[3], y: rest };
    }
    const offX = new Track(0).to(12.0, 1, SP.shape).to(SEND, 0, SP.shape); // pill sits to the right of A while composing
    const msgS = new Track(1).to(SEND + 0.125, 0.78, SP.shape);
    draws.push((t) => {
      const v = vis(t, 12.0, 19.375); applyVis(msg, v, '');
      if (v.gone) return;
      const n = KEYS.filter((k) => t >= k).length;
      tx.textContent = MSG.slice(0, n);
      caret.style.opacity = t < SEND && (Math.floor(t * 4) % 2 === 0 || (n > 0 && n < MSG.length)) ? 1 : 0;
      const sbv = vis(t, 12.0, SEND + 0.125); sb.style.opacity = sbv.o.toFixed(3);
      sb.style.transform = `scale(${press(t, SEND).toFixed(3)})`;
      const w = msg.offsetWidth;
      const p = hopPos(t, hopsA, Y - 170, 70);
      const x = p.x - w / 2 + offX.at(t) * (w / 2 - 40);
      msg.style.transform = `translate(${x.toFixed(1)}px,${(p.y - 42 + v.dy).toFixed(1)}px) scale(${(msgS.at(t) * popIn(12.0, 0.7)(t)).toFixed(3)})`;
    });
    cue(12.0, 'pop'); cue(SEND, 'click');

    // ───────────────────────── SOS pill (scene 4) ─────────────────────────
    const sos = add(`<div style="width:200px;height:96px;border-radius:48px;background:#ef4b4b;color:#fff;display:flex;align-items:center;justify-content:center;font:800 52px/1 'Plus Jakarta Sans';letter-spacing:.02em;box-shadow:0 24px 50px -20px rgba(0,0,0,.8)">SOS</div>`);
    const hopsS = [[23.0, 23.5, 3440, 3120], [23.5, 24.0, 3120, 2800], [24.0, 25.0, 2800, 1840], [25.0, 25.25, 1840, 1520], [25.25, 25.5, 1520, 1200], [25.5, 25.75, 1200, 880], [25.75, 26.0, 880, 560]];
    draws.push((t) => {
      const v = vis(t, 22.75, 26.875); applyVis(sos, v, '');
      if (v.gone) return;
      let x, y;
      if (t >= 24.0 && t < 25.0) { // across the bridge (quadratic bezier F → E, lifted above the arc)
        const u = inOut((t - 24.0) / 1.0), a = 1 - u;
        x = a * a * 2800 + 2 * a * u * 2320 + u * u * 1840; y = a * a * (Y - 180) + 2 * a * u * (BR.cy - 40) + u * u * (Y - 180);
      } else { const p = hopPos(t, hopsS, Y - 180, 60); x = p.x; y = p.y; }
      const s = popIn(22.75, 0.5)(t) * (1 + 0.1 * Math.exp(-Math.max(0, t - 26.0) * 8) * (t > 26 ? 1 : 0));
      sos.style.transform = `translate(${(x - 100).toFixed(1)}px,${(y - 48 + v.dy).toFixed(1)}px) scale(${s.toFixed(3)})`;
    });
    cue(22.75, 'pop'); cue(23.0, 'alert'); cue(23.5, 'pop', { n: 1 }); cue(24.0, 'whoosh', { v: 0.8 }); cue(25.0, 'pop', { n: 2 });
    cue(25.25, 'tick'); cue(25.5, 'tick'); cue(25.75, 'tick'); cue(26.0, 'alert'); cue(26.5, 'settle');

    // ───────────────────────── Hero shape: logo → A → range card → logo ─────────────────────────
    const hero = add('<div id="hero"></div>');
    const logo = add('<img src="assets/mark.png" alt="">', hero);
    await new Promise((r) => { if (logo.complete) r(); else { logo.onload = r; logo.onerror = r; } });
    const letterA = add('<div style="font:800 60px/1 \'Plus Jakarta Sans\';color:#04140a;transform:translate(-50%,-50%)">A</div>', hero);
    const H = { x: new Track(560), y: new Track(Y), w: new Track(0), h: new Track(0), r: new Track(150), bg: new ColorTrack(C.cream), bd: new Track(0) };
    const st = (t, x, y, w, h, r, bg, bd = 0, sp = SP.shape) => { H.x.to(t, x, sp); H.y.to(t, y, sp); H.w.to(t, w, sp); H.h.to(t, h, sp); H.r.to(t, r, sp); H.bg.to(t, bg, { w: 28, z: 1 }); H.bd.to(t, bd, SP.soft); };
    H.w.to(0.5, 300, SP.pop); H.h.to(0.5, 300, SP.pop); cue(0.5, 'born');
    st(3.0, 560, Y, 132, 132, 66, C.leaf); cue(3.0, 'whoosh', { v: 0.6 }); cue(3.0, 'swap', { n: 0 });
    st(27.0, 560, 600, 1520, 660, 44, C.card, 0.12, { w: 14, z: 0.85 }); cue(27.0, 'whoosh', { v: 0.7 }); cue(27.0, 'swap', { n: 1 });
    st(31.0, 560, 600, 300, 300, 150, C.cream, 0); cue(31.0, 'settle');
    const aSos = (t) => clamp((t - 26.0) / 0.15) * (1 - clamp((t - 26.875) / 0.2));
    draws.push((t) => {
      const w = Math.max(0, H.w.at(t)), h = Math.max(0, H.h.at(t)), x = H.x.at(t), y = H.y.at(t);
      const r = Math.min(H.r.at(t), w / 2, h / 2);
      let s = press(t, SEND) * (1 + 0.12 * Math.exp(-Math.max(0, t - 26) * 7) * (t > 26 && t < 27 ? 1 : 0));
      hero.style.width = w + 'px'; hero.style.height = h + 'px';
      hero.style.transform = `translate(${(x - w / 2).toFixed(2)}px,${(y - h / 2).toFixed(2)}px) scale(${s.toFixed(3)})`;
      hero.style.borderRadius = r.toFixed(2) + 'px';
      let bg = H.bg.at(t); const sx = aSos(t); if (sx > 0) bg = `color-mix(in srgb, ${bg} ${(100 - sx * 100).toFixed(1)}%, ${C.sos})`;
      hero.style.background = bg;
      hero.style.boxShadow = `inset 0 0 0 2px rgba(242,237,213,${clamp(H.bd.at(t), 0, 1).toFixed(3)}), 0 50px 100px -40px rgba(0,0,0,.85)`;
      const lv = t < 10 ? vis(t, 0.625, 2.875) : vis(t, 31.25, null);
      const sz = Math.min(w, h) * 0.86;
      logo.style.width = sz + 'px'; logo.style.height = sz + 'px';
      applyVis(logo, lv, '');
      logo.style.transform = `translate(-50%,-50%) translateY(${lv.dy.toFixed(2)}px) scale(${(0.85 + 0.15 * lv.e).toFixed(3)})`;
      const av = vis(t, 3.125, 26.875);
      applyVis(letterA, av, '');
      letterA.style.transform = `translate(-50%,-50%) translateY(${av.dy.toFixed(2)}px)`;
      letterA.style.color = sx > 0.5 ? '#fff' : C.ink;
    });

    // Range card content (real figures from saling-jaga.my.id "Jangkauan")
    const card = add('<div style="width:1520px;height:660px;margin:-330px 0 0 -760px;padding:56px 72px;box-sizing:border-box"></div>', hero);
    const ck = add('<div class="kick">Ringkasnya</div>', card);
    const ch = add('<div class="head" style="font-size:52px;margin-top:18px">Jangkauan bisa ditambah, <span class="serif">selangkah demi selangkah.</span></div>', card);
    show(ck, 27.25, 30.875); show(ch, 27.375, 30.875);
    const rows = [['50–100', 'm', 'HP ke HP', 'Gandengan tangan langsung, Wi‑Fi Direct', 8],
      ['+1', 'HP', 'HP jembatan', 'Teman di tengah meneruskan pesan', 18],
      ['1–3', 'km', 'Wi‑Fi posko', 'Wi‑Fi gedung atau antena jarak jauh', 55],
      ['km+', 'LoRa', 'Gerbang LoRa', 'Alat Meshtastic, antar kelompok', 100]];
    rows.forEach(([num, unit, title, desc, pct], i) => {
      const tr = 27.75 + i * 0.5;
      const row = add(`<div style="position:absolute;left:72px;top:${196 + i * 104}px;width:1376px;height:88px;display:flex;align-items:center;gap:36px">
        <div style="width:250px;font:800 54px/1 'Plus Jakarta Sans';letter-spacing:-.03em;color:${i === 3 ? '#f2c46b' : '#3cbf6e'};white-space:nowrap">${num}<span style="font:600 26px 'JetBrains Mono';margin-left:8px;color:#a5b0a2">${unit}</span></div>
        <div style="width:640px"><div style="font:700 32px/1.1 'Plus Jakarta Sans'">${title}</div><div style="font:500 24px/1.3 'Plus Jakarta Sans';color:#a5b0a2;margin-top:6px;white-space:nowrap">${desc}</div></div>
        <div style="flex:1;height:14px;border-radius:7px;background:#1b2f23;position:relative;overflow:hidden"><i style="position:absolute;left:0;top:0;bottom:0;border-radius:7px;background:${i === 3 ? '#f2c46b' : '#3cbf6e'}"></i></div></div>`, card);
      const bar = row.querySelector('i');
      draws.push((t) => { applyVis(row, vis(t, tr, 30.875), ''); bar.style.width = (pct * clamp(stepR(t - tr - 0.125, { w: 12, z: 1 }))).toFixed(2) + '%'; });
      cue(tr, 'slam', { n: i });
    });

    // ───────────────────────── Intro / outro HUD ─────────────────────────
    const tIn = add('<div class="head" style="font-size:104px;text-align:center;width:1920px">Saling Jaga</div>', hud);
    tIn.style.left = '0px'; tIn.style.top = '630px'; show(tIn, 1.0, 2.875);
    const sIn = add('<div class="sub" style="text-align:center;width:1920px;font-size:40px">Bagaimana HP bisa <span class="l">saling terhubung</span> saat sinyal hilang?</div>', hud);
    sIn.style.left = '0px'; sIn.style.top = '770px'; show(sIn, 1.5, 2.875);
    const chip = add(`<div style="display:flex;align-items:center;gap:12px;padding:14px 22px;border-radius:999px;background:#13271d;box-shadow:inset 0 0 0 2px rgba(242,237,213,.16);font:600 26px/1 'JetBrains Mono';color:#ef4b4b;white-space:nowrap"><span style="width:30px;height:30px;display:inline-flex">${I.nosig}</span>0 bar sinyal</div>`, hud);
    chip.style.left = '1090px'; chip.style.top = '270px';
    show(chip, 2.0, 2.875, (t) => `scale(${popIn(2.0, 0.5)(t).toFixed(3)})`);
    cue(1.0, 'swap', { n: 0 }); cue(1.5, 'swap', { n: 1 }); cue(2.0, 'alert');

    const tag = add('<div class="head" style="font-size:72px;text-align:center;width:1920px">Saat sinyal hilang, kita tetap <span class="serif">saling jaga.</span></div>', hud);
    tag.style.left = '0px'; tag.style.top = '660px'; show(tag, 31.5, null);
    const url = add('<div class="tag" style="text-align:center;width:1920px;color:#a5b0a2;font-size:30px">saling-jaga.my.id · APK gratis · Android 6.0+</div>', hud);
    url.style.left = '0px'; url.style.top = '790px'; show(url, 32.25, null);
    cue(31.5, 'cta'); cue(32.25, 'shimmer');

    // ───────────────────────── Captions per scene ─────────────────────────
    caption(3.0, 7.875, '1 · Gandengan tangan',
      [[3.125, 'Setiap HP itu <span class="serif">satu orang.</span>']],
      [[3.5, 'Sinyal Wi‑Fi Direct-nya adalah <b>tangannya</b>.'], [5.5, 'Cukup dekat? <span class="l">Langsung bergandengan.</span>'], [6.5, 'Tapi tangan cuma sampai <b>sekitar 50–100 m</b>.']]);
    caption(8.0, 11.875, '2 · Rantai',
      [[8.125, 'Makin banyak gandengan, <span class="serif">makin jauh.</span>']],
      [[8.5, 'Tiap orang memegang tangan tetangganya.'], [10.5, 'A tak sampai ke E sendirian, <span class="l">tapi rantainya sampai.</span>']]);
    caption(12.0, 19.375, '3 · Cara pesan dikirim',
      [[12.125, 'Seperti <span class="serif">pesan berantai.</span>']],
      [[12.5, 'A menulis pesan…'], [15.0, '<b>A</b> bilang ke <b>B</b>.'], [16.0, '<b>B</b> bilang ke <b>C</b>.'], [17.0, '<b>C</b> bilang ke <b>D</b>… dan seterusnya.'], [18.5, 'Sampai ke <b>E</b>. <span class="l">Tanpa internet, tanpa BTS.</span>']]);
    caption(19.5, 26.875, '4 · Jembatan LoRa',
      [[19.625, 'Kalau dua kelompok <span class="serif">terlalu jauh?</span>'], [22.0, 'Alat LoRa adalah <span class="serif">jembatannya.</span>']],
      [[20.0, 'Tangan tak bisa menyeberangi sungai.'], [21.0, 'Tiap kelompok pegang <b>alat LoRa Meshtastic</b>.'], [22.25, 'Pesan &amp; SOS menyeberang, <span class="l">hingga beberapa km.</span>'], [23.0, '<b>H</b> kirim <span class="r">SOS</span>, dioper lewat tangan…'], [24.0, '…menyeberang jembatan LoRa…'], [25.0, '…lalu berantai lagi sampai ke <b>A</b>.']]);
    [3.5, 5.5, 6.5, 8.0, 8.5, 12.0, 12.5, 15.0, 16.0, 17.0, 19.5, 20.0, 22.25, 23.0, 24.0, 25.0].forEach((ts, i) => { if (![5.5, 12.5, 15.0, 16.0, 17.0, 23.0, 24.0, 25.0].includes(ts)) cue(ts, 'swap', { n: i % 5 }); });
    cue(8.0, 'whoosh', { v: 0.5 }); cue(19.5, 'whoosh', { v: 0.7 });

    // ───────────────────────── Cursor "Kamu" ─────────────────────────
    const cur = add(`<div class="cur"><svg viewBox="0 0 24 24"><path d="M4 2.5 20 11l-7 1.8L9.6 20z" fill="#f2edd5" stroke="#04140a" stroke-width="1.4" stroke-linejoin="round"/></svg><div class="pill">Kamu</div></div>`);
    const rip = add('<div class="rip"></div>');
    const mv = (t, x, y, sp = SP.cursor) => { KX.to(t, x, sp); KY.to(t, y, sp); };
    mv(3.75, B0 + 12, Y + 14);                    // onto B, press 4.5
    mv(HOLD0, BH + 12, Y + 14, { w: 9, z: 1 });    // drag B into A's reach
    mv(5.75, 1150, 900);                           // away
    mv(13.5, 1100, 820, SP.snap);
    mv(13.625, 478 + MW, Y - 160);         // send button, click 14.5
    mv(14.75, 1100, 860);
    const CLK = [HOLD0, SEND];
    const curOn = (t) => (t > 3.75 && t < 6.25) || (t > 13.625 && t < 15.25);
    draws.push((t) => {
      if (!curOn(t)) { cur.style.visibility = 'hidden'; rip.style.visibility = 'hidden'; return; }
      cur.style.visibility = 'visible';
      const x = KX.at(t), y = KY.at(t), vx = (x - KX.at(t - 0.016)) / 0.016;
      let s = 1; CLK.forEach((tc) => { s *= press(t, tc); }); if (t > HOLD0 && t < HOLD1) s *= 0.9;
      const fade = Math.min(clamp((t - 3.75) / 0.2) + (t > 13 ? 1 : 0), 1) * (1 - clamp((t - 6.0) / 0.25) * (t < 7 ? 1 : 0)) * (t > 13 ? 1 - clamp((t - 15.0) / 0.25) : 1);
      cur.style.opacity = fade.toFixed(3);
      cur.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) rotate(${clamp(-vx * 0.0045, -14, 14).toFixed(2)}deg) scale(${s.toFixed(3)})`;
      cur.lastChild.style.transform = `translateX(${clamp(-vx * 0.012, -18, 18).toFixed(1)}px)`;
      let r = null; for (const tc of CLK) { const q = ripple(t, tc); if (q) r = q; }
      if (r) { rip.style.visibility = 'visible'; rip.style.transform = `translate(${x}px,${y}px) scale(${r.s.toFixed(3)})`; rip.style.opacity = r.o.toFixed(3); }
      else rip.style.visibility = 'hidden';
    });
    cue(HOLD0, 'click'); cue(HOLD0, 'drag', { d: 1.0 });

    // ───────────────────────── seek ─────────────────────────
    const DUR = 34.0;
    window.seek = (t) => {
      const z = Math.exp(CZ.at(t) + 0.004 * Math.sin(t * 0.9));
      world.style.transform = `translate(960px,540px) scale(${z.toFixed(5)}) translate(${(-CX.at(t)).toFixed(2)}px,${(-CY.at(t)).toFixed(2)}px)`;
      for (const d of draws) d(t);
    };
    cues.forEach((c) => { const g = c.t / 0.125; if (Math.abs(g - Math.round(g)) > 1e-6) throw new Error('cue off grid: ' + JSON.stringify(c)); });
    cues.sort((a, b) => a.t - b.t);
    window.FILM = { width: 1920, height: 1080, bpm: 120, duration: DUR,
      sections: { intro: [0, 3], drop: [22, 26], outro: [31, DUR] }, cues };
    window.seek(0);
    window.READY = true;
  } catch (err) {
    console.error(err);
    window.FILM_ERROR = String(err && err.stack || err);
  }
})();
