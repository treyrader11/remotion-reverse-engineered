import type { PlayerRef } from "@remotion/player";
import { useRef } from "react";
import { PreviewContainer } from "./layout";
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

/**
 * Track
 * { items: [], id: '1', name: 'Track 1' }
 *
 * Video Item
 * { id: '1', durationInFrames: 58, from: 0, type: 'video', videoUrl: 'https://parser.media/video.mp4', isDragging: false, videoDurationInSeconds: 5, videoStartFromInSeconds: 0 }
 *
 * Image Item
 * { id: '2', durationInFrames: 92, from: 58, type: 'image', imgUrl: '/remotion-banner.png', isDragging: false }
 *
 * Text Item
 * { id: '3', durationInFrames: 75, from: 150, type: 'text', text: 'Remotion', color: '#ff0000', isDragging: false }
 *
 * Animation Item
 * { id: '4', durationInFrames: 75, from: 225, type: 'solid', color: 'purple', isDragging: false }
 */

// export const EditingTimeline = ({ tracks } : { tracks: TrackType[] }) => {
// 	const playerRef = useRef<PlayerRef>(null);
// 	// const timelineContainerRef = useRef<HTMLDivElement>(null);
// 	const timelineContainerSize = useElementSize(timelineContainerRef);
// 	const timelineContainerWidth = timelineContainerSize?.width;

// 	return (
// 		<TimelineProvider
// 			onChange={(newState) => {
// 				console.log('New timeline state:', newState);
// 			}}
// 			initialState={{ tracks, fps: 30 }}
// 		>
// 			<TimelineZoomProvider initialZoom={1}>
// 				<PreviewContainer>
// 					<VideoPreview loop={false} playerRef={playerRef} />
// 					{/* <ActionRow playerRef={playerRef} /> */}
// 				</PreviewContainer>

// 				{/* <TimelineContainer timelineContainerRef={timelineContainerRef}>
// 					{timelineContainerWidth ? (
// 						<TimelineSizeProvider containerWidth={timelineContainerWidth}>
// 							<Timeline playerRef={playerRef} />
// 						</TimelineSizeProvider>
// 					) : null}
// 				</TimelineContainer> */}
// 			</TimelineZoomProvider>
// 		</TimelineProvider>
// 	);
// };

export const EditingTimeline = ({ tracks }: { tracks: TrackType[] }) => {
  const playerRef = useRef<PlayerRef>(null);
  const timelineContainerSize = useElementSize(timelineContainerRef);
  const timelineContainerWidth = timelineContainerSize?.width;

  return (
    <TimelineProvider
      onChange={(newState) => {
        console.log("New timeline state:", newState);
      }}
      initialState={{ tracks, fps: 30 }}
    >
      <TimelineZoomProvider initialZoom={1}>
        <PreviewContainer>
          <VideoPreview loop={false} playerRef={playerRef} />
          <ActionRow playerRef={playerRef} />
        </PreviewContainer>

        {/* <TimelineContainer timelineContainerRef={timelineContainerRef}> */}
        <TimelineContainer>
          {timelineContainerWidth ? (
            <TimelineSizeProvider containerWidth={timelineContainerWidth}>
              <Timeline playerRef={playerRef} />
            </TimelineSizeProvider>
          ) : null}
        </TimelineContainer>
      </TimelineZoomProvider>
    </TimelineProvider>
  );
};
