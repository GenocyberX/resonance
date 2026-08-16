import { SpriteDefinition } from '../../ascii/types';

const PK = '#f43f5e'; // Neon Sign Rose
const AW = '#fb7185'; // Striped Awning Coral
const WH = '#f8fafc'; // Striped Awning White
const TL = '#0f766e'; // Teal Diner Body
const GL = '#38bdf8'; // Glowing Glass Windows
const YL = '#fbbf24'; // Warm Interior Diner Light
const DK = '#042f2e'; // Shadow & Entrance
const BS = '#1e293b'; // Concrete Foundation

export const RoadsideCafeSprite: SpriteDefinition = {
  id: 'scenery_roadside_cafe',
  name: 'Coastal Roadside Diner',
  category: 'BUILDING',
  defaultColor: '#0f766e',
  worldWidth: 170,
  worldHeight: 140,
  visualScale: 1.0,
  variants: {
    close: {
      width: 24,
      height: 13,
      anchorX: 12,
      anchorY: 12,
      lines: [
        "       .----------.     ",
        "     ./ [DINER 24] \\.   ",
        "   .------------------. ",
        "  /\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\",
        "  |  .------.    .---. |",
        "  |  |GL GL |    |GL | |",
        "  |  |YL YL | [] |YL | |",
        "  |  |GL GL |    |GL | |",
        "  |  '------'    '---' |",
        "  |   ______      ___  |",
        "  |__|      |____|   |_|",
        " /====================\\ ",
        "::..::..::..::..::..::..",
      ],
      colors: [
        ['', '', '', '', '', '', '', PK, PK, PK, PK, PK, PK, PK, PK, PK, PK, '', '', '', '', '', '', ''],
        ['', '', '', '', '', PK, PK, YL, YL, YL, YL, YL, YL, YL, YL, PK, PK, '', '', '', '', '', '', ''],
        ['', '', '', TL, TL, TL, TL, TL, TL, TL, TL, TL, TL, TL, TL, TL, TL, TL, TL, TL, TL, '', '', ''],
        ['', '', AW, WH, AW, WH, AW, WH, AW, WH, AW, WH, AW, WH, AW, WH, AW, WH, AW, WH, AW, WH, '', ''],
        ['', '', TL, TL, TL, TL, TL, TL, TL, TL, TL, TL, TL, TL, TL, TL, TL, TL, TL, TL, TL, TL, '', ''],
        ['', '', TL, TL, GL, GL, GL, GL, TL, TL, TL, TL, GL, GL, GL, TL, TL, TL, TL, TL, TL, TL, '', ''],
        ['', '', TL, TL, YL, YL, YL, YL, TL, TL, YL, YL, YL, YL, YL, TL, TL, TL, TL, TL, TL, TL, '', ''],
        ['', '', TL, TL, GL, GL, GL, GL, TL, TL, TL, TL, GL, GL, GL, TL, TL, TL, TL, TL, TL, TL, '', ''],
        ['', '', TL, TL, TL, TL, TL, TL, TL, TL, TL, TL, TL, TL, TL, TL, TL, TL, TL, TL, TL, TL, '', ''],
        ['', '', TL, TL, DK, DK, DK, DK, DK, DK, TL, TL, DK, DK, DK, TL, TL, TL, TL, TL, TL, TL, '', ''],
        ['', '', TL, DK, DK, DK, DK, DK, DK, DK, TL, TL, DK, DK, DK, DK, TL, TL, TL, TL, TL, TL, '', ''],
        ['', BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, ''],
        [BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS],
      ],
    },
    near: {
      width: 16,
      height: 9,
      anchorX: 8,
      anchorY: 8,
      lines: [
        "    .--------.  ",
        "  ./ [DINER] \\. ",
        " .------------. ",
        "/\\/\\/\\/\\/\\/\\/\\/\\",
        "| .---.   .--. |",
        "| |GL | []|GL| |",
        "| |YL |   |YL| |",
        "|_____________| ",
        "::..::..::..::..",
      ],
      colors: [
        ['', '', '', '', PK, PK, PK, PK, PK, PK, PK, PK, '', '', '', ''],
        ['', '', PK, PK, YL, YL, YL, YL, YL, YL, PK, PK, '', '', '', ''],
        ['', TL, TL, TL, TL, TL, TL, TL, TL, TL, TL, TL, TL, TL, '', ''],
        [AW, WH, AW, WH, AW, WH, AW, WH, AW, WH, AW, WH, AW, WH, AW, WH],
        [TL, TL, GL, GL, GL, GL, TL, TL, GL, GL, GL, GL, TL, TL, '', ''],
        [TL, TL, GL, GL, GL, GL, YL, YL, GL, GL, GL, GL, TL, TL, '', ''],
        [TL, TL, YL, YL, YL, YL, TL, TL, YL, YL, YL, YL, TL, TL, '', ''],
        [TL, TL, TL, TL, TL, TL, TL, TL, TL, TL, TL, TL, TL, TL, '', ''],
        [BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS],
      ],
    },
    medium: {
      width: 10,
      height: 6,
      anchorX: 5,
      anchorY: 5,
      lines: [
        "  .----.  ",
        " ./DINER\\.",
        "/\\/\\/\\/\\/\\",
        "| |GL| | |",
        "|________|",
        "::..::..::",
      ],
      colors: [
        ['', '', PK, PK, PK, PK, PK, PK, '', ''],
        ['', PK, YL, YL, YL, YL, YL, PK, PK, ''],
        [AW, WH, AW, WH, AW, WH, AW, WH, AW, WH],
        [TL, TL, GL, GL, GL, TL, YL, TL, TL, TL],
        [TL, TL, TL, TL, TL, TL, TL, TL, TL, TL],
        [BS, BS, BS, BS, BS, BS, BS, BS, BS, BS],
      ],
    },
    far: {
      width: 6,
      height: 3,
      anchorX: 3,
      anchorY: 2,
      lines: [
        " .--. ",
        "/====\\",
        "::..::",
      ],
      colors: [
        ['', PK, PK, PK, PK, ''],
        [AW, WH, AW, WH, AW, WH],
        [BS, BS, BS, BS, BS, BS],
      ],
    },
  },
};
