import { FrameBuffer } from '../../ascii/FrameBuffer';
import { ColorPalette } from '../../ascii/ColorPalette';
import { BiomeId, WorldMusicParameters } from '../types';
import { AtmospherePalette } from './AtmospherePalette';
import { CelestialSystem } from './CelestialSystem';
import { CloudManager } from './CloudManager';
import { AuroraSystem } from './AuroraSystem';
import { WeatherManager } from './WeatherManager';
import {
  DayPhase,
  SkyState,
  SpecialSkyEvent,
  WeatherType,
} from './SkyTypes';

export class SkyDirector {
  private celestial: CelestialSystem;
  private clouds: CloudManager;
  private weather: WeatherManager;

  // Master Time Parameters
  public static readonly CYCLE_DURATION_SECONDS: number = 300; // 5 minutes real time per day
  private timeSeconds: number = 75; // Starts near dawn/morning
  private dayCount: number = 14;    // Starts mid-lunar cycle (near full moon)

  private specialEvent: SpecialSkyEvent = 'NONE';
  private specialEventIntensity: number = 0;

  // Visual Test Overrides
  private isVisualTestMode: boolean = false;
  private forcedDayPhase: DayPhase | null = null;
  private lastTargetWeather: WeatherType = 'CLEAR';

  constructor(seed: number) {
    this.celestial = new CelestialSystem(seed);
    this.clouds = new CloudManager(seed);
    this.weather = new WeatherManager(seed);
  }

  public setVisualTestOverride(
    enabled: boolean,
    phase: DayPhase | null = null,
    weather: WeatherType | null = null,
    event: SpecialSkyEvent = 'NONE'
  ): void {
    this.isVisualTestMode = enabled;
    this.forcedDayPhase = phase;
    this.specialEvent = event;
    this.specialEventIntensity = event !== 'NONE' ? 1.0 : 0.0;
    this.weather.setSpecialEvent(event, this.specialEventIntensity);

    if (weather) {
      this.weather.setTargetWeather(weather, true);
      this.lastTargetWeather = weather;
      const coverageInfo = CloudManager.evaluateCoverage(weather);
      this.clouds.initCloudLayers(coverageInfo.coverage);
    }
  }

  public setNormalizedTime(normalized: number): void {
    this.timeSeconds = (normalized % 1.0) * SkyDirector.CYCLE_DURATION_SECONDS;
  }

  public setDayPhase(phase: DayPhase): void {
    const timeline = AtmospherePalette.PHASE_TIMELINE;
    const entry = timeline.find(t => t.phase === phase);
    if (entry) {
      const midPoint = (entry.start + entry.end) * 0.5;
      this.setNormalizedTime(midPoint);
    }
  }

  public setWeather(weather: WeatherType, immediate: boolean = false): void {
    this.weather.setTargetWeather(weather, immediate);
    this.lastTargetWeather = weather;
    const coverageInfo = CloudManager.evaluateCoverage(weather);
    this.clouds.initCloudLayers(coverageInfo.coverage);
  }

  public setSpecialEvent(event: SpecialSkyEvent, intensity: number = 1.0): void {
    // Single-event exclusivity
    this.specialEvent = event;
    this.specialEventIntensity = intensity;
    this.weather.setSpecialEvent(event, intensity);
  }

  /**
   * Main simulation update for the complete atmospheric subsystem.
   */
  public update(
    dt: number,
    biomeId: BiomeId,
    musicParams: WorldMusicParameters,
    screenWidth: number,
    screenHeight: number
  ): SkyState {
    // Advance time unless strictly frozen in visual test
    if (!this.isVisualTestMode) {
      this.timeSeconds = (this.timeSeconds + dt);
      if (this.timeSeconds >= SkyDirector.CYCLE_DURATION_SECONDS) {
        this.timeSeconds %= SkyDirector.CYCLE_DURATION_SECONDS;
        this.dayCount++;
      }
    }

    const normalizedCycle = (this.timeSeconds / SkyDirector.CYCLE_DURATION_SECONDS) % 1.0;

    // 1. Evaluate Time Ramp across all 11 DayPhases
    const timeRampResult = AtmospherePalette.evaluateTimeRamp(normalizedCycle);
    const timePhase = this.forcedDayPhase || timeRampResult.phase;
    const phaseProgress = timeRampResult.phaseProgress;

    // 2. Weather Update
    this.weather.update(dt, this.timeSeconds, screenWidth, screenHeight, biomeId, !this.isVisualTestMode);
    const activeWeather = this.weather.getCurrentWeather();
    const targetWeather = this.weather.getTargetWeather();
    const weatherTransition = this.weather.getTransitionProgress();
    const wind = this.weather.getWind();
    const roadWetness = this.weather.getRoadWetness();

    // 3. Celestial Calculations
    const sunPos = this.celestial.calculateSunPosition(normalizedCycle);
    const moonPos = this.celestial.calculateMoonPosition(normalizedCycle);
    const moonPhaseInfo = this.celestial.getMoonPhaseAtDay(this.dayCount);

    const isNight = timePhase === 'DEEP_NIGHT' || timePhase === 'PRE_DAWN' || timePhase === 'NIGHT';
    const isTwilight = timePhase === 'DAWN' || timePhase === 'SUNRISE' || timePhase === 'GOLDEN_HOUR' || timePhase === 'SUNSET' || timePhase === 'DUSK';

    // Determine prominent celestial heading for celestial clearing zone
    let prominentHeading: number | null = null;
    if (sunPos.visible && (timePhase === 'SUNRISE' || timePhase === 'GOLDEN_HOUR' || timePhase === 'SUNSET' || timePhase === 'DAWN')) {
      prominentHeading = sunPos.headingNorm;
    } else if (isNight && moonPos.visible && moonPhaseInfo.moonlightFactor > 0.5) {
      prominentHeading = moonPos.headingNorm;
    }

    // 4. Cloud Coverage & Drift with Wind & Celestial Avoidance
    const coverageInfo = CloudManager.evaluateCoverage(targetWeather);
    if (this.lastTargetWeather !== targetWeather) {
      this.lastTargetWeather = targetWeather;
      this.clouds.initCloudLayers(coverageInfo.coverage, prominentHeading);
    }

    const cloudSpeedMult = musicParams ? (1.0 + (musicParams.targetSpeedBonus || 0) * 0.2) : 1.0;
    this.clouds.update(dt, cloudSpeedMult, wind.strength);

    // Star visibility: attenuated by daylight, cloud coverage, fog, and moon brightness
    let starVisibility = 0.0;
    if (isNight) {
      starVisibility = Math.min(1.0, (1.0 - (coverageInfo.ratio * 0.70)) * (1.1 - moonPhaseInfo.moonlightFactor * 0.15));
    } else if (isTwilight) {
      const twilightFactor = timePhase === 'DUSK' || timePhase === 'DAWN' ? 0.45 : 0.20;
      starVisibility = twilightFactor * (1.0 - coverageInfo.ratio);
    }

    this.celestial.update(dt, this.timeSeconds, isNight, coverageInfo.ratio, this.specialEvent);

    // Special event: Aurora check (respects exclusivity)
    if (this.specialEvent === 'NONE') {
      if (AuroraSystem.canTriggerAurora(biomeId, timePhase, coverageInfo.ratio)) {
        this.specialEvent = 'AURORA';
        this.specialEventIntensity = 0.85;
      }
    }

    // 5. Atmosphere Palette Pipeline
    let ramp = timeRampResult.ramp;
    ramp = AtmospherePalette.applyBiomeTint(ramp, biomeId);
    ramp = AtmospherePalette.applyWeatherAtmosphere(
      ramp,
      this.weather.getWeatherDarkeningFactor(),
      activeWeather === 'THUNDERSTORM',
      activeWeather === 'SNOW' || activeWeather === 'BLIZZARD'
    );
    ramp = AtmospherePalette.applySpecialEventRamp(ramp, this.specialEvent, this.specialEventIntensity);
    ramp = AtmospherePalette.applyMusicModulation(ramp, musicParams);

    // Lightning Flash illumination
    const isLightning = this.weather.isLightningActive();
    if (isLightning) {
      ramp = {
        ...ramp,
        skyTop: ColorPalette.lerp(ramp.skyTop, '#60a5fa', 0.6),
        skyMid: ColorPalette.lerp(ramp.skyMid, '#93c5fd', 0.7),
        skyBottom: ColorPalette.lerp(ramp.skyBottom, '#dbeafe', 0.8),
        horizonGlow: '#ffffff',
        ambientLight: 1.0,
      };
    }

    // 6. Compute Comprehensive AmbientAtmosphere World Lighting Factors
    const ambientAtmosphere = AtmospherePalette.evaluateAmbientAtmosphere(
      timePhase,
      ramp.ambientLight,
      this.weather.getWeatherDarkeningFactor(),
      roadWetness,
      wind,
      isLightning,
      biomeId
    );

    return {
      timeSeconds: this.timeSeconds,
      normalizedCycle,
      dayCount: this.dayCount,
      timePhase,
      phaseProgress,

      sunElevation: sunPos.elevation,
      sunHeadingNorm: sunPos.headingNorm,
      sunVisible: sunPos.visible && coverageInfo.coverage !== 'OVERCAST',
      sunColor: sunPos.color,

      moonElevation: moonPos.elevation,
      moonHeadingNorm: moonPos.headingNorm,
      moonVisible: moonPos.visible && coverageInfo.coverage !== 'OVERCAST',
      moonPhase: moonPhaseInfo.phase,
      moonPhaseIndex: moonPhaseInfo.phaseIndex,
      moonlightFactor: moonPhaseInfo.moonlightFactor,

      starVisibility,
      cloudCoverage: coverageInfo.coverage,
      cloudCoverageRatio: coverageInfo.ratio,

      fogAmount: (activeWeather === 'FOG' || targetWeather === 'FOG') ? 0.85 : 0.0,
      stormIntensity: (activeWeather === 'THUNDERSTORM' || targetWeather === 'THUNDERSTORM') ? 1.0 : 0.0,
      isLightningFlashing: isLightning,

      skyTopColor: ramp.skyTop,
      skyMidColor: ramp.skyMid,
      skyBottomColor: ramp.skyBottom,
      horizonGlowColor: ramp.horizonGlow,
      cloudColor: ramp.cloudHighlight,
      cloudShadowColor: ramp.cloudShadow,
      ambientLight: ramp.ambientLight,

      activeWeather,
      targetWeather,
      weatherTransition,

      specialEvent: this.specialEvent,
      specialEventIntensity: this.specialEventIntensity,
      biomeId,

      ambientAtmosphere,
    };
  }

  /**
   * Main sky rendering pipeline into the FrameBuffer.
   */
  public render(
    fb: FrameBuffer,
    width: number,
    horizonRow: number,
    screenHeight: number,
    state: SkyState
  ): void {
    // 1. Precompute Cloud Occlusion Map
    this.clouds.buildOcclusionGrid(width, horizonRow);

    // 2. Render Clean, Smooth Sky Gradient & Subtle Horizon Transition
    this.renderSkyGradient(fb, width, horizonRow, state);

    // 3. Render Aurora Borealis (if active)
    if (state.specialEvent === 'AURORA') {
      AuroraSystem.renderAurora(
        fb,
        width,
        horizonRow,
        state.timeSeconds,
        state.specialEventIntensity,
        state.specialEvent,
        (x, y) => this.clouds.isOccluded(x, y)
      );
    }

    // 4. Render Celestial Bodies (Stars, Sun, Moon, Shooting Stars) with cloud occlusion
    this.celestial.renderCelestialBodies(
      fb,
      width,
      horizonRow,
      state.timeSeconds,
      state.timePhase,
      state.starVisibility,
      state.sunElevation,
      state.sunHeadingNorm,
      state.sunVisible,
      state.sunColor,
      state.moonElevation,
      state.moonHeadingNorm,
      state.moonVisible,
      state.moonPhase,
      (x, y) => this.clouds.isOccluded(x, y),
      state.specialEvent
    );

    // 5. Render Multi-Tiered Drifting Cloud Formations
    this.clouds.renderClouds(fb, width, horizonRow, state.cloudColor, state.cloudShadowColor);

    // 6. Render Weather Effects (Lightning Bolts, Fog Bands, Precipitation)
    this.weather.renderWeatherEffects(fb, width, horizonRow, screenHeight);
  }

  /**
   * Renders a clean, smooth vertical sky background gradient with a subtle, non-intrusive horizon transition.
   */
  private renderSkyGradient(
    fb: FrameBuffer,
    width: number,
    horizonRow: number,
    state: SkyState
  ): void {
    for (let y = 0; y < horizonRow; y++) {
      const t = y / Math.max(1, horizonRow);
      const rowColor = t < 0.5
        ? ColorPalette.lerp(state.skyTopColor, state.skyMidColor, t * 2.0)
        : ColorPalette.lerp(state.skyMidColor, state.skyBottomColor, (t - 0.5) * 2.0);

      const rowBg = ColorPalette.scaleBrightness(rowColor, 0.35);

      // Clean open sky: empty character with smooth rowBg
      const isHorizonRow = y === horizonRow - 1;
      const cellBg = isHorizonRow ? ColorPalette.lerp(rowBg, state.horizonGlowColor, 0.22) : rowBg;
      const cellChar = ' ';
      const cellFg = isHorizonRow ? state.horizonGlowColor : rowColor;

      for (let x = 0; x < width; x++) {
        fb.setCell(x, y, cellChar, cellFg, 10000, cellBg, false);
      }
    }
  }

  public getWeatherManager(): WeatherManager {
    return this.weather;
  }

  public getCelestialSystem(): CelestialSystem {
    return this.celestial;
  }

  public getCloudManager(): CloudManager {
    return this.clouds;
  }
}
