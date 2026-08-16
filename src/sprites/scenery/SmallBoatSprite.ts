import { Sprite } from '../../ascii/Sprite';
import { SpriteDefinition } from '../../ascii/types';

const boatColors = {
  C: '#38bdf8', // Cabin cyan
  W: '#f8fafc', // White canopy
  H: '#fbbf24', // Yellow hull
  R: '#0284c7', // Ocean ripples
  '*': '#fbbf24',
};

export const SmallBoatSprite: SpriteDefinition = Sprite.define(
  'scenery_small_boat',
  'Coastal Skiff Boat',
  '#fbbf24',
  {
    close: Sprite.createColoredVariant(
      `
            .----.      
           / [#]  \\     
         .============. 
        ~\\____________/~
         ~~~~~~~~~~~~~~ 
         ~  ~  ~  ~  ~  
      `,
      boatColors,
      `
            WWWW        
           C CCCC C     
         HHHHHHHHHHHHHH 
        RHHHHHHHHHHHHHHR
         RRRRRRRRRRRRRR 
         R  R  R  R  R  
      `
    ),
    near: Sprite.createColoredVariant(
      `
           .---.     
         .=======.   
        ~\\_______/~  
         ~~~~~~~~~   
      `,
      boatColors,
      `
           WWWW      
         HHHHHHHHH   
        RHHHHHHHHHR  
         RRRRRRRRR   
      `
    ),
    medium: Sprite.createColoredVariant(
      `
          /===\\  
         \\_____/ 
         ~~~~~~~ 
      `,
      boatColors,
      `
          WWWW   
         HHHHHHH 
         RRRRRRR 
      `
    ),
    far: Sprite.createColoredVariant(
      `
         \\___/
         ~~~~~
      `,
      boatColors,
      `
         HHHHH
         RRRRR
      `
    ),
  },
  {
    category: 'WATERCRAFT',
    worldWidth: 120,
    worldHeight: 80,
    visualScale: 1.0,
  }
);
