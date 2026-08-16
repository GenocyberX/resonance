import { SpriteDefinition } from '../../ascii/types';

const WH = '#f8fafc'; // White Canopy / Cabin
const GL = '#38bdf8'; // Cabin Glass Lookouts
const HL = '#fbbf24'; // Warm Golden Hull
const HD = '#d97706'; // Hull Underbody Shadow
const OC = '#38bdf8'; // Surface Wake / Spray
const OD = '#0284c7'; // Deep Water Line

export const SmallBoatSprite: SpriteDefinition = {
  id: 'scenery_small_boat',
  name: 'Coastal Motor Skiff',
  category: 'WATERCRAFT',
  defaultColor: '#fbbf24',
  worldWidth: 80,
  worldHeight: 50,
  visualScale: 1.0,
  variants: {
    close: {
      width: 16,
      height: 7,
      anchorX: 8,
      anchorY: 6,
      lines: [
        "     .----.     ",
        "    / [[]] \\    ",
        "  .============.",
        " ~\\____________/",
        " ~~~~~~~~~~~~~~~",
        " ~  ~   ~  ~   ~",
        "  ~   ~   ~   ~ ",
      ],
      colors: [
        ['', '', '', '', '', WH, WH, WH, WH, '', '', '', '', '', '', ''],
        ['', '', '', '', WH, GL, GL, GL, GL, WH, '', '', '', '', '', ''],
        ['', '', HL, HL, HL, HL, HL, HL, HL, HL, HL, HL, HL, HL, '', ''],
        ['', OC, HD, HD, HD, HD, HD, HD, HD, HD, HD, HD, HD, HD, HD, ''],
        [OC, OC, OC, OC, OC, OC, OC, OC, OC, OC, OC, OC, OC, OC, OC, OC],
        [OD, '', OD, '', '', OD, '', OD, '', '', OD, '', '', '', '', ''],
        ['', '', OD, '', '', '', OD, '', '', '', OD, '', '', '', OD, ''],
      ],
    },
    near: {
      width: 12,
      height: 5,
      anchorX: 6,
      anchorY: 4,
      lines: [
        "    .---.   ",
        "  .=======. ",
        " ~\\_______/ ",
        " ~~~~~~~~~~~",
        "  ~  ~   ~  ",
      ],
      colors: [
        ['', '', '', '', WH, WH, WH, '', '', '', '', ''],
        ['', '', HL, HL, HL, HL, HL, HL, HL, '', '', ''],
        ['', OC, HD, HD, HD, HD, HD, HD, HD, HD, '', ''],
        [OC, OC, OC, OC, OC, OC, OC, OC, OC, OC, OC, ''],
        ['', '', OD, '', '', OD, '', '', '', OD, '', ''],
      ],
    },
    medium: {
      width: 8,
      height: 4,
      anchorX: 4,
      anchorY: 3,
      lines: [
        "  .---. ",
        " .====. ",
        "~\\____/ ",
        "~~~~~~~~",
      ],
      colors: [
        ['', '', WH, WH, WH, '', '', ''],
        ['', HL, HL, HL, HL, HL, '', ''],
        [OC, HD, HD, HD, HD, HD, '', ''],
        [OC, OC, OC, OC, OC, OC, OC, OC],
      ],
    },
    far: {
      width: 4,
      height: 2,
      anchorX: 2,
      anchorY: 1,
      lines: [
        "/==\\",
        "~~~~",
      ],
      colors: [
        [HL, HL, HL, HL],
        [OC, OC, OC, OC],
      ],
    },
  },
};
