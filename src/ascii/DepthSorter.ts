import { LODLevel, RenderableEntity } from './types';
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
   * Automatically determines appropriate Level of Detail (LOD) based on distance Z.
   */
  public static calculateLOD(z: number): LODLevel {
    if (z > 650) return 'far';
    if (z > 350) return 'medium';
    if (z > 160) return 'near';
    return 'close';
  }

  /**
   * Sorts all queued items from furthest to closest (descending Z) and renders them.
   */
  public render(frameBuffer: FrameBuffer): void {
    // Sort descending by Z so further objects are drawn first
    this.queue.sort((a, b) => b.z - a.z);

    for (const item of this.queue) {
      const lod = item.lod || DepthSorter.calculateLOD(item.z);
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
        item.z,
        item.colorOverride
      );
    }
  }
}
