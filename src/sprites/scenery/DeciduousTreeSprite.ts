import { Sprite } from '../../ascii/Sprite';
import { SpriteDefinition } from '../../ascii/types';

export const DeciduousTreeSprite: SpriteDefinition = Sprite.define(
  'scenery_deciduous_tree',
  'Deciduous Oak Tree',
  '#22c55e', // Leaf Green
  {
    close: Sprite.createVariant(
      `
         .@@@@@@@@.
       .@@@@@@@@@@@@.
      @@@@@@@@@@@@@@@@
      @@@@@@@@@@@@@@@@
       '@@@@@@@@@@@@'
         '@@@||@@@'
             ||
             ||
            /  \\
      `
    ),
    near: Sprite.createVariant(
      `
        .@@@@@@.
       @@@@@@@@@@
       @@@@@@@@@@
        '@@@@@@'
          ||
          ||
      `
    ),
    medium: Sprite.createVariant(
      `
        .@@@@.
        @@@@@@
         '@@'
          ||
      `
    ),
    far: Sprite.createVariant(
      `
        (@@)
         ||
      `
    ),
  }
);
