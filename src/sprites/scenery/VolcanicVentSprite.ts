import { SpriteDefinition } from '../../ascii/types';

const YL = '#fde047'; // White-Hot Magma Core
const OG = '#ea580c'; // Incandescent Lava Orange
const RD = '#dc2626'; // Deep Molten Red
const OB = '#1c1917'; // Cooled Obsidian Crust
const BS = '#0c0a09'; // Volcanic Ash Ground

export const VolcanicVentSprite: SpriteDefinition = {
  id: 'scenery_volcanic_vent',
  name: 'Active Volcanic Fumarole',
  category: 'STRUCTURE',
  defaultColor: '#ea580c',
  worldWidth: 90,
  worldHeight: 65,
  visualScale: 1.0,
  variants: {
    close: {
      width: 18,
      height: 8,
      anchorX: 9,
      anchorY: 7,
      lines: [
        "     (  )   ( )   ",
        "    (____) (___)  ",
        "   /  .------.  \\ ",
        "  /  / *░░*   \\  \\",
        " /  / *▒▒▒▒*   \\  ",
        "|  |  *▓▓▓▓*   |  ",
        "|__|____________|_",
        "::..::..::..::..::",
      ],
      colors: [
        ['', '', '', '', '', OG, OG, '', '', '', OG, OG, '', '', '', '', '', ''],
        ['', '', '', '', OG, YL, YL, OG, '', OG, YL, OG, '', '', '', '', '', ''],
        ['', '', '', OB, OB, OB, OB, OB, OB, OB, OB, OB, '', OB, '', '', '', ''],
        ['', '', OB, '', OB, YL, YL, YL, OB, '', '', OB, '', OB, '', '', '', ''],
        ['', OB, '', OB, OG, OG, RD, RD, OB, '', '', '', '', '', '', '', '', ''],
        [OB, '', OB, '', RD, RD, RD, RD, '', OB, '', '', '', '', '', '', '', ''],
        [OB, OB, OB, OB, OB, OB, OB, OB, OB, OB, OB, OB, OB, OB, OB, OB, OB, ''],
        [BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS],
      ],
    },
    near: {
      width: 12,
      height: 5,
      anchorX: 6,
      anchorY: 4,
      lines: [
        "   ( ) ( )  ",
        "  / .---. \\ ",
        " / / *░░* \\ ",
        "| | *▒▒*  | ",
        "::..::..::..",
      ],
      colors: [
        ['', '', '', OG, OG, '', OG, OG, '', '', '', ''],
        ['', '', OB, OB, OB, OB, OB, OB, OB, '', '', ''],
        ['', OB, '', OB, YL, YL, YL, OB, '', '', '', ''],
        [OB, '', OB, OG, OG, RD, '', OB, '', '', '', ''],
        [BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS],
      ],
    },
    medium: {
      width: 8,
      height: 3,
      anchorX: 4,
      anchorY: 2,
      lines: [
        "  *░░*  ",
        " / *▒▒*\\",
        "::..::..",
      ],
      colors: [
        ['', '', YL, YL, YL, YL, '', ''],
        ['', OB, OG, OG, OG, OB, '', ''],
        [BS, BS, BS, BS, BS, BS, BS, BS],
      ],
    },
    far: {
      width: 4,
      height: 2,
      anchorX: 2,
      anchorY: 1,
      lines: [
        "*░░*",
        "::..",
      ],
      colors: [
        [YL, OG, OG, YL],
        [BS, BS, BS, BS],
      ],
    },
  },
};
