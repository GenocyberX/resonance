import { BiomeDefinition } from '../../types';
import { PineTreeSprite } from '../../../sprites/scenery/PineTreeSprite';
import { TallPineSprite } from '../../../sprites/scenery/TallPineSprite';
import { DeciduousTreeSprite } from '../../../sprites/scenery/DeciduousTreeSprite';
import { ForestFernSprite } from '../../../sprites/scenery/ForestFernSprite';
import { WildflowerPatchSprite } from '../../../sprites/scenery/WildflowerPatchSprite';
import { FallenLogSprite } from '../../../sprites/scenery/FallenLogSprite';
import { BoulderClusterSprite } from '../../../sprites/scenery/BoulderClusterSprite';
import { StreetLampSprite } from '../../../sprites/scenery/StreetLampSprite';
import { HighwayMileMarkerSprite } from '../../../sprites/scenery/HighwayMileMarkerSprite';
import { GuardrailSprite } from '../../../sprites/scenery/GuardrailSprite';
import { WarningSignSprite } from '../../../sprites/scenery/WarningSignSprite';
import { RockSprite } from '../../../sprites/obstacles/RockSprite';

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
    { sprite: PineTreeSprite, weight: 0.7 },
    { sprite: TallPineSprite, weight: 0.7 },
    { sprite: DeciduousTreeSprite, weight: 0.5 },
    { sprite: ForestFernSprite, weight: 0.6 },
    { sprite: WildflowerPatchSprite, weight: 0.4 },
    { sprite: FallenLogSprite, weight: 0.45 },
  ],
  structurePool: [
    { sprite: BoulderClusterSprite, weight: 0.4 },
    { sprite: StreetLampSprite, weight: 0.35 },
    { sprite: GuardrailSprite, weight: 0.5 },
    { sprite: HighwayMileMarkerSprite, weight: 0.55 },
    { sprite: WarningSignSprite, weight: 0.35 },
  ],
  obstaclePool: [
    { sprite: RockSprite, weight: 0.4 },
  ],
  density: 1.35,
  groundChar: '"',
  mountainChar: 'A',
};
