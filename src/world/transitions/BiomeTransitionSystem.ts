import { ColorPalette } from '../../ascii/ColorPalette';
import type { BiomeBlendState, BiomePalette } from '../types';
import { BiomeRegistry } from '../biomes/BiomeRegistry';
import { SpriteDefinition } from '../../ascii/types';
import { SeededRandom } from '../../procedural/SeededRandom';

export class BiomeTransitionSystem {
  public readonly regionSize: number = 2400;     // World units per biome segment
  public readonly transitionZone: number = 700;  // Length of smooth transition window

  /**
   * Calculates continuous biome state and blended palette for track distance z.
   */
  public evaluate(z: number): BiomeBlendState {
    const safeZ = Math.max(0, z);
    const biomeIndex = Math.floor(safeZ / this.regionSize);
    const offset = safeZ % this.regionSize;

    const currentBiome = BiomeRegistry.getByIndex(biomeIndex);
    const nextBiome = BiomeRegistry.getByIndex(biomeIndex + 1);

    const stableZone = this.regionSize - this.transitionZone;
    let transitionProgress = 0;

    if (offset >= stableZone) {
      const rawProgress = (offset - stableZone) / this.transitionZone;
      // Cosine S-curve for silky smooth interpolation
      transitionProgress = 0.5 - 0.5 * Math.cos(Math.PI * rawProgress);
    }

    const blendedPalette = this.blendPalettes(
      currentBiome.palette,
      nextBiome.palette,
      transitionProgress
    );

    return {
      currentBiome,
      nextBiome,
      transitionProgress,
      blendedPalette,
    };
  }

  /**
   * Blends all color fields of two biome palettes.
   */
  public blendPalettes(p1: BiomePalette, p2: BiomePalette, t: number): BiomePalette {
    return {
      skyTop: ColorPalette.lerp(p1.skyTop, p2.skyTop, t),
      skyBottom: ColorPalette.lerp(p1.skyBottom, p2.skyBottom, t),
      horizon: ColorPalette.lerp(p1.horizon, p2.horizon, t),
      road: ColorPalette.lerp(p1.road, p2.road, t),
      roadMarking: ColorPalette.lerp(p1.roadMarking, p2.roadMarking, t),
      roadShoulder: ColorPalette.lerp(p1.roadShoulder, p2.roadShoulder, t),
      ground: ColorPalette.lerp(p1.ground, p2.ground, t),
      groundDetail: ColorPalette.lerp(p1.groundDetail, p2.groundDetail, t),
      mountains: ColorPalette.lerp(p1.mountains, p2.mountains, t),
      fog: ColorPalette.lerp(p1.fog, p2.fog, t),
    };
  }

  /**
   * Probabilistically samples a scenery sprite based on the current transition blend.
   */
  public sampleScenerySprite(
    blendState: BiomeBlendState,
    rng: SeededRandom
  ): SpriteDefinition | null {
    // Decide whether to pull from current or next biome
    const useNextBiome = rng.next() < blendState.transitionProgress;
    const targetBiome = useNextBiome ? blendState.nextBiome : blendState.currentBiome;

    const combinedPool = [
      ...targetBiome.vegetationPool,
      ...targetBiome.structurePool,
    ];

    if (combinedPool.length === 0) return null;

    let totalWeight = 0;
    for (const item of combinedPool) totalWeight += item.weight;

    let roll = rng.range(0, totalWeight);
    for (const item of combinedPool) {
      roll -= item.weight;
      if (roll <= 0) return item.sprite;
    }

    return combinedPool[0].sprite;
  }

  /**
   * Probabilistically samples an obstacle sprite.
   */
  public sampleObstacleSprite(
    blendState: BiomeBlendState,
    rng: SeededRandom
  ): SpriteDefinition | null {
    const useNext = rng.next() < blendState.transitionProgress;
    const targetBiome = useNext ? blendState.nextBiome : blendState.currentBiome;

    if (targetBiome.obstaclePool.length === 0) return null;
    return rng.choice(targetBiome.obstaclePool).sprite;
  }
}
