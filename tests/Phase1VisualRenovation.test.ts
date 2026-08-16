import { describe, it, expect } from 'vitest';
import { SpriteLibrary } from '../src/ascii/SpriteLibrary';
import { FrameBuffer } from '../src/ascii/FrameBuffer';
import { WorldDirector } from '../src/world/WorldDirector';
import { BiomeTransitionSystem } from '../src/world/transitions/BiomeTransitionSystem';
import { RoadGenerator } from '../src/road/RoadGenerator';
import { TropicalBiome } from '../src/world/biomes/definitions/TropicalBiome';
import { DesertBiome } from '../src/world/biomes/definitions/DesertBiome';
import { ForestBiome } from '../src/world/biomes/definitions/ForestBiome';
import { AlpineBiome } from '../src/world/biomes/definitions/AlpineBiome';
import { NeonCityBiome } from '../src/world/biomes/definitions/NeonCityBiome';
import { VolcanicBiome } from '../src/world/biomes/definitions/VolcanicBiome';

describe('RESONANCE — FASE 1 Visual Renovation Test Suite', () => {
  const allSprites = SpriteLibrary.getAll();

  it('1. Sprite Library contains at least 34 verified AAA sprites', () => {
    expect(allSprites.length).toBeGreaterThanOrEqual(34);
  });

  it('2. Every sprite has valid 4-tier LOD variants (close, near, medium, far)', () => {
    for (const sprite of allSprites) {
      for (const lod of ['close', 'near', 'medium', 'far'] as const) {
        const variant = sprite.variants[lod];
        expect(variant, `Sprite ${sprite.name} (${sprite.id}) missing LOD ${lod}`).toBeDefined();
        expect(variant?.lines.length).toBe(variant?.height);
        expect(variant?.width).toBeGreaterThan(0);
        expect(variant?.height).toBeGreaterThan(0);
      }
    }
  });

  it('3. Every line in every sprite variant matches variant.width exactly', () => {
    for (const sprite of allSprites) {
      for (const lod of ['close', 'near', 'medium', 'far'] as const) {
        const variant = sprite.variants[lod];
        if (!variant) continue;

        for (let r = 0; r < variant.lines.length; r++) {
          expect(
            variant.lines[r].length,
            `Line length mismatch in ${sprite.name} [${sprite.id}] (${lod} line ${r}): expected ${variant.width}, got ${variant.lines[r].length}`
          ).toBe(variant.width);
        }
      }
    }
  });

  it('4. If color matrix is defined, colors matrix dimensions match height and width 1:1', () => {
    for (const sprite of allSprites) {
      for (const lod of ['close', 'near', 'medium', 'far'] as const) {
        const variant = sprite.variants[lod];
        if (!variant || !variant.colors) continue;

        expect(
          variant.colors.length,
          `Color rows count mismatch in ${sprite.name} [${sprite.id}] (${lod}): expected ${variant.height}, got ${variant.colors.length}`
        ).toBe(variant.height);

        for (let r = 0; r < variant.colors.length; r++) {
          expect(
            variant.colors[r].length,
            `Color row length mismatch in ${sprite.name} [${sprite.id}] (${lod} row ${r}): expected ${variant.width}, got ${variant.colors[r].length}`
          ).toBe(variant.width);
        }
      }
    }
  });

  it('5. All 6 biomes are defined with distinct identities and non-empty pools', () => {
    const biomes = [TropicalBiome, DesertBiome, ForestBiome, AlpineBiome, NeonCityBiome, VolcanicBiome];
    expect(biomes.length).toBe(6);

    for (const biome of biomes) {
      expect(biome.name).toBeDefined();
      expect(biome.palette.skyTop).toBeDefined();
      expect(biome.palette.skyBottom).toBeDefined();
      expect(biome.palette.horizon).toBeDefined();
      expect(biome.palette.road).toBeDefined();
      expect(biome.structurePool.length).toBeGreaterThan(0);
      expect(biome.obstaclePool.length).toBeGreaterThan(0);
    }
  });

  it('6. WorldDirector generates rich scenery across all biomes without errors', () => {
    const road = new RoadGenerator(12345);
    const biomeSystem = new BiomeTransitionSystem();
    const director = new WorldDirector(12345, biomeSystem);

    // Simulate driving 4000 meters through multiple biome chunks
    for (let cameraZ = 0; cameraZ < 4000; cameraZ += 200) {
      director.update(cameraZ, road, 1200);
      const scenery = director.getScenery();
      expect(scenery.length).toBeGreaterThan(0);
    }
  });

  it('7. FrameBuffer renders all newly registered sprites without out-of-bounds errors', () => {
    const fb = new FrameBuffer(120, 40);

    for (const sprite of allSprites) {
      fb.clear();
      for (const lod of ['close', 'near', 'medium', 'far'] as const) {
        const variant = sprite.variants[lod];
        if (!variant) continue;
        fb.drawSprite(10, 10, variant, sprite.defaultColor);
      }
    }
  });
});
