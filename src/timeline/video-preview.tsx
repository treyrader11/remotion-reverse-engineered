import {Player, PlayerRef} from '@remotion/player';
import React, {useCallback, useMemo} from 'react';

import {CanvasComposition, CanvasCompositionProps} from './canvas/main';
import {useTimelineContext} from './remotion-timeline/context/use-timeline-context';

const DEFAULT_COMP_WIDTH = 1920;
const DEFAULT_COMP_HEIGHT = 1080;

export const VideoPreview: React.FC<{
	playerRef: React.RefObject<PlayerRef | null>;
	loop: boolean;
}> = ({playerRef, loop}) => {
	const {setSelectedItem, durationInFrames, tracks, fps} = useTimelineContext();

	const onPointerDownEmptySpace: React.MouseEventHandler<HTMLDivElement> =
		useCallback(() => {
			setSelectedItem(null);
		}, [setSelectedItem]);

	const inputProps: CanvasCompositionProps = useMemo(
		() => ({
			tracks,
		}),
		[tracks],
	);

	return (
		<div className="flex w-full items-center">
			<div
				className="flex w-full items-center justify-center"
				onPointerDown={onPointerDownEmptySpace}
			>
				<div className="aspect-video h-full w-full overflow-hidden rounded-md shadow-2xl sm:h-full sm:w-[40rem]">
					<Player
						ref={playerRef}
						controls
						alwaysShowControls
						component={CanvasComposition}
						durationInFrames={Math.floor(durationInFrames) + 1}
						outFrame={Math.max(1, Math.floor(durationInFrames) - 1)}
						compositionHeight={DEFAULT_COMP_HEIGHT}
						compositionWidth={DEFAULT_COMP_WIDTH}
						fps={fps}
						style={{width: '100%', height: '100%'}}
						inputProps={inputProps}
						loop={loop}
						browserMediaControlsBehavior={{mode: 'register-media-session'}}
						spaceKeyToPlayOrPause={false}
					/>
				</div>
			</div>
		</div>
	);
};
