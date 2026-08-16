import { FrameBuffer } from '../../ascii/FrameBuffer';
import { ColorPalette } from '../../ascii/ColorPalette';
import { BiomeId } from '../types';
import { DayPhase, SpecialSkyEvent } from './SkyTypes';

export class AuroraSystem {
  private static readonly AURORA_COLORS = [
    '#10b981', // Emerald Aurora Green
    '#34d399', // Mint Glow
    '#38bdf8', // Cyan Ray
    '#a855f7', // High Altitude Violet
  ];

  /**
   * Evaluates whether conditions allow an Aurora Borealis to appear.
   */
  public static canTriggerAurora(
    biomeId: BiomeId,
    dayPhase: DayPhase,
    cloudCoverageRatio: number
  ): boolean {
    const isPolarBiome = biomeId === 'ALPINE' || biomeId === 'FOREST';
    const isDarkNight = dayPhase === 'DEEP_NIGHT' || dayPhase === 'PRE_DAWN' || dayPhase === 'NIGHT';
    const isClearSky = cloudCoverageRatio < 0.40;

    return isPolarBiome && isDarkNight && isClearSky;
  }

  /**
   * Renders undulating northern lights curtains in the upper sky.
   */
  public static renderAurora(
    fb: FrameBuffer,
    width: number,
    horizonRow: number,
    worldTime: number,
    intensity: number,
    specialEvent: SpecialSkyEvent,
    isOccluded: (x: number, y: number) => boolean
  ): void {
    if (specialEvent !== 'AURORA' || intensity <= 0.05) return;

    const maxRibbonY = Math.floor(horizonRow * 0.45);
    const waveFreq1 = 0.04;
    const waveFreq2 = 0.09;
    const speed = worldTime * 0.6;

    for (let x = 0; x < width; x++) {
      // Dual-sine undulating wave baseline
      const baseWave = Math.sin(x * waveFreq1 + speed) * 3 + Math.sin(x * waveFreq2 - speed * 0.7) * 2;
      const ribbonCenterY = Math.floor(maxRibbonY * 0.5 + baseWave);

      for (let dy = -2; dy <= 3; dy++) {
        const y = ribbonCenterY + dy;
        if (y >= 0 && y < horizonRow && !isOccluded(x, y)) {
          const colorIdx = Math.abs(Math.floor(dy + (x % 3))) % AuroraSystem.AURORA_COLORS.length;
          const baseColor = AuroraSystem.AURORA_COLORS[colorIdx];
          const brightness = intensity * (1.0 - Math.abs(dy) * 0.25);

          if (brightness > 0.15) {
            const tint = ColorPalette.scaleBrightness(baseColor, Math.min(1.0, brightness));
            const ch = (dy === 0) ? '≈' : (dy === -1 || dy === 1 ? '~' : '░');
            fb.setCell(x, y, ch, tint, 9982, undefined, true);
          }
        }
      }
    }
  }
}
