import {MouseEventHandler, useCallback, useRef} from 'react';
import {useTimelineContext} from '../context/use-timeline-context';
import {TrackType} from '../types';
import {IconButton} from './icon-button';
import {TrashIcon} from './icons';
import TimelineItem from './timeline-item';

export const TrackHeader = ({
	name,
	handleDeleteTrack,
}: {
	name: string;
	handleDeleteTrack: () => void;
}) => {
	return (
		<div className="group bg-timeline-bg text-timeline-side-panel-text flex w-full shrink-0 items-center justify-between truncate pr-2 pl-4 text-xs sm:pl-8">
			{name}
			<IconButton
				className={'p-1 opacity-0 group-hover:opacity-75 focus:opacity-75'}
				onClick={handleDeleteTrack}
			>
				<TrashIcon />
			</IconButton>
		</div>
	);
};

export const TrackContent = ({
	trackIndex,
	track,
	visibleFrames,
}: {
	trackIndex: number;
	track: TrackType;
	visibleFrames: number;
}) => {
	const emptySpaceRef = useRef<HTMLDivElement>(null);
	const {setSelectedItem} = useTimelineContext();

	const onPointerDownEmptySpace: MouseEventHandler = useCallback(
		(e) => {
			if (e.target === emptySpaceRef.current) {
				// If clicking on an empty space, deselect the item
				setSelectedItem(null);
				return;
			}
		},
		[setSelectedItem],
	);

	return (
		<div
			className="relative"
			ref={emptySpaceRef}
			onPointerDown={onPointerDownEmptySpace}
		>
			{track.items.map((item) => {
				return (
					<TimelineItem
						key={item.id}
						item={item}
						trackIndex={trackIndex}
						visibleFrames={visibleFrames}
					/>
				);
			})}
		</div>
	);
};
