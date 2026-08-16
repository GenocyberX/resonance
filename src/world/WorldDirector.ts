import { SceneryObject } from '../entities/SceneryObject';
import { SeededRandom } from '../procedural/SeededRandom';
import { BiomeTransitionSystem } from './transitions/BiomeTransitionSystem';
import { RoadGenerator } from '../road/RoadGenerator';
import { SceneRegion, TerrainSurfaceType } from './types';
import { SpriteDefinition } from '../ascii/types';

// Tropical Hero & Supporting
import { PalmTreeSprite } from '../sprites/scenery/PalmTreeSprite';
import { LeanPalmSprite } from '../sprites/scenery/LeanPalmSprite';
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
import { OceanBuoySprite } from '../sprites/scenery/OceanBuoySprite';
import { CoastalRockSprite } from '../sprites/scenery/CoastalRockSprite';
import { LighthouseSprite } from '../sprites/scenery/LighthouseSprite';

// Canyon / Desert
import { CactusSprite } from '../sprites/scenery/CactusSprite';
import { GiantCactusSprite } from '../sprites/scenery/GiantCactusSprite';
import { JoshuaTreeSprite } from '../sprites/scenery/JoshuaTreeSprite';
import { DeadTreeSprite } from '../sprites/scenery/DeadTreeSprite';
import { CanyonMesaSprite } from '../sprites/scenery/CanyonMesaSprite';
import { CanyonButteSprite } from '../sprites/scenery/CanyonButteSprite';
import { CanyonArchSprite } from '../sprites/scenery/CanyonArchSprite';
import { DesertDuneSprite } from '../sprites/scenery/DesertDuneSprite';

// Forest
import { PineTreeSprite } from '../sprites/scenery/PineTreeSprite';
import { TallPineSprite } from '../sprites/scenery/TallPineSprite';
import { DeciduousTreeSprite } from '../sprites/scenery/DeciduousTreeSprite';
import { ForestFernSprite } from '../sprites/scenery/ForestFernSprite';
import { WildflowerPatchSprite } from '../sprites/scenery/WildflowerPatchSprite';
import { FallenLogSprite } from '../sprites/scenery/FallenLogSprite';

// Alpine
import { SnowPineSprite } from '../sprites/scenery/SnowPineSprite';
import { DenseSnowPineSprite } from '../sprites/scenery/DenseSnowPineSprite';
import { AlpineShrubSprite } from '../sprites/scenery/AlpineShrubSprite';
import { AlpinePeakSprite } from '../sprites/scenery/AlpinePeakSprite';
import { MountainCabinSprite } from '../sprites/scenery/MountainCabinSprite';
import { IceSpireSprite } from '../sprites/scenery/IceSpireSprite';

// Cyber
import { NeonTowerSprite } from '../sprites/scenery/NeonTowerSprite';
import { CyberSpireSprite } from '../sprites/scenery/CyberSpireSprite';
import { CyberGridBuildingSprite } from '../sprites/scenery/CyberGridBuildingSprite';
import { HoloAdTotemSprite } from '../sprites/scenery/HoloAdTotemSprite';
import { CyberGantrySprite } from '../sprites/scenery/CyberGantrySprite';
import { CyberStreetLampSprite } from '../sprites/scenery/CyberStreetLampSprite';

// Volcanic
import { VolcanicVentSprite } from '../sprites/scenery/VolcanicVentSprite';
import { BasaltCragSprite } from '../sprites/scenery/BasaltCragSprite';

// Geology & Roadside Everywhere
import { BoulderClusterSprite } from '../sprites/scenery/BoulderClusterSprite';
import { BillboardSprite } from '../sprites/scenery/BillboardSprite';
import { DirectionSignSprite } from '../sprites/scenery/DirectionSignSprite';
import { WarningSignSprite } from '../sprites/scenery/WarningSignSprite';
import { StreetLampSprite } from '../sprites/scenery/StreetLampSprite';
import { HighwayMileMarkerSprite } from '../sprites/scenery/HighwayMileMarkerSprite';
import { GuardrailSprite } from '../sprites/scenery/GuardrailSprite';

export type SceneRhythmState = 'OPEN' | 'NORMAL' | 'DENSE' | 'LANDMARK';

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

  // Anti-repetition spawn history
  private recentLeftSpawns: string[] = [];
  private recentRightSpawns: string[] = [];
  private readonly maxHistorySize: number = 6;

  // Hero object cooldown & count limits
  private lastHeroSpawnZ: number = -9999;
  public readonly minHeroDistance: number = 700;

  constructor(seed: number, biomeSystem: BiomeTransitionSystem) {
    this.rng = new SeededRandom(seed);
    this.biomeSystem = biomeSystem;
    this.initRegions();
  }

  private initRegions(): void {
    this.regions = [];
    this.lastRegionEndZ = 0;
    this.recentLeftSpawns = [];
    this.recentRightSpawns = [];
    this.lastHeroSpawnZ = -9999;
    this.ensureRegionsAhead(2500);
  }

  /**
   * Evaluates macro scene rhythm state based on distance Z.
   */
  public getSceneRhythmAtZ(z: number): SceneRhythmState {
    const cyclePos = (Math.abs(Math.floor(z / 400))) % 4;
    switch (cyclePos) {
      case 0: return 'OPEN';
      case 1: return 'NORMAL';
      case 2: return 'DENSE';
      case 3: return 'LANDMARK';
      default: return 'NORMAL';
    }
  }

  /**
   * Checks if a hero landmark object is eligible to spawn at Z distance.
   */
  public canSpawnHero(z: number): boolean {
    return (z - this.lastHeroSpawnZ) >= this.minHeroDistance;
  }

  /**
   * Registers a hero landmark spawn at Z distance.
   */
  public recordHeroSpawn(z: number): void {
    this.lastHeroSpawnZ = z;
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
   * Selects a sprite variant from a list while respecting recent spawn history.
   */
  public selectWithAntiRepetition(
    candidates: SpriteDefinition[],
    side: 'left' | 'right'
  ): SpriteDefinition {
    if (candidates.length === 1) {
      return candidates[0];
    }
    const history = side === 'left' ? this.recentLeftSpawns : this.recentRightSpawns;

    // Filter candidates not recently used in immediate history
    const fresh = candidates.filter(c => !history.slice(-3).includes(c.id));
    const pool = fresh.length > 0 ? fresh : candidates;
    return this.rng.choice(pool);
  }

  private recordSpawn(spriteId: string, side: 'left' | 'right'): void {
    const history = side === 'left' ? this.recentLeftSpawns : this.recentRightSpawns;
    history.push(spriteId);
    if (history.length > this.maxHistorySize) {
      history.shift();
    }
  }

  /**
   * Generates a coherent scenic composition using surface-aware placement, SceneRegions and rhythm.
   */
  private generateChunk(chunkZ: number, road: RoadGenerator): void {
    const blendState = this.biomeSystem.evaluate(chunkZ);
    const biomeId = blendState.currentBiome.id;

    // Canonical road dimensions
    const roadHalfWidth = road.defaultRoadWidth * 0.5; // 400
    const safetyMargin = 40;
    const minSafeOffset = roadHalfWidth + safetyMargin; // 440
    const shorelineOffset = this.getShorelineOffsetAtZ(chunkZ, roadHalfWidth);

    switch (biomeId) {
      case 'TROPICAL': {
        const region = this.getRegionAtZ(chunkZ);
        this.generateTropicalRegionChunk(chunkZ, road, region, minSafeOffset, shorelineOffset);
        break;
      }
      case 'DESERT': {
        this.generateDesertChunk(chunkZ, minSafeOffset);
        break;
      }
      case 'FOREST': {
        this.generateForestChunk(chunkZ, minSafeOffset);
        break;
      }
      case 'ALPINE': {
        this.generateAlpineChunk(chunkZ, minSafeOffset);
        break;
      }
      case 'NEON_CITY': {
        this.generateNeonCityChunk(chunkZ, minSafeOffset);
        break;
      }
      case 'VOLCANIC': {
        this.generateVolcanicChunk(chunkZ, minSafeOffset);
        break;
      }
      default: {
        this.generateGenericChunk(chunkZ, blendState, minSafeOffset, roadHalfWidth * 2.8);
        break;
      }
    }

    // Rare road obstacles placed using CANONICAL lane center geometry
    if (this.rng.boolean(0.04)) {
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
        // Left Inland Boulevard: Palm variant + street lamp / guardrail
        const leftPalm = this.selectWithAntiRepetition([PalmTreeSprite, LeanPalmSprite], 'left');
        const leftPalmX = -this.rng.range(minSafeOffset + 20, minSafeOffset + 240);
        this.addScenery(leftPalm, chunkZ + jitterZ, leftPalmX, 'ROADSIDE', 'left');
        this.addScenery(StreetLampSprite, chunkZ + jitterZ + 70, -minSafeOffset - 15, 'ROADSIDE', 'left');
        this.addScenery(HighwayMileMarkerSprite, chunkZ + jitterZ - 50, -minSafeOffset - 10, 'ROADSIDE', 'left');

        // Right Beach Promenade: Palm variant + coastal grass
        const rightPalm = this.selectWithAntiRepetition([PalmTreeSprite, LeanPalmSprite, ShortPalmSprite], 'right');
        const rightPalmX = this.rng.range(minSafeOffset + 30, minSafeOffset + 220);
        this.addScenery(rightPalm, chunkZ + jitterZ + 35, rightPalmX, 'BEACH', 'right');
        this.addScenery(CoastalGrassSprite, chunkZ + jitterZ + 15, minSafeOffset + 20, 'BEACH', 'right');
        break;
      }

      case 'OPEN_BEACH_VISTA': {
        // Left: Highway direction sign or short palm
        if (this.rng.boolean(0.4)) {
          this.addScenery(DirectionSignSprite, chunkZ + jitterZ, -minSafeOffset - 25, 'ROADSIDE', 'left');
        } else {
          this.addScenery(ShortPalmSprite, chunkZ + jitterZ, -this.rng.range(minSafeOffset + 30, minSafeOffset + 250), 'INLAND', 'left');
        }

        // Right (Beach & Ocean): Lifeguard hut, pier, or coastal rock + Sailboat / Buoy
        if (this.rng.boolean(0.45)) {
          this.addScenery(LifeguardHutSprite, chunkZ + jitterZ, this.rng.range(minSafeOffset + 60, shorelineOffset - 40), 'BEACH', 'right');
        } else if (this.rng.boolean(0.5)) {
          this.addScenery(PierSprite, chunkZ + jitterZ, shorelineOffset, 'SHORELINE', 'right');
        } else {
          this.addScenery(CoastalRockSprite, chunkZ + jitterZ, shorelineOffset + 20, 'SHORELINE', 'right');
        }

        // Distant Sailboat or Buoy strictly on WATER
        const waterX = this.rng.range(shorelineOffset + 180, shorelineOffset + 950);
        if (this.rng.boolean(0.65)) {
          this.addScenery(SailboatSprite, chunkZ + jitterZ + 30, waterX, 'WATER', 'right');
        } else {
          this.addScenery(OceanBuoySprite, chunkZ + jitterZ + 30, waterX, 'WATER', 'right');
        }
        break;
      }

      case 'BEACH_TOWN': {
        // Left Inland Town: Coastal Diner Cafe or Hotel + Street Lamp + Bush
        if (this.rng.boolean(0.6)) {
          const cafeX = -this.rng.range(minSafeOffset + 180, minSafeOffset + 480);
          this.addScenery(RoadsideCafeSprite, chunkZ + jitterZ, cafeX, 'INLAND', 'left');
        } else {
          const billboardX = -this.rng.range(minSafeOffset + 80, minSafeOffset + 320);
          this.addScenery(BillboardSprite, chunkZ + jitterZ, billboardX, 'INLAND', 'left');
        }
        this.addScenery(StreetLampSprite, chunkZ + jitterZ - 30, -minSafeOffset - 15, 'ROADSIDE', 'left');
        this.addScenery(TropicalBushSprite, chunkZ + jitterZ + 40, -minSafeOffset - 35, 'ROADSIDE', 'left');

        // Right Beach: Short Palm + Coastal dune grass + Guardrail
        this.addScenery(ShortPalmSprite, chunkZ + jitterZ, this.rng.range(minSafeOffset + 30, minSafeOffset + 200), 'BEACH', 'right');
        this.addScenery(CoastalGrassSprite, chunkZ + jitterZ + 20, minSafeOffset + 25, 'BEACH', 'right');
        this.addScenery(GuardrailSprite, chunkZ + jitterZ - 40, minSafeOffset + 10, 'ROADSIDE', 'right');
        break;
      }

      case 'TROPICAL_COVE': {
        // Left: Deterministic Palm Cluster
        const palmSprite = this.selectWithAntiRepetition([PalmTreeSprite, LeanPalmSprite], 'left');
        const clusterX = -this.rng.range(minSafeOffset + 80, minSafeOffset + 350);
        this.addScenery(palmSprite, chunkZ + jitterZ, clusterX, 'INLAND', 'left');
        this.addScenery(ShortPalmSprite, chunkZ + jitterZ + 30, clusterX - 90, 'INLAND', 'left');
        this.addScenery(TropicalBushSprite, chunkZ + jitterZ + 15, clusterX + 70, 'INLAND', 'left');

        // Right: Tiki Beach Shack on the beach + Coastal palm + Coastal Rocks
        const shackX = this.rng.range(minSafeOffset + 70, shorelineOffset - 60);
        this.addScenery(BeachShackSprite, chunkZ + jitterZ, shackX, 'BEACH', 'right');
        this.addScenery(PalmTreeSprite, chunkZ + jitterZ + 45, this.rng.range(minSafeOffset + 220, shorelineOffset - 30), 'BEACH', 'right');
        this.addScenery(CoastalRockSprite, chunkZ + jitterZ - 25, shorelineOffset + 30, 'SHORELINE', 'right');
        break;
      }

      case 'LIGHTHOUSE_POINT': {
        // Left: Palm Tree + Street Lamp
        const leftPalm = this.selectWithAntiRepetition([PalmTreeSprite, LeanPalmSprite], 'left');
        this.addScenery(leftPalm, chunkZ + jitterZ, -this.rng.range(minSafeOffset + 40, minSafeOffset + 250), 'INLAND', 'left');

        // Right (Coastal Edge): Coastal Lighthouse Landmark (hero cooldown aware)
        if (this.canSpawnHero(chunkZ)) {
          const lighthouseX = this.rng.range(shorelineOffset + 40, shorelineOffset + 220);
          this.addScenery(LighthouseSprite, chunkZ + jitterZ, lighthouseX, 'LANDMARK', 'right');
          this.recordHeroSpawn(chunkZ);
        } else {
          this.addScenery(CoastalRockSprite, chunkZ + jitterZ, shorelineOffset + 20, 'SHORELINE', 'right');
        }

        const boatX = this.rng.range(shorelineOffset + 280, shorelineOffset + 850);
        this.addScenery(SmallBoatSprite, chunkZ + jitterZ + 50, boatX, 'WATER', 'right');
        this.addScenery(CoastalGrassSprite, chunkZ + jitterZ - 20, minSafeOffset + 25, 'BEACH', 'right');
        break;
      }

      case 'COASTAL_RESORT': {
        // Left: Grand Art Deco Coastal Hotel (hero cooldown aware)
        if (this.canSpawnHero(chunkZ)) {
          const hotelX = -this.rng.range(minSafeOffset + 200, minSafeOffset + 500);
          this.addScenery(CoastalHotelSprite, chunkZ + jitterZ, hotelX, 'INLAND', 'left');
          this.recordHeroSpawn(chunkZ);
        } else {
          const cafeX = -this.rng.range(minSafeOffset + 180, minSafeOffset + 450);
          this.addScenery(RoadsideCafeSprite, chunkZ + jitterZ, cafeX, 'INLAND', 'left');
        }
        this.addScenery(PalmTreeSprite, chunkZ + jitterZ + 60, -minSafeOffset - 30, 'ROADSIDE', 'left');

        // Right: Tiki Shack + Lifeguard Hut on the beach + Buoy
        const shackX = this.rng.range(minSafeOffset + 60, shorelineOffset - 80);
        this.addScenery(BeachShackSprite, chunkZ + jitterZ, shackX, 'BEACH', 'right');
        this.addScenery(LifeguardHutSprite, chunkZ + jitterZ + 55, this.rng.range(minSafeOffset + 180, shorelineOffset - 40), 'BEACH', 'right');
        this.addScenery(OceanBuoySprite, chunkZ + jitterZ + 80, shorelineOffset + 240, 'WATER', 'right');
        break;
      }
    }
  }

  /**
   * Generates Sunbaked Canyon & Desert scenery with rich geological formations.
   */
  private generateDesertChunk(chunkZ: number, minSafeOffset: number): void {
    const jitterZ = this.rng.range(-25, 25);
    const rhythm = this.getSceneRhythmAtZ(chunkZ);

    // Left Side: Mesas / Buttes / Arches / Joshua Trees / Billboards
    if (rhythm === 'LANDMARK' && this.canSpawnHero(chunkZ)) {
      const landmarkSprite = this.selectWithAntiRepetition([CanyonMesaSprite, CanyonArchSprite], 'left');
      const mesaX = -this.rng.range(minSafeOffset + 280, minSafeOffset + 650);
      this.addScenery(landmarkSprite, chunkZ + jitterZ, mesaX, 'LANDMARK', 'left');
      this.recordHeroSpawn(chunkZ);
    } else {
      const vegSprite = this.selectWithAntiRepetition([JoshuaTreeSprite, DeadTreeSprite], 'left');
      const vegX = -this.rng.range(minSafeOffset + 60, minSafeOffset + 280);
      this.addScenery(vegSprite, chunkZ + jitterZ, vegX, 'INLAND', 'left');
    }

    if (this.rng.boolean(0.4)) {
      this.addScenery(HighwayMileMarkerSprite, chunkZ + jitterZ - 40, -minSafeOffset - 15, 'ROADSIDE', 'left');
    }

    // Right Side: Buttes / Grand Saguaro / Sand Dunes / Boulders
    if (this.rng.boolean(0.5) && this.canSpawnHero(chunkZ + 100)) {
      const butteX = this.rng.range(minSafeOffset + 260, minSafeOffset + 600);
      this.addScenery(CanyonButteSprite, chunkZ + jitterZ + 40, butteX, 'LANDMARK', 'right');
      this.recordHeroSpawn(chunkZ + 100);
    } else {
      const duneX = this.rng.range(minSafeOffset + 120, minSafeOffset + 400);
      this.addScenery(DesertDuneSprite, chunkZ + jitterZ + 40, duneX, 'INLAND', 'right');
    }

    const cactusSprite = this.selectWithAntiRepetition([CactusSprite, GiantCactusSprite], 'right');
    const cactusX = this.rng.range(minSafeOffset + 30, minSafeOffset + 200);
    this.addScenery(cactusSprite, chunkZ + jitterZ + 20, cactusX, 'INLAND', 'right');

    if (this.rng.boolean(0.35)) {
      this.addScenery(WarningSignSprite, chunkZ + jitterZ + 60, minSafeOffset + 15, 'ROADSIDE', 'right');
    }
  }

  /**
   * Generates Misty Pine Forest scenery with layered woodland composition.
   */
  private generateForestChunk(chunkZ: number, minSafeOffset: number): void {
    const jitterZ = this.rng.range(-25, 25);

    // Left Side: Pine Trees + Tall Pines + Deciduous Trees + Ferns
    const leftPine = this.selectWithAntiRepetition([PineTreeSprite, TallPineSprite], 'left');
    const leftPineX = -this.rng.range(minSafeOffset + 40, minSafeOffset + 320);
    this.addScenery(leftPine, chunkZ + jitterZ, leftPineX, 'INLAND', 'left');
    this.addScenery(ForestFernSprite, chunkZ + jitterZ + 25, leftPineX + 45, 'ROADSIDE', 'left');
    this.addScenery(StreetLampSprite, chunkZ + jitterZ - 50, -minSafeOffset - 15, 'ROADSIDE', 'left');

    // Right Side: Deciduous / Pine + Fallen Mossy Log + Wildflower Patch + Guardrail
    if (this.rng.boolean(0.5)) {
      const rightTree = this.selectWithAntiRepetition([DeciduousTreeSprite, TallPineSprite], 'right');
      const rightTreeX = this.rng.range(minSafeOffset + 50, minSafeOffset + 340);
      this.addScenery(rightTree, chunkZ + jitterZ + 30, rightTreeX, 'INLAND', 'right');
    } else {
      const logX = this.rng.range(minSafeOffset + 40, minSafeOffset + 220);
      this.addScenery(FallenLogSprite, chunkZ + jitterZ + 30, logX, 'INLAND', 'right');
      this.addScenery(WildflowerPatchSprite, chunkZ + jitterZ + 55, logX + 35, 'INLAND', 'right');
    }

    this.addScenery(GuardrailSprite, chunkZ + jitterZ - 20, minSafeOffset + 10, 'ROADSIDE', 'right');
    this.addScenery(HighwayMileMarkerSprite, chunkZ + jitterZ + 60, minSafeOffset + 15, 'ROADSIDE', 'right');
  }

  /**
   * Generates Glacial Pass alpine scenery.
   */
  private generateAlpineChunk(chunkZ: number, minSafeOffset: number): void {
    const jitterZ = this.rng.range(-25, 25);

    // Left: Distant Alpine Peak, Mountain Cabin or Ice Spire
    if (this.rng.boolean(0.5) && this.canSpawnHero(chunkZ)) {
      const peakX = -this.rng.range(minSafeOffset + 320, minSafeOffset + 700);
      this.addScenery(AlpinePeakSprite, chunkZ + jitterZ, peakX, 'LANDMARK', 'left');
      this.recordHeroSpawn(chunkZ);
    } else if (this.rng.boolean(0.5)) {
      const cabinX = -this.rng.range(minSafeOffset + 140, minSafeOffset + 380);
      this.addScenery(MountainCabinSprite, chunkZ + jitterZ, cabinX, 'STRUCTURE', 'left');
    } else {
      const spireX = -this.rng.range(minSafeOffset + 180, minSafeOffset + 450);
      this.addScenery(IceSpireSprite, chunkZ + jitterZ, spireX, 'LANDMARK', 'left');
    }

    const leftSnowPine = this.selectWithAntiRepetition([SnowPineSprite, DenseSnowPineSprite], 'left');
    const leftSnowPineX = -this.rng.range(minSafeOffset + 40, minSafeOffset + 240);
    this.addScenery(leftSnowPine, chunkZ + jitterZ + 35, leftSnowPineX, 'INLAND', 'left');

    // Right: Snow Pine + Alpine Shrub + Guardrail
    const rightSnowPine = this.selectWithAntiRepetition([SnowPineSprite, DenseSnowPineSprite], 'right');
    const rightSnowPineX = this.rng.range(minSafeOffset + 40, minSafeOffset + 260);
    this.addScenery(rightSnowPine, chunkZ + jitterZ + 15, rightSnowPineX, 'INLAND', 'right');
    this.addScenery(AlpineShrubSprite, chunkZ + jitterZ + 45, minSafeOffset + 30, 'ROADSIDE', 'right');
    this.addScenery(GuardrailSprite, chunkZ + jitterZ - 30, minSafeOffset + 10, 'ROADSIDE', 'right');
    this.addScenery(WarningSignSprite, chunkZ + jitterZ + 70, minSafeOffset + 15, 'ROADSIDE', 'right');
  }

  /**
   * Generates Cyber Metropolis scenery with neon megastructures and holograms.
   */
  private generateNeonCityChunk(chunkZ: number, minSafeOffset: number): void {
    const jitterZ = this.rng.range(-20, 20);

    // Left: Cyber Skyscraper Megastructure or Needle Spire
    if (this.canSpawnHero(chunkZ)) {
      const towerSprite = this.selectWithAntiRepetition([NeonTowerSprite, CyberSpireSprite], 'left');
      const towerX = -this.rng.range(minSafeOffset + 240, minSafeOffset + 600);
      this.addScenery(towerSprite, chunkZ + jitterZ, towerX, 'LANDMARK', 'left');
      this.recordHeroSpawn(chunkZ);
    } else {
      const buildingX = -this.rng.range(minSafeOffset + 180, minSafeOffset + 450);
      this.addScenery(CyberGridBuildingSprite, chunkZ + jitterZ, buildingX, 'STRUCTURE', 'left');
    }
    this.addScenery(CyberStreetLampSprite, chunkZ + jitterZ + 50, -minSafeOffset - 15, 'ROADSIDE', 'left');

    // Right: Holographic Totem, Corporate Building or Overhead Gantry
    if (this.rng.boolean(0.45)) {
      const totemX = this.rng.range(minSafeOffset + 80, minSafeOffset + 300);
      this.addScenery(HoloAdTotemSprite, chunkZ + jitterZ + 30, totemX, 'INLAND', 'right');
    } else if (this.rng.boolean(0.5)) {
      const gantryX = this.rng.range(minSafeOffset + 60, minSafeOffset + 220);
      this.addScenery(CyberGantrySprite, chunkZ + jitterZ + 30, gantryX, 'STRUCTURE', 'right');
    } else {
      const gridX = this.rng.range(minSafeOffset + 140, minSafeOffset + 420);
      this.addScenery(CyberGridBuildingSprite, chunkZ + jitterZ + 30, gridX, 'STRUCTURE', 'right');
    }

    this.addScenery(CyberStreetLampSprite, chunkZ + jitterZ - 40, minSafeOffset + 15, 'ROADSIDE', 'right');
    this.addScenery(GuardrailSprite, chunkZ + jitterZ + 60, minSafeOffset + 10, 'ROADSIDE', 'right');
  }

  /**
   * Generates Obsidian Ridge volcanic scenery with basalt columns and fumaroles.
   */
  private generateVolcanicChunk(chunkZ: number, minSafeOffset: number): void {
    const jitterZ = this.rng.range(-25, 25);

    // Left: Basalt Crags + Dead Trees
    const cragX = -this.rng.range(minSafeOffset + 120, minSafeOffset + 380);
    this.addScenery(BasaltCragSprite, chunkZ + jitterZ, cragX, 'STRUCTURE', 'left');
    this.addScenery(DeadTreeSprite, chunkZ + jitterZ + 45, cragX - 70, 'INLAND', 'left');

    // Right: Volcanic Fumarole Vent + Boulder Cluster + Warning Sign
    const ventX = this.rng.range(minSafeOffset + 80, minSafeOffset + 320);
    this.addScenery(VolcanicVentSprite, chunkZ + jitterZ + 20, ventX, 'STRUCTURE', 'right');
    this.addScenery(BoulderClusterSprite, chunkZ + jitterZ + 55, ventX + 80, 'INLAND', 'right');
    this.addScenery(WarningSignSprite, chunkZ + jitterZ - 30, minSafeOffset + 15, 'ROADSIDE', 'right');
    this.addScenery(HighwayMileMarkerSprite, chunkZ + jitterZ + 70, minSafeOffset + 10, 'ROADSIDE', 'right');
  }

  private addScenery(
    sprite: SpriteDefinition,
    z: number,
    lateralOffset: number,
    _surfaceType: TerrainSurfaceType,
    side: 'left' | 'right' = lateralOffset < 0 ? 'left' : 'right'
  ): void {
    this.scenery.push(new SceneryObject(`scenery_${this.nextId++}`, sprite, z, lateralOffset, false));
    this.recordSpawn(sprite.id, side);
  }

  private generateGenericChunk(
    chunkZ: number,
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
        this.addScenery(sprite, z, offset, 'INLAND', 'left');
      }
    }

    // Right side scenery
    if (this.rng.next() < 0.65 * density) {
      const sprite = this.biomeSystem.sampleScenerySprite(blendState, this.rng);
      if (sprite) {
        const offset = this.rng.range(nearMin, midMax);
        const z = chunkZ + this.rng.range(-30, 30);
        this.addScenery(sprite, z, offset, 'INLAND', 'right');
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
