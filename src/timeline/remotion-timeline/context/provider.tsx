import {createContext} from 'react';

import {useCallback, useMemo, useRef, useState} from 'react';
import {ItemType, TrackType, VideoItem} from '../types';
import {debounce} from '../utils/debounce';
import {getCompositionDuration} from '../utils/get-composition-duration';
import {generateRandomId} from './utils';

export interface TimelineInitialState {
	tracks: TrackType[];
	fps: number;
}

interface UseTimelineProps {
	initialState: TimelineInitialState;
	onChange?: (changedState: {tracks: TrackType[]}) => void;
}

// How often the onChange callback is called
const DEBOUNCE_TIME = 300;

interface TimelineState {
	tracks: TrackType[];
	fps: number;
	timelineRef: React.RefObject<HTMLDivElement>;
	selectedItem: string | null;
	durationInFrames: number;
	setTracks: (
		tracks: TrackType[] | ((prev: TrackType[]) => TrackType[]),
	) => void;
	setTrack: (idx: number, newTrack: TrackType) => void;
	addTrack: (track: TrackType) => void;
	deleteTrack: (trackId: string) => void;
	addItem: (trackIndex: number, item: ItemType) => void;
	changeItem: (itemId: string, updater: (item: ItemType) => ItemType) => void;
	deleteItem: (id: string) => void;
	splitItem: (itemId: string, framePosition: number) => void;
	findSpaceForItem: (
		durationInFrames: number,
		startAt: number,
	) => {
		trackIndex: number;
		startAt: number;
	} | null;
	ensureAddAndSelectItem: (trackIndex: number, item: ItemType) => void;
	setSelectedItem: (itemId: string | null) => void;
}

export const TimelineContext = createContext<TimelineState | null>(null);

type TimelineProviderProps = {
	children: React.ReactNode;
} & UseTimelineProps;

/**
 * This is the provider for the timeline.
 * It's here to show you how to initialize the timeline with data.
 * You can change the shape of the data to fit your needs.
 * @param children - The children of the provider. Pass the component containing your TimelineRoot and VideoPreview.
 * @param initialState - The initial state of the timeline.
 * @param onChange - The callback for changes in the timeline data. Use it store the data in your database.
 */
export const TimelineProvider = ({
	children,
	initialState,
	onChange,
}: TimelineProviderProps) => {
	const timelineRef = useRef<HTMLDivElement>(null);

	const [tracks, setTracks] = useState<TrackType[]>(initialState.tracks);
	const [selectedItem, setSelectedItem] = useState<string | null>(null);
	const [fps] = useState(initialState.fps);
	const debouncedOnChange = useMemo(
		() =>
			onChange ? debounce<typeof onChange>(onChange, DEBOUNCE_TIME) : undefined,
		[onChange],
	);

	// Wrap setTracks to call onChange
	const updateTracks = useCallback(
		(newTracks: TrackType[] | ((prev: TrackType[]) => TrackType[])) => {
			setTracks((prev) => {
				const nextTracks =
					typeof newTracks === 'function' ? newTracks(prev) : newTracks;
				debouncedOnChange?.({
					tracks: nextTracks,
				});
				return nextTracks;
			});
		},
		[debouncedOnChange],
	);

	const setTrack = useCallback(
		(idx: number, newTrack: TrackType) => {
			updateTracks((tracks) => {
				return tracks.map((existingTrack, trackIndex) => {
					if (trackIndex === idx) {
						return newTrack;
					}
					return existingTrack;
				});
			});
		},
		[updateTracks],
	);

	const addTrack = useCallback(
		(track: TrackType) => {
			updateTracks((tracks) => [track, ...tracks]);
		},
		[updateTracks],
	);

	const deleteTrack = useCallback(
		(trackId: string) => {
			updateTracks((tracks) => tracks.filter((track) => track.id !== trackId));
		},
		[updateTracks],
	);

	const addItem = useCallback((trackIndex: number, item: ItemType) => {
		setTracks((tracks) => {
			return tracks.map((track, idx) => {
				if (idx === trackIndex) {
					return {...track, items: [...track.items, item]};
				}
				return track;
			});
		});
	}, []);

	const changeItem = useCallback(
		(itemId: string, updater: (item: ItemType) => ItemType) => {
			setTracks((tracks) => {
				return tracks.map((track) => {
					return {
						...track,
						items: track.items.map((existingItem) => {
							if (existingItem.id !== itemId) {
								return existingItem;
							}

							return updater(existingItem);
						}),
					};
				});
			});
		},
		[],
	);

	const deleteItem = useCallback((id: string) => {
		setTracks((tracks) =>
			tracks.map((track) => {
				return {
					...track,
					items: track.items.filter((_item) => {
						if (_item.id !== id) {
							return true;
						}

						return false;
					}),
				};
			}),
		);
	}, []);

	const splitItem = useCallback(
		(itemId: string, framePosition: number) => {
			setTracks((tracks) => {
				// Find the track and item to split
				let targetTrack: TrackType | undefined;
				let targetItem: ItemType | undefined;
				let targetTrackIndex = -1;

				for (let i = 0; i < tracks.length; i++) {
					const track = tracks[i];
					const item = track.items.find((item) => item.id === itemId);
					if (item) {
						targetTrack = track;
						targetItem = item;
						targetTrackIndex = i;
						break;
					}
				}

				if (!targetTrack || !targetItem || targetTrackIndex === -1) {
					return tracks;
				}

				// Calculate the relative split position within the item
				const itemStart = targetItem.from;
				const itemEnd = itemStart + targetItem.durationInFrames;

				// Only split if the frame position is within the item bounds and not at the edges
				if (framePosition <= itemStart || framePosition >= itemEnd) {
					return tracks;
				}

				// Create the two new items
				const firstItemDuration = framePosition - itemStart;
				const secondItemDuration = itemEnd - framePosition;

				const firstItem: ItemType = {
					...targetItem,
					id: generateRandomId(),
					durationInFrames: firstItemDuration,
				};

				const secondItem: ItemType = {
					...targetItem,
					id: generateRandomId(),
					from: framePosition,
					durationInFrames: secondItemDuration,
				};

				// Handle special case for video - adjust videoStartFromInSeconds for the second item
				if (targetItem.type === 'video') {
					const videoItem = targetItem as VideoItem;
					const firstItemDurationInSeconds = firstItemDuration / fps;
					(secondItem as VideoItem).videoStartFromInSeconds =
						(videoItem.videoStartFromInSeconds || 0) +
						firstItemDurationInSeconds;
				}

				// Return updated tracks with the split items
				return tracks.map((track, index) => {
					if (index !== targetTrackIndex) {
						return track;
					}

					return {
						...track,
						items: [
							...track.items.filter((item) => item.id !== targetItem?.id),
							firstItem,
							secondItem,
						],
					};
				});
			});
		},
		[fps],
	);

	const findSpaceForItem = useCallback(
		(durationInFrames: number, startAt: number) => {
			// Start from the bottom track visually (highest index) and work upward
			for (let trackIndex = tracks.length - 1; trackIndex >= 0; trackIndex--) {
				const track = tracks[trackIndex];

				// If track is completely empty, we can definitely place the item here
				if (track.items.length === 0) {
					return {trackIndex, startAt};
				}

				const hasConflict = track.items.some((item) => {
					const itemEnd = item.from + item.durationInFrames;
					const newItemEnd = startAt + durationInFrames;

					return !(itemEnd <= startAt || item.from >= newItemEnd);
				});

				// If no conflict at requested position, use this track
				if (!hasConflict) {
					return {trackIndex, startAt};
				}
			}

			// If no space found in existing tracks, create a new track
			// New tracks go at the top (higher index)
			return {
				trackIndex: tracks.length,
				startAt,
			};
		},
		[tracks],
	);

	const ensureAddAndSelectItem = useCallback(
		(trackIndex: number, item: ItemType) => {
			if (trackIndex === tracks.length) {
				updateTracks((currentTracks) => {
					const newTrack = {
						id: generateRandomId(),
						name: `Track ${currentTracks.length + 1}`,
						items: [item],
					};
					return [newTrack, ...currentTracks];
				});
			} else {
				addItem(trackIndex, item);
			}

			setSelectedItem(item.id);
		},
		[addItem, updateTracks, tracks.length],
	);

	const isItemDragging = useMemo(() => {
		const items = tracks.flatMap((t) => t.items);
		return items.some((i) => 'isDragging' in i && i.isDragging);
	}, [tracks]);

	const durationInFrames = useMemo(() => {
		const framesShown = Math.max(1, getCompositionDuration(tracks));
		return framesShown;
	}, [tracks]);

	const lastDurationWhileNotDragging = useRef(durationInFrames);
	if (!isItemDragging) {
		lastDurationWhileNotDragging.current = durationInFrames;
	}

	const state: TimelineState = useMemo(
		() => ({
			tracks,
			setTracks: updateTracks,
			setTrack,
			addTrack,
			deleteTrack,
			addItem,
			changeItem,
			timelineRef,
			deleteItem,
			splitItem,
			findSpaceForItem,
			setSelectedItem,
			selectedItem,
			ensureAddAndSelectItem,
			durationInFrames: lastDurationWhileNotDragging.current,
			fps,
		}),
		[
			tracks,
			updateTracks,
			setTrack,
			addTrack,
			deleteTrack,
			selectedItem,
			changeItem,
			addItem,
			deleteItem,
			splitItem,
			findSpaceForItem,
			ensureAddAndSelectItem,
			fps,
		],
	);

	return (
		<TimelineContext.Provider value={state}>
			{children}
		</TimelineContext.Provider>
	);
};
