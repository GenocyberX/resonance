import { SpriteDefinition } from '../../ascii/types';

const BD = '#f59e0b'; // Amber Body Frame
const DK = '#b45309'; // Dark Amber Shadow
const SH = '#cbd5e1'; // Roll-up Cargo Shutter
const CL = '#fde047'; // Amber Clearance Markers
const TL = '#ef4444'; // Red Brake Lights
const TR = '#18181b'; // Heavy Duty Tires

export const TruckSprite: SpriteDefinition = {
  id: 'truck',
  name: 'Delivery Box Truck',
  category: 'VEHICLE',
  defaultColor: '#f59e0b',
  worldWidth: 105,
  worldHeight: 110,
  visualScale: 1.05,
  variants: {
    close: {
      width: 24,
      height: 11,
      anchorX: 12,
      anchorY: 10,
      lines: [
        " .--------------------. ",
        " | [*]   [===]    [*] | ",
        " |====================| ",
        " ||                  || ",
        " ||  ==============  || ",
        " ||  ==============  || ",
        " ||  ==============  || ",
        " |====================| ",
        " |[**]   [====]   [**]| ",
        "  (O)(O)        (O)(O)  ",
        "  /====\\        /====\\  ",
      ],
      colors: [
        ['', BD, BD, BD, BD, BD, BD, BD, BD, BD, BD, BD, BD, BD, BD, BD, BD, BD, BD, BD, BD, BD, '', ''],
        ['', BD, CL, CL, BD, BD, CL, CL, CL, BD, BD, BD, BD, CL, CL, BD, BD, CL, CL, BD, '', '', '', ''],
        ['', BD, BD, BD, BD, BD, BD, BD, BD, BD, BD, BD, BD, BD, BD, BD, BD, BD, BD, BD, BD, BD, '', ''],
        ['', BD, DK, SH, SH, SH, SH, SH, SH, SH, SH, SH, SH, SH, SH, SH, SH, SH, SH, DK, BD, '', '', ''],
        ['', BD, DK, SH, SH, SH, SH, SH, SH, SH, SH, SH, SH, SH, SH, SH, SH, SH, SH, DK, BD, '', '', ''],
        ['', BD, DK, SH, SH, SH, SH, SH, SH, SH, SH, SH, SH, SH, SH, SH, SH, SH, SH, DK, BD, '', '', ''],
        ['', BD, DK, SH, SH, SH, SH, SH, SH, SH, SH, SH, SH, SH, SH, SH, SH, SH, SH, DK, BD, '', '', ''],
        ['', BD, BD, BD, BD, BD, BD, BD, BD, BD, BD, BD, BD, BD, BD, BD, BD, BD, BD, BD, BD, BD, '', ''],
        ['', BD, TL, TL, DK, DK, SH, SH, SH, SH, DK, DK, TL, TL, BD, '', '', '', '', '', '', '', '', ''],
        ['', '', TR, TR, TR, TR, '', '', '', '', '', '', '', '', TR, TR, TR, TR, '', '', '', '', '', ''],
        ['', '', TR, TR, TR, TR, '', '', '', '', '', '', '', '', TR, TR, TR, TR, '', '', '', '', '', ''],
      ],
    },
    near: {
      width: 18,
      height: 8,
      anchorX: 9,
      anchorY: 7,
      lines: [
        " .--------------. ",
        " |[*]   []   [*]| ",
        " |==============| ",
        " ||  ========  || ",
        " ||  ========  || ",
        " |==============| ",
        " |[*]  [==]  [*]| ",
        "  (O)        (O)  ",
      ],
      colors: [
        ['', BD, BD, BD, BD, BD, BD, BD, BD, BD, BD, BD, BD, BD, BD, BD, '', ''],
        ['', BD, CL, CL, BD, BD, CL, CL, BD, BD, CL, CL, BD, '', '', '', '', ''],
        ['', BD, BD, BD, BD, BD, BD, BD, BD, BD, BD, BD, BD, BD, BD, BD, '', ''],
        ['', BD, DK, SH, SH, SH, SH, SH, SH, SH, SH, DK, BD, '', '', '', '', ''],
        ['', BD, DK, SH, SH, SH, SH, SH, SH, SH, SH, DK, BD, '', '', '', '', ''],
        ['', BD, BD, BD, BD, BD, BD, BD, BD, BD, BD, BD, BD, BD, BD, BD, '', ''],
        ['', BD, TL, TL, DK, SH, SH, SH, SH, DK, TL, TL, BD, '', '', '', '', ''],
        ['', '', TR, TR, '', '', '', '', '', '', '', '', TR, TR, '', '', '', ''],
      ],
    },
    medium: {
      width: 12,
      height: 5,
      anchorX: 6,
      anchorY: 4,
      lines: [
        " .--------. ",
        " |[*]==[*]| ",
        " | |||||| | ",
        " |[*]==[*]| ",
        "  (O)  (O)  ",
      ],
      colors: [
        ['', BD, BD, BD, BD, BD, BD, BD, BD, BD, '', ''],
        ['', BD, CL, CL, BD, BD, CL, CL, BD, '', '', ''],
        ['', BD, DK, SH, SH, SH, SH, DK, BD, '', '', ''],
        ['', BD, TL, TL, DK, DK, TL, TL, BD, '', '', ''],
        ['', '', TR, TR, '', '', TR, TR, '', '', '', ''],
      ],
    },
    far: {
      width: 8,
      height: 3,
      anchorX: 4,
      anchorY: 2,
      lines: [
        " .----. ",
        " |====| ",
        "  (==)  ",
      ],
      colors: [
        ['', BD, BD, BD, BD, BD, BD, ''],
        ['', BD, TL, TL, TL, TL, BD, ''],
        ['', '', TR, TR, TR, TR, '', ''],
      ],
    },
  },
};
