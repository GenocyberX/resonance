import { Vehicle } from './Vehicle';
import { TrafficCoupeSprite } from '../sprites/vehicles/TrafficCoupeSprite';
import { TrafficSedanSprite } from '../sprites/vehicles/TrafficSedanSprite';
import { TruckSprite } from '../sprites/vehicles/TruckSprite';
import { SpriteDefinition } from '../ascii/types';

export type TrafficType = 'coupe' | 'sedan' | 'truck';

export class TrafficVehicle extends Vehicle {
  public vehicleType: TrafficType;

  constructor(id: string, type: TrafficType, startZ: number, lane: number, laneOffset: number = 0) {
    let sprite: SpriteDefinition = TrafficSedanSprite;
    let boundingBox = { width: 190, length: 140, height: 75 };
    let speed = 95;
    let colorOverride = '#f59e0b';

    if (type === 'coupe') {
      sprite = TrafficCoupeSprite;
      boundingBox = { width: 180, length: 135, height: 70 };
      speed = 105;
      colorOverride = '#e11d48';
    } else if (type === 'truck') {
      sprite = TruckSprite;
      boundingBox = { width: 220, length: 240, height: 120 };
      speed = 75;
      colorOverride = '#ef4444';
    }

    super(id, sprite, boundingBox);
    this.vehicleType = type;
    this.z = startZ;
    this.lane = lane;
    this.setLane(lane, laneOffset);
    this.lateralOffset = laneOffset;
    this.speed = speed;
    this.colorOverride = colorOverride;
  }

  public update(dt: number, roadCenterCurve: number): void {
    // Traffic moves along road at its cruising speed
    this.z += this.speed * dt;
    this.x = roadCenterCurve + this.lateralOffset;
  }
}
