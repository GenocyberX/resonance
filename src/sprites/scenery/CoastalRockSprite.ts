import { SpriteDefinition } from '../../ascii/types';

const FM = '#ffffff'; // Crashing Surf Foam
const HL = '#cbd5e1'; // Wet Granite Highlight
const MD = '#64748b'; // Coastal Rock Midtone
const DK = '#334155'; // Dark Sea-Worn Shadow
const OC = '#38bdf8'; // Ocean Ripple
const OD = '#0284c7'; // Deep Water Contact

export const CoastalRockSprite: SpriteDefinition = {
  id: 'scenery_coastal_rock',
  name: 'Coastal Surf Breaker Rock',
  category: 'STRUCTURE',
  defaultColor: '#64748b',
  worldWidth: 95,
  worldHeight: 55,
  visualScale: 1.0,
  variants: {
    close: {
      width: 18,
      height: 7,
      anchorX: 9,
      anchorY: 6,
      lines: [
        "      .----.      ",
        "   .*~~~~~~~~*.   ",
        "  /░░░/\\▒▒▒▒▒▒\\   ",
        " |▒▒▒/  \\▓▓▓▓▓▓|  ",
        "~|▓▓▓▓▓▓▓▓▓▓▓▓▓|~~",
        " ~~~~~~~~~~~~~~~~ ",
        "  ~  ~    ~   ~   ",
      ],
      colors: [
        ['', '', '', '', '', '', HL, HL, HL, HL, '', '', '', '', '', '', '', ''],
        ['', '', '', FM, FM, FM, FM, FM, FM, FM, FM, FM, FM, '', '', '', '', ''],
        ['', '', HL, MD, MD, DK, DK, MD, MD, MD, MD, MD, MD, '', '', '', '', ''],
        ['', MD, MD, MD, DK, DK, DK, DK, DK, DK, DK, DK, DK, DK, '', '', '', ''],
        [OC, DK, DK, DK, DK, DK, DK, DK, DK, DK, DK, DK, DK, DK, DK, OC, OC, ''],
        ['', OC, OC, OC, OC, OC, OC, OC, OC, OC, OC, OC, OC, OC, OC, OC, '', ''],
        ['', '', OD, '', OD, '', '', '', OD, '', '', '', OD, '', '', '', '', ''],
      ],
    },
    near: {
      width: 12,
      height: 5,
      anchorX: 6,
      anchorY: 4,
      lines: [
        "   .----.   ",
        " .*~~~~~~*. ",
        " |▒▒/\\▓▓▓▓| ",
        "~~~~~~~~~~~~",
        " ~  ~   ~  ~",
      ],
      colors: [
        ['', '', '', HL, HL, HL, HL, '', '', '', '', ''],
        ['', FM, FM, FM, FM, FM, FM, FM, FM, FM, '', ''],
        ['', MD, MD, DK, DK, DK, DK, DK, MD, '', '', ''],
        [OC, OC, OC, OC, OC, OC, OC, OC, OC, OC, OC, OC],
        ['', OD, '', OD, '', '', OD, '', '', OD, '', OD],
      ],
    },
    medium: {
      width: 8,
      height: 3,
      anchorX: 4,
      anchorY: 2,
      lines: [
        " .----. ",
        ".*~~~~*.",
        "~~~~~~~~",
      ],
      colors: [
        ['', HL, HL, HL, HL, '', '', ''],
        [FM, FM, FM, FM, FM, FM, FM, FM],
        [OC, OC, OC, OC, OC, OC, OC, OC],
      ],
    },
    far: {
      width: 4,
      height: 2,
      anchorX: 2,
      anchorY: 1,
      lines: [
        "****",
        "~~~~",
      ],
      colors: [
        [FM, FM, FM, FM],
        [OC, OC, OC, OC],
      ],
    },
  },
};
