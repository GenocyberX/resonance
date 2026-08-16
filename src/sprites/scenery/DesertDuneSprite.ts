import { SpriteDefinition } from '../../ascii/types';

const HL = '#fde047'; // Sunlit Dune Crest
const MD = '#d97706'; // Warm Desert Sand Midtone
const DK = '#b45309'; // Shadowed Windward Slope
const BS = '#451a03'; // Canyon Basin Earth

export const DesertDuneSprite: SpriteDefinition = {
  id: 'scenery_desert_dune',
  name: 'Sweeping Desert Sand Dune',
  category: 'STRUCTURE',
  defaultColor: '#d97706',
  worldWidth: 180,
  worldHeight: 65,
  visualScale: 1.0,
  variants: {
    close: {
      width: 24,
      height: 7,
      anchorX: 12,
      anchorY: 6,
      lines: [
        "           .---.        ",
        "        .-'░░░░░'-.     ",
        "     .-'░░░░░░░░░░░'--. ",
        "  .-'░░░░░░░░░░░░░░░░░░'",
        " /▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒\\",
        "|▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓|",
        "::..::..::..::..::..::..",
      ],
      colors: [
        ['', '', '', '', '', '', '', '', '', '', '', HL, HL, HL, '', '', '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', '', HL, HL, HL, MD, MD, MD, HL, HL, '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', HL, HL, HL, MD, MD, MD, MD, MD, MD, MD, MD, HL, HL, '', '', '', '', '', ''],
        ['', '', HL, HL, HL, MD, MD, MD, MD, MD, MD, MD, MD, MD, MD, MD, MD, MD, HL, HL, '', '', '', ''],
        ['', MD, MD, MD, MD, DK, DK, DK, DK, DK, DK, DK, DK, DK, DK, DK, DK, DK, DK, DK, MD, MD, '', ''],
        [DK, DK, DK, DK, DK, DK, DK, DK, DK, DK, DK, DK, DK, DK, DK, DK, DK, DK, DK, DK, DK, DK, DK, ''],
        [BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS],
      ],
    },
    near: {
      width: 16,
      height: 5,
      anchorX: 8,
      anchorY: 4,
      lines: [
        "       .--.     ",
        "    .-'░░░░'-.  ",
        " .-'░░░░░░░░░░'-",
        "/▒▒▒▒▒▒▒▒▒▒▒▒▒▒\\",
        "::..::..::..::..",
      ],
      colors: [
        ['', '', '', '', '', '', '', HL, HL, '', '', '', '', '', '', ''],
        ['', '', '', '', HL, HL, HL, MD, MD, HL, HL, '', '', '', '', ''],
        ['', HL, HL, HL, MD, MD, MD, MD, MD, MD, MD, HL, HL, '', '', ''],
        [MD, MD, MD, DK, DK, DK, DK, DK, DK, DK, DK, DK, MD, MD, '', ''],
        [BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS],
      ],
    },
    medium: {
      width: 10,
      height: 3,
      anchorX: 5,
      anchorY: 2,
      lines: [
        "   .--.   ",
        ".-'░░░░'-.",
        "::..::..::",
      ],
      colors: [
        ['', '', '', HL, HL, '', '', '', '', ''],
        [HL, HL, MD, MD, MD, MD, HL, HL, '', ''],
        [BS, BS, BS, BS, BS, BS, BS, BS, BS, BS],
      ],
    },
    far: {
      width: 6,
      height: 2,
      anchorX: 3,
      anchorY: 1,
      lines: [
        ".----.",
        "::..::",
      ],
      colors: [
        [HL, HL, MD, MD, HL, HL],
        [BS, BS, BS, BS, BS, BS],
      ],
    },
  },
};
