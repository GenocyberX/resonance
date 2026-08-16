import { Sprite } from '../../ascii/Sprite';
import { SpriteDefinition } from '../../ascii/types';

const cafeColors = {
  N: '#f43f5e', // Neon roof peak
  A: '#fb7185', // Awning coral stripe
  W: '#f8fafc', // Awning white stripe
  B: '#0f766e', // Teal building body
  G: '#38bdf8', // Glowing cyan glass windows
  D: '#042f2e', // Foundation / entrance
  Y: '#fbbf24', // Warm light interior
  '*': '#0f766e',
};

export const RoadsideCafeSprite: SpriteDefinition = Sprite.define(
  'scenery_roadside_cafe',
  'Coastal Diner Cafe',
  '#0f766e',
  {
    close: Sprite.createColoredVariant(
      `
                 .-------.                 
               ./  * * *  \\.               
             .-------------.               
            /               \\              
         .---------------------.           
        /\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\           
        |  .------.   .------.  |          
        |  | #### |   | #### |  |          
        |  | #### | | | #### |  |          
        |  | #### | | | #### |  |          
        |  '------' | '------'  |          
        |           |           |          
        |___________|___________|          
       /=========================\\         
      `,
      cafeColors,
      `
                 NNNNNNNNN                 
               NN  Y Y Y  NN               
             BBBBBBBBBBBBBBB               
            B               B              
         BBBBBBBBBBBBBBBBBBBBBBB           
        AWAWAWAWAWAWAWAWAWAWAWAW           
        B  GGGGGG   D GGGGGG  B          
        B  G GGG G  D G GGG G B          
        B  G GGG G  D G GGG G B          
        B  G GGG G  D G GGG G B          
        B  GGGGGG   D GGGGGG  B          
        B  DDDDDD   D DDDDDD  B          
        BBBDDDDDDDDDDDDDDDDDDDBB          
       DDDDDDDDDDDDDDDDDDDDDDDDD          
      `
    ),
    near: Sprite.createColoredVariant(
      `
               .---.       
             .-------.     
           .-----------.   
          /\\/\\/\\/\\/\\/\\/\\   
          | .---. .---. |  
          | |###| |###| |  
          | |###| |###| |  
          |_|___|_|___|_|  
         /===============\\ 
      `,
      cafeColors,
      `
               NNNNN       
             BBBBBBBBB     
           BBBBBBBBBBBBB   
          AWAWAWAWAWAWAW   
          B GGGGG GGGGG B  
          B G GGG G GGG B  
          B GGGGG GGGGG B  
          BBDDDDDBDDBDDBB  
         DDDDDDDDDDDDDDDDD 
      `
    ),
    medium: Sprite.createColoredVariant(
      `
             .-----.   
            /\\/\\/\\/\\   
            | [###] |  
            | [###] |  
            |_______|  
      `,
      cafeColors,
      `
             BBBBBBB   
            AWAWAWAW   
            B GGGGG B  
            B GGGGG B  
            BBBBBBBBB  
      `
    ),
    far: Sprite.createColoredVariant(
      `
            /=====\\
            |[][] |
            |_____|
      `,
      cafeColors,
      `
            AAAAAAA
            BGGGG B
            BBBBBBB
      `
    ),
  },
  {
    category: 'BUILDING',
    worldWidth: 220,
    worldHeight: 250,
    visualScale: 1.0,
  }
);
