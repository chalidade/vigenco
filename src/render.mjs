// Vigenco renderer: job spec in, MP4 out.
// Every video type is an HTML film exposing window.seek(t) and window.FILM. We open it in headless
// Chromium, screenshot N subframes per output frame, average them with ffmpeg tmix (real motion
// blur), encode H.264, then mux the synthesized soundtrack.
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdir, writeFile, readFile, rm, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import os from 'node:os';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const FORMATS = { vertical: [1080, 1920], landscape: [1920, 1080], square: [1080, 1080] };
export const QUALITY = {
  draft: { fps: 30, sub: 1, crf: 23, preset: 'veryfast', img: 'jpeg' },
  standard: { fps: 60, sub: 2, crf: 18, preset: 'veryfast', img: 'jpeg' },
  high: { fps: 60, sub: 4, crf: 15, preset: 'medium', img: 'png' },
};

const log = (...a) => console.log('[vigenco]', ...a);

function run(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: opts.stdin ? ['pipe', 'ignore', 'pipe'] : ['ignore', 'pipe', 'pipe'], ...opts });
    let err = '', out = '';
    p.stderr.on('data', (d) => { err += d; if (err.length > 20000) err = err.slice(-20000); });
    if (p.stdout) p.stdout.on('data', (d) => { out += d; });
    p.on('error', reject);
    p.on('close', (code) => (code === 0 ? resolve(out) : reject(new Error(`${cmd} exited ${code}\n${err.slice(-3000)}`))));
    if (opts.onSpawn) opts.onSpawn(p);
  });
}

export async function loadJob(jobPath) {
  const spec = JSON.parse(await readFile(jobPath, 'utf8'));
  if (!spec.type) spec.type = 'launch';
  if (!FORMATS[spec.format]) spec.format = 'vertical';
  return spec;
}

function typeEntry(type) {
  const f = path.join(ROOT, 'types', type, 'index.html');
  if (!existsSync(f)) throw new Error(`Unknown video type "${type}" (no ${path.relative(ROOT, f)})`);
  return pathToFileURL(f).href;
}

async function launchBrowser() {
  return chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined, args: ['--disable-gpu', '--font-render-hinting=none', '--disable-lcd-text', '--hide-scrollbars'] });
}

async function openFilm(browser, spec) {
  const [W, H] = FORMATS[spec.format];
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => log('page error:', e.message));
  await page.addInitScript((s) => { window.SPEC = s; }, spec);
  await page.goto(typeEntry(spec.type));
  await page.waitForFunction(() => window.READY || window.FILM_ERROR, null, { timeout: 60000 });
  const err = await page.evaluate(() => window.FILM_ERROR);
  if (err) throw new Error('Film failed to build:\n' + err);
  const film = await page.evaluate(() => window.FILM);
  return { page, film };
}

async function shoot(page, t, type = 'png') {
  await page.evaluate((tt) => window.seek(tt), t);
  return page.screenshot({ type, quality: type === 'jpeg' ? 92 : undefined, animations: 'disabled', caret: 'initial' });
}

// Stills at given times (QA): returns file paths.
export async function snap(spec, times, outDir) {
  await mkdir(outDir, { recursive: true });
  const browser = await launchBrowser();
  try {
    const { page, film } = await openFilm(browser, spec);
    const ts = times === 'beats' ? beatTimes(film) : times;
    const files = [];
    for (const t of ts) {
      const f = path.join(outDir, `t${t.toFixed(2).padStart(6, '0')}.png`);
      await writeFile(f, await shoot(page, t));
      files.push(f);
    }
    return { film, files };
  } finally { await browser.close(); }
}
export function beatTimes(film) {
  const out = [], spb = 60 / film.bpm;
  for (let t = 0.12; t < film.duration; t += spb) out.push(+t.toFixed(3));
  return out;
}

export async function contactSheet(files, out, cols = 6, w = 270) {
  const list = out + '.txt';
  await writeFile(list, files.map((f) => `file '${path.resolve(f)}'\nduration 1`).join('\n') + `\nfile '${path.resolve(files[files.length - 1])}'`);
  const rows = Math.ceil(files.length / cols);
  await run('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', list, '-vf', `scale=${w}:-1,tile=${cols}x${rows}:padding=4:color=black`, '-frames:v', '1', out]);
  await rm(list, { force: true });
  return out;
}

// Render one contiguous chunk of frames on its own page, piped straight into ffmpeg.
async function renderChunk(browser, spec, q, f0, f1, segPath, onFrame) {
  const { page } = await openFilm(browser, spec);
  const { fps, sub } = q;
  const vf = [
    sub > 1 ? `tmix=frames=${sub}:weights='${Array(sub).fill(1).join(' ')}',select='eq(mod(n\\,${sub})\\,${sub - 1})',setpts=N/(${fps}*TB)` : null,
    'scale=out_color_matrix=bt709:out_range=tv,format=yuv420p',
  ].filter(Boolean).join(',');
  let ff;
  const done = run('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps * sub), '-c:v', q.img === 'jpeg' ? 'mjpeg' : 'png', '-i', '-',
    '-vf', vf, '-r', String(fps), '-c:v', 'libx264', '-preset', q.preset, '-crf', String(q.crf), '-tune', 'film',
    '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-pix_fmt', 'yuv420p', segPath], { stdin: true, onSpawn: (p) => { ff = p; } });
  const write = (buf) => new Promise((res, rej) => { if (!ff.stdin.write(buf)) ff.stdin.once('drain', res); else res(); ff.stdin.once('error', rej); });
  for (let f = f0; f < f1; f++) {
    for (let i = 0; i < sub; i++) {
      const t = Math.max(0, f / fps + (i - (sub - 1) / 2) / (fps * sub));
      let buf;
      for (let attempt = 0; ; attempt++) {
        try { buf = await shoot(page, t, q.img); break; } catch (e) { if (attempt > 2) throw e; }
      }
      await write(buf);
    }
    onFrame();
  }
  ff.stdin.end();
  await done;
  await page.close();
}

export async function render(spec, opts = {}) {
  const q = QUALITY[opts.quality || spec.quality || 'standard'] || QUALITY.standard;
  const outPath = path.resolve(opts.out || path.join(ROOT, 'out', `${opts.name || 'video'}.mp4`));
  const work = path.join(path.dirname(outPath), `.work-${path.basename(outPath, '.mp4')}`);
  await rm(work, { recursive: true, force: true });
  await mkdir(work, { recursive: true });
  const t0 = Date.now();
  const browser = await launchBrowser();
  try {
    const { page, film } = await openFilm(browser, spec);
    await page.close();
    log(`type=${film.type} ${film.width}x${film.height} ${film.duration.toFixed(2)}s @${q.fps}fps x${q.sub} subframes`);
    await writeFile(path.join(work, 'film.json'), JSON.stringify({ ...film, spec }, null, 2));

    // soundtrack in parallel with the picture
    const wav = path.join(work, 'mix.wav');
    const audio = opts.noAudio ? Promise.resolve(null) : run(process.env.PYTHON || 'python3', [path.join(ROOT, 'src', 'audio', 'synth.py'), path.join(work, 'film.json'), wav])
      .then(() => wav).catch((e) => { log('audio failed, rendering silent:', e.message.split('\n')[0]); return null; });

    const frames = Math.ceil(film.duration * q.fps);
    const workers = Math.max(1, Math.min(opts.workers || Math.max(1, Math.min(4, os.cpus().length)), frames));
    const per = Math.ceil(frames / workers);
    let doneFrames = 0, lastPct = -1;
    const tick = () => {
      doneFrames++;
      const pct = Math.floor((doneFrames / frames) * 100);
      if (pct % 10 === 0 && pct !== lastPct) { lastPct = pct; log(`frames ${doneFrames}/${frames} (${pct}%)`); }
    };
    const segs = [];
    const jobs = [];
    for (let k = 0; k < workers; k++) {
      const f0 = k * per, f1 = Math.min(frames, f0 + per);
      if (f0 >= f1) continue;
      const seg = path.join(work, `seg${String(k).padStart(2, '0')}.mp4`);
      segs.push(seg);
      jobs.push(renderChunk(browser, spec, q, f0, f1, seg, tick));
    }
    await Promise.all(jobs);
    const list = path.join(work, 'segs.txt');
    await writeFile(list, segs.map((s) => `file '${s}'`).join('\n'));
    const video = path.join(work, 'video.mp4');
    await run('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', video]);
    const wavPath = await audio;
    await mkdir(path.dirname(outPath), { recursive: true });
    const mux = wavPath
      ? ['-y', '-loglevel', 'error', '-i', video, '-i', wavPath, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', outPath]
      : ['-y', '-loglevel', 'error', '-i', video, '-c', 'copy', '-movflags', '+faststart', outPath];
    await run('ffmpeg', mux);
    if (!opts.keepWork) await rm(work, { recursive: true, force: true });
    const size = (await stat(outPath)).size;
    log(`done → ${path.relative(process.cwd(), outPath)} (${(size / 1e6).toFixed(1)} MB) in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
    return { out: outPath, film, audio: !!wavPath };
  } finally {
    await browser.close().catch(() => {});
  }
}

// 1-per-second storyboard pulled from the finished MP4 (QA of the real output).
export async function storyboard(mp4, out, cols = 6) {
  const info = await run('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', mp4]);
  const dur = parseFloat(info);
  const rows = Math.ceil(dur / cols);
  await run('ffmpeg', ['-y', '-loglevel', 'error', '-i', mp4, '-vf', `fps=1,scale=240:-1,tile=${cols}x${rows}:padding=4:color=black`, '-frames:v', '1', out]);
  return out;
}
