import { describe, it, expect } from 'vitest';
import { RoadGenerator } from '../src/road/RoadGenerator';
import { BiomeTransitionSystem } from '../src/world/transitions/BiomeTransitionSystem';
import { WorldDirector } from '../src/world/WorldDirector';
import { WorldEngine } from '../src/world/WorldEngine';
import { FrameBuffer } from '../src/ascii/FrameBuffer';

describe('World-Space Terrain Composition & SceneRegions', () => {
  const road = new RoadGenerator(2026);
  const roadHalfWidth = road.defaultRoadWidth * 0.5; // 400
  const safetyMargin = 40;
  const minSafeOffset = roadHalfWidth + safetyMargin; // 440

  it('guarantees world-space shoreline offset is always strictly outside roadRight', () => {
    const biomeSystem = new BiomeTransitionSystem();
    const director = new WorldDirector(2026, biomeSystem);

    for (let z = 0; z < 5000; z += 100) {
      const shoreline = director.getShorelineOffsetAtZ(z, roadHalfWidth);
      expect(shoreline).toBeGreaterThan(roadHalfWidth);
      expect(shoreline).toBeGreaterThanOrEqual(750);
      expect(shoreline).toBeLessThanOrEqual(950);
    }
  });

  it('verifies SceneRegions are deterministic and within the 600-1800 world unit length range', () => {
    const biomeSystem = new BiomeTransitionSystem();
    const directorA = new WorldDirector(2026, biomeSystem);
    const directorB = new WorldDirector(2026, biomeSystem);

    directorA.ensureRegionsAhead(4000);
    directorB.ensureRegionsAhead(4000);

    for (let z = 0; z < 4000; z += 200) {
      const regionA = directorA.getRegionAtZ(z);
      const regionB = directorB.getRegionAtZ(z);

      expect(regionA.type).toBe(regionB.type);
      expect(regionA.startZ).toBe(regionB.startZ);
      expect(regionA.length).toBe(regionB.length);
      expect(regionA.length).toBeGreaterThanOrEqual(600);
      expect(regionA.length).toBeLessThanOrEqual(1800);
    }
  });

  it('enforces surface-aware scenery constraints (no boats on land, no hotels in water or on road)', () => {
    const biomeSystem = new BiomeTransitionSystem();
    const director = new WorldDirector(2026, biomeSystem);

    director.update(0, road, 3500);
    const scenery = director.getScenery();

    for (const obj of scenery) {
      const shoreline = director.getShorelineOffsetAtZ(obj.z, roadHalfWidth);

      if (!obj.isCollidable) {
        // Must not be on the road
        expect(Math.abs(obj.lateralOffset)).toBeGreaterThanOrEqual(minSafeOffset);

        // Watercraft must only be in water zone
        if (obj.sprite.id === 'scenery_sailboat' || obj.sprite.id === 'scenery_small_boat') {
          expect(obj.lateralOffset).toBeGreaterThan(shoreline);
        }

        // Inland structures must only be on inland left side
        if (
          obj.sprite.id === 'scenery_coastal_hotel' ||
          obj.sprite.id === 'scenery_roadside_cafe' ||
          obj.sprite.id === 'scenery_billboard'
        ) {
          expect(obj.lateralOffset).toBeLessThanOrEqual(-minSafeOffset);
        }
      }
    }
  });

  it('initializes Golden Tropical reference mode with fixed seed and daytime state', () => {
    const engine = new WorldEngine(2026);
    engine.setVisualTestMode(true, 'FLAT_STRAIGHT', 'day', true);

    const mode = engine.getVisualTestMode();
    expect(mode.isVisualTest).toBe(true);
    expect(mode.isGolden).toBe(true);
    expect(mode.time).toBe('day');

    const fb = new FrameBuffer(120, 42);
    engine.update(0.016, {
      targetSpeedBonus: 0,
      cameraBounce: 0,
      fovPulse: 0,
      tension: 0,
      particleDensity: 0,
      environmentalGlow: 0,
    }, 120, 42);

    engine.render(fb);

    const telemetry = engine.getContainmentTelemetry();
    expect(telemetry.playerScreenX).toBeGreaterThanOrEqual(120 * 0.35);
    expect(telemetry.playerScreenX).toBeLessThanOrEqual(120 * 0.65);
  });
});
