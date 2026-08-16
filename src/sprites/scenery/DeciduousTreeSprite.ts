import { Sprite } from '../../ascii/Sprite';
import { SpriteDefinition } from '../../ascii/types';

const treeColors = {
  L: '#86efac', // Sunlit leaf highlight
  G: '#16a34a', // Lush green canopy
  D: '#14532d', // Deep canopy shadow
  T: '#713f12', // Wood trunk
  '*': '#16a34a',
};

export const DeciduousTreeSprite: SpriteDefinition = Sprite.define(
  'scenery_deciduous_tree',
  'Lush Deciduous Tree',
  '#16a34a',
  {
    close: Sprite.createColoredVariant(
      `
              .--------.
           .-'  *  * *  '-.
         .'  * *   *  * *  '.
        /  *  *  *  *  *  *  \\
       |  * *  *   *  *  * *  |
       | *   *   *   *   *  * |
        \\  *  *  *  *  *  *  /
         '.________________.'
                |    |
                |____|
      `,
      treeColors,
      `
              LLLLLLLL
           LLG  L  L G  GGD
         LL  G G   G  G G  GDD
        LL G  G  G  D  D  D  DDD
       LL  G G  G   D  D  D D  DDD
       GG D   D   D   D   D  D DDD
        GG D  D  D  D  D  D  DDD
         DDDDDDDDDDDDDDDDDD
                TTTT
                TTTT
      `
    ),
    near: Sprite.createColoredVariant(
      `
            .------.
          .-' *  *  '-.
         / *  *  *  *  \\
        | *  *  *  *  * |
         \\____________/
              |  |
      `,
      treeColors,
      `
            LLLLLL
          LLG L  G  GGD
         LL G  D  D  DDD
        GG D  D  D  D DDD
         DDDDDDDDDDDD
              TTTT
      `
    ),
    medium: Sprite.createColoredVariant(
      `
           .----.
          / *  * \\
         |________|
            ||
      `,
      treeColors,
      `
           LLLL
          LL G GDD
         DDDDDDDD
            TT
      `
    ),
    far: Sprite.createColoredVariant(
      `
           (@@)
           (@@)
            ||
      `,
      treeColors,
      `
           GG
           DD
           TT
      `
    ),
  }
);
