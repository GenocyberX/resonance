/**
 * Normalized instant musical features extracted from Web Audio FFT analysis.
 * All continuous values are normalized between 0.0 and 1.0.
 */
export interface AudioFeatures {
  bass: number;             // [0.0, 1.0] Low frequency band energy (20 - 250 Hz)
  mids: number;             // [0.0, 1.0] Mid frequency band energy (250 - 4000 Hz)
  treble: number;           // [0.0, 1.0] High frequency band energy (4000 - 20000 Hz)

  energy: number;           // [0.0, 1.0] Overall spectral energy
  rms: number;              // [0.0, 1.0] Root Mean Square of time-domain signal

  spectralCentroid: number; // [0.0, 1.0] Center of mass of frequency spectrum (brightness)
  spectralFlux: number;     // [0.0, 1.0] Rate of spectral change between frames (transients)

  beat: boolean;            // Boolean onset detected this frame
  beatConfidence: number;   // [0.0, 1.0] Confidence/strength of the detected beat

  timestamp: number;        // Current playback time in seconds
}

export type MusicStateName =
  | 'calm'
  | 'rising'
  | 'energetic'
  | 'breakdown'
  | 'drop'
  | 'silence';

/**
 * Smoothed and contextualized music state for world simulation.
 */
export interface MusicState {
  energy: number;           // Smoothed overall energy [0.0, 1.0]
  bassIntensity: number;    // Smoothed bass [0.0, 1.0]
  midIntensity: number;     // Smoothed mids [0.0, 1.0]
  trebleIntensity: number;  // Smoothed treble [0.0, 1.0]

  brightness: number;       // Smoothed spectral brightness [0.0, 1.0]
  tension: number;          // Musical tension / build-up accumulation [0.0, 1.0]
  rhythmicActivity: number; // Density of recent beats/transients [0.0, 1.0]

  beatPulse: number;        // Fast decaying impulse (1.0 on beat -> 0.0)

  state: MusicStateName;    // Discrete contextual state
  rawFeatures: AudioFeatures; // Reference to raw instant features
}

/**
 * State of audio playback for UI and synchronization.
 */
export interface AudioPlaybackState {
  isLoaded: boolean;
  isPlaying: boolean;
  isPaused: boolean;
  currentTime: number;
  duration: number;
  title: string;
  volume: number;
}
