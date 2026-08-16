import { SceneryObject } from '../entities/SceneryObject';
import { SeededRandom } from '../procedural/SeededRandom';
import { BiomeTransitionSystem } from './transitions/BiomeTransitionSystem';
import { RoadGenerator } from '../road/RoadGenerator';
import { PalmTreeSprite } from '../sprites/scenery/PalmTreeSprite';
import { ShortPalmSprite } from '../sprites/scenery/ShortPalmSprite';
import { TropicalBushSprite } from '../sprites/scenery/TropicalBushSprite';
import { CoastalGrassSprite } from '../sprites/scenery/CoastalGrassSprite';
import { BeachShackSprite } from '../sprites/scenery/BeachShackSprite';
import { RoadsideCafeSprite } from '../sprites/scenery/RoadsideCafeSprite';
import { CoastalHotelSprite } from '../sprites/scenery/CoastalHotelSprite';
import { LifeguardHutSprite } from '../sprites/scenery/LifeguardHutSprite';
import { PierSprite } from '../sprites/scenery/PierSprite';
import { SailboatSprite } from '../sprites/scenery/SailboatSprite';
import { SmallBoatSprite } from '../sprites/scenery/SmallBoatSprite';
import { LighthouseSprite } from '../sprites/scenery/LighthouseSprite';
import { BillboardSprite } from '../sprites/scenery/BillboardSprite';
import { DirectionSignSprite } from '../sprites/scenery/DirectionSignSprite';
import { StreetLampSprite } from '../sprites/scenery/StreetLampSprite';

export type SceneVignette =
  | 'PALM_BOULEVARD'
  | 'OPEN_BEACH_VISTA'
  | 'BEACH_TOWN'
  | 'TROPICAL_COVE'
  | 'LIGHTHOUSE_POINT'
  | 'COASTAL_RESORT';

export class WorldDirector {
  private scenery: SceneryObject[] = [];
  private rng: SeededRandom;
  private biomeSystem: BiomeTransitionSystem;
  private lastGeneratedChunk: number = 0;
  public readonly chunkSize: number = 190; // Distance per scenery chunk
  private nextId: number = 1;

  constructor(seed: number, biomeSystem: BiomeTransitionSystem) {
    this.rng = new SeededRandom(seed);
    this.biomeSystem = biomeSystem;
  }

  public getScenery(): SceneryObject[] {
    return this.scenery;
  }

  public update(
    cameraZ: number,
    road: RoadGenerator,
    drawDistance: number = 1200
  ): void {
    const currentChunk = Math.floor((cameraZ + drawDistance) / this.chunkSize);

    // Generate new chunks ahead
    while (this.lastGeneratedChunk < currentChunk) {
      this.lastGeneratedChunk++;
      const chunkZ = this.lastGeneratedChunk * this.chunkSize;
      this.generateChunk(chunkZ, road);
    }

    // Recycle scenery far behind the camera
    const recycleThreshold = cameraZ - 180;
    this.scenery = this.scenery.filter(obj => obj.z > recycleThreshold);

    // Update positions along road curvature
    for (const obj of this.scenery) {
      obj.update(0, road.getCurveAt(obj.z));
    }
  }

  /**
   * Generates a coherent scenic composition using systematic placement zones and scene grammar.
   */
  private generateChunk(chunkZ: number, road: RoadGenerator): void {
    const blendState = this.biomeSystem.evaluate(chunkZ);
    const isTropical = blendState.currentBiome.id === 'TROPICAL';

    // Canonical road dimensions
    const roadHalfWidth = road.defaultRoadWidth * 0.5; // 400
    const safetyMargin = 40;

    // Scenery Placement Zones (world units from road center)
    const nearMin = roadHalfWidth + safetyMargin; // 440
    const nearMax = roadHalfWidth * 1.75;         // 700
    const midMin = nearMax;                       // 700
    const midMax = roadHalfWidth * 2.8;           // 1120
    const farMin = midMax;                        // 1120
    const farMax = roadHalfWidth * 4.5;           // 1800

    if (isTropical) {
      this.generateTropicalVignette(chunkZ, road, nearMin, nearMax, midMin, midMax, farMin, farMax);
    } else {
      this.generateGenericChunk(chunkZ, road, blendState, nearMin, midMax);
    }

    // Rare road obstacles placed using CANONICAL lane center geometry
    if (this.rng.boolean(0.06)) {
      const obstacleSprite = this.biomeSystem.sampleObstacleSprite(blendState, this.rng);
      if (obstacleSprite) {
        const lane = this.rng.choice([-1, 0, 1]);
        const laneCenter = road.getLaneCenterOffset(lane);
        const z = chunkZ + this.rng.range(-20, 20);
        this.scenery.push(new SceneryObject(`obstacle_${this.nextId++}`, obstacleSprite, z, laneCenter, true));
      }
    }
  }

  /**
   * Tropical Coastline Designed Scene Vignettes (Rhythmic Scene Grammar).
   */
  private generateTropicalVignette(
    chunkZ: number,
    _road: RoadGenerator,
    nearMin: number,
    nearMax: number,
    midMin: number,
    midMax: number,
    farMin: number,
    farMax: number
  ): void {
    const chunkIndex = Math.floor(chunkZ / this.chunkSize);
    const vignettes: SceneVignette[] = [
      'PALM_BOULEVARD',
      'OPEN_BEACH_VISTA',
      'BEACH_TOWN',
      'TROPICAL_COVE',
      'LIGHTHOUSE_POINT',
      'COASTAL_RESORT',
    ];

    const vignette = vignettes[Math.abs(chunkIndex) % vignettes.length];
    const jitterZ = this.rng.range(-25, 25);

    switch (vignette) {
      case 'PALM_BOULEVARD': {
        // Left side: tall palm + street lamp
        const leftPalmOffset = -this.rng.range(nearMin, nearMax);
        this.scenery.push(new SceneryObject(`palm_l_${this.nextId++}`, PalmTreeSprite, chunkZ + jitterZ, leftPalmOffset, false));
        this.scenery.push(new SceneryObject(`lamp_l_${this.nextId++}`, StreetLampSprite, chunkZ + jitterZ + 60, -nearMin - 15, false));

        // Right side (Ocean promenade): palm + coastal grass
        const rightPalmOffset = this.rng.range(nearMin, nearMax);
        this.scenery.push(new SceneryObject(`palm_r_${this.nextId++}`, PalmTreeSprite, chunkZ + jitterZ + 30, rightPalmOffset, false));
        this.scenery.push(new SceneryObject(`grass_r_${this.nextId++}`, CoastalGrassSprite, chunkZ + jitterZ + 15, nearMin + 25, false));
        break;
      }

      case 'OPEN_BEACH_VISTA': {
        // Left side: highway direction sign + short palm
        this.scenery.push(new SceneryObject(`sign_${this.nextId++}`, DirectionSignSprite, chunkZ + jitterZ, -nearMin - 20, false));
        this.scenery.push(new SceneryObject(`spalm_${this.nextId++}`, ShortPalmSprite, chunkZ + jitterZ + 40, -this.rng.range(nearMin, midMin), false));

        // Right side (Open Ocean): pier / lifeguard hut + distant sailboat
        if (this.rng.boolean(0.6)) {
          this.scenery.push(new SceneryObject(`hut_${this.nextId++}`, LifeguardHutSprite, chunkZ + jitterZ, this.rng.range(nearMin + 40, midMin), false));
        } else {
          this.scenery.push(new SceneryObject(`pier_${this.nextId++}`, PierSprite, chunkZ + jitterZ, this.rng.range(midMin, midMax), false));
        }
        // Distant sailboat on the ocean horizon
        const boatOffset = this.rng.range(farMin, farMax);
        this.scenery.push(new SceneryObject(`boat_${this.nextId++}`, SailboatSprite, chunkZ + jitterZ + 20, boatOffset, false));
        break;
      }

      case 'BEACH_TOWN': {
        // Left side (Town): Coastal Diner Cafe or Billboard + Street Lamp + Bush
        if (this.rng.boolean(0.6)) {
          this.scenery.push(new SceneryObject(`cafe_${this.nextId++}`, RoadsideCafeSprite, chunkZ + jitterZ, -this.rng.range(midMin, midMax), false));
        } else {
          this.scenery.push(new SceneryObject(`billboard_${this.nextId++}`, BillboardSprite, chunkZ + jitterZ, -this.rng.range(nearMin + 30, midMin), false));
        }
        this.scenery.push(new SceneryObject(`lamp_${this.nextId++}`, StreetLampSprite, chunkZ + jitterZ - 30, -nearMin - 15, false));
        this.scenery.push(new SceneryObject(`bush_${this.nextId++}`, TropicalBushSprite, chunkZ + jitterZ + 35, -nearMin - 40, false));

        // Right side (Beach): Short Palm + Coastal grass
        this.scenery.push(new SceneryObject(`spalm_r_${this.nextId++}`, ShortPalmSprite, chunkZ + jitterZ, this.rng.range(nearMin, nearMax), false));
        this.scenery.push(new SceneryObject(`grass_r_${this.nextId++}`, CoastalGrassSprite, chunkZ + jitterZ + 20, nearMin + 20, false));
        break;
      }

      case 'TROPICAL_COVE': {
        // Deterministic Palm Cluster on left: main palm + small palm + bush
        const clusterX = -this.rng.range(nearMin + 40, midMin);
        this.scenery.push(new SceneryObject(`palm_${this.nextId++}`, PalmTreeSprite, chunkZ + jitterZ, clusterX, false));
        this.scenery.push(new SceneryObject(`spalm_${this.nextId++}`, ShortPalmSprite, chunkZ + jitterZ + 25, clusterX - 80, false));
        this.scenery.push(new SceneryObject(`bush_${this.nextId++}`, TropicalBushSprite, chunkZ + jitterZ + 15, clusterX + 60, false));

        // Right side (Beach shack / tiki bar)
        this.scenery.push(new SceneryObject(`shack_${this.nextId++}`, BeachShackSprite, chunkZ + jitterZ, this.rng.range(nearMin + 50, midMin), false));
        this.scenery.push(new SceneryObject(`palm_r_${this.nextId++}`, PalmTreeSprite, chunkZ + jitterZ + 45, this.rng.range(midMin, midMax), false));
        break;
      }

      case 'LIGHTHOUSE_POINT': {
        // Left side: tall palm + street lamp
        this.scenery.push(new SceneryObject(`palm_l_${this.nextId++}`, PalmTreeSprite, chunkZ + jitterZ, -this.rng.range(nearMin, nearMax), false));

        // Right side: Coastal Lighthouse Landmark on ocean edge + small skiff boat
        this.scenery.push(new SceneryObject(`lighthouse_${this.nextId++}`, LighthouseSprite, chunkZ + jitterZ, this.rng.range(midMin + 60, midMax), false));
        this.scenery.push(new SceneryObject(`skiff_${this.nextId++}`, SmallBoatSprite, chunkZ + jitterZ + 50, this.rng.range(farMin, farMax), false));
        this.scenery.push(new SceneryObject(`grass_${this.nextId++}`, CoastalGrassSprite, chunkZ + jitterZ - 20, nearMin + 30, false));
        break;
      }

      case 'COASTAL_RESORT': {
        // Left side: Grand Art Deco Coastal Hotel + Billboard + Palm promenade
        this.scenery.push(new SceneryObject(`hotel_${this.nextId++}`, CoastalHotelSprite, chunkZ + jitterZ, -this.rng.range(midMin, midMax), false));
        this.scenery.push(new SceneryObject(`palm_l_${this.nextId++}`, PalmTreeSprite, chunkZ + jitterZ + 60, -nearMin - 30, false));

        // Right side: Tiki Shack + Palm + Lifeguard Hut
        this.scenery.push(new SceneryObject(`shack_${this.nextId++}`, BeachShackSprite, chunkZ + jitterZ, this.rng.range(nearMin + 60, midMin), false));
        this.scenery.push(new SceneryObject(`hut_${this.nextId++}`, LifeguardHutSprite, chunkZ + jitterZ + 50, this.rng.range(midMin, midMax), false));
        break;
      }
    }
  }

  private generateGenericChunk(
    chunkZ: number,
    _road: RoadGenerator,
    blendState: ReturnType<BiomeTransitionSystem['evaluate']>,
    nearMin: number,
    midMax: number
  ): void {
    const density = (blendState.currentBiome.density * (1 - blendState.transitionProgress)) +
                    (blendState.nextBiome.density * blendState.transitionProgress);

    // Left side scenery
    if (this.rng.next() < 0.65 * density) {
      const sprite = this.biomeSystem.sampleScenerySprite(blendState, this.rng);
      if (sprite) {
        const offset = -this.rng.range(nearMin, midMax);
        const z = chunkZ + this.rng.range(-30, 30);
        this.scenery.push(new SceneryObject(`scenery_${this.nextId++}`, sprite, z, offset, false));
      }
    }

    // Right side scenery
    if (this.rng.next() < 0.65 * density) {
      const sprite = this.biomeSystem.sampleScenerySprite(blendState, this.rng);
      if (sprite) {
        const offset = this.rng.range(nearMin, midMax);
        const z = chunkZ + this.rng.range(-30, 30);
        this.scenery.push(new SceneryObject(`scenery_${this.nextId++}`, sprite, z, offset, false));
      }
    }
  }

  public reset(seed: number): void {
    this.rng.reseed(seed);
    this.scenery = [];
    this.lastGeneratedChunk = 0;
  }
}
