import { describe, it, expect } from 'vitest';
import { Perspective } from '../src/road/Perspective';
import { Camera } from '../src/road/types';

describe('Perspective & Coordinate Invariants', () => {
  const camera: Camera = {
    x: 0,
    y: 280,
    z: 0,
    distanceToPlane: 0.44,
    pitch: 0,
    fovPulse: 0,
  };
  const screenWidth = 120;
  const screenHeight = 42;
  const horizonRatio = 0.40;

  it('projects finite coordinates without NaN or Infinity for all valid depths', () => {
    for (let z = 10; z <= 1200; z += 50) {
      const proj = Perspective.project(0, 0, z, camera, screenWidth, screenHeight, horizonRatio);
      expect(Number.isFinite(proj.screenX)).toBe(true);
      expect(Number.isFinite(proj.screenY)).toBe(true);
      expect(Number.isFinite(proj.scale)).toBe(true);
      expect(Number.isFinite(proj.depth)).toBe(true);
    }
  });

  it('monotonically converges screenY toward horizon as Z increases', () => {
    const horizonY = screenHeight * horizonRatio;
    let prevY = 9999;

    for (let z = 50; z <= 1000; z += 50) {
      const proj = Perspective.project(0, 0, z, camera, screenWidth, screenHeight, horizonRatio);
      if (proj.visible) {
        expect(proj.screenY).toBeLessThan(prevY);
        expect(proj.screenY).toBeGreaterThanOrEqual(horizonY - 1);
        prevY = proj.screenY;
      }
    }
  });

  it('strictly decreases road slice width as depth Z increases', () => {
    const halfRoadWidth = 400;
    let prevHalfWidth = 9999;

    for (let z = 50; z <= 1000; z += 50) {
      const slice = Perspective.projectRoadSlice(
        0,
        0,
        z,
        halfRoadWidth,
        camera,
        screenWidth,
        screenHeight,
        horizonRatio
      );

      if (slice.visible) {
        expect(slice.halfWidth).toBeLessThan(prevHalfWidth);
        expect(slice.halfWidth).toBeGreaterThan(0);
        prevHalfWidth = slice.halfWidth;
      }
    }
  });

  it('guarantees near road width is substantially wider than far road width', () => {
    const halfRoadWidth = 400;
    const nearSlice = Perspective.projectRoadSlice(0, 0, 100, halfRoadWidth, camera, screenWidth, screenHeight, horizonRatio);
    const farSlice = Perspective.projectRoadSlice(0, 0, 900, halfRoadWidth, camera, screenWidth, screenHeight, horizonRatio);

    expect(nearSlice.halfWidth).toBeGreaterThan(farSlice.halfWidth * 5);
  });
});
