import { MusicState } from '../audio/types';
import { WorldMusicParameters } from '../world/types';

/**
 * Translates processed MusicState into World simulation parameters.
 * Isolates the audio analysis logic from the simulation and rendering code.
 */
export class MusicWorldMapper {
  /**
   * Maps current music state to world modifiers.
   */
  public map(state: MusicState): WorldMusicParameters {
    // 1. Speed modulation (Base speed boost during energetic sections and drops)
    let speedBonus = state.energy * 50;
    if (state.state === 'drop') {
      speedBonus += 50;
    } else if (state.state === 'energetic') {
      speedBonus += 30;
    } else if (state.state === 'breakdown' || state.state === 'silence') {
      speedBonus -= 25;
    }

    // 2. Camera vertical bounce driven by bass and beat pulse
    const cameraBounce = state.bassIntensity * 12.0 + state.beatPulse * 8.0;

    // 3. Dynamic Field-of-View pulse from bass hits
    const fovPulse = state.beatPulse * 0.25 + state.bassIntensity * 0.15;

    // 4. Particle density driven by treble and rhythmic activity
    const particleDensity = Math.min(1.0, state.trebleIntensity * 0.8 + state.rhythmicActivity * 0.5);

    // 5. Environmental glow & lighting response
    const environmentalGlow = Math.min(1.0, state.energy * 0.7 + state.brightness * 0.3);

    return {
      targetSpeedBonus: speedBonus,
      cameraBounce,
      fovPulse,
      tension: state.tension,
      particleDensity,
      environmentalGlow,
    };
  }
}
