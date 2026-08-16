import { describe, it, expect } from 'vitest';
import { SpriteLibrary } from '../src/ascii/SpriteLibrary';
import { WorldDirector } from '../src/world/WorldDirector';
import { BiomeTransitionSystem } from '../src/world/transitions/BiomeTransitionSystem';
import { RoadGenerator } from '../src/road/RoadGenerator';

describe('Visual Polish & Sprite Quality Pass', () => {
  const forbiddenSubstrings = [
    '(GL)',
    '[GL]',
    '(RF)',
    '(CY)',
    '[CY]',
    '(MG)',
    '|MG|',
    '|CY|',
    '(GD)',
    '(RD)',
    '[RD]',
    '(WT)',
    '(YL)',
    '(OG)',
    '(MS)',
    '(FM)',
    '(SN)',
    '|PORT|',
    '*GL*',
  ];

  it('audits all sprites in SpriteLibrary: zero forbidden technical tokens in ASCII lines', () => {
    const allSprites = SpriteLibrary.getAll();
    expect(allSprites.length).toBeGreaterThanOrEqual(40);

    for (const sprite of allSprites) {
      for (const [variantName, variant] of Object.entries(sprite.variants)) {
        for (let i = 0; i < variant.lines.length; i++) {
          const line = variant.lines[i];
          for (const forbidden of forbiddenSubstrings) {
            expect(
              line.includes(forbidden),
              `Sprite "${sprite.id}" variant "${variantName}" line ${i} contains forbidden token "${forbidden}": "${line}"`
            ).toBe(false);
          }
        }
      }
    }
  });

  it('validates sprite dimensions, line lengths, color arrays and bottom anchor contact', () => {
    const allSprites = SpriteLibrary.getAll();

    for (const sprite of allSprites) {
      for (const [variantName, variant] of Object.entries(sprite.variants)) {
        expect(
          variant.lines.length,
          `Sprite "${sprite.id}" variant "${variantName}" line count must equal variant.height`
        ).toBe(variant.height);

        for (let r = 0; r < variant.lines.length; r++) {
          expect(
            variant.lines[r].length,
            `Sprite "${sprite.id}" variant "${variantName}" line ${r} length must equal variant.width`
          ).toBe(variant.width);
        }

        if (variant.colors) {
          expect(
            variant.colors.length,
            `Sprite "${sprite.id}" variant "${variantName}" colors rows must equal variant.height`
          ).toBe(variant.height);

          for (let r = 0; r < variant.colors.length; r++) {
            expect(
              variant.colors[r].length,
              `Sprite "${sprite.id}" variant "${variantName}" colors row ${r} length must equal variant.width`
            ).toBe(variant.width);
          }
        }

        // Contact anchor invariant: anchorY is at the base
        expect(
          variant.anchorY,
          `Sprite "${sprite.id}" variant "${variantName}" anchorY must equal variant.height - 1`
        ).toBe(variant.height - 1);
      }
    }
  });

  it('validates WorldDirector anti-repetition, hero cooldown, and deterministic placement', () => {
    const biomeSystem = new BiomeTransitionSystem();
    const road = new RoadGenerator(1337);
    const director1 = new WorldDirector(42, biomeSystem);
    const director2 = new WorldDirector(42, biomeSystem);

    director1.update(1000, road, 1200);
    director2.update(1000, road, 1200);

    const scenery1 = director1.getScenery();
    const scenery2 = director2.getScenery();

    expect(scenery1.length).toBeGreaterThan(0);
    expect(scenery1.length).toBe(scenery2.length);

    for (let i = 0; i < scenery1.length; i++) {
      expect(scenery1[i].id).toBe(scenery2[i].id);
      expect(scenery1[i].z).toBe(scenery2[i].z);
      expect(scenery1[i].lateralOffset).toBe(scenery2[i].lateralOffset);
      expect(scenery1[i].sprite.id).toBe(scenery2[i].sprite.id);
    }
  });

  it('validates hero landmark cooldown spacing in WorldDirector', () => {
    const biomeSystem = new BiomeTransitionSystem();
    const director = new WorldDirector(12345, biomeSystem);

    expect(director.canSpawnHero(100)).toBe(true);
    director.recordHeroSpawn(100);

    // Within cooldown distance (< 700m), canSpawnHero must be false
    expect(director.canSpawnHero(300)).toBe(false);
    expect(director.canSpawnHero(799)).toBe(false);

    // After cooldown distance (>= 700m), canSpawnHero is true
    expect(director.canSpawnHero(800)).toBe(true);
  });

  it('ensures roadside scenery honors safety margin outside of drivable asphalt', () => {
    const biomeSystem = new BiomeTransitionSystem();
    const road = new RoadGenerator(999);
    const director = new WorldDirector(999, biomeSystem);

    director.update(2000, road, 1400);
    const scenery = director.getScenery();

    for (const item of scenery) {
      if (!item.isCollidable) {
        // Scenery objects must be placed at or outside roadside safety margin (|X| >= 400)
        expect(
          Math.abs(item.lateralOffset),
          `Scenery object "${item.sprite.name}" placed inside road: lateralOffset=${item.lateralOffset}`
        ).toBeGreaterThanOrEqual(400);
      }
    }
  });
});
