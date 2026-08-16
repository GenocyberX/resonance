import { Sprite } from '../../ascii/Sprite';
import { SpriteDefinition } from '../../ascii/types';

export const SportsCarSprite: SpriteDefinition = Sprite.define(
  'vehicle_sports_car',
  'Protagonist Sports Car',
  '#38bdf8', // Neon Cyan
  {
    close: Sprite.createVariant(
      `
      .----------------.
   .-'  /            \\  '-.
  /  .-'              '-.  \\
 |  /  ___          ___  \\  |
 | |  [___]        [___]  | |
 | |                      | |
 |  \\  ================  /  |
  \\  '-.______________.-'  /
   '-.__________________.-'
      [OO]          [OO]
      `
    ),
    near: Sprite.createVariant(
      `
     .----------.
   .-' /      \\ '-.
  / .-          -. \\
 | [__]        [__] |
 |  ==============  |
  \\ '------------' /
    [OO]      [OO]
      `
    ),
    medium: Sprite.createVariant(
      `
    .------.
  .-' /  \\ '-.
 | [_]    [_] |
  \\==========/
   [o]    [o]
      `
    ),
    far: Sprite.createVariant(
      `
   .--.
  [====]
  [o  o]
      `
    ),
  }
);
