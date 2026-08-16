import { SpriteDefinition } from '../../ascii/types';

const HL = '#cbd5e1'; // Light Slate Highlight
const MD = '#64748b'; // Slate Gray Midtone
const DK = '#334155'; // Dark Shadow Crevice
const BS = '#1e293b'; // Ground Contact Shadow

export const RockSprite: SpriteDefinition = {
  id: 'obstacle_rock',
  name: 'Roadside Boulder',
  category: 'OBSTACLE',
  defaultColor: '#64748b',
  worldWidth: 70,
  worldHeight: 55,
  visualScale: 1.0,
  variants: {
    close: {
      width: 16,
      height: 7,
      anchorX: 8,
      anchorY: 6,
      lines: [
        "     .------.   ",
        "   ./░░░░░░░░\\. ",
        "  /░░░/\\▒▒▒▒▒▒\\ ",
        " |▒▒▒/  \\▓▓▓▓▓▓|",
        " |▓▓▓▓▓▓▓▓▓▓▓▓▓|",
        "/==============\\",
        "::..::..::..::..",
      ],
      colors: [
        ['', '', '', '', '', HL, HL, HL, HL, HL, HL, '', '', '', '', ''],
        ['', '', '', HL, MD, MD, MD, MD, MD, MD, MD, MD, HL, '', '', ''],
        ['', '', HL, MD, MD, DK, DK, MD, MD, MD, MD, MD, MD, '', '', ''],
        ['', MD, MD, MD, DK, DK, DK, DK, DK, DK, DK, DK, DK, DK, '', ''],
        ['', DK, DK, DK, DK, DK, DK, DK, DK, DK, DK, DK, DK, DK, '', ''],
        [BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS],
        [BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS],
      ],
    },
    near: {
      width: 12,
      height: 5,
      anchorX: 6,
      anchorY: 4,
      lines: [
        "   .----.   ",
        " ./░░░░░░\\. ",
        " |▒▒/\\▓▓▓▓| ",
        "/==========\\",
        "::..::..::..",
      ],
      colors: [
        ['', '', '', HL, HL, HL, HL, '', '', '', '', ''],
        ['', HL, MD, MD, MD, MD, MD, MD, HL, '', '', ''],
        ['', MD, MD, DK, DK, DK, DK, DK, MD, '', '', ''],
        [BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS],
        [BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS],
      ],
    },
    medium: {
      width: 8,
      height: 3,
      anchorX: 4,
      anchorY: 2,
      lines: [
        " .----. ",
        "/░░/\\▓▓\\",
        "::..::..",
      ],
      colors: [
        ['', HL, HL, HL, HL, '', '', ''],
        [HL, MD, DK, DK, DK, MD, '', ''],
        [BS, BS, BS, BS, BS, BS, BS, BS],
      ],
    },
    far: {
      width: 4,
      height: 2,
      anchorX: 2,
      anchorY: 1,
      lines: [
        ".--.",
        "::..",
      ],
      colors: [
        [HL, MD, DK, ''],
        [BS, BS, BS, BS],
      ],
    },
  },
};
