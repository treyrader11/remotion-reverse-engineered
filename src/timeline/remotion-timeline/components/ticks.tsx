import {useTimelineSize} from '../context/use-timeline-size';
import type {TimelineTickMark} from '../hooks/use-ticks';

export const TICKS_HEIGHT = 30;

export const TicksBackground = () => (
	<div
		style={{height: TICKS_HEIGHT}}
		className="bg-timeline-panel absolute top-0 w-full"
	/>
);

export const TickHeaders = ({
	tickMarks,
	...props
}: {
	tickMarks: TimelineTickMark[];
} & React.HTMLAttributes<HTMLDivElement>) => {
	return (
		<div id="tick-headers" className="flex w-full select-none" {...props}>
			{tickMarks.map((tick, i) => (
				<div key={i} className="relative">
					<div
						className="border-r-timeline-tick-separator bg-timeline-panel text-timeline-tick-text flex items-start justify-end truncate border-r-[1px] pt-3 pr-1"
						style={{
							fontSize: 10,
							width: tick.width,
							minWidth: tick.width,
							height: TICKS_HEIGHT,
						}}
					>
						{tick.label}
					</div>
				</div>
			))}
		</div>
	);
};

export const TickLines = ({tickMarks}: {tickMarks: TimelineTickMark[]}) => {
	const {timelineWidth} = useTimelineSize();
	return (
		<div
			id="tick-lines"
			className="absolute top-0 left-0 flex h-full select-none"
			style={{width: timelineWidth}}
		>
			{tickMarks.map((tick, i) => (
				<div
					key={i}
					style={{
						width: tick.width,
						minWidth: tick.width,
					}}
					className="border-r-timeline-tick-separator flex min-h-full items-start justify-end truncate border-r-[1px] pt-3 pr-1"
				/>
			))}
		</div>
	);
};
