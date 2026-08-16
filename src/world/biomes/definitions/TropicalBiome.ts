import { BiomeDefinition } from '../../types';
import { PalmTreeSprite } from '../../../sprites/scenery/PalmTreeSprite';
import { BillboardSprite } from '../../../sprites/scenery/BillboardSprite';
import { TrafficConeSprite } from '../../../sprites/obstacles/TrafficConeSprite';

export const TropicalBiome: BiomeDefinition = {
  id: 'TROPICAL',
  name: 'Tropical Coast',
  palette: {
    skyTop: '#0e7490',       // Ocean Teal
    skyBottom: '#38bdf8',    // Cyan Sky
    horizon: '#22d3ee',      // Turquoise
    road: '#334155',         // Dark Asphalt
    roadMarking: '#facc15',  // Warm Yellow
    roadShoulder: '#065f46', // Emerald Shoulder
    ground: '#064e3b',       // Lush Ground
    groundDetail: '#34d399', // Cyan Flora
    mountains: '#0f766e',    // Distant Isles
    fog: '#67e8f9',
  },
  vegetationPool: [
    { sprite: PalmTreeSprite, weight: 1.0 },
  ],
  structurePool: [
    { sprite: BillboardSprite, weight: 0.2 },
  ],
  obstaclePool: [
    { sprite: TrafficConeSprite, weight: 0.5 },
  ],
  density: 1.0,
  groundChar: '~',
  mountainChar: '^',
};
