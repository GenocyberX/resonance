import { FrameBuffer } from '../../ascii/FrameBuffer';
import { SeededRandom } from '../../procedural/SeededRandom';
import {
  CloudCoverage,
  CloudLayerInstance,
  CloudPixelMask,
  WeatherType,
} from './SkyTypes';
import { CloudPixelLibrary } from './CloudPixelLibrary';

export class CloudManager {
  private rng: SeededRandom;
  private instances: CloudLayerInstance[] = [];
  private occlusionGrid: Uint8Array = new Uint8Array(0);
  private gridWidth: number = 0;
  private gridHeight: number = 0;

  // Expose CloudPixelLibrary masks as presets
  public static readonly CLOUD_PRESETS: CloudPixelMask[] = CloudPixelLibrary.MASKS;

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
        return { coverage: 'CLEAR', ratio: 0.15 };
      case 'CLOUDY':
        return { coverage: 'SCATTERED', ratio: 0.50 };
      case 'LIGHT_RAIN':
      case 'SNOW':
      case 'NEON_MIST':
        return { coverage: 'MOSTLY_CLOUDY', ratio: 0.75 };
      case 'HEAVY_RAIN':
      case 'THUNDERSTORM':
      case 'BLIZZARD':
        return { coverage: 'OVERCAST', ratio: 0.95 };
      case 'FOG':
      case 'VOLCANIC_ASH':
        return { coverage: 'MOSTLY_CLOUDY', ratio: 0.78 };
      default:
        return { coverage: 'FEW', ratio: 0.30 };
    }
  }

  public getInstances(): CloudLayerInstance[] {
    return this.instances;
  }

  /**
   * Initializes cloud compositions according to strict coverage rules and cell-based pixel art density.
   */
  public initCloudLayers(coverage: CloudCoverage, celestialAvoidHeading: number | null = null): void {
    this.instances = [];

    const smallPresets = CloudPixelLibrary.MASKS.filter(p => p.type === 'PUFF_SMALL');
    const medPresets = CloudPixelLibrary.MASKS.filter(p => p.type === 'CUMULUS_MEDIUM');
    const largePresets = CloudPixelLibrary.MASKS.filter(p => p.type === 'CUMULUS_LARGE');
    const bankPresets = CloudPixelLibrary.MASKS.filter(p => p.type === 'HORIZON_BANK');
    const stormPresets = CloudPixelLibrary.MASKS.filter(p => p.type === 'STORM_MASS');

    // Helper: Pick X coordinate with celestial avoidance in clear/few weather
    const pickX = (baseX: number, isOvercast: boolean): number => {
      let x = (baseX + this.rng.range(-0.06, 0.06) + 1.0) % 1.0;
      if (celestialAvoidHeading !== null && !isOvercast && (coverage === 'CLEAR' || coverage === 'FEW')) {
        const dist = Math.abs(x - celestialAvoidHeading);
        if (dist < 0.12) {
          x = (x + (x >= celestialAvoidHeading ? 0.16 : -0.16) + 1.0) % 1.0;
        }
      }
      return x;
    };

    switch (coverage) {
      case 'CLEAR': {
        // 1-2 small puffs
        const count = this.rng.rangeInt(1, 2);
        for (let i = 0; i < count; i++) {
          this.instances.push({
            xNorm: pickX(0.25 + i * 0.45, false),
            yNorm: this.rng.range(0.06, 0.22),
            speed: 0.0012,
            mask: this.rng.choice(smallPresets),
            layer: 'HIGH',
            alpha: 0.90,
          });
        }
        break;
      }

      case 'FEW': {
        // 2-4 clouds (1-2 small, 1-2 medium)
        const smallCount = 2;
        const medCount = this.rng.rangeInt(1, 2);

        for (let i = 0; i < smallCount; i++) {
          this.instances.push({
            xNorm: pickX(0.15 + i * 0.50, false),
            yNorm: this.rng.range(0.05, 0.16),
            speed: 0.0012,
            mask: this.rng.choice(smallPresets),
            layer: 'HIGH',
            alpha: 0.90,
          });
        }
        for (let i = 0; i < medCount; i++) {
          this.instances.push({
            xNorm: pickX(0.40 + i * 0.45, false),
            yNorm: this.rng.range(0.18, 0.35),
            speed: 0.0026,
            mask: this.rng.choice(medPresets),
            layer: 'MID',
            alpha: 1.0,
          });
        }
        break;
      }

      case 'SCATTERED': {
        // 3-6 clouds: 1 large cumulus + 2 medium cumulus + 1-2 small puffs
        this.instances.push({
          xNorm: pickX(0.60, false),
          yNorm: this.rng.range(0.14, 0.30),
          speed: 0.0040,
          mask: this.rng.choice(largePresets),
          layer: 'LOW',
          alpha: 1.0,
        });

        for (let i = 0; i < 2; i++) {
          this.instances.push({
            xNorm: pickX(0.15 + i * 0.50, false),
            yNorm: this.rng.range(0.16, 0.36),
            speed: 0.0025,
            mask: this.rng.choice(medPresets),
            layer: 'MID',
            alpha: 1.0,
          });
        }

        for (let i = 0; i < 2; i++) {
          this.instances.push({
            xNorm: pickX(0.35 + i * 0.45, false),
            yNorm: this.rng.range(0.04, 0.18),
            speed: 0.0012,
            mask: this.rng.choice(smallPresets),
            layer: 'HIGH',
            alpha: 0.90,
          });
        }
        break;
      }

      case 'MOSTLY_CLOUDY': {
        // 6-8 clouds: 2 large cumulus + 1-2 horizon banks + 2 medium cumulus + 2 small puffs (60-80% sky covered)
        for (let i = 0; i < 2; i++) {
          this.instances.push({
            xNorm: pickX(0.10 + i * 0.55, false),
            yNorm: this.rng.range(0.16, 0.35),
            speed: 0.0045,
            mask: this.rng.choice(largePresets),
            layer: 'LOW',
            alpha: 1.0,
          });
        }

        this.instances.push({
          xNorm: pickX(0.40, false),
          yNorm: this.rng.range(0.32, 0.48),
          speed: 0.0035,
          mask: this.rng.choice(bankPresets),
          layer: 'LOW',
          alpha: 1.0,
        });

        for (let i = 0; i < 2; i++) {
          this.instances.push({
            xNorm: pickX(0.25 + i * 0.50, false),
            yNorm: this.rng.range(0.12, 0.28),
            speed: 0.0026,
            mask: this.rng.choice(medPresets),
            layer: 'MID',
            alpha: 1.0,
          });
        }

        for (let i = 0; i < 2; i++) {
          this.instances.push({
            xNorm: pickX(0.05 + i * 0.50, false),
            yNorm: this.rng.range(0.04, 0.16),
            speed: 0.0012,
            mask: this.rng.choice(smallPresets),
            layer: 'HIGH',
            alpha: 0.90,
          });
        }
        break;
      }

      case 'OVERCAST': {
        // 8-12 connected storm masses + horizon banks spanning the sky (85-100% covered)
        for (let i = 0; i < 3; i++) {
          this.instances.push({
            xNorm: pickX(i / 3.0, true),
            yNorm: this.rng.range(0.06, 0.28),
            speed: 0.0035,
            mask: this.rng.choice(stormPresets),
            layer: 'LOW',
            alpha: 1.0,
          });
        }

        for (let i = 0; i < 3; i++) {
          this.instances.push({
            xNorm: pickX((i + 0.5) / 3.0, true),
            yNorm: this.rng.range(0.22, 0.48),
            speed: 0.0040,
            mask: this.rng.choice(bankPresets),
            layer: 'LOW',
            alpha: 1.0,
          });
        }

        for (let i = 0; i < 3; i++) {
          this.instances.push({
            xNorm: pickX(i / 3.0, true),
            yNorm: this.rng.range(0.02, 0.18),
            speed: 0.0020,
            mask: this.rng.choice(medPresets),
            layer: 'MID',
            alpha: 1.0,
          });
        }
        break;
      }
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
      const matrix = cloud.mask.matrix;

      for (let r = 0; r < matrix.length; r++) {
        const row = matrix[r];
        const cy = startY + r;
        if (cy < 0 || cy >= horizonRow) continue;

        for (let c = 0; c < row.length; c++) {
          if (row[c] > 0) {
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
   * Renders all cloud layers as true cell-based pixel art masses using solid cell backgrounds.
   */
  public renderClouds(
    fb: FrameBuffer,
    width: number,
    horizonRow: number,
    cloudHighlightColor: string,
    cloudBodyColor: string,
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
      const matrix = cloud.mask.matrix;
      const totalRows = matrix.length;

      for (let r = 0; r < totalRows; r++) {
        const row = matrix[r];
        const cy = startY + r;
        if (cy < 0 || cy >= horizonRow) continue;

        for (let c = 0; c < row.length; c++) {
          const val = row[c];
          if (val > 0) {
            const cx = (startX + c + width) % width;
            const zOrder = cloud.layer === 'LOW' ? 9965 : (cloud.layer === 'MID' ? 9970 : 9975);

            // 3-Tone Solid Pixel Fill (3 = Highlight, 2 = Body, 1 = Shadow)
            let cellBg = cloudBodyColor;
            if (val === 3) {
              cellBg = cloudHighlightColor;
            } else if (val === 1) {
              cellBg = cloudShadowColor;
            }

            // Cell is the pixel: char is ' ', bg is the solid pixel color
            fb.setCell(cx, cy, ' ', cellBg, zOrder, cellBg, true);
          }
        }
      }
    }
  }
}
