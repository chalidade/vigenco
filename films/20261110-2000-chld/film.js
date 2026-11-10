// Chalid Ade Rahman · portfolio film. Landscape 1920×1080, 120 BPM, 32 s.
// One shape, never cut: dot → headline pill → search field → profile card → Lerero card
// → night (Saling Jaga, the drop) → stats → product slams → avatar disc + CTA.
(async function () {
  try {
    const { clamp, lerp, outQ, stepR, Track, ColorTrack, SP, vis, applyVis, press, ripple } = M;
    const C = {
      canvas: '#f4f4f5', ink: '#0a0a0a', card: '#ffffff', line: '#e4e4e7', muted: '#52525b', subtle: '#a1a1aa',
      blue: '#2563eb', blueSoft: '#eff6ff', sky: '#60a5fa',
      night: '#0b1a12', night2: '#13271d', cream: '#f2edd5', leaf: '#3cbf6e', leafInk: '#04140a', mossTx: '#a5b0a2',
      sos: '#ef4b4b', yellow: '#fff000',
    };

    await Promise.all(['400', '500', '600', '700', '800'].map((w) => document.fonts.load(`${w} 40px "Geist"`).catch(() => null)));
    await Promise.all(['500', '600'].map((w) => document.fonts.load(`${w} 24px "Geist Mono"`).catch(() => null)));
    await document.fonts.ready;
    const img = (src) => new Promise((r) => { const i = new Image(); i.onload = () => r(i); i.onerror = () => r(i); i.src = src; });
    await Promise.all([img('assets/avatar.jpg'), img('assets/sj-mark.png')]);

    const cues = [];
    const cue = (t, k, o = {}) => cues.push({ t, k, ...o });
    const world = document.getElementById('world');
    const hud = document.getElementById('hud');
    const nightL = document.getElementById('night');
    const draws = [];
    const add = (html, parent = world) => { const d = document.createElement('div'); d.innerHTML = html.trim(); const e = d.firstElementChild; parent.appendChild(e); return e; };
    const at = (e, x, y) => { e.style.left = x.toFixed(2) + 'px'; e.style.top = y.toFixed(2) + 'px'; return e; };
    const rect = (e, x, y, w, h) => { at(e, x, y); e.style.width = Math.max(0, w).toFixed(2) + 'px'; e.style.height = Math.max(0, h).toFixed(2) + 'px'; };
    const show = (e, tin, tout, extra = '') => draws.push((t) => applyVis(e, vis(t, tin, tout), typeof extra === 'function' ? extra(t) : extra));
    const popS = (t, tin, s0 = 0.5) => s0 + (1 - s0) * stepR(t - tin, SP.pop);
    const P = (d, sw = 2.2) => `<svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
    const I = {
      search: P('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>', 2.4),
      check: P('<path d="M20 6 9 17l-5-5"/>', 3),
      arrow: P('<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>', 2.6),
      wifi: P('<path d="M2 8.5a15 15 0 0 1 20 0"/><path d="M5 12a10.5 10.5 0 0 1 14 0"/><path d="M8.5 15.5a5.5 5.5 0 0 1 7 0"/><circle cx="12" cy="19" r="1" fill="currentColor"/>'),
      nosig: P('<path d="M4 20v-2M9 20v-5M14 20v-8M19 20V7"/><path d="m3 3 18 18"/>', 2.4),
      pin: P('<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>'),
      globe: P('<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>'),
      lock: P('<rect x="4.5" y="10.5" width="15" height="10" rx="2.5"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>'),
    };
    const ico = (k, s, col = 'currentColor', st = '') => `<span class="ic" style="width:${s}px;height:${s}px;color:${col};${st}">${I[k]}</span>`;

    // ───────────────────────── Camera ─────────────────────────
    const CAM = { z: new Track(Math.log(1.3)), zx: new Track(960), zy: new Track(540) };
    const cam = (t, z, zx, zy, sp = SP.cam) => { CAM.z.to(t, Math.log(z), sp); if (zx != null) { CAM.zx.to(t, zx, sp); CAM.zy.to(t, zy, sp); } };
    cam(0.25, 1.2);
    cam(3.75, 1.3); cam(5.5, 1.26);
    cam(7.75, 1.02); cam(10.0, 1.0);
    cam(11.75, 1.03); cam(14.0, 1.0);
    cam(15.875, 1.07, 960, 540, { w: 16, z: 0.8 }); cam(16.75, 1.0);
    cam(19.75, 1.03); cam(22.0, 1.0);
    cam(23.75, 1.05); cam(26.75, 1.0);
    cam(27.75, 1.03); cam(31.0, 1.0);
    const toS = (x, y, t) => { const z = Math.exp(CAM.z.at(t)), zx = CAM.zx.at(t), zy = CAM.zy.at(t); return [zx + (x - zx) * z, zy + (y - zy) * z]; };

    // night layer (the drop)
    const NIGHT = new Track(0);
    NIGHT.to(15.75, 1, { w: 22, z: 1 }); NIGHT.to(23.75, 0, { w: 9, z: 1 });
    draws.push((t) => { nightL.style.opacity = clamp(NIGHT.at(t)).toFixed(3); });

    // ───────────────────────── The one shape ─────────────────────────
    const body = add('<div style="overflow:hidden"></div>');
    const PB = { l: new Track(946), t: new Track(526), r: new Track(974), b: new Track(554), rad: new Track(14), col: new ColorTrack(C.ink), bd: new Track(0) };
    const pm = (t, cx, cy, w, h, rad, col, sp = SP.shape) => {
      PB.l.to(t, cx - w / 2, sp); PB.t.to(t, cy - h / 2, sp); PB.r.to(t, cx + w / 2, sp); PB.b.to(t, cy + h / 2, sp); PB.rad.to(t, rad, sp);
      if (col) PB.col.to(t, col, SP.soft);
    };
    const SEARCH = 7.125, LANG = 14.5, SOS = 18.5, CTA = 30.0;
    const shapeHits = [4.5, SEARCH, LANG];
    const slamT = [24.0, 24.5, 25.0, 25.5, 26.0, 26.5];
    draws.push((t) => {
      const l = PB.l.at(t), tp = PB.t.at(t), r = PB.r.at(t), b = PB.b.at(t);
      rect(body, l, tp, r - l, b - tp);
      body.style.borderRadius = Math.min(PB.rad.at(t), (r - l) / 2, (b - tp) / 2).toFixed(2) + 'px';
      body.style.background = PB.col.at(t);
      let s = popS(t, 0.25, 0.2);
      for (const tc of shapeHits) s *= 1 - 0.03 * Math.exp(-(((t - tc) / 0.08) ** 2));
      for (const tc of slamT) s *= 1 + 0.05 * Math.exp(-(((t - tc) / 0.07) ** 2));
      s *= 1 + 0.025 * Math.exp(-(((t - 16.0) / 0.09) ** 2));
      body.style.transform = `scale(${s.toFixed(4)})`;
      const bd = clamp(PB.bd.at(t));
      body.style.boxShadow = `0 40px 90px -36px rgba(10,10,10,${(0.28 + 0.3 * NIGHT.at(t)).toFixed(3)}), inset 0 0 0 2px rgba(10,10,10,${(0.08 * bd).toFixed(3)})`;
    });
    cue(0.25, 'born');
    pm(0.5, 960, 540, 1080, 150, 75, C.ink);
    pm(3.75, 960, 540, 1180, 136, 68, C.card); PB.bd.to(3.75, 1, SP.text);
    pm(7.75, 960, 560, 1400, 600, 44, C.card);
    pm(11.75, 960, 560, 1520, 640, 44, C.card);
    pm(15.75, 960, 540, 1800, 960, 48, C.night, { w: 15, z: 0.78 }); PB.bd.to(15.75, 0, SP.text);
    pm(19.75, 960, 560, 1640, 720, 44, C.night2);
    // product slams: one pill re-sized and re-coloured on every hit
    const SLAMS = [
      { n: 'Lerero v2', w: 620, col: C.ink, tx: '#fff' },
      { n: 'Saling Jaga', w: 700, col: '#1f9d55', tx: '#fff' },
      { n: 'jobfair.co.id', w: 780, col: C.yellow, tx: C.ink },
      { n: 'toowl · 70+ tools', w: 920, col: C.blue, tx: '#fff' },
      { n: 'Kita Berkembang', w: 880, col: C.ink, tx: '#fff' },
      { n: 'Kuliah Indo', w: 680, col: '#7c3aed', tx: '#fff' },
    ];
    SLAMS.forEach((s, i) => pm(slamT[i] - 0.125, 960, 560, s.w, 168, 84, s.col, { w: 26, z: 0.75 }));
    pm(27.75, 960, 380, 260, 260, 130, C.ink);

    // ───────────────────────── 1 · Headline pill (0–3.75) ─────────────────────────
    const heads = [
      [0.75, 1.875, 'Hi, I’m Chalid.'],
      [2.0, 2.875, 'I build web products'],
      [3.0, 3.625, 'people <span style="color:' + C.sky + '">actually use.</span>'],
    ];
    heads.forEach(([a, b, h], i) => {
      const e = add(`<div style="left:420px;top:497px;width:1080px;text-align:center;font:700 70px/86px 'Geist';letter-spacing:-.035em;color:#fff;white-space:nowrap">${h}</div>`);
      show(e, a, b); cue(a, i ? 'swap' : 'pop', { n: i });
    });

    // ───────────────────────── 2 · Search (3.75–7.75) ─────────────────────────
    const FL = 960 - 590, FT = 540 - 68;
    const sIcon = add(`<div style="left:${FL + 44}px;top:${FT + 44}px">${ico('search', 48, C.subtle)}</div>`);
    show(sIcon, 4.0, 7.625);
    const ph = add(`<div style="left:${FL + 118}px;top:${FT + 40}px;font:500 44px/56px 'Geist';color:${C.subtle};white-space:nowrap">Find an engineer who ships…</div>`);
    show(ph, 4.0, 4.75);
    const QUERY = 'frontend + product + remote';
    const T0 = 4.875, DT = 0.0625;
    const typed = add(`<div style="left:${FL + 118}px;top:${FT + 40}px;font:600 44px/56px 'Geist';color:${C.ink};white-space:nowrap"></div>`);
    const caret = add(`<div style="width:4px;height:52px;border-radius:2px;background:${C.blue}"></div>`);
    for (let i = 0; i < QUERY.length; i++) if (QUERY[i] !== ' ') cue(T0 + i * DT, 'key');
    const btn = add(`<div style="left:${FL + 1180 - 24 - 220}px;top:${FT + 22}px;width:220px;height:92px;border-radius:46px;background:${C.blue};color:#fff;display:flex;align-items:center;justify-content:center;font:700 34px/1 'Geist'"><span id="bt">Search</span></div>`);
    const bt = btn.querySelector('#bt');
    const spin = add(`<div style="left:${FL + 1180 - 24 - 110 - 22}px;top:${FT + 46}px;width:44px;height:44px;border-radius:50%;border:5px solid rgba(255,255,255,.35);border-top-color:#fff"></div>`);
    const chk = add(`<div style="left:${FL + 1180 - 24 - 110 - 24}px;top:${FT + 44}px">${ico('check', 48, '#fff')}</div>`);
    draws.push((t) => {
      const n = clamp(Math.floor((t - T0) / DT) + 1, 0, QUERY.length);
      typed.textContent = t < T0 ? '' : QUERY.slice(0, n);
      const v = vis(t, 4.875, 7.625);
      applyVis(typed, v);
      const w = typed.offsetWidth;
      at(caret, FL + 118 + w + 6, FT + 42);
      const blink = t < T0 + QUERY.length * DT ? 1 : (Math.floor(t * 4) % 2 ? 0.25 : 1);
      caret.style.opacity = (t > 4.5 && t < 7.5 ? blink : 0).toFixed(2);
      applyVis(btn, vis(t, 4.0, 7.625), `scale(${(popS(t, 4.0, 0.7) * press(t, SEARCH)).toFixed(4)})`);
      const bo = t < SEARCH ? 1 : clamp(1 - (t - SEARCH) / 0.08);
      bt.style.opacity = bo.toFixed(3);
      const sp = t >= SEARCH && t < 7.5;
      spin.style.opacity = sp ? Math.min(1, (t - SEARCH) / 0.08).toFixed(3) : 0;
      spin.style.transform = `rotate(${((t - SEARCH) * 900).toFixed(1)}deg)`;
      applyVis(chk, vis(t, 7.5, 7.625, 0.1), `scale(${popS(t, 7.5, 0.4).toFixed(4)})`);
    });
    cue(4.0, 'pop'); cue(4.5, 'click'); cue(SEARCH, 'click'); cue(7.5, 'check');

    // ───────────────────────── 3 · Profile card (7.75–11.75) ─────────────────────────
    const CL = 960 - 700, CT = 560 - 300;
    const av = add(`<div style="left:${CL + 70}px;top:${CT + 140}px;width:320px;height:320px;border-radius:50%;background:url(assets/avatar.jpg) center/cover;box-shadow:0 0 0 8px ${C.blueSoft}"></div>`);
    draws.push((t) => applyVis(av, vis(t, 8.0, 11.625), `scale(${popS(t, 8.0, 0.6).toFixed(4)})`));
    cue(8.0, 'pop', { n: 1 });
    const pKick = add(`<div class="kick" style="left:${CL + 460}px;top:${CT + 92}px;color:${C.blue}">Senior Frontend Engineer</div>`);
    const pName = add(`<div style="left:${CL + 456}px;top:${CT + 132}px;font:800 92px/1.05 'Geist';letter-spacing:-.045em;white-space:nowrap">Chalid Ade Rahman</div>`);
    const pLine = add(`<div style="left:${CL + 460}px;top:${CT + 250}px;width:860px;font:500 34px/1.4 'Geist';color:${C.muted}">8+ years shipping production web apps for global teams in EdTech, logistics and fintech.</div>`);
    show(pKick, 8.25, 11.625); show(pName, 8.375, 11.625); show(pLine, 8.625, 11.625);
    const chipRow = add(`<div style="left:${CL + 460}px;top:${CT + 384}px;display:flex;gap:14px"></div>`);
    ['React', 'Next.js', 'TypeScript', 'Node.js'].forEach((s, i) => {
      const c = add(`<span class="chip" style="background:${C.blueSoft};color:${C.blue}">${s}</span>`, chipRow);
      const ti = 9.25 + i * 0.25;
      draws.push((t) => applyVis(c, vis(t, ti, 11.625), `scale(${popS(t, ti, 0.6).toFixed(4)})`));
      cue(ti, 'pop', { n: i + 2 });
    });
    const pMeta = add(`<div class="mono" style="left:${CL + 460}px;top:${CT + 476}px;display:flex;align-items:center;gap:14px;font:500 28px/1 'Geist Mono';color:${C.muted};white-space:nowrap">${ico('pin', 30, C.muted)} East Java, Indonesia · GMT+7 · Remote</div>`);
    show(pMeta, 10.5, 11.625); cue(10.5, 'settle');

    // ───────────────────────── 4 · Lerero v2 (11.75–15.75) ─────────────────────────
    const LL = 960 - 760, LT = 560 - 320;
    const lKick = add(`<div class="kick" style="left:${LL + 90}px;top:${LT + 84}px;color:${C.blue}">Day job · The KPI Institute (AU)</div>`);
    const lTitle = add(`<div style="left:${LL + 86}px;top:${LT + 126}px;font:800 104px/1 'Geist';letter-spacing:-.05em;white-space:nowrap">Lerero v2</div>`);
    const lSubEn = add(`<div style="left:${LL + 90}px;top:${LT + 250}px;font:500 38px/1.2 'Geist';color:${C.muted};white-space:nowrap">White-label LMS &amp; course marketplace</div>`);
    const lSubId = add(`<div style="left:${LL + 90}px;top:${LT + 250}px;font:500 38px/1.2 'Geist';color:${C.muted};white-space:nowrap">LMS white-label &amp; marketplace kursus</div>`);
    show(lKick, 12.0, 15.625); show(lTitle, 12.125, 15.625);
    show(lSubEn, 12.375, LANG + 0.0625); show(lSubId, LANG + 0.125, 15.625);
    const lStack = add(`<div class="mono" style="left:${LL + 90}px;top:${LT + 520}px;font:500 26px/1 'Geist Mono';color:${C.subtle};white-space:nowrap">Next.js · React 19 · TypeScript · Stripe · Playwright</div>`);
    show(lStack, 13.5, 15.625);
    // language toggle (EN | ID) with a stretchy indicator
    const TG = { x: LL + 90, y: LT + 360, w: 260, h: 84 };
    const tog = add(`<div style="left:${TG.x}px;top:${TG.y}px;width:${TG.w}px;height:${TG.h}px;border-radius:42px;background:${C.canvas};box-shadow:inset 0 0 0 2px ${C.line}"></div>`);
    const tInd = add(`<div style="border-radius:34px;background:${C.ink}"></div>`);
    const tEn = add(`<div style="left:${TG.x}px;top:${TG.y}px;width:${TG.w / 2}px;height:${TG.h}px;display:flex;align-items:center;justify-content:center;font:700 32px/1 'Geist'">EN</div>`);
    const tId = add(`<div style="left:${TG.x + TG.w / 2}px;top:${TG.y}px;width:${TG.w / 2}px;height:${TG.h}px;display:flex;align-items:center;justify-content:center;font:700 32px/1 'Geist'">ID</div>`);
    const tLbl = add(`<div style="left:${TG.x + TG.w + 28}px;top:${TG.y + 24}px;font:500 30px/1.2 'Geist';color:${C.muted};white-space:nowrap">Localised, 5 user roles</div>`);
    const tgL = new Track(TG.x + 8).to(LANG + 0.02, TG.x + TG.w / 2 + 2, { w: 19, z: 0.9 });
    const tgR = new Track(TG.x + TG.w / 2 - 2).to(LANG, TG.x + TG.w - 8, { w: 34, z: 0.9 });
    draws.push((t) => {
      const v = vis(t, 12.75, 15.625);
      [tog, tInd, tEn, tId, tLbl].forEach((e) => applyVis(e, v));
      rect(tInd, tgL.at(t), TG.y + 8, tgR.at(t) - tgL.at(t), TG.h - 16);
      const k = clamp((tgL.at(t) - TG.x - 8) / (TG.w / 2 - 6));
      tEn.style.color = k < 0.5 ? '#fff' : C.ink; tId.style.color = k < 0.5 ? C.ink : '#fff';
    });
    cue(12.75, 'pop'); cue(LANG, 'toggle');
    // odometer: 0 → 490, "+" after
    function odometer(parent, x, y, digits, size, color, comma) {
      const box = add(`<div style="left:${x}px;top:${y}px;display:flex;align-items:flex-start;font:800 ${size}px/1 'Geist';letter-spacing:-.04em;color:${color};white-space:nowrap"></div>`, parent);
      const lh = Math.round(size * 1.0), cw = Math.round(size * 0.6);
      const slots = [];
      for (let p = digits - 1; p >= 0; p--) {
        const sl = add(`<span class="slot" style="width:${cw}px;height:${lh}px"><span class="strip">${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((d) => `<span style="height:${lh}px;display:block">${d}</span>`).join('')}</span></span>`, box);
        slots.push({ p, sl, st: sl.firstElementChild });
        if (comma && p === 3) slots.push({ comma: add(`<span style="height:${lh}px">,</span>`, box) });
      }
      const plus = add(`<span style="height:${lh}px;color:${color}">+</span>`, box);
      return {
        box, plus,
        set(v, o) {
          for (const s of slots) {
            if (s.comma) { s.comma.style.opacity = (v >= 1000 ? 1 : 0); continue; }
            const P10 = 10 ** s.p;
            const pos = Math.floor(v / P10) % 10 + Math.max(0, (v % P10) - (P10 - 1));
            s.st.style.transform = `translateY(${(-pos * lh).toFixed(2)}px)`;
            s.sl.style.opacity = s.p === 0 ? 1 : clamp(Math.log10(Math.max(v, 1)) - s.p + 1.0).toFixed(3);
          }
          box.style.opacity = o;
        },
      };
    }
    const odoL = odometer(world, LL + 880, LT + 170, 4, 170, C.blue, true);
    const odoLbl = add(`<div style="left:${LL + 886}px;top:${LT + 372}px;width:540px;font:600 34px/1.3 'Geist';color:${C.ink}">merged PRs at The KPI Institute since 2021</div>`);
    const ODL = [12.5, 14.0];
    draws.push((t) => {
      const v = vis(t, 12.375, 15.625);
      const x = clamp((t - ODL[0]) / (ODL[1] - ODL[0]));
      const val = Math.round(2500 * outQ(x));
      odoL.set(val, v.o.toFixed(3));
      odoL.box.style.filter = v.b > 0.05 ? `blur(${v.b.toFixed(2)}px)` : 'none';
      odoL.plus.style.opacity = clamp((t - ODL[1]) / 0.1).toFixed(3);
      applyVis(odoLbl, vis(t, 13.0, 15.625));
    });
    for (let tt = ODL[0]; tt < ODL[1]; tt += 0.125) cue(tt, 'tick');
    cue(ODL[1], 'settle');
    cue(14.0, 'riser', { d: 2.0 });

    // ───────────────────────── 5 · Night: Saling Jaga (15.75–19.75) ─────────────────────────
    cue(16.0, 'drop'); cue(16.0, 'slam', { n: 0 });
    const NL = 960 - 900, NT = 540 - 480;
    const status = add(`<div class="mono" style="left:${NL + 80}px;top:${NT + 70}px;height:60px;display:flex;align-items:center;gap:14px;padding:0 26px 0 20px;border-radius:30px;background:rgba(19,39,29,.9);box-shadow:inset 0 0 0 2px rgba(242,237,213,.1);font:600 24px/1 'Geist Mono';letter-spacing:.06em;color:${C.cream};white-space:nowrap">${ico('nosig', 30, C.sos)} NO SIGNAL · NO SIM · NO INTERNET</div>`);
    show(status, 16.0, 19.625);
    const sjHead = add(`<div style="left:${NL + 80}px;top:${NT + 250}px;display:flex;align-items:center;gap:30px;white-space:nowrap"><img src="assets/sj-mark.png" style="width:118px;height:auto"><span style="font:800 104px/1 'Geist';letter-spacing:-.05em;color:${C.cream}">Saling Jaga</span></div>`);
    show(sjHead, 16.125, 19.625);
    const sjK = add(`<div class="kick" style="left:${NL + 84}px;top:${NT + 200}px;color:${C.leaf}">Side project · Solo · Android</div>`);
    show(sjK, 16.25, 19.625);
    const sj1 = add(`<div style="left:${NL + 84}px;top:${NT + 420}px;font:700 64px/1.12 'Geist';letter-spacing:-.035em;color:${C.cream};white-space:nowrap">When the signal dies,</div>`);
    const sj2 = add(`<div style="left:${NL + 84}px;top:${NT + 494}px;font:700 64px/1.12 'Geist';letter-spacing:-.035em;color:${C.leaf};white-space:nowrap">phones still find each other.</div>`);
    show(sj1, 16.5, 19.625); show(sj2, 17.0, 19.625);
    cue(16.5, 'swap', { n: 1 }); cue(17.0, 'swap', { n: 2 });
    const sj3 = add(`<div style="left:${NL + 84}px;top:${NT + 640}px;width:720px;font:500 32px/1.4 'Geist';color:${C.mossTx}">Calls, walkie-talkie, chat and SOS over Wi-Fi Direct. Every link encrypted.</div>`);
    show(sj3, 17.5, 19.625);
    // radar
    const RX = 1400, RY = 520;
    const rings = [16.0, 16.5, 17.0, 17.5, 18.0, 18.5, 19.0].map((tb) => ({ tb, e: add(`<div style="border-radius:50%;border:3px solid ${C.leaf}"></div>`) }));
    draws.push((t) => rings.forEach(({ tb, e }) => {
      const x = (t - tb) / 1.6;
      if (x < 0 || x > 1 || t > 19.6) { e.style.opacity = 0; return; }
      const r = 120 + 300 * (1 - Math.pow(1 - x, 3));
      rect(e, RX - r, RY - r, 2 * r, 2 * r);
      e.style.borderColor = t >= SOS && tb >= 18.5 ? C.sos : C.leaf;
      e.style.opacity = (0.5 * (1 - x)).toFixed(3);
    }));
    const core = add(`<div style="left:${RX - 100}px;top:${RY - 100}px;width:200px;height:200px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:${C.leafInk}">${ico('wifi', 92, C.leafInk)}</div>`);
    const coreC = new ColorTrack(C.leaf); coreC.to(SOS, C.sos, { w: 30, z: 1 });
    draws.push((t) => { applyVis(core, vis(t, 16.0, 19.625), `scale(${(popS(t, 16.0, 0.3) * (1 + 0.04 * Math.sin(t * 6.283))).toFixed(4)})`); core.style.background = coreC.at(t); });
    const peers = [['B', 'Budi', '#e8590c', -330, -150, 17.0], ['S', 'Sari', '#d6336c', 300, -200, 17.5], ['R', 'Rina', '#1e7a45', 250, 230, 18.0]];
    peers.forEach(([ch, nm, col, dx, dy, ti], i) => {
      const p = add(`<div style="left:${RX + dx - 60}px;top:${RY + dy - 60}px;width:120px;display:flex;flex-direction:column;align-items:center;gap:12px"><div style="width:96px;height:96px;border-radius:50%;background:${col};display:flex;align-items:center;justify-content:center;font:800 44px/1 'Geist';color:#fff;box-shadow:0 0 0 6px rgba(242,237,213,.12)">${ch}</div><div style="font:700 26px/1 'Geist';color:${C.cream}">${nm}</div></div>`);
      draws.push((t) => applyVis(p, vis(t, ti, 19.625), `scale(${popS(t, ti, 0.4).toFixed(4)})`));
      cue(ti, 'note', { n: i });
    });
    const sosB = add(`<div style="left:${RX - 130}px;top:${RY + 330}px;width:260px;height:96px;border-radius:48px;display:flex;align-items:center;justify-content:center;font:800 40px/1 'Geist';letter-spacing:.06em;color:#fff">SOS</div>`);
    const sosC = new ColorTrack('#5b1d1d'); sosC.to(SOS, C.sos, { w: 30, z: 1 });
    draws.push((t) => { applyVis(sosB, vis(t, 17.75, 19.625), `scale(${(popS(t, 17.75, 0.6) * press(t, SOS)).toFixed(4)})`); sosB.style.background = sosC.at(t); });
    cue(17.75, 'pop'); cue(SOS, 'click'); cue(SOS + 0.0625, 'alert');

    // ───────────────────────── 6 · The numbers (19.75–23.75) ─────────────────────────
    const SL = 960 - 820, ST = 560 - 360;
    const nK = add(`<div class="kick" style="left:${SL + 90}px;top:${ST + 84}px;color:${C.leaf}">One week · November 2026</div>`);
    show(nK, 20.0, 23.625);
    const odoS = odometer(world, SL + 82, ST + 140, 4, 230, C.cream, true);
    const odoSl = add(`<div style="left:${SL + 92}px;top:${ST + 392}px;font:600 40px/1.2 'Geist';color:${C.cream};white-space:nowrap">APK downloads</div>`);
    const ODS = [20.0, 21.5];
    draws.push((t) => {
      const v = vis(t, 19.875, 23.625);
      const x = clamp((t - ODS[0]) / (ODS[1] - ODS[0]));
      odoS.set(Math.round(4000 * outQ(x)), v.o.toFixed(3));
      odoS.box.style.filter = v.b > 0.05 ? `blur(${v.b.toFixed(2)}px)` : 'none';
      odoS.plus.style.opacity = clamp((t - ODS[1]) / 0.1).toFixed(3);
      applyVis(odoSl, vis(t, 20.25, 23.625));
    });
    for (let tt = ODS[0]; tt < ODS[1]; tt += 0.125) cue(tt, 'tick');
    cue(ODS[1], 'settle');
    const stat2 = add(`<div style="left:${SL + 980}px;top:${ST + 150}px;white-space:nowrap"><div style="font:800 130px/1 'Geist';letter-spacing:-.045em;color:${C.leaf}">300K+</div><div style="margin-top:14px;font:600 36px/1.2 'Geist';color:${C.cream}">views on Threads</div></div>`);
    const stat3 = add(`<div style="left:${SL + 980}px;top:${ST + 360}px;white-space:nowrap"><div style="font:800 96px/1 'Geist';letter-spacing:-.045em;color:${C.cream}">2,500</div><div style="margin-top:12px;font:600 32px/1.2 'Geist';color:${C.mossTx}">shares</div></div>`);
    draws.push((t) => { applyVis(stat2, vis(t, 21.75, 23.625), `scale(${popS(t, 21.75, 0.7).toFixed(4)})`); applyVis(stat3, vis(t, 22.25, 23.625), `scale(${popS(t, 22.25, 0.7).toFixed(4)})`); });
    cue(21.75, 'slam', { n: 1 }); cue(22.25, 'slam', { n: 2 });
    const tRow = add(`<div style="left:${SL + 92}px;top:${ST + 560}px;display:flex;gap:14px"></div>`);
    ['Wi-Fi Direct', 'AES-256-GCM', '~550 KB APK', '0 dependencies'].forEach((s, i) => {
      const c = add(`<span class="chip mono" style="font:600 26px/1 'Geist Mono';background:rgba(60,191,110,.14);color:${C.leaf}">${s}</span>`, tRow);
      const ti = 22.75 + i * 0.125;
      draws.push((t) => applyVis(c, vis(t, ti, 23.625), `scale(${popS(t, ti, 0.6).toFixed(4)})`));
      cue(ti, 'pop', { n: i + 3 });
    });

    // ───────────────────────── 7 · Product slams (23.75–27.75) ─────────────────────────
    const shipK = add(`<div class="kick" style="left:0;top:400px;width:1920px;text-align:center;color:${C.muted}">Shipped to production</div>`);
    show(shipK, 23.875, 27.5);
    SLAMS.forEach((s, i) => {
      const a = slamT[i], b = i < SLAMS.length - 1 ? slamT[i + 1] - 0.0625 : 27.625;
      const e = add(`<div style="left:0;top:${560 - 46}px;width:1920px;text-align:center;font:800 76px/92px 'Geist';letter-spacing:-.04em;color:${s.tx};white-space:nowrap">${s.n}</div>`);
      draws.push((t) => { const v = vis(t, a - 0.0625, b, 0.06); applyVis(e, v, `scale(${(1 + 0.06 * Math.exp(-(((t - a) / 0.08) ** 2))).toFixed(4)})`); });
      cue(a, 'slam', { n: i % 4 });
    });
    const shipNote = add(`<div class="mono" style="left:0;top:690px;width:1920px;text-align:center;font:500 28px/1 'Geist Mono';color:${C.muted}">2,675 contributions in the past year</div>`);
    show(shipNote, 26.75, 27.5); cue(26.75, 'shimmer');

    // ───────────────────────── 8 · Outro (27.75–32) ─────────────────────────
    const oAv = add(`<div style="left:${960 - 122}px;top:${380 - 122}px;width:244px;height:244px;border-radius:50%;background:url(assets/avatar.jpg) center/cover"></div>`);
    draws.push((t) => applyVis(oAv, vis(t, 28.0, null), `scale(${popS(t, 28.0, 0.7).toFixed(4)})`));
    cue(28.0, 'pop');
    const oName = add(`<div style="left:0;top:560px;width:1920px;text-align:center;font:800 88px/1 'Geist';letter-spacing:-.045em;white-space:nowrap">Chalid Ade Rahman</div>`);
    const oRole = add(`<div style="left:0;top:672px;width:1920px;text-align:center;font:500 36px/1 'Geist';color:${C.muted};white-space:nowrap">Senior Frontend Engineer · React · Next.js · TypeScript</div>`);
    show(oName, 28.25, null); show(oRole, 28.5, null);
    cue(28.25, 'swap', { n: 3 }); cue(28.5, 'swap', { n: 4 });
    const cta = add(`<div style="left:${960 - 270}px;top:760px;width:540px;height:100px;border-radius:50px;display:flex;align-items:center;justify-content:center;gap:16px;font:700 38px/1 'Geist';white-space:nowrap"></div>`);
    const ctaA = add(`<span>chalidade.github.io</span>`, cta);
    const ctaI = add(`<span style="display:inline-flex">${ico('arrow', 38)}</span>`, cta);
    const ctaC = new ColorTrack(C.ink); ctaC.to(CTA, C.blue, { w: 30, z: 1 });
    draws.push((t) => {
      applyVis(cta, vis(t, 29.0, null), `scale(${(popS(t, 29.0, 0.8) * press(t, CTA)).toFixed(4)})`);
      cta.style.background = ctaC.at(t); cta.style.color = '#fff';
      ctaI.style.transform = `translateX(${(10 * stepR(t - CTA, SP.pop)).toFixed(2)}px)`;
    });
    cue(29.0, 'pop'); cue(CTA, 'cta');
    const fine = add(`<div class="mono" style="left:0;top:910px;width:1920px;text-align:center;font:500 26px/1.6 'Geist Mono';color:${C.subtle};letter-spacing:.04em">Remote · East Java, Indonesia · GMT+7</div>`);
    show(fine, 30.5, null); cue(30.5, 'shimmer');

    // ───────────────────────── Cursor ("You") ─────────────────────────
    const cur = add(`<div class="cur"><svg viewBox="0 0 24 24"><path d="M4 2.5 20 11l-7 1.8L9.6 20z" fill="#0a0a0a" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg><span class="pill">You</span></div>`, hud);
    const rip = add('<div class="rip"></div>', hud);
    const CX = new Track(1700), CYt = new Track(980), CO = new Track(0);
    const mv = (t, x, y, sp = SP.cursor) => { CX.to(t, x, sp); CYt.to(t, y, sp); };
    const clicks = [4.5, SEARCH, LANG, SOS, CTA];
    CO.to(3.875, 1, SP.text);
    mv(4.0, FL + 560, FT + 80);                         // into the field
    mv(5.0, FL + 900, FT + 190, SP.soft);              // drift while typing
    mv(6.5, FL + 1180 - 24 - 110, FT + 74);            // Search
    mv(7.5, 1640, 900, SP.soft);
    mv(14.0, TG.x + TG.w * 0.75 + 4, TG.y + 50);       // ID
    mv(15.0, 1700, 960, SP.soft);
    mv(17.875, RX + 6, RY + 330 + 56);                 // SOS
    mv(18.875, 1720, 1000, SP.soft);
    CO.to(19.375, 0, SP.text);
    mv(28.5, 1500, 980, SP.snap); CO.to(28.75, 1, SP.text);
    mv(29.25, 960 + 120, 822);                          // CTA
    mv(30.5, 1340, 960, SP.soft);
    CO.to(31.25, 0, SP.text);
    cue(31.5, 'settle');
    draws.push((t) => {
      const [sx, sy] = toS(CX.at(t), CYt.at(t), t);
      const o = clamp(CO.at(t));
      const vx = (toS(CX.at(t + 0.01), CYt.at(t + 0.01), t + 0.01)[0] - sx) / 0.01;
      let sc = 1; for (const c of clicks) sc *= press(t, c);
      at(cur, sx, sy); cur.style.opacity = o.toFixed(3);
      cur.style.transform = `rotate(${clamp(-vx * 0.0045, -14, 14).toFixed(2)}deg) scale(${sc.toFixed(4)})`;
      const night = NIGHT.at(t) > 0.5;
      cur.querySelector('.pill').style.background = night ? C.leaf : C.blue;
      cur.querySelector('.pill').style.color = night ? C.leafInk : '#fff';
      let rp = null, rx = 0, ry = 0; for (const c of clicks) { const r = ripple(t, c); if (r) { rp = r; [rx, ry] = toS(CX.at(c), CYt.at(c), t); } }
      if (rp && o > 0.3) { at(rip, rx, ry); rip.style.opacity = rp.o.toFixed(3); rip.style.transform = `scale(${rp.s.toFixed(3)})`; rip.style.borderColor = night ? C.sos : C.blue; } else rip.style.opacity = 0;
    });

    // ───────────────────────── Seek ─────────────────────────
    const DUR = 32.0;
    window.seek = (t) => {
      const z = Math.exp(CAM.z.at(t)), zx = CAM.zx.at(t), zy = CAM.zy.at(t);
      world.style.transform = `translate(${zx.toFixed(2)}px, ${zy.toFixed(2)}px) scale(${z.toFixed(5)}) translate(${(-zx).toFixed(2)}px, ${(-zy).toFixed(2)}px)`;
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
