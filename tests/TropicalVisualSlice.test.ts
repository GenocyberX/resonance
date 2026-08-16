import { describe, it, expect } from 'vitest';
import { RoadGenerator } from '../src/road/RoadGenerator';
import { BiomeTransitionSystem } from '../src/world/transitions/BiomeTransitionSystem';
import { WorldDirector } from '../src/world/WorldDirector';
import { PalmTreeSprite } from '../src/sprites/scenery/PalmTreeSprite';
import { SportsCarSprite } from '../src/sprites/vehicles/SportsCarSprite';
import { LighthouseSprite } from '../src/sprites/scenery/LighthouseSprite';

describe('Tropical Coastline Visual Slice & Scene Grammar', () => {
  const road = new RoadGenerator(2026);
  const roadHalfWidth = road.defaultRoadWidth * 0.5; // 400
  const safetyMargin = 40;
  const minSafeOffset = roadHalfWidth + safetyMargin; // 440

  it('guarantees WorldDirector places all non-obstacle scenery outside the road with safe margins', () => {
    const biomeSystem = new BiomeTransitionSystem();
    const director = new WorldDirector(2026, biomeSystem);

    // Simulate 3000m of world generation
    director.update(0, road, 3000);
    const scenery = director.getScenery();

    expect(scenery.length).toBeGreaterThan(10);

    for (const obj of scenery) {
      if (!obj.isCollidable) {
        // Scenery objects must be strictly outside driveable road + safety margin
        expect(Math.abs(obj.lateralOffset)).toBeGreaterThanOrEqual(minSafeOffset);
      } else {
        // Obstacles must sit on valid canonical lane centers
        const validOffsets = [
          road.getLaneCenterOffset(-1),
          road.getLaneCenterOffset(0),
          road.getLaneCenterOffset(1),
        ];
        const isOnLane = validOffsets.some(offset => Math.abs(obj.lateralOffset - offset) < 1.0);
        expect(isOnLane).toBe(true);
      }
    }
  });

  it('produces deterministic scenery placement for identical seeds', () => {
    const biomeSystemA = new BiomeTransitionSystem();
    const directorA = new WorldDirector(9999, biomeSystemA);
    directorA.update(0, road, 1500);

    const biomeSystemB = new BiomeTransitionSystem();
    const directorB = new WorldDirector(9999, biomeSystemB);
    directorB.update(0, road, 1500);

    const sceneryA = directorA.getScenery();
    const sceneryB = directorB.getScenery();

    expect(sceneryA.length).toBe(sceneryB.length);
    for (let i = 0; i < sceneryA.length; i++) {
      expect(sceneryA[i].z).toBeCloseTo(sceneryB[i].z, 3);
      expect(sceneryA[i].lateralOffset).toBeCloseTo(sceneryB[i].lateralOffset, 3);
      expect(sceneryA[i].sprite.id).toBe(sceneryB[i].sprite.id);
    }
  });

  it('validates multi-color sprite matrix dimensions and non-empty color mapping', () => {
    const closeVariant = PalmTreeSprite.variants.close;
    expect(closeVariant).toBeDefined();
    expect(closeVariant!.colors).toBeDefined();
    expect(closeVariant!.colors!.length).toBe(closeVariant!.lines.length);

    for (let r = 0; r < closeVariant!.lines.length; r++) {
      expect(closeVariant!.colors![r].length).toBe(closeVariant!.lines[r].length);
    }

    const carClose = SportsCarSprite.variants.close;
    expect(carClose).toBeDefined();
    expect(carClose!.colors).toBeDefined();
    expect(carClose!.colors!.length).toBe(carClose!.lines.length);

    const lighthouseClose = LighthouseSprite.variants.close;
    expect(lighthouseClose).toBeDefined();
    expect(lighthouseClose!.colors).toBeDefined();
  });
});
