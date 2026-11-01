#!/usr/bin/env node
// vigenco render <job.json> [--quality draft|standard|high] [--out out/x.mp4] [--workers N] [--no-audio] [--storyboard]
// vigenco snap   <job.json> [--times beats|1,2.5,4] [--out snaps/x]
// vigenco redub  <job.json> --video in.mp4 [--out out/x.mp4]   (new soundtrack, same picture)
// vigenco tts    <job.json>                                     (story: narration + word timings)
import path from 'node:path';
import { loadJob, render, snap, contactSheet, storyboard, redub, ttsStory } from '../src/render.mjs';

const [cmd, job, ...rest] = process.argv.slice(2);
const flags = {};
for (let i = 0; i < rest.length; i++) {
  const a = rest[i];
  if (!a.startsWith('--')) continue;
  const k = a.slice(2), v = rest[i + 1] && !rest[i + 1].startsWith('--') ? rest[++i] : true;
  flags[k] = v;
}

function usage() {
  console.log(`Usage:
  vigenco render <job.json> [--quality draft|standard|high] [--out out/name.mp4] [--workers N] [--no-audio] [--storyboard]
  vigenco snap   <job.json> [--times beats|0.5,2,7.25] [--out snaps/name]
  vigenco redub  <job.json> --video in.mp4 [--out out/name.mp4]
  vigenco tts    <job.json>   (story type only)`);
  process.exit(1);
}

if (!cmd || !job) usage();
const spec = await loadJob(job);
const name = path.basename(job, '.json');

if (cmd === 'render') {
  const out = flags.out || path.join('out', `${name}.mp4`);
  const res = await render(spec, { quality: flags.quality, out, workers: flags.workers ? +flags.workers : undefined, noAudio: !!flags['no-audio'], name, keepWork: !!flags['keep-work'] });
  if (flags.storyboard) await storyboard(res.out, res.out.replace(/\.mp4$/, '.storyboard.png'));
  process.exit(0);
} else if (cmd === 'snap') {
  const outDir = flags.out || path.join('snaps', name);
  const times = !flags.times || flags.times === 'beats' ? 'beats' : String(flags.times).split(',').map(Number);
  const { files, film } = await snap(spec, times, outDir);
  await contactSheet(files, path.join(outDir, 'sheet.png'), 8, 240);
  console.log(`[vigenco] ${files.length} stills${film.duration ? `, duration ${film.duration}s` : ''} → ${outDir}/sheet.png`);
  process.exit(0);
} else if (cmd === 'tts') {
  if (spec.type !== 'story') { console.error('tts is for story jobs'); process.exit(1); }
  await ttsStory(spec);
  process.exit(0);
} else if (cmd === 'redub') {
  if (!flags.video) usage();
  await redub(spec, flags.video, flags.out || path.join('out', `${name}.mp4`));
  process.exit(0);
} else usage();
