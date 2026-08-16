import { Sprite } from '../../ascii/Sprite';
import { SpriteDefinition } from '../../ascii/types';

const carColors = {
  B: '#38bdf8', // Sports Cyan body panels
  D: '#0284c7', // Shadow / intake vents
  W: '#0f172a', // Tinted dark rear windshield glass
  G: '#bae6fd', // Glass highlight reflection
  R: '#ef4444', // Brilliant LED taillight bar
  L: '#fde047', // Gold license plate
  E: '#94a3b8', // Chrome exhaust tips
  T: '#0f172a', // Performance tires
  '*': '#38bdf8',
};

export const SportsCarSprite: SpriteDefinition = Sprite.define(
  'vehicle_sports_car',
  'Protagonist Sports Car',
  '#38bdf8',
  {
    close: Sprite.createColoredVariant(
      `
            .----------.
          ./  ________  \\.
         /===/   __   \\===\\
        |====[========]====|
        |[*]|  [RES]  |[*]|
        |====[========]====|
         (O)   (==)(==)  (O)
      `,
      carColors,
      `
            BBBBBBBBBB
          BB  GGGGGGGG  BB
         DDDW   GG   WDDD
        BBBBBBRRRRRRRRBBBBBB
        B R B  L LLL  B R B
        DDDDDDEEEEEEEEDDDDDD
         TTT   EEEEEE    TTT
      `
    ),
    near: Sprite.createColoredVariant(
      `
           .--------.
          /  ______  \\
         |==[======]==|
         |[*][ RES ][*]|
         |==[======]==|
          (o)  ==  (o)
      `,
      carColors,
      `
           BBBBBBBB
          B  GGGGGG  B
         BBBRRRRRRRRBBB
         B R L LLL L R B
         DDDEEEEEEEEDDD
          T    EE    T
      `
    ),
    medium: Sprite.createColoredVariant(
      `
          .------.
         |[======]|
         |[*][R][*]|
         |________|
           (o)  (o)
      `,
      carColors,
      `
          BBBBBB
         BRRRRRRB
         B R L R B
         DDDDDDDD
           T    T
      `
    ),
    far: Sprite.createColoredVariant(
      `
         [====]
         |[==]|
          -  -
      `,
      carColors,
      `
         BBBB
         BRRB
          TT
      `
    ),
  }
);
