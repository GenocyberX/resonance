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
              .--------------.
          .--/   /\\  /\\  /\\   \\--.
        ./______/__\\/__\\/__\\______\\.
         |   (o)              (o)   |
         |    |====[======]====|    |
         |====|                |====|
         |  | |   |        |   | |  |
         |  | |   |        |   | |  |
      `,
      shackColors,
      `
              WWWWWWWWWWWWWW
          RRRR   WW  WW  WW   RRRR
        RRRRRRRRRRRRRRRRRRRRRRRRRRRR
         T   YYY              YYY   T
         T    TCCCCCCCCCCCCCCCT     T
         TTTTTT                TTTTTT
         T  T T   T        T   T T  T
         T  T T   T        T   T T  T
      `
    ),
    near: Sprite.createColoredVariant(
      `
            .------------.
          ./  /\\  /\\  /\\  \\.
         ./________________\\.
          | (o)        (o) |
          |===[========]===|
          | |            | |
      `,
      shackColors,
      `
            WWWWWWWWWWWW
          RR  WW  WW  WW  RR
         RRRRRRRRRRRRRRRRRRRR
          T YYY        YYY T
          TTTCCCCCCCCCCCCCTTT
          T T            T T
      `
    ),
    medium: Sprite.createColoredVariant(
      `
           .----------.
          /____________\\
          | (o)    (o) |
          |============|
          |            |
      `,
      shackColors,
      `
           WWWWWWWWWW
          RRRRRRRRRRRRRR
          T YYY    YYY T
          TTTCCCCCCCCCTTT
          T            T
      `
    ),
    far: Sprite.createColoredVariant(
      `
          /------\\
          |======|
          |      |
      `,
      shackColors,
      `
          RRRRRR
          TTTTTT
          TTTTTT
      `
    ),
  }
);
