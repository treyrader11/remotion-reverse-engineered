import {OffthreadVideo, useVideoConfig} from 'remotion';
import {VideoItem as VideoItemType} from '../../remotion-timeline/types';

const videoStyle: React.CSSProperties = {
	position: 'absolute',
	left: '50%',
	top: '50%',
	transform: 'translate(-50%, -50%)',
	width: '100%',
};

export const VideoItem = ({item}: {item: VideoItemType}) => {
	if (item.type !== 'video') {
		throw new Error('Item is not a video');
	}

	const {fps} = useVideoConfig();

	return (
		<OffthreadVideo
			pauseWhenBuffering
			startFrom={item.videoStartFromInSeconds * fps}
			style={videoStyle}
			src={item.videoUrl}
		/>
	);
};
