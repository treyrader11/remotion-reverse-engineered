import {TrackType} from '../types';

export const getCompositionDuration = (tracks: TrackType[]) => {
	const items = tracks.flatMap((t) => t.items);
	const itemLastFrames = items.map((i) => i.from + i.durationInFrames);
	const maxFrames = itemLastFrames.reduce((a, b) => Math.max(a, b), 0);
	return maxFrames;
};
