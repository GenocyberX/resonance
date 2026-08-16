import { describe, it, expect } from 'vitest';
import { RoadGenerator } from '../src/road/RoadGenerator';
import { PlayerVehicle } from '../src/entities/PlayerVehicle';
import { WorldEngine } from '../src/world/WorldEngine';
import { FrameBuffer } from '../src/ascii/FrameBuffer';

describe('Player Road Containment & Camera Lock Invariants', () => {
  const road = new RoadGenerator(2026);
  const maxDriveable = road.getDriveableHalfWidth(220, 20); // 270

  it('strictly bounds player physical lateral position to driveable road limits via normalizePlayerToRoad', () => {
    const player = new PlayerVehicle(100);

    // Force positive out-of-bounds offset
    player.lateralOffset = 650;
    player.targetLateralOffset = 700;

    const resultPos = road.normalizePlayerToRoad(player);

    expect(resultPos.isWorldClamped).toBe(true);
    expect(player.lateralOffset).toBe(maxDriveable);
    expect(player.targetLateralOffset).toBe(maxDriveable);

    // Force negative out-of-bounds offset
    player.lateralOffset = -999;
    player.targetLateralOffset = -999;
    const resultNeg = road.normalizePlayerToRoad(player);

    expect(resultNeg.isWorldClamped).toBe(true);
    expect(player.lateralOffset).toBe(-maxDriveable);
    expect(player.targetLateralOffset).toBe(-maxDriveable);
  });

  it('guarantees all canonical lane centers reside within physical driveable limits', () => {
    for (const lane of [-1, 0, 1]) {
      const centerOffset = road.getLaneCenterOffset(lane);
      expect(Math.abs(centerOffset)).toBeLessThanOrEqual(maxDriveable);
    }
  });

  it('smoothly recovers to nearest safe canonical lane center when in RECOVER state', () => {
    const player = new PlayerVehicle(100);
    player.driverState = 'RECOVER';
    player.lateralOffset = 210; // Near right lane

    road.normalizePlayerToRoad(player);

    expect(player.lane).toBe(1);
    expect(player.targetLateralOffset).toBeCloseTo(road.getLaneCenterOffset(1), 2);

    // Near left lane
    player.lateralOffset = -220;
    road.normalizePlayerToRoad(player);
    expect(player.lane).toBe(-1);
    expect(player.targetLateralOffset).toBeCloseTo(road.getLaneCenterOffset(-1), 2);
  });

  it('guarantees protagonist sprite screen presentation stays strictly on the road and within 35%-65% screen corridor', () => {
    const engine = new WorldEngine(2026);
    engine.setVisualTestMode(true, 'FLAT_STRAIGHT');

    const width = 120;
    const height = 42;
    const fb = new FrameBuffer(width, height);

    // Test extreme left, center, extreme right
    const testOffsets = [-maxDriveable, 0, maxDriveable];

    for (const offset of testOffsets) {
      engine.getState().player.lateralOffset = offset;
      engine.update(0.016, {
        targetSpeedBonus: 0,
        cameraBounce: 0,
        fovPulse: 0,
        tension: 0,
        particleDensity: 0,
        environmentalGlow: 0,
      }, width, height);

      engine.render(fb);

      const telemetry = engine.getContainmentTelemetry();

      // Check screen bounds
      expect(telemetry.playerScreenX).toBeGreaterThanOrEqual(width * 0.35);
      expect(telemetry.playerScreenX).toBeLessThanOrEqual(width * 0.65);

      // Check road bounds at anchor row
      expect(telemetry.playerScreenX).toBeGreaterThan(telemetry.roadLeftAtPlayerY);
      expect(telemetry.playerScreenX).toBeLessThan(telemetry.roadRightAtPlayerY);
    }
  });

  it('provides stable road geometry averaging even in curves and hills', () => {
    const engine = new WorldEngine(2026);
    const width = 120;
    const height = 42;
    const fb = new FrameBuffer(width, height);

    for (const scenario of ['FLAT_CURVE_LEFT', 'FLAT_CURVE_RIGHT', 'HILL', 'S_CURVE'] as const) {
      engine.setVisualTestMode(true, scenario);
      engine.update(0.016, {
        targetSpeedBonus: 0,
        cameraBounce: 0,
        fovPulse: 0,
        tension: 0,
        particleDensity: 0,
        environmentalGlow: 0,
      }, width, height);

      engine.render(fb);

      const anchorRow = Math.floor(height * 0.82);
      const horizonRow = Math.floor(height * 0.40);
      const geom = engine.getStableRoadGeometryAtRow(anchorRow, height, horizonRow);

      expect(Number.isFinite(geom.center)).toBe(true);
      expect(Number.isFinite(geom.halfWidth)).toBe(true);
      expect(geom.halfWidth).toBeGreaterThan(15);
    }
  });
});
