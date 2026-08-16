import { Sprite } from '../../ascii/Sprite';
import { SpriteDefinition } from '../../ascii/types';

export const RockSprite: SpriteDefinition = Sprite.define(
  'obstacle_rock',
  'Roadside Boulder / Rock',
  '#78716c', // Stone grey
  {
    close: Sprite.createVariant(
      `
          .-------.
        .-'  _   _  '-.
       /   / \\ / \\     \\
      |   (   X   )  _  |
       \\   \\_/ \\_/  / \\ /
        '-.________/___.-'
      `
    ),
    near: Sprite.createVariant(
      `
        .-----.
       / _   _ \\
      | ( X )   |
       \\_\\_/_/_/
      `
    ),
    medium: Sprite.createVariant(
      `
        .---.
       / X X \\
       '-----'
      `
    ),
    far: Sprite.createVariant(
      `
        (_)
      `
    ),
  }
);
