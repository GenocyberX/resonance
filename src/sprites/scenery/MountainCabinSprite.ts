import { SpriteDefinition } from '../../ascii/types';

const SN = '#ffffff'; // Snow-Covered Roof
const WD = '#78350f'; // Rustic Timber Logs
const GL = '#fde047'; // Warm Glowing Hearth Window
const DK = '#451a03'; // Timber Eaves Shadow
const BS = '#cbd5e1'; // Permafrost Snow Ground

export const MountainCabinSprite: SpriteDefinition = {
  id: 'scenery_mountain_cabin',
  name: 'Alpine Mountain Refuge',
  category: 'BUILDING',
  defaultColor: '#fde047',
  worldWidth: 150,
  worldHeight: 130,
  visualScale: 1.0,
  variants: {
    close: {
      width: 22,
      height: 12,
      anchorX: 11,
      anchorY: 11,
      lines: [
        "         /\\   (o)     ",
        "       ./  \\.  ||     ",
        "     ./______\\.||     ",
        "   ./==========\\|     ",
        "  /==============\\    ",
        "  |  |░░|  |░░|  |    ",
        "  |  |░░|  |░░|  |    ",
        "  |==|==|==|==|==|    ",
        "  |  |  |  |  |  |    ",
        "  |__|__|__|__|__|    ",
        " /================\\   ",
        "::..::..::..::..::..::",
      ],
      colors: [
        ['', '', '', '', '', '', '', '', SN, SN, '', '', GL, GL, '', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', SN, SN, SN, SN, '', '', DK, DK, '', '', '', '', '', '', ''],
        ['', '', '', '', '', SN, SN, SN, SN, SN, SN, SN, SN, DK, DK, '', '', '', '', '', '', ''],
        ['', '', '', SN, SN, SN, SN, SN, SN, SN, SN, SN, SN, DK, DK, '', '', '', '', '', '', ''],
        ['', SN, SN, SN, SN, SN, SN, SN, SN, SN, SN, SN, SN, SN, SN, SN, '', '', '', '', '', ''],
        ['', WD, WD, GL, GL, WD, WD, GL, GL, WD, WD, WD, WD, WD, WD, WD, '', '', '', '', '', ''],
        ['', WD, WD, GL, GL, WD, WD, GL, GL, WD, WD, WD, WD, WD, WD, WD, '', '', '', '', '', ''],
        ['', WD, WD, WD, WD, WD, WD, WD, WD, WD, WD, WD, WD, WD, WD, WD, '', '', '', '', '', ''],
        ['', WD, WD, WD, WD, WD, WD, WD, WD, WD, WD, WD, WD, WD, WD, WD, '', '', '', '', '', ''],
        ['', WD, WD, WD, WD, WD, WD, WD, WD, WD, WD, WD, WD, WD, WD, WD, '', '', '', '', '', ''],
        ['', BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, '', '', '', ''],
        [BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS],
      ],
    },
    near: {
      width: 14,
      height: 8,
      anchorX: 7,
      anchorY: 7,
      lines: [
        "     /\\  (o)  ",
        "   ./__\\. ||  ",
        " ./======\\||  ",
        "/==========\\  ",
        "| |░░|  |░░| |",
        "| |==|  |==| |",
        "|____|_______|",
        "::..::..::..::",
      ],
      colors: [
        ['', '', '', '', '', SN, SN, '', GL, GL, '', '', '', ''],
        ['', '', '', SN, SN, SN, SN, SN, '', DK, DK, '', '', ''],
        ['', '', SN, SN, SN, SN, SN, SN, SN, DK, DK, '', '', ''],
        [SN, SN, SN, SN, SN, SN, SN, SN, SN, SN, SN, SN, '', ''],
        [WD, WD, GL, GL, WD, WD, GL, GL, WD, WD, WD, WD, '', ''],
        [WD, WD, WD, WD, WD, WD, WD, WD, WD, WD, WD, WD, '', ''],
        [WD, WD, WD, WD, WD, WD, WD, WD, WD, WD, WD, WD, '', ''],
        [BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS, BS],
      ],
    },
    medium: {
      width: 8,
      height: 5,
      anchorX: 4,
      anchorY: 4,
      lines: [
        "   /\\   ",
        "  /__\\  ",
        " /====\\ ",
        " |░||░| ",
        "::....::",
      ],
      colors: [
        ['', '', '', SN, SN, '', '', ''],
        ['', '', SN, SN, SN, SN, '', ''],
        ['', SN, SN, SN, SN, SN, SN, ''],
        ['', WD, GL, WD, GL, WD, WD, ''],
        [BS, BS, BS, BS, BS, BS, BS, BS],
      ],
    },
    far: {
      width: 4,
      height: 3,
      anchorX: 2,
      anchorY: 2,
      lines: [
        "/\\  ",
        "/==\\",
        "::..",
      ],
      colors: [
        ['', SN, SN, ''],
        [SN, SN, SN, SN],
        [BS, BS, BS, BS],
      ],
    },
  },
};
