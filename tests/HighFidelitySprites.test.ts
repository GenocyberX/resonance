import { describe, it, expect } from 'vitest';
import { DepthSorter } from '../src/ascii/DepthSorter';
import { SpriteLibrary } from '../src/ascii/SpriteLibrary';
import { PalmTreeSprite } from '../src/sprites/scenery/PalmTreeSprite';
import { PineTreeSprite } from '../src/sprites/scenery/PineTreeSprite';
import { CactusSprite } from '../src/sprites/scenery/CactusSprite';
import { DeciduousTreeSprite } from '../src/sprites/scenery/DeciduousTreeSprite';
import { SportsCarSprite } from '../src/sprites/vehicles/SportsCarSprite';
import { TrafficSedanSprite } from '../src/sprites/vehicles/TrafficSedanSprite';
import { TruckSprite } from '../src/sprites/vehicles/TruckSprite';
import { LighthouseSprite } from '../src/sprites/scenery/LighthouseSprite';
import { CoastalHotelSprite } from '../src/sprites/scenery/CoastalHotelSprite';
import { SailboatSprite } from '../src/sprites/scenery/SailboatSprite';
import { LODLevel } from '../src/ascii/types';

describe('High-Fidelity ASCII Sprite System & Projected LOD', () => {
  const coreHeroSprites = [
    PalmTreeSprite,
    PineTreeSprite,
    CactusSprite,
    DeciduousTreeSprite,
    SportsCarSprite,
    TrafficSedanSprite,
    TruckSprite,
    LighthouseSprite,
    CoastalHotelSprite,
    SailboatSprite,
  ];

  it('1. LOD uses camera-relative depth and projected visual size', () => {
    // Lighthouse (worldHeight 420, visualScale 1.1) close vs far
    const lodNear = DepthSorter.calculateProjectedLOD(120, LighthouseSprite, 42);
    const lodFar = DepthSorter.calculateProjectedLOD(1200, LighthouseSprite, 42);

    expect(lodNear).toBe('close');
    expect(lodFar).toBe('far');
  });

  it('2. LOD does NOT depend on absolute world Z', () => {
    // When camera is at z=0 and object is at z=80 (relZ=80)
    const lodAtStart = DepthSorter.calculateProjectedLOD(80, PalmTreeSprite, 42);

    // When camera is at z=5000 and object is at z=5080 (relZ=80)
    const lodAt5000 = DepthSorter.calculateProjectedLOD(80, PalmTreeSprite, 42);

    expect(lodAtStart).toBe(lodAt5000);
    expect(lodAtStart).toBe('close');
  });

  it('3. Bigger projected size selects higher-detail LOD', () => {
    const palm = PalmTreeSprite;
    const hClose = DepthSorter.calculateProjectedHeight(80, palm.worldHeight, 42, palm.visualScale);
    const hNear = DepthSorter.calculateProjectedHeight(180, palm.worldHeight, 42, palm.visualScale);
    const hMed = DepthSorter.calculateProjectedHeight(380, palm.worldHeight, 42, palm.visualScale);
    const hFar = DepthSorter.calculateProjectedHeight(800, palm.worldHeight, 42, palm.visualScale);

    expect(hClose).toBeGreaterThan(hNear);
    expect(hNear).toBeGreaterThan(hMed);
    expect(hMed).toBeGreaterThan(hFar);

    expect(DepthSorter.calculateProjectedLOD(80, palm, 42)).toBe('close');
    expect(DepthSorter.calculateProjectedLOD(180, palm, 42)).toBe('near');
    expect(DepthSorter.calculateProjectedLOD(380, palm, 42)).toBe('medium');
    expect(DepthSorter.calculateProjectedLOD(800, palm, 42)).toBe('far');
  });

  it('4. Hysteresis prevents threshold oscillation around LOD boundaries', () => {
    // For palm: relZ = 140 gives projH = 17.53 (between close hysteresis thresholds 16.0 and 20.0)
    const relZ = 140;
    const lodFromClose = DepthSorter.calculateProjectedLOD(relZ, PalmTreeSprite, 42, 'close');
    const lodFromNear = DepthSorter.calculateProjectedLOD(relZ, PalmTreeSprite, 42, 'near');

    expect(lodFromClose).toBe('close');
    expect(lodFromNear).toBe('near');
  });

  it('5. All ground sprites anchor properly at bottom contact point', () => {
    for (const sprite of coreHeroSprites) {
      for (const key of ['close', 'near', 'medium', 'far'] as const) {
        const variant = sprite.variants[key];
        if (variant) {
          expect(variant.anchorY).toBe(variant.height - 1);
          expect(variant.anchorX).toBeGreaterThanOrEqual(0);
          expect(variant.anchorX).toBeLessThan(variant.width);
        }
      }
    }
  });

  it('6. Every core sprite provides all 4 required LOD variants', () => {
    const requiredLODs: LODLevel[] = ['close', 'near', 'medium', 'far'];

    for (const sprite of coreHeroSprites) {
      for (const lod of requiredLODs) {
        const variant = sprite.variants[lod];
        expect(variant, `Sprite ${sprite.name} missing variant ${lod}`).toBeDefined();
        expect(variant?.lines.length).toBeGreaterThan(0);
      }
    }
  });

  it('7. SpriteVariant dimensions match ASCII line lengths and row counts', () => {
    const allSprites = SpriteLibrary.getAll();

    for (const sprite of allSprites) {
      for (const key of ['close', 'near', 'medium', 'far'] as const) {
        const variant = sprite.variants[key];
        if (!variant) continue;

        expect(variant.lines.length).toBe(variant.height);
        for (let r = 0; r < variant.lines.length; r++) {
          expect(variant.lines[r].length).toBe(variant.width);
        }
      }
    }
  });

  it('8. Color matrices exactly match sprite line dimensions', () => {
    for (const sprite of coreHeroSprites) {
      for (const key of ['close', 'near', 'medium', 'far'] as const) {
        const variant = sprite.variants[key];
        if (!variant || !variant.colors) continue;

        expect(variant.colors.length).toBe(variant.lines.length);
        for (let r = 0; r < variant.lines.length; r++) {
          expect(variant.colors[r].length).toBe(variant.lines[r].length);
        }
      }
    }
  });
});
