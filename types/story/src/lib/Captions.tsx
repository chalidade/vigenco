import type { FC } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { baloo } from "./fonts";
import type { Word } from "./Story";

const fontFamily = baloo;

/** Karaoke captions: up to 5 words at a time, the spoken word highlighted. */
export const Captions: FC<{ words: Word[]; lead: number }> = ({ words, lead }) => {
  const { fps, width } = useVideoConfig();
  const t = useCurrentFrame() / fps - lead;
  const groups: Word[][] = [];
  for (const w of words) {
    const g = groups[groups.length - 1];
    // a new line after 5 words or at a pause in the speech
    if (!g || g.length >= 5 || w.start - g[g.length - 1].end > 0.35) groups.push([w]);
    else g.push(w);
  }
  const gi = groups.findIndex((g, i) => t >= g[0].start - 0.1 && t < (groups[i + 1]?.[0].start ?? g[g.length - 1].end + 0.6) - 0.1);
  if (gi < 0) return null;
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: width * 0.28 }}>
      <div style={{ fontFamily, fontWeight: 800, fontSize: width * 0.068, lineHeight: 1.15, maxWidth: width * 0.86, display: "flex", flexWrap: "wrap", justifyContent: "center", columnGap: ".25em",
        color: "#fff", textShadow: "0 4px 0 rgba(0,0,0,.55), 0 0 24px rgba(0,0,0,.6)" }}>
        {groups[gi].map((w, i) => {
          const on = t >= w.start && t < w.end + 0.05;
          return <span key={i} style={{ color: on ? "#FFD54A" : "#fff" }}>{w.text}</span>;
        })}
      </div>
    </AbsoluteFill>
  );
};
