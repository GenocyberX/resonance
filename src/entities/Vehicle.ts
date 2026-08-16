import { Entity, BoundingBox } from './Entity';
import { SpriteDefinition } from '../ascii/types';

export abstract class Vehicle extends Entity {
  public lane: number = 0;              // -1 = Left, 0 = Center, 1 = Right
  public lateralOffset: number = 0;     // Current x offset from road center
  public targetLateralOffset: number = 0;
  public lateralVelocity: number = 0;
  public maxSpeed: number = 240;
  public acceleration: number = 80;
  public brakingForce: number = 140;

  constructor(id: string, sprite: SpriteDefinition, boundingBox: BoundingBox) {
    super(id, sprite, boundingBox);
  }

  /**
   * Sets the active lane and updates target lateral offset using canonical geometry.
   */
  public setLane(lane: number, targetOffset: number): void {
    this.lane = lane;
    this.targetLateralOffset = targetOffset;
  }
}
