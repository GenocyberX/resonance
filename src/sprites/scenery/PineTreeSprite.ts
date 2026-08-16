import { Sprite } from '../../ascii/Sprite';
import { SpriteDefinition } from '../../ascii/types';

const pineColors = {
  G: '#10b981', // Sunlit Pine Needle Green
  D: '#047857', // Deep Evergreen Shadow
  T: '#78350f', // Pine Bark Trunk
  '*': '#10b981',
};

export const PineTreeSprite: SpriteDefinition = Sprite.define(
  'scenery_pine_tree',
  'Misty Pine Tree',
  '#10b981',
  {
    close: Sprite.createColoredVariant(
      `
               /\\
              /  \\
             / /\\ \\
            / /__\\ \\
           /   /\\   \\
          /   /__\\   \\
         /     /\\     \\
        /_____/__\\_____\\
              |  |
              |__|
      `,
      pineColors,
      `
               GG
              GGGG
             GGDDEG
            GDDDDDDEG
           GGDGDDDEGGG
          GDDDDDDDDDDEG
         GGDDGDDDDDEGGEG
        GDDDDDDDDDDDDDDG
              TTTT
              TTTT
      `
    ),
    near: Sprite.createColoredVariant(
      `
             /\\
            /  \\
           / /\\ \\
          / /__\\ \\
         /________\\
            |  |
      `,
      pineColors,
      `
             GG
            GGGG
           GGDDEG
          GDDDDDDEG
         GDDDDDDDDG
            TTTT
      `
    ),
    medium: Sprite.createColoredVariant(
      `
            /\\
           /  \\
          /____\\
            ||
      `,
      pineColors,
      `
            GG
           GGDG
          GDDDDG
            TT
      `
    ),
    far: Sprite.createColoredVariant(
      `
            /\\
           /__\\
            ||
      `,
      pineColors,
      `
            GG
           GGGG
            TT
      `
    ),
  }
);
