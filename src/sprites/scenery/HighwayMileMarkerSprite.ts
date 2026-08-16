import { SpriteDefinition } from '../../ascii/types';

const RF = '#fde047'; // Amber Catadioptric Reflector
const WH = '#f8fafc'; // White Delineator Post
const DK = '#475569'; // Post Shaded Side
const BS = '#1e293b'; // Shoulder Verge Base

export const HighwayMileMarkerSprite: SpriteDefinition = {
  id: 'scenery_mile_marker',
  name: 'Highway Delineator Post',
  category: 'ROADSIDE',
  defaultColor: '#f8fafc',
  worldWidth: 25,
  worldHeight: 80,
  visualScale: 1.0,
  variants: {
    close: {
      width: 8,
      height: 9,
      anchorX: 4,
      anchorY: 8,
      lines: [
        "  .---. ",
        "  |(RF)|",
        "  |====|",
        "  |    |",
        "  |    |",
        "  |    |",
        "  |    |",
        "  |____|",
        "  :====:",
      ],
      colors: [
        ['', '', WH, WH, WH, WH, WH, ''],
        ['', '', WH, RF, RF, RF, WH, ''],
        ['', '', DK, DK, DK, DK, DK, ''],
        ['', '', WH, WH, WH, DK, DK, ''],
        ['', '', WH, WH, WH, DK, DK, ''],
        ['', '', WH, WH, WH, DK, DK, ''],
        ['', '', WH, WH, WH, DK, DK, ''],
        ['', '', DK, DK, DK, DK, DK, ''],
        ['', '', BS, BS, BS, BS, BS, ''],
      ],
    },
    near: {
      width: 6,
      height: 6,
      anchorX: 3,
      anchorY: 5,
      lines: [
        " .--. ",
        "|(RF)|",
        "|    |",
        "|    |",
        "|____|",
        ":====:",
      ],
      colors: [
        ['', WH, WH, WH, WH, ''],
        [WH, RF, RF, RF, RF, WH],
        [WH, WH, WH, DK, DK, ''],
        [WH, WH, WH, DK, DK, ''],
        [DK, DK, DK, DK, DK, ''],
        [BS, BS, BS, BS, BS, ''],
      ],
    },
    medium: {
      width: 4,
      height: 4,
      anchorX: 2,
      anchorY: 3,
      lines: [
        "(RF)",
        " || ",
        " || ",
        ":==:",
      ],
      colors: [
        [RF, RF, RF, RF],
        ['', WH, DK, ''],
        ['', WH, DK, ''],
        [BS, BS, BS, BS],
      ],
    },
    far: {
      width: 2,
      height: 2,
      anchorX: 1,
      anchorY: 1,
      lines: [
        "RF",
        "::",
      ],
      colors: [
        [RF, RF],
        [BS, BS],
      ],
    },
  },
};
