import { Sprite } from '../../ascii/Sprite';
import { SpriteDefinition } from '../../ascii/types';

const palmColors = {
  L: '#6ee7b7', // Light green highlights
  G: '#10b981', // Mid green foliage
  D: '#047857', // Dark shadow foliage
  T: '#b45309', // Warm trunk bark
  S: '#78350f', // Dark trunk shadow
  '*': '#10b981',
};

export const PalmTreeSprite: SpriteDefinition = Sprite.define(
  'scenery_palm_tree',
  'Tropical Palm Tree',
  '#10b981',
  {
    close: Sprite.createColoredVariant(
      `
             .---.
        .--/       \\--.
     .-/   /   |   \\   \\-.
   _/ /   /    |    \\   \\ \\_
  /  /   /     |     \\   \\  \\
 /__/   /      |      \\   \\__\\
       /____.-----.____\\
             ( @ )
              ) (
             /   \\
            (  #  )
             \\   /
              ) (
             ( # )
             /   \\
      `,
      palmColors,
      `
             LLLLL
        GGGD       DGGG
     LLD   G   G   G   DLL.
   GG D   G    D    G   D GG
  G  D   G     D     G   D  G
 DDDD   G      D      G   DDDD
       DDDDDLLLLLDDDDD
             T T T
              S S
             T   T
            S  T  S
             T   T
              S S
             T S T
             T   T
      `
    ),
    near: Sprite.createColoredVariant(
      `
         .--.
      .-/ |  \\-.
    _/ /  |   \\ \\_
   /  /   |    \\  \\
  /__/    |     \\__\\
       .--'--.
        ( @ )
         ) (
        ( # )
        /   \\
      `,
      palmColors,
      `
         LLLL
      GGD G  DGG
    GG D  D   D GG
   G  D   D    D  G
  DDDD    D     DDDD
       TTTTTTT
        T T T
         S S
        T S T
        T   T
      `
    ),
    medium: Sprite.createColoredVariant(
      `
        _\\|/_
       (_/|\\_)
         |||
         |||
         |||
      `,
      palmColors,
      `
        GGGGG
       DDDDDDD
         TTT
         STS
         TTT
      `
    ),
    far: Sprite.createColoredVariant(
      `
        \\|/
         |
         |
      `,
      palmColors,
      `
        GGG
         T
         T
      `
    ),
  }
);
