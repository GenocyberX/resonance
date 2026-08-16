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
        // Prevent toggle if user is typing in an input
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

    const { fps, worldState, musicState, totalCollisions, activeTrafficCount, seed } = telemetry;
    const player = worldState.player;
    const biomeBlend = worldState.biomeBlend;
    const dayNight = worldState.dayNight;

    const transitionPct = Math.round(biomeBlend.transitionProgress * 100);
    const biomeLabel = biomeBlend.transitionProgress > 0.05
      ? `${biomeBlend.currentBiome.id} → ${biomeBlend.nextBiome.id} (${transitionPct}%)`
      : biomeBlend.currentBiome.id;

    this.contentElement.innerHTML = `
      <div class="debug-row">
        <span class="debug-label">FPS</span>
        <span class="debug-val">${Math.round(fps)}</span>
      </div>
      <div class="debug-row">
        <span class="debug-label">SEED</span>
        <span class="debug-val">${seed}</span>
      </div>
      <div class="debug-row">
        <span class="debug-label">DISTANCE</span>
        <span class="debug-val">${Math.round(worldState.distance)} m</span>
      </div>
      <div class="debug-row">
        <span class="debug-label">SPEED</span>
        <span class="debug-val">${Math.round(player.speed)} km/h</span>
      </div>
      <div class="debug-row">
        <span class="debug-label">LANE / OFFSET</span>
        <span class="debug-val">${player.lane} (${Math.round(player.lateralOffset)})</span>
      </div>
      <div class="debug-row">
        <span class="debug-label">DRIVER STATE</span>
        <span class="debug-val" style="color: #38bdf8">${player.driverState}</span>
      </div>
      <div class="debug-row">
        <span class="debug-label">BIOME</span>
        <span class="debug-val" style="color: #34d399">${biomeLabel}</span>
      </div>
      <div class="debug-row">
        <span class="debug-label">DAY PHASE</span>
        <span class="debug-val" style="color: #fbbf24">${dayNight.phase} (${Math.round(dayNight.normalizedCycle * 100)}%)</span>
      </div>
      <div class="debug-row">
        <span class="debug-label">TRAFFIC COUNT</span>
        <span class="debug-val">${activeTrafficCount}</span>
      </div>
      <div class="debug-row">
        <span class="debug-label">COLLISIONS</span>
        <span class="debug-val" style="color: ${totalCollisions > 0 ? '#f43f5e' : '#8b949e'}">${totalCollisions}</span>
      </div>

      <div style="margin-top: 8px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 6px;">
        <div class="debug-row">
          <span class="debug-label">MUSIC STATE</span>
          <span class="debug-val" style="color: #e879f9">${musicState.state.toUpperCase()}</span>
        </div>
        <div class="debug-row">
          <span class="debug-label">BEAT PULSE</span>
          <div class="debug-bar-wrap">
            <div class="debug-bar-fill" style="width: ${Math.round(musicState.beatPulse * 100)}%; background: #f43f5e;"></div>
          </div>
        </div>
        <div class="debug-row">
          <span class="debug-label">BASS</span>
          <div class="debug-bar-wrap">
            <div class="debug-bar-fill" style="width: ${Math.round(musicState.bassIntensity * 100)}%; background: #f43f5e;"></div>
          </div>
        </div>
        <div class="debug-row">
          <span class="debug-label">MIDS</span>
          <div class="debug-bar-wrap">
            <div class="debug-bar-fill" style="width: ${Math.round(musicState.midIntensity * 100)}%; background: #fbbf24;"></div>
          </div>
        </div>
        <div class="debug-row">
          <span class="debug-label">TREBLE</span>
          <div class="debug-bar-wrap">
            <div class="debug-bar-fill" style="width: ${Math.round(musicState.trebleIntensity * 100)}%; background: #38bdf8;"></div>
          </div>
        </div>
        <div class="debug-row">
          <span class="debug-label">ENERGY</span>
          <div class="debug-bar-wrap">
            <div class="debug-bar-fill" style="width: ${Math.round(musicState.energy * 100)}%; background: #34d399;"></div>
          </div>
        </div>
        <div class="debug-row">
          <span class="debug-label">TENSION</span>
          <div class="debug-bar-wrap">
            <div class="debug-bar-fill" style="width: ${Math.round(musicState.tension * 100)}%; background: #a855f7;"></div>
          </div>
        </div>
      </div>
    `;
  }
}
