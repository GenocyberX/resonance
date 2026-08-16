import { Sprite } from '../../ascii/Sprite';
import { SpriteDefinition } from '../../ascii/types';

const bushColors = {
  L: '#6ee7b7', // Lime highlight
  G: '#059669', // Medium green
  D: '#064e3b', // Deep shadow
  F: '#f43f5e', // Coral flowers / berries
  '*': '#059669',
};

export const TropicalBushSprite: SpriteDefinition = Sprite.define(
  'scenery_tropical_bush',
  'Tropical Coastal Bush',
  '#059669',
  {
    close: Sprite.createColoredVariant(
      `
          .-----.
       .-'  *    '-.
     .'   *    *    '.
    /   *    *    *   \\
   |___________________|
      `,
      bushColors,
      `
          LLLLL
       LLD  F   DLL
     DD   F    F    DD
    G   F    F    F   G
   DDDDDDDDDDDDDDDDDDDDD
      `
    ),
    near: Sprite.createColoredVariant(
      `
        .---.
      .'  *  '.
     /  *   *  \\
    |___________|
      `,
      bushColors,
      `
        LLLL
      LL  F  LL
     G  F   F  G
    DDDDDDDDDDDDD
      `
    ),
    medium: Sprite.createColoredVariant(
      `
       (***)
      (_____)
      `,
      bushColors,
      `
       LFLFG
      DDDDDDD
      `
    ),
    far: Sprite.createColoredVariant(
      `
       (_)
      `,
      bushColors,
      `
       GGG
      `
    ),
  }
);
