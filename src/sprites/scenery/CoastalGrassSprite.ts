import { SpriteDefinition } from '../../ascii/types';

const YL = '#fde047'; // Sun Gold Oat Tips
const GR = '#34d399'; // Sea Green Blades
const GD = '#059669'; // Deep Cluster Stems
const BS = '#d97706'; // Sandy Root Base

export const CoastalGrassSprite: SpriteDefinition = {
  id: 'scenery_coastal_grass',
  name: 'Coastal Dune Grass',
  category: 'VEGETATION',
  defaultColor: '#34d399',
  worldWidth: 60,
  worldHeight: 45,
  visualScale: 0.9,
  variants: {
    close: {
      width: 16,
      height: 6,
      anchorX: 8,
      anchorY: 5,
      lines: [
        " |  / | \\  |  / ",
        "/| /  |  \\ |\\/| ",
        "//|/  |   \\|\\\\| ",
        "| |   |    | || ",
        "/==============\\",
        "::..::..::..::..",
      ],
      colors: [
        ['', YL, '', YL, '', GR, '', YL, '', '', YL, '', '', YL, '', ''],
        [GR, GR, '', GR, '', '', GR, '', '', GR, '', GR, GR, GR, '', ''],
        [GR, GR, GD, GR, '', '', GD, '', '', '', GD, GR, GR, GD, GR, ''],
        [GD, '', GD, '', '', '', GD, '', '', '', '', GD, '', GD, GD, ''],
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
        " /|\\  /|\\   ",
        "//|\\\\//|\\\\  ",
        "/==========\\",
        "::..::..::..",
      ],
      colors: [
        ['', YL, GR, YL, '', '', YL, GR, YL, '', '', ''],
        [GR, GR, GD, GR, GR, GR, GR, GD, GR, GR, '', ''],
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
        " |/ \\|  ",
        "//| |\\\\ ",
        "::..::..",
      ],
      colors: [
        ['', YL, GR, '', GR, YL, '', ''],
        [GR, GR, GD, '', GD, GR, GR, ''],
        [BS, BS, BS, BS, BS, BS, BS, BS],
      ],
    },
    far: {
      width: 4,
      height: 2,
      anchorX: 2,
      anchorY: 1,
      lines: [
        "\\|/ ",
        "::..",
      ],
      colors: [
        [YL, GR, YL, ''],
        [BS, BS, BS, BS],
      ],
    },
  },
};
