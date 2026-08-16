import { Sprite } from '../../ascii/Sprite';
import { SpriteDefinition } from '../../ascii/types';

const boatColors = {
  S: '#f8fafc', // White sail
  M: '#38bdf8', // Blue sail accent / mast
  H: '#f43f5e', // Coral boat hull
  W: '#0284c7', // Water ripples
  '*': '#f8fafc',
};

export const SailboatSprite: SpriteDefinition = Sprite.define(
  'scenery_sailboat',
  'Ocean Sailboat',
  '#f8fafc',
  {
    close: Sprite.createColoredVariant(
      `
              /|
             / |
            /  |   /\\
           /   |  /  \\
          /____|_/____\\
         ._____[#]_____.
        ~\\____________/~
         ~~~~~~~~~~~~~~~
      `,
      boatColors,
      `
              SM
             S M
            S  M   SS
           S   M  S  S
          SSSSSMMSSSSSS
         HHHHHHHHHHHHHHH
        WWWWWWWWWWWWWWWW
         WWWWWWWWWWWWWWW
      `
    ),
    near: Sprite.createColoredVariant(
      `
             /|
            / |  /\\
           /__|_/__\\
          .____[#]___.
         ~\\__________/~
      `,
      boatColors,
      `
             SM
            S M  SS
           SSSSMMSSS
          HHHHHHHHHHH
         WWWWWWWWWWWW
      `
    ),
    medium: Sprite.createColoredVariant(
      `
            /|
           /_|_/\\
          .\\____/.
          ~~~~~~~~
      `,
      boatColors,
      `
            SM
           SSMMSS
          HHHHHHHH
          WWWWWWWW
      `
    ),
    far: Sprite.createColoredVariant(
      `
           /\\
          \\__/_
          ~~~~~
      `,
      boatColors,
      `
           SS
          HHHHH
          WWWWW
      `
    ),
  }
);
