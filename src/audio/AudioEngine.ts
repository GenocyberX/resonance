import { AudioSource } from './sources/AudioSource';
import { AudioAnalyzer } from './AudioAnalyzer';
import { MusicStateEngine } from './MusicStateEngine';
import { AudioFeatures, AudioPlaybackState, MusicState } from './types';

export class AudioEngine {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private analyzer: AudioAnalyzer | null = null;
  private stateEngine: MusicStateEngine;

  private currentSource: AudioSource | null = null;
  private isContextInitialized: boolean = false;
  private volume: number = 0.8;

  // Demo fallback state when no track is playing
  private demoTime: number = 0;

  constructor() {
    this.stateEngine = new MusicStateEngine();
  }

  /**
   * Initializes the Web Audio Context and audio graph.
   * Called on first user interaction to comply with browser autoplay policies.
   */
  public initContext(): void {
    if (this.isContextInitialized && this.audioContext) {
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }
      return;
    }

    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.audioContext = new AudioContextClass();

    this.masterGain = this.audioContext.createGain();
    this.masterGain.gain.value = this.volume;

    this.analyserNode = this.audioContext.createAnalyser();
    this.analyserNode.fftSize = 1024;
    this.analyserNode.smoothingTimeConstant = 0.8;

    this.analyzer = new AudioAnalyzer(this.analyserNode);

    // Audio graph: Source -> MasterGain -> Analyser -> Destination
    this.masterGain.connect(this.analyserNode);
    this.analyserNode.connect(this.audioContext.destination);

    this.isContextInitialized = true;
  }

  public async setSource(source: AudioSource): Promise<void> {
    this.initContext();

    if (this.currentSource && this.currentSource !== source) {
      this.currentSource.pause();
      this.currentSource.dispose();
    }

    this.currentSource = source;

    if (this.audioContext && this.masterGain) {
      this.currentSource.connect(this.audioContext, this.masterGain);
    }

    this.stateEngine.reset();
  }

  public async play(): Promise<void> {
    this.initContext();
    if (this.audioContext?.state === 'suspended') {
      await this.audioContext.resume();
    }
    if (this.currentSource) {
      await this.currentSource.play();
    }
  }

  public pause(): void {
    if (this.currentSource) {
      this.currentSource.pause();
    }
  }

  public seek(timeSeconds: number): void {
    if (this.currentSource) {
      this.currentSource.seek(timeSeconds);
    }
  }

  public setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(this.volume, this.audioContext?.currentTime ?? 0);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public getPlaybackState(): AudioPlaybackState {
    const isLoaded = this.currentSource?.isLoaded() ?? false;
    const isPlaying = this.currentSource?.isPlaying() ?? false;
    const currentTime = this.currentSource?.getCurrentTime() ?? 0;
    const duration = this.currentSource?.getDuration() ?? 0;
    const title = this.currentSource?.getTitle() ?? 'NO AUDIO (DEMO MODE)';

    return {
      isLoaded,
      isPlaying,
      isPaused: isLoaded && !isPlaying,
      currentTime,
      duration,
      title,
      volume: this.volume,
    };
  }

  /**
   * Main update tick called per animation frame.
   * Analyzes live audio signal or generates ambient demo modulation.
   */
  public update(dt: number): MusicState {
    const playback = this.getPlaybackState();

    if (playback.isPlaying && this.analyzer) {
      const rawFeatures = this.analyzer.analyze(playback.currentTime);
      return this.stateEngine.update(rawFeatures, dt);
    }

    // Demo Mode: generate gentle procedural synthetic musical features
    this.demoTime += dt;
    const demoFeatures = this.generateDemoFeatures(this.demoTime);
    return this.stateEngine.update(demoFeatures, dt);
  }

  private generateDemoFeatures(t: number): AudioFeatures {
    const slowLfo = Math.sin(t * 0.4) * 0.5 + 0.5;
    const midLfo = Math.sin(t * 1.2) * 0.5 + 0.5;
    const fastLfo = Math.sin(t * 2.8) * 0.5 + 0.5;

    // Simulate gentle 120 bpm pulse (0.5s period)
    const beatPhase = (t % 0.5) / 0.5;
    const isBeat = beatPhase < 0.08;

    return {
      bass: 0.2 + slowLfo * 0.35 + (isBeat ? 0.3 : 0),
      mids: 0.2 + midLfo * 0.3,
      treble: 0.15 + fastLfo * 0.25,
      energy: 0.25 + slowLfo * 0.3 + (isBeat ? 0.2 : 0),
      rms: 0.2 + slowLfo * 0.2,
      spectralCentroid: 0.3 + midLfo * 0.2,
      spectralFlux: isBeat ? 0.4 : 0.05,
      beat: isBeat,
      beatConfidence: isBeat ? 0.7 : 0,
      timestamp: t,
    };
  }

  public getSource(): AudioSource | null {
    return this.currentSource;
  }
}
