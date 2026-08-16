import { AudioEngine } from '../audio/AudioEngine';
import { MusicWorldMapper } from '../music-world/MusicWorldMapper';
import { WorldEngine } from '../world/WorldEngine';
import { AsciiRenderer } from '../ascii/AsciiRenderer';
import { AudioControls } from '../ui/AudioControls';
import { Hud } from '../ui/Hud';
import { DebugPanel } from '../ui/DebugPanel';
import { APP_CONFIG } from './config';
import { UiTelemetryData } from '../ui/types';

export class ResonanceApp {
  private audioEngine: AudioEngine;
  private musicMapper: MusicWorldMapper;
  private worldEngine: WorldEngine;
  private renderer: AsciiRenderer;
  private audioControls: AudioControls;
  private hud: Hud;
  private debugPanel: DebugPanel;

  private isRunning: boolean = false;
  private lastFrameTime: number = 0;
  private fps: number = 60;
  private frameCount: number = 0;
  private fpsAccumulator: number = 0;

  constructor() {
    // 1. Initialize Audio subsystem
    this.audioEngine = new AudioEngine();
    this.musicMapper = new MusicWorldMapper();

    // 2. Initialize World Simulation
    this.worldEngine = new WorldEngine(APP_CONFIG.defaultSeed);

    // 3. Initialize ASCII Renderer
    const screenElement = document.getElementById('ascii-screen') as HTMLElement;
    this.renderer = new AsciiRenderer(
      screenElement,
      APP_CONFIG.defaultGrid.cols,
      APP_CONFIG.defaultGrid.rows
    );

    // 4. Initialize UI Subsystems
    this.audioControls = new AudioControls(this.audioEngine, {
      onSourceLoaded: () => {
        // Source loaded callback
      },
    });
    this.hud = new Hud();
    this.debugPanel = new DebugPanel();

    // 5. Setup Responsive Viewport Resize
    this.setupResizeObserver();
  }

  private setupResizeObserver(): void {
    const container = document.getElementById('viewport-container');
    if (container) {
      const resizeObserver = new ResizeObserver(() => {
        this.renderer.resizeToContainer();
      });
      resizeObserver.observe(container);
    }
  }

  public start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.lastFrameTime = performance.now();
    this.renderer.resizeToContainer();

    requestAnimationFrame(this.gameLoop.bind(this));
  }

  private gameLoop(timestamp: number): void {
    if (!this.isRunning) return;

    // Calculate delta time in seconds
    const dt = Math.min(0.1, (timestamp - this.lastFrameTime) / 1000);
    this.lastFrameTime = timestamp;

    // Measure FPS
    this.frameCount++;
    this.fpsAccumulator += dt;
    if (this.fpsAccumulator >= 0.5) {
      this.fps = (this.frameCount / this.fpsAccumulator);
      this.frameCount = 0;
      this.fpsAccumulator = 0;
    }

    // 1. Audio Analysis & Music State update
    const musicState = this.audioEngine.update(dt);

    // 2. Map Music State to World Parameters
    const worldParams = this.musicMapper.map(musicState);

    // 3. Update Procedural World Simulation
    const fb = this.renderer.getFrameBuffer();
    this.worldEngine.update(dt, worldParams, fb.width, fb.height);

    // 4. Render ASCII Frame
    this.worldEngine.render(fb);
    this.renderer.render();

    // 5. Update UI & Telemetry
    const telemetry: UiTelemetryData = {
      fps: this.fps,
      worldState: this.worldEngine.getState(),
      musicState,
      totalCollisions: this.worldEngine.getCollisionSystem().getTotalCollisions(),
      activeTrafficCount: this.worldEngine.getState().traffic.length,
      seed: APP_CONFIG.defaultSeed,
    };

    this.hud.update(telemetry);
    this.audioControls.update();
    this.debugPanel.update(telemetry);

    requestAnimationFrame(this.gameLoop.bind(this));
  }
}
