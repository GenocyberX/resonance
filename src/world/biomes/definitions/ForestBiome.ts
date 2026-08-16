import { BiomeDefinition } from '../../types';
import { PineTreeSprite } from '../../../sprites/scenery/PineTreeSprite';
import { DeciduousTreeSprite } from '../../../sprites/scenery/DeciduousTreeSprite';
import { RockSprite } from '../../../sprites/obstacles/RockSprite';
import { StreetLampSprite } from '../../../sprites/scenery/StreetLampSprite';

export const ForestBiome: BiomeDefinition = {
  id: 'FOREST',
  name: 'Misty Pine Forest',
  palette: {
    skyTop: '#064e3b',       // Deep Spruce Green
    skyBottom: '#059669',    // Forest Mist
    horizon: '#34d399',      // Bright Canopy Rim
    road: '#0f172a',         // Damp Highway Asphalt
    roadMarking: '#fde047',  // Amber Divider
    roadShoulder: '#065f46', // Mossy Verge
    ground: '#022c22',       // Dark Pine Bed
    groundDetail: '#10b981', // Pine Needles
    mountains: '#047857',    // Rolling Pine Hills
    fog: '#d1fae5',
  },
  vegetationPool: [
    { sprite: PineTreeSprite, weight: 0.65 },
    { sprite: DeciduousTreeSprite, weight: 0.35 },
  ],
  structurePool: [
    { sprite: StreetLampSprite, weight: 0.4 },
  ],
  obstaclePool: [
    { sprite: RockSprite, weight: 0.4 },
  ],
  density: 1.35,
  groundChar: '"',
  mountainChar: 'A',
};
