import { SpriteDefinition } from '../../ascii/types';

const LM = '#6ee7b7'; // Mint Lime Highlight
const EM = '#059669'; // Emerald Foliage
const DK = '#064e3b'; // Deep Cluster Shadow
const FL = '#f43f5e'; // Coral Blossom Accent
const BS = '#d97706'; // Ground Sand Base

export const TropicalBushSprite: SpriteDefinition = {
  id: 'scenery_tropical_bush',
  name: 'Flowering Coastal Bush',
  category: 'VEGETATION',
  defaultColor: '#059669',
  worldWidth: 70,
  worldHeight: 50,
  visualScale: 1.0,
  variants: {
    close: {
      width: 18,
      height: 7,
      anchorX: 9,
      anchorY: 6,
      lines: [
        "     .------.     ",
        "  .-'  *     '-.  ",
        " .'  *    *     '.",
        "/  *    *    *   \\",
        "|________________|",
        "/================\\",
        "::..::..::..::..::",
      ],
      colors: [
        ['', '', '', '', '', HL_(), LM, LM, LM, LM, LM, '', '', '', '', '', '', ''],
        ['', '', '', LM, LM, DK, '', FL, '', '', '', DK, LM, LM, '', '', '', ''],
        ['', LM, DK, '', '', FL, '', '', '', FL, '', '', '', '', DK, LM, '', ''],
        [EM, '', '', FL, '', '', '', FL, '', '', '', FL, '', '', '', EM, EM, ''],
        [DK, DK, DK, DK, DK, DK, DK, DK, DK, DK, DK, DK, DK, DK, DK, DK, DK, DK],
        [BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS],
        [BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS],
      ],
    },
    near: {
      width: 12,
      height: 5,
      anchorX: 6,
      anchorY: 4,
      lines: [
        "   .----.   ",
        " .'  *   '. ",
        "/  *   *  \\ ",
        "|_________| ",
        "::..::..::..",
      ],
      colors: [
        ['', '', '', LM, LM, LM, LM, '', '', '', '', ''],
        ['', LM, LM, '', FL, '', '', LM, LM, '', '', ''],
        [EM, '', FL, '', '', FL, '', '', '', EM, '', ''],
        [DK, DK, DK, DK, DK, DK, DK, DK, DK, DK, DK, ''],
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
        "/ (FL) \\",
        "::..::..",
      ],
      colors: [
        ['', LM, LM, LM, LM, '', '', ''],
        [EM, '', FL, FL, '', EM, '', ''],
        [BS, BS, BS, BS, BS, BS, BS, BS],
      ],
    },
    far: {
      width: 4,
      height: 2,
      anchorX: 2,
      anchorY: 1,
      lines: [
        "(FL)",
        "::..",
      ],
      colors: [
        [LM, FL, FL, EM],
        [BS, BS, BS, BS],
      ],
    },
  },
};

function HL_() { return LM; }
