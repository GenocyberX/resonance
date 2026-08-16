import { Sprite } from '../../ascii/Sprite';
import { SpriteDefinition } from '../../ascii/types';

const shackColors = {
  R: '#d97706', // Thatch roof amber
  W: '#fde68a', // Light straw highlight
  T: '#92400e', // Wood framing
  C: '#38bdf8', // Cyan bar counter / decor
  Y: '#fbbf24', // Lantern glow
  '*': '#d97706',
};

export const BeachShackSprite: SpriteDefinition = Sprite.define(
  'scenery_beach_shack',
  'Tiki Beach Shack',
  '#d97706',
  {
    close: Sprite.createColoredVariant(
      `
              .--------------.             
          .--/   /\\  /\\  /\\   \\--.         
        ./______/__\\/__\\/__\\______\\.       
       /============================\\      
      /______________________________\\     
         |   (o)              (o)   |      
         |    |====[======]====|    |      
         |====|                |====|      
         |  | |   |        |   | |  |      
         |  | |   |        |   | |  |      
         |  | |   |        |   | |  |      
         |__|_|___|________|___|_|__|      
        /============================\\     
      `,
      shackColors,
      `
              WWWWWWWWWWWWWW               
          RRRR   WW  WW  WW   RRRR         
        RRRRRRRRRRRRRRRRRRRRRRRRRRRR       
       WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW      
      RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR     
         T   YYY              YYY   T      
         T    TCCCCCCCCCCCCCCCT     T      
         TTTTTT                TTTTTT      
         T  T T   T        T   T T  T      
         T  T T   T        T   T T  T      
         T  T T   T        T   T T  T      
         TTTTTTTTTTTTTTTTTTTTTTTTTTTT      
        TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT     
      `
    ),
    near: Sprite.createColoredVariant(
      `
            .------------.    
          ./  /\\  /\\  /\\  \\.  
         ./________________\\. 
        /====================\\
         | (o)        (o) |   
         |===[========]===|   
         | |            | |   
         |_|____________|_|   
      `,
      shackColors,
      `
            WWWWWWWWWWWW      
          RR  WW  WW  WW  RR  
         RRRRRRRRRRRRRRRRRRRR 
        WWWWWWWWWWWWWWWWWWWWWW
         T YYY        YYY T   
         TTTCCCCCCCCCCCCCTTT  
         T T            T T   
         TTTTTTTTTTTTTTTTTT   
      `
    ),
    medium: Sprite.createColoredVariant(
      `
           .----------.  
          /____________\\ 
          | (o)    (o) | 
          |============| 
          |            | 
          |____________| 
      `,
      shackColors,
      `
           WWWWWWWWWW    
          RRRRRRRRRRRRRR 
          T YYY    YYY T 
          TTTCCCCCCCCCTTT
          T            T 
          TTTTTTTTTTTTTT 
      `
    ),
    far: Sprite.createColoredVariant(
      `
          /------\\
          |======|
          |      |
      `,
      shackColors,
      `
          RRRRRR  
          TTTTTT  
          TTTTTT  
      `
    ),
  },
  {
    category: 'BUILDING',
    worldWidth: 200,
    worldHeight: 220,
    visualScale: 1.0,
  }
);
