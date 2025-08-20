import {useEffect, useState} from 'react';
import {CursorDragOverlay} from '../components/cursor-drag-overlay';

export const useDragCursor = () => {
	const [isDragging, setIsDragging] = useState(false);
	const [cursorStyle, setCursorStyle] = useState('');

	const startDrag = (style: string = 'ew-resize') => {
		setIsDragging(true);
		setCursorStyle(style);
	};

	const stopDrag = () => {
		setIsDragging(false);
		setCursorStyle('');
	};

	// Clean up on unmount
	useEffect(() => {
		return () => {
			document.body.style.cursor = '';
		};
	}, []);

	return {
		isDragging,
		startDrag,
		stopDrag,
		DragOverlay: (
			<CursorDragOverlay isActive={isDragging} cursorStyle={cursorStyle} />
		),
	};
};
