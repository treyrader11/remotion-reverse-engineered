import {createContext, useMemo, useState} from 'react';
import {flushSync} from 'react-dom';
import {restoreScrollAfterZoom} from '../utils/restore-scroll-after-zoom';

interface TimelineZoomProviderProps {
	initialZoom: number;
}

interface TimelineZoomState {
	zoom: number;
	setZoom: (zoom: number | ((prev: number) => number)) => void;
}

export const TimelineZoomContext = createContext<TimelineZoomState>({
	zoom: 1,
	setZoom: () => {},
});

type TimelineProviderProps = {
	children: React.ReactNode;
} & TimelineZoomProviderProps;

/**
 * This is the provider for the timeline zoom
 * It's separated from the main provider to avoid unnecessary re-renders
 */
export const TimelineZoomProvider = ({
	children,
	initialZoom,
}: TimelineProviderProps) => {
	const [zoom, _setZoom] = useState(initialZoom);

	const state = useMemo(
		() => ({
			zoom,
			setZoom: (zoom: number | ((prev: number) => number)) => {
				const restore = restoreScrollAfterZoom();
				flushSync(() => {
					_setZoom(zoom);
				});

				restore.restore();
			},
		}),
		[zoom, _setZoom],
	);

	return (
		<TimelineZoomContext.Provider value={state}>
			{children}
		</TimelineZoomContext.Provider>
	);
};
