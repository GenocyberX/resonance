import { SeededRandom } from '../../procedural/SeededRandom';
import { ColorPalette } from '../../ascii/ColorPalette';
import { FrameBuffer } from '../../ascii/FrameBuffer';
import { BiomeId, WeatherParticle, WeatherState } from '../types';
import { SpecialSkyEvent, WeatherType, WorldWindState } from './SkyTypes';

export interface LightningEvent {
  active: boolean;
  frameCounter: number;
  durationFrames: number;
  boltSilhouetteIndex: number;
  boltX: number; // Screen X
}

export class WeatherManager {
  private rng: SeededRandom;
  private currentWeather: WeatherType = 'CLEAR';
  private targetWeather: WeatherType = 'CLEAR';
  private transitionProgress: number = 1.0; // 1.0 = fully at targetWeather
  private transitionDuration: number = 20.0; // In seconds
  private weatherTimer: number = 0;
  private weatherHoldDuration: number = 60.0;

  private roadWetness: number = 0.0; // [0.0, 1.0] (accumulates during rain, dries post-rain)
  private wind: WorldWindState = { direction: 0.0, strength: 0.0 };

  private activeSpecialEvent: SpecialSkyEvent = 'NONE';
  private specialEventIntensity: number = 0.0;

  private particles: WeatherParticle[] = [];
  private lightning: LightningEvent = {
    active: false,
    frameCounter: 0,
    durationFrames: 2,
    boltSilhouetteIndex: 0,
    boltX: 0,
  };
  private nextLightningTime: number = 0;

  // 3 Distinct Jagged ASCII Lightning Bolt Silhouettes
  private static readonly LIGHTNING_BOLTS: string[][] = [
    [
      '   /\\   ',
      '  /  \\  ',
      '  \\   \\ ',
      '   \\_  \\',
      '     \\  \\',
      '    /  / ',
      '   /  /  ',
      '  /  /   ',
      '  \\_/    ',
      '   /     ',
      '  /      ',
    ],
    [
      '     /\\  ',
      '    /  \\ ',
      '   / /\\ \\',
      '  /_/  \\ \\',
      '      /  /',
      '     /  / ',
      '    /  /  ',
      '   /_ /   ',
      '    /     ',
      '   /      ',
    ],
    [
      '  /\\     ',
      ' /  \\    ',
      ' \\   \\   ',
      '  \\   \\  ',
      '  /  /   ',
      ' / _/    ',
      '/ /      ',
      '\\ \\      ',
      ' \\_\\     ',
      '   /     ',
    ],
  ];

  // Biome Weather Personality & Probability Distributions
  private static readonly BIOME_WEATHER_TABLE: Record<BiomeId, { type: WeatherType; weight: number }[]> = {
    TROPICAL: [
      { type: 'CLEAR', weight: 45 },
      { type: 'CLOUDY', weight: 25 },
      { type: 'LIGHT_RAIN', weight: 20 },
      { type: 'THUNDERSTORM', weight: 10 },
    ],
    FOREST: [
      { type: 'CLOUDY', weight: 35 },
      { type: 'FOG', weight: 30 },
      { type: 'LIGHT_RAIN', weight: 25 },
      { type: 'THUNDERSTORM', weight: 10 },
    ],
    DESERT: [
      { type: 'CLEAR', weight: 55 },
      { type: 'CLOUDY', weight: 25 },
      { type: 'HEAT_HAZE', weight: 15 },
      { type: 'THUNDERSTORM', weight: 5 },
    ],
    ALPINE: [
      { type: 'CLEAR', weight: 30 },
      { type: 'CLOUDY', weight: 30 },
      { type: 'SNOW', weight: 25 },
      { type: 'BLIZZARD', weight: 15 },
    ],
    NEON_CITY: [
      { type: 'CLEAR', weight: 30 },
      { type: 'CLOUDY', weight: 30 },
      { type: 'LIGHT_RAIN', weight: 25 },
      { type: 'NEON_MIST', weight: 15 },
    ],
    VOLCANIC: [
      { type: 'CLEAR', weight: 20 },
      { type: 'VOLCANIC_ASH', weight: 50 },
      { type: 'HEAT_HAZE', weight: 30 },
    ],
  };

  constructor(seed: number) {
    this.rng = new SeededRandom(seed ^ 0x5a827999);
  }

  public getCurrentWeather(): WeatherType {
    return this.currentWeather;
  }

  public getTargetWeather(): WeatherType {
    return this.targetWeather;
  }

  public getTransitionProgress(): number {
    return this.transitionProgress;
  }

  public getRoadWetness(): number {
    return this.roadWetness;
  }

  public getWind(): WorldWindState {
    return this.wind;
  }

  public getActiveSpecialEvent(): SpecialSkyEvent {
    return this.activeSpecialEvent;
  }

  public getSpecialEventIntensity(): number {
    return this.specialEventIntensity;
  }

  public setSpecialEvent(event: SpecialSkyEvent, intensity: number = 1.0): void {
    // Enforce exclusivity: only 1 major celestial event active
    this.activeSpecialEvent = event;
    this.specialEventIntensity = event !== 'NONE' ? intensity : 0.0;
  }

  public setTargetWeather(target: WeatherType, immediate: boolean = false): void {
    if (immediate) {
      this.currentWeather = target;
      this.targetWeather = target;
      this.transitionProgress = 1.0;
      this.particles = [];
      if (target === 'LIGHT_RAIN' || target === 'HEAVY_RAIN' || target === 'THUNDERSTORM') {
        this.roadWetness = 1.0;
      }
      return;
    }

    if (this.targetWeather !== target) {
      this.targetWeather = target;
      this.transitionProgress = 0.0;
    }
  }

  /**
   * Updates natural weather persistence, transitions, road wetness lifecycle, and particle physics.
   */
  public update(
    dt: number,
    worldTime: number,
    screenWidth: number,
    screenHeight: number,
    biomeId: BiomeId,
    autoCycle: boolean = true
  ): void {
    // 1. Weather transition interpolation
    if (this.transitionProgress < 1.0) {
      this.transitionProgress = Math.min(1.0, this.transitionProgress + dt / this.transitionDuration);
      if (this.transitionProgress >= 1.0) {
        this.currentWeather = this.targetWeather;
      }
    }

    // 2. Natural weather timer cycle with biome personality
    if (autoCycle) {
      this.weatherTimer += dt;
      if (this.weatherTimer >= this.weatherHoldDuration && this.transitionProgress >= 1.0) {
        this.weatherTimer = 0;
        this.weatherHoldDuration = this.rng.range(45.0, 90.0);

        // Select next weather from biome probability distribution
        const table = WeatherManager.BIOME_WEATHER_TABLE[biomeId] || WeatherManager.BIOME_WEATHER_TABLE.TROPICAL;
        const totalWeight = table.reduce((sum, item) => sum + item.weight, 0);
        let roll = this.rng.range(0, totalWeight);
        let selected = table[0].type;
        for (const item of table) {
          if (roll < item.weight) {
            selected = item.type;
            break;
          }
          roll -= item.weight;
        }
        this.setTargetWeather(selected, false);
      }
    }

    // 3. World Wind Calculation
    const isBlizzard = this.currentWeather === 'BLIZZARD' || this.targetWeather === 'BLIZZARD';
    const isStorm = this.currentWeather === 'THUNDERSTORM' || this.targetWeather === 'THUNDERSTORM';
    if (isBlizzard) {
      this.wind = { direction: -0.75, strength: 0.85 };
    } else if (isStorm) {
      this.wind = { direction: -0.45, strength: 0.60 };
    } else if (this.currentWeather === 'SNOW') {
      this.wind = { direction: -0.15, strength: 0.25 };
    } else if (this.currentWeather === 'LIGHT_RAIN' || this.currentWeather === 'HEAVY_RAIN') {
      this.wind = { direction: -0.25, strength: 0.40 };
    } else {
      this.wind = { direction: 0.05, strength: 0.10 };
    }

    // 4. Road Wetness Lifecycle (Accumulates during rain/storm; persists and slowly dries post-rain)
    const isRaining = this.currentWeather === 'LIGHT_RAIN' || this.currentWeather === 'HEAVY_RAIN' || this.currentWeather === 'THUNDERSTORM'
      || this.targetWeather === 'LIGHT_RAIN' || this.targetWeather === 'HEAVY_RAIN' || this.targetWeather === 'THUNDERSTORM';

    if (isRaining) {
      this.roadWetness = Math.min(1.0, this.roadWetness + dt * 0.15); // Wet within ~7s
    } else {
      this.roadWetness = Math.max(0.0, this.roadWetness - dt * 0.05); // Dries over ~20s
    }

    // 5. Lightning Flash Logic in THUNDERSTORM
    if (isStorm) {
      if (this.lightning.active) {
        this.lightning.frameCounter++;
        if (this.lightning.frameCounter >= this.lightning.durationFrames) {
          this.lightning.active = false;
          this.nextLightningTime = worldTime + this.rng.range(6.0, 15.0);
        }
      } else if (worldTime >= this.nextLightningTime) {
        this.lightning.active = true;
        this.lightning.frameCounter = 0;
        this.lightning.durationFrames = this.rng.rangeInt(2, 3);
        this.lightning.boltSilhouetteIndex = this.rng.rangeInt(0, WeatherManager.LIGHTNING_BOLTS.length - 1);
        this.lightning.boltX = this.rng.rangeInt(Math.floor(screenWidth * 0.15), Math.floor(screenWidth * 0.85));
      }
    } else {
      this.lightning.active = false;
    }

    // 6. Update Particle Physics (including 3-tier Snow)
    this.updateParticles(dt, screenWidth, screenHeight);
  }

  public isLightningActive(): boolean {
    return this.lightning.active;
  }

  public getWeatherDarkeningFactor(): number {
    const intensity = this.getEffectiveIntensity();
    const type = this.transitionProgress > 0.5 ? this.targetWeather : this.currentWeather;

    switch (type) {
      case 'CLEAR':
      case 'HEAT_HAZE':
        return 0.0;
      case 'CLOUDY':
        return 0.15 * intensity;
      case 'LIGHT_RAIN':
      case 'SNOW':
      case 'NEON_MIST':
        return 0.35 * intensity;
      case 'FOG':
      case 'VOLCANIC_ASH':
        return 0.45 * intensity;
      case 'HEAVY_RAIN':
      case 'BLIZZARD':
        return 0.65 * intensity;
      case 'THUNDERSTORM':
        return 0.85 * intensity;
      default:
        return 0.0;
    }
  }

  public getEffectiveIntensity(): number {
    return this.transitionProgress;
  }

  private updateParticles(dt: number, screenWidth: number, screenHeight: number): void {
    const activeType = this.targetWeather;
    let targetParticleCount = 0;

    switch (activeType) {
      case 'LIGHT_RAIN':
        targetParticleCount = 35;
        break;
      case 'HEAVY_RAIN':
      case 'THUNDERSTORM':
        targetParticleCount = 75;
        break;
      case 'SNOW':
        targetParticleCount = 50;
        break;
      case 'BLIZZARD':
        targetParticleCount = 90;
        break;
      case 'VOLCANIC_ASH':
        targetParticleCount = 30;
        break;
      case 'NEON_MIST':
        targetParticleCount = 25;
        break;
      case 'HEAT_HAZE':
        targetParticleCount = 15;
        break;
      default:
        targetParticleCount = 0;
        break;
    }

    // Spawn new particles
    if (this.particles.length < targetParticleCount) {
      this.spawnParticle(activeType, screenWidth, screenHeight);
    }

    // Update existing particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.speedX * dt;
      p.y += p.speedY * dt;
      p.life -= dt;

      if (p.life <= 0 || p.y > screenHeight || p.x < 0 || p.x > screenWidth) {
        this.particles.splice(i, 1);
      }
    }
  }

  private spawnParticle(type: WeatherType, screenWidth: number, screenHeight: number): void {
    let char = '.';
    let color = '#ffffff';
    let speedX = this.wind.direction * 12;
    let speedY = 20;

    if (type === 'LIGHT_RAIN') {
      char = this.rng.choice(['|', '/', '|']);
      color = '#38bdf8';
      speedX = -4 + this.wind.direction * 8;
      speedY = 28;
    } else if (type === 'HEAVY_RAIN' || type === 'THUNDERSTORM') {
      char = this.rng.choice(['|', '/', '|', '\\']);
      color = '#0284c7';
      speedX = -8 + this.wind.direction * 12;
      speedY = 40;
    } else if (type === 'SNOW') {
      // 3-Tier Snow Distribution: 60% far/small, 30% mid, 10% near/large
      const tierRoll = this.rng.next();
      if (tierRoll < 0.60) {
        char = '.';
        color = '#cbd5e1';
        speedY = 5;
      } else if (tierRoll < 0.90) {
        char = '·';
        color = '#e2e8f0';
        speedY = 8;
      } else {
        char = '*';
        color = '#ffffff';
        speedY = 12;
      }
      speedX = this.rng.range(-2, 2) + this.wind.direction * 6;
    } else if (type === 'BLIZZARD') {
      const tierRoll = this.rng.next();
      char = tierRoll < 0.5 ? '·' : (tierRoll < 0.85 ? '*' : 'x');
      color = '#ffffff';
      speedX = -18 + this.wind.direction * 10;
      speedY = 18;
    } else if (type === 'NEON_MIST') {
      char = this.rng.choice(['*', '.', '°']);
      color = this.rng.choice(['#ec4899', '#06b6d4', '#d946ef']);
      speedX = this.rng.range(-4, 4);
      speedY = 6;
    } else if (type === 'VOLCANIC_ASH') {
      char = this.rng.choice(['*', '.', ',']);
      color = this.rng.choice(['#ef4444', '#f97316', '#71717a']);
      speedX = this.rng.range(-6, 2);
      speedY = 10;
    } else if (type === 'HEAT_HAZE') {
      char = '~';
      color = '#fbbf24';
      speedX = this.rng.range(-2, 2);
      speedY = -4;
    }

    this.particles.push({
      x: this.rng.range(0, screenWidth),
      y: type === 'HEAT_HAZE' ? screenHeight * 0.5 + this.rng.range(0, 10) : 0,
      speedX,
      speedY,
      char,
      color,
      life: this.rng.range(1.5, 3.5),
    });
  }

  /**
   * Renders lightning bolts, fog bands, and weather precipitation.
   */
  public renderWeatherEffects(
    fb: FrameBuffer,
    width: number,
    horizonRow: number,
    screenHeight: number
  ): void {
    // 1. Render Lightning Bolt
    if (this.lightning.active) {
      const bolt = WeatherManager.LIGHTNING_BOLTS[this.lightning.boltSilhouetteIndex];
      const startX = this.lightning.boltX;
      const startY = Math.max(0, Math.floor(horizonRow * 0.15));

      for (let r = 0; r < bolt.length; r++) {
        const line = bolt[r];
        const py = startY + r;
        if (py >= horizonRow) break;

        for (let c = 0; c < line.length; c++) {
          const ch = line[c];
          if (ch !== ' ') {
            const px = (startX + c + width) % width;
            fb.setCell(px, py, ch, '#fef08a', 9960, '#ffffff', true);
          }
        }
      }
    }

    // 2. Render Layered Fog / Mist Bands
    const isFog = this.currentWeather === 'FOG' || this.targetWeather === 'FOG';
    if (isFog) {
      const fogRows = 4;
      for (let i = 0; i < fogRows; i++) {
        const fy = horizonRow - fogRows + i;
        if (fy >= 0 && fy < screenHeight) {
          const fogTint = ColorPalette.scaleBrightness('#cbd5e1', 0.5 + (i / fogRows) * 0.5);
          for (let x = 0; x < width; x += 2) {
            fb.setCell(x, fy, '░', fogTint, 9950, undefined, true);
          }
        }
      }
    }

    // 3. Render Precipitation Particles
    for (const p of this.particles) {
      const px = Math.floor(p.x);
      const py = Math.floor(p.y);
      if (px >= 0 && px < width && py >= 0 && py < screenHeight) {
        fb.setCell(px, py, p.char, p.color, 9940, undefined, true);
      }
    }
  }

  public toWeatherState(): WeatherState {
    return {
      type: this.currentWeather,
      intensity: this.getEffectiveIntensity(),
      particles: this.particles,
    };
  }
}
