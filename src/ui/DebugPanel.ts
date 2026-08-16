import { UiTelemetryData } from './types';

export class DebugPanel {
  private panelElement: HTMLElement;
  private toggleBtn: HTMLElement;
  private closeBtn: HTMLElement;
  private contentElement: HTMLElement;
  private isVisible: boolean = false;

  constructor() {
    this.panelElement = document.getElementById('debug-panel') as HTMLElement;
    this.toggleBtn = document.getElementById('btn-toggle-debug') as HTMLElement;
    this.closeBtn = document.getElementById('btn-close-debug') as HTMLElement;
    this.contentElement = document.getElementById('debug-content') as HTMLElement;

    this.setupListeners();
  }

  private setupListeners(): void {
    this.toggleBtn.addEventListener('click', () => this.toggle());
    this.closeBtn.addEventListener('click', () => this.hide());

    window.addEventListener('keydown', (e) => {
      if (e.key === 'd' || e.key === 'D') {
        if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
        this.toggle();
      }
    });
  }

  public toggle(): void {
    this.isVisible = !this.isVisible;
    if (this.isVisible) {
      this.panelElement.classList.remove('hidden');
    } else {
      this.panelElement.classList.add('hidden');
    }
  }

  public hide(): void {
    this.isVisible = false;
    this.panelElement.classList.add('hidden');
  }

  public update(telemetry: UiTelemetryData): void {
    if (!this.isVisible) return;

    const { fps, worldState, musicState, totalCollisions, activeTrafficCount, seed, visualTestMode, containment } = telemetry;
    const player = worldState.player;
    const biomeBlend = worldState.biomeBlend;
    const dayNight = worldState.dayNight;

    const transitionPct = Math.round(biomeBlend.transitionProgress * 100);
    const biomeLabel = biomeBlend.transitionProgress > 0.05
      ? `${biomeBlend.currentBiome.id} → ${biomeBlend.nextBiome.id} (${transitionPct}%)`
      : biomeBlend.currentBiome.id;

    const testLabel = visualTestMode?.isVisualTest ? `<span style="color:#fbbf24">${visualTestMode.scenario}</span>` : 'OFF';

    const maxDriveable = containment ? `±${containment.maxDriveableOffset.toFixed(1)}` : '±270.0';
    const camTargetX = containment ? containment.cameraTargetX.toFixed(1) : worldState.camera.x.toFixed(1);
    const screenX = containment ? containment.playerScreenX.toFixed(1) : '-';
    const roadCenter = containment ? containment.roadCenterAtPlayerY.toFixed(1) : '-';
    const roadHalfW = containment ? containment.roadHalfWidthAtPlayerY.toFixed(1) : '-';
    const roadLeft = containment ? containment.roadLeftAtPlayerY.toFixed(1) : '-';
    const roadRight = containment ? containment.roadRightAtPlayerY.toFixed(1) : '-';
    const visualClamped = containment?.isVisualClamped ? '<span style="color:#f43f5e">YES</span>' : '<span style="color:#34d399">NO</span>';
    const worldClamped = containment?.isWorldClamped ? '<span style="color:#f43f5e">YES</span>' : '<span style="color:#34d399">NO</span>';

    this.contentElement.innerHTML = `
      <div class="debug-row">
        <span class="debug-label">FPS</span>
        <span class="debug-val">${Math.round(fps)}</span>
      </div>
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
