import { SpriteDefinition } from '../../ascii/types';

const SN = '#ffffff'; // Alpine Powder Snow Cap
const IC = '#93c5fd'; // Glacial Ice Cyan Accent
const DG = '#064e3b'; // Dwarf Spruce Needle Understory
const BS = '#cbd5e1'; // Permafrost Snow Contact

export const AlpineShrubSprite: SpriteDefinition = {
  id: 'scenery_alpine_shrub',
  name: 'Alpine Frost Shrub',
  category: 'VEGETATION',
  defaultColor: '#e0f2fe',
  worldWidth: 65,
  worldHeight: 45,
  visualScale: 0.9,
  variants: {
    close: {
      width: 16,
      height: 6,
      anchorX: 8,
      anchorY: 5,
      lines: [
        "   .--------.   ",
        " .*░░░░░░░░*.   ",
        "/░░░/\\▒▒▒▒▒\\░░░\\",
        "|▒▒/  \\▓▓▓▓▓\\▒▒|",
        "/==============\\",
        "::..::..::..::..",
      ],
      colors: [
        ['', '', '', SN, SN, SN, SN, SN, SN, SN, SN, '', '', '', '', ''],
        ['', SN, SN, SN, SN, SN, SN, SN, SN, SN, SN, '', '', '', '', ''],
        [SN, IC, IC, IC, DG, DG, IC, IC, IC, IC, DG, DG, IC, IC, IC, ''],
        [DG, DG, DG, DG, DG, DG, DG, DG, DG, DG, DG, DG, DG, DG, DG, ''],
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
        "  .------.  ",
        ".*░░░░░░░░*.",
        "|░░/\\▒▒▒▒▒▒|",
        "::..::..::..",
      ],
      colors: [
        ['', '', SN, SN, SN, SN, SN, SN, '', '', '', ''],
        ['', SN, SN, SN, SN, SN, SN, SN, SN, SN, '', ''],
        [IC, IC, DG, DG, IC, IC, IC, DG, DG, IC, IC, ''],
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
        ".*░░░░*.",
        "::..::..",
      ],
      colors: [
        ['', SN, SN, SN, SN, '', '', ''],
        [SN, SN, SN, SN, SN, SN, SN, ''],
        [BS, BS, BS, BS, BS, BS, BS, BS],
      ],
    },
    far: {
      width: 4,
      height: 2,
      anchorX: 2,
      anchorY: 1,
      lines: [
        "****",
        "::..",
      ],
      colors: [
        [SN, SN, SN, SN],
        [BS, BS, BS, BS],
      ],
    },
  },
};
