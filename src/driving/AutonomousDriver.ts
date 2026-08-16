import { PlayerVehicle } from '../entities/PlayerVehicle';
import { Entity } from '../entities/Entity';
import { RoadGenerator } from '../road/RoadGenerator';
import { DriverDecision, LaneTrafficInfo, RoadPerception } from './types';

export class AutonomousDriver {
  private baseSpeed: number = 180;
  private overtakeCooldown: number = 0;
  private preferredLane: number = 0; // Center lane

  public setBaseSpeed(speed: number): void {
    this.baseSpeed = speed;
  }

  /**
   * Scans ahead of the vehicle to build situational awareness using canonical lane geometry.
   */
  public perceive(
    player: PlayerVehicle,
    traffic: Entity[],
    road: RoadGenerator
  ): RoadPerception {
    const lanes: Record<number, LaneTrafficInfo> = {
      [-1]: { lane: -1, closestDistance: Infinity, closestVehicle: null },
      [0]: { lane: 0, closestDistance: Infinity, closestVehicle: null },
      [1]: { lane: 1, closestDistance: Infinity, closestVehicle: null },
    };

    let closestObstacleDist = Infinity;

    for (const ent of traffic) {
      if (!ent.isCollidable) continue;
      const distZ = ent.z - player.z;

      // Only check entities ahead within perception distance (up to 700 units)
      if (distZ > 10 && distZ < 700) {
        // Determine canonical lane this entity occupies
        const entLane = road.getLaneForWorldX(ent.x, ent.z);

        if (lanes[entLane] && distZ < lanes[entLane].closestDistance) {
          lanes[entLane].closestDistance = distZ;
          lanes[entLane].closestVehicle = ent;
        }

        if (distZ < closestObstacleDist) {
          closestObstacleDist = distZ;
        }
      }
    }

    // Measure curvature 150-300 units ahead
    const currentCurve = road.getCurveAt(player.z);
    const curveAhead = road.getCurveAt(player.z + 220);
    const sharpness = Math.abs(curveAhead - currentCurve);

    return {
      curveAhead,
      sharpness,
      lanes,
      closestObstacleDistance: closestObstacleDist,
    };
  }

  /**
   * Decides driving action based on perception and road state.
   */
  public decide(
    perception: RoadPerception,
    player: PlayerVehicle,
    road: RoadGenerator,
    baseCruisingSpeed: number
  ): DriverDecision {
    if (player.collisionCooldown > 0) {
      // During RECOVER: guide smoothly to nearest safe canonical lane
      const safeLane = road.getNearestLane(player.lateralOffset);
      return {
        targetLane: safeLane,
        targetSpeed: Math.max(70, baseCruisingSpeed * 0.6),
        state: 'RECOVER',
      };
    }

    const currentLaneInfo = perception.lanes[player.lane] || { closestDistance: Infinity };
    const isVehicleAheadClose = currentLaneInfo.closestDistance < 280;

    // Check overtake need
    if (isVehicleAheadClose && this.overtakeCooldown <= 0) {
      const candidateLanes: number[] = [];
      if (player.lane === 0) {
        if (perception.lanes[-1].closestDistance > 350) candidateLanes.push(-1);
        if (perception.lanes[1].closestDistance > 350) candidateLanes.push(1);
      } else if (player.lane === -1) {
        if (perception.lanes[0].closestDistance > 350) candidateLanes.push(0);
      } else if (player.lane === 1) {
        if (perception.lanes[0].closestDistance > 350) candidateLanes.push(0);
      }

      if (candidateLanes.length > 0) {
        const bestLane = candidateLanes.reduce((prev, curr) =>
          perception.lanes[curr].closestDistance > perception.lanes[prev].closestDistance ? curr : prev
        );
        this.overtakeCooldown = 1.8;
        return {
          targetLane: bestLane,
          targetSpeed: baseCruisingSpeed * 1.05,
          state: 'OVERTAKE',
        };
      } else if (currentLaneInfo.closestDistance < 160) {
        return {
          targetLane: player.lane,
          targetSpeed: Math.max(50, baseCruisingSpeed * 0.55),
          state: 'BRAKING',
        };
      }
    }

    // Sharp cornering
    if (perception.sharpness > 140) {
      return {
        targetLane: player.lane,
        targetSpeed: baseCruisingSpeed * 0.82,
        state: 'CORNERING',
      };
    }

    // Default cruise: bias back towards center lane if clear
    let targetLane = player.lane;
    if (player.lane !== this.preferredLane && this.overtakeCooldown <= 0 && perception.lanes[this.preferredLane].closestDistance > 450) {
      targetLane = this.preferredLane;
    }

    return {
      targetLane,
      targetSpeed: baseCruisingSpeed,
      state: 'CRUISE',
    };
  }

  /**
   * Main update tick for autonomous driving.
   */
  public update(
    dt: number,
    player: PlayerVehicle,
    traffic: Entity[],
    road: RoadGenerator,
    musicSpeedBonus: number = 0
  ): void {
    if (this.overtakeCooldown > 0) {
      this.overtakeCooldown -= dt;
    }

    const effectiveBaseSpeed = this.baseSpeed + musicSpeedBonus;
    const perception = this.perceive(player, traffic, road);
    const decision = this.decide(perception, player, road, effectiveBaseSpeed);

    player.driverState = decision.state;
    player.targetSpeed = decision.targetSpeed;

    const targetOffset = road.getLaneCenterOffset(decision.targetLane);
    player.setLane(decision.targetLane, targetOffset);
  }
}
