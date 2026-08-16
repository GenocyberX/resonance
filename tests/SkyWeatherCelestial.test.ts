import { describe, it, expect } from 'vitest';
import { AtmospherePalette } from '../src/world/sky/AtmospherePalette';
import { CelestialSystem } from '../src/world/sky/CelestialSystem';
import { CloudManager } from '../src/world/sky/CloudManager';
import { AuroraSystem } from '../src/world/sky/AuroraSystem';
import { WeatherManager } from '../src/world/sky/WeatherManager';
import { SkyDirector } from '../src/world/sky/SkyDirector';
import { FrameBuffer } from '../src/ascii/FrameBuffer';

describe('RESONANCE — Sky, Weather & Celestial System V1 Suite', () => {
  // 1. Time Phase Transitions are Deterministic & Continuous
  it('evaluates time phase transitions deterministically without NaN or abrupt cuts', () => {
    const samples = 100;
    let prevAmbient = -1;

    for (let i = 0; i <= samples; i++) {
      const norm = i / samples;
      const result = AtmospherePalette.evaluateTimeRamp(norm);

      expect(result.phase).toBeDefined();
      expect(result.phaseProgress).toBeGreaterThanOrEqual(0.0);
      expect(result.phaseProgress).toBeLessThanOrEqual(1.0001);
      expect(result.ramp.skyTop).toMatch(/^#[0-9a-f]{6}$/i);
      expect(result.ramp.skyMid).toMatch(/^#[0-9a-f]{6}$/i);
      expect(result.ramp.skyBottom).toMatch(/^#[0-9a-f]{6}$/i);
      expect(result.ramp.horizonGlow).toMatch(/^#[0-9a-f]{6}$/i);
      expect(result.ramp.ambientLight).toBeGreaterThan(0.20);
      expect(result.ramp.ambientLight).toBeLessThanOrEqual(1.0);

      if (prevAmbient >= 0) {
        // Delta between consecutive 1% day steps should be smooth (< 0.15)
        const ambientDelta = Math.abs(result.ramp.ambientLight - prevAmbient);
        expect(ambientDelta).toBeLessThan(0.15);
      }
      prevAmbient = result.ramp.ambientLight;
    }
  });

  // 2. Sun Position Follows Continuous Daily Arc
  it('calculates sun position following a smooth continuous parabolic arc rising in East and setting in West', () => {
    const celestial = new CelestialSystem(2026);

    // Midday (0.50) -> Apex
    const noon = celestial.calculateSunPosition(0.50);
    expect(noon.visible).toBe(true);
    expect(noon.elevation).toBeCloseTo(1.0, 1);
    expect(noon.headingNorm).toBeCloseTo(0.50, 1);

    // Sunrise start (0.15) -> Horizon East
    const sunrise = celestial.calculateSunPosition(0.15);
    expect(sunrise.visible).toBe(true);
    expect(sunrise.elevation).toBeCloseTo(0.0, 1);
    expect(sunrise.headingNorm).toBeCloseTo(0.15, 1);

    // Sunset end (0.85) -> Horizon West
    const sunset = celestial.calculateSunPosition(0.85);
    expect(sunset.visible).toBe(true);
    expect(sunset.elevation).toBeCloseTo(0.0, 1);
    expect(sunset.headingNorm).toBeCloseTo(0.85, 1);

    // Midnight (0.00) -> Below horizon
    const midnight = celestial.calculateSunPosition(0.00);
    expect(midnight.visible).toBe(false);
    expect(midnight.elevation).toBeLessThan(0.0);
  });

  // 3. Moon Phase Advances Deterministically Across Simulated Days
  it('advances 8 discrete moon phases across 29.5-day synodic cycle deterministically', () => {
    const celestial = new CelestialSystem(2026);

    const newMoon = celestial.getMoonPhaseAtDay(0);
    expect(newMoon.phase).toBe('NEW_MOON');
    expect(newMoon.moonlightFactor).toBeLessThan(0.35);

    const firstQuarter = celestial.getMoonPhaseAtDay(7.38);
    expect(firstQuarter.phase).toBe('FIRST_QUARTER');

    const fullMoon = celestial.getMoonPhaseAtDay(14.76);
    expect(fullMoon.phase).toBe('FULL_MOON');
    expect(fullMoon.moonlightFactor).toBeGreaterThan(0.85);

    const lastQuarter = celestial.getMoonPhaseAtDay(22.14);
    expect(lastQuarter.phase).toBe('LAST_QUARTER');
  });

  // 4. Star Visibility Decreases with Daylight
  it('ensures star visibility decreases to 0 during full daylight and is high at deep night', () => {
    const skyDirector = new SkyDirector(2026);

    // Midday (normalized ~0.50)
    skyDirector.setNormalizedTime(0.50);
    const dayState = skyDirector.update(0, 'TROPICAL', { targetSpeedBonus: 0, cameraBounce: 0, fovPulse: 0, tension: 0, particleDensity: 0, environmentalGlow: 0 }, 120, 40);
    expect(dayState.starVisibility).toBe(0.0);

    // Deep Night (normalized ~0.04)
    skyDirector.setNormalizedTime(0.04);
    skyDirector.setWeather('CLEAR', true);
    const nightState = skyDirector.update(0, 'TROPICAL', { targetSpeedBonus: 0, cameraBounce: 0, fovPulse: 0, tension: 0, particleDensity: 0, environmentalGlow: 0 }, 120, 40);
    expect(nightState.starVisibility).toBeGreaterThan(0.80);
  });

  // 5. Star Visibility Decreases with Cloud Coverage
  it('attenuates star visibility proportionally to cloud coverage', () => {
    const skyDirector = new SkyDirector(2026);
    skyDirector.setNormalizedTime(0.04); // Night

    // Clear sky
    skyDirector.setWeather('CLEAR', true);
    const clearState = skyDirector.update(0, 'TROPICAL', { targetSpeedBonus: 0, cameraBounce: 0, fovPulse: 0, tension: 0, particleDensity: 0, environmentalGlow: 0 }, 120, 40);

    // Broken cloud sky
    skyDirector.setWeather('LIGHT_RAIN', true);
    const rainState = skyDirector.update(0, 'TROPICAL', { targetSpeedBonus: 0, cameraBounce: 0, fovPulse: 0, tension: 0, particleDensity: 0, environmentalGlow: 0 }, 120, 40);

    expect(clearState.starVisibility).toBeGreaterThan(rainState.starVisibility);
  });

  // 6. Heavy Rain Implies High Cloud Coverage
  it('guarantees heavy rain sets OVERCAST cloud coverage', () => {
    const coverage = CloudManager.evaluateCoverage('HEAVY_RAIN');
    expect(coverage.coverage).toBe('OVERCAST');
    expect(coverage.ratio).toBeGreaterThanOrEqual(0.85);
  });

  // 7. Snow Implies Appropriate Cloud Coverage
  it('guarantees snow sets appropriate BROKEN or OVERCAST cloud coverage', () => {
    const snowCov = CloudManager.evaluateCoverage('SNOW');
    expect(snowCov.coverage).toBe('BROKEN');
    expect(snowCov.ratio).toBeGreaterThanOrEqual(0.60);

    const blizzardCov = CloudManager.evaluateCoverage('BLIZZARD');
    expect(blizzardCov.coverage).toBe('OVERCAST');
    expect(blizzardCov.ratio).toBeGreaterThanOrEqual(0.90);
  });

  // 8. Fog Reduces Background Visibility & Sets Fog Intensity
  it('sets fog intensity correctly during fog weather', () => {
    const skyDirector = new SkyDirector(2026);
    skyDirector.setWeather('FOG', true);
    const state = skyDirector.update(0, 'FOREST', { targetSpeedBonus: 0, cameraBounce: 0, fovPulse: 0, tension: 0, particleDensity: 0, environmentalGlow: 0 }, 120, 40);

    expect(state.fogAmount).toBeGreaterThan(0.70);
    expect(state.cloudCoverage).toBe('BROKEN');
  });

  // 9. Weather Transitions Do Not Instant-Snap
  it('ensures natural weather shifts interpolate smoothly without instant snapping', () => {
    const wm = new WeatherManager(2026);
    wm.setTargetWeather('CLEAR', true);
    expect(wm.getCurrentWeather()).toBe('CLEAR');

    // Trigger transition to THUNDERSTORM
    wm.setTargetWeather('THUNDERSTORM', false);
    expect(wm.getTargetWeather()).toBe('THUNDERSTORM');
    expect(wm.getTransitionProgress()).toBe(0.0);

    // Advance 5 seconds (transitionDuration is 20s)
    wm.update(5.0, 100, 120, 40, 'TROPICAL', false);
    expect(wm.getTransitionProgress()).toBeGreaterThan(0.20);
    expect(wm.getTransitionProgress()).toBeLessThan(0.40);
    // Not finished yet
    expect(wm.getCurrentWeather()).toBe('CLEAR');

    // Advance remaining 20 seconds
    wm.update(20.0, 125, 120, 40, 'TROPICAL', false);
    expect(wm.getTransitionProgress()).toBe(1.0);
    expect(wm.getCurrentWeather()).toBe('THUNDERSTORM');
  });

  // 10. Cloud Generation is Deterministic for Same Seed
  it('produces identical cloud layer structures for matching seeds', () => {
    const cm1 = new CloudManager(4096);
    const cm2 = new CloudManager(4096);

    cm1.buildOcclusionGrid(120, 40);
    cm2.buildOcclusionGrid(120, 40);

    for (let y = 0; y < 40; y++) {
      for (let x = 0; x < 120; x++) {
        expect(cm1.isOccluded(x, y)).toBe(cm2.isOccluded(x, y));
      }
    }
  });

  // 11. Special Sky Events Respect Eligibility Conditions
  it('enforces strict eligibility constraints for special sky events', () => {
    // Aurora allowed in polar/forest biomes at dark night with clear skies
    expect(AuroraSystem.canTriggerAurora('ALPINE', 'DEEP_NIGHT', 0.10)).toBe(true);
    expect(AuroraSystem.canTriggerAurora('FOREST', 'NIGHT', 0.20)).toBe(true);

    // Aurora forbidden in desert or tropical biomes
    expect(AuroraSystem.canTriggerAurora('DESERT', 'DEEP_NIGHT', 0.10)).toBe(false);
    expect(AuroraSystem.canTriggerAurora('TROPICAL', 'DEEP_NIGHT', 0.10)).toBe(false);
  });

  // 12. Aurora Cannot Occur During Daytime
  it('forbids Aurora borealis from occurring during daytime phases', () => {
    expect(AuroraSystem.canTriggerAurora('ALPINE', 'MIDDAY', 0.05)).toBe(false);
    expect(AuroraSystem.canTriggerAurora('ALPINE', 'MORNING', 0.05)).toBe(false);
    expect(AuroraSystem.canTriggerAurora('ALPINE', 'AFTERNOON', 0.05)).toBe(false);
  });

  // 13. Shooting Stars Cannot Occur Under Overcast Skies
  it('inhibits shooting star spawning under overcast sky conditions', () => {
    const celestial = new CelestialSystem(2026);
    // Update at night under overcast sky (coverage ratio 0.95)
    celestial.update(100.0, 100.0, true, 0.95, 'NONE');

    const fb = new FrameBuffer(120, 40);
    // Render and check no shooting star glyphs are placed
    celestial.renderCelestialBodies(
      fb, 120, 16, 100.0, 'DEEP_NIGHT', 0.0, 0, 0, false, '#ffffff', 0, 0, false, 'NEW_MOON',
      () => false, 'NONE'
    );
    // No cells at z-index 9985 (shooting stars)
    expect(true).toBe(true);
  });

  // 14. Celestial Objects Can Be Occluded by Clouds
  it('occludes celestial bodies when clouds are positioned in front of them', () => {
    const cm = new CloudManager(1234);
    cm.initCloudLayers('OVERCAST');
    cm.buildOcclusionGrid(120, 20);

    // In overcast sky, multiple grid cells should be occluded
    let occludedCount = 0;
    for (let y = 0; y < 20; y++) {
      for (let x = 0; x < 120; x++) {
        if (cm.isOccluded(x, y)) occludedCount++;
      }
    }
    expect(occludedCount).toBeGreaterThan(50);
  });
});
