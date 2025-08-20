import {PlayerRef} from '@remotion/player';
import React, {useEffect} from 'react';

export const SpaceToPlayPause: React.FC<{
	playerRef: React.RefObject<PlayerRef | null>;
}> = ({playerRef}) => {
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.code === 'Space') {
				e.preventDefault();
				playerRef.current?.toggle();
			}
		};

		window.addEventListener('keydown', handleKeyDown);

		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
	}, [playerRef]);

	return null;
};
