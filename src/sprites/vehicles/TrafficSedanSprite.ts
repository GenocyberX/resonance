import { Sprite } from '../../ascii/Sprite';
import { SpriteDefinition } from '../../ascii/types';

export const TrafficSedanSprite: SpriteDefinition = Sprite.define(
  'vehicle_traffic_sedan',
  'Traffic Sedan',
  '#fbbf24', // Amber/Yellow
  {
    close: Sprite.createVariant(
      `
       .------------.
     .-'   ______   '-.
    /    /|      |\\    \\
   |   /  |      |  \\   |
   |  [===|======|===]  |
   |   \\  |      |  /   |
    \\   '-|______|-   /
     '-.____________.-'
       [==]      [==]
      `
    ),
    near: Sprite.createVariant(
      `
      .--------.
    .-'  ____  '-.
   /   /|    |\\   \\
  |   [========]   |
   \\   '------'   /
     [==]    [==]
      `
    ),
    medium: Sprite.createVariant(
      `
    .------.
   / [====] \\
  |  ======  |
   \\ [=]  [=] /
      `
    ),
    far: Sprite.createVariant(
      `
   .----.
  [======]
  (o)  (o)
      `
    ),
  }
);
