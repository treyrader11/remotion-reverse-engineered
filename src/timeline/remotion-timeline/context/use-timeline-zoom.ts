import {useContext} from 'react';
import {TimelineZoomContext} from './timeline-zoom-provider';

export const useTimelineZoom = () => {
	const state = useContext(TimelineZoomContext);

	if (!state) {
		throw new Error(
			'useTimelineZoom must be used within a TimelineZoomProvider',
		);
	}

	return state;
};
