import { SpriteDefinition } from '../ascii/types';

export interface BoundingBox {
  width: number;  // Lateral width in world units
  length: number; // Longitudinal length in world units
  height: number; // Vertical height in world units
}

export abstract class Entity {
  public id: string;
  public x: number = 0;      // Lateral position relative to road center
  public y: number = 0;      // Vertical position above road elevation
  public z: number = 0;      // Longitudinal world track position
  public speed: number = 0;  // Longitudinal speed (units/sec)
  public sprite: SpriteDefinition;
  public boundingBox: BoundingBox;
  public isCollidable: boolean = true;
  public colorOverride?: string;

  constructor(id: string, sprite: SpriteDefinition, boundingBox: BoundingBox) {
    this.id = id;
    this.sprite = sprite;
    this.boundingBox = boundingBox;
  }

  public abstract update(dt: number, roadCenterCurve: number): void;
}
