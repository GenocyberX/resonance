import { Sprite } from '../../ascii/Sprite';
import { SpriteDefinition } from '../../ascii/types';

export const TrafficConeSprite: SpriteDefinition = Sprite.define(
  'obstacle_traffic_cone',
  'Highway Traffic Cone',
  '#f97316', // Orange
  {
    close: Sprite.createVariant(
      `
         /\\
        /==\\
       /====\\
      /======\\
      |______|
      `
    ),
    near: Sprite.createVariant(
      `
        /\\
       /==\\
      /====\\
      |____|
      `
    ),
    medium: Sprite.createVariant(
      `
        /\\
       /==\\
       |__|
      `
    ),
    far: Sprite.createVariant(
      `
        /\\
        ||
      `
    ),
  },
  {
    category: 'OBSTACLE',
    worldWidth: 40,
    worldHeight: 45,
    visualScale: 1.0,
  }
);
