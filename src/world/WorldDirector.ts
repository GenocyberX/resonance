import { SceneryObject } from '../entities/SceneryObject';
import { SeededRandom } from '../procedural/SeededRandom';
import { BiomeTransitionSystem } from './transitions/BiomeTransitionSystem';
import { RoadGenerator } from '../road/RoadGenerator';
import { SceneRegion, TerrainSurfaceType } from './types';
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

export class WorldDirector {
  private scenery: SceneryObject[] = [];
  private rng: SeededRandom;
  private biomeSystem: BiomeTransitionSystem;
  private lastGeneratedChunk: number = 0;
  public readonly chunkSize: number = 200; // Distance per scenery chunk
  private nextId: number = 1;

  // Cached SceneRegions along the longitudinal trajectory
  private regions: SceneRegion[] = [];
  private lastRegionEndZ: number = 0;

  constructor(seed: number, biomeSystem: BiomeTransitionSystem) {
    this.rng = new SeededRandom(seed);
    this.biomeSystem = biomeSystem;
    this.initRegions();
  }

  private initRegions(): void {
    this.regions = [];
    this.lastRegionEndZ = 0;
    this.ensureRegionsAhead(2500);
  }

  /**
   * Deterministically generates macro SceneRegions (600–1800m length each).
   */
  public ensureRegionsAhead(maxZ: number): void {
    const regionTypes: string[] = [
      'PALM_BOULEVARD',
      'OPEN_BEACH_VISTA',
      'BEACH_TOWN',
      'TROPICAL_COVE',
      'OPEN_BEACH_VISTA',
      'LIGHTHOUSE_POINT',
      'PALM_BOULEVARD',
      'COASTAL_RESORT',
    ];

    while (this.lastRegionEndZ < maxZ + 2000) {
      const regionIndex = this.regions.length;
      const type = regionTypes[regionIndex % regionTypes.length];
      const length = Math.round(this.rng.range(700, 1600) / 100) * 100;
      const density = type === 'OPEN_BEACH_VISTA' ? 0.75 : (type === 'BEACH_TOWN' || type === 'COASTAL_RESORT' ? 1.25 : 1.0);

      this.regions.push({
        type,
        startZ: this.lastRegionEndZ,
        length,
        density,
        variationSeed: this.rng.rangeInt(1, 999999),
      });

      this.lastRegionEndZ += length;
    }
  }

  public getRegionAtZ(z: number): SceneRegion {
    this.ensureRegionsAhead(z + 500);
    for (const region of this.regions) {
      if (z >= region.startZ && z < region.startZ + region.length) {
        return region;
      }
    }
    return this.regions[0];
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
    const recycleThreshold = cameraZ - 200;
    this.scenery = this.scenery.filter(obj => obj.z > recycleThreshold);

    // Update positions along road curvature
    for (const obj of this.scenery) {
      obj.update(0, road.getCurveAt(obj.z));
    }
  }

  /**
   * Evaluates world-space shoreline offset at longitudinal distance Z.
   */
  public getShorelineOffsetAtZ(z: number, roadHalfWidth: number = 400): number {
    const baseShoreline = roadHalfWidth + 450;
    const coastalWiggle = Math.sin(z * 0.003) * 60;
    return baseShoreline + coastalWiggle;
  }

  /**
   * Generates a coherent scenic composition using surface-aware placement and SceneRegions.
   */
  private generateChunk(chunkZ: number, road: RoadGenerator): void {
    const blendState = this.biomeSystem.evaluate(chunkZ);
    const isTropical = blendState.currentBiome.id === 'TROPICAL';

    // Canonical road dimensions
    const roadHalfWidth = road.defaultRoadWidth * 0.5; // 400
    const safetyMargin = 40;
    const minSafeOffset = roadHalfWidth + safetyMargin; // 440
    const shorelineOffset = this.getShorelineOffsetAtZ(chunkZ, roadHalfWidth);

    if (isTropical) {
      const region = this.getRegionAtZ(chunkZ);
      this.generateTropicalRegionChunk(chunkZ, road, region, minSafeOffset, shorelineOffset);
    } else {
      this.generateGenericChunk(chunkZ, road, blendState, minSafeOffset, roadHalfWidth * 2.8);
    }

    // Rare road obstacles placed using CANONICAL lane center geometry
    if (this.rng.boolean(0.05)) {
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
   * Generates tropical scenery according to the current active SceneRegion.
   */
  private generateTropicalRegionChunk(
    chunkZ: number,
    _road: RoadGenerator,
    region: SceneRegion,
    minSafeOffset: number,
    shorelineOffset: number
  ): void {
    const jitterZ = this.rng.range(-20, 20);

    switch (region.type) {
      case 'PALM_BOULEVARD': {
        // Left Inland Boulevard: tall palm + street lamp
        const leftPalmX = -this.rng.range(minSafeOffset + 20, minSafeOffset + 240);
        this.addScenery(PalmTreeSprite, chunkZ + jitterZ, leftPalmX, 'ROADSIDE');
        this.addScenery(StreetLampSprite, chunkZ + jitterZ + 70, -minSafeOffset - 15, 'ROADSIDE');

        // Right Beach Promenade: tall palm + coastal grass
        const rightPalmX = this.rng.range(minSafeOffset + 30, minSafeOffset + 220);
        this.addScenery(PalmTreeSprite, chunkZ + jitterZ + 35, rightPalmX, 'BEACH');
        this.addScenery(CoastalGrassSprite, chunkZ + jitterZ + 15, minSafeOffset + 20, 'BEACH');
        break;
      }

      case 'OPEN_BEACH_VISTA': {
        // Left: Highway direction sign or short palm
        if (this.rng.boolean(0.4)) {
          this.addScenery(DirectionSignSprite, chunkZ + jitterZ, -minSafeOffset - 25, 'ROADSIDE');
        } else {
          this.addScenery(ShortPalmSprite, chunkZ + jitterZ, -this.rng.range(minSafeOffset + 30, minSafeOffset + 250), 'INLAND');
        }

        // Right (Beach & Ocean): Lifeguard hut or pier on the shoreline + Sailboat in the water
        if (this.rng.boolean(0.55)) {
          this.addScenery(LifeguardHutSprite, chunkZ + jitterZ, this.rng.range(minSafeOffset + 60, shorelineOffset - 40), 'BEACH');
        } else {
          this.addScenery(PierSprite, chunkZ + jitterZ, shorelineOffset, 'SHORELINE');
        }

        // Distant Sailboat or Skiff strictly on WATER
        const waterX = this.rng.range(shorelineOffset + 180, shorelineOffset + 950);
        this.addScenery(SailboatSprite, chunkZ + jitterZ + 30, waterX, 'WATER');
        break;
      }

      case 'BEACH_TOWN': {
        // Left Inland Town: Coastal Diner Cafe or Hotel + Street Lamp + Bush
        if (this.rng.boolean(0.6)) {
          const cafeX = -this.rng.range(minSafeOffset + 180, minSafeOffset + 480);
          this.addScenery(RoadsideCafeSprite, chunkZ + jitterZ, cafeX, 'INLAND');
        } else {
          const billboardX = -this.rng.range(minSafeOffset + 80, minSafeOffset + 320);
          this.addScenery(BillboardSprite, chunkZ + jitterZ, billboardX, 'INLAND');
        }
        this.addScenery(StreetLampSprite, chunkZ + jitterZ - 30, -minSafeOffset - 15, 'ROADSIDE');
        this.addScenery(TropicalBushSprite, chunkZ + jitterZ + 40, -minSafeOffset - 35, 'ROADSIDE');

        // Right Beach: Short Palm + Coastal dune grass
        this.addScenery(ShortPalmSprite, chunkZ + jitterZ, this.rng.range(minSafeOffset + 20, minSafeOffset + 200), 'BEACH');
        this.addScenery(CoastalGrassSprite, chunkZ + jitterZ + 20, minSafeOffset + 15, 'BEACH');
        break;
      }

      case 'TROPICAL_COVE': {
        // Left: Deterministic Palm Cluster (Tall palm + short palm + tropical bush)
        const clusterX = -this.rng.range(minSafeOffset + 80, minSafeOffset + 350);
        this.addScenery(PalmTreeSprite, chunkZ + jitterZ, clusterX, 'INLAND');
        this.addScenery(ShortPalmSprite, chunkZ + jitterZ + 30, clusterX - 90, 'INLAND');
        this.addScenery(TropicalBushSprite, chunkZ + jitterZ + 15, clusterX + 70, 'INLAND');

        // Right: Tiki Beach Shack on the beach + Coastal palm
        const shackX = this.rng.range(minSafeOffset + 70, shorelineOffset - 60);
        this.addScenery(BeachShackSprite, chunkZ + jitterZ, shackX, 'BEACH');
        this.addScenery(PalmTreeSprite, chunkZ + jitterZ + 45, this.rng.range(minSafeOffset + 220, shorelineOffset - 30), 'BEACH');
        break;
      }

      case 'LIGHTHOUSE_POINT': {
        // Left: Palm Tree + Street Lamp
        this.addScenery(PalmTreeSprite, chunkZ + jitterZ, -this.rng.range(minSafeOffset + 40, minSafeOffset + 250), 'INLAND');

        // Right (Coastal Edge): Coastal Lighthouse Landmark + Skiff in the sea
        const lighthouseX = this.rng.range(shorelineOffset + 40, shorelineOffset + 220);
        this.addScenery(LighthouseSprite, chunkZ + jitterZ, lighthouseX, 'LANDMARK');

        const boatX = this.rng.range(shorelineOffset + 280, shorelineOffset + 850);
        this.addScenery(SmallBoatSprite, chunkZ + jitterZ + 50, boatX, 'WATER');
        this.addScenery(CoastalGrassSprite, chunkZ + jitterZ - 20, minSafeOffset + 25, 'BEACH');
        break;
      }

      case 'COASTAL_RESORT': {
        // Left: Grand Art Deco Coastal Hotel + Palm promenade
        const hotelX = -this.rng.range(minSafeOffset + 200, minSafeOffset + 500);
        this.addScenery(CoastalHotelSprite, chunkZ + jitterZ, hotelX, 'INLAND');
        this.addScenery(PalmTreeSprite, chunkZ + jitterZ + 60, -minSafeOffset - 30, 'ROADSIDE');

        // Right: Tiki Shack + Lifeguard Hut on the beach
        const shackX = this.rng.range(minSafeOffset + 60, shorelineOffset - 80);
        this.addScenery(BeachShackSprite, chunkZ + jitterZ, shackX, 'BEACH');
        this.addScenery(LifeguardHutSprite, chunkZ + jitterZ + 55, this.rng.range(minSafeOffset + 180, shorelineOffset - 40), 'BEACH');
        break;
      }
    }
  }

  private addScenery(
    sprite: typeof PalmTreeSprite,
    z: number,
    lateralOffset: number,
    _surfaceType: TerrainSurfaceType
  ): void {
    this.scenery.push(new SceneryObject(`scenery_${this.nextId++}`, sprite, z, lateralOffset, false));
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
    this.initRegions();
  }
}
