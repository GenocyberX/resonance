import { ColorPalette } from '../../ascii/ColorPalette';
import { DayNightState, DayPhase } from '../types';

export class DayNightCycle {
  public static readonly CYCLE_DURATION_SECONDS: number = 300; // 5 minutes real-time

  private cycleTime: number = 45; // Start near morning/dawn

  /**
   * Updates time and returns the interpolated DayNight state.
   */
  public update(dt: number): DayNightState {
    this.cycleTime = (this.cycleTime + dt) % DayNightCycle.CYCLE_DURATION_SECONDS;
    const normalized = this.cycleTime / DayNightCycle.CYCLE_DURATION_SECONDS;

    return this.calculateState(normalized);
  }

  public setNormalizedTime(t: number): void {
    this.cycleTime = (Math.max(0, Math.min(1, t)) * DayNightCycle.CYCLE_DURATION_SECONDS);
  }

  public calculateState(normalized: number): DayNightState {
    let phase: DayPhase;
    let phaseProgress: number;
    let ambientLight: number;
    let starIntensity: number;
    let sunColor: string;
    let sunElevation: number; // 0 = at horizon, 1 = high noon / apex
    let skyTop: string;
    let skyBottom: string;

    if (normalized < 0.20) {
      // 0.0 - 0.20: DAWN
      phase = 'DAWN';
      phaseProgress = normalized / 0.20;
      ambientLight = 0.35 + phaseProgress * 0.55; // 0.35 -> 0.90
      starIntensity = Math.max(0, 1.0 - phaseProgress * 1.5);
      sunColor = ColorPalette.lerp('#fb7185', '#fde047', phaseProgress);
      sunElevation = phaseProgress;
      skyTop = ColorPalette.lerp('#0c0a1f', '#1e3a8a', phaseProgress);
      skyBottom = ColorPalette.lerp('#f43f5e', '#fbbf24', phaseProgress);
    } else if (normalized < 0.50) {
      // 0.20 - 0.50: DAY
      phase = 'DAY';
      phaseProgress = (normalized - 0.20) / 0.30;
      ambientLight = 1.0;
      starIntensity = 0.0;
      sunColor = '#fef08a';
      sunElevation = 1.0 - Math.abs(phaseProgress - 0.5) * 0.4;
      skyTop = ColorPalette.lerp('#0284c7', '#38bdf8', Math.sin(phaseProgress * Math.PI));
      skyBottom = ColorPalette.lerp('#7dd3fc', '#bae6fd', Math.sin(phaseProgress * Math.PI));
    } else if (normalized < 0.70) {
      // 0.50 - 0.70: DUSK
      phase = 'DUSK';
      phaseProgress = (normalized - 0.50) / 0.20;
      ambientLight = 0.90 - phaseProgress * 0.55; // 0.90 -> 0.35
      starIntensity = Math.min(1.0, phaseProgress * 1.3);
      sunColor = ColorPalette.lerp('#f59e0b', '#dc2626', phaseProgress);
      sunElevation = 1.0 - phaseProgress;
      skyTop = ColorPalette.lerp('#1e1b4b', '#090514', phaseProgress);
      skyBottom = ColorPalette.lerp('#f97316', '#7c2d12', phaseProgress);
    } else {
      // 0.70 - 1.00: NIGHT
      phase = 'NIGHT';
      phaseProgress = (normalized - 0.70) / 0.30;
      ambientLight = 0.32;
      starIntensity = 1.0;
      sunColor = '#e2e8f0'; // Moon
      sunElevation = 0.5 + Math.sin(phaseProgress * Math.PI) * 0.4;
      skyTop = '#030712';
      skyBottom = '#0b0f19';
    }

    return {
      timeSeconds: this.cycleTime,
      normalizedCycle: normalized,
      phase,
      phaseProgress,
      ambientLight,
      sunElevation,
      sunColor,
      starIntensity,
      blendedSkyTop: skyTop,
      blendedSkyBottom: skyBottom,
    };
  }
}
