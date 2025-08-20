import React, {useEffect} from 'react';
import {useTimelineContext} from '../../context/use-timeline-context';

export const BackspaceToDelete: React.FC = () => {
	const {selectedItem, deleteItem} = useTimelineContext();

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Backspace' && selectedItem !== null) {
				deleteItem(selectedItem);
			}
		};

		window.addEventListener('keydown', handleKeyDown);

		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
	}, [deleteItem, selectedItem]);

	return null;
};
