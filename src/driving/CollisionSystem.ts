import { PlayerVehicle } from '../entities/PlayerVehicle';
import { Entity } from '../entities/Entity';
import { CollisionEvent } from './types';

export class CollisionSystem {
  private totalCollisions: number = 0;
  private activeContacts: Set<string> = new Set();

  public getTotalCollisions(): number {
    return this.totalCollisions;
  }

  public getActiveContactCount(): number {
    return this.activeContacts.size;
  }

  public reset(): void {
    this.totalCollisions = 0;
    this.activeContacts.clear();
  }

  /**
   * Checks collisions between player vehicle and all active collidable entities.
   * Implements a robust contact lifecycle (ENTER, STAY, EXIT) so that continuous
   * overlap counts as exactly one collision impact, while maintaining physical separation.
   */
  public checkCollisions(player: PlayerVehicle, entities: Entity[]): CollisionEvent[] {
    const events: CollisionEvent[] = [];
    const currentFrameOverlaps: Set<string> = new Set();

    for (const ent of entities) {
      if (ent === player || !ent.isCollidable) continue;

      const dz = Math.abs(ent.z - player.z);
      const minZDistance = (player.boundingBox.length + ent.boundingBox.length) * 0.5;

      if (dz < minZDistance) {
        const dx = Math.abs(ent.x - player.x);
        const minXDistance = (player.boundingBox.width + ent.boundingBox.width) * 0.45;

        if (dx < minXDistance) {
          const contactKey = `${player.id}:${ent.id}`;
          currentFrameOverlaps.add(contactKey);

          const impactSpeed = Math.abs(player.speed - ent.speed);
          const isInitialContact = !this.activeContacts.has(contactKey);

          if (isInitialContact) {
            // ENTER: New collision event
            this.activeContacts.add(contactKey);
            this.totalCollisions++;
            player.onCollisionImpact();

            events.push({
              entityA: player,
              entityB: ent,
              impactVelocity: impactSpeed,
              cameraShakeAmount: Math.min(1.0, 0.4 + impactSpeed * 0.005),
            });
          }

          // Both ENTER & STAY: Push apart laterally to resolve overlap and prevent ghosting
          const pushDirection = player.x >= ent.x ? 1 : -1;
          const overlap = minXDistance - dx;
          const pushAmount = overlap + (isInitialContact ? 25 : 10);
          player.lateralOffset += pushDirection * pushAmount;
          player.x += pushDirection * pushAmount;
        }
      }
    }

    // EXIT: Clear contacts that are no longer overlapping
    for (const contactKey of this.activeContacts) {
      if (!currentFrameOverlaps.has(contactKey)) {
        this.activeContacts.delete(contactKey);
      }
    }

    return events;
  }
}
