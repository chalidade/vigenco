// Vigenco "launch" video type.
// One shape that never cuts: dot -> headline pills -> prompt field -> loader -> check -> feature cards
// -> stat odometer -> logo slams -> brand mark. Every style is computed from t inside seek(t).
// Music-first timing on a 120 BPM grid; sound cues are exported for the audio synth.

(async function () {
  const { clamp, lerp, outQ, stepR, Track, ColorTrack, SP, vis, applyVis, mix, luma, press, ripple, measure } = window.M;

  const FORMATS = { vertical: [1080, 1920], landscape: [1920, 1080], square: [1080, 1080] };
  const SPEC = window.SPEC || {};
  const [W, H] = FORMATS[SPEC.format] || FORMATS.vertical;
  const BPM = 120, SPB = 60 / BPM;
  const b = (n) => n * SPB;
  const FONT = "'Inter Variable', Inter, system-ui, sans-serif";
  const K = H > W ? 0.78 : 1;       // portrait: author narrower so the camera frames everything bigger
  const CS = H > W ? 1.45 : 1.15;   // cursor size on screen

  await document.fonts.load(`700 40px 'Inter Variable'`).catch(() => {});
  await document.fonts.load(`500 40px 'Inter Variable'`).catch(() => {});
  await document.fonts.ready;

  // ---------- spec + theme ----------
  const brand = SPEC.brand || {};
  const C = Object.assign({ bg: '#F5F3EF', ink: '#111827', surface: '#FFFFFF' }, brand.colors || {});
  const A = (C.accent && C.accent.length ? C.accent : ['#6C5CE7', '#E35C91', '#FF8A3D']).slice(0, 3);
  while (A.length < 3) A.push(A[A.length - 1]);
  const MUTED = mix(C.ink, C.bg, 0.5);
  const onColor = (hex) => (luma(hex) > 0.6 ? C.ink : '#FFFFFF');
  const name = brand.name || 'Product';
  const mark = brand.mark || name.trim()[0].toUpperCase();
  const introLines = (SPEC.intro && SPEC.intro.lines) || splitHeadline(SPEC.headline || `Meet ${name}`);
  const brief = (SPEC.brief && SPEC.brief.text) || `Make something great with ${name}`;
  const placeholder = (SPEC.brief && SPEC.brief.placeholder) || 'Type anything…';
  const button = (SPEC.brief && SPEC.brief.button) || 'Generate';
  const youName = SPEC.cursorName || 'You';
  const features = (SPEC.features || []).slice(0, 3);
  const stat = SPEC.stat || null;
  const logos = (SPEC.logos || []).slice(0, 6);
  const outro = Object.assign({ tagline: SPEC.tagline || '', cta: brand.url || '' }, SPEC.outro || {});

  function splitHeadline(h) {
    const w = h.split(/\s+/);
    if (w.length <= 2) return [h];
    const n = w.length <= 4 ? 2 : 3, per = Math.ceil(w.length / n), out = [];
    for (let i = 0; i < w.length; i += per) out.push(w.slice(i, i + per).join(' '));
    return out;
  }

  // ---------- DOM helpers ----------
  const stage = document.getElementById('stage');
  stage.style.width = W + 'px'; stage.style.height = H + 'px'; stage.style.background = C.bg;
  const world = document.getElementById('world');
  const shape = document.getElementById('shape');
  const bg = document.getElementById('bg');
  function el(tag, css, parent, html) {
    const e = document.createElement(tag);
    if (css) e.style.cssText = css;
    if (html != null) e.innerHTML = html;
    (parent || world).appendChild(e);
    return e;
  }
  function layer(w, h) {
    const e = el('div', `width:${w}px;height:${h}px;margin-left:${-w / 2}px;margin-top:${-h / 2}px;`, shape);
    e.className = 'layer';
    return e;
  }
  const ICONS = {
    spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M18 6l-2.5 2.5M8.5 15.5L6 18"/>',
    bolt: '<path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z"/><path d="M9 12l2 2 4-4"/>',
    heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.6-7 10-7 10z"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18"/>',
    play: '<circle cx="12" cy="12" r="9"/><path d="M10 8.5l5.5 3.5-5.5 3.5z"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.5-3.5 3-5.5 6.5-5.5s6 2 6.5 5.5"/><path d="M16 4.6a3.5 3.5 0 010 6.8M18.5 14.8c1.7.8 2.8 2.5 3 5.2"/>',
    wand: '<path d="M4 20L15 9M14 4v3M19 9h-3M17.5 5.5l-2 2M18 14v2M20 15h-4"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  };
  const icon = (n, color, size) =>
    `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONS[n] || ICONS.spark}</svg>`;

  // ---------- tracks ----------
  const S = { x: new Track(0), y: new Track(0), w: new Track(0), h: new Track(0), r: new Track(0), col: new ColorTrack(C.ink), ring: new Track(0) };
  const CAM = { x: new Track(0), y: new Track(0), lz: new Track(Math.log(1.6)) };
  const CUR = { x: new Track(W * 0.62), y: new Track(H * 0.62), o: new Track(0) };
  const clicks = [];   // cursor press times
  const cues = [];     // sound cues
  const cue = (t, k, extra) => cues.push(Object.assign({ t: +t.toFixed(4), k }, extra || {}));
  const fit = (w, h, fw = 0.84, fh = 0.58) => clamp(Math.min((W * fw) / w, (H * fh) / h), 0.55, 1.9);
  function morph(t, w, h, r, col, sp = SP.shape) {
    S.w.to(t, w, sp); S.h.to(t, h, sp); S.r.to(t, r, sp); S.col.to(t, col, SP.soft);
  }
  function frame(t, w, h, cx = 0, cy = 0, push = 1, fw, fh) {
    const z = fit(w, h, fw, fh) * push;
    CAM.lz.to(t, Math.log(z), SP.cam); CAM.x.to(t, cx, SP.cam); CAM.y.to(t, cy, SP.cam);
  }
  function cursorTo(t, x, y, sp = SP.cursor) { CUR.x.to(t, x, sp); CUR.y.to(t, y, sp); }
  function click(t, kind = 'click') { clicks.push(t); cue(t, kind); }

  const draws = [];    // per-frame draw functions
  const sections = {};

  // =====================================================================
  // S0 · intro: a dot is born, then each headline chunk swaps in on the beat
  // =====================================================================
  const T_BORN = 0.06;
  S.w.to(T_BORN, 30, SP.pop); S.h.to(T_BORN, 30, SP.pop); S.r.to(T_BORN, 15, SP.pop);
  cue(T_BORN, 'born');
  const introFont = `700 ${H > W ? 112 : 96}px ${FONT}`;
  const introCols = [[C.ink, '#FFFFFF'], [C.surface, C.ink], [A[0], onColor(A[0])]];
  introLines.slice(0, 3).forEach((txt, i) => {
    const tw = measure(txt, introFont), w = tw + 130, h = H > W ? 180 : 160;
    const t0 = b(1 + 2 * i), t1 = b(3 + 2 * i);
    const [fill, ink] = introCols[i % 3];
    morph(t0 - 0.04, w, h, h / 2, fill);
    frame(t0 - 0.1, w, h, 0, 0, 1, 0.8, 0.5);
    const L = layer(w, h); L.className += ' center';
    L.style.cssText += `font:${introFont};letter-spacing:-0.035em;color:${ink};`;
    L.textContent = txt;
    const last = i === Math.min(introLines.length, 3) - 1;
    draws.push((t) => applyVis(L, vis(t, t0 + 0.04, last ? t1 - 0.14 : t1 - 0.1)));
    cue(t0, i === 0 ? 'pop' : 'swap', { n: i });
  });
  const bI = 1 + 2 * Math.min(introLines.length, 3);
  sections.intro = [0, b(bI)];

  // =====================================================================
  // S1 · the brief: the shape becomes a prompt field, "You" types and hits the button
  // =====================================================================
  const inW = Math.min(W * 0.86, 940) * K, inH = 132;
  const briefFont = `500 40px ${FONT}`, btnFont = `650 34px ${FONT}`;
  const btnW = measure(button, btnFont) + 72, btnH = 96;
  const textMax = inW - btnW - 96;
  const tIn = b(bI);
  morph(tIn - 0.04, inW, inH, inH / 2, C.surface);
  S.ring.to(tIn, 1, SP.soft);
  frame(tIn - 0.1, inW, inH * 3.2, 0, 0, 1);
  cue(tIn, 'whoosh');
  const LB = layer(inW, inH);
  const ph = el('div', `position:absolute;left:44px;top:0;height:${inH}px;display:flex;align-items:center;font:${briefFont};color:${mix(C.ink, C.surface, 0.62)};white-space:nowrap;`, LB, placeholder);
  const clip = el('div', `position:absolute;left:44px;top:0;width:${textMax}px;height:${inH}px;overflow:hidden;`, LB);
  const typed = el('div', `position:absolute;left:0;top:0;height:${inH}px;display:flex;align-items:center;font:${briefFont};color:${C.ink};white-space:pre;letter-spacing:-0.01em;`, clip);
  const caret = el('div', `position:absolute;top:${inH / 2 - 26}px;width:3px;height:52px;border-radius:2px;background:${A[0]};`, clip);
  const btn = el('div', `position:absolute;right:18px;top:${(inH - btnH) / 2}px;width:${btnW}px;height:${btnH}px;border-radius:${btnH / 2}px;background:${A[0]};color:${onColor(A[0])};font:${btnFont};display:flex;align-items:center;justify-content:center;letter-spacing:-0.01em;transform-origin:50% 50%;`, LB, button);
  const btnRip = el('div', `position:absolute;left:50%;top:50%;width:${btnW}px;height:${btnW}px;margin:${-btnW / 2}px 0 0 ${-btnW / 2}px;border-radius:50%;background:#fff;opacity:0;`, btn);
  btn.style.overflow = 'hidden';

  // cursor enters, clicks the field, types, clicks the button
  const fieldX = -inW / 2 + 120, fieldY = 14;
  CUR.o.to(tIn, 1, SP.text);
  cursorTo(tIn - 0.05, fieldX + 40, fieldY + 26);
  const tFocus = b(bI + 1);
  click(tFocus, 'click');
  const chars = [...brief];
  const dt = chars.length <= 36 ? 0.0625 : Math.max(0.035, (b(4.5)) / chars.length);
  const tType = b(bI + 1.5);
  const keyT = chars.map((_, i) => tType + i * dt);
  keyT.forEach((t, i) => { if (chars[i] !== ' ' || i % 2 === 0) cue(t, 'key', { n: i }); });
  const tTypeEnd = tType + chars.length * dt;
  // prefix widths for caret + horizontal scroll
  const prefixW = chars.map((_, i) => measure(chars.slice(0, i + 1).join(''), briefFont));
  // cursor drifts out of the way while typing, then goes to the button
  cursorTo(tType + 0.1, fieldX + 60, inH / 2 + 70, SP.soft);
  const bBtn = Math.ceil(tTypeEnd / SPB) + 1;
  const tBtn = b(bBtn);
  const btnX = inW / 2 - 18 - btnW / 2, btnY = 0;
  cursorTo(tBtn - 0.55, btnX - 10, btnY + 12);
  click(tBtn, 'click');
  draws.push((t) => {
    const v = vis(t, tIn + 0.06, tBtn + 0.06);
    applyVis(LB, v);
    let n = 0;
    while (n < keyT.length && keyT[n] <= t) n++;
    typed.textContent = chars.slice(0, n).join('');
    const tw = n ? prefixW[n - 1] : 0;
    const scroll = Math.max(0, tw - (textMax - 12));
    typed.style.transform = `translateX(${-scroll}px)`;
    ph.style.opacity = n ? 0 : 1;
    const typing = t >= tType - 0.2 && t <= tTypeEnd + 0.2;
    const blink = typing || Math.floor((t - tFocus) * 2.2) % 2 === 0;
    caret.style.opacity = t >= tFocus && blink ? 1 : 0;
    caret.style.left = (tw - scroll + 3) + 'px';
    btn.style.transform = `scale(${press(t, tBtn).toFixed(4)})`;
    const rp = ripple(t, tBtn, 0.45);
    btnRip.style.opacity = rp ? rp.o * 0.8 : 0;
    btnRip.style.transform = rp ? `scale(${rp.s})` : 'scale(0)';
  });
  sections.brief = [tIn, tBtn];

  // =====================================================================
  // S2 · loader -> check
  // =====================================================================
  const tLoad = tBtn + 0.08, LD = 176;
  morph(tLoad, LD, LD, LD / 2, C.surface);
  frame(tLoad, LD, LD, 0, 0, 1.0, 0.5, 0.3);
  cue(tLoad, 'whoosh', { v: 0.6 });
  const tCheck = b(bBtn + 2);
  morph(tCheck - 0.02, LD, LD, LD / 2, A[0], SP.pop);
  S.ring.to(tCheck, 0, SP.soft);
  cue(tCheck, 'check');
  const LL = layer(LD, LD);
  LL.innerHTML = `<svg width="${LD}" height="${LD}" viewBox="0 0 ${LD} ${LD}"><circle cx="${LD / 2}" cy="${LD / 2}" r="52" fill="none" stroke="${mix(A[0], C.surface, 0.82)}" stroke-width="10"/><circle class="arc" cx="${LD / 2}" cy="${LD / 2}" r="52" fill="none" stroke="${A[0]}" stroke-width="10" stroke-linecap="round" stroke-dasharray="326.7" stroke-dashoffset="245"/></svg>`;
  const arc = LL.querySelector('.arc');
  const LC = layer(LD, LD); LC.className += ' center';
  LC.innerHTML = `<svg width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="${onColor(A[0])}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path class="ck" d="M5 12.5l4.5 4.5L19 7.5" stroke-dasharray="24" stroke-dashoffset="24"/></svg>`;
  const ck = LC.querySelector('.ck');
  cursorTo(tLoad + 0.05, LD / 2 + 70, LD / 2 + 60, SP.soft);
  draws.push((t) => {
    applyVis(LL, vis(t, tLoad + 0.1, tCheck - 0.1));
    const sp = (t - tLoad);
    arc.setAttribute('transform', `rotate(${(sp * 400) % 360} ${LD / 2} ${LD / 2})`);
    arc.setAttribute('stroke-dashoffset', (245 - 120 * (0.5 + 0.5 * Math.sin(sp * 7))).toFixed(1));
    const vC = vis(t, tCheck + 0.02, b(bBtn + 3) - 0.1);
    applyVis(LC, vC, `scale(${lerp(0.6, 1, stepR(t - tCheck, SP.pop)).toFixed(4)})`);
    ck.setAttribute('stroke-dashoffset', (24 * (1 - outQ((t - tCheck - 0.04) / 0.32))).toFixed(2));
  });
  sections.result = [tLoad, tCheck];

  // =====================================================================
  // S3 · feature cards, each with one real micro-interaction
  // =====================================================================
  const bF0 = bBtn + 3;
  const cardW = Math.min(W * 0.86, 900) * K;
  const titleFont = `700 54px ${FONT}`, descFont = `450 33px ${FONT}`;
  const kinds = ['toggle', 'slider', 'tabs'];
  const cardTint = [C.surface, mix(A[1], C.surface, 0.93), mix(A[2], C.surface, 0.93)];
  const cardH = (H > W ? [660, 700, 680] : [600, 640, 620]), cardR = [56, 80, 44];
  features.forEach((f, i) => {
    const t0 = b(bF0 + 4 * i), t1 = b(bF0 + 4 * (i + 1));
    const w = cardW, h = cardH[i], kind = f.widget || kinds[i % 3];
    const ac = A[i % 3];
    morph(t0 - 0.04, w, h, cardR[i], cardTint[i]);
    frame(t0 - 0.1, w, h, 0, 0, 1, 0.86, 0.62);
    CAM.lz.to(t0 + b(2), Math.log(fit(w, h, 0.86, 0.62) * 1.035), SP.cam);
    cue(t0, 'whoosh', { v: 0.8, n: i });
    const L = layer(w, h);
    const P = 64;
    el('div', `position:absolute;left:${P}px;top:${P}px;width:104px;height:104px;border-radius:30px;background:${mix(ac, C.surface, 0.86)};display:flex;align-items:center;justify-content:center;`, L, icon(f.icon || 'spark', ac, 52));
    el('div', `position:absolute;left:${P}px;top:${P + 140}px;width:${w - 2 * P}px;font:${titleFont};letter-spacing:-0.03em;color:${C.ink};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;`, L, esc(f.title || ''));
    el('div', `position:absolute;left:${P}px;top:${P + 214}px;width:${w - 2 * P}px;font:${descFont};line-height:1.32;color:${MUTED};display:-webkit-box;-webkit-line-clamp:${H > W ? 3 : 2};-webkit-box-orient:vertical;overflow:hidden;`, L, esc(f.desc || ''));
    const wy = h - P - 96;       // widget row top (local)
    const toWorld = (x, y) => [-w / 2 + x, -h / 2 + y];
    const tAct = t0 + b(1.5);
    let drawW;
    if (kind === 'toggle') {
      const tw = 152, th = 84, label = f.label || 'On';
      el('div', `position:absolute;left:${P}px;top:${wy}px;height:${th}px;display:flex;align-items:center;font:600 36px ${FONT};color:${C.ink};letter-spacing:-0.02em;`, L, esc(label));
      const trk = el('div', `position:absolute;left:${w - P - tw}px;top:${wy}px;width:${tw}px;height:${th}px;border-radius:${th / 2}px;`, L);
      const knob = el('div', `position:absolute;top:8px;height:${th - 16}px;border-radius:${(th - 16) / 2}px;background:#fff;box-shadow:0 4px 10px rgba(17,24,39,.18);`, trk);
      const kL = new Track(8).to(tAct, tw - 8 - (th - 16), { w: 19, z: 0.9 });
      const kR = new Track(8 + th - 16).to(tAct, tw - 8, { w: 34, z: 0.9 });
      const tc = new ColorTrack(mix(C.ink, C.surface, 0.82)).to(tAct, ac, SP.soft);
      const [cx, cy] = toWorld(w - P - tw / 2 + 30, wy + th / 2);
      cursorTo(t0 + 0.1, cx + 6, cy + 6);
      click(tAct, 'toggle');
      drawW = (t) => {
        const l = kL.at(t), r = kR.at(t);
        knob.style.left = l + 'px'; knob.style.width = (r - l) + 'px';
        trk.style.background = tc.at(t);
        trk.style.transform = `scale(${press(t, tAct)})`;
      };
    } else if (kind === 'slider') {
      const tw = w - 2 * P, ty = wy + 40, hd = 56, label = f.label || '';
      const trk = el('div', `position:absolute;left:${P}px;top:${ty}px;width:${tw}px;height:16px;border-radius:8px;background:${mix(C.ink, C.surface, 0.88)};`, L);
      const fill = el('div', `position:absolute;left:0;top:0;height:16px;border-radius:8px;background:${ac};`, trk);
      const hdl = el('div', `position:absolute;top:${8 - hd / 2}px;width:${hd}px;height:${hd}px;margin-left:${-hd / 2}px;border-radius:50%;background:#fff;box-shadow:0 6px 16px rgba(17,24,39,.22), inset 0 0 0 2px ${mix(ac, '#ffffff', 0.4)};`, trk);
      const val = el('div', `position:absolute;right:${P}px;top:${wy - 34}px;font:700 40px ${FONT};color:${ac};letter-spacing:-0.02em;font-variant-numeric:tabular-nums;`, L);
      if (label) el('div', `position:absolute;left:${P}px;top:${wy - 30}px;font:600 32px ${FONT};color:${C.ink};`, L, esc(label));
      const p0 = 0.18, p1 = 0.88, tDown = tAct - 0.1, tUp = tAct + b(1.5);
      const [sx, sy] = toWorld(P + tw * p0, ty + 8);
      cursorTo(t0 + 0.05, sx + 4, sy + 6);
      clicks.push(tDown); cue(tDown, 'click');
      // drag: the cursor moves on its own spring, the handle follows it while held
      CUR.x.to(tDown + 0.08, sx + tw * (p1 - p0) + 4, { w: 6.5, z: 1 });
      cue(tDown + 0.12, 'drag', { d: tUp - tDown - 0.12 });
      cue(tUp, 'release');
      drawW = (t) => {
        let p;
        if (t < tDown) p = p0;
        else {
          const cxW = CUR.x.at(Math.min(t, tUp)) - 4;
          p = clamp((cxW - (-w / 2 + P)) / tw, 0, 1);
          if (t > tUp) p += (p1 - p) * stepR(t - tUp, SP.pop);
        }
        hdl.style.left = (p * tw) + 'px'; fill.style.width = (p * tw) + 'px';
        const held = t >= tDown && t <= tUp;
        hdl.style.transform = `scale(${held ? 1.12 : 1})`;
        const num = f.value != null ? Math.round(p / p1 * f.value) : Math.round(p * 100);
        val.textContent = (f.prefix || '') + num.toLocaleString('id-ID') + (f.suffix != null ? f.suffix : '%');
      };
    } else {
      const tabs = (f.tabs || ['Draft', 'Review', 'Publish']).slice(0, 3);
      const tw = w - 2 * P, th = 92, seg = tw / tabs.length;
      const box = el('div', `position:absolute;left:${P}px;top:${wy}px;width:${tw}px;height:${th}px;border-radius:${th / 2}px;background:${mix(C.ink, C.surface, 0.92)};`, L);
      const ind = el('div', `position:absolute;top:8px;height:${th - 16}px;border-radius:${(th - 16) / 2}px;background:${ac};`, box);
      const labs = tabs.map((tx, k) => el('div', `position:absolute;left:${k * seg}px;top:0;width:${seg}px;height:${th}px;display:flex;align-items:center;justify-content:center;font:650 32px ${FONT};letter-spacing:-0.01em;`, box, esc(tx)));
      const last = tabs.length - 1;
      const iL = new Track(8).to(tAct, last * seg + 8, { w: 19, z: 0.9 });
      const iR = new Track(seg - 8).to(tAct, (last + 1) * seg - 8, { w: 34, z: 0.9 });
      const [cx, cy] = toWorld(P + seg * (last + 0.5) + 10, wy + th / 2);
      cursorTo(t0 + 0.1, cx, cy + 8);
      click(tAct, 'click');
      drawW = (t) => {
        const l = iL.at(t), r = iR.at(t);
        ind.style.left = l + 'px'; ind.style.width = (r - l) + 'px';
        const mid = (l + r) / 2;
        labs.forEach((lb, k) => {
          const on = clamp(1 - Math.abs(mid - (k + 0.5) * seg) / (seg * 0.6));
          lb.style.color = on > 0.5 ? onColor(ac) : C.ink;
        });
      };
    }
    const lastF = i === features.length - 1;
    draws.push((t) => {
      const v = vis(t, t0 + 0.05, t1 - (lastF ? 0.06 : 0.1));
      applyVis(L, v);
      if (!v.gone) drawW(t);
    });
  });
  const bS = bF0 + 4 * features.length;
  sections.features = [b(bF0), b(bS)];

  // =====================================================================
  // S4 · the drop: stat odometer
  // =====================================================================
  let bL = bS;
  if (stat) {
    const tS = b(bS);
    const sw = Math.min(W * 0.86, 940) * K, sh = 500;
    morph(tS - 0.03, sw, sh, 72, C.ink, SP.pop);
    S.ring.to(tS, 0, SP.soft);
    frame(tS - 0.12, sw, sh, 0, 0, 1.1, 0.86, 0.6);
    CAM.lz.to(tS + 0.25, Math.log(fit(sw, sh, 0.86, 0.6)), SP.cam);
    CUR.o.to(tS - 0.2, 0, SP.text);
    cue(tS, 'drop');
    const L = layer(sw, sh);
    el('div', `position:absolute;left:0;top:76px;width:${sw}px;text-align:center;font:650 30px ${FONT};letter-spacing:0.16em;text-transform:uppercase;color:${mix(A[0], '#ffffff', 0.35)};`, L, esc(stat.kicker || name));
    const V = Math.max(0, Math.round(stat.value || 0));
    const finalStr = (stat.prefix || '') + V.toLocaleString('id-ID') + (stat.suffix || '');
    const numFont = `800 150px ${FONT}`;
    const lineH = 170;
    const numBox = el('div', `position:absolute;left:0;top:${sh / 2 - lineH / 2 - 10}px;width:${sw}px;height:${lineH}px;`, L);
    // slots: digits get rolling strips, everything else is static
    const chs = [...finalStr];
    const digitIdx = [];
    chs.forEach((c, k) => { if (/\d/.test(c)) digitIdx.push(k); });
    const nd = digitIdx.length;
    const slots = chs.map((c, k) => {
      const isD = /\d/.test(c);
      const sw2 = measure(isD ? '0' : c, numFont) * (isD ? 1 : 1);
      const slot = el('div', `position:absolute;top:0;width:${sw2}px;height:${lineH}px;overflow:hidden;`, numBox);
      const p = isD ? nd - 1 - digitIdx.indexOf(k) : null;
      const inner = el('div', `position:absolute;left:0;top:0;width:${sw2}px;font:${numFont};letter-spacing:-0.04em;line-height:${lineH}px;text-align:center;background:linear-gradient(90deg,${A[0]},${A[1]},${A[2]});-webkit-background-clip:text;background-clip:text;color:transparent;white-space:pre;`, slot,
        isD ? '0\n1\n2\n3\n4\n5\n6\n7\n8\n9\n0' : esc(c));
      return { slot, inner, isD, p, w: sw2, c };
    });
    const totalW = slots.reduce((s, x) => s + x.w, 0);
    slots.forEach((s) => { s.inner.style.backgroundSize = `${totalW}px 100%`; });
    const label = el('div', `position:absolute;left:40px;top:${sh - 140}px;width:${sw - 80}px;text-align:center;font:500 38px ${FONT};color:rgba(255,255,255,.82);letter-spacing:-0.01em;`, L, esc(stat.label || ''));
    const tR0 = tS + 0.12, tRd = b(3);
    const val = (t) => V * outQ((t - tR0) / tRd);
    for (let k = 1; k <= 18; k++) {
      // a tick every time the value crosses an equal step: dense first, settling at the end
      const target = k / 18, x = 1 - Math.pow(1 - target, 1 / 4);
      cue(tR0 + x * tRd, 'tick', { n: k });
    }
    cue(tR0 + tRd, 'settle');
    draws.push((t) => {
      const v = vis(t, tS + 0.04, b(bS + 5) - 0.1);
      applyVis(L, v);
      if (v.gone) return;
      const x = val(t);
      // which leading digits are alive
      let pos = 0;
      const appear = slots.map((s) => {
        if (s.isD) return s.p === 0 ? 1 : clamp((x - 0.55 * Math.pow(10, s.p)) / (Math.pow(10, s.p) * 0.4));
        return null;
      });
      // separators follow the digit to their left; prefix/suffix always on
      for (let k = 0; k < slots.length; k++) {
        if (appear[k] == null) {
          const prevD = slots.slice(0, k).reverse().findIndex((s) => s.isD);
          appear[k] = prevD === -1 ? 1 : appear[k - 1 - prevD];
          const nextD = slots.slice(k + 1).some((s) => s.isD);
          if (!nextD) appear[k] = 1;
        }
      }
      const visW = slots.reduce((s, sl, k) => s + sl.w * appear[k], 0);
      pos = (sw - visW) / 2;
      slots.forEach((s, k) => {
        const a = appear[k];
        s.slot.style.left = pos + 'px';
        s.slot.style.opacity = a;
        s.slot.style.transform = `scale(${lerp(0.6, 1, a)})`;
        s.inner.style.backgroundPosition = `${-(slots.slice(0, k).reduce((q, z) => q + z.w, 0))}px 0`;
        pos += s.w * a;
        if (s.isD) {
          const P10 = Math.pow(10, s.p);
          const d = (Math.floor(x / P10) % 10) + Math.max(0, (x % P10) - (P10 - 1));
          s.inner.style.transform = `translateY(${(-d * lineH).toFixed(2)}px)`;
        }
      });
      label.style.opacity = clamp((t - tS - 0.3) / 0.3);
    });
    bL = bS + 5;
    sections.drop = [tS, b(bL)];
  }

  // =====================================================================
  // S5 · customer logos, one per hit, accelerating beats -> 8ths
  // =====================================================================
  let bO = bL;
  if (logos.length) {
    const nBeat = Math.ceil(logos.length / 2);
    const times = logos.map((_, k) => (k < nBeat ? b(bL + k) : b(bL + nBeat + (k - nBeat) * 0.5)));
    const cols = [C.surface, C.ink, A[0], A[1], A[2], C.surface];
    const radii = [110, 34, 64, 18, 110, 52];
    const styles = [
      `800 78px ${FONT};letter-spacing:-0.05em`,
      `600 64px ${FONT};letter-spacing:0.14em;text-transform:uppercase`,
      `750 76px ${FONT};letter-spacing:-0.03em`,
      `500 70px ${FONT};letter-spacing:-0.02em;font-style:italic`,
      `900 66px ${FONT};letter-spacing:0.02em;text-transform:uppercase`,
      `700 76px ${FONT};letter-spacing:-0.04em`,
    ];
    const cap = el('div', `position:absolute;left:-400px;width:800px;text-align:center;font:600 34px ${FONT};letter-spacing:0.14em;text-transform:uppercase;color:${MUTED};`, world, esc(SPEC.logosLabel || 'Trusted by'));
    const tEnd = times[times.length - 1] + b(1.5);
    logos.forEach((lg, k) => {
      const st = styles[k % styles.length];
      const fs = st.split(';')[0];
      const upper = st.includes('uppercase');
      const tw = measure(upper ? lg.toUpperCase() : lg, fs) * (st.includes('0.14em') ? 1.18 : 1);
      const w = Math.max(320, tw + 150), h = k % 2 ? 210 : 230;
      const fill = cols[k % cols.length];
      morph(times[k] - 0.035, w, h, Math.min(radii[k % radii.length], h / 2), fill, SP.pop);
      if (k === 0) frame(times[0] - 0.12, 760, 600, 0, -40, 1, 0.86, 0.5);
      cue(times[k], 'slam', { n: k });
      const L = layer(w, h); L.className += ' center';
      L.style.cssText += `font:${st};color:${onColor(fill)};`;
      L.textContent = lg;
      const tOut = k < logos.length - 1 ? times[k + 1] - 0.05 : tEnd - 0.1;
      draws.push((t) => applyVis(L, vis(t, times[k] + 0.01, tOut, 0.06), `scale(${lerp(1.18, 1, stepR(t - times[k], SP.pop)).toFixed(4)})`));
    });
    draws.push((t) => {
      const v = vis(t, times[0] - 0.05, tEnd - 0.12);
      applyVis(cap, v);
      cap.style.top = '-210px';
    });
    bO = Math.ceil(tEnd / SPB);
    sections.logos = [times[0], tEnd];
  }

  // =====================================================================
  // S6 · brand mark + wordmark + CTA, the cursor clicks the CTA
  // =====================================================================
  const tO = b(bO);
  const MK = 240, my = -150;
  morph(tO - 0.03, MK, MK, 68, A[0], SP.shape);
  S.y.to(tO - 0.03, my, SP.shape);
  S.ring.to(tO, 0, SP.soft);
  cue(tO, 'whoosh', { v: 0.7 });
  const LM = layer(MK, MK); LM.className += ' center';
  LM.style.cssText += `font:800 132px ${FONT};letter-spacing:-0.04em;color:${onColor(A[0])};`;
  LM.textContent = mark;
  const nameFont = `800 112px ${FONT}`;
  const nameW = measure(name, nameFont);
  const nm = el('div', `position:absolute;left:${-nameW / 2 - 20}px;top:${my + MK / 2 + 50}px;width:${nameW + 40}px;text-align:center;font:${nameFont};letter-spacing:-0.045em;color:${C.ink};white-space:nowrap;`, world, esc(name));
  const tgFont = `500 40px ${FONT}`;
  const tgW = Math.min(measure(outro.tagline, tgFont), W * 0.8);
  const tg = el('div', `position:absolute;left:${-W * 0.42}px;top:${my + MK / 2 + 190}px;width:${W * 0.84}px;text-align:center;font:${tgFont};line-height:1.3;color:${MUTED};letter-spacing:-0.01em;`, world, esc(outro.tagline));
  const ctaFont = `650 38px ${FONT}`;
  const ctaW = outro.cta ? measure(outro.cta, ctaFont) + 96 : 0, ctaH = 96;
  const ctaTop = my + MK / 2 + 190 + (tgW >= W * 0.8 ? 120 : 80) + 40;
  const cta = el('div', `position:absolute;left:${-ctaW / 2}px;top:${ctaTop}px;width:${ctaW}px;height:${ctaH}px;border-radius:${ctaH / 2}px;display:flex;align-items:center;justify-content:center;font:${ctaFont};letter-spacing:-0.01em;transform-origin:50% 50%;overflow:hidden;`, world, `<span>${esc(outro.cta)}</span>`);
  const ctaRip = el('div', `position:absolute;left:50%;top:50%;width:${ctaW}px;height:${ctaW}px;margin:${-ctaW / 2}px 0 0 ${-ctaW / 2}px;border-radius:50%;background:#fff;opacity:0;`, cta);
  const groupH = ctaTop + ctaH - (my - MK / 2);
  const groupCY = (my - MK / 2) + groupH / 2;
  frame(tO - 0.1, Math.max(nameW, tgW, ctaW, MK) + 80, groupH + 60, 0, groupCY, 1, 0.84, 0.66);
  const tName = tO + b(1), tTag = tO + b(1.5), tCta = tO + b(2);
  cue(tName, 'pop', { n: 1 }); cue(tCta, 'pop', { n: 2 });
  const tClick = tO + b(4);
  const ctaCol = new ColorTrack(C.surface).to(tClick, C.ink, SP.soft);
  const ctaTx = new ColorTrack(C.ink).to(tClick, '#ffffff', SP.soft);
  if (outro.cta) {
    CUR.o.to(tO + b(2.5), 1, SP.text);
    CUR.x.set(tO + b(2.4), W * 0.5); CUR.y.set(tO + b(2.4), ctaTop + ctaH + 260);
    cursorTo(tO + b(2.6), ctaW / 2 - 70, ctaTop + ctaH / 2 + 10);
    click(tClick, 'cta');
  }
  const END = tO + b(7);
  cue(tO + b(4.02), 'shimmer');
  draws.push((t) => {
    applyVis(LM, vis(t, tO + 0.05, null));
    applyVis(nm, vis(t, tName, null));
    applyVis(tg, vis(t, tTag, null));
    const vc = vis(t, tCta, null);
    applyVis(cta, vc, `scale(${press(t, tClick).toFixed(4)})`);
    cta.style.background = ctaCol.at(t);
    cta.style.color = ctaTx.at(t);
    cta.style.boxShadow = `inset 0 0 0 2px ${mix(C.ink, C.bg, 0.8)}`;
    const rp = ripple(t, tClick, 0.5);
    ctaRip.style.opacity = rp ? rp.o * 0.5 : 0;
    ctaRip.style.transform = rp ? `scale(${rp.s})` : 'scale(0)';
  });
  sections.outro = [tO, END];

  // =====================================================================
  // cursor ("You")
  // =====================================================================
  const cur = el('div', '', world); cur.className = 'cursor';
  cur.innerHTML = `<svg width="44" height="52" viewBox="0 0 22 26" style="position:absolute;left:-4px;top:-3px;filter:drop-shadow(0 3px 5px rgba(17,24,39,.28))"><path d="M2 2l17 9.2-7.4 1.9L8 21z" fill="${C.ink}" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>` +
    `<div class="pill" style="position:absolute;left:34px;top:40px;padding:8px 18px;border-radius:999px;background:${C.ink};color:#fff;font:650 24px ${FONT};letter-spacing:-0.01em;box-shadow:0 4px 10px rgba(17,24,39,.2)">${esc(youName)}</div>`;
  const curPill = cur.querySelector('.pill');
  const curRip = el('div', `position:absolute;left:-30px;top:-30px;width:60px;height:60px;border-radius:50%;border:3px solid ${A[0]};opacity:0;`, cur);

  // =====================================================================
  // background: brand light pools, drifting slowly
  // =====================================================================
  const pools = [
    { c: A[0], x: 0.2, y: 0.18, r: 0.75, ph: 0 },
    { c: A[1], x: 0.85, y: 0.55, r: 0.7, ph: 2 },
    { c: A[2], x: 0.3, y: 0.92, r: 0.65, ph: 4 },
  ];
  function drawBg(t) {
    const g = pools.map((p) => {
      const x = (p.x + 0.04 * Math.sin(t * 0.35 + p.ph)) * 100, y = (p.y + 0.03 * Math.cos(t * 0.3 + p.ph)) * 100;
      return `radial-gradient(${p.r * Math.max(W, H)}px circle at ${x.toFixed(2)}% ${y.toFixed(2)}%, ${hexA(p.c, 0.16)}, ${hexA(p.c, 0)} 60%)`;
    });
    bg.style.background = g.join(',') + `, ${C.bg}`;
  }
  function hexA(hex, a) { const [r, g2, bb] = M.hexRgb(hex); return `rgba(${r},${g2},${bb},${a})`; }
  function esc(s) { return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

  // =====================================================================
  // seek(t): the whole film as a pure function of time
  // =====================================================================
  function seek(t) {
    drawBg(t);
    const z = Math.exp(CAM.lz.at(t)), cx = CAM.x.at(t), cy = CAM.y.at(t);
    world.style.transform = `translate(${W / 2}px,${H / 2}px) scale(${z.toFixed(5)}) translate(${(-cx).toFixed(2)}px,${(-cy).toFixed(2)}px)`;
    const w = Math.max(0, S.w.at(t)), h = Math.max(0, S.h.at(t));
    const r = clamp(S.r.at(t), 0, Math.min(w, h) / 2);
    const x = S.x.at(t), y = S.y.at(t);
    shape.style.width = w + 'px'; shape.style.height = h + 'px';
    shape.style.borderRadius = r + 'px';
    shape.style.transform = `translate(${(x - w / 2).toFixed(2)}px,${(y - h / 2).toFixed(2)}px)`;
    shape.style.background = S.col.at(t);
    const ring = clamp(S.ring.at(t));
    shape.style.boxShadow = `0 ${40}px ${90}px -30px rgba(17,24,39,.30), 0 2px 6px rgba(17,24,39,.06), inset 0 0 0 2px rgba(17,24,39,${(0.07 * ring).toFixed(3)})`;
    shape.style.visibility = w < 0.5 ? 'hidden' : 'visible';
    for (const d of draws) d(t);
    // cursor
    const co = clamp(CUR.o.at(t));
    cur.style.visibility = co < 0.01 ? 'hidden' : 'visible';
    cur.style.opacity = co.toFixed(3);
    const px = CUR.x.at(t), py = CUR.y.at(t);
    const vx = (px - CUR.x.at(t - 1 / 120)) * 120;
    const lean = clamp(-vx * 0.0045, -14, 14);
    let ps = 1, rp = null;
    for (const tc of clicks) { ps = Math.min(ps, press(t, tc)); rp = rp || ripple(t, tc, 0.4); }
    cur.style.transform = `translate(${px.toFixed(2)}px,${py.toFixed(2)}px) scale(${(ps * CS / z).toFixed(5)}) rotate(${lean.toFixed(2)}deg)`;
    curPill.style.transform = `translateX(${clamp(-vx * 0.012, -40, 40).toFixed(2)}px)`;
    curRip.style.opacity = rp ? rp.o : 0;
    curRip.style.transform = rp ? `scale(${rp.s})` : 'scale(0)';
  }

  window.seek = seek;
  window.FILM = { type: 'launch', width: W, height: H, bpm: BPM, duration: +END.toFixed(4), cues: cues.sort((a, c) => a.t - c.t), sections };
  seek(0);
  window.READY = true;
})().catch((e) => { window.FILM_ERROR = String(e && e.stack || e); console.error(e); });
