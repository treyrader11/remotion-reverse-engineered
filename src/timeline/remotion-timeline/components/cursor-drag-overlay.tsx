interface DragOverlayProps {
	isActive: boolean;
	cursorStyle: string;
}

export const CursorDragOverlay: React.FC<DragOverlayProps> = ({
	isActive,
	cursorStyle,
}) => {
	if (!isActive) return null;

	return (
		<div
			style={{
				position: 'fixed',
				width: '100%',
				height: '100%',
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				zIndex: 9999,
				cursor: cursorStyle,
				// Using a transparent background to capture all events
				backgroundColor: 'transparent',
				// Prevent text selection during drag
				userSelect: 'none',
				// Prevent hover effects during drag
			}}
		/>
	);
};
