import { Sprite } from '../../ascii/Sprite';
import { SpriteDefinition } from '../../ascii/types';

export const PineTreeSprite: SpriteDefinition = Sprite.define(
  'scenery_pine_tree',
  'Alpine / Forest Pine Tree',
  '#10b981', // Forest Green
  {
    close: Sprite.createVariant(
      `
            /\\
           /  \\
          /++++\\
         /  ++  \\
        /++++++++\\
       /   ++++   \\
      /++++++++++++\\
     /     ++++     \\
    /++++++++++++++++\\
           |  |
           |__|
      `
    ),
    near: Sprite.createVariant(
      `
          /\\
         /++\\
        /++++\\
       /++++++\\
      /++++++++\\
         |  |
      `
    ),
    medium: Sprite.createVariant(
      `
         /\\
        /++\\
       /++++\\
         ||
      `
    ),
    far: Sprite.createVariant(
      `
        /\\
       /++\\
        ||
      `
    ),
  }
);
