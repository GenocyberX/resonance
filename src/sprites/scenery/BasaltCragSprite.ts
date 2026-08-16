import { SpriteDefinition } from '../../ascii/types';

const HL = '#71717a'; // Basalt Hexagonal Edge
const MD = '#3f3f46'; // Basalt Column Body
const DK = '#18181b'; // Deep Volcanic Shadow Face
const BS = '#0c0a09'; // Obsidian Rock Foundation

export const BasaltCragSprite: SpriteDefinition = {
  id: 'scenery_basalt_crag',
  name: 'Obsidian Basalt Crag',
  category: 'STRUCTURE',
  defaultColor: '#71717a',
  worldWidth: 80,
  worldHeight: 140,
  visualScale: 1.0,
  variants: {
    close: {
      width: 16,
      height: 12,
      anchorX: 8,
      anchorY: 11,
      lines: [
        "    .---.       ",
        "   /░░░░░\\      ",
        "  /▒▒▒▒▒▒▒\\ .-. ",
        " |▓▓▓|▓▓▓▓▓/░░░\\",
        " |▓▓▓|▓▓▓▓|▒▒▒▒|",
        " |▓▓▓|▓▓▓▓|▓▓▓▓|",
        " |▓▓▓|▓▓▓▓|▓▓▓▓|",
        " |▓▓▓|▓▓▓▓|▓▓▓▓|",
        " |▓▓▓|▓▓▓▓|▓▓▓▓|",
        " |▓▓▓|▓▓▓▓|▓▓▓▓|",
        "/==============\\",
        "::..::..::..::..",
      ],
      colors: [
        ['', '', '', '', HL, HL, HL, HL, HL, '', '', '', '', '', '', ''],
        ['', '', '', HL, MD, MD, MD, MD, MD, HL, '', '', '', '', '', ''],
        ['', '', HL, MD, MD, MD, MD, MD, MD, MD, HL, HL, HL, HL, '', ''],
        ['', HL, DK, DK, DK, HL, MD, MD, MD, MD, HL, MD, MD, MD, HL, ''],
        ['', HL, DK, DK, DK, HL, MD, MD, MD, HL, MD, MD, MD, HL, '', ''],
        ['', HL, DK, DK, DK, HL, MD, MD, MD, HL, DK, DK, DK, HL, '', ''],
        ['', HL, DK, DK, DK, HL, MD, MD, MD, HL, DK, DK, DK, HL, '', ''],
        ['', HL, DK, DK, DK, HL, MD, MD, MD, HL, DK, DK, DK, HL, '', ''],
        ['', HL, DK, DK, DK, HL, MD, MD, MD, HL, DK, DK, DK, HL, '', ''],
        ['', HL, DK, DK, DK, HL, MD, MD, MD, HL, DK, DK, DK, HL, '', ''],
        [BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS],
        [BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS],
      ],
    },
    near: {
      width: 10,
      height: 8,
      anchorX: 5,
      anchorY: 7,
      lines: [
        "  .--.    ",
        " /░░░░\\   ",
        "|▓▓|▓▓▓|.-",
        "|▓▓|▓▓▓|░░",
        "|▓▓|▓▓▓|▓▓",
        "|▓▓|▓▓▓|▓▓",
        "/========\\",
        "::..::..::",
      ],
      colors: [
        ['', '', HL, HL, HL, HL, '', '', '', ''],
        ['', HL, MD, MD, MD, MD, HL, '', '', ''],
        [HL, DK, DK, HL, MD, MD, MD, HL, HL, ''],
        [HL, DK, DK, HL, MD, MD, MD, HL, MD, ''],
        [HL, DK, DK, HL, MD, MD, MD, HL, DK, ''],
        [HL, DK, DK, HL, MD, MD, MD, HL, DK, ''],
        [BS, BS, BS, BS, BS, BS, BS, BS, BS, BS],
        [BS, BS, BS, BS, BS, BS, BS, BS, BS, BS],
      ],
    },
    medium: {
      width: 6,
      height: 5,
      anchorX: 3,
      anchorY: 4,
      lines: [
        " .--. ",
        "|▓|▓▓|",
        "|▓|▓▓|",
        "/====\\",
        "::..::",
      ],
      colors: [
        ['', HL, HL, HL, HL, ''],
        [HL, DK, HL, MD, MD, HL],
        [HL, DK, HL, MD, MD, HL],
        [BS, BS, BS, BS, BS, BS],
        [BS, BS, BS, BS, BS, BS],
      ],
    },
    far: {
      width: 4,
      height: 3,
      anchorX: 2,
      anchorY: 2,
      lines: [
        ".--.",
        "|▓▓|",
        "::..",
      ],
      colors: [
        [HL, HL, HL, HL],
        [HL, DK, DK, HL],
        [BS, BS, BS, BS],
      ],
    },
  },
};
