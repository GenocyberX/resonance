import { Vehicle } from './Vehicle';
import { SportsCarSprite } from '../sprites/vehicles/SportsCarSprite';

export type DriverState = 'CRUISE' | 'CORNERING' | 'OVERTAKE' | 'BRAKING' | 'RECOVER';

export class PlayerVehicle extends Vehicle {
  public driverState: DriverState = 'CRUISE';
  public targetSpeed: number = 180;
  public collisionCooldown: number = 0;
  public collisionCount: number = 0;

  constructor(startZ: number = 100) {
    super('player_vehicle', SportsCarSprite, {
      width: 220,
      length: 120,
      height: 70,
    });
    this.z = startZ;
    this.speed = 120;
    this.maxSpeed = 260;
    this.acceleration = 90;
    this.brakingForce = 160;
  }

  public update(dt: number, roadCenterCurve: number): void {
    // Steer laterally towards target lane offset
    const lateralDiff = this.targetLateralOffset - this.lateralOffset;
    const steerSpeed = this.driverState === 'RECOVER' ? 8.0 : 4.5;
    this.lateralOffset += lateralDiff * Math.min(1.0, dt * steerSpeed);

    // Global X = Road curve center + Vehicle lateral offset
    this.x = roadCenterCurve + this.lateralOffset;

    // Longitudinal speed adjustment
    if (this.collisionCooldown > 0) {
      this.collisionCooldown = Math.max(0, this.collisionCooldown - dt);
    }

    if (this.speed < this.targetSpeed) {
      this.speed = Math.min(this.targetSpeed, this.speed + this.acceleration * dt);
    } else if (this.speed > this.targetSpeed) {
      this.speed = Math.max(this.targetSpeed, this.speed - this.brakingForce * dt);
    }

    // Move forward along the road
    this.z += this.speed * dt;
  }

  public onCollisionImpact(): void {
    this.collisionCount++;
    this.collisionCooldown = 1.2;
    this.speed = Math.max(40, this.speed * 0.45);
    this.driverState = 'RECOVER';
  }
}
