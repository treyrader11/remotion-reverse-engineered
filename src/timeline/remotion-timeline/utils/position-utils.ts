import {TRACK_HEIGHT} from '../constants';
import {ItemType, TrackType} from '../types';

export const getFromFromLeft = ({
	timelineWidth,
	left,
	totalDurationInFrames,
}: {
	timelineWidth: number;
	left: number;
	totalDurationInFrames: number;
}) => {
	return Math.round((left / timelineWidth) * (totalDurationInFrames - 1));
};

export const getItemLeftOffset = ({
	timelineWidth,
	totalDurationInFrames,
	from,
}: {
	timelineWidth: number;
	totalDurationInFrames: number;
	from: number;
}) => {
	return Math.round((from / totalDurationInFrames) * timelineWidth);
};

export const getItemWidth = ({
	trackDurationInFrames,
	timelineWidth,
	totalDurationInFrames,
}: {
	trackDurationInFrames: number;
	timelineWidth: number;
	totalDurationInFrames: number;
}) => {
	return (trackDurationInFrames / totalDurationInFrames) * timelineWidth;
};

const overlapsLeft = (item: ItemType, from: number) => {
	return item.from <= from && item.from + item.durationInFrames > from;
};

const overlapsRight = (
	item: ItemType,
	from: number,
	durationInFrames: number,
) => {
	return (
		item.from < from + durationInFrames &&
		item.from + item.durationInFrames > from &&
		item.from > from
	);
};

const doesFitIn = (
	from: number,
	durationInFrames: number,
	otherItems: ItemType[],
) => {
	return otherItems.every((item) => {
		const leftOverlap = overlapsLeft(item, from);
		const rightOverlap = overlapsRight(item, from, durationInFrames);
		return !leftOverlap && !rightOverlap;
	});
};

const getAlternativeForCollisionRight = ({
	collisionRight,
	otherItemsOnTrack,
	durationInFrames,
}: {
	collisionRight: ItemType | null;
	otherItemsOnTrack: ItemType[];
	durationInFrames: number;
}) => {
	if (!collisionRight) {
		return null;
	}
	const shiftedFrom = collisionRight.from - durationInFrames;

	if (shiftedFrom < 0) {
		return null;
	}

	const doesFit = doesFitIn(shiftedFrom, durationInFrames, otherItemsOnTrack);
	if (!doesFit) {
		return null;
	}
	return shiftedFrom;
};

const getAlternativeForCollisionLeft = ({
	collisionLeft,
	otherItemsOnTrack,
	durationInFrames,
}: {
	collisionLeft: ItemType | null;
	otherItemsOnTrack: ItemType[];
	durationInFrames: number;
}) => {
	if (!collisionLeft) {
		return null;
	}
	const shiftedFrom =
		(collisionLeft as ItemType).from +
		(collisionLeft as ItemType).durationInFrames;
	if (shiftedFrom < 0) {
		return null;
	}
	const doesFit = doesFitIn(shiftedFrom, durationInFrames, otherItemsOnTrack);
	if (!doesFit) {
		return null;
	}

	return shiftedFrom;
};

export const calculateNewPosition = ({
	durationInFrames,
	timelineWidth,
	initialFrom,
	offsetX,
	offsetY,
	trackIndex,
	tracks,
	visibleFrames,
	itemId,
}: {
	durationInFrames: number;
	timelineWidth: number;
	visibleFrames: number;
	initialFrom: number;
	offsetX: number;
	offsetY: number;
	trackIndex: number;
	itemId: string;
	tracks: TrackType[];
}) => {
	const fromOffset = Math.round((offsetX / timelineWidth) * visibleFrames);
	const numberOfTracks = tracks.length;

	// Simplified track calculation - just add the offset directly
	const trackOffset = Math.round(offsetY / TRACK_HEIGHT);
	const newTrack = Math.max(
		0,
		Math.min(numberOfTracks - 1, trackIndex + trackOffset),
	);

	const minFrom = 0;
	const newFrom = Math.max(minFrom, fromOffset + initialFrom);

	const otherItemsOnTrack = tracks[newTrack].items.filter(
		(item) => item.id !== itemId,
	);

	const collisionLeft = otherItemsOnTrack.find((item) => {
		return overlapsLeft(item, newFrom);
	});
	const collisionRight = otherItemsOnTrack.find((item) => {
		return overlapsRight(item, newFrom, durationInFrames);
	});

	if (!collisionLeft && !collisionRight) {
		return {
			track: newTrack,
			from: newFrom,
			durationInFrames,
		};
	}

	const alternativeFromRight = getAlternativeForCollisionRight({
		collisionRight: collisionRight ?? null,
		otherItemsOnTrack,
		durationInFrames,
	});
	const alternativeFromLeft = getAlternativeForCollisionLeft({
		collisionLeft: collisionLeft ?? null,
		otherItemsOnTrack,
		durationInFrames,
	});

	if (alternativeFromLeft && alternativeFromRight) {
		const leftShift = Math.abs(newFrom - alternativeFromLeft);
		const rightShift = Math.abs(newFrom - alternativeFromRight);
		return leftShift < rightShift
			? {track: newTrack, from: alternativeFromLeft, durationInFrames}
			: {track: newTrack, from: alternativeFromRight, durationInFrames};
	}

	if (alternativeFromLeft) {
		return {track: newTrack, from: alternativeFromLeft, durationInFrames};
	}

	if (alternativeFromRight) {
		return {track: newTrack, from: alternativeFromRight, durationInFrames};
	}
	return null;
};

export const calculateFrame = ({
	container,
	xCoordinate,
	totalDurationInFrames,
}: {
	container: HTMLDivElement;
	xCoordinate: number;
	totalDurationInFrames: number;
}) => {
	const containerRect = container.getBoundingClientRect();
	if (!containerRect) {
		throw new Error('boundingRect is null');
	}

	const pixelsPerFrame = containerRect.width / totalDurationInFrames;

	// Calculate the actual click position considering scroll and reserved space
	const scrollX = container.scrollLeft;
	const clickPositionX = xCoordinate - containerRect.x + scrollX;

	// Convert click position to frame number using pixels per frame
	const frame = clickPositionX / pixelsPerFrame;

	const normalizedFrame = Math.max(
		0,
		Math.min(Math.round(frame), totalDurationInFrames - 1),
	);

	// Ensure frame is within valid range
	return normalizedFrame;
};
