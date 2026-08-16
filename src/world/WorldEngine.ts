import { FrameBuffer } from '../ascii/FrameBuffer';
import { DepthSorter } from '../ascii/DepthSorter';
import { ColorPalette } from '../ascii/ColorPalette';
import { RoadGenerator, RoadTestMode } from '../road/RoadGenerator';
import { Perspective } from '../road/Perspective';
import { AutonomousDriver } from '../driving/AutonomousDriver';
import { TrafficController } from '../driving/TrafficController';
import { CollisionSystem } from '../driving/CollisionSystem';
import { BiomeTransitionSystem } from './transitions/BiomeTransitionSystem';
import { DayNightCycle } from './transitions/DayNightCycle';
import { SkyDirector } from './sky/SkyDirector';
import { DayPhase, SpecialSkyEvent, WeatherType } from './sky/SkyTypes';
import { WorldDirector } from './WorldDirector';
import { WorldState } from './WorldState';
import { AmbientParticle, WorldMusicParameters } from './types';
import { SeededRandom } from '../procedural/SeededRandom';
import { PlayerContainmentTelemetry } from '../ui/types';
import { LODLevel, SpriteDefinition } from '../ascii/types';
import { SpriteLibrary } from '../ascii/SpriteLibrary';

export type VisualTestTime =
  | 'day'
  | 'sunset'
  | 'night'
  | 'dawn'
  | 'sunrise'
  | 'morning'
  | 'midday'
  | 'afternoon'
  | 'golden_hour'
  | 'golden'
  | 'dusk'
  | 'deep_night'
  | 'pre_dawn';

// Chase Camera & Lateral Presentation Constants
export const PLAYER_CAMERA_LATERAL_FOLLOW = 0.85;
export const PLAYER_SCREEN_LATERAL_RESIDUAL = 0.15;
export const CAMERA_SMOOTH_RATE = 8.5;

export class WorldEngine {
  private state: WorldState;
  private road: RoadGenerator;
  private driver: AutonomousDriver;
  private traffic: TrafficController;
  private collisions: CollisionSystem;
  private biomeSystem: BiomeTransitionSystem;
  private dayNightCycle: DayNightCycle;
  private skyDirector: SkyDirector;
  private director: WorldDirector;
  private depthSorter: DepthSorter;
  private rng: SeededRandom;

  private ambientParticles: AmbientParticle[] = [];

  // Visual Test Mode & Resonance Art Lab state
  private isVisualTest: boolean = false;
  private isGoldenMode: boolean = false;
  private isGalleryMode: boolean = false;
  private gallerySubMode: 'sprites' | 'contrast' | 'approach' = 'sprites';
  private isMonochromeGallery: boolean = false;
  private galleryIndex: number = 0;
  private approachZ: number = 1000;
  private approachSpeed: number = 260;
  private stabilityMode: 'dynamic' | 'static' | 'none' = 'none';
  private testScenario: RoadTestMode = 'NORMAL';
  private testTimeOfDay: VisualTestTime = 'day';
  private lastFrameHash: number = 0;

  // Cached scanline geometry for player anchoring, debug telemetry and projected terrain boundaries
  private scanlineCenter: Float32Array = new Float32Array(100);
  private scanlineHalfWidth: Float32Array = new Float32Array(100);
  private scanlineShoreline: Float32Array = new Float32Array(100);
  private scanlineDepth: Float32Array = new Float32Array(100);

  // Telemetry state
  private lastTargetCamX: number = 0;
  private lastPlayerScreenX: number = 0;
  private lastRoadCenterAtPlayerRow: number = 0;
  private lastRoadHalfWidthAtPlayerRow: number = 0;
  private lastIsVisualClamped: boolean = false;
  private lastIsWorldClamped: boolean = false;
  private lastMaxDriveableOffset: number = 270;

  constructor(seed: number = 2026) {
    this.rng = new SeededRandom(seed);
    this.state = new WorldState();
    this.road = new RoadGenerator(seed);
    this.driver = new AutonomousDriver();
    this.traffic = new TrafficController(this.rng);
    this.collisions = new CollisionSystem();
    this.biomeSystem = new BiomeTransitionSystem();
    this.dayNightCycle = new DayNightCycle();
    this.skyDirector = new SkyDirector(seed);
    this.director = new WorldDirector(seed, this.biomeSystem);
    this.depthSorter = new DepthSorter();

    // Calibrate camera initial model
    this.state.camera.distanceToPlane = 0.44;
    this.state.dayNight = this.dayNightCycle.update(0);
    this.state.biomeBlend = this.biomeSystem.evaluate(0);
    this.state.sky = this.skyDirector.update(0, this.state.biomeBlend.currentBiome.id, this.state.musicParams, 120, 40);
    this.state.weather = this.skyDirector.getWeatherManager().toWeatherState();
  }

  public setVisualTestMode(
    enabled: boolean,
    scenario: RoadTestMode = 'FLAT_STRAIGHT',
    time: VisualTestTime = 'day',
    golden: boolean = false,
    stability: 'dynamic' | 'static' | 'none' = 'none',
    weather?: WeatherType,
    event: SpecialSkyEvent = 'NONE'
  ): void {
    this.isVisualTest = enabled;
    this.isGoldenMode = golden;
    this.stabilityMode = stability;
    this.testScenario = scenario;
    this.testTimeOfDay = time;
    this.road.setTestMode(scenario);

    if (enabled) {
      this.state.cameraShake = 0;
      this.setVisualTestTime(time, weather, event);
      this.traffic.maxTrafficCount = (golden || stability !== 'none') ? 1 : 2;
      if (golden || stability !== 'none') {
        this.director.reset(2026);
      }
    } else {
      this.road.setTestMode('NORMAL');
      this.traffic.maxTrafficCount = 4;
      this.skyDirector.setVisualTestOverride(false);
    }
  }

  public setVisualTestTime(time: VisualTestTime, weather?: WeatherType, event: SpecialSkyEvent = 'NONE'): void {
    this.testTimeOfDay = time;
    const timeLower = (time || 'day').toLowerCase();
    let normTime = 0.50;
    let phase: DayPhase = 'MIDDAY';

    if (timeLower.includes('deep_night')) { normTime = 0.04; phase = 'DEEP_NIGHT'; }
    else if (timeLower.includes('pre_dawn')) { normTime = 0.11; phase = 'PRE_DAWN'; }
    else if (timeLower.includes('dawn')) { normTime = 0.18; phase = 'DAWN'; }
    else if (timeLower.includes('sunrise')) { normTime = 0.26; phase = 'SUNRISE'; }
    else if (timeLower.includes('morning')) { normTime = 0.36; phase = 'MORNING'; }
    else if (timeLower.includes('midday') || timeLower === 'day') { normTime = 0.50; phase = 'MIDDAY'; }
    else if (timeLower.includes('afternoon')) { normTime = 0.63; phase = 'AFTERNOON'; }
    else if (timeLower.includes('golden') || timeLower === 'golden_hour') { normTime = 0.72; phase = 'GOLDEN_HOUR'; }
    else if (timeLower.includes('sunset')) { normTime = 0.80; phase = 'SUNSET'; }
    else if (timeLower.includes('dusk')) { normTime = 0.88; phase = 'DUSK'; }
    else if (timeLower.includes('night')) { normTime = 0.96; phase = 'NIGHT'; }

    this.dayNightCycle.setNormalizedTime(normTime);
    this.state.dayNight = this.dayNightCycle.calculateState(normTime);

    this.skyDirector.setVisualTestOverride(true, phase, weather || null, event);
    this.state.sky = this.skyDirector.update(0, this.state.biomeBlend.currentBiome.id, this.state.musicParams, 120, 40);
    this.state.weather = this.skyDirector.getWeatherManager().toWeatherState();
  }

  public getVisualTestMode(): {
    isVisualTest: boolean;
    scenario: RoadTestMode;
    time: VisualTestTime;
    isGolden: boolean;
    stability: 'dynamic' | 'static' | 'none';
    isGallery: boolean;
    gallerySubMode: 'sprites' | 'contrast' | 'approach';
    isMonochrome: boolean;
  } {
    return {
      isVisualTest: this.isVisualTest,
      scenario: this.testScenario,
      time: this.testTimeOfDay,
      isGolden: this.isGoldenMode,
      stability: this.stabilityMode,
      isGallery: this.isGalleryMode,
      gallerySubMode: this.gallerySubMode,
      isMonochrome: this.isMonochromeGallery,
    };
  }

  public setGalleryMode(
    enabled: boolean,
    index: number = 0,
    subMode: 'sprites' | 'contrast' | 'approach' = 'sprites',
    monochrome: boolean = false
  ): void {
    this.isGalleryMode = enabled;
    this.galleryIndex = Math.max(0, index);
    this.gallerySubMode = subMode;
    this.isMonochromeGallery = monochrome;
    if (subMode === 'approach') {
      this.approachZ = 1100;
    }
  }

  public getGalleryMode(): boolean {
    return this.isGalleryMode;
  }

  public setGallerySubMode(mode: 'sprites' | 'contrast' | 'approach'): void {
    this.gallerySubMode = mode;
    if (mode === 'approach') {
      this.approachZ = 1100;
    }
  }

  public getGallerySubMode(): 'sprites' | 'contrast' | 'approach' {
    return this.gallerySubMode;
  }

  public toggleMonochrome(): void {
    this.isMonochromeGallery = !this.isMonochromeGallery;
  }

  public setMonochrome(enabled: boolean): void {
    this.isMonochromeGallery = enabled;
  }

  public getMonochrome(): boolean {
    return this.isMonochromeGallery;
  }

  public nextGallerySprite(): void {
    this.galleryIndex++;
  }

  public prevGallerySprite(): void {
    this.galleryIndex = Math.max(0, this.galleryIndex - 1);
  }

  public getLastFrameHash(): number {
    return this.lastFrameHash;
  }

  public getScanlineDataAt(y: number): { center: number; halfWidth: number; depth: number } {
    const iy = Math.max(0, Math.min(this.scanlineCenter.length - 1, Math.round(y)));
    return {
      center: this.scanlineCenter[iy],
      halfWidth: this.scanlineHalfWidth[iy],
      depth: this.scanlineDepth[iy],
    };
  }

  public getContainmentTelemetry(): PlayerContainmentTelemetry {
    return {
      maxDriveableOffset: this.lastMaxDriveableOffset,
      cameraTargetX: this.lastTargetCamX,
      playerScreenX: this.lastPlayerScreenX,
      roadCenterAtPlayerY: this.lastRoadCenterAtPlayerRow,
      roadHalfWidthAtPlayerY: this.lastRoadHalfWidthAtPlayerRow,
      roadLeftAtPlayerY: this.lastRoadCenterAtPlayerRow - this.lastRoadHalfWidthAtPlayerRow,
      roadRightAtPlayerY: this.lastRoadCenterAtPlayerRow + this.lastRoadHalfWidthAtPlayerRow,
      isVisualClamped: this.lastIsVisualClamped,
      isWorldClamped: this.lastIsWorldClamped,
    };
  }

  public getSkyDirector(): SkyDirector {
    return this.skyDirector;
  }

  public getState(): WorldState {
    return this.state;
  }

  public getRoad(): RoadGenerator {
    return this.road;
  }

  public getDirector(): WorldDirector {
    return this.director;
  }

  public getCollisionSystem(): CollisionSystem {
    return this.collisions;
  }

  public setTimeOfDayNormalized(t: number): void {
    this.dayNightCycle.setNormalizedTime(t);
  }

  /**
   * Main simulation tick with strict physical road containment and smooth chase camera tracking.
   */
  public update(dt: number, musicParams: WorldMusicParameters, viewportWidth: number = 120, viewportHeight: number = 42): void {
    if (this.isGalleryMode) {
      if (this.gallerySubMode === 'approach') {
        this.approachZ -= this.approachSpeed * dt;
        if (this.approachZ < 65) {
          this.approachZ = 1200;
        }
      }
      return;
    }

    if (this.stabilityMode === 'static') {
      // In Static Stability Mode, simulation time and player position are 100% frozen
      this.state.player.speed = 0;
      this.state.player.lateralOffset = 0;
      this.state.camera.x = 0;
      this.state.camera.z = -145;
      this.state.camera.y = 310;
      this.state.cameraShake = 0;
      this.state.weather = { type: 'CLEAR', intensity: 0, particles: [] };
      return;
    }

    this.state.worldTime += dt;

    if (this.isVisualTest) {
      this.state.musicParams = {
        targetSpeedBonus: 0,
        cameraBounce: 0,
        fovPulse: 0,
        tension: 0,
        particleDensity: 0,
        environmentalGlow: 0,
      };
      this.state.biomeBlend = this.biomeSystem.evaluate(0);
    } else {
      this.state.musicParams = musicParams;
      this.state.dayNight = this.dayNightCycle.update(dt);
      this.state.biomeBlend = this.biomeSystem.evaluate(this.state.player.z);
    }

    // Sky & Weather update via authoritative SkyDirector
    this.state.sky = this.skyDirector.update(
      dt,
      this.state.biomeBlend.currentBiome.id,
      this.state.musicParams,
      viewportWidth,
      viewportHeight
    );
    this.state.weather = this.skyDirector.getWeatherManager().toWeatherState();
    this.road.setTension(this.state.musicParams.tension);

    // 1. Autonomous driving decision using canonical geometry
    const allEntities = [...this.traffic.getVehicles(), ...this.director.getScenery()];
    this.driver.update(dt, this.state.player, allEntities, this.road, this.state.musicParams.targetSpeedBonus);

    // 2. Update player vehicle position with physical road clamping
    const maxDriveableOffset = this.road.getDriveableHalfWidth(this.state.player.boundingBox.width, 20);
    const playerRoadCurve = this.road.getCurveAt(this.state.player.z);
    this.state.player.update(dt, playerRoadCurve, maxDriveableOffset);
    this.state.distance = this.state.player.z;

    // 3. Collision detection & physical contact lifecycle with boundary preservation
    const collisionEvents = this.collisions.checkCollisions(this.state.player, allEntities, maxDriveableOffset);
    for (const evt of collisionEvents) {
      this.state.cameraShake = Math.max(this.state.cameraShake, evt.cameraShakeAmount);
    }

    // 4. Physical road containment normalization (guarantees player is strictly on driveable road)
    const normResult = this.road.normalizePlayerToRoad(this.state.player);
    this.lastIsWorldClamped = normResult.isWorldClamped;
    this.lastMaxDriveableOffset = normResult.maxDriveableOffset;

    // 5. Chase Camera Follow Model (aims at the player's road heading trajectory)
    const camZ = this.state.player.z - 145;
    const curveAtPlayerZ = this.road.getCurveAt(this.state.player.z);
    const curveAtCamZ = this.road.getCurveAt(camZ);

    // Target Camera X blends the vehicle's heading with trailing position + lateral lane follow
    const targetCamX = (curveAtPlayerZ * 0.75 + curveAtCamZ * 0.25) + this.state.player.lateralOffset * PLAYER_CAMERA_LATERAL_FOLLOW;
    this.lastTargetCamX = targetCamX;

    const camElevation = this.road.getElevationAt(camZ);

    // Damped harmonic oscillation for smooth camera shake instead of random white noise
    const shakeOffset = this.isVisualTest || this.state.cameraShake <= 0.001
      ? 0
      : Math.sin(this.state.worldTime * 45) * this.state.cameraShake * 12;

    // Framerate-independent exponential smoothing for camera lateral position
    const alpha = 1.0 - Math.exp(-CAMERA_SMOOTH_RATE * dt);
    this.state.camera.x += (targetCamX - this.state.camera.x) * alpha;
    this.state.camera.z = camZ;
    this.state.camera.y = 310 + camElevation + this.state.musicParams.cameraBounce + shakeOffset;
    this.state.camera.distanceToPlane = 0.44;
    this.state.camera.fovPulse = this.isVisualTest ? 0 : this.state.musicParams.fovPulse;

    // Camera shake decay
    if (this.state.cameraShake > 0) {
      this.state.cameraShake = Math.max(0, this.state.cameraShake - dt * 2.5);
    }

    // 6. Update traffic and scenery
    this.traffic.update(dt, this.state.player, this.road);
    this.director.update(this.state.camera.z, this.road, 1200);

    // 7. Update ambient particles
    if (!this.isVisualTest) {
      this.updateAmbientParticles(dt, this.state.musicParams);
    }
  }

  private updateAmbientParticles(dt: number, musicParams: WorldMusicParameters): void {
    if (musicParams.particleDensity > 0.15 && this.rng.boolean(musicParams.particleDensity * 0.8)) {
      const isLeft = this.rng.boolean();
      const offset = isLeft ? -this.rng.range(480, 850) : this.rng.range(480, 850);
      const spawnZ = this.state.player.z + this.rng.range(80, 600);
      this.ambientParticles.push({
        x: this.road.getCurveAt(spawnZ) + offset,
        y: this.road.getElevationAt(spawnZ) + this.rng.range(10, 180),
        z: spawnZ,
        char: this.rng.choice(['*', '•', '·', '¤', '+']),
        color: this.rng.choice(['#38bdf8', '#f43f5e', '#ec4899', '#fbbf24', '#34d399']),
        vx: (this.rng.next() - 0.5) * 40,
        vy: this.rng.range(20, 70),
        vz: -this.state.player.speed * 0.25,
        life: this.rng.range(0.8, 1.8),
        maxLife: 1.8,
      });
    }

    for (let i = this.ambientParticles.length - 1; i >= 0; i--) {
      const p = this.ambientParticles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.z += p.vz * dt;
      p.life -= dt;
      if (p.life <= 0 || p.z < this.state.camera.z) {
        this.ambientParticles.splice(i, 1);
      }
    }
  }

  /**
   * Renders the complete procedural ASCII scene into the FrameBuffer.
   */
  public render(frameBuffer: FrameBuffer): void {
    if (this.isGalleryMode) {
      this.renderSpriteGallery(frameBuffer, frameBuffer.width, frameBuffer.height);
      this.lastFrameHash = frameBuffer.getFrameHash();
      return;
    }

    frameBuffer.clear(' ', '#10141e', '#030712');

    const width = frameBuffer.width;
    const height = frameBuffer.height;
    const horizonRow = Math.floor(height * 0.40);

    const palette = this.state.biomeBlend.blendedPalette;
    const dayNight = this.state.dayNight;

    // 1. SKY & CELESTIAL RENDERING (Multi-Band Gradient, Aurora, Stars, Sun/Moon, Clouds, Lightning, Fog, Weather)
    this.skyDirector.render(frameBuffer, width, horizonRow, height, this.state.sky);

    // 2. WORLD-SPACE PARALLAX HORIZON SILHOUETTES
    this.renderHorizonSilhouettes(frameBuffer, width, horizonRow, palette, dayNight);

    // 3. CONTINUOUS PSEUDO-3D ROAD & WORLD-SPACE PROJECTED SHORELINE
    this.renderRoadAndTerrain(frameBuffer, width, height, horizonRow, palette, dayNight);

    // 4. DEPTH-SORTED SCENERY & TRAFFIC RENDERING
    this.depthSorter.clear();

    // Add scenery objects
    for (const obj of this.director.getScenery()) {
      const relZ = obj.z - this.state.camera.z;
      if (relZ > 10 && relZ < 1150) {
        const proj = Perspective.project(obj.x, this.road.getElevationAt(obj.z), obj.z, this.state.camera, width, height, 0.40);
        if (proj.visible) {
          let sceneryColor = obj.colorOverride || obj.sprite.defaultColor;
          if (dayNight.phase === 'NIGHT' || dayNight.phase === 'DUSK') {
            sceneryColor = ColorPalette.scaleBrightness(sceneryColor, Math.max(0.4, dayNight.ambientLight));
          }
          this.depthSorter.add({
            screenX: proj.screenX,
            screenY: proj.screenY,
            z: relZ,
            sprite: obj.sprite,
            colorOverride: sceneryColor,
          });
        }
      }
    }

    // Add traffic vehicles
    for (const vehicle of this.traffic.getVehicles()) {
      const relZ = vehicle.z - this.state.camera.z;
      if (relZ > 10 && relZ < 1150) {
        const proj = Perspective.project(vehicle.x, this.road.getElevationAt(vehicle.z), vehicle.z, this.state.camera, width, height, 0.40);
        if (proj.visible) {
          let vehicleColor = vehicle.colorOverride || vehicle.sprite.defaultColor;
          if (dayNight.phase === 'NIGHT') {
            vehicleColor = ColorPalette.scaleBrightness(vehicleColor, 0.75);
          }
          this.depthSorter.add({
            screenX: proj.screenX,
            screenY: proj.screenY,
            z: relZ,
            sprite: vehicle.sprite,
            colorOverride: vehicleColor,
          });
        }
      }
    }

    // Render sorted scenery & traffic
    this.depthSorter.render(frameBuffer);

    // 5. PROTAGONIST PLAYER VEHICLE (ARCADE SCREEN-SPACE ANCHOR WITH HARD CONTAINMENT CLAMP)
    this.renderPlayerVehicle(frameBuffer, width, height, horizonRow);

    // 6. AMBIENT PARTICLES
    for (const p of this.ambientParticles) {
      const proj = Perspective.project(p.x, p.y, p.z, this.state.camera, width, height, 0.40);
      if (proj.visible) {
        frameBuffer.setCell(proj.screenX, proj.screenY, p.char, p.color, proj.depth, undefined, true);
      }
    }

    // 7. FRAME HASH (for deterministic stability validation)
    this.lastFrameHash = frameBuffer.getFrameHash();
  }

  /**
   * World-Space Horizon Silhouettes & Landmarks (Islands, Headlands, Canyon Mesas, and Pine Ridges).
   */
  private renderHorizonSilhouettes(
    fb: FrameBuffer,
    width: number,
    horizonRow: number,
    palette: typeof this.state.biomeBlend.blendedPalette,
    dayNight: typeof this.state.dayNight
  ): void {
    const biomeId = this.state.biomeBlend.currentBiome.id;
    const isTropical = biomeId === 'TROPICAL';
    const isDesert = biomeId === 'DESERT';
    const isForest = biomeId === 'FOREST';

    const mountainColor = ColorPalette.scaleBrightness(
      palette.mountains,
      Math.max(0.4, dayNight.ambientLight)
    );
    const groundSilhouetteColor = ColorPalette.scaleBrightness(
      palette.ground,
      Math.max(0.45, dayNight.ambientLight)
    );

    if (isTropical) {
      // World-space anchored landmark island profiles with proper camera parallax
      const landmarks = [
        { worldX: -900, baseWidth: 35, maxHeight: 6, charPeak: '^', charSlope: '/' },
        { worldX: 1800, baseWidth: 50, maxHeight: 8, charPeak: '^', charSlope: '\\' },
        { worldX: 3200, baseWidth: 40, maxHeight: 5, charPeak: '^', charSlope: '/' },
      ];

      for (const lm of landmarks) {
        const screenCenterX = Math.round((width * 0.5) + (lm.worldX - this.state.camera.x) * 0.014);
        const halfSpan = Math.round(lm.baseWidth * 0.5);

        for (let dx = -halfSpan; dx <= halfSpan; dx++) {
          const sx = screenCenterX + dx;
          if (sx < 0 || sx >= width) continue;

          const t = 1.0 - Math.abs(dx) / halfSpan;
          const h = Math.max(0, Math.floor(Math.sin(t * Math.PI * 0.5) * lm.maxHeight));

          for (let dy = 0; dy < h; dy++) {
            const sy = horizonRow - 1 - dy;
            if (sy >= 0 && sy < horizonRow) {
              const char = dy === h - 1 ? lm.charPeak : '░';
              fb.setCell(sx, sy, char, mountainColor, 9200, undefined, false);
            }
          }
        }
      }

      // Distant headland on the coast (Parallax 0.022)
      const headlandScreenX = Math.round((width * 0.5) + (1100 - this.state.camera.x) * 0.022);
      for (let dx = -20; dx <= 20; dx++) {
        const sx = headlandScreenX + dx;
        if (sx >= 0 && sx < width) {
          const t = 1.0 - Math.abs(dx) / 20;
          const h = Math.max(0, Math.floor(t * 3));
          for (let dy = 0; dy < h; dy++) {
            const sy = horizonRow - 1 - dy;
            if (sy >= 0 && sy < horizonRow) {
              fb.setCell(sx, sy, '█', groundSilhouetteColor, 9000, undefined, false);
            }
          }
        }
      }
    } else if (isDesert) {
      // Flat-topped Red Rock Canyon Mesas and Buttes
      const mesas = [
        { worldX: -1200, width: 45, height: 7 },
        { worldX: 200, width: 35, height: 5 },
        { worldX: 1600, width: 55, height: 9 },
      ];

      for (const mesa of mesas) {
        const screenCenterX = Math.round((width * 0.5) + (mesa.worldX - this.state.camera.x) * 0.016);
        const halfSpan = Math.round(mesa.width * 0.5);

        for (let dx = -halfSpan; dx <= halfSpan; dx++) {
          const sx = screenCenterX + dx;
          if (sx < 0 || sx >= width) continue;

          const isSteep = Math.abs(dx) > halfSpan - 3;
          const h = isSteep ? Math.floor(mesa.height * 0.5) : mesa.height;

          for (let dy = 0; dy < h; dy++) {
            const sy = horizonRow - 1 - dy;
            if (sy >= 0 && sy < horizonRow) {
              const char = dy === h - 1 ? (isSteep ? '/' : '‾') : '█';
              fb.setCell(sx, sy, char, mountainColor, 9100, undefined, false);
            }
          }
        }
      }
    } else if (isForest) {
      // Layered Jagged Pine Mountain Ridges with Misty Atmosphere
      const camXOffset = (this.state.camera.x * 0.014) % width;
      for (let x = 0; x < width; x++) {
        const worldCol = (x + camXOffset + width * 10) % width;
        const p1 = Math.sin(worldCol * 0.08) * 4.0;
        const p2 = Math.sin(worldCol * 0.22) * 2.5;
        const h1 = Math.max(2, Math.floor(p1 + p2 + 5));

        for (let dy = 0; dy < h1; dy++) {
          const my = horizonRow - 1 - dy;
          if (my >= 0 && my < horizonRow) {
            const char = dy === h1 - 1 ? '▲' : '░';
            fb.setCell(x, my, char, mountainColor, 9000, undefined, false);
          }
        }
      }
    } else {
      // Generic Biome Horizon Fallback
      const camXOffset = (this.state.camera.x * 0.012) % width;
      for (let x = 0; x < width; x++) {
        const worldCol = (x + camXOffset + width * 10) % width;
        const p1 = Math.sin(worldCol * 0.06) * 4.5;
        const p2 = Math.sin(worldCol * 0.18) * 2.2;
        const h1 = Math.max(1, Math.floor(p1 + p2 + 5));

        for (let dy = 0; dy < h1; dy++) {
          const my = horizonRow - 1 - dy;
          if (my >= 0 && my < horizonRow) {
            const char = dy === h1 - 1 ? '^' : '░';
            fb.setCell(x, my, char, mountainColor, 9000, undefined, false);
          }
        }
      }
    }
  }

  /**
   * Continuous Road Rasterizer & World-Space Projected Terrain Bands (Inland, Beach, Shoreline, Ocean).
   */
  private renderRoadAndTerrain(
    fb: FrameBuffer,
    width: number,
    height: number,
    horizonRow: number,
    palette: typeof this.state.biomeBlend.blendedPalette,
    dayNight: typeof this.state.dayNight
  ): void {
    if (this.scanlineCenter.length < height) {
      this.scanlineCenter = new Float32Array(height);
      this.scanlineHalfWidth = new Float32Array(height);
      this.scanlineShoreline = new Float32Array(height);
      this.scanlineDepth = new Float32Array(height);
    }

    const biomeId = this.state.biomeBlend.currentBiome.id;
    const isTropical = biomeId === 'TROPICAL';
    const isDesert = biomeId === 'DESERT';
    const isForest = biomeId === 'FOREST';

    const halfRoadWidth = this.road.defaultRoadWidth * 0.5; // 400
    const isNight = dayNight.phase === 'NIGHT';
    const isDusk = dayNight.phase === 'DUSK';
    const playerZ = this.state.player.z;
    const beatPulse = this.state.musicParams.fovPulse > 0.1;
    const time = this.state.worldTime;
    const energy = this.state.musicParams.environmentalGlow;

    // Palette tokens for World-Space Terrain
    const oceanBg = isNight ? '#051026' : (isDusk ? '#3b0764' : '#0369a1');
    const oceanRippleColor = isNight ? '#1e3a8a' : (isDusk ? '#fb7185' : '#38bdf8');
    const sandBg = isNight ? '#1c1917' : (isDusk ? '#78350f' : '#d97706');
    const sandDetailColor = '#fde68a';
    const inlandBg = isNight ? '#022c22' : (isDusk ? '#14532d' : '#064e3b');
    const inlandGrassColor = '#34d399';

    const drawDistance = 1050;
    const stepZ = this.road.segmentLength;
    const startZ = Math.floor((this.state.camera.z + 10) / stepZ) * stepZ;
    const endZ = startZ + drawDistance;

    interface ProjectedSlice {
      screenX: number;
      screenY: number;
      halfWidth: number;
      shorelineScreenX: number;
      depth: number;
      worldZ: number;
    }

    const slices: ProjectedSlice[] = [];

    for (let z = startZ; z <= endZ; z += stepZ) {
      const curveX = this.road.getCurveAt(z);
      const elevY = this.road.getElevationAt(z);

      // Project Road Slice
      const roadProj = Perspective.projectRoadSlice(
        curveX,
        elevY,
        z,
        halfRoadWidth,
        this.state.camera,
        width,
        height,
        0.40
      );

      // Project World-Space Shoreline Point
      const shorelineWorldOffset = this.director.getShorelineOffsetAtZ(z, halfRoadWidth);
      const shorelineProj = Perspective.project(
        curveX + shorelineWorldOffset,
        elevY,
        z,
        this.state.camera,
        width,
        height,
        0.40
      );

      if (roadProj.visible) {
        slices.push({
          screenX: roadProj.screenX,
          screenY: roadProj.screenY,
          halfWidth: roadProj.halfWidth,
          shorelineScreenX: shorelineProj.visible ? shorelineProj.screenX : roadProj.screenX + roadProj.halfWidth * 2.2,
          depth: roadProj.depth,
          worldZ: z,
        });
      }
    }

    if (slices.length < 2) return;

    for (let y = 0; y < height; y++) {
      this.scanlineCenter[y] = width * 0.5;
      this.scanlineHalfWidth[y] = 0;
      this.scanlineShoreline[y] = width * 0.75;
      this.scanlineDepth[y] = Infinity;
    }

    // Rasterize Trapezoidal Bands between consecutive slices
    for (let i = 1; i < slices.length; i++) {
      const pFar = slices[i];
      const pNear = slices[i - 1];

      const yTop = Math.max(horizonRow, Math.min(height - 1, Math.round(pFar.screenY)));
      const yBot = Math.max(horizonRow, Math.min(height - 1, Math.round(pNear.screenY)));

      if (yBot < yTop) continue;

      const dy = Math.max(1, yBot - yTop);

      for (let y = yTop; y <= yBot; y++) {
        const t = (y - yTop) / dy;
        const centerX = pFar.screenX + (pNear.screenX - pFar.screenX) * t;
        const halfW = pFar.halfWidth + (pNear.halfWidth - pFar.halfWidth) * t;
        const shorelineX = pFar.shorelineScreenX + (pNear.shorelineScreenX - pFar.shorelineScreenX) * t;
        const depth = pFar.depth + (pNear.depth - pFar.depth) * t;
        const sliceZ = pFar.worldZ + (pNear.worldZ - pFar.worldZ) * t;

        this.scanlineCenter[y] = centerX;
        this.scanlineHalfWidth[y] = halfW;
        this.scanlineShoreline[y] = shorelineX;
        this.scanlineDepth[y] = depth;

        const xL = Math.round(centerX - halfW);
        const xR = Math.round(centerX + halfW);
        const roadSpan = xR - xL;
        if (roadSpan <= 0) continue;

        const depthFactor = (y - horizonRow) / Math.max(1, height - horizonRow);

        // ==========================================
        // 1. LEFT INLAND PROJECTED TERRAIN BAND
        // ==========================================
        for (let x = 0; x < xL; x++) {
          const distFromRoad = xL - x;
          const isShoulder = distFromRoad <= 3;
          let char = ' ';
          let color = inlandGrassColor;
          let bg = inlandBg;

          if (isTropical) {
            if (isShoulder) {
              bg = ColorPalette.scaleBrightness(inlandBg, 1.25);
              char = '░';
            } else {
              const isTuft = ((x * 7 + y * 13) % 11) === 0;
              if (isTuft) {
                char = depthFactor > 0.5 ? '"' : '·';
              }
            }
          } else if (isDesert) {
            bg = ColorPalette.scaleBrightness(palette.ground, 0.9);
            color = palette.groundDetail;
            if (isShoulder) {
              char = '▒';
            } else if (((x * 5 + y * 9) % 7) === 0) {
              char = '.';
            }
          } else if (isForest) {
            bg = ColorPalette.scaleBrightness(palette.ground, 0.85);
            color = palette.groundDetail;
            if (isShoulder) {
              char = '░';
            } else if (((x * 7 + y * 11) % 9) === 0) {
              char = '"';
            }
          } else {
            bg = palette.ground;
            color = palette.groundDetail;
            if (((x * 5 + y * 7) % 8) === 0) char = '·';
          }

          fb.setCell(x, y, char, color, depth + 15, bg, false);
        }

        // ==========================================
        // 2. ROAD SURFACE & CONTINUOUS CURBS
        // ==========================================
        const isAltTarmac = Math.floor(sliceZ / 35) % 2 === 0;
        let baseRoadColor = isAltTarmac
          ? palette.road
          : ColorPalette.scaleBrightness(palette.road, 1.18);

        if (isNight) {
          const distFromPlayer = sliceZ - playerZ;
          if (distFromPlayer > 0 && distFromPlayer < 350) {
            const hFactor = 1.0 + (1.0 - distFromPlayer / 350) * 1.6;
            baseRoadColor = ColorPalette.scaleBrightness(baseRoadColor, hFactor);
          } else {
            baseRoadColor = ColorPalette.scaleBrightness(baseRoadColor, 0.55);
          }
        }

        const roadFog = ColorPalette.applyFog(baseRoadColor, palette.fog, Math.min(1.0, depth / 950) * 0.45);
        const shoulderColor = ColorPalette.applyFog(palette.roadShoulder, palette.fog, Math.min(1.0, depth / 950) * 0.45);
        const markingColor = beatPulse
          ? '#ffffff'
          : ColorPalette.applyFog(palette.roadMarking, palette.fog, Math.min(1.0, depth / 950) * 0.4);

        // A. Continuous Rumble Curbs
        const curbWidth = Math.max(2, Math.round(roadSpan * 0.055));
        const rumblePattern = Math.floor(sliceZ / 25) % 2 === 0;
        const curbChar = rumblePattern ? '█' : '▒';
        const curbColor = rumblePattern ? shoulderColor : ColorPalette.scaleBrightness(shoulderColor, 1.45);

        for (let x = xL - curbWidth; x <= xL; x++) {
          fb.setCell(x, y, curbChar, curbColor, depth, undefined, false);
        }
        for (let x = xR; x <= xR + curbWidth; x++) {
          fb.setCell(x, y, curbChar, curbColor, depth, undefined, false);
        }

        // B. Clean Asphalt Surface with Cell Background
        const asphaltBg = ColorPalette.scaleBrightness(roadFog, 0.65);
        const tarmacChar = depth > 700 ? '·' : (depth > 400 ? '.' : ' ');
        for (let x = xL + 1; x < xR; x++) {
          fb.setCell(x, y, tarmacChar, roadFog, depth, asphaltBg, false);
        }

        // C. Dashed Gold Lane Dividers
        const isDashed = Math.floor(sliceZ / 25) % 2 === 0;
        if (isDashed) {
          const lane1X = Math.round(xL + roadSpan * 0.333);
          const lane2X = Math.round(xL + roadSpan * 0.667);
          fb.setCell(lane1X, y, '║', markingColor, depth - 0.5, asphaltBg, false);
          fb.setCell(lane2X, y, '║', markingColor, depth - 0.5, asphaltBg, false);
        }

        // ==========================================
        // 3. RIGHT SIDE TERRAIN / SHORELINE / DUNES
        // ==========================================
        const shoreScreenX = Math.max(xR + 3, Math.round(shorelineX));

        if (isTropical) {
          // A. Sand Beach Band
          for (let x = xR + curbWidth + 1; x < shoreScreenX && x < width; x++) {
            const distToShore = shoreScreenX - x;
            let char = ' ';
            let color = sandDetailColor;
            const bg = sandBg;

            if (distToShore <= 2) {
              char = '░';
              color = ColorPalette.scaleBrightness(sandBg, 1.35);
            } else {
              const isSandDot = ((x * 5 + y * 9) % 7) === 0;
              if (isSandDot) char = '.';
            }
            fb.setCell(x, y, char, color, depth + 8, bg, false);
          }

          // B. Dynamic Surf Foam on Projected Shoreline
          const foamLeft = Math.max(0, shoreScreenX - 1);
          const foamRight = Math.min(width - 1, shoreScreenX + 2);
          for (let x = foamLeft; x <= foamRight; x++) {
            const isFoam = ((x + Math.floor(time * 4)) % 2) === 0;
            const foamChar = isFoam ? '≈' : '~';
            fb.setCell(x, y, foamChar, '#ffffff', depth + 6, '#0284c7', false);
          }

          // C. Projected Ocean Surface (Animated Waves)
          for (let x = foamRight + 1; x < width; x++) {
            const wavePhase = (x * 0.22) - (time * 3.5) + (y * 0.45);
            const waveVal = Math.sin(wavePhase);
            const waveSparkle = energy > 0.2 && Math.sin(wavePhase * 2 + time * 6) > 0.7;

            let char = ' ';
            let color = oceanRippleColor;

            if (waveVal > 0.75) {
              char = depthFactor > 0.6 ? '^' : (depthFactor > 0.3 ? '≈' : '~');
              color = waveSparkle ? '#ffffff' : oceanRippleColor;
            } else if (waveVal > 0.45) {
              char = depthFactor > 0.5 ? '·' : ' ';
            }

            fb.setCell(x, y, char, color, depth + 12, oceanBg, false);
          }
        } else if (isDesert) {
          // Right Desert Canyon Floor & Sand Dunes
          for (let x = xR + curbWidth + 1; x < width; x++) {
            const isDune = ((x * 3 + y * 7) % 11) === 0;
            const char = isDune ? '~' : ' ';
            const bg = ColorPalette.scaleBrightness(palette.ground, 1.15);
            fb.setCell(x, y, char, palette.groundDetail, depth + 10, bg, false);
          }
        } else if (isForest) {
          // Right Forest Verge & River Stream
          const riverStart = Math.min(width - 1, xR + 18);
          for (let x = xR + curbWidth + 1; x < riverStart; x++) {
            const isMoss = ((x * 7 + y * 9) % 8) === 0;
            const char = isMoss ? '"' : ' ';
            fb.setCell(x, y, char, palette.groundDetail, depth + 10, palette.ground, false);
          }
          for (let x = riverStart; x < width; x++) {
            const isRipple = ((x + Math.floor(time * 3)) % 5) === 0;
            const char = isRipple ? '~' : ' ';
            fb.setCell(x, y, char, '#38bdf8', depth + 12, '#0369a1', false);
          }
        } else {
          // General Right Ground
          for (let x = xR + curbWidth + 1; x < width; x++) {
            const char = ((x * 7 + y * 5) % 9) === 0 ? '·' : ' ';
            fb.setCell(x, y, char, palette.groundDetail, depth + 10, palette.ground, false);
          }
        }
      }
    }
  }

  /**
   * Retrieves robust road center and half-width around target screen row using local window averaging.
   */
  public getStableRoadGeometryAtRow(targetY: number, height: number, horizonRow: number): { center: number; halfWidth: number } {
    const clampedY = Math.max(horizonRow + 1, Math.min(height - 1, Math.round(targetY)));

    if (this.scanlineHalfWidth[clampedY] > 10) {
      let sumCenter = 0;
      let sumWidth = 0;
      let count = 0;
      for (let dy = -1; dy <= 1; dy++) {
        const y = clampedY + dy;
        if (y >= 0 && y < height && this.scanlineHalfWidth[y] > 5) {
          sumCenter += this.scanlineCenter[y];
          sumWidth += this.scanlineHalfWidth[y];
          count++;
        }
      }
      if (count > 0) {
        return { center: sumCenter / count, halfWidth: sumWidth / count };
      }
    }

    for (let r = 1; r <= 8; r++) {
      const yBelow = clampedY + r;
      if (yBelow < height && this.scanlineHalfWidth[yBelow] > 10) {
        return { center: this.scanlineCenter[yBelow], halfWidth: this.scanlineHalfWidth[yBelow] };
      }
      const yAbove = clampedY - r;
      if (yAbove >= horizonRow + 1 && this.scanlineHalfWidth[yAbove] > 10) {
        return { center: this.scanlineCenter[yAbove], halfWidth: this.scanlineHalfWidth[yAbove] };
      }
    }

    return {
      center: this.scanlineCenter[clampedY] || 60,
      halfWidth: Math.max(20, this.scanlineHalfWidth[clampedY] || 25),
    };
  }

  /**
   * Renders Protagonist Sports Car with chase camera residual framing and strict road containment.
   */
  private renderPlayerVehicle(
    fb: FrameBuffer,
    width: number,
    height: number,
    horizonRow: number
  ): void {
    const player = this.state.player;
    const playerScreenY = Math.floor(height * 0.78);

    if (playerScreenY < horizonRow || playerScreenY >= height) return;

    // Retrieve robust road geometry around player anchor row
    const { center: roadCenterX, halfWidth: halfW } = this.getStableRoadGeometryAtRow(playerScreenY, height, horizonRow);

    this.lastRoadCenterAtPlayerRow = roadCenterX;
    this.lastRoadHalfWidthAtPlayerRow = halfW;

    // Normalized lateral position in road space: [-1.0, 1.0]
    const normalizedLateral = player.lateralOffset / (this.road.defaultRoadWidth * 0.5);

    // Screen residual: since chase camera already follows 85% of lateral movement,
    // the sprite only exhibits a comfortable 15% residual displacement on screen
    const screenResidual = normalizedLateral * halfW * PLAYER_SCREEN_LATERAL_RESIDUAL;
    const calculatedX = roadCenterX + screenResidual;

    // Select Close/Near LOD variant based on resolution
    const variant = (height >= 35 ? player.sprite.variants.close : player.sprite.variants.near) ||
                    player.sprite.variants.medium ||
                    player.sprite.variants.far;

    // Strict containment clamp: keep the full sprite body safely on the road tarmac
    const spriteHalfW = (variant ? variant.width : 22) * 0.5;
    const visualMargin = 2;
    const minCarCenter = (roadCenterX - halfW) + spriteHalfW + visualMargin;
    const maxCarCenter = (roadCenterX + halfW) - spriteHalfW - visualMargin;

    let playerScreenX = calculatedX;
    let isVisualClamped = false;

    if (playerScreenX < minCarCenter) {
      playerScreenX = minCarCenter;
      isVisualClamped = true;
    } else if (playerScreenX > maxCarCenter) {
      playerScreenX = maxCarCenter;
      isVisualClamped = true;
    }

    // Additional safety clamp: ensure car stays within 28%-72% of screen width
    const screenMin = width * 0.28;
    const screenMax = width * 0.72;
    if (playerScreenX < screenMin) {
      playerScreenX = screenMin;
      isVisualClamped = true;
    } else if (playerScreenX > screenMax) {
      playerScreenX = screenMax;
      isVisualClamped = true;
    }

    this.lastPlayerScreenX = playerScreenX;
    this.lastIsVisualClamped = isVisualClamped;

    const isRecovering = player.collisionCooldown > 0;
    const isBraking = player.driverState === 'BRAKING';
    let playerColor = player.sprite.defaultColor;

    if (isRecovering) {
      playerColor = '#f43f5e';
    } else if (isBraking) {
      playerColor = '#fb7185';
    }

    // Shadow underneath player car
    const shadowY = playerScreenY + 1;
    if (shadowY < height) {
      const shadowSpan = Math.round(spriteHalfW + 1);
      for (let sx = Math.round(playerScreenX - shadowSpan); sx <= Math.round(playerScreenX + shadowSpan); sx++) {
        fb.setCell(sx, shadowY, '▄', '#05060a', 25, undefined, false);
      }
    }

    if (variant) {
      // Draw protagonist car on top of the road surface (depth = 30)
      fb.drawSprite(
        playerScreenX,
        playerScreenY,
        variant,
        playerColor,
        30
      );
    }
  }

  /**
   * Renders the interactive Resonance Art Lab (Sprite Gallery, Contrast Matrix, and Motion Approach).
   */
  private renderSpriteGallery(fb: FrameBuffer, width: number, height: number): void {
    fb.clear(' ', '#ffffff', '#090d16');

    const sprites: SpriteDefinition[] = SpriteLibrary.getHeroSprites();
    const currentSprite = sprites[this.galleryIndex % sprites.length];

    if (this.gallerySubMode === 'sprites') {
      const monoBadge = this.isMonochromeGallery ? ' [MONOCHROME SILHOUETTE]' : '';
      const headerText = `=== RESONANCE ART LAB — SPRITE GALLERY [${(this.galleryIndex % sprites.length) + 1}/${sprites.length}]${monoBadge} ===`;
      fb.drawString(Math.floor((width - headerText.length) / 2), 1, headerText, this.isMonochromeGallery ? '#ffffff' : '#38bdf8', 0, '#0f172a');

      const infoText = `${currentSprite.name.toUpperCase()} (ID: ${currentSprite.id}) | Cat: ${currentSprite.category || 'SCENERY'} | World: ${currentSprite.worldWidth || '-'}x${currentSprite.worldHeight || '-'} | Scale: ${currentSprite.visualScale || 1.0}`;
      fb.drawString(Math.max(2, Math.floor((width - infoText.length) / 2)), 3, infoText, '#fde047');

      const helpText = `[A/D: PREV/NEXT]  •  [M: MONOCHROME]  •  [C: CONTRAST TEST]  •  [V: APPROACH TEST]  •  [ESC/0: DRIVE]`;
      fb.drawString(Math.max(2, Math.floor((width - helpText.length) / 2)), height - 2, helpText, '#94a3b8');

      // Baseline and slots for FAR, MEDIUM, NEAR, CLOSE
      const lods: LODLevel[] = ['far', 'medium', 'near', 'close'];
      const colStep = Math.floor(width / 4);
      const baselineY = height - 5;

      // Draw horizontal ground baseline
      fb.drawHLine(4, width - 5, baselineY, '─', '#334155', 0);

      for (let i = 0; i < lods.length; i++) {
        const lod = lods[i];
        const variant = currentSprite.variants[lod];
        const slotCenterX = Math.floor(colStep * i + colStep / 2);

        const label = `[ ${lod.toUpperCase()} ]`;
        fb.drawString(slotCenterX - Math.floor(label.length / 2), 5, label, '#38bdf8');

        if (variant) {
          const dimLabel = `${variant.width}x${variant.height}`;
          fb.drawString(slotCenterX - Math.floor(dimLabel.length / 2), 7, dimLabel, '#64748b');

          // Draw sprite anchored at baseline
          fb.drawSprite(
            slotCenterX,
            baselineY,
            variant,
            currentSprite.defaultColor,
            0,
            this.isMonochromeGallery ? '#ffffff' : undefined,
            this.isMonochromeGallery
          );
        } else {
          const noneLabel = '(none)';
          fb.drawString(slotCenterX - Math.floor(noneLabel.length / 2), Math.floor(baselineY / 2), noneLabel, '#ef4444');
        }
      }
    } else if (this.gallerySubMode === 'contrast') {
      const headerText = `=== RESONANCE ART LAB — CONTRAST MATRIX [${(this.galleryIndex % sprites.length) + 1}/${sprites.length}] ===`;
      fb.drawString(Math.floor((width - headerText.length) / 2), 1, headerText, '#fde047', 0, '#0f172a');

      const infoText = `${currentSprite.name.toUpperCase()} (ID: ${currentSprite.id}) — Cross-Biome Contrast Verification`;
      fb.drawString(Math.max(2, Math.floor((width - infoText.length) / 2)), 2, infoText, '#38bdf8');

      const helpText = `[A/D: SWITCH SPRITE]  •  [G: STANDARD GALLERY]  •  [V: APPROACH TEST]  •  [ESC/0: DRIVE]`;
      fb.drawString(Math.max(2, Math.floor((width - helpText.length) / 2)), height - 2, helpText, '#94a3b8');

      const swatches = [
        { name: '1. BLACK (VOID)', bg: '#000000' },
        { name: '2. FOREST GREEN', bg: '#064e3b' },
        { name: '3. CANYON SAND', bg: '#78350f' },
        { name: '4. DAY SKY BLUE', bg: '#0284c7' },
        { name: '5. GLACIAL SNOW', bg: '#cbd5e1' },
        { name: '6. NEON NIGHT', bg: '#3b0764' },
      ];

      const panelW = Math.floor((width - 8) / 3);
      const panelH = Math.floor((height - 8) / 2);
      const variant = currentSprite.variants.near || currentSprite.variants.medium || currentSprite.variants.close;

      for (let idx = 0; idx < swatches.length; idx++) {
        const swatch = swatches[idx];
        const col = idx % 3;
        const row = Math.floor(idx / 3);
        const px1 = 3 + col * panelW;
        const px2 = px1 + panelW - 2;
        const py1 = 4 + row * panelH;
        const py2 = py1 + panelH - 2;

        // Fill swatch background
        for (let y = py1; y <= py2; y++) {
          for (let x = px1; x <= px2; x++) {
            fb.setCell(x, y, ' ', '#ffffff', 0, swatch.bg, false);
          }
        }

        // Swatch label
        fb.drawString(px1 + 1, py1, swatch.name, '#f8fafc', 0, swatch.bg);

        // Draw sprite inside swatch
        if (variant) {
          const centerX = Math.floor((px1 + px2) / 2);
          const contactY = py2 - 1;
          fb.drawSprite(centerX, contactY, variant, currentSprite.defaultColor, 0);
        }
      }
    } else if (this.gallerySubMode === 'approach') {
      const headerText = `=== RESONANCE ART LAB — MOTION & SCALE APPROACH TEST [${(this.galleryIndex % sprites.length) + 1}/${sprites.length}] ===`;
      fb.drawString(Math.floor((width - headerText.length) / 2), 1, headerText, '#38bdf8', 0, '#0f172a');

      const projH = DepthSorter.calculateProjectedHeight(
        this.approachZ,
        currentSprite.worldHeight,
        height,
        currentSprite.visualScale
      );
      const activeLOD = DepthSorter.calculateProjectedLOD(this.approachZ, currentSprite, height);
      const variant = currentSprite.variants[activeLOD] || currentSprite.variants.close;

      const telemetryText = `relZ: ${this.approachZ.toFixed(1)} u  |  H_proj: ${projH.toFixed(2)} rows  |  LOD: [${activeLOD.toUpperCase()}]  |  Variant: ${variant ? `${variant.width}x${variant.height}` : '(none)'}`;
      fb.drawString(Math.max(2, Math.floor((width - telemetryText.length) / 2)), 3, telemetryText, '#fde047');

      const helpText = `[A/D: SWITCH SPRITE]  •  [G: STANDARD GALLERY]  •  [C: CONTRAST TEST]  •  [ESC/0: DRIVE]`;
      fb.drawString(Math.max(2, Math.floor((width - helpText.length) / 2)), height - 2, helpText, '#94a3b8');

      const baselineY = height - 6;
      fb.drawHLine(6, width - 7, baselineY, '─', '#334155', 0);
      fb.drawString(8, baselineY + 1, 'GROUND CONTACT BASELINE', '#475569');

      if (variant) {
        const centerX = Math.floor(width / 2);
        fb.drawSprite(
          centerX,
          baselineY,
          variant,
          currentSprite.defaultColor,
          0,
          this.isMonochromeGallery ? '#ffffff' : undefined,
          this.isMonochromeGallery
        );
      }
    }
  }
}
