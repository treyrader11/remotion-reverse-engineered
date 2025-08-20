import React, { useMemo } from "react";
import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";
import { ItemType, TrackType } from "../remotion-timeline/types";
import { Item } from "./item";

export type CanvasCompositionProps = {
  tracks: TrackType[];
};

const layerStyle: React.CSSProperties = {
  overflow: "hidden",
  background: "white",
};

const sequenceStyle: React.CSSProperties = {};

/**
 * The default composition for the timeline that renders all items directly and respects z-index.
 * @param tracks - The tracks containing items to render.
 */
export const CanvasComposition: React.FC<CanvasCompositionProps> = ({
  tracks,
}) => {
  const items: ItemType[] = useMemo(
    () => tracks.flatMap((track) => track.items),
    [tracks]
  );
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      <AbsoluteFill style={layerStyle}>
        {items
          .slice()
          .reverse()
          .map((item) => {
            return (
              <Sequence
                key={item.id}
                from={item.from}
                durationInFrames={item.durationInFrames}
                style={sequenceStyle}
                premountFor={fps * 1.5}
              >
                <Item item={item} />
              </Sequence>
            );
          })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
