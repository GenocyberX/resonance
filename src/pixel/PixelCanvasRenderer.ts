import { WorldEngine } from '../world/WorldEngine';
import { WorldState } from '../world/WorldState';
import { PixelSprite, PixelSpriteCatalog } from './PixelSpriteCatalog';
import { ColorPalette } from '../ascii/ColorPalette';
import { Perspective } from '../road/Perspective';

export class PixelCanvasRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  public static readonly LOGICAL_WIDTH = 320;
  public static readonly LOGICAL_HEIGHT = 180;

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
  }

  public getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  /**
   * Main Unified Solid Pixel Art Render Pass.
   */
  public render(worldEngine: WorldEngine, state: WorldState): void {
    const ctx = this.ctx;
    const width = PixelCanvasRenderer.LOGICAL_WIDTH;
    const height = PixelCanvasRenderer.LOGICAL_HEIGHT;
    const horizonRow = Math.floor(height * 0.43); // y = 77 (43% Sky, 57% Road & Terrain)

    const sky = state.sky;
    const biome = state.biomeBlend.currentBiome;
    const palette = state.biomeBlend.blendedPalette;
    const camera = state.camera;
    const time = state.worldTime;

    // 1. SKY GRADIENT (Rich Multi-Stop Diurnal Atmospheric Gradient)
    const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonRow);
    skyGrad.addColorStop(0.0, sky.skyTopColor);
    skyGrad.addColorStop(0.45, sky.skyMidColor);
    skyGrad.addColorStop(0.85, sky.skyBottomColor);
    skyGrad.addColorStop(1.0, sky.horizonGlowColor);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, horizonRow);

    // Horizon Atmospheric Glow Band
    ctx.fillStyle = sky.horizonGlowColor;
    ctx.globalAlpha = 0.35;
    ctx.fillRect(0, horizonRow - 6, width, 6);
    ctx.globalAlpha = 1.0;

    // 2. STARS (128-Star Dynamic Field with Twinkling & Shooting Stars)
    if (sky.starVisibility > 0.05) {
      const stars = worldEngine.getSkyDirector().getCelestialSystem().getStars();
      for (const star of stars) {
        const sx = Math.floor(star.xNorm * width);
        const sy = Math.floor(star.yNorm * (horizonRow - 4));
        if (sy >= horizonRow - 2) continue;

        const twinkle = 0.70 + 0.30 * Math.sin(time * star.twinkleSpeed + star.twinkleOffset);
        const alpha = Math.min(1.0, star.baseBrightness * sky.starVisibility * twinkle);
        if (alpha > 0.08) {
          ctx.fillStyle = star.tier === 'HERO' ? '#67e8f9' : '#ffffff';
          ctx.globalAlpha = alpha;
          ctx.fillRect(sx, sy, star.tier === 'HERO' ? 2 : 1, star.tier === 'HERO' ? 2 : 1);
        }
      }
      ctx.globalAlpha = 1.0;
    }

    // 3. SOLID CELESTIAL BODIES (SUN & MOON)
    // A. Sun
    if (sky.sunVisible && sky.sunElevation > 0.0) {
      const sunX = Math.floor(sky.sunHeadingNorm * width);
      const sunY = Math.floor(horizonRow * (1.0 - sky.sunElevation * 0.78));
      const sunRadius = (sky.timePhase === 'GOLDEN_HOUR' || sky.timePhase === 'SUNSET') ? 14 : 10;

      // Sun Halo Corona
      const haloGrad = ctx.createRadialGradient(sunX, sunY, sunRadius * 0.4, sunX, sunY, sunRadius * 2.5);
      haloGrad.addColorStop(0, sky.sunColor);
      haloGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = haloGrad;
      ctx.globalAlpha = 0.45;
      ctx.beginPath();
      ctx.arc(sunX, sunY, sunRadius * 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1.0;

      // Solid Sun Disc
      if (sky.timePhase === 'GOLDEN_HOUR' || sky.timePhase === 'SUNSET') {
        // Striated Synthwave / OutRun Sunset Sun with horizontal slit bands
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
      const moonRadius = 8;

      // Soft Moon Halo
      ctx.fillStyle = '#67e8f9';
      ctx.globalAlpha = 0.25;
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonRadius * 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1.0;

      // Solid Moon Disc
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
      ctx.fill();

      // Craters
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(moonX - 3, moonY - 2, 2, 2);
      ctx.fillRect(moonX + 1, moonY + 1, 2, 2);
      ctx.fillRect(moonX - 1, moonY + 3, 2, 1);
    }

    // 4. VOLUMETRIC SOLID PIXEL CLOUDS
    const clouds = worldEngine.getSkyDirector().getCloudManager().getInstances();
    for (const cloud of clouds) {
      const matrix = cloud.mask.matrix;
      const startX = Math.floor(cloud.xNorm * width);
      const startY = Math.floor(cloud.yNorm * horizonRow);

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

    // 5. PARALLAX HORIZON MOUNTAINS / SKYLINE (3-Layer Depth)
    this.renderHorizonSilhouettes(ctx, width, horizonRow, biome.id, camera.x, palette.mountains, sky.horizonGlowColor);

    // 6. 3D PERSPECTIVE ARCADE ROAD & TERRAIN (Dominant OutRun Perspective)
    this.render3DRoadAndTerrain(ctx, width, height, horizonRow, worldEngine, state, palette);

    // 7. PERSPECTIVE-SCALED SCENERY SPRITES & TRAFFIC
    this.renderWorldEntities(ctx, width, height, horizonRow, worldEngine, state);

    // 8. PROTAGONIST PLAYER VEHICLE (OutRun Red Roadster with Turn Tilt)
    this.renderPlayerVehicle(ctx, width, height, state);

    // 9. ATMOSPHERIC WEATHER (Rain, Snow, Lightning)
    this.renderWeatherOverlay(ctx, width, height, state);
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
      // Atmospheric Cyber Horizon Glow
      ctx.fillStyle = horizonGlow;
      ctx.globalAlpha = 0.25;
      ctx.fillRect(0, horizonRow - 4, width, 4);
      ctx.globalAlpha = 1.0;

      // Cyberpunk Metropolis Skyline
      // Layer 1: Distant Spire silhouettes
      const camOffset1 = (cameraX * 0.008) % width;
      ctx.fillStyle = ColorPalette.scaleBrightness(baseColor, 0.35);
      for (let x = 0; x < width; x += 32) {
        const bx = (x - camOffset1 + width * 2) % width;
        ctx.fillRect(bx, horizonRow - 45, 12, 45);
        ctx.fillRect(bx + 4, horizonRow - 58, 4, 13);
      }

      // Layer 2: Mid Skyscrapers with Neon Windows
      const camOffset2 = (cameraX * 0.016) % width;
      ctx.fillStyle = ColorPalette.scaleBrightness(baseColor, 0.55);
      const buildings = [
        { x: 10, w: 22, h: 32 }, { x: 40, w: 18, h: 46 }, { x: 65, w: 26, h: 26 },
        { x: 98, w: 20, h: 40 }, { x: 125, w: 30, h: 52 }, { x: 165, w: 18, h: 34 },
        { x: 190, w: 24, h: 42 }, { x: 220, w: 22, h: 28 }, { x: 250, w: 28, h: 48 },
        { x: 288, w: 20, h: 36 },
      ];
      for (const b of buildings) {
        const bx = (b.x - camOffset2 + width * 2) % width;
        ctx.fillRect(bx, horizonRow - b.h, b.w, b.h);

        // Neon Windows & Cyan Roof Edges
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(bx + 2, horizonRow - b.h + 2, b.w - 4, 1);
        ctx.fillRect(bx + 4, horizonRow - b.h + 8, b.w - 8, 1);
        ctx.fillStyle = '#ec4899';
        ctx.fillRect(bx + 3, horizonRow - b.h + 16, b.w - 6, 1);
        ctx.fillStyle = ColorPalette.scaleBrightness(baseColor, 0.55);
      }
    } else if (isDesert) {
      // Red Rock Canyon Mesas & Flat-Topped Buttes (Layered)
      // Layer 1: Distant Pale Canyon Ridges
      const camOffset1 = (cameraX * 0.008) % width;
      ctx.fillStyle = ColorPalette.scaleBrightness(baseColor, 0.65);
      for (let x = 0; x < width; x += 55) {
        const mx = (x - camOffset1 + width * 2) % width;
        ctx.fillRect(mx, horizonRow - 12, 45, 12);
      }

      // Layer 2: Foreground Stepped Mesas
      const camOffset2 = (cameraX * 0.016) % width;
      ctx.fillStyle = baseColor;
      const mesas = [
        { x: 15, w: 50, h: 20 }, { x: 85, w: 40, h: 15 },
        { x: 145, w: 60, h: 24 }, { x: 225, w: 45, h: 18 }, { x: 285, w: 55, h: 22 },
      ];
      for (const m of mesas) {
        const mx = (m.x - camOffset2 + width * 2) % width;
        // Flat top mesa with stepped sides
        ctx.fillRect(mx + 6, horizonRow - m.h, m.w - 12, m.h);
        ctx.fillRect(mx + 3, horizonRow - m.h + 4, m.w - 6, m.h - 4);
        ctx.fillRect(mx, horizonRow - m.h + 8, m.w, m.h - 8);
      }
    } else if (isTropical) {
      // Coastal Mountain Islands & Ocean Horizon
      // Layer 1: Distant Islands
      const camOffset1 = (cameraX * 0.006) % width;
      ctx.fillStyle = ColorPalette.scaleBrightness(baseColor, 0.50);
      const distantIslands = [
        { x: 20, w: 70, h: 16 }, { x: 130, w: 55, h: 12 },
        { x: 215, w: 80, h: 20 }, { x: 310, w: 60, h: 14 },
      ];
      for (const p of distantIslands) {
        const px = (p.x - camOffset1 + width * 2) % width;
        ctx.beginPath();
        ctx.moveTo(px, horizonRow);
        ctx.lineTo(px + p.w * 0.5, horizonRow - p.h);
        ctx.lineTo(px + p.w, horizonRow);
        ctx.fill();
      }

      // Layer 2: Foreground Headland
      const camOffset2 = (cameraX * 0.014) % width;
      ctx.fillStyle = baseColor;
      const nearPeaks = [
        { x: 50, w: 45, h: 12 }, { x: 170, w: 50, h: 15 }, { x: 280, w: 40, h: 10 },
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
        const h = 16 + Math.floor(Math.sin((x + 10) * 0.15) * 10);
        ctx.beginPath();
        ctx.moveTo(px, horizonRow);
        ctx.lineTo(px + 11, horizonRow - h);
        ctx.lineTo(px + 22, horizonRow);
        ctx.fill();

        // Snow Cap
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.moveTo(px + 5, horizonRow - h + 7);
        ctx.lineTo(px + 11, horizonRow - h);
        ctx.lineTo(px + 17, horizonRow - h + 7);
        ctx.fill();
        ctx.fillStyle = baseColor;
      }
    } else {
      // Rolling Forest Ridges
      const camOffset = (cameraX * 0.012) % width;
      ctx.fillStyle = baseColor;
      for (let x = 0; x < width; x += 2) {
        const wx = (x + camOffset) * 0.04;
        const h = Math.max(6, Math.floor(Math.sin(wx) * 8 + Math.sin(wx * 2.3) * 4 + 12));
        ctx.fillRect(x, horizonRow - h, 2, h);
      }
    }
  }

  /**
   * Renders 3D perspective arcade road scanlines, alternating rumble curbs, and terrain bands.
   * Dominant OutRun road geometry (wide foreground convergence to distant horizon).
   */
  private render3DRoadAndTerrain(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    horizonRow: number,
    worldEngine: WorldEngine,
    state: WorldState,
    palette: typeof state.biomeBlend.blendedPalette
  ): void {
    const road = worldEngine.getRoad();
    const camera = state.camera;
    const drawDistance = 1100;
    const stepZ = road.segmentLength;
    const startZ = Math.floor((camera.z + 10) / stepZ) * stepZ;
    const endZ = startZ + drawDistance;
    const halfRoadWidth = road.defaultRoadWidth * 0.82; // Wider OutRun road width

    const isTropical = state.biomeBlend.currentBiome.id === 'TROPICAL';

    // Projected slices buffer
    interface Slice {
      sy: number;
      sx: number;
      hw: number;
      z: number;
    }
    const slices: Slice[] = [];

    for (let z = startZ; z <= endZ; z += stepZ) {
      const curveX = road.getCurveAt(z);
      const elevY = road.getElevationAt(z);
      const proj = Perspective.projectRoadSlice(
        curveX,
        elevY,
        z,
        halfRoadWidth,
        camera,
        width,
        height,
        0.48 // Wider FOV for imposing arcade road
      );

      if (proj.visible && proj.screenY >= horizonRow - 1) {
        slices.push({
          sy: Math.max(horizonRow, proj.screenY),
          sx: proj.screenX,
          hw: proj.halfWidth,
          z,
        });
      }
    }

    if (slices.length < 2) return;

    // Fill Ground Baseline
    ctx.fillStyle = palette.ground;
    ctx.fillRect(0, horizonRow, width, height - horizonRow);

    // Rasterize consecutive trapezoids from near to far
    for (let i = 0; i < slices.length - 1; i++) {
      const near = slices[i];
      const far = slices[i + 1];

      const yBot = Math.round(near.sy);
      const yTop = Math.round(far.sy);
      if (yBot <= yTop) continue;

      const isEven = Math.floor(near.z / 25) % 2 === 0;

      // 1. Terrain Sidewalk / Grass / Ocean
      const groundColor = isEven ? palette.ground : ColorPalette.scaleBrightness(palette.ground, 1.15);
      ctx.fillStyle = groundColor;
      ctx.fillRect(0, yTop, width, yBot - yTop);

      // Tropical Right-Side Ocean with animated wave foam
      if (isTropical) {
        const rightRoadX = near.sx + near.hw;
        const oceanStart = rightRoadX + near.hw * 0.45;
        if (oceanStart < width) {
          const oceanColor = isEven ? '#0284c7' : '#0369a1';
          ctx.fillStyle = oceanColor;
          ctx.fillRect(Math.floor(oceanStart), yTop, width - Math.floor(oceanStart), yBot - yTop);

          // Shoreline white foam ripple
          ctx.fillStyle = '#f8fafc';
          ctx.fillRect(Math.floor(oceanStart) - 2, yTop, 3, yBot - yTop);
        }
      }

      // 2. OutRun Red & White Rumble Curbs (Kerbs) - Wide & Bold
      const curbWidthNear = Math.max(3, Math.round(near.hw * 0.16));
      const curbWidthFar = Math.max(2, Math.round(far.hw * 0.16));
      const curbColor = isEven ? '#dc2626' : '#f8fafc'; // Pure Red & White alternating stripes

      // Left Curb
      ctx.fillStyle = curbColor;
      ctx.beginPath();
      ctx.moveTo(near.sx - near.hw - curbWidthNear, yBot);
      ctx.lineTo(near.sx - near.hw, yBot);
      ctx.lineTo(far.sx - far.hw, yTop);
      ctx.lineTo(far.sx - far.hw - curbWidthFar, yTop);
      ctx.fill();

      // Right Curb
      ctx.beginPath();
      ctx.moveTo(near.sx + near.hw, yBot);
      ctx.lineTo(near.sx + near.hw + curbWidthNear, yBot);
      ctx.lineTo(far.sx + far.hw + curbWidthFar, yTop);
      ctx.lineTo(far.sx + far.hw, yTop);
      ctx.fill();

      // 3. Solid High-Contrast Asphalt Road
      const roadColor = isEven ? palette.road : ColorPalette.scaleBrightness(palette.road, 1.25);
      ctx.fillStyle = roadColor;
      ctx.beginPath();
      ctx.moveTo(near.sx - near.hw, yBot);
      ctx.lineTo(near.sx + near.hw, yBot);
      ctx.lineTo(far.sx + far.hw, yTop);
      ctx.lineTo(far.sx - far.hw, yTop);
      ctx.fill();

      // 4. Dashed Gold Center Lane Markers (3 Lanes)
      if (isEven) {
        const laneWNear = Math.max(1, Math.round(near.hw * 0.04));
        const laneWFar = Math.max(1, Math.round(far.hw * 0.04));
        ctx.fillStyle = '#fde047'; // Bright Gold

        // 3-Lane dividers (left divider, right divider)
        const leftLaneNear = near.sx - near.hw * 0.33;
        const leftLaneFar = far.sx - far.hw * 0.33;
        const rightLaneNear = near.sx + near.hw * 0.33;
        const rightLaneFar = far.sx + far.hw * 0.33;

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
  }

  /**
   * Renders 3D perspective-scaled solid pixel sprites for scenery props and traffic vehicles.
   */
  private renderWorldEntities(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    horizonRow: number,
    worldEngine: WorldEngine,
    state: WorldState
  ): void {
    const camera = state.camera;
    const biomeId = state.biomeBlend.currentBiome.id;

    // Collect all renderable entities with depth Z
    interface EntityToRender {
      z: number;
      screenX: number;
      screenY: number;
      scale: number;
      sprite: PixelSprite;
    }
    const entities: EntityToRender[] = [];

    // 1. Scenery Props from WorldDirector
    const visibleScenery = worldEngine.getDirector().getScenery();
    for (const item of visibleScenery) {
      const relZ = item.z - camera.z;
      if (relZ > 20 && relZ < 1050) {
        const roadElevation = worldEngine.getRoad().getElevationAt(item.z);
        const proj = Perspective.project(
          item.x,
          roadElevation,
          item.z,
          camera,
          width,
          height,
          0.48
        );

        if (proj.visible && proj.screenY >= horizonRow) {
          const sprite = PixelSpriteCatalog.getScenerySprite(item.sprite.id, biomeId);
          // Proportional scaling clamped to prevent screen-covering oversized sprites
          const clampedScale = Math.min(2.4, Math.max(0.25, proj.scale * 2.4));
          entities.push({
            z: proj.depth,
            screenX: proj.screenX,
            screenY: proj.screenY,
            scale: clampedScale,
            sprite,
          });
        }
      }
    }

    // 2. Traffic Vehicles
    const traffic = worldEngine.getTraffic().getVehicles();
    for (const veh of traffic) {
      const roadX = worldEngine.getRoad().getCurveAt(veh.z);
      const elevY = worldEngine.getRoad().getElevationAt(veh.z);
      const proj = Perspective.project(
        roadX + veh.x,
        elevY,
        veh.z,
        camera,
        width,
        height,
        0.48
      );

      if (proj.visible && proj.screenY >= horizonRow && proj.depth > 15) {
        const sprite = veh.vehicleType === 'coupe' ? PixelSpriteCatalog.TRAFFIC_CABRIO : PixelSpriteCatalog.TRAFFIC_SEDAN;
        const clampedScale = Math.min(2.2, Math.max(0.3, proj.scale * 2.2));
        entities.push({
          z: proj.depth,
          screenX: proj.screenX,
          screenY: proj.screenY,
          scale: clampedScale,
          sprite,
        });
      }
    }

    // Sort entities Far to Near (Painter's Algorithm)
    entities.sort((a, b) => b.z - a.z);

    // Draw Entities
    for (const e of entities) {
      this.drawPixelSprite(ctx, e.sprite, e.screenX, e.screenY, e.scale);
    }
  }

  /**
   * Renders the Player's OutRun Retro Red Roadster with Turn Banking & Brake Glow.
   */
  private renderPlayerVehicle(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    state: WorldState
  ): void {
    const playerX = Math.round(width * 0.5 + state.player.x * 0.12);
    const playerY = height - 12;
    const sprite = PixelSpriteCatalog.PLAYER_CAR_STRAIGHT;

    // Road contact shadow under tires
    ctx.fillStyle = '#020617';
    ctx.globalAlpha = 0.65;
    ctx.beginPath();
    ctx.ellipse(playerX, playerY - 1, 24, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;

    // Draw player roadster
    this.drawPixelSprite(ctx, sprite, playerX, playerY, 1.45);
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
      ctx.globalAlpha = 0.55;
      const count = weather.type === 'LIGHT_RAIN' ? 45 : 110;
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
      const count = weather.type === 'BLIZZARD' ? 130 : 65;
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
}
