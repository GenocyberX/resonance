import { AudioSource } from './AudioSource';

/**
 * Concrete AudioSource for local files chosen by the user in the browser.
 */
export class LocalFileSource extends AudioSource {
  private audioElement: HTMLAudioElement | null = null;
  private mediaNode: MediaElementAudioSourceNode | null = null;
  private objectUrl: string | null = null;
  private trackTitle: string = 'No file loaded';
  private _isLoaded: boolean = false;
  private connectedContext: AudioContext | null = null;

  constructor() {
    super();
    this.createAudioElement();
  }

  private createAudioElement(): void {
    this.audioElement = new Audio();
    this.audioElement.crossOrigin = 'anonymous';
    this.audioElement.preload = 'auto';

    this.audioElement.addEventListener('ended', () => {
      this.onEnded?.();
    });

    this.audioElement.addEventListener('loadedmetadata', () => {
      this._isLoaded = true;
      this.onLoaded?.();
    });

    this.audioElement.addEventListener('timeupdate', () => {
      if (this.audioElement) {
        this.onTimeUpdate?.(this.audioElement.currentTime);
      }
    });
  }

  public async load(input: unknown): Promise<void> {
    if (!(input instanceof File)) {
      throw new Error('LocalFileSource expects a browser File object.');
    }

    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
    }

    this.trackTitle = input.name.replace(/\.[^/.]+$/, '');
    this.objectUrl = URL.createObjectURL(input);

    if (!this.audioElement) {
      this.createAudioElement();
    }

    const audio = this.audioElement!;
    audio.src = this.objectUrl;
    audio.load();

    return new Promise((resolve, reject) => {
      const onCanPlay = () => {
        audio.removeEventListener('canplay', onCanPlay);
        audio.removeEventListener('error', onError);
        this._isLoaded = true;
        resolve();
      };
      const onError = (e: Event) => {
        audio.removeEventListener('canplay', onCanPlay);
        audio.removeEventListener('error', onError);
        reject(new Error(`Failed to load audio file: ${e}`));
      };

      audio.addEventListener('canplay', onCanPlay);
      audio.addEventListener('error', onError);
    });
  }

  public async play(): Promise<void> {
    if (!this.audioElement || !this._isLoaded) return;
    await this.audioElement.play();
  }

  public pause(): void {
    if (!this.audioElement) return;
    this.audioElement.pause();
  }

  public seek(timeSeconds: number): void {
    if (!this.audioElement || !this._isLoaded) return;
    const clamped = Math.max(0, Math.min(timeSeconds, this.getDuration()));
    this.audioElement.currentTime = clamped;
  }

  public getCurrentTime(): number {
    return this.audioElement?.currentTime ?? 0;
  }

  public getDuration(): number {
    const dur = this.audioElement?.duration;
    return isNaN(dur ?? 0) ? 0 : (dur ?? 0);
  }

  public isPlaying(): boolean {
    return !!(this.audioElement && !this.audioElement.paused && !this.audioElement.ended && this.audioElement.readyState > 2);
  }

  public isLoaded(): boolean {
    return this._isLoaded;
  }

  public getTitle(): string {
    return this.trackTitle;
  }

  public connect(context: AudioContext, destinationNode: AudioNode): AudioNode {
    if (!this.audioElement) {
      throw new Error('AudioElement is not initialized');
    }

    // Only create one MediaElementAudioSourceNode per element per context
    if (!this.mediaNode || this.connectedContext !== context) {
      this.connectedContext = context;
      this.mediaNode = context.createMediaElementSource(this.audioElement);
    }

    this.mediaNode.disconnect();
    this.mediaNode.connect(destinationNode);
    return this.mediaNode;
  }

  public dispose(): void {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.src = '';
      this.audioElement = null;
    }
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
      this.objectUrl = null;
    }
    if (this.mediaNode) {
      this.mediaNode.disconnect();
      this.mediaNode = null;
    }
    this._isLoaded = false;
  }
}
