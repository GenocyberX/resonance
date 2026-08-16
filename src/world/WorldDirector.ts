import { SceneryObject } from '../entities/SceneryObject';
import { SeededRandom } from '../procedural/SeededRandom';
import { BiomeTransitionSystem } from './transitions/BiomeTransitionSystem';
import { RoadGenerator } from '../road/RoadGenerator';

export class WorldDirector {
  private scenery: SceneryObject[] = [];
  private rng: SeededRandom;
  private biomeSystem: BiomeTransitionSystem;
  private lastGeneratedChunk: number = 0;
  private readonly chunkSize: number = 180; // Distance per scenery chunk
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
    const recycleThreshold = cameraZ - 150;
    this.scenery = this.scenery.filter(obj => obj.z > recycleThreshold);

    // Update positions along road
    for (const obj of this.scenery) {
      obj.update(0, road.getCurveAt(obj.z));
    }
  }

  private generateChunk(chunkZ: number, _road: RoadGenerator): void {
    const blendState = this.biomeSystem.evaluate(chunkZ);
    const density = (blendState.currentBiome.density * (1 - blendState.transitionProgress)) +
                    (blendState.nextBiome.density * blendState.transitionProgress);

    // 1. Left side scenery
    if (this.rng.next() < 0.65 * density) {
      const sprite = this.biomeSystem.sampleScenerySprite(blendState, this.rng);
      if (sprite) {
        const offset = -this.rng.range(1100, 2400);
        const z = chunkZ + this.rng.range(-40, 40);
        this.scenery.push(new SceneryObject(`scenery_${this.nextId++}`, sprite, z, offset, false));
      }
    }

    // 2. Right side scenery
    if (this.rng.next() < 0.65 * density) {
      const sprite = this.biomeSystem.sampleScenerySprite(blendState, this.rng);
      if (sprite) {
        const offset = this.rng.range(1100, 2400);
        const z = chunkZ + this.rng.range(-40, 40);
        this.scenery.push(new SceneryObject(`scenery_${this.nextId++}`, sprite, z, offset, false));
      }
    }

    // 3. Rare road obstacles (traffic cones, rocks on lane edges)
    if (this.rng.boolean(0.08)) {
      const obstacleSprite = this.biomeSystem.sampleObstacleSprite(blendState, this.rng);
      if (obstacleSprite) {
        const laneOffset = this.rng.choice([-550, 0, 550]) + this.rng.range(-60, 60);
        const z = chunkZ + this.rng.range(-30, 30);
        this.scenery.push(new SceneryObject(`obstacle_${this.nextId++}`, obstacleSprite, z, laneOffset, true));
      }
    }
  }

  public reset(seed: number): void {
    this.rng.reseed(seed);
    this.scenery = [];
    this.lastGeneratedChunk = 0;
  }
}
