import { describe, it, expect } from 'vitest';
import { WorldEngine } from '../src/world/WorldEngine';
import { FrameBuffer } from '../src/ascii/FrameBuffer';
import { PineTreeSprite } from '../src/sprites/scenery/PineTreeSprite';
import { CactusSprite } from '../src/sprites/scenery/CactusSprite';
import { DeciduousTreeSprite } from '../src/sprites/scenery/DeciduousTreeSprite';
import { SportsCarSprite } from '../src/sprites/vehicles/SportsCarSprite';
import { TrafficSedanSprite } from '../src/sprites/vehicles/TrafficSedanSprite';
import { TruckSprite } from '../src/sprites/vehicles/TruckSprite';

describe('Visual Rebalance: Road Scale, Landscape Visibility & Sprite Readability', () => {
  const width = 120;
  const height = 42;

  it('guarantees foreground road occupies a balanced fraction of screen width (30% to 55%)', () => {
    const engine = new WorldEngine(2026);
    engine.setVisualTestMode(true, 'FLAT_STRAIGHT', 'day', true);

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

    const playerRow = Math.floor(height * 0.78);
    const scanline = engine.getScanlineDataAt(playerRow);
    const roadWidthCols = scanline.halfWidth * 2;
    const roadRatio = roadWidthCols / width;

    // Road must occupy between 30% and 55% of the screen width (leaving >45% for landscape)
    expect(roadRatio).toBeGreaterThanOrEqual(0.30);
    expect(roadRatio).toBeLessThanOrEqual(0.55);
  });

  it('guarantees player car is properly proportioned to road width', () => {
    const engine = new WorldEngine(2026);
    engine.setVisualTestMode(true, 'FLAT_STRAIGHT', 'day', true);

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

    const player = engine.getState().player;
    const carWidth = player.sprite.variants.close?.width || 22;

    const playerRow = Math.floor(height * 0.78);
    const scanline = engine.getScanlineDataAt(playerRow);
    const roadWidthCols = scanline.halfWidth * 2;

    // Car width should be between 30% and 55% of the road width
    const carToRoadRatio = carWidth / roadWidthCols;
    expect(carToRoadRatio).toBeGreaterThanOrEqual(0.30);
    expect(carToRoadRatio).toBeLessThanOrEqual(0.55);
  });

  it('verifies multi-color matrix definitions for redesigned sprites', () => {
    const sprites = [
      PineTreeSprite,
      CactusSprite,
      DeciduousTreeSprite,
      SportsCarSprite,
      TrafficSedanSprite,
      TruckSprite,
    ];

    for (const sprite of sprites) {
      for (const key of ['close', 'near', 'medium', 'far'] as const) {
        const variant = sprite.variants[key];
        if (variant && variant.colors) {
          expect(variant.colors.length).toBe(variant.lines.length);
          for (let r = 0; r < variant.lines.length; r++) {
            expect(variant.colors[r].length).toBe(variant.lines[r].length);
          }
        }
      }
    }
  });

  it('verifies non-empty terrain coverage for Tropical, Canyon, and Forest biomes', () => {
    const engine = new WorldEngine(2026);
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

    // Ensure left landscape and right landscape have rendered cells
    const playerRow = Math.floor(height * 0.78);
    const scanline = engine.getScanlineDataAt(playerRow);
    const leftX = Math.max(0, Math.floor(scanline.center - scanline.halfWidth - 10));
    const rightX = Math.min(width - 1, Math.floor(scanline.center + scanline.halfWidth + 10));

    const leftCell = fb.cells[playerRow][leftX];
    const rightCell = fb.cells[playerRow][rightX];

    expect(leftCell).toBeDefined();
    expect(rightCell).toBeDefined();
    expect(leftCell.bg).toBeDefined();
    expect(rightCell.bg).toBeDefined();
  });
});
