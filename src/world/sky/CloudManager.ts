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

  // 27 Handcrafted Delicate Outline ASCII Cloud Formations across 9 Families
  public static readonly CLOUD_PRESETS: CloudFormation[] = [
    // 1. FAIR_SMALL (3 Variants) - 8 to 12 chars wide, 3 lines
    {
      id: 'fair_small_1',
      type: 'FAIR_SMALL',
      width: 10,
      height: 3,
      lines: [
        '  .---.   ',
        '.-(   )-. ',
        '(_______) ',
      ],
    },
    {
      id: 'fair_small_2',
      type: 'FAIR_SMALL',
      width: 12,
      height: 3,
      lines: [
        '   .----.   ',
        ' .-(    )-. ',
        '(__________)',
      ],
    },
    {
      id: 'fair_small_3',
      type: 'FAIR_SMALL',
      width: 8,
      height: 3,
      lines: [
        ' .--.   ',
        '.-(  )-.',
        '(______) ',
      ],
    },

    // 2. FAIR_MEDIUM (3 Variants) - 14 to 18 chars wide, 4 lines
    {
      id: 'fair_med_1',
      type: 'FAIR_MEDIUM',
      width: 16,
      height: 4,
      lines: [
        '     .----.     ',
        '  .-/      \\-.  ',
        ' (            ) ',
        '(______________) ',
      ],
    },
    {
      id: 'fair_med_2',
      type: 'FAIR_MEDIUM',
      width: 16,
      height: 4,
      lines: [
        '    .------.    ',
        " .-'        '-. ",
        '(              )',
        ' (____________) ',
      ],
    },
    {
      id: 'fair_med_3',
      type: 'FAIR_MEDIUM',
      width: 18,
      height: 4,
      lines: [
        '   .---.   .---.  ',
        " .-'   '---'   '-.",
        '(                )',
        ' (______________) ',
      ],
    },

    // 3. CUMULUS_SMALL (3 Variants) - 16 to 20 chars wide, 4 lines
    {
      id: 'cumulus_small_1',
      type: 'CUMULUS_SMALL',
      width: 16,
      height: 4,
      lines: [
        '     .----.     ',
        '  .-/      \\-.  ',
        ".-'          '-.",
        '(______________) ',
      ],
    },
    {
      id: 'cumulus_small_2',
      type: 'CUMULUS_SMALL',
      width: 18,
      height: 4,
      lines: [
        '     .------.     ',
        "  .-'        '-.  ",
        ".'              `.",
        '(________________)',
      ],
    },
    {
      id: 'cumulus_small_3',
      type: 'CUMULUS_SMALL',
      width: 20,
      height: 4,
      lines: [
        '    .---.  .---.    ',
        "  .-'   \\--/   '-.  ",
        ' (                ) ',
        '(__________________) ',
      ],
    },

    // 4. CUMULUS_LARGE (3 Variants) - 24 to 28 chars wide, 5-6 lines
    {
      id: 'cumulus_large_1',
      type: 'CUMULUS_LARGE',
      width: 26,
      height: 6,
      lines: [
        '         .-------.        ',
        '      .-/         \\-.     ',
        "    .-'             '-.   ",
        "  .'                   `. ",
        ' (                       )',
        '  (_____________________) ',
      ],
    },
    {
      id: 'cumulus_large_2',
      type: 'CUMULUS_LARGE',
      width: 28,
      height: 5,
      lines: [
        '       .----.     .----.     ',
        '    .-/      \\---/      \\-.  ',
        "  .-'                      '-.",
        ' (                            )',
        '  (__________________________) ',
      ],
    },
    {
      id: 'cumulus_large_3',
      type: 'CUMULUS_LARGE',
      width: 26,
      height: 5,
      lines: [
        '        .----------.      ',
        '     .-/            \\-.   ',
        "   .-'                '-. ",
        '  (                      )',
        ' (________________________)',
      ],
    },

    // 5. HIGH_THIN / Cirrus (3 Variants) - 12 to 16 chars wide, 1 line
    {
      id: 'high_thin_1',
      type: 'HIGH_THIN',
      width: 15,
      height: 1,
      lines: [
        '---..     ..---',
      ],
    },
    {
      id: 'high_thin_2',
      type: 'HIGH_THIN',
      width: 14,
      height: 1,
      lines: [
        '  ...------...  ',
      ],
    },
    {
      id: 'high_thin_3',
      type: 'HIGH_THIN',
      width: 16,
      height: 1,
      lines: [
        '--.   .---.   .--',
      ],
    },

    // 6. STRATUS (3 Variants) - 20 to 24 chars wide, 2 lines
    {
      id: 'stratus_1',
      type: 'STRATUS',
      width: 20,
      height: 2,
      lines: [
        '  .~~--....--~~.    ',
        ' (______________)-. ',
      ],
    },
    {
      id: 'stratus_2',
      type: 'STRATUS',
      width: 22,
      height: 2,
      lines: [
        ' .~~---......---~~.   ',
        '(__________________)-.',
      ],
    },
    {
      id: 'stratus_3',
      type: 'STRATUS',
      width: 20,
      height: 2,
      lines: [
        '   .~~~--....--~~~. ',
        ' (_________________)',
      ],
    },

    // 7. OVERCAST (3 Variants) - 24 to 28 chars wide, 2 lines
    {
      id: 'overcast_1',
      type: 'OVERCAST',
      width: 24,
      height: 2,
      lines: [
        '.~~~~~~-------~~~~~~.   ',
        '(___________________)-. ',
      ],
    },
    {
      id: 'overcast_2',
      type: 'OVERCAST',
      width: 26,
      height: 2,
      lines: [
        '.~~~~~---......---~~~~~.  ',
        '(______________________)--',
      ],
    },
    {
      id: 'overcast_3',
      type: 'OVERCAST',
      width: 22,
      height: 2,
      lines: [
        '.~~~~---------~~~~.   ',
        '(_________________)-. ',
      ],
    },

    // 8. STORM (3 Variants) - 26 to 30 chars wide, 5 lines
    {
      id: 'storm_1',
      type: 'STORM',
      width: 26,
      height: 5,
      lines: [
        '       .------------.     ',
        '    .-/              \\-.  ',
        "  .-'                  '-.",
        ' (                        )',
        '  \\______________________/ ',
      ],
    },
    {
      id: 'storm_2',
      type: 'STORM',
      width: 28,
      height: 5,
      lines: [
        '      .----------.    .----.  ',
        '   .-/            \\--/      \\-',
        " .-'                          ",
        '(                             ',
        ' \\____________________________/ ',
      ],
    },
    {
      id: 'storm_3',
      type: 'STORM',
      width: 26,
      height: 5,
      lines: [
        '       .----------------. ',
        '    .-/                  \\',
        "  .-'                     ",
        '(                         ',
        '  \\______________________/',
      ],
    },

    // 9. FOG_BANK (3 Variants) - 16 to 20 chars wide, 1 line
    {
      id: 'fog_bank_1',
      type: 'FOG_BANK',
      width: 18,
      height: 1,
      lines: [
        '.~ . ~ . ~ . ~ . ~',
      ],
    },
    {
      id: 'fog_bank_2',
      type: 'FOG_BANK',
      width: 20,
      height: 1,
      lines: [
        '.. ~ ~ . . ~ ~ . .. ',
      ],
    },
    {
      id: 'fog_bank_3',
      type: 'FOG_BANK',
      width: 16,
      height: 1,
      lines: [
        '~ . ~ . ~ . ~ . ',
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
        return { coverage: 'SCATTERED', ratio: 0.35 };
      case 'LIGHT_RAIN':
      case 'SNOW':
      case 'NEON_MIST':
        return { coverage: 'BROKEN', ratio: 0.60 };
      case 'HEAVY_RAIN':
      case 'THUNDERSTORM':
      case 'BLIZZARD':
        return { coverage: 'OVERCAST', ratio: 0.90 };
      case 'FOG':
      case 'VOLCANIC_ASH':
        return { coverage: 'BROKEN', ratio: 0.60 };
      default:
        return { coverage: 'FEW', ratio: 0.15 };
    }
  }

  public getInstances(): CloudLayerInstance[] {
    return this.instances;
  }

  /**
   * Initializes or reconfigures cloud instances strictly respecting the Complexity Budget and Celestial Clearing Zone.
   */
  public initCloudLayers(coverage: CloudCoverage, celestialAvoidHeading: number | null = null): void {
    this.instances = [];

    // Filter presets by family
    const smallFairPresets = CloudManager.CLOUD_PRESETS.filter(p => p.type === 'FAIR_SMALL' || p.type === 'HIGH_THIN');
    const medFairPresets = CloudManager.CLOUD_PRESETS.filter(p => p.type === 'FAIR_MEDIUM' || p.type === 'CUMULUS_SMALL' || p.type === 'STRATUS');
    const largePresets = CloudManager.CLOUD_PRESETS.filter(p => p.type === 'CUMULUS_LARGE' || p.type === 'STORM' || p.type === 'OVERCAST');

    // STRICT COMPLEXITY BUDGET:
    // CLEAR: 0-1 tiny high cloud (85-95% open negative space)
    // FEW: 1-2 small clouds (70-85% open space)
    // SCATTERED: 2-3 clouds (55-75% open space)
    // BROKEN: 3-4 clouds (35-50% open space)
    // OVERCAST: 4-5 connected clouds

    let highCount = 0;
    let midCount = 0;
    let lowCount = 0;

    switch (coverage) {
      case 'CLEAR':
        highCount = this.rng.next() < 0.5 ? 1 : 0;
        midCount = 0;
        lowCount = 0;
        break;
      case 'FEW':
        highCount = 1;
        midCount = 1;
        lowCount = 0;
        break;
      case 'SCATTERED':
        highCount = 1;
        midCount = 1;
        lowCount = 1;
        break;
      case 'BROKEN':
        highCount = 1;
        midCount = 2;
        lowCount = 1;
        break;
      case 'OVERCAST':
        highCount = 1;
        midCount = 2;
        lowCount = 2;
        break;
    }

    // Helper: Select xNorm avoiding celestial buffer zone
    const pickX = (baseX: number): number => {
      let x = (baseX + this.rng.range(-0.08, 0.08) + 1.0) % 1.0;
      if (celestialAvoidHeading !== null && coverage !== 'OVERCAST') {
        const dist = Math.abs(x - celestialAvoidHeading);
        if (dist < 0.16) {
          // Shift away from sun/moon
          x = (x + (x >= celestialAvoidHeading ? 0.20 : -0.20) + 1.0) % 1.0;
        }
      }
      return x;
    };

    // Layer 1: HIGH Parallax (Cirrus / Fair Small)
    for (let i = 0; i < highCount; i++) {
      const formation = this.rng.choice(smallFairPresets);
      this.instances.push({
        xNorm: pickX(0.25 + i * 0.50),
        yNorm: this.rng.range(0.04, 0.15),
        speed: 0.0008,
        formation,
        layer: 'HIGH',
        alpha: 0.70,
      });
    }

    // Layer 2: MID Parallax (Fair Med / Cumulus Small)
    for (let i = 0; i < midCount; i++) {
      const formation = this.rng.choice(medFairPresets);
      this.instances.push({
        xNorm: pickX(0.65 + i * 0.45),
        yNorm: this.rng.range(0.14, 0.32),
        speed: 0.0022,
        formation,
        layer: 'MID',
        alpha: 0.90,
      });
    }

    // Layer 3: LOW Parallax (Cumulus Large / Storm / Overcast)
    for (let i = 0; i < lowCount; i++) {
      const formation = this.rng.choice(largePresets);
      this.instances.push({
        xNorm: pickX(0.15 + i * 0.55),
        yNorm: this.rng.range(0.26, 0.46),
        speed: 0.0040,
        formation,
        layer: 'LOW',
        alpha: 1.0,
      });
    }
  }

  /**
   * Advances cloud horizontal drift.
   */
  public update(dt: number, speedMultiplier: number = 1.0, windStrength: number = 0): void {
    const windSpeedBonus = windStrength * 0.0008;
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
   * Renders all cloud layers with delicate silhouette lines and zero dense dither fills.
   */
  public renderClouds(
    fb: FrameBuffer,
    width: number,
    horizonRow: number,
    cloudHighlightColor: string,
    cloudShadowColor: string
  ): void {
    // Sort layers: HIGH behind, MID, LOW in front
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

        // Top line receives clean highlight; bottom lines receive soft shadow contour
        const rowColor = (r === lines.length - 1 && lines.length > 2)
          ? cloudShadowColor
          : (r === 0 ? cloudHighlightColor : ColorPalette.lerp(cloudHighlightColor, cloudShadowColor, 0.35));

        for (let c = 0; c < line.length; c++) {
          const ch = line[c];
          if (ch !== ' ') {
            const cx = (startX + c + width) % width;
            const zOrder = cloud.layer === 'LOW' ? 9965 : (cloud.layer === 'MID' ? 9970 : 9975);
            // Render cloud glyph with transparency (undefined bg) so negative sky background flows through
            fb.setCell(cx, cy, ch, rowColor, zOrder, undefined, true);
          }
        }
      }
    }
  }
}
