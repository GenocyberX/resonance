import { describe, it, expect } from 'vitest';
import { RoadGenerator } from '../src/road/RoadGenerator';
import { PlayerVehicle } from '../src/entities/PlayerVehicle';
import { TrafficVehicle } from '../src/entities/TrafficVehicle';
import { CollisionSystem } from '../src/driving/CollisionSystem';

describe('Canonical Lane Geometry & Containment', () => {
  const road = new RoadGenerator(2026);
  const roadWidth = road.defaultRoadWidth; // 800
  const roadHalfWidth = roadWidth * 0.5;   // 400
  const laneWidth = road.getLaneWidth();   // ~266.67

  it('derives canonical lane centers mathematically from road width and lane count', () => {
    expect(laneWidth).toBeCloseTo(roadWidth / 3, 2);
    expect(road.getLaneCenterOffset(-1)).toBeCloseTo(-laneWidth, 2);
    expect(road.getLaneCenterOffset(0)).toBeCloseTo(0, 2);
    expect(road.getLaneCenterOffset(1)).toBeCloseTo(laneWidth, 2);
  });

  it('guarantees all vehicle edges in every lane remain strictly inside road half-width', () => {
    const vehicleWidth = 220;
    const safetyMargin = 20;

    for (const lane of [-1, 0, 1]) {
      const center = road.getLaneCenterOffset(lane);
      const leftEdge = center - vehicleWidth * 0.5;
      const rightEdge = center + vehicleWidth * 0.5;

      expect(leftEdge).toBeGreaterThanOrEqual(-roadHalfWidth + safetyMargin);
      expect(rightEdge).toBeLessThanOrEqual(roadHalfWidth - safetyMargin);
    }
  });

  it('strictly clamps absurd lateral offsets to maxDriveableOffset', () => {
    const maxDriveable = road.getDriveableHalfWidth(220, 20);

    const clampedFarRight = road.clampLateralOffset(900, 220, 20);
    const clampedFarLeft = road.clampLateralOffset(-900, 220, 20);

    expect(clampedFarRight).toBe(maxDriveable);
    expect(clampedFarLeft).toBe(-maxDriveable);
    expect(clampedFarRight).toBeLessThan(roadHalfWidth);
    expect(clampedFarLeft).toBeGreaterThan(-roadHalfWidth);
  });

  it('correctly classifies world X positions into canonical lanes (-1, 0, 1)', () => {
    const z = 200;
    const curve = road.getCurveAt(z);

    const leftX = curve + road.getLaneCenterOffset(-1);
    const centerX = curve + road.getLaneCenterOffset(0);
    const rightX = curve + road.getLaneCenterOffset(1);

    expect(road.getLaneForWorldX(leftX, z)).toBe(-1);
    expect(road.getLaneForWorldX(centerX, z)).toBe(0);
    expect(road.getLaneForWorldX(rightX, z)).toBe(1);
  });

  it('keeps player lateral offset strictly bounded after collision push', () => {
    const collisionSystem = new CollisionSystem();
    const player = new PlayerVehicle(200);
    player.lateralOffset = 250; // Already near right edge
    player.x = player.lateralOffset;

    // Traffic vehicle right next to player pushing right
    const traffic = new TrafficVehicle('t1', 'sedan', 205, 1, 230);
    traffic.x = 230;

    const maxDriveable = road.getDriveableHalfWidth(player.boundingBox.width, 20);
    collisionSystem.checkCollisions(player, [traffic], maxDriveable);

    expect(player.lateralOffset).toBeLessThanOrEqual(maxDriveable);
    expect(player.lateralOffset).toBeGreaterThanOrEqual(-maxDriveable);
  });
});
