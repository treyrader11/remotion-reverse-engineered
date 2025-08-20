
export interface AudioRegion {
  sourceNode: AudioBufferSourceNode;
  gainNode: GainNode;
  startTime: number;
  endTime: number;
}

export class AudioEngine {
  private audioContext: AudioContext;
  private masterGainNode: GainNode;
  private activeRegions: Map<string, AudioRegion> = new Map();
  private audioBuffers: Map<string, AudioBuffer> = new Map();

  constructor() {
    this.audioContext = new AudioContext();
    this.masterGainNode = this.audioContext.createGain();
    this.masterGainNode.connect(this.audioContext.destination);
  }

  async loadAudioBuffer(url: string, itemId: string): Promise<void> {
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      this.audioBuffers.set(itemId, audioBuffer);
    } catch (error) {
      console.error('Error loading audio buffer:', error);
    }
  }

  scheduleAudioRegion(
    itemId: string,
    startTime: number,
    duration: number,
    gain: number = 1,
    audioStartOffset: number = 0
  ): void {
    const audioBuffer = this.audioBuffers.get(itemId);
    if (!audioBuffer) {
      console.warn(`Audio buffer not found for item ${itemId}`);
      return;
    }

    // Stop any existing region for this item
    this.stopAudioRegion(itemId);

    const sourceNode = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();

    sourceNode.buffer = audioBuffer;
    sourceNode.connect(gainNode);
    gainNode.connect(this.masterGainNode);
    gainNode.gain.value = gain;

    const now = this.audioContext.currentTime;
    const scheduleTime = now + startTime;

    sourceNode.start(scheduleTime, audioStartOffset, duration);

    this.activeRegions.set(itemId, {
      sourceNode,
      gainNode,
      startTime: scheduleTime,
      endTime: scheduleTime + duration
    });

    // Auto-cleanup when finished
    sourceNode.onended = () => {
      this.stopAudioRegion(itemId);
    };
  }

  stopAudioRegion(itemId: string): void {
    const region = this.activeRegions.get(itemId);
    if (region) {
      try {
        region.sourceNode.stop();
      } catch (error) {
        // Source might already be stopped
      }
      region.sourceNode.disconnect();
      region.gainNode.disconnect();
      this.activeRegions.delete(itemId);
    }
  }

  stopAllAudio(): void {
    for (const itemId of this.activeRegions.keys()) {
      this.stopAudioRegion(itemId);
    }
  }

  setMasterVolume(volume: number): void {
    this.masterGainNode.gain.value = Math.max(0, Math.min(1, volume));
  }

  getCurrentTime(): number {
    return this.audioContext.currentTime;
  }

  suspend(): Promise<void> {
    return this.audioContext.suspend();
  }

  resume(): Promise<void> {
    return this.audioContext.resume();
  }

  close(): Promise<void> {
    this.stopAllAudio();
    return this.audioContext.close();
  }
}
