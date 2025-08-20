import React, {useCallback} from 'react';
import {MAX_ZOOM, MIN_ZOOM} from '../constants';
import {useTimelineZoom} from '../context/use-timeline-zoom';
import {IconButton} from './icon-button';
import {MinusIcon, PlusIcon} from './icons';

export const ZoomSlider: React.FC = () => {
	const {zoom, setZoom} = useTimelineZoom();

	const ZOOM_STEP = 0.5;

	const handleSliderChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const rawValue = parseInt(e.target.value, 10);
			const realValue = rawValue / 100;
			setZoom(realValue);
		},
		[setZoom],
	);

	const handleZoomOut = useCallback(() => {
		setZoom((prev) => Math.max(prev - ZOOM_STEP, MIN_ZOOM));
	}, [setZoom]);

	const handleZoomIn = useCallback(() => {
		setZoom((prev) => Math.min(prev + ZOOM_STEP, MAX_ZOOM));
	}, [setZoom]);

	return (
		<div className="flex items-center gap-2">
			<IconButton onClick={handleZoomOut}>
				<MinusIcon className="size-3 text-white" />
			</IconButton>
			<input
				value={zoom * 100}
				onChange={handleSliderChange}
				min={MIN_ZOOM * 100}
				max={MAX_ZOOM * 100}
				step={ZOOM_STEP * 10}
				type="range"
				title="Zoom"
			/>
			<IconButton onClick={handleZoomIn}>
				<PlusIcon className="size-3 text-white" />
			</IconButton>
		</div>
	);
};
