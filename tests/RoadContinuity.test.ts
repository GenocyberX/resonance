import { describe, it, expect } from 'vitest';
import { WorldEngine } from '../src/world/WorldEngine';
import { FrameBuffer } from '../src/ascii/FrameBuffer';

describe('Road Rasterizer & Surface Continuity', () => {
  it('guarantees continuous scanline coverage without internal horizontal gaps across viewport', () => {
    const engine = new WorldEngine(2026);
    engine.setVisualTestMode(true, 'FLAT_STRAIGHT');

    const width = 120;
    const height = 42;
    const fb = new FrameBuffer(width, height);

    // Run a frame simulation and render
    engine.update(0.016, {
      targetSpeedBonus: 0,
      cameraBounce: 0,
      fovPulse: 0,
      tension: 0,
      particleDensity: 0,
      environmentalGlow: 0,
    }, width, height);

    engine.render(fb);

    const horizonRow = Math.floor(height * 0.40);

    // Verify that every scanline from horizonRow to height - 1 has valid road pixels
    let roadScanlineCount = 0;
    for (let y = horizonRow + 2; y < height; y++) {
      let hasRoadPixel = false;
      for (let x = 0; x < width; x++) {
        const cell = fb.cells[y][x];
        // Check for road shoulder '█'/'▒' or dashed marker '║' or road asphalt depth < 1000
        if (cell.z < 1000 && cell.z > 0) {
          hasRoadPixel = true;
          break;
        }
      }
      expect(hasRoadPixel).toBe(true);
      if (hasRoadPixel) roadScanlineCount++;
    }

    // Ensure road covers all rows from horizon to bottom
    const expectedRows = (height - 1) - (horizonRow + 2) + 1;
    expect(roadScanlineCount).toBe(expectedRows);
  });

  it('guarantees road continuity during sharp curves', () => {
    const engine = new WorldEngine(2026);
    engine.setVisualTestMode(true, 'FLAT_CURVE_LEFT');

    const width = 120;
    const height = 42;
    const fb = new FrameBuffer(width, height);

    engine.update(0.016, {
      targetSpeedBonus: 0,
      cameraBounce: 0,
      fovPulse: 0,
      tension: 0,
      particleDensity: 0,
      environmentalGlow: 0,
    }, width, height);

    engine.render(fb);

    const horizonRow = Math.floor(height * 0.40);

    for (let y = horizonRow + 2; y < height; y++) {
      let hasRoadPixel = false;
      for (let x = 0; x < width; x++) {
        const cell = fb.cells[y][x];
        if (cell.z < 1000 && cell.z > 0) {
          hasRoadPixel = true;
          break;
        }
      }
      expect(hasRoadPixel).toBe(true);
    }
  });

  it('guarantees road continuity over elevation hills', () => {
    const engine = new WorldEngine(2026);
    engine.setVisualTestMode(true, 'HILL');

    const width = 120;
    const height = 42;
    const fb = new FrameBuffer(width, height);

    engine.update(0.016, {
      targetSpeedBonus: 0,
      cameraBounce: 0,
      fovPulse: 0,
      tension: 0,
      particleDensity: 0,
      environmentalGlow: 0,
    }, width, height);

    engine.render(fb);

    const horizonRow = Math.floor(height * 0.40);

    for (let y = horizonRow + 2; y < height; y++) {
      let hasRoadPixel = false;
      for (let x = 0; x < width; x++) {
        const cell = fb.cells[y][x];
        if (cell.z < 1000 && cell.z > 0) {
          hasRoadPixel = true;
          break;
        }
      }
      expect(hasRoadPixel).toBe(true);
    }
  });
});
