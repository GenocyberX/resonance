import { SpriteDefinition } from '../../ascii/types';

const HL = '#cbd5e1'; // Sunlit Rock Crest
const MD = '#64748b'; // Slate Gray Midtone
const DK = '#334155'; // Deep Crevice Shadow
const BS = '#1e293b'; // Ground Contact Shadow

export const BoulderClusterSprite: SpriteDefinition = {
  id: 'scenery_boulder_cluster',
  name: 'Rugged Boulder Cluster',
  category: 'STRUCTURE',
  defaultColor: '#64748b',
  worldWidth: 120,
  worldHeight: 65,
  visualScale: 1.0,
  variants: {
    close: {
      width: 22,
      height: 8,
      anchorX: 11,
      anchorY: 7,
      lines: [
        "     .---.      .----.",
        "   ./░░░░░\\.  ./░░░░░░",
        "  /░░░/\\▒▒▒▒\\/░░░/\\▒▒▒",
        " |▒▒▒/  \\▓▓▓▓|▒▒/  \\▓▓",
        " |▓▓▓▓▓▓▓▓▓▓▓|▓▓▓▓▓▓▓▓",
        "/====================\\",
        "::..::..::..::..::..::",
        "::..::..::..::..::..::",
      ],
      colors: [
        ['', '', '', '', '', HL, HL, HL, '', '', '', '', '', '', HL, HL, HL, HL, '', '', '', ''],
        ['', '', '', HL, MD, MD, MD, MD, HL, '', '', HL, MD, MD, MD, MD, MD, MD, HL, '', '', ''],
        ['', '', HL, MD, MD, DK, DK, MD, MD, MD, HL, MD, MD, DK, DK, MD, MD, MD, MD, '', '', ''],
        ['', MD, MD, MD, DK, DK, DK, DK, DK, DK, MD, MD, DK, DK, DK, DK, DK, DK, MD, '', '', ''],
        ['', DK, DK, DK, DK, DK, DK, DK, DK, DK, DK, DK, DK, DK, DK, DK, DK, DK, DK, '', '', ''],
        [BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS],
        [BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS],
        [BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS],
      ],
    },
    near: {
      width: 14,
      height: 5,
      anchorX: 7,
      anchorY: 4,
      lines: [
        "  .--.   .---.",
        "./░░░░\\./░░░░░",
        "|▒▒/\\▓▓|▒▒/\\▓▓",
        "/============\\",
        "::..::..::..::",
      ],
      colors: [
        ['', '', HL, HL, '', '', '', '', HL, HL, HL, '', '', ''],
        ['', HL, MD, MD, HL, '', HL, MD, MD, MD, MD, HL, '', ''],
        [MD, MD, DK, DK, DK, MD, MD, DK, DK, DK, DK, MD, '', ''],
        [BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS],
        [BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS],
      ],
    },
    medium: {
      width: 8,
      height: 3,
      anchorX: 4,
      anchorY: 2,
      lines: [
        ".--..--.",
        "/░░\\/░░\\",
        "::..::..",
      ],
      colors: [
        [HL, HL, '', HL, HL, '', '', ''],
        [MD, MD, DK, MD, MD, DK, '', ''],
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
        [HL, MD, HL, MD],
        [BS, BS, BS, BS],
      ],
    },
  },
};
