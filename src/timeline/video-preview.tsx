import {Player, PlayerRef} from '@remotion/player';
import React, {useCallback, useMemo, useRef, useEffect} from 'react';

import {CanvasComposition, CanvasCompositionProps} from './canvas/main';
import {useTimelineContext} from './remotion-timeline/context/use-timeline-context';
import {TimelineEngine} from './engine/timeline-engine';
import {PlaybackScheduler} from './engine/playback-scheduler';
import {AudioEngine} from './engine/audio-engine';
import {CanvasRenderer} from './engine/canvas-renderer';

const DEFAULT_COMP_WIDTH = 1920;
const DEFAULT_COMP_HEIGHT = 1080;

interface VideoPreviewProps {
	loop: boolean;
	playerRef: React.RefObject<any>;
}

interface CustomPlayerRef {
	getCurrentFrame: () => number;
	seekTo: (frame: number) => void;
	play: () => void;
	pause: () => void;
}

export const VideoPreview: React.FC<VideoPreviewProps> = ({
	loop,
	playerRef,
}) => {
	const {state} = useTimelineContext();
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const engineRef = useRef<TimelineEngine | null>(null);
	const schedulerRef = useRef<PlaybackScheduler | null>(null);
	const audioEngineRef = useRef<AudioEngine | null>(null);
	const rendererRef = useRef<CanvasRenderer | null>(null);

	// Initialize engines
	useEffect(() => {
		if (!canvasRef.current) return;

		// Create timeline engine
		const timelineEngine = new TimelineEngine({
			tracks: state.tracks.map(track => ({
				id: track.id,
				items: track.items.map(item => ({
					id: item.id,
					type: item.type,
					trackIndex: 0,
					startFrame: item.from,
					durationInFrames: item.durationInFrames,
					url: item.type === 'video' ? item.videoUrl : 
						 item.type === 'audio' ? item.audioUrl :
						 item.type === 'image' ? item.imageUrl : undefined,
					props: item
				}))
			})),
			currentFrame: 0,
			fps: state.fps,
			totalDurationInFrames: state.tracks.reduce((max, track) => {
				const trackMax = track.items.reduce((trackMax, item) => {
					return Math.max(trackMax, item.from + item.durationInFrames);
				}, 0);
				return Math.max(max, trackMax);
			}, 300)
		});

		// Create audio engine
		const audioEngine = new AudioEngine();

		// Create canvas renderer
		const canvasRenderer = new CanvasRenderer({
			width: DEFAULT_COMP_WIDTH,
			height: DEFAULT_COMP_HEIGHT,
			canvas: canvasRef.current
		});

		// Create scheduler
		const scheduler = new PlaybackScheduler(timelineEngine, canvasRenderer, audioEngine);

		engineRef.current = timelineEngine;
		audioEngineRef.current = audioEngine;
		rendererRef.current = canvasRenderer;
		schedulerRef.current = scheduler;

		// Setup player ref API
		if (playerRef.current) {
			playerRef.current = {
				getCurrentFrame: () => timelineEngine.getState().currentFrame,
				seekTo: (frame: number) => {
					const timeInSeconds = frame / state.fps;
					scheduler.seekTo(timeInSeconds);
				},
				play: () => scheduler.play(),
				pause: () => scheduler.pause(),
				getContainerNode: () => canvasRef.current?.parentElement || null
			} as CustomPlayerRef;
		}

		// Initial render
		scheduler.seekTo(0);

		return () => {
			scheduler.cleanup();
		};
	}, [state, playerRef]);

	// Update engine state when timeline state changes
	useEffect(() => {
		if (!engineRef.current) return;

		engineRef.current.updateState({
			tracks: state.tracks.map(track => ({
				id: track.id,
				items: track.items.map(item => ({
					id: item.id,
					type: item.type,
					trackIndex: 0,
					startFrame: item.from,
					durationInFrames: item.durationInFrames,
					url: item.type === 'video' ? item.videoUrl : 
						 item.type === 'audio' ? item.audioUrl :
						 item.type === 'image' ? item.imageUrl : undefined,
					props: item
				}))
			})),
			fps: state.fps,
			totalDurationInFrames: state.tracks.reduce((max, track) => {
				const trackMax = track.items.reduce((trackMax, item) => {
					return Math.max(trackMax, item.from + item.durationInFrames);
				}, 0);
				return Math.max(max, trackMax);
			}, 300)
		});
	}, [state]);

	return (
		<div className="flex aspect-video w-full items-center justify-center bg-black">
			<canvas
				ref={canvasRef}
				style={{
					width: '100%',
					height: '100%',
					objectFit: 'contain'
				}}
			/>
		</div>
	);
};