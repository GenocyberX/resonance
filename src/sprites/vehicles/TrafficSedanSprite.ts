import { Sprite } from '../../ascii/Sprite';
import { SpriteDefinition } from '../../ascii/types';

const sedanColors = {
  B: '#f59e0b', // Amber body panels
  D: '#b45309', // Dark amber shadow
  W: '#0f172a', // Tinted rear window glass
  G: '#fef3c7', // Glass highlight
  R: '#f43f5e', // Ruby taillights
  E: '#cbd5e1', // Chrome bumper
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
            .--------.
          ./  ______  \\.
         /===/   __   \\===\\
        |====[========]====|
        |[*]|  [SED]  |[*]|
        |====[========]====|
         (O)   (==)(==)  (O)
      `,
      sedanColors,
      `
            BBBBBBBB
          BB  GGGGGG  BB
         DDDW   GG   WDDD
        BBBBBBRRRRRRRRBBBBBB
        B R B  E EEE  B R B
        DDDDDDEEEEEEEEDDDDDD
         TTT   EEEEEE    TTT
      `
    ),
    near: Sprite.createColoredVariant(
      `
           .------.
          /  ____  \\
         |==[====]==|
         |[*][SED][*]|
         |==[====]==|
          (o) -- (o)
      `,
      sedanColors,
      `
           BBBBBB
          B  GGGG  B
         BBBRRRRRRBBB
         B R EEEE R B
         DDDEEEEEEDDD
          T  EE  T
      `
    ),
    medium: Sprite.createColoredVariant(
      `
          .----.
         |[====]|
         |[*][*]|
         |______|
           -  -
      `,
      sedanColors,
      `
          BBBB
         BRRRRB
         B R  B
         DDDDDD
           TT
      `
    ),
    far: Sprite.createColoredVariant(
      `
         [==]
         [**]
          --
      `,
      sedanColors,
      `
         BB
         RR
         TT
      `
    ),
  }
);
