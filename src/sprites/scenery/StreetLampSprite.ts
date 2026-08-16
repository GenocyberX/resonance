import { SpriteDefinition } from '../../ascii/types';

const GL = '#fef08a'; // Halogen Glowing Bulb
const HL = '#fde047'; // Warm Light Corona
const ST = '#94a3b8'; // Brushed Steel Arm / Fixture
const DK = '#475569'; // Steel Pole Shadow
const BS = '#1e293b'; // Base Concrete Mount

export const StreetLampSprite: SpriteDefinition = {
  id: 'street_lamp',
  name: 'Highway Street Lamp',
  category: 'ROADSIDE',
  defaultColor: '#fde047',
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
        "   .------. ",
        "  /  (GL)  \\",
        " '---.-----'",
        "      |     ",
        "      |     ",
        "      |     ",
        "      |     ",
        "      |     ",
        "      |     ",
        "      |     ",
        "     _|_    ",
        "    :===:   ",
      ],
      colors: [
        ['', '', '', ST, ST, ST, ST, ST, ST, ST, '', ''],
        ['', '', ST, ST, GL, GL, GL, GL, ST, ST, '', ''],
        ['', ST, ST, ST, HL, HL, HL, HL, ST, ST, ST, ''],
        ['', '', '', '', '', ST, '', '', '', '', '', ''],
        ['', '', '', '', '', ST, '', '', '', '', '', ''],
        ['', '', '', '', '', ST, '', '', '', '', '', ''],
        ['', '', '', '', '', ST, '', '', '', '', '', ''],
        ['', '', '', '', '', ST, '', '', '', '', '', ''],
        ['', '', '', '', '', ST, '', '', '', '', '', ''],
        ['', '', '', '', '', DK, '', '', '', '', '', ''],
        ['', '', '', '', DK, DK, DK, '', '', '', '', ''],
        ['', '', '', BS, BS, BS, BS, BS, '', '', '', ''],
      ],
    },
    near: {
      width: 8,
      height: 8,
      anchorX: 4,
      anchorY: 7,
      lines: [
        "  .---. ",
        " / (GL)\\",
        "'--.---'",
        "    |   ",
        "    |   ",
        "    |   ",
        "   _|_  ",
        "  :===: ",
      ],
      colors: [
        ['', '', ST, ST, ST, ST, ST, ''],
        ['', ST, ST, GL, GL, ST, ST, ''],
        [ST, ST, HL, HL, HL, ST, ST, ST],
        ['', '', '', ST, '', '', '', ''],
        ['', '', '', ST, '', '', '', ''],
        ['', '', '', DK, '', '', '', ''],
        ['', '', DK, DK, DK, '', '', ''],
        ['', BS, BS, BS, BS, BS, '', ''],
      ],
    },
    medium: {
      width: 6,
      height: 5,
      anchorX: 3,
      anchorY: 4,
      lines: [
        " .--. ",
        "'(GL)'",
        "  |   ",
        " _|_  ",
        ":===: ",
      ],
      colors: [
        ['', ST, ST, ST, ST, ''],
        [ST, GL, GL, GL, GL, ST],
        ['', '', ST, '', '', ''],
        ['', DK, DK, DK, '', ''],
        [BS, BS, BS, BS, BS, ''],
      ],
    },
    far: {
      width: 4,
      height: 3,
      anchorX: 2,
      anchorY: 2,
      lines: [
        "(GL)",
        " || ",
        ":==:",
      ],
      colors: [
        [GL, GL, GL, GL],
        ['', ST, ST, ''],
        [BS, BS, BS, BS],
      ],
    },
  },
};
