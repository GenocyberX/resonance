import { Sprite } from '../../ascii/Sprite';
import { SpriteDefinition } from '../../ascii/types';

const grassColors = {
  L: '#fde047', // Sun gold tip
  G: '#34d399', // Sea oat green
  S: '#d97706', // Sandy base
  '*': '#34d399',
};

export const CoastalGrassSprite: SpriteDefinition = Sprite.define(
  'scenery_coastal_grass',
  'Dune Grass Cluster',
  '#34d399',
  {
    close: Sprite.createColoredVariant(
      `
       |  / | \\  |  
      /| /  |  \\ |\\ 
     //|/   |   \\|\\\\
     '==============='
      `,
      grassColors,
      `
       L  L G L  L  
      GG G  G  G GG 
     GGG    G    GGG
     SSSSSSSSSSSSSSSSS
      `
    ),
    near: Sprite.createColoredVariant(
      `
       /|\\ /|\\   
      //|\\\\//|\\\\ 
      '========='
      `,
      grassColors,
      `
       LGL LGL   
      GGGGGGGGGG 
      SSSSSSSSSS 
      `
    ),
    medium: Sprite.createColoredVariant(
      `
       ||| |||
       '====='
      `,
      grassColors,
      `
       LGL LGL
       SSSSS  
      `
    ),
    far: Sprite.createColoredVariant(
      `
       |||
      `,
      grassColors,
      `
       GGG
      `
    ),
  },
  {
    category: 'VEGETATION_SMALL',
    worldWidth: 80,
    worldHeight: 50,
    visualScale: 1.0,
  }
);
