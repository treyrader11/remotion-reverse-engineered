import React, {
	ComponentProps,
	memo,
	useCallback,
	useMemo,
	useRef,
	useState,
} from 'react';

import {ITEM_COLORS, TRACK_HEIGHT} from '../constants';
import {useDragCursor} from '../hooks/use-drag-cursor';
import {
	calculateFrame,
	calculateNewPosition,
	getFromFromLeft,
	getItemLeftOffset,
	getItemWidth,
} from '../utils/position-utils';
import {AudioIcon, ImageIcon, ScissorsIcon, TextIcon} from './icons';

import {PropsWithChildren} from 'react';
import {useTimelineContext} from '../context/use-timeline-context';
import {useTimelineSize} from '../context/use-timeline-size';
import {useDebounceValue} from '../hooks/use-debounce-value';
import {ItemType, SolidItem} from '../types';
import {timelineScrollableContainerRef} from '../utils/restore-scroll-after-zoom';
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuTrigger,
} from './context-menu';
import {FilmStripFrames} from './filmstrip';

const SimplePreview = ({children, style}: ComponentProps<'div'>) => {
	return (
		<div
			className="text-base-100 flex h-full w-full flex-nowrap items-center space-x-2 px-4 text-xs text-white"
			style={{background: '#FF9843', ...style}}
		>
			{children}
		</div>
	);
};

const Icon = ({children}: PropsWithChildren) => {
	return <span>{children}</span>;
};

const Text = ({children}: PropsWithChildren) => {
	return <span className="truncate">{children}</span>;
};

SimplePreview.Icon = Icon;
SimplePreview.Text = Text;

const EXTEND_HANDLE_TARGET_WIDTH = 12;

const ExtendButtonRefForward: React.ForwardRefRenderFunction<
	HTMLDivElement,
	ComponentProps<'div'>
> = ({className, ...restProps}, ref) => {
	return (
		<div
			ref={ref}
			className={`group absolute top-0 bottom-0 flex cursor-ew-resize items-center justify-center ${className ?? ''} `}
			{...restProps}
		></div>
	);
};

const ExtendHandle = React.forwardRef(ExtendButtonRefForward);

const TextItemPreview: React.FC = () => {
	return (
		<SimplePreview style={{background: ITEM_COLORS.text}}>
			<SimplePreview.Icon>
				<TextIcon />
			</SimplePreview.Icon>
			<SimplePreview.Text>Text</SimplePreview.Text>
		</SimplePreview>
	);
};

const ImageItemPreview: React.FC = () => {
	return (
		<SimplePreview style={{background: ITEM_COLORS.image}}>
			<SimplePreview.Icon>
				<ImageIcon />
			</SimplePreview.Icon>
			<SimplePreview.Text>Image</SimplePreview.Text>
		</SimplePreview>
	);
};

const VideoItemPreview: React.FC = () => {
	return (
		<SimplePreview style={{background: ITEM_COLORS.video}}></SimplePreview>
	);
};

const AudioItemPreview: React.FC = () => {
	return (
		<SimplePreview style={{background: ITEM_COLORS.audio}}>
			<SimplePreview.Icon>
				<AudioIcon />
			</SimplePreview.Icon>
			<SimplePreview.Text>Audio</SimplePreview.Text>
		</SimplePreview>
	);
};

const SolidItemPreview: React.FC<{
	item: SolidItem;
}> = ({item}) => {
	return (
		<SimplePreview style={{background: ITEM_COLORS.solid}}>
			<div
				className={'ml-[-4px] h-3 w-3 shrink-0 rounded-full'}
				style={{
					backgroundColor: item.color,
				}}
			></div>
			<SimplePreview.Text>Solid</SimplePreview.Text>
		</SimplePreview>
	);
};

const ItemPreview: React.FC<{
	item: ItemType;
}> = memo(({item}) => {
	if (item.type === 'text') {
		return <TextItemPreview />;
	}

	if (item.type === 'image') {
		return <ImageItemPreview />;
	}

	if (item.type === 'video') {
		return <VideoItemPreview />;
	}

	if (item.type === 'audio') {
		return <AudioItemPreview />;
	}

	if (item.type === 'solid') {
		return <SolidItemPreview item={item} />;
	}

	throw new Error(`Unknown item type: ${JSON.stringify(item satisfies never)}`);
});

// controls the size and position of the item
const TimelineItemContainer = memo(
	({
		timelineItemWidth,
		trackIndex,
		timelineItemLeft,
		timelineItemRef,
		isSelected,
		children,
	}: {
		trackIndex: number;
		timelineItemLeft: number;
		timelineItemWidth: number;
		timelineItemRef: React.RefObject<HTMLDivElement>;
		isSelected: boolean;
		children: React.ReactNode;
	}) => {
		const style = useMemo(
			() => ({
				width: timelineItemWidth,
				height: TRACK_HEIGHT - 2,
				left: timelineItemLeft,
				top: trackIndex * TRACK_HEIGHT,
				overflow: 'hidden',
			}),
			[timelineItemWidth, timelineItemLeft, trackIndex],
		);

		return (
			<div
				ref={timelineItemRef}
				className={`absolute box-border cursor-pointer rounded-sm border border-black/80 select-none ${isSelected ? 'border-timeline-accent' : ''}`}
				style={style}
			>
				{children}
			</div>
		);
	},
);

interface TimelineItemActionsProps {
	item: ItemType;
	trackIndex: number;
	timelineWidth: number;
	visibleFrames: number;
}

// context menu, resize handles, etc
const TimelineItemActions = memo(
	({
		item,
		trackIndex,
		timelineWidth,
		visibleFrames,
	}: TimelineItemActionsProps) => {
		const {changeItem, tracks, setTracks, setSelectedItem, fps, splitItem} =
			useTimelineContext();
		const timelineItemRef = useRef<HTMLDivElement>(null);
		const extendHandleLeftRef = useRef<HTMLDivElement>(null);
		const extendHandleRightRef = useRef<HTMLDivElement>(null);
		// needed to store the click position to perform actions
		// e.g in the split clip, it will split exactly at the click position
		const [rightClickXPos, setRightClickXPos] = useState<number | null>(null);

		const {startDrag, stopDrag, DragOverlay} = useDragCursor();

		const onPointerDownHandleLeft = useCallback(
			(pointerDownEvent: React.PointerEvent<HTMLDivElement>) => {
				// Don't trigger on right click
				if (pointerDownEvent.button !== 0) {
					return;
				}

				pointerDownEvent.preventDefault();
				startDrag('ew-resize');

				// store the initial position when starting the drag
				const initialFrom = item.from;
				const startX = pointerDownEvent.clientX;

				// it's better to not rely on the order of the items in the track items array
				// but ensure we're getting the previous item by sorting them by their `from` property
				const trackItemsSorted = tracks[trackIndex].items.sort(
					(a, b) => a.from - b.from,
				);

				// Get the previous item
				const itemIndex = trackItemsSorted.findIndex(
					(trackItem) => trackItem.id === item.id,
				);

				const previousItem = trackItemsSorted[itemIndex - 1];

				const previousItemEnd = previousItem
					? previousItem.from + previousItem.durationInFrames
					: 0;

				const onPointerMove = (pointerMoveEvent: PointerEvent) => {
					const offsetX = pointerMoveEvent.clientX - startX;
					const itemLeft = getItemLeftOffset({
						timelineWidth,
						totalDurationInFrames: visibleFrames,
						from: item.from,
					});

					const left = Math.max(0, itemLeft + offsetX);

					const from = getFromFromLeft({
						timelineWidth,
						left,
						totalDurationInFrames: visibleFrames,
					});

					// For video clips, ensure we don't go before the current videoStartFromInSeconds
					const minFrom =
						item.type === 'video'
							? Math.max(
									previousItemEnd,
									from,
									// Convert current videoStartFromInSeconds to frames and add to original from
									initialFrom - Math.floor(item.videoStartFromInSeconds * fps),
								)
							: Math.max(previousItemEnd, from);

					// Prevent dragging past the initial from point
					const maxFrom = Math.min(
						item.from + item.durationInFrames - 1,
						minFrom,
					);

					const newDurationInFrames =
						item.from + item.durationInFrames - maxFrom;

					changeItem(item.id, (prevItem) => {
						if (prevItem.type !== 'video' || item.type !== 'video') {
							return {
								...prevItem,
								durationInFrames: newDurationInFrames,
								from: maxFrom,
								isDragging: true,
							};
						}

						// Calculate the change in frames relative to the initial position
						const framesDelta = maxFrom - initialFrom;
						const newStartFromSeconds = Math.max(
							0,
							item.videoStartFromInSeconds + framesDelta / fps,
						);

						const availableFrames =
							Math.floor(item.videoDurationInSeconds * fps) -
							Math.floor(newStartFromSeconds * fps);
						const finalDurationInFrames = Math.min(
							newDurationInFrames,
							availableFrames,
						);

						return {
							...prevItem,
							durationInFrames: finalDurationInFrames,
							from: maxFrom,
							isDragging: true,
							videoStartFromInSeconds: newStartFromSeconds,
						};
					});
				};

				const onPointerUp = () => {
					stopDrag();
					changeItem(item.id, (previousItem) => {
						return {
							...previousItem,
							isDragging: false,
						};
					});
					window.removeEventListener('pointermove', onPointerMove);
					window.removeEventListener('pointerup', onPointerUp);
				};

				window.addEventListener('pointermove', onPointerMove);
				window.addEventListener('pointerup', onPointerUp);
			},
			[
				item,
				changeItem,
				visibleFrames,
				trackIndex,
				tracks,
				timelineWidth,
				fps,
				startDrag,
				stopDrag,
			],
		);

		const onPointerDownHandleRight = useCallback(
			(pointerDownEvent: React.PointerEvent<HTMLDivElement>) => {
				if (pointerDownEvent.button !== 0) {
					return;
				}

				pointerDownEvent.preventDefault();
				startDrag('ew-resize');

				const startX = pointerDownEvent.clientX;

				// it's better to not rely on the order of the items in the track items array
				// but ensure we're getting the next item by sorting them by their `from` property
				const trackItemsSorted = tracks[trackIndex].items.sort(
					(a, b) => a.from - b.from,
				);

				// Get the previous item
				const itemIndex = trackItemsSorted.findIndex(
					(trackItem) => trackItem.id === item.id,
				);

				const nextItem = trackItemsSorted[itemIndex + 1];

				const nextItemFrom = nextItem?.from ?? Infinity;

				const onPointerMove = (pointerMoveEvent: PointerEvent) => {
					const offsetX = pointerMoveEvent.clientX - startX;
					const itemWidth = getItemWidth({
						trackDurationInFrames: item.durationInFrames,
						timelineWidth,
						totalDurationInFrames: visibleFrames,
					});

					const maxDuration = nextItemFrom - item.from;

					const minDuration = 1;

					const newWidth = itemWidth + offsetX;
					const ratio = newWidth / itemWidth;
					let newDurationInFrames = Math.max(
						minDuration,
						Math.min(maxDuration, Math.round(item.durationInFrames * ratio)),
					);

					// For video clips, ensure we don't exceed the available video duration
					if (item.type === 'video') {
						const videoStartFrame = Math.floor(
							item.videoStartFromInSeconds * fps,
						);
						const availableFrames =
							Math.floor(item.videoDurationInSeconds * fps) - videoStartFrame;
						newDurationInFrames = Math.min(
							newDurationInFrames,
							availableFrames,
						);
					}

					changeItem(item.id, (previousItem) => ({
						...previousItem,
						durationInFrames: newDurationInFrames,
						isDragging: true,
					}));
				};

				const onPointerUp = () => {
					stopDrag();
					changeItem(item.id, (previousItem) => {
						return {
							...previousItem,
							isDragging: false,
						};
					});
					window.removeEventListener('pointermove', onPointerMove);
					window.removeEventListener('pointerup', onPointerUp);
				};

				window.addEventListener('pointermove', onPointerMove);
				window.addEventListener('pointerup', onPointerUp);
			},
			[
				item,
				visibleFrames,
				tracks,
				trackIndex,
				changeItem,
				timelineWidth,
				fps,
				startDrag,
				stopDrag,
			],
		);

		const updatePosition = useCallback(
			({
				pointerEvent,
				startX,
				startY,
				isDragging,
			}: {
				startX: number;
				startY: number;
				pointerEvent: PointerEvent;
				isDragging: boolean;
			}) => {
				const offsetX = pointerEvent.clientX - startX;
				const offsetY = pointerEvent.clientY - startY;

				const newPosition = calculateNewPosition({
					initialFrom: item.from,
					durationInFrames: item.durationInFrames,
					timelineWidth,
					offsetX,
					offsetY,
					trackIndex: trackIndex,
					tracks,
					visibleFrames,
					itemId: item.id,
				});
				if (newPosition === null) {
					return null;
				}
				setTracks((prevTracks) => {
					return prevTracks.map((track, _trackIdx) => {
						const newItems = track.items.filter(
							(_item) => item.id !== _item.id,
						);

						if (newPosition.track === _trackIdx) {
							newItems.push({
								...item,
								from: newPosition.from,
								durationInFrames: newPosition.durationInFrames,
								isDragging,
							});
						}

						return {
							...track,
							items: newItems,
						};
					});
				});
			},
			[item, setTracks, timelineWidth, visibleFrames, trackIndex, tracks],
		);

		const onPointerDownLabel = useCallback(
			(e: React.PointerEvent<HTMLDivElement>) => {
				if (e.button !== 0) {
					return;
				}
				if (
					e.target === extendHandleLeftRef.current ||
					e.target === extendHandleRightRef.current ||
					extendHandleLeftRef.current?.contains(e.target as Node) ||
					extendHandleRightRef.current?.contains(e.target as Node)
				) {
					return;
				}

				const {current} = timelineItemRef;
				if (!current) {
					throw new Error('no ref');
				}

				setSelectedItem(item.id);

				// TODO: we need to either fix re-rendering or create a ghost overlay so item doesn't get re-created
				startDrag('grabbing');

				const startX = e.clientX;
				const startY = e.clientY;

				const onPointerMove = (pointerMoveEvent: PointerEvent) => {
					updatePosition({
						startX,
						startY,
						pointerEvent: pointerMoveEvent,
						isDragging: true,
					});
				};

				const onPointerUp = (pointerUpEvent: PointerEvent) => {
					stopDrag();
					current.style.transform = '';
					current.style.zIndex = '0';

					updatePosition({
						startX,
						startY,
						pointerEvent: pointerUpEvent,
						isDragging: false,
					});

					window.removeEventListener('pointermove', onPointerMove);
					window.removeEventListener('pointerup', onPointerUp);
				};

				window.addEventListener('pointermove', onPointerMove);
				window.addEventListener('pointerup', onPointerUp);
			},
			[item, setSelectedItem, updatePosition, startDrag, stopDrag],
		);

		const handleSplitClip = useCallback(() => {
			if (!rightClickXPos || !timelineScrollableContainerRef.current) return;

			// Use the right-click position to calculate the frame
			const framePosition = calculateFrame({
				container: timelineScrollableContainerRef.current,
				xCoordinate: rightClickXPos,
				totalDurationInFrames: visibleFrames,
			});

			// Only split if the frame position is within the item bounds
			if (
				framePosition >= item.from &&
				framePosition < item.from + item.durationInFrames
			) {
				splitItem(item.id, framePosition);
			}
		}, [item, splitItem, rightClickXPos, visibleFrames]);

		const handleContextMenu = useCallback((e: React.MouseEvent) => {
			setRightClickXPos(e.clientX);
		}, []);

		return (
			<ContextMenu>
				<ContextMenuTrigger>
					<div
						ref={timelineItemRef}
						className="h-full w-full overflow-hidden"
						onPointerDown={onPointerDownLabel}
						onContextMenu={handleContextMenu}
					>
						<ExtendHandle
							ref={extendHandleLeftRef}
							onPointerDown={onPointerDownHandleLeft}
							style={{
								width: EXTEND_HANDLE_TARGET_WIDTH,
								marginLeft: -EXTEND_HANDLE_TARGET_WIDTH / 2,
								zIndex: 1,
							}}
						/>
						<ItemPreview item={item} />
						<ExtendHandle
							ref={extendHandleRightRef}
							onPointerDown={onPointerDownHandleRight}
							className="right-0"
							style={{
								width: EXTEND_HANDLE_TARGET_WIDTH,
								marginRight: -EXTEND_HANDLE_TARGET_WIDTH / 2,
								zIndex: 1,
							}}
						/>
						{DragOverlay}
					</div>
				</ContextMenuTrigger>
				<ContextMenuContent>
					<ContextMenuItem
						className="flex items-center gap-2"
						onSelect={handleSplitClip}
					>
						<ScissorsIcon className="size-3" />
						Split Clip
					</ContextMenuItem>
				</ContextMenuContent>
			</ContextMenu>
		);
	},
);

const TimelineItem = memo(
	({
		item,
		trackIndex,
		visibleFrames,
	}: {
		item: ItemType;
		trackIndex: number;
		visibleFrames: number;
	}) => {
		const {timelineWidth} = useTimelineSize();

		const timelineItemRef = useRef<HTMLDivElement>(null);

		const {selectedItem, fps} = useTimelineContext();

		const timelineItemWidth = getItemWidth({
			trackDurationInFrames: item.durationInFrames,
			timelineWidth,
			totalDurationInFrames: visibleFrames,
		});

		const timelineItemLeft = getItemLeftOffset({
			timelineWidth,
			totalDurationInFrames: visibleFrames,
			from: item.from,
		});

		const debouncedVisibleFrames = useDebounceValue(visibleFrames, 100);
		const debouncedTimelineWidth = useDebounceValue(timelineWidth, 100);

		return (
			<TimelineItemContainer
				trackIndex={trackIndex}
				timelineItemWidth={timelineItemWidth}
				timelineItemLeft={timelineItemLeft}
				timelineItemRef={timelineItemRef}
				isSelected={selectedItem === item.id}
			>
				<TimelineItemActions
					item={item}
					trackIndex={trackIndex}
					visibleFrames={debouncedVisibleFrames}
					timelineWidth={debouncedTimelineWidth}
				/>
				{item.type === 'video' && (
					<FilmStripFrames
						src={item.videoUrl}
						visualizationWidth={timelineItemWidth}
						startFrom={item.videoStartFromInSeconds * fps}
						durationInFrames={item.durationInFrames}
						fps={fps}
					/>
				)}
			</TimelineItemContainer>
		);
	},
);

export default TimelineItem;
