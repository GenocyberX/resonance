import { AudioFeatures } from './types';

export interface AnalyzerConfig {
  fftSize: number;
  smoothingTimeConstant: number;
  minDecibels: number;
  maxDecibels: number;
}

const DEFAULT_CONFIG: AnalyzerConfig = {
  fftSize: 1024,
  smoothingTimeConstant: 0.8,
  minDecibels: -90,
  maxDecibels: -10,
};

/**
 * Real-time Web Audio analyzer extracting normalized musical metrics.
 */
export class AudioAnalyzer {
  private analyserNode: AnalyserNode;
  private frequencyData: Uint8Array<ArrayBuffer>;
  private timeDomainData: Uint8Array<ArrayBuffer>;
  private previousNormalizedSpectrum: Float32Array;

  // Beat detection state
  private fluxHistory: number[] = [];
  private readonly historySize: number = 43; // ~0.7 seconds at 60fps
  private lastBeatTime: number = 0;
  private readonly beatRefractoryMs: number = 180; // Minimum time between beats

  constructor(analyserNode: AnalyserNode, config: Partial<AnalyzerConfig> = {}) {
    this.analyserNode = analyserNode;
    const finalConfig = { ...DEFAULT_CONFIG, ...config };

    this.analyserNode.fftSize = finalConfig.fftSize;
    this.analyserNode.smoothingTimeConstant = finalConfig.smoothingTimeConstant;
    this.analyserNode.minDecibels = finalConfig.minDecibels;
    this.analyserNode.maxDecibels = finalConfig.maxDecibels;

    const binCount = this.analyserNode.frequencyBinCount;
    this.frequencyData = new Uint8Array(new ArrayBuffer(binCount));
    this.timeDomainData = new Uint8Array(new ArrayBuffer(binCount));
    this.previousNormalizedSpectrum = new Float32Array(binCount);
  }

  /**
   * Performs analysis of the current audio frame and returns normalized features in [0.0, 1.0].
   */
  public analyze(timestamp: number = 0): AudioFeatures {
    this.analyserNode.getByteFrequencyData(this.frequencyData);
    this.analyserNode.getByteTimeDomainData(this.timeDomainData);

    const binCount = this.frequencyData.length;
    const sampleRate = this.analyserNode.context.sampleRate;
    const hzPerBin = (sampleRate / 2) / binCount;

    // Define frequency bands (Hz)
    const bassMaxHz = 250;
    const midsMaxHz = 4000;
    const trebleMaxHz = 16000;

    const bassMaxBin = Math.max(1, Math.floor(bassMaxHz / hzPerBin));
    const midsMaxBin = Math.max(bassMaxBin + 1, Math.floor(midsMaxHz / hzPerBin));
    const trebleMaxBin = Math.min(binCount, Math.floor(trebleMaxHz / hzPerBin));

    let bassSum = 0;
    let midsSum = 0;
    let trebleSum = 0;
    let totalMagnitude = 0;
    let weightedFrequencySum = 0;
    let spectralFlux = 0;

    // Normalized spectrum for flux and centroid
    for (let i = 0; i < binCount; i++) {
      const mag = this.frequencyData[i] / 255.0;
      totalMagnitude += mag;
      weightedFrequencySum += mag * (i / binCount);

      // Half-wave rectified spectral flux
      const diff = mag - this.previousNormalizedSpectrum[i];
      if (diff > 0) {
        spectralFlux += diff;
      }
      this.previousNormalizedSpectrum[i] = mag;

      // Band accumulation
      if (i < bassMaxBin) {
        bassSum += mag;
      } else if (i < midsMaxBin) {
        midsSum += mag;
      } else if (i < trebleMaxBin) {
        trebleSum += mag;
      }
    }

    const bass = bassMaxBin > 0 ? bassSum / bassMaxBin : 0;
    const mids = (midsMaxBin - bassMaxBin) > 0 ? midsSum / (midsMaxBin - bassMaxBin) : 0;
    const treble = (trebleMaxBin - midsMaxBin) > 0 ? trebleSum / (trebleMaxBin - midsMaxBin) : 0;

    // Energy: RMS of frequency spectrum
    let energySquares = 0;
    for (let i = 0; i < binCount; i++) {
      const norm = this.frequencyData[i] / 255.0;
      energySquares += norm * norm;
    }
    const energy = Math.min(1.0, Math.sqrt(energySquares / binCount) * 1.6);

    // Time-domain RMS
    let timeSquares = 0;
    for (let i = 0; i < this.timeDomainData.length; i++) {
      const sample = (this.timeDomainData[i] - 128) / 128.0;
      timeSquares += sample * sample;
    }
    const rms = Math.min(1.0, Math.sqrt(timeSquares / this.timeDomainData.length));

    // Spectral Centroid [0.0, 1.0]
    const spectralCentroid = totalMagnitude > 0.001
      ? Math.min(1.0, weightedFrequencySum / totalMagnitude)
      : 0;

    // Normalized spectral flux
    const normalizedFlux = Math.min(1.0, (spectralFlux / (binCount * 0.15)));

    // Beat onset detection
    this.fluxHistory.push(normalizedFlux);
    if (this.fluxHistory.length > this.historySize) {
      this.fluxHistory.shift();
    }

    let avgFlux = 0;
    for (let i = 0; i < this.fluxHistory.length; i++) {
      avgFlux += this.fluxHistory[i];
    }
    avgFlux /= Math.max(1, this.fluxHistory.length);

    let varianceSum = 0;
    for (let i = 0; i < this.fluxHistory.length; i++) {
      const d = this.fluxHistory[i] - avgFlux;
      varianceSum += d * d;
    }
    const stdDev = Math.sqrt(varianceSum / Math.max(1, this.fluxHistory.length));
    const dynamicThreshold = avgFlux + stdDev * 1.35 + 0.05;

    const nowMs = performance.now();
    let isBeat = false;
    let beatConfidence = 0;

    if (
      normalizedFlux > dynamicThreshold &&
      normalizedFlux > 0.12 &&
      nowMs - this.lastBeatTime > this.beatRefractoryMs
    ) {
      isBeat = true;
      beatConfidence = Math.min(1.0, (normalizedFlux - dynamicThreshold) / (dynamicThreshold + 0.01) + 0.5);
      this.lastBeatTime = nowMs;
    }

    return {
      bass: Math.min(1.0, bass * 1.35),
      mids: Math.min(1.0, mids * 1.2),
      treble: Math.min(1.0, treble * 1.5),
      energy,
      rms,
      spectralCentroid,
      spectralFlux: normalizedFlux,
      beat: isBeat,
      beatConfidence,
      timestamp,
    };
  }

  /**
   * Helper to get raw frequency data copy.
   */
  public getRawFrequencyData(): Uint8Array {
    return new Uint8Array(this.frequencyData);
  }
}
