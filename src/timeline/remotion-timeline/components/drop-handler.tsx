import {parseMedia} from '@remotion/media-parser';
import {PlayerRef} from '@remotion/player';
import React, {useCallback} from 'react';
import {AbsoluteFill} from 'remotion';
import {useTimelineContext} from '../context/use-timeline-context';
import {generateRandomId} from '../context/utils';

export const DropHandler: React.FC<{
	children: React.ReactNode;
	playerRef: React.RefObject<PlayerRef | null>;
}> = ({children, playerRef}) => {
	const {findSpaceForItem, ensureAddAndSelectItem, fps} = useTimelineContext();

	const handleVideoFile = useCallback(
		async (file: File) => {
			const url = URL.createObjectURL(file);
			const metadata = await parseMedia({
				src: url,
				fields: {
					videoCodec: true,
					slowDurationInSeconds: true,
				},
			});
			const durationInFrames = Math.floor(metadata.slowDurationInSeconds * fps);

			const space = findSpaceForItem(
				durationInFrames,
				playerRef.current?.getCurrentFrame() ?? 0,
			);

			if (!space) {
				return;
			}

			const isAudio = metadata.videoCodec === null;

			if (isAudio) {
				ensureAddAndSelectItem(space.trackIndex, {
					id: generateRandomId(),
					durationInFrames,
					from: space.startAt,
					type: 'audio',
					audioUrl: url,
					audioDurationInSeconds: metadata.slowDurationInSeconds,
					audioStartFromInSeconds: 0,
					isDragging: false,
				});
			} else {
				ensureAddAndSelectItem(space.trackIndex, {
					id: generateRandomId(),
					durationInFrames,
					videoDurationInSeconds: metadata.slowDurationInSeconds,
					videoStartFromInSeconds: 0,
					from: space.startAt,
					type: 'video',
					videoUrl: url,
					isDragging: false,
				});
			}
		},
		[fps, findSpaceForItem, ensureAddAndSelectItem, playerRef],
	);

	const handleImageFile = useCallback(
		async (file: File) => {
			const url = URL.createObjectURL(file);
			const durationInFrames = 60;

			const space = findSpaceForItem(
				durationInFrames,
				playerRef.current?.getCurrentFrame() ?? 0,
			);

			if (!space) {
				return;
			}

			ensureAddAndSelectItem(space.trackIndex, {
				id: generateRandomId(),
				durationInFrames,
				from: space.startAt,
				type: 'image',
				imgUrl: url,
				isDragging: false,
			});
		},
		[findSpaceForItem, ensureAddAndSelectItem, playerRef],
	);

	const onDragOver: React.DragEventHandler = useCallback((e) => {
		e.preventDefault();
		e.stopPropagation();
		e.dataTransfer.dropEffect = 'copy';
	}, []);

	const onDrop: React.DragEventHandler = useCallback(
		async (e) => {
			e.preventDefault();

			const {current} = playerRef;
			if (!current) {
				throw new Error('playerRef is null');
			}

			const containerNode = current.getContainerNode();
			if (!containerNode) {
				throw new Error('containerNode is null');
			}

			for (const file of e.dataTransfer.files) {
				if (file.type === 'video/mp4' || file.type === 'video/webm') {
					await handleVideoFile(file);
				} else if (file.type === 'image/jpeg' || file.type === 'image/png') {
					await handleImageFile(file);
				}
			}
		},
		[handleVideoFile, handleImageFile, playerRef],
	);

	return (
		<AbsoluteFill onDragOver={onDragOver} onDrop={onDrop}>
			{children}
		</AbsoluteFill>
	);
};
