
import { TimelineEngine, RenderPlan } from './timeline-engine';
import { CanvasRenderer } from './canvas-renderer';
import { AudioEngine } from './audio-engine';
import { WebCodecsVideoDecoder } from './webcodecs-decoder';

export interface PlaybackState {
  isPlaying: boolean;
  currentTime: number;
  startTime: number;
}

export class PlaybackScheduler {
  private timelineEngine: TimelineEngine;
  private canvasRenderer: CanvasRenderer;
  private audioEngine: AudioEngine;
  private videoDecoders: Map<string, WebCodecsVideoDecoder> = new Map();
  private frameCache: Map<string, VideoFrame> = new Map();
  
  private playbackState: PlaybackState = {
    isPlaying: false,
    currentTime: 0,
    startTime: 0
  };
  
  private animationFrameId: number | null = null;
  private lastFrameTime: number = 0;

  constructor(
    timelineEngine: TimelineEngine,
    canvasRenderer: CanvasRenderer,
    audioEngine: AudioEngine
  ) {
    this.timelineEngine = timelineEngine;
    this.canvasRenderer = canvasRenderer;
    this.audioEngine = audioEngine;
  }

  play(): void {
    if (this.playbackState.isPlaying) return;

    this.playbackState.isPlaying = true;
    this.playbackState.startTime = performance.now() - (this.playbackState.currentTime * 1000);
    
    this.audioEngine.resume();
    this.startRenderLoop();
  }

  pause(): void {
    if (!this.playbackState.isPlaying) return;

    this.playbackState.isPlaying = false;
    this.audioEngine.suspend();
    
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  seekTo(timeInSeconds: number): void {
    const wasPlaying = this.playbackState.isPlaying;
    
    if (wasPlaying) {
      this.pause();
    }

    this.playbackState.currentTime = timeInSeconds;
    this.playbackState.startTime = performance.now() - (timeInSeconds * 1000);

    // Stop all audio and flush caches
    this.audioEngine.stopAllAudio();
    this.flushFrameCache();

    // Update timeline engine
    const state = this.timelineEngine.getState();
    const frame = Math.floor(timeInSeconds * state.fps);
    this.timelineEngine.seekTo(frame);

    // Render current frame
    this.renderCurrentFrame();

    if (wasPlaying) {
      this.play();
    }
  }

  private startRenderLoop(): void {
    const renderFrame = (timestamp: number) => {
      if (!this.playbackState.isPlaying) return;

      // Calculate current time
      this.playbackState.currentTime = (timestamp - this.playbackState.startTime) / 1000;
      
      const state = this.timelineEngine.getState();
      const currentFrame = Math.floor(this.playbackState.currentTime * state.fps);
      
      // Update timeline
      this.timelineEngine.seekTo(currentFrame);
      
      // Render frame
      this.renderCurrentFrame();
      
      // Schedule audio
      this.scheduleAudio();

      this.lastFrameTime = timestamp;
      this.animationFrameId = requestAnimationFrame(renderFrame);
    };

    this.animationFrameId = requestAnimationFrame(renderFrame);
  }

  private renderCurrentFrame(): void {
    const state = this.timelineEngine.getState();
    const renderPlan = this.timelineEngine.computeRenderPlan(state.currentFrame);
    
    // Pre-request frames for video items
    this.requestVideoFrames(renderPlan);
    
    // Render the frame
    this.canvasRenderer.renderFrame(renderPlan, this.frameCache);
  }

  private requestVideoFrames(renderPlan: RenderPlan): void {
    for (const layer of renderPlan.video.layers) {
      if (layer.item.type === 'video' && layer.item.url) {
        const decoder = this.videoDecoders.get(layer.item.id);
        if (decoder) {
          const timestamp = this.playbackState.currentTime * 1000; // Convert to ms
          decoder.requestFrame(timestamp);
          
          const frame = decoder.getFrame(timestamp);
          if (frame) {
            this.frameCache.set(layer.item.id, frame);
          }
        }
      }
    }
  }

  private scheduleAudio(): void {
    const state = this.timelineEngine.getState();
    const renderPlan = this.timelineEngine.computeRenderPlan(state.currentFrame);
    
    for (const region of renderPlan.audio.regions) {
      if (region.item.type === 'audio' || region.item.type === 'video') {
        this.audioEngine.scheduleAudioRegion(
          region.item.id,
          0, // Start immediately
          1 / state.fps, // Duration of one frame
          region.gain,
          region.startTime
        );
      }
    }
  }

  private flushFrameCache(): void {
    this.frameCache.forEach(frame => frame.close());
    this.frameCache.clear();
  }

  addVideoDecoder(itemId: string, decoder: WebCodecsVideoDecoder): void {
    this.videoDecoders.set(itemId, decoder);
  }

  removeVideoDecoder(itemId: string): void {
    const decoder = this.videoDecoders.get(itemId);
    if (decoder) {
      decoder.cleanup();
      this.videoDecoders.delete(itemId);
    }
  }

  cleanup(): void {
    this.pause();
    this.flushFrameCache();
    this.videoDecoders.forEach(decoder => decoder.cleanup());
    this.videoDecoders.clear();
    this.audioEngine.close();
  }
}
