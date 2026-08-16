import { Sprite } from '../../ascii/Sprite';
import { SpriteDefinition } from '../../ascii/types';

const billboardColors = {
  F: '#f43f5e', // Frame neon pink
  T: '#38bdf8', // Text cyan
  S: '#fde047', // Sun gold
  P: '#64748b', // Steel poles
  '*': '#f43f5e',
};

export const BillboardSprite: SpriteDefinition = Sprite.define(
  'scenery_billboard',
  'Coastal Highway Billboard',
  '#f43f5e',
  {
    close: Sprite.createColoredVariant(
      `
       .==================================.
       |  (o)  PACIFIC COAST HIGHWAY  (o) |
       |       * SUN * SURF * SOUND       |
       '=================================='
           ||                        ||    
           ||                        ||    
           ||                        ||    
           ||                        ||    
          _||_                      _||_   
      `,
      billboardColors,
      `
       FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF
       F  SSS  TTTTTTTTTTTTTTTTTTTTT  SSS F
       F       S SSS S SSSS S SSSSS       F
       FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF
           PP                        PP    
           PP                        PP    
           PP                        PP    
           PP                        PP    
          PPPP                      PPPP   
      `
    ),
    near: Sprite.createColoredVariant(
      `
       .==========================.
       |  PACIFIC COAST  * SUN *  |
       '=========================='
           ||                ||    
           ||                ||    
           ||                ||    
          _||_              _||_   
      `,
      billboardColors,
      `
       FFFFFFFFFFFFFFFFFFFFFFFFFFFF
       F  TTTTTTTTTTTTT  S SSS S  F
       FFFFFFFFFFFFFFFFFFFFFFFFFFFF
           PP                PP    
           PP                PP    
           PP                PP    
          PPPP              PPPP   
      `
    ),
    medium: Sprite.createColoredVariant(
      `
       .=================.
       |  PACIFIC COAST  |
       '================='
           ||       ||    
           ||       ||    
      `,
      billboardColors,
      `
       FFFFFFFFFFFFFFFFFFF
       F  TTTTTTTTTTTTT  F
       FFFFFFFFFFFFFFFFFFF
           PP       PP    
           PP       PP    
      `
    ),
    far: Sprite.createColoredVariant(
      `
       .=========.
       | [COAST] |
       '========='
           ||     
      `,
      billboardColors,
      `
       FFFFFFFFFFF
       F TTTTTTT F
       FFFFFFFFFFF
           PP     
      `
    ),
  },
  {
    category: 'ROADSIDE',
    worldWidth: 200,
    worldHeight: 160,
    visualScale: 1.0,
  }
);
