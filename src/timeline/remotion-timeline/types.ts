type BaseItem = {
	id: string;
	durationInFrames: number;
	from: number;
};

type DraggableItem = BaseItem & {
	isDragging: boolean;
};

type ImageItem = DraggableItem & {
	type: 'image';
	imgUrl: string;
};
export type VideoItem = DraggableItem & {
	type: 'video';
	videoUrl: string;
	videoDurationInSeconds: number;
	videoStartFromInSeconds: number;
};

export type AudioItem = DraggableItem & {
	type: 'audio';
	audioUrl: string;
	audioDurationInSeconds: number;
	audioStartFromInSeconds: number;
};

type TextItem = DraggableItem & {
	type: 'text';
	text: string;
	color: string;
};

export type SolidItem = DraggableItem & {
	type: 'solid';
	color: string;
};

export type ItemType = ImageItem | TextItem | VideoItem | SolidItem | AudioItem;

export type TrackType = {
	items: ItemType[];
	id: string;
	name: string;
};
