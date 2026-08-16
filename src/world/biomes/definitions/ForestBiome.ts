import { BiomeDefinition } from '../../types';
import { PineTreeSprite } from '../../../sprites/scenery/PineTreeSprite';
import { DeciduousTreeSprite } from '../../../sprites/scenery/DeciduousTreeSprite';
import { RockSprite } from '../../../sprites/obstacles/RockSprite';

export const ForestBiome: BiomeDefinition = {
  id: 'FOREST',
  name: 'Misty Pine Woods',
  palette: {
    skyTop: '#064e3b',       // Deep Spruce
    skyBottom: '#10b981',    // Emerald Fog
    horizon: '#34d399',      // Mist Horizon
    road: '#1e293b',         // Dark Slate Road
    roadMarking: '#facc15',  // Amber Marking
    roadShoulder: '#064e3b', // Deep Moss Shoulder
    ground: '#022c22',       // Dark Forest Bed
    groundDetail: '#059669', // Pine Needles
    mountains: '#065f46',    // Pine Ridges
    fog: '#a7f3d0',
  },
  vegetationPool: [
    { sprite: PineTreeSprite, weight: 0.6 },
    { sprite: DeciduousTreeSprite, weight: 0.4 },
  ],
  structurePool: [],
  obstaclePool: [
    { sprite: RockSprite, weight: 0.4 },
  ],
  density: 1.4,
  groundChar: '"',
  mountainChar: 'A',
};
