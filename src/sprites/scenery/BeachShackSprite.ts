import { SpriteDefinition } from '../../ascii/types';

const TH = '#d97706'; // Thatched Amber Roof
const TD = '#b45309'; // Thatched Roof Shadow
const WD = '#78350f'; // Timber Beam Structure
const SF = '#06b6d4'; // Turquoise Surfboard / Accent
const LN = '#fde047'; // Warm Glowing Lanterns
const BS = '#d97706'; // Sand Ground Contact

export const BeachShackSprite: SpriteDefinition = {
  id: 'beach_shack',
  name: 'Coastal Beach Shack',
  category: 'BUILDING',
  defaultColor: '#f59e0b',
  worldWidth: 160,
  worldHeight: 140,
  visualScale: 1.0,
  variants: {
    close: {
      width: 22,
      height: 13,
      anchorX: 11,
      anchorY: 12,
      lines: [
        "      .------------.  ",
        "    ./==============\\.",
        "  ./=================\\",
        " /===[ TIKI BAR ]====\\",
        " |   *          *   | ",
        " || | |        | | || ",
        " || | | (====) | | || ",
        " || | | |BAR | | | || ",
        " || |/\\_|____|_/\\| || ",
        " ||/ / | |    | | \\ \\|",
        " |/ /  | |    | |  \\ |",
        " |_/__|_|____|_|__\\_| ",
        "::..::..::..::..::..::",
      ],
      colors: [
        ['', '', '', '', '', '', TH, TH, TH, TH, TH, TH, TH, TH, TH, TH, TH, TH, '', '', '', ''],
        ['', '', '', '', TH, TH, TD, TD, TD, TD, TD, TD, TD, TD, TD, TD, TD, TD, TH, TH, '', ''],
        ['', '', TH, TH, TD, TD, TD, TD, TD, TD, TD, TD, TD, TD, TD, TD, TD, TD, TD, TD, TH, TH],
        ['', TH, TD, TD, TD, TD, TD, TD, TD, TD, TD, TD, TD, TD, TD, TD, TD, TD, TD, TD, TH, TH],
        ['', WD, '', '', LN, '', '', '', '', '', '', '', '', '', LN, '', '', '', '', WD, '', ''],
        ['', WD, WD, '', WD, '', WD, '', '', '', '', '', '', '', WD, '', WD, '', WD, WD, '', ''],
        ['', WD, WD, '', WD, '', WD, '', SF, SF, SF, SF, '', WD, '', WD, '', WD, WD, '', '', ''],
        ['', WD, WD, '', WD, '', WD, '', SF, SF, SF, SF, '', WD, '', WD, '', WD, WD, '', '', ''],
        ['', WD, WD, '', WD, SF, SF, WD, WD, WD, WD, WD, SF, SF, WD, '', WD, '', WD, WD, '', ''],
        ['', WD, WD, SF, '', WD, '', WD, '', '', '', '', WD, '', WD, SF, '', WD, WD, WD, '', ''],
        ['', WD, SF, '', '', WD, '', WD, '', '', '', '', WD, '', WD, '', SF, '', WD, WD, '', ''],
        ['', WD, WD, WD, WD, WD, WD, WD, WD, WD, WD, WD, WD, WD, WD, WD, WD, WD, WD, WD, WD, ''],
        [BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS],
      ],
    },
    near: {
      width: 16,
      height: 9,
      anchorX: 8,
      anchorY: 8,
      lines: [
        "    .--------.  ",
        "  ./==========\\.",
        " /=============\\",
        " |  *        * |",
        " || | (==) | || ",
        " ||/\\_|BAR|_/\\||",
        " ||/ | |  | |\\||",
        " |_|_|_|__|_|_| ",
        "::..::..::..::..",
      ],
      colors: [
        ['', '', '', '', TH, TH, TH, TH, TH, TH, TH, TH, '', '', '', ''],
        ['', '', TH, TH, TD, TD, TD, TD, TD, TD, TD, TD, TH, TH, '', ''],
        ['', TH, TD, TD, TD, TD, TD, TD, TD, TD, TD, TD, TD, TD, TH, TH],
        ['', WD, '', '', LN, '', '', '', '', '', '', '', LN, '', WD, ''],
        ['', WD, WD, '', WD, '', SF, SF, SF, '', WD, '', WD, WD, '', ''],
        ['', WD, WD, SF, SF, WD, WD, WD, WD, WD, SF, SF, WD, WD, '', ''],
        ['', WD, SF, '', WD, '', WD, '', '', WD, '', WD, '', SF, WD, ''],
        ['', WD, WD, WD, WD, WD, WD, WD, WD, WD, WD, WD, WD, WD, WD, ''],
        [BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS],
      ],
    },
    medium: {
      width: 11,
      height: 6,
      anchorX: 5,
      anchorY: 5,
      lines: [
        "  .-----.  ",
        " /=======\\ ",
        " | *   * | ",
        " || | | || ",
        " |_|_|_|_| ",
        "::..::..::.",
      ],
      colors: [
        ['', '', TH, TH, TH, TH, TH, TH, TH, '', ''],
        ['', TH, TD, TD, TD, TD, TD, TD, TD, TH, ''],
        ['', WD, '', LN, '', '', '', LN, '', WD, ''],
        ['', WD, WD, '', WD, '', WD, '', WD, WD, ''],
        ['', WD, WD, WD, WD, WD, WD, WD, WD, WD, ''],
        [BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS],
      ],
    },
    far: {
      width: 6,
      height: 3,
      anchorX: 3,
      anchorY: 2,
      lines: [
        " .--. ",
        "|====|",
        "|_||_|",
      ],
      colors: [
        ['', TH, TH, TH, TH, ''],
        [TH, TD, TD, TD, TD, TH],
        ['', WD, WD, WD, WD, ''],
      ],
    },
  },
};
