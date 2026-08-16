import { Entity } from '../entities/Entity';
import { DriverState } from '../entities/PlayerVehicle';

export interface LaneTrafficInfo {
  lane: number;
  closestDistance: number;  // Distance ahead (Infinity if lane is empty)
  closestVehicle: Entity | null;
}

export interface RoadPerception {
  curveAhead: number;       // Average upcoming curvature
  sharpness: number;        // Rate of change of curve
  lanes: Record<number, LaneTrafficInfo>;
  closestObstacleDistance: number;
}

export interface DriverDecision {
  targetLane: number;
  targetSpeed: number;
  state: DriverState;
}

export interface CollisionEvent {
  entityA: Entity;
  entityB: Entity;
  impactVelocity: number;
  cameraShakeAmount: number;
}
