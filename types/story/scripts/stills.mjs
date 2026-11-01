// node scripts/stills.mjs <id> <outDir> [times|"auto"]
// Bundles once and renders PNG stills: "auto" = three per scene (start, middle, end) from timeline.json.
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import fs from "node:fs";
import path from "node:path";

const [id, outDir, which = "auto"] = process.argv.slice(2);
if (!id || !outDir) { console.log("usage: node scripts/stills.mjs <id> <outDir> [auto|t1,t2,…]"); process.exit(1); }
fs.mkdirSync(outDir, { recursive: true });
const tl = JSON.parse(fs.readFileSync(`public/${id}/timeline.json`, "utf8"));
let frames = [];
if (which === "auto") {
  let at = 0;
  for (const s of tl.scenes) { frames.push(at + 12, at + Math.round(s.frames / 2), at + s.frames - 14); at += s.frames; }
} else frames = which.split(",").map((t) => Math.round(parseFloat(t) * tl.fps));
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const browserExecutable = process.env.REMOTION_BROWSER || null;
const composition = await selectComposition({ serveUrl, id, browserExecutable });
for (const f of frames) {
  const frame = Math.max(0, Math.min(composition.durationInFrames - 1, f));
  const output = path.join(outDir, `f${String(frame).padStart(5, "0")}.png`);
  await renderStill({ composition, serveUrl, output, frame, browserExecutable, scale: 0.5 });
  console.log(output);
}
