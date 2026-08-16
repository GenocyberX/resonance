import { Noise } from '../procedural/Noise';
import { RoadSegment } from './types';
import { PlayerVehicle } from '../entities/PlayerVehicle';

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

  // --- CANONICAL LANE & ROAD GEOMETRY (Single Source of Truth) ---

  /**
   * Width of a single lane in world units (derived mathematically from road width and lane count).
   */
  public getLaneWidth(): number {
    return this.defaultRoadWidth / this.lanes;
  }

  /**
   * Lateral center offset for a lane index (-1 = Left, 0 = Center, +1 = Right).
   */
  public getLaneCenterOffset(lane: number): number {
    // For 3 lanes: lane -1 -> -266.67, lane 0 -> 0, lane 1 -> +266.67
    return lane * this.getLaneWidth();
  }

  /**
   * Maximum safe lateral offset for a vehicle before its outer edge touches the shoulder curb.
   */
  public getDriveableHalfWidth(vehicleWidth: number = 220, safetyMargin: number = 20): number {
    const roadHalfWidth = this.defaultRoadWidth * 0.5;
    return Math.max(50, roadHalfWidth - (vehicleWidth * 0.5) - safetyMargin);
  }

  /**
   * Clamps a lateral offset strictly within the driveable road boundaries.
   */
  public clampLateralOffset(offset: number, vehicleWidth: number = 220, safetyMargin: number = 20): number {
    const maxOffset = this.getDriveableHalfWidth(vehicleWidth, safetyMargin);
    return Math.max(-maxOffset, Math.min(maxOffset, offset));
  }

  /**
   * Classifies which lane (-1, 0, or 1) a world coordinate (worldX, z) occupies.
   */
  public getLaneForWorldX(worldX: number, z: number): number {
    const curve = this.getCurveAt(z);
    const offset = worldX - curve;
    const halfLane = this.getLaneWidth() * 0.5;

    if (offset < -halfLane) return -1;
    if (offset > halfLane) return 1;
    return 0;
  }

  /**
   * Finds the nearest valid lane index for any arbitrary lateral offset.
   */
  public getNearestLane(lateralOffset: number): number {
    const laneWidth = this.getLaneWidth();
    const halfLane = laneWidth * 0.5;

    if (lateralOffset < -halfLane) return -1;
    if (lateralOffset > halfLane) return 1;
    return 0;
  }

  /**
   * Normalizes and strictly bounds player vehicle position to the physical driveable road space.
   * Handles safe lane recovery guidance during RECOVER state.
   */
  public normalizePlayerToRoad(player: PlayerVehicle): { isWorldClamped: boolean; maxDriveableOffset: number } {
    const maxDriveableOffset = this.getDriveableHalfWidth(player.boundingBox.width, 20);
    const originalOffset = player.lateralOffset;

    // Physical clamp on current offset
    player.lateralOffset = Math.max(-maxDriveableOffset, Math.min(maxDriveableOffset, player.lateralOffset));
    player.targetLateralOffset = Math.max(-maxDriveableOffset, Math.min(maxDriveableOffset, player.targetLateralOffset));

    const isWorldClamped = Math.abs(originalOffset) > maxDriveableOffset;

    // During RECOVER: guide smoothly to nearest safe canonical lane
    if (player.driverState === 'RECOVER') {
      const nearestLane = this.getNearestLane(player.lateralOffset);
      player.targetLateralOffset = this.getLaneCenterOffset(nearestLane);
      player.lane = nearestLane;
    }

    // Synchronize world X
    player.x = this.getCurveAt(player.z) + player.lateralOffset;

    return { isWorldClamped, maxDriveableOffset };
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
