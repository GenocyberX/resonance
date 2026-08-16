import { Sprite } from '../../ascii/Sprite';
import { SpriteDefinition } from '../../ascii/types';

export const TrafficSedanSprite: SpriteDefinition = Sprite.define(
  'vehicle_traffic_sedan',
  'Traffic Sedan',
  '#f59e0b', // Amber
  {
    close: Sprite.createVariant(
      `
          .--------------------.
        .-'   ______________   '-.
       /    /|              |\\    \\
      |   /  |    TRAFFIC   |  \\   |
      |  |   |______________|   |  |
      |   \\  |              |  /   |
     /====='------------------'=====\\
    |  [==]     [  8888  ]      [==]  |
    |  [==]    ============     [==]  |
     \\______________________________/
       [OO]                    [OO]
      `
    ),
    near: Sprite.createVariant(
      `
        .----------------.
      .-'  ____________  '-.
     /   /|            |\\   \\
    |   [ |____________| ]   |
   /==========================\\
  |  [=]    [ 8888 ]      [=]  |
   \\__________________________/
     [O]                  [O]
      `
    ),
    medium: Sprite.createVariant(
      `
       .------------.
      /  /________\\  \\
     |  [==========]  |
    /==================\\
   |  [=]   [==]   [=]  |
    \\__________________/
      (o)          (o)
      `
    ),
    far: Sprite.createVariant(
      `
      .--------.
     / [======] \\
    |  [=]  [=]  |
     \\__________/
       (o)  (o)
      `
    ),
  }
);
