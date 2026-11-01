import { Composition, staticFile } from "remotion";
import { Story, type Timeline } from "./lib/Story";
import { stories } from "./stories";

export const Root = () => (
  <>
    {stories.map((s) => (
      <Composition
        key={s.story.id}
        id={s.story.id}
        component={Story}
        width={s.story.width ?? 1080}
        height={s.story.height ?? 1920}
        fps={30}
        durationInFrames={30}
        defaultProps={{ slug: s.story.id, timeline: null as Timeline | null }}
        calculateMetadata={async ({ props }) => {
          const timeline: Timeline = await fetch(staticFile(`${s.story.id}/timeline.json`)).then((r) => r.json());
          return { durationInFrames: timeline.scenes.reduce((a, x) => a + x.frames, 0), props: { ...props, timeline } };
        }}
      />
    ))}
  </>
);
