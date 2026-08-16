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
   * Base canonical color ramps for all 11 DayPhases.
   */
  private static readonly PHASE_RAMPS: Record<DayPhase, SkyColorRamp> = {
    DEEP_NIGHT: {
      skyTop: '#020617',         // Pure Midnight Void
      skyMid: '#090d16',         // Deep Indigo Black
      skyBottom: '#0f172a',      // Dark Slate Floor
      horizonGlow: '#1e1b4b',    // Cold Night Rim
      cloudHighlight: '#1e293b', // Faint Starlit Cloud Rim
      cloudShadow: '#090d16',    // Dark Night Cloud Mass
      ambientLight: 0.26,
    },
    PRE_DAWN: {
      skyTop: '#090d16',         // Midnight Navy
      skyMid: '#1e1b4b',         // Deep Violet Navy
      skyBottom: '#2e1065',      // Faint Pre-Dawn Purple
      horizonGlow: '#4c1d95',    // Soft Amethyst Glow
      cloudHighlight: '#312e81', // Indigo Cloud Edge
      cloudShadow: '#0f172a',    // Dark Shadow Body
      ambientLight: 0.32,
    },
    DAWN: {
      skyTop: '#1e1b4b',         // Deep Violet Sky
      skyMid: '#3730a3',         // Rich Purple Indigo
      skyBottom: '#701a75',      // Magenta Dawn Gradient
      horizonGlow: '#c026d3',    // Vibrant Magenta Horizon
      cloudHighlight: '#f472b6', // Coral Pink Cloud Rim
      cloudShadow: '#4a044e',    // Deep Plum Cloud Base
      ambientLight: 0.45,
    },
    SUNRISE: {
      skyTop: '#1e3a8a',         // Navy Blue Zenith
      skyMid: '#4338ca',         // Morning Indigo
      skyBottom: '#dc2626',      // Fiery Crimson Transition
      horizonGlow: '#f97316',    // Golden Amber Horizon Glow
      cloudHighlight: '#fde047', // Radiant Gold Edge
      cloudShadow: '#9f1239',    // Crimson Cloud Belly
      ambientLight: 0.65,
    },
    MORNING: {
      skyTop: '#0284c7',         // Bright Cerulean Blue
      skyMid: '#0ea5e9',         // Vibrant Blue
      skyBottom: '#38bdf8',      // Crisp Morning Cyan
      horizonGlow: '#bae6fd',    // Soft Pale Horizon
      cloudHighlight: '#f8fafc', // Crisp White Top
      cloudShadow: '#7dd3fc',    // Cyan Sky Reflection Shadow
      ambientLight: 0.85,
    },
    MIDDAY: {
      skyTop: '#0369a1',         // Deep Solar Blue
      skyMid: '#0284c7',         // Azure Zenith
      skyBottom: '#38bdf8',      // Clean Horizon Blue
      horizonGlow: '#e0f2fe',    // Brilliant Solar Rim
      cloudHighlight: '#ffffff', // Pure White Sunlit Cloud
      cloudShadow: '#93c5fd',    // Ice Blue Shadow
      ambientLight: 1.0,
    },
    AFTERNOON: {
      skyTop: '#0284c7',         // Rich Blue Sky
      skyMid: '#0ea5e9',         // Warm Cerulean
      skyBottom: '#67e8f9',      // Soft Warm Cyan
      horizonGlow: '#fef08a',    // Beginning Golden Rim
      cloudHighlight: '#ffffff', // Brilliant White
      cloudShadow: '#a5f3fc',    // Light Cyan Shadow
      ambientLight: 0.95,
    },
    GOLDEN_HOUR: {
      skyTop: '#1e3a8a',         // Sapphire Deep Upper Sky
      skyMid: '#2563eb',         // Cobalt Blue Mid-Sky
      skyBottom: '#f59e0b',      // Luminous Warm Amber
      horizonGlow: '#fde047',    // Pure Gold Horizon
      cloudHighlight: '#fef08a', // Intense Golden Highlights
      cloudShadow: '#b45309',    // Warm Amber Cloud Base
      ambientLight: 0.80,
    },
    SUNSET: {
      skyTop: '#1e1b4b',         // Deep Indigo Zenith
      skyMid: '#581c87',         // Rich Violet Mid-Sky
      skyBottom: '#e11d48',      // Saturated Rose / Ruby
      horizonGlow: '#ea580c',    // Incandescent Orange Horizon
      cloudHighlight: '#fb7185', // Warm Coral Highlights
      cloudShadow: '#701a75',    // Violet Plum Shadow Base
      ambientLight: 0.60,
    },
    DUSK: {
      skyTop: '#0f172a',         // Twilight Slate Navy
      skyMid: '#1e1b4b',         // Deep Purple Dusk
      skyBottom: '#4c1d95',      // Fading Amethyst
      horizonGlow: '#9333ea',    // Soft Ultraviolet Glow
      cloudHighlight: '#c084fc', // Lavender Cloud Edge
      cloudShadow: '#1e1b4b',    // Deep Violet Shadow
      ambientLight: 0.40,
    },
    NIGHT: {
      skyTop: '#030712',         // Midnight Sky
      skyMid: '#0f172a',         // Dark Navy Mid-Sky
      skyBottom: '#1e293b',      // Cool Slate Horizon
      horizonGlow: '#1e1b4b',    // Faint Lunar Horizon
      cloudHighlight: '#334155', // Dim Silver Cloud Rim
      cloudShadow: '#020617',    // Deep Midnight Cloud Base
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
        break;
    }

    if (biomeId === 'ALPINE') ambientCoolness = Math.min(1.0, ambientCoolness + 0.25);
    if (biomeId === 'DESERT') ambientWarmth = Math.min(1.0, ambientWarmth + 0.20);

    let fogTint = '#94a3b8';
    if (ambientWarmth > 0.4) fogTint = '#fed7aa'; // Warm peach/gold haze
    else if (ambientCoolness > 0.4) fogTint = '#334155'; // Cool slate/indigo haze
    if (biomeId === 'NEON_CITY') fogTint = '#701a75'; // Cyber purple haze
    if (biomeId === 'VOLCANIC') fogTint = '#78350f'; // Smoky amber haze

    let roadWetnessState: RoadWetnessState = 'DRY';
    if (roadWetness > 0.65) roadWetnessState = 'WET';
    else if (roadWetness > 0.15) roadWetnessState = 'DAMP';

    return {
      ambientBrightness: Math.max(0.22, ambientLight * (1.0 - weatherDarkening * 0.45)),
      ambientWarmth,
      ambientCoolness,
      fogTint,
      fogDensity: weatherDarkening,
      roadWetness,
      roadWetnessState,
      wind,
      lightningFlashIntensity: lightningActive ? 1.0 : 0.0,
    };
  }

  /**
   * Applies biome color bias to the sky ramp.
   */
  public static applyBiomeTint(
    baseRamp: SkyColorRamp,
    biomeId: BiomeId
  ): SkyColorRamp {
    switch (biomeId) {
      case 'TROPICAL':
        return {
          ...baseRamp,
          skyTop: ColorPalette.lerp(baseRamp.skyTop, '#0369a1', 0.15),
          skyBottom: ColorPalette.lerp(baseRamp.skyBottom, '#38bdf8', 0.15),
          horizonGlow: ColorPalette.lerp(baseRamp.horizonGlow, '#0284c7', 0.20),
        };
      case 'FOREST':
        return {
          ...baseRamp,
          skyTop: ColorPalette.lerp(baseRamp.skyTop, '#064e3b', 0.20),
          skyBottom: ColorPalette.lerp(baseRamp.skyBottom, '#059669', 0.15),
          horizonGlow: ColorPalette.lerp(baseRamp.horizonGlow, '#34d399', 0.15),
        };
      case 'DESERT':
        return {
          ...baseRamp,
          skyTop: ColorPalette.lerp(baseRamp.skyTop, '#7c2d12', 0.20),
          skyBottom: ColorPalette.lerp(baseRamp.skyBottom, '#ea580c', 0.25),
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
    weatherDarkening: number, // [0, 1]
    isStorm: boolean,
    isSnow: boolean
  ): SkyColorRamp {
    if (weatherDarkening <= 0.01) return ramp;

    const overcastTop = isSnow ? '#334155' : (isStorm ? '#090d16' : '#1e293b');
    const overcastBottom = isSnow ? '#94a3b8' : (isStorm ? '#1e1b4b' : '#475569');
    const overcastHorizon = isSnow ? '#cbd5e1' : (isStorm ? '#312e81' : '#64748b');

    const dimFactor = 1.0 - weatherDarkening * 0.45;

    return {
      skyTop: ColorPalette.lerp(ramp.skyTop, overcastTop, weatherDarkening * 0.85),
      skyMid: ColorPalette.lerp(ramp.skyMid, overcastTop, weatherDarkening * 0.80),
      skyBottom: ColorPalette.lerp(ramp.skyBottom, overcastBottom, weatherDarkening * 0.75),
      horizonGlow: ColorPalette.lerp(ramp.horizonGlow, overcastHorizon, weatherDarkening * 0.70),
      cloudHighlight: ColorPalette.lerp(ramp.cloudHighlight, isStorm ? '#475569' : '#94a3b8', weatherDarkening * 0.7),
      cloudShadow: ColorPalette.lerp(ramp.cloudShadow, isStorm ? '#020617' : '#0f172a', weatherDarkening * 0.9),
      ambientLight: ramp.ambientLight * dimFactor,
    };
  }

  /**
   * Applies special chromatic sky events (e.g. RED_SUNSET, GOLDEN_SUNSET, VIOLET_DUSK).
   */
  public static applySpecialEventRamp(
    ramp: SkyColorRamp,
    event: SpecialSkyEvent,
    intensity: number
  ): SkyColorRamp {
    if (event === 'NONE' || intensity <= 0.01) return ramp;

    switch (event) {
      case 'RED_SUNSET':
        return {
          ...ramp,
          skyTop: ColorPalette.lerp(ramp.skyTop, '#450a0a', intensity * 0.7),
          skyMid: ColorPalette.lerp(ramp.skyMid, '#991b1b', intensity * 0.8),
          skyBottom: ColorPalette.lerp(ramp.skyBottom, '#dc2626', intensity * 0.9),
          horizonGlow: ColorPalette.lerp(ramp.horizonGlow, '#ea580c', intensity * 0.95),
          cloudHighlight: ColorPalette.lerp(ramp.cloudHighlight, '#fca5a5', intensity * 0.8),
          cloudShadow: ColorPalette.lerp(ramp.cloudShadow, '#7f1d1d', intensity * 0.8),
        };
      case 'GOLDEN_SUNSET':
        return {
          ...ramp,
          skyTop: ColorPalette.lerp(ramp.skyTop, '#1e3a8a', intensity * 0.5),
          skyMid: ColorPalette.lerp(ramp.skyMid, '#b45309', intensity * 0.8),
          skyBottom: ColorPalette.lerp(ramp.skyBottom, '#f59e0b', intensity * 0.9),
          horizonGlow: ColorPalette.lerp(ramp.horizonGlow, '#fde047', intensity * 0.95),
          cloudHighlight: ColorPalette.lerp(ramp.cloudHighlight, '#fef08a', intensity * 0.85),
          cloudShadow: ColorPalette.lerp(ramp.cloudShadow, '#78350f', intensity * 0.85),
        };
      case 'VIOLET_DUSK':
        return {
          ...ramp,
          skyTop: ColorPalette.lerp(ramp.skyTop, '#090514', intensity * 0.7),
          skyMid: ColorPalette.lerp(ramp.skyMid, '#3b0764', intensity * 0.85),
          skyBottom: ColorPalette.lerp(ramp.skyBottom, '#701a75', intensity * 0.9),
          horizonGlow: ColorPalette.lerp(ramp.horizonGlow, '#c026d3', intensity * 0.95),
          cloudHighlight: ColorPalette.lerp(ramp.cloudHighlight, '#e879f9', intensity * 0.8),
          cloudShadow: ColorPalette.lerp(ramp.cloudShadow, '#4a044e', intensity * 0.8),
        };
      case 'RED_DAWN':
        return {
          ...ramp,
          skyTop: ColorPalette.lerp(ramp.skyTop, '#1e1b4b', intensity * 0.6),
          skyMid: ColorPalette.lerp(ramp.skyMid, '#7f1d1d', intensity * 0.8),
          skyBottom: ColorPalette.lerp(ramp.skyBottom, '#e11d48', intensity * 0.9),
          horizonGlow: ColorPalette.lerp(ramp.horizonGlow, '#f43f5e', intensity * 0.95),
        };
      default:
        return ramp;
    }
  }

  /**
   * Modulates terrain and scenery colors with ambient warmth / coolness / weather.
   */
  public static modulateWorldColor(
    baseColor: string,
    atmosphere: AmbientAtmosphere
  ): string {
    let color = baseColor;

    // Apply brightness
    color = ColorPalette.scaleBrightness(color, atmosphere.ambientBrightness);

    // Apply warmth during golden hour/sunset
    if (atmosphere.ambientWarmth > 0.05) {
      color = ColorPalette.lerp(color, '#f59e0b', atmosphere.ambientWarmth * 0.22);
    }

    // Apply coolness during night/deep night
    if (atmosphere.ambientCoolness > 0.05) {
      color = ColorPalette.lerp(color, '#1e1b4b', atmosphere.ambientCoolness * 0.28);
    }

    // Apply lightning illumination
    if (atmosphere.lightningFlashIntensity > 0.05) {
      color = ColorPalette.lerp(color, '#e0f2fe', atmosphere.lightningFlashIntensity * 0.75);
    }

    return color;
  }

  /**
   * Applies subtle audio modulation.
   */
  public static applyMusicModulation(
    ramp: SkyColorRamp,
    musicParams: WorldMusicParameters
  ): SkyColorRamp {
    if (!musicParams) return ramp;

    const glow = musicParams.environmentalGlow || 0;
    const brightnessScale = 1.0 + glow * 0.12;

    return {
      skyTop: ColorPalette.scaleBrightness(ramp.skyTop, brightnessScale),
      skyMid: ColorPalette.scaleBrightness(ramp.skyMid, brightnessScale),
      skyBottom: ColorPalette.scaleBrightness(ramp.skyBottom, brightnessScale),
      horizonGlow: ColorPalette.scaleBrightness(ramp.horizonGlow, 1.0 + glow * 0.20),
      cloudHighlight: ColorPalette.scaleBrightness(ramp.cloudHighlight, brightnessScale),
      cloudShadow: ColorPalette.scaleBrightness(ramp.cloudShadow, brightnessScale),
      ambientLight: Math.min(1.0, ramp.ambientLight * (1.0 + glow * 0.10)),
    };
  }
}
