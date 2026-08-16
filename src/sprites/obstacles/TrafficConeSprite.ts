import { SpriteDefinition } from '../../ascii/types';

const OG = '#f97316'; // Fluorescent Safety Orange
const OD = '#c2410c'; // Deep Orange Shadow
const WH = '#f8fafc'; // Reflective White Collar
const BS = '#18181b'; // Heavy Rubber Base

export const TrafficConeSprite: SpriteDefinition = {
  id: 'obstacle_traffic_cone',
  name: 'Highway Safety Cone',
  category: 'OBSTACLE',
  defaultColor: '#f97316',
  worldWidth: 40,
  worldHeight: 50,
  visualScale: 0.9,
  variants: {
    close: {
      width: 10,
      height: 7,
      anchorX: 5,
      anchorY: 6,
      lines: [
        "    /\\    ",
        "   /░░\\   ",
        "  /====\\  ",
        "  |====|  ",
        " /▒▒▒▒▒▒\\ ",
        "|________|",
        "::..::..::",
      ],
      colors: [
        ['', '', '', '', OG, OG, '', '', '', ''],
        ['', '', '', OG, OG, OD, OG, '', '', ''],
        ['', '', WH, WH, WH, WH, WH, WH, '', ''],
        ['', '', WH, WH, WH, WH, WH, WH, '', ''],
        ['', OG, OG, OG, OD, OD, OG, OG, '', ''],
        [BS, BS, BS, BS, BS, BS, BS, BS, BS, BS],
        [BS, BS, BS, BS, BS, BS, BS, BS, BS, BS],
      ],
    },
    near: {
      width: 8,
      height: 5,
      anchorX: 4,
      anchorY: 4,
      lines: [
        "   /\\   ",
        "  /░░\\  ",
        " /====\\ ",
        "|______|",
        "::..::..",
      ],
      colors: [
        ['', '', '', OG, OG, '', '', ''],
        ['', '', OG, OG, OD, OG, '', ''],
        ['', WH, WH, WH, WH, WH, WH, ''],
        [BS, BS, BS, BS, BS, BS, BS, BS],
        [BS, BS, BS, BS, BS, BS, BS, BS],
      ],
    },
    medium: {
      width: 6,
      height: 3,
      anchorX: 3,
      anchorY: 2,
      lines: [
        "  /\\  ",
        " /==\\ ",
        "|____|",
      ],
      colors: [
        ['', '', OG, OG, '', ''],
        ['', WH, WH, WH, WH, ''],
        [BS, BS, BS, BS, BS, BS],
      ],
    },
    far: {
      width: 4,
      height: 2,
      anchorX: 2,
      anchorY: 1,
      lines: [
        " /\\ ",
        "|__|",
      ],
      colors: [
        ['', OG, OG, ''],
        [BS, BS, BS, BS],
      ],
    },
  },
};
