import { SpriteDefinition } from '../../ascii/types';

const CY = '#06b6d4'; // Cyan Neon Arc Glow
const MG = '#ec4899'; // Magenta Accent Core
const ST = '#94a3b8'; // Titanium Dark Pole
const DK = '#1e1b4b'; // Shadow Crevice
const BS = '#020617'; // Cyber Grid Mount

export const CyberStreetLampSprite: SpriteDefinition = {
  id: 'scenery_cyber_lamp',
  name: 'Cyber Neon Street Lamp',
  category: 'ROADSIDE',
  defaultColor: '#06b6d4',
  worldWidth: 45,
  worldHeight: 110,
  visualScale: 1.0,
  variants: {
    close: {
      width: 12,
      height: 12,
      anchorX: 6,
      anchorY: 11,
      lines: [
        "  .======.  ",
        " / (CY)(M) \\",
        "'---.--.---'",
        "    |  |    ",
        "    |  |    ",
        "    |  |    ",
        "    |  |    ",
        "    |  |    ",
        "    |  |    ",
        "    |  |    ",
        "   /====\\   ",
        "  :======:  ",
      ],
      colors: [
        ['', '', CY, CY, CY, CY, CY, CY, CY, CY, '', ''],
        ['', CY, CY, CY, CY, MG, MG, CY, CY, CY, CY, ''],
        [MG, MG, MG, MG, MG, MG, MG, MG, MG, MG, MG, MG],
        ['', '', '', '', ST, '', '', ST, '', '', '', ''],
        ['', '', '', '', ST, '', '', ST, '', '', '', ''],
        ['', '', '', '', ST, '', '', ST, '', '', '', ''],
        ['', '', '', '', ST, '', '', ST, '', '', '', ''],
        ['', '', '', '', ST, '', '', ST, '', '', '', ''],
        ['', '', '', '', DK, '', '', DK, '', '', '', ''],
        ['', '', '', '', DK, '', '', DK, '', '', '', ''],
        ['', '', '', CY, CY, CY, CY, CY, CY, '', '', ''],
        ['', '', BS, BS, BS, BS, BS, BS, BS, BS, '', ''],
      ],
    },
    near: {
      width: 8,
      height: 8,
      anchorX: 4,
      anchorY: 7,
      lines: [
        " .====. ",
        "/(CYMG)\\",
        "'--.-.-'",
        "   | |  ",
        "   | |  ",
        "   | |  ",
        "  /===\\ ",
        " :=====:",
      ],
      colors: [
        ['', CY, CY, CY, CY, CY, CY, ''],
        [CY, CY, CY, MG, MG, CY, CY, CY],
        [MG, MG, MG, MG, MG, MG, MG, MG],
        ['', '', '', ST, '', ST, '', ''],
        ['', '', '', ST, '', ST, '', ''],
        ['', '', '', DK, '', DK, '', ''],
        ['', '', CY, CY, CY, CY, '', ''],
        ['', BS, BS, BS, BS, BS, BS, ''],
      ],
    },
    medium: {
      width: 6,
      height: 5,
      anchorX: 3,
      anchorY: 4,
      lines: [
        ".====.",
        "'(CY)'",
        "  ||  ",
        " /==\\ ",
        ":====:",
      ],
      colors: [
        [CY, CY, CY, CY, CY, CY],
        [MG, CY, CY, CY, CY, MG],
        ['', '', ST, ST, '', ''],
        ['', CY, CY, CY, CY, ''],
        [BS, BS, BS, BS, BS, BS],
      ],
    },
    far: {
      width: 4,
      height: 3,
      anchorX: 2,
      anchorY: 2,
      lines: [
        "(CY)",
        " || ",
        ":==:",
      ],
      colors: [
        [CY, CY, CY, CY],
        ['', ST, ST, ''],
        [BS, BS, BS, BS],
      ],
    },
  },
};
