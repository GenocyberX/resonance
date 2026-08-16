import { BiomeDefinition } from '../../types';
import { VolcanicVentSprite } from '../../../sprites/scenery/VolcanicVentSprite';
import { BasaltCragSprite } from '../../../sprites/scenery/BasaltCragSprite';
import { DeadTreeSprite } from '../../../sprites/scenery/DeadTreeSprite';
import { BoulderClusterSprite } from '../../../sprites/scenery/BoulderClusterSprite';
import { WarningSignSprite } from '../../../sprites/scenery/WarningSignSprite';
import { HighwayMileMarkerSprite } from '../../../sprites/scenery/HighwayMileMarkerSprite';
import { RockSprite } from '../../../sprites/obstacles/RockSprite';
import { TrafficConeSprite } from '../../../sprites/obstacles/TrafficConeSprite';

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
  vegetationPool: [
    { sprite: DeadTreeSprite, weight: 0.5 },
  ],
  structurePool: [
    { sprite: VolcanicVentSprite, weight: 0.55 },
    { sprite: BasaltCragSprite, weight: 0.6 },
    { sprite: BoulderClusterSprite, weight: 0.45 },
    { sprite: WarningSignSprite, weight: 0.4 },
    { sprite: HighwayMileMarkerSprite, weight: 0.5 },
  ],
  obstaclePool: [
    { sprite: RockSprite, weight: 0.8 },
    { sprite: TrafficConeSprite, weight: 0.2 },
  ],
  density: 1.1,
  groundChar: '#',
  mountainChar: '^',
};
