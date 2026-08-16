import { BiomeDefinition } from '../../types';
import { CactusSprite } from '../../../sprites/scenery/CactusSprite';
import { JoshuaTreeSprite } from '../../../sprites/scenery/JoshuaTreeSprite';
import { DeadTreeSprite } from '../../../sprites/scenery/DeadTreeSprite';
import { CanyonMesaSprite } from '../../../sprites/scenery/CanyonMesaSprite';
import { CanyonButteSprite } from '../../../sprites/scenery/CanyonButteSprite';
import { DesertDuneSprite } from '../../../sprites/scenery/DesertDuneSprite';
import { BoulderClusterSprite } from '../../../sprites/scenery/BoulderClusterSprite';
import { BillboardSprite } from '../../../sprites/scenery/BillboardSprite';
import { WarningSignSprite } from '../../../sprites/scenery/WarningSignSprite';
import { HighwayMileMarkerSprite } from '../../../sprites/scenery/HighwayMileMarkerSprite';
import { RockSprite } from '../../../sprites/obstacles/RockSprite';

export const DesertBiome: BiomeDefinition = {
  id: 'DESERT',
  name: 'Sunbaked Canyon',
  palette: {
    skyTop: '#7c2d12',       // Scorched Terracotta
    skyBottom: '#ea580c',    // Desert Amber
    horizon: '#f97316',      // Golden Canyon Rim
    road: '#1c1917',         // Sunbaked Asphalt
    roadMarking: '#fde047',  // Amber Highway Line
    roadShoulder: '#9a3412', // Rust Canyon Dirt
    ground: '#451a03',       // Deep Ochre Basin
    groundDetail: '#d97706', // Canyon Sand
    mountains: '#78350f',    // Distant Sandstone Cliffs
    fog: '#fed7aa',
  },
  vegetationPool: [
    { sprite: CactusSprite, weight: 0.6 },
    { sprite: JoshuaTreeSprite, weight: 0.5 },
    { sprite: DeadTreeSprite, weight: 0.4 },
  ],
  structurePool: [
    { sprite: CanyonMesaSprite, weight: 0.45 },
    { sprite: CanyonButteSprite, weight: 0.55 },
    { sprite: DesertDuneSprite, weight: 0.5 },
    { sprite: BoulderClusterSprite, weight: 0.5 },
    { sprite: BillboardSprite, weight: 0.3 },
    { sprite: WarningSignSprite, weight: 0.4 },
    { sprite: HighwayMileMarkerSprite, weight: 0.5 },
  ],
  obstaclePool: [
    { sprite: RockSprite, weight: 0.6 },
  ],
  density: 1.1,
  groundChar: '.',
  mountainChar: 'M',
};
