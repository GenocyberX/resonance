import { Sprite } from '../../ascii/Sprite';
import { SpriteDefinition } from '../../ascii/types';

export const TruckSprite: SpriteDefinition = Sprite.define(
  'vehicle_truck',
  'Heavy Cargo Hauler',
  '#ef4444', // Red Cargo Trailer
  {
    close: Sprite.createVariant(
      `
     +----------------------------------+
     | *  *  *  [ RESONANCE ]  *  *  *  |
     |==================================|
     |  |\\                          /|  |
     |  | \\   [ CARGO FREIGHT ]    / |  |
     |  |  \\                      /  |  |
     |  |   '--------------------'   |  |
     |  |   | [///] [///] [///]  |   |  |
     |  |   |                    |   |  |
     |==================================|
     | [====]    [  WIDE LOAD  ]   [====] |
     +----------------------------------+
       [HH][HH]   [==========]   [HH][HH]
      `
    ),
    near: Sprite.createVariant(
      `
     +--------------------------+
     |  *   *  [ FREIGHT ] *  * |
     |==========================|
     | |  [ CARGO LOGISTICS ] | |
     | |  [///]        [///]  | |
     |==========================|
     | [==]   [ WIDE LOAD ]  [==] |
     +--------------------------+
      [HH][HH]    [====]   [HH][HH]
      `
    ),
    medium: Sprite.createVariant(
      `
     +--------------------+
     | *  [ FREIGHT ]  *  |
     |====================|
     | |   [////////]   | |
     |====================|
     | [=]   [LOAD]   [=] |
     +--------------------+
      (OO)            (OO)
      `
    ),
    far: Sprite.createVariant(
      `
     +------------+
     | [FREIGHT]  |
     | [========] |
     | [=]    [=] |
     +------------+
      (o)      (o)
      `
    ),
  }
);
