import { describe, it, expect } from 'vitest';
import { ColorPalette } from '../src/ascii/ColorPalette';
import { MusicStateEngine } from '../src/audio/MusicStateEngine';
import { AudioFeatures } from '../src/audio/types';

describe('Audio Logic & MusicStateEngine', () => {
  it('ColorPalette properly clamps and lerps hex colors', () => {
    const black = '#000000';
    const white = '#ffffff';

    expect(ColorPalette.lerp(black, white, 0.0).toLowerCase()).toBe('#000000');
    expect(ColorPalette.lerp(black, white, 1.0).toLowerCase()).toBe('#ffffff');
    const mid = ColorPalette.lerp(black, white, 0.5).toLowerCase();
    expect(mid).toBe('#808080');
  });

  it('MusicStateEngine applies smoothing without crashing on edge values', () => {
    const engine = new MusicStateEngine();
    const mockFeature: AudioFeatures = {
      bass: 0.8,
      mids: 0.5,
      treble: 0.3,
      energy: 0.7,
      rms: 0.6,
      spectralCentroid: 0.4,
      spectralFlux: 0.5,
      beat: true,
      beatConfidence: 0.9,
      timestamp: 1.0,
    };

    const state = engine.update(mockFeature, 0.016);
    expect(state.bassIntensity).toBeGreaterThan(0);
    expect(state.bassIntensity).toBeLessThanOrEqual(1.0);
    expect(state.energy).toBeGreaterThan(0);
    expect(state.beatPulse).toBe(1.0);
    expect(state.state).toBeDefined();
  });

  it('MusicStateEngine decays beatPulse properly over frames without beats', () => {
    const engine = new MusicStateEngine();
    const beatFeature: AudioFeatures = {
      bass: 0.8,
      mids: 0.5,
      treble: 0.3,
      energy: 0.7,
      rms: 0.6,
      spectralCentroid: 0.4,
      spectralFlux: 0.5,
      beat: true,
      beatConfidence: 0.9,
      timestamp: 1.0,
    };

    let state = engine.update(beatFeature, 0.016);
    expect(state.beatPulse).toBe(1.0);

    const silentFeature: AudioFeatures = {
      ...beatFeature,
      beat: false,
      spectralFlux: 0.0,
    };

    // Update for several frames
    for (let i = 0; i < 10; i++) {
      state = engine.update(silentFeature, 0.016);
    }

    expect(state.beatPulse).toBeLessThan(1.0);
    expect(state.beatPulse).toBeGreaterThanOrEqual(0.0);
  });
});
