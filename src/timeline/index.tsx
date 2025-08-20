import type { PlayerRef } from "@remotion/player";
import { useRef } from "react";
import { AppLayout, PreviewContainer } from "./layout";
import { ActionRow } from "./remotion-timeline/components/action-row";
import {
  Timeline,
  TimelineContainer,
} from "./remotion-timeline/components/timeline";
import {
  TimelineProvider,
  type TimelineInitialState,
} from "./remotion-timeline/context/provider";
import { TimelineSizeProvider } from "./remotion-timeline/context/timeline-size-provider";
import { TimelineZoomProvider } from "./remotion-timeline/context/timeline-zoom-provider";
import { useElementSize } from "./remotion-timeline/hooks/use-element-size";
import { TrackType } from "./remotion-timeline/types";
import { timelineContainerRef } from "./remotion-timeline/utils/restore-scroll-after-zoom";
import { VideoPreview } from "./video-preview";

const initialState: TimelineInitialState = {
  fps: 30,
  tracks: [
    {
      id: 'track-1',
      name: 'Track 1',
      items: []
    }
  ]
};

export const TimelineApp: React.FC = () => {
  const playerRef = useRef<PlayerRef>(null);
  const { size } = useElementSize(timelineContainerRef);

  return (
    <AppLayout>
      <PreviewContainer>
        <TimelineProvider initialState={initialState}>
          <TimelineZoomProvider>
            <TimelineSizeProvider size={size}>
              <VideoPreview loop={false} playerRef={playerRef} />
              <ActionRow playerRef={playerRef} />
              <TimelineContainer>
                <Timeline playerRef={playerRef} />
              </TimelineContainer>
            </TimelineSizeProvider>
          </TimelineZoomProvider>
        </TimelineProvider>
      </PreviewContainer>
    </AppLayout>
  );
};