import {PlayerRef} from '@remotion/player';
import React, {useMemo} from 'react';
import {PLAYHEAD_WIDTH} from '../constants';
import {useTimelineContext} from '../context/use-timeline-context';
import {useTimelineSize} from '../context/use-timeline-size';
import {useTimelinePosition} from '../hooks/use-timeline-position';
import {useKeyboardControls} from '../utils/keyboard-controls';
import {getItemLeftOffset} from '../utils/position-utils';
import {playheadRef} from '../utils/restore-scroll-after-zoom';

export const Playhead: React.FC<{
	visibleFrames: number;
	playerRef: React.RefObject<PlayerRef | null>;
}> = ({playerRef, visibleFrames}) => {
	const {fps} = useTimelineContext();
	const {timelineWidth} = useTimelineSize();
	const timelinePosition = useTimelinePosition({playerRef});
	useKeyboardControls({playerRef, fps});

	const left = getItemLeftOffset({
		from: timelinePosition,
		totalDurationInFrames: visibleFrames,
		timelineWidth,
	});

	const style = useMemo(() => {
		return {
			left,
			marginLeft: -PLAYHEAD_WIDTH / 2,
		};
	}, [left]);

	return (
		<div
			className="pointer-events-none absolute top-0 z-10 flex h-full flex-col items-center"
			style={style}
			ref={playheadRef}
			id="playhead"
		>
			<div className="sticky top-0">
				<svg
					style={{
						width: PLAYHEAD_WIDTH,
						aspectRatio: '54 / 55',
						marginTop: -1,
					}}
					viewBox="0 0 54 55"
					fill="none"
				>
					<path
						d="M50.4313 37.0917L30.4998 51.4424C29.2419 52.3481 27.5581 52.3925 26.2543 51.5543L3.73299 37.0763C2.65291 36.382 2 35.1861 2 33.9021V5.77359C2 3.68949 3.68949 2 5.77358 2H48.2264C50.3105 2 52 3.68949 52 5.77358V34.0293C52 35.243 51.4163 36.3826 50.4313 37.0917Z"
						className="fill-timeline-accent"
						strokeWidth="3"
						stroke="black"
						strokeLinejoin="round"
						strokeLinecap="round"
						strokeDasharray="23.7 6.2 999"
						strokeOpacity="1"
					/>
				</svg>
			</div>
			<div
				className="bg-timeline-accent h-full w-[3px] rounded-t-sm"
				style={{
					marginTop: -2,
					marginLeft: 1,
					borderLeft: '1px solid black',
					borderRight: '1px solid black',
				}}
			/>
		</div>
	);
};
