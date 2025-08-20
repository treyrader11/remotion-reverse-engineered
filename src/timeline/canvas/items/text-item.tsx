import {ItemType} from '../../remotion-timeline/types';

const FONT_SIZE = 200;
const LINE_HEIGHT = 1.5;

export const TextItem = ({item}: {item: ItemType}) => {
	if (item.type !== 'text') {
		throw new Error('Item is not a text');
	}

	return (
		<div
			style={{
				fontSize: FONT_SIZE,
				color: item.color,
				lineHeight: String(LINE_HEIGHT),
				// center text for demo purposes
				left: '50%',
				top: '50%',
				transform: 'translate(-50%, -50%)',
				position: 'absolute',
				whiteSpace: 'pre',
				display: 'inline',
				fontFamily: 'sans-serif',
				userSelect: 'none',
			}}
		>
			{item.text}
		</div>
	);
};
