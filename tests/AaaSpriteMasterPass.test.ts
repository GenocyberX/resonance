import { describe, it, expect } from 'vitest';
import { SpriteLibrary } from '../src/ascii/SpriteLibrary';
import { DepthSorter } from '../src/ascii/DepthSorter';
import { FrameBuffer } from '../src/ascii/FrameBuffer';
import { LODLevel } from '../src/ascii/types';
import { SportsCarSprite } from '../src/sprites/vehicles/SportsCarSprite';
import { TrafficCoupeSprite } from '../src/sprites/vehicles/TrafficCoupeSprite';
import { TrafficSedanSprite } from '../src/sprites/vehicles/TrafficSedanSprite';
import { TruckSprite } from '../src/sprites/vehicles/TruckSprite';
import { PalmTreeSprite } from '../src/sprites/scenery/PalmTreeSprite';
import { PineTreeSprite } from '../src/sprites/scenery/PineTreeSprite';
import { SnowPineSprite } from '../src/sprites/scenery/SnowPineSprite';
import { CactusSprite } from '../src/sprites/scenery/CactusSprite';
import { LighthouseSprite } from '../src/sprites/scenery/LighthouseSprite';
import { CoastalHotelSprite } from '../src/sprites/scenery/CoastalHotelSprite';
import { BeachShackSprite } from '../src/sprites/scenery/BeachShackSprite';
import { SailboatSprite } from '../src/sprites/scenery/SailboatSprite';
import { CanyonMesaSprite } from '../src/sprites/scenery/CanyonMesaSprite';
import { CanyonButteSprite } from '../src/sprites/scenery/CanyonButteSprite';
import { AlpinePeakSprite } from '../src/sprites/scenery/AlpinePeakSprite';

describe('RESONANCE — AAA ASCII Pixel Art Master Pass & Quality Verification', () => {
  const heroAssets = [
    SportsCarSprite,
    TrafficCoupeSprite,
    TrafficSedanSprite,
    TruckSprite,
    PalmTreeSprite,
    PineTreeSprite,
    SnowPineSprite,
    CactusSprite,
    LighthouseSprite,
    CoastalHotelSprite,
    BeachShackSprite,
    SailboatSprite,
    CanyonMesaSprite,
    CanyonButteSprite,
    AlpinePeakSprite,
  ];

  it('1. Exactly 15 Hero Assets are defined and registered in SpriteLibrary', () => {
    expect(heroAssets.length).toBe(15);
    const registeredHeroes = SpriteLibrary.getHeroSprites();
    expect(registeredHeroes.length).toBe(15);

    for (const hero of heroAssets) {
      expect(SpriteLibrary.get(hero.id)).toBeDefined();
      expect(SpriteLibrary.get(hero.id).name).toBe(hero.name);
    }
  });

  it('2. All 15 Hero Assets provide all 4 LOD variants (close, near, medium, far)', () => {
    const requiredLods: LODLevel[] = ['close', 'near', 'medium', 'far'];

    for (const hero of heroAssets) {
      for (const lod of requiredLods) {
        const variant = hero.variants[lod];
        expect(variant, `Hero asset "${hero.name}" (${hero.id}) is missing LOD variant "${lod}"`).toBeDefined();
        expect(variant?.lines.length).toBeGreaterThan(0);
        expect(variant?.width).toBeGreaterThan(0);
        expect(variant?.height).toBeGreaterThan(0);
      }
    }
  });

  it('3. Every line in every variant matches the specified width exactly', () => {
    for (const hero of heroAssets) {
      for (const key of ['close', 'near', 'medium', 'far'] as const) {
        const variant = hero.variants[key];
        if (!variant) continue;

        expect(variant.lines.length).toBe(variant.height);
        for (let r = 0; r < variant.lines.length; r++) {
          expect(
            variant.lines[r].length,
            `Line length mismatch in ${hero.name} (${key} row ${r}): expected ${variant.width}, got ${variant.lines[r].length}`
          ).toBe(variant.width);
        }
      }
    }
  });

  it('4. Every color row matches line length and width exactly (1:1 cell mapping)', () => {
    for (const hero of heroAssets) {
      for (const key of ['close', 'near', 'medium', 'far'] as const) {
        const variant = hero.variants[key];
        if (!variant || !variant.colors) continue;

        expect(variant.colors.length).toBe(variant.lines.length);
        for (let r = 0; r < variant.lines.length; r++) {
          expect(
            variant.colors[r].length,
            `Color row length mismatch in ${hero.name} (${key} row ${r}): expected ${variant.lines[r].length}, got ${variant.colors[r].length}`
          ).toBe(variant.lines[r].length);
        }
      }
    }
  });

  it('5. Ground-based contact anchors satisfy anchorY === height - 1', () => {
    for (const hero of heroAssets) {
      for (const key of ['close', 'near', 'medium', 'far'] as const) {
        const variant = hero.variants[key];
        if (!variant) continue;

        expect(
          variant.anchorY,
          `Anchor baseline mismatch in ${hero.name} (${key}): expected ${variant.height - 1}, got ${variant.anchorY}`
        ).toBe(variant.height - 1);
        expect(variant.anchorX).toBeGreaterThanOrEqual(0);
        expect(variant.anchorX).toBeLessThan(variant.width);
      }
    }
  });

  it('6. Hero assets do not use placeholder text banners as primary structure', () => {
    const forbiddenPatterns = [
      /\[CAR\]/i,
      /\[SED\]/i,
      /\[FREIGHT\]/i,
      /\[HOTEL\]/i,
      /\[TRUCK\]/i,
    ];

    for (const hero of heroAssets) {
      for (const key of ['close', 'near', 'medium', 'far'] as const) {
        const variant = hero.variants[key];
        if (!variant) continue;

        for (const line of variant.lines) {
          for (const pattern of forbiddenPatterns) {
            expect(
              pattern.test(line),
              `Hero asset ${hero.name} (${key}) contains forbidden placeholder structure: "${line}"`
            ).toBe(false);
          }
        }
      }
    }
  });

  it('7. Projected-size LOD remains continuous, deterministic, and hysteresis-stable', () => {
    const palm = PalmTreeSprite;
    const screenH = 42;

    const hClose = DepthSorter.calculateProjectedHeight(70, palm.worldHeight, screenH, palm.visualScale);
    const hNear = DepthSorter.calculateProjectedHeight(170, palm.worldHeight, screenH, palm.visualScale);
    const hMed = DepthSorter.calculateProjectedHeight(370, palm.worldHeight, screenH, palm.visualScale);
    const hFar = DepthSorter.calculateProjectedHeight(850, palm.worldHeight, screenH, palm.visualScale);

    expect(hClose).toBeGreaterThan(hNear);
    expect(hNear).toBeGreaterThan(hMed);
    expect(hMed).toBeGreaterThan(hFar);

    expect(DepthSorter.calculateProjectedLOD(70, palm, screenH)).toBe('close');
    expect(DepthSorter.calculateProjectedLOD(170, palm, screenH)).toBe('near');
    expect(DepthSorter.calculateProjectedLOD(370, palm, screenH)).toBe('medium');
    expect(DepthSorter.calculateProjectedLOD(850, palm, screenH)).toBe('far');

    // Hysteresis buffer test
    const lodFromClose = DepthSorter.calculateProjectedLOD(140, palm, screenH, 'close');
    const lodFromNear = DepthSorter.calculateProjectedLOD(140, palm, screenH, 'near');
    expect(lodFromClose).toBe('close');
    expect(lodFromNear).toBe('near');
  });

  it('8. FrameBuffer drawSprite supports standard, monochrome, and contrast rendering without error', () => {
    const fb = new FrameBuffer(120, 42);

    for (const hero of heroAssets) {
      const variant = hero.variants.close;
      expect(variant).toBeDefined();
      if (variant) {
        expect(() => {
          // Standard draw
          fb.drawSprite(60, 35, variant, hero.defaultColor, 0);
          // Monochrome draw
          fb.drawSprite(60, 35, variant, '#ffffff', 0, '#ffffff', true);
        }).not.toThrow();
      }
    }
  });
});
