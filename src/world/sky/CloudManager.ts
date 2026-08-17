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

  // Handcrafted Organic ASCII Cloud Formations with Soft Internal Texture across 7 Families
  public static readonly CLOUD_PRESETS: CloudFormation[] = [
    // 1. SMALL (3 Variants) - 10 to 14 chars wide, 3 lines
    {
      id: 'small_1',
      type: 'SMALL',
      width: 10,
      height: 3,
      lines: [
        '  .---.   ',
        '.-( : )-. ',
        '(_______) ',
      ],
    },
    {
      id: 'small_2',
      type: 'SMALL',
      width: 12,
      height: 3,
      lines: [
        '   .----.   ',
        ' .-( .. )-. ',
        '(__________)',
      ],
    },
    {
      id: 'small_3',
      type: 'SMALL',
      width: 14,
      height: 3,
      lines: [
        '  .--.  .--.  ',
        '.-(  :..:  )-.',
        '(____________)',
      ],
    },

    // 2. MEDIUM (3 Variants) - 16 to 20 chars wide, 4 lines
    {
      id: 'med_1',
      type: 'MEDIUM',
      width: 16,
      height: 4,
      lines: [
        '     .----.     ',
        '  .-/  ..  \\-.  ',
        ' (   :....:   ) ',
        '(______________) ',
      ],
    },
    {
      id: 'med_2',
      type: 'MEDIUM',
      width: 18,
      height: 4,
      lines: [
        '    .------.      ',
        " .-'   ::   '-.   ",
        '(   :......:   )  ',
        ' (____________)   ',
      ],
    },
    {
      id: 'med_3',
      type: 'MEDIUM',
      width: 18,
      height: 4,
      lines: [
        '   .---.  .---.   ',
        " .-' .  ''  . '-. ",
        '(   :........:   )',
        ' (______________) ',
      ],
    },

    // 3. WIDE (3 Variants) - 24 to 28 chars wide, 3 lines
    {
      id: 'wide_1',
      type: 'WIDE',
      width: 24,
      height: 3,
      lines: [
        '   .~~--......--~~.     ',
        ' .-(   :......:   )-.   ',
        '(____________________)  ',
      ],
    },
    {
      id: 'wide_2',
      type: 'WIDE',
      width: 28,
      height: 3,
      lines: [
        '  .~~~~---........---~~~~.  ',
        ' (     :............:     ) ',
        '(__________________________)',
      ],
    },
    {
      id: 'wide_3',
      type: 'WIDE',
      width: 26,
      height: 3,
      lines: [
        '   .---.            .---.   ',
        " .-(   '--........--'   )-. ",
        '(__________________________)',
      ],
    },

    // 4. DENSE (3 Variants) - 24 to 28 chars wide, 5 lines
    {
      id: 'dense_1',
      type: 'DENSE',
      width: 24,
      height: 5,
      lines: [
        '       .------.         ',
        '    .-/   ..   \\-.      ',
        "  .-'   :....:   '-.    ",
        ' (   :..........:   )   ',
        '(____________________)  ',
      ],
    },
    {
      id: 'dense_2',
      type: 'DENSE',
      width: 28,
      height: 5,
      lines: [
        '       .----.    .----.     ',
        '    .-/  ..  \\--/  ..  \\-.  ',
        "  .-'   :............:   '-.",
        ' (   :..................:   )',
        '(____________________________)',
      ],
    },
    {
      id: 'dense_3',
      type: 'DENSE',
      width: 26,
      height: 5,
      lines: [
        '      .--------.        ',
        "   .-'   ....   '-.     ",
        " .-'   :......:   '-.   ",
        '(   :............:   )  ',
        '(____________________)  ',
      ],
    },

    // 5. STORM_HEAVY (3 Variants) - 30 to 34 chars wide, 6 lines
    {
      id: 'storm_heavy_1',
      type: 'STORM_HEAVY',
      width: 30,
      height: 6,
      lines: [
        '        .------------.        ',
        '     .-/   :......:   \\-.     ',
        "   .-'   :..........:   '-.   ",
        '  /   :................:   \\  ',
        ' |   :..................:   | ',
        '  \\________________________/  ',
      ],
    },
    {
      id: 'storm_heavy_2',
      type: 'STORM_HEAVY',
      width: 32,
      height: 6,
      lines: [
        '      .----------.    .----.    ',
        '   .-/   :....:   \\--/  ..  \\-. ',
        " .-'   :..................:   '-.",
        '(   :........................:   )',
        '|   :........................:   |',
        ' \\______________________________/ ',
      ],
    },
    {
      id: 'storm_heavy_3',
      type: 'STORM_HEAVY',
      width: 30,
      height: 6,
      lines: [
        '       .----------------.     ',
        '    .-/   :..........:   \\-.  ',
        "  .-'   :..............:   '-.",
        ' (   :....................:   )',
        ' |   :....................:   |',
        '  \\__________________________/ ',
      ],
    },

    // 6. HIGH_CIRRUS (3 Variants) - 14 to 18 chars wide, 1 line
    {
      id: 'high_cirrus_1',
      type: 'HIGH_CIRRUS',
      width: 16,
      height: 1,
      lines: [
        '---...    ...---',
      ],
    },
    {
      id: 'high_cirrus_2',
      type: 'HIGH_CIRRUS',
      width: 18,
      height: 1,
      lines: [
        '   ...-------...  ',
      ],
    },
    {
      id: 'high_cirrus_3',
      type: 'HIGH_CIRRUS',
      width: 16,
      height: 1,
      lines: [
        '--.   .---.   .--',
      ],
    },

    // 7. OVERCAST_CANOPY (3 Variants) - 36 to 40 chars wide, 3 lines
    {
      id: 'overcast_1',
      type: 'OVERCAST_CANOPY',
      width: 38,
      height: 3,
      lines: [
        '.~~~~~~-------..........-------~~~~~~.',
        '(     :........................:     )',
        '(____________________________________)',
      ],
    },
    {
      id: 'overcast_2',
      type: 'OVERCAST_CANOPY',
      width: 38,
      height: 3,
      lines: [
        '.~~~~~---....................---~~~~~.',
        '(    :..........................:    )',
        '(____________________________________)',
      ],
    },
    {
      id: 'overcast_3',
      type: 'OVERCAST_CANOPY',
      width: 38,
      height: 3,
      lines: [
        '.~~~~---------..........---------~~~~.',
        '(    :..........................:    )',
        '(____________________________________)',
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
        return { coverage: 'CLEAR', ratio: 0.12 };
      case 'CLOUDY':
        return { coverage: 'SCATTERED', ratio: 0.48 };
      case 'LIGHT_RAIN':
      case 'SNOW':
      case 'NEON_MIST':
        return { coverage: 'MOSTLY_CLOUDY', ratio: 0.72 };
      case 'HEAVY_RAIN':
      case 'THUNDERSTORM':
      case 'BLIZZARD':
        return { coverage: 'OVERCAST', ratio: 0.94 };
      case 'FOG':
      case 'VOLCANIC_ASH':
        return { coverage: 'MOSTLY_CLOUDY', ratio: 0.75 };
      default:
        return { coverage: 'FEW', ratio: 0.28 };
    }
  }

  public getInstances(): CloudLayerInstance[] {
    return this.instances;
  }

  /**
   * Initializes or reconfigures cloud instances across parallax layers for vibrant, living skies.
   */
  public initCloudLayers(coverage: CloudCoverage, celestialAvoidHeading: number | null = null): void {
    this.instances = [];

    // Filter presets by family
    const smallPresets = CloudManager.CLOUD_PRESETS.filter(p => p.type === 'SMALL' || p.type === 'HIGH_CIRRUS');
    const medWidePresets = CloudManager.CLOUD_PRESETS.filter(p => p.type === 'MEDIUM' || p.type === 'WIDE');
    const denseStormPresets = CloudManager.CLOUD_PRESETS.filter(p => p.type === 'DENSE' || p.type === 'STORM_HEAVY' || p.type === 'OVERCAST_CANOPY');

    // Rich instance count distribution
    let highCount = 0;
    let midCount = 0;
    let lowCount = 0;

    switch (coverage) {
      case 'CLEAR':
        highCount = 1;
        midCount = 1;
        lowCount = 0;
        break;
      case 'FEW':
        highCount = 2;
        midCount = 2;
        lowCount = 0;
        break;
      case 'SCATTERED':
        highCount = 2;
        midCount = 3;
        lowCount = 2;
        break;
      case 'MOSTLY_CLOUDY':
        highCount = 3;
        midCount = 4;
        lowCount = 3;
        break;
      case 'OVERCAST':
        highCount = 4;
        midCount = 5;
        lowCount = 5;
        break;
    }

    // Helper: Select xNorm with optional gentle celestial buffer in clear weather
    const pickX = (baseX: number, isOvercast: boolean): number => {
      let x = (baseX + this.rng.range(-0.06, 0.06) + 1.0) % 1.0;
      if (celestialAvoidHeading !== null && !isOvercast && (coverage === 'CLEAR' || coverage === 'FEW')) {
        const dist = Math.abs(x - celestialAvoidHeading);
        if (dist < 0.12) {
          x = (x + (x >= celestialAvoidHeading ? 0.15 : -0.15) + 1.0) % 1.0;
        }
      }
      return x;
    };

    // Layer 1: HIGH Parallax Layer (Cirrus & Small Puffs, High Altitude)
    for (let i = 0; i < highCount; i++) {
      const formation = this.rng.choice(smallPresets);
      this.instances.push({
        xNorm: pickX((i + 0.3) / Math.max(1, highCount), coverage === 'OVERCAST'),
        yNorm: this.rng.range(0.04, 0.18),
        speed: 0.0012,
        formation,
        layer: 'HIGH',
        alpha: 0.75,
      });
    }

    // Layer 2: MID Parallax Layer (Medium Cumulus & Wide Stratus, Mid Altitude)
    for (let i = 0; i < midCount; i++) {
      const formation = this.rng.choice(medWidePresets);
      this.instances.push({
        xNorm: pickX((i + 0.15) / Math.max(1, midCount), coverage === 'OVERCAST'),
        yNorm: this.rng.range(0.16, 0.38),
        speed: 0.0028,
        formation,
        layer: 'MID',
        alpha: 0.90,
      });
    }

    // Layer 3: LOW Parallax Layer (Dense Masses, Storm Clouds, Overcast Canopy)
    for (let i = 0; i < lowCount; i++) {
      const formation = this.rng.choice(denseStormPresets);
      this.instances.push({
        xNorm: pickX((i + 0.5) / Math.max(1, lowCount), coverage === 'OVERCAST'),
        yNorm: this.rng.range(0.28, 0.55),
        speed: 0.0048,
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
    const windSpeedBonus = windStrength * 0.0012;
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
   * Renders all cloud layers with highlight crowns, soft textured bodies, and shadow underbellies.
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

        // Top line receives clean highlight; bottom lines receive soft shadow contour; middle lines receive body tone
        const isTop = r === 0;
        const isBottom = r === lines.length - 1 && lines.length > 2;
        const rowColor = isBottom
          ? cloudShadowColor
          : (isTop ? cloudHighlightColor : ColorPalette.lerp(cloudHighlightColor, cloudShadowColor, 0.40));

        for (let c = 0; c < line.length; c++) {
          const ch = line[c];
          if (ch !== ' ') {
            const cx = (startX + c + width) % width;
            const zOrder = cloud.layer === 'LOW' ? 9965 : (cloud.layer === 'MID' ? 9970 : 9975);

            // Internal textured characters (. or :) use slightly softer body tint
            const isInternalTexture = ch === '.' || ch === ':' || ch === '~';
            const charColor = isInternalTexture
              ? ColorPalette.lerp(rowColor, cloudShadowColor, 0.30)
              : rowColor;

            fb.setCell(cx, cy, ch, charColor, zOrder, undefined, true);
          }
        }
      }
    }
  }
}
