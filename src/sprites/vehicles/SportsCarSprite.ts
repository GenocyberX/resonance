import { Sprite } from '../../ascii/Sprite';
import { SpriteDefinition } from '../../ascii/types';

const carColors = {
  B: '#38bdf8', // Sports Cyan body panels
  D: '#0284c7', // Body shadow / intake vents
  W: '#0f172a', // Tinted dark rear windshield glass
  G: '#38bdf8', // Glass highlight reflection line
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
             .------------.
           ./   ________   \\.
         ./   /          \\   \\.
        /====/   ======   \\====\\
       /====|              |====\\
      |=====[==============]=====|
      | [*] |  [  RES  ]   | [*] |
      |=====[==============]=====|
       (O)(O)    (==)(==)    (O)(O)
      `,
      carColors,
      `
             BBBBBBBBBBBB
           BB   GGGGGGGG   BB
         BB   W          W   BB
        DDDDW   GGGGGG   WDDDD
       DDDDW              WDDDD
      BBBBBBRRRRRRRRRRRRRRBBBBBB
      B RRR B  L  LLL  L   B RRR B
      DDDDDDEEEEEEEEEEEEEEDDDDDD
       TTTTT     EEEEEEEE    TTTTT
      `
    ),
    near: Sprite.createColoredVariant(
      `
            .----------.
          ./  ________  \\.
         /===/        \\===\\
        |====[========]====|
        |[*]| [  RES ] |[*]|
        |====[========]====|
         (O)   (==)(==)  (O)
      `,
      carColors,
      `
            BBBBBBBBBB
          BB  GGGGGGGG  BB
         DDDW          WDDD
        BBBBBBRRRRRRRRBBBBBB
        B R B L  LLL L B R B
        DDDDDDEEEEEEEEDDDDDD
         TTT   EEEEEE    TTT
      `
    ),
    medium: Sprite.createColoredVariant(
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
    far: Sprite.createColoredVariant(
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
  }
);
