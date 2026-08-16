import { Noise } from '../procedural/Noise';
import { RoadSegment } from './types';

export type RoadTestMode =
  | 'NORMAL'
  | 'FLAT_STRAIGHT'
  | 'FLAT_CURVE_LEFT'
  | 'FLAT_CURVE_RIGHT'
  | 'HILL'
  | 'S_CURVE';

export class RoadGenerator {
  private noise: Noise;
  public readonly segmentLength: number = 15;
  public readonly defaultRoadWidth: number = 800;
  public readonly lanes: number = 3;

  private tensionMultiplier: number = 1.0;
  private testMode: RoadTestMode = 'NORMAL';

  constructor(seed: number = 42) {
    this.noise = new Noise(seed);
  }

  public setTestMode(mode: RoadTestMode): void {
    this.testMode = mode;
  }

  public getTestMode(): RoadTestMode {
    return this.testMode;
  }

  public setTension(tension: number): void {
    this.tensionMultiplier = 1.0 + tension * 1.5;
  }

  /**
   * Evaluates road center lateral curve offset at longitudinal distance z.
   */
  public getCurveAt(z: number): number {
    switch (this.testMode) {
      case 'FLAT_STRAIGHT':
        return 0;
      case 'FLAT_CURVE_LEFT':
        return -320 * (1.0 - Math.exp(-Math.max(0, z) * 0.0025));
      case 'FLAT_CURVE_RIGHT':
        return 320 * (1.0 - Math.exp(-Math.max(0, z) * 0.0025));
      case 'HILL':
        return 0;
      case 'S_CURVE':
        return Math.sin(z * 0.003) * 280;
      case 'NORMAL':
      default: {
        const broadCurve = this.noise.noise1D(z * 0.0004) * 380;
        const tightCurve = this.noise.noise1D(z * 0.0012) * 200 * this.tensionMultiplier;
        const sCurve = Math.sin(z * 0.0008) * 150;
        return broadCurve + tightCurve + sCurve;
      }
    }
  }

  /**
   * Evaluates road elevation / hill height at longitudinal distance z.
   */
  public getElevationAt(z: number): number {
    switch (this.testMode) {
      case 'FLAT_STRAIGHT':
      case 'FLAT_CURVE_LEFT':
      case 'FLAT_CURVE_RIGHT':
      case 'S_CURVE':
        return 0;
      case 'HILL':
        return Math.sin(z * 0.004) * 120;
      case 'NORMAL':
      default: {
        // Controlled elevation variations to prevent road from being thrown out of view
        const hill1 = this.noise.noise1D((z + 5000) * 0.0004) * 160;
        const hill2 = Math.cos(z * 0.0002) * 80;
        return hill1 + hill2;
      }
    }
  }

  /**
   * Generates an array of RoadSegments for the visible frustum ahead of cameraZ.
   */
  public getVisibleSegments(cameraZ: number, drawDistance: number = 1000): RoadSegment[] {
    const segments: RoadSegment[] = [];
    const startZ = Math.floor(cameraZ / this.segmentLength) * this.segmentLength;
    const endZ = startZ + drawDistance;

    let index = Math.floor(startZ / this.segmentLength);
    for (let z = startZ; z < endZ; z += this.segmentLength) {
      segments.push({
        index,
        z,
        length: this.segmentLength,
        curve: this.getCurveAt(z),
        elevation: this.getElevationAt(z),
        roadWidth: this.defaultRoadWidth,
        lanes: this.lanes,
      });
      index++;
    }

    return segments;
  }
}
