import React from 'react';
import type {ItemType} from '../remotion-timeline/types';
import {AudioItem} from './items/audio-item';
import {ImageItem} from './items/image-item';
import {SolidItem} from './items/solid-item';
import {TextItem} from './items/text-item';
import {VideoItem} from './items/video-item';

export const Item: React.FC<{
	item: ItemType;
}> = ({item}) => {
	if (item.type === 'image') {
		return <ImageItem item={item} />;
	}

	if (item.type === 'text') {
		return <TextItem item={item} />;
	}

	if (item.type === 'video') {
		return <VideoItem item={item} />;
	}

	if (item.type === 'solid') {
		return <SolidItem item={item} />;
	}

	if (item.type === 'audio') {
		return <AudioItem item={item} />;
	}

	throw new Error(
		'Unimplemented item type: ' + JSON.stringify(item satisfies never),
	);
};
