import { BiomeDefinition } from '../../types';
import { PineTreeSprite } from '../../../sprites/scenery/PineTreeSprite';
import { RockSprite } from '../../../sprites/obstacles/RockSprite';

export const AlpineBiome: BiomeDefinition = {
  id: 'ALPINE',
  name: 'Glacial Peaks',
  palette: {
    skyTop: '#1e1b4b',       // Deep Indigo Sky
    skyBottom: '#60a5fa',    // Cold Frost Blue
    horizon: '#e0f2fe',      // Glacial White Horizon
    road: '#1e293b',         // Icy Asphalt
    roadMarking: '#38bdf8',  // Cyan Stripe
    roadShoulder: '#94a3b8', // Snow Shoulder
    ground: '#0f172a',       // Frozen Earth
    groundDetail: '#e2e8f0', // Snow Flakes / Crust
    mountains: '#f8fafc',    // Snowy Peaks
    fog: '#bae6fd',
  },
  vegetationPool: [
    { sprite: PineTreeSprite, weight: 1.0 },
  ],
  structurePool: [],
  obstaclePool: [
    { sprite: RockSprite, weight: 0.5 },
  ],
  density: 0.8,
  groundChar: '*',
  mountainChar: '^',
};
