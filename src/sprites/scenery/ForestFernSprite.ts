import { SpriteDefinition } from '../../ascii/types';

const HL = '#34d399'; // Mint Emerald Frond Tip
const MD = '#059669'; // Forest Green Midtone
const DK = '#064e3b'; // Deep Undergrowth Shadow
const BS = '#022c22'; // Damp Pine Needle Floor

export const ForestFernSprite: SpriteDefinition = {
  id: 'scenery_forest_fern',
  name: 'Woodland Forest Fern',
  category: 'VEGETATION',
  defaultColor: '#059669',
  worldWidth: 65,
  worldHeight: 45,
  visualScale: 0.95,
  variants: {
    close: {
      width: 16,
      height: 6,
      anchorX: 8,
      anchorY: 5,
      lines: [
        "  /\\  /\\    /\\  ",
        " (░░)(░░)  (░░) ",
        "((▒▒)(▒▒)()(▒▒))",
        " (▓▓)(▓▓)(▓▓)(▓)",
        "/==============\\",
        "::..::..::..::..",
      ],
      colors: [
        ['', '', HL, HL, '', HL, HL, '', '', '', HL, HL, '', '', '', ''],
        ['', HL, MD, MD, HL, HL, MD, MD, HL, '', HL, MD, MD, HL, '', ''],
        [MD, MD, MD, MD, MD, MD, MD, MD, MD, MD, MD, MD, MD, MD, MD, ''],
        ['', DK, DK, DK, DK, DK, DK, DK, DK, DK, DK, DK, DK, DK, DK, ''],
        [BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS],
        [BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS],
      ],
    },
    near: {
      width: 12,
      height: 4,
      anchorX: 6,
      anchorY: 3,
      lines: [
        " /\\  /\\  /\\ ",
        "(░░)(░░)(░░)",
        "(▒▒)(▒▒)(▒▒)",
        "::..::..::..",
      ],
      colors: [
        ['', HL, HL, '', HL, HL, '', HL, HL, '', '', ''],
        [HL, MD, MD, HL, HL, MD, MD, HL, HL, MD, MD, HL],
        [MD, DK, DK, MD, MD, DK, DK, MD, MD, DK, DK, MD],
        [BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS],
      ],
    },
    medium: {
      width: 8,
      height: 3,
      anchorX: 4,
      anchorY: 2,
      lines: [
        " /\\  /\\ ",
        "(░░)(░░)",
        "::..::..",
      ],
      colors: [
        ['', HL, HL, '', HL, HL, '', ''],
        [HL, MD, MD, HL, HL, MD, MD, HL],
        [BS, BS, BS, BS, BS, BS, BS, BS],
      ],
    },
    far: {
      width: 4,
      height: 2,
      anchorX: 2,
      anchorY: 1,
      lines: [
        "/\\/\\",
        "::..",
      ],
      colors: [
        [HL, MD, MD, HL],
        [BS, BS, BS, BS],
      ],
    },
  },
};
