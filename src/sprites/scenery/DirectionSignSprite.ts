import { Sprite } from '../../ascii/Sprite';
import { SpriteDefinition } from '../../ascii/types';

const signColors = {
  G: '#15803d', // Highway green sign
  W: '#f8fafc', // White text / border
  Y: '#fde047', // Yellow exit badge
  P: '#64748b', // Steel gantry pole
  '*': '#15803d',
};

export const DirectionSignSprite: SpriteDefinition = Sprite.define(
  'scenery_direction_sign',
  'Highway Direction Sign',
  '#15803d',
  {
    close: Sprite.createColoredVariant(
      `
        .=========================.
        | [EXIT 1]  COAST BEACH ->|
        |           OCEAN DRIVE   |
        '========================='
                    ||             
                    ||             
                    ||             
                    ||             
                   _||_            
      `,
      signColors,
      `
        WWWWWWWWWWWWWWWWWWWWWWWWWWW
        W YYYYYYYY  WWWWWWWWWWW WWW
        W           WWWWWWWWWWW   W
        WWWWWWWWWWWWWWWWWWWWWWWWWWW
                    PP             
                    PP             
                    PP             
                    PP             
                   PPPP            
      `
    ),
    near: Sprite.createColoredVariant(
      `
        .===================.
        | [EX]  COASTWAY -> |
        '==================='
                 ||          
                 ||          
                 ||          
                _||_         
      `,
      signColors,
      `
        WWWWWWWWWWWWWWWWWWWWW
        W YYYY  WWWWWWWW WW W
        WWWWWWWWWWWWWWWWWWWWW
                 PP          
                 PP          
                 PP          
                PPPP         
      `
    ),
    medium: Sprite.createColoredVariant(
      `
        .=============.
        | [COAST ->]  |
        '============='
              ||       
              ||       
      `,
      signColors,
      `
        WWWWWWWWWWWWWWW
        W WWWWWWWWWW  W
        WWWWWWWWWWWWWWW
              PP       
              PP       
      `
    ),
    far: Sprite.createColoredVariant(
      `
        .[====].
           ||   
      `,
      signColors,
      `
        WWWWWWWW
           PP   
      `
    ),
  },
  {
    category: 'ROADSIDE',
    worldWidth: 160,
    worldHeight: 150,
    visualScale: 1.0,
  }
);
