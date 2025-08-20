import {PlayerRef} from '@remotion/player';
import {MouseEventHandler, useCallback, useEffect, useState} from 'react';
import {useTimelineSize} from '../context/use-timeline-size';
import {
	clearScrollIntervals,
	isCursorOnEdgeOfTimeline,
	setLeftScrollInterval,
	setRightScrollInterval,
} from '../utils/is-cursor-on-edge-of-timeline';
import {calculateFrame} from '../utils/position-utils';

export const useTimelineSeek = ({
	containerRef,
	playerRef,
	totalDurationInFrames,
}: {
	containerRef: React.RefObject<HTMLDivElement | null>;
	playerRef: React.RefObject<PlayerRef | null>;
	totalDurationInFrames: number;
}) => {
	const [isDragging, setIsDragging] = useState(false);
	const {timelineWidth} = useTimelineSize();

	const handlePointerMove = useCallback(
		(e: MouseEvent) => {
			if (!isDragging || !containerRef.current) return;

			const isOnEdge = isCursorOnEdgeOfTimeline(e.clientX);
			e.preventDefault();
			e.stopPropagation();

			if (isOnEdge === 'left') {
				setLeftScrollInterval(timelineWidth, totalDurationInFrames, playerRef);
				return;
			}
			if (isOnEdge === 'right') {
				setRightScrollInterval(timelineWidth, totalDurationInFrames, playerRef);
				return;
			}

			clearScrollIntervals();

			const frame = calculateFrame({
				container: containerRef.current,
				xCoordinate: e.clientX,
				totalDurationInFrames,
			});

			playerRef.current?.seekTo(frame);
		},
		[isDragging, containerRef, playerRef, totalDurationInFrames, timelineWidth],
	);

	const stopDragging = useCallback(() => {
		setIsDragging(false);
		clearScrollIntervals();
	}, []);

	const startDragging: MouseEventHandler<HTMLDivElement> = useCallback(
		(event) => {
			if (event.button !== 0) return; // Only handle left click

			event.stopPropagation();

			setIsDragging(true);

			if (!containerRef.current) {
				throw new Error('Timeline container not found');
			}

			const frame = calculateFrame({
				container: containerRef.current,
				xCoordinate: event.clientX,
				totalDurationInFrames,
			});

			playerRef.current?.seekTo(frame);
		},
		[containerRef, playerRef, totalDurationInFrames],
	);

	// Set up drag handling
	useEffect(() => {
		window.addEventListener('pointermove', handlePointerMove);
		window.addEventListener('pointerup', stopDragging);

		return () => {
			window.removeEventListener('pointermove', handlePointerMove);
			window.removeEventListener('pointerup', stopDragging);
		};
	}, [handlePointerMove, stopDragging]);

	return {
		isDragging,
		startDragging,
		stopDragging,
	};
};
