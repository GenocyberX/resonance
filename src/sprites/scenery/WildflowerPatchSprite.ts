import { SpriteDefinition } from '../../ascii/types';

const PK = '#f43f5e'; // Rose Pink Flower
const YL = '#fbbf24'; // Sun Amber Flower
const VT = '#a855f7'; // Alpine Violet Flower
const GR = '#34d399'; // Meadow Stems & Leaves
const BS = '#022c22'; // Meadow Soil Base

export const WildflowerPatchSprite: SpriteDefinition = {
  id: 'scenery_wildflower_patch',
  name: 'Meadow Wildflower Patch',
  category: 'VEGETATION',
  defaultColor: '#f43f5e',
  worldWidth: 60,
  worldHeight: 35,
  visualScale: 0.9,
  variants: {
    close: {
      width: 16,
      height: 5,
      anchorX: 8,
      anchorY: 4,
      lines: [
        " *    *   *   * ",
        "\\|/  \\|/ \\|/ \\|/",
        " |    |   |   | ",
        "/==============\\",
        "::..::..::..::..",
      ],
      colors: [
        ['', PK, '', '', '', YL, '', '', VT, '', '', PK, '', '', '', ''],
        [GR, GR, GR, '', GR, GR, GR, '', GR, GR, GR, '', GR, GR, GR, ''],
        ['', GR, '', '', '', GR, '', '', '', GR, '', '', '', GR, '', ''],
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
        " *   *   *  ",
        "\\|/ \\|/ \\|/ ",
        " |   |   |  ",
        "::..::..::..",
      ],
      colors: [
        ['', PK, '', '', '', YL, '', '', VT, '', '', ''],
        [GR, GR, GR, '', GR, GR, GR, '', GR, GR, GR, ''],
        ['', GR, '', '', '', GR, '', '', '', GR, '', ''],
        [BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS],
      ],
    },
    medium: {
      width: 8,
      height: 3,
      anchorX: 4,
      anchorY: 2,
      lines: [
        " *   *  ",
        "\\|/ \\|/ ",
        "::..::..",
      ],
      colors: [
        ['', PK, '', '', '', YL, '', ''],
        [GR, GR, GR, '', GR, GR, GR, ''],
        [BS, BS, BS, BS, BS, BS, BS, BS],
      ],
    },
    far: {
      width: 4,
      height: 2,
      anchorX: 2,
      anchorY: 1,
      lines: [
        "** *",
        "::..",
      ],
      colors: [
        [PK, YL, '', VT],
        [BS, BS, BS, BS],
      ],
    },
  },
};
