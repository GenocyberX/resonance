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

  // 14 Handcrafted Multi-Tiered ASCII Cloud Formations
  private static readonly CLOUD_PRESETS: CloudFormation[] = [
    // 1. Small Fair Weather (3 Variants)
    {
      id: 'small_fair_1',
      type: 'SMALL_FAIR_WEATHER',
      width: 14,
      height: 3,
      lines: [
        '   .----.     ',
        ' .-(      )-. ',
        '(____________)',
      ],
    },
    {
      id: 'small_fair_2',
      type: 'SMALL_FAIR_WEATHER',
      width: 16,
      height: 3,
      lines: [
        '    .------.    ',
        '  .-(        )-.',
        ' (______________)',
      ],
    },
    {
      id: 'small_fair_3',
      type: 'SMALL_FAIR_WEATHER',
      width: 12,
      height: 3,
      lines: [
        '  .---.     ',
        '.-(    )-.  ',
        '(__________)',
      ],
    },

    // 2. Medium Cumulus (3 Variants)
    {
      id: 'med_cumulus_1',
      type: 'MEDIUM_CUMULUS',
      width: 22,
      height: 4,
      lines: [
        '      .-------.       ',
        '   .-/         \\-.    ',
        ' .-(             )-.  ',
        '(___________________) ',
      ],
    },
    {
      id: 'med_cumulus_2',
      type: 'MEDIUM_CUMULUS',
      width: 24,
      height: 5,
      lines: [
        '        .----.          ',
        '     .-/      \\-.       ',
        '   ./            \\.     ',
        ' .-(              )-.   ',
        '(____________________)  ',
      ],
    },
    {
      id: 'med_cumulus_3',
      type: 'MEDIUM_CUMULUS',
      width: 26,
      height: 4,
      lines: [
        '     .----.   .----.      ',
        '  .-/      \\-/      \\-.   ',
        ' (                     )  ',
        '(_______________________) ',
      ],
    },

    // 3. Large Cumulus (2 Variants)
    {
      id: 'large_cumulus_1',
      type: 'LARGE_CUMULUS',
      width: 32,
      height: 6,
      lines: [
        '          .----------.          ',
        '       .-/            \\-.       ',
        '    .-/                  \\-.    ',
        '  ./                        \\.  ',
        ' (                            ) ',
        '(______________________________)',
      ],
    },
    {
      id: 'large_cumulus_2',
      type: 'LARGE_CUMULUS',
      width: 34,
      height: 5,
      lines: [
        '      .-------.     .-------.     ',
        '   .-/         \\---/         \\-.  ',
        ' .-(                            )-',
        '(                                 ',
        '(________________________________)',
      ],
    },

    // 4. Thin High Cloud / Cirrus (2 Variants)
    {
      id: 'thin_high_1',
      type: 'THIN_HIGH_CLOUD',
      width: 20,
      height: 2,
      lines: [
        ' ~~~--....--~~~~~   ',
        '   ~~~--....--~~~~~~',
      ],
    },
    {
      id: 'thin_high_2',
      type: 'THIN_HIGH_CLOUD',
      width: 24,
      height: 2,
      lines: [
        '   ~~~---....---~~~     ',
        '      ~~~---....---~~~~~',
      ],
    },

    // 5. Storm Cloud Formations (2 Variants)
    {
      id: 'storm_cloud_1',
      type: 'STORM_CLOUD',
      width: 30,
      height: 6,
      lines: [
        '        .------------.        ',
        '     .-/              \\-.     ',
        '  .-/                    \\-.  ',
        ' /                          \\ ',
        '|============================|',
        ' \\__________________________/ ',
      ],
    },
    {
      id: 'storm_cloud_2',
      type: 'STORM_CLOUD',
      width: 36,
      height: 6,
      lines: [
        '        .------------.   .----.     ',
        '     .-/              \\-/      \\-.  ',
        '  .-/                             \\ ',
        ' /                                 \\',
        '|===================================|',
        ' \\_________________________________/ ',
      ],
    },

    // 6. Overcast Fragments (2 Variants)
    {
      id: 'overcast_frag_1',
      type: 'OVERCAST_FRAGMENT',
      width: 38,
      height: 4,
      lines: [
        '======================================',
        '# # # # # # # # # # # # # # # # # # # ',
        '░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░',
        '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      ],
    },
    {
      id: 'overcast_frag_2',
      type: 'OVERCAST_FRAGMENT',
      width: 40,
      height: 4,
      lines: [
        '========================================',
        ' # # # # # # # # # # # # # # # # # # # #',
        '░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░',
        '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
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
        return { coverage: 'CLEAR', ratio: 0.08 };
      case 'CLOUDY':
        return { coverage: 'SCATTERED', ratio: 0.45 };
      case 'LIGHT_RAIN':
      case 'SNOW':
      case 'NEON_MIST':
        return { coverage: 'BROKEN', ratio: 0.68 };
      case 'HEAVY_RAIN':
      case 'THUNDERSTORM':
      case 'BLIZZARD':
        return { coverage: 'OVERCAST', ratio: 0.92 };
      case 'FOG':
      case 'VOLCANIC_ASH':
        return { coverage: 'BROKEN', ratio: 0.70 };
      default:
        return { coverage: 'FEW', ratio: 0.25 };
    }
  }

  /**
   * Initializes or reconfigures cloud instances for the active coverage level.
   */
  public initCloudLayers(coverage: CloudCoverage): void {
    this.instances = [];

    // Layer 1: HIGH Parallax Clouds (Slow, High Altitude)
    const highCount = coverage === 'CLEAR' ? 1 : (coverage === 'OVERCAST' ? 4 : 3);
    for (let i = 0; i < highCount; i++) {
      const formation = (coverage === 'CLEAR' || coverage === 'FEW')
        ? this.rng.choice([CloudManager.CLOUD_PRESETS[8], CloudManager.CLOUD_PRESETS[9]]) // Thin high
        : this.rng.choice([CloudManager.CLOUD_PRESETS[0], CloudManager.CLOUD_PRESETS[1], CloudManager.CLOUD_PRESETS[8]]);

      this.instances.push({
        xNorm: (i / highCount) + this.rng.range(0, 0.2),
        yNorm: this.rng.range(0.04, 0.20),
        speed: 0.0015,
        formation,
        layer: 'HIGH',
        alpha: 0.75,
      });
    }

    // Layer 2: MID Parallax Clouds (Normal speed, Mid Altitude)
    if (coverage !== 'CLEAR') {
      const midCount = coverage === 'FEW' ? 2 : (coverage === 'SCATTERED' ? 3 : 5);
      for (let i = 0; i < midCount; i++) {
        const formation = this.rng.choice([
          CloudManager.CLOUD_PRESETS[3],
          CloudManager.CLOUD_PRESETS[4],
          CloudManager.CLOUD_PRESETS[5],
        ]);

        this.instances.push({
          xNorm: (i / midCount) + this.rng.range(0, 0.25),
          yNorm: this.rng.range(0.16, 0.42),
          speed: 0.0035,
          formation,
          layer: 'MID',
          alpha: 0.90,
        });
      }
    }

    // Layer 3: LOW Parallax Clouds (Fast, Low Altitude & Storm/Overcast)
    if (coverage === 'SCATTERED' || coverage === 'BROKEN' || coverage === 'OVERCAST') {
      const lowCount = coverage === 'OVERCAST' ? 6 : (coverage === 'BROKEN' ? 4 : 2);
      for (let i = 0; i < lowCount; i++) {
        const formation = coverage === 'OVERCAST'
          ? this.rng.choice([CloudManager.CLOUD_PRESETS[10], CloudManager.CLOUD_PRESETS[11], CloudManager.CLOUD_PRESETS[12]])
          : this.rng.choice([CloudManager.CLOUD_PRESETS[6], CloudManager.CLOUD_PRESETS[7]]);

        this.instances.push({
          xNorm: (i / lowCount) + this.rng.range(0, 0.2),
          yNorm: this.rng.range(0.32, 0.65),
          speed: 0.0065,
          formation,
          layer: 'LOW',
          alpha: 1.0,
        });
      }
    }
  }

  /**
   * Advances cloud horizontal drift.
   */
  public update(dt: number, speedMultiplier: number = 1.0): void {
    for (const cloud of this.instances) {
      cloud.xNorm = (cloud.xNorm + cloud.speed * dt * speedMultiplier) % 1.0;
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

        // Top lines receive highlight rim; bottom line receives shadow base
        const rowColor = r === lines.length - 1
          ? cloudShadowColor
          : (r === 0 ? cloudHighlightColor : ColorPalette.lerp(cloudHighlightColor, cloudShadowColor, 0.4));

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
