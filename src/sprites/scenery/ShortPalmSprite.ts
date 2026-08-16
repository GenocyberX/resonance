import { SpriteDefinition } from '../../ascii/types';

const LM = '#a7f3d0'; // Mint / Lime Frond Highlight
const EM = '#10b981'; // Emerald Frond Midtone
const DK = '#047857'; // Deep Understory Shadow
const TR = '#b45309'; // Trunk Amber Bark
const TD = '#78350f'; // Trunk Shadow
const BS = '#d97706'; // Ground Sand Base

export const ShortPalmSprite: SpriteDefinition = {
  id: 'scenery_short_palm',
  name: 'Short Fan Palm',
  category: 'VEGETATION',
  defaultColor: '#10b981',
  worldWidth: 90,
  worldHeight: 110,
  visualScale: 1.0,
  variants: {
    close: {
      width: 18,
      height: 11,
      anchorX: 9,
      anchorY: 10,
      lines: [
        "    _  \\ | /  _   ",
        "  _(_)-.---.-(_)_ ",
        " _(_) /  |  \\ (_) ",
        "/  / /   |   \\ \\ \\",
        "/__//    |    \\\\_\\",
        "     '--.===.--'  ",
        "        / | \\     ",
        "        | | |     ",
        "        | | |     ",
        "       _| | |_    ",
        "      :=======:   ",
      ],
      colors: [
        ['', '', '', '', LM, '', LM, EM, LM, '', LM, '', '', '', '', '', '', ''],
        ['', '', EM, EM, LM, LM, LM, LM, LM, LM, LM, LM, EM, EM, '', '', '', ''],
        ['', DK, DK, '', EM, '', '', EM, '', '', EM, '', '', DK, DK, '', '', ''],
        [DK, '', DK, '', EM, '', '', DK, '', '', EM, '', '', DK, '', DK, '', ''],
        [DK, DK, DK, '', '', '', '', DK, '', '', '', '', '', DK, DK, DK, '', ''],
        ['', '', '', '', '', TR, TR, TR, TR, TR, TR, TR, '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', TR, TD, TR, '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', TR, TD, TR, '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', TR, TD, TR, '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', TR, TR, TD, TR, TR, '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', BS, BS, BS, BS, BS, BS, '', '', '', '', '', ''],
      ],
    },
    near: {
      width: 12,
      height: 8,
      anchorX: 6,
      anchorY: 7,
      lines: [
        "  \\ \\ | / / ",
        " -(_)-+-(-)-",
        "/  /  |  \\ \\",
        "  '-.===.-' ",
        "     | |    ",
        "     | |    ",
        "    _| |_   ",
        "   :====:   ",
      ],
      colors: [
        ['', '', LM, '', LM, EM, LM, '', LM, '', '', ''],
        ['', EM, EM, EM, EM, DK, EM, EM, EM, EM, '', ''],
        [DK, '', DK, '', '', DK, '', '', DK, '', DK, ''],
        ['', '', TR, TR, TR, TR, TR, TR, TR, '', '', ''],
        ['', '', '', '', '', TR, TR, '', '', '', '', ''],
        ['', '', '', '', '', TR, TD, '', '', '', '', ''],
        ['', '', '', '', TR, TR, TD, TR, '', '', '', ''],
        ['', '', '', BS, BS, BS, BS, BS, BS, '', '', ''],
      ],
    },
    medium: {
      width: 8,
      height: 5,
      anchorX: 4,
      anchorY: 4,
      lines: [
        " \\ | /  ",
        "-(-+-)- ",
        " --=--  ",
        "  | |   ",
        " :===:  ",
      ],
      colors: [
        ['', LM, '', EM, '', LM, '', ''],
        [EM, EM, EM, DK, EM, EM, EM, ''],
        ['', TR, TR, TR, TR, TR, '', ''],
        ['', '', TR, TR, '', '', '', ''],
        ['', BS, BS, BS, BS, BS, '', ''],
      ],
    },
    far: {
      width: 4,
      height: 3,
      anchorX: 2,
      anchorY: 2,
      lines: [
        "\\|/ ",
        "-+- ",
        ":=: ",
      ],
      colors: [
        [LM, EM, LM, ''],
        [EM, DK, EM, ''],
        [BS, BS, BS, ''],
      ],
    },
  },
};
