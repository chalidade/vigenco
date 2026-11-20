// covatom (formerly Saling Jaga) · "Satu gempa, nol sinyal, tetap saling jaga." Landscape 1920×1080, 120 BPM, 32 s.
// One shape, never cut: the phone's status pill (signal dies) → the phone itself (find neighbours → bond →
// group chat) → pull back to the mesh (Darto's SOS relayed by Dika over Bluetooth) → DROP: the phone turns
// SOS → offline compass → roll call → fact pill slams → the pill becomes the "c" ring, the "o" ring bonds
// with it, and the covatom wordmark resolves.
(async function () {
  try {
    const { clamp, lerp, outQ, inOut, stepR, Track, ColorTrack, SP, vis, applyVis, press, ripple, measure } = M;
    const C = { navy: '#0F1B36', night: '#0A1430', panel: '#17264A', panel2: '#22356A', blue: '#1F7BFF',
      blueT: '#E3EEFF', screen: '#F4F6FB', ink: '#0F1B36', muted: '#66728F', soft: '#9DB0D6',
      coral: '#FF4D4F', coralT: '#FFE4E4', line: 'rgba(15,27,54,.08)' };
    const OF = "'Outfit'", IN = "'Inter'";
    await Promise.all([
      document.fonts.load(`500 100px ${OF}`), document.fonts.load(`600 100px ${OF}`), document.fonts.load(`700 100px ${OF}`),
      document.fonts.load(`400 30px ${OF}`),
      document.fonts.load(`400 24px ${IN}`), document.fonts.load(`500 24px ${IN}`), document.fonts.load(`600 24px ${IN}`), document.fonts.load(`700 24px ${IN}`),
    ].map((p) => p.catch(() => null)));
    await document.fonts.ready;

    const cues = [];
    const cue = (t, k, o = {}) => cues.push({ t, k, ...o });
    const world = document.getElementById('world');
    const hud = document.getElementById('hud');
    const flash = document.getElementById('flash');
    const stage = document.getElementById('stage');
    const dots = document.getElementById('dots');
    const draws = [];
    const W = (html, parent = world) => { const d = document.createElement('div'); d.innerHTML = html.trim(); const e = d.firstElementChild; parent.appendChild(e); return e; };
    const at = (e, x, y) => { e.style.left = x.toFixed(2) + 'px'; e.style.top = y.toFixed(2) + 'px'; return e; };
    const rect = (e, x, y, w, h) => { at(e, x, y); e.style.width = Math.max(0, w).toFixed(2) + 'px'; e.style.height = Math.max(0, h).toFixed(2) + 'px'; };
    const show = (e, tin, tout, extra = '', d = 0.12) => draws.push((t) => applyVis(e, vis(t, tin, tout, d), typeof extra === 'function' ? extra(t) : extra));
    const popS = (t, tin, s0 = 0.6) => s0 + (1 - s0) * stepR(t - tin, SP.pop);
    const bump = (t, tc, a = 0.06, d = 0.08) => 1 + a * Math.exp(-(((t - tc) / d) ** 2));
    const lin = (t, a, b) => clamp((t - a) / (b - a));

    // icons: one stroke weight
    const P = (d, sw = 2) => `<svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
    const I = {
      check: P('<path d="M20 6 9 17l-5-5"/>', 2.6),
      x: P('<path d="M6 6l12 12M18 6 6 18"/>', 2.6),
      back: P('<path d="m15 5-7 7 7 7"/>'),
      send: P('<path d="M5 12h13"/><path d="m12 5 7 7-7 7"/>', 2.6),
      pin: P('<path d="M9 3.5h6l-1 6 3.5 3.5h-11L10 9.5z"/><path d="M12 13v7.5"/>'),
      batt: P('<rect x="2.5" y="7" width="17" height="10" rx="2.5"/><path d="M22 10.5v3"/><rect x="5" y="9.5" width="9" height="5" rx="1" fill="currentColor" stroke="none"/>', 1.8),
      wifi: P('<path d="M2.5 9a14 14 0 0 1 19 0M5.5 12.5a9.5 9.5 0 0 1 13 0M8.8 16a5 5 0 0 1 6.4 0"/><path d="M12 19.5h.01" stroke-width="3"/>'),
      bt: P('<path d="m7 7 10 10-5 4V3l5 4L7 17"/>'),
      phone: P('<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>'),
    };
    const ico = (k, s, col = 'currentColor') => `<span class="ic" style="width:${s}px;height:${s}px;color:${col}">${I[k]}</span>`;

    // ── the covatom mark, built from the brand construction (R = 1): centre distance 2R/φ,
    //    stroke 2R/φ³, gap R/φ⁴; the shared arc (o ∩ c disc) is the brand blue.
    const PHI = 1.6180339887, D = 2 / PHI, TH = 2 / PHI ** 3, RI = 1 - TH, GAP = 1 / PHI ** 4;
    const ringPath = (cx) => `M${cx - 1},0a1,1 0 1,0 2,0a1,1 0 1,0 -2,0ZM${cx - RI},0a${RI},${RI} 0 1,0 ${2 * RI},0a${RI},${RI} 0 1,0 ${-2 * RI},0Z`;
    let markN = 0;
    // returns svg markup; R in px; col = ring colour. Width = (2+D)R, height 2R; origin at left edge / centre.
    const markSVG = (R, col, blue = C.blue) => {
      const n = ++markN;
      return `<svg class="mk" width="${((2 + D) * R).toFixed(2)}" height="${(2 * R).toFixed(2)}" viewBox="-1 -1 ${2 + D} 2" style="overflow:visible;display:block">
        <defs><mask id="mc${n}" maskUnits="userSpaceOnUse" x="-3" y="-3" width="40" height="6"><rect x="-3" y="-3" width="40" height="6" fill="#fff"/><circle class="mcut" cx="${D}" cy="0" r="${1 + GAP}" fill="#000"/></mask>
        <clipPath id="cc${n}"><circle cx="0" cy="0" r="1"/></clipPath></defs>
        <path class="cring" d="${ringPath(0)}" fill="${col}" fill-rule="evenodd" mask="url(#mc${n})"/>
        <g class="og"><path d="${ringPath(D)}" fill="${col}" fill-rule="evenodd"/>
        <path class="lens" d="${ringPath(D)}" fill="${blue}" fill-rule="evenodd" clip-path="url(#cc${n})"/></g></svg>`;
    };

    // ───────────────────────── Background + camera ─────────────────────────
    const BG = new ColorTrack('#1B2C57');
    BG.to(1.95, C.night, { w: 40, z: 1 });          // listrik padam
    BG.to(25.0, C.navy, { w: 8, z: 1 });
    const DOTS = new Track(1).to(1.95, 0.25, { w: 40, z: 1 }).to(4.0, 0.8, SP.soft);
    const CAMX = new Track(960), CAMY = new Track(540), CAMZ = new Track(Math.log(1.12));
    const cam = (t, x, y, z, sp = SP.cam) => { CAMX.to(t, x, sp); CAMY.to(t, y, sp); CAMZ.to(t, Math.log(z), sp); };
    cam(0.0, 960, 560, 1.0, { w: 1.6, z: 1 });       // slow drift in the intro
    cam(3.6, 960, 540, 1.0);
    cam(13.4, 450, 860, 0.4, { w: 6.5, z: 1 });      // pull back: the mesh
    cam(16.55, 960, 540, 1.0, { w: 6.5, z: 1 });     // push back into the phone
    cam(27.4, 960, 560, 1.0);
    cam(29.0, 960, 560, 1.04, { w: 1.2, z: 1 });
    const shake = (t) => {
      let x = 0, y = 0, r = 0;
      const q = (t0, a, f, k) => { const u = t - t0; if (u < 0 || u > 2) return; const e = a * Math.exp(-k * u); x += e * Math.sin(u * f * 6.283); y += e * 0.6 * Math.sin(u * f * 4.9 + 1.3); r += e * 0.012 * Math.sin(u * f * 3.7); };
      q(1.0, 22, 9, 2.6); q(1.5, 8, 11, 3); q(16.0, 10, 10, 5); q(17.0, 7, 12, 6);
      return { x, y, r };
    };
    draws.push((t) => {
      stage.style.background = BG.at(t);
      dots.style.opacity = clamp(DOTS.at(t)).toFixed(3);
      const z = Math.exp(CAMZ.at(t)), s = shake(t);
      world.style.transform = `translate(${(960 + s.x).toFixed(2)}px,${(540 + s.y).toFixed(2)}px) rotate(${s.r.toFixed(3)}deg) scale(${z.toFixed(5)}) translate(${(-CAMX.at(t)).toFixed(2)}px,${(-CAMY.at(t)).toFixed(2)}px)`;
      const f = Math.max(0.32 * Math.exp(-Math.max(0, t - 16.0) / 0.12) * (t >= 16 ? 1 : 0), 0.22 * Math.exp(-Math.max(0, t - 17.0) / 0.1) * (t >= 17 ? 1 : 0));
      flash.style.opacity = f.toFixed(3);
    });

    // ───────────────────────── Phone geometry ─────────────────────────
    const PX = 1290, PY = 540, PW = 430, PH = 880, PR = 60, PL = PX - PW / 2, PT = PY - PH / 2;

    // ───────────────────────── Mesh (behind the hero) ─────────────────────────
    const NODES = { darto: [-1500, 1000], dika: [-150, 1250], rina: [2400, 1180], kamu: [PX, PY] };
    const meshOn = (t) => Math.min(clamp((t - 13.55) / 0.25), clamp((16.9 - t) / 0.3));
    const range = W(`<div style="border-radius:50%;border:6px dashed rgba(157,176,214,.35);background:rgba(31,123,255,.06)"></div>`);
    const RR = 1750; rect(range, PX - RR, PY - RR, RR * 2, RR * 2);
    const rangeLbl = W(`<div class="o" style="font:500 62px/1 ${OF};color:${C.soft};white-space:nowrap">jangkauan Wi-Fi Direct</div>`);
    at(rangeLbl, PX - 330, PY - RR + 60);
    const linkSvg = W(`<svg width="5000" height="3000" viewBox="-2500 -500 5000 3000" style="overflow:visible"></svg>`);
    at(linkSvg, -2500, -500);
    const mkLine = (a, b, col, dash) => {
      const [x1, y1] = NODES[a], [x2, y2] = NODES[b];
      const L = Math.hypot(x2 - x1, y2 - y1);
      const ns = 'http://www.w3.org/2000/svg';
      const l = document.createElementNS(ns, 'line');
      Object.entries({ x1, y1, x2, y2, stroke: col, 'stroke-width': 14, 'stroke-linecap': 'round' }).forEach(([k, v]) => l.setAttribute(k, v));
      linkSvg.appendChild(l);
      return { l, L, dash };
    };
    const lines = [[mkLine('kamu', 'rina', C.blue, 0), 14.0], [mkLine('kamu', 'dika', C.blue, 0), 14.25], [mkLine('dika', 'darto', '#fff', 1), 14.5]];
    cue(14.0, 'born'); cue(14.25, 'born'); cue(14.5, 'born');
    const btLbl = W(`<div class="row" style="gap:20px;font:600 60px/1 ${IN};color:#fff;background:${C.panel2};padding:22px 40px;border-radius:999px">${ico('bt', 60)}Bluetooth relay</div>`);
    at(btLbl, (NODES.dika[0] + NODES.darto[0]) / 2 - 260, (NODES.dika[1] + NODES.darto[1]) / 2 - 190);
    const mini = {};
    const miniPhone = (key, name, ini, col, status) => {
      const [x, y] = NODES[key];
      const e = W(`<div style="width:${PW}px;height:${PH}px;border-radius:${PR}px;background:${C.panel};box-shadow:inset 0 0 0 4px rgba(255,255,255,.08);overflow:hidden">
        <div style="position:absolute;left:0;right:0;top:110px;display:flex;flex-direction:column;align-items:center;gap:28px">
          <div class="av" style="width:200px;height:200px;border-radius:50%;background:${col};display:flex;align-items:center;justify-content:center;font:600 96px/1 ${OF};color:#fff">${ini}</div>
          <div style="font:600 64px/1 ${OF};color:#fff;white-space:nowrap">${name}</div>
          <div class="st" style="font:500 40px/1 ${IN};color:${C.soft}">${status}</div></div></div>`);
      rect(e, x - PW / 2, y - PH / 2, PW, PH);
      mini[key] = e;
      return e;
    };
    miniPhone('rina', 'Bu Rina', 'R', C.blue, 'aman');
    miniPhone('dika', 'Dika', 'D', '#12A594', 'relay');
    const darto = miniPhone('darto', 'Pak Darto', 'PD', '#7C5CFF', 'terjepit');
    // Darto's SOS button: hold ring fills over the riser
    const sosBtn = W(`<div style="position:absolute;left:${PW / 2 - 130}px;top:540px;width:260px;height:260px">
      <svg viewBox="-1.1 -1.1 2.2 2.2" width="260" height="260" style="position:absolute;inset:0;overflow:visible"><circle r="1" fill="none" stroke="rgba(255,255,255,.15)" stroke-width=".09"/><circle class="pr" r="1" fill="none" stroke="${C.coral}" stroke-width=".09" stroke-linecap="round" transform="rotate(-90)" stroke-dasharray="6.2832" stroke-dashoffset="6.2832"/></svg>
      <div class="core" style="position:absolute;left:30px;top:30px;width:200px;height:200px;border-radius:50%;background:${C.coral};display:flex;align-items:center;justify-content:center;font:700 64px/1 ${OF};color:#fff">SOS</div></div>`, darto);
    const sosPr = sosBtn.querySelector('.pr'), sosCore = sosBtn.querySelector('.core');
    const kamuTag = W(`<div style="font:600 64px/1 ${OF};color:#fff;background:${C.blue};padding:22px 44px;border-radius:999px;white-space:nowrap">Kamu</div>`);
    at(kamuTag, PX - kamuTag.offsetWidth / 2, PY + PH / 2 + 50);
    draws.push((t) => {
      const o = meshOn(t);
      const vis2 = o > 0.001 ? 'visible' : 'hidden';
      [range, rangeLbl, linkSvg, btLbl, kamuTag, ...Object.values(mini)].forEach((e) => { e.style.visibility = vis2; e.style.opacity = o.toFixed(3); });
      range.style.transform = `scale(${(0.7 + 0.3 * stepR(t - 13.6, SP.soft)).toFixed(4)})`;
      [['rina', 13.75], ['dika', 14.0], ['darto', 14.25]].forEach(([k, tb]) => {
        const s = popS(t, tb, 0.5);
        mini[k].style.opacity = (o * stepR(t - tb, SP.text)).toFixed(3);
        mini[k].style.transform = `scale(${(s * bump(t, k === 'dika' ? 16.5 : 99, 0.08, 0.09)).toFixed(4)})`;
      });
      for (const [ln, tb] of lines) {
        const p = outQ((t - tb) / 0.45);
        ln.l.setAttribute('stroke-dasharray', ln.dash ? `30 34` : `${ln.L} ${ln.L}`);
        ln.l.setAttribute('stroke-dashoffset', ln.dash ? ((t * 220) % 64).toFixed(1) : (ln.L * (1 - p)).toFixed(1));
        ln.l.setAttribute('opacity', (ln.dash ? p * 0.6 : p).toFixed(3));
      }
      btLbl.style.opacity = (o * stepR(t - 14.75, SP.text)).toFixed(3);
      kamuTag.style.opacity = (o * stepR(t - 13.75, SP.text)).toFixed(3);
      // SOS hold 14.25 → 15.9
      const hold = inOut(lin(t, 14.3, 15.9));
      sosPr.setAttribute('stroke-dashoffset', (6.2832 * (1 - hold)).toFixed(4));
      sosCore.style.transform = `scale(${(t < 16 ? 1 - 0.06 * hold : bump(t, 16.05, 0.12, 0.1)).toFixed(4)})`;
      darto.style.background = t >= 16 ? `rgb(${Math.round(lerp(255, 23, clamp((t - 16) / 0.7)))},${Math.round(lerp(77, 38, clamp((t - 16) / 0.7)))},${Math.round(lerp(79, 74, clamp((t - 16) / 0.7)))})` : C.panel;
    });
    cue(14.0, 'riser', { d: 2.0 });

    // ───────────────────────── Hero: the one shape ─────────────────────────
    const hero = W(`<div style="overflow:hidden"></div>`);
    const HX = new Track(960), HY = new Track(650), HW = new Track(560), HH = new Track(120), HRr = new Track(60);
    const HC = new ColorTrack('#22356A');
    const H = (t, x, y, w, h, r, sp = SP.shape) => { HX.to(t, x, sp); HY.to(t, y, sp); HW.to(t, w, sp); HH.to(t, h, sp); HRr.to(t, r, sp); };
    cue(0.25, 'born');

    // ── intro status pill content
    const status = W(`<div class="row" style="position:absolute;inset:0;padding:0 44px;justify-content:space-between;font:600 40px/1 ${IN};color:#fff">
      <div class="row" style="gap:22px"><div class="bars row" style="gap:7px;align-items:flex-end;height:40px"></div>
      <div style="position:relative;height:40px;min-width:60px"><span class="lb1" style="position:absolute;left:0;top:0">4G</span><span class="lb2 row" style="position:absolute;left:0;top:0;gap:12px;color:${C.coral}">${ico('x', 34)}Tidak ada layanan</span></div></div>
      <div class="row" style="gap:18px"><span class="tnum">21:47</span>${ico('batt', 50)}</div></div>`, hero);
    const bars = status.querySelector('.bars');
    const barEls = [16, 24, 32, 40].map((h) => W(`<div style="position:relative;width:11px;height:${h}px;border-radius:3px;background:#fff"></div>`, bars));
    const BAR_T = [3.0, 2.5, 2.0, 1.5];        // tallest falls first
    BAR_T.forEach((tt) => cue(tt, 'tick'));
    cue(1.0, 'slam', { n: 0 }); cue(1.0, 'drop');
    cue(3.0, 'alert');
    const lb1 = status.querySelector('.lb1'), lb2 = status.querySelector('.lb2');
    draws.push((t) => {
      applyVis(status, vis(t, 0.3, 3.8, 0.12));
      barEls.forEach((b, i) => {
        const u = t - BAR_T[i];
        const f = u > 0 ? stepR(u, { w: 22, z: 0.75 }) : 0;
        b.style.opacity = (1 - 0.82 * clamp(f)).toFixed(3);
        b.style.transform = `translateY(${(f * 10).toFixed(2)}px) scaleY(${(1 - 0.55 * clamp(f)).toFixed(3)})`;
        b.style.transformOrigin = '50% 100%';
      });
      applyVis(lb1, vis(t, 0, 2.95, 0.08));
      applyVis(lb2, vis(t, 3.0, null));
    });
    H(2.85, 960, 650, 840, 120, 60, SP.shape);   // grow for "Tidak ada layanan"
    HC.to(2.85, '#2A2440', SP.soft);

    // intro headline (world)
    const headline = (txt, tin, tout, y = 400, size = 120) => {
      const e = W(`<div class="o" style="font:600 ${size}px/1 ${OF};color:#fff;white-space:nowrap;letter-spacing:-.02em">${txt}</div>`);
      at(e, 960 - e.offsetWidth / 2, y - size / 2);
      show(e, tin, tout, (t) => `scale(${bump(t, tin, 0.04, 0.1).toFixed(4)})`, 0.1);
      return e;
    };
    headline('Malam biasa.', 0.25, 0.9);
    headline('Gempa.', 1.0, 1.9);
    headline('Listrik padam.', 2.0, 2.9);
    headline('Sinyal hilang.', 3.0, 3.8);
    cue(2.0, 'slam', { n: 1 }); cue(3.0, 'slam', { n: 2 });

    // → the phone
    H(3.7, PX, PY, PW, PH, PR, SP.shape);
    HC.to(3.75, C.screen, SP.soft);
    cue(3.75, 'whoosh', { v: 0.8 }); cue(4.0, 'settle');

    // ── left column copy (world), one block per chapter
    const col = (tin, tout, kick, head, sub) => {
      const e = W(`<div style="width:780px">
        <div style="font:600 28px/1 ${IN};letter-spacing:.16em;text-transform:uppercase;color:${C.blue};margin-bottom:28px">${kick}</div>
        <div class="o" style="font:600 82px/1.04 ${OF};color:#fff;letter-spacing:-.02em">${head}</div>
        <div style="font:400 32px/1.4 ${IN};color:${C.soft};margin-top:30px;width:700px">${sub}</div></div>`);
      at(e, 170, 540 - e.offsetHeight / 2);
      show(e, tin, tout, '', 0.12);
    };
    col(4.25, 8.4, 'Tanpa internet', 'Temukan tetangga di sekitarmu.', 'Tanpa akun, tanpa nomor HP. Ponsel di dekatmu muncul sendiri.');
    col(8.5, 13.3, 'Chat &amp; telepon', 'Tetap ngobrol saat sinyal nol.', 'Ponsel tersambung langsung lewat Wi-Fi Direct, sekitar 50–100 m per grup.');
    col(17.0, 18.35, 'SOS', 'Satu tombol.<br>Semua tahu.', 'Jarak, arah dan baterai pengirim langsung terlihat.');
    col(18.5, 21.35, 'Kompas offline', 'Jarumnya menunjuk ke dia.', 'Ikuti arahnya sampai ketemu. Tanpa internet.');
    col(21.5, 24.85, 'Absen', 'Siapa aman, siapa butuh bantuan.', 'Satu ketuk untuk absen. Pengumuman disematkan sampai ke semua orang.');
    cue(4.25, 'swap', { n: 0 }); cue(8.5, 'swap', { n: 1 }); cue(18.5, 'swap', { n: 3 }); cue(21.5, 'swap', { n: 4 });

    // ── phone screens
    const screen = (tin, tout) => {
      const e = W(`<div style="width:${PW}px;height:${PH}px;overflow:hidden;border-radius:${PR}px"></div>`);
      rect(e, PL, PT, PW, PH);
      show(e, tin, tout, '', 0.12);
      return e;
    };
    const avatar = (ini, col, s = 56) => `<div style="flex:none;width:${s}px;height:${s}px;border-radius:50%;background:${col};display:flex;align-items:center;justify-content:center;font:600 ${Math.round(s * 0.42)}px/1 ${OF};color:#fff">${ini}</div>`;
    const appHead = (dark) => `<div class="row" style="position:absolute;left:28px;right:28px;top:40px;justify-content:space-between">
      <div class="row" style="gap:12px">${markSVG(13, dark ? '#fff' : C.ink)}<span class="o" style="font:500 30px/1 ${OF};color:${dark ? '#fff' : C.ink};letter-spacing:-.01em">covatom</span></div>
      <div class="row" style="gap:8px;font:600 20px/1 ${IN};color:${dark ? '#fff' : C.blue};background:${dark ? 'rgba(255,255,255,.14)' : C.blueT};padding:10px 16px;border-radius:999px">${ico('wifi', 22)}Offline</div></div>`;

    // Screen 1 · nearby
    const S1 = screen(4.2, 8.4);
    S1.innerHTML = `${appHead(false)}
      <div class="o" style="position:absolute;left:28px;top:110px;font:600 46px/1 ${OF};color:${C.ink}">Di sekitarmu</div>
      <div style="position:absolute;left:28px;top:168px;font:400 22px/1 ${IN};color:${C.muted}">Mencari ponsel terdekat…</div>`;
    const radar = W(`<div style="position:absolute;left:0;top:200px;width:${PW}px;height:270px"></div>`, S1);
    const rings = [0, 1, 2].map(() => W(`<div style="position:absolute;border-radius:50%;border:3px solid ${C.blue}"></div>`, radar));
    const radarMe = W(`<div style="position:absolute;left:${PW / 2 - 36}px;top:${135 - 36}px">${avatar('K', C.ink, 72)}</div>`, radar);
    const dotA = W(`<div style="position:absolute;left:${PW / 2 + 96}px;top:56px">${avatar('R', C.blue, 40)}</div>`, radar);
    const dotB = W(`<div style="position:absolute;left:${PW / 2 - 150}px;top:176px">${avatar('D', '#12A594', 40)}</div>`, radar);
    const rowsN = [['Bu Rina', 'R', C.blue, '42 m'], ['Dika', 'D', '#12A594', '78 m']].map(([n, ini, c, d], i) => {
      const r = W(`<div class="row" style="position:absolute;left:20px;right:20px;top:${500 + i * 104}px;height:88px;padding:0 14px;border-radius:24px;background:#fff;box-shadow:0 1px 0 ${C.line};gap:16px">
        ${avatar(ini, c)}<div style="flex:1"><div style="font:600 26px/1.1 ${IN};color:${C.ink}">${n}</div><div style="font:400 20px/1.3 ${IN};color:${C.muted}">${d} · ponsel</div></div>
        <div class="btn" style="position:relative;height:50px;border-radius:999px;overflow:hidden;flex:none">
          <div class="b1" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font:600 22px/1 ${IN};color:#fff">Ajak</div>
          <div class="b2 row" style="position:absolute;inset:0;justify-content:center;gap:6px;font:600 20px/1 ${IN};color:${C.blue}">${ico('check', 20)}Terhubung</div></div></div>`, S1);
      return r;
    });
    const more = W(`<div style="position:absolute;left:0;right:0;top:730px;text-align:center;font:500 20px/1 ${IN};color:${C.muted}">Tanpa akun · tanpa server</div>`, S1);
    const AJAK = [6.5, 7.5];
    AJAK.forEach((tc) => { cue(tc, 'click'); cue(tc + 0.25, 'check'); });
    cue(5.0, 'pop'); cue(5.5, 'pop');
    rowsN.forEach((r, i) => {
      const btn = r.querySelector('.btn'), b1 = r.querySelector('.b1'), b2 = r.querySelector('.b2');
      const BW = new Track(92).to(AJAK[i] + 0.1, 156, SP.shape);
      const BC = new ColorTrack(C.blue).to(AJAK[i] + 0.1, C.blueT, { w: 30, z: 1 });
      draws.push((t) => {
        applyVis(r, vis(t, 5.0 + i * 0.5, null), `scale(${popS(t, 5.0 + i * 0.5, 0.85).toFixed(4)})`);
        btn.style.width = BW.at(t).toFixed(2) + 'px';
        btn.style.background = BC.at(t);
        btn.style.transform = `scale(${press(t, AJAK[i]).toFixed(4)})`;
        applyVis(b1, vis(t, 0, AJAK[i] + 0.05, 0.08));
        applyVis(b2, vis(t, AJAK[i] + 0.2, null));
      });
    });
    draws.push((t) => {
      rings.forEach((rg, i) => {
        const ph = (((t - 4.2) / 1.5 + i / 3) % 1 + 1) % 1;
        const rad = lerp(40, 150, ph);
        rect(rg, PW / 2 - rad, 135 - rad, rad * 2, rad * 2);
        rg.style.opacity = (0.45 * (1 - ph) * clamp((t - 4.3) / 0.3)).toFixed(3);
      });
      dotA.style.transform = `scale(${popS(t, 5.0, 0).toFixed(4)})`;
      dotB.style.transform = `scale(${popS(t, 5.5, 0).toFixed(4)})`;
      radarMe.style.transform = `scale(${popS(t, 4.4, 0.4).toFixed(4)})`;
      more.style.opacity = stepR(t - 6.0, SP.text).toFixed(3);
    });

    // Screen 2 · group chat
    const S2 = screen(8.5, 16.85);
    S2.innerHTML = `<div style="position:absolute;left:0;right:0;top:0;height:130px;border-bottom:2px solid ${C.line}"></div>
      <div class="row" style="position:absolute;left:24px;top:46px;gap:14px">${ico('back', 30, C.ink)}
        <div><div style="font:600 30px/1.1 ${IN};color:${C.ink}">Grup RT 04</div>
        <div class="row" style="gap:8px;font:500 20px/1.4 ${IN};color:${C.muted}"><span style="width:10px;height:10px;border-radius:5px;background:#12A594"></span>3 terhubung · offline</div></div></div>
      <div class="row" style="position:absolute;right:24px;top:50px;width:56px;height:56px;border-radius:50%;background:${C.blueT};justify-content:center">${ico('phone', 26, C.blue)}</div>`;
    const composer = W(`<div class="row" style="position:absolute;left:20px;top:${PH - 104}px;width:316px;height:68px;border-radius:999px;background:#fff;box-shadow:inset 0 0 0 2px ${C.line};padding:0 24px;font:400 24px/1 ${IN};color:${C.ink}"><span class="tx"></span><span class="caret" style="width:2px;height:30px;background:${C.blue};margin-left:2px"></span><span class="ph" style="position:absolute;left:24px;color:#A0A8BC">Tulis pesan…</span></div>`, S2);
    const sendB = W(`<div class="row" style="position:absolute;left:${PW - 20 - 68}px;top:${PH - 104}px;width:68px;height:68px;border-radius:50%;background:${C.blue};justify-content:center;color:#fff">${ico('send', 30)}</div>`, S2);
    const tx = composer.querySelector('.tx'), caret = composer.querySelector('.caret'), ph = composer.querySelector('.ph');
    const MSG = 'Semua aman?';
    const T_FOCUS = 9.0, T_TYPE = 9.25, T_SEND = 11.0;
    for (let i = 0; i < MSG.length; i++) cue(T_TYPE + i * 0.125, 'key');
    cue(T_FOCUS, 'click'); cue(T_SEND, 'click'); cue(T_SEND + 0.02, 'whoosh', { v: 0.5 });
    const bubbles = [];
    let by = 160;
    const bubble = (tin, mine, who, text) => {
      const e = W(`<div style="position:absolute;${mine ? 'right' : 'left'}:20px;top:${by}px;max-width:300px;padding:16px 20px;border-radius:26px;${mine ? `border-bottom-right-radius:8px;background:${C.blue};color:#fff` : `border-bottom-left-radius:8px;background:#fff;color:${C.ink};box-shadow:0 1px 0 ${C.line}`}">
        ${who ? `<div style="font:600 18px/1.2 ${IN};color:${who[1]};margin-bottom:4px">${who[0]}</div>` : ''}<div style="font:400 24px/1.3 ${IN}">${text}</div></div>`, S2);
      by += e.offsetHeight + 16;
      draws.push((t) => applyVis(e, vis(t, tin, null), `scale(${popS(t, tin, 0.8).toFixed(4)})`));
      e.style.transformOrigin = mine ? '100% 100%' : '0 100%';
      bubbles.push(e);
      cue(tin, mine ? 'pop' : 'note', { n: bubbles.length });
    };
    bubble(T_SEND, true, null, MSG);
    bubble(11.5, false, ['Bu Rina', C.blue], 'Aman. Aku di lapangan.');
    bubble(12.0, false, ['Dika', '#12A594'], 'Aman, di masjid.');
    bubble(12.5, false, ['Bu Rina', C.blue], 'Pak Darto belum kelihatan…');
    draws.push((t) => {
      const n = t < T_TYPE ? 0 : t >= T_SEND ? 0 : Math.min(MSG.length, Math.floor((t - T_TYPE) / 0.125 + 1e-6) + 1);
      tx.textContent = MSG.slice(0, n);
      ph.style.opacity = (t < T_FOCUS || t >= T_SEND) ? 1 : 0;
      caret.style.opacity = (t >= T_FOCUS && t < T_SEND && Math.floor((t - T_FOCUS) / 0.25) % 2 === 0) || (t >= T_TYPE && t < 10.75) ? 1 : 0;
      composer.style.boxShadow = `inset 0 0 0 ${t >= T_FOCUS && t < T_SEND ? 3 : 2}px ${t >= T_FOCUS && t < T_SEND ? C.blue : C.line}`;
      sendB.style.transform = `scale(${(press(t, T_SEND) * bump(t, 10.75, 0.08, 0.08)).toFixed(4)})`;
      composer.style.transform = `scale(${press(t, T_FOCUS) * 0.06 + 0.94 + 0}) `;
    });

    // packet: Darto → Dika → Kamu
    const pkt = W(`<div style="width:110px;height:110px;border-radius:50%;background:${C.coral};box-shadow:0 0 0 22px rgba(255,77,79,.25)"></div>`);
    draws.push((t) => {
      if (t < 16.0 || t > 17.05) { pkt.style.visibility = 'hidden'; return; }
      pkt.style.visibility = 'visible';
      const [a, b] = t < 16.5 ? [NODES.darto, NODES.dika] : [NODES.dika, NODES.kamu];
      const u = inOut(t < 16.5 ? (t - 16.0) / 0.5 : (t - 16.5) / 0.5);
      at(pkt, lerp(a[0], b[0], u) - 55, lerp(a[1], b[1], u) - 55);
      pkt.style.opacity = (t > 16.95 ? 1 - (t - 16.95) / 0.1 : 1).toFixed(3);
    });
    cue(16.0, 'drop'); cue(16.0, 'whoosh', { v: 1 }); cue(16.5, 'pop'); cue(16.5, 'whoosh', { v: 0.8 });

    // HUD captions during the mesh
    const cap = (txt, tin, tout) => {
      const e = W(`<div class="o" style="font:600 56px/1 ${OF};color:#fff;white-space:nowrap;letter-spacing:-.01em">${txt}</div>`, hud);
      at(e, 960 - e.offsetWidth / 2, 70);
      show(e, tin, tout, '', 0.1);
    };
    cap('Pak Darto di luar jangkauanmu.', 13.75, 15.9);
    cap('Ponsel Dika meneruskan SOS-nya.', 16.0, 16.9);

    // Screen 3 · SOS received (hero turns coral at 17.0)
    HC.to(16.9, C.coral, { w: 34, z: 1 });
    cue(17.0, 'slam', { n: 3 }); cue(17.0, 'alert');
    const S3 = screen(17.0, 18.35);
    S3.innerHTML = `<div style="position:absolute;left:0;right:0;top:38px;text-align:center;font:600 22px/1 ${IN};letter-spacing:.18em;color:rgba(255,255,255,.85)">SOS DITERIMA</div>`;
    const sosRing = W(`<div style="position:absolute;left:${PW / 2 - 110}px;top:136px;width:220px;height:220px">
      <div class="w1" style="position:absolute;inset:0;border-radius:50%;border:4px solid #fff"></div><div class="w2" style="position:absolute;inset:0;border-radius:50%;border:4px solid #fff"></div>
      <div style="position:absolute;inset:0;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;font:700 72px/1 ${OF};color:${C.coral}">SOS</div></div>`, S3);
    const w1 = sosRing.querySelector('.w1'), w2 = sosRing.querySelector('.w2');
    W(`<div style="position:absolute;left:0;right:0;top:376px;text-align:center"><div class="o" style="font:600 52px/1 ${OF};color:#fff">Pak Darto</div>
      <div class="row" style="justify-content:center;gap:8px;margin-top:14px;font:500 21px/1 ${IN};color:rgba(255,255,255,.85)">${ico('bt', 20)}diteruskan lewat ponsel Dika</div></div>`, S3);
    const tiles = [['140 m', 'jarak'], ['45° TL', 'arah'], ['31%', 'baterai']].map(([v, l], i) => {
      const e = W(`<div style="position:absolute;left:${20 + i * 134}px;top:520px;width:122px;height:120px;border-radius:24px;background:rgba(255,255,255,.16);text-align:center;padding-top:26px">
        <div class="o tnum" style="font:600 32px/1 ${OF};color:#fff;white-space:nowrap">${v}</div><div style="font:500 19px/1 ${IN};color:rgba(255,255,255,.8);margin-top:14px">${l}</div></div>`, S3);
      draws.push((t) => applyVis(e, vis(t, 17.25 + i * 0.125, null), `scale(${popS(t, 17.25 + i * 0.125, 0.7).toFixed(4)})`));
      cue(17.25 + i * 0.125, 'pop');
      return e;
    });
    const go = W(`<div class="row" style="position:absolute;left:24px;right:24px;top:${PH - 150}px;height:88px;border-radius:999px;background:#fff;justify-content:center;font:600 28px/1 ${IN};color:${C.coral}">Arahkan ke dia</div>`, S3);
    const T_GO = 18.0;
    cue(T_GO, 'click');
    draws.push((t) => {
      [[w1, 0], [w2, 0.5]].forEach(([w, off]) => {
        const ph2 = (((t - 17.0) / 1.0 + off) % 1 + 1) % 1;
        w.style.transform = `scale(${(1 + ph2 * 0.6).toFixed(4)})`;
        w.style.opacity = (0.6 * (1 - ph2)).toFixed(3);
      });
      sosRing.style.transform = `scale(${(popS(t, 17.0, 0.5) * bump(t, 17.5, 0.05) * bump(t, 18.0, 0.05)).toFixed(4)})`;
      go.style.transform = `scale(${press(t, T_GO).toFixed(4)})`;
    });

    // Screen 4 · offline compass (hero turns dark)
    HC.to(18.35, C.panel, { w: 20, z: 1 });
    cue(18.4, 'whoosh', { v: 0.5 });
    const S4 = screen(18.5, 21.35);
    S4.innerHTML = `${appHead(true)}
      <div class="o" style="position:absolute;left:28px;top:112px;font:600 42px/1 ${OF};color:#fff">Menuju Pak Darto</div>
      <div style="position:absolute;left:28px;top:166px;font:400 22px/1 ${IN};color:${C.soft}">Kompas offline · baterai 31%</div>`;
    const CR = 160, CCY = 400;
    const dial = W(`<div style="position:absolute;left:${PW / 2 - CR}px;top:${CCY - CR}px;width:${CR * 2}px;height:${CR * 2}px">
      <svg viewBox="-1 -1 2 2" width="${CR * 2}" height="${CR * 2}" style="position:absolute;inset:0;overflow:visible">
        <circle r=".97" fill="rgba(255,255,255,.05)" stroke="rgba(255,255,255,.22)" stroke-width=".02"/>
        ${Array.from({ length: 36 }, (_, i) => { const a = i * 10 * Math.PI / 180, r1 = i % 9 === 0 ? 0.8 : 0.87; return `<line x1="${(Math.sin(a) * r1).toFixed(3)}" y1="${(-Math.cos(a) * r1).toFixed(3)}" x2="${(Math.sin(a) * 0.93).toFixed(3)}" y2="${(-Math.cos(a) * 0.93).toFixed(3)}" stroke="rgba(255,255,255,${i % 9 === 0 ? 0.8 : 0.3})" stroke-width="${i % 9 === 0 ? 0.025 : 0.015}" stroke-linecap="round"/>`; }).join('')}
        <text x="0" y="-0.62" text-anchor="middle" dominant-baseline="middle" fill="#fff" style="font:600 .16px ${IN}">U</text>
        <g class="tg"><circle cx="0" cy="-0.93" r=".085" fill="${C.coral}"/></g>
      </svg>
      <svg class="ndl" viewBox="-1 -1 2 2" width="${CR * 2}" height="${CR * 2}" style="position:absolute;inset:0;overflow:visible">
        <path d="M0 -0.58 L0.13 0.12 L0 0.04 L-0.13 0.12Z" fill="${C.blue}"/><circle r=".05" fill="#fff"/></svg></div>`, S4);
    const dialSvg = dial.querySelector('svg'), ndl = dial.querySelector('.ndl');
    const dist = W(`<div class="o tnum" style="position:absolute;left:0;right:0;top:612px;text-align:center;font:600 104px/1 ${OF};color:#fff"></div>`, S4);
    const distSub = W(`<div style="position:absolute;left:0;right:0;top:732px;text-align:center;font:500 22px/1 ${IN};color:${C.soft}">ke arah timur laut</div>`, S4);
    const here = W(`<div class="row" style="position:absolute;left:50%;top:${PH - 116}px;transform:translateX(-50%);gap:10px;height:64px;padding:0 26px;border-radius:999px;background:${C.blue};font:600 24px/1 ${IN};color:#fff;white-space:nowrap">${ico('check', 24)}Kamu sudah dekat</div>`, S4);
    const DIST = [[18.5, 140], [19.0, 96], [19.5, 58], [20.0, 23], [20.5, 8]];
    DIST.slice(1).forEach(([tt]) => cue(tt, 'tick'));
    cue(21.0, 'check');
    const HEAD = new Track(0).to(19.1, 38, { w: 5, z: 0.85 });   // the person turns toward Darto
    const NEED = new Track(0).to(18.65, 45, { w: 9, z: 0.55 });  // needle swings with a damped wobble
    draws.push((t) => {
      const head = HEAD.at(t);
      dialSvg.style.transform = `rotate(${(-head).toFixed(2)}deg)`;
      const tg = dialSvg.querySelector('.tg');
      tg.setAttribute('transform', `rotate(45)`);
      ndl.style.transform = `rotate(${(NEED.at(t) - head + 1.5 * Math.sin(t * 5.3) * clamp(t - 19)).toFixed(2)}deg)`;
      let cur = DIST[0], ti = 0; DIST.forEach((d, i) => { if (t >= d[0]) { cur = d; ti = i; } });
      dist.textContent = `${cur[1]} m`;
      dist.style.transform = `translateY(${(-14 * (1 - stepR(t - cur[0], SP.text)) * (ti ? 1 : 0)).toFixed(2)}px)`;
      dist.style.filter = ti && t - cur[0] < 0.12 ? `blur(${(6 * (1 - (t - cur[0]) / 0.12)).toFixed(2)}px)` : 'none';
      distSub.textContent = t >= 20.0 ? 'lurus ke depan' : 'ke arah timur laut';
      applyVis(here, vis(t, 21.0, null), `translateX(-50%) scale(${popS(t, 21.0, 0.6).toFixed(4)})`);
    });

    // Screen 5 · roll call (hero back to light)
    HC.to(21.35, C.screen, { w: 20, z: 1 });
    const S5 = screen(21.5, 24.85);
    S5.innerHTML = `${appHead(false)}
      <div class="o" style="position:absolute;left:28px;top:112px;font:600 46px/1 ${OF};color:${C.ink}">Absen</div>
      <div style="position:absolute;left:28px;top:168px;font:400 22px/1 ${IN};color:${C.muted}">Grup RT 04 · 4 orang</div>`;
    const pinB = W(`<div class="row" style="position:absolute;left:20px;right:20px;top:208px;height:92px;border-radius:22px;background:${C.blueT};padding:0 18px;gap:14px">
      <div class="row" style="flex:none;width:48px;height:48px;border-radius:14px;background:${C.blue};justify-content:center;color:#fff">${ico('pin', 24)}</div>
      <div style="flex:1"><div style="font:600 21px/1.25 ${IN};color:${C.ink}">Kumpul di lapangan RT 04</div><div style="font:500 18px/1.3 ${IN};color:${C.blue}">Disematkan · dibaca 4/4</div></div></div>`, S5);
    const ROLL = [['Kamu', 'K', C.ink, 'Aman', 22.5, 0], ['Bu Rina', 'R', C.blue, 'Aman', 23.0, 0], ['Dika', 'D', '#12A594', 'Aman', 23.5, 0], ['Pak Darto', 'PD', '#7C5CFF', 'Luka · ditolong', 24.0, 1]];
    ROLL.forEach(([n, ini, c, st, tt, bad], i) => {
      const r = W(`<div class="row" style="position:absolute;left:20px;right:20px;top:${318 + i * 96}px;height:82px;padding:0 14px;border-radius:22px;background:#fff;box-shadow:0 1px 0 ${C.line};gap:14px">
        ${avatar(ini, c, 52)}<div style="flex:1;font:600 24px/1 ${IN};color:${C.ink}">${n}</div>
        <div style="position:relative;height:44px;width:${bad ? 176 : 98}px;flex:none">
          <div class="p1 row" style="position:absolute;right:0;top:0;height:44px;padding:0 14px;border-radius:999px;background:#EEF1F6;font:500 18px/1 ${IN};color:${C.muted}">menunggu…</div>
          <div class="p2 row" style="position:absolute;right:0;top:0;height:44px;padding:0 16px;gap:6px;border-radius:999px;background:${bad ? C.coralT : C.blueT};font:600 19px/1 ${IN};color:${bad ? '#E5484D' : C.blue};white-space:nowrap">${bad ? '' : ico('check', 18)}${st}</div></div></div>`, S5);
      const p1 = r.querySelector('.p1'), p2 = r.querySelector('.p2');
      cue(tt, bad ? 'slam' : 'check', bad ? { n: 4 } : {});
      draws.push((t) => {
        applyVis(r, vis(t, 21.6 + i * 0.06, null));
        applyVis(p1, vis(t, 22.1, tt - 0.06, 0.06));
        applyVis(p2, vis(t, tt, null), `scale(${popS(t, tt, 0.6).toFixed(4)})`);
      });
    });
    const rollBtn = W(`<div class="row" style="position:absolute;left:24px;right:24px;top:${PH - 112}px;height:80px;border-radius:999px;justify-content:center;font:600 26px/1 ${IN}"><span class="r1">Mulai absen</span></div>`, S5);
    const T_ROLL = 22.0;
    cue(T_ROLL, 'click'); cue(24.5, 'pop');
    const RBC = new ColorTrack(C.blue).to(T_ROLL + 0.1, '#E7EBF3', { w: 26, z: 1 });
    draws.push((t) => {
      rollBtn.style.background = RBC.at(t);
      rollBtn.style.color = t < T_ROLL + 0.12 ? '#fff' : C.muted;
      rollBtn.firstElementChild.textContent = t < T_ROLL + 0.12 ? 'Mulai absen' : (t < 24.0 ? 'Menunggu jawaban…' : '4 dari 4 menjawab');
      rollBtn.style.transform = `scale(${press(t, T_ROLL).toFixed(4)})`;
      applyVis(pinB, vis(t, 24.5, null), `scale(${popS(t, 24.5, 0.8).toFixed(4)})`);
    });

    // ───────────────────────── Facts: the shape becomes a pill again ─────────────────────────
    const FACTS = [
      [25.0, '0 server', '#FFFFFF', C.ink],
      [25.5, '0 akun', C.blue, '#fff'],
      [26.0, 'Cuma ±550 KB', C.panel2, '#fff'],
      [26.5, 'Terenkripsi, ponsel ke ponsel', '#FFFFFF', C.ink],
      [27.0, '4.000+ unduhan di minggu pertama', C.blue, '#fff'],
    ];
    const FH = 180, FS = 78;
    FACTS.forEach(([tt, txt, bg, fg], i) => {
      const w = measure(txt, `600 ${FS}px Outfit`) + 150;
      H(tt - 0.08, 960, 560, w, FH, FH / 2, { w: 24, z: 0.8 });
      HC.to(tt - 0.08, bg, { w: 40, z: 1 });
      const e = W(`<div class="o" style="font:600 ${FS}px/1 ${OF};color:${fg};white-space:nowrap;letter-spacing:-.015em">${txt}</div>`);
      at(e, 960 - (w - 150) / 2, 560 - FS * 0.52);
      show(e, tt + 0.02, i < FACTS.length - 1 ? FACTS[i + 1][0] - 0.1 : 27.35, '', 0.07);
      cue(tt, 'slam', { n: 5 + i });
    });
    const kick = W(`<div style="font:600 26px/1 ${IN};letter-spacing:.18em;color:${C.soft};white-space:nowrap">SALING JAGA, SEJAUH INI</div>`);
    at(kick, 960 - kick.offsetWidth / 2, 400);
    show(kick, 25.0, 27.35);

    // ───────────────────────── Logo: the pill becomes the "c", the "o" bonds ─────────────────────────
    const _ctx = document.createElement('canvas').getContext('2d');
    const R = 78;
    const fsz = (() => { _ctx.font = `500 200px Outfit`; const m = _ctx.measureText('x'); return 200 * (2 * R) / m.actualBoundingBoxAscent; })();
    const LET = 'vatom';
    _ctx.font = `500 ${fsz}px Outfit`;
    const letX = []; for (let i = 0; i < LET.length; i++) letX.push(_ctx.measureText(LET.slice(0, i)).width);
    const wordW = _ctx.measureText(LET).width;
    const markW = (2 + D) * R, sp = 0.2 * R;
    const totalW = markW + sp + wordW;
    const lockL = 960 - totalW / 2;                // final left edge of the mark
    const cenL = 960 - markW / 2;                  // mark alone, centred
    const LY = 520;                                // ring centre y
    const logo = W(`<div style="width:0;height:0"></div>`);
    at(logo, 0, 0);
    const mk = W(`<div style="position:absolute">${markSVG(R, '#fff')}</div>`, logo);
    const og = mk.querySelector('.og'), lens = mk.querySelector('.lens'), mcut = mk.querySelector('.mcut'), cring = mk.querySelector('.cring');
    const letters = LET.split('').map((ch, i) => {
      const e = W(`<div class="o" style="position:absolute;font:500 ${fsz.toFixed(2)}px/1 ${OF};color:#fff;white-space:pre">${ch}</div>`, logo);
      return e;
    });
    // align letters' baseline to ring bottom: measure DOM baseline offset
    const probe = W(`<div class="o" style="position:absolute;font:500 ${fsz.toFixed(2)}px/1 ${OF};white-space:pre;visibility:hidden">v<span style="display:inline-block;width:1px;height:0;vertical-align:baseline"></span></div>`, logo);
    const baseOff = probe.lastElementChild.offsetTop;  // distance from box top to baseline
    probe.remove();
    const tag = W(`<div class="o" style="font:400 40px/1 ${OF};letter-spacing:.12em;color:${C.soft};white-space:nowrap">Every node, bonded.</div>`);
    const was = W(`<div style="font:500 30px/1 ${IN};color:#fff;white-space:nowrap">Dulu <b style="font-weight:600">Saling Jaga</b>. Kini <b style="font-weight:600;color:${C.blue === '#1F7BFF' ? '#5CA0FF' : C.blue}">covatom</b>.</div>`);
    const cta = W(`<div class="row" style="height:84px;padding:0 44px;border-radius:999px;background:${C.blue};font:600 34px/1 ${IN};color:#fff;gap:14px;white-space:nowrap">Chat, telepon &amp; SOS tanpa sinyal</div>`);
    const url = W(`<div style="font:500 28px/1 ${IN};color:${C.soft};white-space:nowrap;letter-spacing:.02em">saling-jaga.com</div>`);
    at(tag, lockL, LY + R + 44);
    at(was, 960 - was.offsetWidth / 2, 770);
    at(cta, 960 - cta.offsetWidth / 2, 830);
    at(url, 960 - url.offsetWidth / 2, 945);

    // hero → the c ring position (mark centred)
    H(27.3, cenL + R, LY, 2 * R, 2 * R, R, { w: 22, z: 0.82 });
    HC.to(27.3, '#FFFFFF', { w: 30, z: 1 });
    cue(27.5, 'whoosh', { v: 0.7 });
    const T_SWAP = 27.62, T_O = 27.75, T_BOND = 28.25, T_LOCK = 28.75;
    const OX = new Track(7).to(T_O, 0, { w: 13, z: 0.86 });
    const MX = new Track(cenL).to(T_LOCK - 0.1, lockL, { w: 14, z: 0.9 });
    cue(T_O, 'whoosh', { v: 0.6 }); cue(T_BOND - 0.02, 'drop'); cue(T_BOND, 'shimmer');
    LET.split('').forEach((_, i) => cue(T_LOCK + i * 0.125, 'key'));
    cue(29.5, 'swap', { n: 5 }); cue(30.0, 'pop'); cue(30.5, 'cta'); cue(31.0, 'tick'); cue(31.5, 'settle');
    draws.push((t) => {
      const on = t >= T_SWAP;
      logo.style.visibility = on ? 'visible' : 'hidden';
      if (!on) return;
      const mx = MX.at(t);
      at(mk, mx, LY - R);
      const ox = OX.at(t);
      og.setAttribute('transform', `translate(${ox.toFixed(4)},0)`);
      mcut.setAttribute('cx', (D + ox).toFixed(4));
      const bond = stepR(t - T_BOND, { w: 30, z: 1 });
      lens.setAttribute('opacity', bond.toFixed(3));
      og.style.opacity = clamp((t - T_O) / 0.12).toFixed(3);
      cring.style.opacity = '1';
      mk.style.transform = `scale(${bump(t, T_BOND, 0.05, 0.1).toFixed(4)})`;
      mk.style.transformOrigin = `${R}px ${R}px`;
      letters.forEach((e, i) => {
        const tt = T_LOCK + i * 0.125;
        at(e, mx + markW + sp + letX[i], LY + R - baseOff);
        applyVis(e, vis(t, tt, null));
      });
    });
    draws.push((t) => {
      // hero hides once the svg mark has taken over
      const hv = t < T_SWAP ? 1 : clamp(1 - (t - T_SWAP) / 0.08);
      hero.style.opacity = hv.toFixed(3);
      hero.style.visibility = hv > 0.001 ? 'visible' : 'hidden';
      at(tag, MX.at(t), LY + R + 44);
    });
    show(tag, 29.5, null);
    show(was, 30.0, null);
    show(cta, 30.5, null, (t) => `scale(${popS(t, 30.5, 0.7).toFixed(4)})`);
    show(url, 31.0, null);

    // hero draw (after all H() calls)
    draws.unshift((t) => {
      const w = HW.at(t), h = HH.at(t), r = HRr.at(t);
      rect(hero, HX.at(t) - w / 2, HY.at(t) - h / 2, w, h);
      hero.style.borderRadius = Math.max(0, Math.min(r, w / 2, h / 2)).toFixed(2) + 'px';
      hero.style.background = HC.at(t);
      let s = popS(t, 0.25, 0.5) * bump(t, 1.0, 0.05, 0.08);
      for (const [tt] of FACTS) s *= bump(t, tt + 0.03, 0.035, 0.07);
      s *= bump(t, 17.02, 0.03, 0.08);
      hero.style.transform = `scale(${s.toFixed(4)})`;
    });

    // order: mesh behind, hero, screens, packet, logo, then cursor on top
    world.appendChild(pkt);

    // ───────────────────────── Cursor (“Kamu”) ─────────────────────────
    const cur = W(`<div style="width:0;height:0">
      <svg viewBox="0 0 24 24" style="position:absolute;left:-6px;top:-4px;width:52px;height:52px;filter:drop-shadow(0 6px 10px rgba(0,0,0,.35))"><path d="M4 2.5 19.5 12l-6.6 1.6L9.2 20z" fill="#fff" stroke="${C.ink}" stroke-width="1.4" stroke-linejoin="round"/></svg>
      <div class="pill" style="position:absolute;left:36px;top:44px;font:600 22px/1 ${IN};padding:9px 16px;border-radius:999px;background:${C.blue};color:#fff;white-space:nowrap">Kamu</div></div>`);
    const rip = W(`<div style="width:100px;height:100px;border-radius:50px;border:4px solid ${C.blue}"></div>`);
    const pill = cur.querySelector('.pill');
    const CX = new Track(1720), CY = new Track(1000);
    const mv = (t, x, y, s = SP.cursor) => { CX.to(t, x, s); CY.to(t, y, s); };
    const ajakX = PL + PW - 20 - 14 - 46;
    mv(5.9, ajakX, PT + 500 + 44);
    mv(6.9, ajakX, PT + 604 + 44);
    mv(8.4, PL + 150, PT + PH - 70);
    mv(10.45, PL + PW - 54, PT + PH - 70);
    mv(11.3, 1700, 980, { w: 6, z: 1 });
    mv(16.9, 1720, 1000, SP.snap);
    mv(17.35, PX + 40, PT + PH - 106);
    mv(18.3, 1700, 990, { w: 6, z: 1 });
    mv(20.9, 1720, 1000, SP.snap);
    mv(21.4, PX + 30, PT + PH - 72);
    mv(22.35, 1720, 1000, { w: 6, z: 1 });
    const CLICKS = [...AJAK, T_FOCUS, T_SEND, T_GO, T_ROLL];
    const curOn = (t) => Math.min(clamp((t - 5.75) / 0.2), clamp((12.6 - t) / 0.3))
      + Math.min(clamp((t - 17.2) / 0.2), clamp((18.8 - t) / 0.3))
      + Math.min(clamp((t - 21.2) / 0.2), clamp((22.8 - t) / 0.3));
    draws.push((t) => {
      const o = clamp(curOn(t));
      if (o <= 0.001) { cur.style.visibility = 'hidden'; rip.style.visibility = 'hidden'; return; }
      cur.style.visibility = 'visible';
      const x = CX.at(t), y = CY.at(t);
      const vx = (CX.at(t + 0.01) - CX.at(t - 0.01)) / 0.02;
      at(cur, x, y);
      let s = 1; for (const tc of CLICKS) s *= press(t, tc);
      cur.style.opacity = o.toFixed(3);
      cur.style.transform = `rotate(${clamp(-vx * 0.0045, -14, 14).toFixed(2)}deg) scale(${s.toFixed(4)})`;
      pill.style.transform = `translateX(${clamp(-vx * 0.012, -26, 26).toFixed(2)}px)`;
      let rp = null; for (const tc of CLICKS) { const r = ripple(t, tc); if (r) rp = r; }
      if (rp) { rip.style.visibility = 'visible'; at(rip, x - 50, y - 50); rip.style.opacity = (rp.o * o).toFixed(3); rip.style.transform = `scale(${rp.s.toFixed(3)})`; }
      else rip.style.visibility = 'hidden';
    });

    const END = 32.0;
    window.seek = (t) => { for (const d of draws) d(t); };
    window.FILM = {
      width: 1920, height: 1080, bpm: 120, duration: END,
      sections: { intro: [0, 4], build: [13.5, 16], drop: [16, 18], outro: [27.5, END] },
      cues: cues.sort((a, b) => a.t - b.t),
    };
    window.seek(0);
    window.READY = true;
  } catch (err) {
    console.error(err);
    window.FILM_ERROR = String(err && err.stack || err);
  }
})();
