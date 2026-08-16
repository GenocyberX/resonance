import { Sprite } from '../../ascii/Sprite';
import { SpriteDefinition } from '../../ascii/types';

const hutColors = {
  R: '#ef4444', // Red roof / safety ring
  W: '#f8fafc', // White walls
  G: '#38bdf8', // Glass lookouts
  T: '#b45309', // Wooden stilts
  '*': '#ef4444',
};

export const LifeguardHutSprite: SpriteDefinition = Sprite.define(
  'scenery_lifeguard_hut',
  'Beach Lifeguard Hut',
  '#ef4444',
  {
    close: Sprite.createColoredVariant(
      `
            .---/\\---.       
          ./__________\\.     
          |  [#] (O) [#]  |  
          |_______________|  
           /|   |   |   |\\   
          / |   |   |   | \\  
         /  |   |===|   |  \\ 
        '==================='
      `,
      hutColors,
      `
            RRRRRRRRRR       
          RRRRRRRRRRRRRR     
          W  GGG RRR GGG  W  
          WWWWWWWWWWWWWWWWW  
           TT   T   T   TT   
          T T   T   T   T T  
         T  T   T T T   T  T 
        TTTTTTTTTTTTTTTTTTTTT
      `
    ),
    near: Sprite.createColoredVariant(
      `
          .-/\\-.    
        ./______\\.  
        | [#](O) |  
        |________|  
         /|  | |\\   
        / |==| | \\  
       '==========' 
      `,
      hutColors,
      `
          RRRRRR    
        RRRRRRRRRR  
        W GGGWWR W  
        WWWWWWWWWW  
         TT  T TT   
        T TTTT T T  
       TTTTTTTTTTTT 
      `
    ),
    medium: Sprite.createColoredVariant(
      `
         ./\\/\\. 
        | [##] |
        |______|
         /|  |\\ 
      `,
      hutColors,
      `
         RRRRRR 
        W GGGG W
        WWWWWWWW
         TT  TT 
      `
    ),
    far: Sprite.createColoredVariant(
      `
        /\\
        ||
      `,
      hutColors,
      `
        RR
        TT
      `
    ),
  },
  {
    category: 'BUILDING',
    worldWidth: 150,
    worldHeight: 180,
    visualScale: 1.0,
  }
);
