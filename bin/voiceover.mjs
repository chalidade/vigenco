#!/usr/bin/env node
// Multi-voice voice over for edited videos (narrator + characters), made with ElevenLabs.
//   node bin/voiceover.mjs voiceover/<id>
// Reads voiceover/<id>/lines.json:
//   { "model": "eleven_multilingual_v2",
//     "voices": { "narrator": "<voice_id or empty>", "aru": "", ... },      // empty = picked automatically
//     "roles":  { "aru": { "gender": "male", "age": "young" }, ... },        // hints for the automatic pick
//     "lines":  [ { "id": "n1", "who": "narrator", "text": "…", "settings": { … } } ] }
// Writes voiceover/<id>/<line id>.mp3, voices.json (what the account has) and result.json
// (voice used per role, duration and word timings per line). Unchanged lines are not billed again.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const dir = process.argv[2];
if (!dir) { console.error('usage: voiceover.mjs voiceover/<id>'); process.exit(1); }
const key = process.env.ELEVENLABS_API_KEY;
if (!key) { console.error('::error::ELEVENLABS_API_KEY is not set (Settings → Secrets and variables → Actions)'); process.exit(1); }
const spec = JSON.parse(fs.readFileSync(path.join(dir, 'lines.json'), 'utf8'));
const model = spec.model || 'eleven_multilingual_v2';
const api = async (p, init = {}) => {
  const r = await fetch(`https://api.elevenlabs.io${p}`, { ...init, headers: { 'xi-api-key': key, 'content-type': 'application/json', ...(init.headers || {}) } });
  if (!r.ok) throw Object.assign(new Error(`ElevenLabs ${r.status}: ${(await r.text()).slice(0, 300)}`), { status: r.status });
  return r.json();
};

// ---- voices on the account, and one per role ----
const { voices } = await api('/v1/voices');
const list = voices.map((v) => ({ id: v.voice_id, name: v.name, category: v.category, labels: v.labels || {}, description: v.description || '' }));
fs.writeFileSync(path.join(dir, 'voices.json'), JSON.stringify(list, null, 1) + '\n');
console.log(`[voiceover] ${list.length} voices on the account`);

const fallback = process.env.ELEVENLABS_VOICE_ID && list.some((v) => v.id === process.env.ELEVENLABS_VOICE_ID) ? process.env.ELEVENLABS_VOICE_ID : list[0]?.id;
const chosen = {};
const used = new Set();
const score = (v, hint) => {
  const L = Object.fromEntries(Object.entries(v.labels).map(([k, x]) => [k, String(x).toLowerCase()]));
  const text = `${v.name} ${v.description} ${Object.values(L).join(' ')}`.toLowerCase();
  let s = 0;
  if (hint.gender && L.gender === hint.gender) s += 5;
  if (hint.gender && L.gender && L.gender !== hint.gender) s -= 8;
  if (hint.age && (L.age || '').includes(hint.age)) s += 3;
  for (const w of hint.words || []) if (text.includes(w)) s += 2;
  if (/indonesia|\bid\b|bahasa/.test(text)) s += 2;
  if (used.has(v.id)) s -= 4; // prefer a different voice for every role
  return s;
};
for (const role of new Set(spec.lines.map((l) => l.who))) {
  const want = (spec.voices || {})[role];
  if (want && list.some((v) => v.id === want)) { chosen[role] = want; used.add(want); continue; }
  if (role === 'narrator') { chosen[role] = fallback; used.add(fallback); continue; }
  const hint = (spec.roles || {})[role] || {};
  const best = list.map((v) => [score(v, hint), v]).sort((a, b) => b[0] - a[0])[0];
  chosen[role] = best ? best[1].id : fallback; used.add(chosen[role]);
}
for (const [r, id] of Object.entries(chosen)) console.log(`[voiceover] ${r} → ${list.find((v) => v.id === id)?.name || id}`);

// ---- speech ----
const prev = fs.existsSync(path.join(dir, 'result.json')) ? JSON.parse(fs.readFileSync(path.join(dir, 'result.json'), 'utf8')) : { lines: {} };
const out = { model, voices: chosen, lines: {} };
const base = { stability: 0.45, similarity_boost: 0.8, style: 0.35, use_speaker_boost: true };
for (const [i, l] of spec.lines.entries()) {
  const voice = chosen[l.who];
  const settings = { ...base, ...(spec.settings || {})[l.who], ...l.settings };
  const hash = crypto.createHash('sha1').update(JSON.stringify([l.text, voice, model, settings])).digest('hex').slice(0, 12);
  const mp3 = path.join(dir, `${l.id}.mp3`);
  if (prev.lines[l.id]?.hash === hash && fs.existsSync(mp3)) { out.lines[l.id] = prev.lines[l.id]; console.log(`[voiceover] ${l.id} reused`); continue; }
  const same = spec.lines.filter((x) => x.who === l.who);
  const k = same.indexOf(l);
  const body = { text: l.text, model_id: model, voice_settings: settings, previous_text: same[k - 1]?.text, next_text: same[k + 1]?.text };
  let res;
  try {
    res = await api(`/v1/text-to-speech/${voice}/with-timestamps?output_format=mp3_44100_128`, { method: 'POST', body: JSON.stringify(body) });
  } catch (e) {
    if (voice === fallback) throw e;
    console.log(`::warning::${l.id}: ${e.message}; retrying with the default voice`);
    res = await api(`/v1/text-to-speech/${fallback}/with-timestamps?output_format=mp3_44100_128`, { method: 'POST', body: JSON.stringify(body) });
  }
  fs.writeFileSync(mp3, Buffer.from(res.audio_base64, 'base64'));
  const a = res.alignment || res.normalized_alignment;
  const words = []; let cur = null;
  a.characters.forEach((ch, j) => {
    if (/\s/.test(ch)) { cur = null; return; }
    if (!cur) words.push((cur = { text: '', start: a.character_start_times_seconds[j], end: 0 }));
    cur.text += ch; cur.end = a.character_end_times_seconds[j];
  });
  const duration = a.character_end_times_seconds.at(-1) || 0;
  out.lines[l.id] = { who: l.who, text: l.text, hash, duration, words };
  console.log(`[voiceover] ${l.id} ${l.who} ${duration.toFixed(2)}s`);
}
fs.writeFileSync(path.join(dir, 'result.json'), JSON.stringify(out, null, 1) + '\n');
console.log(`[voiceover] done: ${Object.keys(out.lines).length} lines`);
