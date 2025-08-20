
import { TimelineEngine } from './timeline-engine';
import { CanvasRenderer } from './canvas-renderer';
import { AudioEngine } from './audio-engine';

export class PlaybackScheduler {
  private timelineEngine: TimelineEngine;
  private canvasRenderer: CanvasRenderer;
  private audioEngine: AudioEngine;
  private isPlaying = false;
  private animationFrameId: number | null = null;
  private startTime = 0;
  private pausedTime = 0;

  constructor(
    timelineEngine: TimelineEngine,
    canvasRenderer: CanvasRenderer,
    audioEngine: AudioEngine
  ) {
    this.timelineEngine = timelineEngine;
    this.canvasRenderer = canvasRenderer;
    this.audioEngine = audioEngine;
  }

  play() {
    if (this.isPlaying) return;
    
    this.isPlaying = true;
    this.startTime = performance.now() - this.pausedTime;
    this.scheduleFrame();
  }

  pause() {
    this.isPlaying = false;
    this.pausedTime = performance.now() - this.startTime;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  seekTo(timeInSeconds: number) {
    this.pausedTime = timeInSeconds * 1000;
    this.startTime = performance.now() - this.pausedTime;
    
    const frame = Math.floor(timeInSeconds * this.timelineEngine.getState().fps);
    this.timelineEngine.seekTo(frame);
    this.renderCurrentFrame();
  }

  private scheduleFrame = () => {
    if (!this.isPlaying) return;

    const currentTime = performance.now();
    const elapsed = currentTime - this.startTime;
    const timeInSeconds = elapsed / 1000;
    
    const frame = Math.floor(timeInSeconds * this.timelineEngine.getState().fps);
    this.timelineEngine.seekTo(frame);
    this.renderCurrentFrame();

    this.animationFrameId = requestAnimationFrame(this.scheduleFrame);
  };

  private renderCurrentFrame() {
    const renderPlan = this.timelineEngine.getRenderPlan();
    this.canvasRenderer.render(renderPlan);
  }

  cleanup() {
    this.pause();
  }
}
