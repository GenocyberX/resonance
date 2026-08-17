import { WorldEngine } from '../world/WorldEngine';
import { WorldState } from '../world/WorldState';
import { PixelSprite, PixelSpriteCatalog } from './PixelSpriteCatalog';
import { ColorPalette } from '../ascii/ColorPalette';
import { Perspective, RoadSpaceResult } from '../road/Perspective';

export class PixelCanvasRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  public static readonly LOGICAL_WIDTH = 320;
  public static readonly LOGICAL_HEIGHT = 180;
  public static readonly CANONICAL_HORIZON_RATIO = 0.43; // y = 78 on 180p

  private isDebugOverlayEnabled: boolean = false;

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
    // 1. 16-BIT SEGA SUMMER / DIURNAL SKY GRADIENT
    // =========================================================================
    const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonRow);
    if (isTropical && sky.timePhase !== 'NIGHT') {
      // Classic OutRun Cerulean Summer Sky
      skyGrad.addColorStop(0.0, '#0284c7');
      skyGrad.addColorStop(0.55, '#0ea5e9');
      skyGrad.addColorStop(0.92, '#38bdf8');
      skyGrad.addColorStop(1.0, '#bae6fd');
    } else {
      skyGrad.addColorStop(0.0, sky.skyTopColor);
      skyGrad.addColorStop(0.50, sky.skyMidColor);
      skyGrad.addColorStop(0.90, sky.skyBottomColor);
      skyGrad.addColorStop(1.0, sky.horizonGlowColor);
    }
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, horizonRow);

    // =========================================================================
    // 2. MONUMENTAL 16-BIT VOLUMETRIC CUMULUS CLOUDS (Handcrafted Pixel Blocks)
    // =========================================================================
    this.renderMonumental16BitClouds(ctx, width, horizonRow, state.worldTime);

    // =========================================================================
    // 3. PARALLAX HORIZON & DISTANT LANDSCAPE
    // =========================================================================
    this.render16BitHorizon(ctx, width, horizonRow, biome.id, camera.x, palette.mountains);

    // =========================================================================
    // 4. EXPANSIVE 90% OUTRUN FLAT ROAD & TERRAIN
    // =========================================================================
    const roadSlices = this.render16BitRoadAndTerrain(ctx, width, height, horizonRow, horizonRatio, worldEngine, state, palette, isTropical, isGlacial);

    // =========================================================================
    // 5. 16-BIT PERSPECTIVE SCENERY SPRITES (Strict Biome Mapping)
    // =========================================================================
    this.render16BitSceneryAndTraffic(ctx, width, height, horizonRow, horizonRatio, worldEngine, state, biome.id);

    // =========================================================================
    // 6. PROTAGONIST 16-BIT FERRARI TESTAROSSA ROADSTER
    // =========================================================================
    this.renderPlayerFerrari(ctx, width, height, horizonRatio, worldEngine, state);

    // =========================================================================
    // 7. OPTIONAL CANONICAL GEOMETRY DEBUG OVERLAY
    // =========================================================================
    if (this.isDebugOverlayEnabled) {
      this.renderGeometryDebugOverlay(ctx, width, horizonRow, roadSlices);
    }
  }

  /**
   * Renders majestic, tiered 16-bit Sega OutRun volumetric cumulus cloud masses.
   */
  private renderMonumental16BitClouds(
    ctx: CanvasRenderingContext2D,
    width: number,
    horizonRow: number,
    time: number
  ): void {
    const cloudParallax = (time * 2.0) % width;

    // Helper to draw a crisp 16-bit volumetric pixel cumulus puff
    const drawPixelCloud = (cx: number, cy: number, w: number, h: number) => {
      // 1. Cool Shadow Underside
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(cx - Math.floor(w * 0.5), cy - h, w, h);
      ctx.fillRect(cx - Math.floor(w * 0.4), cy - h - 6, Math.floor(w * 0.8), 6);

      // 2. Mid Volume Body
      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(cx - Math.floor(w * 0.45), cy - h - 3, Math.floor(w * 0.9), h - 2);
      ctx.fillRect(cx - Math.floor(w * 0.35), cy - h - 9, Math.floor(w * 0.7), 8);

      // 3. Pure White Sunlit Rim
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(cx - Math.floor(w * 0.4), cy - h - 6, Math.floor(w * 0.75), Math.floor(h * 0.5));
      ctx.fillRect(cx - Math.floor(w * 0.3), cy - h - 12, Math.floor(w * 0.55), 6);
    };

    // Bank 1: Giant Central Cumulus Cluster
    const bank1X = Math.round((140 - cloudParallax + width * 2) % width);
    drawPixelCloud(bank1X - 35, horizonRow - 10, 60, 24);
    drawPixelCloud(bank1X + 35, horizonRow - 12, 70, 30);
    drawPixelCloud(bank1X, horizonRow - 16, 90, 42);

    // Bank 2: Right Towering Cumulus
    const bank2X = Math.round((300 - cloudParallax * 0.8 + width * 2) % width);
    drawPixelCloud(bank2X - 25, horizonRow - 8, 55, 20);
    drawPixelCloud(bank2X + 25, horizonRow - 14, 80, 34);
    drawPixelCloud(bank2X, horizonRow - 20, 100, 48);

    // Bank 3: Left Distant Cloud Bank
    const bank3X = Math.round((20 - cloudParallax * 0.6 + width * 2) % width);
    drawPixelCloud(bank3X, horizonRow - 10, 75, 26);
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

        // Lush green island body
        ctx.fillStyle = '#15803d';
        ctx.beginPath();
        ctx.moveTo(px, horizonRow);
        ctx.lineTo(px + isl.w * 0.5, horizonRow - isl.h);
        ctx.lineTo(px + isl.w, horizonRow);
        ctx.fill();

        // White sand beach shoreline
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(px + 4, horizonRow - 2, isl.w - 8, 2);
      }
    } else if (isGlacial) {
      // Jagged Glacial Peaks with Snow Caps
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

        // White Snow Cap
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

    // Projected slices buffer
    const slices: RoadSpaceResult[] = [];
    for (let z = startZ; z <= endZ; z += stepZ) {
      const proj = Perspective.projectRoadSpace(z, 0, camera, road, width, height, horizonRatio);
      if (proj.visible && proj.screenY >= horizonRow - 1) {
        // Expand road width to span 90% of screen at the bottom (290px base width)
        proj.roadHalfWidth = Math.round(proj.roadHalfWidth * 1.45);
        proj.roadLeft = proj.roadCenterX - proj.roadHalfWidth;
        proj.roadRight = proj.roadCenterX + proj.roadHalfWidth;
        slices.push(proj);
      }
    }

    if (slices.length < 2) return slices;

    // Fill Ground Baseline
    ctx.fillStyle = isGlacial ? '#f8fafc' : (isTropical ? '#fef3c7' : palette.ground);
    ctx.fillRect(0, horizonRow, width, height - horizonRow);

    // Rasterize consecutive trapezoids from near to far
    for (let i = 0; i < slices.length - 1; i++) {
      const near = slices[i];
      const far = slices[i + 1];

      const yBot = Math.round(near.screenY);
      const yTop = Math.round(far.screenY);
      if (yBot <= yTop) continue;

      const isEven = Math.floor(near.depth / 25) % 2 === 0;

      // 1. TERRAIN SHOULDERS
      if (isTropical) {
        // Left Side: Turquoise Ocean with Wave Foam
        const oceanColor = isEven ? '#0284c7' : '#0369a1';
        ctx.fillStyle = oceanColor;
        ctx.fillRect(0, yTop, Math.max(0, Math.floor(near.roadLeft)), yBot - yTop);

        // White shoreline wave foam ripple on left road edge
        if (near.roadLeft > 0) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(Math.floor(near.roadLeft) - 5, yTop, 5, yBot - yTop);
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(Math.floor(near.roadLeft) - 9, yTop, 4, yBot - yTop);
        }

        // Right Side: Pure Golden/White Sand Beach
        const sandColor = isEven ? '#fef3c7' : '#fde68a';
        ctx.fillStyle = sandColor;
        const rightSandX = Math.floor(near.roadRight);
        if (rightSandX < width) {
          ctx.fillRect(rightSandX, yTop, width - rightSandX, yBot - yTop);
        }
      } else if (isGlacial) {
        // Glacial Snow field
        const snowColor = isEven ? '#f8fafc' : '#f1f5f9';
        ctx.fillStyle = snowColor;
        ctx.fillRect(0, yTop, width, yBot - yTop);
      } else {
        const groundColor = isEven ? palette.ground : ColorPalette.scaleBrightness(palette.ground, 1.10);
        ctx.fillStyle = groundColor;
        ctx.fillRect(0, yTop, width, yBot - yTop);
      }

      // 2. OUTRUN RED & WHITE RUMBLE CURBS (KERBS)
      const curbWidthNear = Math.max(3, Math.round(near.roadHalfWidth * 0.10));
      const curbWidthFar = Math.max(2, Math.round(far.roadHalfWidth * 0.10));
      const curbColor = isEven ? '#dc2626' : '#ffffff';

      // Left Kerb
      ctx.fillStyle = curbColor;
      ctx.beginPath();
      ctx.moveTo(near.roadLeft - curbWidthNear, yBot);
      ctx.lineTo(near.roadLeft, yBot);
      ctx.lineTo(far.roadLeft, yTop);
      ctx.lineTo(far.roadLeft - curbWidthFar, yTop);
      ctx.fill();

      // Right Kerb
      ctx.beginPath();
      ctx.moveTo(near.roadRight, yBot);
      ctx.lineTo(near.roadRight + curbWidthNear, yBot);
      ctx.lineTo(far.roadRight + curbWidthFar, yTop);
      ctx.lineTo(far.roadRight, yTop);
      ctx.fill();

      // 3. SMOOTH HIGH-CONTRAST 16-BIT GREY ASPHALT
      const roadColor = isEven ? '#64748b' : '#475569';
      ctx.fillStyle = roadColor;
      ctx.beginPath();
      ctx.moveTo(near.roadLeft, yBot);
      ctx.lineTo(near.roadRight, yBot);
      ctx.lineTo(far.roadRight, yTop);
      ctx.lineTo(far.roadLeft, yTop);
      ctx.fill();

      // 4. FINE CRISP WHITE/SILVER DASHED LANE MARKINGS (3 Lanes)
      if (isEven) {
        const laneWNear = Math.max(1, Math.round(near.roadHalfWidth * 0.022));
        const laneWFar = Math.max(1, Math.round(far.roadHalfWidth * 0.022));
        ctx.fillStyle = '#ffffff'; // Pure White OutRun Lane Markings

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
   * Renders 16-bit perspective-scaled scenery props and traffic with generous lateral setback.
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

    interface EntityToRender {
      z: number;
      screenX: number;
      screenY: number;
      scale: number;
      sprite: PixelSprite;
    }
    const entities: EntityToRender[] = [];

    // 1. Scenery Props with Generous Lateral Setback (outside the road)
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

        // Apply generous lateral setback (props stand safely on beach/snow)
        const setback = isLeft ? -120 : 120;
        const adjustedOffset = item.lateralOffset + setback;

        const proj = Perspective.projectRoadSpace(
          item.z,
          adjustedOffset,
          camera,
          road,
          width,
          height,
          horizonRatio
        );

        if (proj.visible && proj.screenY >= horizonRow) {
          const sprite = PixelSpriteCatalog.getScenerySprite(item.sprite.id, biomeId);
          const scale = Math.min(1.8, Math.max(0.18, proj.scale * 2.0));
          entities.push({
            z: proj.depth,
            screenX: proj.screenX,
            screenY: proj.screenY,
            scale,
            sprite,
          });

          if (isLeft) lastLeftZ = item.z;
          else lastRightZ = item.z;
        }
      }
    }

    // Limit maximum visible scenery objects to 5 for clean OutRun composition
    entities.sort((a, b) => a.z - b.z);
    const culledScenery = entities.slice(0, 5);

    // 2. Traffic Vehicle (Max 1 visible ahead)
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
        const sprite = PixelSpriteCatalog.PLAYER_CAR_16BIT; // High detail vehicle
        const scale = Math.min(1.4, Math.max(0.18, proj.scale * 1.5));
        culledScenery.push({
          z: proj.depth,
          screenX: proj.screenX,
          screenY: proj.screenY,
          scale,
          sprite,
        });
        break;
      }
    }

    // Sort Far to Near (Painter's Algorithm)
    culledScenery.sort((a, b) => b.z - a.z);

    // Draw Entities with ground contact shadows
    for (const e of culledScenery) {
      // Ground Contact Shadow
      const shadowW = Math.round(e.sprite.width * e.scale * 0.45);
      const shadowH = Math.max(2, Math.round(e.scale * 3));
      ctx.fillStyle = '#0f172a';
      ctx.globalAlpha = 0.35;
      ctx.beginPath();
      ctx.ellipse(e.screenX, e.screenY - 1, shadowW, shadowH, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1.0;

      this.drawPixelSprite(ctx, e.sprite, e.screenX, e.screenY, e.scale);
    }
  }

  /**
   * Renders the 16-Bit Protagonist Ferrari Testarossa Roadster.
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
    const playerY = height - 4;
    const sprite = PixelSpriteCatalog.PLAYER_CAR_16BIT;

    // OutRun Oval Ground Shadow under Ferrari tires
    ctx.fillStyle = '#020617';
    ctx.globalAlpha = 0.60;
    ctx.beginPath();
    ctx.ellipse(playerX, playerY - 2, 34, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;

    // Draw Full 16-Bit 64x28 Ferrari Roadster
    this.drawPixelSprite(ctx, sprite, playerX, playerY, 1.0);
  }

  /**
   * Direct rasterizer for 16-bit PixelSprite definitions.
   */
  private drawPixelSprite(
    ctx: CanvasRenderingContext2D,
    sprite: PixelSprite,
    centerX: number,
    bottomY: number,
    scale: number
  ): void {
    const w = sprite.width;
    const h = sprite.height;
    const matrix = sprite.matrix;
    const palette = sprite.palette;

    const scaledPixelSize = Math.max(1, Math.round(scale));
    const renderWidth = w * scaledPixelSize;
    const renderHeight = h * scaledPixelSize;

    const startX = Math.round(centerX - renderWidth * 0.5);
    const startY = Math.round(bottomY - renderHeight);

    for (let r = 0; r < h; r++) {
      const row = matrix[r];
      const py = startY + r * scaledPixelSize;
      if (py < 0 || py >= PixelCanvasRenderer.LOGICAL_HEIGHT) continue;

      for (let c = 0; c < w; c++) {
        const colorIdx = row[c];
        if (colorIdx > 0) {
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
