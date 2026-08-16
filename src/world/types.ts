import { SpriteDefinition } from '../ascii/types';
import { DayPhase as SkyDayPhase, MoonPhase, CloudCoverage, WeatherType as SkyWeatherType, SpecialSkyEvent, SkyState } from './sky/SkyTypes';

export type BiomeId =
  | 'TROPICAL'
  | 'DESERT'
  | 'FOREST'
  | 'ALPINE'
  | 'NEON_CITY'
  | 'VOLCANIC';

export type DayPhase = SkyDayPhase;
export type MoonPhaseType = MoonPhase;
export type CloudCoverageType = CloudCoverage;
export type WeatherType = SkyWeatherType;

export type TerrainSurfaceType =
  | 'INLAND'
  | 'ROADSIDE'
  | 'BEACH'
  | 'SHORELINE'
  | 'WATER'
  | 'LANDMARK'
  | 'STRUCTURE';

export interface SceneRegion {
  type: string;
  startZ: number;
  length: number;
  density: number;
  landmark?: string;
  variationSeed: number;
}

export interface ProjectedTerrainSlice {
  worldZ: number;
  screenY: number;
  depth: number;
  curveX: number;
  elevY: number;
  roadLeftScreen: number;
  roadRightScreen: number;
  beachRightScreen: number;
  shorelineScreen: number;
  oceanFarScreen: number;
  inlandFarScreen: number;
}

export interface BiomePalette {
  skyTop: string;
  skyBottom: string;
  horizon: string;
  road: string;
  roadMarking: string;
  roadShoulder: string;
  ground: string;
  groundDetail: string;
  mountains: string;
  fog: string;
}

export interface BiomeDefinition {
  id: BiomeId;
  name: string;
  palette: BiomePalette;
  vegetationPool: { sprite: SpriteDefinition; weight: number }[];
  structurePool: { sprite: SpriteDefinition; weight: number }[];
  obstaclePool: { sprite: SpriteDefinition; weight: number }[];
  density: number;             // Base scenery density factor
  groundChar: string;          // Ground detail ASCII character (e.g. '.', ',', '~', '#')
  mountainChar: string;        // Horizon peak character
}

export interface BiomeBlendState {
  currentBiome: BiomeDefinition;
  nextBiome: BiomeDefinition;
  transitionProgress: number;  // 0.0 (100% current) -> 1.0 (100% next)
  blendedPalette: BiomePalette;
}

export interface DayNightState {
  timeSeconds: number;         // 0 to 300 seconds (5 min real-world period)
  normalizedCycle: number;     // [0.0, 1.0)
  phase: DayPhase;
  phaseProgress: number;       // [0.0, 1.0) within phase
  ambientLight: number;        // [0.20, 1.0]
  sunElevation: number;        // Screen row offset for sun/moon
  sunColor: string;
  starIntensity: number;       // [0.0, 1.0] for night sky stars
  blendedSkyTop: string;
  blendedSkyBottom: string;
}

export interface WeatherState {
  type: WeatherType;
  intensity: number;           // [0.0, 1.0]
  particles: WeatherParticle[];
}

export interface WeatherParticle {
  x: number;
  y: number;
  speedY: number;
  speedX: number;
  char: string;
  color: string;
  life: number;
}

export interface AmbientParticle {
  x: number;
  y: number;
  z: number;
  char: string;
  color: string;
  vx: number;
  vy: number;
  vz: number;
  life: number;
  maxLife: number;
}

export interface WorldMusicParameters {
  targetSpeedBonus: number;
  cameraBounce: number;
  fovPulse: number;
  tension: number;
  particleDensity: number;
  environmentalGlow: number;
}

export type { SkyState, SpecialSkyEvent };
