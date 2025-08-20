
import { WebCodecsVideoDecoder, WebCodecsAudioDecoder } from './webcodecs-decoder';

export interface MediaMetadata {
  duration: number;
  width?: number;
  height?: number;
  hasVideo: boolean;
  hasAudio: boolean;
  videoCodec?: string;
  audioCodec?: string;
}

export class MediaLoader {
  private static instance: MediaLoader | null = null;

  static getInstance(): MediaLoader {
    if (!MediaLoader.instance) {
      MediaLoader.instance = new MediaLoader();
    }
    return MediaLoader.instance;
  }

  async loadMediaMetadata(url: string): Promise<MediaMetadata> {
    try {
      // Create a video element to get basic metadata
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.crossOrigin = 'anonymous';
      
      const metadata = await new Promise<MediaMetadata>((resolve, reject) => {
        video.onloadedmetadata = () => {
          resolve({
            duration: video.duration,
            width: video.videoWidth || undefined,
            height: video.videoHeight || undefined,
            hasVideo: video.videoWidth > 0,
            hasAudio: true, // Assume audio for now
            videoCodec: 'h264', // Default assumption
            audioCodec: 'aac'
          });
        };
        
        video.onerror = () => {
          reject(new Error('Failed to load media metadata'));
        };
        
        video.src = url;
      });

      return metadata;
    } catch (error) {
      console.error('Error loading media metadata:', error);
      throw error;
    }
  }

  async createVideoDecoder(url: string): Promise<WebCodecsVideoDecoder> {
    const metadata = await this.loadMediaMetadata(url);
    
    if (!metadata.hasVideo) {
      throw new Error('Media does not contain video');
    }

    const decoder = new WebCodecsVideoDecoder();
    
    // Basic H.264 config - in a real implementation, you'd extract this from the media file
    await decoder.initialize({
      codec: 'avc1.42E01E', // H.264 Baseline Profile
      codedWidth: metadata.width || 1920,
      codedHeight: metadata.height || 1080
    });

    return decoder;
  }

  async createAudioDecoder(url: string): Promise<WebCodecsAudioDecoder> {
    const metadata = await this.loadMediaMetadata(url);
    
    if (!metadata.hasAudio) {
      throw new Error('Media does not contain audio');
    }

    const decoder = new WebCodecsAudioDecoder();
    
    // Basic AAC config
    await decoder.initialize({
      codec: 'mp4a.40.2', // AAC-LC
      sampleRate: 44100,
      numberOfChannels: 2
    });

    return decoder;
  }

  async extractVideoFrames(url: string, timestamps: number[]): Promise<VideoFrame[]> {
    // This is a simplified implementation
    // In a real scenario, you'd need to:
    // 1. Demux the media file (using mp4box.js or similar)
    // 2. Extract encoded chunks for specific timestamps
    // 3. Decode them using WebCodecs
    
    const frames: VideoFrame[] = [];
    
    try {
      const video = document.createElement('video');
      video.crossOrigin = 'anonymous';
      video.src = url;
      
      await new Promise((resolve) => {
        video.onloadeddata = resolve;
      });

      for (const timestamp of timestamps) {
        video.currentTime = timestamp;
        
        await new Promise((resolve) => {
          video.onseeked = resolve;
        });

        // Create VideoFrame from video element
        if (video.videoWidth > 0) {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(video, 0, 0);
          
          // Convert canvas to VideoFrame (this is a workaround)
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const frame = new VideoFrame(imageData, {
            timestamp: timestamp * 1000000, // Convert to microseconds
            duration: 33333 // ~30fps
          });
          
          frames.push(frame);
        }
      }
    } catch (error) {
      console.error('Error extracting video frames:', error);
    }

    return frames;
  }
}
