import { UiTelemetryData } from './types';

export class Hud {
  private badgeBiome: HTMLElement;
  private badgeTime: HTMLElement;
  private hudSpeed: HTMLElement;
  private hudDriverState: HTMLElement;
  private hudMusicState: HTMLElement;
  private vizBass: HTMLElement;
  private vizMids: HTMLElement;
  private vizTreble: HTMLElement;

  constructor() {
    this.badgeBiome = document.getElementById('badge-biome') as HTMLElement;
    this.badgeTime = document.getElementById('badge-time') as HTMLElement;
    this.hudSpeed = document.getElementById('hud-speed') as HTMLElement;
    this.hudDriverState = document.getElementById('hud-driver-state') as HTMLElement;
    this.hudMusicState = document.getElementById('hud-music-state') as HTMLElement;
    this.vizBass = document.getElementById('viz-bass') as HTMLElement;
    this.vizMids = document.getElementById('viz-mids') as HTMLElement;
    this.vizTreble = document.getElementById('viz-treble') as HTMLElement;
  }

  public update(telemetry: UiTelemetryData): void {
    const { worldState, musicState, visualTestMode } = telemetry;
    const player = worldState.player;
    const biome = worldState.biomeBlend.currentBiome;
    const dayNight = worldState.dayNight;

    // 1. Biome & Test Mode Badge
    if (visualTestMode && visualTestMode.isVisualTest) {
      this.badgeBiome.textContent = `TEST: ${visualTestMode.scenario} [1-5]`;
      this.badgeBiome.style.color = '#fbbf24';
      this.badgeBiome.style.borderColor = 'rgba(251, 191, 36, 0.4)';
    } else {
      this.badgeBiome.textContent = biome.name.toUpperCase();
      this.badgeBiome.style.color = 'var(--accent-emerald)';
      this.badgeBiome.style.borderColor = 'rgba(52, 211, 153, 0.35)';
    }

    // 2. Time Badge
    const totalMinutes = Math.floor(dayNight.normalizedCycle * 24 * 60);
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHour = hours % 12 === 0 ? 12 : hours % 12;
    this.badgeTime.textContent = `${displayHour}:${mins.toString().padStart(2, '0')} ${ampm} (${dayNight.phase})`;

    // 3. Speed & Telemetry
    this.hudSpeed.innerHTML = `${Math.round(player.speed)} <small>KM/H</small>`;
    this.hudDriverState.textContent = player.driverState;

    // Style driver state badge
    if (player.driverState === 'RECOVER') {
      this.hudDriverState.style.color = '#f43f5e';
    } else if (player.driverState === 'OVERTAKE') {
      this.hudDriverState.style.color = '#fbbf24';
    } else if (player.driverState === 'BRAKING') {
      this.hudDriverState.style.color = '#f97316';
    } else if (player.driverState === 'CORNERING') {
      this.hudDriverState.style.color = '#a855f7';
    } else {
      this.hudDriverState.style.color = '#38bdf8';
    }

    // 4. Music State
    this.hudMusicState.textContent = musicState.state.toUpperCase();

    // 5. Mini Spectrum Visualizer Bars
    const bassH = Math.max(3, Math.min(18, Math.round(musicState.bassIntensity * 18)));
    const midsH = Math.max(3, Math.min(18, Math.round(musicState.midIntensity * 18)));
    const trebH = Math.max(3, Math.min(18, Math.round(musicState.trebleIntensity * 18)));

    this.vizBass.style.height = `${bassH}px`;
    this.vizMids.style.height = `${midsH}px`;
    this.vizTreble.style.height = `${trebH}px`;
  }
}
