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
import { WeatherEngine } from './weather/WeatherEngine';
import { WorldDirector } from './WorldDirector';
import { WorldState } from './WorldState';
import { AmbientParticle, WorldMusicParameters } from './types';
import { SeededRandom } from '../procedural/SeededRandom';

interface Cloud {
  xNorm: number;
  yNorm: number;
  width: number;
  shape: string[];
  speed: number;
}

// Chase Camera & Lateral Presentation Constants
export const PLAYER_CAMERA_LATERAL_FOLLOW = 0.85;
export const PLAYER_SCREEN_LATERAL_RESIDUAL = 0.15;
export const CAMERA_SMOOTH_SPEED = 7.0;

export class WorldEngine {
  private state: WorldState;
  private road: RoadGenerator;
  private driver: AutonomousDriver;
  private traffic: TrafficController;
  private collisions: CollisionSystem;
  private biomeSystem: BiomeTransitionSystem;
  private dayNightCycle: DayNightCycle;
  private weatherEngine: WeatherEngine;
  private director: WorldDirector;
  private depthSorter: DepthSorter;
  private rng: SeededRandom;

  private ambientParticles: AmbientParticle[] = [];
  private stars: { xNorm: number; yNorm: number; char: string; brightness: number; twinkleSpeed: number }[] = [];
  private clouds: Cloud[] = [];

  // Visual Test Mode state
  private isVisualTest: boolean = false;
  private testScenario: RoadTestMode = 'NORMAL';

  // Cached scanline geometry for player anchoring, debug telemetry and continuity verification
  private scanlineCenter: Float32Array = new Float32Array(100);
  private scanlineHalfWidth: Float32Array = new Float32Array(100);
  private scanlineDepth: Float32Array = new Float32Array(100);

  constructor(seed: number = 2026) {
    this.rng = new SeededRandom(seed);
    this.state = new WorldState();
    this.road = new RoadGenerator(seed);
    this.driver = new AutonomousDriver();
    this.traffic = new TrafficController(this.rng);
    this.collisions = new CollisionSystem();
    this.biomeSystem = new BiomeTransitionSystem();
    this.dayNightCycle = new DayNightCycle();
    this.weatherEngine = new WeatherEngine(this.rng);
    this.director = new WorldDirector(seed, this.biomeSystem);
    this.depthSorter = new DepthSorter();

    // Calibrate camera initial model
    this.state.camera.distanceToPlane = 0.44;
    this.state.dayNight = this.dayNightCycle.update(0);
    this.state.biomeBlend = this.biomeSystem.evaluate(0);

    this.initStars();
    this.initClouds();
  }

  public setVisualTestMode(enabled: boolean, scenario: RoadTestMode = 'FLAT_STRAIGHT'): void {
    this.isVisualTest = enabled;
    this.testScenario = scenario;
    this.road.setTestMode(scenario);

    if (enabled) {
      this.state.cameraShake = 0;
      this.state.dayNight.ambientLight = 1.0;
      this.state.dayNight.phase = 'DAY';
      this.traffic.maxTrafficCount = 2;
    } else {
      this.road.setTestMode('NORMAL');
      this.traffic.maxTrafficCount = 4;
    }
  }

  public getVisualTestMode(): { isVisualTest: boolean; scenario: RoadTestMode } {
    return { isVisualTest: this.isVisualTest, scenario: this.testScenario };
  }

  public getScanlineDataAt(y: number): { center: number; halfWidth: number; depth: number } {
    const iy = Math.max(0, Math.min(this.scanlineCenter.length - 1, Math.round(y)));
    return {
      center: this.scanlineCenter[iy],
      halfWidth: this.scanlineHalfWidth[iy],
      depth: this.scanlineDepth[iy],
    };
  }

  private initStars(): void {
    this.stars = [];
    const starChars = ['*', '+', '.', '°', '·', '✦', '✧'];
    for (let i = 0; i < 95; i++) {
      this.stars.push({
        xNorm: this.rng.next(),
        yNorm: this.rng.range(0.01, 0.38),
        char: this.rng.choice(starChars),
        brightness: this.rng.range(0.5, 1.0),
        twinkleSpeed: this.rng.range(2.0, 6.0),
      });
    }
  }

  private initClouds(): void {
    this.clouds = [
      {
        xNorm: 0.15,
        yNorm: 0.08,
        width: 22,
        speed: 0.004,
        shape: [
          '     .-------.    ',
          '  .-(         )-. ',
          ' (_______________)',
        ],
      },
      {
        xNorm: 0.65,
        yNorm: 0.16,
        width: 28,
        speed: 0.006,
        shape: [
          '       .--------.       ',
          '   .--(          )---.  ',
          '  (___________________) ',
        ],
      },
      {
        xNorm: 0.88,
        yNorm: 0.05,
        width: 18,
        speed: 0.003,
        shape: [
          '   .----.   ',
          ' .-(      )-.',
          '(____________)',
        ],
      },
    ];
  }

  public getState(): WorldState {
    return this.state;
  }

  public getRoad(): RoadGenerator {
    return this.road;
  }

  public getCollisionSystem(): CollisionSystem {
    return this.collisions;
  }

  public setTimeOfDayNormalized(t: number): void {
    this.dayNightCycle.setNormalizedTime(t);
  }

  /**
   * Main simulation tick.
   */
  public update(dt: number, musicParams: WorldMusicParameters, viewportWidth: number = 120, viewportHeight: number = 42): void {
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
      this.state.dayNight.phase = 'DAY';
      this.state.dayNight.ambientLight = 1.0;
      this.state.dayNight.sunElevation = 0.8;
      this.state.biomeBlend = this.biomeSystem.evaluate(0);
    } else {
      this.state.musicParams = musicParams;
      this.state.dayNight = this.dayNightCycle.update(dt);
      this.state.biomeBlend = this.biomeSystem.evaluate(this.state.player.z);
    }

    // Weather update
    if (!this.isVisualTest) {
      this.weatherEngine.updateBiomeWeather(this.state.biomeBlend.currentBiome.id, this.state.musicParams.tension);
      this.state.weather = this.weatherEngine.update(dt, viewportWidth, viewportHeight);
      this.road.setTension(this.state.musicParams.tension);
    } else {
      this.state.weather = { type: 'CLEAR', intensity: 0, particles: [] };
    }

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
    // Ensure player is safely clamped
    this.state.player.lateralOffset = this.road.clampLateralOffset(this.state.player.lateralOffset, this.state.player.boundingBox.width, 20);
    this.state.player.x = playerRoadCurve + this.state.player.lateralOffset;

    // 4. Smooth Chase Camera Follow Model
    const camZ = this.state.player.z - 130;
    const roadCurveAtCamZ = this.road.getCurveAt(camZ);
    const targetCamX = roadCurveAtCamZ + this.state.player.lateralOffset * PLAYER_CAMERA_LATERAL_FOLLOW;
    const camElevation = this.road.getElevationAt(camZ);
    const shakeOffset = this.isVisualTest ? 0 : (this.rng.next() - 0.5) * this.state.cameraShake * 18;

    // Smooth exponential interpolation for camera lateral movement
    this.state.camera.x += (targetCamX - this.state.camera.x) * Math.min(1.0, dt * CAMERA_SMOOTH_SPEED);
    this.state.camera.z = camZ;
    this.state.camera.y = 280 + camElevation + this.state.musicParams.cameraBounce + shakeOffset;
    this.state.camera.distanceToPlane = 0.44;
    this.state.camera.fovPulse = this.isVisualTest ? 0 : this.state.musicParams.fovPulse;

    // Camera shake decay
    if (this.state.cameraShake > 0) {
      this.state.cameraShake = Math.max(0, this.state.cameraShake - dt * 2.5);
    }

    // 5. Update traffic and scenery
    this.traffic.update(dt, this.state.player, this.road);
    this.director.update(this.state.camera.z, this.road, 1200);

    // 6. Update clouds drift
    for (const cloud of this.clouds) {
      cloud.xNorm = (cloud.xNorm + cloud.speed * dt) % 1.0;
    }

    // 7. Update ambient particles
    if (!this.isVisualTest) {
      this.updateAmbientParticles(dt, this.state.musicParams);
    }
  }

  private updateAmbientParticles(dt: number, musicParams: WorldMusicParameters): void {
    if (musicParams.particleDensity > 0.15 && this.rng.boolean(musicParams.particleDensity * 0.8)) {
      const isLeft = this.rng.boolean();
      const offset = isLeft ? -this.rng.range(500, 900) : this.rng.range(500, 900);
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
    frameBuffer.clear(' ', '#10141e', '#030712');

    const width = frameBuffer.width;
    const height = frameBuffer.height;
    const horizonRow = Math.floor(height * 0.40);

    const palette = this.state.biomeBlend.blendedPalette;
    const dayNight = this.state.dayNight;
    const glow = this.state.musicParams.environmentalGlow;

    // 1. SKY RENDERING
    this.renderSky(frameBuffer, width, horizonRow, palette, dayNight, glow);

    // 2. PARALLAX HORIZON & MOUNTAIN SILHOUETTES
    this.renderHorizonSilhouettes(frameBuffer, width, horizonRow, palette, dayNight);

    // 3. PROCEDURAL GROUND RENDERING
    this.renderGround(frameBuffer, width, height, horizonRow, palette, dayNight);

    // 4. CONTINUOUS PSEUDO-3D ROAD SCANLINE RASTERIZATION
    this.renderRoad(frameBuffer, width, height, horizonRow, palette, dayNight);

    // 5. DEPTH-SORTED SCENERY & TRAFFIC RENDERING
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

    // 6. PROTAGONIST PLAYER VEHICLE (ARCADE SCREEN-SPACE ANCHOR)
    this.renderPlayerVehicle(frameBuffer, width, height, horizonRow);

    // 7. AMBIENT PARTICLES
    for (const p of this.ambientParticles) {
      const proj = Perspective.project(p.x, p.y, p.z, this.state.camera, width, height, 0.40);
      if (proj.visible) {
        frameBuffer.setCell(proj.screenX, proj.screenY, p.char, p.color, proj.depth, undefined, true);
      }
    }

    // 8. WEATHER PARTICLES
    for (const p of this.state.weather.particles) {
      frameBuffer.setCell(p.x, p.y, p.char, p.color, 5, undefined, true);
    }
  }

  private renderSky(
    fb: FrameBuffer,
    width: number,
    horizonRow: number,
    palette: typeof this.state.biomeBlend.blendedPalette,
    dayNight: typeof this.state.dayNight,
    glow: number
  ): void {
    const skyTop = ColorPalette.scaleBrightness(
      ColorPalette.lerp(palette.skyTop, dayNight.blendedSkyTop, 0.7),
      0.85 + glow * 0.25
    );
    const skyBottom = ColorPalette.scaleBrightness(
      ColorPalette.lerp(palette.skyBottom, dayNight.blendedSkyBottom, 0.65),
      0.85 + glow * 0.25
    );

    // Multi-band sky gradient
    for (let y = 0; y < horizonRow; y++) {
      const t = y / Math.max(1, horizonRow);
      const rowColor = ColorPalette.lerp(skyTop, skyBottom, t);
      const skyChar = t > 0.82 ? '░' : ' ';
      for (let x = 0; x < width; x++) {
        fb.setCell(x, y, skyChar, rowColor, 10000, undefined, false);
      }
    }

    // Stars during Night and Twilight
    if (dayNight.starIntensity > 0.05) {
      const time = this.state.worldTime;
      for (const star of this.stars) {
        const starX = Math.floor(star.xNorm * width);
        const starY = Math.floor(star.yNorm * horizonRow);
        const twinkle = 0.6 + Math.sin(time * star.twinkleSpeed) * 0.4;
        const brightness = star.brightness * dayNight.starIntensity * twinkle;
        if (brightness > 0.18) {
          const starColor = ColorPalette.scaleBrightness('#ffffff', brightness);
          fb.setCell(starX, starY, star.char, starColor, 9990, undefined, true);
        }
      }
    }

    // Drifting Procedural Clouds
    if (dayNight.phase !== 'NIGHT') {
      const cloudColor = dayNight.phase === 'DUSK'
        ? '#f472b6'
        : (dayNight.phase === 'DAWN' ? '#fde047' : '#e0f2fe');

      for (const cloud of this.clouds) {
        const startX = Math.floor(cloud.xNorm * width);
        const startY = Math.floor(cloud.yNorm * horizonRow);

        for (let r = 0; r < cloud.shape.length; r++) {
          const line = cloud.shape[r];
          const cy = startY + r;
          if (cy >= horizonRow) continue;

          for (let c = 0; c < line.length; c++) {
            const ch = line[c];
            if (ch !== ' ') {
              const cx = (startX + c) % width;
              fb.setCell(cx, cy, ch, cloudColor, 9970, undefined, true);
            }
          }
        }
      }
    }

    // Sun / Moon Celestial Body
    const celestialY = Math.floor(horizonRow * (1.0 - dayNight.sunElevation * 0.72));
    const celestialX = Math.floor(width * 0.5 + Math.sin(this.state.worldTime * 0.02) * width * 0.22);

    if (celestialY >= 2 && celestialY < horizonRow - 1) {
      const isNight = dayNight.phase === 'NIGHT';
      const disc = isNight
        ? [
            '  .---.  ',
            ' / (o) \\ ',
            '|   ( ) |',
            ' \\     / ',
            '  \'---\'  ',
          ]
        : [
            '   \\ | /   ',
            ' --.---.-- ',
            '---| * |---',
            ' --\'---\'-- ',
            '   / | \\   ',
          ];
      const color = dayNight.sunColor;

      for (let r = 0; r < disc.length; r++) {
        const rowText = disc[r];
        for (let c = 0; c < rowText.length; c++) {
          const ch = rowText[c];
          if (ch !== ' ') {
            const targetX = celestialX - Math.floor(rowText.length / 2) + c;
            if (targetX >= 0 && targetX < width) {
              fb.setCell(targetX, celestialY - 2 + r, ch, color, 9950, undefined, true);
            }
          }
        }
      }
    }
  }

  private renderHorizonSilhouettes(
    fb: FrameBuffer,
    width: number,
    horizonRow: number,
    palette: typeof this.state.biomeBlend.blendedPalette,
    dayNight: typeof this.state.dayNight
  ): void {
    const biome = this.state.biomeBlend.currentBiome;
    const mountainChar = biome.mountainChar || '^';
    const mountainColor = ColorPalette.scaleBrightness(
      palette.mountains,
      Math.max(0.4, dayNight.ambientLight)
    );
    const camXOffset = (this.state.camera.x * 0.012) % width;

    for (let x = 0; x < width; x++) {
      const worldCol = (x + camXOffset + width * 10) % width;

      let h1: number;
      if (biome.id === 'NEON_CITY') {
        const towerSlot = Math.floor(worldCol / 5);
        const isTower = (towerSlot * 7) % 3 !== 0;
        h1 = isTower ? ((towerSlot * 11) % 6 + 4) : 2;
      } else {
        const p1 = Math.sin(worldCol * 0.06) * 4.5;
        const p2 = Math.sin(worldCol * 0.18) * 2.2;
        h1 = Math.max(1, Math.floor(p1 + p2 + 5));
      }

      for (let dy = 0; dy < h1; dy++) {
        const my = horizonRow - 1 - dy;
        if (my >= 0 && my < horizonRow) {
          let char = mountainChar;
          if (biome.id === 'NEON_CITY') {
            char = dy === h1 - 1 ? '|' : (dy % 2 === 0 ? '::' : '||')[dy % 2];
          } else {
            char = dy === h1 - 1 ? '^' : mountainChar;
          }
          fb.setCell(x, my, char, mountainColor, 9000, undefined, false);
        }
      }
    }
  }

  private renderGround(
    fb: FrameBuffer,
    width: number,
    height: number,
    horizonRow: number,
    palette: typeof this.state.biomeBlend.blendedPalette,
    dayNight: typeof this.state.dayNight
  ): void {
    const groundChar = this.state.biomeBlend.currentBiome.groundChar || '.';
    const groundBaseColor = ColorPalette.scaleBrightness(
      palette.ground,
      Math.max(0.35, dayNight.ambientLight)
    );
    const groundDetailColor = ColorPalette.scaleBrightness(
      palette.groundDetail,
      Math.max(0.45, dayNight.ambientLight)
    );

    for (let y = horizonRow; y < height; y++) {
      const depthFactor = (y - horizonRow) / Math.max(1, height - horizonRow);
      const rowColor = ColorPalette.lerp(palette.horizon, groundBaseColor, depthFactor);

      for (let x = 0; x < width; x++) {
        const isDetail = ((x * 5 + y * 11 + Math.floor(this.state.player.z * 0.04)) % 9) === 0;
        const char = isDetail ? groundChar : ' ';
        const charColor = isDetail ? groundDetailColor : rowColor;
        fb.setCell(x, y, char, charColor, 8000 - (y - horizonRow) * 80, undefined, false);
      }
    }
  }

  /**
   * Continuous Pseudo-3D Road Scanline Rasterizer.
   */
  private renderRoad(
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
      this.scanlineDepth = new Float32Array(height);
    }

    const halfRoadWidth = this.road.defaultRoadWidth * 0.5;
    const isNight = dayNight.phase === 'NIGHT';
    const playerZ = this.state.player.z;
    const beatPulse = this.state.musicParams.fovPulse > 0.1;

    const drawDistance = 1050;
    const stepZ = this.road.segmentLength;
    const startZ = Math.floor((this.state.camera.z + 10) / stepZ) * stepZ;
    const endZ = startZ + drawDistance;

    interface ProjectedSlice {
      screenX: number;
      screenY: number;
      halfWidth: number;
      depth: number;
      worldZ: number;
    }

    const slices: ProjectedSlice[] = [];

    for (let z = startZ; z <= endZ; z += stepZ) {
      const curveX = this.road.getCurveAt(z);
      const elevY = this.road.getElevationAt(z);
      const proj = Perspective.projectRoadSlice(
        curveX,
        elevY,
        z,
        halfRoadWidth,
        this.state.camera,
        width,
        height,
        0.40
      );

      if (proj.visible) {
        slices.push({
          screenX: proj.screenX,
          screenY: proj.screenY,
          halfWidth: proj.halfWidth,
          depth: proj.depth,
          worldZ: z,
        });
      }
    }

    if (slices.length < 2) return;

    for (let y = 0; y < height; y++) {
      this.scanlineCenter[y] = width * 0.5;
      this.scanlineHalfWidth[y] = 0;
      this.scanlineDepth[y] = Infinity;
    }

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
        const depth = pFar.depth + (pNear.depth - pFar.depth) * t;
        const sliceZ = pFar.worldZ + (pNear.worldZ - pFar.worldZ) * t;

        this.scanlineCenter[y] = centerX;
        this.scanlineHalfWidth[y] = halfW;
        this.scanlineDepth[y] = depth;

        const xL = Math.round(centerX - halfW);
        const xR = Math.round(centerX + halfW);
        const roadSpan = xR - xL;
        if (roadSpan <= 0) continue;

        const isAltTarmac = Math.floor(sliceZ / 35) % 2 === 0;
        let baseRoadColor = isAltTarmac
          ? palette.road
          : ColorPalette.scaleBrightness(palette.road, 1.22);

        if (isNight) {
          const distFromPlayer = sliceZ - playerZ;
          if (distFromPlayer > 0 && distFromPlayer < 350) {
            const hFactor = 1.0 + (1.0 - distFromPlayer / 350) * 1.6;
            baseRoadColor = ColorPalette.scaleBrightness(baseRoadColor, hFactor);
          } else {
            baseRoadColor = ColorPalette.scaleBrightness(baseRoadColor, 0.55);
          }
        }

        const depthFactor = Math.min(1.0, depth / 950);
        const roadColor = ColorPalette.applyFog(baseRoadColor, palette.fog, depthFactor * 0.45);
        const shoulderColor = ColorPalette.applyFog(palette.roadShoulder, palette.fog, depthFactor * 0.45);
        const markingColor = beatPulse
          ? '#ffffff'
          : ColorPalette.applyFog(palette.roadMarking, palette.fog, depthFactor * 0.4);

        // 1. Two-Stage Rumble Curbs
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

        // 2. Asphalt Road Surface
        const tarmacChar = depth > 700 ? '·' : (depth > 400 ? '.' : ' ');
        for (let x = xL + 1; x < xR; x++) {
          fb.setCell(x, y, tarmacChar, roadColor, depth, undefined, false);
        }

        // 3. Dashed Lane Dividers (positioned at 1/3 and 2/3 road span)
        const isDashed = Math.floor(sliceZ / 25) % 2 === 0;
        if (isDashed) {
          const lane1X = Math.round(xL + roadSpan * 0.333);
          const lane2X = Math.round(xL + roadSpan * 0.667);
          fb.setCell(lane1X, y, '║', markingColor, depth - 0.5, undefined, false);
          fb.setCell(lane2X, y, '║', markingColor, depth - 0.5, undefined, false);
        }
      }
    }
  }

  /**
   * Renders Protagonist Sports Car with chase camera residual framing and strict road containment.
   */
  private renderPlayerVehicle(
    fb: FrameBuffer,
    _width: number,
    height: number,
    horizonRow: number
  ): void {
    const player = this.state.player;
    const playerScreenY = Math.floor(height * 0.82);

    if (playerScreenY < horizonRow || playerScreenY >= height) return;

    const roadCenterX = this.scanlineCenter[playerScreenY];
    const halfW = this.scanlineHalfWidth[playerScreenY];

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
    const spriteHalfW = (variant ? variant.width : 28) * 0.5;
    const curbMargin = 2;
    const minCarCenter = (roadCenterX - halfW) + spriteHalfW + curbMargin;
    const maxCarCenter = (roadCenterX + halfW) - spriteHalfW - curbMargin;
    const playerScreenX = Math.max(minCarCenter, Math.min(maxCarCenter, calculatedX));

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
      const shadowSpan = 13;
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
}
