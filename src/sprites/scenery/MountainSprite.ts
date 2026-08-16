import { Sprite } from '../../ascii/Sprite';
import { SpriteDefinition } from '../../ascii/types';

export const MountainSprite: SpriteDefinition = Sprite.define(
  'scenery_mountain',
  'Distant Mountain Range Peak',
  '#64748b', // Slate
  {
    far: Sprite.createVariant(
      `
              /\\
             /  \\
            / /\\ \\
           / /  \\ \\
          / / /\\ \\ \\
         /_/_/__\\_\\_\\
      `
    ),
    medium: Sprite.createVariant(
      `
            /\\
           /  \\
          / /\\ \\
         /_/__\\_\\
      `
    ),
    near: Sprite.createVariant(
      `
           /\\
          /__\\
      `
    ),
  }
);
