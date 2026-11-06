// Saling Jaga · "Satu malam, tanpa sinyal". Portrait 1080×1920, 120 BPM, 32 s.
// One shape, never cut: the signal pill → search button → nearby-devices card → group card →
// push-to-talk button → chat card → SOS card (the drop) → compass → range bar → logo disc.
(async function () {
  try {
    const { clamp, lerp, stepR, Track, ColorTrack, SP, vis, applyVis, press, ripple, outQ } = M;
    const C = { night: '#07110c', card: '#0f1f17', card2: '#13271d', cream: '#f2edd5', paper: '#f6f4ea', muted: '#a5b0a2',
      ink: '#04140a', text: '#1c2a21', grey: '#6b7469', leaf: '#3cbf6e', moss: '#1b4d2e', appg: '#1f7a45', lamp: '#f2c46b',
      amber: '#d98a12', annBg: '#fdf0d6', annInk: '#8a5300', sos: '#ef4b4b', budi: '#e8590c', sari: '#d6336c', rt: '#1e7a45', you: '#5fa30f' };

    await Promise.all([
      document.fonts.load('800 88px "Plus Jakarta Sans"'), document.fonts.load('500 40px "Plus Jakarta Sans"'),
      document.fonts.load('700 40px "Plus Jakarta Sans"'), document.fonts.load('600 34px "JetBrains Mono"'),
      document.fonts.load('800 34px "JetBrains Mono"'), document.fonts.load('italic 400 90px "Instrument Serif"'),
    ].map((p) => p.catch(() => null)));
    await document.fonts.ready;
    const logo = new Image(); logo.src = 'assets/mark.png';
    await new Promise((r) => { if (logo.complete) r(); logo.onload = r; logo.onerror = r; });

    const cues = [];
    const cue = (t, k, o = {}) => cues.push({ t, k, ...o });
    const hero = document.getElementById('hero');
    const hud = document.getElementById('hud');
    const fx = document.getElementById('fx');
    const draws = [];
    const add = (html, parent = hud) => { const d = document.createElement('div'); d.innerHTML = html.trim(); const e = d.firstElementChild; parent.appendChild(e); return e; };
    const at = (e, x, y) => { e.style.left = x + 'px'; e.style.top = y + 'px'; return e; };
    const show = (e, tin, tout, extra = '') => draws.push((t) => applyVis(e, vis(t, tin, tout), typeof extra === 'function' ? extra(t) : extra));
    const popS = (t, tin, s0 = 0.4) => s0 + (1 - s0) * stepR(t - tin, SP.pop);
    const P = (d, sw = 2.4) => `<svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
    const I = {
      search: P('<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>', 2.6),
      check: P('<path d="M20 6 9 17l-5-5"/>', 3.2),
      radio: P('<rect x="6" y="8" width="12" height="14" rx="2.5"/><path d="M9 8V2.5"/><path d="M9.5 12.5h5M9.5 15.5h5M9.5 18.5h5"/>', 2.2),
      flag: P('<path d="M5 22V3.5"/><path d="M5 4h12l-2.5 4L17 12H5"/>', 2.6),
      arrow: P('<path d="M12 20V4"/><path d="m5 11 7-7 7 7"/>', 2.8),
      x: P('<path d="M18 6 6 18M6 6l12 12"/>', 3),
      dl: P('<path d="M12 3v12"/><path d="m6.5 10 5.5 5.5 5.5-5.5"/><path d="M4 20h16"/>', 2.6),
      bat: P('<rect x="2.5" y="7" width="17" height="10" rx="2"/><path d="M21.5 10.5v3"/><path d="M5.5 10v4"/>', 2.2),
    };
    const ease = (x) => outQ(clamp(x));

    // ───────────────────────── Hero shape: four edges, radius, colour ─────────────────────────
    const L = new Track(540 - 180), R = new Track(540 + 180), T = new Track(1180 - 75), B = new Track(1180 + 75);
    const RAD = new Track(75), COL = new ColorTrack(C.card2), BOR = new Track(1);
    const morph = (t, cx, cy, w, h, r, col, o = {}) => {
      const sp = o.sp || SP.shape, spL = o.spL || sp, spR = o.spR || sp;
      L.to(t, cx - w / 2, spL); R.to(t, cx + w / 2, spR); T.to(t, cy - h / 2, sp); B.to(t, cy + h / 2, sp);
      RAD.to(t, r, sp); COL.to(t, col, o.csp || SP.soft); BOR.to(t, o.border ?? 0, SP.soft);
    };
    // hero squash on presses
    const pressAt = []; // [t, depth]
    let holdWin = null;
    const heroScale = (t) => {
      let s = popS(t, 0.0, 0.2);
      for (const [tc, d] of pressAt) s *= 1 - d * Math.exp(-(((t - tc) / 0.07) ** 2));
      if (holdWin) { const [a, b] = holdWin; s *= 1 - 0.06 * stepR(t - a, SP.pop) + 0.06 * stepR(t - b, SP.pop); }
      return s;
    };
    // shakes on alarms
    const shakes = [];
    const shake = (t) => { let x = 0; for (const ts of shakes) { const d = t - ts; if (d > 0 && d < 0.5) x += 14 * Math.exp(-d * 9) * Math.sin(d * 70); } return x; };

    // content layers inside the hero (centred)
    const layer = (html, w, h, tin, tout, extra) => {
      const e = add(`<div class="ly" style="width:${w}px;height:${h}px;margin-left:${-w / 2}px;margin-top:${-h / 2}px">${html}</div>`, hero);
      show(e, tin, tout, extra);
      return e;
    };
    const sub = (parent, html) => add(html, parent);

    // ───────────────────────── Headlines ─────────────────────────
    const head = (tin, tout, time, h, s, n) => {
      const tl = at(add(`<div class="time">${time}</div>`), 70, 180); show(tl, tin, tout);
      const hd = at(add(`<div class="head">${h}</div>`), 70, 246); show(hd, tin + 0.125, tout);
      if (s) { const sb = at(add(`<div class="sub">${s}</div>`), 70, 0); sb.dataset.s = 1; show(sb, tin + 0.5, tout); draws.push(() => { sb.style.top = (hd.offsetTop + hd.offsetHeight + 26) + 'px'; }); }
      cue(tin, 'swap', { n });
    };
    head(0.0, 2.375, '17:58', 'Listrik <span class="serif">padam.</span>', null, 0);
    head(2.5, 3.375, '17:58', 'Sinyal <span class="serif">ikut hilang.</span>', 'Grup chat sepi. HP masih menyala.', 1);
    head(3.5, 7.875, '17:58', 'Buka Saling Jaga, <span class="serif">ketuk cari.</span>', 'HP tetangga muncul, langsung lewat Wi‑Fi Direct.', 2);
    head(8.0, 9.875, '17:59', 'Satu grup, <span class="serif">tanpa server.</span>', 'Tanpa internet, pulsa, atau BTS.', 3);
    head(10.0, 11.875, '18:01', 'Budi tahan tombol, <span class="serif">semua mendengar.</span>', null, 4);
    head(12.0, 15.875, '18:02', 'Pak RT memindahkan <span class="serif">titik kumpul.</span>', null, 5);
    head(16.0, 19.875, '18:04', 'Sari mengirim <span class="serif" style="color:#ef4b4b">SOS.</span>', 'Alarm berbunyi di semua HP.', 6);
    head(20.0, 23.875, '18:20', 'Yang belum tiba, <span class="serif">kelihatan.</span>', null, 7);
    head(24.0, 27.75, 'Jangkauan', 'Dari satu gang <span class="serif">sampai satu lembah.</span>', null, 8);

    // ───────────────────────── Background lights ─────────────────────────
    const lamp = document.getElementById('lamp'), red = document.getElementById('red');
    const LAMP = new Track(0).to(0.0, 1, SP.text).to(1.0, 0, { w: 40, z: 1 });
    const RED = new Track(0).to(16.0, 1, { w: 30, z: 1 }).to(20.0, 0, SP.cam);
    draws.push((t) => {
      lamp.style.opacity = clamp(LAMP.at(t)).toFixed(3);
      // alarm pulse each beat during SOS
      let pulse = 0; for (let k = 0; k < 8; k++) { const d = t - (16 + k * 0.5); if (d >= 0) pulse += Math.exp(-d * 5) * 0.5; }
      red.style.opacity = clamp(RED.at(t) * (0.55 + pulse)).toFixed(3);
    });
    cue(0.0, 'born'); cue(1.0, 'slam', { n: 0 });

    // ───────────────────────── S1 · 0–3.5 signal pill ─────────────────────────
    morph(0.0, 540, 1180, 400, 170, 85, C.card2, { border: 1 });
    const sig = layer(`<div style="display:flex;align-items:flex-end;gap:16px;position:absolute;left:62px;bottom:46px">
        ${[34, 52, 70, 88].map((h) => `<i style="display:block;width:20px;height:${h}px;border-radius:6px;background:#3cbf6e;transform-origin:50% 100%"></i>`).join('')}
      </div>`, 400, 170, 0.0, 3.5);
    const bars = [...sig.querySelectorAll('i')];
    const sigLbl = sub(sig, `<div class="mono" style="position:absolute;right:56px;top:50%;margin-top:-24px;font:800 48px/48px 'JetBrains Mono';color:#f2edd5">4G</div>`);
    const sigLbl2 = sub(sig, `<div class="mono" style="position:absolute;right:46px;top:50%;margin-top:-24px;font:800 46px/48px 'JetBrains Mono';color:#ef4b4b;display:flex;gap:10px;align-items:center"><i style="width:40px;height:40px;display:inline-flex">${I.x}</i>0 bar</div>`);
    const BT = [1.5, 1.75, 2.0, 2.25].reverse();
    draws.push((t) => {
      bars.forEach((b, i) => {
        const d = stepR(t - BT[i], SP.pop);
        b.style.transform = `scaleY(${lerp(1, 0.18, d).toFixed(3)})`;
        b.style.background = M.mix(C.leaf, '#3b4a40', clamp(d));
      });
      applyVis(sigLbl, vis(t, -1, 2.375));
      applyVis(sigLbl2, vis(t, 2.5, null));
    });
    BT.forEach((b) => cue(b, 'tick'));
    cue(2.5, 'alert');

    // ───────────────────────── Cursor ─────────────────────────
    const CU = { x: new Track(1180), y: new Track(1800) };
    const curTo = (t, x, y, sp = SP.cursor) => { CU.x.to(t, x, sp); CU.y.to(t, y, sp); };
    const cur = add(`<div class="cur"><svg viewBox="0 0 24 24"><path d="M4 2.5 20 11l-7 2-3.2 7z" fill="#f2edd5" stroke="#04140a" stroke-width="1.6" stroke-linejoin="round"/></svg><div class="pill"></div></div>`);
    const pill = cur.querySelector('.pill');
    const rip = add('<div class="rip"></div>');
    const clicks = [];
    const curWins = []; // [tin,tout,name,bg,fg]
    const holds = [];
    draws.push((t) => {
      const x = CU.x.at(t), y = CU.y.at(t);
      const vx = (x - CU.x.at(t - 0.02)) / 0.02;
      let s = 1; for (const tc of clicks) s *= press(t, tc);
      for (const [a, b] of holds) if (t >= a - 0.05 && t <= b + 0.1) s *= 1 - 0.14 * stepR(t - a, SP.pop) + 0.14 * stepR(t - b, SP.pop);
      const w = curWins.find((c) => t >= c[0] - 0.01 && t < c[1] + 0.2);
      if (!w) { cur.style.visibility = 'hidden'; } else {
        const v = vis(t, w[0], w[1]);
        cur.style.visibility = v.gone ? 'hidden' : 'visible'; cur.style.opacity = v.o.toFixed(3);
        pill.textContent = w[2]; pill.style.background = w[3]; pill.style.color = w[4];
        const lean = clamp(-vx * 0.004, -14, 14);
        cur.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) rotate(${lean.toFixed(2)}deg) scale(${s.toFixed(3)})`;
        pill.style.transform = `translateX(${clamp(-vx * 0.01, -30, 30).toFixed(1)}px)`;
      }
      const c = clicks.slice().reverse().find((tc) => t >= tc && t < tc + 0.4);
      const r = c != null ? ripple(t, c) : null;
      if (!r) rip.style.visibility = 'hidden';
      else { rip.style.visibility = 'visible'; rip.style.opacity = r.o.toFixed(3); rip.style.transform = `translate(${CU.x.at(c)}px,${CU.y.at(c)}px) scale(${r.s.toFixed(3)})`; }
    });
    const click = (tc, depth = 0.06) => { clicks.push(tc); pressAt.push([tc, depth]); cue(tc, 'click'); };

    // ───────────────────────── S2 · 3.5–8 search → nearby devices ─────────────────────────
    morph(3.5, 540, 1180, 260, 260, 130, C.leaf);
    const srch = layer(`<div style="width:120px;height:120px;color:#04140a;position:absolute;left:70px;top:70px">${I.search}</div>`, 260, 260, 3.75, 5.375);
    cue(3.5, 'whoosh', { v: 0.5 }); cue(3.75, 'pop');
    curWins.push([3.75, 8.0, 'Kamu', C.cream, C.ink]);
    curTo(3.75, 1000, 1600); curTo(4.5, 590, 1220);
    click(5.0);
    // radar rings from the button
    for (let k = 0; k < 3; k++) {
      const rg = add('<div class="ring" style="width:260px;height:260px;margin:-130px 0 0 -130px;border:5px solid #3cbf6e"></div>', fx);
      const t0 = 5.0 + k * 0.25;
      draws.push((t) => {
        const d = (t - t0) / 1.0;
        if (d < 0 || d > 1) { rg.style.visibility = 'hidden'; return; }
        rg.style.visibility = 'visible'; rg.style.opacity = (0.7 * (1 - d)).toFixed(3);
        rg.style.transform = `translate(540px,1180px) scale(${lerp(1, 3.6, outQ(d)).toFixed(3)})`;
      });
    }
    cue(5.25, 'shimmer');
    morph(5.5, 540, 1160, 940, 720, 48, C.paper);
    cue(5.5, 'whoosh', { v: 0.6 });
    const dev = layer(`<div style="position:absolute;left:56px;top:50px">
        <div style="font:800 52px/1.1 'Plus Jakarta Sans';color:#1c2a21;letter-spacing:-.02em">Perangkat sekitar</div>
        <div style="font:500 34px/1.3 'Plus Jakarta Sans';color:#6b7469;margin-top:8px">Ketuk untuk menghubungkan</div></div>
      <div style="position:absolute;right:50px;top:50px;width:110px;height:110px;border-radius:50%;background:#dff0e4;color:#1f7a45;padding:28px;box-sizing:border-box">${I.search}</div>`, 940, 720, 5.625, 7.875);
    const rows = [['G', 'Galaxy A15 Budi', 'Tersedia', '#d6336c'], ['R', 'Redmi Note 13', 'Tersedia', '#d6336c'], ['O', 'Oppo A78', 'Menunggu diterima', '#e8590c']];
    const rowEls = rows.map((r, i) => {
      const e = sub(dev, `<div style="position:absolute;left:56px;right:50px;top:${226 + i * 160}px;height:120px;display:flex;align-items:center;gap:30px">
        <div class="av" style="width:104px;height:104px;background:${r[3]};font-size:44px">${r[0]}</div>
        <div style="flex:1"><div style="font:700 42px/1.15 'Plus Jakarta Sans';color:#1c2a21">${r[1]}</div><div style="font:500 32px/1.3 'Plus Jakarta Sans';color:#6b7469">${r[2]}</div></div>
        <div class="act" style="font:800 36px/1 'Plus Jakarta Sans';color:#1f7a45;position:relative;width:220px;height:50px;text-align:right">
          <span style="position:absolute;right:0;top:6px">Hubungkan</span>
          ${i === 0 ? `<span style="position:absolute;right:0;top:0;display:flex;gap:10px;align-items:center;height:50px;padding:0 20px;border-radius:999px;background:#1f7a45;color:#fff;font-size:32px"><i style="width:32px;height:32px;display:inline-flex">${I.check}</i>Terhubung</span>` : ''}
        </div></div>`);
      const tin = 6.0 + i * 0.5;
      draws.push((t) => { const v = vis(t, tin, null); applyVis(e, v, `scale(${popS(t, tin, 0.85).toFixed(3)})`); });
      cue(tin, 'pop');
      return e;
    });
    {
      const a = rowEls[0].querySelector('.act').children;
      draws.push((t) => { applyVis(a[0], vis(t, -1, 7.5, 0.08)); applyVis(a[1], vis(t, 7.5, null), `scale(${popS(t, 7.5, 0.6).toFixed(3)})`); });
    }
    curTo(5.375, 760, 1500); curTo(7.0, 860, 1072);
    click(7.5, 0.02); cue(7.5, 'check');

    // ───────────────────────── S3 · 8–10 group card ─────────────────────────
    morph(8.0, 540, 1160, 940, 420, 48, C.moss);
    curTo(8.0, 1180, 1300, SP.soft);
    cue(8.0, 'whoosh', { v: 0.5 });
    const grp = layer(`<div style="position:absolute;left:56px;top:52px">
        <div style="font:800 58px/1.1 'Plus Jakarta Sans';color:#fff;letter-spacing:-.02em">Grup · <span class="cnt">1</span> orang</div></div>`, 940, 420, 8.0, 9.875);
    const cntEl = grp.querySelector('.cnt');
    const members = [['C', C.you, 'Kamu', 8.0], ['B', C.budi, 'Budi', 8.5], ['S', C.sari, 'Sari', 9.0], ['P', C.rt, 'Pak RT', 9.5]];
    members.forEach((m, i) => {
      const e = sub(grp, `<div style="position:absolute;left:${56 + i * 214}px;top:178px;width:180px;display:flex;flex-direction:column;align-items:center;gap:14px">
        <div class="av" style="width:128px;height:128px;background:${m[1]};font-size:54px;box-shadow:0 0 0 6px #1b4d2e">${m[0]}</div>
        <div style="font:700 32px/1 'Plus Jakarta Sans';color:#d7e4d6">${m[2]}</div></div>`);
      draws.push((t) => applyVis(e, vis(t, m[3] + 0.125, null), `scale(${popS(t, m[3] + 0.125, 0.3).toFixed(3)})`));
      if (i) cue(m[3], 'born');
    });
    draws.push((t) => { cntEl.textContent = t < 8.5 ? 1 : t < 9.0 ? 2 : t < 9.5 ? 3 : 4; });

    // ───────────────────────── S4 · 10–12 push to talk ─────────────────────────
    morph(10.0, 540, 1200, 400, 400, 200, C.appg);
    cue(10.0, 'whoosh', { v: 0.5 });
    const ptt = layer(`<div style="position:absolute;left:110px;top:100px;width:180px;height:180px;color:#fff">${I.radio}</div>`, 400, 400, 10.0, 11.875);
    curWins.push([9.75, 12.25, 'Budi', C.budi, '#fff']);
    CU.x.to(9.5, 1180, SP.snap); CU.y.to(9.5, 1520, SP.snap);
    curTo(9.75, 600, 1240);
    holds.push([10.5, 12.0]); holdWin = [10.5, 12.0];
    cue(10.5, 'drag', { d: 1.5 }); cue(12.0, 'release');
    clicks.push(10.5);
    const talk = at(add(`<div style="display:flex;align-items:center;gap:22px;height:110px;padding:0 40px 0 18px;border-radius:999px;background:#1f7a45;font:700 40px/1 'Plus Jakarta Sans';color:#fff;white-space:nowrap">
      <div class="av" style="width:80px;height:80px;background:#e8590c;font-size:38px">B</div>Budi sedang bicara</div>`), 0, 790);
    draws.push((t) => { talk.style.left = (540 - talk.offsetWidth / 2) + 'px'; });
    show(talk, 10.5, 11.875);
    cue(10.5, 'toggle');
    // sound waves from the button + waveform under it
    for (let k = 0; k < 3; k++) {
      const rg = add('<div class="ring" style="width:400px;height:400px;margin:-200px 0 0 -200px;border:4px solid #3cbf6e"></div>', fx);
      draws.push((t) => {
        let o = 0, s = 1;
        if (t > 10.5 && t < 12.2) { const d = ((t - 10.5 + k * 0.33) % 1.0); o = 0.55 * (1 - d) * clamp((12.0 - t) / 0.2 + 0.0) * clamp((t - 10.5) / 0.15); s = lerp(1, 1.9, outQ(d)); }
        rg.style.visibility = o > 0.005 ? 'visible' : 'hidden';
        rg.style.opacity = o.toFixed(3); rg.style.transform = `translate(540px,1200px) scale(${s.toFixed(3)})`;
      });
    }
    const wave = at(add(`<div style="display:flex;gap:12px;align-items:center;height:140px">${Array.from({ length: 15 }, () => '<i style="display:block;width:14px;height:140px;border-radius:7px;background:#3cbf6e"></i>').join('')}</div>`), 540 - (15 * 26 - 12) / 2, 1500);
    const wbars = [...wave.children];
    show(wave, 10.5, 11.875);
    draws.push((t) => wbars.forEach((b, i) => {
      const a = 0.25 + 0.75 * Math.abs(Math.sin(t * 9.1 + i * 0.9) * Math.sin(t * 3.7 + i * 0.45)) * (1 - Math.abs(i - 7) / 9);
      b.style.transform = `scaleY(${a.toFixed(3)})`;
    }));
    cue(11.0, 'note', { n: 2 }); cue(11.5, 'note', { n: 4 });

    // ───────────────────────── S5 · 12–16 chat + meeting point ─────────────────────────
    morph(12.0, 540, 1180, 940, 1060, 48, C.paper);
    cue(12.0, 'whoosh', { v: 0.6 });
    const chat = layer('', 940, 1060, 12.0, 15.875, '');
    const bubble = (html, top, tin, n) => {
      const e = sub(chat, html); e.style.top = top + 'px';
      draws.push((t) => applyVis(e, vis(t, tin, null), `scale(${popS(t, tin, 0.8).toFixed(3)})`));
      cue(tin, n == null ? 'pop' : 'note', n == null ? {} : { n });
      return e;
    };
    bubble(`<div style="position:absolute;left:40px;width:640px;padding:30px 36px;border-radius:36px;background:#fff;box-shadow:0 0 0 2px #e6e4d8;transform-origin:0 50%">
      <div style="font:700 30px/1 'Plus Jakarta Sans';color:#e8590c;margin-bottom:12px">Budi</div>
      <div style="font:500 38px/1.3 'Plus Jakarta Sans';color:#1c2a21">Aku sudah di masjid, aman.</div></div>`, 40, 12.5);
    bubble(`<div style="position:absolute;left:40px;right:40px;padding:32px 36px;border-radius:36px;background:#fdf0d6;transform-origin:50% 50%">
      <div style="font:700 28px/1 'Plus Jakarta Sans';color:#8a5300;letter-spacing:.04em;margin-bottom:14px">PENGUMUMAN · Pak RT</div>
      <div style="font:800 42px/1.2 'Plus Jakarta Sans';color:#1c2a21">Titik kumpul pindah. Bawa obat dan air minum.</div></div>`, 250, 13.0, 3);
    const pos = bubble(`<div style="position:absolute;left:40px;right:40px;padding:32px 36px;border-radius:36px;background:#fdf0d6;box-shadow:0 0 0 4px #d98a12;display:flex;gap:28px;align-items:center">
      <div class="av" style="width:110px;height:110px;background:#d98a12;padding:26px;box-sizing:border-box">${I.flag}</div>
      <div><div style="font:700 28px/1 'Plus Jakarta Sans';color:#8a5300;letter-spacing:.04em">TITIK KUMPUL</div>
      <div style="font:800 56px/1.1 'Plus Jakarta Sans';color:#1c2a21;margin-top:8px">Pos 3</div>
      <div style="font:600 34px/1.2 'Plus Jakarta Sans';color:#8a5300;margin-top:6px">250 m ke arah timur laut</div></div></div>`, 530, 14.0, 5);
    bubble(`<div style="position:absolute;left:40px;width:720px;padding:30px 36px;border-radius:36px;background:#fff;box-shadow:0 0 0 2px #e6e4d8;transform-origin:0 50%">
      <div style="font:700 30px/1 'Plus Jakarta Sans';color:#d6336c;margin-bottom:12px">Sari</div>
      <div style="font:500 38px/1.3 'Plus Jakarta Sans';color:#1c2a21">Kakiku terkilir, ada yang bisa jemput?</div></div>`, 800, 15.0);
    cue(14.5, 'riser', { d: 1.5 });

    // ───────────────────────── S6 · 16–20 SOS (the drop) ─────────────────────────
    morph(15.875, 540, 1190, 960, 1140, 64, C.sos, { sp: { w: 22, z: 0.75 }, csp: { w: 60, z: 1 } });
    cue(16.0, 'drop'); cue(16.0, 'slam', { n: 1 });
    for (let k = 0; k < 8; k++) { shakes.push(16 + k * 0.5); if (k) cue(16 + k * 0.5, 'alert'); }
    const sos = layer(`<div style="position:absolute;left:60px;top:60px;display:flex;gap:30px;align-items:center">
        <div class="av" style="width:130px;height:130px;background:#d6336c;font-size:58px;box-shadow:0 0 0 6px #fff">S</div>
        <div><div style="font:800 34px/1 'JetBrains Mono';letter-spacing:.14em;color:#ffe3e3">SOS</div>
        <div style="font:800 60px/1.1 'Plus Jakarta Sans';color:#fff;letter-spacing:-.02em;margin-top:10px">Sari minta tolong</div></div></div>
      <div class="dist" style="position:absolute;left:60px;top:300px;display:flex;align-items:baseline;gap:20px;color:#fff"></div>
      <div style="position:absolute;left:60px;top:560px;display:flex;align-items:center;gap:22px;font:700 46px/1 'Plus Jakarta Sans';color:#fff">
        <i class="dir" style="width:76px;height:76px;display:inline-flex">${I.arrow}</i>ke arah barat laut</div>
      <div style="position:absolute;left:60px;top:680px;display:flex;align-items:center;gap:22px;font:700 46px/1 'Plus Jakarta Sans';color:#fff">
        <i style="width:76px;height:76px;display:inline-flex">${I.bat}</i><span>baterai</span><span class="bat"></span></div>
      <div class="btn" style="position:absolute;left:60px;right:60px;bottom:60px;height:140px;border-radius:999px;background:#fff;color:#c92a2a;display:flex;align-items:center;justify-content:center;gap:20px;font:800 50px/1 'Plus Jakarta Sans'">Lihat arah</div>`,
    960, 1140, 16.0, 19.875);
    // odometers
    const odo = (parent, final, size, color) => {
      const s = String(final), lh = size * 1.0, cw = size * 0.6;
      const box = sub(parent, `<div class="odo" style="height:${lh}px;font:800 ${size}px/${lh}px 'JetBrains Mono';color:${color}"></div>`);
      const slots = [...s].map(() => {
        const sl = sub(box, `<div class="slot" style="width:${cw}px;height:${lh}px"><div class="strip">${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((d) => `<span style="height:${lh}px">${d}</span>`).join('')}</div></div>`);
        return sl;
      });
      return (v) => {
        const n = slots.length;
        slots.forEach((sl, i) => {
          const p = n - 1 - i, q = 10 ** p;
          const pos = (Math.floor(v / q) % 10) + clamp((v % q) - (q - 1), 0, 1);
          sl.firstChild.style.transform = `translateY(${(-pos * lh).toFixed(2)}px)`;
          sl.style.opacity = p === 0 ? 1 : clamp((v - q * 0.85) / (q * 0.15)).toFixed(3);
        });
      };
    };
    const dist = sos.querySelector('.dist');
    const dOdo = odo(dist, 259, 230, '#fff');
    sub(dist, `<div style="font:800 96px/1 'Plus Jakarta Sans'">m</div>`);
    const bOdo = odo(sos.querySelector('.bat'), 21, 46, '#fff');
    sub(sos.querySelector('.bat'), '<span>%</span>');
    sos.querySelector('.bat').style.display = 'inline-flex';
    const dirEl = sos.querySelector('.dir');
    draws.push((t) => {
      dOdo(259 * ease((t - 16.5) / 1.0));
      bOdo(21 * ease((t - 17.5) / 0.5));
      dirEl.style.transform = `rotate(${lerp(-200, -45, stepR(t - 17.0, SP.shape)).toFixed(2)}deg)`;
    });
    for (let k = 0; k < 8; k++) cue(16.5 + k * 0.125, 'tick');
    cue(17.0, 'swap', { n: 3 });
    for (let k = 0; k < 4; k++) cue(17.5 + k * 0.125, 'tick');
    // alarm rings behind the card
    for (let k = 0; k < 2; k++) {
      const rg = add('<div class="ring" style="width:960px;height:1140px;margin:-570px 0 0 -480px;border-radius:64px;border:6px solid #ef4b4b"></div>', fx);
      draws.push((t) => {
        let o = 0, s = 1;
        if (t >= 16.0 && t < 20.0) { const d = ((t - 16.0 + k * 0.5) % 1.0); o = 0.6 * (1 - d); s = lerp(1, 1.12, outQ(d)); }
        rg.style.visibility = o > 0.005 ? 'visible' : 'hidden'; rg.style.opacity = o.toFixed(3);
        rg.style.transform = `translate(540px,1190px) scale(${s.toFixed(3)})`;
      });
    }
    curWins.push([18.25, 20.25, 'Kamu', C.cream, C.ink]);
    CU.x.to(18.0, 1180, SP.snap); CU.y.to(18.0, 1850, SP.snap);
    curTo(18.25, 1000, 1760); curTo(18.875, 600, 1660);
    click(19.5, 0.02);
    curTo(19.75, 1180, 1500, SP.soft);

    // ───────────────────────── S7 · 20–24 compass ─────────────────────────
    morph(20.0, 540, 1100, 880, 880, 440, C.paper);
    cue(20.0, 'whoosh', { v: 0.7 }); cue(20.0, 'settle');
    const cmp = layer(`
      ${[160, 290, 420].map((r) => `<div class="ring" style="position:absolute;left:${440 - r}px;top:${440 - r}px;width:${r * 2}px;height:${r * 2}px;border:3px solid #e2dfd0"></div>`).join('')}
      <div class="rose" style="position:absolute;left:0;top:0;width:880px;height:880px">
        <div style="position:absolute;left:418px;top:-2px;font:800 44px/1 'Plus Jakarta Sans';color:#d63a3a;width:44px;text-align:center">U</div>
        <div style="position:absolute;left:836px;top:418px;font:700 40px/1 'Plus Jakarta Sans';color:#8a918a">T</div>
        <div style="position:absolute;left:424px;top:842px;font:700 40px/1 'Plus Jakarta Sans';color:#8a918a">S</div>
        <div style="position:absolute;left:14px;top:418px;font:700 40px/1 'Plus Jakarta Sans';color:#8a918a">B</div></div>
      <div style="position:absolute;left:400px;top:392px;width:80px;height:96px;color:#1f7a45"><svg viewBox="0 0 24 28" width="100%" height="100%"><path d="M12 1 22 27 12 20 2 27z" fill="currentColor"/></svg></div>
      <div class="mk"></div>`, 880, 880, 20.0, 23.875);
    const rose = cmp.querySelector('.rose');
    const mk = cmp.querySelector('.mk');
    const polar = (deg, r) => [440 + r * Math.sin(deg * Math.PI / 180), 440 - r * Math.cos(deg * Math.PI / 180)];
    const HEAD = new Track(-40).to(20.5, 0, SP.shape);
    const marker = (html, label, tin) => {
      const e = sub(mk, `<div style="position:absolute;left:0;top:0;width:0;height:0">
        <div style="position:absolute;left:-55px;top:-55px">${html}</div>
        <div class="lb" style="position:absolute;left:-200px;top:66px;width:400px;text-align:center;font:700 32px/1 'Plus Jakarta Sans';color:#1c2a21;white-space:nowrap">${label}</div></div>`);
      return { e, tin };
    };
    const flag = marker(`<div class="av" style="width:110px;height:110px;background:#d98a12;padding:26px;box-sizing:border-box">${I.flag}</div>`, 'Pos 3 · 250 m', 20.5);
    const mB = marker(`<div class="av" style="width:96px;height:96px;margin:7px;background:#e8590c;font-size:42px">B</div>`, 'Budi · tiba', 20.75);
    const mS = marker(`<div class="av" style="width:96px;height:96px;margin:7px;background:#d6336c;font-size:42px;box-shadow:0 0 0 6px #d98a12">S</div>`, 'Sari · 129 m', 21.0);
    const mP = marker(`<div class="av" style="width:96px;height:96px;margin:7px;background:#1e7a45;font-size:42px">P</div>`, 'Pak RT · 470 m', 21.5);
    // positions (bearing deg, radius px) — Pos 3 NE 250 m, Sari SW 129 m, Pak RT SE 470 m (from the app screenshot)
    const PA = { f: [45, 290], b: [95, 330], s: [225, 175], p: [135, 340] };
    const SB = new Track(0), SP_ = new Track(0); // progress toward the flag
    SP_.to(22.0, 1, { w: 6, z: 1 });
    draws.push((t) => {
      const h = HEAD.at(t);
      rose.style.transform = `rotate(${(-h).toFixed(2)}deg)`;
      const place = (m, [deg, r], prog = 0, lbl = true) => {
        let [x, y] = polar(deg - h, r);
        if (prog) { const [fx2, fy] = polar(PA.f[0] - h, PA.f[1]); x = lerp(x, fx2 - 120, prog); y = lerp(y, fy + 10, prog); }
        const v = vis(t, m.tin, null);
        m.e.style.left = x.toFixed(1) + 'px'; m.e.style.top = y.toFixed(1) + 'px';
        m.e.style.opacity = v.o.toFixed(3); m.e.style.filter = v.b > 0.05 ? `blur(${v.b.toFixed(2)}px)` : 'none';
        m.e.style.transform = `scale(${popS(t, m.tin, 0.3).toFixed(3)})`;
        m.e.querySelector('.lb').style.opacity = lbl ? 1 : 0;
      };
      place(flag, PA.f);
      place(mB, PA.b);
      place(mP, PA.p, SP_.at(t), t < 22.0);
      place(mS, PA.s);
    });
    ['pop', 'pop', 'pop', 'pop'].forEach((k, i) => cue([20.5, 20.75, 21.0, 21.5][i], k));
    cue(20.5, 'swap', { n: 1 });
    cue(22.0, 'whoosh', { v: 0.4 });
    // arrivals chip under the compass
    const arr = at(add(`<div class="chip" style="height:96px;font-size:36px;gap:18px;padding:0 36px">
      <i style="width:44px;height:44px;display:inline-flex;color:#d98a12">${I.flag}</i>
      <span>Sudah tiba:</span><span class="n1" style="color:#f2edd5;font-weight:800;position:relative;display:inline-block;width:24px;height:40px"></span><span>dari 4</span></div>`), 0, 1610);
    const n1 = arr.querySelector('.n1');
    const nA = sub(n1, '<span style="position:absolute;left:0;top:2px">1</span>'), nB = sub(n1, '<span style="position:absolute;left:0;top:2px;color:#3cbf6e">2</span>');
    draws.push((t) => { arr.style.left = (540 - arr.offsetWidth / 2) + 'px'; applyVis(nA, vis(t, -1, 22.75, 0.08)); applyVis(nB, vis(t, 22.875, null)); });
    show(arr, 21.75, 24.0);
    cue(21.75, 'pop'); cue(22.875, 'check');
    const late = at(add(`<div style="width:1080px;text-align:center;font:600 38px/1.2 'Plus Jakarta Sans';color:#a5b0a2">Belum tiba: <b style="color:#d6336c">Sari</b> · butuh bantuan</div>`), 0, 1740);
    show(late, 23.25, 24.0); cue(23.25, 'note', { n: 1 });

    // ───────────────────────── S8 · 24–28 range bar (edge-split stretch) ─────────────────────────
    const steps = [[24.0, 520, '50–100', 'm', 'HP ke HP', 'Wi‑Fi Direct langsung di area terbuka.'],
      [25.0, 640, '+1', 'HP', 'HP jembatan', 'Satu HP di tengah meneruskan pesan.'],
      [26.0, 760, '1–3', 'km', 'Wi‑Fi posko', 'Wi‑Fi gedung atau antena di posko.'],
      [27.0, 940, 'km+', 'LoRa', 'Gerbang LoRa', 'Meshtastic, hingga beberapa km.']];
    steps.forEach(([ts, w, num, unit, lbl, desc], i) => {
      const lead = { w: 26, z: 0.85 }, trail = { w: 12, z: 0.9 };
      morph(ts, 70 + w / 2, 1060, w, 260, 130, C.leaf, { spL: i ? lead : SP.shape, spR: i ? lead : SP.shape, sp: SP.shape });
      if (i) { L.ev[L.ev.length - 1] && 0; }
      const tout = i < 3 ? steps[i + 1][0] - 0.125 : 27.875;
      const e = add(`<div style="position:absolute;left:0;top:0;height:260px;display:flex;flex-direction:column;justify-content:center;padding-left:64px;white-space:nowrap;color:#04140a">
        <div style="font:800 96px/1 'Plus Jakarta Sans';letter-spacing:-.03em">${num}<span style="font-size:48px;margin-left:10px">${unit}</span></div>
        <div style="font:700 36px/1 'JetBrains Mono';margin-top:14px;letter-spacing:.02em">${lbl}</div></div>`, hero);
      show(e, ts, tout, '');
      const d = at(add(`<div class="sub" style="font-size:42px;color:#c9cdb9">${desc}</div>`), 70, 1250);
      show(d, ts + 0.25, tout);
      cue(ts, i ? 'swap' : 'whoosh', i ? { n: i + 2 } : { v: 0.6 });
    });
    // a row of "tiers" dots under the bar fills with each step
    const tiers = at(add(`<div style="display:flex;gap:18px">${[0, 1, 2, 3].map(() => '<i style="display:block;width:210px;height:12px;border-radius:6px;background:#1f3a2a"></i>').join('')}</div>`), 70, 1420);
    const tdots = [...tiers.children];
    show(tiers, 24.25, 28.0);
    draws.push((t) => tdots.forEach((d, i) => { d.style.background = M.mix('#1f3a2a', C.leaf, clamp(stepR(t - steps[i][0], SP.pop))); }));
    // the trailing edge: make L lag on growth by re-issuing with a soft spring (trailing = left edge stays put; right edge leads)
    const wobble = (t) => { let s = 0; for (let i = 1; i < 4; i++) { const d = t - steps[i][0]; if (d > 0 && d < 0.6) s += Math.exp(-d * 8) * Math.sin(d * 30) * 6; } return s; };

    // ───────────────────────── S9 · 28–32 logo + CTA ─────────────────────────
    morph(28.0, 540, 700, 440, 440, 220, C.cream, { sp: { w: 20, z: 0.78 } });
    cue(28.0, 'slam', { n: 2 }); cue(28.0, 'whoosh', { v: 0.6 });
    layer(`<img src="assets/mark.png" style="position:absolute;left:30px;top:30px;width:380px;height:380px">`, 440, 440, 28.0, null, (t) => `scale(${popS(t, 28.0, 0.6).toFixed(3)})`);
    const wm = at(add(`<div style="width:1080px;text-align:center;font:800 124px/1 'Plus Jakarta Sans';letter-spacing:-.04em;color:#f2edd5">Saling Jaga</div>`), 0, 990);
    show(wm, 28.5, null); cue(28.5, 'pop');
    const tg = at(add(`<div style="width:1080px;text-align:center;font:600 56px/1.2 'Plus Jakarta Sans';letter-spacing:-.02em;color:#c9cdb9">Saat sinyal hilang, kita tetap<br><span class="serif" style="color:#3cbf6e;font-size:76px">saling jaga.</span></div>`), 0, 1160);
    show(tg, 29.0, null); cue(29.0, 'swap', { n: 4 });
    const chips = ['Tanpa akun', 'Tanpa server', 'Tanpa iklan'];
    const crow = at(add(`<div style="width:1080px;display:flex;justify-content:center;gap:16px"></div>`), 0, 1420);
    chips.forEach((c, i) => {
      const e = sub(crow, `<div class="chip" style="font-size:30px;height:72px;padding:0 26px;gap:12px"><i style="width:30px;height:30px;display:inline-flex;color:#3cbf6e">${I.check}</i>${c}</div>`);
      const tin = 29.5 + i * 0.25;
      draws.push((t) => applyVis(e, vis(t, tin, null), `scale(${popS(t, tin, 0.7).toFixed(3)})`));
      cue(tin, 'check');
    });
    const cta = at(add(`<div style="display:flex;align-items:center;gap:20px;height:140px;padding:0 64px;border-radius:999px;background:#3cbf6e;color:#04140a;font:800 52px/1 'Plus Jakarta Sans';white-space:nowrap">
      <i style="width:56px;height:56px;display:inline-flex">${I.dl}</i>Unduh APK gratis</div>`), 0, 1560);
    const ctaP = [];
    draws.push((t) => { cta.style.left = (540 - cta.offsetWidth / 2) + 'px'; });
    show(cta, 30.25, null, (t) => `scale(${(popS(t, 30.25, 0.7) * press(t, 31.0)).toFixed(3)})`);
    cue(30.25, 'cta');
    const url = at(add(`<div class="mono" style="width:1080px;text-align:center;font:600 38px/1 'JetBrains Mono';color:#a5b0a2;letter-spacing:.02em">saling-jaga.com · Android 6.0+</div>`), 0, 1752);
    show(url, 30.5, null); cue(30.5, 'pop');
    curWins.push([30.25, 31.75, 'Kamu', C.cream, C.ink]);
    CU.x.to(30.0, 1180, SP.snap); CU.y.to(30.0, 1880, SP.snap);
    curTo(30.25, 690, 1615);
    clicks.push(31.0); cue(31.0, 'click'); cue(31.0, 'shimmer');
    curTo(31.25, 1180, 1900, SP.soft);
    cue(31.5, 'settle');

    // ───────────────────────── seek ─────────────────────────
    const DUR = 32.0;
    window.seek = (t) => {
      const l = L.at(t), r = R.at(t), tp = T.at(t), b = B.at(t);
      const w = Math.max(0, r - l), h = Math.max(0, b - tp);
      const s = heroScale(t);
      const sx = shake(t) + wobble(t) * 0;
      hero.style.left = l.toFixed(2) + 'px'; hero.style.top = tp.toFixed(2) + 'px';
      hero.style.width = w.toFixed(2) + 'px'; hero.style.height = h.toFixed(2) + 'px';
      hero.style.borderRadius = Math.min(RAD.at(t), w / 2, h / 2).toFixed(2) + 'px';
      hero.style.background = COL.at(t);
      hero.style.boxShadow = `0 40px 90px -30px rgba(0,0,0,.75), inset 0 0 0 ${(2 * clamp(BOR.at(t))).toFixed(2)}px rgba(242,237,213,.16)`;
      hero.style.transform = `translateX(${sx.toFixed(2)}px) scale(${s.toFixed(4)})`;
      for (const d of draws) d(t);
    };
    const seen = new Set();
    const out = cues.filter((c) => { const key = c.t + c.k; if (seen.has(key)) return false; seen.add(key); return true; });
    out.forEach((c) => { const g = c.t / 0.125; if (Math.abs(g - Math.round(g)) > 1e-6) throw new Error('cue off grid: ' + JSON.stringify(c)); });
    out.sort((a, b) => a.t - b.t);
    window.FILM = { width: 1080, height: 1920, bpm: 120, duration: DUR,
      sections: { intro: [0, 4], drop: [16, 20], outro: [28, DUR] }, cues: out };
    window.seek(0);
    window.READY = true;
  } catch (err) {
    console.error(err);
    window.FILM_ERROR = String(err && err.stack || err);
  }
})();
