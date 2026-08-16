import { SpriteDefinition } from '../../ascii/types';

const GN = '#15803d'; // Highway Reflective Green
const YL = '#fde047'; // Exit Gold Badge
const WH = '#f8fafc'; // White Text / Arrows
const ST = '#64748b'; // Galvanized Steel Gantry
const BS = '#1e293b'; // Concrete Footing

export const DirectionSignSprite: SpriteDefinition = {
  id: 'scenery_direction_sign',
  name: 'Highway Direction Sign',
  category: 'ROADSIDE',
  defaultColor: '#15803d',
  worldWidth: 120,
  worldHeight: 100,
  visualScale: 1.0,
  variants: {
    close: {
      width: 22,
      height: 10,
      anchorX: 11,
      anchorY: 9,
      lines: [
        ".====================.",
        "|[EX 1] COAST HWY -> |",
        "|       BEACH BAY  ^ |",
        "'===================='",
        "         ||           ",
        "         ||           ",
        "         ||           ",
        "         ||           ",
        "        _||_          ",
        "       :====:         ",
      ],
      colors: [
        [GN, GN, GN, GN, GN, GN, GN, GN, GN, GN, GN, GN, GN, GN, GN, GN, GN, GN, GN, GN, GN, GN],
        [GN, YL, YL, YL, YL, YL, YL, GN, WH, WH, WH, WH, WH, WH, WH, GN, WH, WH, GN, GN, GN, GN],
        [GN, GN, GN, GN, GN, GN, GN, GN, WH, WH, WH, WH, WH, WH, GN, GN, WH, GN, GN, GN, GN, GN],
        [GN, GN, GN, GN, GN, GN, GN, GN, GN, GN, GN, GN, GN, GN, GN, GN, GN, GN, GN, GN, GN, GN],
        ['', '', '', '', '', '', '', '', '', ST, ST, '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', ST, ST, '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', ST, ST, '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', ST, ST, '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', ST, ST, ST, ST, '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', BS, BS, BS, BS, BS, BS, '', '', '', '', '', '', '', '', ''],
      ],
    },
    near: {
      width: 16,
      height: 7,
      anchorX: 8,
      anchorY: 6,
      lines: [
        ".==============.",
        "|[EX] COAST -> |",
        "|     OCEAN  ^ |",
        "'=============='",
        "       ||       ",
        "      _||_      ",
        "     :====:     ",
      ],
      colors: [
        [GN, GN, GN, GN, GN, GN, GN, GN, GN, GN, GN, GN, GN, GN, GN, GN],
        [GN, YL, YL, YL, YL, GN, WH, WH, WH, WH, GN, WH, WH, GN, GN, GN],
        [GN, GN, GN, GN, GN, GN, WH, WH, WH, WH, GN, GN, WH, GN, GN, GN],
        [GN, GN, GN, GN, GN, GN, GN, GN, GN, GN, GN, GN, GN, GN, GN, GN],
        ['', '', '', '', '', '', '', ST, ST, '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', ST, ST, ST, ST, '', '', '', '', '', ''],
        ['', '', '', '', '', BS, BS, BS, BS, BS, BS, '', '', '', '', ''],
      ],
    },
    medium: {
      width: 10,
      height: 5,
      anchorX: 5,
      anchorY: 4,
      lines: [
        ".========.",
        "|[E] -> ^|",
        "'========'",
        "    ||    ",
        "   :==:   ",
      ],
      colors: [
        [GN, GN, GN, GN, GN, GN, GN, GN, GN, GN],
        [GN, YL, YL, YL, GN, WH, WH, GN, WH, GN],
        [GN, GN, GN, GN, GN, GN, GN, GN, GN, GN],
        ['', '', '', '', ST, ST, '', '', '', ''],
        ['', '', '', BS, BS, BS, BS, '', '', ''],
      ],
    },
    far: {
      width: 6,
      height: 3,
      anchorX: 3,
      anchorY: 2,
      lines: [
        ".----.",
        "|====|",
        "  ||  ",
      ],
      colors: [
        [GN, GN, GN, GN, GN, GN],
        [GN, YL, WH, WH, GN, GN],
        ['', '', ST, ST, '', ''],
      ],
    },
  },
};
