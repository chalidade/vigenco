#!/usr/bin/env node
// node bin/validate-job.mjs <job.json> [request.json]
// Normalises a director-written job so the renderer never gets something it can't draw:
// forces the requested format, clips text to its on-screen limits, drops invalid parts.
import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const [jobPath, reqPath] = process.argv.slice(2);
const job = JSON.parse(await readFile(jobPath, 'utf8'));
const req = reqPath && existsSync(reqPath) ? JSON.parse(await readFile(reqPath, 'utf8')) : {};
const warn = [];

const str = (v, max, key) => {
  if (v == null) return v;
  let s = String(v).replace(/\s+/g, ' ').trim();
  if (s.length > max) { warn.push(`${key} clipped to ${max} chars`); s = s.slice(0, max - 1).trimEnd() + '…'; }
  return s;
};
const hex = (v, d) => (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v || '') ? v : d);
const ICONS = ['spark', 'bolt', 'chart', 'clock', 'shield', 'heart', 'globe', 'play', 'users', 'wand', 'check'];
const WIDGETS = ['toggle', 'slider', 'tabs'];

job.type = 'launch';
const fmt = { portrait: 'vertical', vertical: 'vertical', landscape: 'landscape', square: 'square' };
job.format = fmt[req.format] || fmt[job.format] || 'vertical';
job.quality = job.quality || 'standard';
job.cursorName = str(job.cursorName || 'You', 12, 'cursorName');

const b = (job.brand = job.brand || {});
b.name = str(b.name || 'Product', 16, 'brand.name');
b.mark = str(b.mark || b.name[0].toUpperCase(), 2, 'brand.mark');
if (b.url) b.url = str(String(b.url).replace(/^https?:\/\//, '').replace(/\/$/, ''), 24, 'brand.url');
if (b.logo) {
  const ok = /^requests\/[a-z0-9-]+\/files\/[a-z0-9._-]+\.(png|jpe?g|webp|svg)$/i.test(b.logo) && existsSync(b.logo);
  if (!ok) { warn.push(`brand.logo "${b.logo}" ignored`); delete b.logo; }
}
const c = (b.colors = b.colors || {});
c.bg = hex(c.bg, '#F5F3EF'); c.ink = hex(c.ink, '#111827'); c.surface = hex(c.surface, '#FFFFFF');
c.accent = (Array.isArray(c.accent) ? c.accent : []).filter((x) => hex(x, null)).slice(0, 3);
if (!c.accent.length) c.accent = ['#6C5CE7', '#E35C91', '#FF8A3D'];

const lines = (job.intro && Array.isArray(job.intro.lines) ? job.intro.lines : [b.name]).slice(0, 3);
job.intro = { lines: lines.map((l, i) => str(l, 16, `intro.lines[${i}]`)).filter(Boolean) };

const br = (job.brief = job.brief || {});
br.text = str(br.text || `Make something with ${b.name}`, 44, 'brief.text');
br.placeholder = str(br.placeholder || 'Type anything…', 32, 'brief.placeholder');
br.button = str(br.button || 'Go', 12, 'brief.button');

job.features = (Array.isArray(job.features) ? job.features : []).slice(0, 3).map((f, i) => {
  const o = {
    icon: ICONS.includes(f.icon) ? f.icon : 'spark',
    title: str(f.title || '', 24, `features[${i}].title`),
    desc: str(f.desc || '', 96, `features[${i}].desc`),
    widget: WIDGETS.includes(f.widget) ? f.widget : WIDGETS[i % 3],
  };
  if (f.label) o.label = str(f.label, 20, `features[${i}].label`);
  if (o.widget === 'slider') {
    o.value = Number.isFinite(+f.value) ? Math.round(+f.value) : 100;
    o.suffix = f.suffix != null ? str(f.suffix, 4, 'suffix') : '%';
    if (f.prefix) o.prefix = str(f.prefix, 4, 'prefix');
  }
  if (o.widget === 'tabs') o.tabs = (Array.isArray(f.tabs) && f.tabs.length ? f.tabs : ['A', 'B', 'C']).slice(0, 3).map((t, k) => str(t, 10, `tabs[${k}]`));
  return o;
});

if (job.stat && Number.isFinite(+job.stat.value) && +job.stat.value > 0) {
  const s = job.stat;
  job.stat = { value: Math.round(+s.value), kicker: str(s.kicker || '', 24, 'stat.kicker'), label: str(s.label || '', 40, 'stat.label'), prefix: str(s.prefix || '', 3, 'stat.prefix'), suffix: str(s.suffix || '', 3, 'stat.suffix') };
} else delete job.stat;

if (Array.isArray(job.logos) && job.logos.length) {
  job.logos = job.logos.slice(0, 6).map((l, i) => str(l, 18, `logos[${i}]`));
  job.logosLabel = str(job.logosLabel || 'Trusted by', 24, 'logosLabel');
} else { delete job.logos; delete job.logosLabel; }

const o = (job.outro = job.outro || {});
o.tagline = str(o.tagline || '', 52, 'outro.tagline');
o.cta = str(o.cta || b.url || '', 24, 'outro.cta');
delete job.audio;

await writeFile(jobPath, JSON.stringify(job, null, 2) + '\n');
console.log(`[validate] ${jobPath}: ${job.format}, ${job.features.length} features${job.stat ? ', stat' : ''}${job.logos ? `, ${job.logos.length} logos` : ''}${b.logo ? ', logo' : ''}`);
for (const w of warn) console.log('[validate] warning:', w);
