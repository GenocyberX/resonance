import { Sprite } from '../../ascii/Sprite';
import { SpriteDefinition } from '../../ascii/types';

const lighthouseColors = {
  Y: '#fef08a', // Beacon light glow
  L: '#fbbf24', // Lantern glass
  D: '#0f172a', // Dark dome / gallery
  R: '#ef4444', // Red stripe band
  W: '#f8fafc', // White stripe band
  B: '#334155', // Stone foundation
  '*': '#ef4444',
};

export const LighthouseSprite: SpriteDefinition = Sprite.define(
  'scenery_lighthouse',
  'Coastal Lighthouse Landmark',
  '#ef4444',
  {
    close: Sprite.createColoredVariant(
      `
            .---.
           / (o) \\
          '======='
         <=========>
           /     \\
          /  [#]  \\
         |=========|
         |         |
         |  [###]  |
         |=========|
         /         \\
        /   [###]   \\
       |=============|
       |  .-------.  |
       |  |  [#]  |  |
       |__|_______|__|
      `,
      lighthouseColors,
      `
            DDDDD
           L YYY L
          DDDDDDDDD
         YYYYYYYYYYY
           R     R
          R  WWW  R
         WWWWWWWWWWW
         W         W
         W  RRR    W
         RRRRRRRRRRR
         R         R
        R   WWW     R
       WWWWWWWWWWWWWWW
       B  BBBBBBBBB  B
       B  B  WWW  B  B
       BBBBBBBBBBBBBBB
      `
    ),
    near: Sprite.createColoredVariant(
      `
           .---.
          /(o)o)\\
         <=======>
          /     \\
         |=======|
         |  [#]  |
         |=======|
         /       \\
        |=========|
        | [door]  |
        |_________|
      `,
      lighthouseColors,
      `
           DDDDD
          LYYYYYL
         YYYYYYYYY
          R     R
         WWWWWWWWW
         W  RRR  W
         RRRRRRRRR
         R       R
        WWWWWWWWWWW
        B BBBBB B
        BBBBBBBBB
      `
    ),
    medium: Sprite.createColoredVariant(
      `
          .(o).
         <=====>
          /   \\
         |=====|
         | [#] |
         |=====|
         | [d] |
         |_____|
      `,
      lighthouseColors,
      `
          DYYYD
         YYYYYYY
          R   R
         WWWWWWW
         W RRR W
         RRRRRRR
         B WWW B
         BBBBBBB
      `
    ),
    far: Sprite.createColoredVariant(
      `
          (o)
          / \\
         |===|
         |===|
         |___|
      `,
      lighthouseColors,
      `
          YYY
          R R
         WWWWW
         RRRRR
         BBBBB
      `
    ),
  }
);
