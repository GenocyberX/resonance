import { SpriteDefinition } from '../../ascii/types';

const ST = '#94a3b8'; // Galvanized Steel W-Beam
const RF = '#fde047'; // Amber Catadioptric Reflector
const DK = '#475569'; // Beam Corrugation Shadow
const PS = '#334155'; // Steel I-Beam Post
const BS = '#0f172a'; // Road Shoulder Verge

export const GuardrailSprite: SpriteDefinition = {
  id: 'scenery_guardrail',
  name: 'Roadside Steel Guardrail',
  category: 'ROADSIDE',
  defaultColor: '#94a3b8',
  worldWidth: 160,
  worldHeight: 45,
  visualScale: 1.0,
  variants: {
    close: {
      width: 22,
      height: 6,
      anchorX: 11,
      anchorY: 5,
      lines: [
        " .==================. ",
        " |[*]======|=====[*]| ",
        " '==================' ",
        "   ||      ||     ||  ",
        "   ||      ||     ||  ",
        "  :==:    :==:   :==: ",
      ],
      colors: [
        ['', ST, ST, ST, ST, ST, ST, ST, ST, ST, ST, ST, ST, ST, ST, ST, ST, ST, ST, ST, '', ''],
        ['', ST, RF, RF, ST, ST, ST, ST, ST, ST, ST, ST, ST, ST, RF, RF, ST, ST, ST, ST, '', ''],
        ['', DK, DK, DK, DK, DK, DK, DK, DK, DK, DK, DK, DK, DK, DK, DK, DK, DK, DK, DK, '', ''],
        ['', '', '', PS, PS, '', '', '', '', '', PS, PS, '', '', '', '', '', PS, PS, '', '', ''],
        ['', '', '', PS, PS, '', '', '', '', '', PS, PS, '', '', '', '', '', PS, PS, '', '', ''],
        ['', '', BS, BS, BS, BS, '', '', '', BS, BS, BS, BS, '', '', '', BS, BS, BS, BS, '', ''],
      ],
    },
    near: {
      width: 16,
      height: 4,
      anchorX: 8,
      anchorY: 3,
      lines: [
        ".==============.",
        "|[*]====|==[*]| ",
        "'=============='",
        "  ||   ||   ||  ",
      ],
      colors: [
        [ST, ST, ST, ST, ST, ST, ST, ST, ST, ST, ST, ST, ST, ST, ST, ST],
        [ST, RF, RF, ST, ST, ST, ST, ST, ST, ST, RF, RF, ST, ST, ST, ST],
        [DK, DK, DK, DK, DK, DK, DK, DK, DK, DK, DK, DK, DK, DK, DK, DK],
        ['', '', PS, PS, '', '', PS, PS, '', '', PS, PS, '', '', '', ''],
      ],
    },
    medium: {
      width: 10,
      height: 3,
      anchorX: 5,
      anchorY: 2,
      lines: [
        ".========.",
        "|==[*]===|",
        " ||   ||  ",
      ],
      colors: [
        [ST, ST, ST, ST, ST, ST, ST, ST, ST, ST],
        [ST, ST, RF, RF, ST, ST, ST, ST, ST, ST],
        ['', PS, PS, '', '', '', PS, PS, '', ''],
      ],
    },
    far: {
      width: 6,
      height: 2,
      anchorX: 3,
      anchorY: 1,
      lines: [
        "======",
        " |  | ",
      ],
      colors: [
        [ST, ST, RF, ST, ST, ST],
        ['', PS, '', '', PS, ''],
      ],
    },
  },
};
