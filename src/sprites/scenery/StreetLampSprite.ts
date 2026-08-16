import { Sprite } from '../../ascii/Sprite';
import { SpriteDefinition } from '../../ascii/types';

export const StreetLampSprite: SpriteDefinition = Sprite.define(
  'scenery_street_lamp',
  'Highway Overhead Street Lamp',
  '#fde047', // Warm Light Yellow
  {
    close: Sprite.createVariant(
      `
            .---------(***)
           /
          ||
          ||
          ||
          ||
          ||
          ||
          ||
          ||
          ||
         /||\\
        ======
      `
    ),
    near: Sprite.createVariant(
      `
          .-----(**)
         /
        ||
        ||
        ||
        ||
        ||
        ||
       /||\\
      `
    ),
    medium: Sprite.createVariant(
      `
        .--(*)
       /
      ||
      ||
      ||
      ||
      `
    ),
    far: Sprite.createVariant(
      `
       .-(o)
      ||
      ||
      `
    ),
  }
);
