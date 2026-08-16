import { describe, it, expect } from 'vitest';
import { CollisionSystem } from '../src/driving/CollisionSystem';
import { PlayerVehicle } from '../src/entities/PlayerVehicle';
import { TrafficVehicle } from '../src/entities/TrafficVehicle';
import { SceneryObject } from '../src/entities/SceneryObject';
import { TrafficConeSprite } from '../src/sprites/obstacles/TrafficConeSprite';

describe('CollisionSystem & Contact Lifecycle', () => {
  it('detects no collision when vehicles are far apart longitudinally', () => {
    const system = new CollisionSystem();
    const player = new PlayerVehicle(100);
    const traffic = new TrafficVehicle('t1', 'sedan', 500, 0);

    const collisions = system.checkCollisions(player, [traffic]);
    expect(collisions.length).toBe(0);
    expect(system.getTotalCollisions()).toBe(0);
    expect(system.getActiveContactCount()).toBe(0);
  });

  it('triggers collision event on initial contact (ENTER)', () => {
    const system = new CollisionSystem();
    const player = new PlayerVehicle(200);
    player.x = 0;
    player.lateralOffset = 0;
    player.speed = 180;

    const traffic = new TrafficVehicle('t1', 'sedan', 205, 0);
    traffic.x = 0;
    traffic.lateralOffset = 0;
    traffic.speed = 80;

    const collisions = system.checkCollisions(player, [traffic]);
    expect(collisions.length).toBe(1);
    expect(system.getTotalCollisions()).toBe(1);
    expect(system.getActiveContactCount()).toBe(1);
    expect(player.driverState).toBe('RECOVER');
  });

  it('does NOT duplicate collision count on continuous contact (STAY)', () => {
    const system = new CollisionSystem();
    const player = new PlayerVehicle(200);
    player.x = 0;
    player.lateralOffset = 0;
    player.speed = 180;

    const traffic = new TrafficVehicle('t1', 'sedan', 205, 0);
    traffic.x = 0;
    traffic.lateralOffset = 0;
    traffic.speed = 80;

    // Frame 1: ENTER
    system.checkCollisions(player, [traffic]);
    expect(system.getTotalCollisions()).toBe(1);

    // Frame 2: STAY (still close)
    const collisionsFrame2 = system.checkCollisions(player, [traffic]);
    expect(collisionsFrame2.length).toBe(0); // No new impact event
    expect(system.getTotalCollisions()).toBe(1); // Count unchanged

    // Frame 3: STAY
    const collisionsFrame3 = system.checkCollisions(player, [traffic]);
    expect(collisionsFrame3.length).toBe(0);
    expect(system.getTotalCollisions()).toBe(1);
  });

  it('resets contact on separation (EXIT) and allows new collision on re-contact', () => {
    const system = new CollisionSystem();
    const player = new PlayerVehicle(200);
    player.x = 0;
    player.lateralOffset = 0;

    const traffic = new TrafficVehicle('t1', 'sedan', 205, 0);
    traffic.x = 0;
    traffic.lateralOffset = 0;

    // 1. Initial hit (ENTER)
    system.checkCollisions(player, [traffic]);
    expect(system.getTotalCollisions()).toBe(1);
    expect(system.getActiveContactCount()).toBe(1);

    // 2. Separate vehicles (EXIT)
    traffic.z = 800;
    system.checkCollisions(player, [traffic]);
    expect(system.getActiveContactCount()).toBe(0);
    expect(system.getTotalCollisions()).toBe(1);

    // 3. Re-contact (ENTER again)
    traffic.z = 205;
    player.x = 0;
    traffic.x = 0;
    system.checkCollisions(player, [traffic]);
    expect(system.getTotalCollisions()).toBe(2);
    expect(system.getActiveContactCount()).toBe(1);
  });

  it('ignores non-collidable scenery objects', () => {
    const system = new CollisionSystem();
    const player = new PlayerVehicle(100);
    const nonCollidable = new SceneryObject('tree', TrafficConeSprite, 100, 0, false);

    const collisions = system.checkCollisions(player, [nonCollidable]);
    expect(collisions.length).toBe(0);
    expect(system.getTotalCollisions()).toBe(0);
  });
});
