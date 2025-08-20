
export interface TimelineItem {
  id: string;
  type: 'video' | 'audio' | 'image' | 'text' | 'solid';
  trackIndex: number;
  startFrame: number;
  durationInFrames: number;
  startTime?: number; // For video/audio items
  endTime?: number;
  url?: string;
  props?: Record<string, any>;
}

export interface Track {
  id: string;
  items: TimelineItem[];
  muted?: boolean;
  volume?: number;
}

export interface TimelineState {
  tracks: Track[];
  currentFrame: number;
  fps: number;
  totalDurationInFrames: number;
}

export interface RenderPlan {
  video: {
    layers: Array<{
      item: TimelineItem;
      opacity: number;
      transform: {
        x: number;
        y: number;
        scaleX: number;
        scaleY: number;
        rotation: number;
      };
      transition?: {
        type: 'crossfade' | 'wipe';
        progress: number;
        withItem?: TimelineItem;
      };
    }>;
  };
  audio: {
    regions: Array<{
      item: TimelineItem;
      gain: number;
      startTime: number;
      endTime: number;
    }>;
  };
}

export class TimelineEngine {
  private state: TimelineState;
  private listeners: Set<(state: TimelineState) => void> = new Set();

  constructor(initialState: TimelineState) {
    this.state = { ...initialState };
  }

  getState(): TimelineState {
    return { ...this.state };
  }

  updateState(updates: Partial<TimelineState>): void {
    this.state = { ...this.state, ...updates };
    this.notifyListeners();
  }

  addItem(trackIndex: number, item: Omit<TimelineItem, 'trackIndex'>): void {
    const tracks = [...this.state.tracks];
    if (!tracks[trackIndex]) {
      tracks[trackIndex] = { id: `track-${trackIndex}`, items: [] };
    }
    
    tracks[trackIndex] = {
      ...tracks[trackIndex],
      items: [...tracks[trackIndex].items, { ...item, trackIndex }]
    };

    this.updateState({ tracks });
  }

  removeItem(itemId: string): void {
    const tracks = this.state.tracks.map(track => ({
      ...track,
      items: track.items.filter(item => item.id !== itemId)
    }));

    this.updateState({ tracks });
  }

  updateItem(itemId: string, updates: Partial<TimelineItem>): void {
    const tracks = this.state.tracks.map(track => ({
      ...track,
      items: track.items.map(item => 
        item.id === itemId ? { ...item, ...updates } : item
      )
    }));

    this.updateState({ tracks });
  }

  seekTo(frame: number): void {
    this.updateState({ currentFrame: Math.max(0, frame) });
  }

  computeRenderPlan(frame: number): RenderPlan {
    const plan: RenderPlan = {
      video: { layers: [] },
      audio: { regions: [] }
    };

    for (const track of this.state.tracks) {
      for (const item of track.items) {
        const itemStart = item.startFrame;
        const itemEnd = item.startFrame + item.durationInFrames;

        if (frame >= itemStart && frame < itemEnd) {
          const progress = (frame - itemStart) / item.durationInFrames;

          if (item.type === 'video' || item.type === 'image' || item.type === 'text' || item.type === 'solid') {
            plan.video.layers.push({
              item,
              opacity: 1,
              transform: {
                x: 0,
                y: 0,
                scaleX: 1,
                scaleY: 1,
                rotation: 0
              }
            });
          }

          if (item.type === 'video' || item.type === 'audio') {
            const currentTime = (frame - itemStart) / this.state.fps;
            plan.audio.regions.push({
              item,
              gain: track.volume || 1,
              startTime: currentTime,
              endTime: currentTime + (1 / this.state.fps)
            });
          }
        }
      }
    }

    return plan;
  }

  subscribe(listener: (state: TimelineState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.state));
  }
}
