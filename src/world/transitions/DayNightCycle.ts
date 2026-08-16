import { ColorPalette } from '../../ascii/ColorPalette';
import { AtmospherePalette } from '../sky/AtmospherePalette';
import { DayNightState, DayPhase } from '../types';

export class DayNightCycle {
  public static readonly CYCLE_DURATION_SECONDS: number = 300; // 5 minutes real-time

  private cycleTime: number = 75; // Start near dawn/morning

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
    const timeRamp = AtmospherePalette.evaluateTimeRamp(normalized);
    const phase: DayPhase = timeRamp.phase;
    const phaseProgress: number = timeRamp.phaseProgress;

    // Continuous celestial sun elevation calculation
    const daylightDuration = 0.70;
    const sunriseStart = 0.15;
    let sunElevation: number;
    let sunColor: string;

    if (normalized >= sunriseStart && normalized <= sunriseStart + daylightDuration) {
      const progress = (normalized - sunriseStart) / daylightDuration;
      sunElevation = Math.sin(progress * Math.PI);
      if (sunElevation < 0.25) {
        sunColor = ColorPalette.lerp('#ef4444', '#f97316', Math.max(0, sunElevation / 0.25));
      } else if (sunElevation < 0.60) {
        sunColor = ColorPalette.lerp('#f97316', '#fde047', (sunElevation - 0.25) / 0.35);
      } else {
        sunColor = ColorPalette.lerp('#fde047', '#fef08a', (sunElevation - 0.60) / 0.40);
      }
    } else {
      sunElevation = 0;
      sunColor = '#e2e8f0';
    }

    const isNight = phase === 'DEEP_NIGHT' || phase === 'PRE_DAWN' || phase === 'NIGHT';
    const isTwilight = phase === 'DAWN' || phase === 'SUNRISE' || phase === 'GOLDEN_HOUR' || phase === 'SUNSET' || phase === 'DUSK';
    const starIntensity = isNight ? 1.0 : (isTwilight ? 0.35 : 0.0);

    return {
      timeSeconds: this.cycleTime,
      normalizedCycle: normalized,
      phase,
      phaseProgress,
      ambientLight: timeRamp.ramp.ambientLight,
      sunElevation,
      sunColor,
      starIntensity,
      blendedSkyTop: timeRamp.ramp.skyTop,
      blendedSkyBottom: timeRamp.ramp.skyBottom,
    };
  }
}
