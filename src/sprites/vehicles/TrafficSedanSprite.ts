import { Sprite } from '../../ascii/Sprite';
import { SpriteDefinition } from '../../ascii/types';

const sedanColors = {
  B: '#f59e0b', // Amber body
  W: '#0f172a', // Rear window
  R: '#ef4444', // Taillights
  C: '#e2e8f0', // Chrome plate / bumper
  T: '#0f172a', // Tires
  '*': '#f59e0b',
};

export const TrafficSedanSprite: SpriteDefinition = Sprite.define(
  'vehicle_traffic_sedan',
  'Traffic Sedan',
  '#f59e0b',
  {
    close: Sprite.createColoredVariant(
      `
            .------------.
           /   ________   \\
          /   /        \\   \\
         .------------------.
        | [==]  [CALIF]  [==] |
        |_____________________|
          (O)(O)       (O)(O)
      `,
      sedanColors,
      `
            BBBBBBBBBBBB
           B   WWWWWWWW   B
          B   W        W   B
         BBBBBBBBBBBBBBBBBBBB
        B RRR   CCCCCC   RRR  B
        BBBBBBBBBBBBBBBBBBBBBBB
          TTTT         TTTT
      `
    ),
    near: Sprite.createColoredVariant(
      `
           .----------.
          /  ________  \\
         .--------------.
        | [=]  [CAL] [=] |
        |________________|
          (O)        (O)
      `,
      sedanColors,
      `
           BBBBBBBBBB
          B  WWWWWWWW  B
         BBBBBBBBBBBBBBBB
        B RR   CCCCC  RR B
        BBBBBBBBBBBBBBBBBB
          TT          TT
      `
    ),
    medium: Sprite.createColoredVariant(
      `
          .--------.
         /  ______  \\
        | [=][CAL][=] |
        |_____________|
          (o)      (o)
      `,
      sedanColors,
      `
          BBBBBBBB
         B  WWWWWW  B
        B R  CCCC  R B
        BBBBBBBBBBBBBB
          T        T
      `
    ),
    far: Sprite.createColoredVariant(
      `
         .------.
        |[=]  [=]|
        |________|
          (o)  (o)
      `,
      sedanColors,
      `
         BBBBBB
        BR R  R B
        BBBBBBBBB
          T    T
      `
    ),
  }
);
