import { SpriteDefinition } from '../../ascii/types';

const RD = '#ef4444'; // Life Safety Red Roof
const WH = '#f8fafc'; // White Weatherboard Walls
const GL = '#38bdf8'; // Lookout Glass Windows
const WD = '#b45309'; // Timber Pilings & Ladder
const BS = '#d97706'; // Beach Sand Contact

export const LifeguardHutSprite: SpriteDefinition = {
  id: 'scenery_lifeguard_hut',
  name: 'Beach Lifeguard Hut',
  category: 'STRUCTURE',
  defaultColor: '#ef4444',
  worldWidth: 130,
  worldHeight: 120,
  visualScale: 1.0,
  variants: {
    close: {
      width: 20,
      height: 12,
      anchorX: 10,
      anchorY: 11,
      lines: [
        "    .----/\\----.    ",
        "  ./____________\\.  ",
        "  /==============\\  ",
        "  | [[]] (O) [[]] | ",
        "  |______________|  ",
        "   /|   |  |   |\\   ",
        "  / |   |  |   | \\  ",
        " /  |   |==|   |  \\ ",
        "/   |   |==|   |   \\",
        "|___|___|__|___|___|",
        "::..::..::..::..::..",
        "::..::..::..::..::..",
      ],
      colors: [
        ['', '', '', '', RD, RD, RD, RD, RD, RD, RD, RD, RD, RD, RD, RD, '', '', '', ''],
        ['', '', RD, RD, RD, RD, RD, RD, RD, RD, RD, RD, RD, RD, RD, RD, RD, RD, '', ''],
        ['', '', RD, RD, RD, RD, RD, RD, RD, RD, RD, RD, RD, RD, RD, RD, RD, RD, '', ''],
        ['', '', WH, WH, GL, GL, WH, RD, RD, WH, GL, GL, WH, WH, '', '', '', '', '', ''],
        ['', '', WH, WH, WH, WH, WH, WH, WH, WH, WH, WH, WH, WH, WH, WH, '', '', '', ''],
        ['', '', '', WD, WD, '', '', WD, '', WD, '', '', WD, WD, '', '', '', '', '', ''],
        ['', '', WD, '', '', WD, '', WD, '', WD, '', WD, '', '', WD, '', '', '', '', ''],
        ['', WD, '', '', '', WD, '', WD, WD, WD, '', WD, '', '', '', WD, '', '', '', ''],
        [WD, '', '', '', '', WD, '', WD, WD, WD, '', WD, '', '', '', '', WD, '', '', ''],
        [WD, WD, WD, WD, WD, WD, WD, WD, WD, WD, WD, WD, WD, WD, WD, WD, WD, WD, WD, WD],
        [BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS],
        [BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS],
      ],
    },
    near: {
      width: 14,
      height: 8,
      anchorX: 7,
      anchorY: 7,
      lines: [
        "  .--/\\--.    ",
        "./________\\.  ",
        "| [[]] [[]] | ",
        "|___________| ",
        " /|  ||  |\\   ",
        "/ |  ||  | \\  ",
        "|_|__||__|__| ",
        "::..::..::..::",
      ],
      colors: [
        ['', '', RD, RD, RD, RD, RD, RD, RD, RD, '', '', '', ''],
        [RD, RD, RD, RD, RD, RD, RD, RD, RD, RD, RD, RD, '', ''],
        [WH, WH, GL, GL, WH, WH, GL, GL, WH, WH, '', '', '', ''],
        [WH, WH, WH, WH, WH, WH, WH, WH, WH, WH, WH, WH, '', ''],
        ['', WD, WD, '', WD, WD, '', WD, WD, '', '', '', '', ''],
        [WD, '', '', WD, '', WD, WD, '', '', WD, '', '', '', ''],
        [WD, WD, WD, WD, WD, WD, WD, WD, WD, WD, WD, WD, '', ''],
        [BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS],
      ],
    },
    medium: {
      width: 8,
      height: 5,
      anchorX: 4,
      anchorY: 4,
      lines: [
        " .-/\\-. ",
        "./____\\.",
        "|[]  []|",
        " /|  |\\ ",
        "::..::..",
      ],
      colors: [
        ['', RD, RD, RD, RD, RD, RD, ''],
        [RD, RD, RD, RD, RD, RD, RD, RD],
        [WH, GL, GL, WH, GL, GL, WH, ''],
        ['', WD, WD, '', '', WD, WD, ''],
        [BS, BS, BS, BS, BS, BS, BS, BS],
      ],
    },
    far: {
      width: 4,
      height: 3,
      anchorX: 2,
      anchorY: 2,
      lines: [
        ".--.",
        "|[]|",
        "::..",
      ],
      colors: [
        [RD, RD, RD, RD],
        [WH, GL, GL, WH],
        [BS, BS, BS, BS],
      ],
    },
  },
};
