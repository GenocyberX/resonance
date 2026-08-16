import { Sprite } from '../../ascii/Sprite';
import { SpriteDefinition } from '../../ascii/types';

const hotelColors = {
  P: '#fb7185', // Pastel Coral pink facade
  N: '#fde047', // Art Deco gold spire / crown
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
                    .---.
                 .-'  |  '-.
               .-------------.
             .-----------------.
            /  _______________  \\
           /  /  [+] [+] [+]  \\  \\
          |  |   [#] [#] [#]   |  |
          |==|=================|==|
          |  |   [#] [#] [#]   |  |
          |  |   [#] [#] [#]   |  |
          |==|=====[===]=======|==|
          |  |     |   |       |  |
          |__|_____|___|_______|__|
      `,
      hotelColors,
      `
                    NNNNN
                 NNN  N  NNN
               TTTTTTTTTTTTTTT
             TTTTTTTTTTTTTTTTTTT
            P  TTTTTTTTTTTTTTT  P
           P  P  GGG GGG GGG  P  P
          B  P   GGG GGG GGG   P  B
          TTTTTTTTTTTTTTTTTTTTTTTTT
          B  P   GGG GGG GGG   P  B
          B  P   GGG GGG GGG   P  B
          TTTTTTTTTNNNNNTTTTTTTTTTT
          B  P     B   B       P  B
          BBBPBBBBBBGGGBBBBBBBBPBBB
      `
    ),
    near: Sprite.createColoredVariant(
      `
                 .-+-.
               .-------.
             .-----------.
            / [#] [#] [#] \\
           |==|=========|==|
           |  | [#] [#] |  |
           |==|==[===]==|==|
           |__|__|   |__|__|
      `,
      hotelColors,
      `
                 NNNNN
               TTTTTTTTT
             TTTTTTTTTTTTT
            P GGG GGG GGG P
           TTTTTTTTTTTTTTTTT
           B  P GGG GGG P  B
           TTTTTTNNNNNTTTTTT
           BBBPBBBG GBBPBBBB
      `
    ),
    medium: Sprite.createColoredVariant(
      `
              .-+-.
             .-----.
             |[#][#]|
             |==|==-|
             |[#][#]|
             |______|
      `,
      hotelColors,
      `
              NNNNN
             TTTTTTT
             PGGGGGGP
             TTTTTTTT
             PGGGGGGP
             BBBBBBBB
      `
    ),
    far: Sprite.createColoredVariant(
      `
             .-+-.
             |[][]|
             |[][]|
             |____|
      `,
      hotelColors,
      `
             NNNNN
             PGGG P
             PGGG P
             BBBBBB
      `
    ),
  }
);
