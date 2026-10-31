#!/usr/bin/env node
// node bin/direct.mjs <request-dir> <out-job.json> [--mode quick|full] [--notes out/director.md]
// Runs Claude Code headless as the director.
//   quick: fills the built-in "launch" template (director/DIRECTOR.md)
//   full:  writes a bespoke film under films/<id>/ following the product-launch-motion skill (director/FULL.md)
// Needs ANTHROPIC_API_KEY (or CLAUDE_CODE_OAUTH_TOKEN) in the environment.
import { spawn } from 'node:child_process';
import { readFile, readdir, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const flag = (k, d) => { const i = args.indexOf(`--${k}`); return i >= 0 ? args[i + 1] : d; };
const [reqDir, outJob] = args.filter((a, i) => !a.startsWith('--') && !(i > 0 && args[i - 1].startsWith('--')));
if (!reqDir || !outJob) { console.error('usage: direct.mjs <request-dir> <out-job.json> [--mode quick|full]'); process.exit(1); }

const req = JSON.parse(await readFile(path.join(reqDir, 'request.json'), 'utf8'));
const mode = flag('mode', req.mode === 'quick' ? 'quick' : 'full');
const notes = flag('notes', null);
const filesDir = path.join(reqDir, 'files');
const files = existsSync(filesDir) ? (await readdir(filesDir)).map((f) => path.join(filesDir, f)) : [];
const fmt = { portrait: 'vertical', vertical: 'vertical', landscape: 'landscape', square: 'square' }[req.format] || 'vertical';
const size = { vertical: '1080×1920', landscape: '1920×1080', square: '1080×1080' }[fmt];

const common = `Request id: ${req.id}
Request folder: ${reqDir} (request.json + files/)
Attached files (${files.length}): ${files.length ? files.join(', ') : 'none'}
Links (${(req.links || []).length}): ${(req.links || []).join(', ') || 'none'}
Format: ${req.format} → job format "${fmt}", frame ${size}`;

const task = mode === 'full'
  ? `You are the full director for Vigenco request "${req.id}". Read director/FULL.md first and follow it exactly.
${common}
Film folder: films/${req.id}/ (entry films/${req.id}/index.html)
Write the job JSON to: ${outJob}`
  : `You are directing Vigenco request "${req.id}". Follow director/DIRECTOR.md exactly (read it first).
${common}
Write the job JSON to: ${outJob}`;

const tools = mode === 'full'
  ? ['Read', 'Write', 'Edit', 'MultiEdit', 'Glob', 'Grep', 'WebFetch', 'WebSearch', 'TodoWrite',
     'Bash(node bin/vigenco.mjs:*)', 'Bash(curl -sSL:*)', 'Bash(mkdir:*)', 'Bash(ls:*)', 'Bash(node --check:*)', 'Bash(python3:*)', 'Bash(ffprobe:*)']
  : ['Read', 'Write', 'Edit', 'Glob', 'Grep', 'WebFetch', 'WebSearch', 'Bash(node bin/vigenco.mjs snap:*)'];
const cli = ['-p', task, '--allowedTools', tools.join(','), '--max-turns', process.env.DIRECTOR_MAX_TURNS || (mode === 'full' ? '200' : '40')];
const model = process.env.CLAUDE_MODEL || (mode === 'full' ? 'opus' : '');
if (model) cli.push('--model', model);
if (mode === 'full') await mkdir(path.join('films', req.id, 'assets'), { recursive: true });

console.log(`[director] mode=${mode}${model ? ` model=${model}` : ''}, starting Claude Code…`);
let out = '';
const code = await new Promise((resolve) => {
  const p = spawn('claude', cli, { stdio: ['ignore', 'pipe', 'inherit'] });
  p.stdout.on('data', (d) => { process.stdout.write(d); out += d; });
  p.on('error', (e) => { console.error('[director] could not start claude:', e.message); resolve(1); });
  p.on('close', resolve);
});
if (notes) await writeFile(notes, out.trim() + '\n');
if (code !== 0) { console.error(`[director] claude exited with ${code}`); process.exit(code || 1); }
if (!existsSync(outJob)) { console.error(`[director] no job written at ${outJob}`); process.exit(1); }
if (mode === 'full') {
  const job = JSON.parse(await readFile(outJob, 'utf8'));
  job.type = 'custom'; job.entry = `films/${req.id}/index.html`; job.format = fmt; job.quality = job.quality || 'standard';
  if (!existsSync(job.entry)) { console.error(`[director] film entry missing: ${job.entry}`); process.exit(1); }
  await writeFile(outJob, JSON.stringify(job, null, 2) + '\n');
}
console.log(`[director] job written → ${outJob}`);
