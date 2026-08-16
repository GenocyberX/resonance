import { SpriteDefinition } from '../../ascii/types';

const GL = '#fde047'; // Lantern Glow
const ST = '#94a3b8'; // Steel Lamp Post
const DK = '#b45309'; // Timber Deck Planks
const WD = '#78350f'; // Pier Pilings / Supports
const OC = '#38bdf8'; // Ocean Ripple Surface
const OD = '#0284c7'; // Deep Water Contact

export const PierSprite: SpriteDefinition = {
  id: 'scenery_pier',
  name: 'Coastal Boardwalk Pier',
  category: 'STRUCTURE',
  defaultColor: '#b45309',
  worldWidth: 200,
  worldHeight: 110,
  visualScale: 1.0,
  variants: {
    close: {
      width: 26,
      height: 10,
      anchorX: 13,
      anchorY: 9,
      lines: [
        "          (☼)             ",
        "           ||             ",
        "     .=====||===========. ",
        "    /|  |  ||  |  |  |  |\\",
        "   /_|__|__||__|__|__|__|\\",
        "     |     ||    |     |  ",
        "     |     ||    |     |  ",
        "   ~~|~~~~~||~~~~|~~~~~|~~",
        "  ~  |  ~  || ~  |  ~  | ~",
        " ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~",
      ],
      colors: [
        ['', '', '', '', '', '', '', '', '', '', GL, GL, GL, GL, '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', '', '', '', ST, ST, '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', DK, DK, DK, DK, DK, DK, ST, ST, DK, DK, DK, DK, DK, DK, DK, DK, DK, DK, DK, '', ''],
        ['', '', '', '', DK, DK, DK, DK, DK, DK, DK, ST, ST, DK, DK, DK, DK, DK, DK, DK, DK, DK, DK, DK, DK, ''],
        ['', '', '', DK, DK, DK, DK, DK, DK, DK, DK, ST, ST, DK, DK, DK, DK, DK, DK, DK, DK, DK, DK, DK, DK, DK],
        ['', '', '', '', '', WD, '', '', '', '', '', ST, ST, '', '', '', '', WD, '', '', '', '', WD, '', '', ''],
        ['', '', '', '', '', WD, '', '', '', '', '', ST, ST, '', '', '', '', WD, '', '', '', '', WD, '', '', ''],
        ['', '', '', OC, OC, WD, OC, OC, OC, OC, OC, ST, ST, OC, OC, OC, OC, WD, OC, OC, OC, OC, WD, OC, OC, ''],
        ['', '', OC, '', '', WD, '', '', OC, '', ST, ST, '', OC, '', '', WD, '', '', OC, '', WD, '', OC, '', ''],
        ['', OD, '', OD, '', OD, '', OD, '', OD, '', OD, '', OD, '', OD, '', OD, '', OD, '', OD, '', OD, '', OD],
      ],
    },
    near: {
      width: 18,
      height: 7,
      anchorX: 9,
      anchorY: 6,
      lines: [
        "       (☼)        ",
        "        ||        ",
        "   .====||======. ",
        "  /_|___||___|__|\\",
        "    |   ||   |    ",
        "  ~~|~~~||~~~|~~~~",
        " ~ ~ ~ ~ ~ ~ ~ ~ ~",
      ],
      colors: [
        ['', '', '', '', '', '', '', GL, GL, GL, GL, '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', ST, ST, '', '', '', '', '', '', '', ''],
        ['', '', '', DK, DK, DK, DK, DK, ST, ST, DK, DK, DK, DK, DK, DK, '', ''],
        ['', '', DK, DK, DK, DK, DK, DK, ST, ST, DK, DK, DK, DK, DK, DK, DK, ''],
        ['', '', '', '', WD, '', '', '', ST, ST, '', '', '', WD, '', '', '', ''],
        ['', '', OC, OC, WD, OC, OC, OC, ST, ST, OC, OC, OC, WD, OC, OC, OC, OC],
        ['', OD, '', OD, '', OD, '', OD, '', OD, '', OD, '', OD, '', OD, '', OD],
      ],
    },
    medium: {
      width: 12,
      height: 5,
      anchorX: 6,
      anchorY: 4,
      lines: [
        "    (☼)     ",
        " .===||===. ",
        "/_||_||_||_\\",
        "~~|~~||~~|~~",
        "~ ~ ~ ~ ~ ~ ",
      ],
      colors: [
        ['', '', '', '', GL, GL, GL, GL, '', '', '', ''],
        ['', DK, DK, DK, DK, ST, ST, DK, DK, DK, DK, ''],
        [DK, DK, DK, DK, DK, ST, ST, DK, DK, DK, DK, DK],
        [OC, OC, WD, OC, OC, ST, ST, OC, OC, WD, OC, OC],
        [OD, '', OD, '', OD, '', OD, '', OD, '', OD, ''],
      ],
    },
    far: {
      width: 6,
      height: 3,
      anchorX: 3,
      anchorY: 2,
      lines: [
        " (☼)  ",
        ".====.",
        "~~~~~~",
      ],
      colors: [
        ['', GL, GL, GL, GL, ''],
        [DK, DK, DK, DK, DK, DK],
        [OC, OC, OC, OC, OC, OC],
      ],
    },
  },
};
