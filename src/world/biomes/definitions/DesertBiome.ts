import { BiomeDefinition } from '../../types';
import { CactusSprite } from '../../../sprites/scenery/CactusSprite';
import { RockSprite } from '../../../sprites/obstacles/RockSprite';
import { BillboardSprite } from '../../../sprites/scenery/BillboardSprite';
import { StreetLampSprite } from '../../../sprites/scenery/StreetLampSprite';

export const DesertBiome: BiomeDefinition = {
  id: 'DESERT',
  name: 'Sunbaked Canyon',
  palette: {
    skyTop: '#9a3412',       // Burnt Copper
    skyBottom: '#f97316',    // Warm Amber
    horizon: '#fde047',      // Golden Sand Dunes
    road: '#292524',         // Dust-Worn Asphalt
    roadMarking: '#fef08a',  // Pale Sun Line
    roadShoulder: '#78350f', // Red Earth Shoulder
    ground: '#451a03',       // Canyon Basin
    groundDetail: '#d97706', // Sand Drifts
    mountains: '#b45309',    // Red Rock Mesas
    fog: '#ffedd5',
  },
  vegetationPool: [
    { sprite: CactusSprite, weight: 1.0 },
  ],
  structurePool: [
    { sprite: StreetLampSprite, weight: 0.3 },
    { sprite: BillboardSprite, weight: 0.2 },
  ],
  obstaclePool: [
    { sprite: RockSprite, weight: 0.7 },
  ],
  density: 0.8,
  groundChar: '.',
  mountainChar: 'M',
};
