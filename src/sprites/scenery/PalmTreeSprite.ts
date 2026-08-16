import { Sprite } from '../../ascii/Sprite';
import { SpriteDefinition } from '../../ascii/types';

export const PalmTreeSprite: SpriteDefinition = Sprite.define(
  'scenery_palm_tree',
  'Tropical Palm Tree',
  '#34d399', // Emerald Green
  {
    close: Sprite.createVariant(
      `
         _     _
       _(_)_ _(_)_
      (_)@(_)@(_)@_)
        /  \\ | /  \\
       /    \\|/    \\
             ||
             ||
            //
           //
          ||
          ||
          ||
      `
    ),
    near: Sprite.createVariant(
      `
        _  _  _
       (_)(_)(_)
       / \\ | / \\
          \\|/
           ||
          //
          ||
          ||
      `
    ),
    medium: Sprite.createVariant(
      `
        _\\|/_
       (_/|\\_)
         ||
         ||
         ||
      `
    ),
    far: Sprite.createVariant(
      `
        \\|/
         |
         |
      `
    ),
  }
);
