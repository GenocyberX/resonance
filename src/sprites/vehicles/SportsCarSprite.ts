import { SpriteDefinition } from '../../ascii/types';

const BD = '#38bdf8'; // Sky Blue Body Accent
const CR = '#0284c7'; // Dark Cyan Body Shading
const GL = '#0f172a'; // Tinted Rear Glass
const RF = '#94a3b8'; // Glass Reflection White/Cyan
const TL = '#ef4444'; // Red LED Taillight Bar
const BL = '#ffffff'; // Brake Core / Reverse Light
const EX = '#e2e8f0'; // Chrome Twin Exhausts
const TR = '#18181b'; // Wide Performance Rubber Tires

export const SportsCarSprite: SpriteDefinition = {
  id: 'sports_car',
  name: 'Arcade Sports Coupe',
  category: 'VEHICLE',
  defaultColor: '#38bdf8',
  worldWidth: 90,
  worldHeight: 65,
  visualScale: 1.0,
  variants: {
    close: {
      width: 24,
      height: 9,
      anchorX: 12,
      anchorY: 8,
      lines: [
        "       .--------.       ",
        "     ./  ______  \\.     ",
        "   ./  /  ____  \\  \\.   ",
        " ./===/  /____\\  \\===\\. ",
        "/====[============]====\\",
        "|[*]=| [::RES::] |=[*]| ",
        "|=====[===========]====|",
        "(O)(O)  (==)(==)  (O)(O)",
        "/======================\\",
      ],
      colors: [
        ['', '', '', '', '', '', '', BD, BD, BD, BD, BD, BD, BD, BD, BD, BD, '', '', '', '', '', '', ''],
        ['', '', '', '', '', BD, BD, GL, GL, GL, GL, GL, GL, GL, GL, BD, BD, '', '', '', '', '', '', ''],
        ['', '', '', BD, BD, GL, GL, RF, RF, RF, RF, RF, RF, GL, GL, GL, GL, BD, BD, '', '', '', '', ''],
        ['', BD, BD, CR, CR, GL, GL, RF, RF, RF, RF, RF, GL, GL, CR, CR, BD, BD, '', '', '', '', '', ''],
        [BD, CR, CR, TL, TL, TL, TL, TL, TL, TL, TL, TL, TL, TL, TL, TL, TL, TL, CR, CR, BD, '', '', ''],
        [BD, TL, BL, TL, CR, CR, RF, RF, RF, RF, RF, RF, RF, RF, CR, CR, TL, BL, TL, BD, '', '', '', ''],
        [BD, CR, CR, CR, TL, TL, TL, TL, TL, TL, TL, TL, TL, TL, TL, TL, CR, CR, CR, BD, '', '', '', ''],
        [TR, TR, TR, TR, '', '', EX, EX, EX, EX, EX, EX, EX, EX, '', '', TR, TR, TR, TR, '', '', '', ''],
        [TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR],
      ],
    },
    near: {
      width: 20,
      height: 6,
      anchorX: 10,
      anchorY: 5,
      lines: [
        "      .--------.    ",
        "    ./  ______  \\.  ",
        "  ./===/______\\===\\.",
        " |====[======]====| ",
        " |[*]|  [RES]  |[*]|",
        " (O)  (==)(==)  (O) ",
      ],
      colors: [
        ['', '', '', '', '', '', BD, BD, BD, BD, BD, BD, BD, BD, BD, BD, '', '', '', ''],
        ['', '', '', '', BD, BD, GL, GL, GL, GL, GL, GL, GL, GL, BD, BD, '', '', '', ''],
        ['', '', BD, BD, CR, CR, GL, GL, RF, RF, RF, RF, GL, GL, CR, CR, BD, BD, '', ''],
        ['', BD, CR, CR, TL, TL, TL, TL, TL, TL, TL, TL, TL, TL, TL, TL, CR, CR, BD, ''],
        ['', BD, TL, BL, TL, CR, CR, RF, RF, RF, RF, CR, CR, TL, BL, TL, BD, '', '', ''],
        ['', TR, TR, '', '', EX, EX, EX, EX, EX, EX, EX, EX, '', '', TR, TR, '', '', ''],
      ],
    },
    medium: {
      width: 12,
      height: 4,
      anchorX: 6,
      anchorY: 3,
      lines: [
        "   .----.   ",
        " ./======\\. ",
        "|[========]|",
        " (O)    (O) ",
      ],
      colors: [
        ['', '', '', BD, BD, BD, BD, BD, BD, '', '', ''],
        ['', BD, BD, GL, GL, GL, GL, GL, GL, BD, BD, ''],
        [BD, CR, TL, TL, TL, TL, TL, TL, TL, TL, CR, BD],
        ['', TR, TR, '', '', '', '', '', '', TR, TR, ''],
      ],
    },
    far: {
      width: 6,
      height: 2,
      anchorX: 3,
      anchorY: 1,
      lines: [
        " .--. ",
        "|====|",
      ],
      colors: [
        ['', BD, BD, BD, BD, ''],
        [BD, TL, TL, TL, TL, BD],
      ],
    },
  },
};
