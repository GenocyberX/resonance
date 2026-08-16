import { BiomeDefinition } from '../../types';
import { RockSprite } from '../../../sprites/obstacles/RockSprite';
import { TrafficConeSprite } from '../../../sprites/obstacles/TrafficConeSprite';
import { StreetLampSprite } from '../../../sprites/scenery/StreetLampSprite';

export const VolcanicBiome: BiomeDefinition = {
  id: 'VOLCANIC',
  name: 'Obsidian Ridge',
  palette: {
    skyTop: '#18181b',       // Volcanic Ash Sky
    skyBottom: '#991b1b',    // Glowing Crimson Magma
    horizon: '#ea580c',      // Fiery Orange Horizon
    road: '#1c1917',         // Basalt Pavement
    roadMarking: '#f97316',  // Molten Glow Line
    roadShoulder: '#7f1d1d', // Solidified Lava Curb
    ground: '#0c0a09',       // Obsidian Crust
    groundDetail: '#dc2626', // Lava Fissures
    mountains: '#450a0a',    // Caldera Volcano Peaks
    fog: '#fb923c',
  },
  vegetationPool: [],
  structurePool: [
    { sprite: StreetLampSprite, weight: 0.2 },
  ],
  obstaclePool: [
    { sprite: RockSprite, weight: 0.8 },
    { sprite: TrafficConeSprite, weight: 0.2 },
  ],
  density: 0.95,
  groundChar: '#',
  mountainChar: '^',
};
