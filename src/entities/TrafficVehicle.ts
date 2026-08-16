import { Vehicle } from './Vehicle';
import { TrafficSedanSprite } from '../sprites/vehicles/TrafficSedanSprite';
import { TruckSprite } from '../sprites/vehicles/TruckSprite';
import { SpriteDefinition } from '../ascii/types';

export type TrafficType = 'sedan' | 'truck';

export class TrafficVehicle extends Vehicle {
  public vehicleType: TrafficType;

  constructor(id: string, type: TrafficType, startZ: number, lane: number, laneOffset: number = 0) {
    const sprite: SpriteDefinition = type === 'truck' ? TruckSprite : TrafficSedanSprite;
    const boundingBox = type === 'truck'
      ? { width: 220, length: 240, height: 120 }
      : { width: 190, length: 140, height: 75 };

    super(id, sprite, boundingBox);
    this.vehicleType = type;
    this.z = startZ;
    this.lane = lane;
    this.setLane(lane, laneOffset);
    this.lateralOffset = laneOffset;

    // Ambient traffic speeds
    this.speed = type === 'truck' ? 75 : 95;
    this.colorOverride = type === 'truck' ? '#ef4444' : '#f59e0b';
  }

  public update(dt: number, roadCenterCurve: number): void {
    // Traffic moves along road at its cruising speed
    this.z += this.speed * dt;
    this.x = roadCenterCurve + this.lateralOffset;
  }
}
