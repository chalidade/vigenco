import type { FC } from "react";
import { interpolateColors, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { SceneProps, Word } from "../../lib/Story";
import { rand, tween, wave } from "../../lib/kit";
import { Bars, C, Canvas, Chip, City, Link, Mark, Motes, Node, Person, Phone, Ripples, Sky, Stars, Tower, Txt, W, H } from "./parts";

/** Frame (within the scene) at which the n-th word starting with `text` is spoken. */
const at = (words: Word[], lead: number, text: string, n = 0, fallback = 0) => {
  const hits = words.filter((w) => w.text.toLowerCase().startsWith(text.toLowerCase()));
  const w = hits[n];
  return w ? Math.round((lead + w.start) * 30) : fallback;
};
const pop = (f: number, t: number, len = 12) => tween(f, t, t + len, 0, 1);

// 1 — the quake: city shakes, windows die, the phone loses its signal
const Quake: FC<SceneProps> = ({ words, lead }) => {
  const f = useCurrentFrame();
  const tShake = at(words, lead, "berguncang", 0, 35), tOff = at(words, lead, "padam", 0, 72);
  const tSig = at(words, lead, "sinyal", 0, 91), tLost = at(words, lead, "hilang", 0, 131);
  const shake = tween(f, tShake - 12, tShake, 0, 16) - tween(f, tLost - 20, tLost + 25, 0, 12);
  const bars = Math.round(4 - tween(f, tSig, tLost, 0, 4));
  const lost = pop(f, tLost);
  const zoom = tween(f, 0, 174, 1, 1.08);
  return (
    <Canvas shake={shake}>
      <Sky id="s1" top="#0a0f2a" bottom="#24305e" />
      <Stars opacity={0.6} n={30} />
      <City base={1500} color="#141b3c" lit={(i) => {
        const off = tOff - 6 + rand(i) * 40;
        return f < off - 4 ? 1 : f < off ? Math.floor(f / 2) % 2 : 0;
      }} />
      <rect y={1500} width={W} height={H} fill="#0a0e22" />
      <Motes color="#c9b89a" opacity={tween(f, tShake, tShake + 30, 0, 0.45)} n={36} />
      <g transform={`translate(540 760) scale(${zoom}) translate(-540 -760)`}>
        <Phone id="q" x={540} y={740} s={1.05} glow={lost > 0 ? "redGlow" : "tealGlow"}
          screen={interpolateColors(lost, [0, 1], ["#16224f", "#1d0f1c"])}>
          <Txt x={30} y={46} size={26} anchor="start">21:47</Txt>
          <Bars x={252} y={46} n={bars} color={bars === 0 ? C.sos : "#fff"} s={1.1} />
          <Txt x={174} y={250} size={108} opacity={1 - lost * 0.6}>21:47</Txt>
          <Txt x={174} y={305} size={30} color="#aab3d6" opacity={1 - lost * 0.6}>Sabtu malam</Txt>
          <g opacity={lost} transform={`translate(174 470) scale(${0.6 + 0.4 * lost})`}>
            <circle r={78} fill={C.sos} opacity={0.18} />
            <path d="M-38 -38 L38 38 M38 -38 L-38 38" stroke={C.sos} strokeWidth={18} strokeLinecap="round" />
          </g>
          <Txt x={174} y={610} size={36} color={C.sos} opacity={lost}>Tidak ada sinyal</Txt>
        </Phone>
      </g>
      <rect width={W} height={H} fill="#000" opacity={tween(f, tOff, tOff + 40, 0, 0.25)} />
    </Canvas>
  );
};

// 2 — dim room: a worried person, a message that never sends
const Failed: FC<SceneProps> = ({ words, lead }) => {
  const f = useCurrentFrame();
  const tFam = at(words, lead, "keluargamu", 0, 52), tTapi = at(words, lead, "tapi", 0, 94), tFail = at(words, lead, "terkirim", 0, 128);
  const msg = "Kalian aman?";
  const typed = msg.slice(0, Math.floor(tween(f, 8, tFam, 0, msg.length)));
  const sent = pop(f, tTapi - 4);
  const fail = pop(f, tFail, 10);
  return (
    <Canvas>
      <Sky id="s2" top="#141a38" bottom="#0a0d20" />
      {/* window with dark city */}
      <g transform="translate(70 240)">
        <rect width={300} height={380} rx={10} fill="#0b1030" stroke="#2a3360" strokeWidth={14} />
        <Stars opacity={0.5} n={8} maxY={0.1} />
        <path d="M0 260 h60 v-70 h50 v100 h70 v-130 h60 v80 h60 V380 H0Z" fill="#070a1c" />
        <line x1={150} y1={0} x2={150} y2={380} stroke="#2a3360" strokeWidth={10} />
      </g>
      {/* tilted family picture */}
      <g transform={`translate(860 300) rotate(${-14 + wave(f, 2, 60)})`}>
        <rect x={-90} y={-70} width={180} height={140} rx={8} fill="#3b2f2a" />
        <rect x={-76} y={-56} width={152} height={112} fill="#2a3a5a" />
        {[-40, 0, 40].map((x, i) => <circle key={i} cx={x} cy={0} r={18 - i * 2} fill="#e0b080" opacity={0.6} />)}
      </g>
      <rect y={1440} width={W} height={H} fill="#0a0c1a" />
      <Motes color="#a9a4c8" opacity={0.3} n={24} />
      <Person x={250} y={1440} s={1.25} color="#4a6fa5" hair="#1e1426" mood="worried" lift={0.15} glow={fail > 0 ? C.sos : C.cyan} />
      <Phone id="f" x={660} y={720} s={1} rot={4 + wave(f, 0.8, 90)} glow={fail > 0 ? "redGlow" : undefined} screen="#0f1636">
        <rect width={348} height={96} fill="#18224a" />
        <circle cx={46} cy={58} r={24} fill={C.amber} />
        <Txt x={84} y={56} size={28} anchor="start">Keluarga</Txt>
        <Txt x={84} y={84} size={20} anchor="start" color={C.sos}>tidak ada sinyal</Txt>
        <Bars x={286} y={60} n={0} color={C.sos} />
        <rect x={20} y={130} width={230} height={66} rx={22} fill="#26305c" />
        <Txt x={40} y={172} size={24} anchor="start" color="#d0d6f0">Hati-hati di jalan ya</Txt>
        {typed.length > 0 && (
          <g transform={`translate(0 ${-sent * 230})`}>
            <rect x={328 - 22 - typed.length * 17} y={250 + 230} width={22 + typed.length * 17} height={66} rx={22}
              fill={interpolateColors(fail, [0, 1], [C.cyan, "#5b2a3a"])} />
            <Txt x={312} y={250 + 230 + 43} size={28} anchor="end">{typed}</Txt>
            {sent > 0 && fail === 0 && <Txt x={312} y={250 + 230 + 98} size={22} anchor="end" color="#9aa3c8">mengirim{".".repeat(1 + Math.floor(f / 8) % 3)}</Txt>}
            {fail > 0 && <g opacity={fail}>
              <circle cx={312 - 8} cy={250 + 230 + 92} r={16} fill={C.sos} />
              <Txt x={304} y={250 + 230 + 101} size={24}>!</Txt>
              <Txt x={278} y={250 + 230 + 100} size={24} anchor="end" color={C.sos}>Gagal terkirim</Txt>
            </g>}
          </g>
        )}
        <rect x={0} y={650} width={348} height={78} fill="#18224a" />
        <rect x={20} y={666} width={250} height={46} rx={23} fill="#0f1636" />
        <circle cx={310} cy={689} r={24} fill={C.cyan} opacity={0.5} />
      </Phone>
    </Canvas>
  );
};

// 3 — the turn: Covatom bursts in
const Intro: FC<SceneProps> = ({ words, lead }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tCov = at(words, lead, "covatom", 0, 29), tChat = at(words, lead, "chat", 0, 61);
  const tTel = at(words, lead, "telepon", 0, 73), tSos = at(words, lead, "sos", 0, 96), tHil = at(words, lead, "hilang", 0, 143);
  const p = spring({ frame: f - tCov + 6, fps, config: { damping: 12 } });
  const bg = tween(f, tCov - 6, tCov + 20, 0, 1);
  return (
    <Canvas>
      <Sky id="s3" top={interpolateColors(bg, [0, 1], ["#070b1d", "#07203a"])} bottom={interpolateColors(bg, [0, 1], ["#0b1030", "#0b3a48"])} />
      <Stars opacity={0.5} />
      <Motes color={C.teal} opacity={0.35 * bg} n={40} />
      {/* sparks gather into the centre before the burst */}
      {f < tCov + 4 && Array.from({ length: 14 }, (_, i) => {
        const a = (i / 14) * Math.PI * 2 + f * 0.03, d = tween(f, 0, tCov, 520, 0) * (0.8 + rand(i) * 0.4);
        return <circle key={i} cx={540 + Math.cos(a) * d} cy={640 + Math.sin(a) * d} r={8} fill={C.teal} opacity={0.8} />;
      })}
      {f < tCov + 4 && <circle cx={540} cy={640} r={20 + tween(f, 0, tCov, 0, 60)} fill="url(#tealGlow)" />}
      <Ripples x={540} y={640} start={tCov - 4} color={C.teal} max={620} period={60} n={3} width={5} />
      <Mark x={540} y={640} s={1.5} p={p} />
      <Txt x={540} y={1000} size={160} opacity={pop(f, tCov + 2)} stroke>Covatom</Txt>
      <Txt x={540} y={1080} size={54} color={C.teal} opacity={pop(f, tCov + 14)}>Connecting in Crisis</Txt>
      <Chip x={215} y={1240} p={pop(f, tChat - 3)} label="Chat" color={C.cyan} w={250} />
      <Chip x={530} y={1240} p={pop(f, tTel - 3)} label="Telepon" color={C.teal} w={320} dark />
      <Chip x={860} y={1240} p={pop(f, tSos - 3)} label="SOS" color={C.sos} w={230} />
      <g opacity={pop(f, tHil - 4)}>
        <Bars x={400} y={1370} n={0} color={C.grey} s={1.4} />
        <Txt x={470} y={1366} size={40} anchor="start" color="#cfe9e4">tetap jalan</Txt>
      </g>
    </Canvas>
  );
};

const NODES: [number, number][] = [
  [180, 700], [420, 640], [700, 690], [920, 760], [280, 920], [560, 900], [820, 980],
  [150, 1150], [420, 1130], [680, 1180], [920, 1240], [300, 1350], [560, 1360],
];
const LINKS: [number, number][] = [];
NODES.forEach((a, i) => {
  const near = NODES.map((b, j) => ({ j, d: Math.hypot(a[0] - b[0], a[1] - b[1]) })).filter((x) => x.j > i).sort((x, y) => x.d - y.d).slice(0, 2);
  near.forEach((n) => { if (n.d < 330) LINKS.push([i, n.j]); });
});

// 4 — phone to phone mesh over the neighbourhood, no tower needed
const Mesh: FC<SceneProps> = ({ words, lead }) => {
  const f = useCurrentFrame();
  const tCon = at(words, lead, "menyambungkan", 0, 28), tNear = at(words, lead, "sekitarnya", 0, 80);
  const tInt = at(words, lead, "internet", 0, 119), tPul = at(words, lead, "pulsa", 0, 145), tBts = at(words, lead, "bts", 0, 171);
  const z = tween(f, 0, 222, 1, 1.06);
  return (
    <Canvas>
      <rect width={W} height={H} fill="#0a1029" />
      <g transform={`translate(540 1000) scale(${z}) translate(-540 -1000)`}>
        {/* streets and houses from above */}
        {Array.from({ length: 6 }, (_, r) => Array.from({ length: 5 }, (_, c) => (
          <rect key={`${r}-${c}`} x={40 + c * 210 + rand(r * 5 + c) * 30} y={560 + r * 150 + rand(r + c * 7) * 30} width={120 + rand(r * 3 + c) * 40} height={90}
            rx={12} fill="#141d45" stroke="#1d2a5c" strokeWidth={4} />
        )))}
        {[620, 770, 920, 1070, 1220, 1370].map((y) => <line key={y} x1={0} x2={W} y1={y + 70} y2={y + 70} stroke="#0d1434" strokeWidth={30} />)}
        {LINKS.map(([i, j], k) => (
          <Link key={k} a={NODES[i]} b={NODES[j]} p={tween(f, tCon + k * 3, tCon + k * 3 + 18, 0, 1)} spark={(f + k * 17) / 40} width={5} />
        ))}
        {NODES.map(([x, y], i) => <Node key={i} x={x} y={y} p={pop(f, 4 + i * 3, 14)} phase={i * 9} />)}
        <circle cx={NODES[5][0]} cy={NODES[5][1]} r={tween(f, tNear - 10, tNear + 20, 0, 420)} fill="none" stroke={C.teal} strokeWidth={4}
          opacity={1 - tween(f, tNear, tNear + 30, 0, 1)} />
      </g>
      <rect width={W} height={500} fill="#0a1029" opacity={0.85} />
      <Chip x={330} y={190} p={pop(f, tInt - 6)} label="Tanpa internet" color={C.teal} w={440} dark />
      <Chip x={330} y={300} p={pop(f, tPul - 6)} label="Tanpa pulsa" color={C.cyan} w={380} />
      <Chip x={330} y={410} p={pop(f, tBts - 6)} label="Tanpa BTS" color={C.sos} w={340} />
      <Tower x={860} y={290} s={0.95} cross={tween(f, tBts - 4, tBts + 12, 0, 1)} />
    </Canvas>
  );
};

// 5 — three radio layers
const Layers: FC<SceneProps> = ({ words, lead }) => {
  const f = useCurrentFrame();
  const tWifi = at(words, lead, "wi-fi", 0, 12), tBt = at(words, lead, "bluetooth", 0, 91);
  const tSos = at(words, lead, "sos", 0, 133), tLora = at(words, lead, "lora", 0, 181), tKm = at(words, lead, "kilometer", 0, 222);
  const cx = 470, cy = 1020;
  const wifi = pop(f, tWifi - 4, 18), bt = pop(f, tBt - 4, 18), lora = pop(f, tLora - 4, 24);
  const chain: [number, number][] = [[cx, cy], [cx + 190, cy + 120], [cx + 380, cy + 40], [cx + 470, cy - 160]];
  const hop = tween(f, tSos - 10, tSos + 40, 0, 3);
  const loraR = tween(f, tLora, tKm + 10, 300, 620);
  return (
    <Canvas>
      <Sky id="s5" top="#08102a" bottom="#0d1b40" />
      <Stars opacity={0.4} n={25} />
      {/* LoRa: kilometres */}
      <g opacity={lora}>
        <circle cx={cx} cy={cy} r={loraR} fill={C.amber} opacity={0.07} />
        <circle cx={cx} cy={cy} r={loraR} fill="none" stroke={C.amber} strokeWidth={6} strokeDasharray="22 16" />
        <Ripples x={cx + 180} y={cy - 210} start={tLora} color={C.amber} max={560} period={50} n={3} width={5} />
        <g transform={`translate(${cx + 180} ${cy - 210}) scale(${0.6 + 0.4 * lora})`}>
          <rect x={-55} y={-35} width={110} height={70} rx={14} fill="#2b2a3a" stroke={C.amber} strokeWidth={5} />
          <line x1={30} y1={-35} x2={44} y2={-120} stroke={C.amber} strokeWidth={8} strokeLinecap="round" />
          <circle cx={-22} cy={0} r={10} fill={C.amber} opacity={0.6 + wave(f, 0.4, 20)} />
        </g>
      </g>
      {/* Wi-Fi Direct group */}
      <g opacity={0.35 + 0.65 * wifi * (1 - 0.4 * bt)}>
        <circle cx={cx} cy={cy} r={240 * wifi} fill={C.cyan} opacity={0.13} />
        <circle cx={cx} cy={cy} r={240 * wifi} fill="none" stroke={C.cyan} strokeWidth={6} />
        {[[cx - 150, cy - 110], [cx - 160, cy + 120], [cx + 30, cy - 180]].map((n, i) => (
          <g key={i}>
            <Link a={[cx, cy]} b={n as [number, number]} p={tween(f, tWifi + 4 + i * 5, tWifi + 20 + i * 5, 0, 1)} color={C.cyan} spark={(f + i * 13) / 30} />
            <Node x={n[0]} y={n[1]} p={pop(f, tWifi + i * 5)} color={C.cyan} phase={i * 7} />
          </g>
        ))}
      </g>
      {/* Bluetooth relay chain */}
      <g opacity={bt}>
        {chain.slice(1).map((n, i) => (
          <g key={i}>
            <Link a={chain[i]} b={n} p={tween(f, tBt + i * 8, tBt + i * 8 + 14, 0, 1)} color={C.violet} width={5} />
            <Node x={n[0]} y={n[1]} p={pop(f, tBt + i * 8 + 8)} color={C.violet} phase={i * 5} />
          </g>
        ))}
        {f > tSos - 10 && hop < 3 && (() => {
          const i = Math.floor(hop), t = hop - i;
          const a = chain[i], b = chain[i + 1];
          return <g transform={`translate(${a[0] + (b[0] - a[0]) * t} ${a[1] + (b[1] - a[1]) * t})`}>
            <circle r={34} fill={C.sos} /><Txt x={0} y={9} size={24}>SOS</Txt>
          </g>;
        })()}
        {hop >= 3 && <Ripples x={chain[3][0]} y={chain[3][1]} start={tSos + 40} color={C.sos} max={120} period={30} n={2} width={5} />}
      </g>
      <Node x={cx} y={cy} p={1} />
      {/* legend */}
      {[
        { p: wifi, c: C.cyan, t: "Wi-Fi Direct", s: "50–100 m · suara, foto, chat" },
        { p: bt, c: C.violet, t: "Bluetooth", s: "estafet SOS & pesan singkat" },
        { p: lora, c: C.amber, t: "LoRa", s: "hingga beberapa kilometer" },
      ].map((l, i) => (
        <g key={i} opacity={l.p} transform={`translate(${80 + (1 - l.p) * -40} ${170 + i * 130})`}>
          <circle cx={26} cy={-14} r={22} fill={l.c} />
          <Txt x={70} y={4} size={56} anchor="start" stroke>{l.t}</Txt>
          <Txt x={70} y={52} size={32} anchor="start" color="#b8c2e6">{l.s}</Txt>
        </g>
      ))}
    </Canvas>
  );
};

const RING: { x: number; y: number; color: string; skin: string; hair: string; flip?: boolean }[] = [
  { x: 175, y: 800, color: "#e07a5f", skin: "#d9a07a", hair: "#2b1d1a" },
  { x: 905, y: 800, color: "#7a9e7e", skin: "#b57a55", hair: "#151018", flip: true },
  { x: 220, y: 1380, color: "#f2cc8f", skin: "#c98d64", hair: "#3a2a20" },
  { x: 860, y: 1380, color: "#6d83c6", skin: "#e3b18f", hair: "#5a3b2a", flip: true },
];

// 6 — tap "Ajak": nearby phones join one group
const Group: FC<SceneProps> = ({ words, lead }) => {
  const f = useCurrentFrame();
  const tAjak = at(words, lead, "ajak", 0, 25), tHp = at(words, lead, "hp", 0, 46), tGrup = at(words, lead, "grup", 0, 94);
  const tAkun = at(words, lead, "akun", 0, 127), tSrv = at(words, lead, "server", 0, 156);
  const press = f >= tAjak && f < tAjak + 6 ? 0.92 : 1;
  const fx = tween(f, 0, tAjak, 760, 600), fy = tween(f, 0, tAjak, 1300, 1000);
  const cx = 540, cy = 860;
  const hand = [[RING[0].x + 60, RING[0].y - 260], [RING[1].x - 60, RING[1].y - 260], [RING[2].x + 60, RING[2].y - 260], [RING[3].x - 60, RING[3].y - 260]] as [number, number][];
  return (
    <Canvas>
      <Sky id="s6" top="#0b1433" bottom="#10284a" />
      <Motes color={C.teal} opacity={0.25} n={24} />
      {/* group ring between members */}
      {[[0, 1], [1, 3], [3, 2], [2, 0]].map(([a, b], i) => (
        <Link key={i} a={hand[a]} b={hand[b]} p={tween(f, tGrup - 6 + i * 4, tGrup + 12 + i * 4, 0, 1)} color={C.teal} width={5} spark={(f + i * 11) / 36} />
      ))}
      {hand.map((h, i) => <Link key={i} a={[cx, cy]} b={h} p={tween(f, tHp + i * 6, tHp + i * 6 + 16, 0, 1)} color={C.cyan} width={4} spark={(f + i * 9) / 28} />)}
      {RING.map((r, i) => (
        <Person key={i} x={r.x} y={r.y} s={0.72} color={r.color} skin={r.skin} hair={r.hair} flip={r.flip} phase={i * 23}
          mood={f > tGrup ? "happy" : "calm"} lift={tween(f, tHp - 6 + i * 6, tHp + 8 + i * 6, 0, 1)} />
      ))}
      <Ripples x={cx} y={cy + 120} start={tAjak} color={C.teal} max={300} period={40} n={2} width={5} />
      <Phone id="g" x={cx} y={cy} s={0.72}>
        <Txt x={174} y={80} size={34}>Grup Darurat</Txt>
        <g transform={`translate(174 480) scale(${press})`} opacity={1 - pop(f, tAjak + 10)}>
          <rect x={-120} y={-50} width={240} height={100} rx={50} fill={C.teal} />
          <Txt x={0} y={18} size={52} color={C.ink}>Ajak</Txt>
        </g>
        {RING.map((r, i) => {
          const p = pop(f, tHp + i * 6 + 10);
          return <g key={i} opacity={p} transform={`translate(${30 + (1 - p) * 40} ${150 + i * 110})`}>
            <rect width={288} height={90} rx={20} fill="#16214a" />
            <circle cx={48} cy={45} r={28} fill={r.color} />
            <rect x={92} y={30} width={110 + i * 15} height={14} rx={7} fill="#8a96c6" />
            <rect x={92} y={54} width={70} height={12} rx={6} fill="#4c5a8a" />
            <circle cx={256} cy={45} r={12} fill={C.green} />
          </g>;
        })}
        <Txt x={174} y={640} size={30} color={C.teal} opacity={pop(f, tGrup)}>4 HP terhubung</Txt>
      </Phone>
      {/* finger */}
      {f < tAjak + 20 && <g transform={`translate(${fx} ${fy})`} opacity={1 - pop(f, tAjak + 8)}>
        <rect x={-30} y={0} width={60} height={200} rx={30} fill="#d9a07a" />
        <ellipse cx={0} cy={10} rx={18} ry={12} fill="#f0c8a8" />
      </g>}
      <Chip x={290} y={250} p={pop(f, tAkun - 8)} label="Tanpa akun" color={C.teal} w={380} dark />
      <Chip x={790} y={250} p={pop(f, tSrv - 6)} label="Tanpa server" color={C.cyan} w={400} />
    </Canvas>
  );
};

// 7 — one-tap SOS: distance, direction, battery
const Sos: FC<SceneProps> = ({ words, lead }) => {
  const f = useCurrentFrame();
  const tSos = at(words, lead, "sos", 0, 36), tAll = at(words, lead, "semua", 0, 67);
  const tJar = at(words, lead, "jarak", 0, 99), tArah = at(words, lead, "arah", 0, 112), tBat = at(words, lead, "baterai", 0, 140);
  const press = f >= tSos - 4 && f < tSos + 4 ? 0.88 : 1;
  const card = tween(f, tAll - 10, tAll + 10, 0, 1);
  const needle = tween(f, tArah, tArah + 25, -120, 38) + wave(f, 3, 30) * pop(f, tArah + 25);
  return (
    <Canvas>
      <Sky id="s7" top={interpolateColors(pop(f, tSos, 20), [0, 1], ["#0b1433", "#2a0d22"])} bottom="#0b1433" />
      <Ripples x={540} y={520} start={tSos} color={C.sos} max={640} period={40} n={3} width={8} />
      <g transform={`translate(540 520) scale(${press * (1 + wave(f, 0.03, 30))})`}>
        <circle r={210} fill="url(#redGlow)" opacity={0.5 + pop(f, tSos) * 0.5} />
        <circle r={160} fill="#b3172b" />
        <circle r={145} fill={C.sos} />
        <Txt x={0} y={36} size={104}>SOS</Txt>
      </g>
      <Txt x={540} y={210} size={44} color="#ffd1d6" opacity={1 - pop(f, tSos)}>Tekan sekali</Txt>
      <g opacity={card} transform={`translate(0 ${(1 - card) * 200})`}>
        <rect x={90} y={830} width={900} height={540} rx={44} fill="#151c3d" stroke={C.sos} strokeWidth={5} />
        <circle cx={160} cy={905} r={26} fill={C.sos} opacity={0.6 + wave(f, 0.4, 16)} />
        <Txt x={205} y={922} size={46} anchor="start">SOS diterima grup</Txt>
        {/* distance */}
        <g opacity={pop(f, tJar - 4)} transform="translate(250 1130)">
          <rect x={-130} y={-140} width={260} height={290} rx={30} fill="#1e2752" />
          <Txt x={0} y={10} size={84} color={C.amber}>{Math.round(tween(f, tJar - 4, tJar + 20, 0, 120))}</Txt>
          <Txt x={0} y={60} size={40} color={C.amber}>meter</Txt>
          <Txt x={0} y={120} size={30} color="#9aa3c8">jarak</Txt>
        </g>
        {/* direction */}
        <g opacity={pop(f, tArah - 4)} transform="translate(540 1130)">
          <rect x={-130} y={-140} width={260} height={290} rx={30} fill="#1e2752" />
          <circle cy={-10} r={90} fill="none" stroke="#3a4680" strokeWidth={6} />
          <Txt x={0} y={-74} size={24} color="#9aa3c8">U</Txt>
          <g transform={`translate(0 -10) rotate(${needle})`}>
            <path d="M0 -76 L20 10 L0 0 L-20 10Z" fill={C.teal} />
          </g>
          <Txt x={0} y={120} size={30} color="#9aa3c8">arah</Txt>
        </g>
        {/* battery */}
        <g opacity={pop(f, tBat - 4)} transform="translate(830 1130)">
          <rect x={-130} y={-140} width={260} height={290} rx={30} fill="#1e2752" />
          <rect x={-70} y={-70} width={130} height={70} rx={12} fill="none" stroke="#fff" strokeWidth={6} />
          <rect x={62} y={-48} width={12} height={26} rx={4} fill="#fff" />
          <rect x={-62} y={-62} width={114 * 0.34 * pop(f, tBat, 20)} height={54} rx={6} fill={C.amber} />
          <Txt x={0} y={70} size={56} color={C.amber}>34%</Txt>
          <Txt x={0} y={120} size={30} color="#9aa3c8">baterai</Txt>
        </g>
      </g>
      <rect width={W} height={H} fill={C.sos} opacity={f >= tSos && f < tSos + 4 ? 0.15 : 0} />
      <Motes color={C.sos} opacity={0.3 * pop(f, tSos)} n={20} />
    </Canvas>
  );
};

const ROLL = [
  { name: "Ayah", st: "Aman", c: C.green, w: "aman" },
  { name: "Ibu", st: "Aman", c: C.green, w: "aman" },
  { name: "Dika", st: "Terluka", c: C.amber, w: "terluka" },
  { name: "Nenek", st: "Belum jawab", c: C.grey, w: "menjawab" },
];

// 8 — roll call, then offline map + compass
const Absen: FC<SceneProps> = ({ words, lead }) => {
  const f = useCurrentFrame();
  const tAbs = at(words, lead, "absen", 0, 23), tKom = at(words, lead, "kompas", 0, 165), tOff = at(words, lead, "offline", 0, 221);
  const sw = tween(f, tKom - 8, tKom + 12, 0, 1);
  const needle = wave(f, 25, 70) + tween(f, tKom, tKom + 40, -180, 0);
  return (
    <Canvas>
      <Sky id="s8" top="#0a1534" bottom="#0e2a3e" />
      <Stars opacity={0.35} n={20} />
      <Motes color={C.green} opacity={0.2} n={18} />
      <Txt x={540} y={250} size={84} opacity={pop(f, tAbs - 6) * (1 - sw)} stroke>Absen</Txt>
      <Txt x={540} y={250} size={76} opacity={sw} stroke>Kompas &amp; Peta</Txt>
      <Chip x={540} y={1340} p={pop(f, tOff - 6)} label="Offline" color={C.teal} w={300} dark />
      <Phone id="a" x={540} y={790} s={1} glow="tealGlow">
        <g transform={`translate(${-sw * 348} 0)`}>
          <rect width={348} height={110} fill="#16214a" />
          <Txt x={30} y={72} size={40} anchor="start">Absen</Txt>
          <g transform={`translate(260 56) scale(${f >= tAbs && f < tAbs + 5 ? 0.9 : 1})`}>
            <circle r={34} fill={C.teal} /><path d="M-14 0 L-4 12 L16 -12" stroke={C.ink} strokeWidth={7} fill="none" strokeLinecap="round" />
          </g>
          {ROLL.map((r, i) => {
            const t = at(words, lead, r.w, 0, 80 + i * 20) + (i === 1 ? 6 : 0);
            const p = pop(f, t - 6);
            return <g key={i} transform={`translate(18 ${140 + i * 130})`}>
              <rect width={312} height={110} rx={22} fill="#131c40" stroke={p > 0 ? r.c : "#222c55"} strokeWidth={3} />
              <circle cx={50} cy={55} r={30} fill={["#e07a5f", "#7a9e7e", "#f2cc8f", "#6d83c6"][i]} />
              <Txt x={96} y={52} size={32} anchor="start">{r.name}</Txt>
              <g opacity={p} transform={`translate(96 ${80 + (1 - p) * 10})`}>
                <circle cx={8} cy={-8} r={8} fill={r.c} />
                <Txt x={24} y={0} size={26} anchor="start" color={r.c}>{r.st}</Txt>
              </g>
            </g>;
          })}
        </g>
        <g transform={`translate(${(1 - sw) * 348} 0)`}>
          <rect width={348} height={728} fill="#14233a" />
          {[[0, 180, 348, 230], [0, 420, 348, 380], [120, 0, 90, 728], [250, 0, 300, 728], [0, 600, 348, 640]].map(([x1, y1, x2, y2], i) => (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#2a3d5e" strokeWidth={i % 2 ? 18 : 26} />
          ))}
          <path d="M0 300 Q120 260 200 330 T348 300 V360 Q260 400 180 380 T0 360Z" fill="#1d4a6a" />
          {[[60, 120, C.green], [300, 520, C.green], [190, 640, C.amber]].map(([x, y, c], i) => (
            <g key={i} transform={`translate(${x} ${(y as number) - pop(f, tKom + 10 + i * 6) * 10})`} opacity={pop(f, tKom + 10 + i * 6)}>
              <path d="M0 0 C-22 -26 -22 -50 0 -50 C22 -50 22 -26 0 0Z" fill={c as string} />
              <circle cy={-34} r={7} fill="#14233a" />
            </g>
          ))}
          <circle cx={174} cy={460} r={26 + wave(f, 8, 30)} fill={C.cyan} opacity={0.3} />
          <circle cx={174} cy={460} r={14} fill={C.cyan} stroke="#fff" strokeWidth={4} />
          <g transform="translate(276 84)">
            <circle r={52} fill="#0e1830" stroke="#fff" strokeOpacity={0.4} strokeWidth={4} />
            <Txt x={0} y={-24} size={20} color="#9aa3c8">U</Txt>
            <g transform={`rotate(${needle})`}>
              <path d="M0 -40 L11 0 L-11 0Z" fill={C.sos} />
              <path d="M0 40 L11 0 L-11 0Z" fill="#dfe5ff" />
            </g>
          </g>
        </g>
      </Phone>
    </Canvas>
  );
};

const WEB: [number, number][] = [[130, 1040], [330, 930], [520, 1010], [730, 900], [940, 1010], [240, 1180], [620, 1160], [860, 1190]];
const WEBL: [number, number][] = [[0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [5, 2], [2, 6], [6, 3], [6, 7], [7, 4], [1, 5]];

// 9 — dawn: the city stitched together; end card
const Finale: FC<SceneProps> = ({ words, lead }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tCov = at(words, lead, "covatom", 0, 130), tCon = at(words, lead, "connecting", 0, 160), tHelp = at(words, lead, "menolong", 0, 100);
  const dawn = tween(f, 0, 120, 0, 1);
  const mark = spring({ frame: f - tCov + 8, fps, config: { damping: 13 } });
  const card = pop(f, tCov - 10, 20);
  return (
    <Canvas>
      <Sky id="s9" top={interpolateColors(dawn, [0, 1], ["#0c1436", "#2a3a78"])} bottom={interpolateColors(dawn, [0, 1], ["#2b2f5e", "#ffb37a"])} />
      <circle cx={540} cy={1330 - dawn * 120} r={260} fill="url(#warmGlow)" opacity={0.4 + dawn * 0.6} />
      <Stars opacity={1 - dawn} n={30} />
      <City base={1320} color={interpolateColors(dawn, [0, 1], ["#141b3c", "#3a2f5e"])} win="#ffd9a0"
        lit={(i) => (rand(i + 9) < 0.15 + dawn * 0.5 ? 1 : 0)} />
      <rect y={1320} width={W} height={H} fill="#1b1838" />
      {WEBL.map(([a, b], k) => <Link key={k} a={WEB[a]} b={WEB[b]} p={tween(f, 10 + k * 6, 30 + k * 6, 0, 1)} spark={(f + k * 13) / 40} width={5} />)}
      {WEB.map(([x, y], i) => <Node key={i} x={x} y={y} p={pop(f, 4 + i * 5)} phase={i * 7} />)}
      <Person x={400} y={1320} s={0.75} color="#e07a5f" skin="#d9a07a" hair="#2b1d1a" mood="happy" lift={tween(f, 20, 50, 0, 0.8)} />
      <Person x={680} y={1320} s={0.75} color="#6d83c6" skin="#e3b18f" hair="#5a3b2a" mood="happy" flip phase={30}
        lift={tween(f, tHelp - 20, tHelp + 10, 0, 0.8)} />
      <rect width={W} height={1000} fill="url(#s9fade)" opacity={card} />
      <defs>
        <linearGradient id="s9fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#081030" stopOpacity="0.95" />
          <stop offset="0.8" stopColor="#081030" stopOpacity="0.8" />
          <stop offset="1" stopColor="#081030" stopOpacity="0" />
        </linearGradient>
      </defs>
      <Mark x={540} y={330} s={0.95} p={Math.max(0, mark)} />
      <Txt x={540} y={600} size={140} opacity={card} stroke>Covatom</Txt>
      <Txt x={540} y={680} size={56} color={C.teal} opacity={pop(f, tCon - 4)} stroke>Connecting in Crisis</Txt>
      <Txt x={540} y={760} size={34} color="#e8ecff" opacity={pop(f, tCon + 12)} stroke>Gratis untuk warga · tanpa akun · tanpa server</Txt>
      <Chip x={540} y={850} p={pop(f, tCon + 22)} label="covatom.com" color={C.teal} w={380} size={40} dark />
    </Canvas>
  );
};

export const scenes = [Quake, Failed, Intro, Mesh, Layers, Group, Sos, Absen, Finale];
