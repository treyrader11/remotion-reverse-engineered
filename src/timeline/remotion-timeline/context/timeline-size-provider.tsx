import {createContext, useMemo} from 'react';
import {useTimelineZoom} from './use-timeline-zoom';

interface TimelineSizeState {
	timelineWidth: number;
}

export const TimelineSizeContext = createContext<TimelineSizeState>({
	timelineWidth: 0,
});

type TimelineSizeProviderProps = {
	children: React.ReactNode;
	containerWidth: number;
};

const calculateTimelineWidth = ({
	timelineContainerWidth,
	zoom,
}: {
	timelineContainerWidth: number;
	zoom: number;
}) => {
	return timelineContainerWidth * zoom;
};

/**
 * This is the provider for the timeline size
 * It's separated from the main provider to avoid unnecessary re-renders
 * Used to avoid prop drilling inside of <Timeline> component
 */
export const TimelineSizeProvider = ({
	children,
	containerWidth,
}: TimelineSizeProviderProps) => {
	const {zoom} = useTimelineZoom();

	const timelineWidth = calculateTimelineWidth({
		timelineContainerWidth: containerWidth,
		zoom,
	});

	const value = useMemo(() => ({timelineWidth}), [timelineWidth]);

	return (
		<TimelineSizeContext.Provider value={value}>
			{children}
		</TimelineSizeContext.Provider>
	);
};
