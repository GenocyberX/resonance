import { Sprite } from '../../ascii/Sprite';
import { SpriteDefinition } from '../../ascii/types';

const cactusColors = {
  F: '#f43f5e', // Desert blossom pink
  G: '#a3e635', // Sunlit cactus green
  D: '#65a30d', // Shaded rib olive
  '*': '#a3e635',
};

export const CactusSprite: SpriteDefinition = Sprite.define(
  'scenery_cactus',
  'Desert Saguaro Cactus',
  '#a3e635',
  {
    close: Sprite.createColoredVariant(
      `
              *
           _ (o) _
          | | | | | |
          | | | | | |
          | |_| |_| |
          |  _   _  |
          | | | | | |
          |_| | | |_|
              | |
              | |
             /   \\
      `,
      cactusColors,
      `
              F
           G FFF G
          GGDGGGD GGD
          GGDGGGD GGD
          GGDDGGDDGGD
          GDDDDDDDDDD
          GGDGGGD GGD
          DDDGGGD DDD
              GGD
              GGD
             DDDDD
      `
    ),
    near: Sprite.createColoredVariant(
      `
            *
         _ (o) _
        | || || |
        |_||_||_|
         |  _  |
         | | | |
           | |
      `,
      cactusColors,
      `
            F
         G FFF G
        GGDGGGDGD
        DDDGGGDGD
         GDDDDDG
         GGD GGD
           GGD
      `
    ),
    medium: Sprite.createColoredVariant(
      `
         _  *  _
        | || || |
        |_||_||_|
           | |
      `,
      cactusColors,
      `
         G  F  G
        GGDFGGDGD
        DDDDDGGGD
           GGD
      `
    ),
    far: Sprite.createColoredVariant(
      `
         _ | _
        |_||_|
          ||
      `,
      cactusColors,
      `
         G G G
        GDGGDD
          GD
      `
    ),
  }
);
