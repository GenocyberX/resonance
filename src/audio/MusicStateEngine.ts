import { AudioFeatures, MusicState, MusicStateName } from './types';

/**
 * Transforms erratic instant audio features into an organic, smoothed music state.
 * Implements asymmetric attack/decay smoothing, tension tracking, beat impulse decay,
 * and a hysteresis-protected discrete state machine.
 */
export class MusicStateEngine {
  private smoothedEnergy: number = 0;
  private smoothedBass: number = 0;
  private smoothedMids: number = 0;
  private smoothedTreble: number = 0;
  private smoothedBrightness: number = 0;

  private tensionAccumulator: number = 0;
  private rhythmicActivityAccumulator: number = 0;
  private beatPulse: number = 0;

  private currentState: MusicStateName = 'calm';
  private stateDwellTime: number = 0;
  private readonly minStateDwellSeconds: number = 0.8; // Prevent flickering between states

  private previousEnergy: number = 0;

  /**
   * Resets all internal smoothing and state.
   */
  public reset(): void {
    this.smoothedEnergy = 0;
    this.smoothedBass = 0;
    this.smoothedMids = 0;
    this.smoothedTreble = 0;
    this.smoothedBrightness = 0;
    this.tensionAccumulator = 0;
    this.rhythmicActivityAccumulator = 0;
    this.beatPulse = 0;
    this.currentState = 'calm';
    this.stateDwellTime = 0;
    this.previousEnergy = 0;
  }

  /**
   * Asymmetric exponential smoothing helper.
   */
  private smooth(current: number, target: number, attackRate: number, decayRate: number, dt: number): number {
    const rate = target > current ? attackRate : decayRate;
    const factor = 1 - Math.exp(-rate * dt);
    return current + (target - current) * factor;
  }

  /**
   * Updates music state given raw frame features and delta time in seconds.
   */
  public update(features: AudioFeatures, dt: number): MusicState {
    // Clamp delta time to avoid huge leaps on tab backgrounding
    const delta = Math.min(0.1, Math.max(0.001, dt));

    // Smooth continuous frequency bands (Fast attack, smooth decay)
    this.smoothedEnergy = this.smooth(this.smoothedEnergy, features.energy, 18.0, 4.0, delta);
    this.smoothedBass = this.smooth(this.smoothedBass, features.bass, 24.0, 6.0, delta);
    this.smoothedMids = this.smooth(this.smoothedMids, features.mids, 16.0, 5.0, delta);
    this.smoothedTreble = this.smooth(this.smoothedTreble, features.treble, 20.0, 7.0, delta);
    this.smoothedBrightness = this.smooth(this.smoothedBrightness, features.spectralCentroid, 8.0, 3.0, delta);

    // Beat pulse with immediate spike to 1.0 and rapid exponential decay
    if (features.beat) {
      this.beatPulse = Math.max(this.beatPulse, 1.0);
      this.rhythmicActivityAccumulator = Math.min(1.0, this.rhythmicActivityAccumulator + 0.35);
    } else {
      this.beatPulse = Math.max(0, this.beatPulse - delta * 5.0);
    }

    // Leaky decay for rhythmic activity
    this.rhythmicActivityAccumulator = Math.max(0, this.rhythmicActivityAccumulator - delta * 0.4);

    // Tension accumulation (rising energy / spectral flux increase tension)
    const energyDelta = (features.energy - this.previousEnergy) / delta;
    this.previousEnergy = features.energy;

    if (energyDelta > 0.3 || (this.smoothedMids > 0.4 && this.smoothedTreble > 0.4)) {
      this.tensionAccumulator = Math.min(1.0, this.tensionAccumulator + delta * 0.5);
    } else {
      this.tensionAccumulator = Math.max(0, this.tensionAccumulator - delta * 0.25);
    }

    // Update discrete state machine with hysteresis
    this.stateDwellTime += delta;
    this.updateStateMachine(features);

    return {
      energy: this.smoothedEnergy,
      bassIntensity: this.smoothedBass,
      midIntensity: this.smoothedMids,
      trebleIntensity: this.smoothedTreble,
      brightness: this.smoothedBrightness,
      tension: this.tensionAccumulator,
      rhythmicActivity: this.rhythmicActivityAccumulator,
      beatPulse: this.beatPulse,
      state: this.currentState,
      rawFeatures: features,
    };
  }

  private updateStateMachine(features: AudioFeatures): void {
    const energy = this.smoothedEnergy;
    const bass = this.smoothedBass;
    const isBeat = features.beat;

    let candidateState: MusicStateName = this.currentState;

    if (energy < 0.05 && features.rms < 0.03) {
      candidateState = 'silence';
    } else if (energy > 0.70 && bass > 0.65 && isBeat) {
      candidateState = 'drop';
    } else if (energy > 0.55 || (bass > 0.55 && this.rhythmicActivityAccumulator > 0.4)) {
      candidateState = 'energetic';
    } else if (this.tensionAccumulator > 0.5 || (energy > this.previousEnergy && energy > 0.35)) {
      candidateState = 'rising';
    } else if (energy < 0.25 && this.rhythmicActivityAccumulator < 0.2) {
      candidateState = 'breakdown';
    } else {
      candidateState = 'calm';
    }

    // Urgent state switches bypass dwell time (silence or sudden drop)
    const isUrgent = (candidateState === 'silence') || (candidateState === 'drop' && this.currentState !== 'drop');

    if (isUrgent || (candidateState !== this.currentState && this.stateDwellTime >= this.minStateDwellSeconds)) {
      this.currentState = candidateState;
      this.stateDwellTime = 0;
    }
  }

  public getCurrentState(): MusicStateName {
    return this.currentState;
  }
}
