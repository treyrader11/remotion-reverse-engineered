import {Audio, useVideoConfig} from 'remotion';
import {AudioItem as AudioItemType} from '../../remotion-timeline/types';

export const AudioItem = ({item}: {item: AudioItemType}) => {
	if (item.type !== 'audio') {
		throw new Error('Item is not an audio');
	}

	const {fps} = useVideoConfig();

	return (
		<Audio
			src={item.audioUrl}
			startFrom={item.audioStartFromInSeconds * fps}
			endAt={(item.audioDurationInSeconds + item.audioStartFromInSeconds) * fps}
		/>
	);
};
