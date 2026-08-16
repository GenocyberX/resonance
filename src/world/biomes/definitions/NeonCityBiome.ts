import { BiomeDefinition } from '../../types';
import { NeonTowerSprite } from '../../../sprites/scenery/NeonTowerSprite';
import { BillboardSprite } from '../../../sprites/scenery/BillboardSprite';
import { StreetLampSprite } from '../../../sprites/scenery/StreetLampSprite';
import { TrafficConeSprite } from '../../../sprites/obstacles/TrafficConeSprite';

export const NeonCityBiome: BiomeDefinition = {
  id: 'NEON_CITY',
  name: 'Cyber Metropolis',
  palette: {
    skyTop: '#090514',       // Midnight Void
    skyBottom: '#581c87',    // Ultraviolet Dusk
    horizon: '#ec4899',      // Neon Magenta Skyline
    road: '#090d16',         // Polished Wet Asphalt
    roadMarking: '#06b6d4',  // Glowing Cyan Line
    roadShoulder: '#9d174d', // Cyberpunk Magenta Curb
    ground: '#020617',       // Urban Grid Matrix
    groundDetail: '#d946ef', // Neon Street Grid Lines
    mountains: '#701a75',    // Megastructure Silhouettes
    fog: '#f472b6',
  },
  vegetationPool: [],
  structurePool: [
    { sprite: NeonTowerSprite, weight: 0.5 },
    { sprite: StreetLampSprite, weight: 0.35 },
    { sprite: BillboardSprite, weight: 0.25 },
  ],
  obstaclePool: [
    { sprite: TrafficConeSprite, weight: 0.8 },
  ],
  density: 1.3,
  groundChar: '+',
  mountainChar: '|',
};
