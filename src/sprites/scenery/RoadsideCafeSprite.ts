import { Sprite } from '../../ascii/Sprite';
import { SpriteDefinition } from '../../ascii/types';

const cafeColors = {
  N: '#f43f5e', // Neon sign pink/red
  A: '#fb7185', // Awning coral stripe
  W: '#f8fafc', // Awning white stripe
  B: '#0f766e', // Teal building body
  G: '#38bdf8', // Glowing cyan glass windows
  D: '#042f2e', // Foundation / door
  Y: '#fbbf24', // Yellow light
  '*': '#0f766e',
};

export const RoadsideCafeSprite: SpriteDefinition = Sprite.define(
  'scenery_roadside_cafe',
  'Coastal Diner Cafe',
  '#0f766e',
  {
    close: Sprite.createColoredVariant(
      `
            .---[ COASTAL DINER ]---.
           /                         \\
         .-----------------------------.
        /\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\
        |  .--------.   [OPEN]   .--------.  |
        |  | ###### |   .----.   | ###### |  |
        |  | ###### |   | || |   | ###### |  |
        |__|________|___|____|___|________|__|
      `,
      cafeColors,
      `
            NNNN NNNNNNN NNNNNNN NNNN
           B                         B
         BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB
        AWAWAWAWAWAWAWAWAWAWAWAWAWAWAWAW
        B  GGGGGGGGGG   YYYYYY   GGGGGGGGGG  B
        B  G GGGGGG G   DDDDDD   G GGGGGG G  B
        B  G GGGGGG G   D DD D   G GGGGGG G  B
        BBBDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDBBB
      `
    ),
    near: Sprite.createColoredVariant(
      `
          .-[ DINER ]-.
        .---------------.
       /\\/\\/\\/\\/\\/\\/\\/\\/\\
       | .----.   .----. |
       | |####| | |####| |
       |_|____|_|_|____|_|
      `,
      cafeColors,
      `
          NN NNNNN NN
        BBBBBBBBBBBBBBBBB
       AWAWAWAWAWAWAWAWAW
       B GGGGGG   GGGGGG B
       B G GGGG D G GGGG B
       BBDDDDDDDBDDDDDDDBB
      `
    ),
    medium: Sprite.createColoredVariant(
      `
         .[DINER].
        .---------.
       /\\/\\/\\/\\/\\/\\
       | [##]  [##] |
       |____________|
      `,
      cafeColors,
      `
         NNNNNNNNN
        BBBBBBBBBBB
       AWAWAWAWAWAW
       B GGGG  GGGG B
       BBBBBBBBBBBBBB
      `
    ),
    far: Sprite.createColoredVariant(
      `
        .[===].
        /=====\\
        |[][] |
        |_____|
      `,
      cafeColors,
      `
        NNNNNNN
        AAAAAAA
        BGGGG B
        BBBBBBB
      `
    ),
  }
);
