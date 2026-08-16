import { BiomeDefinition } from '../../types';
import { PalmTreeSprite } from '../../../sprites/scenery/PalmTreeSprite';
import { ShortPalmSprite } from '../../../sprites/scenery/ShortPalmSprite';
import { TropicalBushSprite } from '../../../sprites/scenery/TropicalBushSprite';
import { CoastalGrassSprite } from '../../../sprites/scenery/CoastalGrassSprite';
import { BeachShackSprite } from '../../../sprites/scenery/BeachShackSprite';
import { RoadsideCafeSprite } from '../../../sprites/scenery/RoadsideCafeSprite';
import { CoastalHotelSprite } from '../../../sprites/scenery/CoastalHotelSprite';
import { LifeguardHutSprite } from '../../../sprites/scenery/LifeguardHutSprite';
import { PierSprite } from '../../../sprites/scenery/PierSprite';
import { SailboatSprite } from '../../../sprites/scenery/SailboatSprite';
import { SmallBoatSprite } from '../../../sprites/scenery/SmallBoatSprite';
import { OceanBuoySprite } from '../../../sprites/scenery/OceanBuoySprite';
import { CoastalRockSprite } from '../../../sprites/scenery/CoastalRockSprite';
import { LighthouseSprite } from '../../../sprites/scenery/LighthouseSprite';
import { BillboardSprite } from '../../../sprites/scenery/BillboardSprite';
import { DirectionSignSprite } from '../../../sprites/scenery/DirectionSignSprite';
import { StreetLampSprite } from '../../../sprites/scenery/StreetLampSprite';
import { HighwayMileMarkerSprite } from '../../../sprites/scenery/HighwayMileMarkerSprite';
import { GuardrailSprite } from '../../../sprites/scenery/GuardrailSprite';
import { TrafficConeSprite } from '../../../sprites/obstacles/TrafficConeSprite';

export const TropicalBiome: BiomeDefinition = {
  id: 'TROPICAL',
  name: 'Tropical Coastline',
  palette: {
    skyTop: '#0369a1',       // Deep Ocean Blue
    skyBottom: '#38bdf8',    // Cyan Breeze
    horizon: '#0284c7',      // Sapphire Ocean Line
    road: '#0f172a',         // Deep Clean Asphalt
    roadMarking: '#fde047',  // Sun Gold Lane Dashes
    roadShoulder: '#059669', // Emerald/Sand Shoulder
    ground: '#064e3b',       // Lush Coastal Ground
    groundDetail: '#d97706', // Warm Golden Sand
    mountains: '#0284c7',    // Distant Tropical Islands
    fog: '#bae6fd',
  },
  vegetationPool: [
    { sprite: PalmTreeSprite, weight: 1.0 },
    { sprite: ShortPalmSprite, weight: 0.8 },
    { sprite: TropicalBushSprite, weight: 0.7 },
    { sprite: CoastalGrassSprite, weight: 0.6 },
  ],
  structurePool: [
    { sprite: CoastalHotelSprite, weight: 0.4 },
    { sprite: RoadsideCafeSprite, weight: 0.4 },
    { sprite: BeachShackSprite, weight: 0.5 },
    { sprite: LifeguardHutSprite, weight: 0.4 },
    { sprite: PierSprite, weight: 0.35 },
    { sprite: CoastalRockSprite, weight: 0.5 },
    { sprite: SailboatSprite, weight: 0.4 },
    { sprite: SmallBoatSprite, weight: 0.35 },
    { sprite: OceanBuoySprite, weight: 0.3 },
    { sprite: LighthouseSprite, weight: 0.2 },
    { sprite: BillboardSprite, weight: 0.35 },
    { sprite: DirectionSignSprite, weight: 0.3 },
    { sprite: StreetLampSprite, weight: 0.6 },
    { sprite: GuardrailSprite, weight: 0.4 },
    { sprite: HighwayMileMarkerSprite, weight: 0.5 },
  ],
  obstaclePool: [
    { sprite: TrafficConeSprite, weight: 0.5 },
  ],
  density: 1.2,
  groundChar: '~',
  mountainChar: '^',
};
