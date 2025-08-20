import {useMemo} from 'react';
import {useTimelineContext} from '../context/use-timeline-context';
import {useTimelineSize} from '../context/use-timeline-size';
import {useTimelineZoom} from '../context/use-timeline-zoom';

export type TimelineTickMark = {
	width: number;
	label: string;
};

// Base intervals in seconds that we want to show at different zoom levels
const BASE_INTERVALS = [0.1, 0.5, 1, 5, 10, 30, 60, 300] as const;

// The number of time divisions we want to see across the timeline at zoom level 1
// Example: If DESIRED_TIMELINE_DIVISIONS = 20 and video is 60 seconds:
// - At zoom=1: Show a tick every 3 seconds (60/20)
// - At zoom=2: Show a tick every 1.5 seconds (60/(20*2))
// - At zoom=4: Show a tick every 0.75 seconds (60/(20*4))
const DESIRED_TIMELINE_DIVISIONS = 15;

const findBestTimeInterval = ({
	totalDurationInFrames,
	fps,
	zoom,
}: {
	totalDurationInFrames: number;
	fps: number;
	zoom: number;
}) => {
	const durationInSeconds = totalDurationInFrames / fps;
	const baseInterval = durationInSeconds / (DESIRED_TIMELINE_DIVISIONS * zoom);

	const interval =
		BASE_INTERVALS.find((int) => int >= baseInterval) ??
		BASE_INTERVALS[BASE_INTERVALS.length - 1];

	return interval;
};

const formatTimecode = (frame: number, fps: number, interval: number) => {
	const totalSeconds = frame / fps;
	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = Math.floor(totalSeconds % 60);

	// Format: HH:MM:SS (with hours) or MM:SS
	if (hours > 0) {
		return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
	}

	const base = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

	// Only show milliseconds for half-second intervals
	if (interval === 0.5) {
		// Round to nearest 500ms
		const milliseconds = Math.round((totalSeconds % 1) * 1000);
		const snappedMilliseconds = milliseconds >= 500 ? 500 : 0;
		return `${base}.${snappedMilliseconds.toString().padStart(3, '0')}`;
	}

	return base;
};

export const useTicks = ({visibleFrames}: {visibleFrames: number}) => {
	const {fps} = useTimelineContext();
	const {zoom} = useTimelineZoom();
	const {timelineWidth} = useTimelineSize();

	const tickMarks = useMemo(() => {
		const interval = findBestTimeInterval({
			totalDurationInFrames: visibleFrames,
			fps,
			zoom,
		});

		const marks: TimelineTickMark[] = [];
		const pxPerSecond = timelineWidth / (visibleFrames / fps);
		const pixelsBetweenTicks = interval * pxPerSecond;

		for (
			let xPosition = pixelsBetweenTicks;
			xPosition <= timelineWidth;
			xPosition += pixelsBetweenTicks
		) {
			const seconds = xPosition / pxPerSecond;
			const frame = Math.round(seconds * fps);
			marks.push({
				width: pixelsBetweenTicks,
				label: formatTimecode(frame, fps, interval),
			});
		}
		return marks;
	}, [fps, timelineWidth, visibleFrames, zoom]);

	return {tickMarks, timelineWidth};
};
