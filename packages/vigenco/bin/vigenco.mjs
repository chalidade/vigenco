#!/usr/bin/env node
// vigenco: spec in, MP4 out. Run `vigenco help` for usage.
import path from 'node:path';
import { mkdir, copyFile, writeFile, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { loadJob, render, snap, contactSheet, storyboard, redub, inspect } from '../src/render.mjs';
import { synthesize } from '../src/audio/synth.mjs';

const PKG = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [cmd, job, ...rest] = process.argv.slice(2);
const flags = {};
for (let i = 0; i < rest.length; i++) {
  const a = rest[i];
  if (!a.startsWith('--')) continue;
  const k = a.slice(2), v = rest[i + 1] && !rest[i + 1].startsWith('--') ? rest[++i] : true;
  flags[k] = v;
}

function usage(code = 1) {
  console.log(`vigenco: spec in, MP4 out

Usage:
  vigenco render <job.json> [--quality draft|standard|high] [--out out/name.mp4] [--workers N]
                            [--no-audio] [--storyboard]
  vigenco snap   <job.json> [--times beats|0.5,2,7.25] [--out snaps/name]
  vigenco redub  <job.json> --video in.mp4 [--out out/name.mp4]     new soundtrack, same picture
  vigenco audio  <job.json> [--out out/name.wav]                     soundtrack only
  vigenco inspect <job.json>                                         duration, size, cues
  vigenco init   [folder]                                            example launch job + custom film

A job is JSON: { "type": "launch", … } for the built-in launch film, or
{ "entry": "my-film/index.html", "format": "vertical" } for your own seek(t) film.
Paths inside a job resolve against the job file's folder.

Needs Node 20+, ffmpeg on PATH, and Chromium (npx playwright install chromium).`);
  process.exit(code);
}

if (!cmd || cmd === 'help' || cmd === '--help' || cmd === '-h') usage(cmd ? 0 : 1);

if (cmd === 'init') {
  const dir = path.resolve(job || 'vigenco-example');
  await mkdir(path.join(dir, 'my-film'), { recursive: true });
  const put = async (src, dst) => { if (existsSync(dst)) console.log(`  keep ${path.relative(process.cwd(), dst)} (exists)`); else { await copyFile(src, dst); console.log(`  add  ${path.relative(process.cwd(), dst)}`); } };
  await put(path.join(PKG, 'examples', 'launch.json'), path.join(dir, 'launch.json'));
  await put(path.join(PKG, 'examples', 'custom.json'), path.join(dir, 'custom.json'));
  const film = path.join(dir, 'my-film', 'index.html');
  if (!existsSync(film)) {
    const html = (await readFile(path.join(PKG, 'examples', 'my-film', 'index.html'), 'utf8'))
      .replace('../../types/_shared/motion.js', path.relative(path.dirname(film), path.join(PKG, 'types', '_shared', 'motion.js')).split(path.sep).join('/'));
    await writeFile(film, html); console.log(`  add  ${path.relative(process.cwd(), film)}`);
  }
  console.log(`\nNext:\n  npx vigenco render ${path.relative(process.cwd(), dir) || '.'}/launch.json --quality draft`);
  process.exit(0);
}

if (!job) usage();
const spec = await loadJob(job);
const name = path.basename(job, '.json');
const baseDir = path.dirname(path.resolve(job));

try {
  if (cmd === 'render') {
    const out = flags.out || path.join('out', `${name}.mp4`);
    const res = await render(spec, { quality: flags.quality, out, workers: flags.workers ? +flags.workers : undefined, noAudio: !!flags['no-audio'], name, keepWork: !!flags['keep-work'], baseDir });
    if (flags.storyboard) await storyboard(res.out, res.out.replace(/\.mp4$/, '.storyboard.png'));
  } else if (cmd === 'snap') {
    const outDir = flags.out || path.join('snaps', name);
    const times = !flags.times || flags.times === 'beats' ? 'beats' : String(flags.times).split(',').map(Number);
    const { files, film } = await snap(spec, times, outDir, { baseDir });
    await contactSheet(files, path.join(outDir, 'sheet.png'), 8, 240);
    console.log(`[vigenco] ${files.length} stills, duration ${film.duration}s → ${outDir}/sheet.png`);
  } else if (cmd === 'redub') {
    if (!flags.video) usage();
    await redub(spec, flags.video, flags.out || path.join('out', `${name}.mp4`), { baseDir });
  } else if (cmd === 'audio') {
    const film = await inspect(spec, { baseDir });
    const out = flags.out || path.join('out', `${name}.wav`);
    await mkdir(path.dirname(path.resolve(out)), { recursive: true });
    synthesize({ ...film, spec }, out, { baseDir });
    console.log(`[vigenco] audio → ${out}`);
  } else if (cmd === 'inspect') {
    const f = await inspect(spec, { baseDir });
    console.log(JSON.stringify({ width: f.width, height: f.height, duration: f.duration, bpm: f.bpm, sections: f.sections, cues: f.cues.length }, null, 2));
  } else usage();
  process.exit(0);
} catch (e) {
  console.error('[vigenco] ' + (e && e.message ? e.message : e));
  process.exit(1);
}
