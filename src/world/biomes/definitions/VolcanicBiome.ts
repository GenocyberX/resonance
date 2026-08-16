import { BiomeDefinition } from '../../types';
import { RockSprite } from '../../../sprites/obstacles/RockSprite';
import { TrafficConeSprite } from '../../../sprites/obstacles/TrafficConeSprite';

export const VolcanicBiome: BiomeDefinition = {
  id: 'VOLCANIC',
  name: 'Obsidian Caldera',
  palette: {
    skyTop: '#18181b',       // Smoke Ash Sky
    skyBottom: '#991b1b',    // Fiery Crimson
    horizon: '#f97316',      // Molten Lava Horizon
    road: '#1c1917',         // Basalt Road
    roadMarking: '#ea580c',  // Molten Line
    roadShoulder: '#7f1d1d', // Magma Shoulder
    ground: '#0c0a09',       // Obsidian Earth
    groundDetail: '#dc2626', // Lava Cracks
    mountains: '#450a0a',    // Volcano Peaks
    fog: '#fb923c',
  },
  vegetationPool: [],
  structurePool: [],
  obstaclePool: [
    { sprite: RockSprite, weight: 0.7 },
    { sprite: TrafficConeSprite, weight: 0.3 },
  ],
  density: 0.9,
  groundChar: '#',
  mountainChar: '^',
};
