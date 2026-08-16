import { LODLevel, RenderableEntity, SpriteDefinition } from './types';
import { FrameBuffer } from './FrameBuffer';

export class DepthSorter {
  private queue: RenderableEntity[] = [];

  public clear(): void {
    this.queue.length = 0;
  }

  public add(entity: RenderableEntity): void {
    this.queue.push(entity);
  }

  /**
   * Calculates the projected visual screen height of a sprite in characters.
   * Input:
   *  - relZ: Camera-relative forward depth (distance ahead of camera)
   *  - worldHeight: Nominal vertical height in world units
   *  - screenHeight: FrameBuffer height in rows (default 42)
   *  - visualScale: Optional multiplier for artistic prominence
   */
  public static calculateProjectedHeight(
    relZ: number,
    worldHeight: number = 160,
    screenHeight: number = 42,
    visualScale: number = 1.0
  ): number {
    const clampedZ = Math.max(1.0, relZ);
    // Perspective unit height scaling formula: (worldHeight * d * screenHeight * PROJECTION_SCALE_Y) / relZ
    const d = 0.44;
    const projectionScaleY = 0.55;
    return (worldHeight * visualScale * d * screenHeight * projectionScaleY) / clampedZ;
  }

  /**
   * Selects the optimal Level of Detail (LOD) variant based on projected screen scale and hysteresis.
   * Eliminates popping and ensures large foreground landmarks/trees properly expand to high-res art.
   */
  public static calculateProjectedLOD(
    relZ: number,
    spriteOrHeight: SpriteDefinition | number = 160,
    screenHeight: number = 42,
    previousLOD?: LODLevel
  ): LODLevel {
    const worldHeight = typeof spriteOrHeight === 'number'
      ? spriteOrHeight
      : (spriteOrHeight.worldHeight || 160);
    const visualScale = typeof spriteOrHeight === 'object' && spriteOrHeight.visualScale
      ? spriteOrHeight.visualScale
      : 1.0;

    const projH = DepthSorter.calculateProjectedHeight(relZ, worldHeight, screenHeight, visualScale);

    // Apply Hysteresis to prevent threshold oscillation at boundary lines
    if (previousLOD === 'close') {
      if (projH >= 16.0) return 'close';
      if (projH >= 8.0) return 'near';
      if (projH >= 3.8) return 'medium';
      return 'far';
    } else if (previousLOD === 'near') {
      if (projH >= 20.0) return 'close';
      if (projH >= 8.0) return 'near';
      if (projH >= 3.8) return 'medium';
      return 'far';
    } else if (previousLOD === 'medium') {
      if (projH >= 20.0) return 'close';
      if (projH >= 10.5) return 'near';
      if (projH >= 3.8) return 'medium';
      return 'far';
    } else {
      // Default / Far
      if (projH >= 18.0) return 'close';
      if (projH >= 9.0) return 'near';
      if (projH >= 4.5) return 'medium';
      return 'far';
    }
  }

  /**
   * Backwards-compatible legacy signature for depth-based LOD calculation.
   */
  public static calculateLOD(z: number): LODLevel {
    return DepthSorter.calculateProjectedLOD(z, 160, 42);
  }

  /**
   * Sorts all queued items from furthest to closest (descending relative Z) and renders them.
   */
  public render(frameBuffer: FrameBuffer): void {
    // Sort descending by Z so further objects are drawn first
    this.queue.sort((a, b) => b.z - a.z);

    const screenH = frameBuffer.height;

    for (const item of this.queue) {
      const lod = item.lod || DepthSorter.calculateProjectedLOD(item.z, item.sprite, screenH);
      const variant = item.sprite.variants[lod] ||
                      item.sprite.variants.medium ||
                      item.sprite.variants.near ||
                      item.sprite.variants.far ||
                      item.sprite.variants.close;

      if (!variant) continue;

      frameBuffer.drawSprite(
        item.screenX,
        item.screenY,
        variant,
        item.sprite.defaultColor,
        Math.max(1, Math.round(item.z))
      );
    }
  }
}
