import {useContext} from 'react';
import {TimelineContext} from './provider';

export const useTimelineContext = () => {
	const context = useContext(TimelineContext);
	if (!context) {
		throw new Error('TimelineContext is not set');
	}
	return context;
};
