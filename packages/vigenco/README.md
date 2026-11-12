# vigenco

**Spec in, MP4 out.** Vigenco renders motion films written as HTML to 60 fps video, with real
motion blur and an original soundtrack synthesized to the film's beats. No After Effects, no
templates editor, no AI video model: every frame is a pure function of time.

```bash
npm install vigenco
npx playwright install chromium     # once, the browser Vigenco renders with
npx vigenco init                    # example launch job + a custom film
npx vigenco render vigenco-example/launch.json
```

Requires Node 20+ and [ffmpeg](https://ffmpeg.org/download.html) on your PATH.

## Two ways to make a video

### 1. Fill in the built-in launch film

A product launch film: one shape that never cuts (a dot becomes headline pills, a prompt field the
cursor types into, a loader, three interactive feature cards, a stat odometer on the music drop,
customer logos on the beat, and the brand outro). You only write JSON:

```jsonc
{
  "type": "launch",
  "format": "vertical",             // vertical 1080×1920 · landscape 1920×1080 · square 1080×1080
  "cursorName": "You",
  "brand": {
    "name": "Acme", "mark": "A", "url": "acme.app",
    "logo": "assets/logo.png",      // optional, relative to the job file
    "colors": { "bg": "#F5F3EF", "ink": "#111827", "surface": "#FFFFFF", "accent": ["#6C5CE7", "#E35C91", "#FF8A3D"] }
  },
  "intro":  { "lines": ["Ship videos", "without", "editing."] },
  "brief":  { "placeholder": "What should we make?", "text": "A launch video for my app", "button": "Make" },
  "features": [
    { "icon": "wand", "title": "…", "desc": "…", "widget": "toggle", "label": "…" },
    { "icon": "bolt", "title": "…", "desc": "…", "widget": "slider", "label": "…", "value": 10, "suffix": "x" },
    { "icon": "play", "title": "…", "desc": "…", "widget": "tabs", "tabs": ["A", "B", "C"] }
  ],
  "stat":   { "kicker": "Since beta", "value": 12480, "label": "videos rendered" },   // optional
  "logos":  ["…"],                                                                    // optional, up to 6
  "outro":  { "tagline": "Ideas in, videos out.", "cta": "acme.app" },
  "audio":  { "music": "assets/track.mp3", "musicOffset": 0 }                         // optional
}
```

Icons: `spark` `bolt` `chart` `clock` `shield` `heart` `globe` `play` `users` `wand` `check`.

### 2. Write your own film

A film is any HTML page that defines two things:

```js
window.seek = (t) => { /* draw the frame at t seconds; pure, no state between frames */ };
window.FILM = {
  width: 1080, height: 1920, bpm: 120, duration: 7,
  sections: { intro: [0, 1.5], drop: [4.5, 5.5], outro: [5, 7] },   // shapes the music (optional)
  cues: [{ t: 0.5, k: 'born' }, { t: 1.5, k: 'pop' }, { t: 4.5, k: 'drop' }],   // where sounds land
};
window.READY = true;   // or window.FILM_ERROR = 'message'
```

Point a job at it: `{ "entry": "my-film/index.html", "format": "vertical" }`. Vigenco calls `seek`
for every subframe, so CSS transitions and timers are never needed. `vigenco init` writes a
working example.

The motion primitives the launch film uses ship with the package (`vigenco/motion.js`, a plain
script that defines `window.M`): closed-form springs (`Track`, `ColorTrack`, presets in `SP`), blur
content swaps (`vis`, `applyVis`), press and ripple, text measuring. Load it with a `<script>` tag.

**Cue kinds** the synth understands: `born` `pop` `swap` (`n` picks the note) `whoosh` (`v` volume)
`click` `key` (one per typed character) `toggle` `drag` (`d` duration) `release` `check` `tick`
`settle` `drop` `slam` (`n`) `alert` `note` (`n`) `riser` (`d`) `cta` `shimmer`. Each sound is placed
so its own peak lands on the cue time. Unknown kinds play a soft click.

## CLI

```
vigenco render <job.json> [--quality draft|standard|high] [--out out/name.mp4] [--workers N] [--no-audio] [--storyboard]
vigenco snap   <job.json> [--times beats|0.5,2,7.25] [--out snaps/name]     stills + contact sheet
vigenco redub  <job.json> --video in.mp4 [--out out/name.mp4]              new soundtrack, same picture
vigenco audio  <job.json> [--out out/name.wav]                             soundtrack only
vigenco inspect <job.json>                                                 duration, size, cues
vigenco init   [folder]
```

| Quality | Frame rate | Motion blur | Approx. time for 24 s on 2 cores |
|---|---|---|---|
| `draft` | 30 fps | none | ~1 min |
| `standard` | 60 fps | 2 subframes | ~4–6 min |
| `high` | 60 fps | 4 subframes, lossless frames | ~30–40 min |

Set `CHROMIUM_PATH` to use an existing Chromium or Chrome instead of Playwright's.

## API

```js
import { render, snap, redub, inspect, loadJob, synthesize } from 'vigenco';

const spec = await loadJob('launch.json');
const { out, film } = await render(spec, {
  out: 'out/launch.mp4',
  quality: 'standard',
  baseDir: process.cwd(),            // where relative paths in the spec resolve
  onProgress: (done, total) => {},
});
```

`snap(spec, times, outDir, opts)`, `redub(spec, videoIn, outPath, opts)`, `inspect(spec, opts)` and
`synthesize(film, wavPath)` work the same way. `setLogger(fn)` replaces or silences the log.

## How it renders

Headless Chromium opens the film, Vigenco seeks every subframe and pipes screenshots into ffmpeg,
which averages subframes (`tmix`) for real motion blur and encodes H.264 BT.709. Several pages render
contiguous chunks in parallel. The soundtrack is synthesized at the same time from the film's cues:
an original 120 BPM bed (pad, kick, hats, claps, bass, snare build, drop) arranged to the film's
sections, plus UI sound effects, all generated from scratch in JavaScript, so there is nothing to
license.

## License

MIT. The motion technique is adapted from
[product-launch-motion](https://github.com/AbubakrChan/product-launch-motion) (MIT); see `NOTICE`.
Inter is bundled under the SIL Open Font License 1.1.
