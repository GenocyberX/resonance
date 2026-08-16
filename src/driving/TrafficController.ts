import { TrafficType, TrafficVehicle } from '../entities/TrafficVehicle';
import { PlayerVehicle } from '../entities/PlayerVehicle';
import { SeededRandom } from '../procedural/SeededRandom';
import { RoadGenerator } from '../road/RoadGenerator';

export class TrafficController {
  private trafficVehicles: TrafficVehicle[] = [];
  private rng: SeededRandom;
  private nextId: number = 1;
  public maxTrafficCount: number = 5;

  constructor(rng: SeededRandom) {
    this.rng = rng.fork(991);
  }

  public getVehicles(): TrafficVehicle[] {
    return this.trafficVehicles;
  }

  /**
   * Updates all traffic vehicles, evaluating the road geometry at each vehicle's OWN longitudinal z position.
   */
  public update(dt: number, player: PlayerVehicle, road: RoadGenerator): void {
    // 1. Update existing traffic vehicles using their own updated road curvature
    for (const vehicle of this.trafficVehicles) {
      const nextZ = vehicle.z + vehicle.speed * dt;
      const curveAtVehicleZ = road.getCurveAt(nextZ);
      vehicle.update(dt, curveAtVehicleZ);
    }

    // 2. Recycle out-of-range vehicles (behind player or way too far ahead)
    this.trafficVehicles = this.trafficVehicles.filter(v => {
      const dist = v.z - player.z;
      return dist > -250 && dist < 1800;
    });

    // 3. Spawn new vehicles ahead if under capacity
    if (this.trafficVehicles.length < this.maxTrafficCount && this.rng.boolean(0.04)) {
      this.spawnVehicle(player.z);
    }
  }

  private spawnVehicle(playerZ: number): void {
    const lanes = [-1, 0, 1];
    const lane = this.rng.choice(lanes);
    const type: TrafficType = this.rng.boolean(0.35) ? 'truck' : 'sedan';
    const spawnZ = playerZ + this.rng.range(650, 1300);

    // Ensure no immediate overlap with existing traffic at spawn location
    const isOverlapping = this.trafficVehicles.some(v => Math.abs(v.z - spawnZ) < 200 && v.lane === lane);
    if (!isOverlapping) {
      const id = `traffic_${this.nextId++}`;
      const vehicle = new TrafficVehicle(id, type, spawnZ, lane);
      this.trafficVehicles.push(vehicle);
    }
  }

  public clear(): void {
    this.trafficVehicles = [];
  }
}
