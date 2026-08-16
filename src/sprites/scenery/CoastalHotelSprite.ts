import { Sprite } from '../../ascii/Sprite';
import { SpriteDefinition } from '../../ascii/types';

const hotelColors = {
  P: '#fb7185', // Pastel Coral pink facade
  N: '#fde047', // Hotel rooftop neon gold sign
  G: '#38bdf8', // Cyan window glow
  T: '#0d9488', // Teal accent trims
  B: '#881337', // Shadow / framing
  '*': '#fb7185',
};

export const CoastalHotelSprite: SpriteDefinition = Sprite.define(
  'scenery_coastal_hotel',
  'Art Deco Coastal Hotel',
  '#fb7185',
  {
    close: Sprite.createColoredVariant(
      `
               .---[ HOTEL RESORT ]---.
             .--------------------------.
            /  ________________________  \\
           /  /  [+]  [+]    [+]  [+]  \\  \\
          |  |   [#]  [#]    [#]  [#]   |  |
          |==|==========================|==|
          |  |   [#]  [#]    [#]  [#]   |  |
          |  |   [#]  [#]    [#]  [#]   |  |
          |==|======[ ENTRANCE ]========|==|
          |  |       |  ||  |           |  |
          |__|_______|__||__|___________|__|
      `,
      hotelColors,
      `
               NNNN NNNNN NNNNNN NNNN
             TTTTTTTTTTTTTTTTTTTTTTTTTTTT
            P  TTTTTTTTTTTTTTTTTTTTTTTT  P
           P  P  GGG  GGG    GGG  GGG  P  P
          B  P   GGG  GGG    GGG  GGG   P  B
          TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT
          B  P   GGG  GGG    GGG  GGG   P  B
          B  P   GGG  GGG    GGG  GGG   P  B
          TTTTTTTTTTNNNNNNNNNNTTTTTTTTTTTTTT
          B  P       B  GG  B           P  B
          BBBPBBBBBBBBBBGGBBBBBBBBBBBBBBPBBB
      `
    ),
    near: Sprite.createColoredVariant(
      `
            .-[ HOTEL ]-.
          .---------------.
         /  [#] [#]  [#]   \\
        |==|=============|==|
        |  | [#] [#] [#] |  |
        |==|==[ENTER]====|==|
        |__|___|  |______|__|
      `,
      hotelColors,
      `
            NN NNNNN NN
          TTTTTTTTTTTTTTTTT
         P  GGG GGG  GGG   P
        TTTTTTTTTTTTTTTTTTTTT
        B  P GGG GGG GGG P  B
        TTTTTTNNNNNNNTTTTTTTT
        BBBPBBBG  GBBBBBBPBBB
      `
    ),
    medium: Sprite.createColoredVariant(
      `
         .[HOTEL].
        .---------.
        | [#] [#] |
        |========-|
        | [#] [#] |
        |_________|
      `,
      hotelColors,
      `
         NNNNNNNNN
        TTTTTTTTTTT
        P GGG GGG P
        TTTTTTTTTTT
        P GGG GGG P
        BBBBBBBBBBB
      `
    ),
    far: Sprite.createColoredVariant(
      `
        .-----.
        |[][] |
        |[][] |
        |_____|
      `,
      hotelColors,
      `
        TTTTTTT
        PGGG  P
        PGGG  P
        BBBBBBB
      `
    ),
  }
);
