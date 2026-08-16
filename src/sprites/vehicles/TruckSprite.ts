import { Sprite } from '../../ascii/Sprite';
import { SpriteDefinition } from '../../ascii/types';

const truckColors = {
  B: '#ef4444', // Red cab / container
  W: '#f8fafc', // White rollup cargo door
  H: '#fbbf24', // High amber marker lights
  R: '#ef4444', // Taillights
  M: '#334155', // Heavy rubber mudflaps
  T: '#0f172a', // Dual rear tires
  '*': '#ef4444',
};

export const TruckSprite: SpriteDefinition = Sprite.define(
  'vehicle_truck',
  'Commercial Delivery Truck',
  '#ef4444',
  {
    close: Sprite.createColoredVariant(
      `
         .--------------------.
        |  (o)   (o)   (o)   (o)  |
        | .------------------. |
        | | ================ | |
        | | ================ | |
        | | ================ | |
        | '------------------' |
        |  [===]  [CARGO]  [===]  |
        |___|__|___________|__|___|
           (O)(O)         (O)(O)
      `,
      truckColors,
      `
         BBBBBBBBBBBBBBBBBBBBBB
        B  H H   H H   H H   H H  B
        B BBBBBBBBBBBBBBBBBBBB B
        B B WWWWWWWWWWWWWWWW B B
        B B WWWWWWWWWWWWWWWW B B
        B B WWWWWWWWWWWWWWWW B B
        B BBBBBBBBBBBBBBBBBBBB B
        B  RRR   MMMMMM    RRR  B
        BBBM MMBBBBBBBBBBBM MMBBBB
           TTTT           TTTT
      `
    ),
    near: Sprite.createColoredVariant(
      `
        .------------------.
       | (o)   (o)   (o)   (o) |
       | .--------------.  |
       | | ============ |  |
       | | ============ |  |
       | '--------------'  |
       |  [==]  [  ]  [==] |
       |___|__|_______|__|___|
          (O)           (O)
      `,
      truckColors,
      `
        BBBBBBBBBBBBBBBBBBBB
       B H H   H H   H H   H B
       B BBBBBBBBBBBBBBBB  B
       B B WWWWWWWWWWWW B  B
       B B WWWWWWWWWWWW B  B
       B BBBBBBBBBBBBBBBB  B
       B  RR   MMMM   RR   B
       BBBM MMBBBBBBBBM MMBB
          TT             TT
      `
    ),
    medium: Sprite.createColoredVariant(
      `
        .-------------.
       | (o)  (o)  (o) |
       | [===========] |
       | [===========] |
       |  [=]     [=]  |
       |_______________|
          (o)     (o)
      `,
      truckColors,
      `
        BBBBBBBBBBBBBBB
       B H H  H H  H H B
       B WWWWWWWWWWWWW B
       B WWWWWWWWWWWWW B
       B  R       R    B
       BBBBBBBBBBBBBBBBB
          T       T
      `
    ),
    far: Sprite.createColoredVariant(
      `
        .---------.
       | [=======] |
       | [=]   [=] |
       |___________|
         (o)   (o)
      `,
      truckColors,
      `
        BBBBBBBBBBB
       B WWWWWWWWW B
       B R     R   B
       BBBBBBBBBBBBB
         T     T
      `
    ),
  }
);
