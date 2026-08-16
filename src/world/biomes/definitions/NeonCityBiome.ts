import { BiomeDefinition } from '../../types';
import { NeonTowerSprite } from '../../../sprites/scenery/NeonTowerSprite';
import { BillboardSprite } from '../../../sprites/scenery/BillboardSprite';
import { TrafficConeSprite } from '../../../sprites/obstacles/TrafficConeSprite';

export const NeonCityBiome: BiomeDefinition = {
  id: 'NEON_CITY',
  name: 'Cyber Metropolis',
  palette: {
    skyTop: '#090514',       // Midnight Void
    skyBottom: '#4c1d95',    // Electric Purple
    horizon: '#ec4899',      // Hot Magenta Skyline
    road: '#0f172a',         // Glossy Wet Asphalt
    roadMarking: '#06b6d4',  // Neon Cyan Line
    roadShoulder: '#831843', // Deep Pink Curb
    ground: '#020617',       // Urban Base
    groundDetail: '#d946ef', // Neon Floor Grids
    mountains: '#701a75',    // Skyline Silhouettes
    fog: '#f472b6',
  },
  vegetationPool: [],
  structurePool: [
    { sprite: NeonTowerSprite, weight: 0.7 },
    { sprite: BillboardSprite, weight: 0.3 },
  ],
  obstaclePool: [
    { sprite: TrafficConeSprite, weight: 0.8 },
  ],
  density: 1.2,
  groundChar: '+',
  mountainChar: '|',
};
