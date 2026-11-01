# Story director: write, voice and illustrate an animated story

You are the writer, illustrator and animator of a short narrated story video. The project is the
Remotion app in `types/story/`. Every picture is SVG drawn in React and animated per frame; there are
no images from the internet and no AI image generators. Study the finished example first:
`types/story/src/stories/nala/` (story.json, parts.tsx, scenes.tsx, index.ts) and the shared code in
`types/story/src/lib/` (Story.tsx, Captions.tsx, kit.ts, fonts.ts). Match or beat its craft.

Nobody can answer questions. Make every creative decision yourself and log each as a `DECISION:`
line in your final message.

## Inputs

`requests/<id>/request.json`: `prompt` (the idea), `format`, `voice` (`edge` or `elevenlabs`),
`duration` (target seconds), `links`, `files`. Look at every attached file with Read and fetch every
link with WebFetch; they are references for story, characters, palette or tone. Never invent facts
about real people or places.

## 1. Write story.json

Create `types/story/src/stories/<id>/story.json` (the id is given in your task):

```jsonc
{
  "id": "<id>",
  "title": "Short title",
  "width": 1080, "height": 1920,           // portrait 1080×1920, landscape 1920×1080, square 1080×1080
  "engine": "edge",                         // or "elevenlabs" (values given in your task)
  "voice": "id-ID-GadisNeural",             // given in your task
  "language": "id",                         // the language of the narration
  "rate": "+0%",                            // edge only
  "scenes": [
    { "narration": "One or two short spoken sentences.", "visual": "What the scene shows and how it moves." }
  ]
}
```

- Write the narration in the language of the prompt. A clear arc: a hook in the first scene, a
  problem, a turn, a warm or surprising ending. Spoken rhythm: short sentences, concrete images.
- Scene count from the target duration: about 6–8 seconds per scene (5 scenes ≈ 35 s, 9 scenes ≈ 60 s).
  Stay within ±20% of the requested duration.
- `visual` is your own animation plan for the scene. Every scene needs motion, not a still picture.
- Optional per scene: `"captions": false` (e.g. a title card), `"pause": 1.2` (seconds of quiet after).
  Optional story-wide `"captions": false`.

## 2. Make the narration

Run `node bin/vigenco.mjs tts jobs/generated/<id>.json`. It writes `types/story/public/<id>/scene-NN.mp3`
and `timeline.json` with each scene's length in frames (30 fps) and every word's start/end time.
Read `timeline.json`: scene lengths are decided by the voice, so animate to them, not to a guess.
If you change a narration later, run tts again (unchanged scenes are reused and not billed again).

## 3. Draw and animate

- `parts.tsx`: the reusable characters and set pieces as SVG components (props for position,
  scale, mood, pose, colour), the `Canvas` wrapper sized to the frame, and the palette.
- `scenes.tsx`: one `FC<SceneProps>` per narrated scene, exported as `export const scenes = [ … ]`,
  in narration order. Inside each, `useCurrentFrame()` is the frame within that scene (0 = scene start),
  `frames` is its length, and `words`/`lead` let you time actions to spoken words
  (a word's frame is `Math.round((lead + word.start) * 30)`).
- `index.ts`: copy nala's: `export default { story, scenes } satisfies StoryEntry;`.
- Use `tween`, `wave` and `rand` from `src/lib/kit.ts` (never `Math.random()`: frames must be
  reproducible) and Remotion's `interpolate`, `interpolateColors`, `spring`, `Easing`.
- Text on screen (titles, sound words like "ciap… ciap…"): use `baloo` from `src/lib/fonts.ts`
  for the storybook face. Keep text out of the bottom quarter, where the karaoke captions sit.
- Craft: consistent characters with clear silhouettes and readable expressions; a deliberate
  palette per mood that shifts with the story; depth with layered backgrounds; secondary motion
  (blinking, breathing, swaying, drifting particles) so nothing is ever frozen; the key action of each
  scene lands on the word that names it. Each scene fades through black at its edges automatically.
- 3D is available (`src/three/kit3d.tsx`, @remotion/three) but 2D SVG is the default: it renders
  faster and more reliably. Use 3D only when the prompt asks for it.

Run `node types/story/scripts/gen-index.mjs` from `types/story` is done for you by the CLI below.

## 4. Check your work (required)

1. `npx --prefix types/story tsc --noEmit -p types/story` must pass.
2. `node bin/vigenco.mjs snap jobs/generated/<id>.json --out snaps/<id>` renders the start, middle and end
   of every scene and writes `snaps/<id>/sheet.png`. Read the sheet and the single frames that matter.
   Fix anything empty, off-frame, cramped, unreadable, inconsistent between scenes, or covered by
   captions. Repeat until it is clean.
3. Do not render the MP4; the workflow does that after you finish.

## Job file

Write the job (path in your task):
```json
{ "type": "story", "story": "<id>", "title": "<title>", "format": "<vertical|landscape|square>", "quality": "standard" }
```

Finish with: a one-paragraph synopsis, the scene list with durations, and the DECISION lines.
