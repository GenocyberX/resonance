import { SpriteDefinition } from '../../ascii/types';

const BD = '#e11d48'; // Scarlet Crimson Body
const DK = '#be123c'; // Deep Red Shadow
const GL = '#0f172a'; // Tinted Fastback Glass
const RF = '#fda4af'; // Glass Reflection Highlight
const TL = '#ef4444'; // Bright Red Taillights
const BL = '#f8fafc'; // Reverse Light Core
const TR = '#18181b'; // Rubber Tires
const CH = '#f1f5f9'; // Chrome Exhaust / Accent

export const TrafficCoupeSprite: SpriteDefinition = {
  id: 'traffic_coupe',
  name: 'Traffic Sports Coupe',
  category: 'VEHICLE',
  defaultColor: '#e11d48',
  worldWidth: 82,
  worldHeight: 62,
  visualScale: 0.95,
  variants: {
    close: {
      width: 22,
      height: 8,
      anchorX: 11,
      anchorY: 7,
      lines: [
        "      .----------.    ",
        "    ./  ________  \\.  ",
        "   /  / ________ \\  \\ ",
        "  /==/ /________\\ \\==\\",
        " |==================| ",
        " |(O)  |______|  (O)| ",
        " |==================| ",
        "  (O)  (==)(==)  (O)  ",
      ],
      colors: [
        ['', '', '', '', '', '', BD, BD, BD, BD, BD, BD, BD, BD, BD, BD, '', '', '', '', '', ''],
        ['', '', '', '', BD, BD, GL, GL, GL, GL, GL, GL, GL, GL, BD, BD, '', '', '', '', '', ''],
        ['', '', '', BD, GL, GL, RF, RF, RF, RF, RF, RF, GL, GL, GL, BD, '', '', '', '', '', ''],
        ['', '', BD, DK, DK, GL, GL, RF, RF, RF, RF, GL, GL, DK, DK, BD, '', '', '', '', '', ''],
        ['', BD, BD, BD, BD, BD, BD, BD, BD, BD, BD, BD, BD, BD, BD, BD, BD, BD, BD, BD, '', ''],
        ['', BD, TL, BL, TL, DK, DK, CH, CH, CH, CH, DK, DK, TL, BL, TL, BD, '', '', '', '', ''],
        ['', BD, DK, DK, DK, DK, DK, DK, DK, DK, DK, DK, DK, DK, DK, DK, DK, DK, DK, BD, '', ''],
        ['', '', TR, TR, '', '', CH, CH, CH, CH, CH, CH, CH, CH, '', '', TR, TR, '', '', '', ''],
      ],
    },
    near: {
      width: 16,
      height: 6,
      anchorX: 8,
      anchorY: 5,
      lines: [
        "    .--------.  ",
        "  ./  ______  \\.",
        "/==/ ______ \\==\\",
        "|==============|",
        "|(O)| ____ |(O)|",
        " (O)  (==)  (O) ",
      ],
      colors: [
        ['', '', '', '', BD, BD, BD, BD, BD, BD, BD, BD, '', '', '', ''],
        ['', '', BD, BD, GL, GL, GL, GL, GL, GL, BD, BD, '', '', '', ''],
        [BD, BD, DK, DK, GL, GL, GL, GL, GL, GL, DK, DK, BD, BD, '', ''],
        [BD, BD, BD, BD, BD, BD, BD, BD, BD, BD, BD, BD, BD, BD, BD, BD],
        [BD, TL, BL, TL, DK, CH, CH, CH, CH, DK, BD, TL, BL, TL, BD, ''],
        ['', TR, TR, '', '', CH, CH, CH, CH, '', '', TR, TR, '', '', ''],
      ],
    },
    medium: {
      width: 10,
      height: 4,
      anchorX: 5,
      anchorY: 3,
      lines: [
        "  .----.  ",
        " /======\\ ",
        "|(o)==(o)|",
        " (O)  (O) ",
      ],
      colors: [
        ['', '', BD, BD, BD, BD, BD, BD, '', ''],
        ['', BD, GL, GL, GL, GL, GL, GL, BD, ''],
        [BD, TL, TL, DK, DK, DK, DK, TL, TL, BD],
        ['', TR, TR, '', '', '', '', TR, TR, ''],
      ],
    },
    far: {
      width: 6,
      height: 2,
      anchorX: 3,
      anchorY: 1,
      lines: [
        " .--. ",
        "|(==)|",
      ],
      colors: [
        ['', BD, BD, BD, BD, ''],
        [BD, TL, DK, DK, TL, BD],
      ],
    },
  },
};
