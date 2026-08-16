import { BiomeDefinition } from '../../types';
import { PalmTreeSprite } from '../../../sprites/scenery/PalmTreeSprite';
import { BillboardSprite } from '../../../sprites/scenery/BillboardSprite';
import { StreetLampSprite } from '../../../sprites/scenery/StreetLampSprite';
import { TrafficConeSprite } from '../../../sprites/obstacles/TrafficConeSprite';

export const TropicalBiome: BiomeDefinition = {
  id: 'TROPICAL',
  name: 'Tropical Coastline',
  palette: {
    skyTop: '#0369a1',       // Deep Ocean Blue
    skyBottom: '#38bdf8',    // Cyan Breeze
    horizon: '#2dd4bf',      // Turquoise Horizon
    road: '#1e293b',         // Dark Asphalt
    roadMarking: '#fde047',  // Sun Gold Line
    roadShoulder: '#059669', // Emerald Shoulder
    ground: '#064e3b',       // Deep Flora
    groundDetail: '#34d399', // Coastal Palms/Reef
    mountains: '#0e7490',    // Distant Tropical Islands
    fog: '#a5f3fc',
  },
  vegetationPool: [
    { sprite: PalmTreeSprite, weight: 1.0 },
  ],
  structurePool: [
    { sprite: StreetLampSprite, weight: 0.4 },
    { sprite: BillboardSprite, weight: 0.2 },
  ],
  obstaclePool: [
    { sprite: TrafficConeSprite, weight: 0.5 },
  ],
  density: 1.1,
  groundChar: '~',
  mountainChar: '^',
};
