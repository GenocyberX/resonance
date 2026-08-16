import { BiomeDefinition, BiomeId } from '../types';
import { TropicalBiome } from './definitions/TropicalBiome';
import { DesertBiome } from './definitions/DesertBiome';
import { ForestBiome } from './definitions/ForestBiome';
import { AlpineBiome } from './definitions/AlpineBiome';
import { NeonCityBiome } from './definitions/NeonCityBiome';
import { VolcanicBiome } from './definitions/VolcanicBiome';

export class BiomeRegistry {
  private static biomes: Map<BiomeId, BiomeDefinition> = new Map();
  public static readonly sequence: BiomeId[] = [
    'TROPICAL',
    'DESERT',
    'FOREST',
    'ALPINE',
    'NEON_CITY',
    'VOLCANIC',
  ];

  public static initialize(): void {
    const list = [
      TropicalBiome,
      DesertBiome,
      ForestBiome,
      AlpineBiome,
      NeonCityBiome,
      VolcanicBiome,
    ];

    for (const b of list) {
      this.biomes.set(b.id, b);
    }
  }

  public static get(id: BiomeId): BiomeDefinition {
    const biome = this.biomes.get(id);
    if (!biome) {
      return TropicalBiome;
    }
    return biome;
  }

  public static getByIndex(index: number): BiomeDefinition {
    const safeIndex = ((index % this.sequence.length) + this.sequence.length) % this.sequence.length;
    const id = this.sequence[safeIndex];
    return this.get(id);
  }

  public static getAll(): BiomeDefinition[] {
    return Array.from(this.biomes.values());
  }
}

BiomeRegistry.initialize();
