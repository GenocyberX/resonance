import { Sprite } from '../../ascii/Sprite';
import { SpriteDefinition } from '../../ascii/types';

export const CactusSprite: SpriteDefinition = Sprite.define(
  'scenery_cactus',
  'Desert Saguaro Cactus',
  '#a3e635', // Lime/Cactus Green
  {
    close: Sprite.createVariant(
      `
         _     _
        | |   | |
        | |   | |
        | |___| |
        |  ___  |
        | |   | |
        | |   | |
        | |
        | |
        | |
       /   \\
      `
    ),
    near: Sprite.createVariant(
      `
        _   _
       | | | |
       | |_| |
       |  _  |
       | | | |
       | |
       | |
      `
    ),
    medium: Sprite.createVariant(
      `
        _  _
       | || |
       | || |
       |_||_|
        |  |
        |  |
      `
    ),
    far: Sprite.createVariant(
      `
        _
       | |
       | |
      `
    ),
  }
);
