/**
 * Abstract Audio Source interface.
 * Decouples the playback engine and analyzer from the specific origin of the audio signal
 * (e.g. LocalFileSource now, SpotifySource, YouTubeSource, MicrophoneSource in the future).
 */
export abstract class AudioSource {
  public onEnded?: () => void;
  public onLoaded?: () => void;
  public onTimeUpdate?: (currentTime: number) => void;

  public abstract load(input: unknown): Promise<void>;
  public abstract play(): Promise<void>;
  public abstract pause(): void;
  public abstract seek(timeSeconds: number): void;
  public abstract getCurrentTime(): number;
  public abstract getDuration(): number;
  public abstract isPlaying(): boolean;
  public abstract isLoaded(): boolean;
  public abstract getTitle(): string;

  /**
   * Connects the audio source to the Web Audio routing graph.
   * Returns the node that sends audio downstream (to Gain/Analyser).
   */
  public abstract connect(context: AudioContext, destinationNode: AudioNode): AudioNode;

  public abstract dispose(): void;
}
