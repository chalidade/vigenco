// Narration for one story: src/stories/<slug>/story.json -> public/<slug>/scene-NN.mp3 + timeline.json
//   node scripts/tts.mjs <slug>
// story.json "engine": "edge" (default, free, no key) | "elevenlabs" (needs ELEVENLABS_API_KEY in .env)
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

try { process.loadEnvFile(".env"); } catch {}
const slug = process.argv[2];
if (!slug) { console.log("usage: node scripts/tts.mjs <slug>"); process.exit(1); }
const story = JSON.parse(fs.readFileSync(`src/stories/${slug}/story.json`, "utf8"));
const FPS = 30, LEAD = 0.4, TAIL = story.pause ?? 0.7; // seconds before / after each scene's narration
const outDir = `public/${slug}`;
fs.mkdirSync(outDir, { recursive: true });

const engine = story.engine ?? "edge";
const ENGINES = {
  async edge() {
    const tts = new MsEdgeTTS();
    await tts.setMetadata(story.voice ?? "id-ID-GadisNeural", OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3, { wordBoundaryEnabled: true });
    return {
      key: [story.voice, story.rate],
      async say(text) {
        const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "story-tts-"));
        const { audioFilePath, metadataFilePath } = await tts.toFile(tmp, text, { rate: story.rate ?? "+0%" });
        const audio = fs.readFileSync(audioFilePath);
        const words = JSON.parse(fs.readFileSync(metadataFilePath, "utf8")).Metadata
          .filter((m) => m.Type === "WordBoundary")
          .map(({ Data: d }) => ({ text: d.text.Text, start: d.Offset / 1e7, end: (d.Offset + d.Duration) / 1e7 }));
        fs.rmSync(tmp, { recursive: true, force: true });
        return { audio, words };
      },
      close: () => tts.close(),
    };
  },
  async elevenlabs() {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) throw new Error("ELEVENLABS_API_KEY is not set: put it in .env (see .env.example)");
    if (!story.voice) throw new Error('story.json needs "voice": an ElevenLabs voice_id (list them with: npm run voices)');
    const model = story.model ?? "eleven_multilingual_v2";
    const settings = { stability: 0.4, similarity_boost: 0.8, style: 0.3, use_speaker_boost: true, ...story.voiceSettings };
    const scenes = story.scenes;
    return {
      key: [story.voice, model, settings],
      async say(text, i) {
        const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${story.voice}/with-timestamps?output_format=mp3_44100_128`, {
          method: "POST",
          headers: { "xi-api-key": apiKey, "content-type": "application/json" },
          // neighbouring narration keeps the intonation continuous across scene files
          body: JSON.stringify({ text, model_id: model, voice_settings: settings, language_code: story.language,
            previous_text: scenes[i - 1]?.narration, next_text: scenes[i + 1]?.narration }),
        });
        if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${await res.text()}`);
        const { audio_base64, alignment: a } = await res.json();
        // characters -> words, dropping punctuation at word edges (Edge's timings have none either)
        const words = [];
        let cur = null;
        a.characters.forEach((ch, k) => {
          if (/\s/.test(ch)) { cur = null; return; }
          if (!cur) words.push((cur = { text: "", start: a.character_start_times_seconds[k], end: 0 }));
          cur.text += ch;
          cur.end = a.character_end_times_seconds[k];
        });
        return {
          audio: Buffer.from(audio_base64, "base64"),
          words: words.map((w) => ({ ...w, text: w.text.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "") })).filter((w) => w.text),
        };
      },
      close() {},
    };
  },
};
if (!ENGINES[engine]) throw new Error(`unknown engine "${engine}" (edge | elevenlabs)`);

// Reuse a scene's audio when nothing that shapes it changed: ElevenLabs bills every call.
const prev = fs.existsSync(`${outDir}/timeline.json`) ? JSON.parse(fs.readFileSync(`${outDir}/timeline.json`, "utf8")).scenes : [];
let tts;
const scenes = [];
for (const [i, scene] of story.scenes.entries()) {
  const name = `scene-${String(i + 1).padStart(2, "0")}.mp3`;
  tts ??= await ENGINES[engine]();
  const key = crypto.createHash("sha1").update(JSON.stringify([engine, tts.key, scene.narration])).digest("hex");
  let words = prev[i]?.key === key && fs.existsSync(path.join(outDir, name)) ? prev[i].words : null;
  const cached = !!words;
  if (!words) {
    const r = await tts.say(scene.narration, i);
    if (!r.words.length) throw new Error(`scene ${i + 1}: TTS returned no word timings`);
    fs.writeFileSync(path.join(outDir, name), r.audio);
    words = r.words;
  }
  // TTS pads silence after the speech, so time the scene to the last word, not the file
  const dur = words[words.length - 1].end;
  scenes.push({ audio: `${slug}/${name}`, key, lead: LEAD, frames: Math.ceil((LEAD + dur + (scene.pause ?? TAIL)) * FPS), words });
  console.log(`scene ${i + 1}: ${dur.toFixed(1)}s, ${words.length} words${cached ? " (cached)" : ""}`);
}
tts?.close();
fs.writeFileSync(`${outDir}/timeline.json`, JSON.stringify({ fps: FPS, scenes }, null, 1));
console.log(`total ${(scenes.reduce((a, s) => a + s.frames, 0) / FPS).toFixed(1)}s -> ${outDir}/timeline.json`);
