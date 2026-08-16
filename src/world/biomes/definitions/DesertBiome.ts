import { BiomeDefinition } from '../../types';
import { CactusSprite } from '../../../sprites/scenery/CactusSprite';
import { RockSprite } from '../../../sprites/obstacles/RockSprite';
import { BillboardSprite } from '../../../sprites/scenery/BillboardSprite';

export const DesertBiome: BiomeDefinition = {
  id: 'DESERT',
  name: 'Sunbaked Canyon',
  palette: {
    skyTop: '#7c2d12',       // Burnt Sienna
    skyBottom: '#f97316',    // Bright Orange
    horizon: '#fde047',      // Amber Dunes
    road: '#44403c',         // Dust Grey Road
    roadMarking: '#fafaf9',  // White Stripe
    roadShoulder: '#78350f', // Ochre Shoulder
    ground: '#451a03',       // Sand Base
    groundDetail: '#d97706', // Golden Dunes
    mountains: '#9a3412',    // Red Mesas
    fog: '#fed7aa',
  },
  vegetationPool: [
    { sprite: CactusSprite, weight: 1.0 },
  ],
  structurePool: [
    { sprite: BillboardSprite, weight: 0.15 },
  ],
  obstaclePool: [
    { sprite: RockSprite, weight: 0.6 },
  ],
  density: 0.7,
  groundChar: '.',
  mountainChar: 'M',
};
