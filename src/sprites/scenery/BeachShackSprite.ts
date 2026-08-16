import { Sprite } from '../../ascii/Sprite';
import { SpriteDefinition } from '../../ascii/types';

const shackColors = {
  R: '#d97706', // Thatch roof amber
  W: '#fde68a', // Light straw highlight
  T: '#92400e', // Wood framing
  C: '#38bdf8', // Cyan bar counter / decor
  Y: '#fbbf24', // Lantern glow
  '*': '#d97706',
};

export const BeachShackSprite: SpriteDefinition = Sprite.define(
  'scenery_beach_shack',
  'Tiki Beach Shack',
  '#d97706',
  {
    close: Sprite.createColoredVariant(
      `
            .------------.
        .--/   TIKI BAR   \\--.
      ./______________________\\.
       |  (o)   [MENU]   (o)  |
       |                      |
       |====[BAR COUNTER]=====|
       |  |   |        |   |  |
       |  |   |        |   |  |
      `,
      shackColors,
      `
            WWWWWWWWWWWW
        RRRR   WWWWWWWW   RRRR
      RRRRRRRRRRRRRRRRRRRRRRRRRR
       T  YYY   CCCCCC   YYY  T
       T                      T
       TTTTTCCCCCCCCCCCCCTTTTTT
       T  T   T        T   T  T
       T  T   T        T   T  T
      `
    ),
    near: Sprite.createColoredVariant(
      `
          .----------.
        ./  TIKI BAR  \\.
       ./________________\\.
        | (o) [MENU] (o) |
        |===BAR COUNTER==|
        | |            | |
      `,
      shackColors,
      `
          WWWWWWWWWW
        RR  WWWWWWWW  RR
       RRRRRRRRRRRRRRRRRR
        T YYY CCCCCC YYY T
        TTTTTCCCCCCCTTTTT
        T T            T T
      `
    ),
    medium: Sprite.createColoredVariant(
      `
         .--------.
        /__________\\
        | (o)  (o) |
        |==========|
        |          |
      `,
      shackColors,
      `
         WWWWWWWW
        RRRRRRRRRRRR
        T YYY  YYY T
        TTTTTCCCCCCCT
        T          T
      `
    ),
    far: Sprite.createColoredVariant(
      `
        /----\\
        |====|
        |    |
      `,
      shackColors,
      `
        RRRR
        TTTT
        TTTT
      `
    ),
  }
);
