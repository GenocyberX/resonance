import { SpriteDefinition } from '../../ascii/types';

const MS = '#34d399'; // Emerald Moss Patches
const RD = '#ef4444'; // Red Forest Mushrooms
const YL = '#fde047'; // Mushroom Spots
const TR = '#b45309'; // Decaying Timber Bark
const DK = '#78350f'; // Log Underside Shadow
const BS = '#022c22'; // Damp Forest Soil

export const FallenLogSprite: SpriteDefinition = {
  id: 'scenery_fallen_log',
  name: 'Mossy Fallen Log',
  category: 'VEGETATION',
  defaultColor: '#b45309',
  worldWidth: 110,
  worldHeight: 45,
  visualScale: 0.95,
  variants: {
    close: {
      width: 20,
      height: 7,
      anchorX: 10,
      anchorY: 6,
      lines: [
        "       (o)   (o)    ",
        "  .---. | --- | .-. ",
        " / (O) \\========/ \\\\",
        "| (O)O ||MS|MS||  ||",
        " \\ (O) /========\\ //",
        "  '---'_________'-' ",
        "::..::..::..::..::..",
      ],
      colors: [
        ['', '', '', '', '', '', '', RD, YL, RD, '', '', RD, YL, RD, '', '', '', '', ''],
        ['', '', TR, TR, TR, '', TR, '', '', '', TR, TR, TR, '', '', TR, TR, '', '', ''],
        ['', TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, TR, ''],
        [TR, TR, TR, TR, TR, TR, TR, MS, MS, MS, MS, MS, MS, TR, TR, TR, TR, TR, TR, TR],
        ['', TR, TR, TR, TR, TR, DK, DK, DK, DK, DK, DK, DK, DK, DK, DK, DK, TR, TR, ''],
        ['', '', TR, TR, TR, TR, DK, DK, DK, DK, DK, DK, DK, DK, TR, TR, TR, '', '', ''],
        [BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS],
      ],
    },
    near: {
      width: 14,
      height: 5,
      anchorX: 7,
      anchorY: 4,
      lines: [
        "     (o) (o)  ",
        " .---.|---|.-.",
        "/(O)\\=====/ \\\\",
        "\\(O)/=====\\ //",
        "::..::..::..::",
      ],
      colors: [
        ['', '', '', '', '', RD, YL, RD, '', RD, YL, RD, '', ''],
        ['', TR, TR, TR, TR, '', '', '', TR, TR, '', TR, TR, ''],
        [TR, TR, TR, TR, TR, MS, MS, MS, MS, MS, TR, TR, TR, TR],
        [TR, TR, TR, TR, TR, DK, DK, DK, DK, DK, DK, TR, TR, ''],
        [BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS],
      ],
    },
    medium: {
      width: 8,
      height: 3,
      anchorX: 4,
      anchorY: 2,
      lines: [
        "  (o)   ",
        "(O)=====",
        "::..::..",
      ],
      colors: [
        ['', '', RD, YL, RD, '', '', ''],
        [TR, TR, MS, MS, MS, DK, DK, ''],
        [BS, BS, BS, BS, BS, BS, BS, BS],
      ],
    },
    far: {
      width: 4,
      height: 2,
      anchorX: 2,
      anchorY: 1,
      lines: [
        "====",
        "::..",
      ],
      colors: [
        [TR, MS, MS, TR],
        [BS, BS, BS, BS],
      ],
    },
  },
};
