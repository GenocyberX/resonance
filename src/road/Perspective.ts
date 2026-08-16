import { Camera, ProjectedPoint } from './types';

export class Perspective {
  /**
   * Projects a 3D world coordinate (x, y, z) into 2D ASCII screen grid coordinates.
   */
  public static project(
    worldX: number,
    worldY: number,
    worldZ: number,
    camera: Camera,
    screenWidth: number,
    screenHeight: number,
    horizonRowRatio: number = 0.42
  ): ProjectedPoint {
    const relZ = worldZ - camera.z;

    if (relZ <= 2.0) {
      return {
        screenX: 0,
        screenY: 0,
        scale: 0,
        depth: relZ,
        visible: false,
      };
    }

    const effectiveFov = camera.distanceToPlane * (1.0 + camera.fovPulse * 0.15);
    const scale = effectiveFov / relZ;

    const relX = worldX - camera.x;
    const relY = worldY - camera.y;

    const centerX = screenWidth * 0.5;
    const centerY = screenHeight * horizonRowRatio + camera.pitch * screenHeight;

    // In ASCII cells, horizontal cells are slightly narrower than vertical height (approx aspect ratio 1:1.8)
    const aspectCorrection = 1.75;
    const screenX = centerX + (relX * scale * screenWidth * 0.5 * aspectCorrection);
    const screenY = centerY - (relY * scale * screenHeight * 0.5);

    const visible = screenX >= -screenWidth * 0.5 &&
                    screenX <= screenWidth * 1.5 &&
                    screenY >= 0 &&
                    screenY <= screenHeight;

    return {
      screenX,
      screenY,
      scale,
      depth: relZ,
      visible,
    };
  }
}
