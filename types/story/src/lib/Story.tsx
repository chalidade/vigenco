import type { FC } from "react";
import { AbsoluteFill, Html5Audio, Sequence, Series, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { stories } from "../stories";
import { Captions } from "./Captions";

export type Word = { text: string; start: number; end: number };
export type SceneTiming = { audio: string; lead: number; frames: number; words: Word[] };
export type Timeline = { fps: number; scenes: SceneTiming[] };
/** What every scene component receives. Use useCurrentFrame() inside it: frame 0 = scene start. */
export type SceneProps = { frames: number; words: Word[]; lead: number };
export type StoryEntry = {
  story: { id: string; width?: number; height?: number; captions?: boolean; scenes: { narration: string; captions?: boolean; pause?: number }[] };
  scenes: FC<SceneProps>[];
};

const FADE = 9; // frames: each scene dips through black at its edges

const Fade: FC<{ frames: number; children: React.ReactNode }> = ({ frames, children }) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, FADE, frames - FADE, frames], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ opacity: o }}>{children}</AbsoluteFill>;
};

export const Story: FC<{ slug: string; timeline: Timeline | null }> = ({ slug, timeline }) => {
  const { fps } = useVideoConfig();
  const entry = stories.find((s) => s.story.id === slug);
  if (!entry || !timeline) return <AbsoluteFill style={{ background: "#000", color: "#fff", fontSize: 48, padding: 80 }}>Run: npm run tts -- {slug}</AbsoluteFill>;
  if (entry.scenes.length !== timeline.scenes.length) throw new Error(`${slug}: ${entry.scenes.length} scene components but ${timeline.scenes.length} narrated scenes; rerun tts`);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Series>
        {timeline.scenes.map((sc, i) => {
          const Scene = entry.scenes[i];
          return (
            <Series.Sequence key={i} durationInFrames={sc.frames}>
              <Fade frames={sc.frames}>
                <Scene frames={sc.frames} words={sc.words} lead={sc.lead} />
              </Fade>
              <Sequence from={Math.round(sc.lead * fps)} layout="none">
                <Html5Audio src={staticFile(sc.audio)} />
              </Sequence>
              {entry.story.captions !== false && entry.story.scenes[i]?.captions !== false && <Captions words={sc.words} lead={sc.lead} />}
            </Series.Sequence>
          );
        })}
      </Series>
    </AbsoluteFill>
  );
};
