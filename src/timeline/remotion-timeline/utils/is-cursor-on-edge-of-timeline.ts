import {PlayerRef} from '@remotion/player';
import {PLAYHEAD_WIDTH} from '../constants';
import {
	timelineContainerRef,
	timelineRightSide,
	timelineScrollContainerRef,
} from './restore-scroll-after-zoom';

export const isCursorOnEdgeOfTimeline = (cursorX: number) => {
	const currentTimeline = timelineRightSide.current;
	if (!currentTimeline) {
		throw new Error('Timeline right side not found');
	}

	const isLeft =
		cursorX <
		timelineContainerRef.current!.getBoundingClientRect().left +
			currentTimeline.offsetLeft;
	if (isLeft) {
		return 'left';
	}

	const timelineScrollContainer = timelineScrollContainerRef.current;
	if (!timelineScrollContainer) {
		throw new Error('Timeline scroll container not found');
	}

	const isRight =
		cursorX > timelineScrollContainer.getBoundingClientRect().right;
	if (isRight) {
		return 'right';
	}

	return 'none';
};

let leftScrollInterval: NodeJS.Timeout | undefined;
let rightScrollInterval: NodeJS.Timeout | undefined;

export const setLeftScrollInterval = (
	timelineWidth: number,
	totalDurationInFrames: number,
	playerRef: React.RefObject<PlayerRef | null>,
) => {
	if (rightScrollInterval) {
		clearInterval(rightScrollInterval);
		rightScrollInterval = undefined;
	}

	if (leftScrollInterval) {
		return;
	}

	leftScrollInterval = setInterval(() => {
		const currentTimeline = timelineRightSide.current;
		if (!currentTimeline) {
			throw new Error('Timeline right side not found');
		}

		const frameOfLeftEdge =
			((timelineScrollContainerRef.current!.scrollLeft - 40) / timelineWidth) *
			(totalDurationInFrames - 1);

		const rounded = Math.ceil(frameOfLeftEdge);
		const offsetLeft = (rounded / (totalDurationInFrames - 1)) * timelineWidth;

		playerRef.current?.seekTo(rounded);

		timelineScrollContainerRef.current!.scrollLeft =
			offsetLeft - PLAYHEAD_WIDTH / 2;
	}, 100);
};

export const setRightScrollInterval = (
	timelineWidth: number,
	totalDurationInFrames: number,
	playerRef: React.RefObject<PlayerRef | null>,
) => {
	if (leftScrollInterval) {
		clearInterval(leftScrollInterval);
		leftScrollInterval = undefined;
	}

	if (rightScrollInterval) {
		return;
	}

	rightScrollInterval = setInterval(() => {
		const currentTimeline = timelineRightSide.current;
		if (!currentTimeline) {
			throw new Error('Timeline right side not found');
		}

		const timelineScrollContainer = timelineScrollContainerRef.current;
		if (!timelineScrollContainer) {
			throw new Error('Timeline scroll container not found');
		}

		const frameOfRightEdge =
			((timelineRightSide.current!.clientWidth +
				timelineScrollContainer.scrollLeft +
				40) /
				timelineWidth) *
			(totalDurationInFrames - 1);

		const rounded = Math.floor(frameOfRightEdge);
		const offsetLeft = (rounded / (totalDurationInFrames - 1)) * timelineWidth;

		playerRef.current?.seekTo(rounded);

		timelineScrollContainerRef.current!.scrollLeft =
			offsetLeft - timelineRightSide.current!.clientWidth + PLAYHEAD_WIDTH / 2;
	}, 100);
};

export const clearScrollIntervals = () => {
	if (leftScrollInterval) {
		clearInterval(leftScrollInterval);
		leftScrollInterval = undefined;
	}
	if (rightScrollInterval) {
		clearInterval(rightScrollInterval);
		rightScrollInterval = undefined;
	}
};
