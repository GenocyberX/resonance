import { SpriteDefinition } from '../../ascii/types';

const CY = '#06b6d4'; // Cyan LED Arrow Display
const MG = '#ec4899'; // Magenta Strobe Beacon
const ST = '#64748b'; // Structural Gantry Steel
const NV = '#0f172a'; // Gantry Display Enclosure
const BS = '#020617'; // Foundation Plinth

export const CyberGantrySprite: SpriteDefinition = {
  id: 'scenery_cyber_gantry',
  name: 'Cyber Highway Overhead Gantry',
  category: 'STRUCTURE',
  defaultColor: '#06b6d4',
  worldWidth: 190,
  worldHeight: 120,
  visualScale: 1.0,
  variants: {
    close: {
      width: 26,
      height: 11,
      anchorX: 13,
      anchorY: 10,
      lines: [
        " (☼)                  (☼) ",
        ".========================.",
        "|[>>] 120 KM/H   [>>] -> |",
        "|  ^  RESONANCE   ^  ||  |",
        "'========================'",
        "    ||              ||    ",
        "    ||              ||    ",
        "    ||              ||    ",
        "    ||              ||    ",
        "   _||_            _||_   ",
        "  :====:          :====:  ",
      ],
      colors: [
        ['', MG, MG, MG, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', MG, MG, MG, '', ''],
        [ST, ST, ST, ST, ST, ST, ST, ST, ST, ST, ST, ST, ST, ST, ST, ST, ST, ST, ST, ST, ST, ST, ST, ST, ST, ST],
        [ST, NV, CY, CY, CY, CY, CY, CY, CY, CY, CY, CY, NV, NV, NV, CY, CY, CY, CY, CY, CY, NV, NV, NV, NV, ST],
        [ST, NV, NV, CY, NV, NV, MG, MG, MG, MG, MG, MG, NV, NV, NV, CY, NV, NV, CY, CY, NV, NV, NV, NV, NV, ST],
        [ST, ST, ST, ST, ST, ST, ST, ST, ST, ST, ST, ST, ST, ST, ST, ST, ST, ST, ST, ST, ST, ST, ST, ST, ST, ST],
        ['', '', '', '', ST, ST, '', '', '', '', '', '', '', '', '', '', '', '', ST, ST, '', '', '', '', '', ''],
        ['', '', '', '', ST, ST, '', '', '', '', '', '', '', '', '', '', '', '', ST, ST, '', '', '', '', '', ''],
        ['', '', '', '', ST, ST, '', '', '', '', '', '', '', '', '', '', '', '', ST, ST, '', '', '', '', '', ''],
        ['', '', '', '', ST, ST, '', '', '', '', '', '', '', '', '', '', '', '', ST, ST, '', '', '', '', '', ''],
        ['', '', '', ST, ST, ST, ST, '', '', '', '', '', '', '', '', '', '', ST, ST, ST, ST, '', '', '', '', ''],
        ['', '', BS, BS, BS, BS, BS, BS, '', '', '', '', '', '', '', '', BS, BS, BS, BS, BS, BS, '', '', '', ''],
      ],
    },
    near: {
      width: 18,
      height: 7,
      anchorX: 9,
      anchorY: 6,
      lines: [
        "(☼)            (☼)",
        ".================.",
        "|[>>] SPEED: 120 |",
        "'================'",
        "   ||        ||   ",
        "  _||_      _||_  ",
        " :====:    :====: ",
      ],
      colors: [
        [MG, MG, MG, '', '', '', '', '', '', '', '', '', '', '', '', MG, MG, MG],
        [ST, ST, ST, ST, ST, ST, ST, ST, ST, ST, ST, ST, ST, ST, ST, ST, ST, ST],
        [ST, NV, CY, CY, CY, CY, CY, CY, CY, CY, CY, CY, CY, CY, CY, NV, NV, ST],
        [ST, ST, ST, ST, ST, ST, ST, ST, ST, ST, ST, ST, ST, ST, ST, ST, ST, ST],
        ['', '', '', ST, ST, '', '', '', '', '', '', '', ST, ST, '', '', '', ''],
        ['', '', ST, ST, ST, ST, '', '', '', '', '', ST, ST, ST, ST, '', '', ''],
        ['', BS, BS, BS, BS, BS, BS, '', '', '', BS, BS, BS, BS, BS, BS, '', ''],
      ],
    },
    medium: {
      width: 12,
      height: 5,
      anchorX: 6,
      anchorY: 4,
      lines: [
        "(☼)      (☼)",
        ".==========.",
        "|[>] 120   |",
        "'=========='",
        "  ||    ||  ",
      ],
      colors: [
        [MG, MG, MG, '', '', '', '', '', '', MG, MG, MG],
        [ST, ST, ST, ST, ST, ST, ST, ST, ST, ST, ST, ST],
        [ST, NV, CY, CY, CY, CY, CY, CY, CY, CY, NV, ST],
        [ST, ST, ST, ST, ST, ST, ST, ST, ST, ST, ST, ST],
        ['', '', ST, ST, '', '', '', '', ST, ST, '', ''],
      ],
    },
    far: {
      width: 6,
      height: 3,
      anchorX: 3,
      anchorY: 2,
      lines: [
        ".----.",
        "|====|",
        " |||| ",
      ],
      colors: [
        [ST, ST, ST, ST, ST, ST],
        [ST, CY, CY, CY, CY, ST],
        ['', ST, ST, ST, ST, ''],
      ],
    },
  },
};
