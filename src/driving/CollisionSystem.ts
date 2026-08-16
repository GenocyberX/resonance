import { PlayerVehicle } from '../entities/PlayerVehicle';
import { Entity } from '../entities/Entity';
import { CollisionEvent } from './types';

export class CollisionSystem {
  private totalCollisions: number = 0;

  public getTotalCollisions(): number {
    return this.totalCollisions;
  }

  /**
   * Checks collisions between player vehicle and all active collidable entities.
   * Resolves physical overlap and returns triggered collision events.
   */
  public checkCollisions(player: PlayerVehicle, entities: Entity[]): CollisionEvent[] {
    const events: CollisionEvent[] = [];

    for (const ent of entities) {
      if (ent === player || !ent.isCollidable) continue;

      const dz = Math.abs(ent.z - player.z);
      const minZDistance = (player.boundingBox.length + ent.boundingBox.length) * 0.5;

      if (dz < minZDistance) {
        const dx = Math.abs(ent.x - player.x);
        const minXDistance = (player.boundingBox.width + ent.boundingBox.width) * 0.45;

        if (dx < minXDistance) {
          // Real physical collision detected!
          const impactSpeed = Math.abs(player.speed - ent.speed);

          player.onCollisionImpact();
          this.totalCollisions++;

          // Separate entities laterally to prevent visual overlap
          const pushDirection = player.x >= ent.x ? 1 : -1;
          const overlap = minXDistance - dx;
          player.lateralOffset += pushDirection * (overlap + 20);
          player.x += pushDirection * (overlap + 20);

          events.push({
            entityA: player,
            entityB: ent,
            impactVelocity: impactSpeed,
            cameraShakeAmount: Math.min(1.0, 0.4 + impactSpeed * 0.005),
          });
        }
      }
    }

    return events;
  }
}
