import { BiomeDefinition } from '../../types';
import { PineTreeSprite } from '../../../sprites/scenery/PineTreeSprite';
import { RockSprite } from '../../../sprites/obstacles/RockSprite';
import { StreetLampSprite } from '../../../sprites/scenery/StreetLampSprite';

export const AlpineBiome: BiomeDefinition = {
  id: 'ALPINE',
  name: 'Glacial Pass',
  palette: {
    skyTop: '#1e1b4b',       // Deep Glacial Indigo
    skyBottom: '#3b82f6',    // Ice Blue Sky
    horizon: '#e0f2fe',      // Radiant Snowline
    road: '#1e293b',         // Frozen Blacktop
    roadMarking: '#38bdf8',  // Cyan Reflective Line
    roadShoulder: '#64748b', // Icy Crushed Rock
    ground: '#0f172a',       // Permafrost
    groundDetail: '#f8fafc', // Powder Snow
    mountains: '#f1f5f9',    // Jagged Snow Peaks
    fog: '#e0f2fe',
  },
  vegetationPool: [
    { sprite: PineTreeSprite, weight: 1.0 },
  ],
  structurePool: [
    { sprite: StreetLampSprite, weight: 0.3 },
  ],
  obstaclePool: [
    { sprite: RockSprite, weight: 0.5 },
  ],
  density: 0.85,
  groundChar: '*',
  mountainChar: '^',
};
