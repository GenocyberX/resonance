import { Sprite } from '../../ascii/Sprite';
import { SpriteDefinition } from '../../ascii/types';

const lampColors = {
  Y: '#fef08a', // Halogen bulb glow
  G: '#fbbf24', // Warm lamp housing
  P: '#94a3b8', // Brushed steel pole
  '*': '#fbbf24',
};

export const StreetLampSprite: SpriteDefinition = Sprite.define(
  'scenery_street_lamp',
  'Coastal Highway Street Lamp',
  '#fbbf24',
  {
    close: Sprite.createColoredVariant(
      `
            .---.    
           / (o) \\   
          '---.---'  
              |      
              |      
              |      
              |      
              |      
              |      
              |      
             _|_     
      `,
      lampColors,
      `
            GGGGG    
           G YYY G   
          GGGGGGGGG  
              P      
              P      
              P      
              P      
              P      
              P      
              P      
             PPP     
      `
    ),
    near: Sprite.createColoredVariant(
      `
           .---.  
          '-(o)-' 
             |    
             |    
             |    
             |    
             |    
            _|_   
      `,
      lampColors,
      `
           GGGGG  
          GGYYYGG 
             P    
             P    
             P    
             P    
             P    
            PPP   
      `
    ),
    medium: Sprite.createColoredVariant(
      `
          .(o). 
            |   
            |   
            |   
      `,
      lampColors,
      `
          GYYYG 
            P   
            P   
            P   
      `
    ),
    far: Sprite.createColoredVariant(
      `
          (o)
           | 
           | 
      `,
      lampColors,
      `
          YYY
           P 
           P 
      `
    ),
  },
  {
    category: 'ROADSIDE',
    worldWidth: 90,
    worldHeight: 170,
    visualScale: 1.0,
  }
);
