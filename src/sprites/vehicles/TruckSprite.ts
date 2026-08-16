import { Sprite } from '../../ascii/Sprite';
import { SpriteDefinition } from '../../ascii/types';

const truckColors = {
  B: '#64748b', // Slate gray cargo box
  M: '#f59e0b', // Amber clearance roof markers
  D: '#334155', // Shadow framing
  S: '#94a3b8', // Roll-up shutter door
  R: '#ef4444', // Red bumper lights
  E: '#e2e8f0', // Chrome step bar
  T: '#0f172a', // Dual heavy duty tires
  '*': '#64748b',
};

export const TruckSprite: SpriteDefinition = Sprite.define(
  'vehicle_truck',
  'Commercial Delivery Truck',
  '#64748b',
  {
    close: Sprite.createColoredVariant(
      `
          .--------------.
          | [*]  [*] [*] |
          |==============|
          | |==========| |
          | |==========| |
          | |==========| |
          |==============|
          | [*]      [*] |
          |==============|
           (OO)(O)  (O)(OO)
      `,
      truckColors,
      `
          BBBBBBBBBBBBBB
          B M    M   M B
          DDDDDDDDDDDDDD
          D SSSSSSSSSS D
          D SSSSSSSSSS D
          D SSSSSSSSSS D
          DDDDDDDDDDDDDD
          D R        R D
          EEEEEEEEEEEEEE
           TTTTTT    TTTTTT
      `
    ),
    near: Sprite.createColoredVariant(
      `
          .------------.
          | [*]    [*] |
          |============|
          | |========| |
          | |========| |
          |============|
          | [*]    [*] |
           (OO)    (OO)
      `,
      truckColors,
      `
          BBBBBBBBBBBB
          B M      M B
          DDDDDDDDDDDD
          D SSSSSSSS D
          D SSSSSSSS D
          DDDDDDDDDDDD
          D R      R D
           TTTT    TTTT
      `
    ),
    medium: Sprite.createColoredVariant(
      `
          .----------.
          |[*]    [*]|
          |==========|
          | |======| |
          |==========|
          |[*]    [*]|
           (o)    (o)
      `,
      truckColors,
      `
          BBBBBBBBBB
          B M    M B
          DDDDDDDDDD
          D SSSSSS D
          DDDDDDDDDD
          D R    R D
           TT    TT
      `
    ),
    far: Sprite.createColoredVariant(
      `
          [========]
          | [====] |
          |========|
           --    --
      `,
      truckColors,
      `
          BBBBBBBB
          D SSSS D
          D R  R D
           TT  TT
      `
    ),
  }
);
