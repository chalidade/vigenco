// Saling Jaga → Covatom · "Dari pelukan, jadi ikatan." Portrait 1080×1920, 120 BPM, 18 s.
// One idea, never cut: the big bear hugging the small bear becomes two discs (a Venn pair), the discs hollow into
// two rings, and at the drop the left ring opens around the right one: the "co" ligature of the Covatom logotype.
// The arc the two rings share turns blue (the bond). The rest of the name arrives, then the film wipes to the
// light version of the logo and says it plainly: Saling Jaga is now Covatom.
//
// Copy is configurable from the job: { "lang": "id" | "en", "copy": { "c1": [..], "c2": [..], "fin": [..], "tagline": ".." } }
(async function () {
  try {
    const { clamp, lerp, outQ, stepR, Track, ColorTrack, SP, vis, applyVis } = window.M;
    const LG = window.COVATOM_LOGO;
    const W = 1080, H = 1920, b = (n) => n * 0.5;                      // 120 BPM grid: one beat = 0.5 s
    const C = { cream: '#FAFAF6', navy: '#0E1A33', ink: '#0E1A33', blue: '#1677FF', slate: '#46526A', mist: '#B8C4DA',
      sjDark: '#204730', sjLeaf: '#26A355', mint: '#A6E8C2', hug: '#2EBD6B', white: '#FFFFFF' };

    // ---------------------------------------------------------------- copy
    const SPEC = window.SPEC || {};
    const COPY = {
      id: { c1: ['Dari ', 'pelukan'], c2: ['jadi ', 'ikatan.'], fin: ['Saling Jaga', ' sekarang bernama ', 'Covatom', '.'] },
      en: { c1: ['From a ', 'hug'], c2: ['to a ', 'bond.'], fin: ['Saling Jaga', ' is now ', 'Covatom', '.'] },
    };
    const copy = { ...COPY[SPEC.lang === 'en' ? 'en' : 'id'], tagline: 'Every node, bonded.', ...(SPEC.copy || {}) };
    const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

    // ---------------------------------------------------------------- layout
    // The Saling Jaga mark (570×553 px source) and where its two bears sit inside it.
    const SJ = { w: 520, cx: 540, cy: 780, srcW: 570, srcH: 553, big: [264, 294, 254], small: [383, 272, 125] };
    SJ.k = SJ.w / SJ.srcW; SJ.h = SJ.srcH * SJ.k; SJ.x = SJ.cx - SJ.w / 2; SJ.y = SJ.cy - SJ.h / 2;
    const bear = ([x, y, r]) => [SJ.x + x * SJ.k, SJ.y + y * SJ.k, r * SJ.k];
    const BIG = bear(SJ.big), SMALL = bear(SJ.small);
    const SLOT = 1165;                                                  // wordmark and captions share this line
    // Ligature numbers, all as multiples of the ring radius.
    const T = LG.t / LG.R, D = LG.d / LG.R, G = LG.g / LG.R;
    const HERO = { R: 190, mx: 540, y: 790 };                           // big "co" at the drop (mx = midpoint of the two centres)
    const LW = LG.box.x1 - LG.box.x0;                                   // logotype width in logo units
    const LOGO = { k: 860 / LW, y: 790 };                               // final logotype: 860 px wide, ring centres on y
    LOGO.R = LG.R * LOGO.k; LOGO.cx = (W - 860) / 2 - LG.box.x0 * LOGO.k; LOGO.mx = LOGO.cx + D * LOGO.R / 2;
    const TAG_Y = LOGO.y + LOGO.R + 84, FIN_Y = LOGO.y + 330;

    // ---------------------------------------------------------------- build
    const $ = (id) => document.getElementById(id);
    const NS = 'http://www.w3.org/2000/svg';
    const el = (parent, tag, attrs = {}) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); parent.appendChild(e); return e; };
    const set = (e, attrs) => { for (const k in attrs) e.setAttribute(k, typeof attrs[k] === 'number' ? attrs[k].toFixed(3) : attrs[k]); };

    await Promise.all(['400 50px Outfit', '500 50px Outfit', '600 92px Outfit'].map((f) => document.fonts.load(f).catch(() => null)));
    await document.fonts.ready;
    await Promise.all([...document.images].map((im) => (im.complete ? null : new Promise((res) => { im.onload = res; im.onerror = res; }))));

    const sj = $('sj'), sjw = $('sjw');
    Object.assign(sj.style, { left: SJ.x + 'px', top: SJ.y + 'px', width: SJ.w + 'px', height: SJ.h + 'px', transformOrigin: '50% 50%' });
    Object.assign(sjw.style, { left: (W - 604) / 2 + 'px', top: SLOT - 60 + 'px', width: '604px', height: '119px' });

    const cap1 = $('cap1'), cap2 = $('cap2'), tagD = $('tagD'), tagL = $('tagL');
    cap1.innerHTML = `<span style="color:${C.sjDark}">${esc(copy.c1[0])}</span><span style="color:${C.sjLeaf}">${esc(copy.c1[1] || '')}</span>`;
    cap2.innerHTML = `<span style="color:${C.white}">${esc(copy.c2[0])}</span><span style="color:#3D8DFF">${esc(copy.c2[1] || '')}</span>`;
    cap1.style.top = cap2.style.top = SLOT - 46 + 'px';
    tagD.textContent = tagL.textContent = copy.tagline;
    tagD.style.color = C.mist; tagL.style.color = C.slate;
    tagD.style.top = tagL.style.top = TAG_Y - 25 + 'px';
    const fin = $('fin'), finI = $('finI'), finT = $('finT');
    finI.style.width = '112px'; finI.style.height = (112 * SJ.srcH / SJ.srcW).toFixed(1) + 'px';
    finT.innerHTML = `<b style="color:${C.sjDark}">${esc(copy.fin[0])}</b>${esc(copy.fin[1] || '')}<b style="color:${C.ink}">${esc(copy.fin[2] || '')}</b>${esc(copy.fin[3] || '')}`;
    fin.style.top = FIN_Y + 'px';
    { const over = finT.offsetWidth / (W - 150); if (over > 1) finT.style.fontSize = (46 / over).toFixed(1) + 'px'; }   // long copy still fits

    // Dark layer: the animated rings. The o is drawn as two pieces (the arc inside the c's circle, and the rest) so
    // the shared arc can take its own colour without a seam; the c is masked by a growing disc on the o.
    const dark = $('dark');
    const defs = el(dark, 'defs');
    const full = { maskUnits: 'userSpaceOnUse', x: -W, y: -H, width: 3 * W, height: 3 * H };
    const mC = el(defs, 'mask', { id: 'mC', ...full }); el(mC, 'rect', { ...full, fill: '#fff' }); const mCcut = el(mC, 'circle', { fill: '#000' });
    const mO = el(defs, 'mask', { id: 'mO', ...full }); el(mO, 'rect', { ...full, fill: '#fff' }); const mOcut = el(mO, 'circle', { fill: '#000' });
    const cS = el(defs, 'clipPath', { id: 'cS' }); const cScirc = el(cS, 'circle');
    const pulse = [0, 1].map(() => el(dark, 'circle', { fill: 'none', stroke: C.blue }));
    const rings = el(dark, 'g');
    const cRing = el(el(rings, 'g', { mask: 'url(#mC)' }), 'path', { 'fill-rule': 'evenodd' });
    const oRest = el(el(rings, 'g', { mask: 'url(#mO)' }), 'path', { 'fill-rule': 'evenodd' });
    const oShared = el(el(rings, 'g', { 'clip-path': 'url(#cS)' }), 'path', { 'fill-rule': 'evenodd' });
    const lettersD = el(dark, 'g');
    const glyphD = LG.letters.map((l) => el(lettersD, 'path', { d: l.d, fill: C.white }));

    // Light layer: the finished logotype in its primary colours, revealed by the wipe.
    const light = $('light'), wipeB = $('wipeB'), lsvg = $('lsvg');
    const pulseL = el(lsvg, 'circle', { fill: 'none', stroke: C.blue });
    const lg = el(lsvg, 'g');
    el(lg, 'path', { d: LG.c + LG.oRest, fill: C.ink });
    el(lg, 'path', { d: LG.shared, fill: C.blue });
    el(lg, 'path', { d: LG.letters.map((l) => l.d).join(''), fill: C.ink });

    // ---------------------------------------------------------------- timeline
    const T0 = { word: b(1), cap1: b(6), discs: b(8), venn: b(10), hollow: b(11), night: b(12), build: b(14), drop: b(16),
      name: b(20), tag: b(24), wipe: b(28), fin: b(29), shimmer: b(32), end: b(36) };
    const slow = { w: 4.2, z: 1 }, quick = { w: 30, z: 1 }, dusk = { w: 26, z: 1 }, iris = { w: 8, z: 1 };

    const cCol = new ColorTrack(C.sjDark).to(T0.night, C.white, dusk);
    const oCol = new ColorTrack(C.sjLeaf).to(T0.night, C.white, dusk);
    // the part the two share: the last of Saling Jaga's green, until the drop turns it into the blue bond
    const sCol = new ColorTrack(C.sjLeaf).to(T0.venn + 0.1, C.mint, SP.soft).to(T0.night, C.hug, dusk).to(T0.drop, C.blue, quick);

    // c ring: radius and position (x is the midpoint between the two centres, so the pair stays centred)
    const Rc = new Track(BIG[2] * 0.9).to(T0.discs, BIG[2], SP.pop).to(T0.venn, HERO.R, SP.shape)
      .to(T0.build, HERO.R * 0.94, slow).to(T0.drop, HERO.R, SP.pop).to(T0.name, LOGO.R, SP.shape);
    const mX = new Track((BIG[0] + SMALL[0]) / 2).to(T0.venn, HERO.mx, SP.shape).to(T0.name, LOGO.mx, SP.shape);
    const cY = new Track(BIG[1]).to(T0.venn, HERO.y, SP.shape).to(T0.name, LOGO.y, SP.shape);
    // o ring, relative to the c: radius ratio, offset (in c radii)
    const oRr = new Track(SMALL[2] / BIG[2]).to(T0.venn, 1, SP.shape);
    const oXr = new Track((SMALL[0] - BIG[0]) / BIG[2]).to(T0.venn, D, SP.shape).to(T0.build, D * 1.16, slow).to(T0.drop, D, SP.pop);
    const oYr = new Track((SMALL[1] - BIG[1]) / BIG[2]).to(T0.venn, 0, SP.shape);
    // stroke as a fraction of the radius: 1 = solid disc, T = the logo's ring
    const sfC = new Track(1).to(T0.hollow, T, SP.shape);
    const sfO = new Track(1).to(T0.hollow + 0.07, T, SP.shape);
    const cut = new Track(0).to(T0.drop, 1, SP.pop);                    // the c opens around the o
    const bloomO = new Track(0).to(T0.drop, 1, quick).to(T0.drop + 0.5, 0.5, slow);
    const dotsO = new Track(0).to(T0.night, 1, SP.soft);
    const nightR = new Track(0).to(T0.night - 0.03, 2700, iris);       // night spreads from the hug
    const wipeRB = new Track(0).to(T0.wipe - 0.09, 2700, { w: 6.5, z: 1 });
    const wipeRW = new Track(0).to(T0.wipe, 2700, { w: 6.5, z: 1 });
    const LETTER = LG.letters.map((_, i) => T0.name + 0.25 + i * 0.25);  // v a t o m on the eighths

    const popS = (t, tin, s0 = 0.6) => s0 + (1 - s0) * stepR(t - tin, SP.pop);
    const bump = (t, tc, a = 0.05, d = 0.09) => 1 + a * Math.exp(-(((t - tc) / d) ** 2));
    const circ = (x, y, r, sw) => `M${(x - r).toFixed(3)} ${y.toFixed(3)}a${r.toFixed(3)} ${r.toFixed(3)} 0 1 ${sw} ${(2 * r).toFixed(3)} 0a${r.toFixed(3)} ${r.toFixed(3)} 0 1 ${sw} ${(-2 * r).toFixed(3)} 0Z`;
    // a ring of outer radius R whose stroke is sf·R (sf ≥ 1 is a solid disc)
    const ringAt = (e, x, y, R, sf, col) => set(e, { d: circ(x, y, R, 0) + (R * (1 - sf) > 0.05 ? circ(x, y, R * (1 - sf), 1) : ''), fill: col });
    const ringPulse = (e, t, tc, x, y, r0, r1, dur, o0, w0) => {
      const p = (t - tc) / dur;
      if (p <= 0 || p >= 1) { e.style.opacity = 0; return; }
      set(e, { cx: x, cy: y, r: lerp(r0, r1, outQ(p)), 'stroke-width': lerp(w0, 1.5, p) });
      e.style.opacity = (o0 * (1 - p) * (1 - p)).toFixed(4);
    };

    const night = $('bg'), dots = $('dots'), bloom = $('bloom'), flash = $('flash');
    night.style.background = C.navy;
    bloom.style.background = `radial-gradient(circle 640px at ${HERO.mx}px ${HERO.y + 30}px, rgba(22,119,255,.36), rgba(22,119,255,.10) 55%, rgba(22,119,255,0) 100%)`;

    window.seek = (t) => {
      // ---- background
      dots.style.opacity = (dotsO.at(t) * 0.9).toFixed(4);
      bloom.style.opacity = clamp(bloomO.at(t)).toFixed(4);
      const fl = t - T0.drop;
      flash.style.opacity = fl > 0 && fl < 0.8 ? (0.2 * Math.exp(-fl / 0.11)).toFixed(4) : 0;

      // ---- Saling Jaga: the mark is there from the first frame, settles, gives a squeeze, then dissolves into discs
      const out = clamp((t - T0.discs) / 0.3), s0 = 1 + 0.07 * (1 - stepR(t, { w: 5, z: 1 }));
      if (out >= 1) sj.style.visibility = 'hidden';
      else {
        sj.style.visibility = 'visible';
        sj.style.opacity = ((1 - out) * (1 - out)).toFixed(4);
        sj.style.filter = out > 0.01 ? `blur(${(out * 14).toFixed(2)}px)` : 'none';
        sj.style.transform = `scale(${(s0 * bump(t, T0.cap1 + 0.02, 0.04, 0.12) * (1 - 0.07 * outQ(out))).toFixed(5)})`;
      }
      applyVis(sjw, vis(t, T0.word, T0.cap1 - 0.13), `scale(${popS(t, T0.word, 0.9).toFixed(4)})`);
      applyVis(cap1, vis(t, T0.cap1, T0.night - 0.16));
      applyVis(cap2, vis(t, T0.drop + 0.04, T0.name - 0.16), `scale(${popS(t, T0.drop + 0.04, 0.9).toFixed(4)})`);

      // ---- the two rings
      const R = Rc.at(t), dx = R * oXr.at(t), cx = mX.at(t) - dx / 2, cy = cY.at(t);
      const ox = cx + dx, oy = cy + R * oYr.at(t), Ro = R * oRr.at(t);
      if (t < T0.discs - 0.12) rings.style.visibility = 'hidden';
      else {
        rings.style.visibility = 'visible';
        ringAt(cRing, cx, cy, R, sfC.at(t), cCol.at(t));
        ringAt(oRest, ox, oy, Ro, sfO.at(t), oCol.at(t));
        ringAt(oShared, ox, oy, Ro, sfO.at(t), sCol.at(t));
        set(mCcut, { cx: ox, cy: oy, r: Math.max(0, cut.at(t)) * (Ro + G * R) });
        set(mOcut, { cx, cy, r: Math.max(0, R - 1.2) });
        set(cScirc, { cx, cy, r: R });
      }
      const nr = nightR.at(t);
      night.style.visibility = nr > 0.5 ? 'visible' : 'hidden';
      night.style.clipPath = nr > 2400 ? 'none' : `circle(${nr.toFixed(2)}px at ${((cx + ox) / 2).toFixed(2)}px ${cy.toFixed(2)}px)`;
      ringPulse(pulse[0], t, T0.drop, (cx + ox) / 2, cy, R * 0.9, R * 3.6, 0.85, 0.7, 12);
      ringPulse(pulse[1], t, T0.drop + 0.13, (cx + ox) / 2, cy, R * 0.9, R * 2.8, 0.8, 0.4, 6);

      // ---- the rest of the name rides on the c's centre and scale
      const k = R / LG.R, tr = `translate(${cx.toFixed(3)} ${cy.toFixed(3)}) scale(${k.toFixed(5)})`;
      lettersD.setAttribute('transform', tr);
      glyphD.forEach((g, i) => {
        const e = stepR(t - LETTER[i], SP.text);
        if (e <= 0.001) { g.style.visibility = 'hidden'; return; }
        g.style.visibility = 'visible';
        g.style.opacity = e.toFixed(4);
        g.style.filter = e < 0.985 ? `blur(${((1 - e) * 14).toFixed(2)}px)` : 'none';
        g.style.transform = `translateY(${((1 - e) * 44).toFixed(2)}px)`;
      });
      applyVis(tagD, vis(t, T0.tag, null));

      // ---- wipe to the light version: a blue disc from the bond, then white
      const wb = wipeRB.at(t), ww = wipeRW.at(t), org = `${((cx + ox) / 2).toFixed(2)}px ${cy.toFixed(2)}px`;
      wipeB.style.visibility = wb > 0.5 && ww < 2600 ? 'visible' : 'hidden';
      wipeB.style.clipPath = `circle(${wb.toFixed(2)}px at ${org})`;
      light.style.visibility = ww > 0.5 ? 'visible' : 'hidden';
      light.style.clipPath = `circle(${ww.toFixed(2)}px at ${org})`;
      lg.setAttribute('transform', tr);
      applyVis(tagL, vis(t, T0.tag, null));
      const fe = stepR(t - T0.fin, SP.pop);
      finI.style.opacity = clamp(fe * 3).toFixed(4);
      finI.style.transform = `scale(${(0.5 + 0.5 * fe).toFixed(4)})`;
      applyVis(finT, vis(t, T0.fin + 0.1, null));
      ringPulse(pulseL, t, T0.shimmer, (cx + ox) / 2, cy, R * 0.8, R * 3.2, 1.1, 0.5, 5);
    };

    const cues = [];
    const cue = (t, k, o = {}) => cues.push({ t, k, ...o });
    cue(T0.word, 'pop', { n: 0 });
    cue(T0.cap1, 'swap', { n: 1 });
    cue(T0.discs, 'whoosh', { v: 0.8 });
    cue(T0.venn, 'swap', { n: 2 });
    cue(T0.hollow, 'tick', { n: 1 });
    cue(T0.night, 'whoosh', { v: 1 });
    cue(T0.drop, 'drop');
    cue(T0.name, 'whoosh', { v: 0.7 });
    LETTER.forEach((t, i) => cue(t, 'note', { n: 3 + i }));
    cue(T0.tag, 'settle');
    cue(T0.wipe - 0.05, 'whoosh', { v: 1 });
    cue(T0.fin, 'cta');
    cue(T0.shimmer, 'shimmer');

    window.FILM = {
      width: W, height: H, bpm: 120, duration: T0.end,
      // sparse intro under the old logo, groove through the morph, drop when the bond forms, final chord on the wipe
      sections: { intro: [0, b(8)], drop: [T0.drop, T0.name], outro: [T0.wipe - 1, T0.end] },
      cues,
    };
    window.seek(0);
    window.READY = true;
  } catch (e) {
    window.FILM_ERROR = String((e && e.stack) || e);
  }
})();
