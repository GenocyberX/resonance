import { FrameBuffer } from '../../ascii/FrameBuffer';
import { SeededRandom } from '../../procedural/SeededRandom';
import { ColorPalette } from '../../ascii/ColorPalette';
import {
  CloudCoverage,
  CloudFormation,
  CloudLayerInstance,
  WeatherType,
} from './SkyTypes';

export class CloudManager {
  private rng: SeededRandom;
  private instances: CloudLayerInstance[] = [];
  private occlusionGrid: Uint8Array = new Uint8Array(0);
  private gridWidth: number = 0;
  private gridHeight: number = 0;

  // 27 Handcrafted Volumetric ASCII Cloud Formations across 9 Families
  public static readonly CLOUD_PRESETS: CloudFormation[] = [
    // 1. FAIR_SMALL (3 Variants)
    {
      id: 'fair_small_1',
      type: 'FAIR_SMALL',
      width: 14,
      height: 3,
      lines: [
        '   .-----.    ',
        ' .-( ░░░░ )-  ',
        '(____________)',
      ],
    },
    {
      id: 'fair_small_2',
      type: 'FAIR_SMALL',
      width: 16,
      height: 3,
      lines: [
        '    .------.    ',
        '  .-(  ░░░░  )-.',
        ' (______________)',
      ],
    },
    {
      id: 'fair_small_3',
      type: 'FAIR_SMALL',
      width: 12,
      height: 3,
      lines: [
        '  .----.    ',
        '.-( ░░  )-. ',
        '(__________)',
      ],
    },

    // 2. FAIR_MEDIUM (3 Variants)
    {
      id: 'fair_med_1',
      type: 'FAIR_MEDIUM',
      width: 20,
      height: 4,
      lines: [
        '     .-------.      ',
        '  .-/  ░░░░░  \\-.   ',
        ' (    ░░░░░░░    )  ',
        '(_________________) ',
      ],
    },
    {
      id: 'fair_med_2',
      type: 'FAIR_MEDIUM',
      width: 22,
      height: 4,
      lines: [
        '      .-------.       ',
        '   .-/  ░░░░░░ \\-.    ',
        ' .-(    ▒▒▒▒▒▒    )-. ',
        '(____________________)',
      ],
    },
    {
      id: 'fair_med_3',
      type: 'FAIR_MEDIUM',
      width: 24,
      height: 4,
      lines: [
        '    .----.   .----.     ',
        ' .-/  ░░  \\-/  ░░  \\-.  ',
        '(       ░░░░░░░       ) ',
        '(______________________)',
      ],
    },

    // 3. CUMULUS_SMALL (3 Variants)
    {
      id: 'cumulus_small_1',
      type: 'CUMULUS_SMALL',
      width: 22,
      height: 5,
      lines: [
        '        .----.        ',
        '     .-/ ░░░░ \\-.     ',
        '   .-/   ░░░░░   \\-.  ',
        ' .-(     ▒▒▒▒▒     )-.',
        '(____________________)',
      ],
    },
    {
      id: 'cumulus_small_2',
      type: 'CUMULUS_SMALL',
      width: 24,
      height: 5,
      lines: [
        '       .-------.        ',
        '    .-/  ░░░░░  \\-.     ',
        '  ./     ░░░░░░    \\.   ',
        ' (       ▒▒▒▒▒▒      )  ',
        '(______________________)',
      ],
    },
    {
      id: 'cumulus_small_3',
      type: 'CUMULUS_SMALL',
      width: 26,
      height: 5,
      lines: [
        '     .---.     .---.      ',
        '  .-/ ░░  \\---/ ░░  \\-.   ',
        './      ░░░░░░░░       \\.',
        '(       ▒▒▒▒▒▒▒▒        )',
        '(_______________________)',
      ],
    },

    // 4. CUMULUS_LARGE (3 Variants)
    {
      id: 'cumulus_large_1',
      type: 'CUMULUS_LARGE',
      width: 34,
      height: 7,
      lines: [
        '            .----------.          ',
        '         .-/  ░░░░░░░░  \\-.       ',
        '      .-/     ░░░░░░░░     \\-.    ',
        '   .-/        ░░░░░░░░        \\-. ',
        ' ./           ▒▒▒▒▒▒▒▒           \\',
        '(             ▓▓▓▓▓▓▓▓            ',
        '(________________________________)',
      ],
    },
    {
      id: 'cumulus_large_2',
      type: 'CUMULUS_LARGE',
      width: 36,
      height: 6,
      lines: [
        '        .-------.     .--------.    ',
        '     .-/  ░░░░░  \\---/  ░░░░░░  \\-. ',
        '  .-/     ░░░░░░░░░░░░░░░░░░░░     \\',
        ' /        ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒      ',
        '|         ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓     |',
        ' \\________________________________/ ',
      ],
    },
    {
      id: 'cumulus_large_3',
      type: 'CUMULUS_LARGE',
      width: 38,
      height: 6,
      lines: [
        '      .------.   .------.   .------.  ',
        '   .-/  ░░░░  \\-/  ░░░░  \\-/  ░░░░  \\-',
        ' .-(      ░░░░░░░░░░░░░░░░░░░░      )',
        '(         ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒       )',
        '|         ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓       |',
        '(____________________________________)',
      ],
    },

    // 5. HIGH_THIN / Cirrus (3 Variants)
    {
      id: 'high_thin_1',
      type: 'HIGH_THIN',
      width: 22,
      height: 2,
      lines: [
        ' ~~~---.....---~~~~~  ',
        '    ~~~---.....---~~~~',
      ],
    },
    {
      id: 'high_thin_2',
      type: 'HIGH_THIN',
      width: 26,
      height: 2,
      lines: [
        '   ~~~~---......---~~~~   ',
        '      ~~~~---......---~~~~',
      ],
    },
    {
      id: 'high_thin_3',
      type: 'HIGH_THIN',
      width: 20,
      height: 2,
      lines: [
        ' ~~--.......--~~~~  ',
        '   ~~--.......--~~~~',
      ],
    },

    // 6. STRATUS (3 Variants)
    {
      id: 'stratus_1',
      type: 'STRATUS',
      width: 32,
      height: 3,
      lines: [
        ' ============================== ',
        '|  ░░░░░░░░░░░░░░░░░░░░░░░░░░  |',
        ' ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ ',
      ],
    },
    {
      id: 'stratus_2',
      type: 'STRATUS',
      width: 36,
      height: 3,
      lines: [
        '  ==============================  ',
        ' |  ░░░░░░░░░▒▒▒▒▒▒░░░░░░░░░░░░  | ',
        '  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~  ',
      ],
    },
    {
      id: 'stratus_3',
      type: 'STRATUS',
      width: 30,
      height: 3,
      lines: [
        ' ============================ ',
        '|  ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒  |',
        ' ~~~~~~~~~~~~~~~~~~~~~~~~~~~~ ',
      ],
    },

    // 7. OVERCAST (3 Variants)
    {
      id: 'overcast_1',
      type: 'OVERCAST',
      width: 40,
      height: 4,
      lines: [
        '========================================',
        '|  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  |',
        '|  ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒  |',
        '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      ],
    },
    {
      id: 'overcast_2',
      type: 'OVERCAST',
      width: 44,
      height: 4,
      lines: [
        '============================================',
        '|  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  |',
        '|  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  |',
        '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      ],
    },
    {
      id: 'overcast_3',
      type: 'OVERCAST',
      width: 38,
      height: 4,
      lines: [
        '======================================',
        '|  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  |',
        '|  ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒  |',
        '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      ],
    },

    // 8. STORM (3 Variants)
    {
      id: 'storm_1',
      type: 'STORM',
      width: 34,
      height: 7,
      lines: [
        '          .------------.          ',
        '       .-/  ░░░░░░░░░░  \\-.       ',
        '    .-/     ▒▒▒▒▒▒▒▒▒▒     \\-.    ',
        '  ./        ▓▓▓▓▓▓▓▓▓▓        \\.  ',
        ' /          ██████████          \\ ',
        '|================================|',
        ' \\______________________________/ ',
      ],
    },
    {
      id: 'storm_2',
      type: 'STORM',
      width: 38,
      height: 7,
      lines: [
        '        .------------.   .----.       ',
        '     .-/  ░░░░░░░░░░  \\-/  ░░  \\-.    ',
        '  .-/     ▒▒▒▒▒▒▒▒▒▒        ▒▒▒   \\-  ',
        ' /        ▓▓▓▓▓▓▓▓▓▓        ▓▓▓     \\ ',
        '|         ██████████        ███     | ',
        '|===================================| ',
        ' \\_________________________________/  ',
      ],
    },
    {
      id: 'storm_3',
      type: 'STORM',
      width: 36,
      height: 6,
      lines: [
        '      .------------------------.      ',
        '   .-/    ░░░░░░░░░░░░░░░░░     \\-.   ',
        ' .-(      ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒       )-. ',
        '(         ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓          )',
        '|====================================|',
        ' \\__________________________________/ ',
      ],
    },

    // 9. FOG_BANK (3 Variants)
    {
      id: 'fog_bank_1',
      type: 'FOG_BANK',
      width: 30,
      height: 3,
      lines: [
        ' . ~ ~ ~ . . ~ ~ ~ . . ~ ~ ~ .',
        '░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░',
        '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      ],
    },
    {
      id: 'fog_bank_2',
      type: 'FOG_BANK',
      width: 34,
      height: 3,
      lines: [
        ' . . ~ ~ ~ . . ~ ~ ~ . . ~ ~ ~ . .',
        '░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░',
        '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      ],
    },
    {
      id: 'fog_bank_3',
      type: 'FOG_BANK',
      width: 28,
      height: 3,
      lines: [
        ' ~ . ~ . ~ . ~ . ~ . ~ . ~ .',
        '░░░░░░░░░░░░░░░░░░░░░░░░░░░░',
        '~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      ],
    },
  ];

  constructor(seed: number) {
    this.rng = new SeededRandom(seed ^ 0x3c6ef372);
    this.initCloudLayers('FEW');
  }

  /**
   * Evaluates cloud coverage ratio and discrete coverage classification from weather.
   */
  public static evaluateCoverage(weather: WeatherType): {
    coverage: CloudCoverage;
    ratio: number;
  } {
    switch (weather) {
      case 'CLEAR':
      case 'HEAT_HAZE':
        return { coverage: 'CLEAR', ratio: 0.05 };
      case 'CLOUDY':
        return { coverage: 'SCATTERED', ratio: 0.40 };
      case 'LIGHT_RAIN':
      case 'SNOW':
      case 'NEON_MIST':
        return { coverage: 'BROKEN', ratio: 0.65 };
      case 'HEAVY_RAIN':
      case 'THUNDERSTORM':
      case 'BLIZZARD':
        return { coverage: 'OVERCAST', ratio: 0.92 };
      case 'FOG':
      case 'VOLCANIC_ASH':
        return { coverage: 'BROKEN', ratio: 0.70 };
      default:
        return { coverage: 'FEW', ratio: 0.20 };
    }
  }

  /**
   * Initializes or reconfigures cloud instances for the active coverage level.
   */
  public initCloudLayers(coverage: CloudCoverage): void {
    this.instances = [];

    // Filter presets by family
    const highPresets = CloudManager.CLOUD_PRESETS.filter(p => p.type === 'HIGH_THIN' || p.type === 'FAIR_SMALL');
    const midPresets = CloudManager.CLOUD_PRESETS.filter(p => p.type === 'FAIR_MEDIUM' || p.type === 'CUMULUS_SMALL' || p.type === 'STRATUS');
    const lowPresets = CloudManager.CLOUD_PRESETS.filter(p => p.type === 'CUMULUS_LARGE' || p.type === 'STORM' || p.type === 'OVERCAST' || p.type === 'FOG_BANK');

    // Layer 1: HIGH Parallax Clouds (Very Slow, High Altitude)
    const highCount = coverage === 'CLEAR' ? 1 : (coverage === 'OVERCAST' ? 4 : 3);
    for (let i = 0; i < highCount; i++) {
      const formation = this.rng.choice(highPresets);
      this.instances.push({
        xNorm: (i / highCount) + this.rng.range(0, 0.2),
        yNorm: this.rng.range(0.04, 0.18),
        speed: 0.0008,
        formation,
        layer: 'HIGH',
        alpha: 0.75,
      });
    }

    // Layer 2: MID Parallax Clouds (Slow, Mid Altitude)
    if (coverage !== 'CLEAR') {
      const midCount = coverage === 'FEW' ? 2 : (coverage === 'SCATTERED' ? 3 : 5);
      for (let i = 0; i < midCount; i++) {
        const formation = this.rng.choice(midPresets);
        this.instances.push({
          xNorm: (i / midCount) + this.rng.range(0, 0.25),
          yNorm: this.rng.range(0.16, 0.40),
          speed: 0.0022,
          formation,
          layer: 'MID',
          alpha: 0.90,
        });
      }
    }

    // Layer 3: LOW Parallax Clouds (Moderate Speed, Low Altitude & Storm/Overcast)
    if (coverage === 'SCATTERED' || coverage === 'BROKEN' || coverage === 'OVERCAST') {
      const lowCount = coverage === 'OVERCAST' ? 6 : (coverage === 'BROKEN' ? 4 : 2);
      for (let i = 0; i < lowCount; i++) {
        const formation = this.rng.choice(lowPresets);
        this.instances.push({
          xNorm: (i / lowCount) + this.rng.range(0, 0.2),
          yNorm: this.rng.range(0.30, 0.62),
          speed: 0.0045,
          formation,
          layer: 'LOW',
          alpha: 1.0,
        });
      }
    }
  }

  /**
   * Advances cloud horizontal drift modulated by world wind and music tempo.
   */
  public update(dt: number, speedMultiplier: number = 1.0, windStrength: number = 0): void {
    const windSpeedBonus = windStrength * 0.001;
    for (const cloud of this.instances) {
      cloud.xNorm = (cloud.xNorm + (cloud.speed + windSpeedBonus) * dt * speedMultiplier) % 1.0;
    }
  }

  /**
   * Pre-calculates cloud occlusion map for the current frame.
   */
  public buildOcclusionGrid(width: number, horizonRow: number): void {
    if (this.gridWidth !== width || this.gridHeight !== horizonRow) {
      this.gridWidth = width;
      this.gridHeight = horizonRow;
      this.occlusionGrid = new Uint8Array(width * horizonRow);
    } else {
      this.occlusionGrid.fill(0);
    }

    for (const cloud of this.instances) {
      const startX = Math.floor(cloud.xNorm * width);
      const startY = Math.floor(cloud.yNorm * horizonRow);
      const lines = cloud.formation.lines;

      for (let r = 0; r < lines.length; r++) {
        const line = lines[r];
        const cy = startY + r;
        if (cy < 0 || cy >= horizonRow) continue;

        for (let c = 0; c < line.length; c++) {
          if (line[c] !== ' ') {
            const cx = (startX + c + width) % width;
            this.occlusionGrid[cy * width + cx] = 1;
          }
        }
      }
    }
  }

  /**
   * Returns true if the coordinate is occluded by any cloud.
   */
  public isOccluded(x: number, y: number): boolean {
    if (x < 0 || x >= this.gridWidth || y < 0 || y >= this.gridHeight) return false;
    return this.occlusionGrid[y * this.gridWidth + x] === 1;
  }

  /**
   * Renders all cloud layers with atmospheric highlighting and shadow.
   */
  public renderClouds(
    fb: FrameBuffer,
    width: number,
    horizonRow: number,
    cloudHighlightColor: string,
    cloudShadowColor: string
  ): void {
    // Sort layers so HIGH is rendered first (behind), then MID, then LOW (in front)
    const sorted = [...this.instances].sort((a, b) => {
      const order = { HIGH: 1, MID: 2, LOW: 3 };
      return order[a.layer] - order[b.layer];
    });

    for (const cloud of sorted) {
      const startX = Math.floor(cloud.xNorm * width);
      const startY = Math.floor(cloud.yNorm * horizonRow);
      const lines = cloud.formation.lines;

      for (let r = 0; r < lines.length; r++) {
        const line = lines[r];
        const cy = startY + r;
        if (cy < 0 || cy >= horizonRow) continue;

        // Top line receives highlight rim; bottom lines receive shadow base; middle lines receive body tone
        const rowColor = r === lines.length - 1
          ? cloudShadowColor
          : (r === 0 ? cloudHighlightColor : ColorPalette.lerp(cloudHighlightColor, cloudShadowColor, 0.45));

        for (let c = 0; c < line.length; c++) {
          const ch = line[c];
          if (ch !== ' ') {
            const cx = (startX + c + width) % width;
            const zOrder = cloud.layer === 'LOW' ? 9965 : (cloud.layer === 'MID' ? 9970 : 9975);
            fb.setCell(cx, cy, ch, rowColor, zOrder, undefined, true);
          }
        }
      }
    }
  }
}
