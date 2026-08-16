import { describe, it, expect } from 'vitest';
import { TrafficController } from '../src/driving/TrafficController';
import { PlayerVehicle } from '../src/entities/PlayerVehicle';
import { RoadGenerator } from '../src/road/RoadGenerator';
import { SeededRandom } from '../src/procedural/SeededRandom';
import { TrafficVehicle } from '../src/entities/TrafficVehicle';

describe('TrafficController & Curve Alignment', () => {
  it('updates traffic vehicles using the road curve at their own Z position', () => {
    const rng = new SeededRandom(1337);
    const trafficCtrl = new TrafficController(rng);
    const road = new RoadGenerator(1337);
    const player = new PlayerVehicle(100);

    // Create traffic vehicle at z = 600
    const vehicle = new TrafficVehicle('test_sedan', 'sedan', 600, 0);
    vehicle.lateralOffset = 0;
    trafficCtrl.getVehicles().push(vehicle);

    const curveAtPlayerZ = road.getCurveAt(100);

    trafficCtrl.update(0.016, player, road);

    // Vehicle X must match the curve at its own updated Z
    const expectedX = road.getCurveAt(vehicle.z) + vehicle.lateralOffset;
    expect(vehicle.x).toBeCloseTo(expectedX, 1);
    expect(vehicle.x).not.toBe(curveAtPlayerZ);
  });
});
