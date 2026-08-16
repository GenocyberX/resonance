import { AudioEngine } from '../audio/AudioEngine';
import { MusicWorldMapper } from '../music-world/MusicWorldMapper';
import { WorldEngine, VisualTestTime } from '../world/WorldEngine';
import { AsciiRenderer } from '../ascii/AsciiRenderer';
import { AudioControls } from '../ui/AudioControls';
import { Hud } from '../ui/Hud';
import { DebugPanel } from '../ui/DebugPanel';
import { APP_CONFIG } from './config';
import { UiTelemetryData, RenderTelemetry } from '../ui/types';
import { RoadTestMode } from '../road/RoadGenerator';

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
  private lastVisualRenderTime: number = 0;
  private lastUiUpdateTime: number = 0;

  // Cadence timing constants
  private readonly VISUAL_RENDER_INTERVAL_MS: number = 1000 / 30; // 30 FPS DOM presentation target
  private readonly UI_UPDATE_INTERVAL_MS: number = 100;           // 10 Hz telemetry update rate

  // FPS tracking (Simulation vs Visual)
  private simFps: number = 60;
  private simFrameCount: number = 0;
  private simFpsAccumulator: number = 0;

  private visualFps: number = 30;
  private visualFrameCount: number = 0;
  private visualFpsAccumulator: number = 0;

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

    // 5. Check URL parameters for Visual Test & Stability Modes
    this.checkUrlVisualTestMode();

    // 6. Setup Keyboard Shortcuts for Visual Test Scenarios
    this.setupKeybindings();

    // 7. Setup Responsive Viewport Resize with debouncing
    this.setupResizeObserver();
  }

  private checkUrlVisualTestMode(): void {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const hasGallery = params.has('gallery') || params.get('sprites') === '1' || params.get('gallery') === 'sprites';
    if (hasGallery) {
      this.worldEngine.setGalleryMode(true);
      console.info('[Resonance] Sprite Gallery & LOD Inspection Mode active.');
      return;
    }

    const hasVisualTest = params.has('visualTest') || params.has('scene') || params.has('time') || params.has('golden') || params.has('stability');

    if (hasVisualTest) {
      const isGolden = params.get('golden') === 'tropical';
      const isStabilityStatic = params.get('stability') === 'static';
      const isStabilityDynamic = params.get('stability') === '1' || params.get('stability') === 'dynamic';
      const stability: 'dynamic' | 'static' | 'none' = isStabilityStatic ? 'static' : (isStabilityDynamic ? 'dynamic' : 'none');

      const sceneParam = (params.get('scene') || 'straight').toLowerCase();
      const timeParam = (params.get('time') || 'day').toLowerCase() as VisualTestTime;
      let scenario: RoadTestMode = 'FLAT_STRAIGHT';

      if (sceneParam.includes('curve_left') || sceneParam === 'left') {
        scenario = 'FLAT_CURVE_LEFT';
      } else if (sceneParam.includes('curve_right') || sceneParam === 'right') {
        scenario = 'FLAT_CURVE_RIGHT';
      } else if (sceneParam.includes('hill')) {
        scenario = 'HILL';
      } else if (sceneParam.includes('s_curve') || sceneParam === 's') {
        scenario = 'S_CURVE';
      }

      this.worldEngine.setVisualTestMode(
        true,
        scenario,
        ['day', 'sunset', 'night', 'dawn'].includes(timeParam) ? timeParam : 'day',
        isGolden,
        stability
      );
      console.info(`[Resonance] Visual Test Mode active. Scenario: ${scenario}, Time: ${timeParam}, Golden: ${isGolden}, Stability: ${stability}`);
    }
  }

  private setupKeybindings(): void {
    if (typeof window === 'undefined') return;

    const timePhases: VisualTestTime[] = ['day', 'sunset', 'night', 'dawn'];
    let timeIndex = 0;

    window.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key) {
        case 'g':
        case 'G':
          if (this.worldEngine.getGalleryMode()) {
            this.worldEngine.nextGallerySprite();
          } else {
            this.worldEngine.setGalleryMode(true);
            console.info('[Resonance] Entered Sprite Gallery Mode');
          }
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (this.worldEngine.getGalleryMode()) {
            this.worldEngine.nextGallerySprite();
          }
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (this.worldEngine.getGalleryMode()) {
            this.worldEngine.prevGallerySprite();
          }
          break;
        case '1':
          this.worldEngine.setGalleryMode(false);
          this.worldEngine.setVisualTestMode(true, 'FLAT_STRAIGHT');
          console.info('[Resonance Test] Scenario: FLAT_STRAIGHT');
          break;
        case '2':
          this.worldEngine.setGalleryMode(false);
          this.worldEngine.setVisualTestMode(true, 'FLAT_CURVE_LEFT');
          console.info('[Resonance Test] Scenario: FLAT_CURVE_LEFT');
          break;
        case '3':
          this.worldEngine.setGalleryMode(false);
          this.worldEngine.setVisualTestMode(true, 'FLAT_CURVE_RIGHT');
          console.info('[Resonance Test] Scenario: FLAT_CURVE_RIGHT');
          break;
        case '4':
          this.worldEngine.setGalleryMode(false);
          this.worldEngine.setVisualTestMode(true, 'HILL');
          console.info('[Resonance Test] Scenario: HILL');
          break;
        case '5':
          this.worldEngine.setGalleryMode(false);
          this.worldEngine.setVisualTestMode(true, 'S_CURVE');
          console.info('[Resonance Test] Scenario: S_CURVE');
          break;
        case 't':
        case 'T':
          timeIndex = (timeIndex + 1) % timePhases.length;
          this.worldEngine.setVisualTestTime(timePhases[timeIndex]);
          console.info(`[Resonance Test] Time of Day: ${timePhases[timeIndex]}`);
          break;
        case '0':
        case 'Escape':
          this.worldEngine.setGalleryMode(false);
          this.worldEngine.setVisualTestMode(false);
          console.info('[Resonance] Returned to Normal Procedural Mode');
          break;
      }
    });
  }

  private setupResizeObserver(): void {
    const container = document.getElementById('viewport-container');
    if (container) {
      let resizeTimeout: number | null = null;
      const resizeObserver = new ResizeObserver(() => {
        if (resizeTimeout !== null) {
          window.clearTimeout(resizeTimeout);
        }
        resizeTimeout = window.setTimeout(() => {
          this.renderer.resizeToContainer();
          resizeTimeout = null;
        }, 50);
      });
      resizeObserver.observe(container);
    }
  }

  public start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.lastFrameTime = performance.now();
    this.lastVisualRenderTime = this.lastFrameTime;
    this.lastUiUpdateTime = this.lastFrameTime;
    this.renderer.resizeToContainer();

    requestAnimationFrame(this.gameLoop.bind(this));
  }

  private gameLoop(timestamp: number): void {
    if (!this.isRunning) return;

    // Simulation Delta Time calculation
    const dt = Math.min(0.1, (timestamp - this.lastFrameTime) / 1000);
    this.lastFrameTime = timestamp;

    // Measure Simulation FPS
    this.simFrameCount++;
    this.simFpsAccumulator += dt;
    if (this.simFpsAccumulator >= 0.5) {
      this.simFps = this.simFrameCount / this.simFpsAccumulator;
      this.simFrameCount = 0;
      this.simFpsAccumulator = 0;
    }

    // 1. Audio Analysis & Music State update (high frequency)
    const musicState = this.audioEngine.update(dt);

    // 2. Map Music State to World Parameters
    const worldParams = this.musicMapper.map(musicState);

    // 3. Update Procedural World Simulation (continuous simulation dt)
    const fb = this.renderer.getFrameBuffer();
    this.worldEngine.update(dt, worldParams, fb.width, fb.height);

    // 4. Decoupled Visual ASCII DOM Presentation (Target ~30 FPS for flicker-free stability)
    const elapsedSinceRender = timestamp - this.lastVisualRenderTime;
    if (elapsedSinceRender >= this.VISUAL_RENDER_INTERVAL_MS) {
      const renderDt = elapsedSinceRender / 1000;
      this.lastVisualRenderTime = timestamp;

      this.visualFrameCount++;
      this.visualFpsAccumulator += renderDt;
      if (this.visualFpsAccumulator >= 0.5) {
        this.visualFps = this.visualFrameCount / this.visualFpsAccumulator;
        this.visualFrameCount = 0;
        this.visualFpsAccumulator = 0;
      }

      this.worldEngine.render(fb);
      this.renderer.render();
    }

    // 5. Throttled UI & Telemetry update (10 Hz)
    if (timestamp - this.lastUiUpdateTime >= this.UI_UPDATE_INTERVAL_MS) {
      this.lastUiUpdateTime = timestamp;

      const rStats = this.renderer.getStats();
      const renderTelemetry: RenderTelemetry = {
        simFps: this.simFps,
        visualFps: this.visualFps,
        domRenderMs: rStats.domRenderTimeMs,
        rowsUpdated: rStats.rowsUpdated,
        rowsTotal: rStats.rowsTotal,
        spanCount: rStats.spanCount,
        resizeCount: rStats.resizeCount,
        frameHash: `0x${this.worldEngine.getLastFrameHash().toString(16).toUpperCase().padStart(8, '0')}`,
      };

      const telemetry: UiTelemetryData = {
        fps: this.simFps,
        worldState: this.worldEngine.getState(),
        musicState,
        totalCollisions: this.worldEngine.getCollisionSystem().getTotalCollisions(),
        activeTrafficCount: this.worldEngine.getState().traffic.length,
        seed: APP_CONFIG.defaultSeed,
        visualTestMode: this.worldEngine.getVisualTestMode(),
        containment: this.worldEngine.getContainmentTelemetry(),
        renderStats: renderTelemetry,
      };

      this.hud.update(telemetry);
      this.audioControls.update();
      this.debugPanel.update(telemetry);
    }

    requestAnimationFrame(this.gameLoop.bind(this));
  }
}
