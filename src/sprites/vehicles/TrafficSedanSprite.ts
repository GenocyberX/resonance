import { SpriteDefinition } from '../../ascii/types';

const BD = '#94a3b8'; // Slate Silver Body
const DK = '#475569'; // Dark Slate Body
const GL = '#0f172a'; // Tinted Glass
const TL = '#ef4444'; // Red Taillights
const TR = '#18181b'; // Rubber Tires
const CH = '#f1f5f9'; // Chrome Bumper Accent

export const TrafficSedanSprite: SpriteDefinition = {
  id: 'traffic_sedan',
  name: 'Traffic Sedan',
  category: 'VEHICLE',
  defaultColor: '#94a3b8',
  worldWidth: 85,
  worldHeight: 70,
  visualScale: 1.0,
  variants: {
    close: {
      width: 24,
      height: 8,
      anchorX: 12,
      anchorY: 7,
      lines: [
        "      .------------.    ",
        "    ./  __________  \\.  ",
        "   /  / _________ \\  \\  ",
        "  /==/ /_________\\ \\==\\ ",
        " |====================| ",
        " |[*] |__________| [*]| ",
        " |====================| ",
        "  (O)              (O)  ",
      ],
      colors: [
        ['', '', '', '', '', '', BD, BD, BD, BD, BD, BD, BD, BD, BD, BD, BD, BD, '', '', '', '', '', ''],
        ['', '', '', '', BD, BD, GL, GL, GL, GL, GL, GL, GL, GL, GL, GL, BD, BD, '', '', '', '', '', ''],
        ['', '', '', BD, GL, GL, GL, GL, GL, GL, GL, GL, GL, GL, GL, GL, GL, GL, BD, '', '', '', '', ''],
        ['', '', BD, DK, DK, GL, GL, GL, GL, GL, GL, GL, GL, GL, GL, GL, DK, DK, BD, '', '', '', '', ''],
        ['', BD, BD, BD, BD, BD, BD, BD, BD, BD, BD, BD, BD, BD, BD, BD, BD, BD, BD, BD, BD, BD, '', ''],
        ['', BD, TL, TL, DK, CH, CH, CH, CH, CH, CH, CH, CH, CH, CH, DK, TL, TL, BD, '', '', '', '', ''],
        ['', BD, DK, DK, DK, DK, DK, DK, DK, DK, DK, DK, DK, DK, DK, DK, DK, DK, DK, DK, DK, BD, '', ''],
        ['', '', TR, TR, '', '', '', '', '', '', '', '', '', '', '', '', '', '', TR, TR, '', '', '', ''],
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
        "|[*]|______|[*]|",
        " (O)        (O) ",
      ],
      colors: [
        ['', '', '', '', BD, BD, BD, BD, BD, BD, BD, BD, '', '', '', ''],
        ['', '', BD, BD, GL, GL, GL, GL, GL, GL, BD, BD, '', '', '', ''],
        [BD, BD, DK, DK, GL, GL, GL, GL, GL, GL, DK, DK, BD, BD, '', ''],
        [BD, BD, BD, BD, BD, BD, BD, BD, BD, BD, BD, BD, BD, BD, BD, BD],
        [BD, TL, TL, DK, CH, CH, CH, CH, CH, CH, DK, TL, TL, BD, '', ''],
        ['', TR, TR, '', '', '', '', '', '', '', '', '', TR, TR, '', ''],
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
        "|[*]==[*]|",
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
        "|[==]|",
      ],
      colors: [
        ['', BD, BD, BD, BD, ''],
        [BD, TL, DK, DK, TL, BD],
      ],
    },
  },
};
