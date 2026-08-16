import { Sprite } from '../../ascii/Sprite';
import { SpriteDefinition } from '../../ascii/types';

export const TruckSprite: SpriteDefinition = Sprite.define(
  'vehicle_truck',
  'Heavy Cargo Truck',
  '#f87171', // Red / Coral
  {
    close: Sprite.createVariant(
      `
     +--------------------+
     |  .--------------.  |
     |  |   RESONANCE  |  |
     |  |    FREIGHT   |  |
     |  '--------------'  |
     |                    |
     |  [====]    [====]  |
     +--------------------+
      [HH]  [====]  [HH]
      `
    ),
    near: Sprite.createVariant(
      `
     +----------------+
     | .------------. |
     | |   FREIGHT  | |
     | '------------' |
     |  [==]    [==]  |
     +----------------+
      (OO)  [==]  (OO)
      `
    ),
    medium: Sprite.createVariant(
      `
     +------------+
     | [========] |
     |  [=]  [=]  |
     +------------+
      (o)      (o)
      `
    ),
    far: Sprite.createVariant(
      `
     +--------+
     | [====] |
     +--------+
      (o)  (o)
      `
    ),
  }
);
