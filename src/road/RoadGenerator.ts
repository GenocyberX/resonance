import { Noise } from '../procedural/Noise';
import { RoadSegment } from './types';

export class RoadGenerator {
  private noise: Noise;
  public readonly segmentLength: number = 20;
  public readonly defaultRoadWidth: number = 1800;
  public readonly lanes: number = 3;

  private tensionMultiplier: number = 1.0;

  constructor(seed: number = 42) {
    this.noise = new Noise(seed);
  }

  public setTension(tension: number): void {
    this.tensionMultiplier = 1.0 + tension * 1.5;
  }

  /**
   * Evaluates road center lateral curve offset at longitudinal distance z.
   */
  public getCurveAt(z: number): number {
    // Multi-frequency procedural curves
    const broadCurve = this.noise.noise1D(z * 0.0004) * 800;
    const tightCurve = this.noise.noise1D(z * 0.0015) * 400 * this.tensionMultiplier;
    const sCurve = Math.sin(z * 0.0008) * 300;
    return broadCurve + tightCurve + sCurve;
  }

  /**
   * Evaluates road elevation / hill height at longitudinal distance z.
   */
  public getElevationAt(z: number): number {
    const hill1 = this.noise.noise1D((z + 10000) * 0.0005) * 450;
    const hill2 = Math.cos(z * 0.0003) * 200;
    return hill1 + hill2;
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
