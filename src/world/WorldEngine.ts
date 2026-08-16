import { FrameBuffer } from '../ascii/FrameBuffer';
import { DepthSorter } from '../ascii/DepthSorter';
import { ColorPalette } from '../ascii/ColorPalette';
import { RoadGenerator } from '../road/RoadGenerator';
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

    this.initStars();
    this.initClouds();
  }

  private initStars(): void {
    this.stars = [];
    const starChars = ['*', '+', '.', '°', '·', '✦', '✧'];
    for (let i = 0; i < 95; i++) {
      this.stars.push({
        xNorm: this.rng.next(),
        yNorm: this.rng.range(0.01, 0.40),
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
    this.state.musicParams = musicParams;

    // 1. Update Day / Night & Biome transitions
    this.state.dayNight = this.dayNightCycle.update(dt);
    this.state.biomeBlend = this.biomeSystem.evaluate(this.state.player.z);

    // 2. Weather update (Truly responsive to real-time viewport dimensions)
    this.weatherEngine.updateBiomeWeather(this.state.biomeBlend.currentBiome.id, musicParams.tension);
    this.state.weather = this.weatherEngine.update(dt, viewportWidth, viewportHeight);

    // 3. Modulate road with tension
    this.road.setTension(musicParams.tension);

    // 4. Autonomous driving
    const allEntities = [...this.traffic.getVehicles(), ...this.director.getScenery()];
    this.driver.update(dt, this.state.player, allEntities, this.road, musicParams.targetSpeedBonus);

    // 5. Update player vehicle
    const playerRoadCurve = this.road.getCurveAt(this.state.player.z);
    this.state.player.update(dt, playerRoadCurve);
    this.state.distance = this.state.player.z;

    // 6. Collision detection & physical contact lifecycle
    const collisionEvents = this.collisions.checkCollisions(this.state.player, allEntities);
    for (const evt of collisionEvents) {
      this.state.cameraShake = Math.max(this.state.cameraShake, evt.cameraShakeAmount);
    }

    // 7. Update camera follow
    const camZ = this.state.player.z - 170;
    const camX = this.road.getCurveAt(camZ) + this.state.player.lateralOffset * 0.75;
    const camElevation = this.road.getElevationAt(camZ);
    const shakeOffset = (this.rng.next() - 0.5) * this.state.cameraShake * 22;

    this.state.camera.z = camZ;
    this.state.camera.x = camX;
    this.state.camera.y = 520 + camElevation + musicParams.cameraBounce + shakeOffset;
    this.state.camera.fovPulse = musicParams.fovPulse;

    // Camera shake decay
    if (this.state.cameraShake > 0) {
      this.state.cameraShake = Math.max(0, this.state.cameraShake - dt * 2.5);
    }

    // 8. Update ambient traffic using EACH vehicle's own longitudinal road curve
    this.traffic.update(dt, this.state.player, this.road);
    this.director.update(this.state.camera.z, this.road, 1200);

    // 9. Update clouds drift
    for (const cloud of this.clouds) {
      cloud.xNorm = (cloud.xNorm + cloud.speed * dt) % 1.0;
    }

    // 10. Update ambient roadside particles
    this.updateAmbientParticles(dt, musicParams);
  }

  private updateAmbientParticles(dt: number, musicParams: WorldMusicParameters): void {
    // Spawn ambient sparks & neon speed streaks driven by treble and energy
    if (musicParams.particleDensity > 0.15 && this.rng.boolean(musicParams.particleDensity * 0.8)) {
      const isLeft = this.rng.boolean();
      const offset = isLeft ? -this.rng.range(950, 1750) : this.rng.range(950, 1750);
      const spawnZ = this.state.player.z + this.rng.range(80, 700);
      this.ambientParticles.push({
        x: this.road.getCurveAt(spawnZ) + offset,
        y: this.road.getElevationAt(spawnZ) + this.rng.range(10, 240),
        z: spawnZ,
        char: this.rng.choice(['*', '•', '·', '¤', '+', '✦']),
        color: this.rng.choice(['#38bdf8', '#f43f5e', '#ec4899', '#fbbf24', '#34d399', '#a855f7']),
        vx: (this.rng.next() - 0.5) * 60,
        vy: this.rng.range(30, 90),
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
    const horizonRow = Math.floor(height * 0.42);

    const palette = this.state.biomeBlend.blendedPalette;
    const dayNight = this.state.dayNight;
    const glow = this.state.musicParams.environmentalGlow;

    // 1. SKY RENDERING (Gradients, Clouds, Stars, Sun/Moon)
    this.renderSky(frameBuffer, width, horizonRow, palette, dayNight, glow);

    // 2. PARALLAX HORIZON & MOUNTAIN SILHOUETTES
    this.renderHorizonSilhouettes(frameBuffer, width, horizonRow, palette, dayNight);

    // 3. PROCEDURAL GROUND RENDERING
    this.renderGround(frameBuffer, width, height, horizonRow, palette, dayNight);

    // 4. OUTRUN-STYLE PSEUDO-3D ROAD SCANLINES
    this.renderRoad(frameBuffer, width, height, horizonRow, palette, dayNight);

    // 5. DEPTH-SORTED SCENERY & TRAFFIC RENDERING
    this.depthSorter.clear();

    // Add scenery objects
    for (const obj of this.director.getScenery()) {
      const relZ = obj.z - this.state.camera.z;
      if (relZ > 10 && relZ < 1150) {
        const proj = Perspective.project(obj.x, this.road.getElevationAt(obj.z), obj.z, this.state.camera, width, height);
        if (proj.visible) {
          // Night lighting factor for scenery
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
        const proj = Perspective.project(vehicle.x, this.road.getElevationAt(vehicle.z), vehicle.z, this.state.camera, width, height);
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

    // Add Player Protagonist Vehicle
    const playerRelZ = this.state.player.z - this.state.camera.z;
    const playerElevation = this.road.getElevationAt(this.state.player.z);
    const playerProj = Perspective.project(
      this.state.player.x,
      playerElevation,
      this.state.player.z,
      this.state.camera,
      width,
      height
    );

    if (playerProj.visible) {
      const isRecovering = this.state.player.collisionCooldown > 0;
      const isBraking = this.state.player.driverState === 'BRAKING';
      let playerColor = this.state.player.sprite.defaultColor;

      if (isRecovering) {
        playerColor = '#f43f5e';
      } else if (isBraking) {
        playerColor = '#fb7185';
      }

      this.depthSorter.add({
        screenX: playerProj.screenX,
        screenY: playerProj.screenY,
        z: playerRelZ,
        sprite: this.state.player.sprite,
        colorOverride: playerColor,
      });
    }

    // Render all sorted entities with space transparency and LOD!
    this.depthSorter.render(frameBuffer);

    // 6. AMBIENT PARTICLES
    for (const p of this.ambientParticles) {
      const proj = Perspective.project(p.x, p.y, p.z, this.state.camera, width, height);
      if (proj.visible) {
        frameBuffer.setCell(proj.screenX, proj.screenY, p.char, p.color, proj.depth, undefined, true);
      }
    }

    // 7. RESPONSIVE WEATHER PARTICLES
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
      const skyChar = t > 0.82 ? '░' : (t > 0.60 ? ' ' : ' ');
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

    // Dual-Layer Horizon (Distant Range + Near Range)
    for (let x = 0; x < width; x++) {
      const worldCol = (x + camXOffset + width * 10) % width;

      // Tier 1: Distant majestic peaks / skyline
      let h1: number;
      if (biome.id === 'NEON_CITY') {
        // Skyscraper skyline pattern
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

  private renderRoad(
    fb: FrameBuffer,
    width: number,
    height: number,
    horizonRow: number,
    palette: typeof this.state.biomeBlend.blendedPalette,
    dayNight: typeof this.state.dayNight
  ): void {
    const visibleSegments = this.road.getVisibleSegments(this.state.camera.z, 1000);
    const halfWidth = this.road.defaultRoadWidth * 0.5;
    const isNight = dayNight.phase === 'NIGHT';
    const playerZ = this.state.player.z;
    const beatPulse = this.state.musicParams.fovPulse > 0.1;

    // Render road segments back-to-front (furthest to closest)
    for (let i = visibleSegments.length - 1; i >= 0; i--) {
      const seg = visibleSegments[i];
      const relZ = seg.z - this.state.camera.z;
      if (relZ <= 5) continue;

      const pCenter = Perspective.project(seg.curve, seg.elevation, seg.z, this.state.camera, width, height);
      const pLeft = Perspective.project(seg.curve - halfWidth, seg.elevation, seg.z, this.state.camera, width, height);
      const pRight = Perspective.project(seg.curve + halfWidth, seg.elevation, seg.z, this.state.camera, width, height);

      if (!pCenter.visible && !pLeft.visible && !pRight.visible) continue;

      const y = Math.round(pCenter.screenY);
      if (y < horizonRow || y >= height) continue;

      const xL = Math.round(pLeft.screenX);
      const xR = Math.round(pRight.screenX);
      const roadSpan = xR - xL;
      if (roadSpan <= 0) continue;

      // 1. Dual-Tone Alternating OutRun Tarmac Stripe
      const isAltTarmac = Math.floor(seg.z / (this.road.segmentLength * 2)) % 2 === 0;
      const baseRoadColor = isAltTarmac
        ? palette.road
        : ColorPalette.scaleBrightness(palette.road, 1.25);

      // Night Headlight illumination cone in front of player
      let headlightFactor = 1.0;
      if (isNight) {
        const distFromPlayer = seg.z - playerZ;
        if (distFromPlayer > 0 && distFromPlayer < 380) {
          headlightFactor = 1.0 + (1.0 - distFromPlayer / 380) * 1.5;
        } else {
          headlightFactor = 0.55;
        }
      }

      const depthFactor = Math.min(1.0, relZ / 950);
      const roadColor = ColorPalette.applyFog(
        ColorPalette.scaleBrightness(baseRoadColor, headlightFactor),
        palette.fog,
        depthFactor * 0.5
      );
      const shoulderColor = ColorPalette.applyFog(palette.roadShoulder, palette.fog, depthFactor * 0.5);
      const markingColor = beatPulse
        ? '#ffffff'
        : ColorPalette.applyFog(palette.roadMarking, palette.fog, depthFactor * 0.4);

      // 2. High-Impact Two-Stage Rumble Curbs (█▓▒░)
      const curbWidth = Math.max(2, Math.round(roadSpan * 0.06));
      const rumblePattern = Math.floor(seg.z / this.road.segmentLength) % 2 === 0;
      const curbChar = rumblePattern ? '█' : '▒';
      const curbColor = rumblePattern ? shoulderColor : ColorPalette.scaleBrightness(shoulderColor, 1.5);

      for (let x = xL - curbWidth; x <= xL; x++) {
        fb.setCell(x, y, curbChar, curbColor, relZ, undefined, false);
      }
      for (let x = xR; x <= xR + curbWidth; x++) {
        fb.setCell(x, y, curbChar, curbColor, relZ, undefined, false);
      }

      // 3. Asphalt Surface Texture
      const tarmacChar = isAltTarmac ? '=' : '-';
      for (let x = xL + 1; x < xR; x++) {
        fb.setCell(x, y, tarmacChar, roadColor, relZ, undefined, false);
      }

      // 4. Multi-Lane Dashed Markings
      const isDashed = Math.floor(seg.z / this.road.segmentLength) % 2 === 0;
      if (isDashed) {
        const lane1X = Math.round(xL + roadSpan * 0.33);
        const lane2X = Math.round(xL + roadSpan * 0.66);
        fb.setCell(lane1X, y, '║', markingColor, relZ - 1, undefined, false);
        fb.setCell(lane2X, y, '║', markingColor, relZ - 1, undefined, false);
      }
    }
  }
}
