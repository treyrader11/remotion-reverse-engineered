
export interface DecodedFrame {
  frame: VideoFrame;
  timestamp: number;
}

export interface DecodedAudio {
  data: AudioData;
  timestamp: number;
}

export class WebCodecsVideoDecoder {
  private decoder: VideoDecoder | null = null;
  private frameQueue: Map<number, VideoFrame> = new Map();
  private pendingFrames: Set<number> = new Set();

  async initialize(config: VideoDecoderConfig): Promise<void> {
    this.decoder = new VideoDecoder({
      output: (frame: VideoFrame) => {
        const timestamp = Math.floor(frame.timestamp / 1000); // Convert to ms
        this.frameQueue.set(timestamp, frame);
        this.pendingFrames.delete(timestamp);
      },
      error: (error: Error) => {
        console.error('Video decoder error:', error);
      }
    });

    this.decoder.configure(config);
  }

  async decodeChunk(chunk: EncodedVideoChunk): Promise<void> {
    if (!this.decoder) {
      throw new Error('Decoder not initialized');
    }

    this.decoder.decode(chunk);
  }

  getFrame(timestamp: number): VideoFrame | null {
    return this.frameQueue.get(timestamp) || null;
  }

  requestFrame(timestamp: number): void {
    if (!this.pendingFrames.has(timestamp) && !this.frameQueue.has(timestamp)) {
      this.pendingFrames.add(timestamp);
      // In a real implementation, you'd request the specific frame from your video source
    }
  }

  cleanup(): void {
    this.frameQueue.forEach(frame => frame.close());
    this.frameQueue.clear();
    this.pendingFrames.clear();
    
    if (this.decoder) {
      this.decoder.close();
      this.decoder = null;
    }
  }
}

export class WebCodecsAudioDecoder {
  private decoder: AudioDecoder | null = null;
  private audioQueue: Map<number, AudioData> = new Map();

  async initialize(config: AudioDecoderConfig): Promise<void> {
    this.decoder = new AudioDecoder({
      output: (audio: AudioData) => {
        const timestamp = Math.floor(audio.timestamp / 1000);
        this.audioQueue.set(timestamp, audio);
      },
      error: (error: Error) => {
        console.error('Audio decoder error:', error);
      }
    });

    this.decoder.configure(config);
  }

  async decodeChunk(chunk: EncodedAudioChunk): Promise<void> {
    if (!this.decoder) {
      throw new Error('Decoder not initialized');
    }

    this.decoder.decode(chunk);
  }

  getAudio(timestamp: number): AudioData | null {
    return this.audioQueue.get(timestamp) || null;
  }

  cleanup(): void {
    this.audioQueue.forEach(audio => audio.close());
    this.audioQueue.clear();
    
    if (this.decoder) {
      this.decoder.close();
      this.decoder = null;
    }
  }
}
