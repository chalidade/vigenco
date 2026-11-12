// The Vigenco app's renderer: the `vigenco` engine package (packages/vigenco) for launch and custom
// films, plus the app's own Remotion "story" type. Paths in app jobs (films/<id>/…, requests/<id>/…)
// are relative to the repository root, so that is the base directory here.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as engine from '../packages/vigenco/src/render.mjs';
import { renderStory, snapStory, ttsStory } from './story.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const withRoot = (opts = {}) => ({ baseDir: ROOT, ...opts });

export { ttsStory };
export const { FORMATS, QUALITY, contactSheet, storyboard, beatTimes } = engine;

export async function loadJob(jobPath) {
  const spec = await engine.loadJob(jobPath);
  if (spec.story || spec.type === 'story') spec.type = 'story';
  return spec;
}

export async function render(spec, opts = {}) {
  if (spec.type === 'story') return renderStory(spec, opts);
  return engine.render(spec, withRoot(opts));
}

export async function snap(spec, times, outDir, opts = {}) {
  if (spec.type === 'story') return snapStory(spec, times, outDir);
  return engine.snap(spec, times, outDir, withRoot(opts));
}

export async function redub(spec, videoIn, outPath, opts = {}) {
  // A story's narration drives its timing, so new sound means a new render (fresh TTS only for changed scenes).
  if (spec.type === 'story') { await ttsStory(spec); return (await renderStory(spec, { out: outPath })).out; }
  return engine.redub(spec, videoIn, outPath, withRoot(opts));
}
