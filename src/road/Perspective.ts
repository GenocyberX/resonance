import { Camera, ProjectedPoint } from './types';

export interface RoadSpaceResult {
  screenX: number;
  screenY: number;
  scale: number;
  depth: number;
  roadCenterX: number;
  roadHalfWidth: number;
  roadLeft: number;
  roadRight: number;
  visible: boolean;
}

export class Perspective {
  // Calibrated projection coefficients for balanced arcade composition & landscape visibility
  public static readonly PROJECTION_SCALE_X: number = 0.22;
  public static readonly PROJECTION_SCALE_Y: number = 0.55;

  /**
   * Mathematically calibrated 3D to 2D perspective projection for ASCII character grid & pixel viewport.
   * Ensures monotonic convergence to horizon, balanced road width, and expansive landscape visibility.
   */
  public static project(
    worldX: number,
    worldY: number,
    worldZ: number,
    camera: Camera,
    screenWidth: number,
    screenHeight: number,
    horizonRowRatio: number = 0.40
  ): ProjectedPoint {
    const relZ = worldZ - camera.z;

    // Reject points on or behind the camera lens
    if (relZ <= 2.0) {
      return {
        screenX: 0,
        screenY: 0,
        scale: 0,
        depth: relZ,
        visible: false,
      };
    }

    // Focal length / distance to projection plane
    const effectiveFov = camera.distanceToPlane * (1.0 + (camera.fovPulse || 0) * 0.1);
    const scale = effectiveFov / relZ;

    const relX = worldX - camera.x;
    const relY = worldY - camera.y;

    const centerX = screenWidth * 0.5;
    const horizonY = screenHeight * horizonRowRatio + (camera.pitch || 0) * screenHeight;

    const screenX = centerX + (relX * scale * screenWidth * this.PROJECTION_SCALE_X);
    const screenY = horizonY - (relY * scale * screenHeight * this.PROJECTION_SCALE_Y);

    const visible = relZ > 10 &&
                    screenX >= -screenWidth * 0.8 &&
                    screenX <= screenWidth * 1.8 &&
                    screenY >= horizonY - 10 &&
                    screenY <= screenHeight + 20;

    return {
      screenX,
      screenY,
      scale,
      depth: relZ,
      visible,
    };
  }

  /**
   * Projects a road cross-section at longitudinal distance z.
   * Returns screen center X, screen row Y, half-width in columns, and depth.
   */
  public static projectRoadSlice(
    curveX: number,
    elevationY: number,
    worldZ: number,
    halfRoadWidth: number,
    camera: Camera,
    screenWidth: number,
    screenHeight: number,
    horizonRowRatio: number = 0.40
  ): { screenX: number; screenY: number; halfWidth: number; depth: number; visible: boolean } {
    const centerProj = this.project(
      curveX,
      elevationY,
      worldZ,
      camera,
      screenWidth,
      screenHeight,
      horizonRowRatio
    );

    if (centerProj.depth <= 2.0) {
      return { screenX: 0, screenY: 0, halfWidth: 0, depth: centerProj.depth, visible: false };
    }

    const effectiveFov = camera.distanceToPlane * (1.0 + (camera.fovPulse || 0) * 0.1);
    const scale = effectiveFov / centerProj.depth;
    const halfWidthScreen = Math.max(1.0, halfRoadWidth * scale * screenWidth * this.PROJECTION_SCALE_X);

    return {
      screenX: centerProj.screenX,
      screenY: centerProj.screenY,
      halfWidth: halfWidthScreen,
      depth: centerProj.depth,
      visible: centerProj.visible,
    };
  }

  /**
   * Canonical Unified Road-Space Perspective Projection.
   * Evaluates world road geometry at worldZ and projects any road-space object
   * (road slice, kerb, lane divider, roadside prop, NPC vehicle, player)
   * with guaranteed mathematical alignment and consistency.
   */
  public static projectRoadSpace(
    worldZ: number,
    lateralOffset: number,
    camera: Camera,
    road: { getCurveAt(z: number): number; getElevationAt(z: number): number; defaultRoadWidth: number },
    screenWidth: number,
    screenHeight: number,
    horizonRowRatio: number = 0.40
  ): RoadSpaceResult {
    const curveX = road.getCurveAt(worldZ);
    const elevationY = road.getElevationAt(worldZ);
    const halfRoadWidth = road.defaultRoadWidth * 0.5;

    const worldX = curveX + lateralOffset;
    const worldY = elevationY;

    const proj = this.project(worldX, worldY, worldZ, camera, screenWidth, screenHeight, horizonRowRatio);
    const roadSlice = this.projectRoadSlice(curveX, elevationY, worldZ, halfRoadWidth, camera, screenWidth, screenHeight, horizonRowRatio);

    return {
      screenX: proj.screenX,
      screenY: proj.screenY,
      scale: proj.scale,
      depth: proj.depth,
      roadCenterX: roadSlice.screenX,
      roadHalfWidth: roadSlice.halfWidth,
      roadLeft: roadSlice.screenX - roadSlice.halfWidth,
      roadRight: roadSlice.screenX + roadSlice.halfWidth,
      visible: proj.visible && roadSlice.visible,
    };
  }
}
