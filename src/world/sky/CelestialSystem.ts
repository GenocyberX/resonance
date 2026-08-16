import { SeededRandom } from '../../procedural/SeededRandom';
import { ColorPalette } from '../../ascii/ColorPalette';
import { FrameBuffer } from '../../ascii/FrameBuffer';
import {
  DayPhase,
  MoonPhase,
  ShootingStarInstance,
  SpecialSkyEvent,
  StarInstance,
} from './SkyTypes';

export class CelestialSystem {
  private rng: SeededRandom;
  private stars: StarInstance[] = [];
  private shootingStars: ShootingStarInstance[] = [];
  private lastShootingStarTime: number = 0;

  // Synodic lunar period (simulated days per lunar cycle)
  public static readonly SYNODIC_MONTH_DAYS: number = 29.53;

  private static readonly MOON_PHASE_NAMES: MoonPhase[] = [
    'NEW_MOON',
    'WAXING_CRESCENT',
    'FIRST_QUARTER',
    'WAXING_GIBBOUS',
    'FULL_MOON',
    'WANING_GIBBOUS',
    'LAST_QUARTER',
    'WANING_CRESCENT',
  ];

  // Discrete ASCII art shapes for the 8 lunar phases (5x5 discs)
  private static readonly MOON_PHASE_SHAPES: Record<MoonPhase, string[]> = {
    NEW_MOON: [
      ' .-. ',
      '(: :)',
      '|   |',
      '(: :)',
      ' \'-\' ',
    ],
    WAXING_CRESCENT: [
      ' .-. ',
      '(  :)',
      '|  )|',
      '(  :)',
      ' \'-\' ',
    ],
    FIRST_QUARTER: [
      ' .-. ',
      '( |#)',
      '| |#|',
      '( |#)',
      ' \'-\' ',
    ],
    WAXING_GIBBOUS: [
      ' .-. ',
      '(##:)',
      '|###|',
      '(##:)',
      ' \'-\' ',
    ],
    FULL_MOON: [
      ' .-. ',
      '(###)',
      '|#o#|',
      '(###)',
      ' \'-\' ',
    ],
    WANING_GIBBOUS: [
      ' .-. ',
      '(:##)',
      '|###|',
      '(:##)',
      ' \'-\' ',
    ],
    LAST_QUARTER: [
      ' .-. ',
      '(#| )',
      '|#| |',
      '(#| )',
      ' \'-\' ',
    ],
    WANING_CRESCENT: [
      ' .-. ',
      '(:  )',
      '|(  |',
      '(:  )',
      ' \'-\' ',
    ],
  };

  // Sun shapes
  private static readonly SUN_SHAPES = {
    MIDDAY: [
      '   \\ | /   ',
      ' --.---.-- ',
      '---| * |---',
      ' --\'---\'-- ',
      '   / | \\   ',
    ],
    GOLDEN: [
      '  .-----.  ',
      ' / ===== \\ ',
      '| ======= |',
      ' \\ ===== / ',
      '  \'-----\'  ',
    ],
    LOW_HORIZON: [
      '  .-------.  ',
      ' / ======= \\ ',
      '| ========= |',
      '-------------',
    ],
  };

  constructor(seed: number) {
    this.rng = new SeededRandom(seed ^ 0x9e3779b9);
    this.initStarfield();
  }

  /**
   * Initializes a stable deterministic 128-star procedural field with 4-tier hierarchy and non-uniform clustering.
   */
  private initStarfield(): void {
    this.stars = [];
    const totalStars = 128;

    for (let i = 0; i < totalStars; i++) {
      // Non-uniform clustering: apply subtle sinusoidal density warping to avoid a uniform grid
      const rawX = this.rng.next();
      const clusterBias = Math.sin(rawX * Math.PI * 4) * 0.12;
      const xNorm = Math.max(0.01, Math.min(0.99, rawX + clusterBias));
      const yNorm = this.rng.range(0.01, 0.44); // Upper 44% of sky

      // Exact Hierarchy: 75% dim, 20% medium, 4% bright, 1% hero sparkle
      const roll = this.rng.next();
      let char: string;
      let tier: 'DIM' | 'MEDIUM' | 'BRIGHT' | 'HERO';
      let baseBrightness: number;

      if (roll < 0.75) {
        tier = 'DIM';
        char = '.';
        baseBrightness = this.rng.range(0.30, 0.55);
      } else if (roll < 0.95) {
        tier = 'MEDIUM';
        char = '*';
        baseBrightness = this.rng.range(0.60, 0.80);
      } else if (roll < 0.99) {
        tier = 'BRIGHT';
        char = '+';
        baseBrightness = this.rng.range(0.85, 0.95);
      } else {
        tier = 'HERO';
        char = this.rng.choice(['✦', '✧']);
        baseBrightness = 1.0;
      }

      this.stars.push({
        xNorm,
        yNorm,
        char,
        tier,
        baseBrightness,
        twinkleSpeed: this.rng.range(0.8, 2.2), // Slow, subtle twinkle
        twinkleOffset: this.rng.range(0, Math.PI * 2),
      });
    }
  }

  public getStars(): StarInstance[] {
    return this.stars;
  }

  /**
   * Evaluates the Moon's phase index [0..7] and phase name from simulated day count.
   */
  public getMoonPhaseAtDay(dayCount: number): {
    phase: MoonPhase;
    phaseIndex: number;
    phaseFraction: number; // [0, 1) across the 29.5-day synodic cycle
    moonlightFactor: number; // [0.15, 1.0]
  } {
    const cycleFraction = ((dayCount / CelestialSystem.SYNODIC_MONTH_DAYS) % 1.0 + 1.0) % 1.0;
    // Offset by 1/16 so that day 0 is the center of NEW_MOON, 0.25 is FIRST_QUARTER, 0.50 is FULL_MOON
    const shiftedFraction = (cycleFraction + 1 / 16) % 1.0;
    const phaseIndex = Math.floor(shiftedFraction * 8) % 8;
    const phase = CelestialSystem.MOON_PHASE_NAMES[phaseIndex];

    // Full moon is at index 4 (cycleFraction ~ 0.50)
    const distanceFromFull = Math.abs(cycleFraction - 0.5); // 0 at full, 0.5 at new
    const moonlightFactor = 0.15 + (0.5 - distanceFromFull) * 2 * 0.85; // 0.15 (new) -> 1.0 (full)

    return {
      phase,
      phaseIndex,
      phaseFraction: cycleFraction,
      moonlightFactor,
    };
  }

  /**
   * Calculates Sun trajectory across the diurnal cycle [0.0, 1.0).
   */
  public calculateSunPosition(normalizedDay: number): {
    elevation: number;    // [-1, 1] (-1 = nadir midnight, 0 = horizon, 1 = apex midday)
    headingNorm: number;  // [0, 1] horizontal position in sky
    visible: boolean;
    color: string;
  } {
    const daylightDuration = 0.70;
    const sunriseStart = 0.15;

    let elevation: number;
    let headingNorm: number;
    let visible = false;

    if (normalizedDay >= sunriseStart && normalizedDay <= sunriseStart + daylightDuration) {
      const progress = (normalizedDay - sunriseStart) / daylightDuration; // 0 (sunrise) -> 1 (sunset)
      elevation = Math.sin(progress * Math.PI); // 0 -> 1 -> 0
      headingNorm = 0.15 + progress * 0.70;    // 0.15 (east) -> 0.85 (west)
      visible = true;
    } else {
      const nightProgress = normalizedDay < sunriseStart
        ? (normalizedDay + (1.0 - (sunriseStart + daylightDuration))) / (1.0 - daylightDuration)
        : (normalizedDay - (sunriseStart + daylightDuration)) / (1.0 - daylightDuration);
      elevation = -Math.sin(nightProgress * Math.PI);
      headingNorm = 0.85 + nightProgress * 0.30;
      visible = false;
    }

    let color: string;
    if (elevation < 0.25) {
      color = ColorPalette.lerp('#ef4444', '#f97316', Math.max(0, elevation / 0.25));
    } else if (elevation < 0.60) {
      color = ColorPalette.lerp('#f97316', '#fde047', (elevation - 0.25) / 0.35);
    } else {
      color = ColorPalette.lerp('#fde047', '#fef08a', (elevation - 0.60) / 0.40);
    }

    return {
      elevation,
      headingNorm: headingNorm % 1.0,
      visible,
      color,
    };
  }

  /**
   * Calculates Moon trajectory across the nocturnal cycle.
   */
  public calculateMoonPosition(normalizedDay: number): {
    elevation: number;    // [-1, 1]
    headingNorm: number;  // [0, 1]
    visible: boolean;
  } {
    let nightProgress: number;
    let visible = false;

    if (normalizedDay >= 0.70) {
      nightProgress = (normalizedDay - 0.70) / 0.55;
      visible = true;
    } else if (normalizedDay <= 0.25) {
      nightProgress = (normalizedDay + 0.30) / 0.55;
      visible = true;
    } else {
      nightProgress = (normalizedDay - 0.25) / 0.45;
      visible = false;
    }

    const elevation = visible ? Math.sin(nightProgress * Math.PI) : -Math.sin(nightProgress * Math.PI);
    const headingNorm = ((0.20 + nightProgress * 0.60) % 1.0);

    return {
      elevation,
      headingNorm,
      visible: visible && elevation > 0.02,
    };
  }

  /**
   * Updates dynamic celestial events (e.g. shooting stars).
   */
  public update(
    dt: number,
    worldTime: number,
    isNight: boolean,
    cloudCoverageRatio: number,
    specialEvent: SpecialSkyEvent
  ): void {
    for (let i = this.shootingStars.length - 1; i >= 0; i--) {
      const star = this.shootingStars[i];
      star.progress += dt / star.duration;
      if (star.progress >= 1.0) {
        this.shootingStars.splice(i, 1);
      }
    }

    // Spawn shooting stars during clear nights
    const canSpawn = isNight && cloudCoverageRatio < 0.30;
    const isShower = specialEvent === 'METEOR_SHOWER';
    const interval = isShower ? 3.5 : 30.0;

    if (canSpawn && (worldTime - this.lastShootingStarTime > interval)) {
      this.lastShootingStarTime = worldTime;
      const startX = this.rng.range(0.1, 0.85);
      const startY = this.rng.range(0.02, 0.18);
      const length = this.rng.range(0.08, 0.18);
      const angle = this.rng.range(0.4, 0.85);

      this.shootingStars.push({
        startX,
        startY,
        endX: startX + Math.cos(angle) * length,
        endY: startY + Math.sin(angle) * length * 0.6,
        progress: 0,
        duration: this.rng.range(0.6, 1.2),
        color: isShower ? '#38bdf8' : '#fde047',
      });
    }
  }

  /**
   * Renders celestial stars, sun, moon, and shooting stars with cloud occlusion and organic halo.
   */
  public renderCelestialBodies(
    fb: FrameBuffer,
    width: number,
    horizonRow: number,
    worldTime: number,
    dayPhase: DayPhase,
    starVisibility: number,
    sunElev: number,
    sunHeading: number,
    sunVisible: boolean,
    sunColor: string,
    moonElev: number,
    moonHeading: number,
    moonVisible: boolean,
    moonPhase: MoonPhase,
    isOccluded: (x: number, y: number) => boolean,
    specialEvent: SpecialSkyEvent
  ): void {
    // 1. Render Stars
    if (starVisibility > 0.02) {
      for (const star of this.stars) {
        const sx = Math.floor(star.xNorm * width);
        const sy = Math.floor(star.yNorm * horizonRow);

        if (sy >= horizonRow || isOccluded(sx, sy)) continue;

        // Subtle slow twinkle (0.8 - 1.0)
        const twinkle = 0.82 + 0.18 * Math.sin(worldTime * star.twinkleSpeed + star.twinkleOffset);
        const brightness = star.baseBrightness * starVisibility * twinkle;

        if (brightness > 0.18) {
          const starColor = ColorPalette.scaleBrightness('#ffffff', Math.min(1.0, brightness));
          fb.setCell(sx, sy, star.char, starColor, 9990, undefined, true);
        }
      }

      // Render active shooting stars
      for (const s of this.shootingStars) {
        const curX = Math.floor((s.startX + (s.endX - s.startX) * s.progress) * width);
        const curY = Math.floor((s.startY + (s.endY - s.startY) * s.progress) * horizonRow);

        if (curY < horizonRow && !isOccluded(curX, curY)) {
          fb.setCell(curX, curY, '✦', s.color, 9985, undefined, true);
          const tailX = Math.floor((s.startX + (s.endX - s.startX) * Math.max(0, s.progress - 0.2)) * width);
          const tailY = Math.floor((s.startY + (s.endY - s.startY) * Math.max(0, s.progress - 0.2)) * horizonRow);
          if (tailY < horizonRow) {
            fb.setCell(tailX, tailY, '·', ColorPalette.scaleBrightness(s.color, 0.4), 9986, undefined, true);
          }
        }
      }
    }

    // 2. Render Sun
    if (sunVisible && sunElev > 0.0) {
      const sunY = Math.floor(horizonRow * (1.0 - sunElev * 0.78));
      const sunX = Math.floor(sunHeading * width);

      const shape = (sunElev < 0.25)
        ? CelestialSystem.SUN_SHAPES.LOW_HORIZON
        : (dayPhase === 'GOLDEN_HOUR' || dayPhase === 'SUNRISE' || dayPhase === 'SUNSET'
            ? CelestialSystem.SUN_SHAPES.GOLDEN
            : CelestialSystem.SUN_SHAPES.MIDDAY);

      const halfW = Math.floor(shape[0].length / 2);
      const halfH = Math.floor(shape.length / 2);

      // Organic, irregular halo glow (prominent at Sunrise/Golden Hour/Sunset, minimal at Midday)
      const haloProminence = (dayPhase === 'GOLDEN_HOUR' || dayPhase === 'SUNRISE' || dayPhase === 'SUNSET') ? 1.0 : (sunElev < 0.4 ? 0.6 : 0.2);
      if (haloProminence > 0.1) {
        const offsets = [
          { dx: -halfW - 2, dy: 0, ch: '.' },
          { dx: halfW + 2, dy: 0, ch: '.' },
          { dx: 0, dy: -halfH - 1, ch: '.' },
          { dx: -halfW - 4, dy: -1, ch: '·' },
          { dx: halfW + 4, dy: 1, ch: '·' },
          { dx: -halfW - 1, dy: -halfH - 1, ch: '·' },
          { dx: halfW + 1, dy: -halfH - 1, ch: '·' },
        ];

        for (const o of offsets) {
          const hx = (sunX + o.dx + width) % width;
          const hy = sunY + o.dy;
          if (hy >= 0 && hy < horizonRow && !isOccluded(hx, hy)) {
            fb.setCell(hx, hy, o.ch, ColorPalette.scaleBrightness(sunColor, 0.4 * haloProminence), 9988, undefined, true);
          }
        }
      }

      // Render Sun disc
      for (let r = 0; r < shape.length; r++) {
        const line = shape[r];
        const py = sunY - halfH + r;
        if (py < 0 || py >= horizonRow) continue;

        for (let c = 0; c < line.length; c++) {
          const ch = line[c];
          if (ch !== ' ') {
            const px = (sunX - halfW + c + width) % width;
            if (!isOccluded(px, py)) {
              fb.setCell(px, py, ch, sunColor, 9980, undefined, true);
            }
          }
        }
      }
    }

    // 3. Render Moon
    if (moonVisible && moonElev > 0.0) {
      const moonY = Math.floor(horizonRow * (1.0 - moonElev * 0.75));
      const moonX = Math.floor(moonHeading * width);

      const shape = CelestialSystem.MOON_PHASE_SHAPES[moonPhase] || CelestialSystem.MOON_PHASE_SHAPES.FULL_MOON;
      const halfW = Math.floor(shape[0].length / 2);
      const halfH = Math.floor(shape.length / 2);

      const isLowMoon = specialEvent === 'LOW_FULL_MOON' && moonPhase === 'FULL_MOON';
      const moonColor = isLowMoon ? '#fde047' : '#e2e8f0';

      // Full Moon subtle lunar halo
      if (moonPhase === 'FULL_MOON') {
        const haloOffsets = [
          { dx: -halfW - 2, dy: 0 },
          { dx: halfW + 2, dy: 0 },
          { dx: 0, dy: -halfH - 1 },
        ];
        for (const o of haloOffsets) {
          const hx = (moonX + o.dx + width) % width;
          const hy = moonY + o.dy;
          if (hy >= 0 && hy < horizonRow && !isOccluded(hx, hy)) {
            fb.setCell(hx, hy, '·', '#64748b', 9988, undefined, true);
          }
        }
      }

      for (let r = 0; r < shape.length; r++) {
        const line = shape[r];
        const py = moonY - halfH + r;
        if (py < 0 || py >= horizonRow) continue;

        for (let c = 0; c < line.length; c++) {
          const ch = line[c];
          if (ch !== ' ') {
            const px = (moonX - halfW + c + width) % width;
            if (!isOccluded(px, py)) {
              const tint = ch === '#' ? moonColor : (ch === 'o' ? '#94a3b8' : '#64748b');
              fb.setCell(px, py, ch, tint, 9980, undefined, true);
            }
          }
        }
      }
    }
  }
}
