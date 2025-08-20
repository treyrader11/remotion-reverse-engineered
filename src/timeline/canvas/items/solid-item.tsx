import React from 'react';
import type {ItemType} from '../../remotion-timeline/types';

const solidSyles: React.CSSProperties = {
	position: 'absolute',
	height: 600,
	width: 600,
	left: '50%',
	top: '50%',
	transform: 'translate(-50%, -50%)',
	background: 'black',
};

export const SolidItem = ({item}: {item: ItemType}) => {
	if (item.type !== 'solid') {
		throw new Error('Item is not a solid');
	}

	return (
		<div
			style={{
				...solidSyles,
				background: item.color,
			}}
		/>
	);
};
