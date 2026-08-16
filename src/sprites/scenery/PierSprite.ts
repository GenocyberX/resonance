import { Sprite } from '../../ascii/Sprite';
import { SpriteDefinition } from '../../ascii/types';

const pierColors = {
  L: '#fbbf24', // Lamppost light
  M: '#94a3b8', // Metal lamppost
  T: '#b45309', // Timber deck
  P: '#78350f', // Wooden pilings
  W: '#38bdf8', // Ocean ripples
  '*': '#b45309',
};

export const PierSprite: SpriteDefinition = Sprite.define(
  'scenery_pier',
  'Coastal Wooden Pier',
  '#b45309',
  {
    close: Sprite.createColoredVariant(
      `
              (o)
               |
         .=====|===========================.
        /|  |  |  |  |  |  |  |  |  |  |  |\\
       /_|__|__|__|__|__|__|__|__|__|__|__|\\_
         |     |     |     |     |     |
       ~~|~~~~~|~~~~~|~~~~~|~~~~~|~~~~~|~~~~
      `,
      pierColors,
      `
              LLL
               M
         TTTTTTMTTTTTTTTTTTTTTTTTTTTTTTTTTT
        TT  T  M  T  T  T  T  T  T  T  T  TT
       TTTTTTTTMTTTTTTTTTTTTTTTTTTTTTTTTTTTTT
         P     P     P     P     P     P
       WWPWWWWWPWWWWWPWWWWWPWWWWWPWWWWWPWWWW
      `
    ),
    near: Sprite.createColoredVariant(
      `
             (o)
        .=====|================.
       /_|__|__|__|__|__|__|__|\\_
         |   |   |   |   |   |
       ~~|~~~|~~~|~~~|~~~|~~~|~~~
      `,
      pierColors,
      `
             LLL
        TTTTTTMTTTTTTTTTTTTTTTTT
       TTTTTTTTMTTTTTTTTTTTTTTTTT
         P   P   P   P   P   P
       WWPWWWPWWWPWWWPWWWPWWWPWWW
      `
    ),
    medium: Sprite.createColoredVariant(
      `
        .===================.
        |===|===|===|===|===|
        ~|~~|~~~|~~~|~~~|~~~|
      `,
      pierColors,
      `
        TTTTTTTTTTTTTTTTTTTTT
        TTTTTTTTTTTTTTTTTTTTT
        WPWWPWWWPWWWPWWWPWWWP
      `
    ),
    far: Sprite.createColoredVariant(
      `
        .==========.
        ~|~~|~~|~~|~
      `,
      pierColors,
      `
        TTTTTTTTTTTT
        WPWWPWWPWWPW
      `
    ),
  }
);
