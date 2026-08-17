import { WorldEngine } from '../world/WorldEngine';
import { WorldState } from '../world/WorldState';
import { PixelSprite, PixelSpriteCatalog } from './PixelSpriteCatalog';
import { ColorPalette } from '../ascii/ColorPalette';
import { Perspective, RoadSpaceResult } from '../road/Perspective';
import { SpriteImageManager } from './SpriteImageManager';

export class PixelCanvasRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  public static readonly LOGICAL_WIDTH = 320;
  public static readonly LOGICAL_HEIGHT = 180;
  public static readonly CANONICAL_HORIZON_RATIO = 0.43; // y = 78 on 180p

  private isDebugOverlayEnabled: boolean = false;
  private spriteManager: SpriteImageManager;

  constructor(container: HTMLElement) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = PixelCanvasRenderer.LOGICAL_WIDTH;
    this.canvas.height = PixelCanvasRenderer.LOGICAL_HEIGHT;
    this.canvas.className = 'resonance-pixel-canvas';
    this.canvas.style.display = 'block';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.objectFit = 'contain';
    this.canvas.style.imageRendering = 'pixelated';

    // Clear any previous container contents and inject retro canvas
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(this.canvas);

    const ctx = this.canvas.getContext('2d', { alpha: false });
    if (!ctx) throw new Error('Could not acquire 2D context for PixelCanvasRenderer');
    this.ctx = ctx;
    this.ctx.imageSmoothingEnabled = false;

    this.spriteManager = SpriteImageManager.getInstance();

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('debugGeometry') === '1' || params.get('debug') === 'geometry') {
        this.isDebugOverlayEnabled = true;
      }
    }
  }

  public getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  public toggleDebugOverlay(): void {
    this.isDebugOverlayEnabled = !this.isDebugOverlayEnabled;
  }

  /**
   * Main 16-Bit Sega Super Scaler / OutRun Arcade Render Pass.
   */
  public render(worldEngine: WorldEngine, state: WorldState): void {
    const ctx = this.ctx;
    const width = PixelCanvasRenderer.LOGICAL_WIDTH;
    const height = PixelCanvasRenderer.LOGICAL_HEIGHT;
    const horizonRatio = PixelCanvasRenderer.CANONICAL_HORIZON_RATIO;
    const horizonRow = Math.floor(height * horizonRatio); // y = 78

    const sky = state.sky;
    const biome = state.biomeBlend.currentBiome;
    const palette = state.biomeBlend.blendedPalette;
    const camera = state.camera;
    const isTropical = biome.id === 'TROPICAL';
    const isGlacial = biome.id === 'ALPINE';

    // =========================================================================
    // 1. SKY & MONUMENTAL OUTRUN CUMULUS BACKDROP
    // =========================================================================
    if (isTropical && this.spriteManager.skyImg.complete && this.spriteManager.skyImg.naturalWidth > 0) {
      // Direct 1:1 Sega OutRun Summer Sky & Cloudscape
      ctx.drawImage(this.spriteManager.skyImg, 0, 0, width, horizonRow);
    } else {
      const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonRow);
      skyGrad.addColorStop(0.0, sky.skyTopColor);
      skyGrad.addColorStop(0.50, sky.skyMidColor);
      skyGrad.addColorStop(0.90, sky.skyBottomColor);
      skyGrad.addColorStop(1.0, sky.horizonGlowColor);
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, horizonRow);
      this.renderMonumental16BitClouds(ctx, width, horizonRow, state.worldTime);
    }

    // =========================================================================
    // 2. PARALLAX HORIZON & DISTANT ISLANDS
    // =========================================================================
    this.render16BitHorizon(ctx, width, horizonRow, biome.id, camera.x, palette.mountains);

    // =========================================================================
    // 3. EXPANSIVE 90% OUTRUN FLAT ROAD & TERRAIN
    // =========================================================================
    const roadSlices = this.render16BitRoadAndTerrain(ctx, width, height, horizonRow, horizonRatio, worldEngine, state, palette, isTropical, isGlacial);

    // =========================================================================
    // 4. 16-BIT PERSPECTIVE SCENERY SPRITES (OutRun Palms, Signs, Traffic)
    // =========================================================================
    this.render16BitSceneryAndTraffic(ctx, width, height, horizonRow, horizonRatio, worldEngine, state, biome.id);

    // =========================================================================
    // 5. PROTAGONIST 16-BIT OUTRUN FERRARI TESTAROSSA ROADSTER
    // =========================================================================
    this.renderPlayerFerrari(ctx, width, height, horizonRatio, worldEngine, state);

    // =========================================================================
    // 6. OPTIONAL CANONICAL GEOMETRY DEBUG OVERLAY
    // =========================================================================
    if (this.isDebugOverlayEnabled) {
      this.renderGeometryDebugOverlay(ctx, width, horizonRow, roadSlices);
    }
  }

  /**
   * Renders fallback tiered 16-bit volumetric cumulus cloud masses.
   */
  private renderMonumental16BitClouds(
    ctx: CanvasRenderingContext2D,
    width: number,
    horizonRow: number,
    time: number
  ): void {
    const cloudParallax = (time * 2.0) % width;
    const drawPixelCloud = (cx: number, cy: number, w: number, h: number) => {
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(cx - Math.floor(w * 0.5), cy - h, w, h);
      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(cx - Math.floor(w * 0.45), cy - h - 3, Math.floor(w * 0.9), h - 2);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(cx - Math.floor(w * 0.4), cy - h - 6, Math.floor(w * 0.75), Math.floor(h * 0.5));
    };

    const bank1X = Math.round((140 - cloudParallax + width * 2) % width);
    drawPixelCloud(bank1X - 35, horizonRow - 10, 60, 24);
    drawPixelCloud(bank1X + 35, horizonRow - 12, 70, 30);
    drawPixelCloud(bank1X, horizonRow - 16, 90, 42);
  }

  /**
   * Renders 16-bit coastal horizon islands, peninsulas and glacial mountain peaks.
   */
  private render16BitHorizon(
    ctx: CanvasRenderingContext2D,
    width: number,
    horizonRow: number,
    biomeId: string,
    cameraX: number,
    baseColor: string
  ): void {
    const isTropical = biomeId === 'TROPICAL';
    const isGlacial = biomeId === 'ALPINE';

    if (isTropical) {
      const camOffset = (cameraX * 0.008) % width;
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(0, horizonRow - 1, width, 1);

      const islands = [
        { x: 30, w: 70, h: 10 },
        { x: 140, w: 85, h: 14 },
        { x: 250, w: 65, h: 9 },
      ];

      for (const isl of islands) {
        const px = Math.round((isl.x - camOffset + width * 2) % width);
        ctx.fillStyle = '#15803d';
        ctx.beginPath();
        ctx.moveTo(px, horizonRow);
        ctx.lineTo(px + isl.w * 0.5, horizonRow - isl.h);
        ctx.lineTo(px + isl.w, horizonRow);
        ctx.fill();

        ctx.fillStyle = '#fef08a';
        ctx.fillRect(px + 4, horizonRow - 2, isl.w - 8, 2);
      }
    } else if (isGlacial) {
      const camOffset = (cameraX * 0.012) % width;
      ctx.fillStyle = '#1e293b';
      for (let x = 0; x < width; x += 24) {
        const px = (x - camOffset + width * 2) % width;
        const h = 16 + Math.floor(Math.sin((x + 10) * 0.15) * 8);
        ctx.beginPath();
        ctx.moveTo(px, horizonRow);
        ctx.lineTo(px + 12, horizonRow - h);
        ctx.lineTo(px + 24, horizonRow);
        ctx.fill();

        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.moveTo(px + 6, horizonRow - h + 6);
        ctx.lineTo(px + 12, horizonRow - h);
        ctx.lineTo(px + 18, horizonRow - h + 6);
        ctx.fill();
        ctx.fillStyle = '#1e293b';
      }
    } else {
      const camOffset = (cameraX * 0.012) % width;
      ctx.fillStyle = baseColor;
      for (let x = 0; x < width; x += 2) {
        const wx = (x + camOffset) * 0.04;
        const h = Math.max(4, Math.floor(Math.sin(wx) * 7 + 9));
        ctx.fillRect(x, horizonRow - h, 2, h);
      }
    }
  }

  /**
   * Renders the expansive 90% OutRun Road, Turquoise Ocean Surf & Golden Sand Beach / Snow.
   */
  private render16BitRoadAndTerrain(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    horizonRow: number,
    horizonRatio: number,
    worldEngine: WorldEngine,
    state: WorldState,
    palette: typeof state.biomeBlend.blendedPalette,
    isTropical: boolean,
    isGlacial: boolean
  ): RoadSpaceResult[] {
    const road = worldEngine.getRoad();
    const camera = state.camera;
    const drawDistance = 1100;
    const stepZ = road.segmentLength;
    const startZ = Math.floor((camera.z + 10) / stepZ) * stepZ;
    const endZ = startZ + drawDistance;

    const slices: RoadSpaceResult[] = [];
    for (let z = startZ; z <= endZ; z += stepZ) {
      const proj = Perspective.projectRoadSpace(z, 0, camera, road, width, height, horizonRatio);
      if (proj.visible && proj.screenY >= horizonRow - 1) {
        proj.roadHalfWidth = Math.round(proj.roadHalfWidth * 1.45);
        proj.roadLeft = proj.roadCenterX - proj.roadHalfWidth;
        proj.roadRight = proj.roadCenterX + proj.roadHalfWidth;
        slices.push(proj);
      }
    }

    if (slices.length < 2) return slices;

    ctx.fillStyle = isGlacial ? '#f8fafc' : (isTropical ? '#fef3c7' : palette.ground);
    ctx.fillRect(0, horizonRow, width, height - horizonRow);

    for (let i = 0; i < slices.length - 1; i++) {
      const near = slices[i];
      const far = slices[i + 1];

      const yBot = Math.round(near.screenY);
      const yTop = Math.round(far.screenY);
      if (yBot <= yTop) continue;

      const isEven = Math.floor(near.depth / 25) % 2 === 0;

      // 1. TERRAIN SHOULDERS
      if (isTropical) {
        const oceanColor = isEven ? '#0284c7' : '#0369a1';
        ctx.fillStyle = oceanColor;
        ctx.fillRect(0, yTop, Math.max(0, Math.floor(near.roadLeft)), yBot - yTop);

        if (near.roadLeft > 0) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(Math.floor(near.roadLeft) - 5, yTop, 5, yBot - yTop);
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(Math.floor(near.roadLeft) - 9, yTop, 4, yBot - yTop);
        }

        const sandColor = isEven ? '#fef3c7' : '#fde68a';
        ctx.fillStyle = sandColor;
        const rightSandX = Math.floor(near.roadRight);
        if (rightSandX < width) {
          ctx.fillRect(rightSandX, yTop, width - rightSandX, yBot - yTop);
        }
      } else if (isGlacial) {
        const snowColor = isEven ? '#f8fafc' : '#f1f5f9';
        ctx.fillStyle = snowColor;
        ctx.fillRect(0, yTop, width, yBot - yTop);
      } else {
        const groundColor = isEven ? palette.ground : ColorPalette.scaleBrightness(palette.ground, 1.10);
        ctx.fillStyle = groundColor;
        ctx.fillRect(0, yTop, width, yBot - yTop);
      }

      // 2. RED & WHITE RUMBLE CURBS (KERBS)
      const curbWidthNear = Math.max(3, Math.round(near.roadHalfWidth * 0.10));
      const curbWidthFar = Math.max(2, Math.round(far.roadHalfWidth * 0.10));
      const curbColor = isEven ? '#dc2626' : '#ffffff';

      ctx.fillStyle = curbColor;
      ctx.beginPath();
      ctx.moveTo(near.roadLeft - curbWidthNear, yBot);
      ctx.lineTo(near.roadLeft, yBot);
      ctx.lineTo(far.roadLeft, yTop);
      ctx.lineTo(far.roadLeft - curbWidthFar, yTop);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(near.roadRight, yBot);
      ctx.lineTo(near.roadRight + curbWidthNear, yBot);
      ctx.lineTo(far.roadRight + curbWidthFar, yTop);
      ctx.lineTo(far.roadRight, yTop);
      ctx.fill();

      // 3. HIGH-CONTRAST GREY ASPHALT
      const roadColor = isEven ? '#64748b' : '#475569';
      ctx.fillStyle = roadColor;
      ctx.beginPath();
      ctx.moveTo(near.roadLeft, yBot);
      ctx.lineTo(near.roadRight, yBot);
      ctx.lineTo(far.roadRight, yTop);
      ctx.lineTo(far.roadLeft, yTop);
      ctx.fill();

      // 4. WHITE DASHED LANE MARKINGS (3 Lanes)
      if (isEven) {
        const laneWNear = Math.max(1, Math.round(near.roadHalfWidth * 0.022));
        const laneWFar = Math.max(1, Math.round(far.roadHalfWidth * 0.022));
        ctx.fillStyle = '#ffffff';

        const leftLaneNear = near.roadCenterX - near.roadHalfWidth * 0.33;
        const leftLaneFar = far.roadCenterX - far.roadHalfWidth * 0.33;
        const rightLaneNear = near.roadCenterX + near.roadHalfWidth * 0.33;
        const rightLaneFar = far.roadCenterX + far.roadHalfWidth * 0.33;

        ctx.beginPath();
        ctx.moveTo(leftLaneNear - laneWNear, yBot);
        ctx.lineTo(leftLaneNear + laneWNear, yBot);
        ctx.lineTo(leftLaneFar + laneWFar, yTop);
        ctx.lineTo(leftLaneFar - laneWFar, yTop);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(rightLaneNear - laneWNear, yBot);
        ctx.lineTo(rightLaneNear + laneWNear, yBot);
        ctx.lineTo(rightLaneFar + laneWFar, yTop);
        ctx.lineTo(rightLaneFar - laneWFar, yTop);
        ctx.fill();
      }
    }

    return slices;
  }

  /**
   * Renders 16-bit perspective-scaled scenery props and traffic.
   */
  private render16BitSceneryAndTraffic(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    horizonRow: number,
    horizonRatio: number,
    worldEngine: WorldEngine,
    state: WorldState,
    biomeId: string
  ): void {
    const camera = state.camera;
    const road = worldEngine.getRoad();
    const isTropical = biomeId === 'TROPICAL';

    interface EntityToRender {
      z: number;
      screenX: number;
      screenY: number;
      scale: number;
      image?: HTMLImageElement;
      sprite?: PixelSprite;
      width: number;
      height: number;
    }
    const entities: EntityToRender[] = [];

    // 1. Scenery Props
    const visibleScenery = worldEngine.getDirector().getScenery();
    let lastLeftZ = -9999;
    let lastRightZ = -9999;
    const minZSpacing = 110;

    for (const item of visibleScenery) {
      const relZ = item.z - camera.z;
      if (relZ > 20 && relZ < 1050) {
        const isLeft = item.lateralOffset < 0;
        if (isLeft && Math.abs(item.z - lastLeftZ) < minZSpacing) continue;
        if (!isLeft && Math.abs(item.z - lastRightZ) < minZSpacing) continue;

        const proj = Perspective.projectRoadSpace(
          item.z,
          item.lateralOffset,
          camera,
          road,
          width,
          height,
          horizonRatio
        );

        if (proj.visible && proj.screenY >= horizonRow) {
          if (isTropical) {
            const img = isLeft ? this.spriteManager.signImg : this.spriteManager.palmRightImg;
            const w = isLeft ? 28 : 95;
            const h = isLeft ? 40 : 190;
            const scale = isLeft
              ? Math.min(1.2, Math.max(0.20, proj.scale * 1.6))
              : Math.min(0.85, Math.max(0.18, proj.scale * 1.25));
            
            // Anchor palms to the right sand beach, and signs to left margin
            const sx = isLeft
              ? Math.max(12, proj.roadLeft - Math.round(18 * scale * 2))
              : Math.min(width - Math.round(w * scale * 0.40), proj.roadRight + Math.round(28 * scale * 2));

            entities.push({
              z: proj.depth,
              screenX: sx,
              screenY: proj.screenY,
              scale,
              image: img,
              width: w,
              height: h,
            });
          } else {
            const sprite = PixelSpriteCatalog.getScenerySprite(item.sprite.id, biomeId);
            const scale = Math.min(1.8, Math.max(0.18, proj.scale * 2.0));
            entities.push({
              z: proj.depth,
              screenX: proj.screenX,
              screenY: proj.screenY,
              scale,
              sprite,
              width: sprite.width,
              height: sprite.height,
            });
          }

          if (isLeft) lastLeftZ = item.z;
          else lastRightZ = item.z;
        }
      }
    }

    entities.sort((a, b) => a.z - b.z);
    const culledScenery = entities.slice(0, 5);

    // 2. Traffic Vehicle
    const traffic = worldEngine.getTraffic().getVehicles();
    for (const veh of traffic) {
      const proj = Perspective.projectRoadSpace(
        veh.z,
        veh.lateralOffset,
        camera,
        road,
        width,
        height,
        horizonRatio
      );

      if (proj.visible && proj.screenY >= horizonRow && proj.depth > 35) {
        const img = this.spriteManager.trafficImg;
        const scale = Math.min(1.8, Math.max(0.25, proj.scale * 2.0));
        culledScenery.push({
          z: proj.depth,
          screenX: proj.screenX,
          screenY: proj.screenY,
          scale,
          image: img,
          width: 22,
          height: 14,
        });
        break;
      }
    }

    // Sort Far to Near (Painter's Algorithm)
    culledScenery.sort((a, b) => b.z - a.z);

    // Draw Entities with ground contact shadows
    for (const e of culledScenery) {
      const shadowW = Math.round(e.width * e.scale * 0.45);
      const shadowH = Math.max(2, Math.round(e.scale * 3));
      ctx.fillStyle = '#0f172a';
      ctx.globalAlpha = 0.35;
      ctx.beginPath();
      ctx.ellipse(e.screenX, e.screenY - 1, shadowW, shadowH, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1.0;

      if (e.image && e.image.complete && e.image.naturalWidth > 0) {
        const renderW = Math.round(e.width * e.scale);
        const renderH = Math.round(e.height * e.scale);
        
        // Custom trunk anchor for OutRun palm trees
        let anchorX = 0.5;
        if (e.image === this.spriteManager.palmRightImg) {
          anchorX = 0.72; // Right palm trunk is at 72% width
        } else if (e.image === this.spriteManager.palmImg) {
          anchorX = 0.25; // Left palm trunk is at 25% width
        }

        ctx.drawImage(
          e.image,
          Math.round(e.screenX - renderW * anchorX),
          Math.round(e.screenY - renderH),
          renderW,
          renderH
        );
      } else if (e.sprite) {
        this.drawPixelSprite(ctx, e.sprite, e.screenX, e.screenY, e.scale);
      }
    }
  }

  /**
   * Renders the 16-Bit Protagonist OutRun Ferrari Testarossa Roadster.
   */
  private renderPlayerFerrari(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    horizonRatio: number,
    worldEngine: WorldEngine,
    state: WorldState
  ): void {
    const road = worldEngine.getRoad();
    const camera = state.camera;
    const proj = Perspective.projectRoadSpace(
      state.player.z,
      state.player.lateralOffset,
      camera,
      road,
      width,
      height,
      horizonRatio
    );

    const playerX = Math.round(proj.screenX);
    const playerY = height - 2;

    // OutRun Oval Ground Shadow under Ferrari tires
    ctx.fillStyle = '#020617';
    ctx.globalAlpha = 0.65;
    ctx.beginPath();
    ctx.ellipse(playerX, playerY - 1, 40, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;

    // Draw Authentic 1:1 OutRun Ferrari Testarossa Roadster (77x41px)
    if (this.spriteManager.ferrariImg.complete && this.spriteManager.ferrariImg.naturalWidth > 0) {
      const renderW = 77;
      const renderH = 41;
      ctx.drawImage(
        this.spriteManager.ferrariImg,
        Math.round(playerX - renderW * 0.5),
        Math.round(playerY - renderH),
        renderW,
        renderH
      );
    } else {
      this.drawPixelSprite(ctx, PixelSpriteCatalog.PLAYER_CAR_16BIT, playerX, playerY, 1.0);
    }
  }

  /**
   * Fallback rasterizer for procedural pixel sprites.
   */
  private drawPixelSprite(
    ctx: CanvasRenderingContext2D,
    sprite: PixelSprite,
    centerX: number,
    bottomY: number,
    scale: number
  ): void {
    if (!sprite || !sprite.matrix) return;
    const matrix = sprite.matrix;
    const palette = sprite.palette;
    const h = matrix.length;
    if (h === 0) return;
    const w = matrix[0].length;

    const scaledPixelSize = Math.max(1, Math.round(scale));
    const renderWidth = w * scaledPixelSize;
    const renderHeight = h * scaledPixelSize;

    const startX = Math.round(centerX - renderWidth * 0.5);
    const startY = Math.round(bottomY - renderHeight);

    for (let r = 0; r < h; r++) {
      const row = matrix[r];
      if (!row) continue;
      const py = startY + r * scaledPixelSize;
      if (py < 0 || py >= PixelCanvasRenderer.LOGICAL_HEIGHT) continue;

      for (let c = 0; c < row.length; c++) {
        const colorIdx = row[c];
        if (colorIdx > 0 && colorIdx < palette.length) {
          const px = startX + c * scaledPixelSize;
          if (px < 0 || px >= PixelCanvasRenderer.LOGICAL_WIDTH) continue;

          ctx.fillStyle = palette[colorIdx];
          ctx.fillRect(px, py, scaledPixelSize, scaledPixelSize);
        }
      }
    }
  }

  /**
   * Diagnostic Debug Overlay displaying mathematical perspective vectors.
   */
  private renderGeometryDebugOverlay(
    ctx: CanvasRenderingContext2D,
    width: number,
    horizonRow: number,
    slices: RoadSpaceResult[]
  ): void {
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, horizonRow);
    ctx.lineTo(width, horizonRow);
    ctx.stroke();

    if (slices.length > 1) {
      ctx.strokeStyle = '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(slices[0].roadLeft, slices[0].screenY);
      for (let i = 1; i < slices.length; i++) {
        ctx.lineTo(slices[i].roadLeft, slices[i].screenY);
      }
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(slices[0].roadRight, slices[0].screenY);
      for (let i = 1; i < slices.length; i++) {
        ctx.lineTo(slices[i].roadRight, slices[i].screenY);
      }
      ctx.stroke();

      ctx.strokeStyle = '#fde047';
      ctx.beginPath();
      ctx.moveTo(slices[0].roadCenterX, slices[0].screenY);
      for (let i = 1; i < slices.length; i++) {
        ctx.lineTo(slices[i].roadCenterX, slices[i].screenY);
      }
      ctx.stroke();
    }
  }
}
