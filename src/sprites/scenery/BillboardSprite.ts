import { SpriteDefinition } from '../../ascii/types';

const PK = '#f43f5e'; // Neon Rose Frame
const CY = '#38bdf8'; // Cyan Synth Wave / Text
const GD = '#fde047'; // Golden Sunset Sun
const NV = '#0f172a'; // Deep Billboard Background
const ST = '#64748b'; // Structural Steel Truss
const BS = '#1e293b'; // Concrete Footing

export const BillboardSprite: SpriteDefinition = {
  id: 'scenery_billboard',
  name: 'Highway Billboard',
  category: 'STRUCTURE',
  defaultColor: '#f43f5e',
  worldWidth: 160,
  worldHeight: 110,
  visualScale: 1.0,
  variants: {
    close: {
      width: 26,
      height: 10,
      anchorX: 13,
      anchorY: 9,
      lines: [
        ".========================.",
        "| (O) PACIFIC SUNSET ::  |",
        "|  /\\   * SYNTHWAVE *    |",
        "| /==\\  ~~~~~~~~~~~~~    |",
        "'========================'",
        "    ||              ||    ",
        "    ||              ||    ",
        "    ||              ||    ",
        "   _||_            _||_   ",
        "  :====:          :====:  ",
      ],
      colors: [
        [PK, PK, PK, PK, PK, PK, PK, PK, PK, PK, PK, PK, PK, PK, PK, PK, PK, PK, PK, PK, PK, PK, PK, PK, PK, PK],
        [PK, NV, GD, GD, GD, NV, CY, CY, CY, CY, CY, CY, CY, CY, CY, CY, CY, NV, GD, GD, NV, NV, NV, NV, NV, PK],
        [PK, NV, CY, CY, NV, NV, PK, PK, PK, PK, PK, PK, PK, PK, PK, PK, NV, NV, NV, NV, NV, NV, NV, NV, NV, PK],
        [PK, NV, CY, CY, CY, NV, CY, CY, CY, CY, CY, CY, CY, CY, CY, CY, CY, NV, NV, NV, NV, NV, NV, NV, NV, PK],
        [PK, PK, PK, PK, PK, PK, PK, PK, PK, PK, PK, PK, PK, PK, PK, PK, PK, PK, PK, PK, PK, PK, PK, PK, PK, PK],
        ['', '', '', '', ST, ST, '', '', '', '', '', '', '', '', '', '', '', '', ST, ST, '', '', '', '', '', ''],
        ['', '', '', '', ST, ST, '', '', '', '', '', '', '', '', '', '', '', '', ST, ST, '', '', '', '', '', ''],
        ['', '', '', '', ST, ST, '', '', '', '', '', '', '', '', '', '', '', '', ST, ST, '', '', '', '', '', ''],
        ['', '', '', ST, ST, ST, ST, '', '', '', '', '', '', '', '', '', '', ST, ST, ST, ST, '', '', '', '', ''],
        ['', '', BS, BS, BS, BS, BS, BS, '', '', '', '', '', '', '', '', BS, BS, BS, BS, BS, BS, '', '', '', ''],
      ],
    },
    near: {
      width: 18,
      height: 7,
      anchorX: 9,
      anchorY: 6,
      lines: [
        ".================.",
        "|(O) PACIFIC ::  |",
        "| /\\  ~~~~~~~~~~ |",
        "'================'",
        "   ||        ||   ",
        "  _||_      _||_  ",
        " :====:    :====: ",
      ],
      colors: [
        [PK, PK, PK, PK, PK, PK, PK, PK, PK, PK, PK, PK, PK, PK, PK, PK, PK, PK],
        [PK, NV, GD, GD, GD, NV, CY, CY, CY, CY, CY, CY, CY, NV, GD, GD, NV, PK],
        [PK, NV, CY, CY, NV, CY, CY, CY, CY, CY, CY, CY, CY, CY, CY, NV, NV, PK],
        [PK, PK, PK, PK, PK, PK, PK, PK, PK, PK, PK, PK, PK, PK, PK, PK, PK, PK],
        ['', '', '', ST, ST, '', '', '', '', '', '', '', ST, ST, '', '', '', ''],
        ['', '', ST, ST, ST, ST, '', '', '', '', '', ST, ST, ST, ST, '', '', ''],
        ['', BS, BS, BS, BS, BS, BS, '', '', '', BS, BS, BS, BS, BS, BS, '', ''],
      ],
    },
    medium: {
      width: 12,
      height: 5,
      anchorX: 6,
      anchorY: 4,
      lines: [
        ".==========.",
        "|(O) SUN ::|",
        "'=========='",
        "  ||    ||  ",
        " :==:  :==: ",
      ],
      colors: [
        [PK, PK, PK, PK, PK, PK, PK, PK, PK, PK, PK, PK],
        [PK, GD, GD, GD, NV, CY, CY, CY, NV, GD, GD, PK],
        [PK, PK, PK, PK, PK, PK, PK, PK, PK, PK, PK, PK],
        ['', '', ST, ST, '', '', '', '', ST, ST, '', ''],
        ['', BS, BS, BS, BS, '', '', BS, BS, BS, BS, ''],
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
        " |||| ",
      ],
      colors: [
        [PK, PK, PK, PK, PK, PK],
        [PK, CY, GD, GD, CY, PK],
        ['', ST, ST, ST, ST, ''],
      ],
    },
  },
};
