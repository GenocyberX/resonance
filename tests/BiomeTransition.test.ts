import { describe, it, expect } from 'vitest';
import { BiomeTransitionSystem } from '../src/world/transitions/BiomeTransitionSystem';
import { ColorPalette } from '../src/ascii/ColorPalette';

describe('BiomeTransitionSystem', () => {
  const system = new BiomeTransitionSystem();

  it('evaluates distance 0 with 0 transition progress', () => {
    const blend = system.evaluate(0);
    expect(blend.currentBiome.id).toBe('TROPICAL');
    expect(blend.transitionProgress).toBe(0);
  });

  it('smoothly interpolates transition progress in transition window', () => {
    const stableZone = system.regionSize - system.transitionZone;
    const midTransitionZ = stableZone + (system.transitionZone / 2);

    const blend = system.evaluate(midTransitionZ);
    expect(blend.transitionProgress).toBeGreaterThan(0.4);
    expect(blend.transitionProgress).toBeLessThan(0.6);
  });

  it('reaches 100% next biome at end of transition', () => {
    const blend = system.evaluate(system.regionSize);
    expect(blend.currentBiome.id).toBe('DESERT');
    expect(blend.transitionProgress).toBe(0);
  });

  it('correctly interpolates palette colors', () => {
    const p1 = {
      skyTop: '#000000',
      skyBottom: '#000000',
      horizon: '#000000',
      road: '#000000',
      roadMarking: '#000000',
      roadShoulder: '#000000',
      ground: '#000000',
      groundDetail: '#000000',
      mountains: '#000000',
      fog: '#000000',
    };
    const p2 = {
      skyTop: '#ffffff',
      skyBottom: '#ffffff',
      horizon: '#ffffff',
      road: '#ffffff',
      roadMarking: '#ffffff',
      roadShoulder: '#ffffff',
      ground: '#ffffff',
      groundDetail: '#ffffff',
      mountains: '#ffffff',
      fog: '#ffffff',
    };

    const blended = system.blendPalettes(p1, p2, 0.5);
    const rgb = ColorPalette.hexToRgb(blended.skyTop);
    expect(rgb.r).toBeCloseTo(128, -1);
    expect(rgb.g).toBeCloseTo(128, -1);
    expect(rgb.b).toBeCloseTo(128, -1);
  });
});
