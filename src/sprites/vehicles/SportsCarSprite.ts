import { Sprite } from '../../ascii/Sprite';
import { SpriteDefinition } from '../../ascii/types';

export const SportsCarSprite: SpriteDefinition = Sprite.define(
  'vehicle_sports_car',
  'Protagonist Sports Car',
  '#38bdf8', // Vibrant Cyan with glowing red taillights
  {
    close: Sprite.createVariant(
      `
         .====================.
        / :::::::::::::::::::: \\
      .--------------------------.
     /  /  __________________  \\  \\
    |  |  |    RESONANCE     |  |  |
   /================================\\
  |  [====]     [  RES  ]    [====]  |
   \\================================/
     (O)(O)                  (O)(O)
      `
    ),
    near: Sprite.createVariant(
      `
        .================.
       / :::::::::::::::: \\
     .----------------------.
    /   [  RESONANCE  ]      \\
   /==========================\\
  |  [==]    [RES]      [==]  |
   \\__________________________/
     (O)(O)            (O)(O)
      `
    ),
    medium: Sprite.createVariant(
      `
       .============.
      / :::::::::::: \\
     / [  RESONANCE ] \\
    /==================\\
   |  [=]   [RES]   [=] |
    \\__________________/
      (o)          (o)
      `
    ),
    far: Sprite.createVariant(
      `
      .========.
     / [======] \\
    |  [=]  [=]  |
     \\__________/
       (o)  (o)
      `
    ),
  }
);
