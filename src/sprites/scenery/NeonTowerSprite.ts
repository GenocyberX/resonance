import { Sprite } from '../../ascii/Sprite';
import { SpriteDefinition } from '../../ascii/types';

export const NeonTowerSprite: SpriteDefinition = Sprite.define(
  'scenery_neon_tower',
  'Cyberpunk Neon Tower',
  '#06b6d4', // Cyan
  {
    close: Sprite.createVariant(
      `
            /\\
           /||\\
          [ || ]
          [ || ]
         /======\\
        |  |::|  |
        |  |::|  |
       /========\\
      |   |::|   |
      |   |::|   |
     /============\\
    |    |::::|    |
    |    |::::|    |
      `
    ),
    near: Sprite.createVariant(
      `
          /\\
         [||]
        /====\\
       | |::| |
      /========\\
     |   |::|   |
     |   |::|   |
      `
    ),
    medium: Sprite.createVariant(
      `
         /\\
        [||]
       /====\\
      | |::| |
      | |::| |
      `
    ),
    far: Sprite.createVariant(
      `
        /\\
       |::|
       |::|
      `
    ),
  },
  {
    category: 'LANDMARK',
    worldWidth: 200,
    worldHeight: 350,
    visualScale: 1.0,
  }
);
