// vigenco · "Write a prompt. Get the film." Portrait 1080×1920, 120 BPM, 32 s.
// One shape, never cut: shipped pill → timeline editor (the problem) → question pill → composer
// (type the prompt, paste a link, pick 9:16) → record button → director card (Claude checks every beat)
// → 9:16 film frame (drop, pull back to a wall of frames) → 16:9 → 1:1 → duration pill (drag 30 s → 5 min)
// → render card (close the tab, it keeps going) → ready toast → logo mark → CTA pill.
(async function () {
  try {
    const { clamp, lerp, stepR, Track, ColorTrack, SP, vis, applyVis, press, ripple } = M;
    const C = { bg: '#09090B', panel: '#131317', panel2: '#1A1A1F', text: '#F4F2EE', muted: '#A7A5AE', dim: '#6E6C76',
      coral: '#FF7A50', amber: '#FFB25C', rose: '#F2547D', ok: '#5BD38A', err: '#FF6B6B', ink: '#2a1404', line: 'rgba(255,255,255,.08)',
      leaf: '#0F2A1C', leafHi: '#5BD38A' };
    const F = "'Inter Tight'", MO = "'JetBrains Mono'";

    await Promise.all([
      document.fonts.load(`700 104px ${F}`), document.fonts.load(`800 60px ${F}`), document.fonts.load(`600 40px ${F}`),
      document.fonts.load(`500 40px ${F}`), document.fonts.load(`500 30px ${MO}`), document.fonts.load(`700 40px ${MO}`),
      document.fonts.load("italic 400 100px 'Instrument Serif'"),
    ].map((p) => p.catch(() => null)));
    await document.fonts.ready;

    const cues = [];
    const cue = (t, k, o = {}) => cues.push({ t, k, ...o });
    const world = document.getElementById('world');
    const hud = document.getElementById('hud');
    const warm = document.getElementById('warm');
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
      check: P('<path d="M20 6 9 17l-5-5"/>', 3),
      arrow: P('<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>', 2.6),
      link: P('<path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1"/><path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1"/>'),
      x: P('<path d="M6 6l12 12M18 6 6 18"/>', 2.6),
      leaf: P('<path d="M5 20c0-9 6-15 15-15 0 9-6 15-15 15z"/><path d="M5 20 14 11"/>', 2),
      play: '<svg viewBox="0 0 24 24" width="100%" height="100%"><path d="M8 5.5v13l11-6.5z" fill="currentColor"/></svg>',
      music: P('<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>'),
      file: P('<path d="M6 2.5h8l4 4v15H6z"/><path d="M14 2.5v4h4"/>'),
      film: P('<rect x="3" y="4" width="18" height="16" rx="2.5"/><path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4"/>'),
      cloud: P('<path d="M7 18a4.5 4.5 0 0 1-.5-9A6 6 0 0 1 18 8.5a4.8 4.8 0 0 1-1 9.5z"/>'),
      dl: P('<path d="M12 4v11"/><path d="m7 10 5 5 5-5"/><path d="M5 20h14"/>'),
    };
    const ico = (k, s, col = 'currentColor', st = '') => `<span class="ic" style="width:${s}px;height:${s}px;color:${col};${st}">${I[k]}</span>`;
    const mark = (s) => `<span style="position:relative;display:block;flex:none;width:${s}px;height:${s}px;border-radius:${(s * 0.3).toFixed(0)}px;background:linear-gradient(135deg,${C.amber},${C.coral} 55%,${C.rose})">
      <i style="position:absolute;left:${(s * 0.38).toFixed(0)}px;top:${(s * 0.28).toFixed(0)}px;width:0;height:0;border-left:${(s * 0.36).toFixed(0)}px solid #1a0c08;border-top:${(s * 0.22).toFixed(0)}px solid transparent;border-bottom:${(s * 0.22).toFixed(0)}px solid transparent;display:block"></i></span>`;

    const SX = 540, SY = 1150;

    // ───────────────────────── Camera ─────────────────────────
    const CAM = { z: new Track(Math.log(1.05)) };
    const cam = (t, z, sp = SP.cam) => CAM.z.to(t, Math.log(z), sp);
    cam(0.0, 1.0);
    cam(3.0, 1.04, { w: 3, z: 1 }); cam(5.75, 1.0);
    cam(7.25, 1.07, { w: 2.5, z: 1 }); cam(10.75, 1.0);
    cam(12.0, 1.1, { w: 14, z: 0.85 }); cam(12.875, 1.0);
    cam(15.0, 1.08, { w: 4, z: 1 }); cam(15.875, 1.0, { w: 14, z: 0.85 });
    cam(17.75, 0.36, { w: 6, z: 1 }); cam(19.25, 1.0, { w: 7, z: 1 });
    cam(23.25, 1.03, { w: 3, z: 1 }); cam(25.5, 1.0);
    cam(26.0, 1.1, { w: 14, z: 0.85 }); cam(26.5, 1.0, { w: 4, z: 1 });
    const shake = (t) => {
      let x = 0, y = 0;
      for (const [tb, a] of [[16.0, 18], [26.0, 9]]) { const h = t - tb; if (h > 0 && h < 0.6) { x += a * Math.exp(-h * 8) * Math.sin(h * 70); y += a * 0.5 * Math.exp(-h * 8) * Math.sin(h * 53); } }
      return [x, y];
    };
    const camZ = (t) => Math.exp(CAM.z.at(t));
    const toS = (x, y, t) => { const z = camZ(t), [qx, qy] = shake(t); return [SX + (x - SX) * z + qx, SY + (y - SY) * z + qy]; };

    // warm wash: record, drop, logo
    draws.push((t) => {
      let w = 0.0;
      for (const [tb, a] of [[12.0, 0.6], [16.0, 1.0], [26.0, 0.9]]) { const d = t - tb; if (d >= 0) w = Math.max(w, a * Math.exp(-d * 2.2)); }
      w = Math.max(w, 0.35 * stepR(t - 26.0, { w: 3, z: 1 }));
      warm.style.opacity = w.toFixed(3);
      scrim.style.opacity = (stepR(t - 17.625, { w: 9, z: 1 }) * clamp((19.5 - t) / 0.5)).toFixed(3);
    });
    const scrim = document.getElementById('scrim');

    // ───────────────────────── Wall of frames (revealed by the pull-back) ─────────────────────────
    const TILES = [];
    const TC = ['#2B2440', '#3A1F2B', '#13303A', '#3B2A14', '#1F2A3F', '#2E1A14', '#1A3328', '#35203A'];
    const TA = ['#B9A6FF', '#F2547D', '#6FD3E8', '#FFB25C', '#7FA8FF', '#FF7A50', '#5BD38A', '#E58BFF'];
    let ti = 0;
    for (let ry = -2; ry <= 2; ry++) for (let rx = -2; rx <= 2; rx++) {
      if (rx === 0 && ry === 0) continue;
      const k = ti++ % 8, kind = (ti * 7) % 3;
      const inner = kind === 0
        ? `<span class="av" style="width:220px;height:220px;background:${TA[k]}"></span><i style="display:block;width:340px;height:44px;border-radius:22px;background:rgba(255,255,255,.85)"></i><i style="display:block;width:240px;height:30px;border-radius:15px;background:rgba(255,255,255,.35)"></i>`
        : kind === 1
          ? `<i style="display:block;width:400px;height:300px;border-radius:40px;background:${TA[k]}"></i><i style="display:block;width:300px;height:44px;border-radius:22px;background:rgba(255,255,255,.85)"></i>`
          : `<i style="display:block;width:380px;height:110px;border-radius:55px;background:${TA[k]}"></i><i style="display:block;width:380px;height:110px;border-radius:55px;background:rgba(255,255,255,.12)"></i><i style="display:block;width:380px;height:110px;border-radius:55px;background:rgba(255,255,255,.12)"></i>`;
      const e = W(`<div style="width:560px;height:996px;border-radius:40px;background:${TC[k]};display:flex;flex-direction:column;align-items:center;justify-content:center;gap:40px">${inner}</div>`);
      const cx = SX + rx * 640, cy = SY + ry * 1080;
      at(e, cx - 280, cy - 498);
      const tb = 17.75 + ((Math.abs(rx) + Math.abs(ry)) % 3) * 0.125;
      TILES.push({ e, tb });
      draws.push((t) => applyVis(e, vis(t, tb, 19.0, 0.3), `scale(${popS(t, tb, 0.7).toFixed(4)})`));
    }

    // ───────────────────────── The one shape ─────────────────────────
    const body = W('<div style="box-shadow:0 40px 90px rgba(0,0,0,.55)"></div>');
    const PB = { l: new Track(SX - 320), t: new Track(SY - 75), r: new Track(SX + 320), b: new Track(SY + 75), rad: new Track(75), col: new ColorTrack(C.panel) };
    const pm = (t, w, h, rad, col, sp = SP.shape, cy = SY) => {
      const soft = { w: sp.w * 0.78, z: Math.min(1, sp.z + 0.08) };
      const L = SX - w / 2, R = SX + w / 2, T = cy - h / 2, B = cy + h / 2;
      PB.l.to(t, L, L < PB.l.cur ? sp : soft); PB.r.to(t, R, R > PB.r.cur ? sp : soft);
      PB.t.to(t, T, T < PB.t.cur ? sp : soft); PB.b.to(t, B, B > PB.b.cur ? sp : soft);
      PB.rad.to(t, rad, sp);
      if (col) PB.col.to(t, col, SP.soft);
    };
    // key times
    const T_TXT = 7.125, T_TYPE = 7.25, T_LINK = 10.5, T_FMT = 11.25, T_REC = 12.0;
    const T_R1 = 13.5, T_R2 = 14.0, T_R3 = 14.5;
    const T_F2 = 20.75, T_F3 = 21.5, GRAB = 22.125, LET = 22.875;
    const T_X = 23.75, T_DONE = 25.0, T_LOGO = 26.0, CTA = 30.0;
    pm(0.0, 640, 150, 75, C.panel);
    pm(2.875, 940, 660, 44, C.panel);
    pm(5.875, 700, 160, 80, C.panel2);
    pm(6.75, 940, 760, 48, C.panel);
    pm(T_REC + 0.125, 280, 280, 140, C.coral, { w: 22, z: 0.78 });
    pm(12.875, 940, 700, 48, C.panel);
    pm(15.875, 560, 996, 40, C.leaf, { w: 24, z: 0.78 });
    pm(T_F2, 960, 540, 36, C.leaf);
    pm(T_F3, 760, 760, 40, C.leaf);
    pm(21.875, 760, 200, 100, C.panel2);
    pm(23.125, 940, 600, 44, C.panel);
    pm(T_LOGO - 0.125, 320, 320, 96, C.coral, { w: 22, z: 0.78 });
    pm(28.875, 860, 180, 90, C.amber);
    // amber outline while the shape is the composer
    const AMB = new Track(0).to(6.875, 1, SP.text).to(T_REC, 0, SP.text);
    const bodyHits = [T_REC, T_R1, T_R2, T_R3, T_F2, T_F3, T_DONE];
    draws.push((t) => {
      const l = PB.l.at(t), tp = PB.t.at(t), r = PB.r.at(t), b = PB.b.at(t);
      rect(body, l, tp, r - l, b - tp);
      body.style.borderRadius = Math.min(PB.rad.at(t), (r - l) / 2, (b - tp) / 2).toFixed(2) + 'px';
      body.style.background = PB.col.at(t);
      const a = clamp(AMB.at(t));
      body.style.boxShadow = `0 40px 90px rgba(0,0,0,.55), inset 0 0 0 3px rgba(${a > 0.01 ? '255,178,92,' + (0.08 + 0.32 * a).toFixed(3) : '255,255,255,.08'})`;
      let s = popS(t, 0, 0.3);
      for (const tc of bodyHits) s *= 1 - 0.035 * Math.exp(-(((t - tc) / 0.08) ** 2));
      for (const tc of [3.5, 4.0, 4.5, 5.0, 5.5]) s *= bump(t, tc + 0.03, 0.015, 0.07);
      for (const tc of [16.5, 17.0, 17.5]) s *= bump(t, tc, 0.02, 0.09);
      s *= 1 - 0.4 * (1 - press(t, CTA));
      body.style.transform = `scale(${s.toFixed(4)})`;
    });
    // logo gradient skin (sits right on top of the body while it is the mark)
    const skin = W(`<div style="border-radius:96px;background:linear-gradient(135deg,${C.amber},${C.coral} 55%,${C.rose})"></div>`);
    const tri = W(`<div style="width:0;height:0;border-left:118px solid #1a0c08;border-top:72px solid transparent;border-bottom:72px solid transparent"></div>`);
    draws.push((t) => {
      const l = PB.l.at(t), tp = PB.t.at(t), r = PB.r.at(t), b = PB.b.at(t);
      rect(skin, l, tp, r - l, b - tp);
      skin.style.borderRadius = Math.min(PB.rad.at(t), (r - l) / 2, (b - tp) / 2).toFixed(2) + 'px';
      skin.style.transform = body.style.transform;
      const o = stepR(t - T_LOGO, SP.text) * (1 - clamp((t - 28.875) / 0.15));
      skin.style.opacity = o.toFixed(3);
      at(tri, SX - 40, SY - 72);
      const v = vis(t, T_LOGO + 0.06, 28.875);
      applyVis(tri, v, `scale(${popS(t, T_LOGO + 0.06, 0.4).toFixed(4)})`);
    });

    // ───────────────────────── Headlines (screen space) ─────────────────────────
    const HX = 70, HY = 170;
    const block = (lbl, head, sub, tin, tout) => {
      const e = add(`<div style="left:${HX}px;top:${HY}px;display:flex;flex-direction:column;gap:30px">
        ${lbl ? `<div class="lbl">${lbl}</div>` : ''}<div class="head">${head}</div>${sub ? `<div class="sub">${sub}</div>` : ''}</div>`);
      show(e, tin, tout); return e;
    };
    block('Launch day', 'You shipped <span class="serif">the app.</span>', 'Now everyone asks for the video.', 0.25, 2.75);
    block('Then, 2 a.m.', 'Keyframes. Music. Export. <span class="serif">Redo.</span>', '', 3.0, 5.75);
    block('', 'What if you just <span class="serif">said it?</span>', '', 6.0, 6.875);
    block('01 · Write', 'Describe it in <span class="serif">one prompt.</span>', 'Paste a link. Pick a format.', 7.0, 12.125);
    block('02 · Direct', 'Claude <span class="serif">directs.</span>', 'Reads your references, designs the scenes, checks every beat.', 12.375, 15.75);
    block('03 · Film', '60 fps, real <span class="serif">motion blur.</span>', '', 16.125, 17.375);
    block('03 · Film', 'Original music <span class="serif">and sound.</span>', 'Every cut lands on the beat.', 17.5, 19.75);
    block('Formats', 'Any shape. Any <span class="serif">length.</span>', '', 20.0, 23.0);
    block('Runs on GitHub', 'Close the tab. It keeps <span class="serif">rolling.</span>', '', 23.25, 25.75);
    block('', 'Your launch, <span class="serif">directed.</span>', '', 29.0, null);

    // ───────────────────────── S0 · shipped pill ─────────────────────────
    const s0 = W(`<div style="width:640px;height:150px;display:flex;align-items:center;justify-content:center;gap:24px">
      <span class="av" style="width:72px;height:72px;background:rgba(91,211,138,.16);color:${C.ok}">${ico('check', 40)}</span>
      <span style="font:700 50px/1 ${F};letter-spacing:-.03em;white-space:nowrap">v1.0 is <span style="color:${C.ok}">live</span></span></div>`);
    ctr(s0, SX, SY); show(s0, 0.375, 1.875);
    const s0chk = s0.querySelector('.av');
    draws.push((t) => { s0chk.style.transform = `scale(${popS(t, 1.0, 0.2).toFixed(4)})`; });
    cue(1.0, 'check');
    const s0b = W(`<div style="width:640px;height:150px;display:flex;align-items:center;justify-content:center;gap:22px">
      ${ico('film', 50, C.err)}<span style="font:700 46px/1 ${F};letter-spacing:-.02em;white-space:nowrap">launch-video.mp4 <span style="color:${C.err}">?</span></span></div>`);
    ctr(s0b, SX, SY); show(s0b, 2.0, 2.875);
    cue(1.5, 'pop', { n: 1 }); cue(2.0, 'alert');
    // 1.5: three "where's the video?" notes pop around the pill
    const asks = [['Where’s the video?', -60, -190, 1.5], ['Got a demo reel?', 120, 175, 1.75], ['Teaser for launch?', -150, 300, 2.25]];
    asks.forEach(([txt, dx, dy, tb], i) => {
      const e = W(`<div style="padding:22px 30px;border-radius:30px 30px 30px 8px;background:${C.panel2};box-shadow:inset 0 0 0 2px ${C.line};font:600 36px/1 ${F};color:${C.text};white-space:nowrap">${txt}</div>`);
      ctr(e, SX + dx, SY + dy); show(e, tb, 2.875, (t) => `scale(${popS(t, tb, 0.6).toFixed(4)})`);
      if (i > 0) cue(tb, 'pop', { n: i + 2 });
    });

    // ───────────────────────── S1 · timeline editor (the problem) ─────────────────────────
    const TL = SX - 470, TT = SY - 330;
    const s1 = W(`<div style="width:940px;height:660px;padding:40px 44px;display:flex;flex-direction:column;gap:26px"></div>`);
    at(s1, TL, TT);
    const top1 = add(`<div style="display:flex;align-items:center;justify-content:space-between">
      <span style="display:flex;gap:14px">${[C.err, C.amber, C.ok].map((c) => `<i style="display:block;width:22px;height:22px;border-radius:11px;background:${c};opacity:.8"></i>`).join('')}</span>
      <span class="mono" style="font:500 30px/1 ${MO};color:${C.dim}">untitled-launch.prj</span></div>`, s1);
    const TRK = [['Video', C.coral], ['Text', C.amber], ['Music', C.rose], ['SFX', '#B9A6FF']];
    const trkEls = TRK.map(([n, c]) => add(`<div style="position:relative;height:84px;display:flex;align-items:center;gap:20px">
      <span class="mono" style="width:120px;font:500 28px/1 ${MO};color:${C.muted}">${n}</span>
      <span style="position:relative;flex:1;height:84px;border-radius:16px;background:rgba(255,255,255,.04)"></span></div>`, s1).lastElementChild);
    const fileRow = add(`<div style="position:relative;height:90px;margin-top:6px"></div>`, s1);
    show(s1, 3.125, 5.75);
    // keyframes pile up on eighths
    let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const KF = [];
    for (let i = 0; i < 18; i++) {
      const tb = 3.5 + i * 0.125, tr = i % 4, x = 30 + rnd() * 640;
      const d = add(`<i style="position:absolute;left:${x.toFixed(0)}px;top:26px;width:32px;height:32px;background:${TRK[tr][1]};transform:rotate(45deg);display:block;border-radius:5px"></i>`, trkEls[tr]);
      KF.push({ d, tb });
      if (i % 2 === 0) cue(tb, 'tick');
    }
    draws.push((t) => KF.forEach(({ d, tb }) => { const e = stepR(t - tb, SP.pop); d.style.opacity = clamp(e * 2).toFixed(3); d.style.transform = `rotate(45deg) scale(${(0.3 + 0.7 * e).toFixed(3)})`; }));
    const playhead = add(`<i style="position:absolute;top:-10px;width:5px;height:390px;border-radius:3px;background:${C.text};display:block"></i>`, trkEls[0]);
    draws.push((t) => { playhead.style.left = (20 + 650 * (((t - 3.0) * 0.6) % 1)).toFixed(1) + 'px'; });
    // file names: final → final-v2 → … each struck through
    const FILES = ['final.mp4', 'final-v2.mp4', 'final-v2-fix.mp4', 'FINAL-final.mp4'];
    FILES.forEach((f, i) => {
      const tin = 3.5 + i * 0.5, tout = i === 3 ? 5.75 : tin + 0.45;
      const e = add(`<div style="position:absolute;left:0;top:0;display:flex;align-items:center;gap:20px">${ico('file', 50, C.muted)}
        <span style="position:relative;font:700 52px/1 ${F};letter-spacing:-.03em;color:${C.text};white-space:nowrap">${f}
        <i style="position:absolute;left:-8px;right:-8px;top:52%;height:7px;border-radius:4px;background:${C.err};transform-origin:0 50%;display:block"></i></span></div>`, fileRow);
      show(e, tin, tout);
      const strike = e.querySelector('i'), ts = tin + 0.25;
      draws.push((t) => { strike.style.transform = `scaleX(${stepR(t - ts, { w: 30, z: 1 }).toFixed(4)})`; });
      cue(tin, 'swap', { n: i }); cue(ts, 'slam', { n: i % 4 });
    });

    // ───────────────────────── S1b · question pill ─────────────────────────
    const s1b = W(`<div style="width:700px;height:160px;display:flex;align-items:center;justify-content:center;gap:22px">
      <span style="width:6px;height:64px;border-radius:3px;background:${C.amber};display:block"></span>
      <span style="font:500 46px/1 ${F};color:${C.dim};white-space:nowrap">Describe your product…</span></div>`);
    ctr(s1b, SX, SY); show(s1b, 6.0, 6.75);
    cue(5.875, 'whoosh', { v: 0.6 }); cue(6.0, 'born'); cue(6.5, 'note', { n: 2 });

    // ───────────────────────── S2 · composer ─────────────────────────
    const CL = SX - 470, CT = SY - 380;
    const PROMPT = 'A launch film for Leafy.';
    const ta = W(`<div style="width:860px;font:600 80px/1.15 ${F};letter-spacing:-.035em;color:${C.text}"><span></span><i style="display:inline-block;width:6px;height:84px;margin-left:6px;vertical-align:-14px;border-radius:3px;background:${C.amber}"></i></div>`);
    at(ta, CL + 50, CT + 60); show(ta, 6.875, T_REC + 0.06);
    const taTxt = ta.firstElementChild, caret = ta.lastElementChild;
    const ph = W(`<div style="font:500 64px/1.15 ${F};color:${C.dim};white-space:nowrap">Describe your product…</div>`);
    at(ph, CL + 62, CT + 66); show(ph, 6.875, T_TYPE - 0.05);
    const NCH = PROMPT.length;
    const charT = (i) => T_TYPE + i * 0.125;   // one key per sixteenth
    draws.push((t) => {
      let n = 0; for (let i = 0; i < NCH; i++) if (t >= charT(i)) n = i + 1;
      taTxt.textContent = PROMPT.slice(0, n);
      caret.style.opacity = (t < T_TYPE || (t > charT(NCH - 1) + 0.2 && Math.floor(t * 2) % 2)) ? 0.15 : 1;
    });
    for (let i = 0; i < NCH; i++) if (PROMPT[i] !== ' ') cue(charT(i), 'key');
    // link chip (pasted)
    const chip = W(`<div style="display:flex;align-items:center;gap:16px;height:84px;padding:0 26px 0 14px;border-radius:22px;background:${C.panel2};box-shadow:inset 0 0 0 2px ${C.line}">
      <span class="av" style="width:58px;height:58px;border-radius:14px;background:#222228;color:${C.amber}">${ico('link', 32)}</span>
      <span style="font:600 36px/1 ${F};white-space:nowrap">leafy.app</span>
      <span class="mono" style="font:500 26px/1 ${MO};color:${C.dim}">link</span></div>`);
    at(chip, CL + 44, CT + 420); show(chip, T_LINK, T_REC + 0.06, (t) => `scale(${popS(t, T_LINK, 0.6).toFixed(4)})`);
    chip.style.transformOrigin = '0 50%';
    cue(T_LINK, 'pop', { n: 3 });
    // footer: format buttons with liquid indicator + record
    const FY = CT + 640, FB = 96;
    const fmts = [[22, 38], [38, 22], [30, 30]];
    const fmtL = W(`<div class="mono" style="font:500 32px/1 ${MO};color:${C.amber};white-space:nowrap"></div>`);
    const IND_L = new Track(CL + 44 + FB).to(T_FMT, CL + 44, { w: 30, z: 0.85 });
    const IND_R = new Track(CL + 44 + 2 * FB).to(T_FMT, CL + 44 + FB, { w: 15, z: 0.9 });
    const ind = W(`<div style="height:${FB}px;border-radius:24px;background:rgba(255,178,92,.14)"></div>`);
    const fmtBtns = fmts.map(([w, h], i) => {
      const e = W(`<div style="width:${FB}px;height:${FB}px;display:flex;align-items:center;justify-content:center"><i style="display:block;width:${w}px;height:${h}px;border:4px solid currentColor;border-radius:6px"></i></div>`);
      at(e, CL + 44 + i * FB, FY - FB / 2); show(e, 7.125, T_REC + 0.06);
      return e;
    });
    draws.push((t) => {
      rect(ind, IND_L.at(t), FY - FB / 2, IND_R.at(t) - IND_L.at(t), FB); applyVis(ind, vis(t, 7.125, T_REC + 0.06));
      const sel = t >= T_FMT ? 0 : 1;
      fmtBtns.forEach((b, i) => { b.style.color = i === sel ? C.amber : C.dim; });
      fmtL.textContent = sel === 0 ? '9:16 · portrait' : '16:9 · landscape';
      at(fmtL, CL + 44 + 3 * FB + 24, FY - 16); applyVis(fmtL, vis(t, 7.125, T_REC + 0.06));
    });
    cue(T_FMT, 'click'); cue(T_FMT + 0.03, 'toggle');
    const RECX = CL + 940 - 44 - 60, RECY = FY;
    const rec = W(`<div style="width:120px;height:120px;border-radius:60px;background:${C.coral};display:flex;align-items:center;justify-content:center;box-shadow:inset 0 2px 0 rgba(255,255,255,.3)"><i style="display:block;width:36px;height:36px;border-radius:18px;background:#fff"></i></div>`);
    ctr(rec, RECX, RECY); show(rec, 7.25, T_REC + 0.03, (t) => `scale(${(popS(t, 7.25, 0.6) * press(t, T_REC)).toFixed(4)})`);
    const kbd = W(`<div class="mono" style="font:500 26px/1 ${MO};color:${C.dim};white-space:nowrap">ctrl + enter</div>`);
    at(kbd, CL + 940 - 44 - 190, CT + 448); show(kbd, 7.5, T_REC + 0.03);
    cue(T_TXT, 'click'); cue(T_REC, 'click');

    // ───────────────────────── S2b · record (the shape is the button) ─────────────────────────
    const core = W(`<div style="width:96px;height:96px;background:#fff"></div>`);
    const CR = new Track(48).to(T_REC + 0.25, 16, SP.shape);
    const spin = W(`<div style="width:380px;height:380px"><svg width="380" height="380" viewBox="0 0 380 380" style="display:block;overflow:visible"><circle cx="190" cy="190" r="176" fill="none" stroke="${C.amber}" stroke-width="7" stroke-linecap="round" stroke-dasharray="300 820"/></svg></div>`);
    draws.push((t) => {
      ctr(core, SX, SY); core.style.borderRadius = CR.at(t).toFixed(1) + 'px';
      applyVis(core, vis(t, T_REC + 0.125, 12.875), `scale(${popS(t, T_REC + 0.125, 0.5).toFixed(4)})`);
      ctr(spin, SX, SY); applyVis(spin, vis(t, T_REC + 0.25, 12.875), `rotate(${((t - 12) * 420).toFixed(1)}deg)`);
    });
    cue(T_REC + 0.125, 'drop'); cue(12.5, 'riser', { d: 3.5 });

    // ───────────────────────── S3 · director card ─────────────────────────
    const DL = SX - 470, DT = SY - 350;
    const dHead = W(`<div style="width:860px;display:flex;align-items:center;gap:20px">
      ${mark(64)}<span style="font:700 44px/1 ${F};letter-spacing:-.02em">Directing <span style="color:${C.muted};font-weight:500">“Leafy”</span></span></div>`);
    at(dHead, DL + 44, DT + 48); show(dHead, 13.0, 15.875);
    const ROWS = [['Reading leafy.app', T_R1], ['Designing 12 scenes', T_R2], ['Scoring at 120 BPM', T_R3]];
    const RY0 = DT + 170, RH = 118;
    const rowEls = ROWS.map(([txt, tc], i) => {
      const e = W(`<div style="width:860px;height:${RH}px;display:flex;align-items:center;gap:26px;border-top:2px solid ${C.line}">
        <span class="av" style="position:relative;width:64px;height:64px;box-shadow:inset 0 0 0 4px rgba(255,255,255,.14)"><span class="ic" style="position:absolute;width:36px;height:36px;color:#111">${I.check}</span></span>
        <span style="font:600 44px/1 ${F};letter-spacing:-.02em;white-space:nowrap">${txt}</span></div>`);
      at(e, DL + 44, RY0 + i * RH);
      const tin = 13.125 + i * 0.125;
      show(e, tin, 15.875);
      const dot = e.querySelector('.av'), ck = dot.firstElementChild, lab = e.lastElementChild;
      draws.push((t) => {
        const k = clamp((t - tc) / 0.06);
        dot.style.background = k > 0 ? C.ok : 'transparent';
        dot.style.boxShadow = k > 0 ? 'none' : 'inset 0 0 0 4px rgba(255,255,255,.14)';
        dot.style.transform = `scale(${(k > 0 ? popS(t, tc, 0.6) : 1).toFixed(4)})`;
        ck.style.opacity = k.toFixed(3);
        lab.style.color = k > 0 ? C.text : C.muted;
      });
      cue(tc, 'click'); cue(tc + 0.02, 'check');
      return e;
    });
    cue(13.125, 'pop', { n: 0 }); cue(13.25, 'pop', { n: 1 }); cue(13.375, 'pop', { n: 2 });
    // beat check strip: 8 cells light up on sixteenths
    const SBY = RY0 + 3 * RH + 30;
    const sLbl = W(`<div class="mono" style="font:500 26px/1 ${MO};letter-spacing:.12em;color:${C.dim}">CHECKING EVERY BEAT</div>`);
    at(sLbl, DL + 44, SBY); show(sLbl, 14.75, 15.875);
    const BEATS = 8, BC = (860 - 7 * 12) / 8;
    const cells = [...Array(BEATS)].map((_, i) => {
      const e = W(`<div style="width:${BC}px;height:70px;border-radius:14px;background:rgba(255,255,255,.06)"></div>`);
      at(e, DL + 44 + i * (BC + 12), SBY + 50);
      const tc = 15.0 + i * 0.125;
      show(e, 14.875, 15.875);
      draws.push((t) => { const k = t >= tc; e.style.background = k ? (i === 7 ? C.amber : C.coral) : 'rgba(255,255,255,.06)'; });
      cue(tc, 'tick');
      return e;
    });

    // ───────────────────────── S4 · the film (drop) ─────────────────────────
    const FT = SY - 498;
    const film = W(`<div style="width:560px;height:996px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:34px">
      <span class="av" style="width:230px;height:230px;background:${C.leafHi};color:${C.leaf}">${ico('leaf', 130)}</span>
      <b style="font:800 104px/1 ${F};letter-spacing:-.05em;color:#EAF7EE">Leafy</b>
      <span style="font:500 38px/1.25 ${F};color:#9fd3b2;text-align:center">Never forget<br>to water again.</span></div>`);
    at(film, SX - 280, FT);
    const filmKids = [...film.children];
    filmKids.forEach((k, i) => { const tb = 16.0 + i * 0.125; draws.push((t) => applyVis(k, vis(t, tb, 19.875), `scale(${popS(t, tb, 0.7).toFixed(4)})`)); });
    const fps = W(`<div class="mono" style="padding:14px 20px;border-radius:14px;background:rgba(0,0,0,.4);font:700 28px/1 ${MO};color:${C.text};letter-spacing:.06em;white-space:nowrap">60 FPS</div>`);
    at(fps, SX - 280 + 32, FT + 32); show(fps, 16.0, 19.875, (t) => `scale(${popS(t, 16.0, 0.5).toFixed(4)})`);
    const mus = W(`<div style="display:flex;align-items:center;gap:12px;padding:12px 20px;border-radius:14px;background:rgba(0,0,0,.4);font:700 28px/1 ${F};color:${C.text};white-space:nowrap">${ico('music', 30, C.amber)} Original score</div>`);
    at(mus, SX + 280 - 32 - 270, FT + 32); show(mus, 17.5, 19.875, (t) => `scale(${popS(t, 17.5, 0.5).toFixed(4)})`);
    // eq bars on the score
    const eq = W(`<div style="display:flex;align-items:flex-end;gap:8px;height:60px">${[...Array(14)].map(() => '<i style="display:block;width:12px;border-radius:6px;background:#9fd3b2"></i>').join('')}</div>`);
    at(eq, SX - 112, FT + 996 - 170); show(eq, 17.5, 19.875);
    const eqB = [...eq.children];
    draws.push((t) => eqB.forEach((b, i) => { const ph = (t * 2) % 1; const beat = Math.exp(-ph * 5); const a = 0.25 + 0.75 * Math.abs(Math.sin(t * 7.3 + i * 0.9)) * (0.5 + 0.5 * beat); b.style.height = (8 + 52 * a).toFixed(1) + 'px'; }));
    const prog = W(`<div style="width:480px;height:10px;border-radius:5px;background:rgba(255,255,255,.18)"><i style="display:block;height:10px;border-radius:5px;background:#fff"></i></div>`);
    at(prog, SX - 240, FT + 996 - 70); show(prog, 16.25, 19.875);
    const progF = prog.firstElementChild;
    draws.push((t) => { progF.style.width = (480 * clamp((t - 16.0) / 3.8)).toFixed(1) + 'px'; });
    cue(15.875, 'whoosh', { v: 0.9 }); cue(16.0, 'drop'); cue(16.0, 'slam', { n: 0 });
    cue(16.5, 'slam', { n: 1 }); cue(17.0, 'slam', { n: 2 }); cue(17.5, 'pop', { n: 4 }); cue(17.5, 'swap', { n: 2 });
    cue(17.75, 'whoosh', { v: 0.8 }); [17.75, 17.875, 18.0].forEach((tt, i) => cue(tt, 'pop', { n: i }));
    cue(18.5, 'shimmer'); cue(19.0, 'whoosh', { v: 0.6 });

    // ───────────────────────── S5 · formats + duration ─────────────────────────
    const FMT = [['9:16', 'Portrait', 20.0, T_F2], ['16:9', 'Landscape', T_F2, T_F3], ['1:1', 'Square', T_F3, 21.875]];
    FMT.forEach(([r, n, tin, tout], i) => {
      const e = W(`<div style="width:700px;display:flex;flex-direction:column;align-items:center;gap:20px">
        <b class="mono" style="font:700 150px/1 ${MO};letter-spacing:-.04em;color:#EAF7EE">${r}</b>
        <span style="font:600 44px/1 ${F};color:#9fd3b2">${n}</span></div>`);
      ctr(e, SX, SY); show(e, tin + 0.06, tout - 0.03);
      if (i) cue(tin + 0.03, 'swap', { n: i + 1 });
    });
    cue(20.0, 'swap', { n: 0 });
    const SEGY = 1740, SEGW = 600, SEGB = 200;
    const seg = W(`<div style="width:${SEGW + 16}px;height:116px;border-radius:58px;background:${C.panel2};box-shadow:inset 0 0 0 2px ${C.line}"></div>`);
    at(seg, SX - SEGW / 2 - 8, SEGY - 58); show(seg, 20.125, 21.875);
    const segX = (i) => SX - SEGW / 2 + i * SEGB;
    const SL = new Track(segX(0)).to(T_F2, segX(1), { w: 15, z: 0.9 }).to(T_F3, segX(2), { w: 15, z: 0.9 });
    const SR = new Track(segX(1)).to(T_F2, segX(2), { w: 30, z: 0.85 }).to(T_F3, segX(3), { w: 30, z: 0.85 });
    const segI = W(`<div style="height:100px;border-radius:50px;background:${C.amber}"></div>`);
    draws.push((t) => { rect(segI, SL.at(t), SEGY - 50, SR.at(t) - SL.at(t), 100); applyVis(segI, vis(t, 20.25, 21.875)); });
    const segLbl = ['9:16', '16:9', '1:1'].map((r, i) => {
      const e = W(`<div class="mono" style="width:${SEGB}px;height:100px;display:flex;align-items:center;justify-content:center;font:700 38px/1 ${MO}">${r}</div>`);
      at(e, segX(i), SEGY - 50); show(e, 20.25, 21.875);
      const ton = [0, T_F2, T_F3][i], toff = [T_F2, T_F3, 99][i];
      draws.push((t) => { const a = clamp((i === 0 ? 1 : stepR(t - ton, SP.text)) - stepR(t - toff, SP.text)); e.style.color = M.mix(C.muted, C.ink, a); });
      return e;
    });
    cue(T_F2, 'click'); cue(T_F3, 'click');
    // duration: drag a knob, the pill reads the stop under it
    const DURS = ['30 s', '45 s', '60 s', '2 min', '3 min', '5 min'];
    const KTL = SX - 360, KTR = SX + 360, KY = SY + 230;
    const stopX = (i) => KTL + (KTR - KTL) * i / 5;
    const durEls = DURS.map((d) => { const e = W(`<div style="width:700px;display:flex;align-items:center;justify-content:center;gap:24px"><span class="mono" style="font:500 34px/1 ${MO};color:${C.dim};letter-spacing:.1em">LENGTH</span><b style="font:700 84px/1 ${F};letter-spacing:-.04em;white-space:nowrap">${d}</b></div>`); ctr(e, SX, SY); return e; });
    const kTrack = W(`<div style="width:${KTR - KTL + 40}px;height:14px;border-radius:7px;background:rgba(255,255,255,.12)"></div>`);
    at(kTrack, KTL - 20, KY - 7); show(kTrack, 22.0, 23.0);
    const kFill = W(`<div style="height:14px;border-radius:7px;background:${C.amber}"></div>`);
    const kStops = DURS.map((_, i) => { const e = W(`<div style="width:22px;height:22px;border-radius:11px;background:${C.panel}"></div>`); ctr(e, stopX(i), KY); show(e, 22.0, 23.0); return e; });
    const knob = W(`<div style="width:66px;height:66px;border-radius:33px;background:${C.text};box-shadow:0 6px 16px rgba(0,0,0,.5)"></div>`);

    // ───────────────────────── Cursor tracks ─────────────────────────
    const CX = new Track(900), CYt = new Track(1760), CO = new Track(0);
    const mv = (t, x, y, sp = SP.cursor) => { CX.to(t, x, sp); CYt.to(t, y, sp); };
    CO.to(6.625, 1, SP.text);
    mv(6.75, CL + 300, CT + 110);                 // click into the prompt
    mv(7.5, 880, 1650, SP.soft);                  // step aside while typing
    mv(10.5, CL + 44 + 50, FY + 12);              // to the 9:16 button
    mv(11.5, RECX + 8, RECY + 10);                // record
    mv(12.375, SX + 330, SY + 150, SP.soft);
    // agent handoff: the cursor becomes "Claude"
    ROWS.forEach(([, tc], i) => mv(tc - 0.375, DL + 44 + 34, RY0 + i * RH + RH / 2 + 6));
    mv(14.875, 900, 1740, SP.soft);
    CO.to(15.25, 0, SP.text);
    CO.to(20.125, 1, SP.text);
    mv(19.75, 900, 1860, SP.snap);
    mv(20.25, segX(1) + SEGB / 2 + 6, SEGY + 12);
    mv(21.0, segX(2) + SEGB / 2 + 6, SEGY + 12);
    mv(21.625, stopX(0) + 4, KY + 10);
    mv(GRAB + 0.0625, stopX(5) + 30, KY + 10, { w: 7, z: 0.95 });
    mv(LET + 0.0625, 910, 840, { w: 9, z: 0.95 });            // up to the tab's ×
    mv(25.25, 920, 1700, SP.soft);
    CO.to(25.5, 0, SP.text);
    CO.to(29.25, 1, SP.text);
    mv(28.75, 900, 1800, SP.snap);
    mv(29.375, SX + 140, SY + 40);
    mv(30.375, 860, 1640, SP.soft);
    CO.to(30.5, 0, SP.text);

    // knob: direct manipulation while held, then it springs into the nearest stop
    const knobX = (t) => {
      if (t < GRAB) return stopX(0);
      if (t < LET) return clamp(CX.at(t) - 4, KTL, KTR);
      const xr = clamp(CX.at(LET) - 4, KTL, KTR); return stopX(5) + (xr - stopX(5)) * (1 - stepR(t - LET, { w: 18, z: 0.8 }));
    };
    let lastStop = 0; const stopTimes = [];
    for (let tt = GRAB; tt <= LET + 0.4; tt += 1 / 240) { const i = Math.round((knobX(tt) - KTL) / ((KTR - KTL) / 5)); if (i > lastStop) { lastStop = i; stopTimes.push([tt, i]); } }
    stopTimes.forEach(([tt]) => cue(Math.round(tt / 0.0625) * 0.0625, 'tick'));
    draws.push((t) => {
      const x = knobX(t), g = vis(t, 22.0, 23.0);
      const held = t >= GRAB && t < LET ? 1 : 0;
      ctr(knob, x, KY);
      applyVis(knob, g, `scale(${(press(t, GRAB) * (1 + 0.12 * held * clamp((t - GRAB) / 0.1))).toFixed(4)})`);
      rect(kFill, KTL - 20, KY - 7, x - KTL + 20, 14); applyVis(kFill, g);
      kStops.forEach((s, i) => { s.style.background = x >= stopX(i) - 4 ? C.ink : C.panel; });
      const idx = clamp(Math.round((x - KTL) / ((KTR - KTL) / 5)), 0, 5);
      durEls.forEach((e, i) => {
        if (i !== idx || t < 21.95 || t > 23.0 + 0.12) { e.style.visibility = 'hidden'; return; }
        const v = vis(t, i === 0 ? 22.0 : GRAB, 23.0);
        applyVis(e, { ...v, o: v.o, b: v.b }, `scale(${(i === 0 ? 1 : bump(t, stopTimes.find((s) => s[1] === i)?.[0] ?? 0, 0.06, 0.06)).toFixed(4)})`);
      });
    });
    cue(21.875, 'swap', { n: 4 }); cue(GRAB, 'click'); cue(GRAB, 'drag', { d: LET - GRAB }); cue(LET, 'release'); cue(LET + 0.125, 'settle');

    // ───────────────────────── S6 · render card: close the tab, it keeps rolling ─────────────────────────
    const RL = SX - 470, RT = SY - 300;
    const tab = W(`<div style="width:860px;height:96px;display:flex;align-items:center;gap:18px;padding:0 20px;border-radius:24px;background:${C.panel2}">
      ${mark(48)}<span style="flex:1;font:600 38px/1 ${F};white-space:nowrap">vigenco</span>
      <span class="av" style="width:60px;height:60px;border-radius:16px;color:${C.muted}">${ico('x', 34)}</span></div>`);
    at(tab, RL + 40, RT + 40);
    const TABOFF = T_X + 0.06;
    draws.push((t) => {
      const v = vis(t, 23.375, TABOFF, 0.18);
      applyVis(tab, v, `scale(${(1 - 0.06 * clamp((t - TABOFF) / 0.18)).toFixed(4)})`);
      tab.lastElementChild.style.background = t > T_X - 0.25 ? 'rgba(255,255,255,.1)' : 'transparent';
    });
    const closedLbl = W(`<div class="mono" style="font:500 30px/1 ${MO};color:${C.dim};letter-spacing:.06em;white-space:nowrap">TAB CLOSED · STILL RENDERING</div>`);
    at(closedLbl, RL + 60, RT + 72); show(closedLbl, T_X + 0.25, T_DONE - 0.05);
    cue(T_X, 'click'); cue(T_X + 0.06, 'whoosh', { v: 0.4 });
    const rTxt = W(`<div style="display:flex;align-items:center;gap:22px;white-space:nowrap">${ico('cloud', 56, C.amber)}<span style="font:700 52px/1 ${F};letter-spacing:-.03em">Rendering on GitHub</span></div>`);
    at(rTxt, RL + 60, RT + 210); show(rTxt, 23.5, T_DONE - 0.05);
    const bar = W(`<div style="width:820px;height:24px;border-radius:12px;background:rgba(255,255,255,.08)"><i style="display:block;height:24px;border-radius:12px;background:${C.amber}"></i></div>`);
    at(bar, RL + 60, RT + 330); show(bar, 23.625, T_DONE - 0.05);
    const barF = bar.firstElementChild;
    const pct = W(`<div class="mono" style="width:820px;display:flex;justify-content:space-between;font:500 30px/1 ${MO};color:${C.muted}"><span>frame</span><span></span></div>`);
    at(pct, RL + 60, RT + 390); show(pct, 23.625, T_DONE - 0.05);
    const pctN = pct.lastElementChild, pctL = pct.firstElementChild;
    const prg = (t) => { const x = clamp((t - 23.625) / (T_DONE - 0.125 - 23.625)); return 1 - Math.pow(1 - x, 1.6); };
    draws.push((t) => {
      const p = prg(t); barF.style.width = (820 * p).toFixed(1) + 'px';
      pctN.textContent = Math.round(p * 100) + '%';
      pctL.textContent = `frame ${Math.round(p * 1920)} / 1920`;
    });
    [24.0, 24.5].forEach((tt) => cue(tt, 'tick'));
    // done: same card, new content
    const done = W(`<div style="width:820px;display:flex;flex-direction:column;gap:40px">
      <div style="display:flex;align-items:center;gap:26px"><span class="av" style="width:96px;height:96px;background:${C.ok};color:#06210f">${ico('check', 54)}</span>
        <b style="font:700 64px/1 ${F};letter-spacing:-.04em;white-space:nowrap">Your film is ready</b></div>
      <div style="display:flex;align-items:center;gap:20px;height:120px;padding:0 20px 0 24px;border-radius:26px;background:${C.panel2}">
        ${ico('film', 52, C.amber)}<span style="flex:1;display:flex;flex-direction:column;gap:10px"><b style="font:700 38px/1 ${F};white-space:nowrap">leafy-launch.mp4</b><span class="mono" style="font:500 26px/1 ${MO};color:${C.muted}">9:16 · 60 fps · with score</span></span>
        <span class="av" style="width:80px;height:80px;border-radius:20px;background:${C.amber};color:${C.ink}">${ico('dl', 42)}</span></div></div>`);
    at(done, RL + 60, RT + 150);
    const doneKids = [...done.children];
    doneKids.forEach((k, i) => { const tb = T_DONE + 0.06 + i * 0.25; draws.push((t) => applyVis(k, vis(t, tb, T_LOGO - 0.125), `scale(${popS(t, tb, 0.8).toFixed(4)})`)); });
    cue(T_DONE, 'check'); cue(T_DONE, 'note', { n: 4 }); cue(T_DONE + 0.31, 'pop', { n: 2 }); cue(25.5, 'riser', { d: 0.5 });

    // ───────────────────────── S7 · logo ─────────────────────────
    const wm = W(`<div style="font:700 130px/1 ${F};letter-spacing:-.06em;color:${C.text};white-space:nowrap">vigenco</div>`);
    ctr(wm, SX, SY + 300); show(wm, 26.5, 28.75, (t) => `scale(${popS(t, 26.5, 0.85).toFixed(4)})`);
    const tag = W(`<div style="font:500 60px/1.1 ${F};letter-spacing:-.03em;color:${C.muted};white-space:nowrap">Write a prompt. <span class="serif" style="font-size:1.15em">Get the film.</span></div>`);
    ctr(tag, SX, SY + 440); show(tag, 27.0, 28.75);
    const pills = W(`<div style="display:flex;gap:16px">${['Directed by Claude', '60 fps', '30 s – 5 min'].map((c) => `<span style="padding:18px 26px;border-radius:999px;background:${C.panel2};box-shadow:inset 0 0 0 2px ${C.line};font:600 32px/1 ${F};color:${C.text};white-space:nowrap">${c}</span>`).join('')}</div>`);
    ctr(pills, SX, SY - 380);
    [...pills.children].forEach((c, i) => { const tb = 27.5 + i * 0.25; draws.push((t) => applyVis(c, vis(t, tb, 28.75), `scale(${popS(t, tb, 0.7).toFixed(4)})`)); cue(tb, 'pop', { n: i + 1 }); });
    cue(T_LOGO, 'slam', { n: 3 }); cue(T_LOGO, 'drop'); cue(26.5, 'shimmer'); cue(27.0, 'note', { n: 2 });
    cue(28.25, 'riser', { d: 0.75 });

    // ───────────────────────── S8 · CTA ─────────────────────────
    const ctaA = W(`<div style="width:860px;height:180px;display:flex;align-items:center;justify-content:center;gap:22px;color:${C.ink};font:800 56px/1 ${F};letter-spacing:-.03em;white-space:nowrap">Write your first prompt ${ico('arrow', 56)}</div>`);
    ctr(ctaA, SX, SY); show(ctaA, 29.0, CTA + 0.05, (t) => `scale(${press(t, CTA).toFixed(4)})`);
    const ctaB = W(`<div style="width:860px;height:180px;display:flex;align-items:center;justify-content:center;gap:18px;color:${C.ink};font:700 46px/1 ${F};letter-spacing:-.02em;white-space:nowrap">${ico('check', 50)} chalidade.github.io/vigenco</div>`);
    ctr(ctaB, SX, SY); show(ctaB, CTA + 0.125, null);
    const endLogo = W(`<div style="display:flex;align-items:center;gap:24px;white-space:nowrap">${mark(100)}<b style="font:700 80px/1 ${F};letter-spacing:-.05em;color:${C.text}">vigenco</b></div>`);
    ctr(endLogo, SX, SY + 280); show(endLogo, 29.5, null);
    const fine = add(`<div class="mono" style="left:0;top:1720px;width:1080px;text-align:center;font:500 30px/1.6 ${MO};color:${C.dim};letter-spacing:.04em">Runs in your GitHub · Rendered at 60 fps</div>`);
    show(fine, 30.5, null);
    cue(28.875, 'swap', { n: 3 }); cue(29.5, 'pop', { n: 2 }); cue(CTA, 'cta'); cue(30.5, 'shimmer'); cue(31.0, 'settle');

    // z-order: tiles under everything
    TILES.slice().reverse().forEach(({ e }) => world.insertBefore(e, world.firstChild));

    // ───────────────────────── Cursor draw ─────────────────────────
    const cur = add(`<div class="cur"><svg viewBox="0 0 24 24"><path d="M4 2.5 20 11l-7 1.8L9.6 20z" fill="${C.text}" stroke="#111" stroke-width="1.6" stroke-linejoin="round"/></svg><span class="pill">You</span></div>`);
    const rip = add('<div class="rip"></div>');
    const curPill = cur.querySelector('.pill'), curPath = cur.querySelector('path');
    const clicks = [T_TXT, T_FMT, T_REC, T_R1, T_R2, T_R3, T_F2, T_F3, GRAB, T_X, CTA];
    const isAgent = (t) => t >= 12.5 && t < 15.5;
    draws.push((t) => {
      const [sx, sy] = toS(CX.at(t), CYt.at(t), t);
      const o = clamp(CO.at(t));
      const vx = (toS(CX.at(t + 0.01), CYt.at(t + 0.01), t + 0.01)[0] - sx) / 0.01;
      let sc = 1; for (const c of clicks) sc *= press(t, c);
      sc *= 1 - 0.12 * clamp((t - GRAB) / 0.08) * clamp((LET - t) / 0.08);
      const ag = isAgent(t);
      curPill.textContent = ag ? 'Claude' : 'You';
      curPill.style.background = ag ? C.coral : C.text;
      curPill.style.color = ag ? '#1a0c08' : '#111';
      curPath.setAttribute('fill', ag ? C.coral : C.text);
      // pill swap pop at the handoff
      const hs = ag ? popS(t, 12.5, 0.6) : (t >= 15.5 ? 1 : 1);
      at(cur, sx, sy); cur.style.opacity = o.toFixed(3);
      const flip = clamp((sx - 820) / 80); curPill.style.left = lerp(44, -curPill.offsetWidth - 4, flip).toFixed(1) + 'px';
      curPill.style.transform = `scale(${hs.toFixed(4)})`;
      cur.style.transform = `rotate(${clamp(-vx * 0.0045, -14, 14).toFixed(2)}deg) scale(${sc.toFixed(4)})`;
      let rp = null, rx = 0, ry = 0; for (const c of clicks) { const r = ripple(t, c); if (r) { rp = r; [rx, ry] = toS(CX.at(c), CYt.at(c), t); } }
      if (rp && o > 0.3) { at(rip, rx, ry); rip.style.opacity = rp.o.toFixed(3); rip.style.transform = `scale(${rp.s.toFixed(3)})`; rip.style.borderColor = ag ? C.coral : C.amber; } else rip.style.opacity = 0;
    });
    cue(12.5, 'swap', { n: 1 });

    // ───────────────────────── Seek ─────────────────────────
    const DUR = 32.0;
    window.seek = (t) => {
      const z = camZ(t), [qx, qy] = shake(t);
      world.style.transform = `translate(${(SX + qx).toFixed(2)}px, ${(SY + qy).toFixed(2)}px) scale(${z.toFixed(5)}) translate(${-SX}px, ${-SY}px)`;
      hud.style.transform = `translate(${(qx * 0.5).toFixed(2)}px, ${(qy * 0.5).toFixed(2)}px)`;
      for (const d of draws) d(t);
    };
    cue(0.0, 'born'); cue(0.5, 'whoosh', { v: 0.6 }); cue(2.875, 'whoosh', { v: 0.7 }); cue(6.75, 'whoosh', { v: 0.6 });
    cue(12.875, 'whoosh', { v: 0.7 }); cue(20.0, 'whoosh', { v: 0.6 }); cue(23.125, 'whoosh', { v: 0.6 });
    cues.sort((a, b) => a.t - b.t);
    window.FILM = { width: 1080, height: 1920, bpm: 120, duration: DUR,
      sections: { intro: [0, 6], build: [12, 16], drop: [16, 20], outro: [28, 32] }, cues };
    window.seek(0);
    window.READY = true;
  } catch (err) {
    window.FILM_ERROR = String(err && err.stack || err);
    console.error(err);
  }
})();
