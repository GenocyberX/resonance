import { BiomeDefinition } from '../../types';
import { SnowPineSprite } from '../../../sprites/scenery/SnowPineSprite';
import { DenseSnowPineSprite } from '../../../sprites/scenery/DenseSnowPineSprite';
import { AlpineShrubSprite } from '../../../sprites/scenery/AlpineShrubSprite';
import { WildflowerPatchSprite } from '../../../sprites/scenery/WildflowerPatchSprite';
import { AlpinePeakSprite } from '../../../sprites/scenery/AlpinePeakSprite';
import { MountainCabinSprite } from '../../../sprites/scenery/MountainCabinSprite';
import { IceSpireSprite } from '../../../sprites/scenery/IceSpireSprite';
import { BoulderClusterSprite } from '../../../sprites/scenery/BoulderClusterSprite';
import { HighwayMileMarkerSprite } from '../../../sprites/scenery/HighwayMileMarkerSprite';
import { GuardrailSprite } from '../../../sprites/scenery/GuardrailSprite';
import { WarningSignSprite } from '../../../sprites/scenery/WarningSignSprite';
import { RockSprite } from '../../../sprites/obstacles/RockSprite';

export const AlpineBiome: BiomeDefinition = {
  id: 'ALPINE',
  name: 'Glacial Pass',
  palette: {
    skyTop: '#1e1b4b',       // Midnight Indigo
    skyBottom: '#3b82f6',    // Glacial Ice Blue
    horizon: '#93c5fd',      // Powder Snow Horizon
    road: '#0f172a',         // Black Ice Asphalt
    roadMarking: '#38bdf8',  // Cyan Reflective Marker
    roadShoulder: '#1e293b', // Frozen Shoulder
    ground: '#e2e8f0',       // Deep Snowpack
    groundDetail: '#94a3b8', // Compacted Permafrost Ice
    mountains: '#1e3a8a',    // Glacial Horn Peaks
    fog: '#e0f2fe',
  },
  vegetationPool: [
    { sprite: SnowPineSprite, weight: 0.7 },
    { sprite: DenseSnowPineSprite, weight: 0.7 },
    { sprite: AlpineShrubSprite, weight: 0.6 },
    { sprite: WildflowerPatchSprite, weight: 0.3 },
  ],
  structurePool: [
    { sprite: AlpinePeakSprite, weight: 0.5 },
    { sprite: MountainCabinSprite, weight: 0.4 },
    { sprite: IceSpireSprite, weight: 0.55 },
    { sprite: BoulderClusterSprite, weight: 0.45 },
    { sprite: GuardrailSprite, weight: 0.5 },
    { sprite: HighwayMileMarkerSprite, weight: 0.55 },
    { sprite: WarningSignSprite, weight: 0.4 },
  ],
  obstaclePool: [
    { sprite: RockSprite, weight: 0.5 },
  ],
  density: 1.25,
  groundChar: '*',
  mountainChar: 'M',
};
