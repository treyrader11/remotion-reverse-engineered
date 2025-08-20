
import { RenderPlan } from './timeline-engine';

export interface CanvasRendererConfig {
  width: number;
  height: number;
  canvas: HTMLCanvasElement;
}

export class CanvasRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;

  constructor(config: CanvasRendererConfig) {
    this.canvas = config.canvas;
    this.width = config.width;
    this.height = config.height;
    
    const ctx = this.canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get 2D context');
    }
    this.ctx = ctx;

    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  async renderFrame(plan: RenderPlan, frameCache: Map<string, VideoFrame>): Promise<void> {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Render each video layer
    for (const layer of plan.video.layers) {
      await this.renderLayer(layer, frameCache);
    }
  }

  private async renderLayer(
    layer: RenderPlan['video']['layers'][0], 
    frameCache: Map<string, VideoFrame>
  ): Promise<void> {
    const { item, opacity, transform, transition } = layer;

    this.ctx.save();

    // Apply transform
    this.ctx.globalAlpha = opacity;
    this.ctx.translate(this.width / 2, this.height / 2);
    this.ctx.scale(transform.scaleX, transform.scaleY);
    this.ctx.rotate(transform.rotation);
    this.ctx.translate(-this.width / 2 + transform.x, -this.height / 2 + transform.y);

    switch (item.type) {
      case 'video':
        await this.renderVideo(item, frameCache);
        break;
      case 'image':
        await this.renderImage(item);
        break;
      case 'text':
        this.renderText(item);
        break;
      case 'solid':
        this.renderSolid(item);
        break;
    }

    // Handle transitions
    if (transition && transition.withItem) {
      await this.renderTransition(transition, layer, frameCache);
    }

    this.ctx.restore();
  }

  private async renderVideo(item: any, frameCache: Map<string, VideoFrame>): Promise<void> {
    const frame = frameCache.get(item.id);
    if (frame) {
      this.ctx.drawImage(frame, 0, 0, this.width, this.height);
    }
  }

  private async renderImage(item: any): Promise<void> {
    if (item.url) {
      const img = new Image();
      img.src = item.url;
      await new Promise((resolve) => {
        img.onload = resolve;
      });
      this.ctx.drawImage(img, 0, 0, this.width, this.height);
    }
  }

  private renderText(item: any): void {
    this.ctx.fillStyle = item.props?.color || '#ffffff';
    this.ctx.font = `${item.props?.fontSize || 48}px ${item.props?.fontFamily || 'Arial'}`;
    this.ctx.textAlign = 'center';
    this.ctx.fillText(item.props?.text || 'Text', this.width / 2, this.height / 2);
  }

  private renderSolid(item: any): void {
    this.ctx.fillStyle = item.props?.color || '#000000';
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  private async renderTransition(
    transition: any,
    layer: any,
    frameCache: Map<string, VideoFrame>
  ): Promise<void> {
    switch (transition.type) {
      case 'crossfade':
        // Simple crossfade - just adjust opacity
        this.ctx.globalAlpha = 1 - transition.progress;
        break;
      case 'wipe':
        // Simple wipe transition
        const wipeX = this.width * transition.progress;
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.rect(wipeX, 0, this.width - wipeX, this.height);
        this.ctx.clip();
        // Render the transition item here
        this.ctx.restore();
        break;
    }
  }

  updateSize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.canvas.width = width;
    this.canvas.height = height;
  }
}
