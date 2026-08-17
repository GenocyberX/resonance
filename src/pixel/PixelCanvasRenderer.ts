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
  public static readonly CANONICAL_HORIZON_RATIO = 0.42; // y = 75 on 180p (42% Sky, 58% Road & Terrain)

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
   * Main Unified Solid Pixel Art Render Pass.
   * Built on a Single Canonical Road-Space Projection System.
   */
  public render(worldEngine: WorldEngine, state: WorldState): void {
    const ctx = this.ctx;
    const width = PixelCanvasRenderer.LOGICAL_WIDTH;
    const height = PixelCanvasRenderer.LOGICAL_HEIGHT;
    const horizonRatio = PixelCanvasRenderer.CANONICAL_HORIZON_RATIO;
    const horizonRow = Math.floor(height * horizonRatio); // y = 75

    const sky = state.sky;
    const biome = state.biomeBlend.currentBiome;
    const palette = state.biomeBlend.blendedPalette;
    const camera = state.camera;
    const time = state.worldTime;

    // =========================================================================
    // 1. SKY GRADIENT (Rich Multi-Stop Diurnal Atmospheric Gradient)
    // =========================================================================
    const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonRow);
    skyGrad.addColorStop(0.0, sky.skyTopColor);
    skyGrad.addColorStop(0.50, sky.skyMidColor);
    skyGrad.addColorStop(0.90, sky.skyBottomColor);
    skyGrad.addColorStop(1.0, sky.horizonGlowColor);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, horizonRow);

    // Horizon Atmospheric Glow Band
    ctx.fillStyle = sky.horizonGlowColor;
    ctx.globalAlpha = 0.30;
    ctx.fillRect(0, horizonRow - 4, width, 4);
    ctx.globalAlpha = 1.0;

    // =========================================================================
    // 2. STARS (Twinkling Starlight Field in Night Phasing)
    // =========================================================================
    if (sky.starVisibility > 0.05) {
      const stars = worldEngine.getSkyDirector().getCelestialSystem().getStars();
      for (const star of stars) {
        const sx = Math.floor(star.xNorm * width);
        const sy = Math.floor(star.yNorm * (horizonRow - 4));
        if (sy >= horizonRow - 2) continue;

        const twinkle = 0.70 + 0.30 * Math.sin(time * star.twinkleSpeed + star.twinkleOffset);
        const alpha = Math.min(1.0, star.baseBrightness * sky.starVisibility * twinkle);
        if (alpha > 0.1) {
          ctx.fillStyle = star.tier === 'HERO' ? '#67e8f9' : '#ffffff';
          ctx.globalAlpha = alpha;
          ctx.fillRect(sx, sy, star.tier === 'HERO' ? 2 : 1, star.tier === 'HERO' ? 2 : 1);
        }
      }
      ctx.globalAlpha = 1.0;
    }

    // =========================================================================
    // 3. SOLID CELESTIAL BODIES (SUN & MOON)
    // =========================================================================
    // A. Sun
    if (sky.sunVisible && sky.sunElevation > 0.0) {
      const sunX = Math.floor(sky.sunHeadingNorm * width);
      const sunY = Math.floor(horizonRow * (1.0 - sky.sunElevation * 0.76));
      const sunRadius = (sky.timePhase === 'GOLDEN_HOUR' || sky.timePhase === 'SUNSET') ? 13 : 9;

      // Soft Sun Corona
      const haloGrad = ctx.createRadialGradient(sunX, sunY, sunRadius * 0.4, sunX, sunY, sunRadius * 2.2);
      haloGrad.addColorStop(0, sky.sunColor);
      haloGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = haloGrad;
      ctx.globalAlpha = 0.40;
      ctx.beginPath();
      ctx.arc(sunX, sunY, sunRadius * 2.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1.0;

      // Solid Sun Disc
      if (sky.timePhase === 'GOLDEN_HOUR' || sky.timePhase === 'SUNSET') {
        // OutRun Striated Synthwave Sunset Sun
        for (let r = -sunRadius; r <= sunRadius; r++) {
          const dy = r;
          const halfSpan = Math.floor(Math.sqrt(Math.max(0, sunRadius * sunRadius - dy * dy)));
          if (halfSpan <= 0) continue;

          // OutRun horizontal scanline bands
          if (dy > 0 && dy % 2 === 0) continue;

          const t = (dy + sunRadius) / (sunRadius * 2);
          ctx.fillStyle = t < 0.5
            ? ColorPalette.lerp('#fde047', '#f97316', t * 2)
            : ColorPalette.lerp('#f97316', '#dc2626', (t - 0.5) * 2);
          ctx.fillRect(sunX - halfSpan, sunY + dy, halfSpan * 2, 1);
        }
      } else {
        ctx.fillStyle = sky.sunColor;
        ctx.beginPath();
        ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // B. Moon
    if (sky.moonVisible && sky.moonElevation > 0.0) {
      const moonX = Math.floor(sky.moonHeadingNorm * width);
      const moonY = Math.floor(horizonRow * (1.0 - sky.moonElevation * 0.75));
      const moonRadius = 7;

      // Soft Moon Halo
      ctx.fillStyle = '#67e8f9';
      ctx.globalAlpha = 0.20;
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonRadius * 1.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1.0;

      // Solid Moon Disc with Craters
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(moonX - 2, moonY - 2, 2, 2);
      ctx.fillRect(moonX + 1, moonY + 1, 2, 2);
    }

    // =========================================================================
    // 4. VOLUMETRIC SOLID PIXEL CLOUDS (Restrained, Handcrafted 3-Tone Masses)
    // =========================================================================
    const clouds = worldEngine.getSkyDirector().getCloudManager().getInstances();
    const visibleClouds = clouds.slice(0, 4);
    for (const cloud of visibleClouds) {
      const matrix = cloud.mask.matrix;
      const startX = Math.floor(cloud.xNorm * width);
      const startY = Math.floor(cloud.yNorm * (horizonRow - 12));

      for (let r = 0; r < matrix.length; r++) {
        const row = matrix[r];
        const cy = startY + r;
        if (cy < 0 || cy >= horizonRow) continue;

        for (let c = 0; c < row.length; c++) {
          const val = row[c];
          if (val > 0) {
            const cx = (startX + c + width) % width;
            let color = sky.cloudBodyColor;
            if (val === 3) color = sky.cloudHighlightColor;
            if (val === 1) color = sky.cloudShadowColor;

            ctx.fillStyle = color;
            ctx.fillRect(cx, cy, 1, 1);
          }
        }
      }
    }

    // =========================================================================
    // 5. PARALLAX HORIZON MOUNTAINS / SKYLINE (Layered Multi-Depth Silhouettes)
    // =========================================================================
    this.renderHorizonSilhouettes(ctx, width, horizonRow, biome.id, camera.x, palette.mountains, sky.horizonGlowColor);

    // =========================================================================
    // 6. 3D PERSPECTIVE CANONICAL ROAD & TERRAIN
    // =========================================================================
    const roadSlices = this.render3DRoadAndTerrain(ctx, width, height, horizonRow, horizonRatio, worldEngine, state, palette);

    // =========================================================================
    // 7. PERSPECTIVE-SCALED SCENERY SPRITES & TRAFFIC (Single Canonical Road-Space)
    // =========================================================================
    this.renderWorldEntities(ctx, width, height, horizonRow, horizonRatio, worldEngine, state);

    // =========================================================================
    // 8. PROTAGONIST PLAYER VEHICLE (Canonical Projection Anchor)
    // =========================================================================
    this.renderPlayerVehicle(ctx, width, height, horizonRatio, worldEngine, state);

    // =========================================================================
    // 9. ATMOSPHERIC WEATHER (Rain, Snow, Lightning)
    // =========================================================================
    this.renderWeatherOverlay(ctx, width, height, state);

    // =========================================================================
    // 10. OPTIONAL CANONICAL GEOMETRY DEBUG OVERLAY
    // =========================================================================
    if (this.isDebugOverlayEnabled) {
      this.renderGeometryDebugOverlay(ctx, width, horizonRow, roadSlices);
    }
  }

  /**
   * Renders solid pixel-art multi-layer parallax mountain ranges and skyline silhouettes.
   */
  private renderHorizonSilhouettes(
    ctx: CanvasRenderingContext2D,
    width: number,
    horizonRow: number,
    biomeId: string,
    cameraX: number,
    baseColor: string,
    horizonGlow: string
  ): void {
    const isTropical = biomeId === 'TROPICAL';
    const isDesert = biomeId === 'DESERT';
    const isAlpine = biomeId === 'ALPINE';
    const isCyber = biomeId === 'NEON_CITY';

    if (isCyber) {
      ctx.fillStyle = horizonGlow;
      ctx.globalAlpha = 0.20;
      ctx.fillRect(0, horizonRow - 4, width, 4);
      ctx.globalAlpha = 1.0;

      // Layer 1: Distant Spire silhouettes
      const camOffset1 = (cameraX * 0.008) % width;
      ctx.fillStyle = ColorPalette.scaleBrightness(baseColor, 0.35);
      for (let x = 0; x < width; x += 36) {
        const bx = (x - camOffset1 + width * 2) % width;
        ctx.fillRect(bx, horizonRow - 38, 12, 38);
        ctx.fillRect(bx + 4, horizonRow - 48, 4, 10);
      }

      // Layer 2: Mid Skyscrapers with Neon Windows
      const camOffset2 = (cameraX * 0.016) % width;
      ctx.fillStyle = ColorPalette.scaleBrightness(baseColor, 0.55);
      const buildings = [
        { x: 10, w: 22, h: 28 }, { x: 42, w: 18, h: 38 }, { x: 68, w: 24, h: 22 },
        { x: 100, w: 20, h: 34 }, { x: 128, w: 28, h: 44 }, { x: 168, w: 18, h: 28 },
        { x: 194, w: 24, h: 36 }, { x: 226, w: 20, h: 24 }, { x: 254, w: 26, h: 40 },
        { x: 290, w: 18, h: 30 },
      ];
      for (const b of buildings) {
        const bx = (b.x - camOffset2 + width * 2) % width;
        ctx.fillRect(bx, horizonRow - b.h, b.w, b.h);

        // Neon Windows & Cyan Roof Edges
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(bx + 2, horizonRow - b.h + 2, b.w - 4, 1);
        ctx.fillRect(bx + 4, horizonRow - b.h + 8, b.w - 8, 1);
        ctx.fillStyle = '#ec4899';
        ctx.fillRect(bx + 3, horizonRow - b.h + 14, b.w - 6, 1);
        ctx.fillStyle = ColorPalette.scaleBrightness(baseColor, 0.55);
      }
    } else if (isDesert) {
      // Layer 1: Distant Pale Canyon Ridges
      const camOffset1 = (cameraX * 0.008) % width;
      ctx.fillStyle = ColorPalette.scaleBrightness(baseColor, 0.60);
      for (let x = 0; x < width; x += 55) {
        const mx = (x - camOffset1 + width * 2) % width;
        ctx.fillRect(mx, horizonRow - 12, 45, 12);
      }

      // Layer 2: Foreground Stepped Mesas
      const camOffset2 = (cameraX * 0.016) % width;
      ctx.fillStyle = baseColor;
      const mesas = [
        { x: 15, w: 48, h: 18 }, { x: 85, w: 38, h: 14 },
        { x: 145, w: 55, h: 22 }, { x: 225, w: 42, h: 16 }, { x: 285, w: 50, h: 20 },
      ];
      for (const m of mesas) {
        const mx = (m.x - camOffset2 + width * 2) % width;
        ctx.fillRect(mx + 6, horizonRow - m.h, m.w - 12, m.h);
        ctx.fillRect(mx + 3, horizonRow - m.h + 4, m.w - 6, m.h - 4);
        ctx.fillRect(mx, horizonRow - m.h + 8, m.w, m.h - 8);
      }
    } else if (isTropical) {
      // Layer 1: Distant Islands
      const camOffset1 = (cameraX * 0.006) % width;
      ctx.fillStyle = ColorPalette.scaleBrightness(baseColor, 0.50);
      const distantIslands = [
        { x: 20, w: 65, h: 14 }, { x: 125, w: 50, h: 10 },
        { x: 210, w: 75, h: 18 }, { x: 305, w: 55, h: 12 },
      ];
      for (const p of distantIslands) {
        const px = (p.x - camOffset1 + width * 2) % width;
        ctx.beginPath();
        ctx.moveTo(px, horizonRow);
        ctx.lineTo(px + p.w * 0.5, horizonRow - p.h);
        ctx.lineTo(px + p.w, horizonRow);
        ctx.fill();
      }

      // Layer 2: Foreground Headland Peaks
      const camOffset2 = (cameraX * 0.014) % width;
      ctx.fillStyle = baseColor;
      const nearPeaks = [
        { x: 50, w: 42, h: 12 }, { x: 165, w: 46, h: 14 }, { x: 275, w: 38, h: 10 },
      ];
      for (const p of nearPeaks) {
        const px = (p.x - camOffset2 + width * 2) % width;
        ctx.beginPath();
        ctx.moveTo(px, horizonRow);
        ctx.lineTo(px + p.w * 0.5, horizonRow - p.h);
        ctx.lineTo(px + p.w, horizonRow);
        ctx.fill();
      }
    } else if (isAlpine) {
      // Jagged Glacial Peaks with Snow Caps
      const camOffset = (cameraX * 0.014) % width;
      ctx.fillStyle = baseColor;
      for (let x = 0; x < width; x += 22) {
        const px = (x - camOffset + width * 2) % width;
        const h = 15 + Math.floor(Math.sin((x + 10) * 0.15) * 9);
        ctx.beginPath();
        ctx.moveTo(px, horizonRow);
        ctx.lineTo(px + 11, horizonRow - h);
        ctx.lineTo(px + 22, horizonRow);
        ctx.fill();

        // Snow Cap
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.moveTo(px + 5, horizonRow - h + 6);
        ctx.lineTo(px + 11, horizonRow - h);
        ctx.lineTo(px + 17, horizonRow - h + 6);
        ctx.fill();
        ctx.fillStyle = baseColor;
      }
    } else {
      // Rolling Forest Ridges
      const camOffset = (cameraX * 0.012) % width;
      ctx.fillStyle = baseColor;
      for (let x = 0; x < width; x += 2) {
        const wx = (x + camOffset) * 0.04;
        const h = Math.max(5, Math.floor(Math.sin(wx) * 7 + Math.sin(wx * 2.3) * 3 + 10));
        ctx.fillRect(x, horizonRow - h, 2, h);
      }
    }
  }

  /**
   * Renders 3D perspective road scanlines and terrain bands using CANONICAL projectRoadSpace.
   * Returns calculated RoadSpace slices for entity anchoring and debug overlay.
   */
  private render3DRoadAndTerrain(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    horizonRow: number,
    horizonRatio: number,
    worldEngine: WorldEngine,
    state: WorldState,
    palette: typeof state.biomeBlend.blendedPalette
  ): RoadSpaceResult[] {
    const road = worldEngine.getRoad();
    const camera = state.camera;
    const drawDistance = 1100;
    const stepZ = road.segmentLength;
    const startZ = Math.floor((camera.z + 10) / stepZ) * stepZ;
    const endZ = startZ + drawDistance;

    const isTropical = state.biomeBlend.currentBiome.id === 'TROPICAL';
    const slices: RoadSpaceResult[] = [];

    for (let z = startZ; z <= endZ; z += stepZ) {
      const proj = Perspective.projectRoadSpace(z, 0, camera, road, width, height, horizonRatio);
      if (proj.visible && proj.screenY >= horizonRow - 1) {
        slices.push(proj);
      }
    }

    if (slices.length < 2) return slices;

    // Fill Ground Baseline
    ctx.fillStyle = palette.ground;
    ctx.fillRect(0, horizonRow, width, height - horizonRow);

    // Rasterize consecutive trapezoids from near to far
    for (let i = 0; i < slices.length - 1; i++) {
      const near = slices[i];
      const far = slices[i + 1];

      const yBot = Math.round(near.screenY);
      const yTop = Math.round(far.screenY);
      if (yBot <= yTop) continue;

      const isEven = Math.floor(near.depth / 25) % 2 === 0;

      // 1. Terrain Sidewalk / Grass / Ocean
      const groundColor = isEven ? palette.ground : ColorPalette.scaleBrightness(palette.ground, 1.12);
      ctx.fillStyle = groundColor;
      ctx.fillRect(0, yTop, width, yBot - yTop);

      // Tropical Right-Side Ocean with animated wave foam
      if (isTropical) {
        const rightRoadX = near.roadRight;
        const oceanStart = rightRoadX + near.roadHalfWidth * 0.40;
        if (oceanStart < width) {
          const oceanColor = isEven ? '#0284c7' : '#0369a1';
          ctx.fillStyle = oceanColor;
          ctx.fillRect(Math.floor(oceanStart), yTop, width - Math.floor(oceanStart), yBot - yTop);

          // Shoreline white foam ripple
          ctx.fillStyle = '#f8fafc';
          ctx.fillRect(Math.floor(oceanStart) - 2, yTop, 3, yBot - yTop);
        }
      }

      // 2. OutRun Red & White Rumble Curbs (Kerbs) - Canonical Road Space
      const curbWidthNear = Math.max(3, Math.round(near.roadHalfWidth * 0.15));
      const curbWidthFar = Math.max(2, Math.round(far.roadHalfWidth * 0.15));
      const curbColor = isEven ? '#dc2626' : '#f8fafc';

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

      // 3. Solid High-Contrast Asphalt Road
      const roadColor = isEven ? palette.road : ColorPalette.scaleBrightness(palette.road, 1.20);
      ctx.fillStyle = roadColor;
      ctx.beginPath();
      ctx.moveTo(near.roadLeft, yBot);
      ctx.lineTo(near.roadRight, yBot);
      ctx.lineTo(far.roadRight, yTop);
      ctx.lineTo(far.roadLeft, yTop);
      ctx.fill();

      // 4. Dashed Gold Center Lane Markers (3 Lanes)
      if (isEven) {
        const laneWNear = Math.max(1, Math.round(near.roadHalfWidth * 0.035));
        const laneWFar = Math.max(1, Math.round(far.roadHalfWidth * 0.035));
        ctx.fillStyle = '#fde047'; // Bright Gold

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
   * Renders 3D perspective-scaled solid pixel sprites for scenery props and traffic vehicles
   * using the CANONICAL projectRoadSpace projection.
   */
  private renderWorldEntities(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    horizonRow: number,
    horizonRatio: number,
    worldEngine: WorldEngine,
    state: WorldState
  ): void {
    const camera = state.camera;
    const road = worldEngine.getRoad();
    const biomeId = state.biomeBlend.currentBiome.id;

    interface EntityToRender {
      z: number;
      screenX: number;
      screenY: number;
      scale: number;
      sprite: PixelSprite;
    }
    const entities: EntityToRender[] = [];

    // 1. Scenery Props with Canonical Road-Space Projection & Anti-Clutter Filter
    const visibleScenery = worldEngine.getDirector().getScenery();
    let lastLeftZ = -9999;
    let lastRightZ = -9999;
    const minZSpacing = 85;

    for (const item of visibleScenery) {
      const relZ = item.z - camera.z;
      if (relZ > 25 && relZ < 1050) {
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
          const sprite = PixelSpriteCatalog.getScenerySprite(item.sprite.id, biomeId);
          // Scale is derived strictly from perspective depth
          const clampedScale = Math.min(1.85, Math.max(0.22, proj.scale * 2.0));
          entities.push({
            z: proj.depth,
            screenX: proj.screenX,
            screenY: proj.screenY,
            scale: clampedScale,
            sprite,
          });

          if (isLeft) lastLeftZ = item.z;
          else lastRightZ = item.z;
        }
      }
    }

    // Limit maximum visible scenery objects to 8 for clean visual elegance
    entities.sort((a, b) => a.z - b.z);
    const culledScenery = entities.slice(0, 8);

    // 2. Traffic Vehicles with Canonical Road-Space Projection
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

      if (proj.visible && proj.screenY >= horizonRow && proj.depth > 15) {
        const sprite = veh.vehicleType === 'coupe' ? PixelSpriteCatalog.TRAFFIC_CABRIO : PixelSpriteCatalog.TRAFFIC_SEDAN;
        const clampedScale = Math.min(1.8, Math.max(0.25, proj.scale * 1.8));
        culledScenery.push({
          z: proj.depth,
          screenX: proj.screenX,
          screenY: proj.screenY,
          scale: clampedScale,
          sprite,
        });
      }
    }

    // Sort Far to Near (Painter's Algorithm)
    culledScenery.sort((a, b) => b.z - a.z);

    // Draw Entities
    for (const e of culledScenery) {
      this.drawPixelSprite(ctx, e.sprite, e.screenX, e.screenY, e.scale);
    }
  }

  /**
   * Renders the Player's OutRun Retro Red Roadster using Canonical Road-Space Projection.
   */
  private renderPlayerVehicle(
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
    const playerY = Math.max(height - 24, Math.round(proj.screenY));
    const sprite = PixelSpriteCatalog.PLAYER_CAR_STRAIGHT;

    // Road contact shadow under tires
    ctx.fillStyle = '#020617';
    ctx.globalAlpha = 0.65;
    ctx.beginPath();
    ctx.ellipse(playerX, playerY - 1, 22, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;

    // Draw player roadster
    this.drawPixelSprite(ctx, sprite, playerX, playerY, 1.40);
  }

  /**
   * Renders weather overlays (rain, snow, fog, lightning flash).
   */
  private renderWeatherOverlay(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    state: WorldState
  ): void {
    const weather = state.weather;
    const atmosphere = state.sky.ambientAtmosphere;

    // Lightning Flash
    if (atmosphere && atmosphere.lightningFlashIntensity > 0.05) {
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = atmosphere.lightningFlashIntensity * 0.75;
      ctx.fillRect(0, 0, width, height);
      ctx.globalAlpha = 1.0;
    }

    // Rain Streaks
    if (weather.type === 'LIGHT_RAIN' || weather.type === 'HEAVY_RAIN' || weather.type === 'THUNDERSTORM') {
      ctx.strokeStyle = '#93c5fd';
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.50;
      const count = weather.type === 'LIGHT_RAIN' ? 40 : 90;
      const timeSeed = state.worldTime * 25;

      for (let i = 0; i < count; i++) {
        const rx = ((i * 17.3 + timeSeed * 4) % width);
        const ry = ((i * 31.7 + timeSeed * 22) % height);
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.lineTo(rx - 3, ry + 8);
        ctx.stroke();
      }
      ctx.globalAlpha = 1.0;
    }

    // Snowflakes
    if (weather.type === 'SNOW' || weather.type === 'BLIZZARD') {
      ctx.fillStyle = '#f8fafc';
      ctx.globalAlpha = 0.85;
      const count = weather.type === 'BLIZZARD' ? 100 : 50;
      const timeSeed = state.worldTime * 12;

      for (let i = 0; i < count; i++) {
        const sx = ((i * 23.5 + Math.sin(timeSeed + i) * 14 + timeSeed * 2.5) % width);
        const sy = ((i * 41.2 + timeSeed * 9) % height);
        ctx.fillRect(sx, sy, 1, 1);
      }
      ctx.globalAlpha = 1.0;
    }
  }

  /**
   * Fast 2D rasterizer for PixelSprite definitions scaled with nearest-neighbor integer mapping.
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
   * Diagnostic Debug Overlay displaying mathematical perspective vectors,
   * horizon line, vanishing point, and canonical road boundary guides.
   */
  private renderGeometryDebugOverlay(
    ctx: CanvasRenderingContext2D,
    width: number,
    horizonRow: number,
    slices: RoadSpaceResult[]
  ): void {
    ctx.strokeStyle = '#ef4444'; // Red Horizon Guide
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, horizonRow);
    ctx.lineTo(width, horizonRow);
    ctx.stroke();

    // Road Left / Right Outer Geometry Lines
    if (slices.length > 1) {
      ctx.strokeStyle = '#38bdf8'; // Cyan Road Outer Guides
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

      // Road Centerline
      ctx.strokeStyle = '#fde047'; // Gold Center Guide
      ctx.beginPath();
      ctx.moveTo(slices[0].roadCenterX, slices[0].screenY);
      for (let i = 1; i < slices.length; i++) {
        ctx.lineTo(slices[i].roadCenterX, slices[i].screenY);
      }
      ctx.stroke();
    }
  }
}
