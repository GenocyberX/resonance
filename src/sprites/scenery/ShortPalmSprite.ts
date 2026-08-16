import { Sprite } from '../../ascii/Sprite';
import { SpriteDefinition } from '../../ascii/types';

const shortPalmColors = {
  L: '#a7f3d0', // Light mint green
  G: '#10b981', // Emerald green
  D: '#047857', // Forest green
  T: '#b45309', // Bark
  '*': '#10b981',
};

export const ShortPalmSprite: SpriteDefinition = Sprite.define(
  'scenery_short_palm',
  'Short Fan Palm',
  '#10b981',
  {
    close: Sprite.createColoredVariant(
      `
         _  \\ | /  _
       _(_)-.---.-(_)_
     _(_) /   |   \\ (_)
    /  / /    |    \\ \\  \\
   /__/ /     |     \\ \\__\\
         '--.===.--'
            / | \\
            | | |
      `,
      shortPalmColors,
      `
         L  L G L  L
       GGGG LLLLL GGGG
     DDDD G   G   G DDD
    D  D G    D    G D  D
   DDDD G     D     G DDDD
         TTTTTTTTTTT
            T T T
            T T T
      `
    ),
    near: Sprite.createColoredVariant(
      `
       \\ \\ | / /
      -(_)-+-(_)-
     /  /  |  \\  \\
       '-.===.-'
          | |
      `,
      shortPalmColors,
      `
       L L G L L
      GGGGGDGGGGG
     D  D  D  D  D
       TTTTTTTTT
          T T
      `
    ),
    medium: Sprite.createColoredVariant(
      `
       \\|/ \\|/
      --(_+_)--
         | |
      `,
      shortPalmColors,
      `
       LLL GGG
      DDDDDDDDD
         TTT
      `
    ),
    far: Sprite.createColoredVariant(
      `
       \\|/
        |
      `,
      shortPalmColors,
      `
       GGG
        T
      `
    ),
  }
);
