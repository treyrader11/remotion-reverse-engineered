import type {ItemType} from './types';

export const MIN_ZOOM = 1;
export const MAX_ZOOM = 4;

export const PLAYHEAD_WIDTH = 19;
export const TRACK_HEIGHT = 34;

export const TIMELINE_HEIGHT = 200;

export const scrollbarStyle: React.CSSProperties = {
	scrollbarWidth: 'thin',
	scrollbarColor:
		'var(--timeline-scrollbar-thumb-color) var(--timeline-scrollbar-track-color)',
};

export const ITEM_COLORS: Record<ItemType['type'], string> = {
	image: '#3A7A44',
	text: '#7A5DE8',
	video: '#347EBF',
	solid: '#B04BCF',
	audio: '#3A7A44',
};
