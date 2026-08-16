import { SeededRandom } from '../../procedural/SeededRandom';
import { ColorPalette } from '../../ascii/ColorPalette';
import { FrameBuffer } from '../../ascii/FrameBuffer';
import { WeatherParticle, WeatherState } from '../types';
import { WeatherType } from './SkyTypes';

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
  private weatherHoldDuration: number = 60.0; // Minimum time before natural weather shift

  private particles: WeatherParticle[] = [];
  private lightning: LightningEvent = {
    active: false,
    frameCounter: 0,
    durationFrames: 2,
    boltSilhouetteIndex: 0,
    boltX: 0,
  };
  private nextLightningTime: number = 0;

  // 3 Distinct Jagged ASCII Lightning Bolt Silhouettes (Height ~10-12)
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

  public setTargetWeather(target: WeatherType, immediate: boolean = false): void {
    if (immediate) {
      this.currentWeather = target;
      this.targetWeather = target;
      this.transitionProgress = 1.0;
      this.particles = [];
      return;
    }

    if (this.targetWeather !== target) {
      this.targetWeather = target;
      this.transitionProgress = 0.0;
    }
  }

  /**
   * Updates natural weather persistence, transitions, and particle physics.
   */
  public update(
    dt: number,
    worldTime: number,
    screenWidth: number,
    screenHeight: number,
    autoCycle: boolean = true
  ): void {
    // 1. Weather transition interpolation
    if (this.transitionProgress < 1.0) {
      this.transitionProgress = Math.min(1.0, this.transitionProgress + dt / this.transitionDuration);
      if (this.transitionProgress >= 1.0) {
        this.currentWeather = this.targetWeather;
      }
    }

    // 2. Natural weather timer cycle (when autoCycle is true)
    if (autoCycle) {
      this.weatherTimer += dt;
      if (this.weatherTimer >= this.weatherHoldDuration && this.transitionProgress >= 1.0) {
        this.weatherTimer = 0;
        this.weatherHoldDuration = this.rng.range(45.0, 90.0);
      }
    }

    // 3. Lightning Flash Logic in THUNDERSTORM
    const isThunderstorm = this.currentWeather === 'THUNDERSTORM' || (this.targetWeather === 'THUNDERSTORM' && this.transitionProgress > 0.4);
    if (isThunderstorm) {
      if (this.lightning.active) {
        this.lightning.frameCounter++;
        if (this.lightning.frameCounter >= this.lightning.durationFrames) {
          this.lightning.active = false;
          this.nextLightningTime = worldTime + this.rng.range(5.0, 14.0);
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

    // 4. Update Particle Physics
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
        targetParticleCount = 45;
        break;
      case 'BLIZZARD':
        targetParticleCount = 85;
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
    let speedX = 0;
    let speedY = 20;

    if (type === 'LIGHT_RAIN') {
      char = this.rng.choice(['|', '/', '|']);
      color = '#38bdf8';
      speedX = -4;
      speedY = 28;
    } else if (type === 'HEAVY_RAIN' || type === 'THUNDERSTORM') {
      char = this.rng.choice(['|', '/', '|', '\\']);
      color = '#0284c7';
      speedX = -8;
      speedY = 40;
    } else if (type === 'SNOW') {
      char = this.rng.choice(['*', '·', '.']);
      color = '#e2e8f0';
      speedX = this.rng.range(-3, 3);
      speedY = 6;
    } else if (type === 'BLIZZARD') {
      char = this.rng.choice(['*', '·', 'x']);
      color = '#ffffff';
      speedX = this.rng.range(-15, -6);
      speedY = 16;
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
    // 1. Render Lightning Bolt (behind terrestrial objects, at sky z-order)
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
