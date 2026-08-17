import { ColorPalette } from '../../ascii/ColorPalette';
import { BiomeId, WorldMusicParameters } from '../types';
import {
  AmbientAtmosphere,
  DayPhase,
  RoadWetnessState,
  SkyColorRamp,
  SpecialSkyEvent,
  WorldWindState,
} from './SkyTypes';

export class AtmospherePalette {
  /**
   * Base canonical color ramps with 3-tone cloud shading for all 11 DayPhases.
   */
  private static readonly PHASE_RAMPS: Record<DayPhase, SkyColorRamp> = {
    DEEP_NIGHT: {
      skyTop: '#020617',         // Pure Midnight Void
      skyMid: '#090d16',         // Deep Indigo Black
      skyBottom: '#0f172a',      // Dark Slate Floor
      horizonGlow: '#1e1b4b',    // Cold Night Rim
      cloudHighlight: '#38bdf8', // Moonlight Starlit Rim
      cloudBody: '#0f172a',      // Midnight Cloud Mass
      cloudShadow: '#020617',    // Void Cloud Base
      ambientLight: 0.26,
    },
    PRE_DAWN: {
      skyTop: '#090d16',         // Midnight Navy
      skyMid: '#1e1b4b',         // Deep Violet Navy
      skyBottom: '#2e1065',      // Faint Pre-Dawn Purple
      horizonGlow: '#4c1d95',    // Soft Amethyst Glow
      cloudHighlight: '#818cf8', // Indigo Cloud Edge
      cloudBody: '#312e81',      // Pre-Dawn Plum Body
      cloudShadow: '#0f172a',    // Dark Shadow Base
      ambientLight: 0.32,
    },
    DAWN: {
      skyTop: '#1e1b4b',         // Deep Violet Sky
      skyMid: '#3730a3',         // Rich Purple Indigo
      skyBottom: '#701a75',      // Magenta Dawn Gradient
      horizonGlow: '#c026d3',    // Vibrant Magenta Horizon
      cloudHighlight: '#f472b6', // Coral Pink Cloud Rim
      cloudBody: '#a21caf',      // Rich Violet Body
      cloudShadow: '#4a044e',    // Deep Plum Base
      ambientLight: 0.45,
    },
    SUNRISE: {
      skyTop: '#1e3a8a',         // Navy Blue Zenith
      skyMid: '#4338ca',         // Morning Indigo
      skyBottom: '#ea580c',      // Warm Amber-Orange Transition
      horizonGlow: '#fde047',    // Luminous Soft Gold Horizon Glow
      cloudHighlight: '#fef08a', // Pale Yellow Gold Rim
      cloudBody: '#fb7185',      // Peach / Pink Body
      cloudShadow: '#701a75',    // Violet / Plum Base
      ambientLight: 0.65,
    },
    MORNING: {
      skyTop: '#0284c7',         // Bright Cerulean Blue
      skyMid: '#0ea5e9',         // Vibrant Blue
      skyBottom: '#38bdf8',      // Crisp Morning Cyan
      horizonGlow: '#bae6fd',    // Soft Pale Horizon
      cloudHighlight: '#ffffff', // Crisp White Top
      cloudBody: '#e0f2fe',      // Pale Cyan Body
      cloudShadow: '#7dd3fc',    // Cyan Sky Reflection Shadow
      ambientLight: 0.85,
    },
    MIDDAY: {
      skyTop: '#0369a1',         // Deep Solar Blue
      skyMid: '#0284c7',         // Azure Zenith
      skyBottom: '#38bdf8',      // Clean Horizon Blue
      horizonGlow: '#e0f2fe',    // Brilliant Solar Rim
      cloudHighlight: '#ffffff', // Pure White Sunlit Cloud
      cloudBody: '#f1f5f9',      // Pale White Body
      cloudShadow: '#94a3b8',    // Cool Gray Shadow
      ambientLight: 1.0,
    },
    AFTERNOON: {
      skyTop: '#0284c7',         // Rich Blue Sky
      skyMid: '#0ea5e9',         // Warm Cerulean
      skyBottom: '#67e8f9',      // Soft Warm Cyan
      horizonGlow: '#fef08a',    // Beginning Golden Rim
      cloudHighlight: '#ffffff', // Brilliant White
      cloudBody: '#f8fafc',      // Clean Cloud Body
      cloudShadow: '#93c5fd',    // Ice Blue Shadow
      ambientLight: 0.95,
    },
    GOLDEN_HOUR: {
      skyTop: '#1e3a8a',         // Sapphire Deep Upper Sky
      skyMid: '#2563eb',         // Cobalt Blue Mid-Sky
      skyBottom: '#f59e0b',      // Luminous Warm Amber
      horizonGlow: '#fde047',    // Pure Gold Horizon
      cloudHighlight: '#fde047', // Intense Gold Rim
      cloudBody: '#fb923c',      // Warm Peach / Amber Body
      cloudShadow: '#9333ea',    // Magenta / Violet Base
      ambientLight: 0.80,
    },
    SUNSET: {
      skyTop: '#1e1b4b',         // Deep Indigo Zenith
      skyMid: '#581c87',         // Rich Violet Mid-Sky
      skyBottom: '#c026d3',      // Soft Magenta-Rose
      horizonGlow: '#f97316',    // Warm Amber-Orange Horizon
      cloudHighlight: '#fb7185', // Warm Coral Highlights
      cloudBody: '#c026d3',      // Vibrant Magenta Body
      cloudShadow: '#4c1d95',    // Deep Violet Shadow Base
      ambientLight: 0.60,
    },
    DUSK: {
      skyTop: '#0f172a',         // Twilight Slate Navy
      skyMid: '#1e1b4b',         // Deep Purple Dusk
      skyBottom: '#4c1d95',      // Fading Amethyst
      horizonGlow: '#9333ea',    // Soft Ultraviolet Glow
      cloudHighlight: '#c084fc', // Lavender Cloud Edge
      cloudBody: '#581c87',      // Violet Twilight Body
      cloudShadow: '#1e1b4b',    // Deep Violet Shadow
      ambientLight: 0.40,
    },
    NIGHT: {
      skyTop: '#030712',         // Midnight Sky
      skyMid: '#0f172a',         // Dark Navy Mid-Sky
      skyBottom: '#1e293b',      // Cool Slate Horizon
      horizonGlow: '#1e1b4b',    // Faint Lunar Horizon
      cloudHighlight: '#67e8f9', // Subtle Moon Cyan Rim
      cloudBody: '#1e293b',      // Dark Slate Blue Body
      cloudShadow: '#090d16',    // Deep Midnight Cloud Base
      ambientLight: 0.30,
    },
  };

  /**
   * Chronological order of the 11 phases with fractional day boundaries [0.0, 1.0).
   */
  public static readonly PHASE_TIMELINE: { phase: DayPhase; start: number; end: number }[] = [
    { phase: 'DEEP_NIGHT',  start: 0.00, end: 0.08 },
    { phase: 'PRE_DAWN',    start: 0.08, end: 0.15 },
    { phase: 'DAWN',        start: 0.15, end: 0.22 },
    { phase: 'SUNRISE',     start: 0.22, end: 0.30 },
    { phase: 'MORNING',     start: 0.30, end: 0.42 },
    { phase: 'MIDDAY',      start: 0.42, end: 0.58 },
    { phase: 'AFTERNOON',   start: 0.58, end: 0.68 },
    { phase: 'GOLDEN_HOUR', start: 0.68, end: 0.76 },
    { phase: 'SUNSET',      start: 0.76, end: 0.84 },
    { phase: 'DUSK',        start: 0.84, end: 0.92 },
    { phase: 'NIGHT',       start: 0.92, end: 1.00 },
  ];

  /**
   * Evaluates interpolated base ramp between current phase and next phase.
   */
  public static evaluateTimeRamp(normalizedDay: number): {
    phase: DayPhase;
    phaseProgress: number;
    ramp: SkyColorRamp;
  } {
    const t = ((normalizedDay % 1.0) + 1.0) % 1.0;
    const timeline = this.PHASE_TIMELINE;

    let currIdx = 0;
    for (let i = 0; i < timeline.length; i++) {
      if (t >= timeline[i].start && t < timeline[i].end) {
        currIdx = i;
        break;
      }
    }

    const currEntry = timeline[currIdx];
    const nextIdx = (currIdx + 1) % timeline.length;
    const nextEntry = timeline[nextIdx];

    const phaseProgress = (t - currEntry.start) / (currEntry.end - currEntry.start);

    // Smooth sinusoidal ease between phases
    const smoothT = 0.5 - 0.5 * Math.cos(phaseProgress * Math.PI);

    const r1 = this.PHASE_RAMPS[currEntry.phase];
    const r2 = this.PHASE_RAMPS[nextEntry.phase];

    const ramp: SkyColorRamp = {
      skyTop: ColorPalette.lerp(r1.skyTop, r2.skyTop, smoothT),
      skyMid: ColorPalette.lerp(r1.skyMid, r2.skyMid, smoothT),
      skyBottom: ColorPalette.lerp(r1.skyBottom, r2.skyBottom, smoothT),
      horizonGlow: ColorPalette.lerp(r1.horizonGlow, r2.horizonGlow, smoothT),
      cloudHighlight: ColorPalette.lerp(r1.cloudHighlight, r2.cloudHighlight, smoothT),
      cloudBody: ColorPalette.lerp(r1.cloudBody, r2.cloudBody, smoothT),
      cloudShadow: ColorPalette.lerp(r1.cloudShadow, r2.cloudShadow, smoothT),
      ambientLight: r1.ambientLight + (r2.ambientLight - r1.ambientLight) * smoothT,
    };

    return {
      phase: currEntry.phase,
      phaseProgress,
      ramp,
    };
  }

  /**
   * Evaluates AmbientAtmosphere world-lighting response factors.
   */
  public static evaluateAmbientAtmosphere(
    phase: DayPhase,
    ambientLight: number,
    weatherDarkening: number,
    roadWetness: number,
    wind: WorldWindState,
    lightningActive: boolean,
    biomeId: BiomeId
  ): AmbientAtmosphere {
    let ambientWarmth = 0.0;
    let ambientCoolness = 0.0;

    switch (phase) {
      case 'GOLDEN_HOUR':
        ambientWarmth = 0.85;
        break;
      case 'SUNSET':
        ambientWarmth = 0.70;
        break;
      case 'SUNRISE':
        ambientWarmth = 0.60;
        break;
      case 'DAWN':
        ambientWarmth = 0.35;
        break;
      case 'DEEP_NIGHT':
        ambientCoolness = 0.90;
        break;
      case 'NIGHT':
        ambientCoolness = 0.75;
        break;
      case 'PRE_DAWN':
        ambientCoolness = 0.60;
        break;
      case 'DUSK':
        ambientCoolness = 0.40;
        break;
      default:
        ambientWarmth = 0.0;
        ambientCoolness = 0.0;
        break;
    }

    // Biome-specific ambient temperature
    if (biomeId === 'DESERT') ambientWarmth = Math.min(1.0, ambientWarmth + 0.15);
    if (biomeId === 'ALPINE') ambientCoolness = Math.min(1.0, ambientCoolness + 0.20);
    if (biomeId === 'VOLCANIC') ambientWarmth = Math.min(1.0, ambientWarmth + 0.25);

    const baseBrightness = Math.max(0.22, ambientLight * (1.0 - weatherDarkening * 0.42));
    const effectiveBrightness = lightningActive ? 1.0 : baseBrightness;

    let fogTint = '#94a3b8';
    if (phase === 'SUNRISE' || phase === 'GOLDEN_HOUR' || phase === 'SUNSET') {
      fogTint = '#f59e0b';
    } else if (phase === 'DEEP_NIGHT' || phase === 'NIGHT') {
      fogTint = '#1e1b4b';
    }

    if (biomeId === 'DESERT') fogTint = '#d97706';
    if (biomeId === 'ALPINE') fogTint = '#cbd5e1';
    if (biomeId === 'NEON_CITY') fogTint = '#c026d3';
    if (biomeId === 'VOLCANIC') fogTint = '#7f1d1d';

    const roadWetnessState: RoadWetnessState = roadWetness < 0.15
      ? 'DRY'
      : (roadWetness <= 0.65 ? 'DAMP' : 'WET');

    return {
      ambientBrightness: effectiveBrightness,
      ambientWarmth,
      ambientCoolness,
      fogTint,
      fogDensity: 0.0,
      roadWetness,
      roadWetnessState,
      wind,
      lightningFlashIntensity: lightningActive ? 1.0 : 0.0,
    };
  }

  /**
   * Modulates a world terrain or scenery color by the active ambient atmosphere.
   */
  public static modulateWorldColor(
    baseColor: string,
    atmosphere: AmbientAtmosphere
  ): string {
    let result = baseColor;

    if (atmosphere.ambientWarmth > 0.05) {
      result = ColorPalette.lerp(result, '#f59e0b', atmosphere.ambientWarmth * 0.22);
    } else if (atmosphere.ambientCoolness > 0.05) {
      result = ColorPalette.lerp(result, '#1e3a8a', atmosphere.ambientCoolness * 0.25);
    }

    if (atmosphere.ambientBrightness < 0.98) {
      result = ColorPalette.scaleBrightness(result, atmosphere.ambientBrightness);
    }

    if (atmosphere.lightningFlashIntensity > 0.1) {
      result = ColorPalette.lerp(result, '#ffffff', atmosphere.lightningFlashIntensity * 0.65);
    }

    return result;
  }

  /**
   * Applies biome color tinting to the sky color ramp.
   */
  public static applyBiomeTint(
    baseRamp: SkyColorRamp,
    biomeId: BiomeId
  ): SkyColorRamp {
    switch (biomeId) {
      case 'TROPICAL':
        return {
          ...baseRamp,
          skyBottom: ColorPalette.lerp(baseRamp.skyBottom, '#38bdf8', 0.15),
          horizonGlow: ColorPalette.lerp(baseRamp.horizonGlow, '#67e8f9', 0.20),
        };
      case 'FOREST':
        return {
          ...baseRamp,
          skyBottom: ColorPalette.lerp(baseRamp.skyBottom, '#10b981', 0.10),
          horizonGlow: ColorPalette.lerp(baseRamp.horizonGlow, '#a7f3d0', 0.15),
        };
      case 'DESERT':
        return {
          ...baseRamp,
          skyBottom: ColorPalette.lerp(baseRamp.skyBottom, '#f59e0b', 0.25),
          horizonGlow: ColorPalette.lerp(baseRamp.horizonGlow, '#f97316', 0.30),
        };
      case 'ALPINE':
        return {
          ...baseRamp,
          skyTop: ColorPalette.lerp(baseRamp.skyTop, '#1e1b4b', 0.20),
          skyBottom: ColorPalette.lerp(baseRamp.skyBottom, '#3b82f6', 0.20),
          horizonGlow: ColorPalette.lerp(baseRamp.horizonGlow, '#93c5fd', 0.25),
        };
      case 'NEON_CITY':
        return {
          ...baseRamp,
          skyTop: ColorPalette.lerp(baseRamp.skyTop, '#090514', 0.30),
          skyMid: ColorPalette.lerp(baseRamp.skyMid, '#581c87', 0.25),
          skyBottom: ColorPalette.lerp(baseRamp.skyBottom, '#701a75', 0.25),
          horizonGlow: ColorPalette.lerp(baseRamp.horizonGlow, '#ec4899', 0.35),
        };
      case 'VOLCANIC':
        return {
          ...baseRamp,
          skyTop: ColorPalette.lerp(baseRamp.skyTop, '#18181b', 0.35),
          skyBottom: ColorPalette.lerp(baseRamp.skyBottom, '#991b1b', 0.30),
          horizonGlow: ColorPalette.lerp(baseRamp.horizonGlow, '#ea580c', 0.35),
        };
      default:
        return baseRamp;
    }
  }

  /**
   * Applies weather atmospheric dimming and tinting.
   */
  public static applyWeatherAtmosphere(
    ramp: SkyColorRamp,
    weatherDarkening: number,
    isStorm: boolean,
    isSnow: boolean
  ): SkyColorRamp {
    if (weatherDarkening <= 0.01) return ramp;

    const overcastTop = isSnow ? '#334155' : (isStorm ? '#090d16' : '#1e293b');
    const overcastBottom = isSnow ? '#94a3b8' : (isStorm ? '#1e1b4b' : '#475569');
    const overcastHorizon = isSnow ? '#cbd5e1' : (isStorm ? '#312e81' : '#64748b');

    return {
      skyTop: ColorPalette.lerp(ramp.skyTop, overcastTop, weatherDarkening * 0.85),
      skyMid: ColorPalette.lerp(ramp.skyMid, overcastTop, weatherDarkening * 0.80),
      skyBottom: ColorPalette.lerp(ramp.skyBottom, overcastBottom, weatherDarkening * 0.75),
      horizonGlow: ColorPalette.lerp(ramp.horizonGlow, overcastHorizon, weatherDarkening * 0.70),
      cloudHighlight: ColorPalette.lerp(ramp.cloudHighlight, isStorm ? '#64748b' : '#cbd5e1', weatherDarkening * 0.80),
      cloudBody: ColorPalette.lerp(ramp.cloudBody, isStorm ? '#334155' : '#64748b', weatherDarkening * 0.85),
      cloudShadow: ColorPalette.lerp(ramp.cloudShadow, isStorm ? '#0f172a' : '#1e293b', weatherDarkening * 0.90),
      ambientLight: Math.max(0.22, ramp.ambientLight * (1.0 - weatherDarkening * 0.45)),
    };
  }

  /**
   * Modulates ramp by music parameters.
   */
  public static applyMusicModulation(
    ramp: SkyColorRamp,
    musicParams: WorldMusicParameters
  ): SkyColorRamp {
    if (!musicParams) return ramp;
    const glow = musicParams.environmentalGlow || 0;
    if (glow <= 0.01) return ramp;

    return {
      ...ramp,
      horizonGlow: ColorPalette.scaleBrightness(ramp.horizonGlow, 1.0 + glow * 0.35),
      ambientLight: Math.min(1.0, ramp.ambientLight * (1.0 + glow * 0.20)),
    };
  }

  /**
   * Applies special celestial event lighting to the ramp.
   */
  public static applySpecialEventRamp(
    ramp: SkyColorRamp,
    event: SpecialSkyEvent,
    intensity: number = 1.0
  ): SkyColorRamp {
    if (event === 'NONE' || intensity <= 0.01) return ramp;

    switch (event) {
      case 'AURORA':
        return {
          ...ramp,
          skyTop: ColorPalette.lerp(ramp.skyTop, '#064e3b', 0.40 * intensity),
          skyMid: ColorPalette.lerp(ramp.skyMid, '#047857', 0.35 * intensity),
          horizonGlow: ColorPalette.lerp(ramp.horizonGlow, '#10b981', 0.50 * intensity),
          ambientLight: Math.min(1.0, ramp.ambientLight * (1.0 + 0.15 * intensity)),
        };
      case 'RED_SUNSET':
        return {
          ...ramp,
          skyBottom: ColorPalette.lerp(ramp.skyBottom, '#dc2626', 0.50 * intensity),
          horizonGlow: ColorPalette.lerp(ramp.horizonGlow, '#f97316', 0.60 * intensity),
        };
      case 'GOLDEN_SUNSET':
        return {
          ...ramp,
          skyBottom: ColorPalette.lerp(ramp.skyBottom, '#d97706', 0.50 * intensity),
          horizonGlow: ColorPalette.lerp(ramp.horizonGlow, '#fde047', 0.60 * intensity),
        };
      case 'VIOLET_DUSK':
        return {
          ...ramp,
          skyMid: ColorPalette.lerp(ramp.skyMid, '#581c87', 0.45 * intensity),
          horizonGlow: ColorPalette.lerp(ramp.horizonGlow, '#9333ea', 0.55 * intensity),
        };
      default:
        return ramp;
    }
  }
}
