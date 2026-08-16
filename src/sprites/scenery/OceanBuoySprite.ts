import { SpriteDefinition } from '../../ascii/types';

const GL = '#fbbf24'; // Flashing Amber Beacon
const RD = '#ef4444'; // Signal Red Buoy Body
const YL = '#fde047'; // Safety Yellow Band
const OC = '#38bdf8'; // Surface Ocean Wave
const OD = '#0284c7'; // Deep Water Ripple

export const OceanBuoySprite: SpriteDefinition = {
  id: 'scenery_ocean_buoy',
  name: 'Ocean Navigation Buoy',
  category: 'WATERCRAFT',
  defaultColor: '#ef4444',
  worldWidth: 45,
  worldHeight: 70,
  visualScale: 0.9,
  variants: {
    close: {
      width: 12,
      height: 8,
      anchorX: 6,
      anchorY: 7,
      lines: [
        "    (☼)     ",
        "     ||     ",
        "    /==\\    ",
        "   /====\\   ",
        "  /======\\  ",
        "  |______|  ",
        " ~~~~~~~~~~ ",
        "~  ~    ~  ~",
      ],
      colors: [
        ['', '', '', '', GL, GL, GL, GL, '', '', '', ''],
        ['', '', '', '', '', RD, RD, '', '', '', '', ''],
        ['', '', '', '', RD, RD, RD, RD, '', '', '', ''],
        ['', '', '', YL, YL, YL, YL, YL, YL, '', '', ''],
        ['', '', RD, RD, RD, RD, RD, RD, RD, RD, '', ''],
        ['', '', RD, RD, RD, RD, RD, RD, RD, RD, '', ''],
        ['', OC, OC, OC, OC, OC, OC, OC, OC, OC, OC, ''],
        [OD, '', OD, '', '', '', OD, '', '', OD, '', OD],
      ],
    },
    near: {
      width: 8,
      height: 6,
      anchorX: 4,
      anchorY: 5,
      lines: [
        "  (☼)   ",
        "   ||   ",
        "  /==\\  ",
        " /====\\ ",
        "~~~~~~~~",
        "~ ~  ~ ~",
      ],
      colors: [
        ['', '', GL, GL, GL, GL, '', ''],
        ['', '', '', RD, RD, '', '', ''],
        ['', '', RD, RD, RD, RD, '', ''],
        ['', YL, YL, YL, YL, YL, YL, ''],
        [OC, OC, OC, OC, OC, OC, OC, OC],
        [OD, '', OD, '', OD, '', OD, ''],
      ],
    },
    medium: {
      width: 6,
      height: 4,
      anchorX: 3,
      anchorY: 3,
      lines: [
        " (☼)  ",
        " /==\\ ",
        "|____|",
        "~~~~~~",
      ],
      colors: [
        ['', GL, GL, GL, GL, ''],
        ['', RD, YL, YL, RD, ''],
        [RD, RD, RD, RD, RD, RD],
        [OC, OC, OC, OC, OC, OC],
      ],
    },
    far: {
      width: 4,
      height: 2,
      anchorX: 2,
      anchorY: 1,
      lines: [
        "(☼) ",
        "~~~~",
      ],
      colors: [
        [GL, GL, GL, GL],
        [OC, OC, OC, OC],
      ],
    },
  },
};
