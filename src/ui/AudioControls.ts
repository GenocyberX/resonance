import { AudioEngine } from '../audio/AudioEngine';
import { LocalFileSource } from '../audio/sources/LocalFileSource';

export interface AudioControlCallbacks {
  onSourceLoaded: (source: LocalFileSource) => void;
}

export class AudioControls {
  private engine: AudioEngine;
  private fileInput: HTMLInputElement;
  private playPauseBtn: HTMLButtonElement;
  private playIcon: HTMLElement;
  private seekBar: HTMLInputElement;
  private volumeBar: HTMLInputElement;
  private timeCurrent: HTMLElement;
  private timeDuration: HTMLElement;
  private trackTitle: HTMLElement;
  private modeBadge: HTMLElement;

  private isUserSeeking: boolean = false;

  constructor(engine: AudioEngine, callbacks: AudioControlCallbacks) {
    this.engine = engine;

    this.fileInput = document.getElementById('audio-file-input') as HTMLInputElement;
    this.playPauseBtn = document.getElementById('btn-play-pause') as HTMLButtonElement;
    this.playIcon = document.getElementById('btn-play-icon') as HTMLElement;
    this.seekBar = document.getElementById('seek-bar') as HTMLInputElement;
    this.volumeBar = document.getElementById('volume-bar') as HTMLInputElement;
    this.timeCurrent = document.getElementById('time-current') as HTMLElement;
    this.timeDuration = document.getElementById('time-duration') as HTMLElement;
    this.trackTitle = document.getElementById('track-title') as HTMLElement;
    this.modeBadge = document.getElementById('badge-mode') as HTMLElement;

    this.setupListeners(callbacks);
  }

  private setupListeners(callbacks: AudioControlCallbacks): void {
    // 1. File Upload
    this.fileInput.addEventListener('change', async (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        const file = target.files[0];
        const source = new LocalFileSource();
        try {
          await source.load(file);
          await this.engine.setSource(source);
          callbacks.onSourceLoaded(source);
          this.playPauseBtn.disabled = false;
          this.seekBar.disabled = false;
          this.modeBadge.textContent = 'AUDIO MODE';
          this.modeBadge.style.color = '#38bdf8';
          await this.engine.play();
        } catch (err) {
          console.error('Error loading audio file:', err);
        }
      }
    });

    // 2. Play / Pause
    this.playPauseBtn.addEventListener('click', async () => {
      const state = this.engine.getPlaybackState();
      if (state.isPlaying) {
        this.engine.pause();
      } else {
        await this.engine.play();
      }
    });

    // 3. Seek bar interactions
    this.seekBar.addEventListener('mousedown', () => {
      this.isUserSeeking = true;
    });

    this.seekBar.addEventListener('input', () => {
      const seekRatio = parseFloat(this.seekBar.value) / 100;
      const duration = this.engine.getPlaybackState().duration;
      const previewTime = seekRatio * duration;
      this.timeCurrent.textContent = this.formatTime(previewTime);
    });

    this.seekBar.addEventListener('change', () => {
      const seekRatio = parseFloat(this.seekBar.value) / 100;
      const duration = this.engine.getPlaybackState().duration;
      this.engine.seek(seekRatio * duration);
      this.isUserSeeking = false;
    });

    // 4. Volume control
    this.volumeBar.addEventListener('input', () => {
      const vol = parseFloat(this.volumeBar.value);
      this.engine.setVolume(vol);
    });
  }

  public update(): void {
    const state = this.engine.getPlaybackState();

    this.playIcon.textContent = state.isPlaying ? '❚❚' : '▶';
    this.trackTitle.textContent = state.title.toUpperCase();

    if (state.isLoaded) {
      this.timeDuration.textContent = this.formatTime(state.duration);
      if (!this.isUserSeeking) {
        this.timeCurrent.textContent = this.formatTime(state.currentTime);
        const progress = state.duration > 0 ? (state.currentTime / state.duration) * 100 : 0;
        this.seekBar.value = progress.toFixed(1);
      }
    } else {
      this.timeCurrent.textContent = '0:00';
      this.timeDuration.textContent = '0:00';
      this.seekBar.value = '0';
    }
  }

  private formatTime(seconds: number): string {
    const s = Math.max(0, Math.floor(seconds));
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}
