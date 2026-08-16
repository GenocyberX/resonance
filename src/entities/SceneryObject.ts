import { Entity } from './Entity';
import { SpriteDefinition } from '../ascii/types';

export class SceneryObject extends Entity {
  public lateralOffset: number; // Lateral offset relative to road center

  constructor(
    id: string,
    sprite: SpriteDefinition,
    z: number,
    lateralOffset: number,
    isObstacle: boolean = false,
    colorOverride?: string
  ) {
    super(id, sprite, {
      width: isObstacle ? 80 : 120,
      length: isObstacle ? 80 : 120,
      height: 100,
    });
    this.z = z;
    this.lateralOffset = lateralOffset;
    this.isCollidable = isObstacle;
    this.colorOverride = colorOverride;
  }

  public update(_dt: number, roadCenterCurve: number): void {
    // Fixed relative to road curve at its longitudinal coordinate
    this.x = roadCenterCurve + this.lateralOffset;
  }
}
