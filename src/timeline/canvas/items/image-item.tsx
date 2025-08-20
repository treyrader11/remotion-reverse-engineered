import React from 'react';
import {Img} from 'remotion';
import {ItemType} from '../../remotion-timeline/types';

const imageStyle: React.CSSProperties = {
	position: 'absolute',
	left: '50%',
	top: '50%',
	transform: 'translate(-50%, -50%)',
	width: '100%',
};

export const ImageItem: React.FC<{
	item: ItemType;
}> = ({item}) => {
	if (item.type !== 'image') {
		throw new Error('Item is not an image');
	}

	return <Img src={item.imgUrl} style={imageStyle} />;
};
