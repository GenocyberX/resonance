import { SpriteDefinition } from '../../ascii/types';

const YL = '#fde047'; // Vivid Caution Yellow
const BK = '#0f172a'; // Black Graphic Symbol
const ST = '#64748b'; // Steel Post
const BS = '#1e293b'; // Base Mount

export const WarningSignSprite: SpriteDefinition = {
  id: 'scenery_warning_sign',
  name: 'Diamond Warning Sign',
  category: 'ROADSIDE',
  defaultColor: '#fde047',
  worldWidth: 50,
  worldHeight: 110,
  visualScale: 1.0,
  variants: {
    close: {
      width: 14,
      height: 12,
      anchorX: 7,
      anchorY: 11,
      lines: [
        "      /\\      ",
        "     /░░\\     ",
        "    /░/\\░\\    ",
        "   /░/  \\░\\   ",
        "  /░/ ░░ \\░\\  ",
        "  \\░\\ ░░ /░/  ",
        "   \\░\\  /░/   ",
        "    \\░\\/░/    ",
        "     \\░░/     ",
        "      \\/      ",
        "      ||      ",
        "     :==:     ",
      ],
      colors: [
        ['', '', '', '', '', '', YL, YL, '', '', '', '', '', ''],
        ['', '', '', '', '', YL, BK, BK, YL, '', '', '', '', ''],
        ['', '', '', '', YL, BK, YL, YL, BK, YL, '', '', '', ''],
        ['', '', '', YL, BK, YL, BK, BK, YL, BK, YL, '', '', ''],
        ['', '', YL, BK, YL, YL, BK, BK, YL, YL, BK, YL, '', ''],
        ['', '', YL, BK, YL, YL, BK, BK, YL, YL, BK, YL, '', ''],
        ['', '', '', YL, BK, YL, BK, BK, YL, BK, YL, '', '', ''],
        ['', '', '', '', YL, BK, YL, YL, BK, YL, '', '', '', ''],
        ['', '', '', '', '', YL, BK, BK, YL, '', '', '', '', ''],
        ['', '', '', '', '', '', YL, YL, '', '', '', '', '', ''],
        ['', '', '', '', '', '', ST, ST, '', '', '', '', '', ''],
        ['', '', '', '', '', BS, BS, BS, BS, '', '', '', '', ''],
      ],
    },
    near: {
      width: 10,
      height: 8,
      anchorX: 5,
      anchorY: 7,
      lines: [
        "    /\\    ",
        "   /░░\\   ",
        "  /░/\\░\\  ",
        "  \\░\\/░/  ",
        "   \\░░/   ",
        "    \\/    ",
        "    ||    ",
        "   :==:   ",
      ],
      colors: [
        ['', '', '', '', YL, YL, '', '', '', ''],
        ['', '', '', YL, BK, BK, YL, '', '', ''],
        ['', '', YL, BK, YL, YL, BK, YL, '', ''],
        ['', '', YL, BK, YL, YL, BK, YL, '', ''],
        ['', '', '', YL, BK, BK, YL, '', '', ''],
        ['', '', '', '', YL, YL, '', '', '', ''],
        ['', '', '', '', ST, ST, '', '', '', ''],
        ['', '', '', BS, BS, BS, BS, '', '', ''],
      ],
    },
    medium: {
      width: 6,
      height: 5,
      anchorX: 3,
      anchorY: 4,
      lines: [
        "  /\\  ",
        " /░░\\ ",
        " \\░░/ ",
        "  \\/  ",
        "  ||  ",
      ],
      colors: [
        ['', '', YL, YL, '', ''],
        ['', YL, BK, BK, YL, ''],
        ['', YL, BK, BK, YL, ''],
        ['', '', YL, YL, '', ''],
        ['', '', ST, ST, '', ''],
      ],
    },
    far: {
      width: 4,
      height: 3,
      anchorX: 2,
      anchorY: 2,
      lines: [
        " /\\ ",
        " \\/ ",
        " || ",
      ],
      colors: [
        ['', YL, YL, ''],
        ['', YL, YL, ''],
        ['', ST, ST, ''],
      ],
    },
  },
};
