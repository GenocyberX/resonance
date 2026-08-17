import { BiomeId } from '../types';

export type DayPhase =
  | 'DEEP_NIGHT'
  | 'PRE_DAWN'
  | 'DAWN'
  | 'SUNRISE'
  | 'MORNING'
  | 'MIDDAY'
  | 'AFTERNOON'
  | 'GOLDEN_HOUR'
  | 'SUNSET'
  | 'DUSK'
  | 'NIGHT';

export type MoonPhase =
  | 'NEW_MOON'
  | 'WAXING_CRESCENT'
  | 'FIRST_QUARTER'
  | 'WAXING_GIBBOUS'
  | 'FULL_MOON'
  | 'WANING_GIBBOUS'
  | 'LAST_QUARTER'
  | 'WANING_CRESCENT';

export type CloudCoverage =
  | 'CLEAR'
  | 'FEW'
  | 'SCATTERED'
  | 'MOSTLY_CLOUDY'
  | 'OVERCAST';

export type CloudFormationType =
  | 'PUFF_SMALL'
  | 'CUMULUS_MEDIUM'
  | 'CUMULUS_LARGE'
  | 'CLOUD_BANK'
  | 'STORM_MASS';

export type WeatherType =
  | 'CLEAR'
  | 'CLOUDY'
  | 'LIGHT_RAIN'
  | 'HEAVY_RAIN'
  | 'THUNDERSTORM'
  | 'SNOW'
  | 'BLIZZARD'
  | 'FOG'
  | 'HEAT_HAZE'
  | 'VOLCANIC_ASH'
  | 'NEON_MIST';

export type SpecialSkyEvent =
  | 'NONE'
  | 'AURORA'
  | 'SHOOTING_STAR'
  | 'METEOR_SHOWER'
  | 'LOW_FULL_MOON'
  | 'RED_SUNSET'
  | 'GOLDEN_SUNSET'
  | 'VIOLET_DUSK'
  | 'RED_DAWN'
  | 'RAINBOW'
  | 'FOG_BANK_ENCOUNTER';

export type RoadWetnessState = 'DRY' | 'DAMP' | 'WET';

export interface WorldWindState {
  direction: number; // [-1.0, 1.0] (-1 = strong wind from right to left, +1 = left to right)
  strength: number;  // [0.0, 1.0] (0 = calm, 1.0 = gale / blizzard wind)
}

export interface AmbientAtmosphere {
  ambientBrightness: number; // [0.22, 1.0]
  ambientWarmth: number;     // [0.0, 1.0] (Golden hour, sunrise, sunset warmth)
  ambientCoolness: number;   // [0.0, 1.0] (Night, polar, storm cold tint)
  fogTint: string;           // Hex color of ambient atmospheric haze
  fogDensity: number;        // [0.0, 1.0]
  roadWetness: number;       // [0.0, 1.0] (0 = dry, 0.5 = damp, 1.0 = wet)
  roadWetnessState: RoadWetnessState;
  wind: WorldWindState;
  lightningFlashIntensity: number; // [0.0, 1.0]
}

export interface CloudFormation {
  id: string;
  type: CloudFormationType;
  width: number;
  height: number;
  lines: string[];
}

export interface CloudLayerInstance {
  xNorm: number;          // [0, 1) horizontal normalized coordinate
  yNorm: number;          // [0, 1) normalized altitude in sky (0 = top, 1 = horizon)
  speed: number;          // Drift speed in norm units / sec
  formation: CloudFormation;
  layer: 'HIGH' | 'MID' | 'LOW';
  alpha: number;          // [0, 1] opacity
}

export interface StarInstance {
  xNorm: number;
  yNorm: number;
  char: string;
  tier: 'DIM' | 'MEDIUM' | 'BRIGHT' | 'HERO';
  baseBrightness: number; // [0.2, 1.0]
  twinkleSpeed: number;   // Radians / sec
  twinkleOffset: number;  // Phase offset
}

export interface ShootingStarInstance {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  progress: number;       // [0, 1]
  duration: number;       // In seconds
  color: string;
}

export interface SkyColorRamp {
  skyTop: string;
  skyMid: string;
  skyBottom: string;
  horizonGlow: string;
  cloudHighlight: string;
  cloudBody: string;
  cloudShadow: string;
  ambientLight: number;   // [0.20, 1.0]
}

export interface SkyState {
  timeSeconds: number;
  normalizedCycle: number;
  dayCount: number;
  timePhase: DayPhase;
  phaseProgress: number;

  sunElevation: number;   // [-1, 1] (-1 = midnight nadir, 0 = horizon, 1 = high noon apex)
  sunHeadingNorm: number; // [0, 1] (0 = sunrise east, 0.5 = south apex, 1 = sunset west)
  sunVisible: boolean;
  sunColor: string;

  moonElevation: number;  // [-1, 1]
  moonHeadingNorm: number;// [0, 1]
  moonVisible: boolean;
  moonPhase: MoonPhase;
  moonPhaseIndex: number; // 0..7
  moonlightFactor: number;// [0.0, 1.0]

  starVisibility: number; // [0.0, 1.0]
  cloudCoverage: CloudCoverage;
  cloudCoverageRatio: number; // [0.0, 1.0]

  fogAmount: number;      // [0.0, 1.0]
  stormIntensity: number; // [0.0, 1.0]
  isLightningFlashing: boolean;

  skyTopColor: string;
  skyMidColor: string;
  skyBottomColor: string;
  horizonGlowColor: string;
  cloudHighlightColor: string;
  cloudBodyColor: string;
  cloudShadowColor: string;
  ambientLight: number;

  activeWeather: WeatherType;
  targetWeather: WeatherType;
  weatherTransition: number; // [0, 1]

  specialEvent: SpecialSkyEvent;
  specialEventIntensity: number; // [0, 1]
  biomeId: BiomeId;

  ambientAtmosphere: AmbientAtmosphere;
}
