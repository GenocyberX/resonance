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
  private stars: { xNorm: number; yNorm: number; char: string; brightness: number }[] = [];

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
  }

  private initStars(): void {
    this.stars = [];
    const starChars = ['.', '*', '+', '°', '·'];
    for (let i = 0; i < 80; i++) {
      this.stars.push({
        xNorm: this.rng.next(),
        yNorm: this.rng.range(0.02, 0.40),
        char: this.rng.choice(starChars),
        brightness: this.rng.range(0.4, 1.0),
      });
    }
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
  public update(dt: number, musicParams: WorldMusicParameters): void {
    this.state.worldTime += dt;
    this.state.musicParams = musicParams;

    // 1. Update Day / Night & Biome transitions
    this.state.dayNight = this.dayNightCycle.update(dt);
    this.state.biomeBlend = this.biomeSystem.evaluate(this.state.player.z);

    // 2. Weather update
    this.weatherEngine.updateBiomeWeather(this.state.biomeBlend.currentBiome.id, musicParams.tension);
    this.state.weather = this.weatherEngine.update(dt, 120, 42);

    // 3. Modulate road with tension
    this.road.setTension(musicParams.tension);

    // 4. Autonomous driving
    const allEntities = [...this.traffic.getVehicles(), ...this.director.getScenery()];
    this.driver.update(dt, this.state.player, allEntities, this.road, musicParams.targetSpeedBonus);

    // 5. Update player vehicle
    const playerRoadCurve = this.road.getCurveAt(this.state.player.z);
    this.state.player.update(dt, playerRoadCurve);
    this.state.distance = this.state.player.z;

    // 6. Collision detection & physical resolution
    const collisionEvents = this.collisions.checkCollisions(this.state.player, allEntities);
    for (const evt of collisionEvents) {
      this.state.cameraShake = Math.max(this.state.cameraShake, evt.cameraShakeAmount);
    }

    // 7. Update camera follow
    const camZ = this.state.player.z - 170;
    const camX = this.road.getCurveAt(camZ) + this.state.player.lateralOffset * 0.75;
    const camElevation = this.road.getElevationAt(camZ);
    const shakeOffset = (this.rng.next() - 0.5) * this.state.cameraShake * 20;

    this.state.camera.z = camZ;
    this.state.camera.x = camX;
    this.state.camera.y = 520 + camElevation + musicParams.cameraBounce + shakeOffset;
    this.state.camera.fovPulse = musicParams.fovPulse;

    // Camera shake decay
    if (this.state.cameraShake > 0) {
      this.state.cameraShake = Math.max(0, this.state.cameraShake - dt * 2.5);
    }

    // 8. Update ambient traffic and scenery
    this.traffic.update(dt, this.state.player, playerRoadCurve);
    this.director.update(this.state.camera.z, this.road, 1200);

    // 9. Update ambient roadside particles
    this.updateAmbientParticles(dt, musicParams);
  }

  private updateAmbientParticles(dt: number, musicParams: WorldMusicParameters): void {
    // Spawn ambient roadside sparks / neon particles based on music
    if (musicParams.particleDensity > 0.2 && this.rng.boolean(musicParams.particleDensity * 0.6)) {
      const isLeft = this.rng.boolean();
      const offset = isLeft ? -this.rng.range(900, 1600) : this.rng.range(900, 1600);
      const spawnZ = this.state.player.z + this.rng.range(100, 600);
      this.ambientParticles.push({
        x: this.road.getCurveAt(spawnZ) + offset,
        y: this.road.getElevationAt(spawnZ) + this.rng.range(10, 200),
        z: spawnZ,
        char: this.rng.choice(['*', '•', '.', '+', '¤']),
        color: this.rng.choice(['#38bdf8', '#f43f5e', '#ec4899', '#fbbf24', '#34d399']),
        vx: (this.rng.next() - 0.5) * 50,
        vy: this.rng.range(20, 80),
        vz: -this.state.player.speed * 0.2,
        life: this.rng.range(0.8, 1.8),
        maxLife: 1.8,
      });
    }

    // Update particle lifespans
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

    // 1. SKY RENDERING
    this.renderSky(frameBuffer, width, horizonRow, palette, dayNight);

    // 2. MOUNTAIN SILHOUETTE
    this.renderMountains(frameBuffer, width, horizonRow, palette);

    // 3. GROUND RENDERING
    this.renderGround(frameBuffer, width, height, horizonRow, palette);

    // 4. ROAD SCANLINE RENDERING
    this.renderRoad(frameBuffer, width, height, horizonRow, palette);

    // 5. DEPTH-SORTED SCENERY & TRAFFIC RENDERING
    this.depthSorter.clear();

    // Add scenery objects
    for (const obj of this.director.getScenery()) {
      const relZ = obj.z - this.state.camera.z;
      if (relZ > 10 && relZ < 1100) {
        const proj = Perspective.project(obj.x, this.road.getElevationAt(obj.z), obj.z, this.state.camera, width, height);
        if (proj.visible) {
          this.depthSorter.add({
            screenX: proj.screenX,
            screenY: proj.screenY,
            z: relZ,
            sprite: obj.sprite,
            colorOverride: obj.colorOverride,
          });
        }
      }
    }

    // Add traffic vehicles
    for (const vehicle of this.traffic.getVehicles()) {
      const relZ = vehicle.z - this.state.camera.z;
      if (relZ > 10 && relZ < 1100) {
        const proj = Perspective.project(vehicle.x, this.road.getElevationAt(vehicle.z), vehicle.z, this.state.camera, width, height);
        if (proj.visible) {
          this.depthSorter.add({
            screenX: proj.screenX,
            screenY: proj.screenY,
            z: relZ,
            sprite: vehicle.sprite,
            colorOverride: vehicle.colorOverride,
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
      this.depthSorter.add({
        screenX: playerProj.screenX,
        screenY: playerProj.screenY,
        z: playerRelZ,
        sprite: this.state.player.sprite,
        colorOverride: this.state.player.collisionCooldown > 0 ? '#f43f5e' : undefined,
      });
    }

    // Render all sorted entities with space transparency and LOD!
    this.depthSorter.render(frameBuffer);

    // 6. AMBIENT PARTICLES
    for (const p of this.ambientParticles) {
      const proj = Perspective.project(p.x, p.y, p.z, this.state.camera, width, height);
      if (proj.visible) {
        frameBuffer.setCell(proj.screenX, proj.screenY, p.char, p.color, proj.depth);
      }
    }

    // 7. WEATHER PARTICLES
    for (const p of this.state.weather.particles) {
      frameBuffer.setCell(p.x, p.y, p.char, p.color, 5);
    }
  }

  private renderSky(
    fb: FrameBuffer,
    width: number,
    horizonRow: number,
    palette: typeof this.state.biomeBlend.blendedPalette,
    dayNight: typeof this.state.dayNight
  ): void {
    const skyTop = ColorPalette.lerp(palette.skyTop, dayNight.blendedSkyTop, 0.7);
    const skyBottom = ColorPalette.lerp(palette.skyBottom, dayNight.blendedSkyBottom, 0.6);

    for (let y = 0; y < horizonRow; y++) {
      const t = y / horizonRow;
      const rowColor = ColorPalette.lerp(skyTop, skyBottom, t);
      // Subtle gradient shading characters
      const skyChar = t > 0.85 ? '░' : (t > 0.65 ? ' ' : ' ');
      for (let x = 0; x < width; x++) {
        fb.setCell(x, y, skyChar, rowColor, 10000);
      }
    }

    // Stars at night / twilight
    if (dayNight.starIntensity > 0.05) {
      for (const star of this.stars) {
        const starX = Math.floor(star.xNorm * width);
        const starY = Math.floor(star.yNorm * horizonRow);
        const brightness = star.brightness * dayNight.starIntensity;
        if (brightness > 0.2) {
          const starColor = ColorPalette.scaleBrightness('#ffffff', brightness);
          fb.setCell(starX, starY, star.char, starColor, 9990);
        }
      }
    }

    // Sun / Moon Disc
    const celestialY = Math.floor(horizonRow * (1.0 - dayNight.sunElevation * 0.75));
    const celestialX = Math.floor(width * 0.5 + Math.sin(this.state.worldTime * 0.02) * width * 0.2);

    if (celestialY >= 2 && celestialY < horizonRow - 1) {
      const isNight = dayNight.phase === 'NIGHT';
      const disc = isNight
        ? [' (O) ', '((#))', ' (O) ']
        : [' \\|/ ', '--*--', ' /|\\ '];
      const color = dayNight.sunColor;

      for (let r = 0; r < disc.length; r++) {
        const rowText = disc[r];
        for (let c = 0; c < rowText.length; c++) {
          const ch = rowText[c];
          if (ch !== ' ') {
            fb.setCell(celestialX - 2 + c, celestialY - 1 + r, ch, color, 9950);
          }
        }
      }
    }
  }

  private renderMountains(
    fb: FrameBuffer,
    width: number,
    horizonRow: number,
    palette: typeof this.state.biomeBlend.blendedPalette
  ): void {
    const mountainChar = this.state.biomeBlend.currentBiome.mountainChar || '^';
    const mountainColor = palette.mountains;
    const camXOffset = (this.state.camera.x * 0.015) % width;

    for (let x = 0; x < width; x++) {
      const worldCol = (x + camXOffset + width * 10) % width;
      const h1 = Math.sin(worldCol * 0.08) * 3.5;
      const h2 = Math.sin(worldCol * 0.22) * 1.8;
      const totalH = Math.max(1, Math.floor(h1 + h2 + 4));

      for (let dy = 0; dy < totalH; dy++) {
        const my = horizonRow - 1 - dy;
        if (my >= 0 && my < horizonRow) {
          fb.setCell(x, my, dy === totalH - 1 ? '^' : mountainChar, mountainColor, 9000);
        }
      }
    }
  }

  private renderGround(
    fb: FrameBuffer,
    width: number,
    height: number,
    horizonRow: number,
    palette: typeof this.state.biomeBlend.blendedPalette
  ): void {
    const groundChar = this.state.biomeBlend.currentBiome.groundChar || '.';
    const groundBaseColor = palette.ground;
    const groundDetailColor = palette.groundDetail;

    for (let y = horizonRow; y < height; y++) {
      const depthFactor = (y - horizonRow) / (height - horizonRow);
      const rowColor = ColorPalette.lerp(palette.horizon, groundBaseColor, depthFactor);

      for (let x = 0; x < width; x++) {
        // Procedural ground speckles
        const isDetail = ((x * 7 + y * 13 + Math.floor(this.state.player.z * 0.05)) % 11) === 0;
        const char = isDetail ? groundChar : ' ';
        const charColor = isDetail ? groundDetailColor : rowColor;
        fb.setCell(x, y, char, charColor, 8000 - (y - horizonRow) * 100);
      }
    }
  }

  private renderRoad(
    fb: FrameBuffer,
    width: number,
    height: number,
    horizonRow: number,
    palette: typeof this.state.biomeBlend.blendedPalette
  ): void {
    const visibleSegments = this.road.getVisibleSegments(this.state.camera.z, 1000);
    const halfWidth = this.road.defaultRoadWidth * 0.5;

    // Render road segments from furthest to closest (descending Z)
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

      // Color fog fading with depth
      const depthFactor = Math.min(1.0, relZ / 950);
      const roadColor = ColorPalette.applyFog(palette.road, palette.fog, depthFactor * 0.6);
      const shoulderColor = ColorPalette.applyFog(palette.roadShoulder, palette.fog, depthFactor * 0.6);
      const markingColor = ColorPalette.applyFog(palette.roadMarking, palette.fog, depthFactor * 0.5);

      // 1. Shoulders / Rumble strips
      const shoulderWidth = Math.max(1, Math.round(roadSpan * 0.05));
      const rumblePattern = Math.floor(seg.z * 0.1) % 2 === 0;
      const shoulderChar = rumblePattern ? '|' : ':';

      for (let x = xL - shoulderWidth; x <= xL; x++) {
        fb.setCell(x, y, shoulderChar, shoulderColor, relZ);
      }
      for (let x = xR; x <= xR + shoulderWidth; x++) {
        fb.setCell(x, y, shoulderChar, shoulderColor, relZ);
      }

      // 2. Road asphalt surface
      for (let x = xL + 1; x < xR; x++) {
        fb.setCell(x, y, '=', roadColor, relZ);
      }

      // 3. Lane dashed markings
      const isDashed = Math.floor(seg.z * 0.05) % 2 === 0;
      if (isDashed) {
        const lane1X = Math.round(xL + roadSpan * 0.33);
        const lane2X = Math.round(xL + roadSpan * 0.66);
        fb.setCell(lane1X, y, '|', markingColor, relZ - 1);
        fb.setCell(lane2X, y, '|', markingColor, relZ - 1);
      }
    }
  }
}
