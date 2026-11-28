// Covatom · "Tanpa satu bar sinyal pun". Portrait 1080×1920, 120 BPM, 34 s.
// One shape, never cut: the status-bar pill loses its signal → it opens into Covatom's "nearby" radar →
// invites connect the group → chat → (drop) an SOS slams red → it becomes the offline compass →
// roll call + pinned meeting point → three real numbers → the shape folds into the app icon.
(async function () {
  try {
    const { clamp, lerp, outQ, stepR, Track, ColorTrack, SP, vis, applyVis, press, ripple } = M;
    const C = {
      night: '#090F21', panel: '#16234A', line2: '#2C3D66', navy: '#0F1B35', blue: '#1677FF', blueT: '#E7F0FF',
      ink: '#0F1B35', muted: '#6B7690', soft: '#9AA7C4', line: '#E3E7EF', grey: '#F1F3F7', bg: '#F3F5F9',
      red: '#E5383B', redT: '#FDECEC', green: '#12A150', greenT: '#E3F6EA', amber: '#B86E00', amberT: '#FFF4DF',
    };
    const F = "'Plus Jakarta Sans'";
    const LOGO = '../../requests/20261128-0707-ho5f/files/02-covatom-logotype-tagline-color-2000.png';
    await Promise.all([
      ...[400, 500, 600, 700, 800].map((w) => document.fonts.load(`${w} 40px ${F}`)),
      new Promise((res) => { const im = new Image(); im.onload = res; im.onerror = res; im.src = LOGO; }),
    ].map((p) => p.catch(() => null)));
    await document.fonts.ready;

    const cues = [];
    const cue = (t, k, o = {}) => cues.push({ t, k, ...o });
    const stage = document.getElementById('stage');
    const bloom = document.getElementById('bloom');
    const world = document.getElementById('world');
    const draws = [];
    const W = (html, parent = world) => { const d = document.createElement('div'); d.innerHTML = html.trim(); const e = d.firstElementChild; if (parent !== world && !parent.classList.contains('lay')) e.style.position = 'absolute'; parent.appendChild(e); return e; };
    const show = (e, tin, tout, extra = '', d = 0.12) => draws.push((t) => applyVis(e, vis(t, tin, tout, d), typeof extra === 'function' ? extra(t) : extra));
    const popS = (t, tin, s0 = 0.6) => s0 + (1 - s0) * stepR(t - tin, SP.pop);
    const bump = (t, tc, a = 0.06, d = 0.08) => 1 + a * Math.exp(-(((t - tc) / d) ** 2));
    const lin = (t, a, b) => clamp((t - a) / (b - a));
    const px = (v) => v.toFixed(2) + 'px';
    const A = (l, tp, w, h, inner, st = '') => `<div style="left:${l}px;top:${tp}px;${w != null ? `width:${w}px;` : ''}${h != null ? `height:${h}px;` : ''}${st}">${inner}</div>`;

    // icons: one stroke weight, round caps
    const P = (d, sw = 2) => `<svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
    const I = {
      back: P('<path d="m15 5-7 7 7 7"/>', 2.4),
      check: P('<path d="M20 6 9 17l-5-5"/>', 2.6),
      dcheck: P('<path d="m2 12.5 4.5 4.5L15 8"/><path d="m11 16 1 1 9-9"/>', 2.3),
      send: P('<path d="M5 12h13M12 5l7 7-7 7"/>', 2.6),
      nosig: P('<path d="M4 20v-2M9 20v-5M14 20v-8M19 20V7"/><path d="m3 3 18 18" stroke-width="2.4"/>'),
      wifi: P('<path d="M2.5 9a14 14 0 0 1 19 0"/><path d="M5.5 12.5a9.5 9.5 0 0 1 13 0"/><path d="M8.7 16a5 5 0 0 1 6.6 0"/><path d="M12 19.5h.01" stroke-width="3"/>'),
      bt: P('<path d="m7 7 10 10-5 4V3l5 4L7 17"/>'),
      pin: P('<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>'),
      bat: P('<rect x="3" y="7" width="16" height="10" rx="2"/><path d="M22 10.5v3"/><path d="M6 10v4"/>'),
      nav: P('<path d="M20 4 4 11l7 2 2 7z"/>'),
      ruler: P('<path d="M4 12h16M4 8v8M20 8v8"/>'),
      users: P('<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6"/>'),
      lock: P('<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'),
      list: P('<path d="M9 6h11M9 12h11M9 18h11"/><path d="M4.5 6h.01M4.5 12h.01M4.5 18h.01" stroke-width="3"/>'),
    };
    const ico = (k, s, col = 'currentColor') => `<span class="ic" style="width:${s}px;height:${s}px;color:${col}">${I[k]}</span>`;

    // covatom mark (from the brand files)
    const MK_W = 632.9, MK_H = 391.14, MK_X0 = 195.53, MK_Y0 = 316.43;
    const C_PATH = 'M487.23 341.67A195.57 195.57 0 1 0 487.23 682.33A224.1 224.1 0 0 1 430.17 607.57A103.23 103.23 0 1 1 430.17 416.43A224.1 224.1 0 0 1 487.23 341.67Z';
    const O_PATH = 'M510.79 359.21A195.57 195.57 0 1 1 510.79 664.79A194.07 194.07 0 0 0 567.86 592.19A103.23 103.23 0 1 0 567.86 431.81A194.07 194.07 0 0 0 510.79 359.21Z';
    const B_PATH = 'M512 358.26A195.57 195.57 0 0 0 512 665.74A195.57 195.57 0 0 0 569.07 593.16A103.23 103.23 0 0 1 569.07 430.84A195.57 195.57 0 0 0 512 358.26Z';
    const mark = (h, a = '#fff', b = C.blue) => `<svg width="${(h * MK_W / MK_H).toFixed(1)}" height="${h}" viewBox="${MK_X0} ${MK_Y0} ${MK_W} ${MK_H}" style="display:block;flex:none"><path fill="${a}" d="${C_PATH}${O_PATH}"/><path fill="${b}" d="${B_PATH}"/></svg>`;

    // ───────────────────────── stage colour: blackout night → daylight for the ending
    const LIGHT = 30.9;
    const BG = new ColorTrack(C.night).to(LIGHT, C.bg, { w: 12, z: 1 });

    // ───────────────────────── camera
    const zT = new Track(1.12)
      .to(0.0, 1.0, SP.cam).to(3.7, 0.97, SP.cam).to(4.4, 1.0, SP.cam)
      .to(15.3, 1.04, { w: 3, z: 1 }).to(16.0, 1.0, { w: 11, z: 0.8 })
      .to(27.8, 0.98, SP.cam).to(28.3, 1.0, SP.cam).to(33.0, 1.03, { w: 2, z: 1 });
    const camY = new Track(0).to(30.8, -20, SP.cam);

    // ───────────────────────── HERO: the one shape
    const hero = W(`<div style="overflow:hidden"></div>`);
    const HX = new Track(540), HY = new Track(1060), HW = new Track(820), HH = new Track(210), HR = new Track(105);
    const HC = new ColorTrack(C.panel);
    const morph = (t, x, y, w, h, r, col, sp = SP.shape) => {
      HX.to(t, x, sp); HY.to(t, y, sp); HW.to(t, w, sp); HH.to(t, h, sp); HR.to(t, r, sp); if (col) HC.to(t, col, SP.soft);
    };
    const lay = (w, h, html) => W(`<div class="lay" style="width:${w}px;height:${h}px;margin-left:${-w / 2}px;margin-top:${-h / 2}px">${html}</div>`, hero);

    // ───────────────────────── captions (top band, screen-ish world space)
    const capBig = (html, tin, tout, col = '#fff', size = 92, top = 200) => {
      const e = W(`<div style="left:60px;width:960px;top:${top}px;height:300px;display:flex;align-items:center;justify-content:center;text-align:center;font-weight:800;font-size:${size}px;letter-spacing:-0.025em;line-height:1.04;color:${col}">${html}</div>`);
      show(e, tin, tout); return e;
    };
    const capStep = (n, title, sub, tin, tout) => {
      const e = W(`<div style="left:60px;width:960px;top:120px;height:330px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center">
        <div class="row" style="height:52px;padding:0 22px;border-radius:26px;background:rgba(22,119,255,.16);color:#7FB2FF;font-size:26px;font-weight:700;letter-spacing:.06em;gap:12px">${typeof n === 'number' ? `CARA KERJA <span style="color:#fff">${n}/5</span>` : n}</div>
        <div style="margin-top:22px;font-weight:800;font-size:76px;letter-spacing:-0.025em;line-height:1.04;color:#fff">${title}</div>
        <div style="margin-top:18px;font-weight:500;font-size:34px;line-height:1.3;color:${C.soft};max-width:860px">${sub}</div></div>`);
      show(e, tin, tout); return e;
    };

    // ══════════════ A · 0–4  the status bar loses its signal
    cue(0.0, 'born');
    const BAR_T = [1.0, 1.5, 2.0, 2.5];
    const A1 = lay(820, 210, `
      <div class="row" style="left:80px;top:0;height:210px;gap:13px;align-items:flex-end;padding-bottom:62px">
        ${[30, 48, 66, 86].map((h, i) => `<div class="sb" style="width:21px;height:${h}px;border-radius:4px;background:#fff"></div>`).join('')}
      </div>
      <div class="sx" style="left:74px;top:48px;width:114px;height:114px;color:${C.red}">${I.nosig}</div>
      <div class="l1" style="left:240px;top:0;height:210px;display:flex;align-items:center;font-size:56px;font-weight:700;color:#fff">Sinyal penuh</div>
      <div class="l2" style="left:240px;top:0;height:210px;display:flex;align-items:center;font-size:56px;font-weight:700;color:${C.soft}">Sinyal lemah…</div>
      <div class="l3" style="left:240px;top:0;height:210px;display:flex;align-items:center;font-size:56px;font-weight:700;color:#FF8A8C">Tanpa layanan</div>`);
    show(A1, 0.1, 3.82);
    const sbs = [...A1.querySelectorAll('.sb')];
    show(A1.querySelector('.l1'), 0.15, 1.4);
    show(A1.querySelector('.l2'), 1.5, 2.9);
    show(A1.querySelector('.l3'), 3.0, null);
    const sx = A1.querySelector('.sx');
    draws.push((t) => {
      // bars die from the strongest down, each with a small drop
      sbs.forEach((b, i) => {
        const k = BAR_T[3 - i], x = stepR(t - k, { w: 22, z: 0.85 });
        b.style.background = x > 0.5 ? C.line2 : '#fff';
        b.style.transform = `scaleY(${(1 - 0.35 * x + 0.35 * x * x).toFixed(3)})`;
        b.style.transformOrigin = 'bottom';
        b.style.opacity = t >= 3.0 ? (1 - stepR(t - 3.0, SP.text)).toFixed(3) : 1;
      });
      const e = stepR(t - 3.0, SP.pop);
      sx.style.opacity = e.toFixed(3); sx.style.transform = `scale(${(0.5 + 0.5 * e).toFixed(3)})`;
    });
    BAR_T.forEach((k, i) => cue(k, 'tick'));
    cue(1.0, 'drag', { d: 1.6 });
    cue(3.0, 'alert');
    capBig('Gempa datang.', 0.4, 1.85, '#fff', 104, 560);
    capBig('Sinyal hilang.', 2.0, 3.82, '#fff', 104, 560);
    cue(0.5, 'pop'); cue(2.0, 'swap', { n: 1 });

    // ══════════════ B · 4–8  open Covatom: nearby phones appear
    const PW = 820, PH = 1180, PL = 540 - PW / 2, PT = 1060 - PH / 2; // phone screen in world coords
    morph(3.85, 540, 1060, PW, PH, 64, '#FFFFFF');
    cue(3.85, 'whoosh', { v: 0.6 }); cue(4.0, 'settle');
    capStep(1, 'Buka Covatom', 'Ponsel di sekitar langsung muncul.<br>Tanpa akun, tanpa nomor HP.', 4.3, 7.85);

    // persistent header bits (4–19)
    const offChip = lay(PW, PH, `<div class="row" style="left:${PW - 40 - 196}px;top:44px;width:196px;height:56px;border-radius:28px;background:${C.redT};color:${C.red};font-size:24px;font-weight:700;gap:10px;justify-content:center">${ico('nosig', 26)}Offline</div>`);
    show(offChip, 4.4, 15.75);
    const hB = lay(PW, PH, `<div class="row" style="left:40px;top:40px;height:64px;gap:18px;color:${C.ink}">${mark(40, C.navy)}<span style="font-size:38px;font-weight:800;letter-spacing:-0.01em">Di sekitar</span></div>`);
    show(hB, 4.25, 11.75);

    // radar
    const RC = { x: 410, y: 350 };
    const PEOPLE = [
      { n: 'Ibu', i: 'I', col: '#E07B2E', d: '18 m', x: 210, y: 270 },
      { n: 'Raka', i: 'R', col: '#7A5AF8', d: '85 m', x: 630, y: 240 },
      { n: 'Pak RT', i: 'P', col: '#2E9E5B', d: '42 m', x: 590, y: 470 },
    ];
    const radar = lay(PW, PH, `
      <svg class="rings" width="${PW}" height="600" style="left:0;top:0;overflow:visible">
        ${[0, 1, 2].map(() => `<circle cx="${RC.x}" cy="${RC.y}" r="10" fill="none" stroke="${C.blue}" stroke-width="3"/>`).join('')}
        <circle cx="${RC.x}" cy="${RC.y}" r="120" fill="none" stroke="${C.line}" stroke-width="2"/>
        <circle cx="${RC.x}" cy="${RC.y}" r="230" fill="none" stroke="${C.line}" stroke-width="2"/>
        ${PEOPLE.map((p) => { const L = Math.hypot(p.x - RC.x, p.y - RC.y); return `<line class="ln" x1="${RC.x}" y1="${RC.y}" x2="${p.x}" y2="${p.y}" stroke="${C.blue}" stroke-width="5" stroke-linecap="round" stroke-dasharray="${L.toFixed(1)}" stroke-dashoffset="${L.toFixed(1)}"/>`; }).join('')}
      </svg>
      <div style="left:${RC.x - 44}px;top:${RC.y - 44}px;width:88px;height:88px;border-radius:44px;background:${C.blue};border:6px solid #fff;box-shadow:0 8px 24px rgba(22,119,255,.35)"></div>
      <div style="left:${RC.x - 60}px;top:${RC.y + 52}px;width:120px;text-align:center;font-size:24px;font-weight:700;color:${C.blue}">Kamu</div>
      ${PEOPLE.map((p) => `<div class="dot" style="left:${p.x - 40}px;top:${p.y - 40}px;width:80px;height:80px;border-radius:40px;background:${p.col};color:#fff;font-size:34px;font-weight:800;display:flex;align-items:center;justify-content:center;border:5px solid #fff;box-shadow:0 8px 22px rgba(15,27,53,.18)">${p.i}</div>`).join('')}
      <div class="row bd1" style="left:60px;top:574px;height:56px;padding:0 20px;border-radius:28px;background:${C.blueT};color:${C.blue};font-size:24px;font-weight:700;gap:10px">${ico('wifi', 28)}Wi‑Fi Direct · 50–100 m</div>
      <div class="row bd2" style="left:462px;top:574px;height:56px;padding:0 20px;border-radius:28px;background:${C.grey};color:${C.ink};font-size:24px;font-weight:700;gap:10px">${ico('bt', 28)}Bluetooth relay</div>`);
    show(radar, 4.3, 11.75);
    const rings = [...radar.querySelectorAll('.rings circle')].slice(0, 3);
    const lns = [...radar.querySelectorAll('.ln')];
    const dots = [...radar.querySelectorAll('.dot')];
    const APPEAR = [5.0, 5.5, 6.0];
    const INV = [8.5, 9.0, 9.5], ACC = INV.map((k) => k + 0.5);
    show(radar.querySelector('.bd1'), 10.5, null, (t) => `scale(${popS(t, 10.5, 0.8).toFixed(4)})`);
    show(radar.querySelector('.bd2'), 11.0, null, (t) => `scale(${popS(t, 11.0, 0.8).toFixed(4)})`);
    cue(10.5, 'pop'); cue(11.0, 'pop');
    draws.push((t) => {
      rings.forEach((c, i) => {
        const ph = ((t - 4.3) / 1.5 + i / 3) % 1;
        const on = t > 4.3 && t < 10.0 ? 1 : 0;
        c.setAttribute('r', (40 + ph * 240).toFixed(1));
        c.style.opacity = (on * 0.5 * (1 - ph)).toFixed(3);
      });
      dots.forEach((d, i) => { const e = stepR(t - APPEAR[i], SP.pop); d.style.opacity = clamp(e * 3).toFixed(3); d.style.transform = `scale(${(e * bump(t, ACC[i] + 0.03, 0.12, 0.07)).toFixed(4)})`; });
      lns.forEach((l, i) => { const L = +l.getAttribute('stroke-dasharray'); const p = outQ(lin(t, ACC[i], ACC[i] + 0.35)); l.setAttribute('stroke-dashoffset', (L * (1 - p)).toFixed(1)); });
    });
    APPEAR.forEach((k, i) => cue(k, 'born'));

    // people list with invite buttons
    const ROWY = [660, 820, 980];
    const list = lay(PW, PH, PEOPLE.map((p, i) => `
      <div class="pr" style="left:40px;top:${ROWY[i]}px;width:740px;height:140px;border-radius:32px;background:${C.grey}">
        <div style="position:absolute;left:28px;top:28px;width:84px;height:84px;border-radius:42px;background:${p.col};color:#fff;font-size:36px;font-weight:800;display:flex;align-items:center;justify-content:center">${p.i}</div>
        <div style="position:absolute;left:136px;top:30px;font-size:36px;font-weight:700;color:${C.ink}">${p.n}</div>
        <div style="position:absolute;left:136px;top:80px;font-size:25px;font-weight:500;color:${C.muted}">${p.d} dari kamu</div>
        <div class="btn" style="position:absolute;right:28px;top:34px;height:72px;border-radius:36px;background:${C.blue};overflow:hidden">
          <div class="b1" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:700;color:#fff">Ajak</div>
          <div class="b2 row" style="position:absolute;inset:0;justify-content:center;gap:10px;font-size:27px;font-weight:700;color:${C.green}">${ico('check', 28)}Terhubung</div>
        </div></div>`).join(''));
    show(list, 4.3, 11.75);
    const prs = [...list.querySelectorAll('.pr')];
    prs.forEach((r, i) => {
      show(r, APPEAR[i], null, (t) => `scale(${popS(t, APPEAR[i], 0.92).toFixed(4)})`);
      const btn = r.querySelector('.btn');
      const bw = new Track(150).to(ACC[i], 236, { w: 20, z: 0.82 });
      const bc = new ColorTrack(C.blue).to(ACC[i], C.greenT, SP.soft);
      show(r.querySelector('.b1'), APPEAR[i] + 0.1, ACC[i] - 0.05);
      show(r.querySelector('.b2'), ACC[i] + 0.06, null);
      draws.push((t) => { btn.style.width = px(bw.at(t)); btn.style.background = bc.at(t); btn.style.transform = `scale(${press(t, INV[i]).toFixed(4)})`; });
    });
    INV.forEach((k) => cue(k, 'click'));
    ACC.forEach((k, i) => cue(k, 'toggle'));
    capStep(2, 'Ajak orang terdekat', 'Begitu diterima, grup tersambung<br>lewat Wi‑Fi Direct dan Bluetooth.', 8.0, 11.85);
    cue(8.0, 'swap', { n: 2 });

    // ══════════════ D · 12–16  chat with zero bars
    const hD = lay(PW, PH, `<div class="row" style="left:36px;top:40px;height:64px;gap:14px;color:${C.ink}">${ico('back', 40)}<div><div style="font-size:34px;font-weight:800;line-height:1.1">Grup RT 05</div><div style="font-size:23px;font-weight:500;color:${C.muted}">4 orang · terenkripsi</div></div></div>`);
    show(hD, 12.0, 15.75);
    const bub = (l, tp, txt, mine, who) => `<div style="left:${l}px;top:${tp}px;max-width:600px">
      ${who ? `<div style="font-size:23px;font-weight:700;color:${who[1]};margin:0 0 8px 8px">${who[0]}</div>` : ''}
      <div style="padding:22px 28px;border-radius:30px;${mine ? `border-bottom-right-radius:10px;background:${C.blue};color:#fff` : `border-bottom-left-radius:10px;background:${C.grey};color:${C.ink}`};font-size:32px;font-weight:600;line-height:1.3;white-space:nowrap">${txt}</div></div>`;
    const m1 = lay(PW, PH, bub(40, 170, 'Kalian di mana? Semua aman?', false, ['Ibu', '#E07B2E']));
    const m2 = lay(PW, PH, bub(40, 350, 'Kumpul di lapangan, ya.', false, ['Pak RT', '#2E9E5B']));
    show(m1, 12.5, 15.75, (t) => `scale(${popS(t, 12.5, 0.9).toFixed(4)})`);
    show(m2, 13.0, 15.75, (t) => `scale(${popS(t, 13.0, 0.9).toFixed(4)})`);
    cue(12.5, 'pop'); cue(13.0, 'pop', { n: 2 });
    const MSG = 'Aku aman, di rumah.';
    const TY0 = 13.5, KD = 0.0625, SEND = 15.0;
    const m3 = lay(PW, PH, `<div style="right:40px;top:560px;width:${PW - 80}px;display:flex;flex-direction:column;align-items:flex-end">
      ${bub(0, 0, MSG, true).replace('left:0px;top:0px;', 'position:relative;')}
      <div class="tk row" style="margin-top:12px;gap:8px;font-size:24px;font-weight:700;color:${C.blue}">${ico('dcheck', 30)}Terkirim ke 3 orang</div></div>`);
    show(m3, SEND + 0.05, 15.75, (t) => `translateX(${((1 - stepR(t - SEND, SP.pop)) * 40).toFixed(2)}px)`);
    show(m3.querySelector('.tk'), SEND + 0.5, null);
    cue(SEND + 0.5, 'check');
    const comp = lay(PW, PH, `
      <div style="left:40px;top:1040px;width:610px;height:100px;border-radius:50px;background:${C.grey};padding:0 34px;display:flex;align-items:center;font-size:32px;font-weight:600;color:${C.ink};white-space:nowrap"><span class="tx"></span><span class="cr" style="display:inline-block;width:3px;height:40px;background:${C.blue};margin-left:3px"></span><span class="ph" style="color:${C.soft};position:absolute;left:34px">Tulis pesan…</span></div>
      <div class="sd" style="left:670px;top:1040px;width:110px;height:100px;border-radius:50px;background:${C.blue};color:#fff;display:flex;align-items:center;justify-content:center">${ico('send', 44)}</div>`);
    show(comp, 12.1, 15.75);
    const tx = comp.querySelector('.tx'), cr = comp.querySelector('.cr'), ph = comp.querySelector('.ph'), sd = comp.querySelector('.sd');
    for (let i = 0; i < MSG.length; i++) cue(TY0 + i * KD, 'key');
    cue(SEND, 'click');
    draws.push((t) => {
      const n = t < SEND ? clamp(Math.floor((t - TY0) / KD) + 1, 0, MSG.length) : 0;
      tx.textContent = MSG.slice(0, n);
      ph.style.opacity = n === 0 ? 1 : 0;
      cr.style.opacity = (n > 0 || (t > 13.2 && t < SEND)) && (Math.floor(t * 4) % 2 === 0 || (t > TY0 && t < TY0 + MSG.length * KD)) ? 1 : 0;
      sd.style.transform = `scale(${press(t, SEND).toFixed(4)})`;
    });
    capStep('DI DALAM GRUP','Chat tanpa sinyal', 'Pesan melompat dari ponsel ke ponsel.<br>Tanpa server, tanpa kuota.', 12.0, 15.8);
    cue(12.0, 'swap', { n: 3 });

    // ══════════════ E · 16–20  DROP: an SOS slams in
    const DROP = 16.0;
    cue(15.0, 'riser', { d: 1.0 });
    morph(DROP - 0.12, 540, 1070, 900, 1260, 72, C.red, { w: 19, z: 0.78 });
    cue(DROP, 'drop'); cue(DROP, 'slam', { n: 1 });
    const EW = 900, EH = 1260;
    const sos = lay(EW, EH, `
      <svg class="sr" width="${EW}" height="700" style="left:0;top:0;overflow:visible">${[0, 1, 2].map(() => `<circle cx="450" cy="330" r="160" fill="none" stroke="#fff" stroke-width="4"/>`).join('')}</svg>
      <div class="sc" style="left:300px;top:180px;width:300px;height:300px;border-radius:150px;background:#fff;color:${C.red};display:flex;align-items:center;justify-content:center;font-size:96px;font-weight:800;letter-spacing:.02em">SOS</div>
      <div style="left:0;top:560px;width:${EW}px;text-align:center;font-size:66px;font-weight:800;color:#fff;letter-spacing:-0.02em">Raka butuh bantuan</div>
      ${[['ruler', '85 m', 'jarak'], ['nav', 'Barat laut', 'arah'], ['bat', '34%', 'baterai']].map((s, i) => `
        <div class="st" style="left:${50 + i * 274}px;top:700px;width:252px;height:220px;border-radius:36px;background:rgba(255,255,255,.16);color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px">
          ${ico(s[0], 44)}<div style="font-size:${s[1].length > 5 ? 40 : 52}px;font-weight:800;white-space:nowrap">${s[1]}</div><div style="font-size:26px;font-weight:600;opacity:.8">${s[2]}</div></div>`).join('')}
      <div class="go" style="left:70px;top:1040px;width:760px;height:124px;border-radius:62px;background:#fff;color:${C.red};display:flex;align-items:center;justify-content:center;gap:16px;font-size:38px;font-weight:800">${ico('nav', 40)}Arahkan ke Raka</div>`);
    show(sos, DROP + 0.04, 18.92);
    const srs = [...sos.querySelectorAll('.sr circle')], sc = sos.querySelector('.sc');
    const STT = [16.5, 17.0, 17.5], GO = 18.0, GOC = 18.5;
    [...sos.querySelectorAll('.st')].forEach((e, i) => { show(e, STT[i], null, (t) => `scale(${popS(t, STT[i], 0.7).toFixed(4)})`); cue(STT[i], 'slam', { n: i + 2 }); });
    const goB = sos.querySelector('.go');
    show(goB, GO, null, (t) => `scale(${(popS(t, GO, 0.85) * press(t, GOC)).toFixed(4)})`);
    cue(GO, 'pop'); cue(GOC, 'click');
    draws.push((t) => {
      srs.forEach((c, i) => { const ph = ((t - DROP) / 1.0 + i / 3) % 1; c.setAttribute('r', (150 + ph * 230).toFixed(1)); c.style.opacity = t > DROP ? (0.45 * (1 - ph)).toFixed(3) : 0; });
      let s = popS(t, DROP, 0.5); [17.0, 18.0].forEach((k) => { s *= bump(t, k, 0.05, 0.08); });
      sc.style.transform = `scale(${s.toFixed(4)})`;
    });
    [17.0, 18.0].forEach((k) => cue(k, 'alert'));
    capStep(3, 'SOS satu ketuk', 'Alarm sampai ke semua ponsel di grup:<br>jarak, arah, dan baterai pengirim.', DROP, 19.35);

    // ══════════════ F · 19–24  the offline compass walks you there
    const CMP = 19.0;
    morph(CMP - 0.1, 540, 1060, PW, PH, 64, '#FFFFFF');
    cue(CMP, 'whoosh', { v: 0.6 });
    const CX = 410, CY = 450, CRr = 300;
    const ticks = Array.from({ length: 36 }, (_, i) => { const a = i * 10 * Math.PI / 180, r1 = i % 9 === 0 ? CRr - 40 : CRr - 22; return `<line x1="${(CX + Math.sin(a) * r1).toFixed(1)}" y1="${(CY - Math.cos(a) * r1).toFixed(1)}" x2="${(CX + Math.sin(a) * (CRr - 6)).toFixed(1)}" y2="${(CY - Math.cos(a) * (CRr - 6)).toFixed(1)}" stroke="${i % 9 === 0 ? C.ink : C.soft}" stroke-width="${i % 9 === 0 ? 5 : 3}" stroke-linecap="round"/>`; }).join('');
    const cmp = lay(PW, PH, `
      <div class="row" style="left:40px;top:44px;height:56px;gap:14px;font-size:34px;font-weight:800;color:${C.ink}">${ico('nav', 36, C.blue)}Kompas offline</div>
      <svg width="${PW}" height="800" style="left:0;top:0;overflow:visible">
        <circle cx="${CX}" cy="${CY}" r="${CRr}" fill="${C.grey}"/>${ticks}
        <text x="${CX}" y="${CY - CRr + 82}" text-anchor="middle" font-family="Plus Jakarta Sans" font-weight="800" font-size="36" fill="${C.red}">U</text>
        <g class="ndl"><path d="M${CX} ${CY - 220} L${CX + 34} ${CY} L${CX} ${CY + 30} L${CX - 34} ${CY} Z" fill="${C.blue}"/><circle cx="${CX}" cy="${CY - 228}" r="30" fill="#7A5AF8" stroke="#fff" stroke-width="6"/><text x="${CX}" y="${CY - 216}" text-anchor="middle" font-family="Plus Jakarta Sans" font-weight="800" font-size="30" fill="#fff">R</text></g>
        <circle cx="${CX}" cy="${CY}" r="18" fill="${C.ink}"/>
      </svg>
      <div class="dist" style="left:0;top:800px;width:${PW}px;text-align:center;font-size:150px;font-weight:800;letter-spacing:-0.04em;color:${C.ink};font-variant-numeric:tabular-nums">85 m</div>
      <div class="lbl1" style="left:0;top:990px;width:${PW}px;text-align:center;font-size:34px;font-weight:600;color:${C.muted}">ke Raka · barat laut</div>
      <div class="lbl2 row" style="left:${(PW - 470) / 2}px;top:976px;width:470px;height:80px;border-radius:40px;background:${C.greenT};color:${C.green};justify-content:center;gap:12px;font-size:34px;font-weight:800">${ico('check', 36)}Raka ditemukan</div>`);
    show(cmp, CMP + 0.1, 23.82);
    const ndl = cmp.querySelector('.ndl'), dist = cmp.querySelector('.dist');
    const FOUND = 23.0;
    show(cmp.querySelector('.lbl1'), CMP + 0.2, FOUND - 0.1);
    show(cmp.querySelector('.lbl2'), FOUND, null, (t) => `scale(${popS(t, FOUND, 0.8).toFixed(4)})`);
    cue(FOUND, 'check');
    const ANG = new Track(40).to(19.5, -45, { w: 9, z: 0.6 }).to(21.0, -30, SP.soft).to(22.0, -42, SP.soft).to(22.6, -38, SP.soft);
    cue(19.5, 'swap', { n: 4 }); cue(21.0, 'tick'); cue(22.0, 'tick');
    const D0 = 20.0, D1 = 23.0;
    for (let k = D0; k < D1; k += 0.25) cue(k, 'tick');
    draws.push((t) => {
      ndl.setAttribute('transform', `rotate(${ANG.at(t).toFixed(2)} ${CX} ${CY})`);
      const v = Math.round(lerp(85, 12, outQ(lin(t, D0, D1)) * 0.6 + lin(t, D0, D1) * 0.4));
      dist.textContent = `${v} m`;
      dist.style.color = t >= FOUND ? C.green : C.ink;
      dist.style.transform = `scale(${bump(t, FOUND, 0.06, 0.08).toFixed(4)})`;
    });
    capStep(4, 'Kompas menunjuk arah', 'Ikuti panah ke orang yang butuh bantuan.<br>Peta offline juga bisa diunduh.', 19.5, 23.85);

    // ══════════════ G · 24–28  roll call + pinned meeting point
    const ABS = 24.0, PIN = 27.0;
    const gHd = lay(PW, PH, `<div class="row" style="left:40px;top:44px;height:56px;gap:14px;font-size:34px;font-weight:800;color:${C.ink}">${ico('users', 38, C.blue)}Absen · Grup RT 05</div>`);
    show(gHd, 23.95, 27.82);
    const box = lay(PW, PH, `<div class="bx" style="left:40px;top:140px;width:740px;height:130px;border-radius:34px;overflow:hidden">
      <div class="g1 row" style="position:absolute;inset:0;justify-content:center;gap:14px;font-size:34px;font-weight:800;color:#fff">${ico('list', 38)}Mulai absen</div>
      <div class="g2 row" style="position:absolute;inset:0;padding:0 34px;gap:22px;color:${C.ink}">
        <div style="width:72px;height:72px;border-radius:36px;background:${C.blue};color:#fff;display:flex;align-items:center;justify-content:center;flex:none">${ico('pin', 38)}</div>
        <div><div style="font-size:23px;font-weight:700;color:${C.blue};letter-spacing:.04em">DISEMATKAN</div><div style="font-size:34px;font-weight:800">Titik kumpul: Lapangan RW 05</div></div></div></div>`);
    show(box, 23.95, 27.82);
    const bx = box.querySelector('.bx');
    const bxC = new ColorTrack(C.blue).to(PIN - 0.05, C.blueT, SP.soft);
    show(box.querySelector('.g1'), 24.0, PIN - 0.15);
    show(box.querySelector('.g2'), PIN + 0.05, null);
    draws.push((t) => { bx.style.background = bxC.at(t); bx.style.transform = `scale(${(press(t, ABS) * bump(t, PIN + 0.03, 0.04, 0.08)).toFixed(4)})`; });
    cue(ABS, 'click'); cue(PIN, 'pop'); cue(PIN + 0.05, 'shimmer');
    const RS = [24.5, 25.0, 25.5, 26.0], LATE = 26.5;
    const ST = { ok: ['Aman', C.green, C.greenT], hurt: ['Terluka', C.amber, C.amberT], wait: ['Belum membalas', C.muted, C.grey] };
    const ROLL = [{ n: 'Kamu', i: 'K', col: C.blue }, ...PEOPLE];
    const rolls = lay(PW, PH, ROLL.map((p, i) => `
      <div class="rr" style="left:40px;top:${310 + i * 168}px;width:740px;height:146px;border-radius:32px;background:#fff;border:3px solid ${C.line}">
        <div style="position:absolute;left:28px;top:28px;width:84px;height:84px;border-radius:42px;background:${p.col};color:#fff;font-size:36px;font-weight:800;display:flex;align-items:center;justify-content:center">${p.i}</div>
        <div style="position:absolute;left:136px;top:0;height:140px;display:flex;align-items:center;font-size:36px;font-weight:700;color:${C.ink}">${p.n}</div>
        ${['ok', 'hurt', 'wait'].map((k) => `<div class="s-${k} row" style="position:absolute;right:26px;top:36px;height:68px;padding:0 24px;border-radius:34px;background:${ST[k][2]};color:${ST[k][1]};font-size:27px;font-weight:800;gap:10px">${k === 'ok' ? ico('check', 28) : ''}${ST[k][0]}</div>`).join('')}
      </div>`).join('') + `
      <div class="sum" style="left:0;top:1010px;width:${PW}px;text-align:center;font-size:38px;font-weight:700;color:${C.muted}"></div>`);
    show(rolls, 23.95, 27.82);
    const rrs = [...rolls.querySelectorAll('.rr')];
    // Ibu: ok · Raka: hurt · Pak RT: wait → ok
    const pairs = [[['ok', RS[0], null]], [['ok', RS[1], null]], [['hurt', RS[2], null]], [['wait', RS[3], LATE - 0.1], ['ok', LATE, null]]];
    rrs.forEach((r, i) => {
      ['ok', 'hurt', 'wait'].forEach((k) => { const e = r.querySelector('.s-' + k); const w = pairs[i].find((p) => p[0] === k); if (w) show(e, w[1], w[2], (t) => `scale(${popS(t, w[1], 0.75).toFixed(4)})`); else e.style.display = 'none'; });
    });
    RS.forEach((k, i) => cue(k, i === 2 ? 'note' : 'check', { n: i + 1 }));
    cue(LATE, 'check');
    const sum = rolls.querySelector('.sum');
    draws.push((t) => {
      const ok = (t >= RS[0] ? 1 : 0) + (t >= RS[1] ? 1 : 0) + (t >= LATE ? 1 : 0), hurt = t >= RS[2] ? 1 : 0, wait = t >= RS[3] && t < LATE ? 1 : 0;
      sum.innerHTML = t < RS[0] ? 'Menunggu jawaban…' : `<span style="color:${C.green}">${ok} aman</span> · <span style="color:${C.amber}">${hurt} terluka</span>${wait ? ` · ${wait} belum membalas` : ''}`;
    });
    capStep(5, 'Koordinasi tetap jalan', 'Absen siapa yang aman, lalu sematkan<br>titik kumpul di atas chat.', 24.0, 27.85);

    // ══════════════ H · 28–31  three real numbers
    morph(27.85, 540, 1080, 880, 560, 72, C.panel, { w: 17, z: 0.82 });
    cue(27.9, 'whoosh', { v: 0.5 });
    const NUMS = [[28.0, '0', 'server, akun, atau data<br>yang disimpan'], [29.0, '±550 KB', 'ukuran aplikasi,<br>ringan untuk HP lama'], [30.0, '4.000+', 'unduhan APK<br>di minggu pertama']];
    NUMS.forEach(([k, v, l], i) => {
      const e = lay(880, 560, `<div style="left:0;top:70px;width:880px;text-align:center;font-size:190px;font-weight:800;letter-spacing:-0.045em;color:#fff;line-height:1">${v.replace('±', '<span style="font-size:120px;color:#7FB2FF">±</span>')}</div>
        <div style="left:0;top:320px;width:880px;text-align:center;font-size:40px;font-weight:600;line-height:1.3;color:${C.soft}">${l}</div>`);
      show(e, k + 0.03, i < 2 ? k + 0.88 : 30.72);
      cue(k, 'slam', { n: i + 1 });
    });
    capBig('Dibuat untuk<br>saat genting.', 28.0, 30.72, '#fff', 84);

    // ══════════════ I · 31–34  the shape folds into the app icon
    const END = 31.0;
    morph(END - 0.15, 540, 720, 400, 400, 92, C.navy, { w: 18, z: 0.84 });
    cue(END, 'slam', { n: 5 }); cue(END, 'settle');
    const ic = lay(400, 400, `<div style="left:${(400 - 226 * MK_W / MK_H) / 2}px;top:${(400 - 226) / 2}px">${mark(226, '#fff', C.blue)}</div>`);
    show(ic, END + 0.05, null, (t) => `scale(${popS(t, END, 0.7).toFixed(4)})`);
    const logo = W(`<div style="left:${540 - 380}px;top:1010px;width:760px"><img src="${LOGO}" style="width:760px;display:block"></div>`);
    show(logo, 31.5, null);
    cue(31.5, 'pop');
    const line = W(`<div style="left:60px;width:960px;top:1310px;text-align:center;font-size:62px;font-weight:800;letter-spacing:-0.02em;line-height:1.12;color:${C.ink}">Sinyal hilang,<br>kamu tetap terhubung.</div>`);
    show(line, 32.0, null);
    cue(32.0, 'swap', { n: 5 });
    const pill = W(`<div class="row" style="left:${540 - 300}px;top:1540px;width:600px;height:100px;border-radius:50px;background:${C.blue};color:#fff;justify-content:center;gap:14px;font-size:36px;font-weight:800">Gratis · covatom.com</div>`);
    show(pill, 32.5, null, (t) => `scale(${popS(t, 32.5, 0.8).toFixed(4)})`);
    cue(32.5, 'cta'); cue(33.0, 'shimmer');

    // ───────────────────────── cursor (world space)
    const cur = W(`<div style="left:0;top:0;width:0;height:0">
        <svg width="50" height="56" viewBox="0 0 40 46" style="position:absolute;left:-5px;top:-4px"><path d="M4 3 L4 37 L13 29 L19 43 L26 40 L20 26 L33 26 Z" fill="${C.navy}" stroke="#fff" stroke-width="2.6" stroke-linejoin="round"/></svg>
        <div class="pl" style="position:absolute;left:36px;top:50px;height:44px;padding:0 18px;border-radius:22px;background:${C.blue};color:#fff;font-size:23px;font-weight:700;display:flex;align-items:center;white-space:nowrap;border:3px solid #fff">Kamu</div>
        <div class="rp" style="position:absolute;left:-36px;top:-36px;width:72px;height:72px;border-radius:36px;border:3px solid ${C.blue}"></div></div>`);
    const rp = cur.querySelector('.rp'), pl = cur.querySelector('.pl');
    const CXT = new Track(1000), CYT = new Track(1800);
    const go = (tArrive, x, y, lead = 0.42) => { CXT.to(tArrive - lead, x, SP.cursor); CYT.to(tArrive - lead, y, SP.cursor); };
    const ajakX = PL + 40 + 740 - 28 - 75;
    go(INV[0], ajakX, PT + ROWY[0] + 70, 0.5); go(INV[1], ajakX, PT + ROWY[1] + 70, 0.36); go(INV[2], ajakX, PT + ROWY[2] + 70, 0.36);
    CXT.to(9.8, 1020, SP.cursor); CYT.to(9.8, 1840, SP.cursor);
    go(SEND, PL + 725, PT + 1090, 0.5);
    CXT.to(15.25, 1020, SP.cursor); CYT.to(15.25, 1840, SP.cursor);
    go(GOC, 540, 1070 - EH / 2 + 1102, 0.45);
    CXT.to(18.75, 1020, SP.cursor); CYT.to(18.75, 1840, SP.cursor);
    go(ABS, 540, PT + 205, 0.45);
    CXT.to(24.3, 1020, SP.cursor); CYT.to(24.3, 1840, SP.cursor);
    const CLICKS = [...INV, SEND, GOC, ABS];
    const CURWIN = [[7.85, 10.3], [14.45, 15.7], [17.95, 19.2], [23.45, 24.8]];
    draws.push((t) => {
      const x = CXT.at(t), y = CYT.at(t);
      const vx = (CXT.at(t + 0.01) - CXT.at(t - 0.01)) / 0.02;
      let o = 0;
      for (const [a, b] of CURWIN) o = Math.max(o, lin(t, a, a + 0.15) * (1 - lin(t, b - 0.15, b)));
      let s = 1; for (const tc of CLICKS) s *= press(t, tc);
      cur.style.opacity = o.toFixed(3);
      cur.style.visibility = o > 0.001 ? 'visible' : 'hidden';
      cur.style.transform = `translate(${x.toFixed(2)}px,${y.toFixed(2)}px) rotate(${clamp(-vx * 0.004, -12, 12).toFixed(2)}deg) scale(${s.toFixed(4)})`;
      pl.style.transform = `translateX(${clamp(-vx * 0.01, -24, 24).toFixed(2)}px)`;
      let rr = null; for (const tc of CLICKS) { const r = ripple(t, tc); if (r) rr = r; }
      rp.style.opacity = rr ? rr.o.toFixed(3) : 0; rp.style.transform = rr ? `scale(${rr.s.toFixed(3)})` : 'none';
    });

    // ───────────────────────── seek
    window.seek = (t) => {
      const z = zT.at(t);
      // quake: a decaying rumble while the bars die; a hit at the drop
      const quake = t > 1.0 && t < 3.4 ? 10 * Math.exp(-(t - 1.0) / 1.1) * (1 - lin(t, 3.0, 3.4)) : 0;
      const hit = (k, a) => (t >= k ? a * Math.exp(-(t - k) / 0.1) : 0);
      const s1 = quake + hit(DROP, 10) + hit(END, 4);
      world.style.transform = `translate(${(540 + Math.sin(t * 83) * s1).toFixed(2)}px,${(960 + camY.at(t) + Math.cos(t * 71) * s1).toFixed(2)}px) scale(${z.toFixed(5)}) translate(-540px,-960px)`;
      const bg = BG.at(t);
      stage.style.background = bg;
      // soft light pool behind the shape: blue, red during SOS, gone in daylight
      const redK = lin(t, DROP - 0.1, DROP + 0.2) * (1 - lin(t, 18.9, 19.4));
      const nightK = 1 - lin(t, LIGHT, LIGHT + 0.6);
      bloom.style.background = `radial-gradient(900px 900px at 540px 1080px, rgba(${Math.round(lerp(22, 229, redK))},${Math.round(lerp(119, 56, redK))},${Math.round(lerp(255, 59, redK))},${(0.22 * nightK).toFixed(3)}), rgba(0,0,0,0) 70%)`;
      draws.forEach((f) => f(t));
      const w = HW.at(t), h = HH.at(t), x = HX.at(t), y = HY.at(t);
      hero.style.left = px(x - w / 2); hero.style.top = px(y - h / 2);
      hero.style.width = px(w); hero.style.height = px(h);
      hero.style.borderRadius = px(Math.min(HR.at(t), Math.min(w, h) / 2));
      hero.style.background = HC.at(t);
      hero.style.boxShadow = t > LIGHT ? '0 30px 80px rgba(15,27,53,.22)' : '0 30px 90px rgba(0,0,0,.35)';
      let s = popS(t, 0.0, 0.5);
      BAR_T.forEach((k) => { s *= bump(t, k + 0.03, 0.025, 0.06); });
      s *= bump(t, 3.0, 0.04, 0.07);
      s *= bump(t, DROP + 0.03, 0.05, 0.08);
      NUMS.forEach(([k]) => { s *= bump(t, k + 0.03, 0.05, 0.07); });
      hero.style.transform = `scale(${s.toFixed(4)})`;
    };
    window.FILM = {
      width: 1080, height: 1920, bpm: 120, duration: 34.0,
      sections: { intro: [0, 4], build: [12, 16], drop: [16, 20], outro: [31, 34] },
      cues: cues.sort((a, b) => a.t - b.t),
    };
    window.seek(0);
    window.READY = true;
  } catch (err) {
    window.FILM_ERROR = String(err && err.stack || err);
  }
})();
