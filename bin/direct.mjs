#!/usr/bin/env node
// node bin/direct.mjs <request-dir> <out-job.json>
// Runs Claude Code headless as the director: it reads the request (prompt, files, links) and writes
// a Vigenco job JSON. Needs ANTHROPIC_API_KEY (or CLAUDE_CODE_OAUTH_TOKEN) in the environment.
import { spawn } from 'node:child_process';
import { readFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const [reqDir, outJob] = process.argv.slice(2);
if (!reqDir || !outJob) { console.error('usage: direct.mjs <request-dir> <out-job.json>'); process.exit(1); }

const req = JSON.parse(await readFile(path.join(reqDir, 'request.json'), 'utf8'));
const filesDir = path.join(reqDir, 'files');
const files = existsSync(filesDir) ? (await readdir(filesDir)).map((f) => path.join(filesDir, f)) : [];

const task = `You are directing Vigenco request "${req.id}".
Follow director/DIRECTOR.md exactly (read it first).
Request folder: ${reqDir}
Request file: ${path.join(reqDir, 'request.json')}
Attached files (${files.length}): ${files.length ? files.join(', ') : 'none'}
Links (${(req.links || []).length}): ${(req.links || []).join(', ') || 'none'}
Format requested: ${req.format}
Write the job JSON to: ${outJob}`;

const tools = ['Read', 'Write', 'Edit', 'Glob', 'Grep', 'WebFetch', 'WebSearch', 'Bash(node bin/vigenco.mjs snap:*)'];
const args = ['-p', task, '--allowedTools', tools.join(','), '--max-turns', process.env.DIRECTOR_MAX_TURNS || '40'];
if (process.env.CLAUDE_MODEL) args.push('--model', process.env.CLAUDE_MODEL);

console.log('[director] starting Claude Code…');
const code = await new Promise((resolve) => {
  const p = spawn('claude', args, { stdio: ['ignore', 'inherit', 'inherit'] });
  p.on('error', (e) => { console.error('[director] could not start claude:', e.message); resolve(1); });
  p.on('close', resolve);
});
if (code !== 0) { console.error(`[director] claude exited with ${code}`); process.exit(code || 1); }
if (!existsSync(outJob)) { console.error(`[director] no job written at ${outJob}`); process.exit(1); }
console.log(`[director] job written → ${outJob}`);
