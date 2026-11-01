// Vigenco "story" video type: the Remotion project in types/story (narrated storybook animation).
// A job looks like { "type": "story", "story": "<id>", "title": "…", "format": "vertical" }, where the story lives in
// types/story/src/stories/<id>/ (story.json + scenes.tsx + parts.tsx + index.ts) and its narration in
// types/story/public/<id>/ (scene-NN.mp3 + timeline.json, made by `vigenco tts`).
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, readdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const STORY_DIR = path.join(ROOT, 'types', 'story');
const log = (...a) => console.log('[vigenco story]', ...a);

function sh(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { cwd: STORY_DIR, stdio: 'inherit', env: process.env, ...opts });
    p.on('error', reject);
    p.on('close', (c) => (c === 0 ? resolve() : reject(new Error(`${cmd} ${args.slice(0, 3).join(' ')} exited ${c}`))));
  });
}

export function storyId(spec) {
  const id = spec.story || spec.id;
  if (!id || !/^[a-z0-9-]{2,64}$/.test(id)) throw new Error(`story job needs "story": "<id>" (got ${JSON.stringify(id)})`);
  if (!existsSync(path.join(STORY_DIR, 'src', 'stories', id, 'story.json'))) throw new Error(`types/story/src/stories/${id}/story.json not found`);
  return id;
}

async function ensureDeps() {
  if (!existsSync(path.join(STORY_DIR, 'node_modules', '@remotion', 'cli'))) {
    log('installing Remotion dependencies…');
    await sh('npm', ['ci', '--no-audit', '--no-fund']);
  }
  await sh('node', ['scripts/gen-index.mjs']);
}

const browserArgs = () => (process.env.REMOTION_BROWSER ? [`--browser-executable=${process.env.REMOTION_BROWSER}`] : []);

/** Narration: story.json → public/<id>/scene-NN.mp3 + timeline.json (unchanged scenes are reused). */
export async function ttsStory(spec) {
  const id = storyId(spec);
  await ensureDeps();
  await sh('node', ['scripts/tts.mjs', id]);
}

export async function renderStory(spec, opts = {}) {
  const id = storyId(spec);
  await ensureDeps();
  if (!existsSync(path.join(STORY_DIR, 'public', id, 'timeline.json'))) await ttsStory(spec);
  const out = path.resolve(opts.out || path.join(ROOT, 'out', `${id}.mp4`));
  await mkdir(path.dirname(out), { recursive: true });
  const q = opts.quality || spec.quality || 'standard';
  const args = ['remotion', 'render', 'src/index.ts', id, out, '--log=warn', ...browserArgs()];
  if (q === 'draft') args.push('--scale=0.5', '--crf=26');
  if (q === 'high') args.push('--crf=14');
  if (opts.noAudio) args.push('--muted');
  const t0 = Date.now();
  await sh('npx', args);
  log(`done → ${path.relative(process.cwd(), out)} in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  return { out, film: { type: 'story', id } };
}

/** Stills for review: "auto" = start, middle and end of every scene, or explicit times in seconds. */
export async function snapStory(spec, times, outDir) {
  const id = storyId(spec);
  await ensureDeps();
  if (!existsSync(path.join(STORY_DIR, 'public', id, 'timeline.json'))) await ttsStory(spec);
  const dir = path.resolve(outDir);
  await rm(dir, { recursive: true, force: true });
  await sh('node', ['scripts/stills.mjs', id, dir, times === 'beats' || !times ? 'auto' : times.join(',')]);
  const files = (await readdir(dir)).filter((f) => f.endsWith('.png')).sort().map((f) => path.join(dir, f));
  return { files, film: { type: 'story', id, duration: null } };
}
