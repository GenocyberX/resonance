import { UiTelemetryData } from './types';

export class DebugPanel {
  private element: HTMLElement;
  private contentElement: HTMLElement;
  private isVisible: boolean = false;

  constructor() {
    this.element = document.getElementById('debug-panel') || this.createFallbackElement();
    this.contentElement = this.element.querySelector('.debug-content') || this.element;

    window.addEventListener('keydown', (e) => {
      if (e.key === '`' || e.key === '~' || e.key === 'F3') {
        this.toggle();
      }
    });
  }

  private createFallbackElement(): HTMLElement {
    const el = document.createElement('div');
    el.id = 'debug-panel';
    el.className = 'debug-panel';
    el.style.display = 'none';
    document.body.appendChild(el);
    return el;
  }

  public toggle(): void {
    this.isVisible = !this.isVisible;
    this.element.style.display = this.isVisible ? 'block' : 'none';
    this.element.classList.toggle('visible', this.isVisible);
  }

  public show(): void {
    this.isVisible = true;
    this.element.style.display = 'block';
    this.element.classList.add('visible');
  }

  public hide(): void {
    this.isVisible = false;
    this.element.style.display = 'none';
    this.element.classList.remove('visible');
  }

  public update(telemetry: UiTelemetryData): void {
    if (!this.isVisible) return;

    const { fps, worldState, musicState, totalCollisions, activeTrafficCount, seed, visualTestMode, containment, renderStats } = telemetry;
    const player = worldState.player;
    const biomeBlend = worldState.biomeBlend;
    const dayNight = worldState.dayNight;

    const transitionPct = Math.round(biomeBlend.transitionProgress * 100);
    const biomeLabel = biomeBlend.transitionProgress > 0.05
      ? `${biomeBlend.currentBiome.id} → ${biomeBlend.nextBiome.id} (${transitionPct}%)`
      : biomeBlend.currentBiome.id;

    const stabilityMode = visualTestMode?.stability && visualTestMode.stability !== 'none'
      ? `<span style="color:#34d399">${visualTestMode.stability.toUpperCase()}</span>`
      : 'OFF';

    const testLabel = visualTestMode?.isVisualTest
      ? `<span style="color:#fbbf24">${visualTestMode.scenario} (${visualTestMode.time || 'day'})</span>`
      : 'OFF';

    const maxDriveable = containment ? `±${containment.maxDriveableOffset.toFixed(1)}` : '±270.0';
    const camTargetX = containment ? containment.cameraTargetX.toFixed(1) : worldState.camera.x.toFixed(1);
    const screenX = containment ? containment.playerScreenX.toFixed(1) : '-';
    const roadCenter = containment ? containment.roadCenterAtPlayerY.toFixed(1) : '-';
    const roadHalfW = containment ? containment.roadHalfWidthAtPlayerY.toFixed(1) : '-';
    const roadLeft = containment ? containment.roadLeftAtPlayerY.toFixed(1) : '-';
    const roadRight = containment ? containment.roadRightAtPlayerY.toFixed(1) : '-';
    const visualClamped = containment?.isVisualClamped ? '<span style="color:#f43f5e">YES</span>' : '<span style="color:#34d399">NO</span>';
    const worldClamped = containment?.isWorldClamped ? '<span style="color:#f43f5e">YES</span>' : '<span style="color:#34d399">NO</span>';

    const simFps = renderStats ? Math.round(renderStats.simFps) : Math.round(fps);
    const visualFps = renderStats ? Math.round(renderStats.visualFps) : Math.round(fps);
    const domRenderMs = renderStats ? renderStats.domRenderMs.toFixed(2) : '-';
    const rowsUpdated = renderStats ? `${renderStats.rowsUpdated} / ${renderStats.rowsTotal}` : '-';
    const spanCount = renderStats ? renderStats.spanCount : '-';
    const resizeCount = renderStats ? renderStats.resizeCount : 0;
    const frameHash = renderStats ? renderStats.frameHash : '-';

    this.contentElement.innerHTML = `
      <div class="debug-row">
        <span class="debug-label">SIM / VISUAL FPS</span>
        <span class="debug-val" style="color: #38bdf8">${simFps} / ${visualFps}</span>
      </div>
      <div class="debug-row">
        <span class="debug-label">DOM RENDER MS</span>
        <span class="debug-val" style="color: #34d399">${domRenderMs} ms</span>
      </div>
      <div class="debug-row">
        <span class="debug-label">ROWS UPDATED</span>
        <span class="debug-val">${rowsUpdated}</span>
      </div>
      <div class="debug-row">
        <span class="debug-label">SPAN COUNT</span>
        <span class="debug-val">${spanCount}</span>
      </div>
      <div class="debug-row">
        <span class="debug-label">FRAME HASH</span>
        <span class="debug-val" style="color: #fde047; font-family: monospace;">${frameHash}</span>
      </div>
      <div class="debug-row">
        <span class="debug-label">STABILITY MODE</span>
        <span class="debug-val">${stabilityMode}</span>
      </div>
      <div class="debug-row">
        <span class="debug-label">RESIZE COUNT</span>
        <span class="debug-val">${resizeCount}</span>
      </div>

      <div style="margin-top: 6px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 4px;">
        <div class="debug-row">
          <span class="debug-label">TEST MODE</span>
          <span class="debug-val">${testLabel}</span>
        </div>
        <div class="debug-row">
          <span class="debug-label">SEED</span>
          <span class="debug-val">${seed}</span>
        </div>
        <div class="debug-row">
          <span class="debug-label">DAY PHASE</span>
          <span class="debug-val" style="color: #fbbf24">${dayNight.phase} (${Math.round(dayNight.normalizedCycle * 100)}%)</span>
        </div>
        <div class="debug-row">
          <span class="debug-label">SPEED</span>
          <span class="debug-val">${Math.round(player.speed)} km/h</span>
        </div>
        <div class="debug-row">
          <span class="debug-label">DRIVER STATE</span>
          <span class="debug-val" style="color: #38bdf8">${player.driverState}</span>
        </div>
      </div>

      <div style="margin-top: 6px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 4px;">
        <div class="debug-row">
          <span class="debug-label">PLAYER LANE</span>
          <span class="debug-val">${player.lane}</span>
        </div>
        <div class="debug-row">
          <span class="debug-label">LATERAL OFFSET</span>
          <span class="debug-val">${player.lateralOffset.toFixed(1)}</span>
        </div>
        <div class="debug-row">
          <span class="debug-label">TARGET OFFSET</span>
          <span class="debug-val">${player.targetLateralOffset.toFixed(1)}</span>
        </div>
        <div class="debug-row">
          <span class="debug-label">MAX DRIVEABLE</span>
          <span class="debug-val">${maxDriveable}</span>
        </div>
        <div class="debug-row">
          <span class="debug-label">WORLD CLAMPED?</span>
          <span class="debug-val">${worldClamped}</span>
        </div>
      </div>

      <div style="margin-top: 6px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 4px;">
        <div class="debug-row">
          <span class="debug-label">CAMERA X</span>
          <span class="debug-val">${worldState.camera.x.toFixed(1)}</span>
        </div>
        <div class="debug-row">
          <span class="debug-label">CAMERA TARGET X</span>
          <span class="debug-val">${camTargetX}</span>
        </div>
        <div class="debug-row">
          <span class="debug-label">PLAYER SCREEN X</span>
          <span class="debug-val">${screenX}</span>
        </div>
        <div class="debug-row">
          <span class="debug-label">ROAD CENTER @ Y</span>
          <span class="debug-val">${roadCenter} (±${roadHalfW})</span>
        </div>
        <div class="debug-row">
          <span class="debug-label">ROAD BOUNDS @ Y</span>
          <span class="debug-val">[${roadLeft}, ${roadRight}]</span>
        </div>
        <div class="debug-row">
          <span class="debug-label">VISUAL CLAMPED?</span>
          <span class="debug-val">${visualClamped}</span>
        </div>
      </div>

      <div style="margin-top: 6px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 4px;">
        <div class="debug-row">
          <span class="debug-label">BIOME</span>
          <span class="debug-val" style="color: #34d399">${biomeLabel}</span>
        </div>
        <div class="debug-row">
          <span class="debug-label">TRAFFIC COUNT</span>
          <span class="debug-val">${activeTrafficCount}</span>
        </div>
        <div class="debug-row">
          <span class="debug-label">COLLISIONS</span>
          <span class="debug-val" style="color: ${totalCollisions > 0 ? '#f43f5e' : '#8b949e'}">${totalCollisions}</span>
        </div>
        <div class="debug-row">
          <span class="debug-label">MUSIC STATE</span>
          <span class="debug-val" style="color: #e879f9">${musicState.state.toUpperCase()}</span>
        </div>
      </div>
    `;
  }
}
