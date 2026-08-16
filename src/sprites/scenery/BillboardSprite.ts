import { Sprite } from '../../ascii/Sprite';
import { SpriteDefinition } from '../../ascii/types';

export const BillboardSprite: SpriteDefinition = Sprite.define(
  'scenery_billboard',
  'Highway Neon Billboard',
  '#ec4899', // Pink / Magenta
  {
    close: Sprite.createVariant(
      `
     +-------------------------+
     |   * * RESONANCE * *     |
     |   SYNTHWAVE DREAMS      |
     +-------------------------+
                || |
                || |
                || |
      `
    ),
    near: Sprite.createVariant(
      `
     +-------------------+
     |   * RESONANCE *   |
     +-------------------+
             ||
             ||
      `
    ),
    medium: Sprite.createVariant(
      `
     +-------------+
     |  RESONANCE  |
     +-------------+
           ||
      `
    ),
    far: Sprite.createVariant(
      `
     +-------+
     | [***] |
     +-------+
        ||
      `
    ),
  }
);
