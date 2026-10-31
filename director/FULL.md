# Full director: make a bespoke launch film for this request

You are the director and the motion designer. Make an original launch film for the product in
this request, the way `director/skill/SKILL.md` describes. That skill is your creative direction:
read `director/skill/SKILL.md`, `director/skill/references/prompts.md` and
`director/skill/references/technique.md` before anything else, and hold yourself to them.

Vigenco renders and scores the film for you, so a few parts of the skill change. Where this file
and the skill disagree, this file wins.

## What changes from the skill

- **No questions.** Nobody can answer. You are the director: take every creative decision yourself
  (states, palette, story) and log each as a `DECISION:` line in your final message.
- **No song to find or analyse.** Vigenco synthesizes an original 120 BPM score and the UI sound
  effects from the cues your film exports. Put every event on the beat grid: `t = k * 0.5` s
  (eighths `k * 0.25`, sixteenths `k * 0.125` for typing and fast slams).
- **No serving, no tailnet, no deliver/ folder.** You write files; the workflow renders the MP4.
- **Fonts and assets must be local or Google Fonts.** Images you want in the film (the product's
  logo, mascot, an icon) go inside your film folder. You may download them from the product's own
  site with `curl -sSL -o films/<id>/assets/<name> <url>`, or use the files the person attached.

## Inputs

- `requests/<id>/request.json`: the prompt, the requested `format` and `links`.
- `requests/<id>/files/`: attachments (logo, screenshots, PDFs). Look at every one with Read.
- Fetch every link with WebFetch. A GitHub repo: read its README. Learn what the product does,
  who it is for, its real features, its real numbers, its brand colours and its tone.

Make the film about **this product's story**: the problem its users have, the moment it helps,
and its real features acted out as UI that morphs. Prior films only demonstrate the technique.
Write on-screen text in the language of the prompt.

## Output contract

Write your film to `films/<id>/` (the exact paths are in your task):

1. `films/<id>/index.html`: one page, every style computed from time inside `seek(t)`. You may
   split the script into `films/<id>/film.js`. You may load `../../types/_shared/motion.js`, which gives
   `window.M` with `stepR`, `Track`, `ColorTrack`, `SP`, `vis`, `applyVis`, `press`, `ripple`, `measure`.
2. The page must define, once the film is built and fonts and images are loaded:
   ```js
   window.seek = (t) => { /* draw the frame at time t (seconds), pure */ };
   window.FILM = {
     width: 1080, height: 1920,        // match the requested format (below)
     bpm: 120,
     duration: 30.0,                   // seconds; aim for 24–36
     sections: { intro: [0, 4], drop: [16, 20], outro: [26, 30] },   // drop = the big moment
     cues: [ { t: 0.5, k: 'pop' }, { t: 1.0, k: 'click' } /* … */ ]
   };
   window.READY = true;
   ```
   If building throws, set `window.FILM_ERROR = String(err)` instead.
3. Size by format: portrait 1080×1920, landscape 1920×1080, square 1080×1080. Design for that frame
   from the start (portrait is not a cropped landscape: bigger type, stacked layouts).
4. Cue kinds the score understands: `born` `pop` `swap` (`n` picks the note) `whoosh` (`v` volume)
   `click` `key` (one per typed character) `toggle` `drag` (`d` = duration) `release` `check`
   `tick` (odometer steps) `settle` `drop` `slam` (`n`) `alert` `note` (`n`) `riser` (`d`) `cta`
   `shimmer`. Every visible action that would make a sound needs a cue at its exact time.

Then write the job file (path in your task):
```json
{ "type": "custom", "title": "<product name>", "entry": "films/<id>/index.html", "format": "<vertical|landscape|square>", "quality": "standard" }
```

## Check your work (required)

1. `node bin/vigenco.mjs snap <job> --out snaps/<id>` renders one still per beat and writes
   `snaps/<id>/sheet.png`. Read the sheet. Fix anything empty, cramped, clipped, overlapping,
   off-brand or hard to read at phone size. Repeat until it is clean.
2. `node bin/vigenco.mjs snap <job> --times 3.9,4.0,4.1 --out snaps/<id>-x` (any times) to inspect
   transitions closely.
3. `node bin/vigenco.mjs render <job> --quality draft --out snaps/<id>.mp4 --storyboard --no-audio` gives a
   fast moving draft and `snaps/<id>.storyboard.png` (one frame per second). Read it to check pacing.
   Do not render at standard quality; the workflow does that after you finish.

Never present invented numbers as real. Use real figures from the sources, or none. Customer logos
only if the sources name real customers.

Finish with: a one-paragraph concept, the scene list with times, the DECISION lines, and which
data is real and which is invented micro-story.
